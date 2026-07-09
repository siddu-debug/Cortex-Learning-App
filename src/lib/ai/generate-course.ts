import { groq, GROQ_MODEL } from './groq';
import { z } from 'zod';

const LessonSchema = z.object({
  title: z.string(),
  content_md: z.string(),
  est_minutes: z.number().int().min(3).max(60).default(10),
});

const ModuleSchema = z.object({
  title: z.string(),
  summary: z.string(),
  lessons: z.array(LessonSchema).min(1).max(8),
});

const ConceptEdgeSchema = z.object({
  from: z.string(), // concept_key
  to: z.string(), // concept_key
  relationship: z.enum(['prerequisite', 'related', 'extends']).default('prerequisite'),
});

const ConceptNodeSchema = z.object({
  concept_key: z.string(), // kebab-case, stable id
  label: z.string(),
  node_type: z.enum(['concept', 'skill', 'topic']).default('concept'),
});

export const GeneratedCourseSchema = z.object({
  title: z.string(),
  description: z.string(),
  modules: z.array(ModuleSchema).min(1).max(10),
  concepts: z.array(ConceptNodeSchema).min(1).max(40),
  concept_edges: z.array(ConceptEdgeSchema).max(80),
});

export type GeneratedCourse = z.infer<typeof GeneratedCourseSchema>;

const SYSTEM_PROMPT = `You are Cortex's course-generation engine. You turn raw source material \
(lecture notes, docs, articles, repo READMEs) into a highly detailed, comprehensive course PLUS a knowledge \
graph of the concepts it teaches.

Rules:
- Ground every lesson in the provided source. Do not invent facts that contradict it.
- Break the material into 3-8 modules, each with 2-6 comprehensive, in-depth lessons.
- Each lesson's content_md MUST be highly detailed, extensive teaching content in Markdown (headings, subheadings, step-by-step explanations, concrete examples, and well-commented code blocks where relevant). Aim for 500-1000 words per lesson — do not write summaries or stub text.
- If the subject is scientific, mathematical, or technical, you MUST write out formulas and equations using standard LaTeX syntax. Surround block-level math with double dollar signs, e.g. $$ E = mc^2 $$, and inline math with single dollar signs, e.g. $a^2 + b^2 = c^2$.
- Integrate visual elements! Use structured Markdown tables, conceptual ASCII flowcharts, or high-quality descriptive Unsplash image links (e.g. \`![conceptual diagram](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80)\`) to illustrate complex concepts.
- Build a knowledge graph: one concept node per distinct idea taught, with kebab-case
  concept_key ids (e.g. "hash-maps", "big-o-notation"), and edges expressing which concepts
  are prerequisites of others.
- Respond ONLY with valid JSON matching the given schema. No prose, no markdown fences.`;

export async function generateCourseFromText(params: {
  sourceText: string;
  audienceHint?: string;
}): Promise<GeneratedCourse> {
  const { sourceText, audienceHint } = params;

  const truncated = sourceText.slice(0, 40_000); // keep prompt within context budget

  const completion = await groq().chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.4,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Target audience: ${audienceHint || 'software engineers preparing for real-world work'}

Generate the course JSON now. Schema:
{
  "title": string,
  "description": string,
  "modules": [{ "title": string, "summary": string, "lessons": [{ "title": string, "content_md": string, "est_minutes": number }] }],
  "concepts": [{ "concept_key": string, "label": string, "node_type": "concept"|"skill"|"topic" }],
  "concept_edges": [{ "from": string, "to": string, "relationship": "prerequisite"|"related"|"extends" }]
}

SOURCE MATERIAL:
"""
${truncated}
"""`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('Groq returned an empty completion.');

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Groq returned malformed JSON for course generation.');
  }

  const result = GeneratedCourseSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Generated course failed validation: ${result.error.message}`);
  }
  return result.data;
}
