# Known issues on gen2 1-1 (as of 2026-11-05 10:25 PM ET) — the red team does NOT re-report these unless it finds a deeper cause or a wrong fix

1. 8 of 16 rolls don't build clean: bounce teach walked round (pit/join steps inside a block's gap or at its lip), the corridor too tight for late rises, empty job x type cells (Round 6 partly fixes).
2. Double and bounce are never REQUIRED (pitSteps lays a step inside the gap; the block:'double' tags are held).
3. Quiet stretches 4.3-7.8 s on every roll (vs 4 s line): ~20 floor 'hop' stumps 36-42 px are walk-through (engine.ts:2260 walls only at 50 px); long rest floors; route.ts walks through walls under 96 px.
4. Flat code-drawn pieces next to painted art (platformPlan.ts:240 look reassignment); the swap to painted art is in progress.
5. The golden seed: gen2 never fills the seed perch's 'find' socket; A and C drop it anywhere.
6. V19b: 1-1 doesn't end higher than the bough window starts.
7. 7 red tests from the mixer port (9b6c244b): stage11/15, plainWalk.
8. V18 node 5 climb step-down; stage lines (5 standing kinds, upper half); cosine vs old 1-1 0.89-0.99.
9. A backdrop seam/pillar render defect, game-wide. Painted mushrooms on the near backdrop read as floating through pit gaps.
10. Easy and the kid bot (FT_KID, tools/inspect/firsttimer.ts:113) are hand-set numbers, not built from real player data.
11. 4-9 layout 4 dead log stair under a road (live game).
