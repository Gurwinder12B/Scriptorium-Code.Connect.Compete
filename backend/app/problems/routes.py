from flask import Blueprint, request, g
from app.extensions import db
from app.models.problem import Problem, TestCase, problem_tags
from app.models.community import Tag, slugify
from app.common.responses import success_response
from app.common.errors import ValidationError, NotFoundError, ForbiddenError
from app.common.decorators import require_auth, require_role, optional_auth

problems_bp = Blueprint("problems", __name__, url_prefix="/api/v1/problems")

@problems_bp.route("", methods=["GET"])
@optional_auth
def list_problems():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    difficulty = request.args.get("difficulty", "").strip().upper()
    tag_slug = request.args.get("tag", "").strip()
    query_str = request.args.get("q", "").strip()

    query = Problem.query.filter_by(is_published=True)

    if difficulty in ("EASY", "MEDIUM", "HARD"):
        query = query.filter_by(difficulty=difficulty)

    if tag_slug:
        tag = Tag.query.filter_by(slug=tag_slug).first()
        if tag:
            query = query.filter(Problem.tags.any(id=tag.id))
        else:
            query = query.filter(db.false())

    if query_str:
        search_filter = f"%{query_str}%"
        query = query.filter(Problem.title.ilike(search_filter) | Problem.description_markdown.ilike(search_filter))

    pagination = query.order_by(Problem.id.asc()).paginate(page=page, per_page=per_page, error_out=False)
    problems_data = [p.to_dict() for p in pagination.items]

    # Attach user solved status if user is logged in
    if g.current_user:
        from app.models.submission import UserProblemProgress
        user_progress = UserProblemProgress.query.filter_by(user_id=g.current_user.id).all()
        status_map = {up.problem_id: up.status for up in user_progress}
        for p in problems_data:
            p["user_status"] = status_map.get(p["id"], "UNSOLVED")

    meta = {
        "page": page,
        "per_page": per_page,
        "total": pagination.total,
        "total_pages": pagination.pages
    }
    return success_response(data=problems_data, meta=meta)

@problems_bp.route("/<string:id_or_slug>", methods=["GET"])
@optional_auth
def get_problem(id_or_slug):
    problem = None
    if id_or_slug.isdigit():
        problem = Problem.query.filter_by(id=int(id_or_slug), is_published=True).first()
    if not problem:
        problem = Problem.query.filter_by(slug=id_or_slug, is_published=True).first()

    if not problem:
        raise NotFoundError("Problem not found.")

    # Return problem data with sample test cases only (hidden cases are strictly suppressed)
    data = problem.to_dict(include_test_cases=True, include_hidden_tests=False)

    if g.current_user:
        from app.models.submission import UserProblemProgress
        up = UserProblemProgress.query.filter_by(user_id=g.current_user.id, problem_id=problem.id).first()
        data["user_status"] = up.status if up else "UNSOLVED"

    return success_response(data=data)

@problems_bp.route("", methods=["POST"])
@require_role("admin", "moderator")
def create_problem():
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    difficulty = (data.get("difficulty") or "EASY").upper()
    description = (data.get("description_markdown") or "").strip()
    input_format = (data.get("input_format") or "").strip()
    output_format = (data.get("output_format") or "").strip()
    constraints = (data.get("constraints") or "").strip()
    time_limit_ms = data.get("time_limit_ms", 2000)
    memory_limit_mb = data.get("memory_limit_mb", 128)
    starter_templates = data.get("starter_templates") or {}
    tag_names = data.get("tags") or []
    test_cases_data = data.get("test_cases") or []

    if not title or not description or difficulty not in ("EASY", "MEDIUM", "HARD"):
        raise ValidationError("Title, description, and valid difficulty (EASY, MEDIUM, HARD) are required.")

    base_slug = slugify(title)
    slug = base_slug
    counter = 1
    while Problem.query.filter_by(slug=slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    problem = Problem(
        title=title,
        slug=slug,
        difficulty=difficulty,
        description_markdown=description,
        input_format=input_format,
        output_format=output_format,
        constraints=constraints,
        time_limit_ms=time_limit_ms,
        memory_limit_mb=memory_limit_mb,
        starter_templates=starter_templates,
        created_by=g.current_user.id
    )

    for tag_name in tag_names:
        t_name = tag_name.strip().lower()
        if not t_name:
            continue
        t_slug = slugify(t_name)
        tag = Tag.query.filter_by(slug=t_slug).first()
        if not tag:
            tag = Tag(name=t_name, slug=t_slug)
            db.session.add(tag)
        problem.tags.append(tag)

    for i, tc in enumerate(test_cases_data):
        test_case = TestCase(
            input_data=tc.get("input_data", ""),
            expected_output=tc.get("expected_output", ""),
            is_sample=tc.get("is_sample", False),
            is_hidden=tc.get("is_hidden", True),
            explanation=tc.get("explanation"),
            order_index=i
        )
        problem.test_cases.append(test_case)

    db.session.add(problem)
    db.session.commit()
    return success_response(data=problem.to_dict(include_test_cases=True, include_hidden_tests=True), status_code=201)

@problems_bp.route("/<int:problem_id>", methods=["PUT"])
@require_role("admin", "moderator")
def update_problem(problem_id):
    problem = Problem.query.get(problem_id)
    if not problem:
        raise NotFoundError("Problem not found.")

    data = request.get_json() or {}
    if "title" in data:
        problem.title = data["title"].strip()
    if "difficulty" in data and data["difficulty"].upper() in ("EASY", "MEDIUM", "HARD"):
        problem.difficulty = data["difficulty"].upper()
    if "description_markdown" in data:
        problem.description_markdown = data["description_markdown"].strip()
    if "input_format" in data:
        problem.input_format = data["input_format"].strip()
    if "output_format" in data:
        problem.output_format = data["output_format"].strip()
    if "constraints" in data:
        problem.constraints = data["constraints"].strip()
    if "starter_templates" in data:
        problem.starter_templates = data["starter_templates"]
    if "is_published" in data:
        problem.is_published = bool(data["is_published"])

    db.session.commit()
    return success_response(data=problem.to_dict())

@problems_bp.route("/<int:problem_id>/test-cases", methods=["POST"])
@require_role("admin", "moderator")
def add_test_cases(problem_id):
    problem = Problem.query.get(problem_id)
    if not problem:
        raise NotFoundError("Problem not found.")

    data = request.get_json() or {}
    test_cases_data = data.get("test_cases") if isinstance(data.get("test_cases"), list) else [data]

    for tc in test_cases_data:
        test_case = TestCase(
            problem_id=problem.id,
            input_data=tc.get("input_data", ""),
            expected_output=tc.get("expected_output", ""),
            is_sample=tc.get("is_sample", False),
            is_hidden=tc.get("is_hidden", True),
            explanation=tc.get("explanation"),
            order_index=tc.get("order_index", len(problem.test_cases))
        )
        db.session.add(test_case)

    db.session.commit()
    return success_response(data={"message": f"Added test cases for problem {problem_id}."})

