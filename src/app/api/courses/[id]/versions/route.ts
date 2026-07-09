import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Log in to save changes.' }, { status: 401 });

  const { commitMessage } = await request.json().catch(() => ({ commitMessage: 'Update' }));

  const { data: course } = await supabase.from('courses').select('*').eq('id', params.id).single();
  if (!course) return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
  if (course.owner_id !== user.id) {
    return NextResponse.json({ error: 'Only the course owner can commit a new version.' }, { status: 403 });
  }

  const { data: modules } = await supabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', course.id)
    .order('order_index');

  type SnapshotLesson = { title: string; content_md: string; est_minutes: number; order_index: number };
  const snapshot = {
    modules: (modules ?? []).map((m) => ({
      title: m.title,
      summary: m.summary,
      lessons: (((m as unknown as { lessons: SnapshotLesson[] }).lessons) ?? [])
        .sort((a, b) => a.order_index - b.order_index)
        .map((l) => ({ title: l.title, content_md: l.content_md, est_minutes: l.est_minutes })),
    })),
  };

  const nextVersion = course.current_version + 1;

  const { error: versionError } = await supabase.from('course_versions').insert({
    course_id: course.id,
    version_number: nextVersion,
    commit_message: commitMessage || 'Update',
    author_id: user.id,
    snapshot,
  });
  if (versionError) return NextResponse.json({ error: versionError.message }, { status: 500 });

  await supabase
    .from('courses')
    .update({ current_version: nextVersion, updated_at: new Date().toISOString() })
    .eq('id', course.id);

  return NextResponse.json({ version: nextVersion });
}
