# SCRIPTORIUM — Test Plan & Verification Strategy (TEST-PLAN.md)

**Document Version:** 1.0  
**Date:** 4 November 2026  
**Status:** Approved Test Plan  

---

## 1. Test Levels

1. **Backend Unit & Integration Tests (Pytest):**
   - Authentication (Registration, password hashing, JWT generation, login, logout, invalid credentials).
   - Authorization (Role-based access controls for User, Moderator, Admin).
   - Ownership boundaries (Cannot edit or delete another user's post).
   - Community workflows (Question creation, answer posting, single accepted answer constraint, comment creation).
   - Voting integrity (One vote per user/target constraint, no self-voting, atomic score updates).
   - Coding problem access (Public vs. private test case isolation).
   - Submissions & Judge adapter (Queued states, simulated and live verdicts, time/memory limit evaluations).
   - Progress & Leaderboards (Server-verified solve credit, duplicate prevention, points calculation).
   - Moderation workflows (Report queuing, review, content hiding, user suspension).

2. **Frontend Component & End-to-End Build Verification:**
   - Strict TypeScript compilation (`tsc --noEmit`).
   - Production Vite bundle build (`npm run build`).
   - Route protection (Redirects unauthenticated users from `/dashboard`, `/ask`, `/admin`).
   - Editor interactions (Monaco editor loading, starter code template insertion, submitting).
   - Real-time status polling for code submissions.

---

## 2. End-to-End User Journeys

| Journey ID | Title | Steps | Expected Outcome |
|---|---|---|---|
| E2E-01 | Registration & Auth | Register new account -> Login -> Fetch `/api/v1/auth/me` | Valid session, user object received |
| E2E-02 | Question & Answer Lifecycle | Ask question -> Answer -> Comment -> Vote -> Accept answer | Correct thread state, 1 accepted answer, votes tallied |
| E2E-03 | Coding Problem & Submission | Browse problem library -> Open Problem -> Select Language -> Submit code -> Poll status | Status transitions QUEUED -> ACCEPTED, Progress updated |
| E2E-04 | Progress & Leaderboard | Submit accepted solution -> Check Dashboard -> View Leaderboard | Problem counted in solved total, points increased |
| E2E-05 | Moderation & Reporting | Report offensive post -> Moderator lists queue -> Moderator hides post | Post hidden from public feed, action logged in audit |
| E2E-06 | Security Boundaries | Attempt to edit another user's answer -> Attempt admin route as regular user | Both return 403 Forbidden |
