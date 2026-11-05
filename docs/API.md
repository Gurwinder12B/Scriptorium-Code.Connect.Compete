# SCRIPTORIUM — REST API Specification (API.md)

**Document Version:** 1.0  
**Date:** 4 November 2026  
**Status:** Approved API Specification  
**Base URL:** `/api/v1`  
**Content-Type:** `application/json`  

---

## 1. Response Envelope Format

All responses follow a predictable JSON schema.

### 1.1 Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 15,
    "total": 42,
    "total_pages": 3
  }
}
```

### 1.2 Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description of error.",
    "details": {
      "field_name": "Specific validation failure message"
    }
  }
}
```

---

## 2. Authentication & Header Standards

- **Header:** `Authorization: Bearer <jwt_token>`
- **Cookie fallback:** `access_token` HttpOnly cookie.
- Unauthenticated requests to protected endpoints return `401 Unauthorized` with code `AUTH_REQUIRED`.
- Insufficient permissions return `403 Forbidden` with code `FORBIDDEN`.

---

## 3. API Endpoints Map

### 3.1 Authentication (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register new user account |
| `POST` | `/api/v1/auth/login` | Public | Authenticate and obtain token/cookie |
| `POST` | `/api/v1/auth/logout` | Authenticated | Revoke session / clear cookie |
| `GET` | `/api/v1/auth/me` | Authenticated | Get current authenticated user session |

#### Register Request:
```json
{
  "username": "codemaster",
  "email": "master@scriptorium.dev",
  "password": "SecurePassword123!"
}
```

#### Login Request:
```json
{
  "login": "codemaster", 
  "password": "SecurePassword123!"
}
```
*(Accepts either email or username in `login` field)*.

---

### 3.2 User Profiles (`/api/v1/users`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/users/profile/:username` | Public | Public profile and statistics |
| `PATCH` | `/api/v1/users/profile` | Authenticated | Update current user's profile |
| `GET` | `/api/v1/users/dashboard` | Authenticated | Aggregated user dashboard data |

---

### 3.3 Community Questions & Answers (`/api/v1/community`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/community/questions` | Public | List questions (paginated, sorted, filter by tag) |
| `POST` | `/api/v1/community/questions` | Authenticated | Publish a new technical question |
| `GET` | `/api/v1/community/questions/:id` | Public | Get question detail with answers and tags |
| `PUT` | `/api/v1/community/questions/:id` | Author / Mod | Update question |
| `DELETE` | `/api/v1/community/questions/:id` | Author / Mod | Soft-delete / hide question |
| `POST` | `/api/v1/community/questions/:id/answers` | Authenticated | Submit answer to a question |
| `PUT` | `/api/v1/community/answers/:id` | Author / Mod | Update answer |
| `DELETE` | `/api/v1/community/answers/:id` | Author / Mod | Delete answer |
| `POST` | `/api/v1/community/questions/:id/accept` | Author | Accept an answer as correct |
| `POST` | `/api/v1/community/votes` | Authenticated | Cast or remove an upvote/downvote |
| `POST` | `/api/v1/community/comments` | Authenticated | Post comment on question or answer |
| `GET` | `/api/v1/community/tags` | Public | List available tags with usage counts |

#### Question Query Parameters:
- `page`: default `1`
- `per_page`: default `15`, max `100`
- `sort`: `newest` (default), `votes`, `active`, `unanswered`
- `tag`: filter by tag slug (e.g., `python`, `algorithms`)
- `q`: search query string

---

### 3.4 Coding Problems (`/api/v1/problems`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/problems` | Public | List problems (difficulty, topic, search) |
| `GET` | `/api/v1/problems/:id_or_slug` | Public | Get problem statement, examples, constraints |
| `POST` | `/api/v1/problems` | Admin / Setter | Create new coding challenge |
| `PUT` | `/api/v1/problems/:id` | Admin / Setter | Update coding challenge |
| `POST` | `/api/v1/problems/:id/test-cases` | Admin / Setter | Add test cases (sample or hidden) |

*Security Rule:* Public endpoints return sample test cases (`is_sample: true`) but NEVER reveal hidden test cases.

---

### 3.5 Code Submissions & Judging (`/api/v1/submissions`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/submissions` | Authenticated | Submit code for evaluation |
| `GET` | `/api/v1/submissions/:id` | Authenticated | Poll submission status and verdict |
| `GET` | `/api/v1/submissions` | Authenticated | List user submission history (filter by problem) |

#### Submission Request:
```json
{
  "problem_id": 1,
  "language": "python",
  "source_code": "def solve():\n    return 42\nprint(solve())"
}
```

#### Submission Status Response (`GET /api/v1/submissions/:id`):
```json
{
  "success": true,
  "data": {
    "id": 104,
    "problem_id": 1,
    "language": "python",
    "status": "ACCEPTED",
    "execution_time_ms": 32,
    "memory_used_kb": 12400,
    "is_simulated": true,
    "test_cases_passed": 3,
    "total_test_cases": 3,
    "stdout_sample": "42\n",
    "created_at": "2026-11-04T12:00:00Z"
  }
}
```

---

### 3.6 User Progress & Leaderboard (`/api/v1/progress` & `/api/v1/leaderboard`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/progress/summary` | Authenticated | Summary of solved problems and difficulty breakdown |
| `GET` | `/api/v1/leaderboard` | Public | Global user rankings (points, problems solved) |

---

### 3.7 Moderation & Reporting (`/api/v1/moderation`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/moderation/reports` | Authenticated | Report inappropriate content |
| `GET` | `/api/v1/moderation/reports` | Moderator/Admin| List pending reports queue |
| `POST` | `/api/v1/moderation/resolve` | Moderator/Admin| Take moderation action (hide/restore/suspend) |

---

### 3.8 Administration & Audit (`/api/v1/admin`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/admin/stats` | Admin | System statistics overview |
| `GET` | `/api/v1/admin/users` | Admin | User management list |
| `PATCH` | `/api/v1/admin/users/:id/role` | Admin | Assign user role |
| `GET` | `/api/v1/admin/audit-logs` | Admin | Query system audit logs |

---

### 3.9 Notifications (`/api/v1/notifications`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/notifications` | Authenticated | List user notifications |
| `PATCH` | `/api/v1/notifications/:id/read` | Authenticated | Mark notification as read |
| `POST` | `/api/v1/notifications/mark-all-read`| Authenticated | Mark all notifications read |

---

### 3.10 Media Storage & Uploads (`/api/v1/media`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/media/upload` | Authenticated | Multi-part media upload with magic-byte validation |
| `GET` | `/api/v1/media/uploads/<filename>` | Public | Serve verified media file securely |

---

### 3.11 Event Media & Memories (`/api/v1/events`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/events` | Public | List and search events with category and year filters |
| `POST` | `/api/v1/events` | Moderator/Admin | Create a new community event |
| `GET` | `/api/v1/events/:id_or_slug` | Public | Get event detail, albums, media, and highlights |
| `PUT` | `/api/v1/events/:id` | Moderator/Admin | Update event details |
| `POST` | `/api/v1/events/:id/albums` | Moderator/Admin | Create an album within an event |
| `POST` | `/api/v1/events/:id/media` | Moderator/Admin | Add photo/video media with captions to an event album |
| `DELETE` | `/api/v1/events/:id/media/:media_id` | Moderator/Admin | Remove a media item from an event |

---

### 3.12 Student Blogs & Editorial Management (`/api/v1/blogs`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/blogs` | Public | List published articles with category and search filter |
| `POST` | `/api/v1/blogs` | Authenticated | Create a new student blog post (draft or submit for review) |
| `GET` | `/api/v1/blogs/:id_or_slug` | Public | Get blog post content, comments, and author profile |
| `PUT` | `/api/v1/blogs/:id` | Author/Admin | Update blog post |
| `DELETE` | `/api/v1/blogs/:id` | Author/Admin | Delete blog post |
| `POST` | `/api/v1/blogs/:id/like` | Authenticated | Toggle like on a blog post |
| `POST` | `/api/v1/blogs/:id/comments` | Authenticated | Add discussion comment to a blog post |
| `GET` | `/api/v1/blogs/categories` | Public | List all available blog categories |
| `POST` | `/api/v1/blogs/categories` | Admin | Create a new blog category |
| `GET` | `/api/v1/blogs/editorial/calendar` | Admin/Moderator | Query editorial review queue, drafts, and cadence gap warnings |
| `PATCH` | `/api/v1/blogs/editorial/:id/status` | Admin/Moderator | Approve, schedule, reject, or request changes on blog post |

---

### 3.13 Project Showcase & Peer Code Reviews (`/api/v1/projects`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/projects` | Public | Browse showcase projects with search, tag, and sort filters |
| `POST` | `/api/v1/projects` | Authenticated | Submit project with demo URL, repo, tech stack tags, and media |
| `GET` | `/api/v1/projects/:id_or_slug` | Public | Get project details, screenshots, metrics, and peer reviews |
| `PUT` | `/api/v1/projects/:id` | Owner/Admin | Update project details |
| `DELETE` | `/api/v1/projects/:id` | Owner/Admin | Remove showcase project |
| `POST` | `/api/v1/projects/:id/upvote` | Authenticated | Toggle upvote on a project |
| `GET` | `/api/v1/projects/:id/reviews` | Public | List peer code reviews for a project |
| `POST` | `/api/v1/projects/:id/reviews` | Authenticated | Submit 4-pillar structured peer review (Architecture, Performance, Security, UI/UX) |
| `PATCH` | `/api/v1/projects/reviews/:review_id/status` | Author/Owner | Update review resolution status (`OPEN`, `ADDRESSED`, `RESOLVED`) |
| `POST` | `/api/v1/projects/reviews/:review_id/comments` | Authenticated | Add threaded inline code comment to review |
| `POST` | `/api/v1/projects/reviews/:review_id/upvote` | Authenticated | Upvote helpful code review |

---

### 3.14 Technical Clubs & Announcements (`/api/v1/clubs`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/clubs` | Public | List active clubs with member count and tags |
| `POST` | `/api/v1/clubs` | Admin | Register new official student technical club |
| `GET` | `/api/v1/clubs/:id_or_slug` | Public | Club details, officers, member directory, and announcements |
| `POST` | `/api/v1/clubs/:id/membership` | Authenticated | Toggle club membership (join/leave) |
| `GET` | `/api/v1/clubs/:id/announcements` | Public | Feed of club announcements and updates |
| `POST` | `/api/v1/clubs/:id/announcements` | Officer/Admin | Broadcast pinned or standard announcement to members |

---

### 3.15 AI Mentor Progressive Hints (`/api/v1/problems`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/problems/:id_or_slug/hints` | Public | Fetch progressive 4-level pedagogical hints (Intuition, Approach, Pitfalls, Pseudo-Code) without exposing full solution |


