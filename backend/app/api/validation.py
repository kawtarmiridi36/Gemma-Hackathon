from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Consultation
from app.schemas.consultation import ValidationAction

router = APIRouter(prefix="/validation", tags=["validation"])


@router.get("/queue")
def get_validation_queue(db: Session = Depends(get_db)):
    consultations = (
        db.query(Consultation)
        .filter(Consultation.status == "pending")
        .order_by(
            Consultation.urgency_level.desc(),
            Consultation.date.desc(),
        )
        .all()
    )
    return [
        {
            "id": c.id,
            "dossier_id": c.dossier_id,
            "infirmier_id": c.infirmier_id,
            "date": c.date.isoformat(),
            "urgency_level": c.urgency_level,
            "red_flags": c.red_flags,
            "compte_rendu": c.compte_rendu,
            "ordonnance": c.ordonnance,
            "status": c.status,
            "transcript_length": len(c.transcript or []),
        }
        for c in consultations
    ]


@router.get("/{consultation_id}")
def get_validation_detail(consultation_id: int, db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(404, "Consultation non trouvée")
    return {
        "id": consultation.id,
        "dossier_id": consultation.dossier_id,
        "transcript": consultation.transcript,
        "compte_rendu": consultation.compte_rendu,
        "ordonnance": consultation.ordonnance,
        "urgency_level": consultation.urgency_level,
        "red_flags": consultation.red_flags,
        "imaging_files": consultation.imaging_files,
        "imaging_analysis": consultation.imaging_analysis,
        "status": consultation.status,
    }


@router.post("/{consultation_id}")
def validate_consultation(
    consultation_id: int,
    action: ValidationAction,
    db: Session = Depends(get_db),
):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(404, "Consultation non trouvée")
    if consultation.status != "pending":
        raise HTTPException(400, "Consultation déjà traitée")

    consultation.status = action.action
    consultation.validated_at = datetime.now(timezone.utc)
    consultation.validation_notes = action.notes
    consultation.validated_by = 1

    if action.action == "modified":
        if action.modified_compte_rendu:
            consultation.compte_rendu = action.modified_compte_rendu
        if action.modified_ordonnance:
            consultation.ordonnance = action.modified_ordonnance

    db.commit()
    db.refresh(consultation)

    return {
        "id": consultation.id,
        "status": consultation.status,
        "message": f"Consultation {action.action}",
    }
