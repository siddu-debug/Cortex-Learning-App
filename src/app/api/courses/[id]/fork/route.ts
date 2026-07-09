import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Log in to fork a course.' }, { status: 401 });

  const { data: source } = await supabase.from('courses').select('*').eq('id', params.id).single();
  if (!source) return NextResponse.json({ error: 'Course not found.' }, { status: 404 });

  const baseSlug = slugify(`${source.title}-fork`);
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const { data: existing } = await supabase.from('courses').select('id').eq('slug', slug).maybeSingle();
    if (!existing) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const { data: fork, error: forkError } = await supabase
    .from('courses')
    .insert({
      slug,
      title: source.title,
      description: source.description,
      track: source.track,
      owner_id: user.id,
      forked_from: source.id,
      visibility: 'public',
      cover_gradient: source.cover_gradient,
    })
    .select()
    .single();

  if (forkError || !fork) {
    return NextResponse.json({ error: forkError?.message ?? 'Fork failed.' }, { status: 500 });
  }

  const { data: modules } = await supabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', source.id)
    .order('order_index');

  const nodeIdMap = new Map<string, string>();
  const { data: nodes } = await supabase.from('knowledge_nodes').select('*').eq('course_id', source.id);
  const { data: edges } = await supabase.from('knowledge_edges').select('*').eq('course_id', source.id);

  const lessonIdMap = new Map<string, string>();

  for (const mod of modules ?? []) {
    const { data: newMod } = await supabase
      .from('modules')
      .insert({ course_id: fork.id, title: mod.title, summary: mod.summary, order_index: mod.order_index })
      .select()
      .single();
    if (!newMod) continue;

    type SourceLesson = { id: string; title: string; content_md: string; order_index: number; est_minutes: number; source_refs: unknown };
    const lessons = (((mod as unknown as { lessons: SourceLesson[] }).lessons) ?? []).sort(
      (a, b) => a.order_index - b.order_index
    );

    for (const lesson of lessons) {
      const { data: newLesson } = await supabase
        .from('lessons')
        .insert({
          module_id: newMod.id,
          course_id: fork.id,
          title: lesson.title,
          content_md: lesson.content_md,
          order_index: lesson.order_index,
          est_minutes: lesson.est_minutes,
          source_refs: lesson.source_refs,
        })
        .select()
        .single();
      if (newLesson) lessonIdMap.set(lesson.id, newLesson.id);
    }
  }

  for (const node of nodes ?? []) {
    const { data: newNode } = await supabase
      .from('knowledge_nodes')
      .insert({
        course_id: fork.id,
        concept_key: node.concept_key,
        label: node.label,
        node_type: node.node_type,
        mastery_weight: node.mastery_weight,
        lesson_id: node.lesson_id ? lessonIdMap.get(node.lesson_id) ?? null : null,
        pos_x: node.pos_x,
        pos_y: node.pos_y,
      })
      .select()
      .single();
    if (newNode) nodeIdMap.set(node.id, newNode.id);
  }

  for (const edge of edges ?? []) {
    const source_node_id = nodeIdMap.get(edge.source_node_id);
    const target_node_id = nodeIdMap.get(edge.target_node_id);
    if (!source_node_id || !target_node_id) continue;
    await supabase.from('knowledge_edges').insert({
      course_id: fork.id,
      source_node_id,
      target_node_id,
      relationship: edge.relationship,
    });
  }

  await supabase.from('course_versions').insert({
    course_id: fork.id,
    version_number: 1,
    commit_message: `Forked from ${source.title}`,
    author_id: user.id,
    snapshot: { modules: [] },
  });

  await supabase.from('forks').insert({ source_course_id: source.id, forked_course_id: fork.id, forked_by: user.id });
  await supabase.from('courses').update({ fork_count: source.fork_count + 1 }).eq('id', source.id);

  return NextResponse.json({ slug: fork.slug });
}
