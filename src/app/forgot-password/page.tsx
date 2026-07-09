'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Network, Sparkles, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess('A recovery link has been sent to your email address!');
        setEmail('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper relative overflow-hidden px-5">
      {/* Dynamic Multi-Color Background Blobs */}
      <div className="absolute top-[10%] left-[-10%] w-[450px] h-[450px] bg-gradient-to-tr from-violet-300/30 to-purple-400/20 rounded-full filter blur-[100px] pointer-events-none -z-10 animate-pulse duration-5000" />
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-moss-300/30 to-emerald-400/20 rounded-full filter blur-[120px] pointer-events-none -z-10 animate-pulse duration-4000" />
      <div className="absolute top-[40%] left-[30%] w-[350px] h-[350px] bg-gradient-to-br from-gold-200/20 to-rose-200/10 rounded-full filter blur-[90px] pointer-events-none -z-10" />

      <div className="w-full max-w-md relative">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="p-1 rounded-xl bg-gradient-to-tr from-moss-600 to-violet-500 text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Network className="w-5 h-5" strokeWidth={2} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-gradient-primary">Cortex</span>
        </Link>

        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border shadow-raised relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/10 via-gold-500/5 to-transparent rounded-bl-[80px] -z-10" />

          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-gradient-primary tracking-tight">
              Reset Password
            </h1>
            <p className="text-xs text-ink-faint mt-1.5 leading-snug">
              Enter your email and we&apos;ll send you a link to choose a new password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-xs animate-fadeUp">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs animate-fadeUp">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{success}</span>
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-violet-600 via-purple-600 to-moss-600 border-0 hover:from-violet-700 hover:to-moss-700 text-white shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all rounded-xl py-2.5 font-mono text-xs uppercase tracking-wider"
            >
              {loading ? (
                'Sending Link...'
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Send Reset Link
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs font-mono font-bold text-ink-faint mt-6">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-violet-600 hover:text-violet-700 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
