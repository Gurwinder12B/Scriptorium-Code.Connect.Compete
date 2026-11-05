import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Code2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  Database,
  Terminal,
  Brain,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Button } from '../components/common/Button';

interface CurriculumNode {
  id: string;
  title: string;
  duration: string;
  description: string;
  keyTopics: string[];
  practiceProblemSlug?: string;
  blogSlug?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED';
}

interface Track {
  id: string;
  title: string;
  category: string;
  tagline: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  color: string;
  icon: any;
  nodes: CurriculumNode[];
}

const LEARNING_TRACKS: Track[] = [
  {
    id: 'dsa',
    title: 'Algorithmic Mastery & Data Structures',
    category: 'Algorithms',
    tagline: 'From basic pointer arithmetic and arrays to dynamic programming and max-flow graph networks.',
    level: 'Intermediate',
    color: 'from-amber-500 to-orange-600',
    icon: Zap,
    nodes: [
      {
        id: 'dsa-1',
        title: 'Array Invariants & Hash Maps',
        duration: '3 hours',
        description: 'Trade O(N) memory for O(1) lookup speeds. Master complement tracking and frequency maps.',
        keyTopics: ['Hash Map Invariants', 'Array Slices', 'Complement Lookup'],
        practiceProblemSlug: 'two-sum',
        status: 'COMPLETED',
      },
      {
        id: 'dsa-2',
        title: 'Two Pointers & String Symmetry',
        duration: '4 hours',
        description: 'Traverse sorted arrays and check palindromic invariants with left-right convergence.',
        keyTopics: ['Two Pointers', 'Shrinking Windows', 'Space Optimization'],
        practiceProblemSlug: 'palindrome-number',
        status: 'IN_PROGRESS',
      },
      {
        id: 'dsa-3',
        title: 'Stacks, Queues & Monotonic Invariants',
        duration: '5 hours',
        description: 'LIFO structure for bracket matching, AST syntax validation, and next greater elements.',
        keyTopics: ['LIFO Stacks', 'Parentheses Validation', 'Monotonic Sequences'],
        practiceProblemSlug: 'valid-parentheses',
        status: 'IN_PROGRESS',
      },
      {
        id: 'dsa-4',
        title: 'Trees & Graph Traversal (BFS & DFS)',
        duration: '8 hours',
        description: 'Recursive tree traversals, level-order BFS queues, and shortest paths in unweighted graphs.',
        keyTopics: ['Binary Search Trees', 'Queue-based BFS', 'Backtracking DFS'],
        status: 'LOCKED',
      },
      {
        id: 'dsa-5',
        title: 'Dynamic Programming & Memoization',
        duration: '10 hours',
        description: 'Breaking optimal substructure into overlapping subproblems with memo tables.',
        keyTopics: ['Bottom-up Tabulation', 'Top-down Memoization', '0/1 Knapsack'],
        status: 'LOCKED',
      },
    ],
  },
  {
    id: 'web-systems',
    title: 'Full-Stack Architecture & Microservices',
    category: 'Systems & Web',
    tagline: 'Designing resilient APIs, relational indexing, caching strategies, and event-driven decoupling.',
    level: 'Advanced',
    color: 'from-indigo-500 to-sky-600',
    icon: Database,
    nodes: [
      {
        id: 'web-1',
        title: 'RESTful API Contracts & HTTP/2 Semantics',
        duration: '4 hours',
        description: 'Designing uniform response envelopes, idempotent operations, and HTTP status codes.',
        keyTopics: ['REST Standard', 'Idempotency', 'Status Codes & Envelopes'],
        status: 'COMPLETED',
      },
      {
        id: 'web-2',
        title: 'Relational Database Schema Design & B-Trees',
        duration: '6 hours',
        description: '3NF normalization, foreign key cascade behaviors, and B-Tree indexing query optimization.',
        keyTopics: ['Database Normalization', 'Composite Indexes', 'Foreign Keys'],
        status: 'IN_PROGRESS',
      },
      {
        id: 'web-3',
        title: 'Authentication, JWT Validation & Role Security',
        duration: '5 hours',
        description: 'Stateless JWT verification, password hashing with PBKDF2/Argon2, and RBAC middleware.',
        keyTopics: ['JWT Claims', 'Timing Attack Prevention', 'PBKDF2 Hashing'],
        status: 'LOCKED',
      },
      {
        id: 'web-4',
        title: 'Distributed Caching & Redis Invalidation',
        duration: '6 hours',
        description: 'Cache-aside patterns, cache stampede mitigation, and TTL eviction policies.',
        keyTopics: ['Redis Invalidation', 'Cache Stampede', 'Bloom Filters'],
        status: 'LOCKED',
      },
    ],
  },
  {
    id: 'ai-ml',
    title: 'Machine Learning & Transformer Foundations',
    category: 'AI & Data Science',
    tagline: 'Vector embeddings, neural vocoders, transformer attention blocks, and LoRA parameter tuning.',
    level: 'Advanced',
    color: 'from-purple-500 to-pink-600',
    icon: Brain,
    nodes: [
      {
        id: 'ai-1',
        title: 'Vector Embeddings & Cosine Similarity',
        duration: '4 hours',
        description: 'Dense numeric representations of semantic text and high-dimensional distance math.',
        keyTopics: ['Cosine Distance', 'Dot Product', 'High-Dimensional Vectors'],
        status: 'COMPLETED',
      },
      {
        id: 'ai-2',
        title: 'Self-Attention & Transformer Encoders',
        duration: '8 hours',
        description: 'Query, Key, Value matrix multiplication and multi-head attention weights.',
        keyTopics: ['Scaled Dot-Product', 'QKV Matrices', 'Softmax Normalization'],
        status: 'IN_PROGRESS',
      },
      {
        id: 'ai-3',
        title: 'LoRA & Parameter-Efficient Fine-Tuning (PEFT)',
        duration: '6 hours',
        description: 'Decomposing rank updates to adapt large foundation weights without GPU memory limits.',
        keyTopics: ['Low-Rank Decomposition', 'Rank Intrinsic Dimension', 'Quantization'],
        status: 'LOCKED',
      },
    ],
  },
];

export const LearningHubPage: React.FC = () => {
  const [selectedTrackId, setSelectedTrackId] = useState<string>('dsa');

  const activeTrack = LEARNING_TRACKS.find(t => t.id === selectedTrackId) || LEARNING_TRACKS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Structured Developer Curriculum</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Scriptorium <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400">
              Engineering Roadmaps
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Master engineering topics systematically with step-by-step topic milestones, linked coding practice problems, and architectural deep-dives.
          </p>
        </div>
      </div>

      {/* Track Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {LEARNING_TRACKS.map(track => {
          const Icon = track.icon;
          const isSelected = track.id === selectedTrackId;
          const completedCount = track.nodes.filter(n => n.status === 'COMPLETED').length;

          return (
            <button
              key={track.id}
              onClick={() => setSelectedTrackId(track.id)}
              className={`text-left p-6 rounded-3xl border transition duration-200 flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${track.color} text-white flex items-center justify-center shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {track.level}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {track.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {track.tagline}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>Progress</span>
                  <span>{completedCount} / {track.nodes.length} Milestones</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${(completedCount / track.nodes.length) * 100}%` }}
                    className="h-full bg-indigo-600 rounded-full"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Roadmap Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-400">
                {activeTrack.category}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-500">{activeTrack.nodes.length} Milestones</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {activeTrack.title}
            </h2>
          </div>

          <Link to="/visualizer">
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Open DSA Visualizer</span>
            </Button>
          </Link>
        </div>

        {/* Milestone Steps Timeline */}
        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8">
          {activeTrack.nodes.map((node, index) => {
            const isCompleted = node.status === 'COMPLETED';
            const isInProgress = node.status === 'IN_PROGRESS';

            return (
              <div key={node.id} className="relative group">
                {/* Status Dot on Line */}
                <div className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                    : isInProgress
                    ? 'bg-indigo-600 border-indigo-600 text-white animate-pulse'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-[10px] font-bold">{index + 1}</span>
                  )}
                </div>

                {/* Node Milestone Card */}
                <div className={`p-6 rounded-2xl border transition duration-200 space-y-3 ${
                  isInProgress
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60 shadow-xs'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {node.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-400'
                          : isInProgress
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-400'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {node.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Est. {node.duration}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {node.description}
                  </p>

                  {/* Key Topic Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {node.keyTopics.map(t => (
                      <span
                        key={t}
                        className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Associated Action Links */}
                  {node.practiceProblemSlug && (
                    <div className="pt-2 flex items-center gap-3">
                      <Link to={`/problems/${node.practiceProblemSlug}`}>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs flex items-center gap-1.5 h-8">
                          <Code2 className="w-3.5 h-3.5" />
                          <span>Solve Associated Practice Problem</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LearningHubPage;
