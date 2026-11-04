from tests.conftest import auth_headers
from app.models.problem import Problem, TestCase
from app.models.submission import UserProblemProgress
from app.extensions import db

def test_problem_hidden_test_cases_privacy(client, test_admin, test_user, app):
    # Admin creates problem with 1 sample test case and 1 hidden test case
    admin_headers = auth_headers(test_admin)
    payload = {
        "title": "Reverse String",
        "difficulty": "EASY",
        "description_markdown": "Write a function that reverses a string.",
        "input_format": "A single line containing string",
        "output_format": "The reversed string",
        "constraints": "1 <= s.length <= 10^5",
        "test_cases": [
            {"input_data": "hello", "expected_output": "olleh", "is_sample": True, "is_hidden": False, "explanation": "Sample 1"},
            {"input_data": "supersecretinput", "expected_output": "tupnitercesrepus", "is_sample": False, "is_hidden": True}
        ]
    }
    create_res = client.post("/api/v1/problems", json=payload, headers=admin_headers)
    assert create_res.status_code == 201
    prob_id = create_res.get_json()["data"]["id"]

    # Public endpoint query
    pub_res = client.get(f"/api/v1/problems/{prob_id}")
    assert pub_res.status_code == 200
    pub_data = pub_res.get_json()["data"]

    # Sample test cases are present
    assert len(pub_data["sample_test_cases"]) == 1
    assert pub_data["sample_test_cases"][0]["input_data"] == "hello"

    # Hidden test case MUST NOT appear anywhere in the response!
    assert "supersecretinput" not in str(pub_data)

def test_code_submission_and_progress_tracking(client, test_user, test_admin):
    # 1. Admin creates a problem
    admin_headers = auth_headers(test_admin)
    prob_payload = {
        "title": "Add Two Numbers",
        "difficulty": "EASY",
        "description_markdown": "Return sum of two numbers.",
        "input_format": "Two space-separated integers",
        "output_format": "Single integer sum",
        "constraints": "0 <= a, b <= 1000",
        "test_cases": [
            {"input_data": "3 5", "expected_output": "8", "is_sample": True, "is_hidden": False}
        ]
    }
    create_res = client.post("/api/v1/problems", json=prob_payload, headers=admin_headers)
    prob_id = create_res.get_json()["data"]["id"]

    # 2. User submits accepted solution
    user_headers = auth_headers(test_user)
    sub_payload = {
        "problem_id": prob_id,
        "language": "python",
        "source_code": "import sys\na, b = map(int, sys.stdin.read().split())\nprint(a + b)"
    }
    sub_res = client.post("/api/v1/submissions", json=sub_payload, headers=user_headers)
    assert sub_res.status_code == 201
    sub_data = sub_res.get_json()["data"]
    assert sub_data["status"] == "ACCEPTED"
    assert sub_data["is_simulated"] is True

    # 3. Check progress summary (verified server-side)
    prog_res = client.get("/api/v1/progress/summary", headers=user_headers)
    assert prog_res.status_code == 200
    prog_data = prog_res.get_json()["data"]
    assert prog_data["solved_count"] == 1
    assert prog_data["points"] == 10  # Easy problem awarded 10 points

    # 4. User submits again (second accepted submission)
    sub_res_2 = client.post("/api/v1/submissions", json=sub_payload, headers=user_headers)
    assert sub_res_2.status_code == 201

    # Check that points and solved_count DID NOT double count!
    prog_res_2 = client.get("/api/v1/progress/summary", headers=user_headers)
    prog_data_2 = prog_res_2.get_json()["data"]
    assert prog_data_2["solved_count"] == 1
    assert prog_data_2["points"] == 10
