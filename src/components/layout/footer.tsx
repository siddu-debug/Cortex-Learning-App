import Link from 'next/link';
import { Network } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-6xl px-5 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <Network className="w-4 h-4 text-moss-600" />
            <span className="font-display text-base text-ink">Cortex</span>
          </div>
          <p className="text-sm text-ink-faint leading-relaxed">
            The community-maintained learning graph. Every course is forkable, every fact is
            grounded, every path adapts.
          </p>
        </div>

        <FooterCol
          title="Product"
          links={[
            { href: '/explore', label: 'Explore courses' },
            { href: '/tracks', label: 'Tracks' },
            { href: '/courses/new', label: 'Generate a course' },
            { href: '/pricing', label: 'Pricing' },
          ]}
        />
        <FooterCol
          title="Community"
          links={[
            { href: '/explore?sort=forks', label: 'Fork network' },
            { href: '/explore?sort=quality', label: 'Top rated' },
            { href: '/guidelines', label: 'Contribution guidelines' },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { href: '/about', label: 'About' },
            { href: '/pricing', label: 'Enterprise' },
          ]}
        />
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-ink-faint font-mono">
        cortex — built in the open, forked forever
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-xs font-mono uppercase tracking-wide text-ink-faint mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-ink-soft hover:text-ink transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
