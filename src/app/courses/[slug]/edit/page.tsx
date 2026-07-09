import { notFound, redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { CourseEditor } from '@/components/course/course-editor';
import { createClient } from '@/lib/supabase/server';
import { getCourseBySlug, getModulesWithLessons } from '@/lib/data/courses';

export default async function CourseEditPage({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/courses/${course.slug}/edit`);
  if (user.id !== course.owner_id) redirect(`/courses/${course.slug}`);

  const modules = await getModulesWithLessons(course.id);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mx-auto max-w-3xl w-full px-5 py-10 flex-1">
        <h1 className="font-display text-2xl text-ink mb-1">Editing {course.title}</h1>
        <p className="text-sm text-ink-faint mb-8">
          Changes are saved as a new version when you commit — the old version stays in history.
        </p>
        <CourseEditor courseId={course.id} courseSlug={course.slug} initialModules={modules} />
      </div>
    </div>
  );
}
