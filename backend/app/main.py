import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.core.config import settings
from app.db.session import engine, Base
from app.api.auth import router as auth_router
from app.api.patients import router as patients_router
from app.api.consultations import router as consultations_router
from app.api.validation import router as validation_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Dar Al Oumouma AI...")
    Base.metadata.create_all(bind=engine)
    uploads_dir = Path(settings.UPLOAD_DIR)
    uploads_dir.mkdir(parents=True, exist_ok=True)
    logger.info("Database initialized, uploads directory ready.")
    yield
    logger.info("Shutting down Dar Al Oumouma AI.")


app = FastAPI(
    title="Dar Al Oumouma AI",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(patients_router, prefix="/api")
app.include_router(consultations_router, prefix="/api")
app.include_router(validation_router, prefix="/api")

uploads_dir = Path(settings.UPLOAD_DIR)
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")


@app.get("/api/health")
def health():
    return {"status": "ok", "project": "Dar Al Oumouma AI", "version": "0.2.0"}
