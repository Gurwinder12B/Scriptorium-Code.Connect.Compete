from datetime import datetime, timezone
import math
from app.extensions import db

blog_post_tags = db.Table(
    "blog_post_tags",
    db.Column("post_id", db.Integer, db.ForeignKey("blog_posts.id", ondelete="CASCADE"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("blog_tags.id", ondelete="CASCADE"), primary_key=True),
)

class BlogCategory(db.Model):
    __tablename__ = "blog_categories"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(110), unique=True, nullable=False, index=True)
    description = db.Column(db.String(255), nullable=True)
    display_order = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    posts = db.relationship("BlogPost", back_populates="category")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "description": self.description or "",
            "posts_count": len([p for p in self.posts if p.status == "PUBLISHED"]),
        }


class BlogTag(db.Model):
    __tablename__ = "blog_tags"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    slug = db.Column(db.String(55), unique=True, nullable=False, index=True)
    usage_count = db.Column(db.Integer, nullable=False, default=0)

    posts = db.relationship("BlogPost", secondary=blog_post_tags, back_populates="tags")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "usage_count": self.usage_count,
        }


class BlogPost(db.Model):
    __tablename__ = "blog_posts"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey("blog_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    slug = db.Column(db.String(220), unique=True, nullable=False, index=True)
    excerpt = db.Column(db.Text, nullable=False)
    content_markdown = db.Column(db.Text, nullable=False)
    cover_image_url = db.Column(db.String(255), nullable=True)
    reading_time_minutes = db.Column(db.Integer, nullable=False, default=3)
    status = db.Column(db.String(20), nullable=False, default="DRAFT", index=True)  # DRAFT, PENDING_REVIEW, PUBLISHED, REJECTED, ARCHIVED
    rejection_reason = db.Column(db.Text, nullable=True)
    is_featured = db.Column(db.Boolean, nullable=False, default=False, index=True)
    is_editors_pick = db.Column(db.Boolean, nullable=False, default=False, index=True)
    view_count = db.Column(db.Integer, nullable=False, default=0, index=True)
    like_count = db.Column(db.Integer, nullable=False, default=0, index=True)
    comment_count = db.Column(db.Integer, nullable=False, default=0)
    scheduled_at = db.Column(db.DateTime, nullable=True, index=True)
    published_at = db.Column(db.DateTime, nullable=True, index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    author = db.relationship("User", foreign_keys=[author_id])
    category = db.relationship("BlogCategory", back_populates="posts")
    tags = db.relationship("BlogTag", secondary=blog_post_tags, back_populates="posts")
    comments = db.relationship("BlogComment", back_populates="post", cascade="all, delete-orphan", order_by="BlogComment.created_at.asc()")
    likes = db.relationship("BlogLike", back_populates="post", cascade="all, delete-orphan")

    def calculate_reading_time(self):
        words = len(self.content_markdown.split())
        self.reading_time_minutes = max(1, math.ceil(words / 200))

    def to_dict(self, include_content=False, current_user=None):
        data = {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "excerpt": self.excerpt,
            "cover_image_url": self.cover_image_url or "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
            "reading_time_minutes": self.reading_time_minutes,
            "status": self.status,
            "is_featured": self.is_featured,
            "is_editors_pick": self.is_editors_pick,
            "view_count": self.view_count,
            "like_count": self.like_count,
            "comment_count": self.comment_count,
            "scheduled_at": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "author": {
                "id": self.author.id,
                "username": self.author.username,
                "role": self.author.role,
                "avatar_url": self.author.profile.avatar_url if self.author.profile else None,
                "full_name": self.author.profile.full_name if self.author.profile else self.author.username,
            } if self.author else None,
            "category": self.category.to_dict() if self.category else None,
            "tags": [t.to_dict() for t in self.tags],
        }

        if current_user:
            data["user_has_liked"] = any(like.user_id == current_user.id for like in self.likes)
        else:
            data["user_has_liked"] = False

        if include_content:
            data["content_markdown"] = self.content_markdown
            data["rejection_reason"] = self.rejection_reason or ""
            data["comments"] = [
                c.to_dict() for c in self.comments if c.parent_id is None
            ]

        return data


class BlogComment(db.Model):
    __tablename__ = "blog_comments"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    post_id = db.Column(db.Integer, db.ForeignKey("blog_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id = db.Column(db.Integer, db.ForeignKey("blog_comments.id", ondelete="CASCADE"), nullable=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    post = db.relationship("BlogPost", back_populates="comments")
    author = db.relationship("User")
    replies = db.relationship("BlogComment", backref=db.backref("parent", remote_side=[id]), cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "post_id": self.post_id,
            "author_id": self.author_id,
            "author_username": self.author.username if self.author else "Anonymous",
            "author_avatar": self.author.profile.avatar_url if (self.author and self.author.profile) else None,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "replies": [reply.to_dict() for reply in self.replies],
        }


class BlogLike(db.Model):
    __tablename__ = "blog_likes"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    post_id = db.Column(db.Integer, db.ForeignKey("blog_posts.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint("post_id", "user_id", name="uq_post_user_like"),
    )

    post = db.relationship("BlogPost", back_populates="likes")
    user = db.relationship("User")
