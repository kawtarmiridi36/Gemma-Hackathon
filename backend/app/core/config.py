from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./app/dar_al_oumouma.db"
    UPLOAD_DIR: str = "app/uploads"
    NVIDIA_API_KEY: str = ""
    GEMMA_MODEL: str = "google/gemma-4-31b-it"
    VISTA3D_MODEL: str = "nvidia/vista-3d"
    WHISPER_MODEL: str = "medium"
    USE_LOCAL_MODEL: bool = False
    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_VOICE_ID: str = ""

    model_config = {"env_file": ".env"}


settings = Settings()
