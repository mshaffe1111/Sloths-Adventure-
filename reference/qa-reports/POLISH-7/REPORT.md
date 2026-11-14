# POLISH-7 REPORT (t-polish-7 from t-polish-6@5605b11; lead session_01FhBbYNzGRJBDMzn6XbtQK2). Opus 5.5 high. 3:34-~5:0x AM ET 11-14.
Context at report: about 30-35% of 1M (my own estimate from the work done; I cannot read the session figure, D64).

**NOT GREEN. The full unit suite is RED: 17 failures in its first ~2620 results, then stopped at the box, the rest UNRUN**
(gates/gates-summary.txt lists each with its file and first error). Everything else in CLAUDE.md's Checks PASSES, buildcheck alone included.
**EXACT NEXT STEP (for the next member):**
0. **Fix the unit failures, then run the WHOLE suite to the end.** They are pins the cut and the relist moved, by kind:
   - the ctest survey needs plain words for w1-stone-stair-test(-back) (src/components/ctestStretches.ts; ctestSurvey.test.ts:12, :41);
   - w1.test.ts:7 "tags": w1-second-jump (and likely each cut section) lost '1-1' from `feel` while its tags still say 1-1; cut11 must keep
     the section's tags true (or the cut must go where the tags are read);
   - yield.test.ts:39: 52/200 graphs deal a combine node a type no section has: the deal must know 1-1 has no combine now (R-165.235);
   - seeds pinned by number that the relist dropped or changed: cameraBounce.test.ts:49/:64 (9800's bounce by the seed-perch log),
     softFalls11.test.ts:47/:72 (769 "laid as listed", roll 5's ground), proven.test.ts:29, helpLadderPieces.test.ts:15 (769's teach no
     longer needs the help: correct by design, re-pin to a piece that does; 9800 has no dip-double-teach; 23893's w1-two-answers is cut),
     helpLadderSweep.test.ts:14 (no rock grows now on either setting: re-read what it pins), w1.relay.test.ts:409 ((b) room for help).
   Re-pin each to the new list with its reason (D29), never loosened.
1. **1-1 is not yet World 1's gentlest row on Normal** (item 3's bar). Every remaining first-timer rescue on Normal is at the ONE kept double
   teach's rise, ~950 px into w1-double-teach / -dip-double-teach / -bank-double-teach (castBots layouts 3, 4, 6, 10; kid 6 also in
   w1-mushroom-fork-dip's 50 px dip at 1083 px). Easy (its teach rise 128-132) is 10/10 for both first-timers. Proposed lever (needs the
   lead's ruling, then ONE relist): Normal's double TEACH rise in Easy's band, 128-132 (one jump climbs 123; bands.md §1's 5 px spare holds),
   the test gap and the rest unchanged; re-run castBots kid/adult 1-10 + the calibration; re-pick the first run by its rule if it moves.
2. **sprint-B and sprint-C no longer roll on 1-1** (relist 169/257 kept): B needs a combine and C a twist, and every World 1 combine and
   clean twist asks a double. The two non-double bounce twists (w1-drop-bounce-twist, w1-dip-bounce-twist) are flawed at root: C1's help-
   room floor puts the mushroom ~330 px short of the D rise (bounce.no-purpose) and the run before it is quiet 4.4-5 s. Needs an R-id: new
   non-double combine + twist pieces for 1-1 (Matt's more-pieces rule), or those two twists rebuilt with the mushroom at the face.
3. buildcheck margin is thin (Normal p95 137-138 vs 150): Normal's first ~10 builds run cold (JIT), and the p95 of 30 lands on them; base
   471bd00 FAILS in this container (176). Worth a ruling on whether the gate should warm more than one build (a gate change is the lead's).

## Done (evidence; heads named)
- **Item 0 (becb79f).** World 1's settle (w1.ts) hands settleCut only the solids within 700 px of each stone (one x-sorted pass + binary
  search); settleCut stops at the first piece that needs no move. Output identical: platform hashes (id, x, y, width, cut) of every 3rd
  listed layout of 1-1..1-5, both settings, old == new. **buildcheck ALONE PASS twice: Normal p95 137 / 138 ms (Easy 77 / 75).** D15: the
  settle itself was ~0.5 ms a build in node; the red was mostly cold builds (above). Middle Normal put-backs 0.35 -> **0.45** with item 2
  (testers 0.7; back inside tolerance, `pass` in the table): yes, item 2 brought it back.
- **Item 1 (6dfffea, b5cdafe): the bounce teach is the bounce.** `TEACH_LIP` 174-180 px over the floor = 144-150 over the mushroom's cap
  (the game's plain bounce rises ~168 over the cap, POLISH-6 probe), for BOTH 1-1 bounce teaches: w1-mushroom-bank-teach (new beat `M`)
  and its pair w1-mushroom-lift (D21). bands.md §4 "the other way": a plain double (214) climbs it too, so it **teaches, it does not
  block**: the teach's lip names its mushroom (`from`) with no `block`; pipeline bounceCap reads `from` (never a double block); reach.ts
  `bounce-teach` band 174-180 both settings; verdicts.ts TAUGHT 'bounce' and the lesser move one jump (123). verdicts.test: the old
  planted 212 px case moved to the bounce+air test (still lesser-passes), new: 120 px teach lesser-passes, 174/177/180 accepted both
  settings, 168 and 186 band.out. **Gate** src/game/w1BounceTeach.test.ts: every listed 1-1 layout, both settings, RealPlay, walked from
  80/160/240 px with right held and NO press: he stands on the bank (82 s). **Red at the old lip** (TEACH_LIP back to 237-245: fail;
  gates/bounce-teach-red-at-old-lip.txt), green now. Measured after: bank 148-149 px over the cap (was 209-210).
- **Item 2 (6dfffea): 14 doubles out of 1-1's pool**, data only (w1.ts `CUT_11_DOUBLES`, their other stages keep them): second-jump,
  leap-stones, fallen-trunk, two-answers, stair-test(-back), bank-stair-test(-back), backstep-twist, high-step-twist, bounce-bough-combine,
  two-lifts, bounce-wall, mushroom-log. Kept: the double teaches with their practice gap and test (relay "(a) teach first"), and
  w1-seed-perch unchanged: it is the optional golden-seed find, its "past a double" promise is pinned (seedFind/required tests) and no bot
  stops there. The closing climb test (X node, ketsu, climb) had only doubles: **new pieces** w1-stone-stair-test and -back (single steps
  `c` 62-78 px, the quiet run-out `n h n h`), 1-1 only.
- **Relist (ONE, 6dfffea):** 1-1 `--merge <list order> --in-order --count 257`: **169 kept of 257** (gates/relist-1-1.txt); every sprint-B
  and -C roll refused (above). `seedlist --check` 1-1 (169), 1-2, 1-3, 1-4 (100 each), 1-5 (150) PASS.
- **First run re-picked once (b5cdafe):** 9800's plan held w1-bank-stair-test. P11's rule on the recommitted calibration: variants 1, 6,
  10, 20 have 0 put-backs/lives in the first 120 s and the whole run, no rescue (child + middle, both settings); **seed 9652 (variant 10)**,
  the first whose listed plan is its seed's own first roll (packs as the list packs it). My first try took 5542 and locked a replay under
  the list seed, not its reroll seed 5599797: seedListLoad.test caught it; fixed (firstrun-lock.txt). QA rolls (testlink1_1.json, from
  the list, no-reroll seeds): A 9652 (the first run), B 2328, C 5033. Roll-pinned tests 31/31.
- **seedList.test** now searches under the list's own quiet rule (`quietJudge`, as seedlist.ts and libstage.ts build): the new pool steers
  3 of its 3 picked seeds by that rule, and a search without it is not the search that listed them (D19). Not loosened: the same asserts.
- **tierBots calibration** re-run (child, middle, expert; variants 1-40; both settings) and recommitted (b5cdafe). Table vs POLISH-6's:
  child N rescues 12 -> **17** (worse; per-piece rescues are not recorded; castBots puts the first-timers' at the double teach rise),
  child E rescues 1 -> 0, child N/E finish 477/324 -> 464/304 s, middle N/E 210/203 -> 204/194 s, expert 178 -> 174 s.

## TABLE-1-1, re-measured (1-1 row only; 1-2..1-5 unchanged code, POLISH-5's rows stand)
| Stage | first-timer kid N / E | first-timer adult N / E | child N / E median s | middle N / E median s | expert N median s |
|---|---|---|---|---|---|
| 1-1 before (POLISH-5) | 0/10 / 0/10 | 0/10 / 0/10 | 482 / 329 | 216 / 209 | 192 |
| **1-1 now** | **8/10 / 10/10** | **6/10 / 10/10** | 464 / 304 (calibration p50) | 204 / 194 | 174 |
| 1-2 / 1-3 | 10/10 / 10/10 | 10/10 / 10/10 | 362 / 239, 455 / 309 | 165 / 162, 231 / 209 | 143, 196 |
**Read:** Easy is fixed for first-timers; Normal is much better but still behind 1-2 and 1-3 (next step 1). Logs: gates/castbots-1-1-kid-adult.txt.

## Variety / fun (the lead's ask 4:04 AM, read 4:35: D57 missed, my queue was not read at the 4:0x and 4:17 pushes)
funcheck (World 1's fun gate, layouts 1-16, both settings; gates/g-funcheck.txt vs g-funcheck-before-5605b11.txt): **FAIL on both, base
25 worse/new, this head 24** (46 entries to lower on both; not in CLAUDE.md's list, and red before this branch). 1-1's own lines, base ->
head: Easy "pacing" 12 -> 10 layouts (better); Normal "nothing bites" 97% -> 89% of beats free after 30 s (better); Normal "repeat"
15 -> 16 layouts (lost the one-layout gain; equal to its known 16, not over it); dead walk 16 -> 16 (4.0-4.2 s -> 3.0-3.4 s examples);
Normal "pacing" 13 -> 13. No 1-1 line is new or over a count it was under before. 1-2's "looks like the stage before (1-1)" 49% unchanged.
Variety in the plain sense: sprint-B and -C no longer roll on 1-1 (R-165.235, the lead 4:04 AM).

## Gates (CLAUDE.md order; logs gates/): gates-summary.txt. PASS: tsc, build, chunk, art, known, generality, roadmap, kbd, tool tests, seedlist --check 1-1..1-5, tierBots 7/7, roll-pinned 31/31, drawcheck, clipcheck (83 known), buildcheck ALONE (Normal p95 127). RED: unit suite (17 failures, rest UNRUN at the box).

## Polish check: stills/teach-{before,after}-1-1-L2-{normal,easy}-x*-{upright,sideways}.jpg, 2x, the built setting printed by the game
(BUILT lines: after seed 2328, before seed 982 on 5605b11's list; both settings). After: the bank face about two Pokey-heights over the
floor with the mushroom at its foot, the lip and petals on screen upright and sideways; before: about three. Reads as a bounce lesson.
Named, not changed: the after sideways frame shows a small mossy ledge set in a notch of the bank to the right (the section's next beats,
not this change); judge it on the test link.

## Pushback / rulings asked: (1) the plain-bounce teach no longer blocks (a double climbs it): the designer's documented trade (bands.md §4);
(2) sprint-B/C gone from 1-1 until non-double pieces exist; (3) Normal's teach rise (next step 1).
## Method used: level.md, gates.md, STAGE-RULES, BOTS.md, firstRun11.ts header rule. Lessons applied: D15 (buildcheck tested on the base
before trusting it: base fails too; castBots' rescues located before acting), D19 (seedList.test now builds as the list builds), D21 (both
bounce teaches), D29 (every roll-pinned test after the relist), D59 (no gate left running at stop; any unrun is named in gates-summary),
D62 (stills carry the built setting), D64 (context against 1M).
## Method update (level.md, proposed): "A cut from a stage's pool is checked against every graph the stage rolls BEFORE the relist: for each
node job x phase x content, list the pieces left (a 20-line pool script); a job left empty refuses every roll of that graph." Proof: this
relist lost all sprint-B/C rolls (88 seeds) that a pre-check would have shown in seconds.
## Learned (for the next builder): a first-run lock's seed must be a no-reroll seed (or the lock built from the plan's own replay seed);
a bounce lip that a plain bounce must land cannot also block a double (bounce 223 vs double 214 over the floor: 2 px of room).
