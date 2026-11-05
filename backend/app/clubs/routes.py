from datetime import datetime, timezone
from flask import Blueprint, request, g
from app.extensions import db
from app.models.club import Club, ClubMember, ClubAnnouncement, slugify
from app.models.user import User
from app.common.decorators import require_auth, optional_auth, require_role
from app.common.errors import ValidationError, NotFoundError, ForbiddenError
from app.common.responses import success_response, created_response, no_content_response

clubs_bp = Blueprint("clubs", __name__, url_prefix="/api/v1/clubs")

# -----------------------------------------------------------------------------
# Club Discovery & Listing
# -----------------------------------------------------------------------------

@clubs_bp.route("", methods=["GET"])
@optional_auth
def list_clubs():
    category = request.args.get("category", "").strip()
    q = request.args.get("q", "").strip()
    user = getattr(g, "current_user", None)

    query = Club.query

    if category and category.lower() != "all":
        query = query.filter(Club.category == category)

    if q:
        query = query.filter(
            db.or_(
                Club.name.ilike(f"%{q}%"),
                Club.tagline.ilike(f"%{q}%"),
                Club.description_markdown.ilike(f"%{q}%"),
            )
        )

    clubs = query.order_by(Club.member_count.desc(), Club.name.asc()).all()
    return success_response(data=[c.to_dict(current_user=user) for c in clubs])

# -----------------------------------------------------------------------------
# Platform-Wide Announcements Feed
# -----------------------------------------------------------------------------

@clubs_bp.route("/announcements/feed", methods=["GET"])
def announcements_feed():
    announcements = (
        ClubAnnouncement.query.order_by(
            ClubAnnouncement.is_pinned.desc(),
            ClubAnnouncement.created_at.desc(),
        )
        .limit(20)
        .all()
    )
    return success_response(data=[a.to_dict() for a in announcements])

# -----------------------------------------------------------------------------
# Single Club Details
# -----------------------------------------------------------------------------

@clubs_bp.route("/<identifier>", methods=["GET"])
@optional_auth
def get_club(identifier):
    user = getattr(g, "current_user", None)
    club = None
    if identifier.isdigit():
        club = Club.query.get(int(identifier))
    if not club:
        club = Club.query.filter_by(slug=identifier).first()

    if not club:
        raise NotFoundError("Technical club not found.")

    return success_response(data=club.to_dict(current_user=user, include_details=True))

# -----------------------------------------------------------------------------
# Create Club
# -----------------------------------------------------------------------------

@clubs_bp.route("", methods=["POST"])
@require_auth
def create_club():
    user = g.current_user
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    tagline = data.get("tagline", "").strip()
    description_markdown = data.get("description_markdown", "").strip()
    category = data.get("category", "Open Source & Systems").strip()
    meeting_schedule = data.get("meeting_schedule", "").strip() or None
    logo_url = data.get("logo_url", "").strip() or None
    banner_url = data.get("banner_url", "").strip() or None

    if not name:
        raise ValidationError("Club name is required.")
    if not tagline:
        raise ValidationError("Club tagline is required.")
    if not description_markdown:
        raise ValidationError("Club description is required.")

    slug = slugify(name)
    if Club.query.filter_by(slug=slug).first():
        raise ValidationError(f"A club with name '{name}' already exists.")

    club = Club(
        name=name,
        slug=slug,
        tagline=tagline,
        description_markdown=description_markdown,
        category=category,
        lead_user_id=user.id,
        meeting_schedule=meeting_schedule,
        logo_url=logo_url,
        banner_url=banner_url,
        member_count=1,
    )
    db.session.add(club)
    db.session.flush()

    # Lead becomes first member with role LEAD
    lead_member = ClubMember(
        club_id=club.id,
        user_id=user.id,
        role="LEAD",
    )
    db.session.add(lead_member)
    db.session.commit()

    return created_response(data=club.to_dict(current_user=user, include_details=True), message="Club established successfully!")

# -----------------------------------------------------------------------------
# Join / Leave Club Toggle
# -----------------------------------------------------------------------------

@clubs_bp.route("/<int:club_id>/join", methods=["POST"])
@require_auth
def toggle_club_membership(club_id):
    user = g.current_user
    club = Club.query.get(club_id)
    if not club:
        raise NotFoundError("Club not found.")

    existing = ClubMember.query.filter_by(club_id=club.id, user_id=user.id).first()
    if existing:
        if existing.role == "LEAD":
            raise ValidationError("Club lead cannot leave the club without transferring leadership.")
        db.session.delete(existing)
        club.member_count = max(0, (club.member_count or 1) - 1)
        db.session.commit()
        return success_response(data={"user_is_member": False, "member_count": club.member_count}, message="Left club.")
    else:
        member = ClubMember(
            club_id=club.id,
            user_id=user.id,
            role="MEMBER",
        )
        db.session.add(member)
        club.member_count = (club.member_count or 0) + 1
        db.session.commit()
        return success_response(data={"user_is_member": True, "member_count": club.member_count}, message="Joined club successfully!")

# -----------------------------------------------------------------------------
# Post Club Announcement
# -----------------------------------------------------------------------------

@clubs_bp.route("/<int:club_id>/announcements", methods=["POST"])
@require_auth
def create_announcement(club_id):
    user = g.current_user
    club = Club.query.get(club_id)
    if not club:
        raise NotFoundError("Club not found.")

    # Permissions check
    mem = ClubMember.query.filter_by(club_id=club.id, user_id=user.id).first()
    is_officer = mem and mem.role in ("LEAD", "OFFICER")
    if not is_officer and user.role not in ("admin", "moderator"):
        raise ForbiddenError("Only club leads or officers can publish club announcements.")

    data = request.get_json(silent=True) or {}
    title = data.get("title", "").strip()
    content_markdown = data.get("content_markdown", "").strip()
    announcement_type = data.get("announcement_type", "GENERAL").upper().strip()
    is_pinned = bool(data.get("is_pinned", False))
    rsvp_link = data.get("rsvp_link", "").strip() or None

    if not title:
        raise ValidationError("Announcement title is required.")
    if not content_markdown:
        raise ValidationError("Announcement content is required.")

    announcement = ClubAnnouncement(
        club_id=club.id,
        author_id=user.id,
        title=title,
        content_markdown=content_markdown,
        announcement_type=announcement_type,
        is_pinned=is_pinned,
        rsvp_link=rsvp_link,
    )
    db.session.add(announcement)
    db.session.commit()

    return created_response(data=announcement.to_dict(), message="Club announcement broadcasted!")
