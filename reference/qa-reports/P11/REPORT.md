# P11: Matt's live 1-1 reports, fixed in the generator, then the list rebuilt (t-11-pass, base origin/t-int-engine @5d0239b2)

## Done (test-first; every step pushed)
1. **R-165.124, the dead-zone landing (verdict `landing.dead-zone`).** `src/game/gen2/landings.ts` judges every pickup's piece on the
   engine's own flights (`landFlights.ts`, flown on the real engine; `landFlights.test.ts` flies them again and compares). A piece passes if
   one plain flight lands on it first, with margin: a walk-off, a full single or double jump (held or straight up) with a 28 px take-off
   window, or a bounce. A piece over the arc counts as a ceiling, because the engine has no head bump and he lands on top of it.
   Planted from **Matt's seeds as v0.9.5-37 laid them** (`landings.test.ts`, the pieces copied in):
   - 15458 Normal and 15406 Easy: the petal log under a log is refused, and the real engine agrees (no walk-off or jump lands on it).
   - 21537: its log-under-log spots have a clean walk-off at 0.9.5 (from a low log beside them). Its dead zone on both settings is the
     find's high log over a mushroom, which only steering back in the air reaches.
   - Toy twins pass, and the clean ways the judge names are flown and land.
2. **R-165.126, bounce part (verdict `bounce.no-purpose`).** A mushroom must bounce him onto a higher road (50 px up or more), a find, a
   place no walk or single jump from its floor reaches (two answers' perch), or another mushroom with a purpose. Matt's three mushrooms on
   flat ground are refused; their twin under a bank passes. Both verdicts are PROMISES_11 entries, so the search repairs by them.
3. **R-165.122 hop rocks:** 9d9ebc94 cherry-picked (bc6784d5); its test passes 11/11 in the gen2 suite.
4. **Generator fixes:** the log chain's petal low log now reaches about 160 px past its start log, where a walk-off lands
   (`w1.ts` LOW_LOG_OUT). The rising chain keeps its low log where it was, because its first gap is the help ladder's set-back piece; the
   verdict refuses its rare dead-zone rolls. A catch bough now goes only under the part of a gap no piece already catches
   (`pipeline.ts` catchUnder). The first version of that change left a 27 px hole on Roll C; the gen2 suite caught it and it is fixed.

## The old 355 seeds, each rule alone (old plans replayed, no repair)
- dead-zone: **274** refused; no-purpose bounce: **6**; hop rocks (V19b after the rocks became walls): **3**; any of them: **280**.
  So 75 old layouts passed all three as laid.
- The log chain's low log alone accounts for most of the dead zones (37 of 40 in a 60-seed sample).

## The rebuild (seed-list.md; parts run in parallel with the new `--merge … --part` + `--combine`, no seed laid twice)
- The old 355 were re-laid fresh under the new generator and filtered: **312 kept**. The 43 left out are listed in LEFT below.
- Relay filter (b)/(c): **29 dropped**.
- Seeds whose replay is not the plain search's stage: **25 dropped**. This is seedList.test's rule; a list made with the quiet judge
  steering the search broke it on its last seed.
- **New list: 258 seeds**, in their old order (the minimum is 100). No new seeds were swept: a fresh search is now about 2-3 s a seed,
  so a 90k sweep would take hours.
- **First run: seed 9800 (variant 18)**, by C1's measure from the recommitted runs: zero put-backs and lives in the first 120 s for the
  child and middle bots on both settings, zero over the whole run, and no rescue. It was the only variant with all three.
  4106's old plan fails V19b once the hop rocks are walls, and 4106 is off the new list.
- Rolls A/B/C: 9800, 982, 1700. Tests that pinned dropped seeds were moved to listed seeds: 4106→9800, 3868→23893, and 1025→24432 in
  softFall11.
- Tier bots recalibrated, `calibration-main.jsonl` recommitted. Middle and expert bots have **one rescue: middle Easy, variant 8**. Child
  bots have rescues 3 (Easy) and 8 (Normal).

## Gates (final list, merged head with origin/t-int-engine d0276817; it adds World 1's pit painter)
- tsc PASS; generalitycheck PASS; `seedlist 1-1 --check` **PASS** (258 seeds, verdicts refuse 0, first run 9800 no drift).
- All 258 seeds: replay = plain search's stage (0 differ). Relay (b)/(c) PASS. tierBots.test PASS. Seed-pinned tests PASS:
  softFall11, helpLadderPieces, cameraBounce (20/0 on the merged head); helpLadder11 and helpLadderCadence before the merge (31/0).
- Lock vs base 5d0239b2: **101/102 unchanged; only 1-1 moved** (its list, the generator fixes, INT-E's pit painter).
- **gen2 + worlds suite on the final head: NOT FINISHED by the 11:30 stop** (55 ok, 0 failed when stopped). The run on the
  282-seed list was 451/455; its 4 failures drove the catch-bough fix, the list re-lay and the re-pins. Each of those 4 tests: re-run
  them, or the whole suite, before merging.
- funcheck on 1-1, base → new: dead walk 16 → 16 layouts (both settings); repeat N 12 → 13, E 13 → 13; pacing N 13 → 15, E 12 → 12;
  nothing bites 16 → 16 layouts, with the share of beats that cost nothing up (N 91 → 96%, E 87 → 97%). The real obstacles went up
  (rocks are walls now), but walls cost nothing when missed, so "nothing bites" reads worse. funcheck FAILED at base too.

## Polish check (stills: reference/qa-reports/P11/stills/, seed 9800 Normal, upright and sideways)
- x30000 and x30150, the log chain's low log: it sits out past the start log, with room to drop and both petals in view. Clean.
- x2690, a 79 px hop rock: reads as a stone step. Clean.
- x10040, the bounce-teach mushroom in front of its 200 px bank: reads as the way up. Clean.
- **Rough, not mine to fix here:** upright, the ground under the low log shows the dark jagged pit-wall band (R-165.129).

## Not done
- "Every landing" is judged only where a pickup sits. Judging every piece also catches off-route pieces (about 2 a stage, mostly
  outside any section), so laid route landings are still judged by the ask verdicts only.
- Hearts and checkpoints placed by risk (R-165.126's later part): not started, as the brief said.
- funcheck: see Gates. The hop rocks make **"nothing bites" worse** (Normal 91→96%, Easy 87→97% of beats cost nothing when missed),
  because walls are beats that cost nothing.

## LEFT (the 43 old seeds the re-lay refused, by reason; a seed can have several)
dead-zone 20; clean on both builds but refused by the quiet line or the squirrels 17; no-purpose bounce 4; floor.unmarked 3; V19b 1;
drop.untyped 1.
