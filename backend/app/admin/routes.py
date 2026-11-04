from flask import Blueprint, request, g
from app.extensions import db
from app.models.user import User
from app.models.problem import Problem
from app.models.community import Question, Answer
from app.models.submission import Submission
from app.models.moderation import Report
from app.models.audit import AuditLog
from app.common.responses import success_response
from app.common.errors import ValidationError, NotFoundError
from app.common.decorators import require_role

admin_bp = Blueprint("admin", __name__, url_prefix="/api/v1/admin")

@admin_bp.route("/stats", methods=["GET"])
@require_role("admin")
def get_stats():
    stats = {
        "users_count": User.query.count(),
        "problems_count": Problem.query.count(),
        "questions_count": Question.query.count(),
        "answers_count": Answer.query.count(),
        "submissions_count": Submission.query.count(),
        "pending_reports_count": Report.query.filter_by(status="PENDING").count(),
    }
    return success_response(data=stats)

@admin_bp.route("/users", methods=["GET"])
@require_role("admin")
def list_users():
    users = User.query.order_by(User.id.desc()).limit(100).all()
    return success_response(data=[u.to_dict() for u in users])

@admin_bp.route("/users/<int:user_id>/role", methods=["PATCH"])
@require_role("admin")
def change_user_role(user_id):
    user = User.query.get(user_id)
    if not user:
        raise NotFoundError("User not found.")

    data = request.get_json() or {}
    new_role = data.get("role")
    if new_role not in ("user", "moderator", "admin"):
        raise ValidationError("Role must be 'user', 'moderator', or 'admin'.")

    user.role = new_role
    if "is_active" in data:
        user.is_active = bool(data["is_active"])

    audit = AuditLog(
        user_id=g.current_user.id,
        action="ADMIN_CHANGE_USER_ROLE",
        resource_type="user",
        resource_id=user.id,
        details_json=str({"new_role": new_role, "target_user": user.username})
    )
    db.session.add(audit)
    db.session.commit()

    return success_response(data=user.to_dict())

@admin_bp.route("/audit-logs", methods=["GET"])
@require_role("admin")
def list_audit_logs():
    limit = min(request.args.get("limit", 50, type=int), 200)
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    return success_response(data=[l.to_dict() for l in logs])

