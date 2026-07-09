import Link from 'next/link';
import { Network, ArrowRight } from 'lucide-react';
import { AuthForm } from '@/components/auth-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper relative overflow-hidden px-5">
      {/* Dynamic Multi-Color Background Blobs */}
      <div className="absolute top-[10%] left-[-10%] w-[450px] h-[450px] bg-gradient-to-tr from-violet-300/30 to-purple-400/20 rounded-full filter blur-[100px] pointer-events-none -z-10 animate-pulse duration-5000" />
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-moss-300/30 to-emerald-400/20 rounded-full filter blur-[120px] pointer-events-none -z-10 animate-pulse duration-4000" />
      <div className="absolute top-[40%] left-[30%] w-[350px] h-[350px] bg-gradient-to-br from-gold-200/20 to-rose-200/10 rounded-full filter blur-[90px] pointer-events-none -z-10" />

      <div className="w-full max-w-sm relative">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="p-1 rounded-xl bg-gradient-to-tr from-moss-600 to-violet-500 text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Network className="w-5 h-5" strokeWidth={2} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-gradient-primary">Cortex</span>
        </Link>
        
        <AuthForm mode="login" />
        
        <p className="text-center text-xs font-mono font-bold text-ink-faint mt-6">
          New here?{' '}
          <Link href="/signup" className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-700 hover:underline">
            Create an account <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </div>
    </div>
  );
}
