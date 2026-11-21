# ENG-26c REPORT: 2-6 "The Water Wheels" readiness on a real (draft) row. STOPPED at the lead's D76 line (11:52 AM ET 11-21)
t-eng-26c from 0eefc707e. Code head f79e86f2a (steps 1-2); this report and tools/inspect/wheelCrossings.ts on the commit after it.
Lessons applied: D57/D87/D105 (inbox at every step and push; long runs in the background), D75/D101 (ready = laid by gen2 on a real row,
counted by a test), D102/D76 (lean reads; stopped at the line), D40 (no patching what is replaced: the draft bricks are throwaway data).

## EXACT NEXT STEP (for ENG-26d, in this order)
0. **Two existing tests still pin the OLD rule for 'p' (RED on f79e86f2a, mine, from the lead's ruling G1 = A):**
   - src/game/gen2/nodeAsks.test.ts:38: drop 'p' from `['s', 'v', 'p', 't', 'x']` (Later) and add
     `assert.match(m('Pp'), /content 'p' \(beat\): no piece on a clock laid/)` and `assert.equal(m('Pp', { clocked: 1 }), '')`.
   - src/game/gen2/nodeLetters.test.ts:51 and :55: `laid = !!TYPE_OF_LETTER[l] || !!FILL_LETTER[l] || CLOCK_LETTER.has(l)` (import
     CLOCK_LETTER from nodeAsks.ts); LATER_CONTENT keys become `['s', 'v', 't', 'x', 'n']`.
   The other 92 tests of the neighbouring files pass (lianaRiver, mirror, nodeAsks, nodeCode, nodeDials, nodeLetters, nodeMix, riverLay,
   riverSection, rolledFlags, tower, wheel: 92 pass / 2 fail, exactly these two).
1. **RiverZone.way, ONE field with ONE meaning (the lead's 11:50 AM ruling):** t-eng-27 (origin/t-eng-27, code ad23f8b0a) already added
   `way?: -1` for a river crossed right to left in a leg laid left (its river.ts:67-69; riverFaults in its own frame; engine water by
   riverAt; levelCheck hop relative to him). Mine (river.ts, this branch) is the same field for a leftward TOWER storey. Read t-eng-27's
   definition and readers by grep (`git show origin/t-eng-27:src/game/river.ts`, its riverLay.ts riverFaults, levelCheck.ts, river.ts
   riverAt), then align: my convention is `dir` = the WORLD current (a with-him row is dir -1 on a way -1 river), `x0..x1` the water in
   world x (near bank at `x1` when way -1), `safe.backX` mirrored onto the near bank (x1 + 70), riverFaults = the same faults on the
   mirror image (riverLay.ts mirroredRiver), levelCheck hop = `hopLimit(dir * way)`. If t-eng-27 stores `dir` RELATIVE to him, one side
   must change; write the shared doc comment so the integrator's merge is a no-op on meaning; a small test that a left leg's river and a
   leftward storey's river judge the same is welcome. Check also whether t-eng-27's riverAt / engine water read needs anything for a
   tower storey (mine changed no engine reader: river.ts drift and splash are world-coordinate already).
2. **Step 3, bots on the draft row: a NEW ENGINE GAP G6 found, not fixed.** The draft's stage (spawnY ~6650-7500) is taller than 2-6's
   config (levelHeight 3500); RealPlay shifts every platform up (~4600 px on seed 1: he stands at y 2037 at t=0 against spawnY 6649), but
   each wheel's AXLE (Wheel.cx/cy, shared by its buckets; pieces/wheelPiece.ts moves the buckets from it) is NOT shifted, so the buckets
   turn about the unshifted axle: beat 10's wheel (cy 1885) turns its buckets at the floor, the child bot boards it from the millpond at
   1.5 s and reaches the shrine in 33 s, the first three wheels never met. Find the shift (where a stage taller than config.levelHeight is
   moved: grep the gen2 game path / realPlay / engine load for the platform y offset) and move each wheel's axle (and its pond, its
   lay ids are ids) with the platforms, as a general piece; plant: a tall tower with a wheel, buckets read at their rim from the shifted
   axle (RED today). The toy (2-95) never showed it: its tower is short.
   Then the bot table: runner saved as reference/qa-reports/ENG-26c/wheel26Run.ts.txt (copy to tools/inspect/*.ts to run; it plants the
   draft row via withTestStage + a one-seed list, HIDES w2Stages W2_STAGES['2-6'] (the hand-built 2-6 is routed before any listed row,
   stageGenerator.ts:2926) during the run and restores it; per-wheel tally from tools/inspect/wheelCrossings.ts wheelTally). Rows:
   child E/N, middle N/E, expert N, variants 1-2, ON and OFF (SKILLS.rideWheel = false: the plant); every wheel both ways round.
   Then a test in tools/inspect (in gates.yml's tool line) and the meter's wheel channel on the draft row (route.ts 'wheel').
3. **Step 4, the look:** ART-W2B's painted wheel (inventory) drawn on the draft row instead of ENG-26's placeholder (wheelDraw.ts);
   stills both ways of a board, a ride, a step-off, the rightward wheel (beats 5/8/10 on this draft), the great wheel. NOT STARTED.
4. **Step 5, gates on the head:** tsc, the planted tests, the CI tool line, tierBots, generality, coverage, lockall vs
   $base (0eefc707e). Name the rest UNRUN for BUILD-26.

## The readiness list (sent 11:33 AM ET; draft row src/game/gen2/worlds/w2Arc26.ts, not listed, not imported by the game)
2-6's node string verbatim, one draft brick a beat, World 2's W2_WHEELS / W2_RIVERS, 2-6's config (ascent, up); seeds 1-12 x Normal/Easy.
- AS WRITTEN on 0eefc707e: 0 of 24 rolls built (all threw at beat 4's river). With beat 4 swapped for a hop: every beat laid, 5 wheels with
  jetty/street/pond/6 buckets, the bounce; errors left: G1 (4 a roll) and the flag before beat 8.
- G1 ENGINE: 'p' had no type: every wheel node failed "Later". FIXED (lead's ruling A).
- G2 ENGINE: a river on a leftward tower storey threw. FIXED.
- G3 DATA: 2-1's ride row (798 px of water) + banks is wider than a 1280 tower's storey (and Easy's landings are +48 px).
- G4 DATA (proven): the flag window 1500-2400 px before beat 5 fell on the millrace, whose banks were under a flag's 160 px.
- G5 ENGINE (found on the way): a tower section 1097-1140 px long was laid THROUGH the wall after a run-out. FIXED (fails by name).
- G6 ENGINE (found at step 3, OPEN): wheels' axles are not moved with a tall stage's height shift (next step 2).
- Note: '>' in 'Wp1>' is the tempo mark (hurry), not a direction; direction comes from the lay (the lead agreed).

## Fixes (general, no stage id; generalitycheck PASS; tsc PASS on f79e86f2a and on this commit)
| gap | fix | plant (RED on 0eefc707e, GREEN here) |
|---|---|---|
| G1 | nodeLetters p 'now'; nodeAsks CLOCK_LETTER + onClock (wheel bucket, beat pad/snap stone, ride); pipeline LAID_NODES.clocked; NODE-KEY.html regenerated (tools/engine/nodekey.ts) | src/game/gen2/nodeClock.test.ts 2/2 (base: cannot load) |
| G2 | riverLay layRiver(row, x0, y, id, way -1): the exact mirror about x0 (tail rows refused by name); riverFaults judges a way -1 river as its mirror; levelCheck hop = hopLimit(dir * way); pipeline: tower only (a run's mirrored river still refused); river.ts RiverZone.way | src/game/gen2/riverLeft.test.ts tests 1-3 (base: 3/3 RED) |
| G5 | pipeline towerJoin: after the run-out, a section the turned storey cannot hold throws by name (was `way = dir`, through the wall) | riverLeft.test.ts test 4 (toy tower, 1100 px section; base: 30/30 Normal rolls laid wood outside the walls) |
| all | the readiness count | src/game/gen2/worlds/w2Arc26.test.ts 3/3 (base: cannot load) |

## The draft row now (24 of 24 rolls, seeds 1-12 x Normal/Easy, w2Arc26.test.ts)
Zero gen2 errors; the 14 beats in order; 5 wheels in order teach (L), edge (R), top (R), the bounce's edge wheel (R), great (L), each with
its rim, speed (Easy's easyV), 6 buckets, jetty, street and its own pond; the millrace: 2-1's ride logs (4), soft, crossed RIGHT TO LEFT
(exercises G2), riverFaults clean; the bounce (1); the crest's totem. Draft data: tower 1700 px (TOWER_26), millrace banks 260/200.

## What the 2-6 builder needs
- Real bricks in place of the draft's (pieces, lines, art, flags, hearts); the stage-table row; delete w2Stages '2-6' (and its pinning
  tests, 2-6.md "The hand build it replaces").
- G3 (the builder's call): either a wider tower for 2-6 (WorldManifest.tower.width; the draft uses 1700, about 4 upright screens) or a
  narrower millrace (a 2-log row, or banks so Normal and Easy fit 1096 px of a turned storey at 1280); G4 follows: give the river's near
  bank a flag spot (160 px clear) or a rest before it, so a flag stands 1500-2400 px of route before beat 5.
- Wheel bricks may carry any section type in the deal (the draft gives them 'rope'); 'p' is checked by the wheel itself.
- Wheel direction comes from the beat widths: on this draft beats 5, 8, 10 run right; keep at least one rightward wheel.
- Do not start before G6 is fixed and the bots table is in (rule 21, 23).

## Gates run (on f79e86f2a unless named)
| gate | result |
|---|---|
| tsc | PASS (f79e86f2a and this commit) |
| planted tests (riverLeft 4, nodeClock 2, w2Arc26 3) | PASS here; RED on 0eefc707e |
| neighbouring gen2 test files (12 files) | 92 pass, 2 FAIL (mine: next step 0) |
| generalitycheck | PASS (26 literals, 26 known) |
| lockall vs 0eefc707e (--layouts 16) | see the line below (running at hand-over) |
| everything else (suite, build, chunkcheck, artcheck, drawcheck, clipcheck, kbdcheck, buildcheck, knowncheck, roadmapcheck, seedlist, CI tool line, tierBots, coverage) | UNRUN |

## Polish check
Nothing drawn yet: the draft row plays ENG-26's placeholder wheel (wheelDraw.ts); no stills. Step 4 is not started.

## Learned
- A readiness check must PLAY the row, not only lay it: the lay counted 5 perfect wheels on 24 rolls while the played stage turned
  every bucket about an unshifted axle (G6). Rule 23's check should include one tier run per row.
- A kept plan's Easy lay can need a different tower turn than Normal's; the tower's width check must use the room a turned storey
  really has (1096 at 1280), not the storey's 1140.
- Proposed level.md rule (for the lead): "a readiness test plays one tier bot over the draft row and counts each designed object MET".
