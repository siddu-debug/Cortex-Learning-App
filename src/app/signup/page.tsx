import Link from 'next/link';
import { Network } from 'lucide-react';
import { AuthForm } from '@/components/auth-form';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper paper-grid px-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Network className="w-5 h-5 text-moss-600" />
          <span className="font-display text-lg text-ink">Cortex</span>
        </Link>
        <AuthForm mode="signup" />
        <p className="text-center text-sm text-ink-faint mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-moss-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
