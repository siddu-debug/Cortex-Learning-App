import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CourseCard } from '@/components/course/course-card';
import { EmptyState } from '@/components/ui/empty-state';
import { buttonVariants } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/data/courses';
import type { Course } from '@/types/database';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/dashboard');

  const profile = await getProfile(user.id);

  const { data: myCourses } = await supabase
    .from('courses')
    .select('*')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false });

  const { data: progressRows } = await supabase
    .from('progress')
    .select('course_id')
    .eq('user_id', user.id)
    .order('last_visited', { ascending: false })
    .limit(20);

  const inProgressCourseIds = Array.from(new Set((progressRows ?? []).map((p) => p.course_id))).filter(
    (id) => !(myCourses ?? []).some((c) => c.id === id)
  );

  let learningCourses: Course[] = [];
  if (inProgressCourseIds.length) {
    const { data } = await supabase.from('courses').select('*').in('id', inProgressCourseIds);
    learningCourses = (data ?? []) as unknown as Course[];
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mx-auto max-w-6xl w-full px-5 py-10 flex-1">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display text-3xl text-ink">
            Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}
          </h1>
          <Link href="/courses/new" className={buttonVariants('primary', 'md')}>
            <Plus className="w-4 h-4" /> New course
          </Link>
        </div>
        <p className="text-ink-faint mb-10 font-mono text-sm">@{profile?.username}</p>

        <section className="mb-12">
          <h2 className="font-display text-xl text-ink mb-4">Continue learning</h2>
          {learningCourses.length === 0 ? (
            <EmptyState
              title="Nothing in progress yet"
              description="Explore the graph and start a course — your progress shows up here."
              action={
                <Link href="/explore" className={buttonVariants('outline', 'sm')}>
                  Explore courses
                </Link>
              }
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {learningCourses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-4">Your courses</h2>
          {!myCourses?.length ? (
            <EmptyState
              title="You haven't published anything yet"
              description="Generate a course from a PDF, URL, or your own notes — it's free to publish."
              action={
                <Link href="/courses/new" className={buttonVariants('primary', 'sm')}>
                  Generate a course
                </Link>
              }
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(myCourses as unknown as Course[]).map((c) => (
                <CourseCard key={c.id} course={c} ownerName={profile?.username} />
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
