import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GitFork, Star, Clock, GitCommitHorizontal, Pencil } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { ForkButton } from '@/components/course/fork-button';
import { StarButton } from '@/components/course/star-button';
import { CourseSubnav } from '@/components/course/course-subnav';
import { createClient } from '@/lib/supabase/server';
import { getCourseBySlug, getModulesWithLessons, getProfile } from '@/lib/data/courses';
import { trackLabel, formatRelativeTime } from '@/lib/utils';

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const [modules, owner, supabase] = await Promise.all([
    getModulesWithLessons(course.id),
    getProfile(course.owner_id),
    Promise.resolve(createClient()),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === course.owner_id;

  let starred = false;
  if (user) {
    const { data } = await supabase
      .from('stars')
      .select('*')
      .eq('course_id', course.id)
      .eq('user_id', user.id)
      .maybeSingle();
    starred = !!data;
  }

  const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);
  const totalMinutes = modules.reduce((n, m) => n + m.lessons.reduce((s, l) => s + l.est_minutes, 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="mx-auto max-w-5xl w-full px-5 py-10 flex-1">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge tone="neutral">{trackLabel(course.track)}</Badge>
              {course.forked_from && <Badge tone="violet"><GitFork className="w-3 h-3" /> fork</Badge>}
            </div>
            <h1 className="font-display text-3xl text-ink">{course.title}</h1>
            <p className="text-ink-faint mt-1 font-mono text-sm">
              @{owner?.username ?? 'unknown'} · updated {formatRelativeTime(course.updated_at)} · v{course.current_version}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
              <Link href={`/courses/${course.slug}/edit`} className={buttonVariants('outline', 'sm')}>
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Link>
            )}
            <StarButton courseId={course.id} initialStarred={starred} initialCount={course.star_count} />
            <ForkButton courseId={course.id} />
          </div>
        </div>

        <p className="text-ink-soft mt-4 max-w-2xl leading-relaxed">{course.description}</p>

        {/* stat strip */}
        <div className="flex flex-wrap items-center gap-5 mt-6 text-sm text-ink-faint font-mono">
          <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-gold-500" fill="currentColor" /> {course.quality_score > 0 ? course.quality_score.toFixed(1) : 'unrated'}</span>
          <span className="flex items-center gap-1.5"><GitFork className="w-4 h-4" /> {course.fork_count} forks</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {totalMinutes} min · {totalLessons} lessons</span>
          <span className="flex items-center gap-1.5"><GitCommitHorizontal className="w-4 h-4" /> v{course.current_version}</span>
        </div>

        {/* tab nav */}
        <div className="mt-8">
          <CourseSubnav slug={course.slug} active="curriculum" />
        </div>

        {/* curriculum */}
        <div className="mt-8 space-y-6">
          {modules.length === 0 && (
            <p className="text-ink-faint text-sm">This course doesn&apos;t have any modules yet.</p>
          )}
          {modules.map((mod, i) => (
            <Card key={mod.id} className="p-5">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xs text-moss-600">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="font-display text-lg text-ink">{mod.title}</h2>
              </div>
              {mod.summary && <p className="text-sm text-ink-faint mt-1 ml-7">{mod.summary}</p>}
              <ul className="mt-3 ml-7 divide-y divide-border">
                {mod.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/courses/${course.slug}/learn/${lesson.id}`}
                      className="flex items-center justify-between py-2.5 text-sm text-ink-soft hover:text-moss-700 transition-colors group"
                    >
                      <span className="group-hover:underline underline-offset-2">{lesson.title}</span>
                      <span className="font-mono text-xs text-ink-faint">{lesson.est_minutes} min</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
