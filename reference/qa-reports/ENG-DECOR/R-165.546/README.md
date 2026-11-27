# R-165.546: ENG-DECOR's follow-ups, kept OFF the candidate (safe-keeping only: not merged, not landed)

Cut from t-eng-decor 4cb57625f (ENG-DECOR's frozen candidate). Started from the lead's first ruling, then reverted on its correction
(D138: a hand-over ends new work). This branch holds that work so its box starts from here.

## In the diff
- `src/game/artDress.ts` HAZARD_LOOKALIKE gains the frog rows: `w2Frog -> family 'frog', swap 'w2WaterJar'` (the jar stands on the ground
  and is no wider: 52 units to 55) and `w1TreeFrog -> family 'frog'` (no swap: left out). They guard a frog cast in Worlds 1-2; frogs are
  foes only in Worlds 6-7 today.
- `src/game/dressLookalike.test.ts`: the frog unit cases, a frog PLANT (rows deleted, the judge names both frogs), and the lead's scope:
  Normal on every listed seed of every stage in a lookalike world, Easy too where the Normal build's cast holds a lookalike family (found
  from the build), with a check that 2-5 and 2-9 were among them.
- tsc clean and generalitycheck PASS on it. The test run was STOPPED unfinished: NOT RUN. Adding the frog rows widens the test to World 1
  (w1TreeFrog is in World 1's sets), so time it again.

## Still
- `2-5-up-before-after.jpg`: 2-5 upright, layout 1 Normal, the real page; the decor turtle by the reeds (x 20151) -> a small frog on the
  same bank, at Pokey's scale (judged fine). The sepia tint and the bubble are the paused opening story bubble, not the dress.

## Next for its box
The lock gate (the frog rows must move NO stage today: no World 1-2 stage fields a frog), the test timed, the shards, then the lead.
