from app.models.community import Question, Answer
from app.models.submission import UserProblemProgress
from app.models.blog import BlogPost
from app.models.project import Project, CodeReview

BADGE_DEFINITIONS = {
    "PROJECT_CREATOR": {
        "id": "PROJECT_CREATOR",
        "name": "Open Source Creator",
        "description": "Published an innovative software project to the Scriptorium Showcase.",
        "icon": "FolderGit2",
        "color": "indigo",
        "tier": "Bronze",
    },
    "CODE_INSPECTOR": {
        "id": "CODE_INSPECTOR",
        "name": "Code Inspector",
        "description": "Submitted a structured peer code review with actionable feedback.",
        "icon": "Code2",
        "color": "emerald",
        "tier": "Silver",
    },
    "TECH_WRITER": {
        "id": "TECH_WRITER",
        "name": "Technical Writer",
        "description": "Published an approved in-depth engineering article in Student Blogs.",
        "icon": "BookOpen",
        "color": "teal",
        "tier": "Silver",
    },
    "ALGO_SOLVER": {
        "id": "ALGO_SOLVER",
        "name": "Algorithmic Solver",
        "description": "Solved programming challenges on the practice judge.",
        "icon": "Zap",
        "color": "amber",
        "tier": "Gold",
    },
    "COMMUNITY_PILLAR": {
        "id": "COMMUNITY_PILLAR",
        "name": "Community Pillar",
        "description": "Provided accepted solutions and helped fellow students in Q&A discussions.",
        "icon": "Sparkles",
        "color": "purple",
        "tier": "Gold",
    },
    "PROLIFIC_REVIEWER": {
        "id": "PROLIFIC_REVIEWER",
        "name": "Prolific Reviewer",
        "description": "Contributed 3 or more thorough code reviews to student projects.",
        "icon": "ShieldCheck",
        "color": "rose",
        "tier": "Diamond",
    },
}

def calculate_user_badges(user_id: int):
    """
    Computes genuine badges derived purely from authentic database activity records.
    Prevents artificial or fake badge awards.
    """
    badges = []

    # 1. Projects Published
    projects_count = Project.query.filter_by(user_id=user_id, status="PUBLISHED").count()
    if projects_count > 0:
        b = dict(BADGE_DEFINITIONS["PROJECT_CREATOR"])
        b["metric"] = f"{projects_count} Project{'s' if projects_count > 1 else ''} published"
        badges.append(b)

    # 2. Code Reviews
    reviews_count = CodeReview.query.filter_by(reviewer_id=user_id).count()
    if reviews_count >= 1:
        b = dict(BADGE_DEFINITIONS["CODE_INSPECTOR"])
        b["metric"] = f"{reviews_count} Peer Review{'s' if reviews_count > 1 else ''}"
        badges.append(b)

    if reviews_count >= 3:
        b = dict(BADGE_DEFINITIONS["PROLIFIC_REVIEWER"])
        b["metric"] = f"{reviews_count} Reviews contributed"
        badges.append(b)

    # 3. Blogs Published
    blogs_count = BlogPost.query.filter_by(author_id=user_id, status="PUBLISHED").count()
    if blogs_count > 0:
        b = dict(BADGE_DEFINITIONS["TECH_WRITER"])
        b["metric"] = f"{blogs_count} Article{'s' if blogs_count > 1 else ''} published"
        badges.append(b)

    # 4. Algorithmic Problems Solved
    solved_count = UserProblemProgress.query.filter_by(user_id=user_id, status="SOLVED").count()
    if solved_count > 0:
        b = dict(BADGE_DEFINITIONS["ALGO_SOLVER"])
        b["metric"] = f"{solved_count} Challenge{'s' if solved_count > 1 else ''} solved"
        badges.append(b)

    # 5. Community Q&A Accepted Answers
    accepted_answers = Answer.query.filter_by(author_id=user_id, is_accepted=True).count()
    if accepted_answers > 0:
        b = dict(BADGE_DEFINITIONS["COMMUNITY_PILLAR"])
        b["metric"] = f"{accepted_answers} Accepted solution{'s' if accepted_answers > 1 else ''}"
        badges.append(b)

    return badges
