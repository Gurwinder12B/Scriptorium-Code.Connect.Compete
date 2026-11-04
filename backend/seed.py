import json
from app import create_app
from app.extensions import db
from app.models.user import User, Profile
from app.models.community import Tag, Question, Answer, Comment, Vote
from app.models.problem import Problem, TestCase
from app.common.security import hash_password

def seed_database():
    app = create_app("development")
    with app.app_context():
        print("Creating all tables...")
        db.create_all()

        if User.query.filter_by(username="admin").first():
            print("Database already contains seed data. Skipping.")
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
        print("Database seeded successfully with demo users, tags, problems, test cases, and discussions!")

if __name__ == "__main__":
    seed_database()
