# Designer handoff (economy rows rewritten 2026-11-13 by the ECONOMY Designer, R-165.194, branch t-economy; before that rewritten 2026-11-11 5:41 PM ET by the Designer of the 1-2 packets, R-165.11, after both PASSED the packet Critic (eight rounds); the 1-2 rows rewritten 2026-11-12 by D12, the designer-builder of 1-2 (its designed arc); before that 11-09 by the Designer of the reach flight, R-165.60; first written 11-07; for the role agents of the 6-role model, reference/TEAM.md)

Read first, in order:
- reference/LAWS.md;
- this file;
- reference/specs/reach.md and bands.md (the flown reach and the bands; they outrank any older gap or rise number; on branch
  t-designer-reach until it merges) and reference/specs/chain.md (the bounce chain, flown for 1-2);
- reference/packets/2026-11-11/CONTENT-1-2-relay.md and DESIGN-1-2-notes.md (1-2's packet and its proofs);
- reference/engine/NODES.md §8 (the node code and its key);
- reference/engine/W1-NEW-SECTIONS.md (every round);
- a LEVEL's builder: reference/methods/level.md (on t-w1-creatures), reference/design/LEVEL-BAR.md, then the level's own design doc.

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
| 1-2 The Petal Trail, DESIGNED (one idea, the arc beat by beat, its rules as checks) | `reference/design/1-2.md`; its rows `src/game/gen2/worlds/w1Arc12.ts`; held by `tools/engine/library.test.ts`; proof `reference/qa-reports/D12/` (the old sealed `1-2-DESIGNER-NOTES.md` is history now) |
| (history: the old rolled 1-2, replaced 11-12 by the designed arc above) 1-2's packets (Content: brief, graphs, 51 sections, the thorny floor, done-items by phase; Engine: 8 items in 3 pushes) and their notes | `reference/packets/2026-11-11/CONTENT-1-2-relay.md`, `ENGINE-1-2-routing.md`, `DESIGN-1-2-notes.md` (branch t-design-1-2) |
| (history: the old rolled 1-2, replaced 11-12 by the designed arc above) 1-2's old gap list and the secret-as-fork idea (11-06; no longer sealed: Matt's 11-11 benchmark is a full packet; superseded line by line in the notes §6) | `reference/engine/1-2-DESIGNER-NOTES.md`, `BRIEF-1-2.md` |
| The entered data (the porter's) | engine-core `src/game/gen2/worlds/w1.ts`: sections, JOBS, CONTENT, TERRAIN, VERSION_JOBS, the `easy` twins, W1_KIT (owns, decor, required, graphs) |
| **The flown numbers (11-09):** reach, bands, touch, help, the flight sim and its saved runs, the Engine packet | `reference/specs/` on t-designer-reach (reach.md, bands.md, touch.md, help.md, sims/flight.ts, sims/out/, packets/ENGINE-flight-test.md) |
| **The bounce chain (11-11):** flown on 1-2, its bands, the worked lay, the 1-2 build probe, the fork-end check | `reference/specs/chain.md`, `sims/flight.ts` (mode `chain`, `FLIGHT_STAGE`), `sims/chainlay12.ts`, `sims/probe12.ts`, `sims/finds11.ts`, `sims/out/` (branch t-design-1-2) |
| The designer's own working notes | `reference/engine/DESIGNER-NOTES.md` |
| **The reward economy (11-13, R-165.194):** score, four stars, basket fruit, hearts/lives per setting, Game Over, star use, the ranked packets | `reference/design/ECONOMY.md`; measured by `reference/qa-reports/ECONOMY/measure.ts` (real engine, tier bots; `--hearts N` flies a proposed heart count by patching RealPlay.frame at run time, src/ untouched) + `summarize.py`; data `raw/*.jsonl`, tables `summary*.txt` |

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
2. **The double, in PIXELS (changed 11-09 on the flown reach, reference/specs/bands.md §2-§3; the PM's word in packet R-165.60):**
   - **The double TEACH is a RISE on both settings:** Easy 128-132 px, Normal 136-140 px onto a block face (thin lip: 122-128 / 128-134).
     One jump climbs 123 px (block) and never more; a double flick climbs it on 100% of tries.
   - **A double GAP is a Normal TEST only: 252-262 px** (the widest flown single is 246; blocks keep 5 px over it) (far bank ≥ 3.5 body widths, as before). No gap teach. **Easy: no double gaps.**
   - The physics, flown in the real engine (reach.md): a single's apex is 97.8 px, not 107.8; one jump crosses 244 px at best
     (246 on Easy), 213-223 from the last ground frame. The old "175 px (reachJump) plus 21 px", TEACH 195-205, TEST 205-228 and
     Easy twins 110-114 are all WRONG: one jump clears every one of them. Never set a gap by share, and never from reachJump.
   - Not in the game until the Engine packet lifts two clamps (Easy double rise 113.9, Normal double gap 229.8) and Content enters the bands.
3. **The bounce teach (changed 11-09, bands.md §4):** a mushroom on the FLOOR, its edge 20-60 px from the face, the lip **232-246 px**
   over the floor; the check is the bounce plus ONE air jump (any press 0.2-0.73 s after the cap). The old 200-220 lip is climbed by
   a plain double (it climbs 214). "A bounce alone clears it and a double does not" has only 216-221 px, 2 px spare: not usable.
   **Open with the lead:** whether the lesson may ask for the air jump (REPORT.md pushback); the other way is a 190-205 lip that
   teaches but does not block. Taught by the lesson card `lesson.bounce`, never also a Dot line (no repeated tips).
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
10. **What may float (Matt, 11-07, R-165.54; STAGE-RULES.md "What may float" is the rule, copied here):** may float: floating earth
    islands, earth ledges, walkable logs and planks that read as platforms. Attached (to a trunk, post, root or rope): boughs,
    branches, vines, ropes. Grounded, never floating: rocks, stump-steps, bushes, ferns, decoration, hide spots, caves. (The 11-06
    wording here, "boughs may float with no support" and "earth waits on Matt", was wrong on both counts and is gone.)
11. **Branch share:** among thin landings, ≤ 30% on EVERY roll and no thin look over 38%, plus ground > branch on the whole stage. The levers: rungs alternate bough and log, catches and the perch become logs, and joins take the next section's entry kind (the planner).
12. **Hearts follow risk (V21).** 1-1 has 0.
13. **The reward (H) is structural** (outside the deal). The seed perch's failure on seed 102948 was the engine's corridor check, not the deal (my first diagnosis was wrong; NODES §7.1 is corrected).
14. **W1 `owns` and `not` (Round 8):** 1-1 and 1-2 each own their words; 1-1's signatures stay 1-1-only. (The 11-06 "a COLD helper builds
    1-2, don't pre-build it" is gone: Matt's 11-11 benchmark is a full packet.)
15. **(History: REPLACED 11-12 by the designed arc, ruling 21.) 1-2 (11-11, the packets, attempt 2):** harvest, level, quiet end, branching lots, deal ground 35 / bounce 35 / climb 30 and NO
    floating (World 1's window puts floating in the last third, where 1-2's graphs hold F, C, X and W); one hazard lesson (thorns)
    and no new move; ONE signature, the bounce chain over a thorn hollow, in three sections that are 1-2's alone; the note hollow
    is the required H and carries `phases: ['sho', 'ten']` (a required section is fitted by phase). Three harvest graphs. 53
    sections: 11 reused, 17 own, 25 new; every own and new one level within 110 px unless U or D. The way down is MIXED (the lead, 11-11 5:10 PM ET, on
    STAGE-RULES §0 rule 3): a hop step `N` (a step down with its own hop stump) never twice side by side and 6 a roll at most,
    with a drop `J` (a ledge 130-140 px lower, walked off) or the kit's `Y` between beats. A bare `n`, `Y`, `F` and any drop are
    NO beat to the inspector, and the seed list refuses a quiet stretch over 4 s: one silent piece at a time, never last, never
    before a long floor (flown, sims/quiet12.ts; counted, sims/ncount12.ts).
16. **The chain's bands (chain.md §3, flown):** cap centre to cap centre 205-220 level, 195-210 a step up of 24-36 (lay 198-206),
    215-225 a step down (lay 216-224); pillars wider than the cap (Normal 110-130, Easy 150-170) so a near miss lands on wood;
    Normal 2-5 caps, Easy 2-3. A chain is S, M, P, D or part of a C or F, never an X: the pillars alone are a stepping-stone road.
    (11-12, D12 measured it on 1-2: any bed the generator lays, at most 114 px level, is one a full jump clears; so 1-2 makes the
    caps the road instead, ruling 23.)
17. **Thorns (the lead, 11-11):** only in hollows under chains and the named pieces, 150-170 px deep, never under a double gap (a
    double flick lands it about 70%), in the first 1,300 px or under a low road; Normal a heart and a set-back, Easy the set-back
    only; the set-back is to the last ledge that is not a pillar. Engine draws the bed from painted clumps chosen by width; its
    still is Matt's hold point.
18. **A reused section is touched only in its `feel`.** Anything else is the new stage's own section. Off-path rewards are judged
    on the BUILT stage, never on sockets.
19. **A harvest stage pays off the road in bonus blooms, not petals** (ruled by the lead, 11-11): the quota is 87.5% of
    all petals, so 4 to 7 a roll may sit off the low road; a `fruit` counts toward the goal and is not in the quota. PETAL or
    BLOOM (the lead and the story keeper, 11-11): a petal is Meeca's trail, loose and pink, LOW on the floor road, never over a
    cap, a gap or a hollow; a bonus bloom is a painted flower GROWING where it stands (`flowers-atlas#f76` on 1-2), as high as
    its piece, never a petal, never the hibiscus.
20. **A packet's pool is proved by rolling the packet's own brief** in the real pipeline, twice: on today's engine and with the
    engine items it waits on stood in (sims/supply12.ts, `FLOWN=1`). The supply table by job and type goes in the notes.
21. **1-2's pool is its OWN (11-12, D12, the lead's PASS):** seven beat bricks, its arrival, five rests and its exit (`SECTIONS_12`); no World 1 library section is dealt into it.
22. **1-2's petals lie where a first-timer WALKS (11-12, D12, measured):** the harvest goal is 88% of what the game lays, and the calibrated tier bots jump 150-250 px before a root or step and land as far past it. A petal goes past a landing and short of a take-off, or one on top of a root; never on a ledge he hops onto. Measure with the bots before moving a petal (0 sealed doors in 32 runs at 138c3b36).
23. **1-2's stumps and caps:** Easy's 160 px stumps on both settings in the lesson and again (the bite taught before the test, the lead 11-12); Normal's 110 from the petals going up on, chain.md's narrowest, with each step at the top of its band, so the pit between pillars is 102-110 px (chain.md 75-110) and a miss falls in and costs (the lead 11-12: 49-66 px hollows caught him on the lip; the stair's 160 px caps were out of scale with Pokey, R-165.107). **The caps are the road (the lead's ruling A, 11-12):** on Normal from the petals going up on, each cap over the thorns is as wide as its stump, so no bare wood is left beside it and the mushrooms are his only footing over a thorn bed (Matt's purpose rule); the lesson and again keep their wood, and Easy keeps its 70 px caps and wood (the forgiving miss). Held by library.test.ts (a planted 70 px cap is caught).

## 4. Open items (none of these is finished; check each before assuming)

- **Economy (11-13, R-165.194):** ECONOMY.md is a DESIGN awaiting the lead's and Matt's word: four stars (finish, basket, score target, clean),
  Normal 3 hearts / Easy 5, Normal Game Over to the last rest flag, hidden stage per world at 26 of 40 stars. Next: HEARTS-3, then
  SCORE-PAR (the par runner: the open question is analytic chain par vs a bot run; f is 0.9 Normal / 0.7 Easy to start, unproven on Easy),
  BASKET spec/art/lay, STARS-4, GAMEOVER-REST, HIDDEN-1H (ECONOMY.md §5). The lead's 5th star (hidden find) was tested and refused.

- **From the 1-2 packets (11-11):**
  - BOTH PACKETS PASSED the packet Critic at t-design-1-2@d9267c6b (t-critic-1-2-packet@65523e00, REPORT-attempt8.md; eight
    rounds). After that head only the Critic's two builder notes on ENGINE item 6 went in (the bloom at 32 px, the allamanda as
    decor); a PASS names its head, so the Critic reads that diff. Nothing is open with the lead. Next is the lead's: name the
    heads and dispatch Engine (push 2 first: Content's phase 2 waits on it) and Content. The ENGINE packet is written for ANY
    stage from data (the lead's standing rule D43, 11-11): a listed-stage table, a `hurt` place flag with the world's
    `hurtFloor` row, a judged-stage table, brief fields (`offRoad`, `petals`, `bloomSprite`, `help`), never a stage id in engine
    code. Write every future engine packet that way from the first draft
    (the yield floor is 1 clean in 50 for now, the lead 11-11; R-165.120 raises it);
  - NOT proved by any packet audit: the heights, reach and look of the 42 sections that do not exist yet; the seed yield on real
    pieces; the thorn bed's and the bloom's look; how a child plays a chain. Those are the build audits', the stills' and the
    first play window's;
  - earlier rounds: (attempt 1: CONTENT 14 lines, ENGINE 6; attempt 2: 1 and 3; attempt 3: 1 and two notes; each answered in
    DESIGN-1-2-notes.md §9); the lead's rulings are all in notes §3, none open (bonus blooms; the ladder grows the lesson's own
    fallen log at the first chain, else the line alone; the double counts on the gen2-BUILT 1-2 only, `EARLY_DOUBLE` not
    widened, so `#ctest` on 1-2's id does not move; item 0 struck from the Engine packet: the t-engine-11-followup round's);
  - Engine work 1-2 stands on: ENGINE-1-2-routing.md (item 0, the 1-1 high-road ends, is the t-engine-11-followup round's; then
    the seed tool, the thorn hollow, the reach scope, the note, the double counted on a gen2-built stage, the blooms by a brief
    field; routing and help last);
  - thin supply cells (one section each) are named in notes §8: the builder's yield count will show the first to go short;
  - help.md §5 (counting failures through a lost life, one system with assist.ts) is still unwritten;
  - NOT flown: a chain cap more than 66 px over the last or 36 px under it, a bounce plus air jump across a dip (#63's shape), a
    moving cap. 1-2's Normal doubles climb 1 px under 1-1's and its gaps are the same (chain.md §1); fly again from about 1-5;
  - flight.ts on t-design-1-2 is t-designer-reach's (at e97542b4) plus `FLIGHT_STAGE` and `chain`: when both branches merge, keep this one;
  - the chain's bands come from two pilots, no child: the first 1-2 play window is the judge.
- **From the reach flight (11-09), in order:**
  - the lead rules on the bounce teach (bands.md §4) and on help.md (a proposal: its thresholds are benchmarks, not tester data);
  - the Engine packet `reference/specs/packets/ENGINE-flight-test.md` (the permanent flight test, the ruler, the two clamps);
  - then a Content packet enters bands.md §5 in w1.ts and rebuilds the seed list and pins;
  - the Pad coach line and the Easy tap (touch.md §3): a tapped Pad jump is a 61.7 px hop;
  - NOT flown: Normal from stage 25 (no early-stage help: second jump 540, stand 11.4 px), a gap onto a raised bank,
    a raised mushroom. Fly them before ruling on them.
- **With engine-core and the porter, to enter or verify:**
  - Round 11 (the branch swaps), plus the per-roll thin-branch report on 16 seeds, both settings;
  - Round 12's rising versions;
  - the Easy twins: now 128-132 (bands.md), not 110-114;
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
  - the art director's INTEGRATE-1-1.md still lists earth ledges as "may float" (corrected by Matt's rule; the source note is to be fixed);
  - the red spiky bromeliads and the backdrop logs (art director flags).
- **Not checked live yet:** `lesson.bounce` firing on a fresh-save gen2 roll (engine-core's QA commit 8cba3b067 began it).
- **On file:**
  - `w1-rope-gap` for 1-5's move to gen2 (the mixer's rope and punch are known failures carried there);
  - stage15's seed clause is to be REWRITTEN to the glint promise, not deleted.
- **Parked:** re-shoot the bootprint on 1-1's end bank; W1 rot wood and side-branch art; render-stone fixes.
- **1-2, open (11-12):** its two thorn lines are the kit's `teachTips` and Dot says both on Normal and Easy since P13's Tips fix (0e779b47, merged; stills 1a and 1c). Main's "The petals go up" is CUT in the new look, so the stair has no line. The thorn bed is a SET-BACK hurt floor, not a dip or a landing (the lead 11-12): plainWalk 'dips', w1Pits #13 and stageQuality read it so, and thornSetBack.test.ts holds every hurt floor taught first, really fallen into and setting him back safely (D12, d4d296fc). w1Pits #17 is the hollow painter, RF3's (a tall wall in a narrow hollow is cut straight; a 38 px step down makes mirrored walls). The rolled-flag pass stands flags on floor mushrooms and roots (R-165.156, P12S). Meeca's note (the Keeper's Bell, finds.ts w1_note) lies on the twist's hollow floor past its root every roll (FX's findSpot on 'hf' at t 0.66; t 0.6 could stand inside the root), and Dot says "There's something down by the roots..." on the lip (D12, t-12-design@cc0def2a, on INT-2's 90a54102).

## 5. Traps (each of these happened)

- **The tier bots are weak on climbs and lianas (11-13):** 3-4 bots were rescued 7-18 times a run and 6-3 lost 5-11 lives a run to water
  on every tier: read later-world economy numbers as direction only. World 1 numbers are sound (0 rescues to speak of).
- **The score is visible** (HUD on change, Stage Cleared, Game Over): a grep of src/game alone missed the components (the lead's packet said "shown nowhere").
- **A share of everyday fruit is not a skill test:** a bot that only walks the route gathers 58-97% of it (p10-p90).

- **The level check counts no double on 1-2 to 1-5** (levelCheck.ts:132-134): a stage moved to gen2 before 1-6 needs `EARLY_DOUBLE`,
  or every double block reads as unreachable and its section is swapped out with no reason printed.
- **The node code's V3 knows a move only from a T in the stage** (nodeCode.ts:138-141), not from `lessons`.
- **`w1World()` hands out the same section objects every call:** a probe that edits tags copies each section first.
- **A probe on another brief proves nothing about the packet's** (the Critic's line 1 on attempt 1).
- **A rhythm's steps down are quiet time.** Check any run-out against the quiet line (QUIET_MAX 4 s) before it goes in a packet.
- **Half of a section's lays are MIRRORED (11-11)** unless it is `mirrorable: false`, a climb, holds a block or ends over 25 px
  off its entry (pipeline.ts:1445-1450). For every new section ask first what it is played in reverse; one with a direction (a
  chain, a mushroom before a lip, a drop, widths in order, a tip on its `in`) is named not mirrorable in the packet, with a test.
- **A story brief's "must" lines are checked one by one against the packet AND the engine's own habits (11-11).** I wrote petals
  over every cap against "petals LOW on bark"; and the pipeline hangs a 3-petal arc over most gaps by itself (pipeline.ts:2178-2185).
- **"Not `main`" is not "`main: false`" (11-11):** only a bank or floor is `main: true`; a stump has NO flag (w1.ts:158) and holds
  road petals. Off the road is "marked `main: false`"; the road is "any piece not marked `main: false`".
- **Paste a probe's row from the run the packet names**, never from a run of that one row alone: quiet12's rows moved with run order.
- **Any way DOWN is silent unless it carries a hop (11-11).** The kit's `Y` and `F`, a drop across a soft gap and a walk-off are
  no beat to the inspector (tools/inspect/route.ts:266). And a new beat is counted per ROLL before it is written into many
  rhythms (STAGE-RULES §0 rule 3): `N` was 13 a roll before anyone counted. `BEATS=1` on sims/quiet12.ts prints what is read.
- **A rule keyed on a stage id hits every build on that id** (`#ctest` lives on 1-2's); one keyed on an objective hits every
  stage with it (8-2 is a gen2 harvest). Key on the built stage or its brief.
- **A socket is not a pickup (11-11).** gen2 fills a `find` only in the stage's required section; a fork's `find` socket stays empty and
  blocks the off-path petal. Read `collectibles` on a built roll (sims/finds11.ts) before saying a spot holds something.
- **The early-stage help is a ramp by stage number** (physics.ts `easeAssist`): numbers flown on 1-1 are not another stage's until
  flown there (`FLIGHT_STAGE=<id>`). On 1-2 they moved 1 px; that was luck of the ramp, not a rule.
- **Easy widens a `landing` piece on its near side:** a spacing that must be exact (a chain's S) is laid on pieces with no `landing` flag.
- **A build can be probed with no routing:** `buildGen2Stage({ config, kit, seed, difficulty })` with the brief added to the kit in
  memory (sims/probe12.ts). Do this before writing a packet that says what the engine will do with a stage.
- **Apex is not reach (11-09).** The engine lifts him 26 px onto a block's lip and 20 px onto any top under his falling feet, and a
  late press rides 6 coyote frames. A band set from an apex or from reachJump is wrong by 15-70 px. Fly it: `npx tsx reference/specs/sims/flight.ts normal all`.
- **realPlay's FakeInput has no minimum hold:** a one-frame `press` is a 29.6 px hop no player can make. Put the game's InputEngine on `r.e.input` (flight.ts Rig).
- **A share is a share of tries, not of players.** Say which tries.

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
- **A tip in a brick is not a line on the screen** (1-2, 11-12): placed 1,000 px before the lesson, it was still never shown (coach lines and Dot's 30 s spacing). Walk the real page from the start and read the card, every lesson line, before calling it taught.
- **A brick's flag socket does nothing on a rolled stage:** the rolled-flag pass lays every flag by Matt's rule. Design flags as that rule, not as sockets.
- **The time model counts 1.5 s a mushroom** (stageTime.ts TIME.bounceExtra): a chain-heavy level reads about 40 s longer than it plays.
