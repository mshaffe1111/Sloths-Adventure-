# ENG-WATCH2 REPORT: the eagle's fix green, then 1-7 tuned (R-165.267, R-165.266)

**STATUS: DRAFT (filled as the numbers land).**

## EXACT NEXT STEP
(written last)

Branch t-eng-watch2 from origin/t-eng-watch 76a81ad2. Packet reference/packets/2026-11-15/ENG-WATCH2.md. Role card ENGINE.md.
Times are pasted from `TZ=America/New_York date`.

## 1. The 4 red kit tests (done, b2a0ef55)
- F1 is gated by data, the lead's ruling: `PredatorDef.passAt?: 'far'` (predators/types.ts); EAGLE sets it (world1.ts); a sweeper
  without it starts each pass where its last ended, there and back (core.ts rest, byte for byte the base's line). checkPredator refuses
  passAt on a kind that is not a sweeper. The caiman takes nothing.
- predatorHabits "sweep: no pass while he is outside": its eye waits at 1000 (the end farther from him at 100), not 200. A sweeper without
  passAt keeps the old assert (200).
- predatorHabits "in cover and still ... two empty passes": he hides at 700 (not the 600 tie, so the test pins the rule, not a tie-break);
  one empty pass, the next starts again from the end farther from him (facing 1). Without passAt the old assert holds (facing -1).
  The give-up after two empty passes and the seen-still asserts are unchanged.
- predatorWorld1 "the screech": the pass alone (`glance: false` on that Post; the glance is eagleGlance.test's). The screech comes when its
  eye reaches the far end (1000 px at 640 px/s from where it was laid), the pass starts at 1200, nothing but shadow for the warn after the
  screech, the dive 0.75 s (Easy x1.3) after the tell: unchanged.
- predatorCasts "the food chain past World 1": unchanged, green: the caiman no longer takes F1.
- Planted (plants.txt): F1 off -> 6 red (3 restated + 3 eagleGlance); the gate off (F1 for every sweeper) -> 3 red, the caiman's among them.
