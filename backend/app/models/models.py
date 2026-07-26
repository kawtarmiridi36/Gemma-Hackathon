from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # "infirmier" | "medecin"
    centre = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    consultations = relationship("Consultation", foreign_keys="[Consultation.infirmier_id]", back_populates="infirmier")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(255), nullable=False)
    age = Column(Integer, nullable=False)
    sexe = Column(String(1), nullable=False, default="F")  # "F" | "M"
    zone = Column(String(255), nullable=True)
    village = Column(String(255), nullable=True)
    antecedents = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    dossier = relationship("DossierMedical", back_populates="patient", uselist=False)


class DossierMedical(Base):
    __tablename__ = "dossiers_medicaux"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), unique=True, nullable=False)
    grossesses_precedentes = Column(JSON, default=list)

    patient = relationship("Patient", back_populates="dossier")
    consultations = relationship("Consultation", back_populates="dossier")


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    dossier_id = Column(Integer, ForeignKey("dossiers_medicaux.id"), nullable=False)
    infirmier_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    transcript = Column(JSON, default=list)
    compte_rendu = Column(Text, nullable=True)
    ordonnance = Column(JSON, default=list)
    urgency_level = Column(String(10), default="green")  # "green" | "orange" | "red"
    red_flags = Column(JSON, default=list)
    imaging_files = Column(JSON, default=list)
    imaging_analysis = Column(Text, nullable=True)
    follow_up_program = Column(JSON, nullable=True)
    status = Column(String(20), default="pending")  # "pending" | "validated" | "modified" | "rejected"
    validated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    validated_at = Column(DateTime, nullable=True)
    validation_notes = Column(Text, nullable=True)

    dossier = relationship("DossierMedical", back_populates="consultations")
    infirmier = relationship("User", foreign_keys=[infirmier_id])
    validator = relationship("User", foreign_keys=[validated_by])
