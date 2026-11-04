# SCRIPTORIUM — Architecture and Technical Decisions (DECISIONS.md)

**Document Version:** 1.0  
**Date:** 4 November 2026  
**Status:** Approved Technical Baseline  

---

## 1. Document Conflicts & Harmonization

During the repository and requirements audit, slight differences were identified across the baseline documents (`PRD.md`, `SRS.md`, `Systemdesign.md`, `TDD.md`, and `Phases.md`). The following decisions harmonize these requirements:

### Decision 1: Authentication Mechanism (Cookie Sessions vs. Bearer Tokens)
- **Context:** `SRS.md` references JWT tokens while `TDD.md` recommends HttpOnly secure session cookies to mitigate XSS-based token theft.
- **Decision:** Implement signed JWT access tokens with dual support:
  1. Standard `Authorization: Bearer <token>` header for stateless REST clients and programmatic integration.
  2. Secure, HttpOnly cookie storage fallback for web browser requests.
- **Impact:** Prevents script-accessible token leakage in browsers while keeping the REST API clean, testable, and mobile-ready.

### Decision 2: Database Engine & Local Development Fallback
- **Context:** Project specifications require MySQL 8 with `utf8mb4` encoding in production. In local developer environments or CI pipelines where an external MySQL service may not be running immediately, hard-failing prevents testing.
- **Decision:** Use SQLAlchemy with dynamic database URL configuration via `DATABASE_URL`. In production and staging, default to `mysql+pymysql://<user>:<pass>@<host>:<port>/<dbname>?charset=utf8mb4`. If `DATABASE_URL` is omitted or set to SQLite during local tests, seamlessly use SQLite with foreign key enforcement enabled (`PRAGMA foreign_keys=ON`).
- **Impact:** Complete portability across developer workstations, automated test suites, and production MySQL 8 instances without code changes.

### Decision 3: Code Judging & Sandbox Isolation
- **Context:** Untrusted user code must never execute inside the web process. Running Judge0 requires Docker with specialized privileged container configurations or external API keys.
- **Decision:** Implement a clean **Judge Provider Adapter** architecture (`JudgeAdapter` interface):
  - `MockJudgeAdapter`: Deterministic, local sandbox emulator used for development, offline testing, and CI. Explicitly labels results as simulated so developers know no external worker was invoked.
  - `Judge0Adapter`: Production-grade adapter sending submissions to an isolated Judge0 API (self-hosted or cloud), enforcing strict memory, CPU, wall-clock, and network limits.
- **Impact:** Decoupled execution architecture, robust testability, zero vendor lock-in, and strict security isolation.

### Decision 4: Voting & Scoring Policy
- **Context:** Community voting must prevent vote duplication and gaming.
- **Decision:**
  - One vote per user per entity (question or answer) enforced by a compound unique constraint `(user_id, target_type, target_id)`.
  - Self-voting is disallowed on one's own questions or answers.
  - Vote changes (upvote -> remove vote) update the cached vote total atomically inside a database transaction.
- **Impact:** Guaranteed data integrity and tamper-proof vote tallying.

### Decision 5: Problem Solving & Progress Tracking
- **Context:** Users can submit multiple attempts. Solving the same problem multiple times must not award duplicate points.
- **Decision:**
  - User problem progress is tracked in `user_problem_progress` with `(user_id, problem_id)` uniqueness.
  - First `ACCEPTED` verdict marks the problem as `SOLVED` and awards base difficulty points (Easy: 10, Medium: 20, Hard: 30). Subsequent accepted submissions update execution metrics and solve count, but do not award duplicate points.
- **Impact:** Accurate, server-verified leaderboards resistant to spam submissions.

---

## 2. Default Implementation Values

| Configuration Parameter | Default Value | Notes |
|---|---|---|
| API Version Prefix | `/api/v1` | All REST endpoints are versioned |
| Default Page Size | 15 items | Max allowed: 100 items per page |
| Password Hashing | Werkzeug pbkdf2:sha256 (600,000 iterations) / bcrypt | Industry standard, salted, secure |
| Max Code Submission Size | 64 KB | Rejects oversized payloads |
| Submission Timeout | 5.0 seconds (wall clock) | Guard against infinite loops |
| Submission Memory Limit | 128 MB | Sandboxed execution constraint |
| Supported MVP Languages | Python (`python3`), JavaScript (`node`), C++ (`cpp`) | Extensible via language registry |

---

## 3. Technology Matrix

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router 6, Monaco Editor (`@monaco-editor/react`).
- **Backend:** Python 3.10+, Flask, Flask-SQLAlchemy, Flask-Migrate, Flask-CORS, PyMySQL, Cryptography, Pytest.
- **Database:** MySQL 8 (`utf8mb4`) with SQLite fallback for automated unit/integration tests.
- **DevOps:** Docker Compose, multi-stage Dockerfiles, GitHub Actions compatible scripts.
