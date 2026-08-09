# StoryTree

One tree. One climber. Everything anyone posts makes him climb higher — and
every fifty posts, you get to look back at how far you've all come.

StoryTree is a single shared tree that everybody grows together, and a figure
climbing it forever. Nobody directs him. There are no choices to make and
nothing to win. The tree grows because people leave things on it: post a photo
or a note, and the tree puts out a new branch and gets taller. Your post hangs
on that branch for whoever comes next to find and open.

Every **50 posts**, the climb pauses. Everything people have left since the last
milestone scatters across the screen at once — a look back at how far he has
come and who got him there. Every **100 posts**, the tree changes colour, so the
whole thing visibly ages as it fills.

No signup, no accounts, no feed. One link, and it belongs to everyone who has
touched it.

## How it works

**Everything derives from one number: the total post count.** The tree's height,
the position of every branch, how far the climber has got, the colour phase, and
when a milestone fires are all computed from that single value rather than
stored. One table of posts, one rendering function — no graph to traverse and no
state to keep in sync.

The tree itself is drawn procedurally in SVG, so it grows infinitely without
seams or repeating tiles. Generated art supplies the climber, the leaf clusters,
and the skies — the characterful parts — while the geometry stays in code.

## Stack

TypeScript · Next.js 16 (App Router) · Tailwind v4 · Supabase (Postgres +
Storage) · Anthropic API · Reve · Vercel

## Running it

Requires a `.env.local` with Supabase and Anthropic credentials — not in the
repo. Without it, nothing runs.

```bash
npm install
npm run dev
```

Create the schema by running `supabase/tree.sql` in the Supabase SQL editor,
then seed the tree:

```bash
npm run seed-tree -- 47      # also creates the photo storage bucket
```

47 is deliberate: the next post triggers the 50-post milestone, which is the
thing worth demoing.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run seed-tree -- 47` | Fill the tree to 47 posts; creates the storage bucket |
| `npm run seed-tree -- 47 --reset` | Wipe and refill |
| `npm run hide -- node <id>` | Kill switch — removes something from every read path |
| `npm run typecheck` | `tsc --noEmit` |

## Layout

```
lib/tree/        geometry and palette — pure, deterministic, no IO
lib/db/posts.ts  the one table
components/tree/ the SVG tree, climber, composer, milestone reel
app/api/post/    posting: text and photo
content/         reader-facing copy (partner-owned)
public/tree/     climber, leaf and sky art (partner-owned)
```

## A note on what else is in here

StoryTree began as a branching choose-your-own-adventure story set in a
lost-property building, where photographing an object wrote it permanently into
the narrative. That version is still present and still works at `/n/[id]`. It is
kept deliberately as a fallback, not left behind by accident.
