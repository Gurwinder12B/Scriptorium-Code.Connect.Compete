import { Problem, Question, Tag, LeaderboardEntry, BlogPostItem, BlogCategory, ProjectItem, ClubItem, EventItem } from '../types';

export const fallbackProblems: Problem[] = [
  {
    id: 1,
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'EASY',
    description_markdown: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    input_format: 'Line 1: space-separated integers for nums\nLine 2: target integer',
    output_format: 'Space-separated indices i and j (e.g. 0 1)',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
    time_limit_ms: 1000,
    memory_limit_mb: 128,
    is_published: true,
    acceptance_rate: 81.4,
    total_submissions: 420,
    accepted_submissions: 342,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    starter_templates: {
      python: `def two_sum(nums, target):\n    # Write your solution here\n    hash_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in hash_map:\n            return [hash_map[complement], i]\n        hash_map[num] = i\n    return []\n\nif __name__ == '__main__':\n    import sys\n    lines = sys.stdin.read().splitlines()\n    nums = list(map(int, lines[0].split()))\n    target = int(lines[1])\n    res = two_sum(nums, target)\n    print(f'{res[0]} {res[1]}')`,
      javascript: `const readline = require('readline');\nfunction twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const comp = target - nums[i];\n        if (map.has(comp)) return [map.get(comp), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}\n\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines = [];\nrl.on('line', l => lines.push(l));\nrl.on('close', () => {\n    const nums = lines[0].split(' ').map(Number);\n    const target = Number(lines[1]);\n    const ans = twoSum(nums, target);\n    console.log(\`\${ans[0]} \${ans[1]}\`);\n});`,
      cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    // Input reading and implementation\n    return 0;\n}`
    },
    sample_test_cases: [
      { id: 1, problem_id: 1, is_sample: true, is_hidden: false, order_index: 1, input_data: '2 7 11 15\n9', expected_output: '0 1', explanation: 'nums[0] + nums[1] == 2 + 7 == 9, so indices are 0 1.' },
      { id: 2, problem_id: 1, is_sample: true, is_hidden: false, order_index: 2, input_data: '3 2 4\n6', expected_output: '1 2', explanation: 'nums[1] + nums[2] == 2 + 4 == 6, so indices are 1 2.' }
    ],
    tags: [
      { id: 1, name: 'algorithms', slug: 'algorithms', description: 'Algorithms', usage_count: 38 },
      { id: 2, name: 'data-structures', slug: 'data-structures', description: 'Data Structures', usage_count: 31 },
      { id: 3, name: 'python', slug: 'python', description: 'Python', usage_count: 24 }
    ]
  },
  {
    id: 2,
    title: 'Palindrome Number',
    slug: 'palindrome-number',
    difficulty: 'EASY',
    description_markdown: `Given an integer \`x\`, return \`true\` if \`x\` is a **palindrome**, and \`false\` otherwise.

An integer is a palindrome when it reads the same forward and backward. For example, \`121\` is a palindrome while \`123\` is not.`,
    input_format: 'A single line containing integer x',
    output_format: "Print 'true' or 'false'",
    constraints: '-2^31 <= x <= 2^31 - 1',
    time_limit_ms: 1000,
    memory_limit_mb: 128,
    is_published: true,
    acceptance_rate: 90.3,
    total_submissions: 310,
    accepted_submissions: 280,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    starter_templates: {
      python: `import sys\ndef is_palindrome(x):\n    s = str(x)\n    return s == s[::-1]\n\nif __name__ == '__main__':\n    x = sys.stdin.read().strip()\n    print('true' if is_palindrome(x) else 'false')`,
      javascript: `// Implement palindrome`,
      cpp: `#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string s; cin >> s;\n    string r = string(s.rbegin(), s.rend());\n    cout << (s == r ? "true" : "false") << endl;\n    return 0;\n}`
    },
    sample_test_cases: [
      { id: 3, problem_id: 2, is_sample: true, is_hidden: false, order_index: 1, input_data: '121', expected_output: 'true', explanation: '121 reads forward and backward identically.' }
    ],
    tags: [
      { id: 1, name: 'algorithms', slug: 'algorithms', description: 'Algorithms', usage_count: 38 },
      { id: 3, name: 'python', slug: 'python', description: 'Python', usage_count: 24 }
    ]
  },
  {
    id: 3,
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'EASY',
    description_markdown: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.`,
    input_format: 'A single line containing the string s',
    output_format: "Print 'true' or 'false'",
    constraints: "1 <= s.length <= 10^4",
    time_limit_ms: 1000,
    memory_limit_mb: 128,
    is_published: true,
    acceptance_rate: 74.1,
    total_submissions: 290,
    accepted_submissions: 215,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    starter_templates: {
      python: `def is_valid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top: return False\n        else:\n            stack.append(char)\n    return not stack`,
      javascript: `// Implement isValid`,
      cpp: `// Implement isValid`
    },
    sample_test_cases: [
      { id: 4, problem_id: 3, is_sample: true, is_hidden: false, order_index: 1, input_data: '()[]{}', expected_output: 'true' }
    ],
    tags: [
      { id: 2, name: 'data-structures', slug: 'data-structures', description: 'Data Structures', usage_count: 31 }
    ]
  },
  {
    id: 4,
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    difficulty: 'MEDIUM',
    description_markdown: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
    input_format: 'Space-separated integers representing nodes',
    output_format: 'Space-separated integers of reversed nodes',
    constraints: 'The number of nodes in the list is the range [0, 5000].',
    time_limit_ms: 1000,
    memory_limit_mb: 128,
    is_published: true,
    acceptance_rate: 75.0,
    total_submissions: 240,
    accepted_submissions: 180,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    starter_templates: {
      python: `def reverse_list(head):\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev`,
      javascript: `// Implement reverseList`,
      cpp: `// Implement reverseList`
    },
    sample_test_cases: [
      { id: 5, problem_id: 4, is_sample: true, is_hidden: false, order_index: 1, input_data: '1 2 3 4 5', expected_output: '5 4 3 2 1' }
    ],
    tags: [
      { id: 2, name: 'data-structures', slug: 'data-structures', description: 'Data Structures', usage_count: 31 }
    ]
  }
];

export const fallbackTags: Tag[] = [
  { id: 1, name: 'python', slug: 'python', description: 'Python programming language, standard library & idioms', usage_count: 24 },
  { id: 2, name: 'algorithms', slug: 'algorithms', description: 'Algorithmic paradigms, complexity, sorting & graphs', usage_count: 38 },
  { id: 3, name: 'data-structures', slug: 'data-structures', description: 'Trees, heaps, stacks, queues, hash tables', usage_count: 31 },
  { id: 4, name: 'web-development', slug: 'web-development', description: 'React, Node.js, WebSockets, REST & GraphQL', usage_count: 19 },
  { id: 5, name: 'system-design', slug: 'system-design', description: 'Scalability, microservices, caching & databases', usage_count: 15 }
];

export const fallbackQuestions: Question[] = [
  {
    id: 1,
    author_id: 2,
    author_username: 'developer',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Understanding Python 3.14 GIL removal and thread safety in multithreaded backends',
    slug: 'understanding-python-314-gil-removal',
    content_markdown: `With PEP 703 making the Global Interpreter Lock optional in Python 3.13 and 3.14, how does free-threading affect existing multithreaded codebases? 

Specifically, do built-in operations on dictionaries and lists remain atomic, or do we now require explicit mutex locks around shared mutable state?`,
    is_solved: true,
    vote_count: 18,
    answer_count: 2,
    view_count: 340,
    tags: [
      { id: 1, name: 'python', slug: 'python', description: 'Python', usage_count: 24 },
      { id: 5, name: 'system-design', slug: 'system-design', description: 'System Design', usage_count: 15 }
    ],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    answers: [
      {
        id: 1,
        question_id: 1,
        author_id: 1,
        author_username: 'admin',
        author_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        content_markdown: `In free-threaded Python (no-GIL build), CPython relies on internal mimalloc thread-safe allocators and biased reference counting. 

However, **thread safety at the Python language level still requires discipline**:

\`\`\`python
# While single dict lookups and assignments are synchronized at the C layer:
data[key] = val  # Thread-safe in CPython

# Compound read-modify-write operations are NOT atomic:
data[key] = data.get(key, 0) + 1  # RACE CONDITION! Requires threading.Lock()
\`\`\`

Always protect compound mutations with \`threading.Lock()\` or use concurrent primitives from \`queue\` or \`concurrent.futures\`.`,
        vote_count: 14,
        is_accepted: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  },
  {
    id: 2,
    author_id: 4,
    author_username: 'student',
    author_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    title: 'How to efficiently detect and prevent memory leaks in large React SPA applications?',
    slug: 'prevent-memory-leaks-react-spa',
    content_markdown: `We have noticed that long-running sessions in our React SPA gradually consume hundreds of megabytes of RAM. What are the best practices for identifying uncleaned event listeners, detached DOM nodes, and dangling RxJS/WebSocket subscriptions?`,
    is_solved: false,
    vote_count: 12,
    answer_count: 1,
    view_count: 210,
    tags: [
      { id: 4, name: 'web-development', slug: 'web-development', description: 'Web Dev', usage_count: 19 },
      { id: 5, name: 'system-design', slug: 'system-design', description: 'System Design', usage_count: 15 }
    ],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

export const fallbackLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    username: 'developer',
    full_name: 'Alex Chen',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    problems_solved_count: 6,
    questions_count: 2,
    answers_count: 14,
    points: 180
  },
  {
    rank: 2,
    username: 'admin',
    full_name: 'Platform Administrator',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    problems_solved_count: 4,
    questions_count: 1,
    answers_count: 22,
    points: 150
  },
  {
    rank: 3,
    username: 'moderator',
    full_name: 'Community Moderator',
    avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    problems_solved_count: 3,
    questions_count: 1,
    answers_count: 18,
    points: 120
  },
  {
    rank: 4,
    username: 'student',
    full_name: 'Maya Patel',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    problems_solved_count: 2,
    questions_count: 3,
    answers_count: 6,
    points: 70
  }
];

export const fallbackBlogCategories: BlogCategory[] = [
  { id: 1, name: 'Python', slug: 'python', description: 'Python internals, async, and ecosystem', posts_count: 4 },
  { id: 2, name: 'Web Development', slug: 'web-development', description: 'Modern frontend, backend architectures & APIs', posts_count: 6 },
  { id: 3, name: 'Artificial Intelligence', slug: 'artificial-intelligence', description: 'Neural networks, transformers & LLM agents', posts_count: 3 },
  { id: 4, name: 'Data Structures & Algorithms', slug: 'data-structures-algorithms', description: 'Algorithmic thinking & complexity analysis', posts_count: 5 }
];

export const fallbackBlogs: BlogPostItem[] = [
  {
    id: 1,
    title: 'Deep Dive into Memory Management and Garbage Collection in Python 3.14',
    slug: 'deep-dive-into-memory-management-and-garbage-collection-in-python',
    excerpt: 'An architectural exploration of reference counting, cyclic garbage collection, and how PEP 703 free-threading transforms memory barriers in modern CPython.',
    content_markdown: `# Deep Dive into Python Memory Management

Python's memory management model is both elegant and deceptively sophisticated. While high-level developers rarely need to invoke \`malloc()\` or \`free()\`, understanding how CPython manages memory is crucial for building high-throughput, low-latency backends.

## 1. Reference Counting: The First Line of Defense
Every object in CPython contains a header defined by \`PyObject\`:
\`\`\`c
struct _object {
    _PyObject_HEAD_EXTRA
    Py_ssize_t ob_refcnt;
    struct _typeobject *ob_type;
};
\`\`\`
Whenever an object is referenced, its \`ob_refcnt\` is incremented. When references fall out of scope, the counter decrements. As soon as \`ob_refcnt == 0\`, memory is deallocated immediately.

## 2. Cyclic Garbage Collection
Reference counting alone cannot handle self-referential cycles. To solve this, CPython runs a **generational cyclic garbage collector** that categorizes objects into three generations based on survival cycles.

## 3. PEP 703: The Free-Threaded Future
With Python 3.13 and 3.14, the Global Interpreter Lock (GIL) is becoming optional through mimalloc and biased reference counting. This allows true multi-core thread scaling across multiple CPUs without process boundaries!`,
    cover_image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    reading_time_minutes: 4,
    status: 'PUBLISHED',
    is_featured: true,
    is_editors_pick: true,
    view_count: 184,
    like_count: 29,
    comment_count: 2,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    published_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    author: {
      id: 2,
      username: 'developer',
      role: 'user',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      full_name: 'Alex Chen'
    }
  },
  {
    id: 2,
    title: 'Building Resilient Real-Time Collaborative Web Applications with WebSockets and CRDTs',
    slug: 'building-resilient-realtime-collaborative-web-applications-crdts',
    excerpt: 'Learn how Conflict-free Replicated Data Types (CRDTs) enable multi-user collaborative editors without locking servers or suffering merge conflicts.',
    content_markdown: `# Collaborative Web Architecture with CRDTs

Building collaborative software like Google Docs, Figma, or interactive code editors requires managing concurrent edits from multiple network clients without centralized mutex locks.

## The CRDT Solution
**Conflict-free Replicated Data Types (CRDTs)** guarantee *strong eventual consistency*. Any two nodes that have received the same set of updates (regardless of order) will independently converge to the exact same document state!`,
    cover_image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
    reading_time_minutes: 6,
    status: 'PUBLISHED',
    is_featured: false,
    is_editors_pick: false,
    view_count: 98,
    like_count: 16,
    comment_count: 1,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    published_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    author: {
      id: 2,
      username: 'developer',
      role: 'user',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      full_name: 'Alex Chen'
    }
  }
];

export const fallbackProjects: ProjectItem[] = [
  {
    id: 1,
    title: 'NeuralFlow — Edge AI Inference Engine',
    slug: 'neuralflow-edge-ai-inference-engine',
    tagline: 'Ultra-lightweight real-time neural inference engine running quantised models on WebAssembly and Vulkan.',
    description_markdown: `### NeuralFlow Architecture
NeuralFlow executes ONNX models with 8-bit integer quantization directly on edge devices.

- **Sub-10ms Latency:** Zero memory copies during tensor operations.
- **Vulkan & WebAssembly Acceleration:** Runs in browser or embedded chips.`,
    category: 'AI & Machine Learning',
    cover_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    github_url: 'https://github.com/scriptorium-labs/neuralflow',
    live_demo_url: 'https://scriptorium.dev/demo/neuralflow',
    status: 'PUBLISHED',
    view_count: 245,
    upvote_count: 42,
    review_count: 3,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    author: {
      id: 2,
      username: 'developer',
      role: 'user',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      full_name: 'Alex Chen'
    },
    tags: [
      { id: 1, name: 'WebAssembly', slug: 'webassembly' },
      { id: 2, name: 'Rust', slug: 'rust' },
      { id: 3, name: 'AI/ML', slug: 'ai-ml' }
    ]
  },
  {
    id: 2,
    title: 'DevLens — Real-Time Microservice Observability',
    slug: 'devlens-microservice-observability',
    tagline: 'Distributed tracing and log correlation engine for polyglot microservice clusters.',
    description_markdown: `Distributed trace visualization with sub-second span ingestion and OpenTelemetry compatibility.`,
    category: 'Developer Tools',
    cover_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    github_url: 'https://github.com/scriptorium-labs/devlens',
    status: 'PUBLISHED',
    view_count: 180,
    upvote_count: 28,
    review_count: 1,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    author: {
      id: 1,
      username: 'admin',
      role: 'admin',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      full_name: 'Platform Administrator'
    },
    tags: [
      { id: 4, name: 'Go', slug: 'go' },
      { id: 5, name: 'Observability', slug: 'observability' }
    ]
  }
];

export const fallbackClubs: ClubItem[] = [
  {
    id: 1,
    name: 'Scriptorium Open Source Guild',
    slug: 'scriptorium-open-source-guild',
    tagline: 'A student-driven collective maintaining core libraries, CLI tooling, and developer utilities.',
    description_markdown: 'We build and maintain open-source software for collegiate developers.',
    category: 'Open Source Development',
    logo_url: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    meeting_schedule: 'Every Wednesday at 6:00 PM • Engineering Block 4',
    member_count: 48,
    is_verified: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 2,
    name: 'Competitive Programming Guild',
    slug: 'competitive-programming-guild',
    tagline: 'Master algorithmic thinking, rigorous complexity analysis, and competitive programming tournaments.',
    description_markdown: 'Dedicated to preparing collegiate teams for the ACM ICPC and code contests.',
    category: 'Competitive Programming',
    logo_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80',
    meeting_schedule: 'Every Thursday at 5:30 PM • CS Systems Lab 3',
    member_count: 64,
    is_verified: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 3,
    name: 'AI & Cognitive Systems Society',
    slug: 'ai-and-cognitive-systems-society',
    tagline: 'Exploring transformer architectures, multimodal models, LLM agents, and neuro-symbolic reasoning.',
    description_markdown: 'A student-led research and development group focusing on generative intelligence.',
    category: 'AI & Machine Learning',
    logo_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&auto=format&fit=crop&q=80',
    meeting_schedule: 'Alternate Saturdays at 11:00 AM • Seminar Hall B',
    member_count: 52,
    is_verified: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString()
  }
];

export const fallbackEvents: EventItem[] = [
  {
    id: 1,
    title: 'Scriptorium Annual Hackathon 2026',
    slug: 'scriptorium-annual-hackathon-2026',
    description: 'A high-intensity 48-hour continuous coding hackathon where 60 student developer teams built cutting-edge AI tools and web services.',
    category: 'Hackathons',
    event_date: '2026-03-14T09:00:00Z',
    location: 'University Tech Innovation Hub, Hall A',
    organizing_club: 'Scriptorium Core & ACM Student Chapter',
    cover_image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80',
    recap_markdown: '# Scriptorium Annual Hackathon 2026 Recap\n\nOver 240 students across 60 teams participated in 48 hours of non-stop coding.',
    highlights: ['60 Teams Participated', '48 Hours of Non-stop Coding', '$5,000 in Prizes & Swag', '15 Industry Judges & Mentors'],
    participating_teams: [
      { name: 'Team ByteCraft', project: 'AST Visualizer', rank: '1st Place' },
      { name: 'Team NeuralPulse', project: 'Edge LLM Runner', rank: '2nd Place' }
    ],
    is_published: true,
    is_archived: false,
    media_count: 4,
    created_at: '2026-03-16T12:00:00Z'
  }
];
