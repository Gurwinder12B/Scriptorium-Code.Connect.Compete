from flask import Blueprint, request, g
from app.extensions import db
from app.models.user import User, Profile
from app.models.community import Question, Answer
from app.models.submission import Submission, UserProblemProgress
from app.models.problem import Problem
from app.common.responses import success_response
from app.common.errors import NotFoundError, ValidationError
from app.common.decorators import require_auth

users_bp = Blueprint("users", __name__, url_prefix="/api/v1/users")

@users_bp.route("/profile/<username>", methods=["GET"])
def get_user_profile(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        raise NotFoundError(f"User '{username}' was not found.")

    recent_questions = [
        q.to_dict() for q in Question.query.filter_by(author_id=user.id, is_hidden=False)
        .order_by(Question.created_at.desc()).limit(5).all()
    ]
    recent_answers = [
        a.to_dict() for a in Answer.query.filter_by(author_id=user.id, is_hidden=False)
        .order_by(Answer.created_at.desc()).limit(5).all()
    ]

    profile_data = user.to_dict()
    profile_data["recent_questions"] = recent_questions
    profile_data["recent_answers"] = recent_answers

    return success_response(data=profile_data)

@users_bp.route("/profile", methods=["PATCH"])
@require_auth
def update_profile():
    data = request.get_json() or {}
    profile = g.current_user.profile
    if not profile:
        profile = Profile(user_id=g.current_user.id)
        db.session.add(profile)

    if "full_name" in data:
        profile.full_name = (data["full_name"] or "").strip()[:100]
    if "bio" in data:
        profile.bio = (data["bio"] or "").strip()[:1000]
    if "location" in data:
        profile.location = (data["location"] or "").strip()[:100]
    if "github_url" in data:
        profile.github_url = (data["github_url"] or "").strip()[:255]
    if "website_url" in data:
        profile.website_url = (data["website_url"] or "").strip()[:255]
    if "avatar_url" in data:
        profile.avatar_url = (data["avatar_url"] or "").strip()[:255]

    db.session.commit()
    return success_response(data=g.current_user.to_dict())

@users_bp.route("/dashboard", methods=["GET"])
@require_auth
def get_dashboard():
    user = g.current_user
    solved_progress = UserProblemProgress.query.filter_by(user_id=user.id, status="SOLVED").all()
    attempted_progress = UserProblemProgress.query.filter_by(user_id=user.id).all()

    # Breakdown by difficulty
    difficulty_counts = {"EASY": 0, "MEDIUM": 0, "HARD": 0}
    for p in solved_progress:
        prob = Problem.query.get(p.problem_id)
        if prob and prob.difficulty in difficulty_counts:
            difficulty_counts[prob.difficulty] += 1

    total_problems = {
        "EASY": Problem.query.filter_by(difficulty="EASY", is_published=True).count(),
        "MEDIUM": Problem.query.filter_by(difficulty="MEDIUM", is_published=True).count(),
        "HARD": Problem.query.filter_by(difficulty="HARD", is_published=True).count(),
    }

    recent_submissions = [
        s.to_dict(include_code=False) for s in Submission.query.filter_by(user_id=user.id)
        .order_by(Submission.created_at.desc()).limit(8).all()
    ]

    recent_questions = [
        q.to_dict() for q in Question.query.filter_by(author_id=user.id, is_hidden=False)
        .order_by(Question.created_at.desc()).limit(5).all()
    ]

    dashboard_data = {
        "user": user.to_dict(),
        "stats": {
            "solved_count": len(solved_progress),
            "attempted_count": len(attempted_progress),
            "points": user.profile.points if user.profile else 0,
            "questions_count": user.profile.questions_count if user.profile else 0,
            "answers_count": user.profile.answers_count if user.profile else 0,
            "difficulty_breakdown": {
                "easy": {"solved": difficulty_counts["EASY"], "total": total_problems["EASY"]},
                "medium": {"solved": difficulty_counts["MEDIUM"], "total": total_problems["MEDIUM"]},
                "hard": {"solved": difficulty_counts["HARD"], "total": total_problems["HARD"]}
            }
        },
        "recent_submissions": recent_submissions,
        "recent_questions": recent_questions
    }
    return success_response(data=dashboard_data)
