from functools import wraps
from flask import request, g
from app.common.security import decode_access_token
from app.common.errors import UnauthorizedError, ForbiddenError
from app.models.user import User

def get_current_user_from_request():
    token = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
    elif "access_token" in request.cookies:
        token = request.cookies.get("access_token")

    if not token:
        return None

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None

    user = User.query.filter_by(id=payload["sub"], is_active=True).first()
    return user

def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = get_current_user_from_request()
        if not user:
            raise UnauthorizedError("Authentication token is missing, expired, or invalid.")
        g.current_user = user
        return fn(*args, **kwargs)
    return wrapper

def optional_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        g.current_user = get_current_user_from_request()
        return fn(*args, **kwargs)
    return wrapper

def require_role(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = get_current_user_from_request()
            if not user:
                raise UnauthorizedError("Authentication required.")
            if user.role not in roles:
                raise ForbiddenError(f"Action requires one of the following roles: {', '.join(roles)}.")
            g.current_user = user
            return fn(*args, **kwargs)
        return wrapper
    return decorator

