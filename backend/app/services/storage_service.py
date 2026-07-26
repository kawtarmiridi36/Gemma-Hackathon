import os
import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile
from app.core.config import settings


def save_file(upload_file: UploadFile, subfolder: str, consultation_id: int) -> str:
    folder = Path(settings.UPLOAD_DIR) / subfolder / str(consultation_id)
    folder.mkdir(parents=True, exist_ok=True)

    ext = Path(upload_file.filename or "unknown").suffix or ".bin"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = folder / filename

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return f"/uploads/{subfolder}/{consultation_id}/{filename}"


def get_file_path(relative_path: str) -> Path | None:
    full = Path(relative_path.lstrip("/"))
    return full if full.exists() else None
