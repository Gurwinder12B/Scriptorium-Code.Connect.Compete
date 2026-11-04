from datetime import datetime, timezone
import re
from app.extensions import db

def slugify(title: str) -> str:
    cleaned = re.sub(r"[^\w\s-]", "", title.lower()).strip()
    return re.sub(r"[-\s]+", "-", cleaned)

class Tag(db.Model):
    __tablename__ = "tags"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), unique=True, nullable=False, index=True)
    slug = db.Column(db.String(60), unique=True, nullable=False, index=True)
    description = db.Column(db.String(255), nullable=True)
    usage_count = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "description": self.description or "",
            "usage_count": self.usage_count
        }

question_tags = db.Table(
    "question_tags",
    db.Column("question_id", db.Integer, db.ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
)

class Question(db.Model):
    __tablename__ = "questions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False, index=True)
    slug = db.Column(db.String(280), unique=True, nullable=False, index=True)
    content_markdown = db.Column(db.Text, nullable=False)
    is_solved = db.Column(db.Boolean, nullable=False, default=False)
    accepted_answer_id = db.Column(db.Integer, db.ForeignKey("answers.id", ondelete="SET NULL", use_alter=True, name="fk_questions_accepted_answer"), nullable=True)
    vote_count = db.Column(db.Integer, nullable=False, default=0, index=True)
    answer_count = db.Column(db.Integer, nullable=False, default=0)
    view_count = db.Column(db.Integer, nullable=False, default=0)
    is_hidden = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    author = db.relationship("User", back_populates="questions")
    answers = db.relationship("Answer", foreign_keys="[Answer.question_id]", back_populates="question", cascade="all, delete-orphan")
    tags = db.relationship("Tag", secondary=question_tags, backref="questions")

    def to_dict(self, include_answers=False):
        data = {
            "id": self.id,
            "author_id": self.author_id,
            "author_username": self.author.username if self.author else "anonymous",
            "author_avatar": self.author.profile.avatar_url if self.author and self.author.profile else None,
            "title": self.title,
            "slug": self.slug,
            "content_markdown": self.content_markdown,
            "is_solved": self.is_solved,
            "accepted_answer_id": self.accepted_answer_id,
            "vote_count": self.vote_count,
            "answer_count": self.answer_count,
            "view_count": self.view_count,
            "tags": [t.to_dict() for t in self.tags],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
        if include_answers:
            data["answers"] = [a.to_dict() for a in self.answers if not a.is_hidden]
        return data

class Answer(db.Model):
    __tablename__ = "answers"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    question_id = db.Column(db.Integer, db.ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content_markdown = db.Column(db.Text, nullable=False)
    is_accepted = db.Column(db.Boolean, nullable=False, default=False)
    vote_count = db.Column(db.Integer, nullable=False, default=0, index=True)
    is_hidden = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    author = db.relationship("User", back_populates="answers")
    question = db.relationship("Question", foreign_keys=[question_id], back_populates="answers")

    def to_dict(self):
        return {
            "id": self.id,
            "question_id": self.question_id,
            "author_id": self.author_id,
            "author_username": self.author.username if self.author else "anonymous",
            "author_avatar": self.author.profile.avatar_url if self.author and self.author.profile else None,
            "content_markdown": self.content_markdown,
            "is_accepted": self.is_accepted,
            "vote_count": self.vote_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_type = db.Column(db.String(20), nullable=False) # 'question' or 'answer'
    target_id = db.Column(db.Integer, nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    is_hidden = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    author = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "author_id": self.author_id,
            "author_username": self.author.username if self.author else "anonymous",
            "target_type": self.target_type,
            "target_id": self.target_id,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Vote(db.Model):
    __tablename__ = "votes"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_type = db.Column(db.String(20), nullable=False) # 'question' or 'answer'
    target_id = db.Column(db.Integer, nullable=False)
    value = db.Column(db.SmallInteger, nullable=False) # +1 or -1
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint("user_id", "target_type", "target_id", name="uq_user_target_vote"),
    )
