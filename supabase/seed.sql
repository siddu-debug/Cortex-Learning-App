-- =====================================================================
-- OPTIONAL DEMO SEED
-- Run this AFTER schema.sql, and after at least one real user has
-- signed up (so we have a profile id to attach demo content to).
-- Replace :owner_id below with a real profiles.id from your project.
-- =====================================================================

-- Example:
-- select id, username from public.profiles limit 5;
-- then run the rest with that id substituted for :owner_id

/*
with new_course as (
  insert into public.courses (slug, title, description, track, owner_id, cover_gradient)
  values (
    'dsa-foundations',
    'Data Structures & Algorithms: Foundations',
    'A community-maintained path through the core DS&A concepts every software engineer needs, generated from open lecture notes and refined by contributors.',
    'software-engineering',
    :owner_id,
    'moss'
  )
  returning id
),
mod1 as (
  insert into public.modules (course_id, title, summary, order_index)
  select id, 'Arrays & Complexity', 'How data is laid out in memory and how we measure cost.', 0 from new_course
  returning id, course_id
),
mod2 as (
  insert into public.modules (course_id, title, summary, order_index)
  select course_id, 'Hashing', 'Constant-time lookups and how hash maps are actually built.', 1 from mod1
  returning id, course_id
)
insert into public.lessons (module_id, course_id, title, content_md, order_index, est_minutes)
select mod1.id, mod1.course_id, 'Big-O Notation', '# Big-O Notation

Big-O describes how the cost of an algorithm grows as input size grows...', 0, 12
from mod1
union all
select mod2.id, mod2.course_id, 'Hash Maps', '# Hash Maps

A hash map trades memory for near-constant-time lookups...', 0, 15
from mod2;
*/
