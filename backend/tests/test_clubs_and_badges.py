import pytest
from app.extensions import db
from app.models.club import Club, ClubMember, ClubAnnouncement
from app.models.project import Project, CodeReview
from app.common.badges import calculate_user_badges
from tests.conftest import auth_headers

def test_list_clubs_and_feed(client, app, test_user):
    with app.app_context():
        club = Club(
            name="Systems & Kernel Guild",
            slug="systems-and-kernel-guild",
            tagline="Low-level software and OS kernel internals.",
            description_markdown="# Kernel Guild",
            category="Open Source & Systems",
            lead_user_id=test_user.id,
            member_count=1,
        )
        db.session.add(club)
        db.session.flush()

        ann = ClubAnnouncement(
            club_id=club.id,
            author_id=test_user.id,
            title="VFS Walkthrough",
            content_markdown="Bring laptops with GCC.",
            announcement_type="WORKSHOP",
            is_pinned=True,
        )
        db.session.add(ann)
        db.session.commit()

    # List clubs
    resp = client.get("/api/v1/clubs")
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert any(c["slug"] == "systems-and-kernel-guild" for c in data)

    # Announcements feed
    resp_feed = client.get("/api/v1/clubs/announcements/feed")
    assert resp_feed.status_code == 200
    feed = resp_feed.get_json()["data"]
    assert any(a["title"] == "VFS Walkthrough" for a in feed)

def test_club_membership_toggle(client, app, test_user, test_admin):
    with app.app_context():
        club = Club(
            name="Robotics Society",
            slug="robotics-society",
            tagline="Embedded systems and autonomous bots.",
            description_markdown="# Robotics",
            category="Open Source & Systems",
            lead_user_id=test_admin.id,
            member_count=1,
        )
        db.session.add(club)
        db.session.flush()

        # Lead member
        db.session.add(ClubMember(club_id=club.id, user_id=test_admin.id, role="LEAD"))
        db.session.commit()
        club_id = club.id

    user_headers = auth_headers(test_user)

    # User joins club
    resp_join = client.post(f"/api/v1/clubs/{club_id}/join", headers=user_headers)
    assert resp_join.status_code == 200
    assert resp_join.get_json()["data"]["user_is_member"] is True
    assert resp_join.get_json()["data"]["member_count"] == 2

    # User leaves club
    resp_leave = client.post(f"/api/v1/clubs/{club_id}/join", headers=user_headers)
    assert resp_leave.status_code == 200
    assert resp_leave.get_json()["data"]["user_is_member"] is False
    assert resp_leave.get_json()["data"]["member_count"] == 1

def test_genuine_badges_calculation(app, test_user, test_admin):
    with app.app_context():
        # Initially user has no activities, badges should be empty
        badges_initial = calculate_user_badges(test_user.id)
        assert len(badges_initial) == 0

        # 1. Publish a showcase project
        proj = Project(
            user_id=test_user.id,
            title="Badge Test Project",
            slug="badge-test-project",
            tagline="Testing badges",
            description_markdown="# Badges",
            category="Web Development",
            status="PUBLISHED",
        )
        db.session.add(proj)
        db.session.flush()

        # 2. Submit a peer code review on admin's project
        admin_proj = Project(
            user_id=test_admin.id,
            title="Admin Project",
            slug="admin-project",
            tagline="Admin project",
            description_markdown="# Admin",
            category="Systems",
            status="PUBLISHED",
        )
        db.session.add(admin_proj)
        db.session.flush()

        review = CodeReview(
            project_id=admin_proj.id,
            reviewer_id=test_user.id,
            summary="Clean architecture and solid abstractions.",
            rating_overall=5,
            status="OPEN",
        )
        db.session.add(review)
        db.session.commit()

        # Calculate genuine badges
        badges_after = calculate_user_badges(test_user.id)
        badge_ids = [b["id"] for b in badges_after]

        assert "PROJECT_CREATOR" in badge_ids
        assert "CODE_INSPECTOR" in badge_ids
