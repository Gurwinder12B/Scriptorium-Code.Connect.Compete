import re
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, g
from app.extensions import db
from app.models.blog import BlogPost, BlogCategory, BlogTag, BlogComment, BlogLike, blog_post_tags
from app.models.user import User
from app.models.audit import AuditLog, Bookmark
from app.common.decorators import require_auth, optional_auth, require_role
from app.common.responses import success_response, created_response, error_response
from app.common.errors import ValidationError, NotFoundError, ForbiddenError

blogs_bp = Blueprint("blogs", __name__, url_prefix="/api/v1/blogs")

def slugify(text: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "-", slug)

# -----------------------------------------------------------------------------
# Categories
# -----------------------------------------------------------------------------

@blogs_bp.route("/categories", methods=["GET"])
def list_categories():
    categories = BlogCategory.query.filter_by(is_active=True).order_by(BlogCategory.display_order.asc(), BlogCategory.name.asc()).all()
    return success_response(data=[c.to_dict() for c in categories])

@blogs_bp.route("/categories", methods=["POST"])
@require_auth
@require_role("admin", "moderator", "editor")
def create_category():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    description = data.get("description", "").strip()

    if not name:
        raise ValidationError("Category name is required.")

    slug = slugify(name)
    if BlogCategory.query.filter_by(slug=slug).first():
        raise ValidationError(f"Category '{name}' already exists.")

    cat = BlogCategory(
        name=name,
        slug=slug,
        description=description or None,
    )
    db.session.add(cat)
    db.session.commit()
    return created_response(data=cat.to_dict(), message="Blog category created.")

# -----------------------------------------------------------------------------
# Editorial Calendar & Cadence Management
# -----------------------------------------------------------------------------

@blogs_bp.route("/editorial/calendar", methods=["GET"])
@require_auth
@require_role("admin", "moderator", "editor")
def get_editorial_calendar():
    """
    Returns scheduled and recently published articles, plus automated gap analysis:
    Flags whenever there is a 3+ day gap without any scheduled article.
    """
    now = datetime.now(timezone.utc)
    lookback = now - timedelta(days=14)
    lookahead = now + timedelta(days=30)

    # Fetch articles in date range
    articles = (
        BlogPost.query.filter(
            db.or_(
                BlogPost.status == "PENDING_REVIEW",
                db.and_(BlogPost.status == "PUBLISHED", BlogPost.published_at >= lookback),
                db.and_(BlogPost.scheduled_at.isnot(None), BlogPost.scheduled_at >= lookback, BlogPost.scheduled_at <= lookahead),
            )
        )
        .order_by(BlogPost.scheduled_at.asc(), BlogPost.published_at.desc())
        .all()
    )

    # Check for publishing gaps (target: 1 article every 2-3 days)
    upcoming_dates = sorted(
        [p.scheduled_at for p in articles if p.scheduled_at and p.scheduled_at >= now]
    )

    gaps = []
    current_check = now
    if not upcoming_dates:
        gaps.append({
            "start_date": now.isoformat(),
            "gap_days": 7,
            "message": "No articles scheduled for publication in the next 7 days. Remind editorial team!",
        })
    else:
        first_diff = (upcoming_dates[0] - now).days
        if first_diff > 3:
            gaps.append({
                "start_date": now.isoformat(),
                "end_date": upcoming_dates[0].isoformat(),
                "gap_days": first_diff,
                "message": f"Editorial gap of {first_diff} days before the next scheduled post.",
            })

        for i in range(len(upcoming_dates) - 1):
            diff = (upcoming_dates[i + 1] - upcoming_dates[i]).days
            if diff > 3:
                gaps.append({
                    "start_date": upcoming_dates[i].isoformat(),
                    "end_date": upcoming_dates[i + 1].isoformat(),
                    "gap_days": diff,
                    "message": f"Editorial gap of {diff} days between scheduled articles.",
                })

    pending_review_count = BlogPost.query.filter_by(status="PENDING_REVIEW").count()

    return success_response(
        data={
            "articles": [p.to_dict() for p in articles],
            "gaps": gaps,
            "target_cadence": "1 article every 2-3 days",
            "pending_review_count": pending_review_count,
        }
    )

# -----------------------------------------------------------------------------
# Blog Listing & Discovery
# -----------------------------------------------------------------------------

@blogs_bp.route("", methods=["GET"])
@optional_auth
def list_blogs():
    category_slug = request.args.get("category", "").strip()
    tag_slug = request.args.get("tag", "").strip()
    author_username = request.args.get("author", "").strip()
    q = request.args.get("q", "").strip()
    sort_by = request.args.get("sort", "newest").lower()
    is_featured = request.args.get("featured", "").lower() == "true"
    is_editors_pick = request.args.get("editors_pick", "").lower() == "true"
    status_filter = request.args.get("status", "").upper()
    page = max(1, request.args.get("page", 1, type=int))
    per_page = min(50, max(1, request.args.get("per_page", 12, type=int)))

    user = getattr(g, "current_user", None)
    is_editor = user and user.role in ("admin", "moderator", "editor")

    query = BlogPost.query

    # Access control on statuses
    if status_filter:
        if status_filter in ("DRAFT", "PENDING_REVIEW", "REJECTED", "ARCHIVED"):
            if not is_editor:
                # Authors only see their own non-published drafts
                if not user:
                    raise ForbiddenError("Authentication required to view unpublished drafts.")
                query = query.filter_by(author_id=user.id, status=status_filter)
            else:
                query = query.filter_by(status=status_filter)
        else:
            query = query.filter_by(status="PUBLISHED")
    else:
        # Default: public feed shows only PUBLISHED articles
        query = query.filter_by(status="PUBLISHED")

    if category_slug:
        cat = BlogCategory.query.filter_by(slug=category_slug).first()
        if cat:
            query = query.filter_by(category_id=cat.id)

    if tag_slug:
        query = query.join(blog_post_tags).join(BlogTag).filter(BlogTag.slug == tag_slug)

    if author_username:
        author = User.query.filter_by(username=author_username).first()
        if author:
            query = query.filter_by(author_id=author.id)

    if is_featured:
        query = query.filter_by(is_featured=True)
    if is_editors_pick:
        query = query.filter_by(is_editors_pick=True)

    if q:
        query = query.filter(
            db.or_(
                BlogPost.title.ilike(f"%{q}%"),
                BlogPost.excerpt.ilike(f"%{q}%"),
                BlogPost.content_markdown.ilike(f"%{q}%"),
            )
        )

    # Sorting
    if sort_by == "popular":
        query = query.order_by(BlogPost.view_count.desc(), BlogPost.like_count.desc())
    elif sort_by == "discussed":
        query = query.order_by(BlogPost.comment_count.desc())
    else:
        query = query.order_by(BlogPost.published_at.desc(), BlogPost.created_at.desc())

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
# Single Article Detail
# -----------------------------------------------------------------------------

@blogs_bp.route("/<identifier>", methods=["GET"])
@optional_auth
def get_blog(identifier: str):
    if identifier.isdigit():
        post = BlogPost.query.get(int(identifier))
    else:
        post = BlogPost.query.filter_by(slug=identifier).first()

    if not post:
        raise NotFoundError("Blog article not found.")

    user = getattr(g, "current_user", None)
    is_author_or_editor = user and (user.id == post.author_id or user.role in ("admin", "moderator", "editor"))

    if post.status != "PUBLISHED" and not is_author_or_editor:
        raise NotFoundError("This article has not been published yet.")

    # Increment view count
    post.view_count += 1
    db.session.commit()

    # Related articles in same category
    related = []
    if post.category_id:
        related = (
            BlogPost.query.filter(
                BlogPost.category_id == post.category_id,
                BlogPost.id != post.id,
                BlogPost.status == "PUBLISHED",
            )
            .order_by(BlogPost.published_at.desc())
            .limit(3)
            .all()
        )

    post_data = post.to_dict(include_content=True, current_user=user)
    post_data["related_posts"] = [r.to_dict() for r in related]

    # Check if bookmarked
    if user:
        bookmark = Bookmark.query.filter_by(user_id=user.id, target_type="blog", target_id=post.id).first()
        post_data["user_has_bookmarked"] = bookmark is not None
    else:
        post_data["user_has_bookmarked"] = False

    return success_response(data=post_data)

# -----------------------------------------------------------------------------
# Blog Creation & Modification
# -----------------------------------------------------------------------------

@blogs_bp.route("", methods=["POST"])
@require_auth
def create_blog():
    data = request.get_json(silent=True) or {}
    title = data.get("title", "").strip()
    excerpt = data.get("excerpt", "").strip()
    content_markdown = data.get("content_markdown", "").strip()
    category_id = data.get("category_id")
    tags_list = data.get("tags", [])
    cover_image_url = data.get("cover_image_url", "").strip()
    requested_status = data.get("status", "DRAFT").upper()

    if len(title) < 5:
        raise ValidationError("Article title must be at least 5 characters.")
    if len(content_markdown) < 20:
        raise ValidationError("Article content must be at least 20 characters.")

    # If excerpt not provided, generate from first 200 characters of content
    if not excerpt:
        cleaned_text = re.sub(r"[#*_`\[\]]", "", content_markdown)
        excerpt = cleaned_text[:200].strip() + "..."

    # Determine status
    user = g.current_user
    status = "DRAFT"
    published_at = None

    if requested_status == "PENDING_REVIEW":
        status = "PENDING_REVIEW"
    elif requested_status == "PUBLISHED":
        # Direct publish if admin/editor, else set to PENDING_REVIEW
        if user.role in ("admin", "moderator", "editor"):
            status = "PUBLISHED"
            published_at = datetime.now(timezone.utc)
        else:
            status = "PENDING_REVIEW"

    # Generate slug
    base_slug = slugify(title)
    slug = base_slug
    counter = 1
    while BlogPost.query.filter_by(slug=slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    post = BlogPost(
        author_id=user.id,
        category_id=category_id if category_id else None,
        title=title,
        slug=slug,
        excerpt=excerpt,
        content_markdown=content_markdown,
        cover_image_url=cover_image_url or None,
        status=status,
        published_at=published_at,
    )
    post.calculate_reading_time()

    # Handle tags
    if isinstance(tags_list, list):
        for tag_str in tags_list[:5]:
            tag_name = tag_str.strip().lower()
            if not tag_name:
                continue
            tag_slug = slugify(tag_name)
            tag_obj = BlogTag.query.filter_by(slug=tag_slug).first()
            if not tag_obj:
                tag_obj = BlogTag(name=tag_name, slug=tag_slug, usage_count=1)
                db.session.add(tag_obj)
            else:
                tag_obj.usage_count = (tag_obj.usage_count or 0) + 1
            post.tags.append(tag_obj)

    db.session.add(post)
    db.session.commit()

    return created_response(
        data=post.to_dict(include_content=True, current_user=user),
        message="Article created successfully.",
    )

@blogs_bp.route("/<int:post_id>", methods=["PUT"])
@require_auth
def update_blog(post_id: int):
    post = BlogPost.query.get(post_id)
    if not post:
        raise NotFoundError("Article not found.")

    user = g.current_user
    if post.author_id != user.id and user.role not in ("admin", "moderator", "editor"):
        raise ForbiddenError("You can only edit your own articles.")

    data = request.get_json(silent=True) or {}
    if "title" in data:
        post.title = data["title"].strip()
    if "excerpt" in data:
        post.excerpt = data["excerpt"].strip()
    if "content_markdown" in data:
        post.content_markdown = data["content_markdown"].strip()
        post.calculate_reading_time()
    if "category_id" in data:
        post.category_id = data["category_id"] or None
    if "cover_image_url" in data:
        post.cover_image_url = data["cover_image_url"].strip() or None
    if "status" in data:
        new_status = data["status"].upper()
        if new_status in ("DRAFT", "PENDING_REVIEW"):
            post.status = new_status
        elif new_status == "PUBLISHED" and user.role in ("admin", "moderator", "editor"):
            post.status = "PUBLISHED"
            if not post.published_at:
                post.published_at = datetime.now(timezone.utc)

    db.session.commit()
    return success_response(
        data=post.to_dict(include_content=True, current_user=user),
        message="Article updated successfully.",
    )

@blogs_bp.route("/<int:post_id>/moderate", methods=["POST"])
@require_auth
@require_role("admin", "moderator", "editor")
def moderate_blog(post_id: int):
    post = BlogPost.query.get(post_id)
    if not post:
        raise NotFoundError("Article not found.")

    data = request.get_json(silent=True) or {}
    action = data.get("action", "").upper()  # APPROVE, REJECT, FEATURE, SCHEDULE, ARCHIVE
    reason = data.get("reason", "").strip()

    if action == "APPROVE":
        post.status = "PUBLISHED"
        if not post.published_at:
            post.published_at = datetime.now(timezone.utc)
        post.rejection_reason = None
    elif action == "REJECT":
        post.status = "REJECTED"
        post.rejection_reason = reason or "Article needs revision."
    elif action == "FEATURE":
        post.is_featured = not post.is_featured
    elif action == "EDITORS_PICK":
        post.is_editors_pick = not post.is_editors_pick
    elif action == "ARCHIVE":
        post.status = "ARCHIVED"
    elif action == "SCHEDULE":
        sched_str = data.get("scheduled_at")
        if not sched_str:
            raise ValidationError("scheduled_at date is required.")
        post.scheduled_at = datetime.fromisoformat(sched_str.replace("Z", "+00:00"))
        post.status = "PENDING_REVIEW"
    else:
        raise ValidationError(f"Unknown moderation action: {action}")

    db.session.commit()
    return success_response(
        data=post.to_dict(include_content=True, current_user=g.current_user),
        message=f"Article updated with action: {action}",
    )

@blogs_bp.route("/<int:post_id>/like", methods=["POST"])
@require_auth
def toggle_like_blog(post_id: int):
    post = BlogPost.query.get(post_id)
    if not post:
        raise NotFoundError("Article not found.")

    user = g.current_user
    existing_like = BlogLike.query.filter_by(post_id=post.id, user_id=user.id).first()

    if existing_like:
        db.session.delete(existing_like)
        post.like_count = max(0, (post.like_count or 1) - 1)
        has_liked = False
    else:
        like = BlogLike(post_id=post.id, user_id=user.id)
        db.session.add(like)
        post.like_count = (post.like_count or 0) + 1
        has_liked = True

    db.session.commit()
    return success_response(
        data={"like_count": post.like_count, "user_has_liked": has_liked},
        message="Like updated.",
    )

@blogs_bp.route("/<int:post_id>/bookmark", methods=["POST"])
@require_auth
def toggle_bookmark_blog(post_id: int):
    post = BlogPost.query.get(post_id)
    if not post:
        raise NotFoundError("Article not found.")

    user = g.current_user
    existing = Bookmark.query.filter_by(user_id=user.id, target_type="blog", target_id=post.id).first()

    if existing:
        db.session.delete(existing)
        is_bookmarked = False
    else:
        bm = Bookmark(user_id=user.id, target_type="blog", target_id=post.id)
        db.session.add(bm)
        is_bookmarked = True

    db.session.commit()
    return success_response(
        data={"user_has_bookmarked": is_bookmarked},
        message="Bookmark updated.",
    )

@blogs_bp.route("/<int:post_id>/comments", methods=["POST"])
@require_auth
def add_blog_comment(post_id: int):
    post = BlogPost.query.get(post_id)
    if not post:
        raise NotFoundError("Article not found.")

    data = request.get_json(silent=True) or {}
    content = data.get("content", "").strip()
    parent_id = data.get("parent_id")

    if not content:
        raise ValidationError("Comment content cannot be empty.")

    comment = BlogComment(
        post_id=post.id,
        author_id=g.current_user.id,
        parent_id=parent_id if parent_id else None,
        content=content,
    )
    db.session.add(comment)
    post.comment_count = (post.comment_count or 0) + 1
    db.session.commit()

    return created_response(
        data=comment.to_dict(),
        message="Comment added successfully.",
    )

@blogs_bp.route("/<int:post_id>", methods=["DELETE"])
@require_auth
def delete_blog(post_id: int):
    post = BlogPost.query.get(post_id)
    if not post:
        raise NotFoundError("Article not found.")

    user = g.current_user
    if post.author_id != user.id and user.role not in ("admin", "moderator"):
        raise ForbiddenError("You cannot delete this article.")

    db.session.delete(post)
    db.session.commit()
    return success_response(message="Article deleted successfully.")
