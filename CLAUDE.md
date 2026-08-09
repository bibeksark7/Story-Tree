@AGENTS.md

# StoryTree

One shared tree, and a figure climbing it forever. Nobody directs him — the
tree grows because people post. A photo or a note adds a branch and makes the
tree taller, and the post hangs on that branch for the next person to open.
Every 50 posts a milestone shows everything left since the last one; every 100
the tree changes colour.

One public URL, no signup, no accounts.

## Two people work in this repo. Stay in your lane.

**Before doing anything, work out which half you are on.**

| Art and copy | Code |
|---|---|
| `public/tree/*.png` | `lib/`, `app/`, `components/`, `scripts/`, `supabase/` |
| `content/tree-copy.md` | all config and package files |

**If the task is art, illustrations, Reve prompts, or the words a visitor
reads: read `PARTNER-BRIEF.md` and follow it. Do not edit code, even to fix an
obvious bug — report it instead.**

**If the task is code: never edit `public/tree/` or `content/tree-copy.md`.**
Those belong to the other person and are being edited right now.

## The previous version still lives here

StoryTree began as a branching choose-your-own-adventure story set in a
lost-property building. That pivoted. The old code is intentionally still
present and still works at `/n/[id]` as a fallback demo.

**Do not delete, tidy, or update any of it:** `WORLD.md`, `content/trunk.md`,
`content/illustration-prompts.md`, `public/brand/`, `lib/ai/narrate.ts`,
`lib/ai/prompts.ts`, `lib/canon.ts`, `lib/db/nodes.ts`, `app/n/`,
`app/api/generate/`, `app/api/contribute/`, `scripts/seed.ts`,
`scripts/populate.ts`, `scripts/probe.ts`.

It looks like dead code. It is insurance.

**`WORLD.md` in particular: do not add headers, notes, or markers to it.** Its
entire contents are compiled into the old narrator's system prompt verbatim, so
anything written there is read by the model as instructions. The other stale
files carry "previous version" markers; `WORLD.md` deliberately does not.

## How the tree works

Everything derives from one number: the total post count.

- `lib/tree/geometry.ts` — tree height, every branch position, the climber's
  position, milestones, colour phase. Pure functions, deterministic, no IO.
- `lib/tree/palette.ts` — the four colour phases, cycling.
- `lib/db/posts.ts` — one table. `idx` is gap-free; concurrent posts race on a
  unique index and retry, same 23505 pattern the old story tree used.
- `components/tree/` — the SVG tree, the climber, the composer, the milestone.

The tree is drawn procedurally in code, not assembled from image tiles. Reve
art supplies the climber, the leaves, and the skies only.

## Environment

`.env.local` holds Supabase and Anthropic credentials and is gitignored. It is
not in the repo and cannot be reconstructed from it.

**Anyone without those credentials cannot run this project.** `npm run dev`,
`npm run build`, and every `npm run` script will fail. That is expected, not a
bug to debug. Do not install packages to try to fix it.

## Conventions

- Model configuration lives only in `lib/ai/client.ts`, overridable by env.
- Every read path filters `is_hidden`, so `npm run hide` works as a kill switch.
- Guards run before any model call, so a rejected request costs no tokens.
- Next.js 16: `params` is a Promise, and the error boundary prop is `retry`,
  not `reset`. Check `node_modules/next/dist/docs/` before trusting recall.
