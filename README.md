# Cortex — the community-maintained learning graph

An MVP of the "GitHub for Learning" concept: AI-generated courses, grounded in real
sources, structured as a knowledge graph, forkable and versioned like a repo, taught by
a tutor that won't stray from the material.

Built with **Next.js 14 (App Router) + Supabase (Postgres, Auth) + Groq (LLM inference)**.

---

## What's actually implemented

This is a working MVP core, not a padded demo. Everything below is real and functional
against a live Supabase project + Groq API key:

- **AI course generation** from a pasted URL, an uploaded PDF, or raw pasted text
  (`/courses/new` → `POST /api/generate`), using Groq's `llama-3.3-70b-versatile` to
  produce modules, lessons, and a concept graph in one structured JSON completion.
- **Knowledge graph** per course — concepts + prerequisite/related/extends edges,
  rendered as an interactive, pannable/zoomable SVG graph laid out left-to-right by
  prerequisite depth (`/courses/[slug]/graph`).
- **Forking** — clones a course's modules, lessons, and graph into a new course owned
  by the forker, with a visible fork network (`/courses/[slug]/versions`).
- **Version history** — every generation and every "commit" from the editor writes an
  immutable snapshot to `course_versions`.
- **Collaborative editing** — owners can edit modules/lessons and commit a new version
  (`/courses/[slug]/edit`).
- **Grounded AI tutor** — a streaming chat scoped to a single course's lesson content;
  it's instructed to say so when a question falls outside the material rather than
  guessing (`/courses/[slug]/tutor` → `POST /api/tutor`).
- **Community signals** — star/unstar, 1–5 star reviews with an auto-recalculated
  quality score, fork counts.
- **Adaptive-learning groundwork** — a `progress` table tracking per-lesson completion
  and a `quiz_attempts` table ready for a scoring engine (quiz generation itself is not
  built in this MVP — see "What's not built" below).
- **Auth** — Supabase email/password auth with a profile auto-created on signup.
- **4 tracks** modeled in the schema (`software-engineering` live, `upsc` / `iit-jee` /
  `neet` scaffolded) matching the phased rollout in the product vision.

### What's not built (be aware before you pitch this as "done")

- Adaptive path *sequencing* (choosing what to show next based on mastery) — the data
  model supports it, the algorithm doesn't exist yet.
- Auto-generated quizzes/mock tests.
- Repo ingestion (GitHub) — the schema has a `repo` source type; only PDF/URL/text are
  wired up.
- Payments/billing for the Pro/Enterprise tiers shown on `/pricing` — that page is
  presentational only.
- Real-time concurrent editing (the editor is last-write-wins, not operational
  transform/CRDT).
- Content moderation queue.

Treat this as the foundation to extend, not the finished product — a real "GitHub for
Learning" is a multi-quarter effort for a team.

---

## 1. Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the three services below
npm run dev                  # http://localhost:3000
```

### Supabase (auth + database)

1. Create a free project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the Project URL, `anon` key, and `service_role`
   key into `.env.local`.
3. Open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and
   run it. This creates every table, trigger, and Row Level Security policy the app
   needs.
4. (Optional) `supabase/seed.sql` has a commented example for seeding a demo course —
   read the instructions at the top of that file.

### Groq (AI generation + tutor)

1. Get a free API key at [console.groq.com/keys](https://console.groq.com/keys).
2. Put it in `.env.local` as `GROQ_API_KEY`. The default model
   (`llama-3.3-70b-versatile`) is fast and free-tier friendly; swap `GROQ_MODEL` for
   any other Groq-hosted model if you want.

---

## 2. Deploying live (Vercel — free tier works)

1. Push this project to a new GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. In the Vercel project's **Environment Variables**, add the same five variables from
   `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, `GROQ_MODEL`).
4. Deploy. Vercel auto-detects Next.js — no build config needed.
5. Back in Supabase, go to **Authentication → URL Configuration** and add your Vercel
   domain (e.g. `https://your-app.vercel.app`) to the Site URL and Redirect URLs, or
   email confirmation links will point at `localhost`.

That's the whole path to a public URL. Total cost to run at small scale: **$0** (Vercel
Hobby + Supabase Free + Groq's free tier all have generous limits).

---

## 3. Project structure

```
src/
  app/                    Next.js App Router pages + API routes
    api/                  generate, tutor (streaming), fork, versions, content,
                           reviews, stars, progress
    courses/[slug]/       course detail, graph, tutor, versions, edit, learn/[lessonId]
    courses/new/          generation flow
    explore/ tracks/ dashboard/  discovery + learner home
    login/ signup/ auth/  Supabase email/password auth
  components/
    ui/                   design-system primitives (button, card, badge, input…)
    graph/                knowledge graph layout + interactive + decorative hero SVG
    course/                course card, generate form, editor, fork/star buttons
    tutor/                 streaming chat UI
    layout/                navbar, footer
  lib/
    supabase/              browser/server/middleware Supabase clients
    ai/                    Groq client, course generator, source extraction, tutor
    data/                  server-side query helpers
  types/database.ts        hand-written types mirroring the schema
supabase/
  schema.sql                full Postgres schema + RLS policies
  seed.sql                  optional demo data
```

## 4. Design system

Paper-white background, ink-navy text, a moss-green primary accent, and a violet
secondary used specifically for graph edges — the palette is meant to read as
"annotated field notes," not another SaaS gradient. Headings use Fraunces (serif),
body text uses Inter, and anything structural (version numbers, stats, graph labels)
uses JetBrains Mono, echoing the git/commit metaphor the product is built on. All of
this lives in `tailwind.config.ts` and `src/app/globals.css` — change the CSS variables
there to re-theme the whole app.

## 5. Regenerating types

`src/types/database.ts` is hand-written to keep this MVP dependency-light. Once your
schema stabilizes, swap it for real generated types:

```bash
npx supabase gen types typescript --project-id <your-project-ref> > src/types/database.ts
```

---

## License

MIT — see `LICENSE`.
