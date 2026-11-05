# PLAN: the level engine, buildable tomorrow morning (engine planner, 2026-11-04 night)

**STATUS: DRAFT 1 (10:49 PM ET).** The designer's clean-sheet Option E (engine-design, DESIGNER.md) is due 11:45 PM ET. This draft
holds everything that does not depend on E: the decision from Matt, the runs on our code, the tool-truth fixes, the risk register,
the cost model, and "A reordered" fully planned. §1 and §6 get E's side-by-side and the build pick when E lands. Due 12:45 AM ET.

---

## Matt's decision (2026-11-04, 10:40 PM ET, relayed by the lead): the beat is the player's rhythm, not the song's

> "the beats were more of how the player played, not so much with the music... you set the jumps up so that a player can get into a
> rhythm, not so much that the rhythm has to go with the song."

What this plan does with it:
- The engine's "beat" is a **play rhythm**: the timing pattern of the player's moves, in Launchpad-style rhythm groups (regular,
  swing, broken, wait-and-go; a density; rests between groups). It is data, set per stage or per node.
- It is **not** tied to the song's BPM or its onsets. The music lock (`BEAT_STAGES`, `src/audio/scenes.ts:163`, and `stageBpm`,
  `src/game/beatTrace.ts:641-657`) is not part of the engine's design. Onset-following (DESIGNER.md §10.3 "reopened") is dropped.
- The tracer's maths is unchanged by this: `traceNode` already takes any `bpm` (`beatTrace.ts:58-63`, `:361-362`). The play tempo
  becomes a field of the rhythm data, chosen per node, instead of being read from the music.
- The designer's §10.0 question to Matt ("should the beat frame every stage?") is answered by this and is **removed from "needs Matt"**.
- It agrees with the critic's measured finding (CRITIC.md #3, and run E2 below): tempo alone gives longer walks between the same
  jumps, not variety. Variety has to come from the **rhythm pattern, the move vocabulary and the surfaces**.

---

## 0. Planned vs actual time

| | |
|---|---|
| Planned | 75 minutes (brief); then extended by the lead at 10:43 PM ET to a 12:45 AM ET due time, to fold in Option E |
| Started | 10:38 PM ET (`TZ=America/New_York date`), 2026-11-04 |
| Draft 1 pushed | 10:49 PM ET |
| Final | (filled in at the final commit) |
| Where it went (draft 1) | Read CRITIC.md and its runs list, DESIGNER.md (all 1,111 lines, in parts), LEAD-SKETCH.md, R4 §1-§2 and §5-§6 in full, R1 §2, R2 §2, R3 §2 (F1-F4) and §3 (W1-W14), LEDGER-ENGINE-GEMINI §6-§7; code: `beatTrace.ts` (all 668 lines), `w1Rhythm.ts` 1-330, 440-770, 1007-1030, `tools/inspect/stages.ts` (all), `tools/validate/funcheck.ts` (all), gen2 `DESIGN.md` (Parts A-B12), `types.ts:300-372`, `stageGenerator.ts:2835-2875`; rules: STAGE-RULES §0-§2 and §5-§5b, LAWS (all). Ran 9 experiments against the real code (§R below), 0.5-12.7 s each |
| Not yet read in full | R1 §3-§6, R2 §3-§6, R3 §4-§6, LEDGER-ENGINE-PAPERS, gen2 `pipeline.ts` beyond the cited lines, PERFORMANCE-RULES past §0. Being read before the final, while E is written |

---

## §R. The runs this plan rests on (all measured; scripts and full output in `reference/engine/plan-runs/`)

Every run imports the real code read-only, in a worktree of `origin/ccr-0d59a91c-oy3imz` at **727db7ba** (`plan-runs/HEAD.txt`).
Short names: BT = `src/game/beatTrace.ts`, WR = `src/game/w1Rhythm.ts`, both at that head.

**E1. The proposer and the tracer disagree about what a jump can reach** (`plan-exp.ts.txt`, `plan-exp.out`). WR's `fits`
(WR:169-172) asks one full-hold flight. The tracer asks every row of `TRIES` at 1/60 and 1/30 s (BT:330-343, thrown at BT:397),
including the short flick at 0.8 hold.
```
  PAL_B  -60:PNE  -50:PNE  50:PNE  60:PNE  80:P-E!  90:P--!
  top    -50:PNE  -40:PNE  40:PNE  50:PNE  80:P-E!  90:P--!
  highest rise jump  : proposer 102, tracer Normal 77, tracer Easy 56 px
  highest rise hop   : proposer 49, tracer Normal 46, tracer Easy 39 px
  highest rise double: proposer 175, tracer Normal 165, tracer Easy 134 px
```
The proposer offers 25 px more rise on a jump than the tracer accepts. 80 and 90 in two 1-2 palettes (WR:606, :617) can never be laid.
This is defect (b), confirmed for every move, not only the jump.

**E9. The first step, prototyped: one reach predicate in the proposer** (`plan-exp6.ts.txt`, `plan-exp6-w1RhythmPlan.diff.txt`,
`plan-exp6.out`). A scratch copy of WR whose `fits` also calls the tracer's own predicate (all `TRIES`, Normal, and Easy after
`easyNode`'s cut), with a tally at every reject point. 1-2 and 1-5, layouts 1-16, both settings:
```
BASE  1-2 Normal: 932 rejected tries   (880 = 94.4% "a clumsy jump (air #) can't reach # px up")
BASE  1-2 Easy  : 1532 rejected tries  (1447 = 94.5% the same rule), 8 whole re-rolls
FIXED 1-2 Normal: 41 rejected tries    (0 "can't reach"; 39 "the gap is # px: no jump at all")
FIXED 1-2 Easy  : 101 rejected tries   (0 "can't reach"; 86 "no jump at all"; 14 "the split's roads can't hold their petals"), 14 whole re-rolls
FIXED 1-5 Normal/Easy: unchanged (16 / 42, all "the same gap 4 times"); 1-5's laid heights identical, so its layouts do not move
```
- Rejected tries fall 96% (Normal) and 93% (Easy). The expert clock stays 156-189 s (base 154-190).
- **It changes every 1-2 roll** (the dice draw from shorter lists), so it is a stage change that goes through the full gates.
- **The new top rejection is the petal split** (14 whole Easy re-rolls, up from 8). That is the next ruler item, not a regression to hide.
- My Easy base (1,532) differs from R4 §5.3's (2,346) because R4 measured an older head (8baec851); the share, 94-95%, is the same.

**E6. The inspector's Easy is not the engine's Easy** (`plan-exp3.ts.txt`, `plan-exp3.out`). Defect (a): `tools/inspect/stages.ts:64`
builds a hand stage with no `easy` flag, then `easyStage` (`:86`); the engine passes `easy` for 1-1..1-5 (`stageGenerator.ts:2857`).
Platforms identical by (x, y, width), layouts 1-3:
```
1-1 Easy  identical 0% / 0% / 0%      1-2 Easy  9% / 1% / 1%      1-3 Easy  18% / 20% / 19%
1-4 Easy  0% / 0% / 0%                1-5 Easy  1% / 1% / 1%
```
Every inspector Easy number for World 1's five rebuilt stages is measured on a different stage from the one Easy players get.

**E7. 1-2 as the engine builds it today** (`plan-exp4.out`, WR `rhythmLayout`, layouts 1-3). 17 nodes; expert 162-179 s Normal,
162-187 s Easy; 11 vines; 148-242 petals. Node list, layout 1, with each node's seconds and height: §1 below. Easy's canopy runs
92-128 px lower than Normal's (y 330 -> 422-458 against 410-420), because `easyNode` cuts rises but not drops (BT:664-668).

**E2. 1-2's rooms written as data and proven over World 1's tempo range** (`plan-exp.out`; 126-134 BPM whole numbers plus 128.2,
Normal and Easy, 20 traces a room, `traceNode` + `checkTrace`; tempo here is a play tempo, per Matt):
```
  w1-canopy-intro   intro  proven 20/20  density 0.53-0.56/s  seconds 15.73-16.64  exit y N 330 E 342 (drift 12 px)  spare pad p10 256 px
  w1-canopy-swung   ramp   proven 19/20  density 0.84-0.89/s  seconds 10.36-10.93  exit y N 320 E 350 (drift 30 px)  FAILS at 134N: still in the air
  w1-canopy-stair0  ramp   proven 0/20   FAILS everywhere: "still in the air from the last take-off" (my authoring error: a jump on a 2-eighth gap)
  w1-canopy-stair   ramp   proven 0/20   FAILS everywhere: "the branch at # hangs over the take-off ledge's end" (a hop that rises)
  w1-floor-pits     ramp   proven 10/20  density 1.05-1.12/s  FAILS on every Easy tempo: "the gap is # px: no jump at all"
  w1-floor-double   climax proven 19/20  density 1.23-1.30/s  exit drift 32 px  FAILS at 134N: still in the air
```
- The prover is cheap (all 120 traces in about 1 s) and every failure names its step and its rule.
- **A room proven on Normal is not proven on Easy** (floor-pits: 10/20, every Easy trace refused). Easy needs its own proof per room.
- **A room's exit height depends on the setting** (12-32 px a room). Door bands must be per setting, or the prover must refuse drift.
- The tempo-range proof narrows a room's range exactly where it breaks (134 BPM), as DESIGNER.md §2.4 said.

**E5. Why 1-2 zigzags: up-hops are refused by the tracer, not only missing from the palette** (`plan-exp2.out`). 600 seeded draws of
1-2's swung canopy room; 276 have zigzag at or under 45%; 26 of those prove at 128.2 N+E; **all 26 prove over the whole 126-134 range**.
The refusals: 250 x "the branch at # hangs over the take-off ledge's end" (`noOverhang`, BT:442-446, turned on by WR:218). Every
surviving room's hops go down. So 66% zigzag (R2 §4) is structural: on this rhythm, a branch you hop **up** onto sits over the ledge
you hop from. Breaking the zigzag needs a new kind (a hop up onto a stump face, a step, a different surface), which is the critic's #1
(vocabulary) seen from inside World 1.

**E3. Kinds and zigzag of the hand-written rooms** (`plan-exp.out`): 3-4 landing kinds a room, top-two kinds 63-75% of landings,
zigzag 50-100%. Rooms written by hand in World 1's alphabet speak World 1's few words.

**E8. The risk dial's headroom** (`plan-exp5.out`). Each take-off's real window (ms of take-off timing that still lands, full hold,
coyote 0.133 s, `physics.ts:41`), at 128.2:
```
w1-canopy-intro  window min 520 median 522 ms; expected falls sigma 61 ms: 0.000
w1-canopy-swung  window min 394 median 486 ms; expected falls sigma 61 ms: 0.004
w1-floor-pits    window min 412 median 512 ms; 0.001
w1-floor-double  window min 392 median 482 ms; 0.004
a centred 167 ms window: P(miss) sigma 36 2.0%, sigma 61 17.1%
a centred 250 ms window: P(miss) sigma 61 4.0%      a centred 300 ms window: 1.4%
```
(The early side is capped by my search range at -400 ms, so these windows are lower bounds.) Every traced jump today has 392-626 ms;
STAGE-RULES §1b calls under 167 ms Normal / 300 ms Easy unfair. **So there is 2.3-3x of room between "fair" and "free".** A spike room
of 8 jumps at a 250 ms window is about 8 x 4% = 0.32 expected falls at Isaksen's loose σ (estimate), inside DESIGNER.md §2.3's spike
budget of 0.2-0.4. This makes the critic's #2 fixable by a number the tracer already has.

**E4. Aprons and the grid** (`plan-exp.out`): the fixed 200 px apron is 0 ms off a 128.2 grid, 63-114 ms off at 94-102 and 181 ms at
68. An apron of a whole number of eighths (at least 200 px) is under 2 ms off at every tempo. With Matt's play-rhythm ruling, a seam
between two rhythm groups is a rest anyway; this matters only where two rooms join **inside** one phrase.

---

## 1. Concept graph: 1-2 "The Petal Trail" rebuilt from a written spec

The graph is today's 1-2 (WR `layout12`, WR:529-765; E7), written as data a builder reads instead of 240 lines of code.

```
entry: spawn canopy A (x 140, y 330), right                         exit: shrine on the floor C, after the chasm swing
critical path: 17 nodes, 162-187 s expert (E7, measured), target >= 150 s; first-timer 203 s (R4 §5.7)

 A (canopy, right)                                           B (bough, LEFT)              C (floor, right)
 n1 intro --> n2 ramp --> n3 swing --> n4 ramp --> n5 spike --> n6 spike --> n7 REST --> n8 SPLIT --> turn --> n9 counter --> drop --> n10 ramp --> n11 swing --> n12 ramp --> n13 climax --> n14 swing --> n15 climax --> n16 HERO chasm --> n17 cool --> shrine
                             (vine #1)                (vine taught                (Dot)    high: rotten        (rot + snakes,           (pits now:                                    (densest)                     (3-vine chain)
                                                       over a catch)                       branches            required)                falls cost)
                                                                                           low: base bough
unlocks:  vine taught (n5, over a catch branch) -> vines required (n11, n14, n16)
          rotten wood taught (n8, safe over the base bough) -> rot required (n9, falls through)
          pits (n10) only after the canopy and bough legs, where a miss costs a heart (heartFalls)
branch:   n8 high road (rotten branches) / low road (base bough); petals 70 / 15 / 15 checked before the build
```

The spec (about 25 lines; the format is §3's `engine/spec.ts`):
```
stage: 1-2 "The Petal Trail"        pair: jump + vine swing        rhythm: swung (long-short), lean 3:1 / 2:1 / 5:1 by node
shape: over-under loop-back: A right, B left, C right               tiers: A 330, B 630, C 930
nodes (job, tension, deck of rooms, teaches/uses, miss costs):
  n1  intro   0.15 [w1-canopy-intro x2]                       miss: heart
  n2  ramp    0.30 [w1-canopy-swung, w1-canopy-swung-b]       miss: heart
  n3  ramp    0.30 [w1-swing-mid]           uses vine         (taught in 1-1)
  n4  ramp    0.35 [w1-canopy-swung-c, w1-canopy-steps]
  n5  spike   0.55 [w1-vine-teach-catch]    teaches vine-over-drop
  n6  spike   0.60 [w1-vine-landing-hops]
  n7  rest    0.05 [w1-rest-look-down]      Dot: "There's something down by the roots..."
  n8  split   0.50 high [w1-rot-high-branches] | low [w1-base-bough-hops]   teaches rotten wood (safe)
  n9  counter 0.65 [w1-bough-rot-snakes]    dir left; uses rotten wood (required)
  n10 ramp    0.55 [w1-floor-pits, w1-floor-pits-b]   miss: heart (under the loop)
  n11 ramp    0.55 [w1-swing-under-bough]
  n12 ramp    0.60 [w1-floor-pits-c, w1-floor-steps]
  n13 climax  0.85 [w1-floor-double, w1-floor-drop-run]
  n14 climax  0.85 [w1-swing-mid]
  n15 climax  0.90 [w1-floor-double-b, w1-floor-drop-run-b]    never n13's room
  n16 hero    0.95 1-2-chasm-chain          signature: "three vines over the chasm, the shrine in sight"
  n17 cool    0.00 [w1-run-out]
petals: goal from the shared path; n8's roads 15% each
risk (Normal, estimates to tune): stage E[lives] <= 1.0; spikes 0.2-0.4 expected falls; windows never under 167 ms (Easy 300)
```
What a node's job is: intro (show the move, nothing bites), ramp (the move, safety removed), spike (the stage's pair at its hardest so
far), rest (a breath and Dot), split (two roads, one teaches safe), counter (the same moves the other way, the twist), climax (densest,
everything taught), hero (the one named moment), cool (the walk to the shrine). The deck lists are the rooms the coverage table must
hold: **at least 2 per slot** (DESIGNER.md §2.6), so 1-2 alone names about 30 rooms (estimate).

## 2. Beats: each node's duration, entry state and exit state

Entry and exit are the tracer's own values: a node enters on its entrance apron at a full run (`traceNode`, BT:364-372) and leaves at
`Trace.x1` and `Trace.yOut` (BT:117-121). Measured on 1-2 layout 1 (E7):

| node | job | dir | entry y N / E | seconds N / E | take-offs a second | exit state |
|---|---|---|---|---|---|---|
| n1 | intro | -> | 330 / 330 | 18.25 / 18.25 | 0.53 | on a flat apron, full run |
| n2 | ramp | -> | 410 / 422 | 10.06 / 10.06 | 0.85 | apron; Easy 12 px lower |
| n3 | swing | -> | 420 / 458 | 3.48 / 3.48 | (vine) | perch = next node's apron |
| n4 | ramp | -> | 420 / 458 | 15.68 / 15.68 | 0.60 | apron |
| n5 | spike | -> | 360 / 452 | 11.92 / 11.92 | (vines) | branch past the chain |
| n6 | spike | -> | 360 / 452 | 7.02 / 7.02 | 1.25 | apron |
| n7 | rest | -> | 360 / 440 | 3.11 / 3.11 | 0 | 30 px step up |
| n8 | split | -> | 330 / 410 | 27.61 / 27.61 | 0.88 | drop to B at the trunk |
| n9 | counter | <- | 630 / 630 | 25.0 / 25.0 | (hops) | drop to C at the trunk |
| n10 | ramp | -> | 930 / 930 | 12.64 / 12.64 | 0.71 | apron |
| n11 | swing | -> | 890 / 962 | 3.44 / 3.43 | (vine) | perch |
| n12 | ramp | -> | 890 / 962 | 8.19 / 13.81 | 1.20 / 0.69 | apron |
| n13 | climax | -> | 790 / 998 | 10.06 / 10.06 | 1.07 | apron |
| n14 | swing | -> | 850 / 985 | 3.43 / 3.35 | (vine) | perch |
| n15 | climax | -> | 850 / 985 | 10.06 / 11.94 | 1.07 / 0.89 | apron |
| n16 | hero | -> | 760 / 962 | 6.84 / 6.92 | (vines) | chasm's far side |
| n17 | cool | -> | 760 / 962 | 2.25 / 2.25 | 0 | shrine |

Two facts the spec must carry, from this table:
1. **Easy enters most nodes 12-208 px lower than Normal** (n13: 790 against 998). A room's door band is per setting.
2. **Easy's density equals Normal's on most nodes** (n1-n11, n13), which is R3 W2's "Easy plays at Normal's tempo". The rhythm data
   carries an Easy density of its own (Matt's ruling makes this a data field, not a music fact).

## 3. Modules and their machine tests (A reordered; E's own list goes beside it when E lands)

Each row: the file, its one job, and the test or gate that says it works. No prose acceptance.

| # | File (new unless noted) | Job | Acceptance test / gate (passes when) |
|---|---|---|---|
| T1 | `tools/inspect/stages.ts` (edit) | Easy built the way the engine builds it | `tools/inspect/stages.test.ts`: inspector Easy platforms == engine Easy platforms, 1-1..1-5, layouts 1-3 (today 0-20%, E6) |
| T2 | `src/game/beatTrace.ts` (edit) | export `reachable(move, dy, setting)` = exactly `TRIES` | `beatTrace.reach.test.ts`: for every move and dy in -200..200, `reachable` is true iff a one-step `traceNode` does not throw "can't reach" |
| T3 | `src/game/w1Rhythm.ts` (edit; or the proposer's successor) | `fits` calls `reachable` | `w1Rhythm.reject.test.ts`: 1-2 x 16 layouts, "can't reach" rejections == 0 (E9: 880 -> 0); no rule over 50% of a node's tries; no palette option laid 0 times |
| T4 | `src/game/engine/room.ts` | the Room type: rhythm bars + steps + surfaces + doors per setting + slots + petals | `tsc`; `room.test.ts` round-trips every room in `rooms/` through JSON unchanged |
| T5 | `src/game/engine/prove.ts` | prove a room over a tempo range, both settings; write a proof record (verdicts, reasons, density, seconds, exit band, windows) | `prove.test.ts`: E2's six rooms give E2's verdicts exactly (intro 20/20; stair0 0/20 "still in the air"; floor-pits Easy refused "no jump at all") |
| T6 | `src/game/engine/risk.ts` | per take-off window (E8 method) and expected falls at σ 36/61 ms; a node's window target from its job | `risk.test.ts`: E8's numbers reproduce; a spike room built to a 250 ms target scores 0.2-0.4 expected falls; any window under 167 ms Normal / 300 ms Easy fails |
| T7 | `src/game/engine/apron.ts` | apron = whole eighths of the play tempo, at least 200 px | `apron.test.ts`: joined rooms' first take-off within 2 ms of the grid at 68, 94, 98, 102, 128.2 (E4) |
| T8 | `src/game/engine/rooms/w1.ts` | 1-2's rooms as data, at least 2 per slot of §1 | `tools/engine/provecheck.ts` (gate): every room proven on its declared range, both settings; kind count and zigzag printed per room |
| T9 | `src/game/engine/spec.ts`, `specs/1-2.ts` | the StageSpec type, and §1's spec | `spec.test.ts`: every deck names a room that exists and is proven; every `uses` comes after its `teaches` |
| T10 | `src/game/engine/roll.ts` | spec + seed + setting -> rooms in order; one RNG stream per node and layer (gen2's `rngFor`, `pipeline.ts:73`) | `roll.test.ts`: the same seed gives the same rooms; changing node k's room leaves every other node's room and steps unchanged; no room twice in a stage |
| T11 | `src/game/engine/build.ts` | rolled rooms -> the `Layout` WR returns today (`w1Rhythm.ts:58-95`), so `protoStage.ts` makes the stage unchanged | `build.test.ts`: 1-2 from spec, 16 layouts x 2 settings, builds; `validateStage` passes; expert clock >= 120 s on every roll |
| T12 | `src/game/engine/explain.ts` | one JSON line per choice: node, layer, seed, options, picked, why | `explain.test.ts`: rebuilding from the explain log alone gives the identical layout |
| T13 | `src/game/engine/catalog.ts`, `tools/engine/catalogcheck.ts` | one text screen per layout (nodes, bars, steps, ledges, petals, goal); CI diff (R4 §6 idea 11) | gate: catalog in the repo equals a fresh build, else "if this was intentional, regenerate the catalog" |
| T14 | `tools/engine/kindcheck.ts` | the kind gate (R2 §5 idea 1) | gate on built 1-2: no two landing kinds over 50% together; zigzag at or under 45% (today 66%, R2 §4; E5) |
| G | existing gates | | tsc, full tests, vite build, artcheck, drawcheck, clipcheck, knowncheck, roadmapcheck, **funcheck** (no new 1-2 flag), first-timer bot 1-2 both settings |

## 4. Risk register (the critic's causes, answered once each; re-checked at the build's midpoint, after step 4 of §6)

| Cause (CRITIC.md) | Answer | What we do, and the test or trigger |
|---|---|---|
| #1 the proof only knows World 1's moves | **Prevent** | The engine's first piece is a move vocabulary as data (per the lead's 10:43 PM note; E's format when it lands). The 1-2 proof claims World 1 only. **Trigger:** before any World 2 room, 3 World 2 rooms with a moving or floating surface prove end to end; if the tracer cannot express one, World 2 room-writing stops and the vocabulary grows first |
| #2 the proof makes stages easy | **Prevent** | The risk dial: each node's take-off window target from its job, floored at 167 / 300 ms (T6). E8 shows 392-626 ms today, so the room exists. **Trigger:** first-timer adult on rebuilt 1-2 Normal loses 0 lives on all 16 layouts = the dial is not working |
| #3 tempo gives variety for free (false) | **Accept the finding, prevent the claim** | The plan never claims tempo variety (Matt's ruling agrees). Variety is counted as kinds per take-off (T14). E5 shows 1-2's zigzag is structural, so new kinds are a build item, not a hope |
| #4 judging is where the day goes | **Reduce** | Grey first, judged from the catalog diff (T13), the proof table (T8) and a first-timer strip image; stills only at §6 steps 5 and 7. **Trigger:** review-only commits over 40% of the build's commits (today 55%, CRITIC #4) |
| #5 seams on the beat only at World 1's tempo; Easy exits lower | **Prevent** | Aprons in whole eighths (T7, E4: under 2 ms off everywhere). Door bands per setting (E2: 12-32 px drift a room; E7: up to 208 px a node); the roll filters doors on the played setting |
| #6 the pool runs dry inside a world | **Trigger** | Not reached by the 1-2 proof. Coverage is counted per slot after the teaching cut, at least 2 per slot; the coverage report fails on a hole |
| #7 lianas are not room-alone | **Reduce** | Liana nodes are proven in stage context: the prover runs `swingSetup` over the whole rolled stage (`physics.ts:541`), 16 rolls. **Trigger:** any `pressWindow` off its room proof by more than a frame |
| #8 shared formulas check themselves | **Prevent** | The checkers never import the builder's numbers: funcheck, levelCheck and the first-timer play the built stage. A mutation test sets the risk target to 600 ms and asserts the first-timer gate fails |
| A-9 at-load roll on a phone | **Accept for now** | Ship curated rolls (gen2's `seeds.ts` way) until a Pixel run says one roll is under 1 s |
| A-10 the kind gate thresholds | **Reduce** | Thresholds start at R2's numbers and are set on the stages Matt ranks best |
| New: the tool-truth fixes change every 1-2 roll (E9) | **Reduce** | T3 lands with funcheck, the first-timer and stageHash in the same commit; a changed roll is a stage change, judged as one |
| New: Easy is not proven by a Normal proof (E2 floor-pits) | **Prevent** | Every proof record holds both settings; a room with no Easy proof cannot be dealt on Easy (T5, T9) |

## 5. Still disagreed (each side in one line, and who decides)

(E's positions are added when it lands.)

| Point | Designer (A) | Critic | Lead's sketch | This plan | Decides |
|---|---|---|---|---|---|
| Order of work | write the rooms, grow the tracer later (§11.3) | fix the proof first (alphabet, risk), then rooms | formulas file first | proof first; the runs say the proof is cheap to fix (E1, E8, E9) | lead (build ruling) |
| Where difficulty comes from | calibrated bots rate each room | a per-tension `TRIES` set | the formula file | a take-off window target per job, measured by the tracer (E8) | lead |
| Shared formulas | `engine/formulas.ts`: "the builder and the checker both import it" (D §11.2) | a wrong number then checks itself green (#8) | one formula file both read (SK 1) | the builder reads them; checkers never do, they measure the built stage | lead |
| Room count a world | 50-70 | prove 3 World 2 rooms first, then size | templates | count per slot, 2 minimum; size after the 1-2 proof | lead |
| Cost a stage | 1.25 h (D §5.8) | 3.1-5.1 h with judging | 0.2-0.4% of a week | unknown until §6 step 7 times a fresh spec; judging cut is the lever | measured, then lead |
| Roll at load or curated | at load | load time untested | - | curated until a Pixel run | lead |
| The beat frames every stage | Matt question | - | - | **settled by Matt, 10:40 PM**: play rhythm, not music | Matt (done) |

Needs Matt: nothing new from this draft (his 10:40 PM ruling closed the one open question).

## 6. First step, order of work, owners, hours, supervisor checks (A reordered; replaced or confirmed when E lands)

**First step (2 hours or less): the ruler fixes, T1 + T2 + T3, one helper, medium effort.**
- Numbers that say it worked:
  - inspector Easy == engine Easy on 1-1..1-5, layouts 1-3: 100% identical platforms (today 0-20%, E6);
  - 1-2 "can't reach" rejections: 0 (today 880 Normal, 1,447 Easy, E9); total rejected tries at or under 50 Normal and 110 Easy (E9's prototype: 41 / 101).
- Why first: every later step measures with these two tools. A wrong ruler makes every later number wrong.
- Hours from history (measured): beatTrace's first version and both rebuilt stages went from first commit to "1-2 and 1-5 built" in
  39 minutes of commit time (12:58 -> 13:37 ET, 11-04, `git log` of BT and WR); E9's prototype took me about 5 minutes. So 2 hours
  is a safe box (estimate), with the gates (funcheck 92-114 s, R4 §5.1) inside it.

**Order of work** (helpers run in parallel; no two helpers on one file):

| Step | Helper | Files owned | Planned | Number that says done |
|---|---|---|---|---|
| 1 | H1 medium | `tools/inspect/stages.ts`, `stages.test.ts`, `beatTrace.ts` (`reachable` only), `w1Rhythm.ts` (`fits` only), `beatTrace.reach.test.ts`, `w1Rhythm.reject.test.ts` | 2 h | as above |
| 2 | H2 high | `engine/room.ts`, `engine/prove.ts`, `prove.test.ts`, `tools/engine/provecheck.ts` | 2 h | T4, T5 |
| 2 | H3 high | `engine/risk.ts`, `engine/apron.ts`, their tests | 1.5 h | T6, T7 |
| 3 | H2 | `engine/rooms/w1.ts` | 3 h | T8: every 1-2 slot holds 2 proven rooms |
| 4 | H4 high | `engine/spec.ts`, `specs/1-2.ts`, `engine/roll.ts`, `engine/explain.ts`, tests | 2.5 h | T9, T10, T12. **Midpoint: risk register re-checked** |
| 5 | H4 | `engine/build.ts`, `engine/catalog.ts`, `tools/engine/catalogcheck.ts`, `tools/engine/kindcheck.ts` | 3 h | T11, T13, T14; all gates |
| 6 | lead + supervisor | none | 1.5 h | §5b polish stills, 3 layouts, both settings, both orientations |
| 7 | fresh helper H5 medium | `specs/1-5.ts` only | 1 h target | **the pass/fail**: a helper with only the spec format and the room library writes 1-5's spec and gets a gated stage; clock and tokens recorded against today's 1-2 + 1-5 (1,349 lines, 32 commits, 7.6 h; R1 §3.13) |

Totals (estimate): about 16.5 helper-hours, about 9 wall hours with 3-4 helpers in parallel.

**Supervisor checks** (what they read, in this order, at each step): step 1: the two numbers and the funcheck print; step 2: the
prove and risk test output (E2/E8 tables reproduced); step 3: `provecheck` table and kind counts; step 4: the roll test, the explain
log of 1 layout, and the risk register; step 5: the catalog diff of 3 layouts and the gate prints; step 6: the stills; step 7: the clock.

## 7. How the AI build stays cheap

- **Smallest pieces:** a room is data (about 20-40 lines); a helper loads `engine/room.ts` and the one file it edits.
- **Deterministic seeds:** one RNG stream per node and layer (`rngFor(seed, node, layer)`, gen2 `pipeline.ts:73`), so a change to
  one node moves nothing else (T10). WR today shares one stream (WR:99-117, one `R` for the whole stage).
- **An explain log for every choice** (T12): the supervisor reads why a room was picked, not the whole stage.
- **Tests that catch it instead of people:** the prover answers in about 1 s with the step and the rule (E2); E1-type disagreements
  are a property test (T2); dead options are a gate (T3).
- **What the supervisor reads:** text first (proof tables, catalog diff, explain log, gate prints), stills only at steps 6-7.

---

## Method used / Lessons applied / Method update

(Completed at the final commit.)
- **Method used (so far):** read the inputs; checked every claim I lean on in the code at 727db7ba; ran the key ideas (one 1-2 room
  per job across World 1's tempo range on both settings; the first step itself as a scratch prototype) before planning on them.
- **Lessons applied:** the critic's "trace one piece both ways and diff" (CRITIC §6): E2 and E5 traced rooms both settings and found
  Easy-only refusals and the up-hop refusal; numbers marked measured or estimate; the brief's "prototype the first step" made the
  first step's number a measured target, not a guess.
