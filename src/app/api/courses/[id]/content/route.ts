import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface EditedLesson {
  id?: string;
  title: string;
  content_md: string;
  est_minutes: number;
}
interface EditedModule {
  id?: string;
  title: string;
  summary: string;
  lessons: EditedLesson[];
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Log in to edit this course.' }, { status: 401 });

  const { data: course } = await supabase.from('courses').select('*').eq('id', params.id).single();
  if (!course) return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
  if (course.owner_id !== user.id) {
    return NextResponse.json({ error: 'Only the course owner can edit this course.' }, { status: 403 });
  }

  const { modules }: { modules: EditedModule[] } = await request.json();

  // Wipe and rewrite. Simple and correct for an MVP editor; version history
  // (course_versions) is the durable record, so this is safe to do.
  const { data: existingModules } = await supabase.from('modules').select('id').eq('course_id', course.id);
  const existingIds = (existingModules ?? []).map((m) => m.id);
  if (existingIds.length) {
    await supabase.from('knowledge_nodes').update({ lesson_id: null }).eq('course_id', course.id);
    await supabase.from('modules').delete().in('id', existingIds); // cascades to lessons
  }

  for (let mi = 0; mi < modules.length; mi++) {
    const mod = modules[mi];
    const { data: modRow, error: modErr } = await supabase
      .from('modules')
      .insert({ course_id: course.id, title: mod.title, summary: mod.summary, order_index: mi })
      .select()
      .single();
    if (modErr || !modRow) continue;

    for (let li = 0; li < mod.lessons.length; li++) {
      const lesson = mod.lessons[li];
      await supabase.from('lessons').insert({
        module_id: modRow.id,
        course_id: course.id,
        title: lesson.title,
        content_md: lesson.content_md,
        order_index: li,
        est_minutes: lesson.est_minutes || 10,
      });
    }
  }

  await supabase.from('courses').update({ updated_at: new Date().toISOString() }).eq('id', course.id);

  return NextResponse.json({ ok: true });
}
