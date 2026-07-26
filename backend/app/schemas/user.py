from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Literal


class UserCreate(BaseModel):
    nom: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: Literal["infirmier", "medecin"]
    centre: str | None = Field(None, max_length=255)


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
    token_type: str = "bearer"
    user: UserOut
