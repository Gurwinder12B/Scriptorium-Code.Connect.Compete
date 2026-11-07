import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "scriptorium-dev-secret-key-32-chars-at-least")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "scriptorium-jwt-secret-key-at-least-32-chars")
    JWT_EXPIRATION = timedelta(minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "1440")))
    
    # Database config: default to SQLite if DATABASE_URL is not set or MySQL is unreachable
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///scriptorium.db")
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Media & Uploads
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
    ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
    ALLOWED_VIDEO_EXTENSIONS = {"mp4", "webm"}
    
    # Judge Provider: 'mock' (default for dev/offline testing) or 'judge0'
    JUDGE_PROVIDER = os.getenv("JUDGE_PROVIDER", "mock")
    JUDGE0_API_URL = os.getenv("JUDGE0_API_URL", "http://localhost:2358")
    JUDGE0_API_KEY = os.getenv("JUDGE0_API_KEY", "")
    JUDGE_TIMEOUT_SECONDS = int(os.getenv("JUDGE_TIMEOUT_SECONDS", "5"))
    JUDGE_MEMORY_LIMIT_MB = int(os.getenv("JUDGE_MEMORY_LIMIT_MB", "128"))
    
    # CORS
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "https://scriptorium-code.netlify.app,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173",
        ).split(",")
    ]

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True
    # In-memory SQLite for super-fast, clean test execution
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_EXPIRATION = timedelta(minutes=60)
    JUDGE_PROVIDER = "mock"

class ProductionConfig(Config):
    DEBUG = False
    # In production, require secure secrets
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"

config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}

