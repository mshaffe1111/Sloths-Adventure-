# POLISH-6 REPORT (t-polish-6 from t-polish-5@471bd00; lead session_01FhBbYNzGRJBDMzn6XbtQK2). Opus 5.5 high. 2:06-3:3x AM ET 11-14.
**EXACT NEXT STEP (for POLISH-7):**
0. **buildcheck RED on item 1 (fix first, before item 2):** w1World's settle hands settleCut every platform; give it only the solids
   within ~700 px of the stone (one x-sorted pass) and stop at the first candidate with dx 0; re-run buildcheck ALONE until Normal p95
   <= 150 ms (base 139), then the full Checks again. Item 1 must not merge until then.
**Then item 2, R-165.228, with the lead's 2:30 AM rulings (keep w1-seed-perch, cut the other doubles).**
1. **D15 done, the answer: the bounce TEACH asks a double.** The bots' 1-1 rescues are not at doubles (castBots kid Easy L1-4 on 471bd00,
   `stuck`: "a ~240 px wall ahead, the way on is ~123 px up" at w1-mushroom-bank-teach and w1-mushroom-log; Easy lays no double gap).
   Hand-scripted on e82b04f (bounce-probe.txt, RealPlay, Easy, layouts 1-6): walking onto the mushroom (from 80/160/240 px back, jump held
   or not) peaks ~42 px UNDER the bank top on all 5 layouts that lay the teach (bank 209-214 px over the mushroom top; a plain bounce
   rises ~168); only bounce + a second press at the apex gets up. Fix (the lead's ruling 2): the teach's bank at most ~150 px over the
   mushroom top (a plain bounce clears it with margin), both settings; same look at w1-mushroom-log's step; re-run bounce-probe until
   "walk/*: UP" on every layout, then castBots kid/adult 1-10 for zero rescues.
2. Then cut the other doubles from 1-1's pool on Normal (data in w1.ts `feel`, never a stage id in code): w1-second-jump, -leap-stones,
   -fallen-trunk, -two-answers, -stair-test(-back), -bank-stair-test(-back), -backstep-twist, -high-step-twist, -bounce-bough-combine,
   -two-lifts, -bounce-wall, -mushroom-log (the full list: scratchpad pool.mts, 18 1-1 sections need the double; 3 are the teaches).
   Keep w1-seed-perch (golden seed; required.test.ts, seedFind.test.ts) and give its approach a stair/mushroom rise if it asks a double.
   Re-measure: POLISH-5 measure.mts + castBots 1-10 until 1-1 is World 1's gentlest row; ONE 1-1 relist (--merge order --in-order
   --count 257); first-run lock (seed 9800 = RealPlay layout 18) re-picked by its header's rule; tierBots calibration re-run.
3. Art (the lead, 2:08 AM): Matt's pit floor (t-art-matt@ed4f59c0) in for the boxy soft-pit slab BEFORE that relist; lips on bank ground.

## Done (evidence; heads named)
- **Item 1, R-165.226 (bbeb1d9 code, e82b04f relist + lock).** The fix is in the LAY, before any check: verdicts run in buildGen2Stage
  before w1Finish (pipeline.ts applyVerdicts vs stageGenerator.ts w1Finish), so a later move would go unjudged. New kit hook
  `WorldKit.settle` (types.ts), World 1's in w1.ts calls `w1CutArt.settleCut`: of the pieces that fit a stone about as well as the best
  (pickCut's band, then any of its kind; never w1-rock-roots, POLISH-5's wall), the one needing the least move; whole-px move back from
  the lip; never into another piece. A bank that RISES at the run's end is no lip (the rock is drawn against its earth: 1-2 seed 81).
  None fits: the section is re-laid (versions first, then swapped; checkAndRepair). The lay moves the jumps (asks) and sockets on it.
  Measured over every listed seed's search (Normal): moves median 6 px, p90 16, max 32 (1-1); 1-2 max 38; 1-3, 1-4, 1-5: none.
  **Gate** src/game/w1Overhang.test.ts: every World 1 listed stage (PROVEN_INDEX '1-*'), every layout, both settings, RealPlay (the
  game's own build) + `overhangs()` (the cutBox the screen draws): 7/7 pass. **Matt's case planted:** his frame is 1-1 layout 17 =
  list seed **9652** (the game prints `BUILT {"seed":9652}`; POLISH-5 wrote "9800", which is layout 18, the first-run layout). Its
  471bd00 plan (fixture w1Overhang.case9652.json) without the settle reads w1-rock-boulder-moss id 97 x 20938, 104 px past its lip (RED);
  with it the old plan is refused by name and the search lays it clean (GREEN).
- **Relist:** 1-1 `--merge order --in-order --count 257`: 257/257 kept, same order (gates/relist-1-1.txt). 1-2..1-5 `--check` PASS
  unchanged (their plans hold; 1-2's stones moved in place, plan identical).
- **First-run lock re-recorded once** (seed 9800): plan and foes identical; the build without the settle gives the old hashes exactly;
  only `cut` moved: Normal 2, Easy 3 stones take a piece that stays on its bank, none moved (firstrun-lock.txt).
- **tierBots calibration** re-run (child, middle, expert; variants 1-40; both settings) and recommitted (c1fda58); tierBots.test 7/7.
  One table row newly outside tolerance: middle Normal put-backs 0.43 -> 0.35 a run (testers 0.7): 1-1 a little gentler. Named, not hidden.
## Gates on e82b04f (frozen worktree, CLAUDE.md order; logs gates/; c1fda58 adds only the calibration file + reports):
  tsc 0; knowncheck, generality, roadmapcheck PASS (roadmapcheck needed `git fetch --unshallow`: a fresh container's clone is shallow);
  build (BASE_PATH) + chunkcheck + artcheck PASS; kbdcheck PASS; tool tests PASS; seedlist --check 1-1..1-5 PASS; drawcheck PASS
  (631 s); clipcheck PASS (83 known, unchanged); tierBots 7/7 (on c1fda58). Full unit suite 3383 tests
  (3376 + 7 new), 0 fail, 2 known TODO. **buildcheck RED (alone, twice): 1-1 Normal p95 185 / 182 ms vs 150 (Easy 120 / 94 PASS); base
  471bd00 alone: 139 ms PASS.** p50 +12 ms on both settings: the settle's cost (each stone scans every platform per candidate piece).
## Polish check: stills/matt-spot-after-*.jpg (upright + sideways, Easy + Normal, built setting printed). Layout 17 now lays another
  section there: a log ledge on a stump over him (Easy), stones on the bank (Normal); nothing over air, HUD clear. The 471bd00 still
  (POLISH-5 item2/) is the before. A faint darker band in the earth under the Easy ledge is the earth painting, not a piece: named.
## Pushback: (1) item 2's lever as written cut the golden seed's perch and missed the bots' real stops (sent 2:4x; the lead ruled 2:30).
  (2) POLISH-5's "layout 17 = list seed 9800" was off by one (RealPlay layout n = list index n-1). (3) POLISH-5's mainscan.mts imported
  absolute paths from its own container: tsc failed on a fresh tree; kept as mainscan.mts.txt.
## Unresolved: buildcheck RED (above; not shipped-ready). Item 2 not built (box); item 4's "two stills of a cut double's place" waits on item 2. The rock-roots footing fault (art
  rises ~52 px above where he stands) still stands where pickCut lays it: ART lane.
## Method used: level.md, gates.md, STAGE-RULES. Lessons: D15 (bot tested before trusting: its stops are the bounce teach), D19 (gate
  reads cutBox as drawn, via RealPlay), D29 (every seed-pinning test in the full suite after the relist), D40, D46, D57, D59, D64.
## Method update (level.md): "A change to how a piece is drawn on its ground goes in the LAY (WorldKit.settle), never in w1Finish:
  verdicts and the list's replay judge the lay." And: "layout n plays list index n-1; read `BUILT` from the still, never assume."
## Turnover: reference/handoffs/art-director.md §0e rewritten (this commit).
