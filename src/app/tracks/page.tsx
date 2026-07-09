import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TRACKS = [
  {
    slug: 'software-engineering',
    label: 'Software Engineering',
    status: 'live' as const,
    desc: 'Data structures & algorithms, systems design, languages, and frameworks — generated from docs, papers, and open courseware.',
  },
  {
    slug: 'upsc',
    label: 'UPSC Aspirants',
    status: 'next' as const,
    desc: 'Polity, economy, history, geography, and current affairs, structured as a prerequisite graph across the syllabus.',
  },
  {
    slug: 'iit-jee',
    label: 'IIT-JEE Aspirants',
    status: 'planned' as const,
    desc: 'Physics, chemistry, and mathematics at JEE depth, with problem-set-driven mastery tracking.',
  },
  {
    slug: 'neet',
    label: 'NEET Aspirants',
    status: 'planned' as const,
    desc: 'Biology, chemistry, and physics for medical entrance prep, grounded in NCERT and reference material.',
  },
];

export default function TracksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mx-auto max-w-4xl w-full px-5 py-14 flex-1">
        <h1 className="font-display text-3xl text-ink mb-2">Tracks</h1>
        <p className="text-ink-faint mb-10 max-w-lg">
          Cortex deepens one learner group&apos;s graph at a time instead of spreading thin across
          every subject at once.
        </p>

        <div className="space-y-4">
          {TRACKS.map((t) => (
            <Card key={t.slug} className="p-6 flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge tone={t.status === 'live' ? 'moss' : t.status === 'next' ? 'gold' : 'neutral'}>
                    {t.status}
                  </Badge>
                </div>
                <h2 className="font-display text-xl text-ink mb-1.5">{t.label}</h2>
                <p className="text-sm text-ink-faint leading-relaxed max-w-md">{t.desc}</p>
              </div>
              {t.status === 'live' && (
                <Link
                  href={`/explore?track=${t.slug}`}
                  className="shrink-0 text-sm text-moss-600 hover:underline whitespace-nowrap"
                >
                  Browse courses →
                </Link>
              )}
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
