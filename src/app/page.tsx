import Link from 'next/link';
import {
  GitFork,
  Network,
  MessagesSquare,
  History,
  Sparkles,
  ArrowRight,
  FileText,
  Link2,
  Github,
  BookOpenCheck,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { KnowledgeGraphHero } from '@/components/graph/knowledge-graph-hero';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper relative overflow-hidden">
      <Navbar />

      {/* Ambient background glows */}
      <div className="absolute top-[10%] left-[5%] w-[450px] h-[450px] bg-gradient-to-tr from-moss-200/20 to-emerald-300/10 rounded-full filter blur-[100px] pointer-events-none -z-10 animate-pulse duration-3000" />
      <div className="absolute top-[35%] right-[5%] w-[500px] h-[500px] bg-gradient-to-br from-violet-200/20 to-rose-200/10 rounded-full filter blur-[120px] pointer-events-none -z-10" />

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center relative">
        <div className="animate-fadeUp">
          <Badge tone="moss" className="mb-5 border-moss-200 bg-moss-50/50 text-moss-700 shadow-sm">
            <Sparkles className="w-3 h-3 text-moss-500 animate-spin" /> now generating from PDFs, URLs & repos
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.08] text-ink font-semibold tracking-tight">
            Courses aren&apos;t files.
            <br />
            They&apos;re <span className="italic text-gradient-primary">views</span> of a
            living graph.
          </h1>
          <p className="mt-5 text-lg text-ink-soft leading-relaxed max-w-md">
            Cortex turns any source — a PDF, a URL, a repo — into a structured course grounded
            in a shared knowledge graph. Fork it, improve it, and let a tutor teach it that
            never strays from the source.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/courses/new" className={buttonVariants('primary', 'lg', 'bg-gradient-to-r from-moss-600 via-emerald-600 to-violet-600 border-0 hover:from-moss-700 hover:to-violet-700 text-white shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all')}>
              Generate a course <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/explore" className={buttonVariants('outline', 'lg', 'hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50/30 hover:scale-[1.02] active:scale-[0.98] transition-all')}>
              Explore the graph
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-5 text-xs font-mono text-ink-faint">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-moss-500" />free to learn</span>
            <span className="w-1 h-1 rounded-full bg-border-strong" />
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-violet-500" />free to publish</span>
            <span className="w-1 h-1 rounded-full bg-border-strong" />
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gold-500" />fork anything public</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-to-br from-moss-300/10 via-violet-300/15 to-gold-300/10 rounded-[2.5rem] filter blur-2xl -z-10 animate-pulse duration-5000" />
          <Card className="p-6 border-border-strong glass-card shadow-glow">
            <KnowledgeGraphHero className="w-full h-auto" />
          </Card>
        </div>
      </section>

      {/* PIPELINE */}
      <section className="border-y border-border bg-paper-dim/40">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-2xl text-ink mb-1">From source to syllabus</h2>
          <p className="text-ink-faint mb-10 text-sm">
            The same pipeline runs whether you&apos;re authoring from scratch or forking someone
            else&apos;s course.
          </p>

          <div className="grid md:grid-cols-5 gap-4">
            {[
              { n: '01', icon: FileText, title: 'Ingest', body: 'Drop in a PDF, a URL, docs, or a repo README.' },
              { n: '02', icon: Network, title: 'Graph', body: 'The AI extracts concepts and prerequisite edges.' },
              { n: '03', icon: Sparkles, title: 'Generate', body: 'Modules and lessons are drafted, grounded in source.' },
              { n: '04', icon: GitFork, title: 'Fork', body: 'Anyone can branch it, edit it, and publish their version.' },
              { n: '05', icon: BookOpenCheck, title: 'Learn', body: 'A grounded tutor and adaptive path guide the learner.' },
            ].map((step, i) => (
              <div key={step.n} className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs text-moss-600">{step.n}</span>
                  <div className="h-px flex-1 bg-border-strong" />
                </div>
                <step.icon className="w-5 h-5 text-moss-600 mb-3" strokeWidth={1.6} />
                <h3 className="font-display text-base text-ink mb-1">{step.title}</h3>
                <p className="text-sm text-ink-faint leading-snug">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES AS "COMMIT CARDS" */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-display text-2xl text-ink mb-10">Built like a repo, taught like a tutor</h2>
        <div className="grid md:grid-cols-3 gap-5">
          <FeatureCard
            icon={GitFork}
            tone="moss"
            title="Forkable courses"
            body="Every course carries full version history. Disagree with an explanation? Fork it, fix it, and the fork network shows the lineage."
          />
          <FeatureCard
            icon={Network}
            tone="violet"
            title="One shared knowledge graph"
            body="Courses are generated views over concepts and prerequisites — not disconnected PDFs. The graph is the asset; courses are just how you read it."
          />
          <FeatureCard
            icon={MessagesSquare}
            tone="gold"
            title="Grounded AI tutors"
            body="Ask questions inside any course. The tutor answers strictly from that course's lessons and tells you plainly when something's outside them."
          />
          <FeatureCard
            icon={History}
            tone="moss"
            title="Full version history"
            body="Every edit is a commit with a message and an author. Roll back, diff, or branch at any point in a course's history."
          />
          <FeatureCard
            icon={Link2}
            tone="violet"
            title="Ingest from anywhere"
            body="Paste a URL, upload a PDF, or point at a repo. The ingestion layer normalizes it into structured, citable source text."
          />
          <FeatureCard
            icon={Github}
            tone="gold"
            title="Community quality scoring"
            body="Ratings and reviews surface the courses worth learning from — and the forks that actually improved on the original."
          />
        </div>
      </section>

      {/* TRACKS */}
      <section className="border-t border-border bg-paper-dim/40">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="font-display text-2xl text-ink mb-1">Built for one learner group at a time</h2>
          <p className="text-ink-faint mb-10 text-sm">
            We&apos;re rolling out track by track, deepening the graph before we widen it.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <TrackCard label="Software Engineers" status="live" desc="DS&A, systems design, languages, frameworks." />
            <TrackCard label="UPSC Aspirants" status="next" desc="Polity, economy, history, current affairs." />
            <TrackCard label="IIT-JEE Aspirants" status="planned" desc="Physics, chemistry, mathematics." />
            <TrackCard label="NEET Aspirants" status="planned" desc="Biology, chemistry, physics." />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-5 py-24 text-center">
        <h2 className="font-display text-3xl text-ink max-w-lg mx-auto leading-tight">
          Start a course. Someone will fork it, improve it, and hand it back better.
        </h2>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup" className={buttonVariants('primary', 'lg')}>
            Create your free account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  tone,
  title,
  body,
}: {
  icon: React.ElementType;
  tone: 'moss' | 'violet' | 'gold';
  title: string;
  body: string;
}) {
  const toneBg: Record<string, string> = {
    moss: 'bg-moss-50 text-moss-600',
    violet: 'bg-violet-50 text-violet-600',
    gold: 'bg-gold-300/20 text-gold-700',
  };
  return (
    <Card className="p-6">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${toneBg[tone]}`}>
        <Icon className="w-4.5 h-4.5" strokeWidth={1.7} />
      </div>
      <h3 className="font-display text-base text-ink mb-1.5">{title}</h3>
      <p className="text-sm text-ink-faint leading-relaxed">{body}</p>
    </Card>
  );
}

function TrackCard({
  label,
  status,
  desc,
}: {
  label: string;
  status: 'live' | 'next' | 'planned';
  desc: string;
}) {
  const statusTone = status === 'live' ? 'moss' : status === 'next' ? 'gold' : 'neutral';
  return (
    <Card className="p-5">
      <Badge tone={statusTone as 'moss' | 'gold' | 'neutral'} className="mb-3">
        {status}
      </Badge>
      <h3 className="font-display text-base text-ink mb-1">{label}</h3>
      <p className="text-sm text-ink-faint leading-snug">{desc}</p>
    </Card>
  );
}
