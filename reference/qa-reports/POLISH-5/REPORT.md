# POLISH-5 REPORT (t-polish-5 from t-polish-4@89e76bf; lead session_01FhBbYNzGRJBDMzn6XbtQK2). Opus 5.5 high. 12:30-1:23 AM ET 11-14 (90 min box).
**EXACT NEXT STEP (for POLISH-6):**
1. **Item 3, R-165.228 (the lead: GO).** Table: TABLE-1-1.md (both first-timer bots stuck + rescued on 10/10 1-1 runs, 0 on 1-2/1-3).
   Lever, measured on the 257 listed plans: every 1-1 roll lays w1-seed-perch (257/257) plus 1-2 more double sections (w1-stair-test 97,
   w1-bank-stair-test 71, w1-mushroom-log 56, w1-leap-stones 26, w1-backstep-twist 11, w1-high-step-twist 9, w1-fallen-trunk 6; w1.ts:387-1333,
   `needs: ['double']`). Keep the double teach + ONE test with its practice gap (w1.relay "(a) teach first"); take the rest out of 1-1's pool
   (by its brief/deal, never a stage id in engine code); rises over one jump become stairs/mushroom rises on both settings (Easy has 3 too).
   Re-run measure.mts + castBots 1-10 until 1-1 is the gentlest row; ONE 1-1 relist; tierBots calibration re-run and recommitted (BOTS.md);
   FIRST_RUN_11 (seed 9800) drifts with any 1-1 generator change: its lock must be re-picked by its owner's rule (firstRun11.ts header).
2. **Item 2, R-165.226: found, not fixed.** Matt's frame = 1-1 layout 17 (list seed 9800, THE FIRST-RUN LAYOUT), Easy: the mossy boulder on
   piece 97 (x 20938..21180, top 1127) stands 19 px short of its bank's lip (21199); its art is drawn ~100 px past it over a 81 px dip
   (floor slab 21199..21280, 54 px down). Still on this head: item2/matt-spot-head-easy-{upright,sideways}.jpg. The head's ruler calls that
   dip no pit, so pit-based scans miss it; measure by the stone's GROUND RUN (item2/overhang.mts): 1-1, all 257 layouts: 946 stones Easy, 914
   Normal drawn >6 px past their ground's edge (about 10%). On main (0.9.8) by pits: 56 Easy (item2/mainscan.txt).
   **Root cause: placement, not art choice.** For piece 97 every one of the 11 laid World 1 pieces is drawn 32-175 px past that lip except
   w1-rock-roots, whose art rises 52 px above where he stands. I tried "pick a piece that stays on its ground" (item2/tried-cut-choice.diff,
   tests in item2/w1Overhang.test.ts.txt, red without/green with): it put the root rock there, a flat-topped wall behind him
   (item2/first-run-easy-x21050-before-vs-tried.jpg, right). Worse than Matt's frame, so REVERTED; nothing of it is in the branch.
   Fix to build: the generator keeps a stone or stump its piece's drawn margin back from its ground's lip (or ends the ground under it),
   gate = overhang.mts's rule as a test with Matt's case planted. It moves rolls: 1-1 relist + the first-run lock. Do it WITH item 3 (same relist).
   Also seen: w1-rock-roots' art rises ~52 px above its standing top wherever it is laid (an art-data fault, footing line too low): ART lane.
   The boxy pit-floor slab (layout 4 soft pit, layout 17's dip floor) is code-drawn ground: not touched (art first).
## Done (evidence; heads named)
- **Item 0 (556ec00):** promises11.ts realFalls: a floor counts only UNDER the piece (spans overlap), not beside it. verdicts.test.ts seed-323
  copy planted with a bank at log 127's end (under the ruler only earth is a lip: the old copy read no hole at all) + a planted floor under
  branch 128 that reopens it. RED with the clause off ("seed 323: a 23 px opening, not a fall"), green with it. seedlist --check before/after
  on all five lists: logs identical (gates/check-{before,after}-item0-*.txt): moves no roll. Lead: accepted.
- **Item 1:** 1-2, 1-3 (1f88d2e), 1-5 (e1bb16b, lead: "1-5 in" after the four before/after sheets, stills/) relisted with --merge <order>
  --in-order. Same seeds, same order; plans moved ONLY on 1-2: 20 23 54 63 65 75 99; 1-3: 44; 1-5: 14 44 45 86 139 (JSON compare). Why 1-5's
  moved: the old pit code refused roll 0 for "an unmarked floorless gap at x 1980..~3010", which is continuous earth (37-51 px steps); the
  search now keeps roll 0. All five --check PASS. Layout numbers are 0-BASED (seedList.ts:220): list seed S of 1-5 is layout S-1.
## Gates, GREEN on e1bb16b (the last code commit; later commits are this report and logs). Logs: gates/.
  Full unit suite 3376 tests, 0 fail, 2 known TODO (also on 1f88d2e: 0 fail; verdicts.test.ts:323 passes). tsc 0; knowncheck, generality,
  roadmapcheck PASS; tool tests 33/33; tierBots 7/7; seedlist --check 1-1..1-5 PASS; the 155 tests naming 1-5 pass; build (BASE_PATH),
  chunkcheck, artcheck, kbdcheck, drawcheck, clipcheck (83 known, unchanged) PASS; buildcheck PASS ALONE (p95 111/82 ms). It FAILED
  once (210 ms) while the suite ran beside it: a timing gate, run it alone. tierBots calibration NOT re-run: 1-1 did not change.
## Polish check: 1-5 sheets (stills/1-5-moved-*.jpg, 40 stills, built setting printed by the game: stills/*-built.txt): same ground at x 2150;
  at x 2800 the flag sits on the step / an animal on layout 85; nothing floating, no pit, HUD clear (the lead judged the same). Item 2's
  attempt failed my own polish check and was reverted.
## Method used: level.md, gates.md, STAGE-RULES (realFalls, stills both orientations and settings). Lessons applied: D19 (the gate reads the
  same cutBox the screen draws), D29, D40 (item 2 waits for item 3's relist), D46, D59, D61 (rough attempt not passed), D62 (new shooter
  tools/engine/runs/stills-at-setting.mjs sets and PRINTS the built setting), D64 (my 12:44 context figure was against the wrong base).
## Method update: (1) a still shooter must print what the game built (stills-at-setting.mjs); (2) a "layout N" is the list's 0-based index:
  say so in castBots/stills docs; (3) a prop check measured by "pit" misses dips the ruler does not call pits: measure by the ground run.
**Learned:** a fix that only re-picks art can make a spot worse when no art fits: shoot the fixed spot with Pokey ON the piece before
believing a count that went to zero. The cause sat one layer down (where the stone was laid), so the gate must ask the generator.
