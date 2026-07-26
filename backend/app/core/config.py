import secrets
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./app/dar_al_oumouma.db"
    UPLOAD_DIR: str = "app/uploads"
    MAX_UPLOAD_SIZE_MB: int = 50

    NVIDIA_API_KEY: str = ""
    GEMMA_MODEL: str = "google/gemma-4-31b-it"
    VISTA3D_MODEL: str = "nvidia/vista-3d"
    WHISPER_MODEL: str = "medium"
    USE_LOCAL_MODEL: bool = False

    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_VOICE_ID: str = ""

    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24

    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    model_config = {"env_file": ".env"}

    def get_jwt_secret(self) -> str:
        if not self.JWT_SECRET_KEY:
            self.JWT_SECRET_KEY = secrets.token_hex(32)
        return self.JWT_SECRET_KEY


settings = Settings()
