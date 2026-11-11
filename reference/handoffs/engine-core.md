# Handoff: engine-core (the Engine member's turnover note)

Rewritten at the end of INT-1-1 (11-11), on its final head: branch `t-int-1-1` = C1's re-laid 1-1 (t-content-c1@0fc0835a, passed,
on E0a d2748131 and A1 41c2e248) + t-content-c1-tests + the vendor split (t-engine-chunks@e67809c3) + the help ladder
(t-engine-help@98186930) fitted to the new layout, with the Critic's two deltas fixed. Not merged: the one PR that ships E0 + C1 + A1 +
A2 (ADR-001). Sections 0a-0b below are still true.

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
| Main JS chunk headroom (R-165.103, 11-11): React, react-dom and scheduler in a static 'vendor' chunk; `tools/perf/chunkcheck.mjs` holds every JS chunk to 3,994,304 B (gates job, after a build) | In review on t-engine-chunks: main 3,944,491 B (49,813 B under the gate; t-engine-e0a's +15 KB fits). OPEN: cold stage start measured +298 ms median at CPU x4 against main (title +117 ms); no cause found (the profiles are canvas-native work, same code). buildcheck alone: this branch 1 PASS / 3 FAIL (p95 129-166 ms), main 3 PASS (123-146 ms, max 159); it runs the dev server, which manualChunks should not touch, unproven. Next room, if needed: more static manualChunks (gen2/seeds.ts 219 KB, story + journal 150 KB), never a dynamic import a stage needs | vite.config.ts `build.rollupOptions.output.manualChunks` |
| Branch share of thin landings at most 30% a roll (the designer's Round 11) | OPEN. 0.9.5 shipped without it by the lead's ruling (A), because Matt played the same mix on 11-05. The 138 listed rolls read median 48%, worst 65% (branch / solids 30 px tall or less, both settings). `floorRoll.catchStyles ['log','branch']` is NOT in the w1 kit. On seeds 1-40 it alone left 15 of 22 rolls over by that count. The planner counts pieces up to 60 px; agree ONE measure first | R-165.46 |
| **1-1 after E0a: every roll is refused until C1's re-lay** | The 138 listed seeds are all refused (band.out, block.lesser-passes, teach.double-no-gap-after on every one; see REPORT.md). Play's 1-1 throws on this branch alone: never merge E0 without C1 | R-165.72 |
| 1-1's proven list: 138 seeds (stale under E0a); the target is 300 (`SEED_LIST_TARGET`), tonight's floor was 100 (`SEED_LIST_MIN`) | OPEN. The yield is about 0.36%, so 300 needs about 85,000 tries: about 1.5 h on 4 workers. Or raise the yield. Then put SEED_LIST_MIN back to 300 | R-165.47 |
| Soft floors under the 6 floorless spots | Not in 0.9.5 (the planner's; the lead's ruling: next week). The list filter (`floorlessGaps`) keeps unmarked floorless rolls out meanwhile, and it stays in permanently | gen2/promises11.ts |
| The double TEST band 205-228 px and Easy's twin versions | Held. Every double gap is laid in the TEACH band 195-203 (`DOUBLE_TEACH`), because a level double reaches 204 px on some budgets. The test band waits on per-version Easy twins (rise 110-114 px) | w1.ts `DOUBLE_TEACH`/`DOUBLE_TEST` |
| funcheck findings that held 0.9.5 from going live | Logged by the lead after the merge | R-165.48-.51 |
| Round 10 patch (quiet arrival / sunlit log / last step up: the walk-on 100-130 px) | Not applied. #15 needs an honest `exitDy` with it; re-check it applies (w1.ts moved since) | reference/qa-reports/engine-core/held/round10-walk-on.patch |
| #44 version a becomes `d d b d` | Not done | w1.ts |
| The kit's `squirrels()` decor sockets | Dead data: the pipeline fills only the bootprint decor. The real squirrels come from `w1Squirrels`. Delete the sockets when a list rebuild is planned anyway (removing them may move rolls) | w1.ts ~:120 |
| 4-9 layout 4's dead log stair (ids 86-89) under its branch bridge; 1-3 Easy dressing behind step branches; 6-1 and 8-1 platforms inside the HUD band | Live defects, open | reference/qa-reports/engine-core/NEXT.md |
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
- `src/game/gen2/provenSeeds.ts`: GENERATED, never edit by hand. Each seed with its packed plan, quiet and outro.
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
4. **The yield is tiny (about 0.35%).** The default cap (`count x 200` seeds) can't reach 100 at that yield. Use `--from/--to` and workers, and budget the time before promising a count.
5. **Measures need one definition before they're a bar.** The branch share read 48% my way and 24% the planner's way (30 px vs 60 px pieces, and catchStyles on or off). Settle the measure in the spec before anyone filters on it.
6. **Recorded facts in tests go stale when a dependency re-measures.** goalsEasy.test held 5-9's old kid runs after the planner re-measured them; firstTimerBot.test holds the live record. Update a recorded fact with its source commit. Never loosen the assertion (law 22).
7. **Merges with the planner's branch.** We both added `gapPx` to softGap/gDoubleGaps; keep the side with the default (`DOUBLE_TEACH`). `provenSeeds.ts` always conflicts: take yours, then re-merge or rebuild.
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
