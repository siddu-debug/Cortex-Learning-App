import { cn } from '@/lib/utils';

export function Avatar({
  name,
  src,
  size = 32,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(/[\s_-]+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn('rounded-full object-cover border border-border', className)}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={cn(
        'rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-mono font-medium border border-violet-100',
        className
      )}
    >
      {initials}
    </div>
  );
}
