from datetime import datetime, timezone
import re
from app.extensions import db

project_tags_table = db.Table(
    "project_tags_association",
    db.Column("project_id", db.Integer, db.ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("project_tags.id", ondelete="CASCADE"), primary_key=True),
)

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")

class ProjectTag(db.Model):
    __tablename__ = "project_tags"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False, index=True)
    slug = db.Column(db.String(60), unique=True, nullable=False, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
        }

class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = db.Column(db.String(150), nullable=False)
    slug = db.Column(db.String(170), unique=True, nullable=False, index=True)
    tagline = db.Column(db.String(255), nullable=False)
    description_markdown = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False, default="Web Development", index=True)
    cover_image_url = db.Column(db.String(500), nullable=True)
    github_url = db.Column(db.String(500), nullable=True)
    live_demo_url = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(20), nullable=False, default="PUBLISHED", index=True)
    view_count = db.Column(db.Integer, default=0, nullable=False)
    upvote_count = db.Column(db.Integer, default=0, nullable=False)

    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    author = db.relationship("User", backref=db.backref("projects", lazy="dynamic", cascade="all, delete-orphan"))
    media = db.relationship("ProjectMedia", backref="project", cascade="all, delete-orphan", order_by="ProjectMedia.display_order")
    tags = db.relationship("ProjectTag", secondary=project_tags_table, backref=db.backref("projects", lazy="dynamic"))
    collaborators = db.relationship("ProjectCollaborator", backref="project", cascade="all, delete-orphan")
    reviews = db.relationship("CodeReview", backref="project", cascade="all, delete-orphan", order_by="CodeReview.created_at.desc()")
    upvotes = db.relationship("ProjectUpvote", backref="project", cascade="all, delete-orphan")

    def to_dict(self, current_user=None, include_details=False):
        user_has_upvoted = False
        if current_user and getattr(current_user, "id", None):
            user_has_upvoted = ProjectUpvote.query.filter_by(project_id=self.id, user_id=current_user.id).first() is not None

        author_data = {
            "id": self.author.id,
            "username": self.author.username,
            "role": self.author.role,
            "avatar_url": self.author.profile.avatar_url if self.author and self.author.profile else None,
            "full_name": self.author.profile.full_name if self.author and self.author.profile else None,
        } if self.author else None

        data = {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "tagline": self.tagline,
            "category": self.category,
            "cover_image_url": self.cover_image_url,
            "github_url": self.github_url,
            "live_demo_url": self.live_demo_url,
            "status": self.status,
            "view_count": self.view_count,
            "upvote_count": self.upvote_count,
            "review_count": len(self.reviews),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "author": author_data,
            "tags": [t.to_dict() for t in self.tags],
            "media": [m.to_dict() for m in self.media],
            "user_has_upvoted": user_has_upvoted,
        }

        if include_details:
            data["description_markdown"] = self.description_markdown
            data["collaborators"] = [c.to_dict() for c in self.collaborators]
            data["reviews"] = [r.to_dict(current_user=current_user) for r in self.reviews]

        return data

class ProjectMedia(db.Model):
    __tablename__ = "project_media"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    media_url = db.Column(db.String(500), nullable=False)
    caption = db.Column(db.String(255), nullable=True)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "media_url": self.media_url,
            "caption": self.caption,
            "display_order": self.display_order,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class ProjectCollaborator(db.Model):
    __tablename__ = "project_collaborators"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role_description = db.Column(db.String(100), default="Collaborator", nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "username": self.user.username if self.user else "user",
            "role_description": self.role_description,
            "avatar_url": self.user.profile.avatar_url if self.user and self.user.profile else None,
        }

class CodeReview(db.Model):
    __tablename__ = "code_reviews"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    summary = db.Column(db.String(255), nullable=False)
    architecture_feedback = db.Column(db.Text, nullable=True)
    performance_feedback = db.Column(db.Text, nullable=True)
    security_feedback = db.Column(db.Text, nullable=True)
    ui_ux_feedback = db.Column(db.Text, nullable=True)
    rating_overall = db.Column(db.Integer, default=5, nullable=False)
    status = db.Column(db.String(20), default="OPEN", nullable=False, index=True)  # OPEN, ADDRESSED, RESOLVED
    upvote_count = db.Column(db.Integer, default=0, nullable=False)

    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    reviewer = db.relationship("User", backref=db.backref("code_reviews_given", lazy="dynamic"))
    comments = db.relationship("CodeReviewComment", backref="review", cascade="all, delete-orphan", order_by="CodeReviewComment.created_at.asc()")
    upvotes = db.relationship("ReviewUpvote", backref="review", cascade="all, delete-orphan")

    def to_dict(self, current_user=None):
        user_has_upvoted = False
        if current_user and getattr(current_user, "id", None):
            user_has_upvoted = ReviewUpvote.query.filter_by(review_id=self.id, user_id=current_user.id).first() is not None

        return {
            "id": self.id,
            "project_id": self.project_id,
            "reviewer": {
                "id": self.reviewer.id,
                "username": self.reviewer.username,
                "role": self.reviewer.role,
                "avatar_url": self.reviewer.profile.avatar_url if self.reviewer and self.reviewer.profile else None,
            } if self.reviewer else None,
            "summary": self.summary,
            "architecture_feedback": self.architecture_feedback,
            "performance_feedback": self.performance_feedback,
            "security_feedback": self.security_feedback,
            "ui_ux_feedback": self.ui_ux_feedback,
            "rating_overall": self.rating_overall,
            "status": self.status,
            "upvote_count": self.upvote_count,
            "user_has_upvoted": user_has_upvoted,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "comments": [c.to_dict() for c in self.comments],
        }

class CodeReviewComment(db.Model):
    __tablename__ = "code_review_comments"

    id = db.Column(db.Integer, primary_key=True)
    review_id = db.Column(db.Integer, db.ForeignKey("code_reviews.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    code_snippet = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "review_id": self.review_id,
            "content": self.content,
            "code_snippet": self.code_snippet,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "author": {
                "id": self.user.id,
                "username": self.user.username,
                "role": self.user.role,
                "avatar_url": self.user.profile.avatar_url if self.user and self.user.profile else None,
            } if self.user else None,
        }

class ProjectUpvote(db.Model):
    __tablename__ = "project_upvotes"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (db.UniqueConstraint("project_id", "user_id", name="uq_project_user_upvote"),)

class ReviewUpvote(db.Model):
    __tablename__ = "review_upvotes"

    id = db.Column(db.Integer, primary_key=True)
    review_id = db.Column(db.Integer, db.ForeignKey("code_reviews.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (db.UniqueConstraint("review_id", "user_id", name="uq_review_user_upvote"),)
