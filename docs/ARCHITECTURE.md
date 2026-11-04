# SCRIPTORIUM — System Architecture Specification (ARCHITECTURE.md)

**Document Version:** 1.0  
**Date:** 4 November 2026  
**Status:** Approved Architecture Specification  

---

## 1. System Overview

SCRIPTORIUM is an integrated web application combining a developer discussion community and an online coding practice platform.

```
+----------------------------------------------------------------------------------+
|                                    CLIENT TIER                                   |
|  React 18 + TypeScript + Vite + Tailwind CSS + Monaco Editor + TanStack Query    |
+----------------------------------------------------------------------------------+
                                         |  HTTPS / JSON (/api/v1)
                                         v
+----------------------------------------------------------------------------------+
|                                APPLICATION TIER                                  |
|  Flask Modular Monolith (Factory Pattern, Blueprints, Security Middlewares)       |
|  - Auth & RBAC (JWT & Secure Cookies)                                            |
|  - Community Engine (Questions, Answers, Comments, Voting, Tags)                 |
|  - Coding Problem Catalog & TestCase Manager                                      |
|  - Submission Coordinator & Progress Tracking                                    |
|  - Moderation & Administration Engine                                            |
+----------------------------------------------------------------------------------+
               |                                            |
               v                                            v
+------------------------------------+    +----------------------------------------+
|             DATA TIER              |    |           JUDGE SANDBOX TIER           |
|  MySQL 8 (InnoDB, utf8mb4)         |    |  Abstract Judge Provider Adapter       |
|  SQLAlchemy 2.0 ORM                |    |  - MockJudgeAdapter (Deterministic CI) |
|  Flask-Migrate (Alembic)           |    |  - Judge0Adapter (Isolated Sandbox)    |
|  SQLite (Local test fallback)      |    |  Resource limits: CPU, RAM, Wall-clock |
+------------------------------------+    +----------------------------------------+
```

---

## 2. Security Boundaries & Code Isolation Rules

1. **Zero Execution inside Web Process:** User code is NEVER compiled or evaluated in the Flask web process or system shell.
2. **Hidden Test Privacy:** Test cases with `is_hidden = True` are filtered at the database repository query layer and never exposed in REST response payloads.
3. **Deterministic Sandbox Feedback:** The sandbox executes code in disposable environments with strict process, memory (128 MB), and wall-clock (5.0s) timeouts.
4. **Idempotent Results:** Submission updates employ database transactional locking to ensure duplicate callbacks from judge workers do not double-count solve states or progress scores.
5. **Defense in Depth:** Input validation occurs both client-side and server-side. Passwords use PBKDF2/bcrypt hashing. SQL queries strictly use SQLAlchemy ORM parameter binding.
