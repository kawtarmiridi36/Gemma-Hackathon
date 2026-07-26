import logging
import os
import uuid
from pathlib import Path

from fastapi import UploadFile
from app.core.config import settings

logger = logging.getLogger(__name__)


def save_file(upload_file: UploadFile, subfolder: str, consultation_id: int) -> str:
    folder = Path(settings.UPLOAD_DIR) / subfolder / str(consultation_id)
    folder.mkdir(parents=True, exist_ok=True)

    ext = Path(upload_file.filename or "unknown").suffix or ".bin"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = folder / filename

    with open(filepath, "wb") as buffer:
        while chunk := upload_file.file.read(8192):
            buffer.write(chunk)

    logger.info(f"File saved: {filepath}")
    return f"/uploads/{subfolder}/{consultation_id}/{filename}"


def get_file_path(relative_path: str) -> Path | None:
    full = Path(relative_path.lstrip("/")).resolve()
    uploads_root = Path(settings.UPLOAD_DIR).resolve()
    if not str(full).startswith(str(uploads_root)):
        logger.warning(f"Path traversal attempt blocked: {relative_path}")
        return None
    return full if full.exists() else None
