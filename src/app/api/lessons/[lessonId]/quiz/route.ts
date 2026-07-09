import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { groq, GROQ_MODEL } from '@/lib/ai/groq';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(
  request: Request,
  { params }: { params: { lessonId: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Log in to generate a quiz.' }, { status: 401 });
  }

  const { lessonId } = params;
  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId is required.' }, { status: 400 });
  }

  // Fetch the lesson content
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('title, content_md')
    .eq('id', lessonId)
    .single();

  if (lessonError || !lesson) {
    return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 });
  }

  try {
    const SYSTEM_PROMPT = `You are Cortex's quiz-generation engine. Your job is to create a high-quality, comprehensive multiple-choice quiz based on the provided lesson text.

Rules:
- Generate exactly 3 to 5 challenging multiple-choice questions depending on the length of the lesson.
- Each question must test comprehension of important details in the lesson.
- Each question must have exactly 4 options.
- The options should be plausible, but only one must be correct.
- Provide a 0-indexed correct_answer_index (0, 1, 2, or 3).
- Provide a clear, detailed, educational "explanation" that explains why the correct option is right and the others are incorrect.
- Format all equations/math symbols in questions, options, and explanations using LaTeX syntax, e.g. $E = mc^2$ or $\\frac{a}{b}$.
- Respond ONLY with valid JSON matching the schema below. Do not include markdown fences, prose, or wrappers.

JSON Schema:
{
  "questions": [
    {
      "question": string,
      "options": [string, string, string, string],
      "correct_answer_index": number,
      "explanation": string
    }
  ]
}`;

    const completion = await groq().chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Generate a quiz for this lesson:
Title: ${lesson.title}
Content:
"""
${lesson.content_md}
"""`
        }
      ]
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error('Groq returned an empty response.');
    }

    const parsed = JSON.parse(raw);
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid quiz format returned by AI.');
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error('Quiz generation error:', err);
    return NextResponse.json(
      { error: err.message || 'An error occurred while generating the quiz.' },
      { status: 500 }
    );
  }
}
