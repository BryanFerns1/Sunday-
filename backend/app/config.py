import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sunday"
    VERSION: str = "2.0.0"
    API_V1_PREFIX: str = "/api"
    DESCRIPTION: str = "Gen AI Platform for Automated Content Transformation - Sunday (Sunday)"
    
    # Organization Metadata
    ORGANIZATION: str = "the Organisation"
    THEME: str = "Smart Automation"
    CATEGORY: str = "Software"
    PROBLEM_ID: str = "sunday"
    PLATFORM_NAME: str = "Sunday"

    # CORS
    CORS_ORIGINS: List[str] = ["*"]

    # AI Model Providers
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    DEFAULT_MODEL_PROVIDER: str = os.getenv("DEFAULT_MODEL_PROVIDER", "auto")

    # Offline Local Model (Llamafile hosting Qwen3-4B GGUF)
    OFFLINE_MODEL_ENABLED: bool = True
    OFFLINE_MODEL_DIR: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "offline model"
    )
    OFFLINE_MODEL_HOST: str = "127.0.0.1"
    OFFLINE_MODEL_PORT: int = 8080
    OFFLINE_MODEL_NAME: str = "qwen3-4b-thinking-2507.Q4_K_M"
    OFFLINE_MODEL_STARTUP_TIMEOUT: float = 10.0  # seconds to wait for /v1/models after spawn
    GEMINI_COOLDOWN_SEC: int = 60  # retry Gemini this often after a failure (graceful recovery)

    # Storage Paths
    EXPORT_DIR: str = os.getenv("EXPORT_DIR", "/tmp/sunday_exports")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "/tmp/sunday_uploads")

    # Security Classifications
    CLASSIFICATIONS: List[str] = [
        "UNCLASSIFIED",
        "RESTRICTED",
        "CONFIDENTIAL",
        "SECRET",
        "TOP SECRET // SPECIAL"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

os.makedirs(settings.EXPORT_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
