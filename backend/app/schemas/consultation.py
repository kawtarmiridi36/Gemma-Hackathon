from datetime import datetime
from pydantic import BaseModel, Field
from typing import Literal


class TranscriptMessage(BaseModel):
    role: str
    content: str
    type: str = "text"
    timestamp: str | None = None


class ConsultationCreate(BaseModel):
    dossier_id: int


class TextMessageBody(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)


class ConsultationOut(BaseModel):
    id: int
    dossier_id: int
    infirmier_id: int
    date: datetime
    transcript: list
    compte_rendu: str | None
    ordonnance: list
    urgency_level: str
    red_flags: list
    imaging_files: list
    imaging_analysis: str | None
    follow_up_program: dict | None = None
    status: str
    validated_by: int | None
    validated_at: datetime | None
    validation_notes: str | None

    model_config = {"from_attributes": True}


class VoiceMessageResponse(BaseModel):
    transcript: str
    ai_response: dict
    new_messages: list
    urgency_level: str


class TextMessageResponse(BaseModel):
    ai_response: dict
    new_messages: list
    urgency_level: str


class FinalizeResponse(BaseModel):
    compte_rendu: str
    ordonnance: list
    urgency_level: str
    red_flags: list
    follow_up_program: dict


class ValidationAction(BaseModel):
    action: Literal["validated", "modified", "rejected"]
    notes: str | None = None
    modified_ordonnance: list | None = None
    modified_compte_rendu: str | None = None


class CTGInput(BaseModel):
    baseline_value: float
    accelerations: float
    fetal_movement: float
    uterine_contractions: float
    light_decelerations: float
    severe_decelerations: float
    prolongued_decelerations: float
    abnormal_short_term_variability: float
    mean_value_of_short_term_variability: float
    percentage_of_time_with_abnormal_long_term_variability: float
    mean_value_of_long_term_variability: float
    histogram_width: float
    histogram_min: float
    histogram_max: float
    histogram_number_of_peaks: float
    histogram_number_of_zeroes: float
    histogram_mode: float
    histogram_mean: float
    histogram_median: float
    histogram_variance: float
    histogram_tendency: float


class CTGPrediction(BaseModel):
    classification: str
    confidence: float
    probabilities: dict
    model_info: dict
