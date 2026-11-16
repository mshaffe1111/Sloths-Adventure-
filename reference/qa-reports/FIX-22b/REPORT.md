# FIX-22b REPORT: 2-2's drawcheck red was the engine throwing the baked ground away when any sheet arrived; fixed for every stage

Engine, Opus 5.5 high. Branch t-fix-22b from origin/t-fix-22 @a1acbbe2. Times from `TZ=America/New_York date`. Started 8:51 PM ET.

## EXACT NEXT STEP
The lead hands the fix commit **b7c4c62a** (on t-fix-22b; head df1715ea + this report) to REL-099, which merges t-fix-22b and runs the
full gate set on the release head. Nothing else is open on this packet.

## The result
- **drawcheck (whole run, every stage both ways) PASS** on b7c4c62a: `reference/qa-reports/FIX-22b/drawcheck-b7c4c62a.txt`.
  **2-2 sideways: worst spot 5.91 (x 19185); x 9388 is 5.70** (was 8.18 on release-0.9.9 @6cec5bf8 and on a1acbbe2). 2-2 upright:
  worst 5.07, x 9388 4.85. Highest in the whole run: 1-4 sideways 7.02 (was already there; not 2-2's). Limit 7.5 unchanged; no known
  entry added (knowncheck PASS).
- tsc clean; generalitycheck PASS (26 literals, 26 known: none added); knowncheck PASS; the suite once: see "Suite" below.

## The cause (found in the code and the running game, not guessed)
Nothing about the spur's art was too heavy. Measured alone, x 9388 sideways draws 5.71 screens. Measured after spot 0 (the way the
gate plays it), the 8 counted frames were 5.70 x4, then **10.66 x4**. A trace in the ground cache's reset named the cause:
`w2-pad-ripple.webp` finished loading mid-count (the first time a pad sank); earlier the pad and shallow-water sheets did the same.
`protoArt.ts` drawGroundChunks (and drawWallChunks, 2-6's bank face) had `sheetEpoch.n`, a count of EVERY sheet that finishes loading,
in their cache key. So any sheet arriving threw every baked ground square away. With 3 squares repainted a frame, the whole ground was
drawn live (soil tile by tile plus shadeSoil's blobs: groundPaint.ts:175, 1.93 screens) until the squares were back. This hits every
stage whenever a sheet arrives in play, and on a phone it is a frame spike as well as a draw-budget breach. 2-2's spur showed it
because the pads' sheets load right at the gate's second spot.

## The fix (b7c4c62a, general; no stage id or x)
- Each square keeps the sheet count it was painted at (`epoch` map). A square in view that a newer sheet may change is still drawn, and
  `sheetsSince` repaints those squares inside the existing per-frame budget (3), old canvas freed. A changed world, ground, scale or
  view height still drops all squares at once, as before. The same applies to drawWallChunks.
- Planted: `groundSeams.test.ts` 'a sheet arriving in play never throws the painted ground away…'. It is **red without the fix**
  ("frame 0 after the sheet: 7 soil tiles drawn live") and green with it. It also checks that all 8 squares are still drawn on every
  frame, that they are repainted within 3 frames, and that they are then left alone. The test's canvas stubs moved into one `stubArt()`
  helper that the existing dip-pocket test now uses too (same assertions).

## Collision and layout: unchanged (draw code only)
The diff touches `src/game/protoArt.ts` (two draw functions and one helper) and a test. No stage data and nothing the generator or
bots read. Proof: a hash of 2-2's platforms, vines, ropes, rivers, collectibles, spawn and exit is identical on a1acbbe2 and on
b7c4c62a, seeds 1-3, Normal and Easy (`layout-2-2-before-after.txt`, 115 platforms each). So castBots, seedlist and lockall were
skipped, as the packet allows for a change that moves nothing.

## Polish check (stills at x 9388, Normal, whole screen, the gate's own camera)
- Sideways before / after: `x9388-land-before.png`, `x9388-land-after.png`. Upright before / after: `x9388-port-before.png`,
  `x9388-port-after.png`. Before and after are the same picture, which is the point: the ground was always meant to look like this.
  Now it comes from the baked squares instead of being painted again live.
- The spur reads as finished painted art both ways: World 2's painted banks, the three steps down with grass lips, the low bank's
  petals, the rope over the dip, the painted backdrop (heron, huts, reeds), and pads in the pond at the right.
- Named, not mine and not changed: upright, the top ~40% of the screen is sky above the backdrop. That is the portrait camera's framing
  on every World 2 stage. Pokey is in mid-air in the stills because the harness pins him at the spot.

## Suite
Running on b7c4c62a since 9:06 PM ET (`suite-b7c4c62a.txt`). At 9:50 PM ET: 3321 top-level tests ok, **0 not ok**, still running.
The final count follows in a commit on this branch and a second message to the lead.

## Learned (for the next builder / engineer)
- A drawcheck breach at one spot that only shows up in the gate's order is a cache, not art. Measure the spot alone, then after the spot
  before it, and read the per-frame numbers: a step from flat to much higher in the middle of the count means something was dropped.
  How to do it is in engine-core.md 0zk.
- Proposed rule (gates.md / PERFORMANCE-RULES §8, the lead's call): **a baked cache never has the global sheet count in its key.** It
  keys on what it draws from, or it repaints in place within its budget. One left: protoArt.ts's bough-tip cache (one small canvas;
  named in 0zk, not changed: outside the breach).

## Method update
- Worked: the throwaway per-spot harness copy (visit spots 0..N, count only N, screenshot each), plus a console trace at the cache
  reset. That took the cause from guessing to proven in about 15 minutes. Written into engine-core.md 0zk. A proposed packet for the
  tools owner: give run.mjs a `PERF_ONLY_SPOT` and per-spot site output, so nobody has to copy the file.
- Failed once: my first layout-proof script crashed the same way on both heads and `diff` said IDENTICAL. Caught by reading the files.
  Prove a diff only from output that holds the numbers.

## Lessons applied
Law 22 (the limit and the known list untouched; the root fixed), law 3 (the cause traced in the running game before any change), law 5
(drawcheck whole run, tsc, the suite), LESSONS line 75 (the new stage stays in the stage-walking gate; I fixed the engine, not the gate).
