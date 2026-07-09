import { notFound, redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { CourseSubnav } from '@/components/course/course-subnav';
import { TutorChat } from '@/components/tutor/tutor-chat';
import { createClient } from '@/lib/supabase/server';
import { getCourseBySlug } from '@/lib/data/courses';

export default async function CourseTutorPage({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/courses/${course.slug}/tutor`);

  const { data: priorMessages } = await supabase
    .from('tutor_messages')
    .select('*')
    .eq('course_id', course.id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mx-auto max-w-3xl w-full px-5 py-10 flex-1 flex flex-col">
        <h1 className="font-display text-2xl text-ink mb-1">{course.title}</h1>
        <CourseSubnav slug={course.slug} active="tutor" />
        <div className="mt-6 flex-1 flex flex-col">
          <TutorChat courseId={course.id} courseTitle={course.title} initialMessages={priorMessages ?? []} />
        </div>
      </div>
    </div>
  );
}
