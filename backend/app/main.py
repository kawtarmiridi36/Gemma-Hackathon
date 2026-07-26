from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.db.session import engine, Base
from app.api.auth import router as auth_router
from app.api.patients import router as patients_router
from app.api.consultations import router as consultations_router
from app.api.validation import router as validation_router

app = FastAPI(title="Dar Al Oumouma AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(patients_router, prefix="/api")
app.include_router(consultations_router, prefix="/api")
app.include_router(validation_router, prefix="/api")

uploads_dir = Path("app/uploads")
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health():
    return {"status": "ok", "project": "Dar Al Oumouma AI"}
