export type Track = 'software-engineering' | 'upsc' | 'iit-jee' | 'neet';
export type Visibility = 'public' | 'unlisted' | 'private';
export type NodeType = 'concept' | 'skill' | 'topic';
export type Relationship = 'prerequisite' | 'related' | 'extends';

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  track: Track;
  reputation: number;
  created_at: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  track: Track;
  owner_id: string;
  forked_from: string | null;
  visibility: Visibility;
  cover_gradient: string;
  quality_score: number;
  fork_count: number;
  star_count: number;
  current_version: number;
  created_at: string;
  updated_at: string;
}

export interface CourseVersion {
  id: string;
  course_id: string;
  version_number: number;
  commit_message: string;
  author_id: string;
  snapshot: { modules: ModuleSnapshot[] };
  created_at: string;
}

export interface ModuleSnapshot {
  title: string;
  summary?: string;
  lessons: { title: string; content_md: string; est_minutes?: number }[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  summary: string | null;
  order_index: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  content_md: string;
  source_refs: { label: string; url?: string }[];
  order_index: number;
  est_minutes: number;
  created_at: string;
}

export interface KnowledgeNode {
  id: string;
  course_id: string;
  concept_key: string;
  label: string;
  node_type: NodeType;
  mastery_weight: number;
  lesson_id: string | null;
  pos_x: number;
  pos_y: number;
  created_at: string;
}

export interface KnowledgeEdge {
  id: string;
  course_id: string;
  source_node_id: string;
  target_node_id: string;
  relationship: Relationship;
  created_at: string;
}

export interface IngestionJob {
  id: string;
  course_id: string | null;
  requested_by: string;
  source_type: 'pdf' | 'url' | 'text' | 'repo';
  source_ref: string | null;
  status: 'pending' | 'processing' | 'complete' | 'error';
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Fork {
  id: string;
  source_course_id: string;
  forked_course_id: string;
  forked_by: string;
  created_at: string;
}

export interface Review {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'complete';
  mastery: number;
  last_visited: string;
}

export interface TutorMessage {
  id: string;
  course_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  cited_lesson_ids: string[];
  created_at: string;
}

// Minimal typed surface for the Supabase client generic. This is a
// hand-written stand-in for `supabase gen types typescript`; regenerate
// with the CLI once the schema stabilizes for full type safety.
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      courses: { Row: Course; Insert: Partial<Course>; Update: Partial<Course> };
      course_versions: { Row: CourseVersion; Insert: Partial<CourseVersion>; Update: Partial<CourseVersion> };
      modules: { Row: Module; Insert: Partial<Module>; Update: Partial<Module> };
      lessons: { Row: Lesson; Insert: Partial<Lesson>; Update: Partial<Lesson> };
      knowledge_nodes: { Row: KnowledgeNode; Insert: Partial<KnowledgeNode>; Update: Partial<KnowledgeNode> };
      knowledge_edges: { Row: KnowledgeEdge; Insert: Partial<KnowledgeEdge>; Update: Partial<KnowledgeEdge> };
      ingestion_jobs: { Row: IngestionJob; Insert: Partial<IngestionJob>; Update: Partial<IngestionJob> };
      forks: { Row: Fork; Insert: Partial<Fork>; Update: Partial<Fork> };
      reviews: { Row: Review; Insert: Partial<Review>; Update: Partial<Review> };
      progress: { Row: Progress; Insert: Partial<Progress>; Update: Partial<Progress> };
      tutor_messages: { Row: TutorMessage; Insert: Partial<TutorMessage>; Update: Partial<TutorMessage> };
    };
  };
}
