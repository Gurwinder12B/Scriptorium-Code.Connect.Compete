import pytest
from datetime import datetime, timezone
from app.extensions import db
from app.models.event import Event, EventAlbum, EventMedia
from tests.conftest import auth_headers

def test_events_list_and_public_access(client, app, test_admin):
    with app.app_context():
        ev = Event(
            title="AI Innovation Summit 2026",
            slug="ai-innovation-summit-2026",
            description="Exploring next-generation artificial intelligence systems.",
            category="Seminars",
            event_date=datetime(2026, 6, 15, 10, 0, 0, tzinfo=timezone.utc),
            location="Main Hall",
            organizing_club="AI Club",
            is_published=True,
            created_by_id=test_admin.id,
        )
        db.session.add(ev)
        db.session.commit()

    resp = client.get("/api/v1/events")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert len(data["data"]) >= 1
    assert data["data"][0]["title"] == "AI Innovation Summit 2026"
    assert "Seminars" in data["meta"]["categories"]

def test_event_filtering_by_category_and_query(client, app, test_admin):
    with app.app_context():
        ev1 = Event(
            title="University Hackathon",
            slug="university-hackathon",
            description="Intense 24h coding sprint.",
            category="Hackathons",
            event_date=datetime(2026, 7, 1, 9, 0, 0, tzinfo=timezone.utc),
            location="Room 101",
            organizing_club="ACM Club",
            is_published=True,
            created_by_id=test_admin.id,
        )
        ev2 = Event(
            title="Competitive Coding Contest",
            slug="competitive-coding-contest",
            description="Algorithms competition.",
            category="Competitions",
            event_date=datetime(2026, 8, 1, 9, 0, 0, tzinfo=timezone.utc),
            location="Lab 2",
            organizing_club="ACM Club",
            is_published=True,
            created_by_id=test_admin.id,
        )
        db.session.add_all([ev1, ev2])
        db.session.commit()

    # Filter by category
    resp = client.get("/api/v1/events?category=Hackathons")
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data["data"]) == 1
    assert data["data"][0]["slug"] == "university-hackathon"

    # Filter by search query
    resp2 = client.get("/api/v1/events?q=Algorithms")
    assert resp2.status_code == 200
    data2 = resp2.get_json()
    assert len(data2["data"]) == 1
    assert data2["data"][0]["slug"] == "competitive-coding-contest"

def test_event_detail_with_albums_and_media(client, app, test_admin):
    event_id = None
    with app.app_context():
        ev = Event(
            title="Web Design Workshop",
            slug="web-design-workshop",
            description="Responsive CSS and Figma workflows.",
            category="Workshops",
            event_date=datetime(2026, 9, 10, 10, 0, 0, tzinfo=timezone.utc),
            location="Design Studio",
            organizing_club="Design Society",
            is_published=True,
            created_by_id=test_admin.id,
        )
        db.session.add(ev)
        db.session.flush()
        event_id = ev.id

        album = EventAlbum(event_id=ev.id, title="Workshop Highlights")
        db.session.add(album)
        db.session.flush()

        media = EventMedia(
            event_id=ev.id,
            album_id=album.id,
            media_type="image",
            media_url="https://example.com/photo.jpg",
            caption="Students designing components",
            uploaded_by_id=test_admin.id,
        )
        db.session.add(media)
        db.session.commit()

    resp = client.get(f"/api/v1/events/{event_id}")
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert data["title"] == "Web Design Workshop"
    assert len(data["albums"]) == 1
    assert data["albums"][0]["title"] == "Workshop Highlights"
    assert len(data["media"]) == 1
    assert data["media"][0]["caption"] == "Students designing components"

def test_create_event_authorization(client, app, test_user, test_admin):
    # Standard user without privileges cannot create an event
    headers_user = auth_headers(test_user)
    payload = {
        "title": "Unauthorized Event",
        "description": "This should be rejected.",
        "category": "Hackathons",
        "event_date": "2026-11-20T10:00:00",
        "location": "Auditorium",
    }
    resp = client.post("/api/v1/events", json=payload, headers=headers_user)
    assert resp.status_code == 403

    # Admin user can create event
    headers_admin = auth_headers(test_admin)
    resp_admin = client.post("/api/v1/events", json=payload, headers=headers_admin)
    assert resp_admin.status_code == 201
    created = resp_admin.get_json()["data"]
    assert created["title"] == "Unauthorized Event"
    assert len(created["albums"]) == 1  # default highlights album created

