from flask import Blueprint, g
from app.models.submission import UserProblemProgress
from app.models.problem import Problem
from app.common.responses import success_response
from app.common.decorators import require_auth

progress_bp = Blueprint("progress", __name__, url_prefix="/api/v1/progress")

@progress_bp.route("/summary", methods=["GET"])
@require_auth
def get_progress_summary():
    user = g.current_user
    records = UserProblemProgress.query.filter_by(user_id=user.id).all()

    solved = [r for r in records if r.status == "SOLVED"]
    attempted = records

    difficulty_map = {"EASY": 0, "MEDIUM": 0, "HARD": 0}
    for r in solved:
        prob = Problem.query.get(r.problem_id)
        if prob and prob.difficulty in difficulty_map:
            difficulty_map[prob.difficulty] += 1

    totals = {
        "EASY": Problem.query.filter_by(difficulty="EASY", is_published=True).count(),
        "MEDIUM": Problem.query.filter_by(difficulty="MEDIUM", is_published=True).count(),
        "HARD": Problem.query.filter_by(difficulty="HARD", is_published=True).count(),
    }

    data = {
        "solved_count": len(solved),
        "attempted_count": len(attempted),
        "total_problems": sum(totals.values()),
        "points": user.profile.points if user.profile else 0,
        "difficulty": {
            "easy": {"solved": difficulty_map["EASY"], "total": totals["EASY"]},
            "medium": {"solved": difficulty_map["MEDIUM"], "total": totals["MEDIUM"]},
            "hard": {"solved": difficulty_map["HARD"], "total": totals["HARD"]}
        },
        "solved_problems": [r.to_dict() for r in solved]
    }
    return success_response(data=data)
