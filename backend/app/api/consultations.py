import json
import tempfile
import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Consultation, DossierMedical, Patient, User
from app.schemas.consultation import (
    ConsultationCreate, ConsultationOut, VoiceMessageResponse,
    TextMessageResponse, FinalizeResponse, CTGInput, CTGPrediction,
)
from app.services.gemma_service import ask_gemma, finalize_consultation, build_follow_up_program
from app.services.stt_service import transcribe_darija
from app.services.triage_service import detect_red_flags, classify_urgency, predict_ctg, is_ml_available
from app.services.storage_service import save_file
from app.services.imaging_service import analyze_ultrasound
from app.services.tts_service import generate_darija_audio

router = APIRouter(prefix="/consultations", tags=["consultations"])


def _build_ai_content(ai_result: dict) -> str:
    if ai_result.get("voice_response"):
        return ai_result["voice_response"]
        
    parts = []
    if ai_result.get("summary"):
        parts.append(f"📝 **Résumé** : {ai_result['summary']}")
        
    questions = ai_result.get("clarifying_questions", [])
    if questions:
        parts.append("")
        parts.append("❓ **Question :**")
        for q in questions[:1]:
            parts.append(f"  • {q}")
            
    hypotheses = ai_result.get("possible_causes") or ai_result.get("differential_hypotheses", [])
    if hypotheses:
        parts.append("")
        parts.append("🩺 **Pistes médicales :** " + ", ".join(hypotheses))
        
    recommendation = ai_result.get("recommendation")
    if recommendation:
        parts.append("")
        parts.append(f"💡 **Recommandation :** {recommendation}")

    return "\n".join(parts) if parts else "Je suis à votre écoute. Que ressentez-vous ?"


def _build_patient_context(consultation: Consultation, db: Session) -> dict:
    dossier = db.query(DossierMedical).filter(DossierMedical.id == consultation.dossier_id).first()
    if not dossier:
        return {}
    patient = db.query(Patient).filter(Patient.id == dossier.patient_id).first()
    if not patient:
        return {}
    return {
        "nom": patient.nom,
        "age": patient.age,
        "sexe": patient.sexe,
        "zone": patient.zone,
        "antecedents": patient.antecedents,
        "grossesses_precedentes": dossier.grossesses_precedentes,
    }


@router.post("", response_model=ConsultationOut)
def create_consultation(data: ConsultationCreate, db: Session = Depends(get_db)):
    dossier = db.query(DossierMedical).filter(DossierMedical.id == data.dossier_id).first()
    if not dossier:
        raise HTTPException(404, "Dossier non trouvé")
    consultation = Consultation(
        dossier_id=data.dossier_id,
        infirmier_id=1,
        transcript=[],
        urgency_level="green",
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)
    return ConsultationOut.model_validate(consultation)


@router.get("", response_model=list[ConsultationOut])
def list_consultations(db: Session = Depends(get_db)):
    consultations = db.query(Consultation).order_by(Consultation.date.desc()).all()
    return [ConsultationOut.model_validate(c) for c in consultations]


@router.get("/{consultation_id}", response_model=ConsultationOut)
def get_consultation(consultation_id: int, db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(404, "Consultation non trouvée")
    return ConsultationOut.model_validate(consultation)


@router.post("/{consultation_id}/voice", response_model=VoiceMessageResponse)
async def voice_message(consultation_id: int, audio: UploadFile = File(...), db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(404, "Consultation non trouvée")

    suffix = os.path.splitext(audio.filename or "audio.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await audio.read()
        tmp.write(content)
        tmp_path = tmp.name

    transcript_text = transcribe_darija(tmp_path)

    import os
    os.unlink(tmp_path)

    await audio.seek(0)
    audio_path = save_file(audio, "audio", consultation_id)

    nurse_msg = {
        "role": "infirmier",
        "content": transcript_text,
        "type": "voice",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "audio_path": audio_path,
    }
    consultation.transcript = consultation.transcript + [nurse_msg]

    patient_ctx = _build_patient_context(consultation, db)
    ai_result = await ask_gemma(consultation.transcript, patient_ctx)

    ai_text = _build_ai_content(ai_result)
    ai_msg = {
        "role": "assistant",
        "content": ai_text,
        "type": "voice",
        "speechContent": ai_text,
        "ai_response": ai_result,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    consultation.transcript = consultation.transcript + [ai_msg]

    detected = detect_red_flags(transcript_text)
    all_flags = list(set(consultation.red_flags or []) | set(detected))
    consultation.red_flags = all_flags

    ai_urgency = ai_result.get("urgency_level", "green")
    consultation.urgency_level = classify_urgency(all_flags, ai_urgency)

    db.commit()

    return VoiceMessageResponse(
        transcript=transcript_text,
        ai_response=ai_result,
        new_messages=[nurse_msg, ai_msg],
        urgency_level=consultation.urgency_level,
    )


@router.post("/{consultation_id}/message", response_model=TextMessageResponse)
async def text_message(consultation_id: int, body: dict, db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(404, "Consultation non trouvée")

    content = body.get("content", "")
    nurse_msg = {
        "role": "infirmier",
        "content": content,
        "type": "text",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    consultation.transcript = consultation.transcript + [nurse_msg]

    patient_ctx = _build_patient_context(consultation, db)
    ai_result = await ask_gemma(consultation.transcript, patient_ctx)

    ai_text = _build_ai_content(ai_result)
    ai_msg = {
        "role": "assistant",
        "content": ai_text,
        "type": "voice",
        "speechContent": ai_text,
        "ai_response": ai_result,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    consultation.transcript = consultation.transcript + [ai_msg]

    detected = detect_red_flags(content)
    all_flags = list(set(consultation.red_flags or []) | set(detected))
    consultation.red_flags = all_flags

    ai_urgency = ai_result.get("urgency_level", "green")
    consultation.urgency_level = classify_urgency(all_flags, ai_urgency)

    db.commit()

    return TextMessageResponse(
        ai_response=ai_result,
        new_messages=[nurse_msg, ai_msg],
        urgency_level=consultation.urgency_level,
    )


@router.post("/{consultation_id}/imaging")
async def upload_imaging(consultation_id: int, image: UploadFile = File(...), db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(404, "Consultation non trouvée")

    image_path = save_file(image, "imaging", consultation_id)
    consultation.imaging_files = (consultation.imaging_files or []) + [image_path]

    analysis = await analyze_ultrasound(image_path)
    consultation.imaging_analysis = json.dumps(analysis, ensure_ascii=False)

    db.commit()

    return {"image_path": image_path, "analysis": analysis}


@router.post("/{consultation_id}/finalize", response_model=FinalizeResponse)
async def finalize(consultation_id: int, db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(404, "Consultation non trouvée")

    patient_ctx = _build_patient_context(consultation, db)
    result = await finalize_consultation(consultation.transcript, patient_ctx)
    follow_up_program = build_follow_up_program(
        consultation.transcript,
        result.get("urgency_level", consultation.urgency_level),
        result.get("red_flags_detected", consultation.red_flags or []),
        patient_ctx,
    )

    consultation.compte_rendu = result.get("summary", "")
    consultation.ordonnance = result.get("draft_prescription", [])
    consultation.red_flags = result.get("red_flags_detected", consultation.red_flags or [])
    consultation.urgency_level = classify_urgency(
        consultation.red_flags, result.get("urgency_level", consultation.urgency_level)
    )
    consultation.follow_up_program = follow_up_program

    db.commit()

    return FinalizeResponse(
        compte_rendu=consultation.compte_rendu,
        ordonnance=consultation.ordonnance,
        urgency_level=consultation.urgency_level,
        red_flags=consultation.red_flags,
        follow_up_program=follow_up_program,
    )


@router.get("/ctg/status")
async def ctg_status():
    return {"ml_available": is_ml_available()}


@router.post("/ctg/predict", response_model=CTGPrediction)
async def ctg_predict(ctg: CTGInput):
    result = predict_ctg(ctg.model_dump())
    if result is None:
        raise HTTPException(503, "Modele ML non disponible")
    return result


@router.post("/voice/transcribe")
async def transcribe_voice(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename or "audio.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    try:
        text = transcribe_darija(tmp_path)
        return {"text": text}
    finally:
        os.unlink(tmp_path)


@router.get("/voice/synthesize")
@router.post("/voice/synthesize")
async def synthesize_darija_voice(text: str = "", voice: str = "ar-MA-MounaNeural"):
    if not text:
        text = "صباح الخير، السلام عليكم. أنا المساعد الطبي ديال دار الأمومة. كيف عاملة اليوم؟"
    audio_path = await generate_darija_audio(text, voice=voice)
    return FileResponse(audio_path, media_type="audio/mpeg", filename="darija_voice.mp3")

