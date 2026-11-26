# ENG-BOTSIM: can the bots ask the GAME how a press flies? (R-165.462, spike; branch t-eng-botsim from c73cb9766)

## EXACT NEXT STEP (session 1, written 1:16 PM ET; items 1 and 2's toy DONE)
1. Item 3 (cost): on worktree `../bs-ci10` (8134a9a56 + `proto-ci10.patch` + engineFork.ts; recreate: `git worktree add --detach
   ../bs-ci10 8134a9a56`, symlink node_modules, `git apply` the patch, copy tools/inspect/engineFork.ts): one x40 kid + adult on 2-4
   (castBots' roll, both settings as it rolls them) with and without `BOTSIM=1`: wall and user CPU (bash `time`; no /usr/bin/time here),
   the probe count and ms (`BOTSIM` counters), and pass/fail per row both ways.
2. Item 2's other rows: the CI-8..CI-15 rows on their OLD heads, as far as the prototype's one judge reaches (vineFromLog standing
   only: CI-11 is the one it covers; the rest go in the plan table as "which judge, physics or input").
3. Item 4: this page's ANSWER section.

## Item 1: YES, by snapshot + fly the LIVE engine + restore in place (a separate copy does NOT work)
Tool: `tools/inspect/engineFork.ts` (`probe(e, pads, read)`); proof: `npx tsx tools/inspect/botsim/forkProbe.ts 2-4 35 easy 30`.
- **A copy (deep clone, prototypes kept, stepped on its own) fails:** it matches the live flight, but it SHARES state held in closures:
  the stage clock keeps its time inside a closure (clock.ts stageClock: `let t`), so flying the copy moved the LIVE game time 1.5 s; the
  piece and field hosts (engine.ts pieceHost, fieldHost) read the LIVE engine through closures. 7 closure-bearing objects in the graph.
- **Snapshot, fly the live engine, restore in place works:** every object the engine reaches (754 on 2-4 at 8 s) is saved; the live
  engine flies the candidate pads (its hooks loseLife / softFall / damagePlayer / guide swapped for the probe's, Math.random on the probe's
  own stream); then every saved object is written back IN PLACE (identity kept, so every reference and closure into it stays right) and
  the clock is put back. Checks on 2-4 kid Easy 35: (B1) the whole reachable graph prints identical after a probe; (B2) the probe's 45
  frames equal the live run's 45 frames exactly (x, y, vx, vy to 4 places, every frame); (B3) 900 frames probed 45 frames ahead every
  3rd frame (300 probes) end at the identical player state as the same run never probed.
- **Cost:** a 45-frame probe = 9.6 ms mean (snapshot + restore about 5 ms, a frame about 0.1 ms). A judge asking 3 lags is about 30 ms
  per decision.
- **One leak, outside the engine:** B3's full graph differs in ONE field (guideN 0 vs 1): a probe flew past a Dot tip and the tip's
  module (src/game/tipMemory.ts: `sent`, `pending`, `byText`) marked it sent, so the live run never said it. Module-level stores the
  engine writes during play: tipMemory, guideShown (`shown`), helpLadder (`onScreenText`, `current`, `grownNow`, `stairsLeftOut`),
  physics (`framesFlown`, a counter), playRecorder, localStorage. The fix is an engine seam (each store exports save/load, or moves onto
  the engine), and B3 over every stage as the gate that proves none is left.

## Item 2: the prototype on ONE judge (vineFromLog's standing catch), on the OLD code: CI-11's row judged right with NO hand fix
Patch: `proto-ci10.patch` (on 8134a9a56 = CI-10, behind `BOTSIM=1`; 103 lines); toy: `botsimToy.test.ts.txt` (CI-11's own toy from
4cccba33e, plus the same recorder on the plan's press); evidence `toy-ci10.txt`.
- **The judge asks the engine:** for each of the three lags (mid, mid - sd/2, mid + sd/2) it builds the press PLAN (stand until the
  press frame pressIn(lag), the press, the jump held while the engine counts it held, the steer from the press frame or when his thumb
  gets there, steerFrom) and `probe()` flies it on the real engine: caught = swinging on that liana before he is grounded or dies.
- **The bot plays what was judged:** the lag drawn as decide draws it; the plan at that lag is the pad stream, frame for frame, to its
  probed end (no thumbify, no startJump draw in between: rule 28 "the judged hop is the hop flown" holds by construction).
- **Result:** without the probe (old judge): RED, "the standing press at t 47.600 from x 10545.1 on #48 was judged to catch; the engine:
  grounded on #-1 at x 10190.0 y 947.0, frame 14" (CI-11's miss). With the probe: GREEN, pressed at t 47.067 from x 10502.2 on #48,
  caught liana #4 on frame 10: the SAME press and catch CI-11's hand fix reached (CI-REDS session 8: "pressed 47.067 from x 10502.2 on
  #48 ... caught swing #4 at 47.400 (frame 10)"). CI-11's three hand fixes (every free count, the engine's hold count, startJump flying
  the judged hold) are not needed: the first two are physics the engine does itself; the third is "play the plan".
- **Cost on the toy:** 114 probes, about 1.0 s of probing in a 49 s run (8.5 ms a probe); test wall 3.5 s vs 5.1 s (noise: one run each).
