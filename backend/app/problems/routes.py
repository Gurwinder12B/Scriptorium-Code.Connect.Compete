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

@problems_bp.route("/<id_or_slug>/hints", methods=["GET"])
@optional_auth
def get_problem_hints(id_or_slug):
    problem = None
    if id_or_slug.isdigit():
        problem = Problem.query.filter_by(id=int(id_or_slug), is_published=True).first()
    if not problem:
        problem = Problem.query.filter_by(slug=id_or_slug, is_published=True).first()

    if not problem:
        raise NotFoundError("Problem not found.")

    title_lower = problem.title.lower()

    # Generate progressive 4-level hints tailored to algorithmic family
    if "two sum" in title_lower:
        hints = [
            {
                "level": 1,
                "title": "Conceptual Intuition",
                "content": "A brute-force solution checks all pairs in O(N^2) time. Can you trade a small amount of extra memory (O(N)) to lookup required complement values in O(1) time?",
            },
            {
                "level": 2,
                "title": "Algorithmic Approach Breakdown",
                "content": "As you iterate through the list with index i and value num, the matching partner you need is (target - num). Check if this complement has already been stored in a hash map.",
            },
            {
                "level": 3,
                "title": "Edge Case & Invariant Checks",
                "content": "Be careful not to pair an element with itself! Storing the map mapping value -> index as you iterate forward naturally guarantees you only pair with an earlier element.",
            },
            {
                "level": 4,
                "title": "Pseudo-code Scaffold",
                "content": "seen = {}\nfor i, num in enumerate(nums):\n    diff = target - num\n    if diff in seen:\n        return [seen[diff], i]\n    seen[num] = i\nreturn []",
            },
        ]
    elif "palindrome" in title_lower:
        hints = [
            {
                "level": 1,
                "title": "Conceptual Intuition",
                "content": "A palindrome reads identical backwards and forwards. Notice negative numbers: does -121 read the same backwards (121-)?",
            },
            {
                "level": 2,
                "title": "Algorithmic Approach Breakdown",
                "content": "Negative numbers can never be palindromes due to the leading minus sign. For positive numbers, you can either compare string reversals or reverse the integer mathematically using modulo arithmetic.",
            },
            {
                "level": 3,
                "title": "Edge Case & Invariant Checks",
                "content": "Numbers ending in 0 (like 10, 20) cannot be palindromes unless the number itself is 0.",
            },
            {
                "level": 4,
                "title": "Pseudo-code Scaffold",
                "content": "if x < 0: return False\ns = str(x)\nreturn s == s[::-1]",
            },
        ]
    elif "parentheses" in title_lower:
        hints = [
            {
                "level": 1,
                "title": "Conceptual Intuition",
                "content": "Every time you encounter a closing bracket, it must match the most recently opened opening bracket. What Last-In-First-Out (LIFO) data structure models this?",
            },
            {
                "level": 2,
                "title": "Algorithmic Approach Breakdown",
                "content": "Use a Stack. Push opening brackets '(', '{', '[' onto the stack. When a closing bracket is seen, pop from the stack and verify that the types match.",
            },
            {
                "level": 3,
                "title": "Edge Case & Invariant Checks",
                "content": "What happens if a closing bracket appears and the stack is empty? (Invalid). What if all characters are processed and the stack is not empty? (Invalid).",
            },
            {
                "level": 4,
                "title": "Pseudo-code Scaffold",
                "content": "stack = []\nmatching = {')': '(', '}': '{', ']': '['}\nfor ch in s:\n    if ch in matching.values():\n        stack.append(ch)\n    elif ch in matching:\n        if not stack or stack.pop() != matching[ch]:\n            return False\nreturn len(stack) == 0",
            },
        ]
    else:
        hints = [
            {
                "level": 1,
                "title": "Conceptual Intuition",
                "content": f"Analyze the constraints and time complexity target for {problem.difficulty} problem: {problem.constraints or 'N <= 10^5'}. Look for invariants in the input structure.",
            },
            {
                "level": 2,
                "title": "Algorithmic Approach Breakdown",
                "content": "Consider whether sorting, a two-pointer sliding window, or dynamic programming memoization can eliminate redundant subproblem recalculations.",
            },
            {
                "level": 3,
                "title": "Edge Case & Invariant Checks",
                "content": "Test your logic against: empty inputs, single element lists, duplicate values, and minimum/maximum numeric overflow boundaries.",
            },
            {
                "level": 4,
                "title": "Pseudo-code Scaffold",
                "content": "# Initialize result accumulator / tracking state\nstate = initialize_state()\nfor element in input_stream:\n    state.update(element)\nreturn state.finalize()",
            },
        ]

    return success_response(data=hints)

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

