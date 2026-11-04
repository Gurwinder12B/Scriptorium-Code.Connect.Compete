import time
from app.judge.adapter import JudgeAdapter, JudgeExecutionResult, TestCaseResult

class MockJudgeAdapter(JudgeAdapter):
    """
    Deterministic simulated judge adapter for development and testing.
    Safely evaluates submissions without invoking external infrastructure.
    Always explicitly marks is_simulated=True so users and API clients know
    this was evaluated by the development simulator.
    """

    def evaluate(self, language: str, source_code: str, test_cases: list, time_limit_ms: int, memory_limit_mb: int) -> JudgeExecutionResult:
        if not source_code or not source_code.strip():
            return JudgeExecutionResult(
                verdict="COMPILATION_ERROR",
                execution_time_ms=0,
                memory_used_kb=0,
                test_case_results=[],
                error_message="Source code is empty.",
                is_simulated=True
            )

        # Detect intentional test failure keywords for developer testing
        lower_code = source_code.lower()
        if "syntax_error" in lower_code or "compile_error" in lower_code:
            return JudgeExecutionResult(
                verdict="COMPILATION_ERROR",
                execution_time_ms=10,
                memory_used_kb=1024,
                test_case_results=[],
                error_message="SyntaxError: invalid syntax on line 1",
                is_simulated=True
            )

        if "time_limit_exceeded" in lower_code or "infinite_loop" in lower_code:
            results = []
            for tc in test_cases:
                results.append(TestCaseResult(
                    test_case_id=tc.id,
                    verdict="TIME_LIMIT_EXCEEDED",
                    execution_time_ms=time_limit_ms + 100,
                    memory_used_kb=32000,
                    error_details="Time limit exceeded (> 2000ms)",
                    is_sample=tc.is_sample
                ))
            return JudgeExecutionResult(
                verdict="TIME_LIMIT_EXCEEDED",
                execution_time_ms=time_limit_ms + 100,
                memory_used_kb=32000,
                test_case_results=results,
                error_message=f"Execution timed out after {time_limit_ms}ms.",
                is_simulated=True
            )

        if "runtime_error" in lower_code or "division_by_zero" in lower_code:
            results = []
            for tc in test_cases:
                results.append(TestCaseResult(
                    test_case_id=tc.id,
                    verdict="RUNTIME_ERROR",
                    execution_time_ms=25,
                    memory_used_kb=14000,
                    error_details="ZeroDivisionError: division by zero",
                    is_sample=tc.is_sample
                ))
            return JudgeExecutionResult(
                verdict="RUNTIME_ERROR",
                execution_time_ms=25,
                memory_used_kb=14000,
                test_case_results=results,
                error_message="Runtime Error: Process exited with return code 1",
                is_simulated=True
            )

        if "wrong_answer" in lower_code:
            results = []
            for i, tc in enumerate(test_cases):
                v = "ACCEPTED" if i == 0 else "WRONG_ANSWER"
                results.append(TestCaseResult(
                    test_case_id=tc.id,
                    verdict=v,
                    execution_time_ms=30,
                    memory_used_kb=12000,
                    actual_output="Wrong output value" if v == "WRONG_ANSWER" else tc.expected_output.strip(),
                    is_sample=tc.is_sample
                ))
            return JudgeExecutionResult(
                verdict="WRONG_ANSWER",
                execution_time_ms=30,
                memory_used_kb=12000,
                test_case_results=results,
                error_message="Test case 2 failed: expected output does not match actual output.",
                stdout_sample="Wrong output value\n",
                is_simulated=True
            )

        # Standard deterministic behavior: test cases pass
        results = []
        max_time = 35
        max_mem = 14500
        first_sample_stdout = None

        for tc in test_cases:
            res = TestCaseResult(
                test_case_id=tc.id,
                verdict="ACCEPTED",
                execution_time_ms=35,
                memory_used_kb=14500,
                actual_output=tc.expected_output.strip(),
                is_sample=tc.is_sample
            )
            results.append(res)
            if tc.is_sample and first_sample_stdout is None:
                first_sample_stdout = tc.expected_output.strip()

        return JudgeExecutionResult(
            verdict="ACCEPTED",
            execution_time_ms=max_time,
            memory_used_kb=max_mem,
            test_case_results=results,
            stdout_sample=first_sample_stdout,
            is_simulated=True
        )

