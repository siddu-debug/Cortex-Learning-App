import Link from 'next/link';
import { Network } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper paper-grid px-5 text-center">
      <Network className="w-8 h-8 text-moss-500 mb-4" strokeWidth={1.5} />
      <h1 className="font-display text-3xl text-ink mb-2">Node not found</h1>
      <p className="text-ink-faint max-w-sm mb-6">
        This part of the graph doesn&apos;t exist — the course may have been unpublished or the
        link is off.
      </p>
      <Link href="/" className={buttonVariants('primary', 'md')}>
        Back to Cortex
      </Link>
    </div>
  );
}
