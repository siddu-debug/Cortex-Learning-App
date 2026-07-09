'use client';

import { useRef, useState, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { cn } from '@/lib/utils';
import type { TutorMessage } from '@/types/database';

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export function TutorChat({
  courseId,
  courseTitle,
  initialMessages,
}: {
  courseId: string;
  courseTitle: string;
  initialMessages: TutorMessage[];
}) {
  const [messages, setMessages] = useState<ChatTurn[]>(
    initialMessages.map((m) => ({ role: m.role, content: m.content }))
  );
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }, { role: 'assistant', content: '' }]);
    setStreaming(true);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, message: text }),
      });
      if (!res.body) throw new Error('No response stream.');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: acc };
          return copy;
        });
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: 'assistant', content: 'Something went wrong reaching the tutor. Try again.' };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <Card className="flex-1 flex flex-col min-h-[60vh]">
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <Sparkles className="w-5 h-5 text-moss-500 mx-auto mb-3" />
              <p className="text-sm text-ink-faint max-w-xs mx-auto">
                Ask anything about <strong className="text-ink-soft">{courseTitle}</strong>. Answers stay
                grounded in this course&apos;s lessons.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                  m.role === 'user'
                    ? 'bg-ink text-paper rounded-br-sm'
                    : 'bg-paper-dim text-ink rounded-bl-sm'
                )}
              >
                {m.role === 'assistant' ? (
                  m.content ? (
                    <MarkdownRenderer content={m.content} />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin text-ink-faint" />
                  )
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border p-3 flex items-end gap-2">
          <Textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask about this course…"
            className="flex-1 min-h-[42px] max-h-32"
          />
          <button
            onClick={send}
            disabled={streaming || !input.trim()}
            className="h-10 w-10 shrink-0 rounded-full bg-moss-500 text-white flex items-center justify-center hover:bg-moss-600 disabled:opacity-40 transition-colors"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </div>
  );
}
