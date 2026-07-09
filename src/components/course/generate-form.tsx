'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, FileUp, Type, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SourceTab = 'url' | 'pdf' | 'text';

const TRACKS = [
  { value: 'software-engineering', label: 'Software Engineering' },
  { value: 'upsc', label: 'UPSC' },
  { value: 'iit-jee', label: 'IIT-JEE' },
  { value: 'neet', label: 'NEET' },
];

const LOADING_LINES = [
  'Reading your source…',
  'Extracting concepts…',
  'Mapping prerequisites…',
  'Drafting lessons…',
  'Building the knowledge graph…',
];

export function GenerateForm() {
  const router = useRouter();
  const [tab, setTab] = useState<SourceTab>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [track, setTrack] = useState('software-engineering');
  const [audienceHint, setAudienceHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLine, setLoadingLine] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const interval = setInterval(() => setLoadingLine((n) => (n + 1) % LOADING_LINES.length), 2200);

    try {
      let res: Response;
      if (tab === 'pdf') {
        if (!file) throw new Error('Choose a PDF file first.');
        const form = new FormData();
        form.append('file', file);
        form.append('track', track);
        form.append('audienceHint', audienceHint);
        res = await fetch('/api/generate', { method: 'POST', body: form });
      } else {
        const body =
          tab === 'url' ? { url, track, audienceHint } : { text, track, audienceHint };
        res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed.');
      router.push(`/courses/${data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setLoading(false);
    } finally {
      clearInterval(interval);
    }
  }

  if (loading) {
    return (
      <Card className="p-10 flex flex-col items-center text-center">
        <Loader2 className="w-6 h-6 text-moss-600 animate-spin mb-4" />
        <p className="font-mono text-sm text-ink-soft">{LOADING_LINES[loadingLine]}</p>
        <p className="text-xs text-ink-faint mt-2">This usually takes 15–40 seconds.</p>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <Card className="p-2">
        <div className="flex gap-1 p-2">
          <TabButton icon={Link2} label="URL" active={tab === 'url'} onClick={() => setTab('url')} />
          <TabButton icon={FileUp} label="PDF" active={tab === 'pdf'} onClick={() => setTab('pdf')} />
          <TabButton icon={Type} label="Paste text" active={tab === 'text'} onClick={() => setTab('text')} />
        </div>

        <div className="p-4 pt-2">
          {tab === 'url' && (
            <Input
              type="url"
              required
              placeholder="https://example.com/article-or-docs-page"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          )}
          {tab === 'pdf' && (
            <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-border-strong rounded-xl py-10 cursor-pointer hover:bg-paper-dim/50 transition-colors">
              <FileUp className="w-5 h-5 text-ink-faint" />
              <span className="text-sm text-ink-soft">
                {file ? file.name : 'Click to choose a PDF'}
              </span>
              <input
                type="file"
                accept="application/pdf"
                required
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
          {tab === 'text' && (
            <Textarea
              required
              rows={8}
              placeholder="Paste lecture notes, a README, an article, anything with real content…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-xs font-mono text-ink-faint block mb-1.5">track</label>
          <select
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            className="w-full h-10 rounded-lg border border-border-strong bg-paper-panel px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss-500/40"
          >
            {TRACKS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-mono text-ink-faint block mb-1.5">audience (optional)</label>
          <Input
            placeholder="e.g. junior backend engineers"
            value={audienceHint}
            onChange={(e) => setAudienceHint(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-rust-500 mt-4">{error}</p>}

      <Button type="submit" size="lg" className="w-full mt-6">
        Generate course
      </Button>
    </form>
  );
}

function TabButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium transition-colors',
        active ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-dim'
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
