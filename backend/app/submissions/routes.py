from datetime import datetime, timezone
from flask import Blueprint, request, g
from app.extensions import db
from app.models.problem import Problem, TestCase
from app.models.submission import Submission, SubmissionResult, UserProblemProgress
from app.models.notification import Notification
from app.judge import get_judge_adapter
from app.common.responses import success_response
from app.common.errors import ValidationError, NotFoundError, ForbiddenError
from app.common.decorators import require_auth

submissions_bp = Blueprint("submissions", __name__, url_prefix="/api/v1/submissions")

POINTS_BY_DIFFICULTY = {
    "EASY": 10,
    "MEDIUM": 20,
    "HARD": 30
}

@submissions_bp.route("", methods=["POST"])
@require_auth
def create_submission():
    data = request.get_json() or {}
    problem_id = data.get("problem_id")
    language = (data.get("language") or "").strip().lower()
    source_code = data.get("source_code") or ""

    if not problem_id or not language or not source_code.strip():
        raise ValidationError("Problem ID, language, and non-empty source code are required.")

    if len(source_code.encode("utf-8")) > 65536: # 64 KB limit
        raise ValidationError("Source code exceeds maximum allowed size of 64 KB.")

    if language not in ("python", "python3", "javascript", "node", "cpp", "c", "java"):
        raise ValidationError(f"Unsupported language '{language}'. Supported: python, javascript, cpp.")

    problem = Problem.query.filter_by(id=problem_id, is_published=True).first()
    if not problem:
        raise NotFoundError("Problem not found or not published.")

    # 1. Create initial Submission record
    submission = Submission(
        problem_id=problem.id,
        user_id=g.current_user.id,
        language=language,
        source_code=source_code,
        status="QUEUED"
    )
    db.session.add(submission)
    db.session.commit()

    # 2. Retrieve test cases for execution
    test_cases = TestCase.query.filter_by(problem_id=problem.id).order_by(TestCase.order_index).all()
    if not test_cases:
        # Fallback dummy test case if none configured
        dummy = TestCase(problem_id=problem.id, input_data="", expected_output="", is_sample=True, is_hidden=False)
        test_cases = [dummy]

    # 3. Coordinate with Judge Adapter (disposable, isolated execution)
    submission.status = "PROCESSING"
    judge = get_judge_adapter()
    judge_result = judge.evaluate(
        language=language,
        source_code=source_code,
        test_cases=test_cases,
        time_limit_ms=problem.time_limit_ms,
        memory_limit_mb=problem.memory_limit_mb
    )

    # 4. Save results transactionally
    submission.status = judge_result.verdict
    submission.execution_time_ms = judge_result.execution_time_ms
    submission.memory_used_kb = judge_result.memory_used_kb
    submission.error_message = judge_result.error_message
    submission.stdout_sample = judge_result.stdout_sample
    submission.is_simulated = judge_result.is_simulated

    for tc_res in judge_result.test_case_results:
        # Only attach if real test case id exists in db
        if tc_res.test_case_id:
            sub_res = SubmissionResult(
                submission_id=submission.id,
                test_case_id=tc_res.test_case_id,
                verdict=tc_res.verdict,
                execution_time_ms=tc_res.execution_time_ms,
                memory_used_kb=tc_res.memory_used_kb,
                actual_output=tc_res.actual_output,
                error_details=tc_res.error_details
            )
            db.session.add(sub_res)

    # 5. Update user progress atomically and server-verified
    progress = UserProblemProgress.query.filter_by(user_id=g.current_user.id, problem_id=problem.id).first()
    first_time_solve = False

    if not progress:
        progress = UserProblemProgress(
            user_id=g.current_user.id,
            problem_id=problem.id,
            status="SOLVED" if judge_result.verdict == "ACCEPTED" else "ATTEMPTED",
            total_attempts=1,
            first_solved_at=datetime.now(timezone.utc) if judge_result.verdict == "ACCEPTED" else None,
            last_attempted_at=datetime.now(timezone.utc)
        )
        if judge_result.verdict == "ACCEPTED":
            first_time_solve = True
        db.session.add(progress)
    else:
        progress.total_attempts += 1
        progress.last_attempted_at = datetime.now(timezone.utc)
        if judge_result.verdict == "ACCEPTED" and progress.status != "SOLVED":
            progress.status = "SOLVED"
            progress.first_solved_at = datetime.now(timezone.utc)
            first_time_solve = True

    # 6. Award difficulty points if first time solved
    if first_time_solve and g.current_user.profile:
        pts = POINTS_BY_DIFFICULTY.get(problem.difficulty, 10)
        g.current_user.profile.points += pts
        g.current_user.profile.problems_solved_count += 1

        # Send celebration notification
        notif = Notification(
            user_id=g.current_user.id,
            event_type="SUBMISSION_VERDICT",
            title="Problem Solved! 🎉",
            message=f"Congratulations! You solved '{problem.title}' and earned +{pts} points.",
            link_url=f"/problems/{problem.id}"
        )
        db.session.add(notif)

    # 7. Update problem stats
    problem.total_submissions += 1
    if judge_result.verdict == "ACCEPTED":
        problem.accepted_submissions += 1
    if problem.total_submissions > 0:
        problem.acceptance_rate = (problem.accepted_submissions / problem.total_submissions) * 100.0

    db.session.commit()

    return success_response(data=submission.to_dict(), status_code=201)

@submissions_bp.route("/<int:submission_id>", methods=["GET"])
@require_auth
def get_submission(submission_id):
    submission = Submission.query.get(submission_id)
    if not submission:
        raise NotFoundError("Submission not found.")

    if submission.user_id != g.current_user.id and g.current_user.role not in ("admin", "moderator"):
        raise ForbiddenError("You can only view your own submissions.")

    data = submission.to_dict()
    data["results"] = [r.to_dict() for r in submission.results]
    return success_response(data=data)

@submissions_bp.route("", methods=["GET"])
@require_auth
def list_submissions():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    problem_id = request.args.get("problem_id", type=int)

    query = Submission.query.filter_by(user_id=g.current_user.id)
    if problem_id:
        query = query.filter_by(problem_id=problem_id)

    pagination = query.order_by(Submission.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    subs = [s.to_dict(include_code=False) for s in pagination.items]

    meta = {
        "page": page,
        "per_page": per_page,
        "total": pagination.total,
        "total_pages": pagination.pages
    }
    return success_response(data=subs, meta=meta)

