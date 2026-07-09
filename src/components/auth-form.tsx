'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  }

  return (
    <Card>
      <CardHeader>
        <h1 className="font-display text-xl text-ink">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-sm text-ink-faint mt-1">
          {mode === 'login'
            ? 'Log in to keep learning and contributing.'
            : 'Free forever for learning and publishing courses.'}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-mono text-ink-faint block mb-1.5">username</label>
              <Input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, '_'))}
                placeholder="ada_lovelace"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-mono text-ink-faint block mb-1.5">email</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-ink-faint block mb-1.5">password</label>
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-rust-500">{error}</p>}
          {message && <p className="text-sm text-moss-600">{message}</p>}

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up free'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
