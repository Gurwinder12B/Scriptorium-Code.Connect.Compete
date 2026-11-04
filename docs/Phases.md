# SCRIPTORIUM — Project Development Phases

**Document version:** 1.0  
**Date:** 4 November 2026  
**Project:** SCRIPTORIUM — Code. Connect. Compete.  
**Status:** Draft roadmap

---

## 1. Purpose

This document divides the development of SCRIPTORIUM into manageable phases. It provides a practical order of implementation, the work expected in each phase, dependencies, deliverables and completion criteria.

SCRIPTORIUM combines two major products in one platform:

1. A programming community where users ask questions, answer, comment, vote and discuss technical topics.
2. A coding-practice platform where users solve programming problems, submit code and track their progress.

The project should be developed incrementally. Complete and test the foundation before adding advanced functionality.

## 2. Development Principles

- Build a working foundation before adding complex features.
- Implement one feature at a time, from database to API to user interface.
- Test each feature before moving to the next.
- Use Git and meaningful commits throughout development.
- Keep frontend, backend and database responsibilities separate.
- Never execute untrusted user code inside the Flask web application.
- Prioritize a secure, usable MVP over a large number of unfinished features.
- Update the project documentation whenever an important decision changes.

## 3. Overall Roadmap

<escape>```mermaid
flowchart TD
    A[Phase 0: Planning and Setup] --> B[Phase 1: UI Foundation]
    B --> C[Phase 2: Backend and Database Foundation]
    C --> D[Phase 3: Authentication and Profiles]
    D --> E[Phase 4: Community Module]
    E --> F[Phase 5: Coding Problem Library]
    F --> G[Phase 6: Online Code Editor]
    G --> H[Phase 7: Judge Integration]
    H --> I[Phase 8: Progress and Leaderboard]
    I --> J[Phase 9: Moderation and Notifications]
    J --> K[Phase 10: Testing and Security]
    K --> L[Phase 11: Deployment and Launch]
    L --> M[Phase 12: Post-launch Improvements]
```</escape>

## 4. Detailed Development Phases

### Phase 0 — Planning and Project Setup

**Goal:** Establish the project scope, documentation, tools and development workflow.

**Tasks**
- Confirm the product name, tagline, audience and core features.
- Review the PRD, SRS and TDD.
- Create a Git repository.
- Define the initial folder structure.
- Decide the first-release feature scope.
- Set up a task board with feature and bug tickets.
- Define coding conventions and branch/commit practices.

**Deliverables**
- Project repository.
- Approved initial requirements.
- Project documentation folder.
- Initial task backlog.

**Completion criteria**
- The team can explain the MVP and its boundaries.
- Repository and development workflow are ready.
- No major foundational requirement is left ambiguous.

### Phase 1 — UI and Design Foundation

**Goal:** Establish SCRIPTORIUM's visual identity and reusable frontend structure.

**Tasks**
- Define colors, typography, spacing, layout and responsive breakpoints.
- Design the logo placement, navigation and page shell.
- Create reusable buttons, inputs, cards, badges, dialogs and alerts.
- Build responsive header, footer and navigation.
- Prepare page layouts for community and coding practice.
- Create loading, empty, error and success states.

**Initial pages**
- Landing page.
- Login and registration screens.
- Community feed layout.
- Problem library layout.
- User profile layout.

**Deliverables**
- Design system.
- Reusable React components.
- Initial responsive page layouts.

**Completion criteria**
- Main layouts work on desktop, tablet and mobile widths.
- Common components have consistent appearance and behavior.
- Navigation between placeholder pages works.

### Phase 2 — Backend and Database Foundation

**Goal:** Create the server and persistent data foundation.

**Tasks**
- Set up the Flask application using an application factory.
- Configure environment-based settings.
- Connect Flask to MySQL.
- Set up SQLAlchemy and database migrations.
- Add a consistent API response and error-handling pattern.
- Create health-check and basic test endpoints.
- Add initial logging and request validation.
- Configure separate development and test settings.

**Deliverables**
- Running Flask application.
- Working MySQL connection.
- Initial migration workflow.
- Backend module structure.
- Basic automated tests.

**Completion criteria**
- Backend starts reliably in local development.
- Database migrations can be applied and rolled back safely.
- API errors are returned in a consistent format.
- Secrets are not committed to the repository.

### Phase 3 — Authentication and User Profiles

**Goal:** Allow users to create accounts and manage their profiles securely.

**Tasks**
- Implement registration and login.
- Hash passwords using a trusted password-hashing library.
- Implement logout and session/token lifecycle.
- Add authentication and authorization middleware.
- Implement roles: guest, registered user, moderator and administrator.
- Build profile view and profile update.
- Add validation, rate limiting and secure password-reset planning.
- Protect private routes on both frontend and backend.

**Deliverables**
- Working account workflows.
- User profile pages.
- Role-based access foundation.

**Completion criteria**
- Users can register, sign in and sign out.
- Invalid credentials are handled safely.
- Protected API routes reject unauthenticated requests.
- Users cannot edit another user's private profile.
- Passwords are never stored in plaintext.

### Phase 4 — Programming Community Module

**Goal:** Deliver the first major product area: technical discussion.

**Tasks**
- Create and list questions.
- Display question details.
- Add, edit and delete answers according to ownership rules.
- Add comments.
- Implement tags and question-tag relationships.
- Implement voting and prevent duplicate votes.
- Add pagination and basic sorting.
- Add search and filters.
- Add content reporting as a basic moderation entry point.

**Deliverables**
- Community feed.
- Ask-question workflow.
- Question detail and answer workflow.
- Comments, tags and voting.

**Completion criteria**
- A registered user can ask a question and receive answers.
- Users can comment and vote according to the rules.
- Duplicate votes are prevented by backend logic and database constraints.
- Ownership and permission checks are tested.
- Lists are paginated.

### Phase 5 — Coding Problem Library

**Goal:** Create the catalog of programming problems.

**Tasks**
- Design problem records and supported language metadata.
- Create problem listing and detail pages.
- Add difficulty levels, topics and tags.
- Add search, filters and sorting.
- Create administrator/problem-setter workflows.
- Add sample input/output, constraints and starter templates.
- Define visible and hidden test-case handling.

**Deliverables**
- Problem library.
- Problem detail pages.
- Authorized problem-management workflow.
- Initial curated problem set.

**Completion criteria**
- Users can browse and filter problems.
- Problem statements display correctly.
- Only authorized roles can create or modify official problems.
- Hidden test data is not returned by public APIs.

### Phase 6 — Online Code Editor

**Goal:** Let users write code in the browser.

**Tasks**
- Integrate Monaco Editor or CodeMirror.
- Add language selection for the initial supported languages.
- Load starter templates where appropriate.
- Add editor controls such as reset and clear.
- Add a submit action and submission confirmation.
- Preserve editor content during ordinary UI interactions.
- Design responsive behavior for narrow screens.
- Display submission status and result panels.

**Deliverables**
- Browser-based coding workspace.
- Language selection.
- Source-code submission interface.

**Completion criteria**
- Editor loads reliably.
- Language selection updates the editor mode and submission metadata.
- Source code is sent to the backend through the authenticated API.
- The browser does not attempt to execute untrusted submissions locally as the official judge.

### Phase 7 — Secure Judge Integration

**Goal:** Compile and execute submitted programs safely and return verdicts.

**Tasks**
- Select and review a judge service such as Judge0 or another suitable sandbox.
- Verify its isolation model and operational requirements.
- Implement a backend judge adapter.
- Create submission records before queuing jobs.
- Define job states and valid state transitions.
- Send jobs through a trusted internal connection.
- Enforce language allowlists and resource limits.
- Process verdicts and execution metrics.
- Handle judge timeouts, failures and duplicate callbacks.
- Keep hidden test cases confidential.

**Deliverables**
- Judge integration.
- Submission lifecycle.
- Verdict and result display.
- Operational error handling.

**Completion criteria**
- Accepted and rejected sample programs receive correct verdicts.
- Compilation errors and runtime errors are distinguishable.
- CPU, memory, time and output limits are enforced by the judge.
- The Flask process never executes user-submitted code.
- Hidden tests and judge credentials are not exposed.

<badge color="warning">Critical security phase</badge>

Do not expose code submission to public users until the judge's isolation, resource limits and failure handling have been reviewed and tested.

### Phase 8 — Progress Tracking and Leaderboard

**Goal:** Help users understand and track their coding practice.

**Tasks**
- Record solved problems and submission history.
- Track problem difficulty and topic progress.
- Build a user progress dashboard.
- Define a transparent leaderboard scoring formula.
- Add ranking and tie-breaking rules.
- Prevent obvious point manipulation and duplicate credit.
- Provide filters such as weekly, monthly or all-time if included in scope.

**Deliverables**
- Submission history.
- Progress dashboard.
- Leaderboard.

**Completion criteria**
- Progress is derived from verified server-side results.
- Repeated submissions do not award unintended duplicate points.
- Leaderboard calculations are consistent and documented.
- Users can view their own progress.

### Phase 9 — Moderation and Notifications

**Goal:** Maintain a useful and safe community.

**Tasks**
- Build a report-review queue.
- Allow moderators to review reported content.
- Add moderation actions with permission checks.
- Record important actions in audit logs.
- Add in-app notifications for relevant events.
- Define notification preferences and read/unread states.
- Add anti-spam rate limits and abuse controls.

**Deliverables**
- Moderator tools.
- Report workflow.
- Audit records.
- In-app notifications, if included in the release scope.

**Completion criteria**
- Users can report inappropriate content.
- Only authorized moderators can take moderation actions.
- Administrative actions are auditable.
- Notification access is restricted to the intended recipient.

### Phase 10 — Testing, Quality and Security Review

**Goal:** Verify that the complete product works reliably and securely.

**Tasks**
- Run backend unit and API tests.
- Run frontend component and feature tests.
- Run end-to-end user journeys.
- Test database constraints and migrations.
- Test authorization and ownership boundaries.
- Test input validation, XSS and CSRF protections.
- Review dependency vulnerabilities and secret handling.
- Conduct a focused judge-sandbox security review.
- Test responsive layouts and accessibility.
- Fix high-severity defects and document accepted limitations.

**Deliverables**
- Test results.
- Defect list and fixes.
- Security review notes.
- Release candidate.

**Completion criteria**
- Critical user journeys pass.
- No unresolved critical or high-severity security issue remains.
- Backup and recovery procedures have been tested.
- Known limitations are documented.

### Phase 11 — Deployment and Launch

**Goal:** Release SCRIPTORIUM to its intended users.

**Tasks**
- Prepare production configuration and secrets.
- Configure HTTPS and reverse proxy.
- Deploy frontend and backend.
- Deploy judge workers separately with restricted permissions.
- Apply database migrations.
- Configure backups, monitoring and alerting.
- Run production smoke tests.
- Prepare support and incident-response procedures.
- Publish user-facing terms, privacy information and platform guidelines.

**Deliverables**
- Production deployment.
- Monitoring and backup configuration.
- Release notes.
- Launch checklist.

**Completion criteria**
- Public routes use HTTPS.
- Production secrets are not exposed.
- Database backups are running and restoration has been verified.
- Judge service is isolated from the public web application.
- Core workflows pass production smoke tests.

### Phase 12 — Post-launch Improvements

**Goal:** Improve the product using measured usage and user feedback.

**Potential improvements**
- More programming languages.
- Contests and timed challenges.
- Bookmarks and saved questions.
- Advanced search and recommendations.
- Email notifications.
- Reputation levels and achievements.
- Editorials and solution explanations.
- Team or classroom features.
- Improved analytics and observability.
- Dedicated mobile application, if justified.

**Completion criteria**
- Improvements are prioritized using evidence and user feedback.
- New features have requirements, tests and security review.
- Existing functionality remains stable.

## 5. Recommended MVP Boundary

The first public MVP should focus on a small but complete experience rather than attempting every planned feature.

### Must-have for MVP

- Registration, login and profiles.
- Community questions and answers.
- Basic comments, tags and voting.
- Problem library with a curated set of problems.
- Browser code editor.
- Secure judge integration for a small supported language set.
- Submission verdicts and basic submission history.
- Basic moderation/reporting.
- Responsive design and essential security controls.

### Can follow after MVP

- Advanced leaderboard and reputation system.
- Rich notification preferences.
- Contests and timed competitions.
- Advanced recommendations.
- Additional languages and advanced analytics.
- Email notification system.

The exact MVP must be confirmed against the PRD and SRS before implementation.

## 6. Dependencies Between Phases

| Phase | Depends on |
|---|---|
| Phase 1 — UI foundation | Phase 0 |
| Phase 2 — Backend/database | Phase 0 |
| Phase 3 — Authentication | Phase 2 |
| Phase 4 — Community | Phases 1, 2 and 3 |
| Phase 5 — Problem library | Phases 1, 2 and 3 |
| Phase 6 — Code editor | Phase 5 |
| Phase 7 — Judge integration | Phases 2, 5 and 6 |
| Phase 8 — Progress/leaderboard | Phase 7 |
| Phase 9 — Moderation/notifications | Phases 3 and 4; submission events for coding notifications |
| Phase 10 — Testing/security | All implemented phases |
| Phase 11 — Deployment/launch | Phase 10 |
| Phase 12 — Improvements | Phase 11 |

Some work can happen in parallel after interfaces and responsibilities have been agreed. For example, frontend page development and backend API development can proceed together using agreed API contracts.

## 7. Suggested Development Workflow

For each feature, follow this sequence:

1. Read the relevant requirement in the PRD or SRS.
2. Write a small feature task and acceptance criteria.
3. Decide the data model and API contract.
4. Implement the database migration, if required.
5. Implement backend validation, authorization and business logic.
6. Write backend tests.
7. Implement the frontend interaction.
8. Connect the frontend to the API.
9. Test the complete workflow.
10. Review security, accessibility and responsive behavior.
11. Update documentation.
12. Commit the finished change to Git.

### Example: Creating a question

- Requirement: a registered user can publish a programming question.
- Database: question record and tag relationships.
- API: `POST /api/v1/questions`.
- Backend: validate content, authenticate author and save transactionally.
- Frontend: question form with validation and clear feedback.
- Tests: valid creation, missing title, unauthenticated request, invalid tags and unauthorized edit.
- Acceptance: question appears in the feed and its detail page.

## 8. Milestone Tracking Template

Use this template to track real progress. Do not mark a phase complete until its completion criteria have been verified.

| Phase | Status | Start date | Target date | Actual completion | Notes |
|---|---|---|---|---|---|
| 0. Planning and setup | Not started | — | — | — | |
| 1. UI foundation | Not started | — | — | — | |
| 2. Backend/database | Not started | — | — | — | |
| 3. Authentication | Not started | — | — | — | |
| 4. Community | Not started | — | — | — | |
| 5. Problem library | Not started | — | — | — | |
| 6. Code editor | Not started | — | — | — | |
| 7. Judge integration | Not started | — | — | — | |
| 8. Progress/leaderboard | Not started | — | — | — | |
| 9. Moderation/notifications | Not started | — | — | — | |
| 10. Testing/security | Not started | — | — | — | |
| 11. Deployment/launch | Not started | — | — | — | |
| 12. Post-launch improvements | Not started | — | — | — | |

## 9. Risk Management

| Risk | Likely consequence | Response |
|---|---|---|
| Scope expansion | Delayed completion | Protect MVP scope and defer lower-priority features |
| Limited development time | Incomplete modules | Break work into small weekly deliverables |
| Weak database planning | Rework and inconsistent data | Review schema and constraints before feature implementation |
| Insecure code execution | Severe system compromise | Use a dedicated sandbox and review its security boundary |
| Integration problems | Frontend/backend mismatch | Agree API contracts before parallel implementation |
| Insufficient testing | Defects reach users | Add tests during development, not only before launch |
| Unclear ownership/branding | Confusion with other Scriptorium identity | Confirm whether the platform is club-affiliated or independent |

## 10. Project Completion Criteria

The initial release can be considered ready when:

- The MVP requirements are implemented.
- Core community and coding-practice workflows work end to end.
- Authentication and role permissions are enforced on the backend.
- Code judging runs outside the Flask application in an appropriately isolated environment.
- Hidden test cases and secrets remain protected.
- Critical tests pass and high-severity defects are resolved.
- Production deployment uses HTTPS and secure configuration.
- Database backups and recovery have been verified.
- User-facing policies and basic support procedures are available.
- Documentation and setup instructions are current.

## 11. Document Maintenance

This roadmap is a living document. Update it when:
- Scope or release priorities change.
- A phase is split, combined or reordered.
- A technical dependency changes.
- A significant risk is discovered.
- A milestone is completed or rescheduled.

Keep this document consistent with `PRD.md`, `SRS.md` and `TDD.md`. Detailed technical architecture, database schema, API contracts and test cases should live in their respective documents rather than duplicating large sections here.

---

**End of Document — SCRIPTORIUM Project Development Phases v1.0**
