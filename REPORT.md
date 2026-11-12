# EN-Y report: the generator's yield (R-165.120), Engine, 2026-11-11. Branch t-engine-yield from release-0.9.6@06bbd29f

**Result.** A fresh 1-1 seed now lays cleanly on both settings a little over half the time (was 2 in 100). No rule, threshold or
STAGE-RULES number changed. All 200 proven seeds lay the stage they laid before.
## Done items
1. **Clean rate 50%+ on Normal and Easy: PASS.** `npx tsx tools/engine/yield.ts 1-1 --par 4` (200 seeds a setting, about 60 s).

   | seeds | Normal before | Normal after | Easy before | Easy after |
   |---|---|---|---|---|
   | 50001-50200 (tuned on) | 18 (9%) | **113 (57%)** | 4 (2%) | **109 (55%)** |
   | 70001-70200 (held out, never tuned on) | 19 (10%) | **115 (58%)** | 6 (3%) | **108 (54%)** |

   Rolls each rule stops, 50001-50200, before -> after (Normal / Easy). A never-clean seed still returns its first refused roll, so
   its lines are the old ones: V19b 106 -> 59 / 137 -> 72; floor.unmarked 114 -> 58 / 143 -> 69; pool short (any kind) 104 -> 53 /
   123 -> 60; node code 66 -> 28; drop.untyped 50 -> 22 / 80 -> 37; teach.double-no-gap-after 31 -> 13; band.out 0 / 9 -> 5.
2. **No verdict threshold or STAGE-RULES number changed: PASS.** `git diff 06bbd29f --stat` over verdicts.ts, verdicts.types.ts,
   reach.ts, promises11.ts, storyChecks.ts, levelCheck.ts, nodeCode.ts, types.ts, seedList.ts, provenSeeds.ts, worlds/ and
   STAGE-RULES.md is empty. The diff is pipeline.ts, the probe and tests.
3. **`npx tsx tools/engine/seedlist.ts 1-1 --check`: PASS** (200 seeds, each clean on both settings, each replay equal to its search).
   Nothing was re-recorded.
4. **tsc, gen2 and worlds tests, fast gates:** see "Gates" below. No stage id, seed or x literal added to engine code.

## What changed (all in src/game/gen2/pipeline.ts)
- **The search judges every rule.** V19b, "pool short", the node code, the flags and the verdicts were judged only after the search had
  returned, so every roll came back at re-roll 0 and nothing was ever repaired for them. `rollUnmet` puts them inside the search, on
  both settings. A rule that names a place swaps the section there; the rest roll the stage again. Alone: 9% -> 26% / 2% -> 23%.
- **The deal knows the pool** (`supplyDeal`, `unfilled`, `poolFits`). The deal typed nodes with no section to fill them (a combine
  dealt bounce: 38 graphs in 200). When the pool cannot fill a dealt stage, the fewest nodes are re-typed inside the deal's own rules.
- **The lay keeps scarce sections** for the node that has nothing else (a matching over the slots still to choose). With the deal: 34% / 31%.
- **V19b repaired from the gate's numbers** (`windowFix`, `LayOptions.lift`): a peaked section in the window is swapped; else the
  last slot that can climb that much more takes it.
- **A roll after a refusal paces its climb** (`LayOptions.pace`): it keeps back the rise its later nodes need and steers the kind of
  its ground joins (a step that would spend height becomes a pit, or a walk in a quiet node). It changes only what the plan stores,
  so a stored plan replays to the same stage. The joins are the big lever: without them 35% / 33%; with them 57% / 55%.

## Pushback and what the numbers hide (read this)
1. **Clean is not listable.** The seed list also holds a seed to the quiet line (4 s) and the squirrels, judged in
   tools/engine/seedlist.ts, outside the generator. By that bar 20 of 200 fresh seeds list (was 0 of 200; the audit's 1 in 300). Most
   clean seeds fail only the quiet line (40 of 43 before the pit joins; median 5.3 s). The generator cannot repair what it cannot see:
   the quiet line reads a bot route in tools/inspect. As a verdict in the search it needs the Architect (`deadTime`). Needs an R-id.
2. **Two sections do most of the damage:** w1-stair-test-back and w1-bank-stair-test-back hold the longest quiet stretch in 19 of
   those 40, set V19b's bar by their peak, and are in no proven plan (audit B-06). Content or Designer: re-cut or retire.
3. **Two lays, on purpose.** Pacing runs only on rolls after a refusal, so no proven seed can move. Pacing from the first roll would be
   one path and likely a higher yield, but it moves proven stages. Your call at the next list rebuild.
4. **A refused seed costs about 1 s now** (7 rolls) against 0.1 s. Listing 300 seeds: about 3,000 tries x 0.95 s (0.8 h CPU) against
   about 90,000 x 0.1 s (2.5 h). Play is untouched: it replays stored plans. Paced rolls lay more pits and fewer steps than the
   proven list does (fresh clean stages before the pit change: steps 20%, walks 37%; proven: 34%, 19%): the Designer should look.
5. **1 graph in 200** still deals a combine a type the pool lacks (seed 50124): the deal's own caps leave no legal re-typing.

## Gates
PASS: tsc; gen2 + worlds tests 338 of 338; yield tests 12 of 12; artcheck; knowncheck; roadmapcheck; seedlist 1-1 --check.
**buildcheck FAILS here on the base too, so not from this change:** Normal p95 163 ms on 06bbd29f, 155 and 170 ms on this branch
(limit 150; p50 68 ms on both; Easy passes on both). This container, or 0.9.6 itself: the integration runner should run it once.
## Not done
- No stills of newly clean stages: nothing new ships (Play draws the 200 proven seeds, all unchanged). Whoever lists new seeds looks.
- The window's place is still estimated by slot before the lay; `windowFix` repairs the misses afterwards.

## Turnover
reference/handoffs/engine-core.md §0d. Tests: src/game/gen2/yield.test.ts (8, each red on 06bbd29f); tools/engine/yield.test.ts (4,
the probe's counters; not in CI's glob: add it if the probe becomes a gate, `--min 50` exits 1).
