import { createClient } from '@/lib/supabase/server';
import type { Course, KnowledgeEdge, KnowledgeNode, Lesson, Module, Profile } from '@/types/database';

export async function getCourseBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) return null;
  return data as unknown as Course;
}

export async function getProfile(id: string) {
  const supabase = createClient();
  const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
  return data as unknown as Profile | null;
}

export async function getModulesWithLessons(courseId: string) {
  const supabase = createClient();
  const [{ data: modules }, { data: lessons }] = await Promise.all([
    supabase.from('modules').select('*').eq('course_id', courseId).order('order_index'),
    supabase.from('lessons').select('*').eq('course_id', courseId).order('order_index'),
  ]);
  const mods = (modules ?? []) as unknown as Module[];
  const less = (lessons ?? []) as unknown as Lesson[];
  return mods.map((m) => ({ ...m, lessons: less.filter((l) => l.module_id === m.id) }));
}

export async function getKnowledgeGraph(courseId: string) {
  const supabase = createClient();
  const [{ data: nodes }, { data: edges }] = await Promise.all([
    supabase.from('knowledge_nodes').select('*').eq('course_id', courseId),
    supabase.from('knowledge_edges').select('*').eq('course_id', courseId),
  ]);
  return {
    nodes: (nodes ?? []) as unknown as KnowledgeNode[],
    edges: (edges ?? []) as unknown as KnowledgeEdge[],
  };
}

export async function listPublicCourses(params: {
  q?: string;
  track?: string;
  sort?: 'recent' | 'forks' | 'quality';
  limit?: number;
}) {
  const supabase = createClient();
  let query = supabase.from('courses').select('*').eq('visibility', 'public');

  if (params.track) query = query.eq('track', params.track);
  if (params.q) query = query.ilike('title', `%${params.q}%`);

  if (params.sort === 'forks') query = query.order('fork_count', { ascending: false });
  else if (params.sort === 'quality') query = query.order('quality_score', { ascending: false });
  else query = query.order('updated_at', { ascending: false });

  query = query.limit(params.limit ?? 24);

  const { data } = await query;
  return (data ?? []) as unknown as Course[];
}

export async function getCourseVersions(courseId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('course_versions')
    .select('*')
    .eq('course_id', courseId)
    .order('version_number', { ascending: false });
  return data ?? [];
}

export async function getForksOf(courseId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('courses')
    .select('*')
    .eq('forked_from', courseId)
    .eq('visibility', 'public');
  return (data ?? []) as unknown as Course[];
}

export async function getReviews(courseId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });
  return data ?? [];
}
