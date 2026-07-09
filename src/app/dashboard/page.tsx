import Link from 'next/link';
import { redirect } from 'next/navigation';
import { 
  Plus, 
  BookOpen, 
  Sparkles, 
  Code, 
  Layers, 
  Activity, 
  Award,
  BookOpenCheck 
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CourseCard } from '@/components/course/course-card';
import { EmptyState } from '@/components/ui/empty-state';
import { buttonVariants } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/data/courses';
import type { Course } from '@/types/database';

const trackIcons: Record<string, any> = {
  'software-engineering': Code,
  'upsc': BookOpen,
  'iit-jee': Layers,
  'neet': Activity
};

const trackNames: Record<string, string> = {
  'software-engineering': 'Software Engineering',
  'upsc': 'UPSC Civil Services',
  'iit-jee': 'IIT-JEE Prep',
  'neet': 'NEET Medical'
};

const trackTones: Record<string, string> = {
  'software-engineering': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
  'upsc': 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/30',
  'iit-jee': 'bg-gold-50 text-gold-800 border-gold-200 dark:bg-gold-950/20 dark:text-gold-400 dark:border-gold-900/30',
  'neet': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
};

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

  const trackId = profile?.track ?? 'software-engineering';
  const TrackIcon = trackIcons[trackId] || Code;
  const trackName = trackNames[trackId] || 'Software Engineering';

  return (
    <div className="min-h-screen flex flex-col bg-paper relative overflow-hidden">
      <Navbar />

      {/* Decorative background glows */}
      <div className="absolute top-[15%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-violet-200/15 via-rose-100/5 to-transparent rounded-full filter blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-moss-200/15 via-gold-100/5 to-transparent rounded-full filter blur-[120px] pointer-events-none -z-10 animate-pulse duration-5000" />

      <div className="mx-auto max-w-6xl w-full px-5 py-10 flex-1 relative">
        
        {/* Colorful Greeting Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border shadow-raised mb-12 relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-moss-400/5 via-violet-400/5 to-transparent rounded-bl-[120px] -z-10" />
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-3xl font-semibold text-gradient-primary">
                Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}
              </h1>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-medium ${trackTones[trackId]}`}>
                <TrackIcon className="w-3.5 h-3.5" />
                <span>{trackName}</span>
              </div>
            </div>
            <p className="text-ink-faint font-mono text-sm">@{profile?.username} · {user.email}</p>
            {profile?.bio && (
              <p className="text-sm text-ink-soft max-w-2xl italic">
                &ldquo;{profile.bio}&rdquo;
              </p>
            )}
          </div>

          <div className="flex gap-4 sm:self-center shrink-0">
            <div className="text-center bg-white/50 border border-border/60 rounded-2xl px-4 py-2.5 shadow-sm min-w-[90px]">
              <span className="block font-mono text-xl font-bold text-violet-600">{myCourses?.length ?? 0}</span>
              <span className="font-sans text-[10px] uppercase font-semibold text-ink-faint tracking-wider">Created</span>
            </div>
            <div className="text-center bg-white/50 border border-border/60 rounded-2xl px-4 py-2.5 shadow-sm min-w-[90px]">
              <span className="block font-mono text-xl font-bold text-moss-600">{learningCourses.length}</span>
              <span className="font-sans text-[10px] uppercase font-semibold text-ink-faint tracking-wider">Learning</span>
            </div>
          </div>
        </div>

        {/* Dashboard Actions */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl text-ink font-semibold flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-moss-500" /> My Workspace
          </h2>
          <Link href="/courses/new" className={buttonVariants('primary', 'md', 'bg-gradient-to-r from-moss-600 to-violet-600 border-0 hover:from-moss-700 hover:to-violet-700 text-white shadow-glow-moss hover:scale-[1.02] transition-transform')}>
            <Plus className="w-4 h-4" /> Generate a course
          </Link>
        </div>

        <section className="mb-12">
          <h3 className="font-display text-xl text-ink mb-4 font-medium flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-glow-violet" /> Continue learning
          </h3>
          {learningCourses.length === 0 ? (
            <EmptyState
              title="Nothing in progress yet"
              description="Explore the graph and start a course — your progress shows up here."
              action={
                <Link href="/explore" className={buttonVariants('outline', 'sm', 'hover:border-violet-300 hover:text-violet-700')}>
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
          <h3 className="font-display text-xl text-ink mb-4 font-medium flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-moss-500 shadow-glow-moss" /> Your courses
          </h3>
          {!myCourses?.length ? (
            <EmptyState
              title="You haven't published anything yet"
              description="Generate a course from a PDF, URL, or your own notes — it's free to publish."
              action={
                <Link href="/courses/new" className={buttonVariants('primary', 'sm', 'bg-moss-600 text-white hover:bg-moss-700')}>
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
