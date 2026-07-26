from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    nom: str
    email: EmailStr
    password: str
    role: str  # "infirmier" | "medecin"
    centre: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    nom: str
    email: str
    role: str
    centre: str | None

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    user: UserOut
