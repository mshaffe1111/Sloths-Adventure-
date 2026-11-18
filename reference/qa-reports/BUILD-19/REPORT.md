# BUILD-19 REPORT: 1-9 The Boa's Branches (t-build-19 from origin/main 6e7b85f8 + origin/t-eng-19b; started 9:51 AM ET 11-18)

## EXACT NEXT STEP (a fresh member; the heavy checks, each ONCE, on the head named in "Head")
0. `git fetch origin t-build-19 && git checkout t-build-19`; `npm install --no-audit --no-fund --legacy-peer-deps`.
1. **Bots** (if the 40-seed table below says UNRUN or partial): `npx tsx tools/engine/addlevel.ts 1-9 --relist --par 4` (rolls, relist,
   bots 1-40 x both settings, registry; ~30-60 min). Commit `src/game/gen2/proven/seeds-1-9.ts` + `provenIndex.ts` it writes. Trace every
   non-PASS: two runs per cause (seed, x, frame, what took him) with `reference/qa-reports/BUILD-19/` probes (relative imports, D83).
2. **The full suite ONCE, foreground or with a 2 h background limit** (it ran past the 30 min default and was cut on the merge head):
   `npx tsx --test src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts`.
3. **Checks ONCE on that head:** tsc; `npx tsx tools/engine/seedlist.ts 1-9 --check`; `npx tsx tools/engine/seedlist.ts 1-1 --check`;
   lockall vs main (`lockall.ts --layouts 16 --out lock-main.json` on origin/main, then `--intended 1-9 --check lock-main.json` here: only
   1-9 may move); `npx tsx tools/difficulty/coveragecheck.ts`; `npx tsx tools/engine/registrycheck.ts`; `node tools/perf/knowncheck.mjs`;
   `npx tsx tools/engine/generalitycheck.ts`; `node tools/roadmapcheck.mjs`; **drawcheck 1-9 both ways** (D81; 7.5 limit, aim <= 7.0);
   `python3 reference/qa-reports/BUILD-19/planted-faults.py` (6/6 CAUGHT on 202d198a).
4. **The meter WITH its anchors** (scale is NaN without them): `npx tsx tools/difficulty/score.ts --stages 1-1,1-2,1-3,1-7,1-8,1-9 --seeds 1-4 --settings normal,easy`;
   name 1-9 Normal/Easy against DIFFICULTY.md:67 (1-9 9.5; Easy <= 0.6 x 9.5 = 5.7), not tuned.
5. **ENG-19b's proof leftovers + 1-9 stills** (rule 29: only after the bots' table is green): `npx vite --port 5199`;
   `PW=/opt/node-tools/node_modules/playwright/index.mjs node tools/engine/runs/boaClip.mjs 5199 reference/qa-reports/BUILD-19/clips/roost-up roost up` (and `roost-side roost side`);
   `npx tsx tools/engine/runs/boaBotPads.ts <scratch>/pads.json middle 1` then `BOT_PADS=<scratch>/pads.json PW=... node tools/engine/runs/boaClip.mjs 5199 reference/qa-reports/BUILD-19/clips/bot-up bot up` (name the frame);
   1-9 stills upright 412x915 + sideways 915x412, Normal + Easy (localStorage sloth_difficulty, D62), the WHOLE screen (D79): the step
   freeze boa rearing, the freeze slow-motion, the trapped boa + vine + hive, the stair, the bop, the roost on the creaky limb, the eagle
   over the hunters, the Old Boa with the eagle's pass, the exit; one clip of a freeze (`trap-stills.mjs` / `stills-at.mjs`, level.md step 5).

## Head
- **202d198a** (pushed 10:35 AM ET): the last commit with every number below except the bots' 40-seed table (running on it at the stop).
- Commits: 03a64a23 merge; 328eb18d castFreeze fixture; 4378672f + 8e470d9f engine (the lead's (a)); e098427d 1-9 data; 71dc1d81 tests; d2c947bf
  fixtures; 202d198a flight/registry/beat fixes.

## Step 1: the merge (origin/t-eng-19b onto main 0.9.9), every conflict and its resolution
| File | Resolution |
|---|---|
| .github/workflows/gates.yml | main's tool-test list + boaBots.test.ts |
| src/game/castPlay.ts (imports) | union: main's `landed` + 19b's `reachBox`, `touches` |
| src/game/gen2/pipeline.ts | main's `layChaseStage(..., req.kit, false)` (19b carried t-eng-b6's older `layChase`) |
| src/game/predators/core.ts | main's `landed()`; 19b's `reachBox` and coil-aware `hurt` |
| src/game/engine.ts | both constants (KNOCK_HEARD, FREEZE_SLOW); main's removal of the old `updateChase` kept |
| tools/inspect/firsttimer.ts | both fields (`glanceAt`, `rearSeen`) |
| reference/art/CATALOG-MASTER.csv | union (main's hf18/w2 rows + hf19/w1-roost), LF; inventory w1/w8 re-emitted by catalog_master.py |
| reference/art/HF-SPEND.md | both logs, the combined balance noted (~$53.1) |
| reference/handoffs/engine-core.md | main's note + 19b's §0zd and 19a's §0zc (renamed 0zd-19b, 0zc-19a) |
**Merge red found and fixed (law 22: the merge, not the assertion):** castFreeze.test "cut short the step one comes out": main's ENG-WATCH
starts each pass from the end FARTHER from him (core.ts passAt 'far'); 19b's fixture poked the eye to x0, which on main is the pass's end.
Fixture now starts the eye where a pass starts; assertion unchanged; planted (cut disabled) red. The lead accepted it (10:02 AM).

## Step 2: ENG-19b's proof on the merged head
- Suite: ran 30 min (3,342 tests: 1 red, the castFreeze fixture above) and was CUT by the background limit before the end. NOT a full
  run. The final head's full suite is EXACT NEXT STEP 2.
- seedlist 1-1 --check, the roost stills (up/side) and the middle bot's freeze clip: **NOT RUN** (EXACT NEXT STEP 3 and 5).

## Engine (the lead's ruling (a), 10:09 AM ET): a stage whose goal counts petals never tops up animals
- 4378672f: planBudget `fights` and topUpFoes; petalGoalTopUp.test (planted: the clause off -> lay 16, red). **lockall on it vs main:
  102/102 stages unchanged, exit 0** (10:20 AM).
- 8e470d9f: the same rule spread to every place a fight is assumed (D21): `fightsForGoal` for the length reserve, the "thin" and "short of
  animals" retries, and levelCheck's "not enough enemies for the quota" (without it every 1-9 roll failed). Covered by the final head's
  lockall --intended 1-9 (UNRUN at the stop).
- engine-core.md §0zl.

## Step 3: 1-9 built
- **Graph** `A Tg&:&boa-trapped,boa! Pc&:&boa*2! R Xh&:&boa! R Wk&:&boa-roost! R Cg&:&boa-trapped! Ch&:&boa-roost! Cc&:&boa! R L R S&:&boa! E`
  (long form: each node names its boas so the designer's count is laid whatever the threat budget; content letters pin the three reads'
  order). Brief: cast ['boa'], teaches ['still'] (CastData.teachStill: the first freeze is the slow-motion moment), ends finale, dealExact.
- **Rolls**: 24 of 24 clean on both settings, ONE beat order, 11 boas both settings, 214-220 s modelled (202d198a, before the relist).
- **Seed list**: 100 of 100 proven on the first (pre-judged) roll; the relist on 202d198a is in the running addlevel.
- **Registry**: registrycheck 1-9 "registered everywhere" (row, kit, config, routed, attempts, sheets, drawcheck, seeds, flown) on 202d198a.
- **Flight**: `FLIGHT_STAGE=1-9 ... flight.ts normal all` (fly/flight-1-9-normal.txt, 1 m 14 s): within 0-1 px of 1-8's, but the double
  flick's widest 385 for 391. Rows n19 in flownArcs.ts; the row judged 'normal-1-9'.
- **Lines**: the keeper's (a)-(e), (g)-(k) and Pokey's page verbatim (lines-1-9.md from t-keeper-19@a10b3799, merged in); hint.1-9.guard
  and lock.ring.snakes removed; the journal's boa tip replaced; stagePlan mission + `gathers: 'petals'` (the goal is petals; kind kept);
  SEALED '1:gauntlet'. firsttimer takeIn already learns "don't move" (firsttimer.ts:1779). **(f) SPLASH is NOT laid** (no hook: below).
- **Hand-built 1-9**: its routing removed (HAND_STAGES), its guard/ring lines removed. Its plan code stays: castEngine/ringKillsCounted
  re-pointed to 3-9, forgive/levelWalls name the '1-9' plan outright as a shell (see Not done).
- **Tests**: w1Arc19.test.ts (7): the keeper's words, the arc beat for beat, the eleven boas each beside its tool, beat 2's step, the roost
  limb, teach distances, Easy never harder. planted-faults.py: 6/6 CAUGHT.

### Design changes from 1-9.md (each forced by a rule or a measured bot; the lead told at each)
1. Graph: `A T T P R T R W R C C C R L R S E` fails checkCode (V2: 3 teaches for a brief's 1; V4: twist before any test). Beats 1+2 are one
   T brick (1-7's precedent), beat 5 the X (test). Approved 9:58 AM.
2. Beat 2: the boa a ROOT STEP DOWN (50-56 px), 140 px past the step, not 140 px past a gap: the lay keeps an animal JUMP_CLEAR (120) past a
   jump's landing (pipeline jumpClearance), which left that bough no patch. On the upper bough he is above its strike (30 px) and coil.
3. The freeze FIRST in the teach brick, the trapped boa second (bots: no tier had an answer at a trapped boa first; every one was hit
   there). Told to the lead ~11:00 AM.
4. The trap unit for a posted boa: one bough, the vine 233 px from the boa (1-3's log put the boa 127 px into a log: its rear began at the
   hop up).
5. The roost's bough is WALKED onto from the creaky limb (the same jumpClearance), so he is on the limb when it rears.
6. L "two hunters" = the eagle + ONE boa (L is structural: it names no threat, and the section's budget pays for one). 11 boas, not 12.
7. Each read ~1,700 px of bough: the rolled flags put a hard node's flag 1,500-2,400 px before it and none within 900 of the last.
8. The stair's boas 210 px into their landings (the rear starts after the step up lands).

## Gates (head named per line)
| Gate | Result | Head |
|---|---|---|
| tsc | 0 | 202d198a |
| w1Arc19.test + the re-pointed fixtures + 1-9 build-path tests (artDress, flowerReach, ringKills, castEngine, forgive, levelWalls, sectionTrack, stage19, layoutMemory, sceneList) | all green | 202d198a / d2c947bf |
| planted-faults.py | 6/6 CAUGHT | 202d198a |
| lockall (engine (a) vs main) | 102/102 unchanged | 4378672f |
| registrycheck --stage 1-9 | registered everywhere | 202d198a |
| full suite | **CUT at 30 min on the merge head; UNRUN on the final head** | - |
| seedlist 1-9 --check, 1-1 --check, lockall --intended 1-9, coveragecheck, knowncheck, generality, roadmapcheck, drawcheck 1-9 both ways | **UNRUN** (EXACT NEXT STEP 3) | - |

## Bots (castBots 1-40, both settings, on 202d198a via addlevel --relist: READY, 101 s)
| Tier | Setting | Result | Under 2:00 | Time median | Hits (a run) | Lives |
|---|---|---|---|---|---|---|
| kid | normal / easy | PASS 40/40 / 40/40 | 0 / 0 | 143.8 / 147.8 s | 9.5 / 7.0 | 0 / 0 |
| adult | normal / easy | PASS 40/40 / 40/40 | 0 / 0 | 144.1 / 146.9 s | 6.9 / 5.5 | 0 / 0 |
| child | normal / easy | PASS 40/40 / 40/40 | 0 / 0 | 433.7 / 291.4 s | 5.6 / 1.8 | 3 / 0 |
| middle | normal / easy | PASS 40/40 / 40/40 | 0 / 0 | 213.9 / 197.0 s | 2.0 / 1.2 | 0 / 0 |
| expert | normal | PASS 40/40 | 0 | 177.1 s | 2.1 | 0 |
Easy is never harder: fewer hits than Normal for every tier. Traps sprung 0/80 for every tier (told of traps 0: nothing in 1-9 names
1-3's trap; ENGINE-WORTHY 2). Seed list relisted: 100 of 100, --check PASS. Traces (seed 1): the first-timers (kid, adult) do not freeze at
any rear even after (b) (ENGINE-WORTHY 3), so they are hit at most boas; middle/expert miss 1-2 freezes a run (the stair, the bop beat,
the bare read): the 0.43 s window on Normal. The child on Normal: 3 lives in 40 runs (ENG-19b Unresolved 1: its 0.49 s reaction).

## Meter (raw, without anchors; SCALE NaN: EXACT NEXT STEP 4): 1-9 Normal mean 3.4 pts/min, peak 11 (1-7 4.25/11.95; 1-8 15.8/33.8);
Easy 2.0/9.5 (pre-swap head). Read: 1-9 reads near 1-7, far under its 9.5 target; the meter scores each boa as one "creature" ask
(no bits for the freeze's nerve window). Named, not tuned.

## Lead's rulings 10:35 AM ET applied
- Freeze first: in 1-9.md's "AS BUILT" line. 'drops' (movesJournal.ts) no longer opens on 1-9 (R-165.281). (f) R-165.280. Hand plan R-165.282.
- **(j) NOT LAID:** the keeper's journal tip is 15 words; journal.test.ts:31 caps a tip at 12 (a rule: not loosened). main's old tip stays
  until the keeper gives a 12-word line (it is untrue for the new boa: "punch it three times").

## Polish check
**No stills or clips shot** (rule 29: the bots' 40-seed table is not green yet). Rough spots named now:
- The Old Boa is the plain kit boa (no bigger sheet; the lead's ruling 10:02 AM; R-165.279 for a per-row scale).
- No shed-skin clue at the arrival (no such art in the inventory).
- (f) SPLASH not laid (no hook).
- Easy lays the same 11 boas as Normal (softened by the kit's Easy row: rear x1.3, engage 1.3, the eagle's passes free); the design hoped
  for "read it with two boas" on Easy. Easy is never harder in any count (test).
- The roost art (w1-roost, 1.63 of Pokey) has not been seen in this stage.

## ENGINE-WORTHY
1. (f) SPLASH: a `said.chased` line on the first animal chased off by a food-chain eye (core.ts foodChain -> castPlay emits once ->
   engine shows), planted test. S, ~40 min.
2. Bots carry earlier stages' lessons (castBots `knows` from the kit's `lessons` row: traps 1-3, hide 1-7): changes every stage's bot run
   (tierBots recalibration). M.
3. The first-timer bots (KID/ADULT) never freeze at a boa's rear after the freeze line: firsttimer.ts freezePlan / takeIn for FT_*.
4. protoStage's hand plan '1-9' (and GUARD_GOAL_19, w1Sections '1-9', W1Stage) kept only as a test shell (forgive, levelWalls,
   sectionTrack, stage19): delete it and re-point those tests (~30 min).
5. movesJournal.ts:289 'drops' ("Snakes from above") opens on clearing 1-9 (the hand-built ring): content's call (keep, re-point, drop).

## Learned (for the next builder)
- A kind's quota can lay animals you never designed: read the boa count per section on the first roll (16 for 12 here), and ask which
  rule laid each one before tuning anything.
- The verdicts that matter for a posted animal are the LAY's (jumpClearance 120 px past a landing, ANY_APART 120 from a prop, armedTraps'
  140-190 reach to the patch middle): design numbers that ignore them don't lay. Read pipeline patchFor/jumpClearance before placing.
- Sockets fill in list order and pay from the section's threat: list a trap's pair before the animal that would spend the budget.
- Bots learn moves only from this stage's words: order beats so every boa the player must pass comes after the line that teaches its
  answer.

## Proposed level.md rule changes (the lead decides)
- Rule 23 add: "A node whose animals the design counts names them in the code (`&kind*n!`, by row id); a structural node (A R L E) can't,
  so put a counted animal in a content node."
- World 1 notes add: "A posted boa: no animal past a jump inside JUMP_CLEAR (120) of the landing; a rear must not start while he is in the
  air (a step up or a hop): seat it 60 px past where the step lands."
- Rule 6 add: "every animal he must pass comes after the line that teaches its answer, IN THIS STAGE (the bots don't carry 1-3)."

## Method used / lessons applied / method update
- Method: reference/methods/level.md (rules 1-29, steps 1-8) and ENGINE.md day one (lock first).
- Lessons: D19 (tests build the stage as the game does: listedStage + finish), D21 (the petal-goal rule spread to every fights check),
  D40, D43 (no stage id in engine code: the rule reads goalCountsPetals), D51 (1-9 in drawcheck's scenarios the day it was built), D55/D64
  (context reported as an estimate each message), D57 (queue read at each step), D62, D70 (engine changes only on the lead's ruling, own
  commits), D75 (proven on the real row), D77/D78, D81 (drawcheck named in the next step), D83 (probe scripts relative).
- Method update: level.md step 3 should say "read the per-section animal counts and the trap list on the first roll" (the 16-for-12 and the
  unarmed trap were silent: CLEAN rolls with the wrong cast).
