from datetime import datetime, timezone
import re
from flask import Blueprint, request, g
from app.extensions import db
from app.models.project import (
    Project,
    ProjectMedia,
    ProjectTag,
    ProjectCollaborator,
    CodeReview,
    CodeReviewComment,
    ProjectUpvote,
    ReviewUpvote,
    project_tags_table,
    slugify,
)
from app.models.user import User
from app.models.notification import Notification
from app.common.decorators import require_auth, optional_auth, require_role
from app.common.errors import ValidationError, NotFoundError, ForbiddenError
from app.common.responses import success_response, created_response, no_content_response

projects_bp = Blueprint("projects", __name__, url_prefix="/api/v1/projects")

# -----------------------------------------------------------------------------
# Project Discovery & Listing
# -----------------------------------------------------------------------------

@projects_bp.route("", methods=["GET"])
@optional_auth
def list_projects():
    category = request.args.get("category", "").strip()
    tag_slug = request.args.get("tag", "").strip()
    author_username = request.args.get("author", "").strip()
    q = request.args.get("q", "").strip()
    sort_by = request.args.get("sort", "newest").lower()
    page = max(1, request.args.get("page", 1, type=int))
    per_page = min(50, max(1, request.args.get("per_page", 12, type=int)))

    user = getattr(g, "current_user", None)

    query = Project.query.filter(Project.status.in_(["PUBLISHED", "FEATURED"]))

    if category and category.lower() != "all":
        query = query.filter(Project.category == category)

    if tag_slug:
        query = query.join(project_tags_table).join(ProjectTag).filter(ProjectTag.slug == tag_slug)

    if author_username:
        author = User.query.filter_by(username=author_username).first()
        if author:
            query = query.filter(Project.user_id == author.id)
        else:
            return success_response(data=[], meta={"page": page, "per_page": per_page, "total": 0, "pages": 0})

    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            db.or_(
                Project.title.ilike(search_pattern),
                Project.tagline.ilike(search_pattern),
                Project.description_markdown.ilike(search_pattern),
            )
        )

    # Sorting
    if sort_by == "upvoted":
        query = query.order_by(Project.upvote_count.desc(), Project.created_at.desc())
    elif sort_by == "reviewed":
        query = query.outerjoin(CodeReview).group_by(Project.id).order_by(db.func.count(CodeReview.id).desc(), Project.created_at.desc())
    elif sort_by == "popular":
        query = query.order_by(Project.view_count.desc(), Project.upvote_count.desc())
    else:
        query = query.order_by(Project.created_at.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return success_response(
        data=[p.to_dict(current_user=user) for p in pagination.items],
        meta={
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages,
        },
    )

# -----------------------------------------------------------------------------
# Single Project Details
# -----------------------------------------------------------------------------

@projects_bp.route("/<identifier>", methods=["GET"])
@optional_auth
def get_project(identifier):
    user = getattr(g, "current_user", None)
    project = None

    if identifier.isdigit():
        project = Project.query.get(int(identifier))
    if not project:
        project = Project.query.filter_by(slug=identifier).first()

    if not project:
        raise NotFoundError("Project not found.")

    # Increment view count
    project.view_count = (project.view_count or 0) + 1
    db.session.commit()

    return success_response(data=project.to_dict(current_user=user, include_details=True))

# -----------------------------------------------------------------------------
# Create Project
# -----------------------------------------------------------------------------

@projects_bp.route("", methods=["POST"])
@require_auth
def create_project():
    user = g.current_user
    data = request.get_json(silent=True) or {}

    title = data.get("title", "").strip()
    tagline = data.get("tagline", "").strip()
    description_markdown = data.get("description_markdown", "").strip()
    category = data.get("category", "Web Development").strip()
    cover_image_url = data.get("cover_image_url", "").strip() or None
    github_url = data.get("github_url", "").strip() or None
    live_demo_url = data.get("live_demo_url", "").strip() or None
    tags_list = data.get("tags", [])
    collaborators_list = data.get("collaborators", [])
    media_list = data.get("media", [])

    if not title:
        raise ValidationError("Project title is required.")
    if not tagline:
        raise ValidationError("Tagline is required.")
    if not description_markdown:
        raise ValidationError("Project description is required.")

    # Generate unique slug
    base_slug = slugify(title)
    if not base_slug:
        base_slug = f"project-{int(datetime.now(timezone.utc).timestamp())}"
    slug = base_slug
    counter = 1
    while Project.query.filter_by(slug=slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    project = Project(
        user_id=user.id,
        title=title,
        slug=slug,
        tagline=tagline,
        description_markdown=description_markdown,
        category=category,
        cover_image_url=cover_image_url,
        github_url=github_url,
        live_demo_url=live_demo_url,
        status="PUBLISHED",
    )
    db.session.add(project)
    db.session.flush()

    # Process tags
    for tag_name in tags_list:
        tag_str = str(tag_name).strip()
        if not tag_str:
            continue
        tslug = slugify(tag_str)
        tag_obj = ProjectTag.query.filter_by(slug=tslug).first()
        if not tag_obj:
            tag_obj = ProjectTag(name=tag_str, slug=tslug)
            db.session.add(tag_obj)
            db.session.flush()
        if tag_obj not in project.tags:
            project.tags.append(tag_obj)

    # Process collaborators
    for collab in collaborators_list:
        c_username = collab.get("username", "").strip() if isinstance(collab, dict) else str(collab).strip()
        c_role = collab.get("role_description", "Collaborator") if isinstance(collab, dict) else "Collaborator"
        if c_username:
            target_user = User.query.filter_by(username=c_username).first()
            if target_user and target_user.id != user.id:
                collab_obj = ProjectCollaborator(
                    project_id=project.id,
                    user_id=target_user.id,
                    role_description=c_role,
                )
                db.session.add(collab_obj)

    # Process screenshots / media
    for idx, m in enumerate(media_list):
        m_url = m.get("media_url", "").strip() if isinstance(m, dict) else str(m).strip()
        m_caption = m.get("caption", "").strip() if isinstance(m, dict) else None
        if m_url:
            media_obj = ProjectMedia(
                project_id=project.id,
                media_url=m_url,
                caption=m_caption,
                display_order=idx,
            )
            db.session.add(media_obj)

    # Award points for project showcase
    if user.profile:
        user.profile.points = (user.profile.points or 0) + 25

    db.session.commit()
    return created_response(
        data=project.to_dict(current_user=user, include_details=True),
        message="Project published to Scriptorium Showcase!"
    )

# -----------------------------------------------------------------------------
# Update Project
# -----------------------------------------------------------------------------

@projects_bp.route("/<int:project_id>", methods=["PUT"])
@require_auth
def update_project(project_id):
    user = g.current_user
    project = Project.query.get(project_id)
    if not project:
        raise NotFoundError("Project not found.")

    if project.user_id != user.id and not (user.role in ("admin", "moderator")):
        raise ForbiddenError("You can only edit your own projects.")

    data = request.get_json(silent=True) or {}

    if "title" in data and data["title"].strip():
        project.title = data["title"].strip()
    if "tagline" in data:
        project.tagline = data["tagline"].strip()
    if "description_markdown" in data:
        project.description_markdown = data["description_markdown"].strip()
    if "category" in data:
        project.category = data["category"].strip()
    if "cover_image_url" in data:
        project.cover_image_url = data["cover_image_url"].strip() or None
    if "github_url" in data:
        project.github_url = data["github_url"].strip() or None
    if "live_demo_url" in data:
        project.live_demo_url = data["live_demo_url"].strip() or None

    # Update tags if provided
    if "tags" in data and isinstance(data["tags"], list):
        project.tags = []
        for tag_name in data["tags"]:
            tag_str = str(tag_name).strip()
            if not tag_str:
                continue
            tslug = slugify(tag_str)
            tag_obj = ProjectTag.query.filter_by(slug=tslug).first()
            if not tag_obj:
                tag_obj = ProjectTag(name=tag_str, slug=tslug)
                db.session.add(tag_obj)
                db.session.flush()
            project.tags.append(tag_obj)

    db.session.commit()
    return success_response(
        data=project.to_dict(current_user=user, include_details=True),
        message="Project updated successfully."
    )

# -----------------------------------------------------------------------------
# Delete Project
# -----------------------------------------------------------------------------

@projects_bp.route("/<int:project_id>", methods=["DELETE"])
@require_auth
def delete_project(project_id):
    user = g.current_user
    project = Project.query.get(project_id)
    if not project:
        raise NotFoundError("Project not found.")

    if project.user_id != user.id and user.role != "admin":
        raise ForbiddenError("You can only delete your own projects.")

    db.session.delete(project)
    db.session.commit()
    return no_content_response()

# -----------------------------------------------------------------------------
# Project Upvote
# -----------------------------------------------------------------------------

@projects_bp.route("/<int:project_id>/upvote", methods=["POST"])
@require_auth
def toggle_project_upvote(project_id):
    user = g.current_user
    project = Project.query.get(project_id)
    if not project:
        raise NotFoundError("Project not found.")

    existing = ProjectUpvote.query.filter_by(project_id=project.id, user_id=user.id).first()
    if existing:
        db.session.delete(existing)
        project.upvote_count = max(0, (project.upvote_count or 1) - 1)
        db.session.commit()
        return success_response(data={"upvote_count": project.upvote_count, "user_has_upvoted": False})
    else:
        new_upvote = ProjectUpvote(project_id=project.id, user_id=user.id)
        db.session.add(new_upvote)
        project.upvote_count = (project.upvote_count or 0) + 1

        # Notify project author
        if project.user_id != user.id:
            db.session.add(
                Notification(
                    user_id=project.user_id,
                    actor_id=user.id,
                    event_type="UPVOTE_RECEIVED",
                    title="New Project Upvote",
                    message=f"@{user.username} upvoted your project '{project.title}'!",
                    link_url=f"/projects/{project.slug or project.id}",
                )
            )

        db.session.commit()
        return success_response(data={"upvote_count": project.upvote_count, "user_has_upvoted": True})

# -----------------------------------------------------------------------------
# Project Media Upload / Management
# -----------------------------------------------------------------------------

@projects_bp.route("/<int:project_id>/media", methods=["POST"])
@require_auth
def add_project_media(project_id):
    user = g.current_user
    project = Project.query.get(project_id)
    if not project:
        raise NotFoundError("Project not found.")

    if project.user_id != user.id and not (user.role in ("admin", "moderator")):
        raise ForbiddenError("Only project authors can add screenshots.")

    data = request.get_json(silent=True) or {}
    media_url = data.get("media_url", "").strip()
    caption = data.get("caption", "").strip() or None
    display_order = data.get("display_order", len(project.media))

    if not media_url:
        raise ValidationError("Media URL is required.")

    media = ProjectMedia(
        project_id=project.id,
        media_url=media_url,
        caption=caption,
        display_order=display_order,
    )
    db.session.add(media)
    db.session.commit()
    return created_response(data=media.to_dict(), message="Screenshot added to project gallery.")

# -----------------------------------------------------------------------------
# Structured Code Review & Feedback System
# -----------------------------------------------------------------------------

@projects_bp.route("/<int:project_id>/reviews", methods=["POST"])
@require_auth
def submit_code_review(project_id):
    user = g.current_user
    project = Project.query.get(project_id)
    if not project:
        raise NotFoundError("Project not found.")

    if project.user_id == user.id:
        raise ValidationError("You cannot submit a code review on your own project.")

    data = request.get_json(silent=True) or {}
    summary = data.get("summary", "").strip()
    architecture_feedback = data.get("architecture_feedback", "").strip() or None
    performance_feedback = data.get("performance_feedback", "").strip() or None
    security_feedback = data.get("security_feedback", "").strip() or None
    ui_ux_feedback = data.get("ui_ux_feedback", "").strip() or None
    rating_overall = data.get("rating_overall", 5)

    if not summary:
        raise ValidationError("A summary of your code review is required.")

    try:
        rating_overall = max(1, min(5, int(rating_overall)))
    except (TypeError, ValueError):
        rating_overall = 5

    review = CodeReview(
        project_id=project.id,
        reviewer_id=user.id,
        summary=summary,
        architecture_feedback=architecture_feedback,
        performance_feedback=performance_feedback,
        security_feedback=security_feedback,
        ui_ux_feedback=ui_ux_feedback,
        rating_overall=rating_overall,
        status="OPEN",
    )
    db.session.add(review)

    # Award points to reviewer for thorough review
    if user.profile:
        user.profile.points = (user.profile.points or 0) + 15

    # Notify author
    db.session.add(
        Notification(
            user_id=project.user_id,
            actor_id=user.id,
            event_type="CODE_REVIEW",
            title="New Peer Code Review",
            message=f"@{user.username} reviewed '{project.title}': {summary[:60]}...",
            link_url=f"/projects/{project.slug or project.id}",
        )
    )

    db.session.commit()
    return created_response(
        data=review.to_dict(current_user=user),
        message="Code review submitted successfully!"
    )

@projects_bp.route("/<int:project_id>/reviews/<int:review_id>/status", methods=["PATCH"])
@require_auth
def update_review_status(project_id, review_id):
    user = g.current_user
    project = Project.query.get(project_id)
    if not project:
        raise NotFoundError("Project not found.")

    review = CodeReview.query.get(review_id)
    if not review or review.project_id != project.id:
        raise NotFoundError("Code review not found.")

    # Project author, reviewer, or admin can update status
    if user.id not in (project.user_id, review.reviewer_id) and user.role not in ("admin", "moderator"):
        raise ForbiddenError("Only the project author or reviewer can update feedback status.")

    data = request.get_json(silent=True) or {}
    new_status = data.get("status", "").upper().strip()
    if new_status not in ("OPEN", "ADDRESSED", "RESOLVED"):
        raise ValidationError("Invalid review status. Must be OPEN, ADDRESSED, or RESOLVED.")

    review.status = new_status
    db.session.commit()
    return success_response(data=review.to_dict(current_user=user), message=f"Review marked as {new_status}.")

@projects_bp.route("/<int:project_id>/reviews/<int:review_id>/upvote", methods=["POST"])
@require_auth
def upvote_review(project_id, review_id):
    user = g.current_user
    review = CodeReview.query.get(review_id)
    if not review or review.project_id != project_id:
        raise NotFoundError("Code review not found.")

    existing = ReviewUpvote.query.filter_by(review_id=review.id, user_id=user.id).first()
    if existing:
        db.session.delete(existing)
        review.upvote_count = max(0, (review.upvote_count or 1) - 1)
        db.session.commit()
        return success_response(data={"upvote_count": review.upvote_count, "user_has_upvoted": False})
    else:
        new_upvote = ReviewUpvote(review_id=review.id, user_id=user.id)
        db.session.add(new_upvote)
        review.upvote_count = (review.upvote_count or 0) + 1
        db.session.commit()
        return success_response(data={"upvote_count": review.upvote_count, "user_has_upvoted": True})

@projects_bp.route("/<int:project_id>/reviews/<int:review_id>/comments", methods=["POST"])
@require_auth
def add_review_comment(project_id, review_id):
    user = g.current_user
    review = CodeReview.query.get(review_id)
    if not review or review.project_id != project_id:
        raise NotFoundError("Code review not found.")

    data = request.get_json(silent=True) or {}
    content = data.get("content", "").strip()
    code_snippet = data.get("code_snippet", "").strip() or None

    if not content:
        raise ValidationError("Comment content is required.")

    comment = CodeReviewComment(
        review_id=review.id,
        user_id=user.id,
        content=content,
        code_snippet=code_snippet,
    )
    db.session.add(comment)
    db.session.commit()
    return created_response(data=comment.to_dict(), message="Comment added to review discussion.")
