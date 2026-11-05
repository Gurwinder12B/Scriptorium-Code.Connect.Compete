import pytest
from app.extensions import db
from app.models.project import Project, CodeReview, CodeReviewComment, ProjectUpvote, ProjectTag
from tests.conftest import auth_headers

def test_list_projects(client, app, test_user):
    with app.app_context():
        p = Project(
            user_id=test_user.id,
            title="NeuralFlow: Real-time Synthesizer",
            slug="neuralflow-realtime-synthesizer",
            tagline="A real-time synthesizer",
            description_markdown="# NeuralFlow\nAudio processing.",
            category="Artificial Intelligence",
            status="PUBLISHED",
        )
        db.session.add(p)
        db.session.commit()

    resp = client.get("/api/v1/projects")
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["title"] == "NeuralFlow: Real-time Synthesizer"

    # Filter by category
    resp_cat = client.get("/api/v1/projects?category=Artificial+Intelligence")
    assert resp_cat.status_code == 200
    assert any("NeuralFlow" in p["title"] for p in resp_cat.get_json()["data"])

def test_create_project_and_validation(client, app, test_user):
    headers = auth_headers(test_user)

    # Missing fields should fail
    resp_fail = client.post("/api/v1/projects", headers=headers, json={
        "title": ""
    })
    assert resp_fail.status_code == 400

    # Valid creation
    resp = client.post("/api/v1/projects", headers=headers, json={
        "title": "QuantumSim: Qubit State Visualizer",
        "tagline": "Interactive Bloch sphere visualization for quantum computing gates.",
        "description_markdown": "A visual interactive simulation engine modeling quantum circuits with state vector evolution.",
        "category": "Systems & Cloud",
        "github_url": "https://github.com/student/quantum-sim",
        "live_demo_url": "https://quantum-sim.dev",
        "tags": ["Quantum", "React", "ThreeJS", "Math"],
        "media": [
            {"media_url": "https://example.com/screenshot1.png", "caption": "Bloch sphere rotation"}
        ]
    })
    assert resp.status_code == 201
    proj_data = resp.get_json()["data"]
    assert proj_data["title"] == "QuantumSim: Qubit State Visualizer"
    assert proj_data["slug"].startswith("quantumsim")
    assert len(proj_data["tags"]) == 4

def test_project_upvote(client, app, test_user, test_admin):
    with app.app_context():
        p = Project(
            user_id=test_user.id,
            title="Upvote Test Project",
            slug="upvote-test-project",
            tagline="Upvote test",
            description_markdown="# Upvote\nUpvoting.",
            category="Web Development",
            status="PUBLISHED",
            upvote_count=0,
        )
        db.session.add(p)
        db.session.commit()
        project_id = p.id

    admin_headers = auth_headers(test_admin)

    # Upvote
    resp = client.post(f"/api/v1/projects/{project_id}/upvote", headers=admin_headers)
    assert resp.status_code == 200
    res_data = resp.get_json()["data"]
    assert res_data["upvote_count"] == 1
    assert res_data["user_has_upvoted"] is True

    # Toggle upvote again
    resp_toggle = client.post(f"/api/v1/projects/{project_id}/upvote", headers=admin_headers)
    assert resp_toggle.status_code == 200
    res_data2 = resp_toggle.get_json()["data"]
    assert res_data2["upvote_count"] == 0
    assert res_data2["user_has_upvoted"] is False

def test_code_review_workflow(client, app, test_user, test_admin):
    with app.app_context():
        p = Project(
            user_id=test_user.id,
            title="Review Target Project",
            slug="review-target-project",
            tagline="Review target",
            description_markdown="# Target\nReview this project.",
            category="Web Development",
            status="PUBLISHED",
        )
        db.session.add(p)
        db.session.commit()
        project_id = p.id

    author_headers = auth_headers(test_user)
    reviewer_headers = auth_headers(test_admin)

    # Author cannot review own project
    resp_self = client.post(f"/api/v1/projects/{project_id}/reviews", headers=author_headers, json={
        "summary": "Reviewing my own code"
    })
    assert resp_self.status_code == 400

    # Reviewer reviews project
    resp_review = client.post(f"/api/v1/projects/{project_id}/reviews", headers=reviewer_headers, json={
        "summary": "Comprehensive audio thread safety evaluation",
        "architecture_feedback": "State machine for audio buffers prevents race conditions.",
        "performance_feedback": "Consider pooling allocations for float32 array chunks.",
        "security_feedback": "Audio input limits prevent memory spikes.",
        "ui_ux_feedback": "Waveform gradients look sharp in dark mode.",
        "rating_overall": 5
    })
    assert resp_review.status_code == 201
    review_data = resp_review.get_json()["data"]
    review_id = review_data["id"]
    assert review_data["status"] == "OPEN"

    # Project author marks review as ADDRESSED
    resp_status = client.patch(
        f"/api/v1/projects/{project_id}/reviews/{review_id}/status",
        headers=author_headers,
        json={"status": "ADDRESSED"}
    )
    assert resp_status.status_code == 200
    assert resp_status.get_json()["data"]["status"] == "ADDRESSED"

    # Author replies with a code snippet comment
    resp_comment = client.post(
        f"/api/v1/projects/{project_id}/reviews/{review_id}/comments",
        headers=author_headers,
        json={
            "content": "Added float32 array object pool in commit 3f8a92!",
            "code_snippet": "const bufferPool = new ObjectPool(() => new Float32Array(1024));"
        }
    )
    assert resp_comment.status_code == 201
    assert "bufferPool" in resp_comment.get_json()["data"]["code_snippet"]
