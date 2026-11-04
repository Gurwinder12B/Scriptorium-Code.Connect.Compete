from flask import current_app
from app.judge.adapter import JudgeAdapter
from app.judge.mock_judge import MockJudgeAdapter
from app.judge.judge0 import Judge0Adapter

def get_judge_adapter() -> JudgeAdapter:
    provider = current_app.config.get("JUDGE_PROVIDER", "mock").lower()
    if provider == "judge0":
        return Judge0Adapter()
    return MockJudgeAdapter()
