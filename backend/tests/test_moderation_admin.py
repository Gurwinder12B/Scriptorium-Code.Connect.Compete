from tests.conftest import auth_headers

def test_report_and_moderation_flow(client, test_user, test_moderator):
    user_headers = auth_headers(test_user)
    mod_headers = auth_headers(test_moderator)

    # User creates question
    q_res = client.post("/api/v1/community/questions", json={
        "title": "Spam promotional question advertising external services",
        "content_markdown": "Click here to buy cheap essays and fake diploma certifications online.",
        "tags": ["web-development"]
    }, headers=user_headers)
    q_id = q_res.get_json()["data"]["id"]

    # Another user reports it
    rep_res = client.post("/api/v1/moderation/reports", json={
        "target_type": "question",
        "target_id": q_id,
        "reason": "spam",
        "details": "Promotional spam link"
    }, headers=user_headers)
    assert rep_res.status_code == 201
    rep_id = rep_res.get_json()["data"]["id"]

    # Regular user cannot access moderation queue
    forbidden_res = client.get("/api/v1/moderation/reports", headers=user_headers)
    assert forbidden_res.status_code == 403

    # Moderator views report queue
    queue_res = client.get("/api/v1/moderation/reports", headers=mod_headers)
    assert queue_res.status_code == 200
    reports = queue_res.get_json()["data"]
    assert any(r["id"] == rep_id for r in reports)

    # Moderator takes action to hide content
    action_res = client.post("/api/v1/moderation/resolve", json={
        "report_id": rep_id,
        "action": "HIDE_CONTENT",
        "reason": "Confirmed spam"
    }, headers=mod_headers)
    assert action_res.status_code == 200

    # Question is now hidden from public
    check_q = client.get(f"/api/v1/community/questions/{q_id}")
    assert check_q.status_code == 404

def test_admin_stats_and_role_management(client, test_admin, test_user):
    admin_headers = auth_headers(test_admin)
    user_headers = auth_headers(test_user)

    # Regular user cannot access admin stats
    unauth = client.get("/api/v1/admin/stats", headers=user_headers)
    assert unauth.status_code == 403

    # Admin accesses stats
    stats_res = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert stats_res.status_code == 200
    assert "users_count" in stats_res.get_json()["data"]

    # Admin promotes user to moderator
    promote_res = client.patch(f"/api/v1/admin/users/{test_user.id}/role", json={"role": "moderator"}, headers=admin_headers)
    assert promote_res.status_code == 200
    assert promote_res.get_json()["data"]["role"] == "moderator"
