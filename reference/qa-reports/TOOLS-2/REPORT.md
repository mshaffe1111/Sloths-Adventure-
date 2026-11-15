# TOOLS-2 REPORT: Easy is proven on Easy's stage (R-165.251) + the test link can't over-fill or miss changes (R-165.252)

Branch t-tools-2 = origin/t-tools-1@71859cf9 + merge origin/t-int-9@1c7f6b95 (ae74a9cfb, clean), then the code commits
ba2b1a215 (R-165.251), 35cb88ce5 (R-165.252), 6df8fb585 (R-165.258, the lead's ruling 11-14) and 7a0e13285 (R-165.251, the judge's
half: found by the suite). Code head 7a0e13285. Times from `TZ=America/New_York date`.

## 1. Done-items

### R-165.251: one helper sets every per-setting dial; every build entry builds on its own setting's
- **The helper**: `src/game/settingDials.ts` `applySetting(d)` / `withSetting(d, fn)` (dials put back after, also on a throw) /
  `dialsKey()`. The dial sweep (D19, grep over src/ for every module-level setter, `export function set*`, and every global read of the
  setting): the ONE build-time per-setting dial is the swing (physics `TIMED` via `setTimedSwing`). `difficulty()`/`runDifficulty()`
  are the player's choice, read only by the Engine and InputEngine constructors, buildAhead.ts and the menus; `forgive`, `tideSet`,
  `softOn`, `input.easy`, the help ladder are the engine's own fields made from that choice inside engine.ts, never read by a build.
- **Who calls it** (every tool that builds a stage per setting, listed):
  - the build entries themselves, so no caller can forget: `stageGenerator.generateStage`, `gen2/pipeline.buildGen2Stage`,
    `easyMode.easyStage` (withSetting on their own setting). Through them: **seedlist.ts** (buildGen2Stage), **lockall.ts**
    (generateStage + easyStage), and the other 36 tools that build per setting (grep of tools/ for generateStage/buildGen2Stage/easyStage
    with 'easy'): clockaudit, cp3-check/jumps/lengths/why2, cp4-check/jumps/jumps11, gatereach, legsmap, library, library-judged,
    library13/14/15, libstage, listRules, runs/clean, runs/dump, runs/ft-moments, runs/strand, snapshot, stage, towerFly, towermap,
    towerroll, vaultscan, yield, gen2/curate, inspect/eraRoll, inspect/firsttimer, inspect/petalSpread, inspect/stages, validate/core,
    art/prowl/arena; and the game's own **buildAhead** (the map's 1-1 build at idle had built on whatever the last run left);
  - the judges outside a build: `levelCheck.validateAsJudged` (a gen2 stage on its own setting; callers: tools/inspect/route.ts and
    tests), `tools/engine/listRules.helpRoomBreaches` (seedlist's room-for-help rule), the pipeline's `lianaRelease`/`chainRelease`
    (were hand-rolled save/set/restore, now withSetting);
  - **castBots**: already right, it runs the real engine (castBots -> firsttimer `setDifficulty` -> engine.ts, which now calls
    `applySetting`); **levelCheck**'s flight caches were keyed by the swing already (TOOLS-1's `swingSettingKey`);
  - the engine: engine.ts `applySetting(this.easy ? 'easy' : 'normal')` where it had `setTimedSwing(this.easy)`.
- **The judge's half (7a0e13285), found by the whole suite**: with Easy built on Easy's swing, gen2/game.test.ts:68 and
  w7Game.test.ts:65 went red on 7-9 layout 2 Easy ("exit platform 157 is not reachable" and 61 more): the tests judged it with
  validateStage on the caller's Normal swing (Normal's grab misses Easy's lianas). On the base a phone's 7-9/2 Easy (built and judged on
  Easy's swing) has 0 errors, so the stage is sound and the judge was wrong. `levelCheck.validateStage` now judges a gen2 stage on its own
  budget's setting (withSetting), whoever asks; inside a build the dials are the stage's already. Planted: `validateStage judges a gen2
  stage on its own setting's dials, whatever the caller's (7-9 layout 2, Easy)`: red before, green after. Not done for old-generator
  stages: they carry no setting, so a judge of one must set it (withSetting); I did not audit which tests judge an old-generator Easy
  stage on the wrong swing (the whole suite is green, so none fails on it; a Suggestions packet).
- **A second hole of the same kind, found and fixed**: stageGenerator's layout-pick caches (`variantAttempt`, `known`) were keyed by
  stage and layout only; validateStage flies lianas on the dials, so a process that built Normal first handed Normal's pick to Easy.
  On base: 9-3 layouts 4 and 14, 9-4 layout 12, 10-6 layouts 1, 6 and 10 (fresh-process Easy lock vs in-process). Now keyed by `dialsKey()`.
- **Planted** (src/game/settingDials.test.ts, 13 tests; the red run's output kept in the commit message's numbers):
  - before the change, 10 RED, each for its reason (deepEqual: the build saw the caller's dials): `generateStage builds {1-7, 7-2, 2-1}
    {easy, normal} on its own dials while the caller's stand at the other (a tool's)` (6), `easyStage makes a stage gentler on Easy's
    dials while the caller's stand at Normal`, `buildGen2Stage (the seed list's own build) judges 1-7 {easy, normal} on its own dials`
    (2), `ONE helper sets the dials: no setTimedSwing call outside settingDials.ts` (named engine.ts:985, gen2/pipeline.ts:248 and :274,
    tools/art/prowl/arena.ts:12);
  - `Easy built after Normal in one process is the Easy a fresh phone builds (10-6 layout 1)` (two child processes): RED with the old
    cache key planted back, GREEN with dialsKey;
  - GREEN before and after (guards): `the helper sets the swing for each setting and puts the caller's dials back`, `the stage a tool
    builds for Easy (lockall, its dials at Normal) is the one the engine builds` (1-7 layout 3).
  - After: 13/13 GREEN.
- **The Easy lists and locks, re-run** (base = ae74a9cfb before the change; scripts in the report's Method used):

| Stage | Easy list (every proven seed, seedlist's own build: parts + verdicts + errors) | Easy lock (16 layouts) | Normal lock |
|---|---|---|---|
| 1-1 (162 seeds) | unchanged (324 builds identical, swing at Normal vs Easy, and after the fix) | unchanged | unchanged |
| 1-2 (100) | unchanged | unchanged | unchanged |
| 1-3 (100) | unchanged | unchanged | unchanged |
| 1-4 (100) | unchanged | unchanged | unchanged |
| 1-5 (150) | unchanged | unchanged | unchanged |
| 1-7 (100) | unchanged | unchanged | unchanged |
| 1-6 (t-build-16@498f8d61 + TOOLS-1's f3312155c + this fix, in a worktree; NOT relisted: ENG-16G owns it) | **CHANGED: Easy 100/100 seeds** (stage parts; verdicts and errors identical), Normal 0/100 | (not on this base) | 0/100 seeds |
| the other 95 stages | (no list) | 21 CHANGED to the phone's Easy (below); 74 unchanged | unchanged |

  So no listed stage's list moved, none was rebuilt, and the "seedlist --check for every stage whose list moved" set is empty; the
  checks were run anyway (gate lines). The lock on head (35cb88ce5 code): **Normal 102/102 unchanged; Easy equals a FRESH phone's Easy
  on 102/102 stages x 16 layouts** (base run with the swing set before each build, one setting per process, as a phone's first load).
  The 21 Easy stages today's tools had built wrong (layouts of 16 that differed): 3-8 16 (proto.thorns only), 4-4 10, 5-4 13, 6-1 16,
  6-3 16, 6-6 16, 6-7 16, 6-8 16, 7-5 16, 7-9 15, 8-3 16, 8-4 16, 8-5 16, 9-3 14, 9-4 4, 9-5 4, 9-9 1, 10-1 4, 10-3 8, 10-6 15,
  10-7 2. Their Easy lock changes are intended (lockall --intended these 21 against an old lock); no phone gets a different stage:
  the engine path is unchanged by construction (it set the dials already) and the lock proves it.

### R-165.258 (the lead's ruling 11-14): 8-5's Easy lost its tayra on Easy's swing; fixed where it lives, for every stage
- **Found by this packet's own fix**: the suite went red at src/game/easyMode.test.ts:61 "8-5: keeps a tayra". Proven on the untouched
  base ae74a9cfb: 8-5's designed layout built on Easy's swing (as the engine builds it) has no animal; on Normal's swing (as the tests and
  tools built it) it has its one tayra. So phones' 8-5 Easy had already lost it; the test passed only because it built the wrong stage.
- **Root cause** (src/game/gen2/pipeline.ts buildRolled): an Easy gen2 build that is not a replay builds Normal's plan first
  (`buildRolled({ ...req, difficulty: 'normal' })`, its repairs, swaps and length loop) and lays Easy from that plan with Normal's kept
  animals. That inner Normal build, its verdicts (applyVerdicts) and the caller's rule ran on the CALLER's dials: a phone's are Easy's.
  On Easy's swing Normal's search swapped a swing section to a later slot (8-5: w8s-swing-climb after the rests), and the animal Normal
  keeps there did not survive into Easy's lay. The pair: Normal's own search checks "Easy lays this plan cleanly" (RT-ENGINE #4), and that
  check ran on Normal's swing.
- **Fix**: every lay and check runs on its own setting's dials (withSetting): buildRolled on its request's setting, applyVerdicts on its
  request's setting, Normal's rule inside an Easy build on Normal's, and inside Normal's loop the Easy lay check and Easy's rule on Easy's.
  8-5 now: Normal tayra, Easy tayra, Easy's plan = Normal's.
- **Planted** (src/game/settingDials.test.ts): `8-5 lays its tayra on Easy as on Normal, built as a phone builds each` and `8-5 Easy
  lays Normal's plan and only Normal's kinds of animal, whatever the caller's dials (layouts 1-2)`: RED on the pipeline before (the
  R-165.251 commit's), GREEN now; the same test on 6-1, 7-5 and 8-3: green before and after (guards: their Easy moved, their plan did
  not). easyMode.test.ts:61 untouched: GREEN on the head (suite line).
- **Lock list** (every stage whose build now changes, against the base): lockall --layouts 16 on code head 6df8fb585 against the base's two locks.
  **Normal: 102/102 unchanged** (Normal's search checking Easy's lay on Easy's swing changed no Normal plan in 16 layouts). **Easy, against
  a fresh phone's Easy today, 8 stages change** (layouts of 16): 6-1 12, 6-3 5, 6-6 6, 6-7 5, 7-5 7 (its gen2 record only), 7-9 9, 8-3 5,
  8-5 14; the other 94 unchanged. Against today's tools: the same 21 as R-165.251. World 1 lists: 1424 of 1424 builds still identical.
  These 8 are the intended change: each Easy now lays Normal's real plan : over the 8 stages x 16 layouts (128
  Easy builds, the dials set as a phone sets them), a phone's Easy today lays another plan than Normal on 14 and drops a kind of animal
  Normal has on 7 (6-3/4 frog, 6-7/3, 6-7/8, 6-7/9 frog, 6-7/11 ocelot, 8-3/7 ocelot, 8-5/1 tayra); with the fix, 0 plans differ and
  4 kinds are dropped, the same four frogs as before (6-3/4, 6-7/3, 6-7/8, 6-7/9): not the swing's doing (identical before and after),
  named in Unresolved. Easy's build errors: 0 of 128 both ways.

### R-165.252: the test link refuses an over-full build before publish and maps against the last PUBLISHED build
- tools/testlink/build.py: prints `test link: N files (limit 480)` and exits 1 with `FAIL: N files, over the 480 limit` above
  MAX_FILES 480, BEFORE any map: the old filesmap.json is deleted at the start, no new map or work-index.html is written.
- The map diffs against `tools/testlink/dist-published`, which only `python3 tools/testlink/build.py --published` refreshes (a copy of
  dist, run after a successful publish), never the last local build; dist-prev is gone. No dist-published (a fresh machine): every file
  is new, none removed, with the old instruction to null the live paths first. dist-published/ and dist-prev/ are git-ignored.
- Its own test, tools/testlink/build.test.ts (python3 runs build.py's whole main() on a folder of the test's own, vite stood in):
  `a build over 480 files fails before publish, prints its count and leaves no map or page to publish` (523 files),
  `a build of 480 files passes and prints its count`, `the map is against the last PUBLISHED build, not a pre-build that was never
  published (D72)`, `--published refuses when there is no build to mark`. With the old rules planted back in a copy (no cap; map against
  the last local build): 2 of 4 RED (the 523 and D72 tests); now 4/4 GREEN. Added to gates.yml's tools-test line (ciTests passes).

## Gate lines (head 35cb88ce5 code; LAWS 5, src/ touched, so everything this packet names)
- tsc `npx tsc --noEmit -p .`: exit 0.
- Whole suite (CLAUDE.md glob, 3 shards side by side): PENDING
- Engine tool tests (gates.yml's two lines): PENDING
- seedlist --check: PENDING
- roadmapcheck: PASS (after `git fetch --unshallow`: the container's clone was shallow and the gate says so). knowncheck: PASS.
  generalitycheck: PASS (26 literals, 26 known). src/game/ciTests.test.ts: 3/3.
- Not run (not named by the packet; integration runs them before any link): the vite build, chunkcheck, artcheck, drawcheck, clipcheck, kbdcheck, buildcheck.

## 2. Polish check
No screen changed: Normal 102/102 and Easy 102/102 (fresh phone) are identical before and after, so there is no still to judge. The
one player-facing path touched, the map's build-ahead of 1-1, builds the same 1-1 (its Easy builds identical on either swing).

## 3. Pushback
- The packet's model was "every tool calls the helper before it builds". That leaves the next tool free to forget (it is how this
  happened). The build entries set their own setting's dials instead, so every caller is right by construction, and the helper's test
  fails on a hand-set swing anywhere. Tools still use withSetting for judging outside a build.
- On this base no World 1 list was of the wrong stage; the wrong Easy builds were the 21 stages above (Worlds 3-10, no lists) and
  t-build-16's 1-6 (TOOLS-1's 3/3).

## 4. Suggestions (ready packets)
- (Done, not suggested: Easy's Normal sub-build on Normal's dials became R-165.258 on the lead's ruling, above.)
- **ENGINE (lockall runs each setting in its own process)**: objective: the lock IS a fresh phone's on both settings, so an order leak
  between settings shows as a lock change. Files: tools/engine/lockall.ts (spawn one child per setting, as castBots does). Done: a planted
  order leak (a cache keyed without the dials) changes the lock; today's lock unchanged.
- **ENGINE (physics chainCache)**: its key leaves out each liana's own swingPeriod (TOOLS-1's note); keyed by the dials now, it is still
  wrong the day a liana's period differs from its setting's. Done: key it as levelCheck chainLines does; a planted pair differing only in period.
- **LEAD (t-build-16 merge)**: t-build-16's pipeline.ts:329 hand-sets the swing a third time (ENG-16E's forward-end check); the
  one-helper test will name it at merge: the conversion is the 10-line withSetting form (done in my t-build-16 worktree for the 1-6 diff).
- **LEAD (HANDOFF §6, PM.md "EnK5 rebuild", release.md)**: add step "after the publish succeeds: `python3 tools/testlink/build.py
  --published`". Without it every map is a fresh-machine map.

## 5. Unresolved
- **1-6's Easy list** proves stages no phone builds (all 100 seeds' Easy parts change once this branch and f3312155c are under it).
  Not relisted, by the packet (ENG-16G owns it). Without f3312155c on t-build-16, the now-correct Easy flights leak into Normal through
  levelCheck's unkeyed FLIGHTS cache (2/100 Normal seeds, 56 and 62, moved in one process; each built alone is unchanged).
- **Four rolled layouts drop Normal's only frog on Easy** (6-3 layout 4; 6-7 layouts 3, 8, 9), the same before and after this fix:
  Easy's own thinning, not the swing. easyMode.test.ts checks "keeps every kind" on designed layouts only. Needs a number and the
  Designer's word on whether the rule holds for rolled layouts.
- The base runs (lock, lists) were scratch scripts (scratchpad), not committed tools: the method update below proposes making lockall
  run each setting in its own process so its lock IS a fresh phone's.

## 6. Method used / Lessons applied / Method update
- Method used: reference/roles/ENGINE.md "Day one" (lock before, lock after, the stages named), reference/methods/seed-list.md (the
  --check; no rebuild needed), stage-fix.md's lock step. Base runs in a worktree of ae74a9cfb (git worktree, scratchpad) so edits could
  not reach a running base process: lockall as is (the tools' way), lockall with the swing set before each build (the engine's way), and
  that again with ONLY Easy in a fresh process (a phone's first load); a per-seed script building each listed seed as seedlist.ts does
  (buildGen2Stage with the row's kit and quietJudge) hashing parts, verdicts and errors, with the swing at Normal, at the build's setting,
  and as the code sets it after the fix. lockall strips verdicts, so the per-seed run is what proves the lists.
- Lessons applied: D19 (the gate calls the same code the screen calls: the entries set the dials, so lockall/seedlist ARE the engine's
  build), R-165.244/TOOLS-1's cache lesson (any cache of a dial-dependent answer keys the dial: found the layout-pick caches), D24/D7
  (grep the whole tree: the setter sweep, 38 tools listed), D29 (roll-pinned tests: no list rebuilt, the whole suite run), D30 (times from
  date), D36 (worktrees, not checkouts; ls-remote after push), D53 (fast gates before push), D57 (queue read at every push), D67 (no
  shell wait loops: background waits only), D72 (the build.py fix and its test reproduce link #3's sequence).
- Method update (proposed): seed-list.md / gates.md: "a list's proof is only of the phone's stage if the build sets its own dials:
  settingDials.ts; a new per-setting dial goes there". stage-fix.md "Day one": the lock to compare an Easy change against is a FRESH
  process per setting (ONLY=easy), not lockall's one process, until lockall itself runs settings apart.

## 7. Turnover note
reference/handoffs/engine-core.md section 0zb (TOOLS-2), commit PENDING.

## Learned
- A tool that builds "the same stage" can only prove the phone's stage if the build sets every global its answer reads; make the build
  set them itself (the callee), never trust each caller to (that is how 38 tools, every test and the map's build-ahead drifted).
- Fixing a D19 hole uncovers the defects it hid: the suite went red on a real 8-5 Easy defect players already had. Expect it and run the
  suite before calling the fix done.
- A cache of a dial-dependent answer needs the dial in its key: three such caches turned up today (layout picks here, FLIGHTS on
  t-build-16 without f3312155c, physics chainCache without each liana's own period, TOOLS-1's note). A "built after the other setting in
  one process == built alone" test catches the whole class.
- lockall strips verdicts and builds Normal before Easy in one process, so it can neither see a list's verdicts nor an order leak:
  compare per seed (parts + verdicts + errors) and against a fresh process per setting.

## EXACT NEXT STEP
1. Lead: integrate t-tools-2 (code head 6df8fb585). Its intended lock changes, Easy only: against an old lock (built with today's
   tools) the 21 stages in R-165.251's table; against a fresh phone's Easy, the 8 in R-165.258's (6-1 6-3 6-6 6-7 7-5 7-9 8-3 8-5).
   Normal: none. Lists: none moved.
2. **t-build-16 merge notes (the 1-6 engine member merges this branch at its start)**: (a) t-build-16 does NOT have TOOLS-1's
   f3312155c (levelCheck FLIGHTS keyed by swingSettingKey): take it with this branch, or the now-correct Easy flights leak into Normal
   (1-6 Normal seeds 56 and 62 move in one process); (b) t-build-16's src/game/gen2/pipeline.ts:329 hand-sets the swing (ENG-16E's
   forward-end check): settingDials.test.ts's one-helper test will name it; convert to `r = withSetting(difficulty, () => { ...; return
   forwardEndLands(...) ? 1 : 0; });` (done and run in my t-build-16 worktree). It is not on t-tools-2's base, so not converted here.
   Then relist 1-6 (its Easy changes on 100/100 seeds) and run `seedlist.ts 1-6 --check`.
3. Lead: publish steps (HANDOFF §6, PM.md "EnK5 rebuild", release.md) gain "after the publish succeeds: `python3
   tools/testlink/build.py --published`"; the first map on a machine with no dist-published still needs the live-file cleanup.
4. Numbers for: the four frog layouts (Unresolved), and the Suggestions' packets.
