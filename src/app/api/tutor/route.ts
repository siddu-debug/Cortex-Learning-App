import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { streamTutorReply } from '@/lib/ai/tutor';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Log in to chat with the tutor.' }, { status: 401 });

  const { courseId, message } = await request.json();
  if (!courseId || !message) {
    return NextResponse.json({ error: 'courseId and message are required.' }, { status: 400 });
  }

  const { data: course } = await supabase.from('courses').select('title').eq('id', courseId).single();
  if (!course) return NextResponse.json({ error: 'Course not found.' }, { status: 404 });

  const { data: lessons } = await supabase
    .from('lessons')
    .select('title, content_md')
    .eq('course_id', courseId)
    .limit(60);

  const { data: priorTurns } = await supabase
    .from('tutor_messages')
    .select('role, content')
    .eq('course_id', courseId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(20);

  await supabase.from('tutor_messages').insert({
    course_id: courseId,
    user_id: user.id,
    role: 'user',
    content: message,
  });

  const history = [...(priorTurns ?? []), { role: 'user' as const, content: message }];

  const encoder = new TextEncoder();
  let full = '';

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamTutorReply({
          courseTitle: course.title,
          lessons: lessons ?? [],
          history,
        })) {
          full += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'The tutor hit an error.';
        controller.enqueue(encoder.encode(`\n\n_[tutor error: ${msg}]_`));
      } finally {
        controller.close();
        if (full.trim()) {
          await supabase.from('tutor_messages').insert({
            course_id: courseId,
            user_id: user.id,
            role: 'assistant',
            content: full,
          });
        }
      }
    },
  });

  return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
