from datetime import datetime
from pydantic import BaseModel


class PatientCreate(BaseModel):
    nom: str
    age: int
    sexe: str = "F"
    zone: str | None = None
    village: str | None = None
    antecedents: str | None = None


class PatientOut(BaseModel):
    id: int
    nom: str
    age: int
    sexe: str
    zone: str | None
    village: str | None
    antecedents: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class DossierOut(BaseModel):
    id: int
    patient_id: int
    grossesses_precedentes: list

    model_config = {"from_attributes": True}


class PatientFullOut(BaseModel):
    patient: PatientOut
    dossier: DossierOut | None

    model_config = {"from_attributes": True}
