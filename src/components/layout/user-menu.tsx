'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Settings, 
  User, 
  LogOut, 
  LayoutDashboard,
  GitPullRequest
} from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
}

interface UserMenuProps {
  email: string | undefined;
  profile: Profile | null;
}

export function UserMenu({ email, profile }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const displayName = profile?.display_name || email?.split('@')[0] || 'Learner';
  const username = profile?.username || email?.split('@')[0] || 'learner';
  const initials = displayName[0].toUpperCase();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 focus:outline-none group"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500 to-moss-400 text-white flex items-center justify-center text-sm font-mono font-semibold border-2 border-white dark:border-ink shadow-md group-hover:scale-105 transition-transform duration-200">
          {initials}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-60 rounded-2xl border border-border bg-white p-2 shadow-raised z-50 animate-fadeUp">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/60 mb-1">
            <p className="font-display text-sm font-medium text-ink truncate">
              {displayName}
            </p>
            <p className="font-mono text-[10px] text-ink-faint truncate mt-0.5">
              @{username}
            </p>
          </div>

          {/* Links */}
          <div className="space-y-0.5">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-ink-soft hover:bg-paper-dim hover:text-ink transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-violet-500" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-ink-soft hover:bg-paper-dim hover:text-ink transition-colors"
            >
              <Settings className="w-4 h-4 text-moss-500" />
              <span>Settings</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/60 my-1" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}
