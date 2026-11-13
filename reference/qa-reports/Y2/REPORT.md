# Y2: the generator's yield after the new landing verdicts (branch t-yield-2, base origin/t-int-2 @91af3475)

## Measured (`yield.ts 1-1 --par 4`, fresh seeds 50001-50200, clean = no gen2.errors)
| build | Normal clean | Easy clean | yield.test's 30 (both) |
|---|---|---|---|
| d0276817 (before P11/F12) | 113 (57%) | 109 (55%) | 15 |
| base 91af3475 | 88 (44%) | 84 (42%) | 11 (RED, floor 12) |
| base, the three new verdicts switched off (scratch only) | 112 | 108 | - |
| Y2 first try: the repair always on (one search) | 112 | 108 | 14 |
| **Y2 final: two searches, the repair on in the second** | **136 (68%)** | **136 (68%)** | **20** |
| (control: two searches, the repair off in both) | 118 | 117 | - |

On base the new three (stopped/alone, Normal; Easy): landing.dead-zone 28/5; 29/0. bounce.no-purpose 7/1; 22/1 (15 Easy-only).
chain.mount 0; 0. They cost about 24 seeds, mostly through the swaps and re-rolls they set off, not by refusing a roll alone. Of the 108
seeds clean with them off, 37 laid one of: a dead-zone petal row (w1-log-chain-rise 17 seeds, canopy-rungs 6, canopy-rungs-level 2,
high-walk-up 1; every one a petal row on a log) or an idle mushroom (drop-bounce-twist 8, dip-bounce-twist 6, two-answers 5, nearly all Easy).

## What changed (generator only)
1. `landings.ts repairLandings`: on one setting's built pieces, every mushroom with no purpose (the verdict's own `purposelessBounces`) is
   taken up, and every petal/bloom/leaf row on a dead zone (the verdict's own `deadZones`) moves, as a row, to the nearest piece a clean
   flight reaches inside its own section (never a room), its height over the top and its spacing kept, never within 40 px of another
   pickup. Finds and hearts are never moved. A row with no such piece stays, and the verdict refuses the roll as before.
2. `pipeline.ts checkAndRepair(..., landings = true)` runs it on judged stages, before the level check reads the stage.
3. `buildRolled`: a judged stage is searched first exactly as before with the repair OFF; only a seed with no clean roll is searched again
   on fresh rolls (roll maxRerolls+1 on) with the repair ON. Why two searches: with the repair always on, 10+ proven seeds' searches took
   another path (seedlist --check FAIL, e.g. 12522, 15965, 18644, 24432, 32434 ...: "its replay differs from its search"). Two searches
   move none. The control row shows the repair, not the extra rolls, is most of the gain (+18/+19 of +48/+52).
4. Tests: `landingRepair.test.ts` (7: toy dead zone moved with height/count kept; no clean piece in the stretch stays refused; a find is
   never moved; idle mushroom taken up, a chain under a bank kept; 4 fresh 1-1 seeds that laid these on base now carry neither, and the
   repair is what ran). Planted red: the function did not exist, and the fresh-seed test failed on the pipeline before step 2.

## Done items
1. yield.test.ts GREEN (20 of 30 clean on both; floor 12). 200-seed probe 136/136 vs d0276817's 113/109. PASS
2. No verdict, threshold, band, flight table or STAGE-RULES number changed: `git diff 91af3475 --stat -- verdicts*.ts reach.ts
   promises11.ts landings.ts landFlights.data.ts physics.ts STAGE-RULES.md yield.test.ts` = landings.ts +60, 0 lines removed (the new
   function only). PASS
3. `seedlist.ts 1-1 --check`: PASS (258 seeds, verdicts refuse 0, first run no drift), run twice, the second on an untouched tree.
   No list re-recorded. PASS
4. tsc PASS; generalitycheck PASS (27 literals, 27 known); knowncheck PASS; artcheck PASS; roadmapcheck PASS (after unshallow);
   tools tests (library, seedlist, yield, travelBots) 17/0; gen2 + worlds suite 488/488 (28 min). Lock (16 layouts x both settings, base
   91af3475 recorded fresh): 102/102 stages unchanged.
5. 1-3: t-w1-creatures (7d9efa0d) is NOT on the base. There 1-3 has no `judged` row (stageTable `'1-3': { kit: 'w1' }`), so it gets one
   search and the repair never runs on it: its yield cannot move from this change. Not measured.

## Costs and limits, named
- A seed the first search refuses now costs a second search (the probe: 192 s -> 380 s for 400 builds on 4 cores). Play draws 1-1 from
  the proven list (one replay), so play is not slowed; the yield, seedlist and lock tools are.
- The one seed d0276817 laid and Y2 does not lay in the first search (50028) is P11's catch-bough split (`catchUnder`): a 37 px bough
  part leaves a floorless slot findW1Pits now sees (floor.unmarked on Easy). Fixing it moves proven seeds; left alone (Suggestions).
- Lessons applied: D43 (no stage id/seed/x in engine code: gated on `judgedOnArcs`), D46 (the verdict's own judge drives the repair),
  "never loosen a verdict", "never re-record a list to pass" (two searches instead).

## Suggestions
- The biggest refusals left are V19b (60) and floor.unmarked (58) and "pool short" (failedAt bans carry across re-rolls); next yield packet.
