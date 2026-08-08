# Partner Brief — read this first

You are helping the **art and copy** half of a two-person, 30-hour hackathon team
building *The Lost & Found*: one public URL holding a single endless branching
story. A stranger lands mid-story, reads a passage, taps a choice. A few screens
in, one choice is "leave something here" — they photograph an object in front of
them, and within seconds a new branch exists with that object written into it.

Your teammate owns **all** the code. You own **all** the words and pictures.
That split is deliberate: it means neither of you ever has to wait for the other,
and you never edit the same file.

---

## Your lane — the only files you may change

| File | What it is |
|---|---|
| `WORLD.md` | The world bible. Fed verbatim to the AI narrator. |
| `content/trunk.md` | The opening passages of the story, hand-written. |
| `public/brand/*.png` | 25 illustrations. |

## Files you must never touch

`lib/`, `app/`, `scripts/`, `supabase/`, `package.json`, `package-lock.json`,
`next.config.ts`, `tsconfig.json`, `.gitignore`, `eslint.config.mjs`.

Your teammate is actively editing those. Changing them causes merge conflicts
that cost hours you do not have. If something in the code looks wrong, say so —
do not fix it.

## Do not run the app

`npm run dev`, `npm run build`, and `npm run probe` all need API keys that are
deliberately not in this repo. They will fail. That is expected and is not a
problem to debug. There is nothing here you need to run.

Do not install packages. Do not run `npm install`.

---

## Deliverable 1 — `WORLD.md` (do this first)

**This file is not documentation. It is the prompt.** Every word is pasted
verbatim into the narrator's system instructions before it writes each passage.

Consequences:

- No notes to self, no TODOs, no "ask about this later", no meta-commentary
  about the build. The narrator will read it and try to obey it.
- Write it as instructions to a writer who has never seen the project.
- Concrete beats abstract. "Corridors give onto rooms that give onto corridors"
  steers the model. "It should feel mysterious" does not.

Cover these, roughly in this order:

1. **What this place is** — the premise, in a short paragraph.
2. **Rules of the world** — hard constraints. What is always true, what never
   happens. This is the highest-value section; be specific and be strict.
3. **Voice** — person, tense, sentence length, punctuation habits, register.
4. **Vocabulary to prefer** — a short list of concrete nouns.
5. **Vocabulary to avoid** — the clichés that would make it read as generic
   AI fantasy.

Aim for something in the range of the placeholder's length or a bit longer.
Length is not the goal; specificity is.

**One technical note:** the narrator's instructions are cached between requests,
which is what keeps the app fast. Editing `WORLD.md` is free and fine — just
know that each edit means the first request afterwards is slightly slower. Do
not let that discourage you from iterating.

## Deliverable 2 — 10 illustrations

The app picks an illustration by crossing a **colour** with a **mood**, both
chosen by the AI when it looks at a photograph.

The AI still classifies into all five moods, but the art grid collapses those
into **two buckets**, so the set is 5 colours x 2 = **10 images, not 25**. Ten
good illustrations beat twenty-five rushed ones, and a visitor tapping through
five nodes cannot tell the difference.

- `dormant`, `tender` → use the **dormant** image
- `restless`, `ominous`, `absurd` → use the **restless** image

Filenames must be **exactly** these ten, lowercase, in `public/brand/`:

```
amber-dormant.png    crimson-dormant.png    verdigris-dormant.png    indigo-dormant.png    bone-dormant.png
amber-restless.png   crimson-restless.png   verdigris-restless.png   indigo-restless.png   bone-restless.png
```

A typo is a broken image in front of judges. Placeholder files with these exact
names are already committed — replace them, do not rename them.

`content/illustration-prompts.md` still contains all 25 prompts. **Use only the
ten `-dormant` and `-restless` ones.** The other fifteen are not wasted — if
there is time at the end, the grid can be expanded back to the full 5 x 5 by
changing two lines of code.

**Claude cannot generate these images.** It wrote the prompts; Reve makes the
pictures.

If time runs short, do one image per colour (any of the two) — five is a usable
fallback the code can be reduced to.

## Deliverable 3 — `content/trunk.md`

The first few passages of the story, written by hand rather than generated, so
the opening is reliably good. A visitor who never photographs anything just
reads deeper into this.

Follow the format notes in that file. Match the voice defined in `WORLD.md`
exactly — this is what the AI imitates for everything downstream.

---

## Working with Claude during the art pass

If you are Claude and the user has just asked for help with the illustrations,
run this loop. Do not dump the whole plan on them at once — give them the next
single action, wait, then check the result.

**1. Report status first.** Every real image is a different file size from the
placeholder it replaced, so `git status` and `git diff --stat` tell you exactly
which of the ten are done:

```
git status --short public/brand/
```

Open by telling them how many of the ten are finished and naming the next one
to do. Never make them work that out themselves.

**2. Hand them one prompt at a time.** Read the matching block out of
`content/illustration-prompts.md` and print just that prompt, ready to copy.
Do not print all ten.

**3. Verify after each drop.** When they say an image is in, check it:

- Is the filename exactly right? Windows silently appends ` (1)` to a second
  download with the same name, and `amber-dormant (1).png` is a broken image on
  stage. `ls public/brand/` catches it instantly.
- Is it a `.png`? A `.jpg` or `.webp` renamed to `.png` still loads in a
  browser, so this one will not fail until it does.
- Did the file size actually change from the placeholder? If not, the drop did
  not take.

**4. Commit every few images**, not once at the end. See below.

**What you cannot help with:** you cannot see their screen. Reve's interface,
Windows dialogs, and File Explorer are invisible to you. If they describe a UI
problem, say plainly that you cannot see it rather than guessing at button
names.

**What you should push back on:** an image that does not match the style anchor
shared by all ten prompts. Consistency across the set matters more than any
single image being beautiful. If they say one came out great but different, it
is worth saying so.

## Committing your work

Small commits, often. Push as soon as anything is finished — your teammate
cannot see or test your writing until it is on GitHub.

```
git add WORLD.md
git commit -m "World bible: first real draft"
git push
```

If `git push` is rejected, someone else pushed first. Run `git pull`, then push
again. You should never see a conflict, because nobody else edits your files.

## When you are stuck on the words

Ask your teammate to run the probe on your latest `WORLD.md` — it prints the
actual passage the narrator writes from it. That is the only real feedback loop
on whether your voice survives contact with the model. Do it early, on a rough
draft, before you have written the whole thing in a style that turns out not to
work.
