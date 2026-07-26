from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.schemas.patient import PatientCreate, PatientOut, DossierOut, PatientFullOut
from app.schemas.consultation import (
    ConsultationCreate, ConsultationOut, VoiceMessageResponse,
    TextMessageResponse, FinalizeResponse, ValidationAction, TranscriptMessage,
)
