from datetime import datetime, timezone
import json
from app.extensions import db
from app.models.community import Tag

problem_tags = db.Table(
    "problem_tags",
    db.Column("problem_id", db.Integer, db.ForeignKey("problems.id", ondelete="CASCADE"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
)

class TestCase(db.Model):
    __tablename__ = "test_cases"
    __test__ = False  # Prevent pytest from treating DB model as a test suite

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    problem_id = db.Column(db.Integer, db.ForeignKey("problems.id", ondelete="CASCADE"), nullable=False, index=True)
    input_data = db.Column(db.Text, nullable=False)
    expected_output = db.Column(db.Text, nullable=False)
    is_sample = db.Column(db.Boolean, nullable=False, default=False)
    is_hidden = db.Column(db.Boolean, nullable=False, default=False)
    explanation = db.Column(db.Text, nullable=True)
    order_index = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    problem = db.relationship("Problem", back_populates="test_cases")

    def to_dict(self, include_hidden=False):
        # Strict security protection: Never reveal hidden test cases unless explicitly authorized admin
        if self.is_hidden and not include_hidden:
            return None
        return {
            "id": self.id,
            "problem_id": self.problem_id,
            "input_data": self.input_data,
            "expected_output": self.expected_output,
            "is_sample": self.is_sample,
            "is_hidden": self.is_hidden,
            "explanation": self.explanation,
            "order_index": self.order_index
        }

class Problem(db.Model):
    __tablename__ = "problems"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    slug = db.Column(db.String(220), unique=True, nullable=False, index=True)
    difficulty = db.Column(db.String(20), nullable=False, default="EASY", index=True) # EASY, MEDIUM, HARD
    description_markdown = db.Column(db.Text, nullable=False)
    input_format = db.Column(db.Text, nullable=False)
    output_format = db.Column(db.Text, nullable=False)
    constraints = db.Column(db.Text, nullable=False)
    time_limit_ms = db.Column(db.Integer, nullable=False, default=2000)
    memory_limit_mb = db.Column(db.Integer, nullable=False, default=128)
    starter_templates_json = db.Column(db.Text, nullable=False, default="{}")
    is_published = db.Column(db.Boolean, nullable=False, default=True)
    acceptance_rate = db.Column(db.Float, nullable=False, default=0.0)
    total_submissions = db.Column(db.Integer, nullable=False, default=0)
    accepted_submissions = db.Column(db.Integer, nullable=False, default=0)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    test_cases = db.relationship("TestCase", back_populates="problem", cascade="all, delete-orphan", order_by="TestCase.order_index")
    tags = db.relationship("Tag", secondary=problem_tags, backref="problems")
    submissions = db.relationship("Submission", back_populates="problem", cascade="all, delete-orphan")

    @property
    def starter_templates(self):
        try:
            return json.loads(self.starter_templates_json) if self.starter_templates_json else {}
        except Exception:
            return {}

    @starter_templates.setter
    def starter_templates(self, value):
        self.starter_templates_json = json.dumps(value) if isinstance(value, dict) else str(value)

    def to_dict(self, include_test_cases=False, include_hidden_tests=False):
        data = {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "difficulty": self.difficulty,
            "description_markdown": self.description_markdown,
            "input_format": self.input_format,
            "output_format": self.output_format,
            "constraints": self.constraints,
            "time_limit_ms": self.time_limit_ms,
            "memory_limit_mb": self.memory_limit_mb,
            "starter_templates": self.starter_templates,
            "is_published": self.is_published,
            "acceptance_rate": round(self.acceptance_rate, 1),
            "total_submissions": self.total_submissions,
            "accepted_submissions": self.accepted_submissions,
            "tags": [t.to_dict() for t in self.tags],
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
        if include_test_cases:
            # Public requests only get sample test cases
            cases = [
                tc.to_dict(include_hidden=include_hidden_tests)
                for tc in self.test_cases
                if include_hidden_tests or tc.is_sample
            ]
            data["sample_test_cases"] = [c for c in cases if c is not None]
        return data
