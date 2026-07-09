import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { KnowledgeGraph } from '@/components/graph/knowledge-graph';
import { CourseSubnav } from '@/components/course/course-subnav';
import { getCourseBySlug, getKnowledgeGraph } from '@/lib/data/courses';

export default async function CourseGraphPage({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const { nodes, edges } = await getKnowledgeGraph(course.id);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mx-auto max-w-5xl w-full px-5 py-10 flex-1">
        <h1 className="font-display text-2xl text-ink mb-1">{course.title}</h1>
        <CourseSubnav slug={course.slug} active="graph" />

        <div className="mt-6">
          {nodes.length === 0 ? (
            <p className="text-ink-faint text-sm py-16 text-center">
              This course doesn&apos;t have a knowledge graph yet.
            </p>
          ) : (
            <KnowledgeGraph nodes={nodes} edges={edges} courseSlug={course.slug} />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
