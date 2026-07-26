from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_token
from app.models.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non trouvé",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_nurse(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "infirmier":
        raise HTTPException(status_code=403, detail="Réservé aux infirmiers")
    return current_user


def require_doctor(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "medecin":
        raise HTTPException(status_code=403, detail="Réservé aux médecins")
    return current_user


def require_medical_staff(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ("infirmier", "medecin"):
        raise HTTPException(status_code=403, detail="Réservé au personnel médical")
    return current_user
