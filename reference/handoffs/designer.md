# Designer handoff (written 2026-11-07 6:57 PM ET, the last job of the designer session; for the role agents of the 6-role model, reference/TEAM.md)

Read first, in order:
- reference/LAWS.md;
- this file;
- reference/engine/NODES.md §8 (the node code and its key);
- reference/engine/W1-NEW-SECTIONS.md (every round).

Every ruling below cites the file and section where it's written in full.

## 1. Where the design data lives

| What | Where |
|---|---|
| The section specs, Rounds 1-12 and every amendment, with the supervisor's verdicts | `reference/engine/W1-NEW-SECTIONS.md` (engine-spec) |
| The node code, the key (codes, engine definitions, PIECES), rules V1-V21, the content mix, the sprint graphs | `reference/engine/NODES.md` (§1 jobs, §7 mix, §8 key and rules) |
| The world rulebook, plus the dated rulings at its end (two-road reported for 1-1, standing kinds ≤ 6, V18 to the summit, …) | `reference/engine/WORLD-RULEBOOK.md` |
| Piece labels and the floating rules (platforms may float, rocks never do, earth waits on Matt: use it from the floor up) | `reference/engine/LABELS.md` |
| 1-1's art audit (code-drawn pieces against the painted kit) and its stills | `reference/engine/W1-ART-AUDIT.md`, `reference/engine/art-audit/` |
| 1-1's designer brief, fitted to gen2's fields | `reference/engine/briefs/1-1.designer.md` (never on a cold builder's branch) |
| **SEALED:** 1-2's gap list and the secret-as-fork idea | `reference/engine/1-2-DESIGNER-NOTES.md`. Keep it off the cold 1-2 builder's branch; it's for comparing afterwards |
| The entered data (the porter's) | engine-core `src/game/gen2/worlds/w1.ts`: sections, JOBS, CONTENT, TERRAIN, VERSION_JOBS, the `easy` twins, W1_KIT (owns, decor, required, graphs) |
| The designer's own working notes | `reference/engine/DESIGNER-NOTES.md` |

## 2. The section pool (World 1, gen2)

- **The harvest:** old 1-1's stretches (learn, stones, cache-stones, stump-stones, stone-dips, second-jump, leap-stones, high-leaps, hop-bounce, bounce-run, stone-road, meadow, low-boughs, ledges, ropes).
- **#1-#30 (Round 1):** 30 sections, plus the seed perch (the planner's, required on every 1-1 roll).
- **#31-#46 (Round 4):**
  - teach 9 (3 each for jump, double and bounce);
  - forks with bounce and climb low roads;
  - climb tests and twists;
  - 3 signatures (#10, #44 log chain, #45 mushroom chain; all `feel ['1-1']`, unique in the game);
  - arrive #46.
- **#47-#62 (Round 5):** every binding job × type cell at 3:1 (descents, flows, twists, combines).
- **#63-#67 (Round 6):** ground and bounce combines, bounce tests, plus the level and back versions (laid as their own sections).
- **#68 (Round 7):** the arrive "home banks".
- **Easy twins:** every Normal double-GAP version has a rise twin (#8, #33, second-jump, leap-stones, #28-double).
- Each section carries its rhythm string (h/j/d/b/c/w/a and the block beats K/L/D/B), job(s), content type, terrain and block.

## 3. The rulings to keep (the ones most likely to be undone by mistake)

1. **Blocks (NODES §8.7, B1-B7):** every teach's check and every test needs its move. Nothing walks round it: not the floor road, a catch, a fork road, a join step, or the pit's own climb-out step. A pit in front of a block is back-only (backPit).
2. **Double gaps in PIXELS (W1-NEW-SECTIONS, Round 7 on):**
   - Normal: TEACH 195-205 px, TEST 205-228 px, with the teach's far bank ≥ 3.5 body widths.
   - **Easy: no double gaps.** Every double block is a rise twin of **110-114 px** (inside Easy's 113.9 clamp).
   - The physics: a single reaches 175 px (reachJump) plus 21 px of landing forgiveness (LAND_HALF). So share 0.70 (about 182 px) does NOT block. Never set a gap by share.
3. **The bounce teach:** a mushroom on the FLOOR, the lip 200-220 px. Taught by the lesson card `lesson.bounce`, never also a Dot line (no repeated tips).
4. **Teach order is jump, double, bounce.** Teach lines go on each T's ENTRY piece. **T sections are never mirrored**, because mirroring flipped #8's order.
5. **The log chain #44 version a is `d d b d`** (a mushroom seated on the third log). That's the 1-6 neighbour fix (distance 0.275, the last alike pair of 64). Don't make it four doubles again.
6. **Height (Round 12):**
   - V19c: the end ≥ 150 px over the window's start;
   - V19d: a window descent only with headroom to pay it back;
   - **V19e: the end log is the stage's highest standing point (within 108 px).**
   - The goal walk-on is 100-130 px onto main's 686 px end log (the 815 px cap).
7. **1-1 is one rising climb, not two roads.** Splits and two-road are REPORTED, not pass/fail (the lead, 11-06). They're 1-2's lines. 1-1's variety gate is stageVariety (distinct, inner, repeat, code); era's 0.35 is retired.
8. **Floor beats (FR7-FR10):**
   - both roads beat-dense (the measure reads the QUICKEST route);
   - low roads use ≥ 2 kinds;
   - section ends ≤ 430 px plain, interiors ≤ 850;
   - the goal is exempt.
   - The `h` rock stays **34-46 px** (solid with the route walls; measured better). ≥ 50 px is for walls only.
9. **V18 (climb):** judged from the FIRST climb step to the SUMMIT; the approach and the run-out are outside. A hop between climb steps is the level gap jump `a`. Mounds (knot-bank, mound-log) are `ground`, not climb.
10. **Floating (Matt, 11-06):** walked-on boughs, logs and planks may float with NO support (add none). Rocks, stones, pads and props never float. **Earth** waits on Matt's open A/B question (the "can it float?" ratings); until he answers, use earth from the floor up only (art-director.md §4).
11. **Branch share:** among thin landings, ≤ 30% on EVERY roll and no thin look over 38%, plus ground > branch on the whole stage. The levers: rungs alternate bough and log, catches and the perch become logs, and joins take the next section's entry kind (the planner).
12. **Hearts follow risk (V21).** 1-1 has 0.
13. **The reward (H) is structural** (outside the deal). The seed perch's failure on seed 102948 was the engine's corridor check, not the deal (my first diagnosis was wrong; NODES §7.1 is corrected).
14. **W1 `owns` and `not` (Round 8):** 1-1 and 1-2 each own their words; the signatures stay 1-1-only. 1-2's pool is 8 shared floor sections, by design: a COLD helper builds 1-2. Don't pre-build it.

## 4. Open items (none of these is finished; check each before assuming)

- **With engine-core and the porter, to enter or verify:**
  - Round 11 (the branch swaps), plus the per-roll thin-branch report on 16 seeds, both settings;
  - Round 12's rising versions;
  - the Easy twins at 110-114;
  - `gapPx` bands on #8, #33 and #34;
  - #44 `d d b d`;
  - mound-log retagged ground, and #53-#55 with the `practise` job;
  - #56 across at the same height.
- **With the planner, as gates:**
  - V19c/d/e together on every roll;
  - the first-timer bot clears every teach without rescue AND the no-move bot fails it;
  - V18 from the first climb step;
  - joins take the next entry kind;
  - the B7 join hits on seeds 1 and 39596;
  - re-measure the 64 1-1 × 1-6 pairs;
  - the 5 worst quiet stretches once FR9/FR10 are in (quiet median was 6.5 s, worst 13 s).
- **Matt or the lead:**
  - Matt's answer on the art swap (W1-ART-AUDIT §5);
  - earth chunks floating (A/B);
  - the art director's INTEGRATE-1-1.md still lists earth ledges as "may float" (corrected by Matt's rule; the source note is to be fixed);
  - the red spiky bromeliads and the backdrop logs (art director flags).
- **Not checked live yet:** `lesson.bounce` firing on a fresh-save gen2 roll (engine-core's QA commit 8cba3b067 began it).
- **On file:**
  - `w1-rope-gap` for 1-5's move to gen2 (the mixer's rope and punch are known failures carried there);
  - stage15's seed clause is to be REWRITTEN to the glint promise, not deleted.
- **Parked to next week:** re-shoot the bootprint on 1-1's end bank; W1 rot wood and side-branch art; render-stone fixes. 1-2 stays parked until 1-1 passes and Matt plays it.

## 5. Traps (each of these happened)

- **Times:** never type them; insert them from `TZ=America/New_York date`. UTC and ET get mixed in messages (a 7:44 that was 6:34).
- **Backticks in heredocs:** an unquoted heredoc turns each backtick into backslash-backtick. After every file write, run a sed that replaces backslash-backtick with a plain backtick, then grep the file to confirm there are 0 left.
- **Pipes inside table code spans** break GFM tables: escape them (`\|`).
- **Share vs pixels, and margin-limited vs physical reach:**
  - gen2's `share` is a fraction of the margin's maxGap, not of the true reach;
  - the no-move bot jumps the PHYSICAL reach. Rule in pixels.
- **Diagnose from the engine's own trace, not a code token.** `Hc1` was a loosened fill, not a typed H.
- **A design count must name WHAT it counts:** thin landings vs the whole stage gave 38% vs 8-19%.
- **Sealing:** 1-2's notes leaked into W1-NEW-SECTIONS for 10 minutes (commits 6412a6e52 and 609ee00b2 on engine-spec), so keep cold helpers off engine-spec.
- **Facts on main:**
  - 1-1's three newer Dot lines (bank, high, noMoss) live on engine-core, not main;
  - `ctest.bounce` is the testers' course, and the same words are protoStage's bounceWall hint.
- **Measured data beats my rule:** the `h` rock at 50-60 made the quiet line worse. Change the rule and say so.
