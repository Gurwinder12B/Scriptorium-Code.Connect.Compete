from datetime import datetime, timezone
from app.extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user") # 'guest', 'user', 'moderator', 'admin'
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    profile = db.relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    questions = db.relationship("Question", back_populates="author", cascade="all, delete-orphan")
    answers = db.relationship("Answer", back_populates="author", cascade="all, delete-orphan")
    submissions = db.relationship("Submission", back_populates="user", cascade="all, delete-orphan")
    progress_records = db.relationship("UserProblemProgress", back_populates="user", cascade="all, delete-orphan")

    def can_manage_events(self):
        return self.role in ("admin", "moderator", "club_coordinator")

    def can_manage_blogs(self):
        return self.role in ("admin", "moderator", "editor")

    def is_privileged(self):
        return self.role in ("admin", "moderator")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "profile": self.profile.to_dict() if self.profile else None
        }

class Profile(db.Model):
    __tablename__ = "profiles"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = db.Column(db.String(100), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(100), nullable=True)
    github_url = db.Column(db.String(255), nullable=True)
    website_url = db.Column(db.String(255), nullable=True)
    avatar_url = db.Column(db.String(255), nullable=True)
    points = db.Column(db.Integer, nullable=False, default=0, index=True)
    problems_solved_count = db.Column(db.Integer, nullable=False, default=0)
    questions_count = db.Column(db.Integer, nullable=False, default=0)
    answers_count = db.Column(db.Integer, nullable=False, default=0)
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="profile")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "full_name": self.full_name or "",
            "bio": self.bio or "",
            "location": self.location or "",
            "github_url": self.github_url or "",
            "website_url": self.website_url or "",
            "avatar_url": self.avatar_url or "",
            "points": self.points,
            "problems_solved_count": self.problems_solved_count,
            "questions_count": self.questions_count,
            "answers_count": self.answers_count,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

