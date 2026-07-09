import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractFromPdf, extractFromUrl } from '@/lib/ai/extract-source';
import { generateCourseFromText } from '@/lib/ai/generate-course';
import { slugify } from '@/lib/utils';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'You need to be logged in to generate a course.' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') || '';
  let sourceType: 'pdf' | 'url' | 'text' = 'text';
  let sourceRef = '';
  let sourceText = '';
  let audienceHint = '';
  let track = 'software-engineering';

  try {
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('file') as File | null;
      audienceHint = String(form.get('audienceHint') ?? '');
      track = String(form.get('track') ?? track);
      if (!file) return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
      sourceType = 'pdf';
      sourceRef = file.name;
      const buffer = Buffer.from(await file.arrayBuffer());
      sourceText = await extractFromPdf(buffer);
    } else {
      const body = await request.json();
      audienceHint = body.audienceHint ?? '';
      track = body.track ?? track;
      if (body.url) {
        sourceType = 'url';
        sourceRef = body.url;
        sourceText = await extractFromUrl(body.url);
      } else if (body.text) {
        sourceType = 'text';
        sourceRef = 'pasted-text';
        sourceText = body.text;
      } else {
        return NextResponse.json({ error: 'Provide a url, file, or text.' }, { status: 400 });
      }
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to read source material.' },
      { status: 400 }
    );
  }

  if (sourceText.trim().length < 200) {
    return NextResponse.json(
      { error: 'That source is too short to build a course from — try a longer document.' },
      { status: 400 }
    );
  }

  const { data: job } = await supabase
    .from('ingestion_jobs')
    .insert({ requested_by: user.id, source_type: sourceType, source_ref: sourceRef, status: 'processing' })
    .select()
    .single();

  try {
    const generated = await generateCourseFromText({ sourceText, audienceHint });

    const baseSlug = slugify(generated.title) || 'course';
    let slug = baseSlug;
    let attempt = 0;
    while (true) {
      const { data: existing } = await supabase.from('courses').select('id').eq('slug', slug).maybeSingle();
      if (!existing) break;
      attempt += 1;
      slug = `${baseSlug}-${attempt}`;
    }

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        slug,
        title: generated.title,
        description: generated.description,
        track,
        owner_id: user.id,
        visibility: 'public',
        cover_gradient: ['moss', 'violet', 'gold'][Math.floor(Math.random() * 3)],
      })
      .select()
      .single();

    if (courseError || !course) throw new Error(courseError?.message ?? 'Could not create course.');

    // Modules + lessons
    for (let mi = 0; mi < generated.modules.length; mi++) {
      const mod = generated.modules[mi];
      const { data: modRow, error: modError } = await supabase
        .from('modules')
        .insert({ course_id: course.id, title: mod.title, summary: mod.summary, order_index: mi })
        .select()
        .single();
      if (modError || !modRow) throw new Error(modError?.message ?? 'Could not create module.');

      for (let li = 0; li < mod.lessons.length; li++) {
        const lesson = mod.lessons[li];
        const { data: lessonRow } = await supabase
          .from('lessons')
          .insert({
            module_id: modRow.id,
            course_id: course.id,
            title: lesson.title,
            content_md: lesson.content_md,
            order_index: li,
            est_minutes: lesson.est_minutes ?? 10,
            source_refs: [{ label: sourceRef }],
          })
          .select()
          .single();

        // Link the first concept that plausibly maps to this lesson title
        // to its lesson id, so the graph can deep-link into content.
        const match = generated.concepts.find(
          (c) => c.label.toLowerCase() === lesson.title.toLowerCase()
        );
        if (match && lessonRow) {
          await supabase
            .from('knowledge_nodes')
            .update({ lesson_id: lessonRow.id })
            .eq('course_id', course.id)
            .eq('concept_key', match.concept_key);
        }
      }
    }

    // Knowledge graph nodes
    const nodeIdByKey = new Map<string, string>();
    for (const concept of generated.concepts) {
      const { data: nodeRow } = await supabase
        .from('knowledge_nodes')
        .insert({
          course_id: course.id,
          concept_key: concept.concept_key,
          label: concept.label,
          node_type: concept.node_type,
        })
        .select()
        .single();
      if (nodeRow) nodeIdByKey.set(concept.concept_key, nodeRow.id);
    }

    // Re-link lesson_id now that nodes exist (handles the ordering above)
    for (const mod of generated.modules) {
      for (const lesson of mod.lessons) {
        const match = generated.concepts.find((c) => c.label.toLowerCase() === lesson.title.toLowerCase());
        if (!match) continue;
        const nodeId = nodeIdByKey.get(match.concept_key);
        const { data: lessonRow } = await supabase
          .from('lessons')
          .select('id')
          .eq('course_id', course.id)
          .eq('title', lesson.title)
          .maybeSingle();
        if (nodeId && lessonRow) {
          await supabase.from('knowledge_nodes').update({ lesson_id: lessonRow.id }).eq('id', nodeId);
        }
      }
    }

    // Knowledge graph edges
    for (const edge of generated.concept_edges) {
      const source = nodeIdByKey.get(edge.from);
      const target = nodeIdByKey.get(edge.to);
      if (!source || !target) continue;
      await supabase.from('knowledge_edges').insert({
        course_id: course.id,
        source_node_id: source,
        target_node_id: target,
        relationship: edge.relationship,
      });
    }

    // v1 snapshot for version history
    await supabase.from('course_versions').insert({
      course_id: course.id,
      version_number: 1,
      commit_message: `Generated from ${sourceType}: ${sourceRef}`,
      author_id: user.id,
      snapshot: {
        modules: generated.modules.map((m) => ({
          title: m.title,
          summary: m.summary,
          lessons: m.lessons.map((l) => ({ title: l.title, content_md: l.content_md, est_minutes: l.est_minutes })),
        })),
      },
    });

    if (job) {
      await supabase
        .from('ingestion_jobs')
        .update({ status: 'complete', course_id: course.id, completed_at: new Date().toISOString() })
        .eq('id', job.id);
    }

    return NextResponse.json({ slug: course.slug, courseId: course.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Course generation failed.';
    if (job) {
      await supabase.from('ingestion_jobs').update({ status: 'error', error_message: message }).eq('id', job.id);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
