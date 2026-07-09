import Link from 'next/link';
import { GitFork, Network, Search } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';

export async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/85 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Network className="w-5 h-5 text-moss-600" strokeWidth={1.75} />
          <span className="font-display text-lg tracking-tight text-ink">Cortex</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link href="/explore" className="px-3 py-1.5 rounded-full text-ink-soft hover:bg-paper-dim hover:text-ink transition-colors">
            Explore
          </Link>
          <Link href="/explore?sort=forks" className="px-3 py-1.5 rounded-full text-ink-soft hover:bg-paper-dim hover:text-ink transition-colors">
            <span className="inline-flex items-center gap-1"><GitFork className="w-3.5 h-3.5" /> Fork network</span>
          </Link>
          <Link href="/tracks" className="px-3 py-1.5 rounded-full text-ink-soft hover:bg-paper-dim hover:text-ink transition-colors">
            Tracks
          </Link>
        </nav>

        <div className="hidden md:flex flex-1 max-w-sm">
          <form action="/explore" className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
            <input
              name="q"
              placeholder="Search courses & concepts…"
              className="w-full h-9 rounded-full border border-border bg-paper-dim/60 pl-9 pr-3 text-sm placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-moss-500/30"
            />
          </form>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link href="/courses/new" className={buttonVariants('ghost', 'sm')}>
                New course
              </Link>
              <Link href="/dashboard" className="ml-1">
                <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-mono font-medium border border-violet-100">
                  {(user.email ?? '?')[0].toUpperCase()}
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-ink-soft hover:text-ink px-3 py-1.5">
                Log in
              </Link>
              <Link href="/signup" className={buttonVariants('primary', 'sm')}>
                Sign up free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
