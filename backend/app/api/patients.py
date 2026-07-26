import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Patient, DossierMedical, Consultation, User
from app.schemas.patient import PatientCreate, PatientOut, PatientFullOut, DossierOut
from app.core.deps import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/patients", tags=["patients"])


@router.post("", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
def create_patient(
    data: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = Patient(
        nom=data.nom,
        age=data.age,
        sexe=data.sexe,
        zone=data.zone,
        village=data.village,
        antecedents=data.antecedents,
    )
    db.add(patient)
    db.flush()
    dossier = DossierMedical(patient_id=patient.id, grossesses_precedentes=[])
    db.add(dossier)
    db.commit()
    db.refresh(patient)
    logger.info(f"Patient created: {patient.nom} (id={patient.id}) by user {current_user.id}")
    return PatientOut.model_validate(patient)


@router.get("", response_model=list[PatientOut])
def list_patients(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patients = db.query(Patient).offset(skip).limit(limit).all()
    return [PatientOut.model_validate(p) for p in patients]


@router.get("/{patient_id}", response_model=PatientFullOut)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Patient non trouvé")
    return PatientFullOut(
        patient=PatientOut.model_validate(patient),
        dossier=DossierOut.model_validate(patient.dossier) if patient.dossier else None,
    )


@router.get("/{patient_id}/suivi")
def get_patient_suivi(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Patient non trouvé")

    dossier = patient.dossier
    if not dossier:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Dossier non trouvé")

    consultations = (
        db.query(Consultation)
        .filter(Consultation.dossier_id == dossier.id)
        .order_by(Consultation.date.desc())
        .all()
    )

    latest_finalized = None
    for c in consultations:
        if c.follow_up_program:
            latest_finalized = c
            break

    return {
        "patient": PatientOut.model_validate(patient).model_dump(),
        "consultations": [
            {
                "id": c.id,
                "date": c.date.isoformat(),
                "urgency_level": c.urgency_level,
                "red_flags": c.red_flags or [],
                "compte_rendu": c.compte_rendu,
                "ordonnance": c.ordonnance or [],
                "follow_up_program": c.follow_up_program,
                "status": c.status,
            }
            for c in consultations
        ],
        "follow_up_program": latest_finalized.follow_up_program if latest_finalized else None,
    }
