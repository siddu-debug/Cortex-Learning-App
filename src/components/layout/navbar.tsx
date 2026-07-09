import Link from 'next/link';
import { GitFork, Network, Search, Sparkles } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/data/courses';
import { UserMenu } from './user-menu';

export async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await getProfile(user.id) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-white/70 backdrop-blur-md shadow-sm transition-all duration-300">
      {/* Decorative gradient thin top line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-moss-500 via-violet-500 to-gold-400" />
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="p-1 rounded-xl bg-gradient-to-tr from-moss-600 to-violet-500 text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Network className="w-5 h-5" strokeWidth={2} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-gradient-primary">Cortex</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link href="/explore" className="px-3 py-1.5 rounded-full text-ink-soft hover:bg-paper-dim hover:text-ink transition-colors">
            Explore
          </Link>
          <Link href="/explore?sort=forks" className="px-3 py-1.5 rounded-full text-ink-soft hover:bg-paper-dim hover:text-ink transition-colors">
            <span className="inline-flex items-center gap-1"><GitFork className="w-3.5 h-3.5 text-violet-500" /> Fork network</span>
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
              className="w-full h-9 rounded-full border border-border bg-paper-dim/40 pl-9 pr-3 text-sm placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-moss-500/30 transition-all"
            />
          </form>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <Link href="/courses/new" className="hidden sm:inline-flex text-xs font-mono font-medium tracking-wide uppercase px-3 py-1.5 rounded-full border border-moss-200/60 text-moss-700 bg-moss-50/50 hover:bg-moss-50 hover:border-moss-300 transition-all gap-1 items-center">
                <Sparkles className="w-3 h-3 text-moss-500" /> Generate Course
              </Link>
              <UserMenu email={user.email} profile={profile} />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-ink-soft hover:text-ink px-3 py-1.5 transition-colors">
                Log in
              </Link>
              <Link href="/signup" className={buttonVariants('primary', 'sm', 'bg-gradient-to-r from-moss-600 to-violet-600 border-0 hover:from-moss-700 hover:to-violet-700 shadow-glow-moss')}>
                Sign up free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
