import { notFound } from 'next/navigation';
import { GitCommitHorizontal, GitFork } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { CourseSubnav } from '@/components/course/course-subnav';
import { getCourseBySlug, getCourseVersions, getForksOf, getProfile } from '@/lib/data/courses';
import { formatRelativeTime } from '@/lib/utils';

export default async function CourseVersionsPage({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const [versions, forks] = await Promise.all([getCourseVersions(course.id), getForksOf(course.id)]);

  const authors = new Map<string, string>();
  for (const v of versions) {
    if (!authors.has(v.author_id)) {
      const p = await getProfile(v.author_id);
      authors.set(v.author_id, p?.username ?? 'unknown');
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mx-auto max-w-3xl w-full px-5 py-10 flex-1">
        <h1 className="font-display text-2xl text-ink mb-1">{course.title}</h1>
        <CourseSubnav slug={course.slug} active="versions" />

        <div className="mt-8">
          <h2 className="font-mono text-xs uppercase tracking-wide text-ink-faint mb-4">
            Commit history ({versions.length})
          </h2>
          <div className="relative border-l border-border ml-2 space-y-6">
            {versions.map((v) => (
              <div key={v.id} className="pl-6 relative">
                <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-moss-500 border-2 border-paper" />
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitCommitHorizontal className="w-3.5 h-3.5 text-moss-600" />
                      <span className="font-mono text-xs text-ink-faint">v{v.version_number}</span>
                    </div>
                    <span className="text-xs text-ink-faint">{formatRelativeTime(v.created_at)}</span>
                  </div>
                  <p className="text-sm text-ink mt-1.5">{v.commit_message}</p>
                  <p className="text-xs text-ink-faint mt-1 font-mono">@{authors.get(v.author_id)}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {forks.length > 0 && (
          <div className="mt-12">
            <h2 className="font-mono text-xs uppercase tracking-wide text-ink-faint mb-4">
              Fork network ({forks.length})
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {forks.map((f) => (
                <a key={f.id} href={`/courses/${f.slug}`} className="block">
                  <Card className="p-4 hover:shadow-raised transition-shadow">
                    <div className="flex items-center gap-2 text-xs text-ink-faint mb-1">
                      <GitFork className="w-3.5 h-3.5" /> fork
                    </div>
                    <p className="text-sm text-ink font-medium">{f.title}</p>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
