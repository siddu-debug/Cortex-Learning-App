import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'moss' | 'violet' | 'gold' | 'neutral' | 'rust';

const toneClasses: Record<Tone, string> = {
  moss: 'bg-moss-50 text-moss-700 border-moss-100',
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
  gold: 'bg-gold-300/20 text-gold-700 border-gold-300/40',
  neutral: 'bg-paper-dim text-ink-soft border-border',
  rust: 'bg-rust-500/10 text-rust-500 border-rust-500/20',
};

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium font-mono tracking-tight',
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
