from flask import Blueprint, request, make_response, g
from app.extensions import db
from app.models.user import User, Profile
from app.models.audit import AuditLog
from app.common.security import hash_password, verify_password, create_access_token
from app.common.responses import success_response, error_response
from app.common.errors import ValidationError, ConflictError, UnauthorizedError
from app.common.decorators import require_auth
import re

auth_bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    errors = {}
    if not username or len(username) < 3 or len(username) > 30:
        errors["username"] = "Username must be between 3 and 30 characters."
    elif not re.match(r"^[a-zA-Z0-9_]+$", username):
        errors["username"] = "Username may only contain letters, numbers, and underscores."

    if not email or "@" not in email or "." not in email:
        errors["email"] = "A valid email address is required."

    if not password or len(password) < 8:
        errors["password"] = "Password must be at least 8 characters long."

    if errors:
        raise ValidationError("Invalid registration data.", details=errors)

    if User.query.filter_by(username=username).first():
        raise ConflictError("Username is already taken.")
    if User.query.filter_by(email=email).first():
        raise ConflictError("Email is already registered.")

    new_user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        role="user",
        is_active=True
    )
    db.session.add(new_user)
    db.session.flush()

    new_profile = Profile(
        user_id=new_user.id,
        full_name=username,
        bio="Hello! I am a developer learning and practicing on Scriptorium."
    )
    db.session.add(new_profile)

    audit = AuditLog(
        user_id=new_user.id,
        action="USER_REGISTER",
        resource_type="user",
        resource_id=new_user.id,
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string if request.user_agent else None
    )
    db.session.add(audit)
    db.session.commit()

    token = create_access_token(new_user.id, new_user.username, new_user.role)
    response_data = {
        "user": new_user.to_dict(),
        "token": token
    }
    resp, code = success_response(data=response_data, status_code=201)
    # Set HttpOnly cookie as well for browser clients
    resp.set_cookie("access_token", token, httponly=True, samesite="Lax")
    return resp, code

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    login_identifier = (data.get("login") or data.get("email") or data.get("username") or "").strip()
    password = data.get("password") or ""

    if not login_identifier or not password:
        raise ValidationError("Login identifier and password are required.")

    user = None
    if "@" in login_identifier:
        user = User.query.filter_by(email=login_identifier.lower()).first()
    else:
        user = User.query.filter_by(username=login_identifier).first()

    if not user or not verify_password(password, user.password_hash):
        raise UnauthorizedError("Invalid username/email or password.")

    if not user.is_active:
        raise UnauthorizedError("This account has been suspended. Please contact moderation.")

    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        resource_type="user",
        resource_id=user.id,
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string if request.user_agent else None
    )
    db.session.add(audit)
    db.session.commit()

    token = create_access_token(user.id, user.username, user.role)
    response_data = {
        "user": user.to_dict(),
        "token": token
    }
    resp, code = success_response(data=response_data)
    resp.set_cookie("access_token", token, httponly=True, samesite="Lax")
    return resp, code

@auth_bp.route("/logout", methods=["POST"])
def logout():
    resp, code = success_response(data={"message": "Logged out successfully."})
    resp.set_cookie("access_token", "", expires=0)
    return resp, code

@auth_bp.route("/me", methods=["GET"])
@require_auth
def get_current_user():
    return success_response(data=g.current_user.to_dict())

