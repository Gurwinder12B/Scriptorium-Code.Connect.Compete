from flask import Blueprint, g
from app.extensions import db
from app.models.notification import Notification
from app.common.responses import success_response
from app.common.errors import NotFoundError, ForbiddenError
from app.common.decorators import require_auth

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/v1/notifications")

@notifications_bp.route("", methods=["GET"])
@require_auth
def list_notifications():
    notifs = (
        Notification.query.filter_by(user_id=g.current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(30)
        .all()
    )
    unread_count = Notification.query.filter_by(user_id=g.current_user.id, is_read=False).count()
    return success_response(
        data=[n.to_dict() for n in notifs],
        meta={"unread_count": unread_count}
    )

@notifications_bp.route("/<int:notif_id>/read", methods=["PATCH"])
@require_auth
def mark_read(notif_id):
    notif = Notification.query.get(notif_id)
    if not notif:
        raise NotFoundError("Notification not found.")
    if notif.user_id != g.current_user.id:
        raise ForbiddenError("Access denied.")

    notif.is_read = True
    db.session.commit()
    return success_response(data=notif.to_dict())

@notifications_bp.route("/mark-all-read", methods=["POST"])
@require_auth
def mark_all_read():
    Notification.query.filter_by(user_id=g.current_user.id, is_read=False).update({"is_read": True})
    db.session.commit()
    return success_response(data={"message": "All notifications marked as read."})
