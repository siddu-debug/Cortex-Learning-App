import Link from 'next/link';
import { GitFork, Star, GitCommitHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@/types/database';
import { trackLabel, formatRelativeTime } from '@/lib/utils';

const gradientMap: Record<string, string> = {
  moss: 'from-moss-500/15 to-moss-100/40',
  violet: 'from-violet-500/15 to-violet-100/40',
  gold: 'from-gold-500/15 to-gold-300/30',
  rust: 'from-rust-500/15 to-rust-500/5',
};

export function CourseCard({ course, ownerName }: { course: Course; ownerName?: string }) {
  return (
    <Link href={`/courses/${course.slug}`} className="group block h-full">
      <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-raised">
        <div
          className={`h-20 bg-gradient-to-br ${gradientMap[course.cover_gradient] ?? gradientMap.moss} border-b border-border relative`}
        >
          <div className="absolute inset-0 paper-grid opacity-40" />
          <div className="absolute top-3 left-4">
            <Badge tone="neutral">{trackLabel(course.track)}</Badge>
          </div>
          <div className="absolute top-3 right-4 font-mono text-xs text-ink-faint flex items-center gap-1">
            <GitCommitHorizontal className="w-3.5 h-3.5" /> v{course.current_version}
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-display text-lg text-ink leading-snug group-hover:text-moss-700 transition-colors">
            {course.title}
          </h3>
          {course.description && (
            <p className="text-sm text-ink-faint mt-1.5 line-clamp-2 flex-1">{course.description}</p>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-xs text-ink-faint">
            <span className="font-mono">{ownerName ? `@${ownerName}` : ''}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1" title="Quality score">
                <Star className="w-3.5 h-3.5 text-gold-500" fill="currentColor" />
                {course.quality_score > 0 ? course.quality_score.toFixed(1) : '—'}
              </span>
              <span className="flex items-center gap-1" title="Forks">
                <GitFork className="w-3.5 h-3.5" />
                {course.fork_count}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-ink-faint mt-2 font-mono">
            updated {formatRelativeTime(course.updated_at)}
          </div>
        </div>
      </Card>
    </Link>
  );
}
