'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Check, AlertCircle } from 'lucide-react';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username, display_name: username } },
        });
        setLoading(false);
        if (error) return setError(error.message);
        setMessage('Check your inbox to confirm your email, then log in.');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return setError(error.message);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
      setLoading(false);
    }
  }

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border shadow-raised relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-moss-500/10 via-violet-500/5 to-transparent rounded-bl-[80px] -z-10 animate-pulse duration-4000" />
      
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gradient-primary tracking-tight">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-xs text-ink-faint mt-1.5 leading-snug">
          {mode === 'login'
            ? 'Log in to keep learning and contributing.'
            : 'Free forever for learning and publishing courses.'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-xs animate-fadeUp">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs animate-fadeUp">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {mode === 'signup' && (
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-semibold text-ink-soft uppercase tracking-wider block">
              username
            </label>
            <Input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, '_'))}
              placeholder="ada_lovelace"
              className="rounded-xl border-border-strong focus:ring-2 focus:ring-moss-500/20 text-sm font-mono"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-mono font-semibold text-ink-soft uppercase tracking-wider block">
            email address
          </label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-xl border-border-strong focus:ring-2 focus:ring-moss-500/20 text-sm"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-mono font-semibold text-ink-soft uppercase tracking-wider block">
              password
            </label>
            {mode === 'login' && (
              <Link 
                href="/forgot-password" 
                className="text-[10px] font-mono font-bold text-violet-600 hover:text-violet-700 hover:underline tracking-wide"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <Input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="rounded-xl border-border-strong focus:ring-2 focus:ring-moss-500/20 text-sm"
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full mt-4 bg-gradient-to-r from-moss-600 via-emerald-600 to-violet-600 border-0 hover:from-moss-700 hover:to-violet-700 text-white shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all rounded-xl py-2.5 font-mono text-xs uppercase tracking-wider"
        >
          {loading ? (
            'Authenticating...'
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              {mode === 'login' ? 'Log in' : 'Sign up free'}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
