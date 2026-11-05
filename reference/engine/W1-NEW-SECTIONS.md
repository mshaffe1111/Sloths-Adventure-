# World 1: new sections for the chunk pool [story check applied 4:24 PM ET: #2, #9, #13, #14, #15, ports] (designer, 11-05 4:17 PM ET; CHUNK-POOL-BRIEF step 2, "the designer adds new W1 sections")

**For engine-core to enter in src/game/gen2/worlds/w1.ts.** These are written in gen2's SectionTemplate terms (types.ts:325-362).
- World 1 art only (LABELS rule 4); no new art tonight.
- Moves are what 1-1 teaches (walk, jump, double, and the bounce off a `bouncy`).
- Every section enters and leaves on gen2's `ground` port (the planner: World 1's floor is `ground`, not a new kind), unless it says otherwise.
- Gaps and rises are never set here: they take the roll's shares (roll11), inside P8 (ES "C20/P8 settled").
- Landings are 3.5-7.0 body widths (WORLD-RULEBOOK §7).
- Rocks stand on the floor or a bank, never in the air (rule 1).

**Shared sources:**
- the continuous moss floor road (WORLD-RULEBOOK §2; LEDGER-2026-11-02-full.md:388; the planner's 4:00 measure);
- high/low splits (LEDGER-2026-11-04-part1.md:317);
- a rest is about 2× the local beat (C2);
- dead time ≤ 2.5 s (§7.1);
- the landing in view (§7.3).
- Each section says what its sub-blocks vary, so one section gives many plays (types.ts SubBlock, Spelunky A5).

**`not` for every section below:** Meeca's note and the hibiscus (1-2), punch and combat (1-3), the kapok climb and the view north
(1-4), the folded petals and the chase (1-5), lianas (1-6), the bush (1-7).

| # | id / name | Phase | Diff | Needs | Ports | Pieces (W1 kit) | Sub-blocks (what varies) | feel | Source |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `w1-stump-stile` Stump stile | ki | 2 | jump | ground → ground | 3-5 stumps stepping up then down over the floor; the floor runs under them | the count, and up-then-down or down-then-up | 1-1, 1-2, 1-3 | "hills and little areas to jump up on" (ES 592); up/down on most landings (old 1-1 floor) |
| 2 | `w1-stone-zigzag` Mossy stone zigzag | ki, sho | 3 | jump | ground → ground | mossy stones at two heights, **every upper stone seated on a mound or a bank top** (never in the air); a floor walk beside | two or three tiers; stones or stones with one log | 1-1, 1-2, 1-5 | LABELS §1 mossy stone (ground, never floats: Matt, rule 1); high/low split |
| 3 | `w1-log-road` Raised log road | sho | 3 | jump | ground → ground | thin logs (h 30) on stumps over the floor, 100-120 px up; head room ≥ player.height + 20; a bank step at each end | log count 3-5; one gap needing a single jump or a hop-down | 1-1, 1-2, 1-5 | the 12:51 and 3:40 rulings (Q1); the floor road |
| 4 | `w1-hollow-twoway` Hollow-log two-way | sho | 3 | jump | ground → ground | a hollow log on the floor: walk through inside (low road) or hop along its top (high road); rejoin past it | log length; a stump or a stone after it | 1-1, 1-2 | LABELS §2 hollow log (two-road split, W1 art in the w1-new atlas). **ENGINE FINDING: gen2 has no hollow-log shape** |
| 5 | `w1-mushroom-lift` First lift | ki (teach bounce) | 2 | — (bouncy) | ground → ledge | a perched mushroom on a stump; the bounce lifts him onto a mound or log-road top; walking passes under | lifts onto a mound or onto a log road | 1-1 | the brief's "first lift" (1-1.md:20); the perch rule (Q2) |
| 6 | `w1-twin-bounce` Twin bounce | sho | 4 | — (bouncy) | ledge → ground | two perched mushrooms, each lifting a step higher; then a hop down to the floor | 2 or 3 mushrooms; down by stair or drop | 1-1, 1-5 | bounce taught (ladder); the pair on one beat (LEDGER-11-02:33) |
| 7 | `w1-fallen-trunk` The fallen trunk | ten | 5 | double | ground → ground | a big fallen log (block) too tall for one jump: a double over it, or a mushroom beside it as the second way | the mushroom on the near side, or no mushroom (double only) | 1-1, 1-3 | two ways over one obstacle; a twist on the jump (LEDGER-ENGINE-GEMINI:479) |
| 8 | `w1-double-teach` Double over the dip | ki (teach double) | 3 | double | ground → ground | one gap past a single jump over a safe dip that stops short of the far bank, with a step back (R2); then two more safe gaps | gap count 2-3 | 1-1 | R2 (3:11 ruling); teach over safe ground (§2) |
| 9 | `w1-bough-stepup` Into the boughs | sho | 4 | jump | ground → ledge | low boughs on **one plain W1 trunk** (not the kapok; no trunk climb, no climbable vine, no view opening: 1-4 owns those, 1-1.md:41), rising from the floor road; the floor carries on below. **LATE only: the rise into the canopy just before #10** | 3 or 4 boughs; a log as the second step | 1-1, 1-5 | "a ground stage that becomes a tree stage" (9:20 ruling); boughs are the reward at the top (1-1.md:46-52) |
| 10 | `w1-canopy-rungs` Canopy rungs (the moment) | ten | 7 | double | ledge → ledge | boughs at rising heights, each rise needing a double; catch boughs 60-120 px under each gap, one jump back up | 3 or 4 rungs; left- or right-leaning | 1-1 | the brief's double chain (1-1.md:21-22); catch boughs (3:11 ruling) |
| 11 | `w1-high-walk` High branch, petals low | rest | 1 | walk | ledge → ledge | one long bough with petals at marching height on the trunk below; a Dot spot | length; a short step in the middle | 1-1, 1-5 | a rest about 2× the beat (C2); petals low (brief :26) |
| 12 | `w1-dropdown-stair` Drop and climb back | sho | 3 | jump | ledge → ground | a raised road ends; a drop to the floor; a stump stair back up | the stair's 2-4 steps; a stone or a stump at the foot | 1-1, 1-2 | stairs out of the deep floors (brief step 1); every dip a one-jump way out |
| 13 | `w1-knot-bank` Stepped mound | ki | 2 | jump | ground → ground | **stepped earth mounds** (2-3 steps) up to a mound top, then a step down; any knots sit on a fallen log or a trunk, never on an earth face (knots are tree wood) | 2 or 3 steps; down by step or hop | 1-1, 1-2 | "hills and little areas to jump up on" (ES 592); stepped mounds (ES 619) |
| 14 | `w1-floor-dash` Floor and high road | ki, sho | 2 | jump | ground → ground | the plain two-road stretch: a **high road of thin logs on stumps (or stones seated on banks)** above the floor, hop steps on the floor below; either road walks on | 3-6 pieces; one at a new height | 1-1, 1-2, 1-3, 1-5 | old 1-1's floor (the source of its 0.384), as a section rather than the whole stage; rocks never float |
| 15 | `w1-quiet-arrival` Quiet arrival | goal | 1 | walk | ledge → ledge | a calm walk along a high branch onto **a long high log, the end piece, with the exit totem on it** (what main's old 1-1 ends on: a 685 px log at y 580, exit_totem, no shrine). Petals low; the bootprint place a flush decal in the log top's moss, toe east (held art, R-165.31) | short or long walk-on | 1-1 | ends: quiet, "up in the high branches, pointed north" (1-1.md:23); stageClue.ts:16; main's 1-1 end |

**Counts:**
- 15 new sections: start 0, ki 6 (1, 2, 5, 8, 13, 14), sho 7 (2, 3, 4, 6, 9, 12, 14), ten 2 (7, 10), rest 1 (11), goal 1 (15). (5 and 8 are teaches; some sections carry two phases.)
- With old 1-1's harvested sections, this gives the step 2 pool. The pool-to-slot ratio is engine-core's table to measure (CHECK 2).
  If ten or rest still falls short of 3:1, I'll design more there first. The double chain and rest are the thinnest phases.

**Engine findings for the planner (not for engine-core to patch):**
1. gen2 has no hollow-log shape (PieceShape: bank, branch, block, stone, bouncy, liana, vine) for section 4.
2. (Withdrawn: the floor is gen2's `ground` port, the planner's correction.)
3. A perched `bouncy` on a stump: check that gen2's `on` rule can seat it.
4. Catch boughs under canopy gaps (section 10) need a place rule. gen2's pit and soft cover the ground only.
