from functools import wraps
from flask import request, g
from app.common.security import decode_access_token
from app.common.errors import UnauthorizedError, ForbiddenError
from app.models.user import User

def get_current_user_from_request():
    token = None
    auth_header = (
        request.headers.get("Authorization")
        or request.headers.get("authorization")
        or request.environ.get("HTTP_AUTHORIZATION")
        or request.environ.get("authorization")
    )
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
    elif "access_token" in request.cookies:
        token = request.cookies.get("access_token")

    if not token:
        return None, "NO_TOKEN_HEADER"

    payload, err = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None, f"DECODE_FAIL:{err}"

    user = User.query.filter_by(id=payload["sub"], is_active=True).first()
    if not user:
        return None, f"USER_NOT_FOUND:{payload.get('sub')}"
    return user, None

def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user, reason = get_current_user_from_request()
        if not user:
            raise UnauthorizedError(f"Authentication token is missing, expired, or invalid ({reason}).")
        g.current_user = user
        return fn(*args, **kwargs)
    return wrapper

def optional_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user, _ = get_current_user_from_request()
        g.current_user = user
        return fn(*args, **kwargs)
    return wrapper

def require_role(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user, reason = get_current_user_from_request()
            if not user:
                raise UnauthorizedError(f"Authentication required ({reason}).")
            if user.role not in roles:
                raise ForbiddenError(f"Action requires one of the following roles: {', '.join(roles)}.")
            g.current_user = user
            return fn(*args, **kwargs)
        return wrapper
    return decorator

