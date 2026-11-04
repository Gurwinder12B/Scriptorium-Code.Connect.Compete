import json
from tests.conftest import auth_headers

def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["status"] == "healthy"

def test_api_index(client):
    res = client.get("/api/v1")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["product"] == "SCRIPTORIUM"

def test_register_success(client):
    payload = {
        "username": "newdev",
        "email": "newdev@scriptorium.dev",
        "password": "Password123!"
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["user"]["username"] == "newdev"
    assert "token" in data["data"]

def test_register_duplicate(client, test_user):
    payload = {
        "username": "testuser",
        "email": "another@scriptorium.dev",
        "password": "Password123!"
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 409
    data = res.get_json()
    assert data["success"] is False
    assert data["error"]["code"] == "CONFLICT"

def test_login_success(client, test_user, user_credentials):
    payload = {
        "login": user_credentials["username"],
        "password": user_credentials["password"]
    }
    res = client.post("/api/v1/auth/login", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "token" in data["data"]

def test_login_invalid_password(client, test_user):
    payload = {
        "login": "testuser",
        "password": "WrongPassword999!"
    }
    res = client.post("/api/v1/auth/login", json=payload)
    assert res.status_code == 401
    data = res.get_json()
    assert data["success"] is False

def test_get_current_user_me(client, test_user):
    headers = auth_headers(test_user)
    res = client.get("/api/v1/auth/me", headers=headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["data"]["username"] == test_user.username

