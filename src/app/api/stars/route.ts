import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Log in to star a course.' }, { status: 401 });

  const { courseId } = await request.json();
  if (!courseId) return NextResponse.json({ error: 'courseId is required.' }, { status: 400 });

  const { data: existing } = await supabase
    .from('stars')
    .select('*')
    .eq('course_id', courseId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('stars').delete().eq('course_id', courseId).eq('user_id', user.id);
    return NextResponse.json({ starred: false });
  }

  await supabase.from('stars').insert({ course_id: courseId, user_id: user.id });
  return NextResponse.json({ starred: true });
}
