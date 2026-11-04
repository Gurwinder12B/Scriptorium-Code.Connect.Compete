# SCRIPTORIUM — Code. Connect. Compete.

SCRIPTORIUM is an integrated full-stack developer platform combining a technical discussion community with an online coding practice and competitive evaluation environment.

---

## Features

- **Developer Community:** StackOverflow-style Q&A with Markdown support, code formatting, tags, upvoting/downvoting, accepted answers, and nested comments.
- **Problem Catalog & Coding Workspace:** LeetCode-style problem library with difficulty filtering, topic tags, sample test cases, and in-browser Monaco Editor.
- **Isolated Code Execution:** Provider-adapter architecture supporting deterministic mock judging and sandboxed Judge0 execution with CPU/memory limits.
- **Server-Verified Progress & Leaderboard:** Point scoring, attempt tracking, difficulty-based rankings, and tamper-proof user statistics.
- **User Profiles & Dashboards:** Activity history, solved problems breakdown, reputation metrics, and personal submissions history.
- **Moderation & Admin Suite:** Content reporting queue, moderator actions (hide/restore/suspend), audit logging, and platform management.
- **Role-Based Access Control:** Guest, Registered User, Moderator, and Administrator roles enforced at the server API layer.

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), Lucide React, React Router 6.
- **Backend:** Python 3.10+, Flask (Factory Pattern & Blueprints), SQLAlchemy 2.0 ORM, Flask-Migrate, Flask-CORS, Pytest.
- **Database:** MySQL 8 (`utf8mb4`) with SQLite fallback for offline development and fast testing.
- **Security:** Salted password hashing, JWT authentication + HttpOnly cookie support, parameterized SQL, role-based decorators.

---

## Quick Start (Local Development)

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- (Optional) MySQL 8 or Docker

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
cp ../.env.example .env
# Seed database with initial sample problems, tags, admin & test users
python seed.py
# Run tests
pytest
# Start Flask API server
python run.py
```
The Flask API runs at `http://127.0.0.1:5000` (`/api/v1`).

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
The React frontend runs at `http://localhost:5173`.

---

## Default Seed Accounts

When running `python seed.py`, the following demo accounts are created:

| Role | Username | Password |
|---|---|---|
| Administrator | `admin` | `Admin123!` |
| Moderator | `moderator` | `Mod123!` |
| User | `developer` | `User123!` |
| User | `student` | `User123!` |

---

## Architecture & Documentation

- [Product Requirements (PRD)](docs/PRD.md)
- [Software Requirements Specification (SRS)](docs/SRS.md)
- [System Design](docs/Systemdesign.md)
- [Technical Design (TDD)](docs/TDD.md)
- [Development Phases](docs/Phases.md)
- [Database Schema (DATABASE.md)](docs/DATABASE.md)
- [REST API Reference (API.md)](docs/API.md)
- [System Architecture (ARCHITECTURE.md)](docs/ARCHITECTURE.md)
- [Test Plan (TEST-PLAN.md)](docs/TEST-PLAN.md)
- [Technical Decisions (DECISIONS.md)](docs/DECISIONS.md)

