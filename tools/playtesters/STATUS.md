# Stage QA status

The QA team (bot playtesters) keeps this list. The coding team fixes; QA tests, reports and retests.

**Signed off** (Matt, 2026-10-25) when:
- every confirmed bug on the stage is fixed and has passed a QA retest;
- at least two of the four persona bots (Jen, Sally, Steph, Brycen) finish it;
- it plays upright and sideways.

Unchecked leads don't block a sign-off. A signed-off stage is not tested again.

**How work moves**
- The coding team promotes a fix or a new stage: it rebuilds Matt's test link, pushes `ccr-0d59a91c-oy3imz`, and sends QA a promotion note with a retest list.
- QA builds from the pushed branch, retests every item, and replies pass or fail on each, plus anything new.
- A bug closes only after its retest passes.

Batch reports: batch 1, https://claude.ai/artifact/4tVn4iZZC4gFANqqYhC4vi · batch 2, https://claude.ai/artifact/7SCS8XYyzzEid6uq4bT9CR

## Stages

| Stage | Status | Open confirmed bugs | Bots finished | Last batch |
|---|---|---|---|---|
| 1-1 | testing | card timing | 0/1 | 2 |
| 1-2 | testing | card timing | 0/1 | 2 |
| 1-3 | testing | card timing, knockback | 0/1 | 2 |
| 1-4 | testing | card timing | 0/1 | 2 |
| 1-5 | testing | card timing, gap card wording | 0/1 | 2 |
| 1-6 | testing | card timing, liana release (confirmed by the coding team) | 0/1 | 2 |
| 1-7 | testing | card timing | 0/1 | 2 |
| 1-8 | testing | card timing | 0/1 | 2 |
| 2-3 | testing | card timing, "Free 3 animals freed", river logs 72 px real gap | 0/1 | 2 |
| 2-6 | testing | card timing | 0/1 | 2 |
| 2-7 | testing | none open (basket lift fixed: retest PASS, promotion 2) | 0/2 | 3 |
| 3-9 | testing | card timing, knockback | 0/1 | 2 |
| 4-1 | testing | none confirmed (26% stall unverified) | 0/1 | 3 |
| 4-2 | testing | none confirmed (wind stall at 27-29% is a lead) | 0/1 | 3 |
| 4-5 | testing | none confirmed (unseen hits, monkey fruit are leads) | 0/1 | 3 |
| 4-6 | ready to test | coding team's own list | - | - |
| 4-3 | testing | coding team's own list; surge retest not reached | 0/1 | 3 |
| 4-8 | testing | water wall PASS (one fall); boulders and nests inconclusive | 0/1 | 3 |
| 4-4, 4-7 | waiting on fixes | coding team's own list | - | - |
| 4-D Dot's Netting Flight | testing | flap taught too late; no checkpoints (Continue restarts at 0%) | 0/3 | 3 |
| 4-9 The Aerie | ready to test (promotion 2) | - | - | - |
| 4-10 | not promoted yet | - | - | - |

Card timing and knockback are game-wide; they're listed on the stages where a bot hit them.

**Withdrawn (batch 2):** "with a steering thumb down, the double jump never fires" was a test-rig bug, not a game bug. CDP's touchEnd lifts the points it is given, and the rig gave it the fingers still down. It's fixed in tools/qa (lifts name only the lifted finger), and `tools/qa/doublejump-check.cjs` now passes on the game. Two-thumb leads from batches 1 and 2 (running-jump stall, side flick as jump-kick, quick tap as mega punch, ring shelves unreachable) are to be rechecked on the fixed rig.
