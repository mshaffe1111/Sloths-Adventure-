# Handoff: engine-core (the Engine member's turnover note)

Rewritten at the end of INT-1-1 (11-11), on its final head: branch `t-int-1-1` = C1's re-laid 1-1 (t-content-c1@0fc0835a, passed,
on E0a d2748131 and A1 41c2e248) + t-content-c1-tests + the vendor split (t-engine-chunks@e67809c3) + the help ladder
(t-engine-help@98186930) fitted to the new layout, with the Critic's two deltas fixed. Not merged: the one PR that ships E0 + C1 + A1 +
A2 (ADR-001). Sections 0a-0b below are still true.
Rewritten again at the end of R-165.112 (11-11): branch `t-engine-seedchunks`, rebased onto the passed t-int-1-1@874f11f6: each stage's proven list is
its own lazy chunk (section 0d). The lead's ruling, 11-11 5:18 PM ET: the stand-in is ACCEPTED (a failed list load plays 4106 by its
proven plan; Play is never blocked).

Updated at the end of FEEL-PAIR (11-12, t-feel-pair): section 0h, the draped pair and its feel room; the rest is as it was.

## 0h. The draped pair and its feel room (FEEL-PAIR, R-165.170, t-feel-pair, 11-12): what the next engineer on climbs must know
- **A climb's speed and reach are values on the vine piece** (vinePair.ts): `Vine.climbSpeed` (px/s, up AND down; unset = CLIMB_SPEED
  220, every single climb, unchanged) and `Vine.pair` (the strands' gap; x is between them). climbReach adds half the gap to 54/60, so
  up beside either strand takes both; he hangs at x (between them) with `PlayerState.climbPair` set. engine.ts reads them in the trunk
  grab (~:1960) and the climb (~:2040). The rustle quickens with the speed (rustleGap); a single's is byte-for-byte the old 0.36-0.48 s.
- **Drawing:** protoArt.ts skips a pair in the trunk loop and calls pairArt.ts drawDrapedPair (World 1's painted vine tile, castArt.ts
  vineTile, laid with ropeArt.ts layRope along a path: trailing ends, two strands, a round loop over the bough); a pair's top gets no
  kapok perch (`tops` leaves pairs out). sheetWarm.ts warms the trap sheet for any pair. The hero: heroClips.ts climbU/pairSway (the
  climb cycle 1.5x longer on a pair, a +-0.07 rad sway); there are NO arms-out frames: that is new art (the lead's call).
- **The feel room** (feelPairStage.ts + feelPair.ts + FeelPairClock.tsx): QA build only (`feelPairConfig()` null elsewhere;
  generateStage builds it only with qaBuild()). Entry: title, Settings (gear), About, "Vine pair test", Play; or `#autostart=1&level=
  feel-pair`. GeneratedStage.feelRoom -> engine.ts `this.feel` (control() before the attack step takes a tap by the sign; drawWorld
  draws the sign). RealPlay hosts it with `asQaBuildForTest(true)`. Stills and clips: reference/qa-reports/FEEL-PAIR/shoot.mjs.
- **Traps I hit:** (1) a keyboard press and release inside one frame never reaches the engine (inputEngine keyup clears the buffer):
  hold a key 150 ms in a script. (2) Headless full screen (the game's wide mode) shrinks Playwright's recorded frames to two thirds with
  a grey band: stub requestFullscreen in the recording context. (3) Text under 12 px fails textSize.test.ts (UI-14). (4) The camera's
  vertical ease lags a climb by speed/6.5 px: feet 50% of a sideways view on a single, 45% on a 2x pair; the 1-4 climb camera (piece 5)
  owns that framing, not the pair.

## 0g. World 1's ground seams (RF2, t-render-2, 11-12): what the next engineer on the painted ground must know
- **Soil fills are sampled FILL_INSET (3) sheet px in from every edge** (groundPaint.ts fillSrc). The ground sheets are lossy WebP: fills
  2-3 of every world sit on the lip strip and their last 3 rows are dark (World 1: 60 -> 36), and Worlds 6/9 bleed at side edges. Drawn
  edge to edge every 600 units, that was a hairline along every soil row (1-1's pillars at y 1200, 1-3's floor line at 600). Never
  sample a packed piece to its frame's edge; measure the edge rows (RF2 REPORT has the numbers per world) before trusting "periodic".
- **The floor's lip at a raised bank:** under a short step (< SHORT_STEP, 60) between two floors the floor's lip is drawn AFTER the run
  (stepFootLips), covering the end pieces' clean cut; beside any higher bank it runs LIP_UNDER (60) on under it, drawn BEFORE it
  (lipUnder), so only the gap where the end face curves back in shows it. Without them: a bare box with straight sides at every step.
- **1-1's dip pockets are painted in drawGround (baked squares) with groundDepth**, not live in drawProtoScene: live, laid from the view,
  they were a lighter box between the earth pillars that moved with the camera. Anything drawn live over the squares must use the
  ground's darkening, or be baked with it.
- **Backdrop strips over a chasm** end in stripFoot (scenery.ts): the bottom edge averaged to 48 columns, darker downward. Stretching
  the strip's last rows (the old way) made hard vertical streaks across the bottom quarter of an upright screen.
- Finding a drawer: tools in RF2's REPORT ("Method update"): a per-pixel trace of every draw into the ground squares beats guessing.

## 0d. Rulings and facts to keep (R-165.112, 11-11)
- **A list is never in the main script.** `gen2/proven/seeds-<stage>.ts` (GENERATED) holds the list; `gen2/provenIndex.ts` (GENERATED)
  holds, a stage, its count, its version (`listVersion`, the hash a run's `list` stamp carries) and `load: () => import(...)`. The
  build makes each list a chunk (`assets/seeds-1-1-*.js`) that the service worker precaches (the `js` glob). Main: 3,956,993 B with 200
  seeds and with 355 (it was 3,981,833 with the 200 inside it). `seedListChunk.test.ts` walks the static imports from `src/main.tsx`
  and fails if any reaches a list file. Never import a list file by name.
- **Who loads it:** `loadSeedList(id)` (never rejects; one fetch at a time; a file that is not the one the index names is refused).
  The game asks at the card (`buildAhead.ts scheduleAhead`), at `App.tsx startLevel`, and WAITS in `launchEngine`
  (`seedListSettled`, beside `readyToStart`): at most `SEED_LIST_WAIT_MS` 3 s, once a stage; after a failed or stalled load later
  starts go straight in. Under Node a reader reads the file on the spot (`loadNow`, createRequire): tests and tools need no import.
  A test that must see the page's side plants a source: `plantSeedListSource` (seedListLoad.test.ts).
- **The stand-in.** With the list not in memory, 1-1 builds `standIn('1-1')`: FIRST_RUN_11 (seed 4106, firstRun11.ts, now in the main
  script) by its own plan, so Play never searches, never waits on the network and never plays an unproven layout. The play keeps it
  (`playSeed` pinned in `play11Seed`); the device's shuffled order is not touched. A stage that gets a list later needs its own
  stand-in in `STAND_INS`, or a not-loaded list falls to `provenGen2Stage` (the search).
- **Play pressed before the list is in:** `newPlay11` returns null and owes the draw; `play11Seed` makes it at the build.
  `peekPlay11` returns null until the list is in.
- **The order of a list is its identity.** Layout variant N is the list's N-th seed (first run 4106 = variant 11, Rolls A/B/C, the
  bots' calibration on variants 1-40). To ADD seeds: `seedlist --merge <file> --in-order`, the old seeds first, in place. 1-1 now:
  355 seeds = the 200 in place + 155 after them (reference/qa-reports/R-165.112/list-build.json holds the sweep).
- **Chromium keeps a failed module fetch for the page's life** (measured: 1 request for 3 asks). So after a failed list load the
  session plays the stand-in until the app is opened again, although `loadSeedList` asks each time. A real in-session retry needs a
  fetch()ed JSON list (and its own precache glob): a packet, not done.

## 0e. Lane EN-F, the audit fixes (t-engine-fixes, 11-11/12): what the engine core now promises
- **One take-off (A-04):** engine.ts `groundJump()` is the only ground jump: a press on the ground, in coyote time, or buffered before a
  landing. It judges the spore fog itself (`flightClear`), and the landing's floor effects (crumble timer, a boss's cracking ledge) run
  before a buffered jump leaves; a mushroom always bounces and uses a buffered press up. A new jump modifier goes in groundJump, once.
- **One way back to a flag:** `respawnAtCheckpoint` restarts every run state: the chase (`restartChase`, A-07; the collapse is reused in
  7-6), the tide, the lantern, World 5's stillness (`w5.calm()`), crumbled platforms (`crumbledWhole`, A-03) and latched presses
  (`dropPresses`). A new per-run state is reset there. `softFall` (and heartFall / lanternSetBack through it) also makes crumbled
  platforms whole. `loseLife` and `chaseCaught` do nothing once the run is over (the engine keeps stepping under the Game Over card).
- **Presses never outlive a held world:** `InputEngine.dropPresses()` (latched jump, punch, kick, mega; never a held direction) runs at
  the respawn, on resume and at a guardian entrance's end. realPlay.ts and bossPlay.ts inputs have the same method: keep them in step.
  The reverse holds too: a stage-start clearAll() makes the recogniser and the Pad `restate()` (forget what was said, keep the fingers),
  so a thumb held under the title card steers on its next move. A flag before the chase start gives the fresh chase (chase.ts
  restartAt, A-07b).
- **Paused = one still frame (A-06):** `stillDrawn`; the loop draws once and stops until resume, a resize or a restored context; pause()
  settles the shake. **Failed frames (A-12):** the stage ends once 20 of the last 60 frames failed (a ring), never on a rarer error.
- **The camera's rise cap is a rate (A-05):** 11 px per 1/30 s step = 330 px/s at every frame rate. Never cap it per drawn frame:
  planted, that put his head 70 px under the HUD at 15 fps (cameraBounce.test.ts guards it).
- **Test kit:** `src/game/engineCoreHarness.ts` (the audit's real-engine harness: makeEngine, standOn, step).

## 0d. Lane EN-G, guards (t-engine-guards, 11-11): the loop, saves, the generality gate
- **The loop (R-165.116):** engine.ts `loop()` keeps `acc`, real time not yet played, and plays it in whole 1/30 s steps (at most 3 a
  frame; past that the rest is dropped). A frame within 0.5 ms of 33.3 ms is exactly one step and its hair is let go (so a 59.94 Hz
  screen never slips a frame). `lastRenderTime` is the time of the last frame that ran; the governor, the recorder and the perf log see
  that true gap. Every step is exactly 1/30 s, the same as realPlay's `DT`, so the bots and the browser now play the same physics.
  Proof: `src/game/frameLoop.test.ts` (48-144 Hz, struggling phones, one late frame, a stall). Still open: audit A-05 (the camera's
  11 px rise cap is per update, so a 67 ms frame lifts 22 px; the camera owner's fix) and A-06 (a paused stage redraws every frame).
- **Saves (R-165.117):** saveFile.ts has ONE entry limit, `MAX_ENTRY_CHARS` 16,000. `src/game/saveFill.ts` (a test kit, never imported
  by the game) fills every save key through its real writer at its largest; `saveRoundTrip.test.ts` round-trips it and fails when a
  save key has no filler, an entry passes half the limit, or the file passes 60% of `MAX_SAVE_BYTES`. A new save key: add its filler.
  0.9.5's own saves are `src/game/fixtures/save-0.9.5-*.json` (made by `tools/save/oldSaves.ts` in a worktree of that release).
- **The generality gate (R-165.123):** `npx tsx tools/engine/generalitycheck.ts` (`--list` shows every hit). Engine scope and every
  exemption, with its reason, are at the top of the tool. Its debt is `tools/engine/generality.known.json`: shrink-only both ways. When
  you move a literal into world data or a brief, lower that entry's `count` in the same commit, or the gate fails. Never add to the list:
  put the fact in world data. A new non-test .ts under src/game/gen2/ (outside worlds/) is engine code from its first commit.

## 0d. The generator's yield (EN-Y, R-165.120, 11-11): what the next engineer on gen2's search must know
- **Measure with the probe, never by eye:** `npx tsx tools/engine/yield.ts 1-1 --par 4` (200 fresh seeds a setting, about 60 s; `--from`
  for another range, `--min 50` to fail under 50%, `--json` for each seed's rules). Fresh means above the list's highest seed (61616).
  11-11: Normal 57% / Easy 55% on 50001-50200, 58% / 54% on 70001-70200 (was 9% / 2%). Tune on one range, report the other.
- **The table shows a never-clean seed's FIRST refused roll** (what it always returned), so its rule counts lag the search. To see what
  the later rolls died of, read `gen2.repairs` on the refused stage: each later try adds "roll k, try n: <line>".
- **Where each piece is (pipeline.ts):** `rollUnmet` (the after-rules, with the slot each names), the accept point in `buildRolled`
  (search for "R-165.120: a rolled graph's plan is taken only"), `windowFix` (V19b from the gate's numbers), `supplyDeal` + `unfilled`
  + `poolFits` (the deal and the lay against the pool), `leftShort` and `overspent` inside `layStage` (look-ahead, pacing).
- **The proof no proven seed moved is by construction, then by the gate.** Everything in the accept point runs only where the old
  search would have returned a refused roll. `supplyDeal` and the pool look-ahead run on the first roll too: they act only when the
  pool cannot fill the stage, which a proven roll never had. `seedlist.ts 1-1 --check` is the gate; run it after ANY change here.
- **TRAP, the replay:** Play and the list rebuild a stage from its stored plan (template, mirror, versions, salt, join kind, node).
  Anything a repair changes that the plan does not store makes a stage the list can never replay. Pacing first steered the step's
  direction; that would have failed every new seed's replay. It now changes only the join's KIND. yield.test.ts holds this twice (a
  paced lay laid again from its plan; a repaired clean roll through packPlan). Keep any new steering to what PlanSlot stores.
- **TRAP, the deal's stream:** the deal's tries share one rng; filtering a candidate list changes how many numbers it draws and moves
  every later try. `supplyDeal` runs AFTER the tries, on its own stream (rngFor(seed, 71)), for that reason.
- **Clean is not listable.** seedlist.ts also holds the quiet line (4 s) and the squirrels, outside the generator: 20 of 200 fresh
  seeds list (was 0). Most clean seeds fail only the quiet line. That is the next wall, and it needs the quiet line inside `src`.
  Measure it with `npx tsx tools/engine/seedlist.ts 1-1 --count 400 --worker 0/1 --part /tmp/x.json --from 50001 --to 50201` (a
  --part run writes no list file). A seam with no beat costs quiet time: pacing's flat join is a pit, not a walk, for that (13 -> 20).
- **The joins are the lever for height.** A step leans to the corridor's middle, so low in the stage it climbs and spends the rise the
  climb nodes need. Pacing without the join steering: 35% / 33% clean; with it 57% / 55%.
- **What still refuses (50001-50200, Normal):** V19b 59, floor.unmarked 58 (a seam's catch bough under a thin first piece lets him walk
  off under it: quiet-arrival, log-chain, high-walk), signature short of sections or of rise 47, climb 27 (the corridor's top: the
  stage spends its 900 px of rise before the climb node). sprint-A lays clean 15 in 18; sprint-B 4 in 13, sprint-D 5 in 15.
- **A2, the quiet line in the search (the lead's 7:31 PM ruling):** `BuildRequest.also` is a caller's rule the search asks last and
  repairs for; `tools/engine/listRules.ts` `quietJudge` is the list's quiet line as that rule, and seedlist.ts builds and checks under
  it. `yield.ts --list` measures LISTABLE: 33% on 50001-50200, 28% on 70001-70200 (was 0 of 200). TRAP: a seed listed under `also`
  must be checked and searched under `also` too, or its search is another stage than its replay (seedListBreaches takes it).
- **What caps listable is data, measured:** the two test-backs always break the quiet line (out of the pool: 46%); sprint-B with its
  climb node needs 1,127 px of climb in 900 (1 in 30); sprint-D 0 of 43 until the test-backs go. `supplyDeal` weighs the least
  climb against the corridor plus two soft bands: one band (980) is the natural line and moves two proven deals.
- **Tonight's helpers on this branch:** B = packet E12 items 1-3 (gen2/listed.ts done; hurt floor laid and hurting, not drawn;
  reach.ts JUDGED table, 1-2's rows not entered). C = EN-T (stageModes.ts; camera lead not wired). REPORT.md has each one's next step.
- **Late additions (8:30 PM):** `reach.ts builtOnArcs(stage)`: the arcs judge a stage gen2 BUILT, never an id alone (the level
  check, finishReach and the petal pass ask it; a hand fixture needs a `gen2` record to be flown). `GraphBrief.pits: 'hurt'`: the
  lay puts the world's hurt floor under every section pit past clearStart (briefPits.test.ts, 1-1's own sections). TRAP it found:
  anything laid with a y of its own (a zone's line) must move in layStage's shift-down block, or it is wrong on every rolled stage.
  TRAP the lock found: JSON field ORDER is part of a stage's fingerprint; write new fields where the old ones were written.
- **Next, in order of what it buys:** park the two test-backs and rebuild the list; more rising signature pieces; pacing from the first roll (moves proven seeds: the lead's call,
  at a list rebuild); the window read where the gate reads it (67% of x, the highest piece there) instead of by slot; the deal
  weighing height (a test dealt climb beside a climb node cannot fit the corridor).

## 0e. The piece library (EN-L, 11-11): a stage's brief, not its sections, says what it is
- **Four things are the brief's now, applied by the lay (gen2/types.ts GraphBrief; nothing shipped sets them yet):** `pits` ('hurt': a
  hollow under every section pit; 'lesson': only under sections that teach or use the hurt floor's lesson), `petals: 'low'` and
  `offRoad: 'fruit'` (fillSockets), `trend: 'level'` (a seam's step and the pick lean to the start height, pipeline LEVEL_SWING), and
  `pick` (stagePool: the whole library by need; `feel` only excludes through `pick.refuse`, which also empties a socket whose
  `allow` starts with a refused name). Tests: briefPits, briefPickups, briefPick (gen2/), each on 1-1's OWN sections and proven plans.
- **The proof is a tool, run it before and after any change here:** `npx tsx tools/engine/library.ts --seeds 120 --par 3 --flown`
  (1-2's brief from World 1's sections plus the chain bricks; 11-11: 61% / 56% clean but for the unpainted thorn bed, 0 throws).
  `library-where.ts <from> <n> [regex]` names the section behind each refusal: read it before guessing.
- **TRAP, the corridor's middle:** a step join leans to the middle of `manifest.corridor`. World 1's sits 410 px over its floor, so any
  World 1 stage that is not `level` climbs at every seam whatever its sections do. A level stage also needs room UNDER the floor
  line (World 1 has 80 px): a per-stage corridor row is not built; the tool overrides it test-side (ROOM_12).
- **TRAP, a height complaint:** print each laid section's entry and exit height first (two guesses cost 15 minutes here).
- **One brick, two worlds (A13):** `SectionPiece.slot` + `WorldManifest.slots` (gen2/brickSlots.ts helpers, test-only). Nothing draws
  `PlacedPiece.art` yet; boughs and mushrooms have no inventory key. The inventory files came unchanged from t-engine-inventory.
- **Still welded:** World 1's `feel` lists hold stage ids until 1-1's brief takes `pick` and its list is rebuilt.

## 0f. Tonight's pieces wired on the 1-2 path (EN-W, 11-11 late): what the next engineer must know
- **The thorn bed is found and painted** (`w1Pits.ts`: `findW1Pits` kind `'hurt'`, read off the piece gen2 marks `pit: 'hurt'`;
  `drawW1Pits` paints the pit's dark and the two cut brambles, `src/assets/props/pits/w1-thorn-*.webp`). So `drop.look-lies` passes on
  World 1, and the search stops dead-ending on every plan that holds a hollow: 1-2 on flown rows went 0% strict to 118 of 120.
- **1-2's double is counted by the built stage** (`LevelConfig.doubleTaught`, set by `planBudget` from the world's `lessons`, an
  earlier stage only; `doubleAllowed` reads it). No shipped config carries it.
- **Read before quoting an unflown number:** a stage with no JUDGED row (reach.ts) lays to the unflown reach (230 px double; three
  World 1 sections ask 253-256 and THROW) and carries `NOT_JUDGED_ALL` (pipeline applyVerdicts): its "clean" is not the verdicts'.
  1-2 needs its own flown rows before `library.ts` without `--flown` means what `--flown` means.
- **The engine steps one `StageClock`** where `gameTime += dt` was; `gameTime` is a view of it, read AND written through the clock
  (`engineClock.test.ts`): harnesses place game time (`realPlay.ts` `t`, `tools/perf/frozen.mjs`), so never copy the clock over it. No
  stage declares a clock yet: serve `ModeHost.clock(id)` from `this.clock.read(id)` when a brief carries `clocks`.
- **Look, not done:** a hollow under about 70 px wide reads as a column of roots (the banks' end faces meet over it, the ground
  painter); the slab's left end face peeks; the pictures are not in the stage preload. REPORT.md "Polish check" has all of it.
- **To see a hollow in the real page:** a worktree, `tools/engine/library.ts` copied into `src/game/gen2/` without its main block, and
  `stageGenerator.ts` building 1-1 from `kitLib12({ flown: true })`; then `tools/engine/runs/stills-at.mjs` (layout 2, x 26180, 27930).

## 0c. Rulings and facts to keep (INT-1-1, 11-11)
- **The help promises only what gets him through** (the lead's ruling): `engine.canGrowAt(piece)` = something grows AND
  `stepPlan(...).unsolved === 0`. HelpLadder's canGrow is that call (Easy's step at 8, Normal's offer at 12, the re-ask). The pieces where
  nothing can grow are listed by the sweep and stand as they are.
- **Pads** are the gap less 2 x PAD_EDGE (50), PAD_W (60) the least (the lead's ruling: a 60 px pad was overshot from the lip, 3868 N
  w1-two-answers, pinned in helpLadderPieces).
- **A hollow log is road** in `roadBoxes()`: gen2 lays its platform the art's full height (pipeline.ts ~:1164), so its inside does not
  let him through today, though w1NewArt.ts says it should. Open (a suggested Engine packet).
- **Stair builder rules on the new layout** (A/B over 200 seeds x 2, reference/qa-reports/INT-1-1/ab/): KEPT catch boughs not road,
  hidden log, stump take-in, pads, BOUNCE_NEAR/ALONE; DROPPED the narrow-stump swap and the sliver trims. Faces: `rise > STEP_LEFT`.
- **Dot's ladder lines** (dotGuide.ts `anyway`, helpLadder.ts, DotGuide.tsx): such a line goes first in her queue, even in danger (he
  blinks 1.2 s after every set-back, which is danger, and her clock stands still then), with no breath gap; pushHelpLine clears the
  stage's own engine tip at once; passedLine takes a ladder line down at once; the engine's 8 s (LINE_UP_S) count from when her bubble
  first shows it (helpLineOnScreen from DotGuide; RealPlay reports at once; LINE_WAIT_S 30 if never shown). While a ladder is on
  (helpLadderOn) the old stuck helper ("This way, Pokey!") is quiet. A ladder line hovers in the band under the top HUD (DotGuide planFor),
  and the grown steps are hard keep-outs for her bubble (grownRects, from helpLadder.ts setGrownSteps). Proof scripts: the Critic's
  proof.mjs (LINE='A step') and overlap.mjs, pace.mjs.
- **The camera in a bounce or a double** (engine.ts updateCamera): from his climb, the height he will top out at (`topY`); once that is
  past one jump's rise over the height he left (`lift`), refY ramps to it and the view moves to keep him under the HUD band, never more
  than CAM_RISE_STEP (11 px of world) a frame, and back down after it the same way (`camLifted`). Hops are unchanged. Prove any camera
  change per engine frame (delta2/camworld.mjs, the Critic's cam.mjs), never from a still: the first version snapped 44-72 px in a frame.
- **The sweep:** `npx tsx tools/inspect/helpSweep.ts --fly`; the suite runs the breach sweep on all 200 seeds and flies every 10th.
  Every help flight runs on the engine's real loseLife and fails on any `lostLife`. RealPlay answers the offer no unless a test sets
  `e.helpAsk`.
- **Judging a shipped stage in a test:** `validateAsJudged` (levelCheck.ts): 1-1 on its flown arcs, everything else the closed form.
- **The tier bots' pin** (tierBots.test.ts) reads calibration-main.jsonl, recommitted on the re-lay; the 0.9.5 runs the bots were
  calibrated on are calibration-0.9.5.jsonl. On the new 1-1 the table no longer matches the testers (by design): re-measure after a
  play window.

## 0a. Rulings to keep (R-165.61, ADR-001/002, packet E0a, 11-11)
- **THE BOUNDARY: the flown reach and the verdicts gate 1-1 ONLY** (`reach.ts judgedOnArcs`). 5-7, 5-9, Worlds 6-8 and the old
  generator keep physics.ts's closed form byte for byte; their `gen2` gains `verdicts` (every name `notJudged`) and `drops`, nothing
  else. `lockall.ts` hashes `gen2` without those two fields and prints which stages gained them. Proof: verdicts.test.ts pins 5-7 and
  7-1 against main's hashes; `lockall --check tools/engine/lockall-main-0.9.5.json --intended 1-1` -> 101/102 unchanged.
- **A roll is accepted only by name.** `gen2.verdicts[setting]` is a `RollVerdict` (judgeRoll); a refused one's lines are folded into
  `gen2.errors` as `verdict <name> (<setting>): <line>` (rollErrors), so every old reader (provenGen2Stage, the seed list, Play) refuses
  it. An Easy build carries Normal's verdict too. `first-run.drift` is judged on firstRun11.ts by `seedlist.ts --check`, never per roll.
- **One promise registry** (`promises11.ts PROMISES_11`): floor.unmarked (both settings), teach.double-* (Normal only, by `settings`).
  The pipeline judges it; seedList.ts and the seed tool read the verdict. No substring filter anywhere.
- **The numbers are the Designer's** (reference/specs/reach.md, bands.md at t-designer-reach@030a4093). reach.ts is data with a
  `source` per row; a figure you think is wrong is a PUSHBACK, never an edit.
- Raised gaps were not flown: on 1-1 a landing more than 20 px up keeps the closed-form envelope capped by the band (`gapFor`), and
  validateStage adds flown links for level jumps only (`opts.arcs`). Name it if you change it.

(A1 and A2 rulings below, from their own runs; before them: the 0.9.5 porter's run, merged through PR #63 and #64.)

## 0. Rulings to keep (R-165.86, the lead, 11-09)
- **No fall in 1-1 costs a life, on Easy or Normal.** It is stage data: the 1-1 brief's `softFalls` (types.ts `GraphBrief`; w1.ts
  `briefs['1-1']`) -> `Gen2Meta.softFalls` on the built stage (pipeline.ts, beside `rise`) -> `softFallStage(stage)` (pipeline.ts) ->
  the engine's `softOn` (engine.ts, where the stage loads). Never a stage name in the engine, never a WorldManifest flag.
- **The word lays nothing.** No zone, no platform: 1-1's ground, `heartFalls` and `gen2.falls` are the same with and without it
  (softFalls11.test.ts proves it on listed seeds and raw rolls). So `floorlessGaps` judges 1-1 against the level-block put-back zones
  only, as before, and "an unmarked floorless gap drops the roll" still bites. Do not teach floorlessGaps or lethalSpans to read it.
- **`isGen2Stage('1-1')` is FALSE.** 1-1 is not in GEN2_STAGES (gen2/game.ts: 5-7, 5-9, Worlds 6-8); it is built by `gen2Roll11`
  (stageGenerator.ts ~:2870). So 1-1 on Easy had `softOn` before this task, through the hand-built stages' rule; only Normal lost
  lives. To ask "is this a gen2 build" read the built stage (`!!stage.gen2`).
- Water still costs a life (the engine's water checks come before the fall check). 1-1 lays none today.
- Normal's bite starts at 1-2. After this, a pit in 1-1 looks the same as a deadly one elsewhere: R-165.61 and the re-lay (B1) own that.

## 0b. Rulings to keep (R-165.62, the lead, 11-09 / 11-11)
- **The help ladder (src/game/helpLadder.ts) is the ONE place that decides help in 1-1.** Put-backs counted per piece (the piece at the x
  of the fall, meta.pieces); reset by standing past the piece (one compare a grounded frame) or the stage ending; never by a pause, time,
  a refused offer or a step given. Easy 3 move line / 5 pad tap = full jump / 8 steps grow; Normal 3 move line / 12 offer, re-ask 8
  after a no, never after a second no; a yes grows Easy's steps. Off on every other stage (`this.help` null) until help.md §5 passes.
- **The step (the lead's ruling 11-11, after the Critic's find; "height = rise - 60" made 118 px walls at mushrooms):** read the piece's
  walking surface (`skyline`: no catch pieces (the builder's `catch` mark), no piece wholly under a floating one, ground kept under a
  resting stump, mushrooms are road). Every rise over 60 is a STAIR of rocks on the ground, faces spread evenly and all 60 or less,
  treads 80 (top 160 where it fits), top within 60 of the lip; never over air or a floating log; a mushroom whose bounce alone
  (BOUNCE_ALONE, 80% of bounceV^2/2g) reaches the lip grows nothing. No room for a whole stair: nothing grows (counted by the sweep).
  A plank (marked `plank`, may float) only in a gap the last <=60 jump can't clear. Added only through `engine.addStep()`, which copies
  `platforms`/`drawPlats`/`paintedPlats` (platforms starts as the stage object's own array: never push into it). Cleared in `stop()`.
  Gates: helpLadderSweep.test.ts (138 seeds x 2: no rock in the air, no face over 60), helpLadderPieces.test.ts (plain jumps after).
- **Dot's ladder lines are struggle help that is due now** (`helpGuideLine`: kind struggle, `soon`), queued by DotGuide.tsx engineLine
  through `pushHelpLine`, which first clears the stage's own engine teach tips. On Help and Tips; never on Quiet (the step and the offer
  still happen there). Her tip rules dropped them before (a move already taught; Tips' 30 s gap).
- **One step sprite** (`STEP_CUT`, the mossy rock), and the offer's YES picture draws it (the story keeper). A ladder line comes down
  8 s of play after it is said (`LINE_UP_S`; her clock holds while he blinks) and as the offer opens; nothing is said after a no.
- **The offer pauses the stage** (`helpAsking`: update() returns, resume() keeps it still) and waits until the set-back's iris is open
  and he stands (`helpDue`): asked over the closed iris, the stage behind it was black. Back and Escape are a no (HelpOffer bindBack).
- In 1-1 StuckWatch never speaks ("Too tall" breaks story guard 1) and "No soft moss up here!" is marked heard at load (it comes from
  w1.ts's `hint.1-1.noMoss` sockets, not mixer/stages.ts, whose line is also gone).

## 1. What's open (each has an R-id on reference/ROADMAP.md or a note)

| What | State | Where |
|---|---|---|
| R-165.86 (A1) on `t-engine-putback` | Passed; ships with A2 | REPORT.md on that branch; reference/qa-reports/R-165.86/ |
| R-165.62 (A2) on `t-engine-help` | Built; waits on the story keeper (lines and pictures in qa-reports/R-165.62/) and the Critic | REPORT.md on the branch |
| Help past 1-1 (failures counted through lives and game overs, the extra-lives offer made one system with the ladder) | BLOCKED on the Designer's help.md §5; assist.ts and GameOverCard.tsx untouched | PACKETS.md E2 |
| The ghost that shows the move; help.md §2's seconds triggers | Cut from test link A; later packets | help.md |
| The window's repeating "Flick up and forward to jump." | Not reproduced in 4 flights on A1+A2 (said at most once: the coach's jump step); no file edited | REPORT.md |
| Rises with no room for a whole stair grow nothing (228 Easy / 253 Normal over 138 seeds' pieces) | Open: the lead's call (planks?) | REPORT.md |
| The harness's `died` in 1-1 on Normal | OPEN. RealPlay notes a fall through its loseLife stub; in 1-1 a fall is now a set-back on both settings (as it always was on Easy), so `died` stays false there. Tools that read it on 1-1 (realReach, plainWalk, firsttimer, tools/validate/play.ts) see a set-back, not a death. RealPlay should note set-backs too (realPlay.ts was not mine to write) | REPORT.md Suggestions |
| The set-back under a rise lands on the low catch branch when he touched it on the way down (the last ledge he stood on) | As Easy has always done; from it he steps back up to the take-off log. Watch it in the A2 work | engine.ts softAt |
| Main JS chunk headroom (R-165.103, R-165.112): React, react-dom and scheduler in a static 'vendor' chunk; each proven seed list in its own lazy chunk; `tools/perf/chunkcheck.mjs` holds every JS chunk to 3,994,304 B | On t-engine-seedchunks: main 3,957,009 B (37,295 B under the gate), whatever the lists hold. What grows main now is code and inline data, not seeds. OPEN: gen2/seeds.ts (the curated rolls, 244 KB of source, imported by gen2/game.ts) is still in main: the same move would free it (reference/qa-reports/0.9.5/lazy-seeds.py is the old, now stale, contingency) | reference/qa-reports/R-165.112/ |
| Branch share of thin landings at most 30% a roll (the designer's Round 11) | OPEN. 0.9.5 shipped without it by the lead's ruling (A), because Matt played the same mix on 11-05. The 138 listed rolls read median 48%, worst 65% (branch / solids 30 px tall or less, both settings). `floorRoll.catchStyles ['log','branch']` is NOT in the w1 kit. On seeds 1-40 it alone left 15 of 22 rolls over by that count. The planner counts pieces up to 60 px; agree ONE measure first | R-165.46 |
| **1-1 after E0a: every roll is refused until C1's re-lay** | The 138 listed seeds are all refused (band.out, block.lesser-passes, teach.double-no-gap-after on every one; see REPORT.md). Play's 1-1 throws on this branch alone: never merge E0 without C1 | R-165.72 |
| 1-1's proven list: 355 seeds (11-11, R-165.112; over the 300 target `SEED_LIST_TARGET`); the floor `SEED_LIST_MIN` is still 100 | OPEN: put SEED_LIST_MIN back to 300 (the Designer's number, the lead's call). More seeds cost nothing in main now: sweep past 90000 and add them `--in-order`. The suite's whole-list tests (helpLadderSweep, w1.relay) grow with the list: sample them before the list reaches thousands | R-165.47 |
| Soft floors under the 6 floorless spots | Not in 0.9.5 (the planner's; the lead's ruling: next week). The list filter (`floorlessGaps`) keeps unmarked floorless rolls out meanwhile, and it stays in permanently | gen2/promises11.ts |
| The double TEST band 205-228 px and Easy's twin versions | Held. Every double gap is laid in the TEACH band 195-203 (`DOUBLE_TEACH`), because a level double reaches 204 px on some budgets. The test band waits on per-version Easy twins (rise 110-114 px) | w1.ts `DOUBLE_TEACH`/`DOUBLE_TEST` |
| funcheck findings that held 0.9.5 from going live | Logged by the lead after the merge | R-165.48-.51 |
| Round 10 patch (quiet arrival / sunlit log / last step up: the walk-on 100-130 px) | Not applied. #15 needs an honest `exitDy` with it; re-check it applies (w1.ts moved since) | reference/qa-reports/engine-core/held/round10-walk-on.patch |
| #44 version a becomes `d d b d` | Not done | w1.ts |
| The kit's `squirrels()` decor sockets | Dead data: the pipeline fills only the bootprint decor. The real squirrels come from `w1Squirrels`. Delete the sockets when a list rebuild is planned anyway (removing them may move rolls) | w1.ts ~:120 |
| 4-9 layout 4's dead log stair (ids 86-89) under its branch bridge; 1-3 Easy dressing behind step branches; 6-1 and 8-1 platforms inside the HUD band | Live defects, open | reference/qa-reports/engine-core/NEXT.md |
| The art inventory (R-165.104 C, 11-11): `src/game/art/inventory.ts` + `inventory/w1..w10.json` (each world's level art, 120-230 KB, about 24 KB gzipped) and `inventory/cast.json` (characters, enemies, pickups, UI, backdrops: 1.7 MB, never needed at a stage build). Each is its own lazy chunk: `loadInventory(world)` or `loadInventory('cast')`. Not wired into any stage yet: C2 does that. Regenerate with `python3 tools/art/catalog_master.py --emit` after every `--merge`; never hand-edit. Queries: byId, byWorld (made things never W1 unless includeMade), bySlot (slot keys, not the csv's prose), gaps (ask world N's file) | Built, not wired | src/game/art/ |
| CoachOverlay (old 1-1) still shows coach.jump's old words and the cut coach.nice | Open (the planner's note) | reference/notes/planner-status.md |

`reference/qa-reports/engine-core/NEXT.md` is the 11-05 queue. Some of it is done since (ownLook and the art swap, the double tags via
gapPx/blocks, `stage.ts --roll` fail-closed). Read it for the open findings at its foot, not as a to-do list.

## 2. Where each thing lives

**Play path (1-1 is gen2)**
- `src/game/stageGenerator.ts` (~:2888):
  - for 1-1, every pick but 'old' builds `w1Finish(buildPlayStage(config, w1World(), seed, difficulty))`;
  - H1 (hearts follow risk) and the Easy goal are applied there.
- `src/game/gen2/seedList.ts`:
  - `buildPlayStage` replays a proven plan, else falls back to `provenGen2Stage`;
  - also holds `provenSeeds`, `provenSeedFor`, `seedListBreaches` (what `--check` runs), `packPlan`, `SEED_LIST_MIN`, `SEED_LIST_TARGET`, `QUIET_MAX` (4 s, binding).
- `src/game/gen2/proven/seeds-<stage>.ts` and `src/game/gen2/provenIndex.ts`: GENERATED (tools/engine/seedlist.ts through seedlistFile.ts), never edit by hand. The list file: each seed with its packed plan, quiet and outro. The index: count, version, loader (section 0d).
- `src/game/testlink1_1.ts`:
  - `pick11()` returns 'play' | 'old' | 'A' | 'B' | 'C';
  - `newPlay11` / `peekPlay11` / `play11Seed` / `clearPlay11`;
  - a per-device shuffled order in localStorage `sloth_play11_order`;
  - `pickerOn()` needs a QA build and `?pick11`.
- `src/game/testlink1_1.json`: Rolls A/B/C, QA-only seed pins (172, 15458, 26525). Each MUST be on the proven list; re-pin from the list whenever it is rebuilt.
- `src/game/buildAhead.ts` with `stageGenerator.buildAhead` / `aheadKeys`: builds the next stage ahead while the map is open. `WorldMap.tsx` schedules it (deps `[pickedOpen, picked?.id]`), and `App.tsx` too.
- `engine.ts`:
  - the recorder moments 'gen2' (stage, seed, setting) and 'launch' (sheets, timer, build, ready, total);
  - heartFall's soft branch: a `heartFalls` zone with `soft` calls `softFall`, with no heart lost;
  - `softOn` (set where the stage loads): the whole-stage soft fall. On for a stage whose brief says `softFalls` (1-1, both settings), and on Easy for hand-built and old-generator stages. `softAt` is the last still ground he stood on (solid, 60 px or wider, not a narrow piece he fell onto); `softFall` sets him back 150 px or half the ledge clear of the edge, cuts the camera once behind the iris and records `softFall`.

**World 1's kit and finish (`src/game/gen2/worlds/w1.ts`)**
- Section data: HARVEST + W1_NEW. Round 12 sections map to their bases through `R6_BASE`, so JOBS/CONTENT/TERRAIN fall back to the base's.
- `w1Finish`:
  - `ownLook` on every piece;
  - the cut-art swap (`Platform.cut` from `w1CutArt.ts`; a stone or stump only where ground meets its foot);
  - then `w1Squirrels`.
- `w1Squirrels`:
  - at least `SQUIRREL_MIN` = 3 from w1-new, poses shuffled by the seed;
  - one on the spawn's ground, one per rest bank, the rest of the minimum on the spawn's ground;
  - a spot must be the top of a bank (90 px or deeper), with nothing solid in the squirrel's box and no pickup, flag, hint or exit within 70 px;
  - it THROWS when too few fit, and only runs on a built roll (`st.gen2`).
- `src/game/gen2/promises11.ts`: `PROMISES_11` (the one registry), `floorlessGaps`, `doubleGap` / `doubleAfterTeach` (on the flown
  arcs: one jump at its best fails, a double flick from 70 px crosses), `promiseBreaches11(st, setting)`.
- `src/game/gen2/reach.ts`: FLOWN_ARCS, APEX, BANDS (+ BAND_SOURCE), SPARE, TAKEOFF; `linkArcs` (what a player can do, the flick),
  `lesserArcs` (the lesser move at its best, hold / any timing), `gapEnvelope` / `riseEnvelope` / `bounceLipOverCap` (the lay on 1-1).
- `src/game/gen2/verdicts.ts`: `classify` (a laid jump -> SectionKind), `askVerdicts`, `dropVerdicts`, `untypedVerdicts`,
  `firstRunVerdicts`, `judgeRoll`, `NOT_JUDGED_ALL`. Types: `verdicts.types.ts` (the Architect's, frozen: byte-identical to c4687177).
- pipeline.ts: `gapFor` / `riseCap` (1-1 reads reach.ts; others maxGap / riseLimit), `LocalAsk` -> `Laid.asks` (each laid jump's
  take-off, landing and move, kept in a WeakMap, not on gen2), `dropsOf` (a Drop per fall: ends from the engine's rule, look from what is
  drawn), `judged11`, `applyVerdicts`; `blockBreaches(laid, platforms, arcsOf?)` uses the flown lesser move on 1-1.

**Tools**
- `tools/engine/seedlist.ts 1-1 [--count N]` writes the list. Every kept seed passes all of these:
  - no gen2.errors on both settings;
  - the promises;
  - squirrels on both settings;
  - the quiet line.
- `--check` is what CI runs. It re-checks every listed seed (promises, quiet, squirrels, flags before hard nodes via `seedListBreaches`).
- PARALLEL BUILD (use it, single-process is about 40 min per 100):
  ```
  for i in 0 1 2 3; do npx tsx tools/engine/seedlist.ts 1-1 --count 400 --worker $i/4 --from 1 --to 90000 --part $S/p$i.json & done; wait
  npx tsx tools/engine/seedlist.ts 1-1 --count 300 --merge $S/p0.json,$S/p1.json,$S/p2.json,$S/p3.json
  npx tsx tools/engine/seedlist.ts 1-1 --check
  ```
  `--merge` re-lays every seed through the CURRENT code's filters. After any engine or kit change, re-merge the old parts instead of rebuilding from scratch: only the failures drop.
- `tools/engine/lockall.ts --layouts 16 [--stages ...] --check <main-lock.json>`: every stage's layouts against a saved lock. Take the base lock from main BEFORE you change anything. "N/102 unchanged" names each changed stage and its fields.
- `tools/engine/stage.ts`: one stage's gates. `--roll A|B|C` is fail-closed: a child without the pick is a FAIL (rollEnv.test).
- `tools/art/packcut.py`: builds the `w1-cut.webp`/`.json` atlas (18 pieces). `w1CutArt.ts` was tester-page's; in the 6-role team it is Engine's (draw code), with the art from Content.
- `src/game/artUse.allow.json`: art that is packed but not drawn. It only shrinks. When you start drawing a piece, take it off (artUse.test tells you which).

**Reports**
- `reference/qa-reports/engine-core/`:
  - `squirrels/`: stills, 2 rolls, upright and sideways;
  - `art-swap/`;
  - `bootprint/`;
  - `soft-gap/`;
  - `live-dips-to-judge.txt`;
  - `NEXT.md`.

**Help ladder (R-165.62)**
- `src/game/helpLadder.ts`: the schedule (RUNGS), the lines (help-lines.md word for word), `HelpLadder`, `stepsFor`, `padFullJump`
  (padControl.ts reads it at both Jump-button calls), `helpGuideLine` / `pushHelpLine` (DotGuide.tsx engineLine).
- engine.ts: built where the stage loads (`this.help`), `helpPutBack` from `softFall()`, `addStep`, `askHelp`/`answerHelp`,
  `helpState()` (tests and stills), `helpAsk` (HelpOffer.tsx, loaded on first ask; tests replace it).
- `src/components/HelpOffer.tsx`: the pop-up and its two pictures. clipcheck reaches it through a NODE_ENV=development build (the
  dev-only `window.__engine` drives real put-backs); startServer fails if the production build carries `__engine`.
- Tests: helpLadder.test.ts (schedule, planted 4/6/9/13), helpLadder11.test.ts (real put-backs, seed 3747, both settings, Quiet),
  helpLadderGuide.test.ts (her bubble), HelpOffer.test.ts. Stills: reference/qa-reports/R-165.62/shoot.mjs.

## 3. Traps I hit (each cost real time)

0. **Timing a stage start from a scripted tap.** The orchestra's ~100 samples load and decode around the intro; a tap that lands while they are still decoding reads 300-900 ms slower. Wait for the resource list to stop growing before the tap, interleave the two builds, and swap their ports: one batch of 10 is not enough (spread about 2 s at CPU x4).
1. **A gate that passes on the wrong build.** The lock, the suite and stills read whatever build you point them at:
   - vite preview served a stale build;
   - `window.__engine` is overwritten in dev (engine.ts ~:833), so scripts need a `typeof` check;
   - a teleport harness skews any timing measure (lesson timings, Dot lines and the struggle line fire on teleports).
   Check the seed and the build in the output, not the exit code.
2. **Seeds proven on old code don't stay proven.** Any change to the kit, pipeline, Dot or flags can break listed seeds (the Dot fix dropped 2 of 100 through the flag check). Run `seedlist --check` after every merge that touches gen2, and re-pin Rolls A/B/C. Roll B's 110867 silently broke V19.
3. **A post-pipeline pass that can throw needs a matching filter in the list builder.** Play calls `w1Finish`; the builder doesn't. I added `dresses()` to the builder and to `--check` so no listed seed can throw in Play. Do the same for any new finish step.
4. **The yield is tiny (about 0.4%).** The default cap (`count x 200` seeds) can't reach 100 at that yield. Use `--from/--to` and workers, and budget the time before promising a count. Measured 11-11 on INT-1-1's code: seeds 1-90000 on 4 workers (`--worker i/4 --count 100000 --from 1 --to 90001 --part pN.json`), 381 kept, 2,660 s a worker with the suite running beside it (45 min).
4a. **The relay test's (b) and (c) are NOT in the list builder** (w1.relay.test.ts: room for help at every rise, put-backs before the need). 26 of the 381 swept seeds fail them and were left out by hand, as C1 left out 25: run the relay test on a candidate list (print every bad line, not its first 10), drop the seeds it names, `--merge --in-order` the rest. Until those two are a filter in the builder (a packet: they live in a test file), every list build repeats this.
5. **Measures need one definition before they're a bar.** The branch share read 48% my way and 24% the planner's way (30 px vs 60 px pieces, and catchStyles on or off). Settle the measure in the spec before anyone filters on it.
6. **Recorded facts in tests go stale when a dependency re-measures.** goalsEasy.test held 5-9's old kid runs after the planner re-measured them; firstTimerBot.test holds the live record. Update a recorded fact with its source commit. Never loosen the assertion (law 22).
7. **Merges with the planner's branch.** We both added `gapPx` to softGap/gDoubleGaps; keep the side with the default (`DOUBLE_TEACH`). `proven/seeds-1-1.ts` and `provenIndex.ts` always conflict: take yours (both files together), then re-merge or rebuild.
8. **Things I wrongly assumed:**
   - `isGen2Stage(1-1)` broke Easy's soft-on; tests read gen2 from the built stage (`!!stage.gen2`) instead.
   - roofedDrop must run on gen2-built stages only (4-9 stays as main).
   - Raising gLogHop made the quiet line worse; the designer's 34-46 stands.
   - Unmirrored stairs made vault pits; mirrored stair tests caused 7-9 s quiet stretches.
   Bisect before blaming a branch.
9. **RealPlay swaps the engine's `loseLife` for a stub** (realPlay.ts ~:141: it only sets `died`). A test that says "no life lost" or "lostLife never written" passes on ANY build unless it deletes the stub first (`delete r.e.loseLife`; softFall11.test.ts `real()`). Its planted run must lose lives.
10. **A layout number is not a seed for 1-1.** `new RealPlay('1-1', n)` plays the n-th listed seed. To fly a named seed: `withPlaySeed(seed, () => new RealPlay('1-1', 1))`. In the browser: put the seed's list index first in localStorage `sloth_play11_order` and call `__play('1-1', index + 1)` (reference/qa-reports/R-165.86/shoot.mjs).
11. **A frozen input can be wrong even after three Critic rounds.** R-165.86's said Easy had no soft falls in 1-1. Measure the claim on origin/main in the real engine before building on it (15 minutes; it changed the red run).
12. **A toy stage hosted in `RealPlay('1-1', ...)` inherits 1-1's rule: every fall is soft.** A toy that needs a deadly pit sets `e.softOn = false` itself (softFall.test.ts) or is hosted elsewhere.
13. **The container restarts.** It killed a final suite mid-run once. Push safe-keeping commits as soon as they're worth keeping; a release still waits for the word.
14. **Shell.** `rm -f $VAR/*` is refused by the safety check: use literal paths or `"${VAR:?}"`. Foreground commands time out at 2 min; long runs go in the background, with an `until grep` wait.
15. **An engine line is not a line on screen.** Dot's guide (DotGuide.tsx -> dotSay.ts -> dotGuideHelp.ts, then GuideQueue's calm
    gaps) re-judges every `guide()` text as a stage tip: a known move is dropped on Tips, Tips waits 30 s between lines, and a move
    tip stays up until the move is done. RealPlay's `said` records what the engine sent, not what she showed: read `.dg-bub-body` in
    the browser before calling a line done.
16. **After steps grow, the walk-off put-back climbs the step.** Drop him from under the next log instead (helpLadder11.test.ts
    putBack).
17. **A held plain jump clears Easy's 114 px chain rises.** Easy has no "before" red for plain jumps; Normal's 140 px rises are the red.
18. **The dev server can fail a lazy import under load** ("Failed to fetch dynamically imported module"). Run one browser job at a time.


15. **The flown bands refuse today's World 1 data, by design.** Before C1, every 1-1 roll fails; a suite test that builds Play's 1-1
   goes red on this branch. Do not loosen a verdict to get green: the content moves (bands.md §5), or it is a pushback.
16. **Read thickness off the laid shape, never `pc.h`** (`thinLaid`): a bank has no `h` and is a block; that bug made every D bank thin
   (attempt 1). Headroom counts solid blocks of 50 px or more over the take-off run and the flight only. A 'double' place inside the single
   band is a single section (`classify`, setting-aware).
17. **w1Pits over-reports falls; read `promises11.realFalls`, never raw findW1Pits, for "can he fall here".** The lead's ruling (11-11),
   both lines and the Critic's (attempt 6): a piece over a slot closes what it covers unless he can get under it (from EITHER lip, its
   underside 48 px or more over that lip's top, or a
   floor inside the slot more than 10 px below it: seed 172's deck over block 146 is a real hole); and an opening narrower than his body
   (BODY_W 32 px) is no drop whatever covers it (seed 323's 23 px). `top` is the LOWER lip.

## 4. Day one, for a fresh engine engineer

- Read `reference/LAWS.md`, `reference/STAGE-RULES.md` and this file first. The checks are in CLAUDE.md, in order. Run the FULL suite before any push that isn't a safe-keeping push.
- Before changing anything that builds stages:
  - save main's lock: `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-main.json` (on main), then on your branch `npx tsx tools/engine/lockall.ts --layouts 16 --intended <stages> --check lock-main.json`;
  - run `npx tsx tools/engine/seedlist.ts 1-1 --check`;
  - afterwards, the lock must say which stages changed and why. Only the stages your task names may change.
- Planted failure first: every new rule gets a test that is red without your change and green with it. Look at the stills yourself, upright and sideways, before you call anything done.
- 1-1's Play is a list of proven seeds: a roll is only as good as the filters the list builder applies. A new player promise belongs in `promises11.ts` (a test) and in `seedListBreaches` (the list), together.
- Give times in ET from `TZ=America/New_York date`. Paste hashes only from git output.
