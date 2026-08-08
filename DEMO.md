# Stage runbook

Everything you need while standing in front of judges, on one page.

## The demo, in 60 seconds

1. **Hand them your phone**, already open at the live URL. Do not explain first —
   let them read one passage. It should be obvious what to do.
2. Let them **tap a choice**. If it is unwritten they will watch the ledger
   write itself for about seven seconds. That wait is part of the demo, not an
   apology — say "it's writing that part now, nobody has been down there."
3. A few taps in, **"Leave something here"** appears. Ask them to photograph
   anything on the table.
4. About seven seconds later they are reading a passage **with their object in
   it**, at a URL that will still work tomorrow.
5. Close with the leak: *"and someone else will find it, half-buried, in a part
   of the story you'll never see."*

The one line that lands: **no signup, no blank page, no instructions.**

## Fallback node

If canon resolution misbehaves and `/` sends you somewhere bad, go straight to:

```
/n/960f18f6-0772-4cc1-a263-9bfb7dad7208
```

Depth 2, both choices already written, contribute affordance showing — so it
demos with zero waiting. **Have this open in a second tab before you start.**

## If something goes wrong

| What you see | What to do |
| --- | --- |
| Ugly or broken passage in the tree | `npm run hide -- node <id>` — gone from every read path instantly, no deploy |
| Bad object leaking everywhere | `npm run hide -- object <id>` |
| Generation feels too slow on venue wifi | Set `PROSE_GUARD=off` in Vercel — saves ~1s per generation |
| Leaks are confusing the story | Set `LEAK_CHANCE=0` in Vercel |
| Camera does nothing on their phone | It degrades to a photo picker. Ask them to choose an existing photo instead — the rest of the flow is identical |
| Everything is on fire | Show the fallback node and talk through the photo path instead of running it |

Neither env change needs a code deploy. Change the value in Vercel, redeploy
from the dashboard, done in under a minute.

## Numbers worth knowing

- **Photo → new branch: about 7 seconds** warm.
- **Tap → new passage: about 7.6 seconds** warm, including the safety screen.
- Coherence audit over 40 generated passages: every one landed in the 70–90
  word target, and none used any of the world bible's banned vocabulary.
- Photographs are **never stored** — read once by the model, then discarded.
  Nothing is written to disk or to Storage. Say this out loud; judges ask.

## Before you leave the house

- [ ] Run the full flow on **your own phone, on cellular** — not venue wifi
- [ ] Run it once on an **iPhone** and once on an **Android**
- [ ] Confirm all 10 illustrations are real, not placeholders
- [ ] Open the fallback node in a second tab
- [ ] Charge the phone

## Operator commands

```bash
npm run seed -- --reset      # rebuild the trunk from content/trunk.md (deletes everything)
npm run populate -- 40       # grow the tree to ~40 nodes
npm run hide -- node <id>    # kill switch (add --unhide to reverse)
npm run probe -- photo.jpg   # time the whole photo -> passage chain
```
