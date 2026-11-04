from flask import Blueprint, request, g
from app.extensions import db
from app.models.community import Question, Answer, Comment, Tag, Vote, slugify, question_tags
from app.models.user import User
from app.models.notification import Notification
from app.common.responses import success_response
from app.common.errors import ValidationError, NotFoundError, ForbiddenError
from app.common.decorators import require_auth, optional_auth

community_bp = Blueprint("community", __name__, url_prefix="/api/v1/community")

@community_bp.route("/questions", methods=["GET"])
@optional_auth
def list_questions():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 15, type=int), 100)
    sort = request.args.get("sort", "newest") # newest, votes, active, unanswered
    tag_slug = request.args.get("tag", "").strip()
    query_str = request.args.get("q", "").strip()

    query = Question.query.filter_by(is_hidden=False)

    if tag_slug:
        tag = Tag.query.filter_by(slug=tag_slug).first()
        if tag:
            query = query.filter(Question.tags.any(id=tag.id))
        else:
            query = query.filter(db.false())

    if query_str:
        search_filter = f"%{query_str}%"
        query = query.filter(Question.title.ilike(search_filter) | Question.content_markdown.ilike(search_filter))

    if sort == "votes":
        query = query.order_by(Question.vote_count.desc(), Question.id.desc())
    elif sort == "unanswered":
        query = query.filter(Question.answer_count == 0).order_by(Question.created_at.desc())
    elif sort == "active":
        query = query.order_by(Question.updated_at.desc(), Question.id.desc())
    else: # newest
        query = query.order_by(Question.created_at.desc(), Question.id.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    questions_data = [q.to_dict() for q in pagination.items]

    meta = {
        "page": page,
        "per_page": per_page,
        "total": pagination.total,
        "total_pages": pagination.pages
    }
    return success_response(data=questions_data, meta=meta)

@community_bp.route("/questions", methods=["POST"])
@require_auth
def create_question():
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    content = (data.get("content_markdown") or "").strip()
    tag_names = data.get("tags") or []

    errors = {}
    if not title or len(title) < 10 or len(title) > 255:
        errors["title"] = "Title must be between 10 and 255 characters."
    if not content or len(content) < 20:
        errors["content_markdown"] = "Question content must be at least 20 characters."

    if errors:
        raise ValidationError("Invalid question data.", details=errors)

    base_slug = slugify(title)
    slug = base_slug
    counter = 1
    while Question.query.filter_by(slug=slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    question = Question(
        author_id=g.current_user.id,
        title=title,
        slug=slug,
        content_markdown=content
    )
    db.session.add(question)

    # Process tags
    for tag_name in tag_names[:5]:
        t_name = tag_name.strip().lower()
        if not t_name:
            continue
        t_slug = slugify(t_name)
        tag = Tag.query.filter_by(slug=t_slug).first()
        if not tag:
            tag = Tag(name=t_name, slug=t_slug, usage_count=0)
            db.session.add(tag)
        tag.usage_count = (tag.usage_count or 0) + 1
        question.tags.append(tag)

    if g.current_user.profile:
        g.current_user.profile.questions_count += 1
        g.current_user.profile.points += 5

    db.session.commit()

    return success_response(data=question.to_dict(), status_code=201)

@community_bp.route("/questions/<int:question_id>", methods=["GET"])
@optional_auth
def get_question(question_id):
    question = Question.query.filter_by(id=question_id, is_hidden=False).first()
    if not question:
        raise NotFoundError(f"Question with ID {question_id} was not found.")

    question.view_count += 1
    db.session.commit()

    q_data = question.to_dict(include_answers=True)

    # Attach comments for question
    q_comments = Comment.query.filter_by(target_type="question", target_id=question.id, is_hidden=False).all()
    q_data["comments"] = [c.to_dict() for c in q_comments]

    # Attach comments for each answer
    for ans in q_data.get("answers", []):
        a_comments = Comment.query.filter_by(target_type="answer", target_id=ans["id"], is_hidden=False).all()
        ans["comments"] = [c.to_dict() for c in a_comments]

    # Include voter state if authenticated
    if g.current_user:
        q_vote = Vote.query.filter_by(user_id=g.current_user.id, target_type="question", target_id=question.id).first()
        q_data["user_vote"] = q_vote.value if q_vote else 0

        ans_ids = [a["id"] for a in q_data.get("answers", [])]
        if ans_ids:
            a_votes = Vote.query.filter(
                Vote.user_id == g.current_user.id,
                Vote.target_type == "answer",
                Vote.target_id.in_(ans_ids)
            ).all()
            vote_map = {v.target_id: v.value for v in a_votes}
            for ans in q_data.get("answers", []):
                ans["user_vote"] = vote_map.get(ans["id"], 0)

    return success_response(data=q_data)

@community_bp.route("/questions/<int:question_id>", methods=["PUT"])
@require_auth
def update_question(question_id):
    question = Question.query.get(question_id)
    if not question:
        raise NotFoundError("Question not found.")

    if question.author_id != g.current_user.id and g.current_user.role not in ("admin", "moderator"):
        raise ForbiddenError("You can only edit your own questions.")

    data = request.get_json() or {}
    if "title" in data:
        t = (data["title"] or "").strip()
        if len(t) < 10 or len(t) > 255:
            raise ValidationError("Title must be between 10 and 255 characters.")
        question.title = t
    if "content_markdown" in data:
        c = (data["content_markdown"] or "").strip()
        if len(c) < 20:
            raise ValidationError("Content must be at least 20 characters.")
        question.content_markdown = c

    db.session.commit()
    return success_response(data=question.to_dict())

@community_bp.route("/questions/<int:question_id>", methods=["DELETE"])
@require_auth
def delete_question(question_id):
    question = Question.query.get(question_id)
    if not question:
        raise NotFoundError("Question not found.")

    if question.author_id != g.current_user.id and g.current_user.role not in ("admin", "moderator"):
        raise ForbiddenError("You can only delete your own questions.")

    question.is_hidden = True
    db.session.commit()
    return success_response(data={"message": "Question successfully removed."})

@community_bp.route("/questions/<int:question_id>/answers", methods=["POST"])
@require_auth
def create_answer(question_id):
    question = Question.query.filter_by(id=question_id, is_hidden=False).first()
    if not question:
        raise NotFoundError("Question not found.")

    data = request.get_json() or {}
    content = (data.get("content_markdown") or "").strip()
    if not content or len(content) < 15:
        raise ValidationError("Answer content must be at least 15 characters.")

    answer = Answer(
        question_id=question.id,
        author_id=g.current_user.id,
        content_markdown=content
    )
    question.answer_count += 1

    if g.current_user.profile:
        g.current_user.profile.answers_count += 1
        g.current_user.profile.points += 10

    db.session.add(answer)
    db.session.flush()

    # Create notification for question author if someone else answered
    if question.author_id != g.current_user.id:
        notif = Notification(
            user_id=question.author_id,
            actor_id=g.current_user.id,
            event_type="ANSWER_POSTED",
            title="New Answer Received",
            message=f"{g.current_user.username} answered your question: '{question.title[:40]}...'",
            link_url=f"/community/questions/{question.id}"
        )
        db.session.add(notif)

    db.session.commit()
    return success_response(data=answer.to_dict(), status_code=201)

@community_bp.route("/answers/<int:answer_id>", methods=["PUT"])
@require_auth
def update_answer(answer_id):
    answer = Answer.query.get(answer_id)
    if not answer:
        raise NotFoundError("Answer not found.")

    if answer.author_id != g.current_user.id and g.current_user.role not in ("admin", "moderator"):
        raise ForbiddenError("You can only edit your own answers.")

    data = request.get_json() or {}
    content = (data.get("content_markdown") or "").strip()
    if not content or len(content) < 15:
        raise ValidationError("Answer content must be at least 15 characters.")

    answer.content_markdown = content
    db.session.commit()
    return success_response(data=answer.to_dict())

@community_bp.route("/answers/<int:answer_id>", methods=["DELETE"])
@require_auth
def delete_answer(answer_id):
    answer = Answer.query.get(answer_id)
    if not answer:
        raise NotFoundError("Answer not found.")

    if answer.author_id != g.current_user.id and g.current_user.role not in ("admin", "moderator"):
        raise ForbiddenError("You can only delete your own answers.")

    answer.is_hidden = True
    if answer.question and answer.question.answer_count > 0:
        answer.question.answer_count -= 1

    db.session.commit()
    return success_response(data={"message": "Answer removed successfully."})

@community_bp.route("/questions/<int:question_id>/accept", methods=["POST"])
@require_auth
def accept_answer(question_id):
    question = Question.query.filter_by(id=question_id, is_hidden=False).first()
    if not question:
        raise NotFoundError("Question not found.")

    if question.author_id != g.current_user.id:
        raise ForbiddenError("Only the author of the question can accept an answer.")

    data = request.get_json() or {}
    answer_id = data.get("answer_id")
    answer = Answer.query.filter_by(id=answer_id, question_id=question.id, is_hidden=False).first()
    if not answer:
        raise NotFoundError("Answer not found for this question.")

    # Unaccept previous accepted answer if exists
    if question.accepted_answer_id:
        prev = Answer.query.get(question.accepted_answer_id)
        if prev:
            prev.is_accepted = False

    # Accept new answer
    answer.is_accepted = True
    question.accepted_answer_id = answer.id
    question.is_solved = True

    # Award points to answer author
    if answer.author and answer.author.profile:
        answer.author.profile.points += 15

    # Send notification to answer author
    if answer.author_id != g.current_user.id:
        notif = Notification(
            user_id=answer.author_id,
            actor_id=g.current_user.id,
            event_type="ANSWER_ACCEPTED",
            title="Answer Accepted!",
            message=f"Your answer to '{question.title[:40]}...' was accepted as the solution!",
            link_url=f"/community/questions/{question.id}"
        )
        db.session.add(notif)

    db.session.commit()
    return success_response(data={"message": "Answer accepted.", "accepted_answer_id": answer.id})

@community_bp.route("/votes", methods=["POST"])
@require_auth
def cast_vote():
    data = request.get_json() or {}
    target_type = data.get("target_type") # 'question' or 'answer'
    target_id = data.get("target_id")
    value = data.get("value") # 1, -1, or 0 (to remove vote)

    if target_type not in ("question", "answer") or not target_id or value not in (1, -1, 0):
        raise ValidationError("Invalid vote parameters.")

    target = None
    if target_type == "question":
        target = Question.query.filter_by(id=target_id, is_hidden=False).first()
    else:
        target = Answer.query.filter_by(id=target_id, is_hidden=False).first()

    if not target:
        raise NotFoundError(f"{target_type.capitalize()} not found.")

    # Prevent self-voting
    if target.author_id == g.current_user.id:
        raise ForbiddenError("You cannot vote on your own post.")

    existing_vote = Vote.query.filter_by(
        user_id=g.current_user.id,
        target_type=target_type,
        target_id=target_id
    ).first()

    diff = 0
    if value == 0:
        if existing_vote:
            diff = -existing_vote.value
            db.session.delete(existing_vote)
    elif existing_vote:
        diff = value - existing_vote.value
        existing_vote.value = value
    else:
        diff = value
        new_vote = Vote(
            user_id=g.current_user.id,
            target_type=target_type,
            target_id=target_id,
            value=value
        )
        db.session.add(new_vote)

    target.vote_count += diff
    if target.author and target.author.profile and diff != 0:
        target.author.profile.points += (diff * 2)

    db.session.commit()
    return success_response(data={"vote_count": target.vote_count, "user_vote": value})

@community_bp.route("/comments", methods=["POST"])
@require_auth
def create_comment():
    data = request.get_json() or {}
    target_type = data.get("target_type")
    target_id = data.get("target_id")
    content = (data.get("content") or "").strip()

    if target_type not in ("question", "answer") or not target_id:
        raise ValidationError("Target type and ID are required.")
    if not content or len(content) < 3 or len(content) > 1000:
        raise ValidationError("Comment content must be between 3 and 1000 characters.")

    comment = Comment(
        author_id=g.current_user.id,
        target_type=target_type,
        target_id=target_id,
        content=content
    )
    db.session.add(comment)
    db.session.commit()
    return success_response(data=comment.to_dict(), status_code=201)

@community_bp.route("/tags", methods=["GET"])
def get_tags():
    tags = Tag.query.order_by(Tag.usage_count.desc()).all()
    return success_response(data=[t.to_dict() for t in tags])
