from tests.conftest import auth_headers, MockUserRecord
from app.models.user import User
from app.common.security import hash_password
from app.extensions import db

def test_create_and_get_question(client, test_user):
    headers = auth_headers(test_user)
    payload = {
        "title": "What is the difference between list and tuple in Python?",
        "content_markdown": "I am wondering when to use a mutable list versus an immutable tuple in Python.",
        "tags": ["python", "data-structures"]
    }
    res = client.post("/api/v1/community/questions", json=payload, headers=headers)
    assert res.status_code == 201
    q_data = res.get_json()["data"]
    q_id = q_data["id"]
    assert q_data["title"] == payload["title"]
    assert len(q_data["tags"]) == 2

    # Get question detail
    detail_res = client.get(f"/api/v1/community/questions/{q_id}")
    assert detail_res.status_code == 200
    assert detail_res.get_json()["data"]["id"] == q_id

def test_answer_and_accept_workflow(client, test_user, app):
    with app.app_context():
        u2 = User(username="answerer", email="ans@scriptorium.dev", password_hash=hash_password("Pass123!"), role="user")
        db.session.add(u2)
        db.session.commit()
        u2_obj = MockUserRecord(u2.id, u2.username, u2.email, u2.role)

    # 1. Author posts question
    author_headers = auth_headers(test_user)
    q_payload = {
        "title": "How to invert a binary tree recursively in Python?",
        "content_markdown": "Can someone share a clear recursive implementation for inverting a binary tree?",
        "tags": ["algorithms", "python"]
    }
    q_res = client.post("/api/v1/community/questions", json=q_payload, headers=author_headers)
    q_id = q_res.get_json()["data"]["id"]

    # 2. Second user submits answer
    answerer_headers = auth_headers(u2_obj)
    ans_payload = {
        "content_markdown": "Here is the standard recursive solution:\n\ndef invert(root):\n    if not root: return None\n    root.left, root.right = invert(root.right), invert(root.left)\n    return root"
    }
    ans_res = client.post(f"/api/v1/community/questions/{q_id}/answers", json=ans_payload, headers=answerer_headers)
    assert ans_res.status_code == 201
    ans_id = ans_res.get_json()["data"]["id"]

    # 3. Non-author cannot accept answer
    unauth_accept = client.post(f"/api/v1/community/questions/{q_id}/accept", json={"answer_id": ans_id}, headers=answerer_headers)
    assert unauth_accept.status_code == 403

    # 4. Author accepts answer
    accept_res = client.post(f"/api/v1/community/questions/{q_id}/accept", json={"answer_id": ans_id}, headers=author_headers)
    assert accept_res.status_code == 200
    assert accept_res.get_json()["data"]["accepted_answer_id"] == ans_id

def test_voting_rules(client, test_user, app):
    with app.app_context():
        other_user = User(username="voter", email="voter@scriptorium.dev", password_hash=hash_password("Pass123!"), role="user")
        db.session.add(other_user)
        db.session.commit()
        voter = MockUserRecord(other_user.id, other_user.username, other_user.email, other_user.role)

    author_headers = auth_headers(test_user)
    voter_headers = auth_headers(voter)

    q_payload = {
        "title": "Understanding Big-O Time and Space Complexity Analysis",
        "content_markdown": "How do you systematically analyze asymptotic upper bounds for recursive divide-and-conquer algorithms?",
        "tags": ["algorithms"]
    }
    q_res = client.post("/api/v1/community/questions", json=q_payload, headers=author_headers)
    q_id = q_res.get_json()["data"]["id"]

    # Author cannot vote on their own post
    self_vote = client.post("/api/v1/community/votes", json={"target_type": "question", "target_id": q_id, "value": 1}, headers=author_headers)
    assert self_vote.status_code == 403

    # Other user upvotes
    vote_res = client.post("/api/v1/community/votes", json={"target_type": "question", "target_id": q_id, "value": 1}, headers=voter_headers)
    assert vote_res.status_code == 200
    assert vote_res.get_json()["data"]["vote_count"] == 1

    # Same user removes vote
    remove_vote = client.post("/api/v1/community/votes", json={"target_type": "question", "target_id": q_id, "value": 0}, headers=voter_headers)
    assert remove_vote.status_code == 200
    assert remove_vote.get_json()["data"]["vote_count"] == 0
