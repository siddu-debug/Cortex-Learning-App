'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  User, 
  Sparkles, 
  Check, 
  LogOut, 
  Code, 
  BookOpen, 
  Layers, 
  Activity,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  track: string | null;
}

interface SettingsFormProps {
  profile: Profile | null;
  email: string | undefined;
}

const tracks = [
  {
    id: 'software-engineering',
    title: 'Software Engineering',
    description: 'Algorithms, system design, web development, and AI building.',
    icon: Code,
    color: 'border-emerald-200 bg-emerald-50/30 text-emerald-700 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20 dark:bg-emerald-950/10 dark:text-emerald-400 dark:border-emerald-900/30',
    activeColor: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-500',
  },
  {
    id: 'upsc',
    title: 'UPSC Civil Services',
    description: 'History, geography, polity, and general studies syllabus.',
    icon: BookOpen,
    color: 'border-violet-200 bg-violet-50/30 text-violet-700 hover:bg-violet-50/60 dark:hover:bg-violet-950/20 dark:bg-violet-950/10 dark:text-violet-400 dark:border-violet-900/30',
    activeColor: 'border-violet-500 ring-2 ring-violet-500/20 bg-violet-50/50 text-violet-800 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-500',
  },
  {
    id: 'iit-jee',
    title: 'IIT-JEE (Engineering)',
    description: 'Advanced mathematics, physics, and chemistry concepts.',
    icon: Layers,
    color: 'border-gold-300/40 bg-gold-50/30 text-gold-700 hover:bg-gold-50/60 dark:hover:bg-gold-950/20 dark:bg-gold-950/10 dark:text-gold-400 dark:border-gold-900/30',
    activeColor: 'border-gold-500 ring-2 ring-gold-500/20 bg-gold-50/50 text-gold-800 dark:bg-gold-950/30 dark:text-gold-300 dark:border-gold-500',
  },
  {
    id: 'neet',
    title: 'NEET (Medical)',
    description: 'Biology, organic chemistry, and molecular physics.',
    icon: Activity,
    color: 'border-rose-200 bg-rose-50/30 text-rose-700 hover:bg-rose-50/60 dark:hover:bg-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400 dark:border-rose-900/30',
    activeColor: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-500',
  },
];

export function SettingsForm({ profile, email }: SettingsFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState(profile?.username ?? '');
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [track, setTrack] = useState(profile?.track ?? 'software-engineering');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loggingOut, setLoggingOut] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!username || username.trim().length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    // Alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: username.trim().toLowerCase(),
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          track: track,
        })
        .eq('id', profile.id);

      if (updateError) {
        if (updateError.message.includes('unique constraint')) {
          setError('Username is already taken');
        } else {
          setError(updateError.message);
        }
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (err) {
      setLoggingOut(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Background blobs for colorful ambiance */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-violet-200/20 via-rose-100/10 to-emerald-200/20 rounded-full blur-[120px] -z-10" />

      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-border shadow-raised relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-gold-500/5 rounded-bl-[100px] -z-10" />
        
        <div className="flex items-center justify-between border-b border-border pb-6 mb-8">
          <div>
            <h1 className="font-display text-3xl text-gradient-primary font-medium tracking-tight">
              Profile Settings
            </h1>
            <p className="text-sm text-ink-faint mt-1">
              Customize your learning identity and tracking preferences.
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-moss-500 to-violet-500 text-white flex items-center justify-center shadow-glow-moss animate-pulse">
            <User className="w-6 h-6" />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm animate-fadeUp">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fadeUp">
              <Check className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-mono font-medium text-ink-soft uppercase tracking-wider">
                Email Address (read-only)
              </label>
              <Input
                id="email"
                type="email"
                disabled
                value={email ?? ''}
                className="bg-paper-dim/50 cursor-not-allowed opacity-75 border-border-strong rounded-xl font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="block text-xs font-mono font-medium text-ink-soft uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint font-mono text-sm">@</span>
                <Input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="pl-7 rounded-xl border-border-strong focus:ring-2 focus:ring-moss-500/20 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="display_name" className="block text-xs font-mono font-medium text-ink-soft uppercase tracking-wider">
              Display Name
            </label>
            <Input
              id="display_name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              className="rounded-xl border-border-strong focus:ring-2 focus:ring-moss-500/20 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="block text-xs font-mono font-medium text-ink-soft uppercase tracking-wider">
              Short Bio
            </label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other learners about your interests, study plans, or background..."
              rows={3}
              className="rounded-xl border-border-strong focus:ring-2 focus:ring-moss-500/20 text-sm resize-none"
            />
          </div>

          {/* Track Selection with custom interactive cards */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-ink-soft uppercase tracking-wider mb-1">
                Preferred Learning Track
              </label>
              <p className="text-xs text-ink-faint">
                Selects the default domain for course curation and tutor feedback.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {tracks.map((t) => {
                const IconComponent = t.icon;
                const isActive = track === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTrack(t.id)}
                    className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-300 ${
                      isActive ? t.activeColor : t.color
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-xl bg-white/80 dark:bg-ink/80 border border-border/20 shadow-sm ${isActive ? 'text-ink' : ''}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="font-display font-medium text-sm">{t.title}</span>
                      {isActive && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-ink-soft leading-snug flex-1">
                      {t.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border pt-8 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              disabled={loggingOut || saving}
              className="w-full sm:w-auto font-mono text-sm border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-full h-11"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? 'Logging out...' : 'Log out'}
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto font-mono text-sm bg-gradient-to-r from-moss-600 to-violet-600 text-white hover:from-moss-700 hover:to-violet-700 shadow-glow rounded-full h-11 px-8"
            >
              {saving ? (
                <>Saving changes...</>
              ) : success ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
