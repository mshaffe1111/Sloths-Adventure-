# ENG-BOTSIM: can the bots ask the GAME how a press flies? (R-165.462, spike; branch t-eng-botsim from c73cb9766)

## EXACT NEXT STEP (session 1, written 1:13 PM ET; item 1 DONE, item 2 in progress)
1. Item 2 prototype on the OLD code: worktree `../bs-ci10` = 8134a9a56 (CI-10), node_modules symlinked. Copy
   `tools/inspect/engineFork.ts` in; in `tools/inspect/firsttimer.ts` vineFromLog's standing branch (`if (!running && !lags.every(catches))`
   and the press at its end), behind `process.env.BOTSIM`: build the press PLAN per lag (frames 1..m-1 `{}`, m = pressIn(lag)/DT the
   press `{press, jump}`, jump held while (j-m)*DT < pressHold(), steer from max(press frame, steerFrom(dir, t))), judge = every lag's
   plan caught by `probe(this.e, plan, read isVineSwinging)`; act = draw the lag as decide does (gauss(this.r, who.thumb)) and PLAY that
   plan's pads verbatim (`this.plan`, taken first in `play()` and right after `intend()` in `pad()`), truncated at its probed catch.
2. Run CI-11's toy (`git show 4cccba33e:tools/inspect/hopJudged.test.ts` lines 286-327, the 2-4 kid Easy 35 test) on ../bs-ci10:
   without BOTSIM it must be RED (the known miss), with BOTSIM=1 GREEN = item 2's toy.
3. Then item 3 (x40 kid + adult, one stage, BOTSIM vs not: wall + CPU) and item 4 (this page).

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
