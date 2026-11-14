import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "scriptorium-dev-secret-key-32-chars-at-least")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "scriptorium-jwt-secret-key-at-least-32-chars")
    JWT_EXPIRATION = timedelta(minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "1440")))
    
    # Database config: Neon PostgreSQL, external cloud DB, or SQLite fallback
    raw_db_url = os.getenv("DATABASE_URL", "").strip().strip('"').strip("'")
    if raw_db_url.startswith("postgres://"):
        raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)
    elif not raw_db_url:
        # If no DATABASE_URL is provided, fallback to SQLite (/tmp for Vercel/serverless)
        if os.getenv("VERCEL"):
            raw_db_url = "sqlite:////tmp/scriptorium.db"
        else:
            raw_db_url = "sqlite:///scriptorium.db"

    # In serverless environments, pg8000 is pure Python (no C dependencies / no libpq.so)
    if raw_db_url.startswith("postgresql://") and not raw_db_url.startswith("postgresql+"):
        try:
            import psycopg2
        except Exception:
            raw_db_url = raw_db_url.replace("postgresql://", "postgresql+pg8000://", 1)

    DATABASE_URL = raw_db_url
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    engine_opts = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }
    if "pg8000" in raw_db_url:
        engine_opts["connect_args"] = {"ssl_context": True}

    SQLALCHEMY_ENGINE_OPTIONS = engine_opts

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
    cors_env = os.getenv("CORS_ORIGINS", "").strip()
    if cors_env:
        CORS_ORIGINS = [origin.strip() for origin in cors_env.split(",") if origin.strip()]
    else:
        CORS_ORIGINS = [
            "https://scriptorium-code.netlify.app",
            r"^https:\/\/.*\.netlify\.app$",
            r"^https:\/\/.*\.vercel\.app$",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
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

