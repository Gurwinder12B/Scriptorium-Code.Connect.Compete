import pytest
from datetime import datetime, timezone, timedelta
from app.extensions import db
from app.models.blog import BlogCategory, BlogPost, BlogComment, BlogLike
from tests.conftest import auth_headers

def test_list_blogs_and_categories(client, app, test_user):
    with app.app_context():
        cat = BlogCategory(name="Python Engineering", slug="python-engineering")
        db.session.add(cat)
        db.session.flush()

        post = BlogPost(
            author_id=test_user.id,
            category_id=cat.id,
            title="Understanding AsyncIO in Modern Python",
            slug="understanding-asyncio-in-modern-python",
            excerpt="A deep dive into event loops and coroutines.",
            content_markdown="# AsyncIO\nCoroutines allow concurrent I/O operations.",
            status="PUBLISHED",
            published_at=datetime.now(timezone.utc),
        )
        db.session.add(post)
        db.session.commit()

    # Get categories
    res_cat = client.get("/api/v1/blogs/categories")
    assert res_cat.status_code == 200
    categories = res_cat.get_json()["data"]
    assert any(c["slug"] == "python-engineering" for c in categories)

    # Get blogs feed
    res_blogs = client.get("/api/v1/blogs")
    assert res_blogs.status_code == 200
    blogs = res_blogs.get_json()["data"]
    assert len(blogs) >= 1
    assert blogs[0]["slug"] == "understanding-asyncio-in-modern-python"

def test_create_blog_draft_and_reading_time(client, app, test_user):
    headers = auth_headers(test_user)
    payload = {
        "title": "Mastering Binary Search with 500 Words",
        "excerpt": "A short guide to binary search.",
        "content_markdown": " ".join(["word"] * 450),  # ~450 words should give 3 min reading time
        "status": "DRAFT",
    }
    resp = client.post("/api/v1/blogs", json=payload, headers=headers)
    assert resp.status_code == 201
    data = resp.get_json()["data"]
    assert data["title"] == "Mastering Binary Search with 500 Words"
    assert data["status"] == "DRAFT"
    assert data["reading_time_minutes"] >= 2

def test_blog_like_and_comment(client, app, test_user, test_admin):
    post_id = None
    with app.app_context():
        post = BlogPost(
            author_id=test_user.id,
            title="Clean Code Architecture Patterns",
            slug="clean-code-architecture-patterns",
            excerpt="Writing maintainable software systems.",
            content_markdown="Maintain high cohesion and loose coupling.",
            status="PUBLISHED",
            published_at=datetime.now(timezone.utc),
        )
        db.session.add(post)
        db.session.commit()
        post_id = post.id

    headers_admin = auth_headers(test_admin)

    # Like the post
    resp_like = client.post(f"/api/v1/blogs/{post_id}/like", headers=headers_admin)
    assert resp_like.status_code == 200
    assert resp_like.get_json()["data"]["like_count"] == 1
    assert resp_like.get_json()["data"]["user_has_liked"] is True

    # Unlike the post
    resp_unlike = client.post(f"/api/v1/blogs/{post_id}/like", headers=headers_admin)
    assert resp_unlike.status_code == 200
    assert resp_unlike.get_json()["data"]["like_count"] == 0
    assert resp_unlike.get_json()["data"]["user_has_liked"] is False

    # Add comment
    resp_comment = client.post(
        f"/api/v1/blogs/{post_id}/comments",
        json={"content": "Inspiring article! Clean boundaries make unit testing so much easier."},
        headers=headers_admin,
    )
    assert resp_comment.status_code == 201
    assert resp_comment.get_json()["data"]["content"] == "Inspiring article! Clean boundaries make unit testing so much easier."

def test_editorial_calendar_and_moderation(client, app, test_user, test_admin):
    headers_admin = auth_headers(test_admin)

    post_id = None
    with app.app_context():
        post = BlogPost(
            author_id=test_user.id,
            title="Upcoming Article for Review",
            slug="upcoming-article-for-review",
            excerpt="Draft submitted for review.",
            content_markdown="Content under review.",
            status="PENDING_REVIEW",
        )
        db.session.add(post)
        db.session.commit()
        post_id = post.id

    # Editorial calendar should show pending review
    res_cal = client.get("/api/v1/blogs/editorial/calendar", headers=headers_admin)
    assert res_cal.status_code == 200
    cal_data = res_cal.get_json()["data"]
    assert cal_data["pending_review_count"] >= 1
    assert "gaps" in cal_data

    # Approve article
    res_mod = client.post(
        f"/api/v1/blogs/{post_id}/moderate",
        json={"action": "APPROVE"},
        headers=headers_admin,
    )
    assert res_mod.status_code == 200
    assert res_mod.get_json()["data"]["status"] == "PUBLISHED"
