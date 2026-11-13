import re
from datetime import datetime, timezone
from flask import Blueprint, request, g
from app.extensions import db
from app.models.quiz import Quiz, QuizQuestion, QuizTeam, QuizSubmission
from app.models.audit import AuditLog
from app.common.decorators import require_auth, optional_auth, require_role
from app.common.responses import success_response, created_response, error_response
from app.common.errors import ValidationError, NotFoundError, ForbiddenError

quizzes_bp = Blueprint("quizzes", __name__, url_prefix="/api/v1/quizzes")

def slugify(text: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "-", slug)

@quizzes_bp.route("", methods=["GET"])
@optional_auth
def list_quizzes():
    category = request.args.get("category", "").strip()
    status = request.args.get("status", "").strip().upper()
    q = request.args.get("q", "").strip()
    page = max(1, request.args.get("page", 1, type=int))
    per_page = min(50, max(1, request.args.get("per_page", 12, type=int)))

    query = Quiz.query

    user = getattr(g, "current_user", None)
    is_admin_or_mod = user and user.role in ("admin", "moderator", "club_coordinator")
    if not is_admin_or_mod:
        query = query.filter_by(is_published=True)

    if category:
        query = query.filter(Quiz.category.ilike(f"%{category}%"))
    if status and status != "ALL":
        query = query.filter(Quiz.status == status)
    if q:
        query = query.filter(
            db.or_(
                Quiz.title.ilike(f"%{q}%"),
                Quiz.description.ilike(f"%{q}%"),
                Quiz.category.ilike(f"%{q}%"),
            )
        )

    query = query.order_by(Quiz.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return success_response(
        data={
            "items": [item.to_dict(include_questions=False) for item in pagination.items],
            "total": pagination.total,
            "page": page,
            "per_page": per_page,
            "pages": pagination.pages,
        }
    )

@quizzes_bp.route("/<id_or_slug>", methods=["GET"])
@optional_auth
def get_quiz(id_or_slug):
    quiz = None
    if id_or_slug.isdigit():
        quiz = Quiz.query.get(int(id_or_slug))
    if not quiz:
        quiz = Quiz.query.filter_by(slug=id_or_slug).first()

    if not quiz:
        raise NotFoundError("Quiz not found")

    user = getattr(g, "current_user", None)
    is_admin = user and user.role in ("admin", "moderator", "club_coordinator")
    
    # Students taking quiz get questions without the answer key. Admins get full answer key.
    include_answer_key = is_admin and (request.args.get("reveal_answer_key", "false").lower() == "true")
    data = quiz.to_dict(include_questions=True, include_answer_key=include_answer_key)
    
    return success_response(data=data)

@quizzes_bp.route("", methods=["POST"])
@require_auth
def create_quiz():
    user = getattr(g, "current_user", None)
    if user.role not in ("admin", "moderator", "club_coordinator", "author"):
        raise ForbiddenError("Only administrators, club coordinators, or moderators can create quiz competitions.")

    payload = request.get_json() or {}
    title = payload.get("title", "").strip()
    if not title:
        raise ValidationError("Quiz title is required.")

    base_slug = slugify(title)
    slug = base_slug
    counter = 1
    while Quiz.query.filter_by(slug=slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    quiz = Quiz(
        title=title,
        slug=slug,
        description=payload.get("description", "").strip() or "Scriptorium Developer Quiz Competition",
        category=payload.get("category", "Algorithms & CS").strip(),
        cover_image_url=payload.get("cover_image_url", "").strip() or "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
        duration_minutes=int(payload.get("duration_minutes", 30)),
        max_teams=int(payload.get("max_teams", 50)) if payload.get("max_teams") else None,
        min_team_size=int(payload.get("min_team_size", 1)),
        max_team_size=int(payload.get("max_team_size", 4)),
        total_points=int(payload.get("total_points", 100)),
        passing_score=int(payload.get("passing_score", 50)),
        shuffle_questions=bool(payload.get("shuffle_questions", False)),
        allow_review=bool(payload.get("allow_review", True)),
        status=payload.get("status", "LIVE").upper(),
        is_published=bool(payload.get("is_published", True)),
        created_by_id=user.id,
    )
    db.session.add(quiz)
    db.session.flush()

    # Add questions with answer key if provided
    raw_questions = payload.get("questions", [])
    total_calculated_points = 0
    for idx, q_data in enumerate(raw_questions):
        q_text = q_data.get("question_text", "").strip()
        correct_ans = str(q_data.get("correct_answer", "")).strip()
        options = q_data.get("options", [])
        pts = int(q_data.get("points", 10))
        total_calculated_points += pts

        if q_text and options and correct_ans:
            question = QuizQuestion(
                quiz_id=quiz.id,
                question_text=q_text,
                question_type=q_data.get("question_type", "multiple_choice"),
                options=options,
                correct_answer=correct_ans,
                points=pts,
                explanation=q_data.get("explanation", "").strip(),
                order_index=idx,
            )
            db.session.add(question)

    if total_calculated_points > 0:
        quiz.total_points = total_calculated_points

    db.session.commit()
    return created_response(data=quiz.to_dict(include_questions=True, include_answer_key=True), message="Quiz competition created successfully with answer key.")

@quizzes_bp.route("/<int:quiz_id>", methods=["PUT"])
@require_auth
def update_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        raise NotFoundError("Quiz not found")

    user = getattr(g, "current_user", None)
    if user.role not in ("admin", "moderator") and quiz.created_by_id != user.id:
        raise ForbiddenError("Permission denied to edit this quiz.")

    payload = request.get_json() or {}
    if "title" in payload:
        quiz.title = payload["title"].strip()
    if "description" in payload:
        quiz.description = payload["description"].strip()
    if "category" in payload:
        quiz.category = payload["category"].strip()
    if "cover_image_url" in payload:
        quiz.cover_image_url = payload["cover_image_url"].strip()
    if "duration_minutes" in payload:
        quiz.duration_minutes = int(payload["duration_minutes"])
    if "max_teams" in payload:
        quiz.max_teams = int(payload["max_teams"]) if payload["max_teams"] else None
    if "min_team_size" in payload:
        quiz.min_team_size = int(payload["min_team_size"])
    if "max_team_size" in payload:
        quiz.max_team_size = int(payload["max_team_size"])
    if "passing_score" in payload:
        quiz.passing_score = int(payload["passing_score"])
    if "status" in payload:
        quiz.status = payload["status"].upper()
    if "is_published" in payload:
        quiz.is_published = bool(payload["is_published"])

    # If new questions list passed, update them
    if "questions" in payload and isinstance(payload["questions"], list):
        QuizQuestion.query.filter_by(quiz_id=quiz.id).delete()
        total_pts = 0
        for idx, q_data in enumerate(payload["questions"]):
            q_text = q_data.get("question_text", "").strip()
            correct_ans = str(q_data.get("correct_answer", "")).strip()
            options = q_data.get("options", [])
            pts = int(q_data.get("points", 10))
            total_pts += pts

            if q_text and options and correct_ans:
                question = QuizQuestion(
                    quiz_id=quiz.id,
                    question_text=q_text,
                    question_type=q_data.get("question_type", "multiple_choice"),
                    options=options,
                    correct_answer=correct_ans,
                    points=pts,
                    explanation=q_data.get("explanation", "").strip(),
                    order_index=idx,
                )
                db.session.add(question)
        if total_pts > 0:
            quiz.total_points = total_pts

    db.session.commit()
    return success_response(data=quiz.to_dict(include_questions=True, include_answer_key=True), message="Quiz updated successfully.")

@quizzes_bp.route("/<int:quiz_id>", methods=["DELETE"])
@require_auth
def delete_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        raise NotFoundError("Quiz not found")

    user = getattr(g, "current_user", None)
    if user.role != "admin" and quiz.created_by_id != user.id:
        raise ForbiddenError("Only admins or quiz creator can delete this quiz.")

    db.session.delete(quiz)
    db.session.commit()
    return success_response(message="Quiz competition deleted successfully.")

# ----------------------------------------------------------------------------
# Team Registration & Joining
# ----------------------------------------------------------------------------

@quizzes_bp.route("/<int:quiz_id>/teams/register", methods=["POST"])
@require_auth
def register_team(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        raise NotFoundError("Quiz not found")

    user = getattr(g, "current_user", None)
    payload = request.get_json() or {}

    team_name = payload.get("team_name", "").strip() or f"{user.username}'s Team"
    members = payload.get("members", [])  # List of member dicts: [{"name": "...", "email": "..."}]

    # Validate team size
    total_size = len(members) + 1  # Members + leader
    if total_size < quiz.min_team_size:
        raise ValidationError(f"This quiz requires a minimum of {quiz.min_team_size} member(s) per team.")
    if total_size > quiz.max_team_size:
        raise ValidationError(f"This quiz permits a maximum of {quiz.max_team_size} members per team.")

    # Validate max teams limit
    if quiz.max_teams and len(quiz.teams) >= quiz.max_teams:
        raise ValidationError(f"Registration full: This competition is capped at {quiz.max_teams} teams.")

    # Check if team name already exists for this quiz
    existing_team = QuizTeam.query.filter_by(quiz_id=quiz.id, name=team_name).first()
    if existing_team:
        raise ValidationError(f"A team named '{team_name}' is already registered for this quiz.")

    team = QuizTeam(
        quiz_id=quiz.id,
        name=team_name,
        leader_id=user.id,
        leader_name=user.username,
        members=members,
        status="REGISTERED",
    )
    db.session.add(team)
    db.session.commit()

    return created_response(
        data=team.to_dict(),
        message=f"Team '{team_name}' registered successfully! Join code: {team.join_code}"
    )

@quizzes_bp.route("/<int:quiz_id>/teams/join", methods=["POST"])
@require_auth
def join_team(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        raise NotFoundError("Quiz not found")

    user = getattr(g, "current_user", None)
    payload = request.get_json() or {}
    join_code = payload.get("join_code", "").strip().upper()

    if not join_code:
        raise ValidationError("Join code is required.")

    team = QuizTeam.query.filter_by(quiz_id=quiz.id, join_code=join_code).first()
    if not team:
        raise NotFoundError("Invalid team join code for this quiz competition.")

    members = list(team.members or [])
    if len(members) + 1 >= quiz.max_team_size:
        raise ValidationError(f"Team '{team.name}' has already reached the maximum size of {quiz.max_team_size} members.")

    # Add current user if not already in team
    if any(m.get("email") == user.email or m.get("username") == user.username for m in members) or team.leader_id == user.id:
        return success_response(data=team.to_dict(), message="You are already a member of this team.")

    members.append({
        "username": user.username,
        "email": user.email,
        "name": user.profile.full_name if user.profile else user.username,
        "joined_at": datetime.now(timezone.utc).isoformat(),
    })
    team.members = members
    db.session.commit()

    return success_response(data=team.to_dict(), message=f"Successfully joined team '{team.name}'!")

# ----------------------------------------------------------------------------
# Quiz Submission, Automated Grading against Answer Key & Score Calculation
# ----------------------------------------------------------------------------

@quizzes_bp.route("/<int:quiz_id>/submit", methods=["POST"])
@require_auth
def submit_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        raise NotFoundError("Quiz not found")

    user = getattr(g, "current_user", None)
    payload = request.get_json() or {}
    
    # answers format: {"<question_id>": "A", ...}
    submitted_answers = payload.get("answers", {})
    time_taken_seconds = int(payload.get("time_taken_seconds", 0))
    team_id = payload.get("team_id")
    team_name = payload.get("team_name", "").strip() or f"{user.username}'s Team"

    if team_id:
        team = QuizTeam.query.get(team_id)
        if team:
            team_name = team.name
            team.status = "SUBMITTED"

    # Automated grading against the question Answer Key!
    score = 0
    correct_count = 0
    incorrect_count = 0
    answer_key_review = []

    questions = QuizQuestion.query.filter_by(quiz_id=quiz.id).order_by(QuizQuestion.order_index.asc()).all()
    
    for q in questions:
        q_id_str = str(q.id)
        student_ans = submitted_answers.get(q_id_str)
        official_correct = str(q.correct_answer).strip()

        # Check correctness
        is_correct = False
        if student_ans is not None:
            # Handle string comparison or trimmed match
            is_correct = str(student_ans).strip().upper() == official_correct.upper()

        if is_correct:
            score += q.points
            correct_count += 1
        else:
            incorrect_count += 1

        answer_key_review.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "options": q.options,
            "selected_answer": student_ans,
            "correct_answer": official_correct,
            "is_correct": is_correct,
            "points_earned": q.points if is_correct else 0,
            "max_points": q.points,
            "explanation": q.explanation or "Answer verified against official competition answer key.",
        })

    total_possible = sum(q.points for q in questions) or quiz.total_points or 100
    percentage = round((score / total_possible) * 100, 1)

    submission = QuizSubmission(
        quiz_id=quiz.id,
        team_id=team_id,
        team_name=team_name,
        user_id=user.id,
        answers=submitted_answers,
        score=score,
        total_points=total_possible,
        percentage=percentage,
        correct_count=correct_count,
        incorrect_count=incorrect_count,
        time_taken_seconds=time_taken_seconds,
        is_graded=True,
    )
    db.session.add(submission)
    db.session.commit()

    scorecard = {
        "submission_id": submission.id,
        "quiz_id": quiz.id,
        "quiz_title": quiz.title,
        "team_name": team_name,
        "score": score,
        "total_points": total_possible,
        "percentage": percentage,
        "passed": score >= quiz.passing_score,
        "passing_score": quiz.passing_score,
        "correct_count": correct_count,
        "incorrect_count": incorrect_count,
        "total_questions": len(questions),
        "time_taken_seconds": time_taken_seconds,
        "submitted_at": submission.submitted_at.isoformat(),
        # Full Answer Key & Explanations:
        "answer_key_review": answer_key_review,
    }

    return success_response(
        data=scorecard,
        message=f"Quiz submitted successfully! Team {team_name} scored {score}/{total_possible} ({percentage}%)."
    )

# ----------------------------------------------------------------------------
# Leaderboard & Submission Review
# ----------------------------------------------------------------------------

@quizzes_bp.route("/<int:quiz_id>/leaderboard", methods=["GET"])
@optional_auth
def get_quiz_leaderboard(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        raise NotFoundError("Quiz not found")

    submissions = (
        QuizSubmission.query.filter_by(quiz_id=quiz.id)
        .order_by(QuizSubmission.score.desc(), QuizSubmission.time_taken_seconds.asc(), QuizSubmission.submitted_at.asc())
        .limit(100)
        .all()
    )

    leaderboard = []
    for rank, sub in enumerate(submissions, start=1):
        leaderboard.append({
            "rank": rank,
            "submission_id": sub.id,
            "team_id": sub.team_id,
            "team_name": sub.team_name,
            "score": sub.score,
            "total_points": sub.total_points,
            "percentage": sub.percentage,
            "correct_count": sub.correct_count,
            "time_taken_seconds": sub.time_taken_seconds,
            "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None,
        })

    return success_response(data={"quiz": quiz.to_dict(), "leaderboard": leaderboard})

@quizzes_bp.route("/<int:quiz_id>/submissions/<int:submission_id>", methods=["GET"])
@require_auth
def get_submission_review(quiz_id, submission_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        raise NotFoundError("Quiz not found")

    submission = QuizSubmission.query.filter_by(id=submission_id, quiz_id=quiz.id).first()
    if not submission:
        raise NotFoundError("Submission not found")

    user = getattr(g, "current_user", None)
    is_admin = user and user.role in ("admin", "moderator")
    if submission.user_id != user.id and not is_admin:
        raise ForbiddenError("You can only view your own team's scorecard and answer key.")

    # Build answer key review
    questions = QuizQuestion.query.filter_by(quiz_id=quiz.id).order_by(QuizQuestion.order_index.asc()).all()
    answer_key_review = []
    
    for q in questions:
        q_id_str = str(q.id)
        student_ans = (submission.answers or {}).get(q_id_str)
        official_correct = str(q.correct_answer).strip()
        is_correct = str(student_ans).strip().upper() == official_correct.upper() if student_ans else False

        answer_key_review.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "options": q.options,
            "selected_answer": student_ans,
            "correct_answer": official_correct,
            "is_correct": is_correct,
            "points_earned": q.points if is_correct else 0,
            "max_points": q.points,
            "explanation": q.explanation or "Answer verified against official competition answer key.",
        })

    data = submission.to_dict(include_answers=True)
    data["quiz_title"] = quiz.title
    data["passing_score"] = quiz.passing_score
    data["passed"] = submission.score >= quiz.passing_score
    data["answer_key_review"] = answer_key_review

    return success_response(data=data)
