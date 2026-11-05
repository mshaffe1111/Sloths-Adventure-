# PLAN: the level engine, buildable tomorrow morning (engine planner, 2026-11-04 night)

**Planned vs actual time:** planned 75 minutes (due time later moved to 12:45 AM ET by the lead); started 10:38 PM ET, final at
11:00 PM ET: **about 0 minutes, under half the plan. Red flag: check it with that in mind** (why, and what was done with it: §0).

Inputs: CRITIC.md (engine-critic), DESIGNER.md Options A-D and **Option E** (engine-design db3342a1, §13), LEAD-SKETCH.md, R1-R4 and
the engine ledgers (ccr-0d59a91c-oy3imz), the code at **727db7ba** (that branch's head), STAGE-RULES, LAWS, PERFORMANCE-RULES.
Short names: BT = `src/game/beatTrace.ts`, WR = `src/game/w1Rhythm.ts`, D = DESIGNER.md, E = D §13, SR = STAGE-RULES.md.
Every run is in `reference/engine/plan-runs/` (script `.ts.txt` + output `.out`); "measured" means one of those runs or a cited one.

---

## Matt's decision (2026-11-04, 10:40 PM ET, relayed by the lead): the beat is the player's rhythm, not the song's

> "the beats were more of how the player played, not so much with the music... you set the jumps up so that a player can get into a
> rhythm, not so much that the rhythm has to go with the song."

- The engine's "beat" is a **play rhythm**: the timing pattern of the player's moves, in Launchpad-style rhythm groups (regular,
  swing, broken, wait-and-go; a density; rests between groups), set per stage or node as data. E §13.3's `Phrase` is that data.
- It is **not** tied to the song's BPM or onsets. The music lock (`BEAT_STAGES`, `src/audio/scenes.ts:163`; `stageBpm`, BT:641-657)
  is not part of the engine's design. Onset-following (D §10.3 "reopened") is dropped.
- The tracer's maths does not care: `traceNode` takes any tempo (BT:58-63, :361-362). The tempo becomes a field of the rhythm data.
- D §10.0's question to Matt ("should the beat frame every stage?") is answered and **removed from "needs Matt"**.
- It agrees with the critic's measured #3 (tempo alone stretches the walk between the same jumps; run E2 below shows the same on
  1-2's rooms): variety comes from **the rhythm pattern, the move vocabulary and the surfaces**, not from BPM.

## The pick, in one paragraph

**Build E's foundation, measured on 1-2, with five changes from this plan's runs; keep "A reordered"'s hand rooms only for the set
piece and the twist until the World 2 fork measures them.** E's first parts (one move contract that the placer, prover and checker all
call; a risk number aimed on purpose) are what A reordered must build first anyway (D §13.8, and my runs E1/E9 show the "two models of
one jump" bug costs 94% of 1-2's dice). The four changes: (1) hang-under is **not** new engine work: the Shimmy Rope already ships
(run E11); (2) E's master-node miss targets break STAGE-RULES §1b's 167 ms fairness floor and are capped by it; (3) Easy needs its own
proof per node (run E2); (4) keep curated rolls and the flat checkpoint apron until runs say otherwise; (5) E's window formula is right, but only on windows
measured in the real engine: geometry sized by the flight model for a 167 ms window plays as 270-495 ms (run E12). First step: the move contract
with the air family and hang-under, proven against the real engine, in 2 hours (§6).

---

## 0. Planned vs actual time

| | |
|---|---|
| Planned | 75 minutes (brief, due about 11:53 PM ET); the lead extended the due time to 12:45 AM ET at 10:43 PM to fold in Option E |
| Started | 10:38 PM ET (`TZ=America/New_York date`), 2026-11-04 |
| Draft 1 | pushed 10:49 PM ET (181a15ec): the parts that did not need E |
| E landed | at 10:49 PM ET (db3342a1, ahead of its 11:45 due time); read in full (§13, 310 lines) |
| Final | 11:00 PM ET (this commit) |
| Red flag check | **The clock ran short against the plan.** Most of the work is runs that take 0.5-13 s each and file reading; I did not pad. What I did with the time: 12 runs (E1-E12: 8 on the tracer and builder, 1 inspector-vs-engine, 1 rope model, 2 in the real engine), a prototype of the first step's idea, and a real-engine check of E's newest claim. The lead should check this report with the short clock in mind |
| Read in full | CRITIC.md; D (1,425 lines on engine-design, in parts, including all of §13); LEAD-SKETCH; R4 §1-§2, §5-§6; R1 §2; R2 §2; R3 §2 (F1-F4) and §3 (W1-W14); LEDGER-ENGINE-GEMINI §6-§7; BT (all 668 lines); WR 1-330, 440-770, 1007-1030; `tools/inspect/stages.ts` (all); `tools/validate/funcheck.ts` (all); gen2 `DESIGN.md` Parts A-B12; `gen2/types.ts:300-372`; `stageGenerator.ts:2835-2875`; `rope.ts` (all); `realPlay.ts:1-320`; `engine.ts:4960-4990`; SR §0-§2, §5-§5b; LAWS (all) |
| Not read in full, plainly | R1 §3 and §6-§7, R2 §3-§4 and §6, R3 §4 and §6 (their numbers used only through D's and the critic's cites, which the lead checked; R1 §4-§5, R2 §5 and R3 §5 were read in full, §10), LEDGER-ENGINE-PAPERS, gen2 `pipeline.ts` beyond lines 73, 702, 798, PERFORMANCE-RULES past §0. No outside source fetched: every external claim here is R1-R4's or D's |

---

## §R. The runs this plan rests on (all measured, worktree of ccr-0d59a91c-oy3imz at 727db7ba)

**E1. The proposer and the tracer disagree about reach** (`plan-exp`). WR's `fits` (WR:169-172) asks one full-hold flight; the
tracer asks every `TRIES` row at 1/60 and 1/30 s (BT:330-343, thrown at BT:397), including the 0.8-hold short flick.
```
  PAL_B  -60:PNE  -50:PNE  50:PNE  60:PNE  80:P-E!  90:P--!        (P proposer yes, N tracer Normal yes, E tracer Easy yes)
  highest rise: jump proposer 102 / tracer Normal 77 / Easy 56 px;  hop 49 / 46 / 39;  double 175 / 165 / 134
```
Defect (b) holds for every move, not only the jump: the proposer offers up to 25 px more rise than the tracer accepts.

**E9. One reach predicate in the proposer, prototyped** (`plan-exp6`, diff in `plan-exp6-w1RhythmPlan.diff.txt`; a scratch copy of WR).
```
BASE  1-2 Normal:  932 rejected tries (880 = 94.4% "can't reach")      FIXED:  41 (0 "can't reach")
BASE  1-2 Easy  : 1532 rejected tries (1447 = 94.5%), 8 re-rolls       FIXED: 101 (0 "can't reach"), 14 re-rolls ("the split's roads can't hold their petals")
1-5: unchanged both settings (16 / 42, "the same gap 4 times"); its laid heights are identical, so its layouts do not move
```
Rejections fall 93-96% and the clock stays 156-189 s. It changes every 1-2 roll. (My Easy base differs from R4 §5.3's 2,346 because
R4 ran an older head; the 94-95% share is the same.) This is the measured case for E's "one model of each move, called by everyone".

**E6. The inspector's Easy is not the engine's Easy** (`plan-exp3`). Defect (a): `tools/inspect/stages.ts:64` builds a hand stage
without the `easy` flag and then `easyStage` (`:86`); the engine passes `easy` for 1-1..1-5 (`stageGenerator.ts:2857`).
```
platforms identical by (x, y, width), layouts 1 / 2 / 3:   1-1 0/0/0%   1-2 9/1/1%   1-3 18/20/19%   1-4 0/0/0%   1-5 1/1/1%
```
Every inspector Easy number on World 1's five rebuilt stages is measured on a stage Easy players never get.

**E7. 1-2 as the engine builds it today** (`plan-exp4`, `rhythmLayout`, layouts 1-3): 17 nodes; expert 162-179 s Normal, 162-187 s
Easy; 11 vines; 148-242 petals. Node list in §2.

**E2. 1-2's rooms written as data, proven over 126-134 plus 128.2, both settings** (`plan-exp`; 20 traces a room, ~1 s for all):
```
  w1-canopy-intro   proven 20/20  density 0.53-0.56/s  exit y N 330 E 342 (drift 12 px)
  w1-canopy-swung   proven 19/20  density 0.84-0.89/s  exit drift 30 px   fails 134 Normal: "still in the air"
  w1-canopy-stair0  proven 0/20   "still in the air from the last take-off" (my own authoring error, named in ms)
  w1-canopy-stair   proven 0/20   "the branch at # hangs over the take-off ledge's end" (a hop that rises)
  w1-floor-pits     proven 10/20  fails EVERY Easy trace: "the gap is # px: no jump at all"
  w1-floor-double   proven 19/20  exit drift 32 px   fails 134 Normal
```
A Normal proof is not an Easy proof; exits drift 12-32 px a room by setting; the prover is fast and names step and rule.

**E5. Why 1-2 zigzags** (`plan-exp2`): of 600 seeded draws of 1-2's swung canopy room, 276 have zigzag at or under 45%, 26 prove at
128.2 on both settings, and all 26 prove across 126-134. The 250 refusals are all `noOverhang` (BT:442-446, on via WR:218): on this
rhythm a branch you hop **up** onto hangs over the ledge you hop from. Every surviving hop goes down. 1-2's 66% zigzag (R2 §4) is
structural in World 1's alphabet; it takes a new kind to break it.

**E3. Kinds of the hand-written rooms** (`plan-exp`): 3-4 landing kinds a room, the top two 63-75% of landings, zigzag 50-100%.

**E8. Today's take-off windows** (`plan-exp5`): every traced jump of the four proven rooms has 392-626 ms of take-off timing that
still lands (lower bounds; full hold; coyote 0.133 s, `physics.ts:41`); expected falls 0.000-0.004 a room at σ 61 ms. A centred
167 ms window misses 2.0% at σ 36 and 17.1% at σ 61; 250 ms misses 4.0% at σ 61. So there is 2.3-3x of room between "fair" and "free"
on the model, and more in the engine (E12).

**E4. Aprons** (`plan-exp`): a fixed 200 px apron is 0 ms off a 128.2 grid, 63-114 ms off at 94-102, 181 ms at 68; a whole number of
eighths (at least 200 px) is under 2 ms off everywhere. Under Matt's ruling this matters only where two units join inside one phrase.

**E10/E11. E's hang-under already ships, as the Shimmy Rope** (`plan-exp7`, `plan-exp8`).
- `src/game/rope.ts`: `ROPE_SPEED` 120 px/s (`:8`), `HAND_REACH` 70 (`:14`), `ROPE_RISE` 146 (`:16`), `ROPE_GRAB` 40 (`:20`). E's
  "estimates" (shimmyV ~120, grabReach ~40) are exactly these shipped numbers.
- The engine's grab (`engine.ts:4960-4990`), the level check's rope links (`levelCheck.ts:611-612`), the art (`heroRope.ts`,
  `ropeArt.ts`) and the skill (`skills.ts:29-38`: taught by 1-3, required from 1-4) all exist. So E's "hang-under is the one piece of
  real engine work E adds" (E §13.7) is wrong: a bough's underside is a rope with bough art and a holder rule.
- **Real engine, 30 fps** (`realPlay.ts`, a bare ledge, a rope `rise` px over it, jump held for N frames; the frame he catches it):
```
rope 120 px up: caught on frame 1 for any hold         rope 146 px (shipped): needs a hold of 2+ frames (67 ms); a 1-frame tap never
rope 160 px up: 3+ frames                               rope 180 px: 4+ frames         rope 190 px: 6+ frames (200 ms)
```
This is the table a `MoveDef` envelope test checks against (E §13.2.4: "within one 30 fps frame"). The tracer's flight model agrees on
the shape: at 146 px every modelled thumb (full, short flick, Easy 70%, Easy short) spends 217-400 ms in the engine's catch band;
at 180 px the Easy thumbs never reach it (`plan-exp7`).

**E12. E's risk inversion, tested in the real engine on 1-2's jumps** (`plan-exp9`; the lead asked for this). 13 jumps of two 1-2
rooms; each take-off ledge and landing pad cut so the flight model gives a 239 ms or a 167 ms window (E §13.4: p = 5% and 17.1% at
σ 61 ms); then 200 real-engine take-offs per jump with timing error N(0, 61 ms), and a deterministic 5 ms sweep for the real window.
```
real windows, geometry built for 239 ms: 350-575 ms      built for 167 ms: 270-495 ms
mean miss rate over 26 (jump, window) cells: E predicted 11.1%, measured 0.5%
the same formula on the REAL windows predicts 0.0-2.7% a jump (mean about 0.5%): it matches
```
- **E's formula holds; its input is wrong by about 2x.** The engine's coyote time, landing forgiveness and lip hoist (`physics.ts:41`,
  `FORGIVE`) widen every window the flight model sizes. So the placer must size from windows **measured in `realPlay`**, which E §13.2
  already says for envelopes ("measured from the engine's own controller once") but §13.4's table does not do.
- **It also moves the fairness floor.** SR §1b's 167 ms is a felt window; judged on real windows, today's jumps (E8, model) are wider
  still. The floor test must measure in the engine too.
- Two calibration jumps per room (the drops, "on-time lands NO" in the output) landed back on the run ledge in my harness; their dx is
  approximate and their rows are the least trustworthy.

---

## 1. E and "A reordered", side by side, and which to build

| | A reordered (critic §5; my draft 1) | E, clean sheet (D §13) | What the runs say |
|---|---|---|---|
| The unit | a hand-written room, proven over a range | a computed node: phrase x kind quota x move envelopes; one hand set piece a stage | E2/E3: hand rooms in World 1's alphabet carry 3-4 kinds and zigzag 50-100% |
| One model per move | a shared `reachable()` in the tracer | `MoveDef.envelope`, measured once from the engine | E1/E9: the drift costs 94% of 1-2's dice; one shared model removes it (932 -> 41) |
| World 2's vocabulary (#1) | new surface cases in the tracer | moves and surfaces as entries with a contract | E11: the contract works on a move we already ship (rope) |
| Risk (#2) | per-tension `TRIES` set | a target miss chance inverted into a window | E8: 392-626 ms today vs a 167 ms floor; E12: E's formula predicts the real engine's misses once the window is measured in the engine (about 2x the model's) |
| Easy | a second proof per room | the same generator with the kid's σ and Easy's budget | E2: Easy refuses rooms Normal accepts; E's input-not-pass design fits that |
| Variety | more rooms, a kind gate after | kinds drawn first from quotas | E5: a quota of "hop up" is unrealisable on branches at this rhythm; E names the hole, A rerolls the author |
| Seams (#5) | aprons in whole eighths | phrases end in cadences; no apron | research line 600 and BT:19 want a flat apron with a checkpoint at each node: keep it as E's `land` cadence |
| Pool (#6) | 50-70 rooms, dry after 5.6-7.8 stages | combinatorial; the save ledger counts kind strings | arithmetic only (critic #6, E §13.5) |
| Judging cost (#4) | catalog diff + grey | the same | neither escapes it (55% review-only commits, critic #4) |
| Build size | smaller | larger; E says 6-9 days before World 2's first stage (estimate) | E11 cuts it: no new controller for hang-under |
| How it fails | World 2 = World 1's words plus surfaces | "procedural oatmeal"; untuned new moves | both have a measured trigger (§4) |

**Build E's foundation.** Reasons, each from a run, not a preference:
1. The first thing either option must build is one model per move (E1, E9). Built as E's `MoveDef`, it is the same work and it also
   carries risk, kind and teaching, which A would add later as three more passes.
2. Hand rooms in World 1's alphabet already fail the kind bar by construction (E3, E5). Writing 30 of them for 1-2 alone (§1's decks,
   2 a slot) pays for the sameness Matt rejected.
3. E's newest piece, hang-under, is cheaper than E thinks (E11), which removes E's biggest cost risk for the sloth signature move.

**And where E must change** (this plan's rulings for the build, each a lead decision in §5):
- **The fairness floor caps E's targets.** E §13.4 aims master nodes at p 0.10-0.15 with σ 45 ms, which is a 130-148 ms window; SR §1b
  calls under 167 ms Normal (300 ms Easy) unfair. So a Normal event's window is at least 167 ms: at σ 45 that caps p at about 0.06,
  at σ 61 about 0.17 (arithmetic, E8's formula). A master node gets its bite from more events at the cap and from the miss cost, not
  from narrower windows.
- **Keep curated rolls** until the first-timer bot and a Pixel run agree (E §13.7 drops curation). The first-timer finds stuck edges no
  envelope sees (R4 §5.7: one edge per layout under the 70% gate on 1-2), and a roll at load is untested on a phone (critic A-9).
- **Keep the flat apron with its checkpoint** as the `land` cadence (BT:19; research line 600).
- **Hang-under = the shipped rope** with an underside surface (bough art, trunk holder), not a new controller.
- **Windows are measured in the engine.** The placer sizes geometry from `realPlay` window tables (per move, height and setting), not
  from the flight model, which is about 2x too strict (E12).

---

## 2. Concept graph: 1-2 "The Petal Trail", rebuilt from a written spec

The graph is today's 1-2 (WR `layout12`, WR:529-765; E7), written as E's data instead of 240 lines of code.

```
entry: spawn on canopy A (x 140, y 330), running right            exit: the shrine on the floor C, past the chasm
critical path: 17 nodes today, 162-187 s expert (E7), first-timer 203 s (R4 §5.7); the rebuild targets 150-180 s, >= 120 s every roll

 A canopy, right                                                          B bough, LEFT           C floor, right
 n1 teach jump -> n2 test -> n3 swing -> n4 test -> n5 teach vine-over-drop -> n6 test -> n7 REST (Dot) -> n8 SPLIT (teach rotten wood)
     -> turn at the trunk -> n9 twist (rot + snakes, leftward) -> drop -> n10 test (pits) -> n11 swing -> n12 test -> n13 master
     -> n14 swing -> n15 master -> n16 SET PIECE: the 3-vine chasm chain -> n17 cool -> shrine
unlocks:  vine-over-drop taught at n5 (a catch branch under it) -> required at n11, n14, n16
          rotten wood taught at n8 (safe: the base bough is under it) -> required at n9 (a fall goes through)
          pits only from n10, under the loop, where a miss costs a heart (WR heartFalls)
branch:   n8 high road (rotten branches) | low road (base bough hops); petals 70 / 15 / 15, checked by arithmetic before the build
```

The spec, in E's terms (about 25 lines; formats in §3):
```
stage: 1-2 "The Petal Trail"        pair: jump + vine swing        pulse: 0.47 s a count (today's quarter at 128.2; estimate. 1-1 and 1-3 must differ by 15%+, E §13.3.1)
shape: over-under loop-back: A right, B left, C right               tiers: A 330, B 630, C 930
pool: moves {hop, jump, double, swing, crumble-run}   surfaces {branch, bough, bank, stump, rotten}   hazards {snake, pit}
risk: Normal stage E[lives] <= 1.0, Easy <= 0.3; every window >= 167 ms Normal / 300 ms Easy (SR §1b)
signature: "three vines over the chasm, the shrine in sight"
nodes (job, phrase type, kind quota, miss target per event):
  n1  teach  jump        regular      jump x4 flat/up             p <= 0.01
  n2  test   jump+hop    swing        jump x3, hop-down x2        p 0.03
  n3  swing  (set unit)  -            the mid-stretch liana       (WR midSwing, proven in stage context)
  n4  test   jump+hop    swing        jump-up, jump-down, hop, double     p 0.03
  n5  teach  vine-drop   (set unit)   the vine over a catch branch
  n6  test   landing     swing        hop x2, jump x2             p 0.05
  n7  rest   -           land         Dot: "There's something down by the roots..."
  n8  split  rotten      regular      high: rotten-run x3 | low: bough-hop x4   teach (safe)  p <= 0.01
  n9  twist  rot+snake   broken       hop-over-snake x2, rotten-run x2, dir LEFT   p 0.05
  n10 test   pits        swing        jump-over-pit x3, stump-up, bank-down        p 0.05
  n11 swing  (set unit)  -            liana under the bough
  n12 test   pits        broken       >= 3 kinds, no kind > 40%                     p 0.05
  n13 master all         swing        >= 4 kinds incl. double, no kind > 35%        p at the window cap
  n14 swing  (set unit)
  n15 master all         broken       never n13's kind string                        p at the window cap
  n16 SET PIECE (hand)   the chasm chain (WR swings, 3 vines)
  n17 cool   -           regular      jump x2 flat               p <= 0.01
easy: same nodes, kid σ, Easy budget, one event fewer per phrase
```
Node jobs: teach (show it, a miss costs nothing), test (safety removed), twist (the same moves changed: here, the other way and with
snakes), master (densest, everything taught, the window cap), rest (a breath, Dot), split (two roads, one safe), set piece (the one
hand-made moment), cool (the walk out). Liana nodes stay set units for the 1-2 proof: their phase depends on the stage before them
(`physics.ts:541`; critic #7), so they are proven in the rolled stage, not alone.

## 3. Beats: each node's duration, entry state and exit state

Entry and exit are the tracer's values: a node enters on its apron at a full run (BT:364-372) and leaves at `Trace.x1` / `Trace.yOut`
(BT:117-121). Measured, 1-2 layout 1 (E7):

| node | job (today's tag) | dir | entry y N / E | seconds N / E | take-offs/s N / E | exit |
|---|---|---|---|---|---|---|
| n1 | intro | -> | 330 / 330 | 18.25 / 18.25 | 0.53 | apron, full run |
| n2 | ramp | -> | 410 / 422 | 10.06 / 10.06 | 0.85 | apron |
| n3 | ramp (swing) | -> | 420 / 458 | 3.48 / 3.48 | vine | perch = next apron |
| n4 | ramp | -> | 420 / 458 | 15.68 / 15.68 | 0.60 | apron |
| n5 | spike (vines) | -> | 360 / 452 | 11.92 / 11.92 | vine | branch past the chain |
| n6 | spike | -> | 360 / 452 | 7.02 / 7.02 | 1.25 | apron |
| n7 | rest | -> | 360 / 440 | 3.11 / 3.11 | 0 | 30 px step up |
| n8 | ramp (split) | -> | 330 / 410 | 27.61 / 27.61 | 0.88 | drop to B |
| n9 | counter | <- | 630 / 630 | 25.0 / 25.0 | hops | drop to C |
| n10 | ramp | -> | 930 / 930 | 12.64 / 12.64 | 0.71 | apron |
| n11 | ramp (swing) | -> | 890 / 962 | 3.44 / 3.43 | vine | perch |
| n12 | ramp | -> | 890 / 962 | 8.19 / 13.81 | 1.20 / 0.69 | apron |
| n13 | climax | -> | 790 / 998 | 10.06 / 10.06 | 1.07 | apron |
| n14 | climax (swing) | -> | 850 / 985 | 3.43 / 3.35 | vine | perch |
| n15 | climax | -> | 850 / 985 | 10.06 / 11.94 | 1.07 / 0.89 | apron |
| n16 | climax (chasm) | -> | 760 / 962 | 6.84 / 6.92 | vines | far side |
| n17 | cool | -> | 760 / 962 | 2.25 / 2.25 | 0 | shrine |

What the spec must carry from this: (1) Easy enters most nodes 12-208 px lower (n13: 790 vs 998), so a node's door is per setting;
(2) Easy's density equals Normal's on 15 of 17 nodes (R3 W2's "Easy plays at Normal's tempo"), so Easy's events per phrase are their
own field (E §13.3.2: one event fewer).

## 4. Modules, each with a machine test (the E build)

A helper loads `engine/types.ts` and the one file it owns. No prose acceptance: each row names the test or gate and the number.

| # | File | Job | Test / gate: passes when |
|---|---|---|---|
| M0 | `tools/inspect/stages.ts` (edit) | build Easy the engine's way (defect a) | `tools/inspect/stages.test.ts`: inspector Easy platforms == engine Easy, 1-1..1-5, layouts 1-3 (today 0-20%, E6) |
| M1 | `src/game/engine/types.ts` | `MoveDef`, `SurfaceDef`, `Phrase`, `KindToken`, `StageSpec` (E §13.2-13.3) | `tsc`; `types.test.ts`: every registered move and surface round-trips through JSON |
| M2 | `src/game/engine/moves/air.ts` | hop, jump, double: `envelope` from BT `flight` over the thumb set | `moves.air.test.ts`: for every dy in -200..200, both settings, `envelope` says reachable iff a one-step `traceNode` accepts it (E1: today up to 25 px apart); real-engine landing within 1 frame at 5 heights (the `realJump` harness, `beatTrace.test.ts:43`) |
| M3 | `src/game/engine/moves/hang.ts` | hang-under = the shipped rope: grab table, creep 120 px/s, release arc | `moves.hang.test.ts`: the envelope's minimum hold per rise equals E11's real-engine table (146 px: 2 frames; 160: 3; 180: 4; 190: 6) within 1 frame |
| M4 | `src/game/engine/risk.ts` | window per event **measured in `realPlay`**, p(miss) at σ, the inverse W(p, σ); the floor 167 / 300 ms | `risk.test.ts`: W(0.05, 61 ms) = 239 ms ± 1; no target returns a window under the floor; on E12's 13 jumps, the predicted miss rate from the measured window is within 2 points of 200 noisy real-engine take-offs (E12: 0.5% vs 0.5%) |
| M5 | `src/game/engine/phrase.ts` | phrases and the interval -> move picker; kind quotas from a gen2 `ShuffleBag` | `phrase.test.ts`: 1-2's phrases give their quotas exactly; a quota no move fits fails with the named hole ("n4: no ... fits a 2.4 s interval") |
| M6 | `src/game/engine/place.ts` | solve each event's geometry from its envelope at the target window | `place.test.ts`: every placed event's **real-engine** window (E12's sweep) is within one frame (33 ms) of its target and never under the floor; the on-time input lands |
| M7 | `src/game/engine/node.ts`, `roll.ts` | a node from phrase x quota x pool x risk; one RNG stream per node and layer (gen2 `rngFor`, `pipeline.ts:73`) | `roll.test.ts`: same seed, same stage; changing node k leaves every other node identical; no phrase twice in a stage |
| M8 | `src/game/engine/build.ts` | nodes + set units -> the `Layout` WR returns (WR:58-95), so `protoStage.ts` makes the stage unchanged | `build.test.ts`: 1-2 from spec, 16 layouts x 2 settings, builds; `validateStage` passes; expert >= 120 s every roll |
| M9 | `src/game/engine/explain.ts` | one JSON line per choice: node, layer, seed, options, picked, why | `explain.test.ts`: rebuilding from the log alone gives the identical layout |
| M10 | `src/game/engine/catalog.ts`, `tools/engine/catalogcheck.ts` | one text screen per layout; CI diff (R4 §6 idea 11) | gate: the checked-in catalog equals a fresh build |
| M11 | `tools/engine/kindcheck.ts` | the kind counts of E §13.5, read from the generator's tokens | gate on built 1-2: two commonest kinds <= 35% (estimate, E's), zigzag <= 45% (today 66%) |
| M12 | `src/game/engine/specs/1-2.ts` | §2's spec | `spec.test.ts`: every `uses` after its `teach`; every set unit exists; quotas sum to the phrase's events |
| G | existing gates | | tsc, full tests, vite build, artcheck, drawcheck, clipcheck, knowncheck, roadmapcheck, funcheck (no new 1-2 flag), first-timer bot 1-2 both settings, stageHash names the change |

What E replaces gets deleted when the new path passes QA (CLAUDE.md "new replaces old"): WR's `layout12`/`fitSteps`/palettes for
1-2 first. `w1Rhythm.ts`'s `fits` is **not** fixed in place (E9 was a prototype to measure the idea, not a patch to ship).

## 5. Risk register (each critic cause answered once; re-checked at the midpoint, after step 4 of §7)

| Cause | Answer | What we do; the test or the trigger |
|---|---|---|
| #1 the proof knows World 1's moves only | **Prevent** | moves and surfaces are entries (M1-M3); the 1-2 proof claims World 1 only. **Trigger:** before World 2, 3 World 2 nodes with a moving or floating surface prove end to end; if a `SurfaceDef.motion` cannot express one, World 2 stops and the contract grows first |
| #2 the proof makes stages easy | **Prevent** | aimed windows (M4, M6), floored at 167 / 300 ms; E8 shows the room exists. **Trigger:** the first-timer adult on rebuilt 1-2 Normal loses 0 lives on all 16 layouts, or the noisy bots' miss rate on master events is under half the target |
| #3 tempo gives variety for free (false) | **Accept the finding** | nobody claims it (Matt's ruling agrees); variety is counted kinds (M11). E5: World 1's alphabet cannot break the zigzag, so 1-2 needs a new kind (a stump hop-up, a bough step) as a named build item |
| #4 judging is where the day goes | **Reduce** | grey first; the supervisor reads text (catalog diff, explain log, proof tables) and a first-timer strip; stills only at §7 steps 6-7. **Trigger:** review-only commits over 40% of the build's commits (today 55%) |
| #5 seams; Easy exits lower | **Prevent** | the `land` cadence is the flat apron with its checkpoint; doors per setting (E2: 12-32 px a node; E7: up to 208 px); the roll filters doors on the played setting |
| #6 the pool runs dry | **Trigger** | not reached by 1-2. The save ledger counts kind strings; **trigger:** two rolls of one stage with kind-string NCD under 0.30 (R3 F7's calibration) on more than 1 pair in 16 |
| #7 lianas are not node-alone | **Reduce** | lianas stay set units proven in the rolled stage (16 rolls) for the 1-2 proof; E's "phase owned by the node" is built only when a world needs free lianas. **Trigger:** any `pressWindow` off by more than a frame between rolls |
| #8 shared formulas check themselves | **Prevent** | the generator and the checker share kind tokens (by design) but **no risk number**: the first-timer, levelCheck and funcheck measure the built stage. Mutation test: set every target to p 0.00 and assert the "nothing bites" gate fails |
| E-1 procedural oatmeal | **Trigger** | Matt's 4-choice pairwise pick (R3 F15) on 3 computed vs 3 hand nodes in World 2 (D §13.8's fork). E is dropped if hand rooms win more than 2 of 3 |
| E-2 σ from a browser tap test may not fit a phone flick | **Reduce** | every risk number carries the 36-61 ms band until the first-timer is fitted to `tools/qa/touchReplay.ts` recordings (R4 §6 idea 4) |
| E-3 targets under the fairness floor | **Prevent** | M4 cannot return a window under 167 / 300 ms (test) |
| E-4 the model's windows are not the engine's (E12: about 2x) | **Prevent** | every window the placer uses or checks comes from a `realPlay` table (M4, M6); the flight model only proposes |
| A-9 roll at load on a phone | **Accept for now** | curated rolls ship until a Pixel run says one build is under 1 s with no frame over 120 ms |
| New: M0 moves every inspector Easy number | **Reduce** | M0 lands with re-baselined known lists, shrink-only, in the same commit (w1-rhythm notes, NEXT item 3) |

## 6. Still disagreed: each side in one line, and who decides

| Point | Designer | Critic | Lead's sketch | This plan | Decides |
|---|---|---|---|---|---|
| Which engine | E's foundation, then a measured fork on World 2 (D §13.8) | "A reordered" (CRITIC §5) | formula file + templates | E's foundation; hand units only for set pieces and twists until the fork | lead (build ruling) |
| Hang-under's cost | "the one piece of real engine work E adds" | - | - | it ships already (E11); cost is an underside surface and art | settled by the run |
| Master-node difficulty | p 0.10-0.15 at σ 45 (130-148 ms) | the proof must bite | - | capped by SR §1b's 167 ms; bite from count and cost | lead applies Matt's rule; if anyone wants windows under 167 ms, that is Matt's call |
| Curation | none: right by construction | load time untested | - | keep curated rolls until first-timer + Pixel agree | lead |
| Aprons | no apron; cadences | aprons in whole eighths | - | the flat checkpoint apron is the `land` cadence | lead |
| Shared formulas | builder and checker share tokens | self-checking (#8) | one file both read | share kind tokens, never risk numbers | lead |
| Cost a stage | E: 6-9 days build; A: 1.25 h a stage | 3.1-5.1 h with judging | 0.2-0.4% of a week | §8's model; measured at §7 step 8 | measured, then lead |
| The beat frames every stage | Matt question | - | - | settled: play rhythm, not music | Matt (done, 10:40 PM) |

**Needs Matt: nothing tonight.** His 10:40 PM ruling closed the one open question. One thing he will see later, not a question now: if
the fairness floor makes Normal too gentle once the dial is built, whether to allow windows under 167 ms in late worlds is his rule
to change.

## 7. First step, order of work, owners, hours, supervisor checks

**First step (2 hours, one helper, high effort): the move contract, proven on two families.** Files: `engine/types.ts` (M1),
`engine/moves/air.ts` (M2), `engine/moves/hang.ts` (M3) and their tests. **Numbers that say it worked:**
- M2: the air envelope and the tracer agree on 100% of (move, dy, setting) cells for dy -200..200 (today the proposer is up to 25 px
  off, E1), and the real engine lands within one frame at 5 heights x 2 settings; and each jump's take-off window is a `realPlay`
  table (E12's sweep), so the risk step starts from the engine's numbers;
- M3: hang-under's minimum hold matches E11's real-engine table at all 7 rope heights within one frame;
- adding hang-under touches no file outside `moves/hang.ts` and its test (`git diff --stat` shows only those).

**In parallel, the ruler (1 hour, a second helper, medium effort): M0.** Number: inspector Easy == engine Easy, 100% of platforms,
1-1..1-5, layouts 1-3 (today 0-20%). Every later measurement of Easy depends on it.

Hours from history (measured from `git log` of ccr-0d59a91c-oy3imz, ET): the tracer's first commit was 12:58 and "1-2 and 1-5 built on
the music's beat" was 13:37, so a working tracer plus two stages took **39 minutes** of commit time; WR then took **35 commits over
9.0 hours** (13:22 -> 22:24) of tuning and fixes. The machine is fast; the hours go after the first build. The step boxes below are
estimates on that base.

| Step | Helper (effort) | Files owned (no two helpers on one file) | Planned | Done when |
|---|---|---|---|---|
| 1 | H1 high | `engine/types.ts`, `engine/moves/air.ts`, `engine/moves/hang.ts`, tests | 2 h | the first-step numbers |
| 1 | H2 medium | `tools/inspect/stages.ts`, `stages.test.ts`, the known lists it re-baselines | 1 h | M0 |
| 2 | H3 high | `engine/risk.ts`, `engine/phrase.ts`, tests | 2 h | M4, M5 |
| 3 | H1 high | `engine/place.ts`, test | 2.5 h | M6 |
| 4 | H4 high | `engine/node.ts`, `engine/roll.ts`, `engine/explain.ts`, tests | 2.5 h | M7, M9. **Midpoint: risk register re-checked (§5), every trigger read** |
| 5 | H3 high | `engine/specs/1-2.ts`, `engine/build.ts`, `engine/catalog.ts`, `tools/engine/catalogcheck.ts`, `tools/engine/kindcheck.ts` | 3 h | M8, M10, M11, M12, all gates G |
| 6 | lead + supervisor | none | 1.5 h | SR §5b polish stills of 3 layouts, both settings, upright and sideways; the first-timer strip |
| 7 | H5 medium, fresh | `engine/specs/1-5.ts` only | 1 h target | **the pass/fail:** a helper with only the formats and the move library writes 1-5's spec and gets a gated stage; clock and tokens recorded against today's 1-2 + 1-5 (1,349 lines, 32 commits, 7.6 h; R1 §3.13) |
| 8 | lead | - | - | the cost model's numbers filled in (§8) |

Totals (estimate): about 17.5 helper-hours; about 9 wall hours with 3-4 helpers in parallel. That is under E's own 6-9 days because
this build covers World 1's air family, the existing rope and set units only; ride, swim and free lianas come with World 2.

**Where the technical supervisor checks, and what they read:**
1. after step 1: the two test prints (envelope vs tracer cell table; hang table) and `git diff --stat`;
2. after step 2: `risk.test.ts` and `phrase.test.ts` output (E8's numbers reproduced; a named hole);
3. after step 4 (midpoint): one layout's explain log, the roll test, and the risk register's triggers;
4. after step 5: the catalog diff of 3 layouts, the kind counts, every gate's print;
5. after step 6: the stills (the only images in the whole build);
6. after step 7: the clock and the token count.

## 8. The cost model

| | Today (measured) | E, per stage, once the library exists (estimate) |
|---|---|---|
| Machine: one stage build | 0.1-0.4 s (R4 §5.2) | the same order (placement is arithmetic on envelopes) |
| Machine: World 1 fun gate | 92-114 s (R4 §5.1) | unchanged |
| A node's proof | a trace 3.7 ms (R4 §5.2); E2's 120 traces about 1 s | the same |
| Writing a stage | 1-2 + 1-5: 1,349 lines, 32 commits, 7.6 h (R1 §3.13); WR 9.0 h of fixes after a 39-minute first build | spec 20 min + set piece 45 min + gates 15 min + text judging 20 min = **about 1.7 h** |
| Judging | 55% of commits review-only (critic #4) | text first; stills once a stage |
| What would prove it wrong | - | §7 step 7 over 1.5 h, or more than 1 send-back a stage |

Matt's bar is "one stage from a written spec in about an hour". This model says 1.7 h, so the set piece (45 min) is the place to cut,
for example by reusing a world's set-piece kit. That is an estimate until step 7 measures it.

## 9. How the AI build stays cheap

- **Smallest pieces:** a move is one entry and its test; a spec is about 25 lines; a helper loads `engine/types.ts` plus one file.
- **Deterministic seeds:** one RNG stream per node and layer (`rngFor`, gen2 `pipeline.ts:73`). WR today shares one stream (WR:99-117),
  so changing one palette reshuffles every later node.
- **An explain log for every choice** (M9): the supervisor reads why, in text, and the log rebuilds the stage.
- **Tests that catch it instead of people:** the envelope test (M2) is exactly the check that would have caught E1; the named-hole
  failure (M5) replaces a human noticing a repeat; the floor test (M4) replaces a human noticing an unfair jump.
- **What the supervisor reads at each step:** §7's list: test prints and text first, stills once.

## 10. The research's "ideas none of our research mentions", checked against this plan

Read in full tonight: R1 §4-§5, R2 §5, R3 §5, R4 §6. None changes the pick; these have a home in the build:
- **Knob elasticities** (R3 §5 #12): E12's `realPlay` window tables are exactly that (Δ window per px of ledge); M4 stores them.
- **A wait verb** (R2 §5 #2): E's `wait-and-go` phrase and its `wait` move; it is time on one ledge, so the prover can check it.
- **Measure the space, sample it uniformly** (R2 §5 #4): E5 is that count for one 1-2 room (600 draws, 26 prove); M5's named hole is
  its runtime form.
- **Stability under edits** (R2 §5 #5, R4 §6 idea 7): M7's per-node streams.
- **A limited-agent gate** (R2 §5 #3): every `MoveDef.teach.validate` step (E §13.2.4); added to M12's test for 1-2's two teaches
  (vine-over-drop at n5, rotten wood at n8).
- **Frustration from standing still** (R3 §5 #5): read from the first-timer strip at §7 step 6 (1-2 Easy stuck 0.10-0.14 today).
- **A save-wide ledger, rare and position tags** (R1 §4 #2-3): E's kind-string ledger; tags on phrases. Not needed for the 1-2 proof.
- **A grade board re-graded after later stages** (R1 §4 #6): the lead's, after step 7.
- **Grey approval before art** (R1 §4 #10, §5 #10): the build has no art step before §7 step 6; no Hugging Face spend in this plan.
- **Onsets of the tune** (R2 §5 #12): dropped by Matt's 10:40 PM ruling.
- **Procedural locomotion fails** (R1 §5 #7, Ori): E's moves are hand-made controllers (the rope, the jump); only their placement is
  computed. Hang-under reusing the shipped rope fits this.

---

## Method used / Lessons applied / Method update

**Method used.** Read the inputs in full where listed (§0). Checked every claim about our code that the plan leans on, at 727db7ba,
including E's (E11 found its hang-under claim wrong). Ran the key ideas against the real code before planning on them: 1-2's rooms
across World 1's tempo range on both settings (E2), the first step's idea as a prototype (E9), the risk headroom (E8), and E's newest
move in the real engine (E11). Built the plan around the runs, not the specs. When the lead asked for E's window sizing on a real 1-2 node, ran it in the real
engine with 200 noisy take-offs a jump (E12), which found the 2x model error.

**Lessons applied.**
- From CRITIC §6: "trace one piece both ways and diff". Tracing every room on Easy as well as Normal found the Easy-only refusal (E2)
  that no spec mentions.
- From CRITIC §6: "a magic number that works on the one stage it was tuned on is a hypothesis". E4 ran the apron at 5 tempos.
- From LAWS 3: check the fact before acting on it. E's "the move does not exist in the engine" was one `grep` from wrong.

**Method update** (proposed for a new `reference/methods/engine-plan.md`):
- *Worked better, with proof:* prototype the first step in a scratch copy of the real file and measure it before writing the plan.
  E9 turned "fix the proposer" from an estimate into a measured 932 -> 41.
- *Worked better:* test a formula in the real engine, not in the model it was derived from. E12's model said 11.1%, the engine 0.5%.
- *Worked better:* `grep` every "new" thing a spec proposes before costing it. E11 took 2 minutes and removed E's largest build item.
- *Failed, and why:* my first hang-under run used the flight model with my own guess at the grab rule, and it said Easy could never
  catch a shipped rope. The engine's real band (`engine.ts:4983`) is 30 px more forgiving. The edit: "a model of an engine rule is
  checked against the engine line it models, or run in `realPlay`, before it is reported".
- *Failed:* the planned clock. A 75-minute brief finished its core in well under that, because runs take seconds. As the critic
  proposed: judge a short clock by its step list (§0 lists every step and what was cut).
