from datetime import datetime, timezone
from app.extensions import db

class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(150), nullable=False, index=True)
    slug = db.Column(db.String(160), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False, default="Hackathons", index=True)
    event_date = db.Column(db.DateTime, nullable=False, index=True)
    location = db.Column(db.String(150), nullable=False, default="Campus Auditorium")
    organizing_club = db.Column(db.String(100), nullable=False, default="ACM Student Chapter", index=True)
    cover_image_url = db.Column(db.String(255), nullable=True)
    recap_markdown = db.Column(db.Text, nullable=True)
    highlights = db.Column(db.JSON, nullable=True, default=list)
    participating_teams = db.Column(db.JSON, nullable=True, default=list)
    is_published = db.Column(db.Boolean, nullable=False, default=True, index=True)
    is_archived = db.Column(db.Boolean, nullable=False, default=False)
    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    creator = db.relationship("User", foreign_keys=[created_by_id])
    albums = db.relationship("EventAlbum", back_populates="event", cascade="all, delete-orphan", order_by="EventAlbum.id")
    media_items = db.relationship("EventMedia", back_populates="event", cascade="all, delete-orphan", order_by="EventMedia.display_order.asc(), EventMedia.id.asc()")

    def to_dict(self, include_details=False):
        data = {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "description": self.description,
            "category": self.category,
            "event_date": self.event_date.isoformat() if self.event_date else None,
            "year": self.event_date.year if self.event_date else None,
            "month": self.event_date.strftime("%B") if self.event_date else None,
            "location": self.location,
            "organizing_club": self.organizing_club,
            "cover_image_url": self.cover_image_url or "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
            "is_published": self.is_published,
            "is_archived": self.is_archived,
            "media_count": len(self.media_items),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_details:
            data["recap_markdown"] = self.recap_markdown or ""
            data["highlights"] = self.highlights or []
            data["participating_teams"] = self.participating_teams or []
            data["albums"] = [album.to_dict() for album in self.albums]
            data["media"] = [m.to_dict() for m in self.media_items]
        return data


class EventAlbum(db.Model):
    __tablename__ = "event_albums"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    event = db.relationship("Event", back_populates="albums")
    media_items = db.relationship("EventMedia", back_populates="album")

    def to_dict(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "title": self.title,
            "description": self.description or "",
            "media_count": len(self.media_items),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class EventMedia(db.Model):
    __tablename__ = "event_media"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    album_id = db.Column(db.Integer, db.ForeignKey("event_albums.id", ondelete="SET NULL"), nullable=True, index=True)
    media_type = db.Column(db.String(20), nullable=False, default="image")  # 'image', 'video', 'external_video'
    media_url = db.Column(db.String(255), nullable=False)
    thumbnail_url = db.Column(db.String(255), nullable=True)
    caption = db.Column(db.String(255), nullable=True)
    photographer_credit = db.Column(db.String(100), nullable=True)
    display_order = db.Column(db.Integer, nullable=False, default=0, index=True)
    uploaded_by_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    event = db.relationship("Event", back_populates="media_items")
    album = db.relationship("EventAlbum", back_populates="media_items")
    uploader = db.relationship("User", foreign_keys=[uploaded_by_id])

    def to_dict(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "album_id": self.album_id,
            "media_type": self.media_type,
            "media_url": self.media_url,
            "thumbnail_url": self.thumbnail_url or self.media_url,
            "caption": self.caption or "",
            "photographer_credit": self.photographer_credit or "",
            "display_order": self.display_order,
            "uploader_username": self.uploader.username if self.uploader else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
