# Handoff: engine-core (the Engine member's turnover note)

Rewritten at the end of R-165.61 E0a (the verdicts and the flown reach), branch `t-engine-e0a` from `t-engine-putback`@41c2e248 (A1),
not merged: E0 ships with C1's 1-1 re-lay in ONE PR (ADR-001), never alone. E0b (the first-run picker) and C1 build on this branch.

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

## 1. What's open (each has an R-id on reference/ROADMAP.md or a note)

| What | State | Where |
|---|---|---|
| R-165.86 on `t-engine-putback` | Built and tested; waits on the Critic's full suite, drawcheck, clipcheck and the lock (not run here: the lean ruling) | REPORT.md on the branch; reference/qa-reports/R-165.86/ |
| Help after repeated put-backs in one piece (A2) | OPEN, ships with A1: with no life to lose, a player who can't clear a chain is set back again and again | R-165.62 |
| The harness's `died` in 1-1 on Normal | OPEN. RealPlay notes a fall through its loseLife stub; in 1-1 a fall is now a set-back on both settings (as it always was on Easy), so `died` stays false there. Tools that read it on 1-1 (realReach, plainWalk, firsttimer, tools/validate/play.ts) see a set-back, not a death. RealPlay should note set-backs too (realPlay.ts was not mine to write) | REPORT.md Suggestions |
| The set-back under a rise lands on the low catch branch when he touched it on the way down (the last ledge he stood on) | As Easy has always done; from it he steps back up to the take-off log. Watch it in the A2 work | engine.ts softAt |
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

## 3. Traps I hit (each cost real time)

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

15. **The flown bands refuse today's World 1 data, by design.** Before C1, every 1-1 roll fails; a suite test that builds Play's 1-1
   goes red on this branch. Do not loosen a verdict to get green: the content moves (bands.md §5), or it is a pushback.
16. **Read thickness off the laid shape, never `pc.h`** (`thinLaid`): a bank has no `h` and is a block; that bug made every D bank thin
   (attempt 1). Headroom counts solid blocks of 50 px or more over the take-off run and the flight only. A 'double' place inside the single
   band is a single section (`classify`, setting-aware).
17. **w1Pits over-reports falls; read `promises11.realFalls`, never raw findW1Pits, for "can he fall here".** The lead's ruling (11-11):
   a slot closes only where a solid piece lies AT its lip level (top within 10 px of a lip, or plugging it) and has no lower floor inside
   the slot to walk in under it (seed 172's deck over block 146 is a real hole). `top` is the LOWER lip. floor.unmarked: 109 of 138.

## 4. Day one, for a fresh engine engineer

- Read `reference/LAWS.md`, `reference/STAGE-RULES.md` and this file first. The checks are in CLAUDE.md, in order. Run the FULL suite before any push that isn't a safe-keeping push.
- Before changing anything that builds stages:
  - save main's lock: `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-main.json` (on main), then on your branch `npx tsx tools/engine/lockall.ts --layouts 16 --intended <stages> --check lock-main.json`;
  - run `npx tsx tools/engine/seedlist.ts 1-1 --check`;
  - afterwards, the lock must say which stages changed and why. Only the stages your task names may change.
- Planted failure first: every new rule gets a test that is red without your change and green with it. Look at the stills yourself, upright and sideways, before you call anything done.
- 1-1's Play is a list of proven seeds: a roll is only as good as the filters the list builder applies. A new player promise belongs in `promises11.ts` (a test) and in `seedListBreaches` (the list), together.
- Give times in ET from `TZ=America/New_York date`. Paste hashes only from git output.
