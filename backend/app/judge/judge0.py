import requests
from flask import current_app
from app.judge.adapter import JudgeAdapter, JudgeExecutionResult, TestCaseResult

# Common Judge0 Language IDs
JUDGE0_LANGUAGE_IDS = {
    "python": 71,       # Python (3.8.1)
    "python3": 71,
    "javascript": 63,   # JavaScript (Node.js 12.14.0)
    "node": 63,
    "cpp": 54,          # C++ (GCC 9.2.0)
    "c": 50,            # C (GCC 9.2.0)
    "java": 62          # Java (OpenJDK 13.0.1)
}

class Judge0Adapter(JudgeAdapter):
    """
    Production-grade adapter for Judge0 CE / Extra CE API.
    Sends code and test cases through Judge0 isolated worker API.
    """

    def __init__(self, api_url=None, api_key=None):
        self.api_url = api_url or current_app.config.get("JUDGE0_API_URL", "http://localhost:2358")
        self.api_key = api_key or current_app.config.get("JUDGE0_API_KEY", "")

    def evaluate(self, language: str, source_code: str, test_cases: list, time_limit_ms: int, memory_limit_mb: int) -> JudgeExecutionResult:
        lang_id = JUDGE0_LANGUAGE_IDS.get(language.lower(), 71)
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["X-Auth-Token"] = self.api_key

        overall_verdict = "ACCEPTED"
        max_time = 0
        max_memory = 0
        results = []
        error_msg = None
        stdout_sample = None

        cpu_time_limit_sec = max(1.0, time_limit_ms / 1000.0)
        memory_limit_kb = memory_limit_mb * 1024

        for tc in test_cases:
            payload = {
                "source_code": source_code,
                "language_id": lang_id,
                "stdin": tc.input_data,
                "expected_output": tc.expected_output,
                "cpu_time_limit": cpu_time_limit_sec,
                "memory_limit": memory_limit_kb
            }
            try:
                url = f"{self.api_url.rstrip('/')}/submissions?wait=true"
                response = requests.post(url, json=payload, headers=headers, timeout=15)
                if response.status_code not in (200, 201):
                    return JudgeExecutionResult(
                        verdict="INTERNAL_ERROR",
                        execution_time_ms=0,
                        memory_used_kb=0,
                        test_case_results=[],
                        error_message=f"Judge service returned HTTP {response.status_code}",
                        is_simulated=False
                    )

                data = response.json()
                status_id = data.get("status", {}).get("id")
                # Judge0 Status IDs:
                # 3 = Accepted
                # 4 = Wrong Answer
                # 5 = Time Limit Exceeded
                # 6 = Compilation Error
                # 7-12 = Runtime Error
                # 13 = Internal Error
                verdict_map = {
                    3: "ACCEPTED",
                    4: "WRONG_ANSWER",
                    5: "TIME_LIMIT_EXCEEDED",
                    6: "COMPILATION_ERROR",
                    7: "RUNTIME_ERROR",
                    8: "RUNTIME_ERROR",
                    9: "RUNTIME_ERROR",
                    10: "RUNTIME_ERROR",
                    11: "RUNTIME_ERROR",
                    12: "RUNTIME_ERROR",
                    13: "INTERNAL_ERROR"
                }
                tc_verdict = verdict_map.get(status_id, "RUNTIME_ERROR")
                tc_time = int(float(data.get("time") or 0) * 1000)
                tc_mem = int(data.get("memory") or 0)
                actual_out = data.get("stdout")
                compile_err = data.get("compile_output")
                stderr = data.get("stderr")

                max_time = max(max_time, tc_time)
                max_memory = max(max_memory, tc_mem)

                if tc.is_sample and stdout_sample is None:
                    stdout_sample = actual_out

                if tc_verdict != "ACCEPTED" and overall_verdict == "ACCEPTED":
                    overall_verdict = tc_verdict
                    error_msg = compile_err or stderr or data.get("status", {}).get("description")

                results.append(TestCaseResult(
                    test_case_id=tc.id,
                    verdict=tc_verdict,
                    execution_time_ms=tc_time,
                    memory_used_kb=tc_mem,
                    actual_output=actual_out if tc.is_sample else None,
                    error_details=stderr,
                    is_sample=tc.is_sample
                ))

                if overall_verdict in ("COMPILATION_ERROR", "INTERNAL_ERROR"):
                    break

            except requests.RequestException as exc:
                return JudgeExecutionResult(
                    verdict="INTERNAL_ERROR",
                    execution_time_ms=0,
                    memory_used_kb=0,
                    test_case_results=[],
                    error_message=f"Could not connect to judge service: {str(exc)}",
                    is_simulated=False
                )

        return JudgeExecutionResult(
            verdict=overall_verdict,
            execution_time_ms=max_time,
            memory_used_kb=max_memory,
            test_case_results=results,
            error_message=error_msg,
            stdout_sample=stdout_sample,
            is_simulated=False
        )

