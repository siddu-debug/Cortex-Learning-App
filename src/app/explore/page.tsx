import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CourseCard } from '@/components/course/course-card';
import { EmptyState } from '@/components/ui/empty-state';
import { buttonVariants } from '@/components/ui/button';
import { listPublicCourses, getProfile } from '@/lib/data/courses';
import { trackLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';

const TRACKS = ['software-engineering', 'upsc', 'iit-jee', 'neet'];
const SORTS: { key: 'recent' | 'forks' | 'quality'; label: string }[] = [
  { key: 'recent', label: 'Recently updated' },
  { key: 'forks', label: 'Most forked' },
  { key: 'quality', label: 'Top rated' },
];

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { q?: string; track?: string; sort?: 'recent' | 'forks' | 'quality' };
}) {
  const courses = await listPublicCourses({
    q: searchParams.q,
    track: searchParams.track,
    sort: searchParams.sort ?? 'recent',
  });

  const owners = new Map<string, string>();
  for (const c of courses) {
    if (!owners.has(c.owner_id)) {
      const p = await getProfile(c.owner_id);
      owners.set(c.owner_id, p?.username ?? 'unknown');
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mx-auto max-w-6xl w-full px-5 py-10 flex-1">
        <h1 className="font-display text-3xl text-ink mb-1">Explore the graph</h1>
        <p className="text-ink-faint mb-8">Public courses, generated and refined by the community.</p>

        <form action="/explore" className="mb-6">
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search by title…"
            className="w-full max-w-md h-10 rounded-full border border-border bg-paper-panel px-4 text-sm focus:outline-none focus:ring-2 focus:ring-moss-500/30"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <FilterPill href="/explore" active={!searchParams.track} label="All tracks" />
          {TRACKS.map((t) => (
            <FilterPill
              key={t}
              href={`/explore?track=${t}`}
              active={searchParams.track === t}
              label={trackLabel(t)}
            />
          ))}
          <span className="w-px h-5 bg-border mx-1" />
          {SORTS.map((s) => (
            <FilterPill
              key={s.key}
              href={`/explore?${searchParams.track ? `track=${searchParams.track}&` : ''}sort=${s.key}`}
              active={(searchParams.sort ?? 'recent') === s.key}
              label={s.label}
            />
          ))}
        </div>

        {courses.length === 0 ? (
          <EmptyState
            title="No courses match yet"
            description="Be the first to generate one for this track."
            action={
              <Link href="/courses/new" className={buttonVariants('primary', 'sm')}>
                Generate a course
              </Link>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} ownerName={owners.get(c.owner_id)} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function FilterPill({ href, active, label }: { href: string; active?: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
        active
          ? 'bg-ink text-paper border-ink'
          : 'bg-paper-panel text-ink-soft border-border hover:bg-paper-dim'
      )}
    >
      {label}
    </Link>
  );
}
