from datetime import datetime, timezone
from app.extensions import db

class Submission(db.Model):
    __tablename__ = "submissions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    problem_id = db.Column(db.Integer, db.ForeignKey("problems.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    language = db.Column(db.String(30), nullable=False) # 'python', 'javascript', 'cpp'
    source_code = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), nullable=False, default="QUEUED", index=True)
    # Statuses: QUEUED, PROCESSING, ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, MEMORY_LIMIT_EXCEEDED, COMPILATION_ERROR, RUNTIME_ERROR, INTERNAL_ERROR
    execution_time_ms = db.Column(db.Integer, nullable=True)
    memory_used_kb = db.Column(db.Integer, nullable=True)
    error_message = db.Column(db.Text, nullable=True)
    stdout_sample = db.Column(db.Text, nullable=True)
    is_simulated = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = db.relationship("User", back_populates="submissions")
    problem = db.relationship("Problem", back_populates="submissions")
    results = db.relationship("SubmissionResult", back_populates="submission", cascade="all, delete-orphan")

    def to_dict(self, include_code=True):
        data = {
            "id": self.id,
            "problem_id": self.problem_id,
            "problem_title": self.problem.title if self.problem else None,
            "problem_slug": self.problem.slug if self.problem else None,
            "user_id": self.user_id,
            "username": self.user.username if self.user else None,
            "language": self.language,
            "status": self.status,
            "execution_time_ms": self.execution_time_ms,
            "memory_used_kb": self.memory_used_kb,
            "error_message": self.error_message,
            "stdout_sample": self.stdout_sample,
            "is_simulated": self.is_simulated,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
        if include_code:
            data["source_code"] = self.source_code
        return data

class SubmissionResult(db.Model):
    __tablename__ = "submission_results"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    submission_id = db.Column(db.Integer, db.ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    test_case_id = db.Column(db.Integer, db.ForeignKey("test_cases.id", ondelete="CASCADE"), nullable=False)
    verdict = db.Column(db.String(30), nullable=False)
    execution_time_ms = db.Column(db.Integer, nullable=True)
    memory_used_kb = db.Column(db.Integer, nullable=True)
    actual_output = db.Column(db.Text, nullable=True)
    error_details = db.Column(db.Text, nullable=True)

    submission = db.relationship("Submission", back_populates="results")
    test_case = db.relationship("TestCase")

    def to_dict(self):
        return {
            "id": self.id,
            "submission_id": self.submission_id,
            "test_case_id": self.test_case_id,
            "verdict": self.verdict,
            "execution_time_ms": self.execution_time_ms,
            "memory_used_kb": self.memory_used_kb,
            "is_sample": self.test_case.is_sample if self.test_case else False
        }

class UserProblemProgress(db.Model):
    __tablename__ = "user_problem_progress"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    problem_id = db.Column(db.Integer, db.ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="ATTEMPTED") # 'ATTEMPTED', 'SOLVED'
    total_attempts = db.Column(db.Integer, nullable=False, default=1)
    first_solved_at = db.Column(db.DateTime, nullable=True)
    last_attempted_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint("user_id", "problem_id", name="uq_user_problem_progress"),
    )

    user = db.relationship("User", back_populates="progress_records")
    problem = db.relationship("Problem")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "problem_id": self.problem_id,
            "problem_title": self.problem.title if self.problem else None,
            "problem_difficulty": self.problem.difficulty if self.problem else None,
            "status": self.status,
            "total_attempts": self.total_attempts,
            "first_solved_at": self.first_solved_at.isoformat() if self.first_solved_at else None,
            "last_attempted_at": self.last_attempted_at.isoformat() if self.last_attempted_at else None
        }
