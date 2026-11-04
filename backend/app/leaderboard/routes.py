from flask import Blueprint, request
from app.models.user import User, Profile
from app.common.responses import success_response

leaderboard_bp = Blueprint("leaderboard", __name__, url_prefix="/api/v1/leaderboard")

@leaderboard_bp.route("", methods=["GET"])
def get_leaderboard():
    limit = min(request.args.get("limit", 50, type=int), 100)

    # Query active users ordered by points desc, solved problems desc
    profiles = (
        Profile.query.join(User, Profile.user_id == User.id)
        .filter(User.is_active == True)
        .order_by(Profile.points.desc(), Profile.problems_solved_count.desc(), Profile.id.asc())
        .limit(limit)
        .all()
    )

    rankings = []
    for rank, p in enumerate(profiles, start=1):
        rankings.append({
            "rank": rank,
            "username": p.user.username,
            "full_name": p.full_name,
            "avatar_url": p.avatar_url,
            "points": p.points,
            "problems_solved_count": p.problems_solved_count,
            "questions_count": p.questions_count,
            "answers_count": p.answers_count
        })

    return success_response(data=rankings)
