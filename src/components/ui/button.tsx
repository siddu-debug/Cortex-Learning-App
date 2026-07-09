import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink/90 shadow-card',
  secondary: 'bg-moss-500 text-white hover:bg-moss-600 shadow-card',
  outline: 'border border-border-strong bg-transparent text-ink hover:bg-paper-dim',
  ghost: 'bg-transparent text-ink-soft hover:bg-paper-dim hover:text-ink',
  danger: 'bg-rust-500 text-white hover:bg-rust-500/90',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export function buttonVariants(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(
    'inline-flex items-center justify-center rounded-full font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants(variant, size, className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
