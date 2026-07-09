import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock, MessagesSquare, FileQuestion } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { MarkCompleteButton } from '@/components/course/mark-complete-button';
import { buttonVariants } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { getCourseBySlug, getModulesWithLessons } from '@/lib/data/courses';

export default async function LessonPage({
  params,
}: {
  params: { slug: string; lessonId: string };
}) {
  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const modules = await getModulesWithLessons(course.id);
  const flatLessons = modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title })));
  const idx = flatLessons.findIndex((l) => l.id === params.lessonId);
  if (idx === -1) notFound();

  const lesson = flatLessons[idx];
  const prev = flatLessons[idx - 1];
  const next = flatLessons[idx + 1];

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let complete = false;
  if (user) {
    const { data } = await supabase
      .from('progress')
      .select('status')
      .eq('user_id', user.id)
      .eq('lesson_id', lesson.id)
      .maybeSingle();
    complete = data?.status === 'complete';
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="grid lg:grid-cols-[240px_1fr] flex-1">
        {/* sidebar */}
        <aside className="hidden lg:block border-r border-border px-4 py-8 sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto">
          <Link href={`/courses/${course.slug}`} className="flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> {course.title}
          </Link>
          {modules.map((mod) => (
            <div key={mod.id} className="mb-5">
              <p className="text-xs font-mono text-ink-faint uppercase tracking-wide mb-1.5">{mod.title}</p>
              <ul className="space-y-0.5">
                {mod.lessons.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/courses/${course.slug}/learn/${l.id}`}
                      className={`block text-sm px-2 py-1.5 rounded-md transition-colors ${
                        l.id === lesson.id
                          ? 'bg-moss-50 text-moss-700 font-medium'
                          : 'text-ink-soft hover:bg-paper-dim'
                      }`}
                    >
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        {/* content */}
        <main className="px-6 py-10 max-w-3xl mx-auto w-full">
          <p className="text-xs font-mono text-moss-600 mb-2">{lesson.moduleTitle}</p>
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-3xl text-ink">{lesson.title}</h1>
          </div>
          <div className="flex items-center gap-4 mt-3 mb-8">
            <span className="flex items-center gap-1.5 text-xs font-mono text-ink-faint">
              <Clock className="w-3.5 h-3.5" /> {lesson.est_minutes} min
            </span>
            <MarkCompleteButton courseId={course.id} lessonId={lesson.id} initialComplete={complete} />
            <Link
              href={`/courses/${course.slug}/learn/${lesson.id}/quiz`}
              className="flex items-center gap-1.5 text-xs text-ink-faint hover:text-violet-700 border-l border-border pl-4"
            >
              <FileQuestion className="w-3.5 h-3.5 text-violet-500" /> Take Quiz
            </Link>
            <Link
              href={`/courses/${course.slug}/tutor`}
              className="flex items-center gap-1.5 text-xs text-ink-faint hover:text-moss-700 border-l border-border pl-4"
            >
              <MessagesSquare className="w-3.5 h-3.5" /> Ask the tutor
            </Link>
          </div>

          <MarkdownRenderer content={lesson.content_md} />

          {lesson.source_refs?.length > 0 && (
            <div className="mt-10 pt-4 border-t border-border text-xs text-ink-faint font-mono">
              grounded in: {lesson.source_refs.map((s) => s.label).join(', ')}
            </div>
          )}

          <div className="flex items-center justify-between mt-12 pt-6 border-t border-border">
            {prev ? (
              <Link href={`/courses/${course.slug}/learn/${prev.id}`} className={buttonVariants('outline', 'md')}>
                <ArrowLeft className="w-4 h-4" /> {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/courses/${course.slug}/learn/${next.id}`} className={buttonVariants('primary', 'md')}>
                {next.title} <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link href={`/courses/${course.slug}`} className={buttonVariants('secondary', 'md')}>
                Finish course
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
