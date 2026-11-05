export type UserRole =
  | 'guest'
  | 'user'
  | 'student'
  | 'author'
  | 'editor'
  | 'club_coordinator'
  | 'moderator'
  | 'admin';

export interface Profile {
  id: number;
  user_id: number;
  full_name: string;
  bio: string;
  location: string;
  github_url: string;
  website_url: string;
  avatar_url: string;
  points: number;
  problems_solved_count: number;
  questions_count: number;
  answers_count: number;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  profile?: Profile;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description: string;
  usage_count: number;
}

export interface Comment {
  id: number;
  author_id: number;
  author_username: string;
  target_type: 'question' | 'answer';
  target_id: number;
  content: string;
  created_at: string;
}

export interface Answer {
  id: number;
  question_id: number;
  author_id: number;
  author_username: string;
  author_avatar?: string;
  content_markdown: string;
  is_accepted: boolean;
  vote_count: number;
  created_at: string;
  updated_at: string;
  comments?: Comment[];
  user_vote?: number;
}

export interface Question {
  id: number;
  author_id: number;
  author_username: string;
  author_avatar?: string;
  title: string;
  slug: string;
  content_markdown: string;
  is_solved: boolean;
  accepted_answer_id?: number | null;
  vote_count: number;
  answer_count: number;
  view_count: number;
  tags: Tag[];
  created_at: string;
  updated_at: string;
  answers?: Answer[];
  comments?: Comment[];
  user_vote?: number;
}

export type ProblemDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface TestCase {
  id: number;
  problem_id: number;
  input_data: string;
  expected_output: string;
  is_sample: boolean;
  is_hidden: boolean;
  explanation?: string;
  order_index: number;
}

export interface Problem {
  id: number;
  title: string;
  slug: string;
  difficulty: ProblemDifficulty;
  description_markdown: string;
  input_format: string;
  output_format: string;
  constraints: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  starter_templates: Record<string, string>;
  is_published: boolean;
  acceptance_rate: number;
  total_submissions: number;
  accepted_submissions: number;
  tags: Tag[];
  sample_test_cases?: TestCase[];
  user_status?: 'UNSOLVED' | 'ATTEMPTED' | 'SOLVED';
  created_at: string;
}

export type SubmissionStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'INTERNAL_ERROR';

export interface SubmissionResult {
  id: number;
  submission_id: number;
  test_case_id: number;
  verdict: SubmissionStatus;
  execution_time_ms: number;
  memory_used_kb: number;
  is_sample: boolean;
}

export interface Submission {
  id: number;
  problem_id: number;
  problem_title?: string;
  problem_slug?: string;
  user_id: number;
  username?: string;
  language: string;
  source_code?: string;
  status: SubmissionStatus;
  execution_time_ms?: number;
  memory_used_kb?: number;
  error_message?: string;
  stdout_sample?: string;
  is_simulated: boolean;
  created_at: string;
  updated_at: string;
  results?: SubmissionResult[];
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  full_name?: string;
  avatar_url?: string;
  points: number;
  problems_solved_count: number;
  questions_count: number;
  answers_count: number;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  actor_username?: string;
  event_type: string;
  title: string;
  message: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface ReportItem {
  id: number;
  reporter_id: number;
  reporter_username?: string;
  target_type: string;
  target_id: number;
  reason: string;
  details?: string;
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface SystemStats {
  users_count: number;
  problems_count: number;
  questions_count: number;
  answers_count: number;
  submissions_count: number;
  pending_reports_count: number;
}

// ----------------------------------------------------------------------------
// Event Media & Memories Types
// ----------------------------------------------------------------------------

export interface EventMediaItem {
  id: number;
  event_id: number;
  album_id?: number | null;
  media_type: 'image' | 'video' | 'external_video';
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  photographer_credit?: string;
  display_order: number;
  uploader_username?: string;
  created_at: string;
}

export interface EventAlbum {
  id: number;
  event_id: number;
  title: string;
  description?: string;
  media_count: number;
  created_at: string;
}

export interface EventItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  event_date: string;
  year?: number;
  month?: string;
  location: string;
  organizing_club: string;
  cover_image_url: string;
  media_count: number;
  is_published: boolean;
  is_archived: boolean;
  created_at: string;
  recap_markdown?: string;
  highlights?: string[];
  participating_teams?: Array<{ name: string; project?: string; rank?: string }>;
  albums?: EventAlbum[];
  media?: EventMediaItem[];
}

