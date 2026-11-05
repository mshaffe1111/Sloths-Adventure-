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

## Round 2 (designer, 11-05 4:27 PM ET; the lead's (a)-(d) on engine-core 942d79ce3's harvest)

### (c) Teach order: main's, which is moveLadder's: run, jump, double, bounce
- **Evidence on main:**
  - The touch coach's sequence is run → jump → **nice**, and "nice" is "Nice jump! In the air, flick up again for a double jump", shown
    right after the first jump (CoachOverlay.tsx:10; touchCoach.test.ts:48: ['run', null, 'jump', 'nice', null]).
  - The first mushroom (lesson.bounce, lessons.ts:490) comes at about x 6,450 of about 32,500, on 4 of 4 layouts.
  - moveLadder.ts:2-14 lists the same order.
- **So:** the double is taught early, in `ki`, over safe ground, by **#8 `w1-double-teach` (ki)**. Harvested `w1-second-jump` is the
  double's first TEST (`ten`): change `teaches: 'double'` to `uses: ['double']`. The bounce stays taught in `sho` by
  `w1-hop-bounce`, after the double, as on main.

### (b) The two 1-3 picks
- **`w1-low-boughs`: not for 1-1.** Drop '1-1' from its feel. It lays boughs in `sho`, and 1-1's boughs come late, as the reward
  (1-1.md:46-52). 1-1's boughs come from #9 (late), #10, `w1-high-leaps` and `w1-bounce-run`.
- **`w1-ledges`: not for 1-1 for now.** Its 'walls' version lays low boughs mid-stage. If the engine gains version-level feel tags,
  its 'ledges' version can return to 1-1 (an ENGINE finding, not a must).

### (d) The step 2 table, harvested sections (rating = difficulty unless noted)

| Section | Phases (1-1) | Rating | feel 1-1? | Ruling |
|---|---|---|---|---|
| w1-learn | start, ki | 2 | yes | OK |
| w1-stones | ki, sho | 3 | yes | OK. The support gate must show every stone seated on the floor or a bank (rocks never float) |
| w1-cache-stones | **sho** | 3 | yes | **drop 'rest'**: a rest has no hard input and rates 1 (C2). Same stone check |
| w1-stump-stones | ki, sho | 3 | yes | OK |
| w1-stone-dips | sho | 3 | yes | OK. Stone check |
| w1-second-jump | ten | 5 | yes | **`uses: ['double']`**, not teaches (see c) |
| w1-leap-stones | ten, ketsu | 6 | yes | OK |
| w1-high-leaps | ten, ketsu | 6 | yes | OK (boughs late) |
| w1-hop-bounce | sho, ketsu | 4 | yes | OK; teaches bounce (after the double, as on main) |
| w1-bounce-run | ketsu | 6 | yes | OK |
| w1-stone-road | ketsu, goal | 3 | **no** | not for 1-1: it brings him back to the ground at the end, against `trend: up` and "up in the high branches" (1-1.md:23). Keep it for 1-3 |
| w1-meadow | rest, start (**not goal**) | 1 | yes | drop 'goal' for 1-1 (the end is the high log) |
| w1-low-boughs | — | 3 | **no** | see (b) |
| w1-ledges | — | 4 | **no** | see (b) |
| w1-ropes | — | 5 | no (1-3 only) | OK as tagged (shimmy is taught at 1-3) |

**My 15 (#1-15) as ruled at 4:24:** ratings as their `Diff` column, with #9 tagged late.

### (a) Ten more sections for the thin phases (ground port, W1 kit, no new art)

| # | id / name | Phase | Diff | Needs | Ports | Pieces | Sub-blocks | Source |
|---|---|---|---|---|---|---|---|---|
| 16 | `w1-forest-edge` The forest's edge | start | 1 | walk | — → ground | flat home-edge banks with the squirrels' dressing spot clear of the spawn; no gaps in the first 1,300 px; coach.run | 2 or 3 banks; one low step | brief :19 (start, home, gentle); STAGE-RULES:161 safe start |
| 17 | `w1-fern-bank` Fern bank | rest | 1 | walk | ground → ground | a long flat bank, ferns and a fallen-log seat (dressing); petals low on a trunk beside; one low stump step | long or short; the step or none | C2 (rest ≈ 2× beat); petals low (brief :26) |
| 18 | `w1-clearing` Sunlit clearing | rest | 1 | walk | ground → ground | two long banks joined by a one-step dip (no gap); a Dot spot; **no sky opening or long view north** (1-4 owns the view, 1-1.md:41) | the dip or a step up | C2; a Dot spot at a rest (LEDGER-11-02:336) |
| 19 | `w1-bough-bench` High rest | rest | 1 | walk | ledge → ledge | a long thick bough between two plain W1 trunks, after the moment; petals LOW on the trunks at marching height, below the bough, seen from above (never a petal road in the boughs: 1-1.md:26-27) | length | C2; after every test, a rest (rulebook §4 rule 3) |
| 20 | `w1-stump-towers` Stump towers | ten | 5 | double | ground → ground | stumps of rising height, each a double up; the floor runs below (a fall is a walk back) | 3 or 4 towers | the floor road; a test of the double |
| 21 | `w1-bounce-double` Bounce, then fly | ten | 6 | double | ground → ledge | a perched mushroom's bounce, then a double in the air onto a high log road | high road at two heights | the pair on one beat (LEDGER-11-02:33) |
| 22 | `w1-canopy-weave` Canopy weave | ketsu | 6 | double | ledge → ledge | two roads in the boughs (high boughs, mid boughs) that rejoin; catch boughs under each gap | the high road's length; the petals LOW on the trunks under both roads (1-1.md:26-27) | high/low split (LEDGER-11-04 part1:317); catch boughs (3:11 ruling) |
| 23 | `w1-sunlit-log` Onto the high log | goal | 1 | walk | ledge → ledge | a two-step bough walk-on to the long high log with the exit totem; the bootprint place in its moss (held art); any petals LOW on the trunks below (1-1.md:26-27) | one step or two | main's 1-1 end: the exit totem from stageGenerator.ts:2136 (`gen.item('exit_totem', ...)`), on a 685 px log at y 580 (eraRoll build, layout 1); 1-1.md:23 |
| 24 | `w1-stump-descent` Stumps down | sho | 3 | jump | ground → ground | stumps stepping down to the floor, then a log jam (thin logs on stumps) back up | 3 or 4 down; up by 2 or 3 | up and down (old 1-1 floor); the log road rules |
| 25 | `w1-mound-log` Log over the mound | ki | 2 | jump | ground → ground | a stepped earth mound with a thin log across its top as a short high road; the floor round it | mound 2 or 3 steps | stepped mounds (ES 619); the log rules |

**The count for 1-1:**
- 11 harvested sections are usable for 1-1 (15, less stone-road, low-boughs, ledges and ropes), plus my 25: **36 for 12 slots,
  3:1.**
- By phase: start 3, ki 10, sho 13, ten 7, ketsu 5, rest 5, goal 2 (counted from the tables; a section tagged for two phases counts in each).
- engine-core's CHECK 2 table counts against slots per phase. If any phase is under 3:1, tell me the phase and I'll add there.

### Round 3 (designer, 11-05 4:28 PM ET; the lead: rest +1, ten +2, ketsu +1, goal +1 against engine-core's slots at 150 s)

| # | id / name | Phase | Diff | Needs | Ports | Pieces and what holds each | Sub-blocks | Source |
|---|---|---|---|---|---|---|---|---|
| 26 | `w1-log-walk` Along the fallen log | rest | 1 | walk | ground → ground | a long fallen log lying ON the floor (held by the ground), a calm walk along its top; W1 mushroom dressing (not bouncy) beside it; petals low on a stump | the log's length; a short second log | C2 (rest ≈ 2× beat); LABELS §1 solid log (floor-held) |
| 27 | `w1-stilt-logs` High stump logs | ten | 5 | double | ground → ground | thin logs (h 30), each on its own stump down to the floor (the stump meets the log, 12:51 ruling), at rising heights, each a double from the last; the floor road runs below | 3 or 4 logs; rising or up-and-down | the log rules (12:51, 3:40); a double test over the floor |
| 28 | `w1-two-answers` Two answers | ten | 6 | double | ground → ground | a gap past a single jump over the floor; on the near bank, a perched mushroom seated on a stump as the other way across (bounce, then a jump) | the mushroom or none; the far side a bank or a log on stumps | the pair on one beat (LEDGER-11-02:33); two ways over one obstacle |
| 29 | `w1-bough-bridge` Bough stair and bridge | ketsu | 5 | double | ledge → ledge | boughs stepping up two plain W1 trunks, then a short rope bridge between posts that stand on the top boughs (no end hangs in the air: LABELS canopy_bridge, P-2); catch boughs under each gap | 3 or 4 boughs; the bridge or one more bough | LABELS §1 canopy_bridge (W1); catch boughs (3:11 ruling) |
| 30 | `w1-last-step-up` The last step up | goal | 1 | jump | ledge → ledge | from a lower bough, one easy hop up onto the long high log with the exit totem; the bootprint place in its moss (held art) | the hop from the left or a short bough walk first | main's 1-1 end; 1-1.md:23 |

**Seating, for every high end log (#15, #23, #30):** the long high log that carries the exit totem stands on two drawn plain W1 trunks
under it (E3 footingOf: a log in the canopy is held by its trunks, never on air). It's the same log main's 1-1 ends on.

**The count for 1-1, against engine-core's slots** (start 1, ki 1, sho 2, rest 2, ten 3, ketsu 2, goal 1):

| Phase | Sections | Slots | Ratio |
|---|---|---|---|
| start | 3 | 1 | 3:1 |
| ki | 10 | 1 | 10:1 |
| sho | 13 | 2 | 6.5:1 |
| rest | 6 | 2 | 3:1 |
| ten | 9 | 3 | 3:1 |
| ketsu | 6 | 2 | 3:1 |
| goal | 3 | 1 | 3:1 |

Every phase is at least 3:1.

### Story fixes, round 2 (designer, 11-05 4:29 PM ET; the supervisor via the lead)
- Petals sit LOW on trunks at marching height in #19, #22, #23 (1-1.md:26-27), as #11 does. No petal road in the boughs.
- #18 has no sky opening and no long view north (1-1.md:41).
- #23's exit totem is sourced to stageGenerator.ts:2136 on main.
- **Placement rule \`lateOnly: 'lastThird'\`** goes on every bough section: #9, #10, #11, #15, #19, #22, #23, #29, #30, and the
  harvested w1-high-leaps and w1-bounce-run. The generator may lay one only in the stage's last third (1-1.md:46-52, boughs as the
  reward). It's an engine field for the planner to add to SectionTemplate.
- **Bough share:** the stage's boughs + creaky landings stay ≤ 25.3% (the float floor). The lastThird rule keeps boughs to about a
  third of the stage by length. The gate is the measure, and a roll over it fails.
