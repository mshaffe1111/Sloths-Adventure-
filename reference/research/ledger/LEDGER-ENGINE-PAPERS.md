# Ledger: the Carmo thesis and the Tanagra paper (engine sources, 2026-11-04)

Helper: research dissection, 2026-11-04 evening (5:09-5:55 PM ET). Method: `reference/methods/research-ledger.md`.
Sources, every line read:
- `reference/research/engine-2026-11-04/CARMO-thesis-2024.txt`, 1402 lines ("C" + line). Pedro Neves Souza Carmo, "Collapsing Through
  Anxiety: a Novel Approach to 2D Side Scrolling Platformer Level Generation", Allegheny College senior thesis. The cover says "22 July
  2022" (C22), but the references cite 2023-2024 software (C1280, C1329), so it is probably the 2024 thesis with a stale cover date.
  The text copy loses the tick marks in Tables 1-2 (C721-783: which rule combinations exist) and every figure; the .pdf has them.
- `reference/research/engine-2026-11-04/TANAGRA-paper.txt`, 155 lines ("T" + line). All of the paper's text sits on T113; the rest is
  PDF-viewer menus. **Completeness:** this is the whole 2-page AIIDE 2010 demo paper (Smith, Whitehead, Mateas, "Tanagra: An Intelligent
  Level Design Assistant for 2D Platformers", pp. 223-224; the viewer shows "of 2", T81). Two spans are garbled where the figure overlaps
  the text: "A diagram desc rastructure is shown in Figure 1" and "the multi- -jump patterns". The .mht has the same gaps: it holds only
  HTML, CSS and two images, no PDF (checked its Content-Type parts). Figures 1-2 survive only as labels. **It is not the longer
  FDG 2010 paper** ("Tanagra: A Mixed-Initiative Level Design Tool"; Gemini's works cited #6) or the 2011 journal paper. Those hold the
  constraint relaxation, beat-timeline editing and evaluation that the Gemini answers credit to Tanagra (CRITICAL-AGENTS L75, L91, L119).
  Recommend fetching the FDG 2010 PDF (users.soe.ucsc.edu/~ejw/papers/smith-tanagra-fdg2010.pdf) before the planner relies on those claims.

Compared against: `reference/engine/LEAD-SKETCH.md`; `src/game/beatTrace.ts` and `src/game/w1Rhythm.ts` **on branch w1-rhythm
(origin 5ef13375; neither file is on this checkout's branch)**; `src/game/levelCheck.ts`; `tools/inspect/pacing.ts`; `tools/validate/`
(core, evaluate, variety, look, score, funcheck); `reference/W1-REBUILD-PLAN.md`; `reference/STAGE-RULES.md`; `reference/GEMINI-LEDGER.md`.

**Note for tonight's designer:** §4 below cites the lead's sketch. A designer kept blind to the sketch should skip §4 (see
LEDGER-CRITICAL-AGENTS §2.1).

Lead's steer (5:20 PM ET, Matt): direction over detail; big picture first; weak points short, only where they change a decision.

---

## 0. The big picture: how these two works change the way we build stages

The two works are the two ends of the choice the engine has to make, and both point the same way.

- **Carmo is "roll, then filter," measured.** Pieces cut from real levels get edge labels and a difficulty label, a chosen difficulty
  curve filters which pieces each slot may take, and WFC fills the slots. The result: 8.8-23% of levels unplayable in every round
  (C1133-1143), and runs that simply stopped when the library lacked a piece the curve asked for (C1006-1011). Weighting the dice
  toward safer pieces barely helped (12.3% -> 12.2%, C1141-1143). This is our "roll, check, reroll" problem (D30) with numbers on it.
- **Tanagra is "build it right by construction."** Beats are "the glue that holds our levels together" (T113). Every pattern's length
  comes from the beat and a movement model, and a constraint solver places the geometry, "ensuring that the generator will never
  produce an unplayable level" (T113). Patterns are a hierarchy: single-beat pieces composed into multi-beat ones with extra rules.
  The designer can pin pieces and change the pacing without touching geometry.

What this means for us:
1. **Keep going the way beatTrace.ts already goes** (Tanagra's way): build under Pokey's simulated feet, on the beat, and let checks
   confirm rather than select. Carmo is the measured warning about the other way.
2. **Carmo's best ideas are about the piece library, and they are the cure for "everything feels the same":** (a) label every piece's
   entry and exit, its difficulty and its mechanic; (b) keep a **coverage table** of every combination a world's curve can ask for, and
   fill the holes with new pieces instead of letting the generator scrape by (C712-746, C787-789). That is Matt's "more pieces" rule
   (CLAUDE.md, 2026-10-30) turned into a gate. (c) **Cap universal connectors**, because too many "lower variety" (C831-833). Our
   flat 200 px apron at both ends of every node (beatTrace.ts 19, 146) is exactly such a connector.
3. **Tanagra's pattern hierarchy is the template library LEAD-SKETCH item 4 wants.** Single-beat steps already exist (beatTrace
   `Step`). The missing layer is named multi-beat patterns with their own rules (a staircase, a pit/mesa, a vine chain). Each is
   traced, never hand-placed.
4. **Mixed-initiative fits our helpers.** A builder (human or AI) pins the signature moment by hand, and the engine fills the rest
   around it on the beat. Editing a node's bars re-paces it without hand-moving geometry. This is how a helper's design time goes into
   the moment players remember, not into padding.
5. **Difficulty as an input, not a measurement.** Carmo chooses the curve first and builds to it (C523-526). We measure tension after
   (pacing.ts) and apply the research's curve by hand (W1-REBUILD-PLAN 29-36). The stage spec should carry the curve and the
   generator should honour it per node.

## 1. Each work's method in plain words

**Carmo (thesis).** First try (C553-641): Godot's overlapping WFC, which learns from example levels; 26 tiles cut from Mario rhythm
groups. It gave variety but no control: a "hard" input bundle could still give an easy level (C629-630), because WFC doesn't promise
to use any given tile (C611-615). Second, real method (C647-941): tiling WFC in Python/Pygame. 185 pieces, each a 10x15-block slice of
Super Mario Bros. holding one or more rhythm groups (C657-661, C839-843). Each gets:
- an edge label for the platform height at its left and right edge: LOW (under 6 blocks), MID (7-10), TOP (over 10), because Mario
  jumps 4 blocks from a standstill (C673-683). Only matching labels may touch, which rules out unreachable joins (C691-695);
- a difficulty label: first by gap width (C700-702), then by obstacle count (gaps + enemies): EASY 0-1, MEDIUM 2-3, HARD 4-6 (C752-754).

Missing label combinations broke generation, so 9 pieces were hand-made (C787-789) and 3 "all connector" pieces added (C819-835):
197 in all. A level is 10 empty slots (C838-841). The designer's curve (e.g. rising
[E,E,E,M,M,M,M,H,H,H], peak [E,M,M,M,H,H,M,M,M,E]: C922, C929) filters each slot's pieces at the first collapse. The curve is applied
only after the first piece lands so the first position varies (C868-875). Then WFC repeatedly fills the slot with the fewest options
and drops neighbours whose edges don't match (C861-895). Evaluation (C944-1172): 11 rounds of up to 1000 levels; tile-use spread
(Table 4); playability by testing every gap against Mario's jump parabola (C1086-1105), with a fix for platforms reachable before the
arc's top (C1106-1125).

**Tanagra (demo paper).** A design assistant, not a batch generator (T113). The designer edits geometry or pacing in a GUI, and the
tool fills in or repairs the rest "in realtime". Three parts (Figure 1 labels): ABL, a reactive planning language, holds a
**library of geometry patterns** as hierarchical behaviours and watches designer edits. Choco, a constraint solver, solves the
positions and sizes. A working memory and the GUI sit between them. **Beats** are the unit: "Each beat corresponds to an action that
the player takes in the level, such as jumping over a gap or killing an enemy", and they decide each pattern's length "as their length
must correspond to the duration of the beat they belong to" (T113). Five single-beat patterns: a long platform, a gap between two
platforms, an enemy on a platform, a stomper on a platform, a spring over a gap. Two multi-beat patterns: staircases (with "the
constraint that the height of each gap in the staircase must be equal") and pits/mesas. Components (platforms, gaps, enemies,
stompers, springs) carry position and size as constraint variables, with internal rules, e.g. "if the width of a gap is zero, its
height cannot also be zero, and vice versa" (T113). Evolutionary methods are rejected as too slow for a realtime tool (T113).

## 2. Ideas we don't have (cited)

Ranked by how much each fights "everything feels the same" and per-stage cost.

1. **Coverage table for the piece library** (C712-746, C770-789, C1004-1011). Every (entry, exit, difficulty) combination must exist,
   or generation breaks or scrapes by. We have no piece library yet (LEAD-SKETCH 14 plans one) and no coverage check.
2. **Cap universal connectors** (C831-833: "adding too many of them could end up lowering variety"). Every beat-traced node starts and
   ends on a flat 200 px apron with a checkpoint (beatTrace.ts 19, 146; W1-REBUILD-PLAN 32). Nothing measures how alike our node seams
   look. look.ts compares pieces and art across stages, not the seams.
3. **Named multi-beat patterns with their own rules** (T113: staircase = single-beat jumps + "equal height" rule; pits/mesas). Ours:
   ad hoc helpers inside w1Rhythm.ts (vineChain 415, rottenBough 490). There's no pattern layer every world shares.
4. **Pinned pieces, regenerate the rest** (T113: "Dark platforms are those that the user has modified from the generated level";
   "regenerating specified portions of a level"). NOT in ours.
5. **Pacing edits without geometry edits** (T113: "modifying the pacing of the level itself, without needing to manipulate geometry at
   all"). Ours can do it in principle: change NodeSpec.bars and retrace (beatTrace.ts 58-74). No stage spec drives it yet.
6. **Difficulty curve as a build input, piece by piece** (C523-526, C863-875, C897-902). Ours: measured after (pacing.ts 11, "tension:
   risk per second in 9 equal parts"); applied by hand (W1-REBUILD-PLAN 29-36).
7. **Search instead of random retries.** Tanagra solves for values that satisfy the constraints (T113, Choco). Our fitSteps draws up
   to 160 random step lists until one traces (w1Rhythm.ts 147). The error from traceNode already says which step failed and why
   (beatTrace.ts 380-466). A small search driven by that error would be faster and exact.
8. **Piece-use spread across many rolls** (C1030-1073, Table 4: most/least-used counts, mean, standard deviation). Ours: no template
   twice in a row and at most twice per stage (variety.ts 43, 48), and stage-vs-stage likeness (look.ts). Nothing finds dead or hogging
   pieces across 200 rolls.
9. **A checker that can only be wrong in the safe direction** (C1247-1249: "it only produces false negatives, thus it cannot deem an
   unplayable level as playable"). Our levelCheck already leans that way (MARGIN 0.97 minus TAKEOFF_SLACK, levelCheck.ts 67, 111, 124).
   gates.md doesn't state it as a rule.
10. **Two passes: terrain first, then enemies by a second solver** (C1203-1209). Ours: hazardSpots() places hazards on the lines the beat
    made Pokey avoid, after the trace (beatTrace.ts 33, 566). That is IN in spirit and better aimed.
11. **Adjacency by look, not only by height** (C1230-1235). Ours: art sets roll with a cooldown (STAGE-RULES 225); no edge rule for looks.
12. **Seed the library from levels already judged good** (C657-661: pieces cut from Mario). Ours: the five rebuilt W1 stages' nodes
    could be the library's first entries, each labelled.

## 3. Numbers and formulas

**Carmo**
- Piece: 10x15 blocks of 16 px = 160x240 px; level = 10 pieces = 1600x240 px (C838-843).
- Height bands: LOW under 6 blocks, MID 7-10, TOP over 10; Mario jumps 4 blocks from a standstill; levels start at least 2 blocks up
  (C676-681). (Exactly 6 blocks falls in no band, a hole in the rule.)
- Difficulty v1: EASY no gaps; MEDIUM combined gap width under 4 blocks; HARD over 4 (C700-702). Result over 185 pieces: 50% / 46% / 4%;
  12 of 27 combinations missing (C712-719).
- Difficulty v2: obstacles = gaps + enemies; EASY 0-1, MEDIUM 2-3, HARD 4-6 (C752-754). Result: 16.7% / 64% / 18.3%; 9 missing
  combinations, filled with 9 hand-made pieces (C756-789). Plus 3 all-connectors: 185 + 9 + 3 = 197 (C834-835, C851-854).
- Rounds: 11; 1000 levels each except 3-5 (345, 136, 68: generation stopped on a missing piece) (C1004-1011; Table 3 C964-1002).
- Playability (Table 5, C1130-1143): unplayable 18.7, 23.0, 8.985, 12.5, 8.824, 16.6, 14.4, 13.9, 12.3, 16.4, 12.2%. Mean playable
  85.654% (we recomputed: 85.654). Weighting toward safer pieces (round 11 vs 9): 12.2% vs 12.3%.
- Variety (Table 4, C1038-1059): mean uses per distinct piece = placements / distinct pieces (round 1: 10,000 / 185 = 54.05, as
  printed). Rounds 9 and 11 print 754 and 753 "total tiles", but their mean (133.333) means 75 distinct pieces. Round 2 prints 78 where
  its mean implies 178. So the table has typos. The "0.05% of levels" repeat claim (C1192) isn't derived anywhere in the text.
- "185185 different levels" (C1079) is 185^10 with the exponent lost.
- Generation time about 2.3 s per level (C1250-1251).
- Jump test, equation (1) (C1097-1098): result = (−Y + a) − (82/5041)(X − b)² + (164/71)(X − b); jump is doable if result > 0. Worked
  out: 5041 = 71², so the arc peaks 82 px up at 71 px out and lands 142 px out (about 5.1 blocks high and 8.9 blocks long at 16 px).
  Fix for platforms met before the peak: any platform before the vertex within the standstill jump height counts as reachable
  (C1120-1124).

**Tanagra:** no numbers in the demo paper. Counts only: 5 single-beat patterns, 2 multi-beat patterns, 5 component types (T113).

**Ours, for comparison** (beatTrace.ts on w1-rhythm): APRON 200 px; INSIDE 8 px; CLUMSY 100 ms late with 85% air; MIN_GAP 40;
DEAD_WALK 2.5 s; GAP_REPEAT 4 within GAP_SAME 12 px; MIN_LEDGE 90; measured limits: flat jump gap about 104 px, a double about 200,
a face up to 70 px Normal / 42 Easy, a branch up to 90 (beatTrace.ts 37-38, 146-175).

## 4. How each would fit our engine (cites our code; designer: skip this section)

| Idea | Where it plugs in | Fit |
|---|---|---|
| Beat as the unit that sets pattern length (T113) | beatTrace NodeSpec {bpm, bars, steps} (58-74); traceNode (354) | Already IN, and with the engine's real physics (beatTrace.ts 13), stronger than Tanagra's "simple model of avatar movement". |
| Single-beat patterns (T113) | beatTrace `Step` {move, dy, surface} (52-57) | IN. Tanagra's five map to ours: long platform = a run/'.'; gap = jump step; enemy on platform = a hazardSpots critter; stomper = no direct match (closest: crumble, falling things); spring = mushroom bounce (move letter M, core.ts header). |
| Multi-beat patterns with rules (T113 staircase, pits/mesas) | a new `patterns.ts` beside beatTrace: a pattern = a list of steps + rules, traced as one node part; LEAD-SKETCH 14 "template library" | NOT. Our rule GAP_REPEAT (beatTrace.ts 167-169, 466) refuses the same gap 4 times in a row, so a Tanagra-style equal staircase longer than 3 steps fails on purpose (1-1 was sent back for straight staircases, STATUS 903). Keep our rule; a staircase pattern varies one number each step. |
| Gap rule "width 0 => height not 0" (T113) | beatTrace.ts 441: "the gap is N px: no jump at all (make it a drop, a rise, or a bigger move)"; MIN_GAP 40 (164) | IN, the same rule. |
| Solver instead of random retries (T113 Choco) | w1Rhythm.ts fitSteps (147, tries = 160) | PART. Replace random tries with a small search over dy and surface steered by traceNode's error. |
| Pinned pieces + regenerate around them (T113) | stage spec (LEAD-SKETCH 13) gets `pinned:` nodes built by hand; the generator traces the nodes between them, matching their x/yOut (Trace.x1/yOut, beatTrace.ts 32) | NOT. This is where the signature moment lives. |
| Pacing edit without geometry (T113) | stage spec lists each node's bars; the generator retraces | PART (the mechanism exists). |
| Edge labels (C662-683) | each library pattern declares entry/exit height and surface; nodes join by exact x1/yOut, so bands aren't needed for reach, only for coverage counting | PART. |
| Coverage table (C712-789) | new check in tools/validate: for each world profile (LEAD-SKETCH 12), every (entry, exit, difficulty tier, mechanic pair) the curve asks for has at least N patterns (proposal: 3) | NOT. Matt's "more pieces" rule as a number. |
| Cap universal connectors (C831-833) | the 200 px apron (beatTrace.ts 146); a seam-likeness count in look.ts | NOT. Vary the apron (length, slope, a rest prop, Dot's spot) and count repeats. |
| Curve as input (C523-526, C897-902) | stage spec "curve placement" (LEAD-SKETCH 13); per-node density target vs Trace.density (beatTrace.ts 120-121, 511) | PART (density is computed; no target is enforced against the spec). |
| Piece-use spread over rolls (C1030-1073) | tools/validate (beside variety.ts) over 200 rolls per world | NOT. |
| Safe-direction checker (C1247-1249) | levelCheck.ts 67-124 (MARGIN 0.97, TAKEOFF_SLACK) | PART. Write it into gates.md as a rule for every new gate. |
| Single-route checker blind spot (C1167-1172: only the lowest path tested) | core.ts builds moves from the inspector's quick route (tools/inspect/route.ts) | PART, unverified. Structure flags judge one route; a split stage's other road may be unjudged. To check. |
| Terrain then enemies (C1203-1209) | hazardSpots (beatTrace.ts 566) after traceNode | IN. |
| Library seeded from proven levels (C657-661) | label the rebuilt 1-1..1-5 nodes (w1Rhythm.ts, w1Rise.ts) as the first library entries | NOT. Cheap start. |

## 5. Limits (only what would change a decision)

1. **Carmo works on a flat grid of 10 fixed-size slots and Mario blocks.** Its numbers (bands, obstacle counts, the parabola) don't
   carry over; its library and coverage ideas do. Decision: take the ideas, not the numbers.
2. **Carmo's difficulty = counting obstacles,** blind to how pieces combine (CRITICAL-AGENTS L97, Polymorph). Decision: a pattern's
   difficulty tier comes from our clumsy-thumb trace (checkTrace) and the bots, not a count.
3. **The Tanagra text is the 2-page demo only.** Its "never unplayable" is a claim with no evaluation in this text. Gemini's relaxation
   and unsat-core details aren't in it. Decision: fetch the FDG 2010 paper before the planner builds on those specifics. The
   direction (beats + patterns + by-construction) doesn't depend on them.
4. **Tanagra is realtime and designer-driven.** We need batch, seeded and deterministic output. Decision: take the pinning and pacing
   edits as spec features, not as a GUI.

## 6. Full ledger

Status: IN / PART / NOT in our code (file:line; beatTrace.ts and w1Rhythm.ts are on origin/w1-rhythm 5ef13375). "Summary?" = in any
summary we have (only the README index lines 17-18 name these works): "idx" = only named there, "-" = no.

| # | Line | What it says (its numbers) | Summary? | In rules / plan / roadmap / validator? (cite) | Status | Proposal |
|---|---|---|---|---|---|---|
| 1 | C25-35 | Abstract: anxiety curves + rhythm-group metadata + WFC give variety and difficulty control | idx | - | PART | §0 |
| 2 | C159-173 | Pure randomness (Rogue) is unplayable or boring; PCG aims for playable, challenging, interesting, not tedious | - | STAGE-RULES §0 | IN (rules) | - |
| 3 | C176-180 | Fun judged by flow or an anxiety curve | - | pacing.ts tension (11, 29-30) | IN (measured) | - |
| 4 | C187-194 | WFC = a constraint solver: assign values under rules; backtrack or fail | - | - | n/a | - |
| 5 | C195-203 | WFC used in Bad North, Townscaper, Caves of Qud (world map, then local areas) | - | - | n/a | - |
| 6 | C205-244 | Terms: level, tile set, tile (a unit or a group of tiles), cells | - | - | n/a | - |
| 7 | C247-292 | Platformer history (Space Panic, Donkey Kong, the term from 1989 UK magazines) | - | - | n/a | - |
| 8 | C294-319 | Side-scrollers rarely use PCG: the challenge is in the planned layout; Spelunky's grid of room templates suits PCG; non-grid platformers don't | - | GEMINI-LEDGER A5 (Spelunky) PART | PART | - |
| 9 | C322-329 | WFC in grid platformers only (Bug with a Gun) | - | - | n/a | - |
| 10 | C332-339 | Argument: WFC output is controllable without losing variety | - | - | n/a | Contradicted by its own results (row 29) |
| 11 | C341-352 | Anxiety curve as an input: the user picks a difficulty curve; the generator maps it to obstacles | - | W1-REBUILD-PLAN 29-36 (by hand); LEAD-SKETCH 13 | PART | Curve in the stage spec, enforced per node |
| 12 | C353-360 | Two tests: variety under adjacency rules; playable start to finish | - | funcheck + levelCheck | IN | - |
| 13 | C363-373 | Impossible = gap too wide or wall too high; Rogue tuned enemies by replaying | - | levelCheck.ts; first-timer bot | IN | - |
| 14 | C381-430 | WFC (Gumin 2016): N x N patterns, place, prune neighbours, pick the cell with the fewest options, repeat | - | - | n/a | - |
| 15 | C431-446 | Rhythm groups (Smith et al.): paths, cells, portals; a group = a challenge ending in a short rest | - | STAGE-RULES 43; GEMINI-LEDGER A6, E4 | IN | - |
| 16 | C452-459 | Portals switch paths (pipes, moving platforms) | - | split roads (STAGE-RULES §0b) | PART | - |
| 17 | C465-480 | FI-2Pop GA: two populations (feasible, infeasible) with migration; rejected as too much setup | - | - | NOT | Not taken (cost) |
| 18 | C483-493 | ORE: chunks from a library placed around the player's possible positions; joining chunks is hard to tune | - | beatTrace places under simulated feet | PART | - |
| 19 | C496-513 | Adaptive difficulty examples: Crash (Aku Aku after deaths, slower boulder, crate continue point), RE4 difficulty scale, Hades God Mode | - | Easy mode (easyStage), rescue; ROADMAP? | PART | Not for tonight |
| 20 | C514-526 | Anxiety curve judged on the level without play: obstacles' difficulty over length; used as an input, curve first | - | pacing.ts (after) | PART | Row 11 |
| 21 | C529-545 | Validation = can each obstacle be passed (jump distance + timing leniency) + how many distinct levels | - | levelCheck MARGIN; CLUMSY (beatTrace 150) | IN | - |
| 22 | C555-575 | Godot overlapping WFC add-on; 26 tiles from Mario rhythm groups; example levels drawn in Aseprite | - | - | n/a | - |
| 23 | C580-583 | Overlapping WFC recombines input in new ways | - | - | n/a | - |
| 24 | C585-605 | Obstacle 1: difficulty control needs many tile bundles | - | - | n/a | - |
| 25 | C607-641 | Obstacle 2: no guarantee a tile is used, so a hard bundle can give an easy level | - | - | n/a | Evidence against learn-from-examples generators |
| 26 | C647-654 | Tiling WFC: rules from metadata, not examples (Python 3, Pygame) | - | - | n/a | - |
| 27 | C656-665 | Pieces cut from SMB overworld levels, each one or more rhythm groups (enemies + jumps); edge heights -> adjacency; difficulty judged per piece | - | - | NOT | Seed our library from rebuilt W1 nodes (§2.12) |
| 28 | C673-683 | Height bands LOW < 6 blocks, MID 7-10, TOP > 10; Mario jumps 4 blocks from rest; min start height 2; only matching labels adjacent | - | nodes join exactly (Trace.x1/yOut, beatTrace 32) | PART | Labels for coverage, exact join for reach |
| 29 | C691-695 | Adjacency labels rule out unreachable joins (LOW next to TOP banned) | - | traceNode refuses unreachable steps (385, 418-422) | IN | - |
| 30 | C696-711 | Difficulty v1 by gaps: EASY none, MEDIUM < 4 blocks combined, HARD > 4 | - | - | n/a | - |
| 31 | C712-746 | 27 combinations (3 x 3 x 3); 185 tiles 50/46/4%; 12 combos missing; a missing combo breaks generation; fix the rules or add pieces | - | - | NOT | **Coverage table gate** (§2.1) |
| 32 | C747-759 | Difficulty v2: obstacles = gaps + enemies: EASY 0-1, MEDIUM 2-3, HARD 4-6; 16.7/64/18.3% | - | - | NOT | Tier from clumsy trace + bots, not a count (§5.2) |
| 33 | C765-789 | 9 combos still missing; 9 hand-made pieces added (visually marked by underground palette) | - | Matt 10-30 "more pieces" (CLAUDE.md) | NOT | Fill holes with new pieces, never by rerolling |
| 34 | C796-800 | Example filler TOP,LOW,HARD; colour difference visual only | - | - | n/a | - |
| 35 | C808-818 | A piece with two edge labels is duplicated per label; fillers kept single-label to favour originals | - | - | NOT | A pattern may declare several entry heights |
| 36 | C819-835 | 3 "all connector" pieces (one per difficulty); only 3, since more "lower variety"; 197 total | - | APRON 200 on every node (beatTrace 19, 146) | CONTRA (ours is universal) | **Cap or vary the apron** (§2.2) |
| 37 | C837-843 | Level = 10 slots of 160 x 240 px (10 x 15 blocks of 16 px) = 1600 x 240 | - | - | n/a | - |
| 38 | C851-854 | Each slot starts with 197 options (185 + 9 + 3) | - | - | n/a | - |
| 39 | C861-875 | Lowest-entropy slot first; first slot random; curve read after the first collapse so the first position varies | - | - | NOT | Vary where a stage's building starts (minor) |
| 40 | C881-895 | Propagate edges, repeat until full; a piece can change the level from low to top section | - | - | n/a | - |
| 41 | C897-913 | First propagation filters every slot by the curve; flat curves EASY/MEDIUM/HARD keep difficulty while height varies | - | - | NOT | Row 11 |
| 42 | C918-938 | Rising curve [E,E,E,M,M,M,M,H,H,H]; peak [E,M,M,M,H,H,M,M,M,E]; worked collapse [H,H,E,E] | - | W1-REBUILD-PLAN 30-36 (7-part curve, varied per stage) | PART | Our curve is richer (rest, counter-melody); keep it |
| 43 | C946-952 | Judge variety and completability, not "good/bad" | - | quality-review (fun judged by eye too) | PART | We judge fun too |
| 44 | C955-1002 | Table 3: 11 rounds; tile set x curve (none, alternating, rising, valley, peak) x weights (round 11 favours safer tiles) | - | - | n/a | - |
| 45 | C1004-1019 | Rounds 3-5 cut short (345, 136, 68 levels) by missing combos; full set from round 6 | - | - | n/a | Evidence for row 31 |
| 46 | C1022-1033 | Variety = are all pieces used, how often they repeat (count per piece over all levels) | - | variety.ts 43, 48 (per stage) | PART | **Piece-use spread over 200 rolls** (§2.8) |
| 47 | C1035-1059 | Table 4: most/least used, mean, std dev (e.g. round 1: 185 pieces, 93 / 24, mean 54.054, sd 13.763); typos in rounds 2, 9, 11 | - | - | NOT | Same measure, our patterns |
| 48 | C1061-1073 | sd near 1 = even use (or a repeating shuffle); high sd = hogs and dead pieces; bigger samples lower sd | - | - | NOT | Report dead (0 use) and hog pieces |
| 49 | C1076-1085 | 185^10 possible levels; playable share can't be enumerated; check after generating, discard failures | - | - | CONTRA (D30 direction) | We build by construction; discard only as a backstop |
| 50 | C1086-1105 | Gaps are the only impassable obstacle; test landing inside the jump parabola, eq. (1): peak 82 px at 71 px, range 142 px | - | levelCheck reachJump (110-124); beatTrace flight (247) with engine physics | IN (stronger) | - |
| 51 | C1106-1125 | Special case: platform reachable before the arc's peak; any platform before the vertex below max standstill jump counts | - | beatTrace heightAt (293) checks the face at the corner | IN | - |
| 52 | C1127-1151 | Table 5: unplayable 8.8-23%; mean playable 85.654% (verified); weights barely help (12.3 -> 12.2%) | - | - | n/a | Evidence for by-construction (§0) |
| 53 | C1153-1172 | Checker tests only the lowest path, so it marks playable levels unplayable (alternate route via bricks) | - | core.ts uses the inspector's quick route (header) | PART (unverified) | Check whether split stages' other roads are judged |
| 54 | C1180-1198 | Summary: tiling WFC + curves: 85.654% playable, "repeated tiles only showing up in 0.05% of levels" (not derived in text) | - | - | n/a | - |
| 55 | C1201-1209 | Future: WFC for terrain, then a second WFC for enemies | - | hazardSpots after traceNode (beatTrace 566) | IN | - |
| 56 | C1211-1218 | Future: ORE makes new pieces that WFC then combines | - | - | NOT | Patterns generated from bars, then composed (§2.3) |
| 57 | C1220-1228 | Future: other games' tile sets; mixing styles | - | world art kits (STAGE-RULES §4) | PART | - |
| 58 | C1230-1235 | Future: adjacency by look for visual cohesion | - | artRoll cooldown (STAGE-RULES 225) | PART | Art edge rules in the library |
| 59 | C1240-1255 | Checker only gives false negatives, never passes an unplayable level; with 2.3 s/level and >80% playable, discard-and-regenerate is fine | - | levelCheck MARGIN 0.97 - TAKEOFF_SLACK (67, 111, 124) | PART | **Rule in gates.md: a gate may only err toward failing** |
| 60 | C1256-1262 | A new game needs its own definition of valid and its own checker | - | tools/validate, levelCheck | IN | - |
| 61 | C1265-1272 | Fun is subjective; only building a game shows it | - | quality-review (watch the real game) | IN | - |
| 62 | C1278-1396 | References (Smith/Whitehead rhythm work [38-39], Sorenson/Pasquier challenge models [40-42], ORE [34], Kazemi Spelunky [23]) | - | - | n/a | Sorenson & Pasquier's challenge model is the anxiety-curve source if wanted |
| 63 | T113 abs | Tanagra integrates reactive planning (ABL) and constraint programming (Choco) to generate levels and respond to designer changes in realtime; "always playable" | idx | beatTrace (constructive) | PART | §0 |
| 64 | T113 intro | Designers replay a level many times before showing anyone (Castillo & Novak 2008) | - | quality-review §1 | IN | - |
| 65 | T113 intro | A small edit can force wide changes elsewhere | - | nodes chain by x1/yOut (beatTrace 32): a node change shifts later ones | PART | Pinned nodes + local retrace |
| 66 | T113 intro | Mixed-initiative: alternatives fast, regenerate chosen parts, enforce playability | - | - | NOT | §2.4 |
| 67 | T113 intro | Evolutionary methods too slow for realtime; grammar/rule systems lack timing and physics models | - | - | n/a | - |
| 68 | T113 overview | Designer edits single components or whole patterns; can change pacing without touching geometry | - | NodeSpec.bars retrace | PART | §2.5 |
| 69 | T113 overview | Geometric relations go to Choco as constraints "thus ensuring that the generator will never produce an unplayable level" | - | traceNode throws on violation (380-466) | PART | §2.7 search |
| 70 | T113 beats | Beats represent the frequency of player actions; each beat = one action (jump a gap, kill an enemy); beats model rhythm and pacing (Smith, Cha, Whitehead 2008) | - | beatTrace bars, BPM (stageBpm 636) | IN | - |
| 71 | T113 beats | "Beats are the glue": without them the generator can't size a pattern or join patterns | - | beatTrace (x1/yOut, durations) | IN | - |
| 72 | T113 ABL | ABL: Java reactive planning, hierarchical behaviours, reacts to a changing world | - | - | n/a | - |
| 73 | T113 library | Patterns defined as behaviours; simplest span one beat (two platforms with a gap; an enemy patrolling a platform) | - | beatTrace Step (52-57) | IN | - |
| 74 | T113 library | Complex patterns built from single-beat ones plus extra constraints, e.g. staircase with equal step heights | - | GAP_REPEAT 4 (beatTrace 167-169, 466) | CONTRA (by our choice) | Staircase pattern varies one number per step |
| 75 | T113 library | Components: platforms, gaps, enemies, stompers, springs; position and size as constraint variables | - | Ledge (76), Landing (84), Avoided (138) | PART | - |
| 76 | T113 library | Pattern length must match its beat's duration under a simple movement model | - | engine physics, 1/60 slices, 30 fps pad (beatTrace 13, 186-187) | IN (stronger) | - |
| 77 | T113 library | 5 single-beat patterns (long platform, gap, enemy on platform, stomper on platform, spring over gap); 2 multi-beat (staircases, pits/mesas) | - | move letters J/j/h/M/F (core.ts header) | PART | Name our multi-beat patterns (§2.3) |
| 78 | T113 Choco | Choco: open-source Java CSP library (Boolean, integer, real variables) | - | - | NOT | Not taken: a small TS search suffices |
| 79 | T113 Choco | Gap constraints on platform starts/ends; internal: width 0 => height not 0, and vice versa | - | beatTrace 441, MIN_GAP 40 (164) | IN | - |
| 80 | T113 Choco | ABL creates constraints, Choco solves and reports back so ABL can continue the rest of the level | - | fitSteps loop (w1Rhythm 147) | PART | Error-steered search |
| 81 | T113 demo | Figure 2: dark platforms = designer-modified; staircase at the start, pit in the middle | - | - | NOT | Pinned nodes |
| 82 | T113 fig 1 | Architecture: ABL (geometry generation, action monitoring, pattern library) <-> Choco via working memory <-> GUI (geometry and beat manipulation) | - | - | n/a | - |
| 83 | T113 garble | Two dropped spans ("diagram desc...rastructure", "multi- -jump"); same in .mht | - | - | n/a | Fetch FDG 2010 PDF for the full Tanagra |

Row count: 83 (counted by script; see report).
