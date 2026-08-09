# Partner Brief — read this first

**The project changed direction. If you worked on the previous version, most of
what you know is out of date. Read this whole file before doing anything.**

## What StoryTree is now

One shared tree, and a figure climbing it forever.

Nobody directs him. There are no choices to make and nothing to win. The tree
grows because people leave things on it — post a photo or a note, and the tree
puts out a new branch and gets taller. Your post hangs on that branch for
whoever comes next to open.

Every **50 posts**, the climb pauses: everything left since the last milestone
scatters across the screen at once, a look back at how far he has come and who
got him there. Every **100 posts**, the tree changes colour, so it visibly ages
as it fills.

One link, no signup, no accounts, no feed.

## What changed from the old version

The previous version was a branching choose-your-own-adventure story set in a
lost-property building. **That is gone as the main product.** It still exists in
the repo as a working fallback at `/n/[id]`, and it must keep working.

| Still true | No longer true |
|---|---|
| One public URL, no signup | The branching story is the product |
| Anyone can contribute from their phone | `WORLD.md` drives what visitors read |
| Photos become part of a shared artifact | The 10 `public/brand/` illustrations are used |
| Your art and words carry the experience | Readers choose what happens next |

**`WORLD.md`, `content/trunk.md`, `content/illustration-prompts.md`, and
`public/brand/` all belong to the old version.** Leave them alone. Do not
delete them and do not update them — they keep the fallback demo alive.

---

## Your lane — the only files you may change

| File | What it is |
|---|---|
| `public/tree/*.png` | The climber, the leaves, the skies. See spec below. |
| `content/tree-copy.md` | Every word a visitor reads. |

## Files you must never touch

`lib/`, `app/`, `components/`, `scripts/`, `supabase/`, `package.json`,
`package-lock.json`, `next.config.ts`, `tsconfig.json`, `.gitignore`,
`eslint.config.mjs`, and everything listed above as belonging to the old
version.

Your teammate is actively editing those. Changing them causes merge conflicts
that cost hours. If something in the code looks wrong, **say so — do not fix
it.**

## Do not run the app

`npm run dev`, `npm run build`, and every `npm run` script need API keys and
database credentials that are deliberately not in this repo. They will fail.
That is expected and is **not** a problem to debug. Do not install packages and
do not run `npm install`.

---

## Deliverable 1 — the climber (most important)

One character, side-on, mid-climb, reaching upward. He is the whole emotional
core of the product: people post so that *he* gets higher.

**He is currently a stick figure your teammate drew in code.** Anything you make
is an improvement.

Requirements:

- **Transparent PNG.** No background — he is composited onto the tree.
- **He must read clearly at about 80 pixels tall.** That is his real size on a
  phone. Zoom out to 80px and check the silhouette still says "person climbing"
  before you accept an image.
- Facing right. The code mirrors him automatically when he climbs the other side.
- Roughly 400×500px source, taller than wide.

**Four versions, one per colour phase**, since the tree ages around him:

```
public/tree/climber-0.png    Morning     bright, cool daylight
public/tree/climber-1.png    Afternoon   warm, golden
public/tree/climber-2.png    Dusk        pink and violet light
public/tree/climber-3.png    Night       cool blue, low light
```

Same character every time. Only the lighting changes.

## Deliverable 2 — leaf clusters

The foliage on each branch. Currently plain green circles in code.

```
public/tree/leaf-0.png
public/tree/leaf-1.png
public/tree/leaf-2.png
```

Transparent PNG, roughly 300×300px, three genuinely different shapes so
branches do not all look identical. **Neutral green** — the code tints them per
phase, so do not bake in autumn or night colours.

## Deliverable 3 — skies (optional, do last)

Backgrounds for each phase. There are gradients in code already and they look
fine, so this is upside, not a requirement.

```
public/tree/sky-0.png  …  sky-3.png
```

Wide and short (roughly 1600×900), no transparency needed.

## Deliverable 4 — the words

Everything a visitor reads lives in `content/tree-copy.md`. Open it; it has the
current placeholder text and explains what each piece is for. The milestone
message is the one that matters most — it is what people see at the payoff
moment.

---

## Style

**Cartoon, not photographic.** The previous version's art was sepia and
realistic; this is the opposite. Think picture book or comic: flat colour,
clean shapes, confident outlines, readable at small sizes.

Pick one style and hold it across all ten images. **Ten images that look like
one set beat three beautiful ones that do not match.** Write the style anchor
into every Reve prompt.

---

## How your work gets used

Drop the PNGs into `public/tree/` with the exact filenames above and push.
Your teammate wires them in — that part is code and it is his job. Until he
does, the placeholder shapes stay on screen. That is expected; it does not mean
your files are broken.

Filenames must match **exactly**: lowercase, no spaces, no `(1)` suffix.
Windows silently appends ` (1)` to a second download with the same name, and
`climber-0 (1).png` will simply never load.

## Committing

Small commits, often. Push as soon as anything is finished — nobody can see
your work until it is on GitHub.

```
git add public/tree content/tree-copy.md
git commit -m "Climber art, morning and afternoon phases"
git push
```

If `git push` is rejected, someone pushed first: run `git pull`, then push
again. You should never hit a conflict, because nobody else edits your files.

## If you are Claude, working on this

Run this loop. Give one action at a time and wait, rather than dumping the plan.

1. **Open by reporting status.** `git status --short public/tree/` and
   `ls public/tree/` tell you which assets exist. Say how many of the ten are
   done and name the next one. Never make them work it out.
2. **Hand over one Reve prompt at a time**, written for the specific asset,
   carrying the shared style anchor so the set stays consistent.
3. **Verify each drop.** Check the filename is exactly right, the extension is
   really `.png`, and the file size actually changed. Windows filename
   mangling is the single most common failure here.
4. **Push back on style drift.** If one asset is lovely but does not match the
   other nine, say so. Consistency matters more than any single image.
5. **You cannot see their screen.** Reve's interface, Windows dialogs, and File
   Explorer are invisible to you. If they describe a UI problem, say plainly
   that you cannot see it rather than guessing at button names.
6. **Never edit code**, even if you spot a bug. Report it and let them relay it.
