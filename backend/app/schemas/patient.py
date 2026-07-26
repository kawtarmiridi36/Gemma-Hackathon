from datetime import datetime
from pydantic import BaseModel, Field


class PatientCreate(BaseModel):
    nom: str = Field(..., min_length=1, max_length=255)
    age: int = Field(..., ge=0, le=120)
    sexe: str = Field("F", pattern=r"^[FM]$")
    zone: str | None = Field(None, max_length=255)
    village: str | None = Field(None, max_length=255)
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
