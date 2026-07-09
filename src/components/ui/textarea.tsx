import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-border-strong bg-paper-panel px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint',
        'focus:outline-none focus:ring-2 focus:ring-moss-500/40 focus:border-moss-500 transition-shadow resize-y',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
