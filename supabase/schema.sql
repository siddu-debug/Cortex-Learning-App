-- =====================================================================
-- CORTEX — Community-Driven AI Learning Graph
-- Core schema. Run via `supabase db push` or paste into the SQL editor
-- of a fresh Supabase project (Project > SQL Editor > New query).
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- PROFILES  (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  track text default 'software-engineering', -- software-engineering | upsc | iit-jee | neet
  reputation int not null default 0,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)) || '_' || substr(new.id::text, 1, 4),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- COURSES  (the repo. forkable, versioned)
-- ---------------------------------------------------------------------
create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  description text,
  track text not null default 'software-engineering',
  owner_id uuid not null references public.profiles (id) on delete cascade,
  forked_from uuid references public.courses (id) on delete set null,
  visibility text not null default 'public' check (visibility in ('public', 'unlisted', 'private')),
  cover_gradient text default 'moss', -- used by the UI to color the course card
  quality_score numeric(3,2) not null default 0,   -- 0.00 - 5.00, derived from reviews
  fork_count int not null default 0,
  star_count int not null default 0,
  current_version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists courses_owner_idx on public.courses (owner_id);
create index if not exists courses_forked_from_idx on public.courses (forked_from);
create index if not exists courses_track_idx on public.courses (track);

-- ---------------------------------------------------------------------
-- COURSE VERSIONS  (append-only history, like commits)
-- ---------------------------------------------------------------------
create table if not exists public.course_versions (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses (id) on delete cascade,
  version_number int not null,
  commit_message text not null default 'Update',
  author_id uuid not null references public.profiles (id) on delete cascade,
  snapshot jsonb not null, -- full { modules: [...], lessons: [...] } snapshot at this version
  created_at timestamptz not null default now(),
  unique (course_id, version_number)
);

create index if not exists course_versions_course_idx on public.course_versions (course_id, version_number desc);

-- ---------------------------------------------------------------------
-- MODULES + LESSONS  (current working copy, mirrors latest snapshot)
-- ---------------------------------------------------------------------
create table if not exists public.modules (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  summary text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists modules_course_idx on public.modules (course_id, order_index);

create table if not exists public.lessons (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid not null references public.modules (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  content_md text not null default '',
  source_refs jsonb default '[]', -- grounding citations: [{ "label": "...", "url": "..." }]
  order_index int not null default 0,
  est_minutes int default 10,
  created_at timestamptz not null default now()
);

create index if not exists lessons_module_idx on public.lessons (module_id, order_index);
create index if not exists lessons_course_idx on public.lessons (course_id);

-- ---------------------------------------------------------------------
-- KNOWLEDGE GRAPH  (nodes = concepts, edges = relationships)
-- Nodes/edges are scoped to a course view but reference a global
-- concept key so identical concepts across courses can later be merged.
-- ---------------------------------------------------------------------
create table if not exists public.knowledge_nodes (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses (id) on delete cascade,
  concept_key text not null,      -- normalized slug, e.g. "hash-maps"
  label text not null,            -- display name, e.g. "Hash Maps"
  node_type text not null default 'concept' check (node_type in ('concept','skill','topic')),
  mastery_weight numeric(3,2) not null default 1.0,
  lesson_id uuid references public.lessons (id) on delete set null,
  pos_x numeric default 0,
  pos_y numeric default 0,
  created_at timestamptz not null default now()
);

create index if not exists knowledge_nodes_course_idx on public.knowledge_nodes (course_id);

create table if not exists public.knowledge_edges (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses (id) on delete cascade,
  source_node_id uuid not null references public.knowledge_nodes (id) on delete cascade,
  target_node_id uuid not null references public.knowledge_nodes (id) on delete cascade,
  relationship text not null default 'prerequisite' check (relationship in ('prerequisite','related','extends')),
  created_at timestamptz not null default now()
);

create index if not exists knowledge_edges_course_idx on public.knowledge_edges (course_id);

-- ---------------------------------------------------------------------
-- INGESTION JOBS  (tracks AI generation from PDFs / URLs / raw text)
-- ---------------------------------------------------------------------
create table if not exists public.ingestion_jobs (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses (id) on delete cascade,
  requested_by uuid not null references public.profiles (id) on delete cascade,
  source_type text not null check (source_type in ('pdf','url','text','repo')),
  source_ref text, -- URL, filename, or repo path
  status text not null default 'pending' check (status in ('pending','processing','complete','error')),
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ---------------------------------------------------------------------
-- FORKS  (explicit fork edges, in addition to courses.forked_from,
-- so we can show a full fork network per course)
-- ---------------------------------------------------------------------
create table if not exists public.forks (
  id uuid primary key default uuid_generate_v4(),
  source_course_id uuid not null references public.courses (id) on delete cascade,
  forked_course_id uuid not null references public.courses (id) on delete cascade,
  forked_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (forked_course_id)
);

create index if not exists forks_source_idx on public.forks (source_course_id);

-- ---------------------------------------------------------------------
-- REVIEWS  (community quality scoring)
-- ---------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (course_id, user_id)
);

create or replace function public.recalc_quality_score()
returns trigger as $$
begin
  update public.courses c
  set quality_score = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where course_id = c.id), 0)
  where c.id = coalesce(new.course_id, old.course_id);
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists reviews_recalc on public.reviews;
create trigger reviews_recalc
  after insert or update or delete on public.reviews
  for each row execute procedure public.recalc_quality_score();

-- ---------------------------------------------------------------------
-- STARS  (lightweight bookmarking / signal, separate from reviews)
-- ---------------------------------------------------------------------
create table if not exists public.stars (
  course_id uuid not null references public.courses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (course_id, user_id)
);

create or replace function public.recalc_star_count()
returns trigger as $$
begin
  update public.courses c
  set star_count = (select count(*) from public.stars where course_id = c.id)
  where c.id = coalesce(new.course_id, old.course_id);
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists stars_recalc on public.stars;
create trigger stars_recalc
  after insert or delete on public.stars
  for each row execute procedure public.recalc_star_count();

-- ---------------------------------------------------------------------
-- LEARNER PROGRESS  (adaptive learning engine input/output)
-- ---------------------------------------------------------------------
create table if not exists public.progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','complete')),
  mastery numeric(3,2) not null default 0, -- 0.0 - 1.0, from quiz performance
  last_visited timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  score numeric(3,2) not null,
  answers jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- AI TUTOR  (chat grounded in a course's lessons)
-- ---------------------------------------------------------------------
create table if not exists public.tutor_messages (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  cited_lesson_ids jsonb default '[]',
  created_at timestamptz not null default now()
);

create index if not exists tutor_messages_thread_idx on public.tutor_messages (course_id, user_id, created_at);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_versions enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.knowledge_nodes enable row level security;
alter table public.knowledge_edges enable row level security;
alter table public.ingestion_jobs enable row level security;
alter table public.forks enable row level security;
alter table public.reviews enable row level security;
alter table public.stars enable row level security;
alter table public.progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.tutor_messages enable row level security;

-- Profiles: readable by everyone, editable only by owner
create policy "profiles_read_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Courses: public/unlisted readable by everyone; private only by owner;
-- writes restricted to owner (fork creates a NEW course owned by the forker)
create policy "courses_read" on public.courses for select
  using (visibility in ('public', 'unlisted') or owner_id = auth.uid());
create policy "courses_insert_own" on public.courses for insert
  with check (owner_id = auth.uid());
create policy "courses_update_own" on public.courses for update
  using (owner_id = auth.uid());
create policy "courses_delete_own" on public.courses for delete
  using (owner_id = auth.uid());

-- Course versions: readable if the parent course is readable; insertable by owner
create policy "versions_read" on public.course_versions for select
  using (exists (select 1 from public.courses c where c.id = course_id and (c.visibility in ('public','unlisted') or c.owner_id = auth.uid())));
create policy "versions_insert_owner" on public.course_versions for insert
  with check (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()));

-- Modules / lessons: same read rule; writes restricted to course owner
create policy "modules_read" on public.modules for select
  using (exists (select 1 from public.courses c where c.id = course_id and (c.visibility in ('public','unlisted') or c.owner_id = auth.uid())));
create policy "modules_write_owner" on public.modules for insert
  with check (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()));
create policy "modules_update_owner" on public.modules for update
  using (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()));
create policy "modules_delete_owner" on public.modules for delete
  using (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()));

create policy "lessons_read" on public.lessons for select
  using (exists (select 1 from public.courses c where c.id = course_id and (c.visibility in ('public','unlisted') or c.owner_id = auth.uid())));
create policy "lessons_write_owner" on public.lessons for insert
  with check (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()));
create policy "lessons_update_owner" on public.lessons for update
  using (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()));
create policy "lessons_delete_owner" on public.lessons for delete
  using (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()));

-- Knowledge graph: same pattern
create policy "nodes_read" on public.knowledge_nodes for select
  using (exists (select 1 from public.courses c where c.id = course_id and (c.visibility in ('public','unlisted') or c.owner_id = auth.uid())));
create policy "nodes_write_owner" on public.knowledge_nodes for insert
  with check (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()));
create policy "nodes_update_owner" on public.knowledge_nodes for update
  using (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()));
create policy "nodes_delete_owner" on public.knowledge_nodes for delete
  using (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()));

create policy "edges_read" on public.knowledge_edges for select
  using (exists (select 1 from public.courses c where c.id = course_id and (c.visibility in ('public','unlisted') or c.owner_id = auth.uid())));
create policy "edges_write_owner" on public.knowledge_edges for insert
  with check (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()));
create policy "edges_delete_owner" on public.knowledge_edges for delete
  using (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()));

-- Ingestion jobs: visible/writable only to requester
create policy "jobs_owner_all" on public.ingestion_jobs for all
  using (requested_by = auth.uid()) with check (requested_by = auth.uid());

-- Forks: readable by everyone (public fork network), insert by the forker
create policy "forks_read_all" on public.forks for select using (true);
create policy "forks_insert_own" on public.forks for insert with check (forked_by = auth.uid());

-- Reviews: readable by everyone, writable by the author only
create policy "reviews_read_all" on public.reviews for select using (true);
create policy "reviews_insert_own" on public.reviews for insert with check (user_id = auth.uid());
create policy "reviews_update_own" on public.reviews for update using (user_id = auth.uid());
create policy "reviews_delete_own" on public.reviews for delete using (user_id = auth.uid());

-- Stars: readable by everyone, writable by the star-er only
create policy "stars_read_all" on public.stars for select using (true);
create policy "stars_insert_own" on public.stars for insert with check (user_id = auth.uid());
create policy "stars_delete_own" on public.stars for delete using (user_id = auth.uid());

-- Progress / quiz attempts / tutor messages: private to the learner
create policy "progress_owner_all" on public.progress for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "quiz_owner_all" on public.quiz_attempts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tutor_owner_all" on public.tutor_messages for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
