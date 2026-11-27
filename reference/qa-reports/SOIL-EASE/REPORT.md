# SOIL-EASE (R-165.487): the soil's darkening line eased at every bank start

## GATES ONCE on frozen df06d9753 (the tail, 11:54 AM ET; D115 freeze: chattr -R +i src tools, proven/ writable; base frozen at ab5673531)
- tsc PASS. Suite in 6 shards: 4,192 tests, 4,188 pass, 1 FAIL, 3 todo (shard 4: goalsEasy.test.ts:10 LV-24, the 5-9 kidRuns pin
  [3,5,6,7,6,5] vs [14,13,17,18,5,5]). The CI tool line: 449 tests, 446 pass, 2 FAIL, 1 todo (wheelBoard.test.ts:74 boardWatch PLANTED
  OFF; wheelStepOff.test.ts:38 stepOff PLANTED OFF).
- ALL THREE REDS ARE INHERITED: each fails the same way on frozen ab5673531 (run there alone: goalsEasy 0/1; wheelBoard + wheelStepOff
  4 pass, 2 fail). They are INT-R5's discovery reds #4 and #2, fixed on release-0.10.4 by fc31f6e1f, a323cdf97 and f506a2068 (not in
  ab5673531). This diff touches none of their files (5 files: groundPaint.ts, protoArt.ts, paintFall.ts, paintFall.test.ts, the list).
- THE LOCK GATE, two runs: `--layouts 16 --out base.json` on ab5673531 PASS (496 s), `--check base.json` on df06d9753 PASS (503 s):
  "lock: 102/102 stages unchanged".
- paint0 PASS (306 s), paint1 PASS (426 s), paint2 PASS (421 s): each "0 known depth steps seen, R-165.487", no new lines, no stale id.
- drawcheck PASS (842 s). knowncheck, generalitycheck, roadmapcheck PASS (box 1).
- The probe (every stage, both settings, every listed seed / 16 layouts): ALL max 24 a strip (2-7 max 24, was 73); none over 24.
- NOT LANDED: the lead's tail said any red = record, no fix, stop. The reds are inherited; the lead rules whether t-soil-ease lands as is.

## EXACT NEXT STEP (box 1 hand-over, 10:55 AM ET; done in the tail above)
On t-soil-ease (cut from ab5673531; this branch's fix commit is the one before this REPORT), run the gates ONCE, each to a log, read
tails only: (1) the suite in 6 shards (INT-R5 r104/run1.sh suite1..suite6 lines); (2) the CI tool line (gates.yml
`npx tsx --test tools/engine/library.test.ts ...`); (3) THE LOCK GATE as two runs: in a worktree at ab5673531
`npx tsx tools/engine/lockall.ts --layouts 16 --out base.json`, then here `npx tsx tools/engine/lockall.ts --layouts 16 --check base.json`,
the counts line must read 102/102 unchanged; (4) `npx tsx tools/engine/paintcheck.ts --part 0/3`, `1/3`, `2/3` (each must PASS: the
depth list is EMPTY and every listed id stale would fail); (5) `node tools/perf/drawcheck.mjs`. Then freeze per D115 (src/game/gen2/proven/
writable), land on t-soil-ease (no force) and send the lead the hash, each gate's totals and the stills below.
Done in box 1: tsc PASS, knowncheck PASS, generalitycheck PASS, roadmapcheck PASS, the R-165.487 / R-165.451 / R-165.441 tests 7/7,
the plant red with the ease off (DEPTH_EASE 1e9: "not ok 1"), stills before/after.

## The cause
protoArt.ts groundLine (the line the soil's darkening is laid out from) was the weighed mean of the tops within LINE_REACH (240). Where
a bank starts with only a sliver of another top in reach, the weights are tiny and the mean swings: 49-73 px in one 16 px strip (2-7:
105 strips over 48 and 6,828 over 24 on its listed seeds, both settings; every other stage probed at 24 or under; 1-1 max 9, 2-6 0).
Where no top is in reach (a wide pit's middle) it jumped to the nearer top outright.

## The fix (draw-only, general; no stage id, seed or x)
- The bar, named: the largest of the lead's planted steps that shows nothing, **24 px a strip** (24 nothing, 32-48 faint, 64 plain).
  paintFall.ts DEPTH_STEP_MAX 48 -> 24 (the gate now holds every bank start, every stage, to it).
- protoArt.ts easedLine: the mean read at every strip's middle over the tops' span, then held to DEPTH_EASE = 23 a strip from both sides
  (the mean of the least line over it and the greatest under it that move no more than that; one under 24 for depthRuns' rounding to a
  unit). Wherever the mean already eases it is unchanged; across a steep spot it becomes a centred ramp. Joined straight between strips.
  Built once per set of tops (memo by the tops' x, y, width), so a stage's squares share one table: about (stage width / 16) x tops
  mean reads once per stage, not per frame. No collider, layout or lock input changes (the line is read only by drawSoil/drawEnd).
- meanLine exported (the old line, the input the ease eases) so the tests rebuild the old drawn line as a plant; no switch in the engine.
- depthSteps.known.json: known [] (108 entries, all 2-7, off; the list only lost entries; knowncheck PASS).

## R-165.484 (2-7 Easy seed 5, the vertical seam at x about 16800)
SAME CAUSE: the probe's Easy layout 4 (seed 5) step is 49 px at x 16832 under bank 16540-17880. The before still shows the straight
lighter/darker edge beside the waterfall bank; the after still has none (ba-2-7-L4-easy-x16832-sideways.jpg). Fixed by this change.

## Stills (before top/left, after bottom/right; tools/engine/runs/stills-at-setting.mjs on the dev page, 2x, 412x915 / 915x412, the
## real engine paused, placed, stepped and rendered: the ground squares' paintTile -> drawGround -> drawSoil -> shadeSoil -> depthRuns path)
- ba-2-7-L34-normal-x3424-*: 2-7 Normal seed 35 (the worst, 73 px at x 3424, bank 3422-3722).
- ba-2-7-L34-normal-x15728-*: 2-7 Normal seed 35, 49 px at x 15728 (bank 15436-16776).
- ba-2-7-L93-easy-x3776-*: 2-7 Easy seed 94, 61 px at x 3776 (bank 3767-4067).
- ba-2-7-L4-easy-x16832-*: 2-7 Easy seed 5, 49 px at x 16832 (R-165.484's seam).
- ba-2-6-L0-normal-x1050-*: 2-6 Normal seed 1, beat A (no step before or after: unchanged).

## Polish check
- 2-7 Easy seed 5 sideways: the seam beside the waterfall bank is gone; the soil reads as one fill. PASS.
- 2-7 Normal seed 35 / Easy seed 94: the faint edge at the bank start no longer shows; the rest of the soil is the same. PASS.
- 2-6: no visible change. PASS.

## Learned
- A weighed mean whose total weight can go near zero is not smooth: bound the line's move per strip directly instead of hoping the
  weights ease it. A gate's bar should be the planted "shows nothing" step, not a "faint" one.
