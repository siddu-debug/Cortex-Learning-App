import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCourseBySlug, getModulesWithLessons } from '@/lib/data/courses';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { QuizSession } from './quiz-session';

export const metadata = {
  title: 'Lesson Quiz — Cortex',
  description: 'Test your understanding of the concepts covered in this lesson.',
};

export default async function QuizPage({
  params,
}: {
  params: { slug: string; lessonId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/courses/${params.slug}/learn/${params.lessonId}/quiz`);
  }

  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const modules = await getModulesWithLessons(course.id);
  const flatLessons = modules.flatMap((m) => m.lessons);
  const idx = flatLessons.findIndex((l) => l.id === params.lessonId);
  if (idx === -1) notFound();

  const lesson = flatLessons[idx];
  const nextLesson = flatLessons[idx + 1] || null;
  const nextLessonId = nextLesson ? nextLesson.id : null;

  return (
    <div className="min-h-screen flex flex-col bg-paper relative">
      {/* Dynamic background blur blobs */}
      <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-violet-200/20 rounded-full filter blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-moss-200/20 rounded-full filter blur-[100px] pointer-events-none -z-10 animate-pulse duration-5000" />
      
      <Navbar />
      <main className="flex-1 mx-auto max-w-6xl w-full px-5 py-8">
        <div className="text-center mb-8 max-w-xl mx-auto">
          <p className="text-xs font-mono font-medium text-moss-600 uppercase tracking-wider mb-1.5">Concept Assessment</p>
          <h1 className="font-display text-2xl font-bold text-ink leading-tight sm:text-3xl">
            {lesson.title}
          </h1>
        </div>

        <QuizSession
          userId={user.id}
          courseId={course.id}
          courseSlug={course.slug}
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          nextLessonId={nextLessonId}
        />
      </main>
      <Footer />
    </div>
  );
}
