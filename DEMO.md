# Stage runbook

Everything you need while standing in front of judges, on one page.

> **Verified in production; not yet rehearsed on a phone.** Posting, photo
> upload, captioning, the milestone, and the kill switch have all been tested
> live. What has not been tested is a real phone on cellular — do that pass
> before you present.

## Before you start

**Seed the tree to 47 posts.**

```bash
npm run seed-tree -- 47
```

This is the single most important line in this file. A judge's own post then
triggers the 50-post milestone **in front of them**. On an empty tree the best
feature in the product never fires and nobody ever learns it exists.

Check the header reads `47 posts · Morning` and `3 to the next milestone`.

## The demo, in 60 seconds

1. **Hand them your phone**, already open at the live URL. Don't explain — a
   tree with a small figure near the top explains itself.
2. Let them **scroll down**. That's walking back through everything other people
   have left. Tapping any branch opens that post.
3. **Ask them to leave something.** A note in the box, or the camera button for
   a photo. Anything on the table works.
4. The tree grows a branch and the climber goes higher. Theirs is on it.
5. **Two posts later, the milestone fires.** Everything since the last one
   scatters across the screen. That is the moment — let it play, don't talk
   over it.

The line that lands: **nobody is in charge of this. He only climbs because
people leave things behind.**

## If something goes wrong

| What you see | What to do |
| --- | --- |
| Ugly post on the tree | `npm run hide -- post <id>` removes it from every read path, instantly, no deploy |
| Milestone doesn't fire | Check the count — it fires on exact multiples of 50 |
| Photo upload fails | Post a text note instead; the loop is identical |
| Tree renders slowly | Expected past a few hundred posts. Reseed lower: `npm run seed-tree -- 47 --reset` |
| Everything is on fire | The previous version still works at `/n/[id]` — a complete, rehearsed branching-story demo. Use it |

That last row is why the old code is still in the repo. Do not delete it.

## What to say about the tech

- **Everything derives from one number.** Tree height, every branch position,
  the climber, the colour phase, the milestones — all computed from the post
  count. One table, no graph, nothing to keep in sync.
- **The tree is drawn in code, not assembled from tiles**, so it grows
  infinitely with no seams. Generated art does the climber, leaves and skies —
  the characterful parts.
- **Concurrent posts can't collide.** Two people posting at the same instant
  race on a unique index and the loser retries, so nobody loses their spot.
- **We never store who anyone is.** Rate limiting works off a salted hash of
  the IP, not the address.

## Before you leave the house

- [ ] Run the full flow on **your own phone, on cellular** — not venue wifi
- [ ] Seed to 47 and confirm the milestone fires on the third post
- [ ] Check all ten art files are real, not placeholders
- [ ] Have `/n/[id]` open in a second tab as the fallback
- [ ] Charge the phone

## Operator commands

```bash
npm run seed-tree -- 47           # fill the tree; creates the storage bucket
npm run seed-tree -- 47 --reset   # wipe and refill
npm run hide -- post <id>         # kill switch (--unhide reverses it)
npm run typecheck                 # tsc --noEmit
```
