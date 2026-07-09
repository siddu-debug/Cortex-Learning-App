import Link from 'next/link';
import { GitCommitHorizontal, Network, MessagesSquare, History } from 'lucide-react';

const TABS = [
  { key: 'curriculum', label: 'Curriculum', icon: GitCommitHorizontal, path: '' },
  { key: 'graph', label: 'Knowledge graph', icon: Network, path: '/graph' },
  { key: 'tutor', label: 'AI tutor', icon: MessagesSquare, path: '/tutor' },
  { key: 'versions', label: 'History', icon: History, path: '/versions' },
] as const;

export function CourseSubnav({
  slug,
  active,
}: {
  slug: string;
  active: (typeof TABS)[number]['key'];
}) {
  return (
    <div className="flex items-center gap-1 border-b border-border">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`/courses/${slug}${tab.path}`}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
            tab.key === active
              ? 'border-moss-500 text-ink font-medium'
              : 'border-transparent text-ink-faint hover:text-ink'
          }`}
        >
          <tab.icon className="w-3.5 h-3.5" />
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
