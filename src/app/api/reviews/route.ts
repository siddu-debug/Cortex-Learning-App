import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Log in to leave a review.' }, { status: 401 });

  const { courseId, rating, comment } = await request.json();
  if (!courseId || !rating) {
    return NextResponse.json({ error: 'courseId and rating are required.' }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'rating must be between 1 and 5.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('reviews')
    .upsert({ course_id: courseId, user_id: user.id, rating, comment: comment ?? null }, { onConflict: 'course_id,user_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
