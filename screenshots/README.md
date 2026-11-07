# SCRIPTORIUM — UI Visual Catalog & Screenshots Gallery

This directory contains actual high-resolution desktop captures (1440×900 @ 1.5× Retina density, dark theme) of the **SCRIPTORIUM — Code. Connect. Compete.** developer platform.

All screenshots were generated automatically using the maintainable Puppeteer test suite (`scripts/capture_screenshots.js`) running against the live full-stack application (Flask REST API + React Vite SPA).

---

## 🗂️ Gallery Directory Structure

```
screenshots/
├── 01_landing_and_auth/          # Landing hero, login, and registration views
├── 02_coding_and_problems/       # Problem library, Monaco workspace, AI mentor hints
├── 03_interactive_learning/      # DSA sorting & BST visualizer, engineering roadmaps
├── 04_community_discussions/     # Q&A discussion forum and question thread
├── 05_blogs_and_editorial/       # Student articles, blog reader, editorial desk
├── 06_showcase_and_reviews/      # Project showcase portfolio, 4-pillar peer reviews
├── 07_clubs_and_events/          # Technical clubs, announcements, event media & albums
├── 08_profiles_and_leaderboard/  # Profile badges, competitive leaderboard, admin metrics
└── README.md                     # This visual catalog
```

---

## 1. 🌟 Landing & Authentication

| Preview | View & Route | Description |
|---|---|---|
| ![Homepage Hero](01_landing_and_auth/01_homepage_hero.png) | **Homepage Hero**<br>`/` | High-impact dark landing hero displaying ecosystem overview, CTA actions, real-time statistics, and feature highlights. |
| ![Login Page](01_landing_and_auth/02_login_page.png) | **Login View**<br>`/login` | Secure JWT authentication with pre-configured quick demo credential helpers for testing roles. |
| ![Register Page](01_landing_and_auth/03_register_page.png) | **Student Registration**<br>`/register` | Student onboarding with username, email, password strength meter, and account creation. |

---

## 2. ⚡ Coding Practice & Problem Workspace

| Preview | View & Route | Description |
|---|---|---|
| ![Problem Library](02_coding_and_problems/01_problems_library.png) | **Algorithmic Problem Library**<br>`/problems` | LeetCode-style challenge directory with difficulty filters (Easy, Medium, Hard), tags, and acceptance rates. |
| ![Monaco Workspace](02_coding_and_problems/02_problem_workspace.png) | **Monaco Coding Workspace**<br>`/problems/two-sum` | In-browser VS Code editor with language selector (Python, C++, Java, JS), problem statement, sample tests, and output console. |
| ![AI Mentor Hints](02_coding_and_problems/03_ai_mentor_hints.png) | **AI Mentor Progressive Hints**<br>`/problems/two-sum` | Progressive 4-level pedagogical hint unlocks: Conceptual Intuition, Approach Breakdown, Edge Case Pitfalls, and Pseudo-Code Scaffold. |

---

## 3. 📊 Interactive Learning & Engineering Hub

| Preview | View & Route | Description |
|---|---|---|
| ![Sorting Visualizer](03_interactive_learning/01_dsa_visualizer_sorting.png) | **DSA Sorting Visualizer**<br>`/visualizer` | Interactive animated algorithms (Bubble, Selection, Insertion Sort) with color-coded comparison/swap states, speed sliders, and step navigation. |
| ![BST Visualizer](03_interactive_learning/02_dsa_visualizer_bst.png) | **Binary Search Tree Visualizer**<br>`/visualizer` | Visual tree construction supporting node insertion, traversal animations, and balanced subtree inspection on an SVG canvas. |
| ![Engineering Roadmaps](03_interactive_learning/03_engineering_roadmaps.png) | **Engineering Roadmaps**<br>`/learning` | Guided career roadmaps for *Algorithmic Mastery*, *Full-Stack Architecture*, and *Machine Learning Foundations* with milestone progress tracking. |

---

## 4. 💬 Community Technical Discussions

| Preview | View & Route | Description |
|---|---|---|
| ![Community Forum](04_community_discussions/01_community_forum.png) | **Discussion Community Feed**<br>`/community` | StackOverflow-style discussion forum with vote tallies, answers counters, tag filtering, and sorting (Newest, Active, Votes). |
| ![Question Thread](04_community_discussions/02_question_detail_thread.png) | **Technical Question Thread**<br>`/community/questions/1` | Threaded question view with syntax-highlighted code snippets, accepted answer highlights, author bio, and nested comments. |

---

## 5. ✍️ Student Blogs & Editorial Desk

| Preview | View & Route | Description |
|---|---|---|
| ![Blogs Feed](05_blogs_and_editorial/01_blogs_explore.png) | **Student Blogs Directory**<br>`/blogs` | Student technical articles with category taxonomy (AI/ML, Web, DSA, Systems), estimated reading times, like counters, and author badges. |
| ![Article Reader](05_blogs_and_editorial/02_blog_article_reading.png) | **Article Reader View**<br>`/blogs/1` | Full-length Markdown reader with featured covers, like button, author profiles, and community discussion comments. |
| ![Editorial Desk](05_blogs_and_editorial/03_editorial_cadence_desk.png) | **Editorial Cadence Desk**<br>`/blogs/editorial` | Editorial desk with publication cadence gap alerts, review queues, approve/reject/reschedule modals, and category administration. |

---

## 6. 🚀 Project Showcase & Peer Code Reviews

| Preview | View & Route | Description |
|---|---|---|
| ![Project Showcase](06_showcase_and_reviews/01_project_showcase.png) | **Project Showcase Gallery**<br>`/projects` | Student portfolio directory featuring live demo links, GitHub repository buttons, tech stack tags, and community upvotes. |
| ![Project Detail & Reviews](06_showcase_and_reviews/02_project_detail_and_peer_reviews.png) | **Showcase Details & Peer Reviews**<br>`/projects/1` | Showcase detail page with screenshot carousel, structured 4-pillar peer reviews (Architecture, Performance, Security, UI/UX), and code comments. |

---

## 7. 🛡️ Campus Technical Clubs & Event Memories

| Preview | View & Route | Description |
|---|---|---|
| ![Clubs Discovery](07_clubs_and_events/01_clubs_discovery.png) | **Technical Clubs Directory**<br>`/clubs` | Student guilds (*Open Source Guild*, *Competitive Programming*, *AI Society*) with member counts, join/leave toggle, and broadcast announcement feeds. |
| ![Club Detail](07_clubs_and_events/02_club_detail_and_announcements.png) | **Club Hub & Announcements**<br>`/clubs/1` | Club homepage displaying leadership team, member directory, and broadcast announcements feed with pinned updates. |
| ![Event Media Gallery](07_clubs_and_events/03_event_media_gallery.png) | **Event Media Gallery**<br>`/events` | Card-based gallery covering university hackathons, coding contests, seminars, and technical workshops organized by year and category. |
| ![Event Albums](07_clubs_and_events/04_event_detail_albums.png) | **Event Albums & Lightbox**<br>`/events/1` | Event detail page with cover image, event highlights, organizing club details, and responsive photo album grid. |

---

## 8. 🏆 User Profiles, Rankings & Platform Admin

| Preview | View & Route | Description |
|---|---|---|
| ![User Profile](08_profiles_and_leaderboard/01_user_profile_badges.png) | **User Profile & Dynamic Badges**<br>`/profile/developer` | Public developer profile with verified genuine activity badges (Bronze, Silver, Gold, Diamond), solved stats breakdown, and published articles. |
| ![Leaderboard](08_profiles_and_leaderboard/02_global_leaderboard.png) | **Global Competitive Leaderboard**<br>`/leaderboard` | Live competitive developer rankings based on server-verified points, problem difficulty breakdown, and rank tiers. |
| ![Admin Dashboard](08_profiles_and_leaderboard/03_admin_dashboard.png) | **Platform Administration**<br>`/admin` | Administrative dashboard with platform health metrics, user role management, content moderation reports queue, and audit logs. |

---

## 🔄 How to Re-generate Screenshots

The entire screenshot gallery can be re-captured automatically at any time whenever UI changes are made:

```bash
# 1. Ensure backend and frontend servers are running:
# Backend: http://127.0.0.1:5000/api/v1
# Frontend: http://127.0.0.1:5173/

# 2. Run the capture script from the project root:
node scripts/capture_screenshots.js
```
The script will authenticate via the API, launch headless Chrome/Edge, configure dark mode, visit every route, wait for assets and API data to settle, and save updated high-resolution images to this folder.

