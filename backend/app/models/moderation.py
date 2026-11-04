from datetime import datetime, timezone
from app.extensions import db

class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_type = db.Column(db.String(20), nullable=False) # 'question', 'answer', 'comment'
    target_id = db.Column(db.Integer, nullable=False, index=True)
    reason = db.Column(db.String(50), nullable=False) # 'spam', 'harassment', 'inappropriate', 'low_quality'
    details = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="PENDING") # 'PENDING', 'REVIEWED', 'DISMISSED', 'ACTION_TAKEN'
    reviewed_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    reporter = db.relationship("User", foreign_keys=[reporter_id])
    reviewer = db.relationship("User", foreign_keys=[reviewed_by])

    def to_dict(self):
        return {
            "id": self.id,
            "reporter_id": self.reporter_id,
            "reporter_username": self.reporter.username if self.reporter else None,
            "target_type": self.target_type,
            "target_id": self.target_id,
            "reason": self.reason,
            "details": self.details,
            "status": self.status,
            "reviewed_by": self.reviewer.username if self.reviewer else None,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class ModerationAction(db.Model):
    __tablename__ = "moderation_actions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    moderator_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action_type = db.Column(db.String(50), nullable=False) # 'HIDE_CONTENT', 'RESTORE_CONTENT', 'SUSPEND_USER', 'UNSUSPEND_USER'
    target_type = db.Column(db.String(20), nullable=False)
    target_id = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    moderator = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "moderator_id": self.moderator_id,
            "moderator_username": self.moderator.username if self.moderator else None,
            "action_type": self.action_type,
            "target_type": self.target_type,
            "target_id": self.target_id,
            "reason": self.reason,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
