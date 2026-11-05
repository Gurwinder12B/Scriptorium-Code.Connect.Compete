from datetime import datetime, timezone
import re
from app.extensions import db

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")

class Club(db.Model):
    __tablename__ = "clubs"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(120), unique=True, nullable=False, index=True)
    tagline = db.Column(db.String(255), nullable=False)
    description_markdown = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False, default="Open Source & Systems")
    lead_user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    logo_url = db.Column(db.String(500), nullable=True)
    banner_url = db.Column(db.String(500), nullable=True)
    meeting_schedule = db.Column(db.String(150), nullable=True)
    member_count = db.Column(db.Integer, default=0, nullable=False)
    is_verified = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    lead = db.relationship("User", foreign_keys=[lead_user_id])
    members = db.relationship("ClubMember", backref="club", cascade="all, delete-orphan")
    announcements = db.relationship("ClubAnnouncement", backref="club", cascade="all, delete-orphan", order_by="ClubAnnouncement.created_at.desc()")

    def to_dict(self, current_user=None, include_details=False):
        user_is_member = False
        user_role = None
        if current_user and getattr(current_user, "id", None):
            mem = ClubMember.query.filter_by(club_id=self.id, user_id=current_user.id).first()
            if mem:
                user_is_member = True
                user_role = mem.role

        data = {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "tagline": self.tagline,
            "category": self.category,
            "logo_url": self.logo_url,
            "banner_url": self.banner_url,
            "meeting_schedule": self.meeting_schedule,
            "member_count": self.member_count or len(self.members),
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "lead": {
                "id": self.lead.id,
                "username": self.lead.username,
                "role": self.lead.role,
                "avatar_url": self.lead.profile.avatar_url if self.lead and self.lead.profile else None,
            } if self.lead else None,
            "user_is_member": user_is_member,
            "user_role": user_role,
        }

        if include_details:
            data["description_markdown"] = self.description_markdown
            data["announcements"] = [a.to_dict() for a in self.announcements]
            data["officers"] = [
                m.to_dict() for m in self.members if m.role in ("LEAD", "OFFICER")
            ]

        return data

class ClubMember(db.Model):
    __tablename__ = "club_members"

    id = db.Column(db.Integer, primary_key=True)
    club_id = db.Column(db.Integer, db.ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = db.Column(db.String(20), default="MEMBER", nullable=False)  # LEAD, OFFICER, MEMBER
    joined_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (db.UniqueConstraint("club_id", "user_id", name="uq_club_user_member"),)

    user = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "club_id": self.club_id,
            "user_id": self.user_id,
            "username": self.user.username if self.user else "member",
            "role": self.role,
            "avatar_url": self.user.profile.avatar_url if self.user and self.user.profile else None,
            "joined_at": self.joined_at.isoformat() if self.joined_at else None,
        }

class ClubAnnouncement(db.Model):
    __tablename__ = "club_announcements"

    id = db.Column(db.Integer, primary_key=True)
    club_id = db.Column(db.Integer, db.ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    content_markdown = db.Column(db.Text, nullable=False)
    announcement_type = db.Column(db.String(30), default="GENERAL", nullable=False)  # WORKSHOP, HACKATHON_CALL, RECRUITMENT, GENERAL
    is_pinned = db.Column(db.Boolean, default=False, nullable=False)
    rsvp_link = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    author = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "club_id": self.club_id,
            "club_name": self.club.name if self.club else None,
            "club_slug": self.club.slug if self.club else None,
            "title": self.title,
            "content_markdown": self.content_markdown,
            "announcement_type": self.announcement_type,
            "is_pinned": self.is_pinned,
            "rsvp_link": self.rsvp_link,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "author": {
                "id": self.author.id,
                "username": self.author.username,
                "role": self.author.role,
                "avatar_url": self.author.profile.avatar_url if self.author and self.author.profile else None,
            } if self.author else None,
        }
