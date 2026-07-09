'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GitFork, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ForkButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function fork() {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/fork`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) return router.push('/login');
        throw new Error(data.error);
      }
      router.push(`/courses/${data.slug}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={fork} disabled={loading}>
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitFork className="w-3.5 h-3.5" />}
      Fork
    </Button>
  );
}
