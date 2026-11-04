import os
from datetime import datetime, timezone, timedelta
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from flask import current_app, has_app_context

DEFAULT_JWT_SECRET = os.getenv("JWT_SECRET_KEY", "scriptorium-jwt-secret-key-at-least-32-chars")
DEFAULT_EXPIRATION = timedelta(minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "1440")))

def hash_password(password: str) -> str:
    return generate_password_hash(password, method="pbkdf2:sha256:600000")

def verify_password(password: str, password_hash: str) -> bool:
    return check_password_hash(password_hash, password)

def create_access_token(user_id: int, username: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    if has_app_context() and "JWT_EXPIRATION" in current_app.config:
        expiration = now + current_app.config["JWT_EXPIRATION"]
        secret = current_app.config["JWT_SECRET_KEY"]
    else:
        expiration = now + DEFAULT_EXPIRATION
        secret = DEFAULT_JWT_SECRET

    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "iat": now,
        "exp": expiration
    }
    return jwt.encode(payload, secret, algorithm="HS256")

def decode_access_token(token: str) -> dict:
    try:
        secret = current_app.config["JWT_SECRET_KEY"] if (has_app_context() and "JWT_SECRET_KEY" in current_app.config) else DEFAULT_JWT_SECRET
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
