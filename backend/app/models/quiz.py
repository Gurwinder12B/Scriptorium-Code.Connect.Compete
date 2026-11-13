import secrets
from datetime import datetime, timezone
from app.extensions import db

class Quiz(db.Model):
    __tablename__ = "quizzes"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    slug = db.Column(db.String(220), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(80), nullable=False, default="Algorithms & CS", index=True)
    cover_image_url = db.Column(db.String(500), nullable=True)
    
    # Customization parameters
    duration_minutes = db.Column(db.Integer, nullable=False, default=30)
    max_teams = db.Column(db.Integer, nullable=True, default=50)  # 0 or None for unlimited
    min_team_size = db.Column(db.Integer, nullable=False, default=1)
    max_team_size = db.Column(db.Integer, nullable=False, default=4)
    total_points = db.Column(db.Integer, nullable=False, default=100)
    passing_score = db.Column(db.Integer, nullable=False, default=50)
    shuffle_questions = db.Column(db.Boolean, nullable=False, default=False)
    allow_review = db.Column(db.Boolean, nullable=False, default=True)  # Reveal answer key after submission
    
    # Scheduling & status
    status = db.Column(db.String(30), nullable=False, default="LIVE", index=True)  # 'UPCOMING', 'LIVE', 'ENDED', 'DRAFT'
    start_time = db.Column(db.DateTime, nullable=True)
    end_time = db.Column(db.DateTime, nullable=True)
    is_published = db.Column(db.Boolean, nullable=False, default=True, index=True)

    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    creator = db.relationship("User", foreign_keys=[created_by_id])
    questions = db.relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan", order_by="QuizQuestion.order_index.asc(), QuizQuestion.id.asc()")
    teams = db.relationship("QuizTeam", back_populates="quiz", cascade="all, delete-orphan", order_by="QuizTeam.created_at.desc()")
    submissions = db.relationship("QuizSubmission", back_populates="quiz", cascade="all, delete-orphan", order_by="QuizSubmission.score.desc(), QuizSubmission.time_taken_seconds.asc()")

    def to_dict(self, include_questions=False, include_answer_key=False):
        data = {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "description": self.description,
            "category": self.category,
            "cover_image_url": self.cover_image_url or "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
            "duration_minutes": self.duration_minutes,
            "max_teams": self.max_teams,
            "min_team_size": self.min_team_size,
            "max_team_size": self.max_team_size,
            "total_points": self.total_points,
            "passing_score": self.passing_score,
            "shuffle_questions": self.shuffle_questions,
            "allow_review": self.allow_review,
            "status": self.status,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "is_published": self.is_published,
            "questions_count": len(self.questions),
            "teams_count": len(self.teams),
            "submissions_count": len(self.submissions),
            "created_by": self.creator.username if self.creator else "System Admin",
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_questions:
            data["questions"] = [q.to_dict(include_answer_key=include_answer_key) for q in self.questions]
        return data


class QuizQuestion(db.Model):
    __tablename__ = "quiz_questions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(30), nullable=False, default="multiple_choice")  # 'multiple_choice', 'true_false'
    options = db.Column(db.JSON, nullable=False)  # List of dicts: [{"id": "A", "text": "Option 1"}, ...]
    correct_answer = db.Column(db.String(255), nullable=False)  # Answer Key identifier: e.g. "A"
    points = db.Column(db.Integer, nullable=False, default=10)
    explanation = db.Column(db.Text, nullable=True)  # Answer Key rationale
    order_index = db.Column(db.Integer, nullable=False, default=0)

    quiz = db.relationship("Quiz", back_populates="questions")

    def to_dict(self, include_answer_key=False):
        res = {
            "id": self.id,
            "quiz_id": self.quiz_id,
            "question_text": self.question_text,
            "question_type": self.question_type,
            "options": self.options,
            "points": self.points,
            "order_index": self.order_index,
        }
        if include_answer_key:
            res["correct_answer"] = self.correct_answer
            res["explanation"] = self.explanation
        return res


class QuizTeam(db.Model):
    __tablename__ = "quiz_teams"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False, index=True)
    join_code = db.Column(db.String(32), unique=True, nullable=False, default=lambda: secrets.token_hex(4).upper())
    leader_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    leader_name = db.Column(db.String(120), nullable=False)
    members = db.Column(db.JSON, nullable=False, default=list)  # [{"name": "Alex", "email": "...", "role": "member"}]
    status = db.Column(db.String(30), nullable=False, default="REGISTERED")  # 'REGISTERED', 'IN_PROGRESS', 'SUBMITTED'
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    quiz = db.relationship("Quiz", back_populates="teams")
    leader = db.relationship("User", foreign_keys=[leader_id])

    def to_dict(self):
        return {
            "id": self.id,
            "quiz_id": self.quiz_id,
            "name": self.name,
            "join_code": self.join_code,
            "leader_id": self.leader_id,
            "leader_name": self.leader_name,
            "members": self.members or [],
            "member_count": len(self.members or []) + 1,  # Members + leader
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class QuizSubmission(db.Model):
    __tablename__ = "quiz_submissions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    team_id = db.Column(db.Integer, db.ForeignKey("quiz_teams.id", ondelete="SET NULL"), nullable=True, index=True)
    team_name = db.Column(db.String(120), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Submitted answers mapping: {"question_id": "selected_option_id"}
    answers = db.Column(db.JSON, nullable=False, default=dict)
    
    # Grading results
    score = db.Column(db.Integer, nullable=False, default=0)
    total_points = db.Column(db.Integer, nullable=False, default=0)
    percentage = db.Column(db.Float, nullable=False, default=0.0)
    correct_count = db.Column(db.Integer, nullable=False, default=0)
    incorrect_count = db.Column(db.Integer, nullable=False, default=0)
    time_taken_seconds = db.Column(db.Integer, nullable=False, default=0)
    is_graded = db.Column(db.Boolean, nullable=False, default=True)
    
    submitted_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    quiz = db.relationship("Quiz", back_populates="submissions")
    team = db.relationship("QuizTeam")
    user = db.relationship("User", foreign_keys=[user_id])

    def to_dict(self, include_answers=True):
        return {
            "id": self.id,
            "quiz_id": self.quiz_id,
            "team_id": self.team_id,
            "team_name": self.team_name,
            "user_id": self.user_id,
            "score": self.score,
            "total_points": self.total_points,
            "percentage": round(self.percentage, 1),
            "correct_count": self.correct_count,
            "incorrect_count": self.incorrect_count,
            "time_taken_seconds": self.time_taken_seconds,
            "is_graded": self.is_graded,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "answers": self.answers if include_answers else None,
        }
