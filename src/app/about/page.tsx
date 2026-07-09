import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mx-auto max-w-2xl w-full px-5 py-16 flex-1 prose-cortex">
        <h1>About Cortex</h1>
        <p>
          Most learning platforms treat a course as the finished product — a sealed file someone
          authored once and everyone else consumes. Cortex treats the <em>knowledge graph</em> as
          the product, and a course as one generated view over it.
        </p>
        <p>
          That means every course can be forked the way code is forked: someone disagrees with an
          explanation, branches the course, fixes it, and either merges their improvement back or
          maintains their own version. Over time the graph gets denser, better cited, and more
          battle-tested than any single author could produce alone.
        </p>
        <h2>Why start with software engineers</h2>
        <p>
          Software engineers already think in forks, commits, and pull requests, so the mental
          model needs no translation. It&apos;s also a domain with abundant, high-quality open
          source material to ground courses in. We&apos;ll deepen the graph here before expanding
          to UPSC, IIT-JEE, and NEET prep.
        </p>
        <h2>How grounding works</h2>
        <p>
          Every AI-generated lesson is produced from source material you provide — a PDF, a URL,
          or your own notes — and the tutor answers only from a course&apos;s lessons. When a
          question falls outside what&apos;s been taught, it says so instead of guessing.
        </p>
      </div>
      <Footer />
    </div>
  );
}
