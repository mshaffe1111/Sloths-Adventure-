# ENG-METER-L REPORT (R-165.578): the difficulty meter prices a LEFT-running follow. Engine, xhigh. Box 1 started 7:53 PM ET (from date).

## EXACT NEXT STEP (box 1, written 8:05 PM ET (from date))
STATE: the fix is committed on t-meter-left (be2ebe7d2, one commit on frozen 48f889a05: tools/difficulty/score.ts,
tools/difficulty/lineChannel.test.ts, reference/design/meter-coverage.json; no src change). The landing on t-build-28-wip by
fast-forward from 48f889a05 is the last step of this box; the hash `git ls-remote` gives is in the message to the lead.
NEXT (for the lead, not this job): 2-8's meter numbers below are far under its design target, and Easy reads ABOVE Normal. That is the
stage's, not the meter's: the line channel asks nothing on 2-8 because 2-8's follow stage has no heron zones and no reeds (probed:
zones [], covers 0, all 6 layouts), and Easy's heaviest beat is a pad board (ride-board 5.97 points, seed 1) that Normal does not have.

## What changed (tools/difficulty only)
- score.ts lineCrossings: a follow stage with dir -1 is no longer refused. leftCrossings reads it in a mirror (mirrorFollow, x -> -x:
  the zones' spans and setbacks, the reeds, the solid ground, the splash-back water, the exit; the cages too), runs the right-running
  code, and reads every crossing back to the stage's own x (a and b in his travel: on a left-running stage a > b).
- Its LEAVE is not the mirror's. The herons' first look sweeps world +x whichever way he runs (watcher.ts newWatch, dir 1; FollowPlay
  never sets it), so a mirrored stage would have the first sweep the wrong way round and price a game that does not ship (toy marsh,
  Normal: 6.7 s mirrored vs 4.4 s flown). leaveWindow flies safeWindow's own walk read the other way, with the game's FollowPlay at
  dir -1 (its herons wade and look as in the game). dir 1 still calls lineFaults' safeWindow itself: no right-running number moves.
- lineChallenges: the zone filter and the "over N px" length read a and b in either order; a left stop sits where his travel meets the
  clump (B.x + B.w), the mirror of a right stop's B.x. Both are identities for dir 1.
- meter-coverage.json line:follow: the note says both directions are priced, and how. coverage.known.json unchanged (6 entries).

## Proof
1. RED on 48f889a05 (7:54:42-7:56:13 PM ET): `coveragecheck: FAIL (6)`, 18 stages, the six lines:
   FAIL (c) 2-8 normal seed 1 / 2 / 3 and easy seed 1 / 2 / 3: unpriced piece line:follow (a left-running follow stage (safeWindow
   flies to the right)).
2. Tests (lineChannel.test.ts, 3 new): the left marsh (the toy mirrored about 6000, a different axis from the meter's) gives the right
   one's crossings exactly mirrored (a, b, A, B, n, herons, cycle, first, free, stop, cross, fetch), both settings; the leftward leave
   equals safeWindow one heron cycle late (WatchZone.lag = cycle turns the sweep) to the 0.1 s step it is sampled at, both ways, calm 3
   and 5, both settings (12 cases probed first, all within 0.1 s); the challenges carry the same kinds, clock, cost and stop prices at
   mirrored places; the mirror is its own inverse.
   PLANT 1: the mirror line removed -> tests 7 and 9 RED with UnpricedPiece (pass 7, fail 2). PLANT 2: the mirror's own leave kept ->
   test 7 RED (pass 8, fail 1). Both restored (cmp equal).
3. Every tools/difficulty/*.test.ts run WHOLE (8 files): tests 60, pass 60, fail 0.
4. coveragecheck with the fix (7:59:16-8:00:50 PM ET, before the commit) and on the commit (gate run below): PASS, 18 built stages
   (1-1 .. 1-10, 2-1 .. 2-8), 31 pieces used, 5 known gaps.
5. 2-8's meter (band.ts, seeds 1-4, the band tests' own computation; seen = 1-1 then the stage):
   Normal 1.818 (2.01 1.65 1.23 1.99); Easy 2.615 (2.64 2.68 2.59 2.53).
   Design: DIFFICULTY.md §4, target(w, s) = 10(w - 1) + T[s], T[8th] = 7 -> 2-8 Normal target 17, World 2 band [9, 21]; Easy at most
   0.6 x Normal (10.2). There is no reference/design/2-8.md. score.ts --stages 2-8 --seeds 1-3: Normal points 14.1, 4.38 min, mean
   3.2/min, peak 9.3/min; Easy points 15.1, 4.46 min, mean 3.4/min, peak 15.7/min (its "score" column prints NaN without the anchor
   in --stages: band.ts is the number).

## Gates (on be2ebe7d2; logs in this folder)
A tools-only change: `git diff --stat 48f889a05 HEAD -- src` is EMPTY (0 lines), `git cat-file -e` passes for 48f889a05:src and
HEAD:src, so the stage lock and the src suite do not move (they read src only).
- PASS tsc (`npx tsc --noEmit -p .`, 8:03:53-8:04:04 PM ET, empty log). It excludes tools/: the two touched tools files typechecked on
  their own, 0 errors before, 0 after.
- PASS generality: '72 engine files (239 exempt under the engine folders), 26 literals, 26 known'.
- PASS knowncheck against 49fdc8cb: clipknown 44, playerText 4, generality 26, ciTests 16, coverage.known 6 (unchanged), paintcheck 383,
  depthSteps 0, heroBody 2.
- roadmapcheck: FAIL at 8:04:05 PM ET only because the clone was still shallow ('shallow clone, proofs cannot be checked'); after
  `git fetch --unshallow origin` PASS at 8:04:17 PM ET ('all: 1467.6 helper hours (Matt's own items and the decisions left out: 23)').
- PASS timecheck (after the unshallow, 8:04:24 PM ET): '299 commits, 15 files, 3510 lines they wrote, 109 stamps' over 49fdc8cb6..HEAD.
- PASS coveragecheck (8:04:05-8:05:43 PM ET): '18 built stages (1-1 .. 2-8), 31 pieces used, 5 known gaps'.
- CI tool line (gates.yml:157, every tools test file CI runs, the three meter test files among them): CI-LINE-PLACEHOLDER

## The lead's pre-freeze set (D168; message received mid-box): every importer of a changed file, run WHOLE (prefreeze-set.txt)
- `git grep -l` for difficulty/score, difficulty/lineChannel, difficulty/lineToy, meter-coverage (reference/ left out): code importers of
  score.ts are src/game/gen2/worlds/w1Arc16.test.ts (dynamic, :129), tools/inspect/rowWheels.test.ts (static; on the CI tool line), and
  tools/difficulty's own files (band.ts, beatpts.ts, coveragecheck.ts, every *.test.ts there). nodeAsks.ts, nodeCode.ts, w1Arc16.ts,
  route.ts and routeHumps.test.ts name it in comments only. lineToy.ts is imported by lineChannel.test.ts alone.
- w1Arc16.test.ts WHOLE: 48f889a05 tests 8, pass 8, fail 0; be2ebe7d2 tests 8, pass 8, fail 0.
- routeHumps.test.ts WHOLE: 48f889a05 tests 4, pass 4, fail 0; be2ebe7d2 tests 4, pass 4, fail 0.
- 1-6's meter number did NOT move (band.ts 1-6, seeds 1-4): Normal 6.434 (6.30 6.32 6.87 6.55), Easy 3.096 (3.08 3.11 2.94 3.28) on
  BOTH 48f889a05 and be2ebe7d2, every seed equal.

## Lessons applied
- D15 (test the measuring tool before trusting its numbers): the mirror was checked against the game before it was trusted, and it was
  wrong for the leave; the shipped flight is proven against safeWindow by the one-cycle lag, both ways.
- LAWS 3 (check the fact) and 22 / 5 (no known list grown): 2-8 was not added to coverage.known.json; the engine was read (watcher.ts
  newWatch, followPlay.ts herons, follow.ts zoneLookX) before the mirror was believed.
- Mine to own: my first commit's Claude-Session trailer named the lead's session; amended before any push (be2ebe7d2).

## Learned (for the next meter builder)
- A mirror is exact only for code that has no world direction of its own. Grep every `dir: 1` default (newWatch) before mirroring.
- tsc -p . excludes tools/ (tsconfig "exclude"): a tools change needs its own typecheck. Done here on the two files with a scratch
  tsconfig (types []), errors before vs after: 0 vs 0.
