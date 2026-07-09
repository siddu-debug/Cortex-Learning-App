'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MarkCompleteButton({
  courseId,
  lessonId,
  initialComplete,
}: {
  courseId: string;
  lessonId: string;
  initialComplete: boolean;
}) {
  const router = useRouter();
  const [complete, setComplete] = useState(initialComplete);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonId, status: complete ? 'in_progress' : 'complete' }),
      });
      if (res.status === 401) return router.push('/login');
      setComplete((c) => !c);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={complete ? 'secondary' : 'outline'} size="sm" onClick={toggle} disabled={loading}>
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
      {complete ? 'Completed' : 'Mark complete'}
    </Button>
  );
}
