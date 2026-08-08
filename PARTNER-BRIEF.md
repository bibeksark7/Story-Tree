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

## Deliverable 2 — 25 illustrations

The app picks an illustration by crossing a **colour** with a **mood**, both
chosen by the AI when it looks at a photograph. Every combination needs an
image, so the grid is 5 x 5 = 25.

Colours: `amber`, `crimson`, `verdigris`, `indigo`, `bone`
Moods: `dormant`, `restless`, `tender`, `ominous`, `absurd`

Filenames must be **exactly** `public/brand/{colour}-{mood}.png`, lowercase:

```
amber-dormant.png    crimson-dormant.png    verdigris-dormant.png    indigo-dormant.png    bone-dormant.png
amber-restless.png   crimson-restless.png   verdigris-restless.png   indigo-restless.png   bone-restless.png
amber-tender.png     crimson-tender.png     verdigris-tender.png     indigo-tender.png     bone-tender.png
amber-ominous.png    crimson-ominous.png    verdigris-ominous.png    indigo-ominous.png    bone-ominous.png
amber-absurd.png     crimson-absurd.png     verdigris-absurd.png     indigo-absurd.png     bone-absurd.png
```

A typo is a broken image in front of judges. Placeholder files with the correct
names are already committed — replace them, do not rename them.

**Claude cannot generate these images.** It can, and should, write the 25 Reve
prompts: one per cell, consistent in style across the whole grid, with the
colour and mood expressed visually, grounded in whatever `WORLD.md` ends up
saying. Write `WORLD.md` first so the prompts inherit its atmosphere.

If time runs short, prioritise by colour: five strong images (one per colour,
any mood) is a usable fallback the code can be reduced to. Twenty-five mediocre
ones is worse than five good ones.

## Deliverable 3 — `content/trunk.md`

The first few passages of the story, written by hand rather than generated, so
the opening is reliably good. A visitor who never photographs anything just
reads deeper into this.

Follow the format notes in that file. Match the voice defined in `WORLD.md`
exactly — this is what the AI imitates for everything downstream.

---

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
