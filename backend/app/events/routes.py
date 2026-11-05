import re
from datetime import datetime
from flask import Blueprint, request, g
from app.extensions import db
from app.models.event import Event, EventAlbum, EventMedia
from app.models.audit import AuditLog
from app.common.decorators import require_auth, optional_auth, require_role
from app.common.responses import success_response, created_response, error_response
from app.common.errors import ValidationError, NotFoundError, ForbiddenError
from app.common.upload import save_uploaded_media

events_bp = Blueprint("events", __name__, url_prefix="/api/v1/events")

def slugify(text: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "-", slug)

@events_bp.route("", methods=["GET"])
@optional_auth
def list_events():
    category = request.args.get("category", "").strip()
    year = request.args.get("year", type=int)
    club = request.args.get("club", "").strip()
    q = request.args.get("q", "").strip()
    page = max(1, request.args.get("page", 1, type=int))
    per_page = min(50, max(1, request.args.get("per_page", 12, type=int)))
    show_archived = request.args.get("archived", "false").lower() == "true"

    query = Event.query

    # Non-privileged users only see published and non-archived events
    user = getattr(g, "current_user", None)
    is_admin_or_mod = user and user.role in ("admin", "moderator", "club_coordinator")
    if not is_admin_or_mod:
        query = query.filter_by(is_published=True, is_archived=False)
    else:
        if not show_archived:
            query = query.filter_by(is_archived=False)

    if category:
        query = query.filter(Event.category.ilike(f"%{category}%"))
    if club:
        query = query.filter(Event.organizing_club.ilike(f"%{club}%"))
    if year:
        query = query.filter(db.extract("year", Event.event_date) == year)
    if q:
        query = query.filter(
            db.or_(
                Event.title.ilike(f"%{q}%"),
                Event.description.ilike(f"%{q}%"),
                Event.location.ilike(f"%{q}%"),
            )
        )

    query = query.order_by(Event.event_date.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    # Categories and years summaries for filter toolbars
    all_categories = [
        row[0] for row in db.session.query(Event.category).distinct().all() if row[0]
    ]

    return success_response(
        data=[event.to_dict(include_details=False) for event in pagination.items],
        meta={
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages,
            "categories": all_categories,
        },
    )

@events_bp.route("/<identifier>", methods=["GET"])
@optional_auth
def get_event(identifier: str):
    if identifier.isdigit():
        event = Event.query.get(int(identifier))
    else:
        event = Event.query.filter_by(slug=identifier).first()

    if not event:
        raise NotFoundError("Event not found.")

    user = getattr(g, "current_user", None)
    is_admin_or_mod = user and user.role in ("admin", "moderator", "club_coordinator")
    if not event.is_published and not is_admin_or_mod:
        raise NotFoundError("Event is not yet published.")

    return success_response(data=event.to_dict(include_details=True))

@events_bp.route("", methods=["POST"])
@require_auth
@require_role("admin", "moderator", "club_coordinator")
def create_event():
    data = request.get_json(silent=True) or {}
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    category = data.get("category", "Hackathons").strip()
    event_date_str = data.get("event_date", "").strip()
    location = data.get("location", "Campus Auditorium").strip()
    organizing_club = data.get("organizing_club", "ACM Student Chapter").strip()
    cover_image_url = data.get("cover_image_url", "").strip()
    recap_markdown = data.get("recap_markdown", "").strip()
    highlights = data.get("highlights", [])
    participating_teams = data.get("participating_teams", [])
    is_published = data.get("is_published", True)

    if len(title) < 5:
        raise ValidationError("Event title must be at least 5 characters.")
    if len(description) < 10:
        raise ValidationError("Event description must be at least 10 characters.")
    if not event_date_str:
        raise ValidationError("Event date is required.")

    try:
        event_date = datetime.fromisoformat(event_date_str.replace("Z", "+00:00"))
    except Exception:
        raise ValidationError("Invalid ISO format for event date (e.g. 2026-11-20T10:00:00).")

    base_slug = slugify(title)
    slug = base_slug
    counter = 1
    while Event.query.filter_by(slug=slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    event = Event(
        title=title,
        slug=slug,
        description=description,
        category=category,
        event_date=event_date,
        location=location,
        organizing_club=organizing_club,
        cover_image_url=cover_image_url or None,
        recap_markdown=recap_markdown or None,
        highlights=highlights if isinstance(highlights, list) else [],
        participating_teams=participating_teams if isinstance(participating_teams, list) else [],
        is_published=is_published,
        created_by_id=g.current_user.id,
    )
    db.session.add(event)
    db.session.flush()

    # Automatically create a default 'Highlights' album
    default_album = EventAlbum(
        event_id=event.id,
        title="Event Highlights",
        description=f"Photos & moments from {title}",
    )
    db.session.add(default_album)

    # Audit log
    audit = AuditLog(
        user_id=g.current_user.id,
        action="CREATE_EVENT",
        resource_type="Event",
        resource_id=event.id,
        details=f"Created event '{title}'",
    )
    db.session.add(audit)
    db.session.commit()

    return created_response(
        data=event.to_dict(include_details=True),
        message="Event created successfully with default album.",
    )

@events_bp.route("/<int:event_id>", methods=["PUT"])
@require_auth
@require_role("admin", "moderator", "club_coordinator")
def update_event(event_id: int):
    event = Event.query.get(event_id)
    if not event:
        raise NotFoundError("Event not found.")

    data = request.get_json(silent=True) or {}
    if "title" in data:
        event.title = data["title"].strip()
    if "description" in data:
        event.description = data["description"].strip()
    if "category" in data:
        event.category = data["category"].strip()
    if "location" in data:
        event.location = data["location"].strip()
    if "organizing_club" in data:
        event.organizing_club = data["organizing_club"].strip()
    if "cover_image_url" in data:
        event.cover_image_url = data["cover_image_url"].strip() or None
    if "recap_markdown" in data:
        event.recap_markdown = data["recap_markdown"].strip()
    if "highlights" in data and isinstance(data["highlights"], list):
        event.highlights = data["highlights"]
    if "participating_teams" in data and isinstance(data["participating_teams"], list):
        event.participating_teams = data["participating_teams"]
    if "is_published" in data:
        event.is_published = bool(data["is_published"])
    if "is_archived" in data:
        event.is_archived = bool(data["is_archived"])
    if "event_date" in data:
        try:
            event.event_date = datetime.fromisoformat(data["event_date"].replace("Z", "+00:00"))
        except Exception:
            raise ValidationError("Invalid ISO format for event_date.")

    db.session.commit()
    return success_response(
        data=event.to_dict(include_details=True),
        message="Event updated successfully.",
    )

@events_bp.route("/<int:event_id>", methods=["DELETE"])
@require_auth
@require_role("admin", "moderator")
def delete_event(event_id: int):
    event = Event.query.get(event_id)
    if not event:
        raise NotFoundError("Event not found.")

    db.session.delete(event)
    db.session.commit()
    return success_response(message="Event and associated media deleted successfully.")

@events_bp.route("/<int:event_id>/albums", methods=["POST"])
@require_auth
@require_role("admin", "moderator", "club_coordinator")
def create_album(event_id: int):
    event = Event.query.get(event_id)
    if not event:
        raise NotFoundError("Event not found.")

    data = request.get_json(silent=True) or {}
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()

    if not title:
        raise ValidationError("Album title is required.")

    album = EventAlbum(
        event_id=event.id,
        title=title,
        description=description or None,
    )
    db.session.add(album)
    db.session.commit()

    return created_response(
        data=album.to_dict(),
        message="Event album created successfully.",
    )

@events_bp.route("/<int:event_id>/media", methods=["POST"])
@require_auth
def upload_event_media(event_id: int):
    event = Event.query.get(event_id)
    if not event:
        raise NotFoundError("Event not found.")

    # Permissions check: admins, moderators, club coordinators, or permitted students
    user = g.current_user
    if not user.can_manage_events() and user.role not in ("student", "user"):
        raise ForbiddenError("You do not have permission to upload media to this event.")

    album_id = None
    caption = ""
    photographer_credit = ""
    media_type = "image"
    media_url = ""

    # Check if multipart file upload
    if "file" in request.files:
        file = request.files["file"]
        album_id_val = request.form.get("album_id")
        if album_id_val and album_id_val.isdigit():
            album_id = int(album_id_val)
        caption = request.form.get("caption", "").strip()
        photographer_credit = request.form.get("photographer_credit", user.username).strip()
        media_type = request.form.get("media_type", "image").strip()

        # Save media securely via upload handler
        media_url = save_uploaded_media(file, subfolder="events", media_type=media_type)
    else:
        # JSON payload with external URL or link
        data = request.get_json(silent=True) or {}
        media_url = data.get("media_url", "").strip()
        if not media_url:
            raise ValidationError("No media file or URL provided.")
        album_id = data.get("album_id")
        caption = data.get("caption", "").strip()
        photographer_credit = data.get("photographer_credit", user.username).strip()
        media_type = data.get("media_type", "image").strip()

    # Determine display order
    last_media = EventMedia.query.filter_by(event_id=event.id).order_by(EventMedia.display_order.desc()).first()
    next_order = (last_media.display_order + 1) if last_media else 1

    media_item = EventMedia(
        event_id=event.id,
        album_id=album_id,
        media_type=media_type,
        media_url=media_url,
        thumbnail_url=media_url,
        caption=caption or None,
        photographer_credit=photographer_credit or None,
        display_order=next_order,
        uploaded_by_id=user.id,
    )
    db.session.add(media_item)

    # If event has no cover image yet, set this media as cover
    if not event.cover_image_url and media_type == "image":
        event.cover_image_url = media_url

    db.session.commit()

    return created_response(
        data=media_item.to_dict(),
        message="Media item added to event gallery.",
    )

@events_bp.route("/<int:event_id>/media/<int:media_id>", methods=["DELETE"])
@require_auth
def delete_event_media(event_id: int, media_id: int):
    media_item = EventMedia.query.filter_by(id=media_id, event_id=event_id).first()
    if not media_item:
        raise NotFoundError("Media item not found.")

    user = g.current_user
    if not user.can_manage_events() and media_item.uploaded_by_id != user.id:
        raise ForbiddenError("You cannot delete this media item.")

    db.session.delete(media_item)
    db.session.commit()
    return success_response(message="Media item removed.")

@events_bp.route("/<int:event_id>/media/reorder", methods=["POST"])
@require_auth
@require_role("admin", "moderator", "club_coordinator")
def reorder_event_media(event_id: int):
    data = request.get_json(silent=True) or {}
    order_ids = data.get("media_ids", [])
    if not isinstance(order_ids, list):
        raise ValidationError("media_ids must be a list of integer IDs.")

    for index, m_id in enumerate(order_ids):
        EventMedia.query.filter_by(id=m_id, event_id=event_id).update({"display_order": index + 1})

    db.session.commit()
    return success_response(message="Media order updated.")

