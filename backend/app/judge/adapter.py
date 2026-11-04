from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class TestCaseResult:
    test_case_id: int
    verdict: str  # ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, MEMORY_LIMIT_EXCEEDED, RUNTIME_ERROR, COMPILATION_ERROR
    execution_time_ms: int
    memory_used_kb: int
    actual_output: Optional[str] = None
    error_details: Optional[str] = None
    is_sample: bool = False

@dataclass
class JudgeExecutionResult:
    verdict: str
    execution_time_ms: int
    memory_used_kb: int
    test_case_results: List[TestCaseResult]
    error_message: Optional[str] = None
    stdout_sample: Optional[str] = None
    is_simulated: bool = False

class JudgeAdapter(ABC):
    @abstractmethod
    def evaluate(self, language: str, source_code: str, test_cases: list, time_limit_ms: int, memory_limit_mb: int) -> JudgeExecutionResult:
        pass
