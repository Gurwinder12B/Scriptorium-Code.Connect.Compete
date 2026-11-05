import json
from app import create_app
from app.extensions import db
from app.models.user import User, Profile
from app.models.community import Tag, Question, Answer, Comment, Vote
from app.models.problem import Problem, TestCase
from app.common.security import hash_password

def _seed_events(admin_user, dev_user):
    from app.models.event import Event, EventAlbum, EventMedia
    from datetime import datetime, timezone

    print("Seeding university events & media memories...")
    ev1 = Event(
        title="Scriptorium Annual Hackathon 2026",
        slug="scriptorium-annual-hackathon-2026",
        description="A high-intensity 48-hour continuous coding hackathon where 60 student developer teams built cutting-edge AI tools, developer utilities, and web services. Features live judging and hardware showcases.",
        category="Hackathons",
        event_date=datetime(2026, 3, 14, 9, 0, 0, tzinfo=timezone.utc),
        location="University Tech Innovation Hub, Hall A",
        organizing_club="Scriptorium Core & ACM Student Chapter",
        cover_image_url="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80",
        recap_markdown="""# Scriptorium Annual Hackathon 2026 Recap

The university's flagship hackathon brought together over **240 students across 60 teams**. 
Participants hacked throughout the weekend on:
- Automated code refactoring agents
- Decentralized identity credentials for students
- Real-time collaborative audio & code synthesizers

### Winning Highlights
- **1st Place:** Team *ByteCraft* for their real-time AST visualizer.
- **2nd Place:** Team *NeuralPulse* for their latency-optimized edge LLM runner.
- **Best First-Year Project:** Team *AlgoRookies* for their automated problem solver.""",
        highlights=[
            "60 Teams Participated",
            "48 Hours of Non-stop Coding",
            "$5,000 in Prizes & Swag",
            "15 Industry Judges & Mentors"
        ],
        participating_teams=[
            {"name": "Team ByteCraft", "project": "AST Visualizer", "rank": "1st Place"},
            {"name": "Team NeuralPulse", "project": "Edge LLM Runner", "rank": "2nd Place"},
            {"name": "Team AlgoRookies", "project": "Graph Walkthroughs", "rank": "Best First-Year"}
        ],
        is_published=True,
        created_by_id=admin_user.id,
    )
    db.session.add(ev1)
    db.session.flush()

    album1_1 = EventAlbum(event_id=ev1.id, title="Opening Ceremony & Team Pitches", description="Kickoff, keynote speeches, and team ideation.")
    album1_2 = EventAlbum(event_id=ev1.id, title="Midnight Hacking & Mentorship", description="Late-night debugging sessions, pizza rounds, and mentor feedback.")
    album1_3 = EventAlbum(event_id=ev1.id, title="Award Ceremony & Winner Demos", description="Final pitches on stage and trophy presentations.")
    db.session.add_all([album1_1, album1_2, album1_3])
    db.session.flush()

    media_items_ev1 = [
        EventMedia(
            event_id=ev1.id,
            album_id=album1_1.id,
            media_type="image",
            media_url="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80",
            thumbnail_url="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80",
            caption="Teams assembled in the Main Innovation Hall for the Hackathon Kickoff",
            photographer_credit="Campus Media Bureau",
            display_order=1,
            uploaded_by_id=admin_user.id,
        ),
        EventMedia(
            event_id=ev1.id,
            album_id=album1_2.id,
            media_type="image",
            media_url="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80",
            thumbnail_url="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
            caption="Mentor Alex Chen reviewing system architecture with Team ByteCraft at 2 AM",
            photographer_credit="Alex Chen",
            display_order=2,
            uploaded_by_id=dev_user.id,
        ),
        EventMedia(
            event_id=ev1.id,
            album_id=album1_3.id,
            media_type="image",
            media_url="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
            thumbnail_url="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
            caption="Team ByteCraft receiving the 1st Place Trophy and Certificate",
            photographer_credit="Campus News",
            display_order=3,
            uploaded_by_id=admin_user.id,
        ),
        EventMedia(
            event_id=ev1.id,
            album_id=album1_1.id,
            media_type="image",
            media_url="https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&auto=format&fit=crop&q=80",
            thumbnail_url="https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&auto=format&fit=crop&q=80",
            caption="Keynote address: Future of Agentic Software Engineering",
            photographer_credit="Campus News",
            display_order=4,
            uploaded_by_id=admin_user.id,
        ),
    ]
    db.session.add_all(media_items_ev1)

    # Event 2: ACM ICPC Collegiate Warmup
    ev2 = Event(
        title="ACM ICPC Regional Collegiate Warmup 2026",
        slug="acm-icpc-regional-collegiate-warmup-2026",
        description="Competitive programming tournament simulating regional ICPC conditions with 8 algorithmic problems, strict memory/time bounds, and live scoreboard freeze.",
        category="Competitions",
        event_date=datetime(2026, 4, 18, 14, 0, 0, tzinfo=timezone.utc),
        location="Computer Systems Lab 3 & 4",
        organizing_club="Competitive Programming Guild",
        cover_image_url="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80",
        recap_markdown="""# ACM ICPC Regional Warmup 2026

35 collegiate teams solved 8 algorithmic challenges over 5 intense hours.
Problems ranged from dynamic programming with bitmasks to segment trees and max flow.""",
        highlights=[
            "35 Competing Teams",
            "8 Challenging Algorithmic Problems",
            "Real-time Balloon Tracking",
            "First Solve on Problem D in 18 minutes"
        ],
        is_published=True,
        created_by_id=admin_user.id,
    )
    db.session.add(ev2)
    db.session.flush()

    album2_1 = EventAlbum(event_id=ev2.id, title="Contest Arena & Live Scoreboard", description="Intense problem solving and balloon allocations.")
    db.session.add(album2_1)
    db.session.flush()

    ev2_media = [
        EventMedia(
            event_id=ev2.id,
            album_id=album2_1.id,
            media_type="image",
            media_url="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80",
            thumbnail_url="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80",
            caption="Teams focused during the final hour before scoreboard freeze",
            photographer_credit="ACM Guild",
            display_order=1,
            uploaded_by_id=admin_user.id,
        )
    ]
    db.session.add_all(ev2_media)

    # Event 3: Full-Stack Web Development Workshop
    ev3 = Event(
        title="Modern Full-Stack Web Development Bootcamp",
        slug="modern-fullstack-web-development-bootcamp",
        description="Comprehensive hands-on workshop guiding students through React, TypeScript, Tailwind CSS, Python Flask REST APIs, and Docker containerization.",
        category="Workshops",
        event_date=datetime(2026, 5, 2, 10, 0, 0, tzinfo=timezone.utc),
        location="Auditorium B & Virtual Livestream",
        organizing_club="Web & Cloud Developers Club",
        cover_image_url="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80",
        highlights=[
            "120 Attendees",
            "Built & Deployed Full-Stack App",
            "Zero-to-Hero Cloud Architecture"
        ],
        is_published=True,
        created_by_id=dev_user.id,
    )
    db.session.add(ev3)
    db.session.flush()

    album3_1 = EventAlbum(event_id=ev3.id, title="Live Coding & Architecture Walkthrough", description="Live coding sessions and interactive Q&A.")
    db.session.add(album3_1)
    db.session.flush()

    ev3_media = [
        EventMedia(
            event_id=ev3.id,
            album_id=album3_1.id,
            media_type="image",
            media_url="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80",
            thumbnail_url="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
            caption="Hands-on demonstration of REST API architecture and database indexing",
            photographer_credit="Web Club",
            display_order=1,
            uploaded_by_id=dev_user.id,
        )
    ]
    db.session.add_all(ev3_media)
    db.session.commit()
    print("Events seeded successfully!")

def _seed_blogs(admin_user, dev_user, student_user):
    from app.models.blog import BlogCategory, BlogTag, BlogPost, BlogComment
    from datetime import datetime, timezone, timedelta

    print("Seeding blog categories and technical student articles...")
    categories_def = [
        ("Programming", "Core programming paradigms, syntax, idioms, and standard libraries"),
        ("Python", "Python 3 internals, concurrency, async programming, and ecosystem tools"),
        ("Web Development", "Modern frontend, backend architectures, APIs, and microservices"),
        ("Artificial Intelligence", "Neural networks, transformer models, LLMs, and agentic workflows"),
        ("Data Structures & Algorithms", "Algorithmic thinking, graph traversals, complexity, and problem solving"),
        ("System Design", "Scalability, caching, distributed transactions, and database indexing"),
        ("Career Guidance", "Technical interviews, resume strategies, and developer roadmaps"),
        ("Project Experiences", "Lessons learned building production web services and open-source tools"),
    ]

    cat_map = {}
    for index, (c_name, c_desc) in enumerate(categories_def):
        c_slug = c_name.lower().replace(" & ", "-").replace(" ", "-")
        cat = BlogCategory.query.filter_by(slug=c_slug).first()
        if not cat:
            cat = BlogCategory(
                name=c_name,
                slug=c_slug,
                description=c_desc,
                display_order=index,
                is_active=True
            )
            db.session.add(cat)
            db.session.flush()
        cat_map[c_slug] = cat

    now = datetime.now(timezone.utc)

    # Article 1: Python Memory & GIL
    post1 = BlogPost(
        author_id=dev_user.id,
        category_id=cat_map["python"].id,
        title="Deep Dive into Memory Management and Garbage Collection in Python 3.14",
        slug="deep-dive-into-memory-management-and-garbage-collection-in-python",
        excerpt="An architectural exploration of reference counting, cyclic garbage collection, and how PEP 703 free-threading transforms memory barriers in modern CPython.",
        content_markdown="""# Deep Dive into Python Memory Management

Python's memory management model is both elegant and deceptively sophisticated. While high-level developers rarely need to invoke `malloc()` or `free()`, understanding how CPython manages memory is crucial for building high-throughput, low-latency backends.

## 1. Reference Counting: The First Line of Defense

Every object in CPython contains a header defined by `PyObject`:
```c
struct _object {
    _PyObject_HEAD_EXTRA
    Py_ssize_t ob_refcnt;
    struct _typeobject *ob_type;
};
```
Whenever an object is referenced, its `ob_refcnt` is incremented. When references fall out of scope, the counter decrements. As soon as `ob_refcnt == 0`, memory is deallocated immediately.

## 2. Cyclic Garbage Collection

Reference counting alone cannot handle self-referential cycles:
```python
class Node:
    def __init__(self):
        self.neighbor = None

a = Node()
b = Node()
a.neighbor = b
b.neighbor = a

del a
del b
# Both objects still have refcnt == 1!
```
To solve this, CPython runs a **generational cyclic garbage collector** that categorizes objects into three generations (Gen 0, Gen 1, Gen 2) based on survival cycles.

## 3. PEP 703: The Free-Threaded Future
With Python 3.13 and 3.14, the Global Interpreter Lock (GIL) is becoming optional through mimalloc and biased reference counting. This allows true multi-core thread scaling across multiple CPUs without process boundaries!""",
        cover_image_url="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
        reading_time_minutes=4,
        status="PUBLISHED",
        is_featured=True,
        is_editors_pick=False,
        view_count=184,
        like_count=29,
        comment_count=2,
        published_at=now - timedelta(days=2),
    )
    db.session.add(post1)
    db.session.flush()

    # Article 2: Real-time Web & CRDTs
    post2 = BlogPost(
        author_id=dev_user.id,
        category_id=cat_map["web-development"].id,
        title="Building Resilient Real-Time Collaborative Web Applications with WebSockets and CRDTs",
        slug="building-resilient-realtime-collaborative-web-applications-crdts",
        excerpt="Learn how Conflict-free Replicated Data Types (CRDTs) enable multi-user collaborative editors without locking servers or suffering merge conflicts.",
        content_markdown="""# Collaborative Web Architecture with CRDTs

Building collaborative software like Google Docs, Figma, or interactive code editors requires managing concurrent edits from multiple network clients without centralized mutex locks.

## Why Operational Transformation (OT) is Hard
Traditional solutions relied on Operational Transformation (OT), which requires a central coordinating server to sequence and transform every keystroke relative to concurrent operations. If the server loses packets, the state diverges.

## The CRDT Solution
**Conflict-free Replicated Data Types (CRDTs)** guarantee *strong eventual consistency*. Any two nodes that have received the same set of updates (regardless of order) will independently converge to the exact same document state!

```typescript
// Sample State-based CRDT LWW-Element-Set
interface LWWRegister<T> {
  value: T;
  timestamp: number;
}

function mergeRegister<T>(local: LWWRegister<T>, remote: LWWRegister<T>): LWWRegister<T> {
  return remote.timestamp > local.timestamp ? remote : local;
}
```

Combining state-based CRDTs with binary WebSocket frames gives sub-20ms collaboration speed with zero lock contention!""",
        cover_image_url="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
        reading_time_minutes=5,
        status="PUBLISHED",
        is_featured=False,
        is_editors_pick=True,
        view_count=142,
        like_count=21,
        comment_count=1,
        published_at=now - timedelta(days=4),
    )
    db.session.add(post2)
    db.session.flush()

    # Article 3: DSA Mental Model
    post3 = BlogPost(
        author_id=student_user.id,
        category_id=cat_map["data-structures-algorithms"].id,
        title="From LeetCode Beginner to Dynamic Programming Mastery: A Step-by-Step Mental Model",
        slug="from-leetcode-beginner-to-dynamic-programming-mastery",
        excerpt="A friendly, pattern-oriented guide for students demystifying state transitions, recurrence relations, and memoization vs bottom-up tabulation.",
        content_markdown="""# Mastering Dynamic Programming

Dynamic Programming (DP) is often perceived as the most intimidating category in competitive programming. However, once you recognize the underlying pattern, almost all DP problems follow a 4-step framework.

## The 4-Step DP Framework
1. **Identify the State:** What minimal set of variables uniquely defines the subproblem? (e.g., `(index, remaining_capacity)` in Knapsack).
2. **Formulate the Recurrence:** How does the answer for state `i` depend on previous states `i - 1`, `i - 2`?
3. **Establish Base Cases:** What is the answer when indices hit 0 or boundary conditions?
4. **Choose Top-Down Memoization or Bottom-Up Tabulation:**
   - **Memoization (Recursion + Hash Map / Array):** Intuitive and only calculates reachable states.
   - **Tabulation (Iterative):** Eliminates call stack overhead and enables memory optimization via state compression.

```python
# Fibonacci with O(1) Space Tabulation
def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    prev2, prev1 = 0, 1
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev2 + prev1
    return prev1
```

Start with 1D DP (Climbing Stairs, House Robber) before advancing to 2D DP (Unique Paths, Longest Common Subsequence)!""",
        cover_image_url="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80",
        reading_time_minutes=3,
        status="PUBLISHED",
        is_featured=False,
        is_editors_pick=False,
        view_count=98,
        like_count=18,
        comment_count=0,
        published_at=now - timedelta(days=6),
    )
    db.session.add(post3)
    db.session.flush()

    # Comments on Article 1
    c1 = BlogComment(
        post_id=post1.id,
        author_id=student_user.id,
        content="This explanation of cyclic reference counting helped me understand a memory leak we had in our university project! Thank you Alex."
    )
    db.session.add(c1)
    db.session.flush()

    c1_reply = BlogComment(
        post_id=post1.id,
        author_id=dev_user.id,
        parent_id=c1.id,
        content="Glad it helped Maya! Always look out for circular callbacks in event emitters too."
    )
    db.session.add(c1_reply)

    db.session.commit()
    print("Blogs seeded successfully!")

def _seed_projects(admin_user, dev_user, student_user):
    from app.models.project import (
        Project,
        ProjectMedia,
        ProjectTag,
        ProjectCollaborator,
        CodeReview,
        CodeReviewComment,
        ProjectUpvote,
        slugify,
    )

    print("Seeding showcase projects and structured code reviews...")

    # Tags
    tags_data = ["Python", "PyTorch", "React", "TypeScript", "WebSockets", "Go", "Docker", "Rust", "WebAssembly", "Cloud"]
    tag_objs = {}
    for tname in tags_data:
        tslug = slugify(tname)
        t = ProjectTag.query.filter_by(slug=tslug).first()
        if not t:
            t = ProjectTag(name=tname, slug=tslug)
            db.session.add(t)
            db.session.flush()
        tag_objs[tslug] = t

    # Project 1: NeuralFlow
    p1 = Project(
        user_id=dev_user.id,
        title="NeuralFlow: Real-time Audio & Code Synthesizer",
        slug="neuralflow-realtime-audio-and-code-synthesizer",
        tagline="A real-time neural network that synthesizes interactive code snippets into live low-latency audio streams.",
        description_markdown="""# NeuralFlow: Real-time Audio Synthesizer

NeuralFlow is an open-source experimental sound synthesizer built for creative coders. It takes reactive parameter matrices generated by web-based algorithms and streams real-time audio through high-throughput WebSockets.

### Key Features
- **Ultra-low latency audio processing:** Sub-12ms audio buffer turnaround using optimized C++ WebAssembly modules.
- **Interactive Matrix Canvas:** Visual modulation routing and DSP filters controlled entirely in browser.
- **WebSocket Streaming Pipeline:** Bi-directional binary packet framing allowing 60 fps parameter automation.

### Architecture Overview
The system is divided into three core subsystems:
1. **Frontend Client:** React 18, WebAudio API, HTML5 Canvas 60fps oscilloscopes.
2. **Inference Gateway:** Python FastAPI with zero-copy shared memory queues.
3. **Core DSP Engine:** PyTorch neural vocoder compiled with TensorRT.""",
        category="Artificial Intelligence",
        cover_image_url="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80",
        github_url="https://github.com/alexchen-dev/neuralflow-synthesizer",
        live_demo_url="https://neuralflow.scriptorium.dev",
        status="PUBLISHED",
        view_count=320,
        upvote_count=48,
    )
    p1.tags.extend([tag_objs["python"], tag_objs["pytorch"], tag_objs["react"], tag_objs["websockets"]])
    db.session.add(p1)
    db.session.flush()

    # Collaborator
    collab1 = ProjectCollaborator(
        project_id=p1.id,
        user_id=student_user.id,
        role_description="Frontend UI/UX & WebAudio Canvas",
    )
    db.session.add(collab1)

    # Screenshots / Media
    media1_1 = ProjectMedia(
        project_id=p1.id,
        media_url="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1000&auto=format&fit=crop&q=80",
        caption="Interactive 60fps audio waveform and spectrum oscilloscope",
        display_order=0,
    )
    media1_2 = ProjectMedia(
        project_id=p1.id,
        media_url="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1000&auto=format&fit=crop&q=80",
        caption="DSP parameter modulation routing matrix",
        display_order=1,
    )
    db.session.add_all([media1_1, media1_2])

    # Structured Code Review by Admin
    cr1 = CodeReview(
        project_id=p1.id,
        reviewer_id=admin_user.id,
        summary="Exceptional DSP integration and clean memory-conscious buffer design.",
        architecture_feedback="Clean separation between the WebSocket packet ingest and PyTorch inference pipeline using ring buffers. Excellent abstraction of audio frame serialization.",
        performance_feedback="Consider utilizing ONNX Runtime with TensorRT execution provider for an estimated 25% lower p99 latency under concurrency.",
        security_feedback="Ensure WebSocket message rate-limiting is enforced at the reverse proxy layer to protect against denial-of-service via audio buffer exhaustion.",
        ui_ux_feedback="The dark mode canvas waveform visualizer has great 60fps responsiveness. Adding keyboard shortcuts for frequency cutoffs would elevate live performance workflow.",
        rating_overall=5,
        status="ADDRESSED",
        upvote_count=12,
    )
    db.session.add(cr1)
    db.session.flush()

    # Comment on Code Review
    crc1 = CodeReviewComment(
        review_id=cr1.id,
        user_id=dev_user.id,
        content="Thank you for the in-depth review! We implemented the TensorRT provider yesterday and saw our inference p99 drop from 18ms to 11ms.",
        code_snippet="""// In audioEngine.cpp
void StreamPipeline::flushRingBuffer() {
    std::lock_guard<std::mutex> lock(bufferMutex);
    while (!frameQueue.empty()) {
        processSampleBlock(frameQueue.front());
        frameQueue.pop();
    }
}"""
    )
    db.session.add(crc1)

    # Project 2: DevLens
    p2 = Project(
        user_id=student_user.id,
        title="DevLens: Automated AST Code Smell & Security Scanner",
        slug="devlens-automated-ast-code-smell-scanner",
        tagline="Instant static analysis tool generating visual AST dependency trees and highlighting security vulnerabilities.",
        description_markdown="""# DevLens: Automated AST Scanner

DevLens is a developer productivity utility designed to inspect TypeScript and Go repositories for architectural smells, dead branches, and unsafe dependency invocations.

### Highlights
- **Visual AST Explorer:** Generates interactive SVG dependency graphs directly from codebases.
- **Rule Engine:** Pluggable linting architecture supporting custom domain-specific rules.
- **High Concurrency:** Go-powered backend capable of parsing 100k lines of code in under 3 seconds.""",
        category="DevOps & Tools",
        cover_image_url="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
        github_url="https://github.com/mayapatel/devlens-scanner",
        live_demo_url="https://devlens-scanner.vercel.app",
        status="PUBLISHED",
        view_count=210,
        upvote_count=35,
    )
    p2.tags.extend([tag_objs["typescript"], tag_objs["go"], tag_objs["docker"]])
    db.session.add(p2)
    db.session.flush()

    # Code review on Project 2 by Developer Alex Chen
    cr2 = CodeReview(
        project_id=p2.id,
        reviewer_id=dev_user.id,
        summary="Clean AST visitor pattern and impressive multi-core scanning benchmarks.",
        architecture_feedback="The pluggable rule engine allows easily writing new linting rules without modifying the core AST traversal logic. Great interface design.",
        performance_feedback="Goroutine pool effectively parallelizes file scanning across multi-core CPUs without runaway memory consumption.",
        security_feedback="Input sanitization handles deeply nested circular JSON objects cleanly without recursion errors or stack overflows.",
        ui_ux_feedback="Interactive node graph tree zoom is intuitive and responsive.",
        rating_overall=5,
        status="RESOLVED",
        upvote_count=9,
    )
    db.session.add(cr2)

    # Project 3: EdgeGuard
    p3 = Project(
        user_id=dev_user.id,
        title="EdgeGuard: Zero-Trust Microservice Identity Mesh",
        slug="edgeguard-zero-trust-microservice-identity-mesh",
        tagline="High-throughput mTLS sidecar proxy validating decentralized student identities at 85,000 requests/second.",
        description_markdown="""# EdgeGuard: Zero-Trust Microservice Identity Mesh

EdgeGuard provides lightweight authentication and policy enforcement sidecars for student cluster workloads.

### Features
- Written in Rust using Tokio async runtime.
- WebAssembly plugin sandbox for custom authorization filters.
- Real-time Prometheus metrics exporter.""",
        category="Systems & Cloud",
        cover_image_url="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80",
        github_url="https://github.com/alexchen-dev/edgeguard-mesh",
        status="PUBLISHED",
        view_count=185,
        upvote_count=29,
    )
    p3.tags.extend([tag_objs["rust"], tag_objs["webassembly"], tag_objs["cloud"]])
    db.session.add(p3)

    # Upvotes
    up1 = ProjectUpvote(project_id=p1.id, user_id=admin_user.id)
    up2 = ProjectUpvote(project_id=p1.id, user_id=student_user.id)
    up3 = ProjectUpvote(project_id=p2.id, user_id=dev_user.id)
    db.session.add_all([up1, up2, up3])

    db.session.commit()
    print("Showcase projects and structured code reviews seeded successfully!")

def _seed_clubs(admin_user, dev_user, student_user):
    from app.models.club import Club, ClubMember, ClubAnnouncement

    print("Seeding technical student clubs and campus announcements...")

    c1 = Club(
        name="Scriptorium Open Source Guild",
        slug="scriptorium-open-source-guild",
        tagline="Empowering students to build, maintain, and contribute to production open-source developer tools.",
        description_markdown="""# Scriptorium Open Source Guild

The Scriptorium Open Source Guild is the campus community for passionate software builders. We collaborate on shared university tooling, contribute upstream to major CNCF and Apache projects, and run hands-on systems architecture clinics.

### Activities & Focus
- **Bi-weekly Code Reviews:** Peer review student PRs and refactoring ideas.
- **Upstream Contribution Sprints:** Mentored first PRs to popular open-source repositories.
- **Systems Engineering:** Building distributed systems, compilers, and microservices.""",
        category="Open Source & Systems",
        lead_user_id=admin_user.id,
        logo_url="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=80",
        banner_url="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80",
        meeting_schedule="Every Tuesday at 6:00 PM • Innovation Lab 101",
        member_count=48,
        is_verified=True,
    )
    db.session.add(c1)
    db.session.flush()

    m1_1 = ClubMember(club_id=c1.id, user_id=admin_user.id, role="LEAD")
    m1_2 = ClubMember(club_id=c1.id, user_id=dev_user.id, role="OFFICER")
    m1_3 = ClubMember(club_id=c1.id, user_id=student_user.id, role="MEMBER")
    db.session.add_all([m1_1, m1_2, m1_3])

    a1_1 = ClubAnnouncement(
        club_id=c1.id,
        author_id=admin_user.id,
        title="Technical Clinic: Dissecting the Linux Virtual Filesystem (VFS) in C",
        content_markdown="Join us this Tuesday for an interactive code walkthrough where we examine file descriptors, inode trees, and write a custom in-memory RAM filesystem driver. Bring your laptop with GCC or Clang installed!",
        announcement_type="WORKSHOP",
        is_pinned=True,
        rsvp_link="https://scriptorium.dev/events/vfs-clinic",
    )
    a1_2 = ClubAnnouncement(
        club_id=c1.id,
        author_id=dev_user.id,
        title="Call for Hackathon 2026 Student Mentors & Track Leads",
        content_markdown="We are recruiting 10 senior student mentors for the upcoming Spring Hackathon to help first-year participants debug deployments, Git workflows, and database migrations.",
        announcement_type="RECRUITMENT",
        is_pinned=False,
    )
    db.session.add_all([a1_1, a1_2])

    # Club 2: Competitive Programming Guild
    c2 = Club(
        name="Competitive Programming Guild",
        slug="competitive-programming-guild",
        tagline="Master algorithmic thinking, rigorous complexity analysis, and competitive programming tournaments.",
        description_markdown="""# Competitive Programming Guild (CPG)

Dedicated to preparing collegiate teams for the ACM ICPC, Google Code Jam, and competitive algorithmic arenas.

### What We Do
- **Weekly Practice Matches:** Simulating ICPC conditions with live scoreboard freezes.
- **Advanced DSA Lectures:** Segment trees, 2D Fenwick trees, Max Flow, Aho-Corasick, and Centroid Decomposition.""",
        category="Competitive Programming",
        lead_user_id=dev_user.id,
        logo_url="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80",
        banner_url="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80",
        meeting_schedule="Every Thursday at 5:30 PM • CS Systems Lab 3",
        member_count=64,
        is_verified=True,
    )
    db.session.add(c2)
    db.session.flush()

    m2_1 = ClubMember(club_id=c2.id, user_id=dev_user.id, role="LEAD")
    m2_2 = ClubMember(club_id=c2.id, user_id=student_user.id, role="MEMBER")
    db.session.add_all([m2_1, m2_2])

    a2_1 = ClubAnnouncement(
        club_id=c2.id,
        author_id=dev_user.id,
        title="Weekly Speedrun: Segment Trees with Lazy Propagation & Range Updates",
        content_markdown="This session covers range update optimizations in logarithmic time. We will solve 4 real past ICPC Regional problems together in C++20 and Python 3.14.",
        announcement_type="WORKSHOP",
        is_pinned=True,
        rsvp_link="https://scriptorium.dev/problems",
    )
    db.session.add(a2_1)

    # Club 3: AI & Cognitive Systems
    c3 = Club(
        name="AI & Cognitive Systems Society",
        slug="ai-and-cognitive-systems-society",
        tagline="Exploring transformer architectures, multimodal models, LLM agents, and neuro-symbolic reasoning.",
        description_markdown="""# AI & Cognitive Systems Society (AICS)

A student-led research and development group focusing on generative intelligence, neural sound synthesis, and real-time inference on edge devices.""",
        category="AI & Machine Learning",
        lead_user_id=student_user.id,
        logo_url="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&auto=format&fit=crop&q=80",
        meeting_schedule="Alternate Saturdays at 11:00 AM • Seminar Hall B",
        member_count=52,
        is_verified=True,
    )
    db.session.add(c3)
    db.session.flush()

    m3_1 = ClubMember(club_id=c3.id, user_id=student_user.id, role="LEAD")
    m3_2 = ClubMember(club_id=c3.id, user_id=dev_user.id, role="OFFICER")
    db.session.add_all([m3_1, m3_2])

    a3_1 = ClubAnnouncement(
        club_id=c3.id,
        author_id=student_user.id,
        title="Hands-On Workshop: LoRA Fine-Tuning on University GPU Nodes",
        content_markdown="Learn how Low-Rank Adaptation (LoRA) reduces trainable parameter counts by 99% while maintaining benchmark precision. We will fine-tune an open-source model on student code datasets.",
        announcement_type="WORKSHOP",
        is_pinned=True,
    )
    db.session.add(a3_1)

    db.session.commit()
    print("Clubs and announcements seeded successfully!")

def seed_database():
    app = create_app("development")
    with app.app_context():
        print("Creating all tables...")
        db.create_all()

        if User.query.filter_by(username="admin").first():
            from app.models.event import Event
            from app.models.blog import BlogPost
            from app.models.project import Project
            from app.models.club import Club
            admin_user = User.query.filter_by(username="admin").first()
            dev_user = User.query.filter_by(username="developer").first()
            student_user = User.query.filter_by(username="student").first()

            if not Event.query.first():
                print("Seeding missing events into existing database...")
                _seed_events(admin_user, dev_user)

            if not BlogPost.query.first():
                print("Seeding missing blogs into existing database...")
                _seed_blogs(admin_user, dev_user, student_user)

            if not Project.query.first():
                print("Seeding missing projects into existing database...")
                _seed_projects(admin_user, dev_user, student_user)

            if not Club.query.first():
                print("Seeding missing technical clubs into existing database...")
                _seed_clubs(admin_user, dev_user, student_user)

            print("Database check complete. Skipping main user seed.")
            return

        print("Seeding demo users...")
        users = [
            ("admin", "admin@scriptorium.dev", "Admin123!", "admin", "Platform Administrator", "System admin and lead architect at Scriptorium."),
            ("moderator", "moderator@scriptorium.dev", "Mod123!", "moderator", "Community Moderator", "Ensuring high quality, respectful and safe technical discussions."),
            ("developer", "developer@scriptorium.dev", "User123!", "user", "Alex Chen", "Full-stack engineer passionate about clean code and algorithms."),
            ("student", "student@scriptorium.dev", "User123!", "user", "Maya Patel", "Computer science student learning data structures.")
        ]

        created_users = {}
        for username, email, password, role, full_name, bio in users:
            u = User(
                username=username,
                email=email,
                password_hash=hash_password(password),
                role=role,
                is_active=True
            )
            db.session.add(u)
            db.session.flush()

            p = Profile(
                user_id=u.id,
                full_name=full_name,
                bio=bio,
                points=100 if role == "admin" else 50,
                problems_solved_count=5 if username == "developer" else 1
            )
            db.session.add(p)
            created_users[username] = u

        print("Seeding tags...")
        tag_definitions = [
            ("python", "Python programming language, idioms, and standard library"),
            ("javascript", "Modern JavaScript (ES6+), Node.js, and runtime environments"),
            ("cpp", "C++ language features, STL, and memory management"),
            ("algorithms", "Sorting, searching, graph traversal, and algorithmic paradigms"),
            ("data-structures", "Arrays, hash tables, linked lists, trees, and heaps"),
            ("web-development", "Frontend, backend, APIs, and web architecture"),
            ("dynamic-programming", "Memoization, tabulation, and recurrence relations"),
            ("system-design", "Distributed systems, caching, databases, and microservices")
        ]

        tags_map = {}
        for name, desc in tag_definitions:
            t = Tag(name=name, slug=name, description=desc, usage_count=5)
            db.session.add(t)
            tags_map[name] = t
        db.session.flush()

        print("Seeding coding problems...")
        problems_data = [
            {
                "title": "Two Sum",
                "slug": "two-sum",
                "difficulty": "EASY",
                "description_markdown": """Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.""",
                "input_format": "Line 1: space-separated integers for nums\nLine 2: target integer",
                "output_format": "Space-separated indices i and j (e.g. '0 1')",
                "constraints": "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
                "starter_templates": {
                    "python": "def two_sum(nums, target):\n    # Write your solution here\n    hash_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in hash_map:\n            return [hash_map[complement], i]\n        hash_map[num] = i\n    return []\n\nif __name__ == '__main__':\n    import sys\n    lines = sys.stdin.read().splitlines()\n    nums = list(map(int, lines[0].split()))\n    target = int(lines[1])\n    res = two_sum(nums, target)\n    print(f'{res[0]} {res[1]}')",
                    "javascript": "const readline = require('readline');\nfunction twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const comp = target - nums[i];\n        if (map.has(comp)) return [map.get(comp), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}\n\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines = [];\nrl.on('line', l => lines.push(l));\nrl.on('close', () => {\n    const nums = lines[0].split(' ').map(Number);\n    const target = Number(lines[1]);\n    const ans = twoSum(nums, target);\n    console.log(`${ans[0]} ${ans[1]}`);\n});",
                    "cpp": "#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    // Input reading and implementation\n    int n, target;\n    // Read input and compute\n    return 0;\n}"
                },
                "tags": ["algorithms", "data-structures", "python"],
                "test_cases": [
                    {"input": "2 7 11 15\n9", "output": "0 1", "is_sample": True, "is_hidden": False, "explanation": "nums[0] + nums[1] == 2 + 7 == 9, so indices are 0 1."},
                    {"input": "3 2 4\n6", "output": "1 2", "is_sample": True, "is_hidden": False, "explanation": "nums[1] + nums[2] == 2 + 4 == 6, so indices are 1 2."},
                    {"input": "3 3\n6", "output": "0 1", "is_sample": False, "is_hidden": True, "explanation": "Duplicate values handled."},
                    {"input": "-1 -2 -3 -4 -5\n-8", "output": "2 4", "is_sample": False, "is_hidden": True, "explanation": "Negative integers."}
                ]
            },
            {
                "title": "Palindrome Number",
                "slug": "palindrome-number",
                "difficulty": "EASY",
                "description_markdown": """Given an integer `x`, return `true` if `x` is a **palindrome**, and `false` otherwise.

An integer is a palindrome when it reads the same forward and backward. For example, `121` is a palindrome while `123` is not.""",
                "input_format": "A single line containing integer x",
                "output_format": "Print 'true' or 'false'",
                "constraints": "-2^31 <= x <= 2^31 - 1",
                "starter_templates": {
                    "python": "import sys\ndef is_palindrome(x):\n    s = str(x)\n    return s == s[::-1]\n\nif __name__ == '__main__':\n    x = sys.stdin.read().strip()\n    print('true' if is_palindrome(x) else 'false')",
                    "javascript": "const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on('line', (line) => {\n    const s = line.trim();\n    const rev = s.split('').reverse().join('');\n    console.log(s === rev ? 'true' : 'false');\n});",
                    "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string s; cin >> s;\n    string r = string(s.rbegin(), s.rend());\n    cout << (s == r ? \"true\" : \"false\") << endl;\n    return 0;\n}"
                },
                "tags": ["algorithms", "python"],
                "test_cases": [
                    {"input": "121", "output": "true", "is_sample": True, "is_hidden": False, "explanation": "121 reads as 121 from left to right and from right to left."},
                    {"input": "-121", "output": "false", "is_sample": True, "is_hidden": False, "explanation": "From left to right, it reads -121. From right to left, it becomes 121-."},
                    {"input": "10", "output": "false", "is_sample": False, "is_hidden": True, "explanation": "Reads 01 from right to left."},
                    {"input": "12321", "output": "true", "is_sample": False, "is_hidden": True, "explanation": "Odd length palindrome."}
                ]
            },
            {
                "title": "Valid Parentheses",
                "slug": "valid-parentheses",
                "difficulty": "EASY",
                "description_markdown": """Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.""",
                "input_format": "A single line containing the string s",
                "output_format": "Print 'true' or 'false'",
                "constraints": "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
                "starter_templates": {
                    "python": "import sys\ndef is_valid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top: return False\n        else:\n            stack.append(char)\n    return not stack\n\nif __name__ == '__main__':\n    s = sys.stdin.read().strip()\n    print('true' if is_valid(s) else 'false')",
                    "javascript": "const readline = require('readline');\n// JavaScript solution template",
                    "cpp": "// C++ solution template"
                },
                "tags": ["data-structures", "algorithms"],
                "test_cases": [
                    {"input": "()", "output": "true", "is_sample": True, "is_hidden": False, "explanation": "Matching single pair."},
                    {"input": "()[]{}", "output": "true", "is_sample": True, "is_hidden": False, "explanation": "Consecutive matching pairs."},
                    {"input": "(]", "output": "false", "is_sample": False, "is_hidden": True, "explanation": "Mismatched closing bracket."},
                    {"input": "([)]", "output": "false", "is_sample": False, "is_hidden": True, "explanation": "Incorrect closing order."}
                ]
            },
            {
                "title": "Longest Substring Without Repeating Characters",
                "slug": "longest-substring-without-repeating-characters",
                "difficulty": "MEDIUM",
                "description_markdown": """Given a string `s`, find the length of the **longest substring** without repeating characters.""",
                "input_format": "A single line containing string s",
                "output_format": "An integer representing the length of the longest substring",
                "constraints": "0 <= s.length <= 5 * 10^4",
                "starter_templates": {
                    "python": "import sys\ndef length_of_longest_substring(s):\n    char_index = {}\n    max_len = 0\n    start = 0\n    for i, char in enumerate(s):\n        if char in char_index and char_index[char] >= start:\n            start = char_index[char] + 1\n        char_index[char] = i\n        max_len = max(max_len, i - start + 1)\n    return max_len\n\nif __name__ == '__main__':\n    s = sys.stdin.read().rstrip('\\r\\n')\n    print(length_of_longest_substring(s))",
                    "javascript": "// JS template",
                    "cpp": "// C++ template"
                },
                "tags": ["algorithms", "python"],
                "test_cases": [
                    {"input": "abcabcbb", "output": "3", "is_sample": True, "is_hidden": False, "explanation": "The answer is 'abc', with the length of 3."},
                    {"input": "bbbbb", "output": "1", "is_sample": True, "is_hidden": False, "explanation": "The answer is 'b', with the length of 1."},
                    {"input": "pwwkew", "output": "3", "is_sample": False, "is_hidden": True, "explanation": "The answer is 'wke', with the length of 3."}
                ]
            },
            {
                "title": "Trapping Rain Water",
                "slug": "trapping-rain-water",
                "difficulty": "HARD",
                "description_markdown": """Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.""",
                "input_format": "Space-separated non-negative integers representing heights",
                "output_format": "A single integer denoting total units of trapped rain water",
                "constraints": "n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5",
                "starter_templates": {
                    "python": "import sys\ndef trap(height):\n    if not height: return 0\n    left, right = 0, len(height) - 1\n    left_max, right_max = height[left], height[right]\n    water = 0\n    while left < right:\n        if left_max < right_max:\n            left += 1\n            left_max = max(left_max, height[left])\n            water += left_max - height[left]\n        else:\n            right -= 1\n            right_max = max(right_max, height[right])\n            water += right_max - height[right]\n    return water\n\nif __name__ == '__main__':\n    height = list(map(int, sys.stdin.read().split()))\n    print(trap(height))",
                    "javascript": "// JS template",
                    "cpp": "// C++ template"
                },
                "tags": ["algorithms", "dynamic-programming"],
                "test_cases": [
                    {"input": "0 1 0 2 1 0 1 3 2 1 2 1", "output": "6", "is_sample": True, "is_hidden": False, "explanation": "6 units of rain water are being trapped."},
                    {"input": "4 2 0 3 2 5", "output": "9", "is_sample": True, "is_hidden": False, "explanation": "9 units of rain water trapped."}
                ]
            }
        ]

        for p_data in problems_data:
            prob = Problem(
                title=p_data["title"],
                slug=p_data["slug"],
                difficulty=p_data["difficulty"],
                description_markdown=p_data["description_markdown"],
                input_format=p_data["input_format"],
                output_format=p_data["output_format"],
                constraints=p_data["constraints"],
                starter_templates=p_data["starter_templates"],
                time_limit_ms=2000,
                memory_limit_mb=128,
                is_published=True,
                created_by=created_users["admin"].id
            )
            for t_name in p_data["tags"]:
                if t_name in tags_map:
                    prob.tags.append(tags_map[t_name])

            for i, tc in enumerate(p_data["test_cases"]):
                test_case = TestCase(
                    input_data=tc["input"],
                    expected_output=tc["output"],
                    is_sample=tc["is_sample"],
                    is_hidden=tc["is_hidden"],
                    explanation=tc["explanation"],
                    order_index=i
                )
                prob.test_cases.append(test_case)

            db.session.add(prob)

        print("Seeding community discussions...")
        q1 = Question(
            author_id=created_users["student"].id,
            title="How does Python's GIL affect multi-threading and CPU-bound tasks?",
            slug="how-does-pythons-gil-affect-multithreading-and-cpu-bound-tasks",
            content_markdown="""I've been learning concurrency in Python and noticed that running multiple threads on CPU-heavy tasks didn't speed up my execution. 

Could someone explain what the **Global Interpreter Lock (GIL)** is, why it exists in CPython, and what the recommended alternative is for parallelizing CPU-bound workloads in Python?""",
            view_count=42,
            vote_count=8,
            answer_count=2,
            is_solved=True
        )
        q1.tags.append(tags_map["python"])
        q1.tags.append(tags_map["web-development"])
        db.session.add(q1)
        db.session.flush()

        a1 = Answer(
            question_id=q1.id,
            author_id=created_users["developer"].id,
            content_markdown="""The **Global Interpreter Lock (GIL)** is a mutex that prevents multiple native threads from executing Python bytecodes at once in the CPython implementation.

### Why does it exist?
1. Simplifies memory management in CPython (which uses reference counting).
2. Prevents race conditions during garbage collection.
3. Makes integrating non-thread-safe C extensions straightforward.

### Solution for CPU-bound tasks:
Instead of `threading`, use the `multiprocessing` module or `concurrent.futures.ProcessPoolExecutor`:

```python
from multiprocessing import Pool

def compute_square(n):
    return n * n

if __name__ == '__main__':
    with Pool(4) as p:
        results = p.map(compute_square, [1, 2, 3, 4, 5])
        print(results)
```

Each process gets its own independent Python interpreter and memory space, effectively bypassing the GIL!""",
            vote_count=12,
            is_accepted=True
        )
        db.session.add(a1)
        db.session.flush()

        q1.accepted_answer_id = a1.id

        # Comment on question
        c1 = Comment(
            author_id=created_users["moderator"].id,
            target_type="question",
            target_id=q1.id,
            content="Great question! Also check out the upcoming free-threaded Python (PEP 703) if you're experimenting with Python 3.13+."
        )
        db.session.add(c1)
        db.session.commit()

        _seed_events(created_users["admin"], created_users["developer"])
        _seed_blogs(created_users["admin"], created_users["developer"], created_users["student"])
        _seed_projects(created_users["admin"], created_users["developer"], created_users["student"])
        _seed_clubs(created_users["admin"], created_users["developer"], created_users["student"])
        print("Database seeded successfully with demo users, tags, problems, test cases, events, blogs, showcase projects, and technical clubs!")

if __name__ == "__main__":
    seed_database()

