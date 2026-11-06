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
| 4 | `w1-hollow-twoway` Hollow-log two-way | sho | 3 | jump | ground → ground | a hollow log on the floor (124-150 px tall) with a stump step at its near end up to its top: walk through inside (low road) or hop along its top (high road); rejoin past it | log length; a stump or a stone after it | 1-1, 1-2 | LABELS §2 hollow log (two-road split, W1 art in the w1-new atlas). **ENGINE FINDING: gen2 has no hollow-log shape** |
| 5 | `w1-mushroom-lift` First lift | sho (teach bounce, after the double: Round 2 (c)) | 2 | — (bouncy) | ground → ledge | a perched mushroom on a stump; the bounce lifts him onto a mound or log-road top; walking passes under | lifts onto a mound or onto a log road | 1-1 | the brief's "first lift" (1-1.md:20); the perch rule (Q2) |
| 6 | `w1-twin-bounce` Twin bounce | sho | 4 | — (bouncy) | ledge → ground | two perched mushrooms, each lifting a step higher; then a hop down to the floor | 2 or 3 mushrooms; down by stair or drop | 1-1, 1-5 | bounce taught (ladder); the pair on one beat (LEDGER-11-02:33) |
| 7 | `w1-fallen-trunk` The fallen trunk | ten | 5 | double | ground → ground | a big fallen log (block) too tall for one jump: a double over it, or a mushroom beside it as the second way | the mushroom on the near side, or no mushroom (double only) | 1-1, 1-3 | two ways over one obstacle; a twist on the jump (LEDGER-ENGINE-GEMINI:479) |
| 8 | `w1-double-teach` Double over the dip | ki (teach double) | 3 | double | ground → ground | one gap past a single jump over a safe dip that stops short of the far bank, with a step back (R2); then two more safe gaps | gap count 2-3 | 1-1 | R2 (3:11 ruling); teach over safe ground (§2) |
| 9 | `w1-bough-stepup` Into the boughs | sho | 4 | jump | ground → ledge | low boughs rising from the floor road, floating as platforms may (trunks dropped; no kapok, trunk climb, climbable vine or view opening: 1-4 owns those, 1-1.md:41); the floor carries on below. **LATE only: the rise into the canopy just before #10** | 3 or 4 boughs; a log as the second step | 1-1, 1-5 | "a ground stage that becomes a tree stage" (9:20 ruling); boughs are the reward at the top (1-1.md:46-52) |
| 10 | `w1-canopy-rungs` Canopy rungs (the moment) | ten | 7 | double | ledge → ledge | boughs at rising heights, each rise needing a double; catch boughs 60-120 px under each gap, one jump back up | 3 or 4 rungs; left- or right-leaning | 1-1 | the brief's double chain (1-1.md:21-22); catch boughs (3:11 ruling) |
| 11 | `w1-high-walk` High branch, petals low | rest | 1 | walk | ledge → ledge | one long bough with petals at marching height on a low log or stump below; a Dot spot | length; a short step in the middle | 1-1, 1-5 | a rest about 2× the beat (C2); petals low (brief :26) |
| 12 | `w1-dropdown-stair` Drop and climb back | sho | 3 | jump | ledge → ground | a raised road ends; a drop to the floor; a stump stair back up | the stair's 2-4 steps; a stone or a stump at the foot | 1-1, 1-2 | stairs out of the deep floors (brief step 1); every dip a one-jump way out |
| 13 | `w1-knot-bank` Stepped mound | ki | 2 | jump | ground → ground | **stepped earth mounds** (2-3 steps) up to a mound top, then a step down; knots are DRESSING only (not pieces), on a fallen log, never on an earth face | 2 or 3 steps; down by step or hop | 1-1, 1-2 | "hills and little areas to jump up on" (ES 592); stepped mounds (ES 619) |
| 14 | `w1-floor-dash` Floor and high road | ki, sho | 2 | jump | ground → ground | the plain two-road stretch: a **high road of thin logs on stumps (or stones seated on banks)** above the floor, hop steps on the floor below; either road walks on | 3-6 pieces; one at a new height | 1-1, 1-2, 1-3, 1-5 | old 1-1's floor (the source of its 0.384), as a section rather than the whole stage; rocks never float |
| 15 | `w1-quiet-arrival` Quiet arrival | goal | 1 | walk | ledge → ledge | a calm walk along a high branch onto **a long high log, the end piece, with the exit totem as an `objective` socket (main's gen.item('exit_totem'), stageGenerator.ts:2136) on it** (what main's old 1-1 ends on: a 685 px log at y 580, exit_totem, no shrine). Petals low; the bootprint place a flush decal in the log top's moss, toe east (held art, R-165.31) | short or long walk-on | 1-1 | ends: quiet, "up in the high branches, pointed north" (1-1.md:23); stageClue.ts:16; main's 1-1 end |

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
| 17 | `w1-fern-bank` Fern bank | rest | 1 | walk | ground → ground | a long flat bank, ferns and a fallen-log seat (dressing); petals low on a stump beside; one low stump step | long or short; the step or none | C2 (rest ≈ 2× beat); petals low (brief :26) |
| 18 | `w1-clearing` Sunlit clearing | rest | 1 | walk | ground → ground | two long banks joined by a one-step dip (no gap); a Dot spot; **no sky opening or long view north** (1-4 owns the view, 1-1.md:41) | the dip or a step up | C2; a Dot spot at a rest (LEDGER-11-02:336) |
| 19 | `w1-bough-bench` High rest | rest | 1 | walk | ledge → ledge | a long thick floating bough after the moment; petals LOW on a low log or stump below it at marching height, seen from above (never a petal road in the boughs: 1-1.md:26-27) | length | C2; after every test, a rest (rulebook §4 rule 3) |
| 20 | `w1-stump-towers` Stump towers | ten | 5 | double | ground → ground | thin floating logs (platforms may float, Matt) at rising heights, each a double up; the floor runs below (a fall is a walk back). No tall stumps: an `on` stump can't stand that tall | 3 or 4 towers | the floor road; a test of the double |
| 21 | `w1-bounce-double` Bounce, then fly | ten | 6 | double | ground → ledge | a perched mushroom's bounce, then a double in the air onto a high log road | high road at two heights | the pair on one beat (LEDGER-11-02:33) |
| 22 | `w1-canopy-weave` Canopy weave | ketsu | 6 | double | ledge → ledge | two roads in the boughs (high boughs, mid boughs) that rejoin; catch boughs under each gap | the high road's length; the petals LOW on low logs or stumps under both roads (1-1.md:26-27) | high/low split (LEDGER-11-04 part1:317); catch boughs (3:11 ruling) |
| 23 | `w1-sunlit-log` Onto the high log | goal | 1 | walk | ledge → ledge | a two-step bough walk-on to the long high log with the exit totem as an `objective` socket (main's gen.item('exit_totem'), stageGenerator.ts:2136); the bootprint place in its moss (held art); any petals LOW on a low log or stump below (1-1.md:26-27) | one step or two | main's 1-1 end: the exit totem from stageGenerator.ts:2136 (`gen.item('exit_totem', ...)`), on a 685 px log at y 580 (eraRoll build, layout 1); 1-1.md:23 |
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
| 26 | `w1-log-walk` Along the fallen log | rest | 1 | walk | ground → ground | a long fallen log lying ON the floor (held by the ground), a calm walk along its top; W1 ferns and leaf litter beside it (w1Fern, w1LeafLitter: no mushroom-shaped dressing, which could read as a bouncer, D38); petals low on a stump | the log's length; a short second log | C2 (rest ≈ 2× beat); LABELS §1 solid log (floor-held); LABELS §5 W1 dressing |
| 27 | `w1-stilt-logs` High stump logs | ten | 5 | double | ground → ground | thin floating logs (h 30) at rising heights (no stilts: too tall for an `on` stump; platforms may float), each a double from the last; the floor road runs below | 3 or 4 logs; rising or up-and-down | the log rules (12:51, 3:40); a double test over the floor |
| 28 | `w1-two-answers` Two answers | ten | 6 | double | ground → ground | a gap past a single jump over the floor; on the near bank, a perched mushroom seated on a stump as the other way across (bounce, then a jump) | the mushroom or none; the far side a bank or a log on stumps | the pair on one beat (LEDGER-11-02:33); two ways over one obstacle |
| 29 | `w1-bough-log` Bough stair and log span | ketsu | 5 | double | ledge → ledge | floating boughs stepping up, then a thick log span between the top two (platforms may float) (no rope: 1-1's brief says `not: ropes`); catch boughs under each gap | 3 or 4 boughs; the log span or one more bough | LABELS §1 solid log (held at both ends); catch boughs (3:11 ruling); supervisor round 3 |
| 30 | `w1-last-step-up` The last step up | goal | 1 | jump | ledge → ledge | from a lower bough, one easy hop up onto the long high log with the exit totem as an `objective` socket (main's gen.item('exit_totem'), stageGenerator.ts:2136); the bootprint place in its moss (held art) | the hop from the left or a short bough walk first | main's 1-1 end; 1-1.md:23 |

**Seating, for every high end log (#15, #23, #30) [revised 4:58 PM ET: trunks dropped, platforms may float (Matt)]:** the long high log floats as a platform, like main's 1-1 end log. The bootprint is the held clue's place, reported, not a piece.

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
- Petals sit LOW at marching height in #19, #22, #23 (1-1.md:26-27), as #11 does: on low logs, banks or stumps since trunks were dropped (later round). No petal road in the boughs.
- #18 has no sky opening and no long view north (1-1.md:41).
- #23's exit totem is sourced to stageGenerator.ts:2136 on main.
- **Placement rule `window: [0.67, 1]`** (the planner's field: the fraction of the stage's planned chunks) goes on every bough section: #9, #10, #11, #15, #19, #22, #23, #29, #30, and the
  harvested w1-high-leaps and w1-bounce-run. The generator may lay one only in the stage's last third (1-1.md:46-52, boughs as the
  reward). It's an engine field for the planner to add to SectionTemplate.
- **Bough share:** the stage's boughs + creaky landings stay ≤ 25.3% (the float floor). The lastThird rule keeps boughs to about a
  third of the stage by length. The gate is the measure, and a roll over it fails.

### Story fixes, round 3 (designer, 11-05 4:30 PM ET; the supervisor's check of 70eaedb5d)
- #29's rope bridge is replaced by a thick log held at both ends by the top boughs. 1-1's brief says `not: ropes`.
- #26's mushroom dressing is replaced by W1 ferns and leaf litter. A mushroom that doesn't bounce would teach a false rule (D38).
- #18 and the petal heights were fixed in round 2.
- The bough-section field is `window: [0.67, 1]`.
**All three story rounds are cleared. This file is ready for engine-core to enter.**

### engine-core's entry findings, ruled (designer, 11-05 4:58 PM ET)
- **Lengths:**
  - rests and goals may be short: C2 makes a rest about 2× the local beat, a few seconds;
  - every CHALLENGE section (ki, sho, ten, ketsu) gets versions that reach at least 10 s, by more repetitions in its sub-blocks (more
    stumps, stones, logs or rungs), never two of a section in one slot.
- **#5** moves to sho. The bounce is taught after the double, as Round 2 (c) ruled from main.
- **Trunks dropped:** logs and boughs float as platforms may (Matt; LABELS rule 2). Petals sit low on low logs, banks or stumps near
  marching height. Rocks still never float.
- **#20 and #27:** floating thin logs replace the too-tall stumps.
- **#4:** a stump step at the hollow log's near end.
- **Not pieces:**
  - the exit totem is an `objective` socket (stageGenerator.ts:2136);
  - the bootprint is the held clue's place, reported (R-165.31);
  - knots are dressing.

## Round 4: the floor road under the raised sections (designer, 11-05 6:34 PM; check 3b on gen2 1-1 FAILS: diversity 0.04-0.06 against 0.35, splits 3-7 against 34, two-road about 0.1 against 0.61)

**The root.** Old 1-1's two roads come from logs on stump-posts and stones over ONE continuous moss floor: the floor is the low road
almost everywhere (the planner's 4:00 PM measure: 36 splits, two-road 0.61; LABELS §1 solid log, "ground-fork high road"). Our raised
sections lay their high pieces with no walkable floor under them, so a roll has one road. Variety then has nowhere to come from
(MATT: "variety first").

**The floor-road rules (FR), for every raised section:**

| # | Rule | Source |
|---|---|---|
| FR1 | **A floor piece runs the whole length under the raised pieces**, walkable end to end. The exception is a T's check or an X's block, where the floor ENDS at the block face (B1). The floor road comes back after the block | old 1-1 (above); NODES §8.7 B1 |
| FR2 | **Head room:** a raised piece's underside is at least 110 px over the floor top, so Pokey walks under (76 px body, plus 34) | the porter's petal head room (76 px); P-6 (nothing in the lane) |
| FR3 | **The low road is a real road:** it rejoins the high road at the section's end. Either the high road steps back down to the floor, or a stair of landings climbs back up, each step at most 80 px (gen2's 'walk' rise limit on 1-1, the porter 6:35 PM; under a single jump's 108) | V7 (both roads finish and rejoin); physics.ts JUMP_RISE |
| FR4 | **The low road has its own beat, of a different kind from the high road's** (R2 lesson 1: kinds, not pixels). For example, low stumps or a dip under a high log road; stones under boughs. The petals sit on the LOW road (they're the story's trail, 1-1.md:26-27); a find on the high road (V7 +) | R2 L1; 1-1.md:26-27 |
| FR5 | **In the bough window ([0.67, 1]) the low road is a MID road** (low logs on stumps, or stones on banks, 110-300 px under the boughs), not the deep floor. The corridor is 900 px, and the climb back must stay a stair (FR3) | the corridor (W1_KIT 900 px); FR3 |
| FR6 | **Blocks never get a low road past them** (B1-B4). Where a section is both a two-road and a T or X, the block sits where the roads have met, or on the high road with the low road ending back-only | B1-B4 |

**Per-section changes:** these are set to the planner's harness counts, which I've asked for, and follow in this round.

### Round 4, part 1: the floor road onto the existing raised sections (6:35 PM)

| Section | Change (FR rules) |
|---|---|
| `w1-log-road`, `w1-bounce-double` (#21), `w1-high-leaps`, `w1-bounce-run`, `w1-ledges`, `w1-bough-stepup` (#9) | **FR1-FR4:** a floor piece the whole length under the raised pieces, head room ≥ 110 px. The low road's beat: low stumps (`gLowStumps`) or a dip (`gDip`), with petals on it. It rejoins by the high road stepping down, or a stump stair ≤ 80 px a step. #21 is a combine, not a T or X, so its floor road may pass under |
| `w1-second-jump`, `w1-stump-towers` (#20), `w1-stilt-logs` (#27), `w1-fallen-trunk` (#7), `w1-two-answers` (#28) | **FR6 (tests and twists):** the floor runs under the approach and resumes after the block, but ends at the block face (back-only pit, B2b). It's two roads before and after, never past the block |
| `w1-canopy-rungs` (#10, the signature) | **FR6 extends to S:** a set piece that can be walked round isn't one (Wonder's test 2, "he can suddenly do something new"). A MID road (FR5) of low logs on stumps runs under the approach and the run-out only |
| `w1-high-walk`, `w1-bough-bench` (rests in the window) | **FR5:** a mid road of low logs on stumps 110-300 px under the bough, petals on it, rejoining at the far end by a stump stair. Two roads, no hard input on either |
| `w1-canopy-weave` (#22), `w1-bough-log` (#29) | **FR5:** the low road is the mid road, not the floor (the corridor). #22 already has two bough roads; #29's catch boughs stay ≥ 130 px under the next landing (B4) |
| goal sections (#15, #23, #30) | no change. The end log is the arrival, one road (the quiet ending) |

### Round 4, part 2: new sections for the pool cells that bind (the planner's 6:34 PM harness, 16 seeds)

**What binds, at 3:1 against the most a roll needs:**
- teach: 4 against 9;
- fork: 3 against 6, with no bounce or climb type;
- signature: 1 against 3, floating only;
- twist: 2 against 3, ground only;
- arrive: 2 against 3;
- test: no climb type.

A loosened slot now FAILS the roll, so this list is what blocks 1-1.

**Rhythm strings** (R2 lesson 1: kinds, not pixels). Each version below lists its beats in order:
- h = hop (≤ 1 body up)
- j = gap jump
- d = double
- b = bounce
- c = a climb step
- w = walk
- L = the low road's beats, in brackets

Every section's versions differ in kinds or order, never only in sizes. All of these sections use existing W1 art only: moss_stone floor and banks, logs, stumps, boughs, mushrooms and petals (LABELS §1).

| # | id, name | Job, type, phase | Versions (rhythm string) | Block / roads | Sources |
|---|---|---|---|---|---|
| 31 | `w1-step-stones-teach` "The first stones" | teach jump, ground, ki | **a** `w h h j w`; **b** `w j w j j` (2 gaps, then a pair); **c** `w h j h j` | jump block: a step 60-80 px up onto a stone bank with no lower step beside it, floor ending at its face (B1); the miss lands on the floor before it | 1-1's teach run then jump (CoachOverlay.tsx:10); B1 |
| 32 | `w1-log-teach` "Up the first log" | teach jump, ground, ki | **a** `w h w j j` over low logs on the floor; **b** `w j h h` onto a log on stumps, then off | as #31: a log face 60-80 px, no step beside | old 1-1's logs on stump-posts (LABELS §1 solid log); B1 |
| 33 | `w1-dip-double-teach` "The wide dip" | teach double, ground, ki | **a** `w j d w` (one jump, then the double gap); **b** `w d j j`; Easy: a rise block 130-145 px (§8.7 amended) | double block: gap ≥ single + 20 px (share ≥ 0.85, the planner's pixel check), back-only pit | R2 (3:11); NODES §8.7 |
| 34 | `w1-bank-double-teach` "The tall bank" | teach double, ground, ki | **a** `w h d w` (a rise block onto a bank); **b** `w d h h` | rise block 130-145 px, the floor ends at the bank face | NODES §8.7 B2a |
| 35 | `w1-mushroom-bank-teach` "The bounce bank" | teach bounce, bounce, sho | **a** `w b w h`; **b** `w h b j` | bounce block: the mushroom on the floor, lip 200-220 px (§8.7 #5 ruling) | the brief's first lift (1-1.md:20); B3 |
| 36 | `w1-mushroom-fork` "Mushroom or the long way" | fork, bounce (low road), sho | **a** high `b d +` / low [`b h h`]; **b** high `b c c +` / low [`h b w`] | none (P). Both roads rejoin; the find on the high road | V7; FR3-FR4; 1-1.md:26-27 (petals low) |
| 37 | `w1-twin-mushroom-fork` "Two mushrooms" | fork, bounce, sho | **a** high `b b +` / low [`b j`]; **b** high `b d +` / low [`j b w`] | none | as #36; #6 twin bounce |
| 38 | `w1-stair-fork` "The stump stair or the floor" | fork, climb (low road), sho | **a** high `c c d +` / low [`c h c`]; **b** high `c d c +` / low [`c c w`] | none. The low road is itself a low stair (each ≤ 80 px) | V7; FR3 |
| 39 | `w1-bank-stair-fork` "Bank steps, two ways" | fork, climb, sho | **a** high `c c j +` / low [`h c c`]; **b** high `d c +` / low [`c j c`] | none | stepped mounds (#24 kin) |
| 40 | `w1-stair-test` "The steep stair" | test double, climb, ketsu | **a** `c d c d`; **b** `d c d d`; **c** `c c d d` | each `d` is a rise block 130-145 px; floor road back-only under it (FR6) | NODES §8.7; LEDGER-11-02:54 (rising) |
| 41 | `w1-log-stair-test` "Logs up the bank" | test double, climb, ketsu | **a** `d c d` up logs on stumps; **b** `c d j d` | as #40 | as #40; LABELS §1 log on stump-post |
| 42 | `w1-backstep-twist` "The stair that turns" | twist, climb, ten | **a** `c c` right, then `c c` LEFT up a switchback; **b** `c d` then a drop and `c c` back | none needed (a twist turns a taught move: B5 only for two-answer twists) | §1 twist ("break the rhythm just learned"); LEDGER-11-02:72 |
| 43 | `w1-dipping-boughs-twist` "Up and down the boughs" (window) | twist, floating, ten | **a** `d` up, `j` down, `d` up; **b** `j` down twice, then `d d` | none; a mid road (FR5) under it, rejoining | §1 twist; platforms may float (MATT 11-05) |
| 44 | `w1-log-chain` "The log chain" (window) | signature, raised logs, ketsu | **a** `d d d d` across floating logs, rising then level; **b** `d j d d` falling to a long log | the double chain (1-1.md:21-22); no bypass (FR6 for S); a mid road under the approach only | 1-1.md:21-22; Wonder's 3 tests (R1 L6) |
| 45 | `w1-mushroom-chain` "Bounce into the boughs" (window) | signature, bounce, ketsu | **a** `b d d d` (a mushroom, then a double chain up boughs); **b** `b d b d` (two mushrooms on stumps, each into a double) | as #44 | 1-1.md:21-22 (the double chain), with the bounce as its way in; LEDGER-11-02:33 (the pair) |
| 46 | `w1-morning-path` "The morning path" | arrive, ground, start | **a** `w w h w`; **b** `w h w h` over very low roots (≤ 40 px) | flat and safe: no ground ends in the first 1,300 px (STAGE-RULES:161); the squirrels' `sq` decor socket | the brief's start (squirrels: 1-1.md must); STAGE-RULES:161 |

**Counts after Round 4:**

| Job | Count | Types |
|---|---|---|
| teach | 9 | jump 3, double 3, bounce 3 |
| fork | 7 | ground 2, floating 1, bounce 2, climb 2 |
| signature | 3 | floating, raised logs, bounce |
| twist | 4 | ground 2, climb, floating |
| arrive | 3 | |
| test | 8 | climb 2 |

**Story notes for the supervisor:**
- #44 and #45 are both "the double chain" moment the brief names (1-1.md:21-22), each in a new form. Neither adds a beat.
- No animals, ropes, creaky limbs or water appear (the brief's `not`).
- The petals stay low on every low road (1-1.md:26-27).

**The supervisor's story check, round 4: PASS (6:40 PM). Its two notes are applied:**
- #44, #45 and #10 (the three signatures) are **`feel: ['1-1']` ONLY**. Each is the brief's one double-chain moment, unique in the game (§1; R1 L6), so no other stage draws them. Exactly one per roll (V6).
- #42's leftward leg is **at most about one screen** (≤ 800 px). Onward and to the right is north (the lead's ruling), so a long walk back would read as going backwards.

## Round 5: the rest of what blocks 1-1 (designer, 11-05 6:47 PM; the planner's exact CHECK 3b list, 6:46 PM ET, 16 rolls on 5a9d7d2c, before Round 4 was entered)

**What Round 4 already covers:**
- signature (14 rolls dry): #44, #45;
- bounce forks (11): #36, #37;
- climb tests (8): #40, #41;
- climb forks (5): #38, #39;
- the bounce teach (4) and the reward (4): #35. Both come back once the planner's bounce-rise place lets #5 and #35 lay.

**Round 5 tops each binding cell up to 3 (the planner: "aim for 3 of each where a roll can need one").** A fork's type is its LOW road's.

| # | id, name | Job, type, phase | Versions (rhythm string) | Block / roads | Sources |
|---|---|---|---|---|---|
| 47 | `w1-mushroom-fork-dip` "The dip mushroom" | fork, bounce, sho | **a** high `j d +` / low [`h b h`] (a mushroom in a dip lifts the low road out); **b** high `d j +` / low [`b w b`] | none; rejoin; petals low | V7; FR3-FR4 |
| 48 | `w1-root-stair-fork` "Roots up, or the stair" | fork, climb, sho | **a** high `d d +` / low [`c c c`]; **b** high `j d +` / low [`c w c`] | none; the low stair's steps ≤ 80 px | V7; FR3 |
| 49 | `w1-bank-stair-test` "The bank wall" | test double, climb, ketsu | **a** `c D c D`; **b** `D w D c` (K/D beats as entered) | D = rise 136-140, the floor back-only under it | NODES §8.7 |
| 50 | `w1-bough-descent` "Down through the boughs" (window) | descent, floating, sho | **a** `j j h` down three boughs; **b** `h j w j` with a level bough | falling (`_`); each drop ≤ 140 px; a mid road (FR5) under the top | §1 descent; LEDGER-11-02:54; platforms may float |
| 51 | `w1-log-steps-descent` "Floating logs down" (window) | descent, floating, sho | **a** `d` level, then `j j` down; **b** `j h j h` | as #50 | as #50 |
| 52 | `w1-canopy-drop` "Bough to bough, down" (window) | descent, floating, sho | **a** `j j j` with a catch bough under the last; **b** `h j d` down then a level double | as #50; B4 for the catch bough | as #50 |
| 53 | `w1-stair-run` "Up the stump stair at a run" | flow, climb, sho | **a** `c c c c` (quick single steps, ≤ 80 px each, no stop); **b** `c h c h c` | none; no dead time over 2.5 s (§1 flow) | WORLD-RULEBOOK §7.1; R2 L1 (rhythm groups) |
| 54 | `w1-bank-run` "Bank steps at a run" | flow, climb, sho | **a** `h c c h c`; **b** `c c j c` | as #53 | as #53 |
| 55 | `w1-zigzag-run` "The quick zigzag up" | flow, climb, sho | **a** `c c` up stones, then `c c` up logs; **b** `c j c j` | as #53 | as #53; #2 zigzag kin |
| 56 | `w1-high-step-twist` "Up, then the double back down" | twist, climb, ten | **a** `c c c`, then a `d` ACROSS (not up) to a lower stair; **b** `c d c` with the double going level | turns the climb's rhythm (§1 twist) | §1; LEDGER-11-02:72 |
| 57 | `w1-stair-gap-twist` "The broken stair" | twist, climb, ten | **a** `c c j c` (a gap in the stair); **b** `c j c j` | as #56 | as #56 |
| 58 | `w1-drop-bounce-twist` "Drop onto the mushroom" | twist, bounce, ten | **a** `w` off a log DOWN onto a floor mushroom, `b` back up across a gap; **b** `h` down, `b`, `j` | the bounce turned: down-then-up, not walk-then-up | §1 twist; the bounce (1-1 teach) |
| 59 | `w1-long-bounce-twist` "The long bounce" | twist, bounce, ten | **a** `b` ACROSS a wide gap (a long low bounce, steered); **b** `b j b` | as #58 | as #58 |
| 60 | `w1-dip-bounce-twist` "Out of the dip" | twist, bounce, ten | **a** `h` into a dip, `b` out of it; **b** `j` over, then `h` down, `b` up | as #58 | as #58; #47 kin |
| 61 | `w1-bounce-stair-combine` "Bounce, double, up the stair" | combine, climb, ten | **a** `b d c c`; **b** `c b d c` | the pair (bounce + double) on one beat, onto a stair | LEDGER-11-02:33 (the pair) |
| 62 | `w1-bounce-bough-combine` "Bounce into the bough" (window) | combine, floating, ten | **a** `b d` onto a bough, `j j`; **b** `h b d h` | the pair, onto floating boughs | as #61; platforms may float |

**Counts after Round 5 (the cells the planner listed):**

| Cell | Count |
|---|---|
| signature | 3 |
| bounce fork | 3 |
| climb fork | 3 |
| climb test | 3 |
| floating descent | 3 |
| climb flow | 3 |
| climb twist | 3 |
| bounce twist | 3 |
| combine | 5 (adding climb and floating types) |
| bounce teach | 3 (once the bounce-rise place exists) |

All existing W1 art; boughs only in the window; nothing from the brief's not-list; petals low, finds high.

**Watch:** #53-#55 are a climb in flow's job. Each step is ≤ 80 px (the walk rise), so the stair is quick single jumps, not doubles.

**FR7 (added 6:58 PM, from the planner's 6:58 PM answer: diversity reads the QUICKEST route's action string, i.e. its beats and their
spacing, never piece kinds or heights; eraRoll.measureRoll, beats.ts, analyze.ts actionTokens).** A low road of plain walking is
the quickest line, so it would become the measured route and read as one long "walk". **So each road's beats are as dense as the
other's: no stretch of plain walk over about 1.5 s on either road**, and each road's beat string differs (FR4). Whichever road the
quickest route takes, it reads moves. Versions must differ in the ORDER and SPACING of moves along the line; a change in height
within one move reads the same.

**FR8 (added 7:02 PM, from the porter's seed-1 strings at engine-core 474e86b33).** The low roads now read beats, but almost all of them
read the SAME beat: `w h w h w h`, stumps every time. The 3-grams then repeat across sections, and diversity can't rise. **Each low
road uses at least two beat kinds, with never three of the same kind in a row, and the kinds differ from section to section:**

| Section | Low road's beats |
|---|---|
| `w1-log-road` | a dip and a bank step: `j`, `c n`, `h` |
| #21 `w1-bounce-double` | stones, then a dip: `h h j h` |
| #9 `w1-bough-stepup` | bank steps and a dip: `c n j h` |
| `w1-high-leaps`, `w1-bounce-run` | a floor mushroom and stones: `h b h j` (ketsu: the bounce is taught by then) |
| `w1-ledges` | a mound up and over: `c h n j` |
| the forks #36-#39, #47-#48 | as written (each low road already mixes `b`, `c`, `h` and `j`); keep each low road's string distinct from the others' |

- **Plain stretches:** ≤ 1.5 s inside a challenge section. Up to 2.0 s in a run-out after a fork, or in a harvest tail, since that's
  the node's cool-down (§1).
- **The porter's two changes are accepted.**
  - The log road's logs float, so no post walls the lane (Matt: platforms may float).
  - The first bough on the step-up sits at 180 px, reached by a stump then a double.
- The towers, stilts and second-jump keep long plain stretches until the planner's back-only pit lands. That's expected.

## Round 6: the 8 rolls of 16 that don't build (designer, 11-05 9:33 PM ET; the planner's dry-cell list, 9:33 PM, engine-core c2710323 + engine-chunks a31e7285)

**Cause 1: the bounce teach never survives.** This empties the seed perch and every bounce fork, test and combine downstream (4 of the 8).
- **mushroom-lift (#5) and mushroom-bank-teach (#35) are "walked round":** a platform sits 0-45 px under the lip, within 106 px of it. B1 forbids that.
- **Ruling (B7, new):** within a single jump's reach of a block's lip (175 px across, 185 px down), nothing standable may stand on the approach side. That covers:
  - the join step the pipeline adds between sections;
  - the floor road (FR1 ends at the block face);
  - a stone or stump.
- The lip's bank face is sheer to the floor, and the mushroom is the only way up.
- **For the planner:** no join step lays against a block's face. A section with a `block` tells the join "sheer".
- hop-bounce's unreachable exit is the planner's level-check model to look at, as they said.

**Cause 2: the corridor.** The route climbs early (trend up), so late rising sections have no room and get swapped out.
- **Ruling:** keep the corridor. Growing it fights the camera-reach gate that already fails. Instead, every late rising section carries a **level or net-zero version** (it climbs, then steps back down in its run-out), and **the roll tries a section's other versions before swapping the section out** (planner).
- The versions to add:
  - #10 canopy-rungs, a level version (4 doubles across, not up);
  - #44 log-chain a (level), which already exists;
  - #45 mushroom-chain, a version up two boughs then down two;
  - #40, #41 and #49 (climb tests), each with a run-out stair back down (inside the test, V18 judges only up to the summit);
  - #61 bounce-stair-combine, a version that ends on its own start height.
- **The seed perch (low route, past the bottom):** a version that climbs into the perch from the floor (`c c` then the bounce), so it fits a low route.
- This doesn't break V19 (no late net loss on an up stage). A level version loses nothing, and a net-zero version's run-out drop is only the climb it just made. The node still ends no lower than it began.

**Cause 3: empty cells.**

| Cell | Fix |
|---|---|
| climb × climb × sho, outside the window | **retag #53, #54 and #55** (the stair runs, ground pieces, no boughs) with jobs `['flow', 'climb']`. That gives 3 climb-type climbs outside the window |
| combine × ground | **new #63 "Bounce over the dip"** (a floor mushroom, `b d` across a wide dip onto a bank) and **#64 "Mushroom by the fallen log"** (`b d` over a tall fallen log). Both are ground type, the pair on one beat (LEDGER-11-02:33), and neither is windowed |
| combine × bounce, outside the window | **new #65 "Mushroom stair"** (`b d b` up two floor mushrooms onto stumps). Bounce type, not windowed |
| test × bounce | **new #66 "Two lifts"** (two bounce blocks, each lip 200-220 px, B3/B7) and **#67 "The bounce wall"** (a bounce block, then a double block). Both need the planner's bounce-rise place |
| test × floating (stump-towers #20, stilt-logs #27: exit unreachable) | the porter checks the laid exits: the rises [-140, -136] may sum past the out floor's jump down. These are the porter's numbers |
| bounce forks, tests and combines before the bounce is taught | **rule V20 (new): a node of a type that needs a move comes only after that move's T** (bounce type after `Tb`). This is an engine rule for the deal: it doesn't deal a type before its move is taught. NODES §8.3 V3 already says moves; V20 extends it to the deal |

**On the planner's question (deal skips job × type cells the kit lacks):** no. A skip hides a hole (Law 22). The deal should fail
loudly, and the kit fills the cell, as #63-#67 do. The one exception is a cell the brief rules out (a `not` type).

**The supervisor's check of Round 6: PASS (9:34 PM). Its two keep-checks are now rules:**
- **V19b:** the end log stands above the height where the bough window starts ("up in the high branches", 1-1.md:23). Stacked level or net-zero versions may not flatten the rise. stage.ts reports the end log's height against the window's start.
- **The seed perch's low-route version keeps stage11's promise** (stage11.test.ts:17-24): the seed more than 200 px up, beyond a double, with a mushroom within 260 px.

**FR9 (added 10:11 PM, from the lead's heads-up on the planner's quiet-line finding: all 16 rolls run 4.3-7.8 s quiet against 4 s; old 1-1 ran 2.1-3.1 s).** It applies to Round 6 now, and to every section in tomorrow's pass:
- **Every floor beat is a real obstacle:** a wall of at least 50 px (a hop over it), a gap, or a mushroom. A 36-42 px stump is walked through, and its art with it (a polish defect), so it scores no beat. Every `h` in a rhythm string is ≥ 50 px.
- **No plain floor over 4 s anywhere,** rests and arrives included. A rest stays easy, but it gets one soft beat (a single ≥ 50 px stump or a small dip) every ≤ 3 s, or a shorter version. The same goes for walk-on joins. A step down scores no beat, so it doesn't count.
- In Round 6: #63's dip, #64's log and #65's stumps already beat. Every stump and hop in them is ≥ 50 px.
