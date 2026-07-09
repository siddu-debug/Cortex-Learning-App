'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, GripVertical, Loader2, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { Lesson, Module } from '@/types/database';

interface EditableLesson {
  title: string;
  content_md: string;
  est_minutes: number;
}
interface EditableModule {
  title: string;
  summary: string;
  lessons: EditableLesson[];
}

function toEditable(modules: (Module & { lessons: Lesson[] })[]): EditableModule[] {
  return modules.map((m) => ({
    title: m.title,
    summary: m.summary ?? '',
    lessons: m.lessons.map((l) => ({ title: l.title, content_md: l.content_md, est_minutes: l.est_minutes })),
  }));
}

export function CourseEditor({
  courseId,
  courseSlug,
  initialModules,
}: {
  courseId: string;
  courseSlug: string;
  initialModules: (Module & { lessons: Lesson[] })[];
}) {
  const router = useRouter();
  const [modules, setModules] = useState<EditableModule[]>(toEditable(initialModules));
  const [commitMessage, setCommitMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateModule(mi: number, patch: Partial<EditableModule>) {
    setModules((mods) => mods.map((m, i) => (i === mi ? { ...m, ...patch } : m)));
  }
  function updateLesson(mi: number, li: number, patch: Partial<EditableLesson>) {
    setModules((mods) =>
      mods.map((m, i) =>
        i === mi ? { ...m, lessons: m.lessons.map((l, j) => (j === li ? { ...l, ...patch } : l)) } : m
      )
    );
  }
  function addModule() {
    setModules((mods) => [...mods, { title: 'New module', summary: '', lessons: [] }]);
  }
  function removeModule(mi: number) {
    setModules((mods) => mods.filter((_, i) => i !== mi));
  }
  function addLesson(mi: number) {
    setModules((mods) =>
      mods.map((m, i) =>
        i === mi ? { ...m, lessons: [...m.lessons, { title: 'New lesson', content_md: '', est_minutes: 10 }] } : m
      )
    );
  }
  function removeLesson(mi: number, li: number) {
    setModules((mods) =>
      mods.map((m, i) => (i === mi ? { ...m, lessons: m.lessons.filter((_, j) => j !== li) } : m))
    );
  }

  async function commit() {
    setSaving(true);
    setError(null);
    try {
      const contentRes = await fetch(`/api/courses/${courseId}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules }),
      });
      if (!contentRes.ok) throw new Error((await contentRes.json()).error);

      const versionRes = await fetch(`/api/courses/${courseId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitMessage: commitMessage || 'Edited course content' }),
      });
      if (!versionRes.ok) throw new Error((await versionRes.json()).error);

      router.push(`/courses/${courseSlug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 pb-32">
      {modules.map((mod, mi) => (
        <Card key={mi} className="p-5">
          <div className="flex items-start gap-2">
            <GripVertical className="w-4 h-4 text-ink-faint mt-2.5 shrink-0" />
            <div className="flex-1 space-y-2">
              <Input
                value={mod.title}
                onChange={(e) => updateModule(mi, { title: e.target.value })}
                className="font-display text-base"
                placeholder="Module title"
              />
              <Input
                value={mod.summary}
                onChange={(e) => updateModule(mi, { summary: e.target.value })}
                placeholder="One-line summary"
              />
            </div>
            <button onClick={() => removeModule(mi)} className="text-ink-faint hover:text-rust-500 p-2" aria-label="Delete module">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="ml-6 mt-4 space-y-4">
            {mod.lessons.map((lesson, li) => (
              <div key={li} className="border-l-2 border-border pl-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Input
                    value={lesson.title}
                    onChange={(e) => updateLesson(mi, li, { title: e.target.value })}
                    placeholder="Lesson title"
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    value={lesson.est_minutes}
                    onChange={(e) => updateLesson(mi, li, { est_minutes: Number(e.target.value) })}
                    className="w-20 text-sm"
                  />
                  <button onClick={() => removeLesson(mi, li)} className="text-ink-faint hover:text-rust-500 p-2 shrink-0" aria-label="Delete lesson">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Textarea
                  value={lesson.content_md}
                  onChange={(e) => updateLesson(mi, li, { content_md: e.target.value })}
                  rows={6}
                  placeholder="Lesson content (Markdown)"
                  className="font-mono text-xs"
                />
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => addLesson(mi)}>
              <Plus className="w-3.5 h-3.5" /> Add lesson
            </Button>
          </div>
        </Card>
      ))}

      <Button variant="outline" onClick={addModule} className="w-full">
        <Plus className="w-4 h-4" /> Add module
      </Button>

      <div className="fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur border-t border-border">
        <div className="mx-auto max-w-3xl px-5 py-4 flex items-center gap-3">
          <Input
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Commit message (e.g. 'Clarify hash map example')"
            className="flex-1"
          />
          <Button onClick={commit} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Commit
          </Button>
        </div>
        {error && <p className="text-sm text-rust-500 text-center pb-2">{error}</p>}
      </div>
    </div>
  );
}
