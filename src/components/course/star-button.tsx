'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function StarButton({
  courseId,
  initialStarred,
  initialCount,
}: {
  courseId: string;
  initialStarred: boolean;
  initialCount: number;
}) {
  const router = useRouter();
  const [starred, setStarred] = useState(initialStarred);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch('/api/stars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      if (res.status === 401) return router.push('/login');
      const data = await res.json();
      setStarred(data.starred);
      setCount((c) => c + (data.starred ? 1 : -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle} disabled={loading}>
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Star className={cn('w-3.5 h-3.5', starred && 'fill-gold-500 text-gold-500')} />
      )}
      {count}
    </Button>
  );
}
