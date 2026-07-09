import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { createClient } from '@/lib/supabase/server';
import { GenerateForm } from '@/components/course/generate-form';

export default async function NewCoursePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/courses/new');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mx-auto max-w-2xl w-full px-5 py-14 flex-1">
        <h1 className="font-display text-3xl text-ink mb-2">Generate a course</h1>
        <p className="text-ink-faint mb-8">
          Point Cortex at a source and it will draft modules, lessons, and a knowledge graph —
          grounded in what you gave it. You can edit everything after.
        </p>
        <GenerateForm />
      </div>
    </div>
  );
}
