from datetime import datetime, timezone
from flask import Blueprint, request, g
from app.extensions import db
from app.models.moderation import Report, ModerationAction
from app.models.community import Question, Answer, Comment
from app.models.user import User
from app.models.audit import AuditLog
from app.common.responses import success_response
from app.common.errors import ValidationError, NotFoundError
from app.common.decorators import require_auth, require_role

moderation_bp = Blueprint("moderation", __name__, url_prefix="/api/v1/moderation")

@moderation_bp.route("/reports", methods=["POST"])
@require_auth
def create_report():
    data = request.get_json() or {}
    target_type = data.get("target_type") # 'question', 'answer', 'comment'
    target_id = data.get("target_id")
    reason = (data.get("reason") or "").strip()
    details = (data.get("details") or "").strip()

    if target_type not in ("question", "answer", "comment") or not target_id or not reason:
        raise ValidationError("Target type, target ID, and reason are required.")

    report = Report(
        reporter_id=g.current_user.id,
        target_type=target_type,
        target_id=target_id,
        reason=reason,
        details=details
    )
    db.session.add(report)
    db.session.commit()
    return success_response(data=report.to_dict(), status_code=201)

@moderation_bp.route("/reports", methods=["GET"])
@require_role("moderator", "admin")
def list_reports():
    status = request.args.get("status", "PENDING")
    reports = Report.query.filter_by(status=status).order_by(Report.created_at.desc()).all()
    return success_response(data=[r.to_dict() for r in reports])

@moderation_bp.route("/resolve", methods=["POST"])
@require_role("moderator", "admin")
def resolve_report():
    data = request.get_json() or {}
    report_id = data.get("report_id")
    action = data.get("action") # 'DISMISS', 'HIDE_CONTENT', 'RESTORE_CONTENT', 'SUSPEND_USER'
    reason = (data.get("reason") or "Moderator action taken").strip()

    report = Report.query.get(report_id)
    if not report:
        raise NotFoundError("Report not found.")

    if action == "DISMISS":
        report.status = "DISMISSED"
    elif action == "HIDE_CONTENT":
        report.status = "ACTION_TAKEN"
        if report.target_type == "question":
            q = Question.query.get(report.target_id)
            if q: q.is_hidden = True
        elif report.target_type == "answer":
            a = Answer.query.get(report.target_id)
            if a: a.is_hidden = True
        elif report.target_type == "comment":
            c = Comment.query.get(report.target_id)
            if c: c.is_hidden = True
    elif action == "RESTORE_CONTENT":
        report.status = "ACTION_TAKEN"
        if report.target_type == "question":
            q = Question.query.get(report.target_id)
            if q: q.is_hidden = False
        elif report.target_type == "answer":
            a = Answer.query.get(report.target_id)
            if a: a.is_hidden = False
        elif report.target_type == "comment":
            c = Comment.query.get(report.target_id)
            if c: c.is_hidden = False
    elif action == "SUSPEND_USER" and g.current_user.role == "admin":
        report.status = "ACTION_TAKEN"
        # Find author of content
        author_id = None
        if report.target_type == "question":
            q = Question.query.get(report.target_id)
            if q: author_id = q.author_id
        elif report.target_type == "answer":
            a = Answer.query.get(report.target_id)
            if a: author_id = a.author_id
        if author_id:
            u = User.query.get(author_id)
            if u: u.is_active = False

    report.reviewed_by = g.current_user.id
    report.reviewed_at = datetime.now(timezone.utc)

    mod_action = ModerationAction(
        moderator_id=g.current_user.id,
        action_type=action,
        target_type=report.target_type,
        target_id=report.target_id,
        reason=reason
    )
    db.session.add(mod_action)

    audit = AuditLog(
        user_id=g.current_user.id,
        action=f"MODERATION_{action}",
        resource_type=report.target_type,
        resource_id=report.target_id,
        details_json=str({"report_id": report.id, "reason": reason})
    )
    db.session.add(audit)
    db.session.commit()

    return success_response(data={"message": f"Action '{action}' applied successfully."})
