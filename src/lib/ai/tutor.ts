import { groq, GROQ_MODEL } from './groq';
import type { Lesson } from '@/types/database';

export interface TutorTurn {
  role: 'user' | 'assistant';
  content: string;
}

function buildGroundingContext(lessons: Pick<Lesson, 'title' | 'content_md'>[]): string {
  return lessons
    .map((l, i) => `### [${i + 1}] ${l.title}\n${l.content_md.slice(0, 4000)}`)
    .join('\n\n');
}

/**
 * Streams a tutor reply grounded strictly in the given course's lessons.
 * Returns an async iterator of text chunks so the route handler can pipe
 * them straight to the client as a stream.
 */
export async function* streamTutorReply(params: {
  courseTitle: string;
  lessons: Pick<Lesson, 'title' | 'content_md'>[];
  history: TutorTurn[];
}): AsyncGenerator<string> {
  const { courseTitle, lessons, history } = params;

  const grounding = buildGroundingContext(lessons);

  const systemPrompt = `You are the AI tutor embedded in the Cortex course "${courseTitle}". \
Answer strictly using the lesson material below — this is the learner's grounded source of truth. \
If a question falls outside this material, say so plainly and suggest which topic they should \
look at next rather than guessing. When you use a specific lesson, mention its title naturally \
("as covered in 'Hash Maps'..."). Keep answers focused and use short paragraphs or bullet points. \
Never invent facts not supported by the lesson content.

COURSE MATERIAL:
${grounding}`;

  const stream = await groq().chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.3,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.content } as const)),
    ],
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) yield text;
  }
}
