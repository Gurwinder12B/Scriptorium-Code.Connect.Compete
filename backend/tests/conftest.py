import pytest
from app import create_app
from app.extensions import db
from app.models.user import User, Profile
from app.common.security import hash_password, create_access_token

class MockUserRecord:
    def __init__(self, id, username, email, role):
        self.id = id
        self.username = username
        self.email = email
        self.role = role

@pytest.fixture
def app():
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def user_credentials():
    return {
        "username": "testuser",
        "email": "test@scriptorium.dev",
        "password": "Password123!"
    }

@pytest.fixture
def test_user(app, user_credentials):
    with app.app_context():
        user = User(
            username=user_credentials["username"],
            email=user_credentials["email"],
            password_hash=hash_password(user_credentials["password"]),
            role="user",
            is_active=True
        )
        db.session.add(user)
        db.session.flush()

        profile = Profile(user_id=user.id, full_name="Test User", points=0)
        db.session.add(profile)
        db.session.commit()
        return MockUserRecord(user.id, user.username, user.email, user.role)

@pytest.fixture
def test_admin(app):
    with app.app_context():
        admin = User(
            username="adminuser",
            email="admin@scriptorium.dev",
            password_hash=hash_password("AdminPassword123!"),
            role="admin",
            is_active=True
        )
        db.session.add(admin)
        db.session.flush()
        profile = Profile(user_id=admin.id, full_name="Admin User", points=100)
        db.session.add(profile)
        db.session.commit()
        return MockUserRecord(admin.id, admin.username, admin.email, admin.role)

@pytest.fixture
def test_moderator(app):
    with app.app_context():
        mod = User(
            username="moduser",
            email="mod@scriptorium.dev",
            password_hash=hash_password("ModPassword123!"),
            role="moderator",
            is_active=True
        )
        db.session.add(mod)
        db.session.flush()
        profile = Profile(user_id=mod.id, full_name="Mod User", points=50)
        db.session.add(profile)
        db.session.commit()
        return MockUserRecord(mod.id, mod.username, mod.email, mod.role)

def auth_headers(user, app=None):
    from flask import current_app
    token = create_access_token(user.id, user.username, user.role)
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
