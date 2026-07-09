import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Log in to track progress.' }, { status: 401 });

  const { courseId, lessonId, status } = await request.json();
  if (!courseId || !lessonId || !status) {
    return NextResponse.json({ error: 'courseId, lessonId, and status are required.' }, { status: 400 });
  }

  const { error } = await supabase.from('progress').upsert(
    {
      user_id: user.id,
      course_id: courseId,
      lesson_id: lessonId,
      status,
      last_visited: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
