# TOOLS-2 REPORT: Easy is proven on Easy's stage (R-165.251) + the test link can't over-fill or miss changes (R-165.252)

Branch t-tools-2 = origin/t-tools-1@71859cf9 + merge origin/t-int-9@1c7f6b95 (ae74a9cfb, clean), then two commits:
ba2b1a215 (R-165.251) and 35cb88ce5 (R-165.252). Times from `TZ=America/New_York date`.

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
| 1-6 (t-build-16, NOT relisted: ENG-16G owns it) | PENDING | (not on this base's list) | |
| the other 95 stages | (no list) | 21 CHANGED to the phone's Easy (below); 74 unchanged | unchanged |

  So no listed stage's list moved, none was rebuilt, and the "seedlist --check for every stage whose list moved" set is empty; the
  checks were run anyway (gate lines). The lock on head (35cb88ce5 code): **Normal 102/102 unchanged; Easy equals a FRESH phone's Easy
  on 102/102 stages x 16 layouts** (base run with the swing set before each build, one setting per process, as a phone's first load).
  The 21 Easy stages today's tools had built wrong (layouts of 16 that differed): 3-8 16 (proto.thorns only), 4-4 10, 5-4 13, 6-1 16,
  6-3 16, 6-6 16, 6-7 16, 6-8 16, 7-5 16, 7-9 15, 8-3 16, 8-4 16, 8-5 16, 9-3 14, 9-4 4, 9-5 4, 9-9 1, 10-1 4, 10-3 8, 10-6 15,
  10-7 2. Their Easy lock changes are intended (lockall --intended these 21 against an old lock); no phone gets a different stage:
  the engine path is unchanged by construction (it set the dials already) and the lock proves it.

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
- **ENGINE (pipeline, Easy's Normal sub-build)**: inside an Easy gen2 build that is not a replay, `buildRolled({ ...req, difficulty:
  'normal' })` and `applyVerdicts(n, 'normal')` run on Easy's dials (the phone sets Easy before building; the tools now match it). The
  pipeline says "Easy is Normal's stage under Easy's rules"; Normal's plan built on Easy's swing may not be Normal's plan. Objective:
  decide (Designer) whether the sub-build is on Normal's dials; if so, withSetting('normal') around those two calls, then the lock names
  every non-listed gen2 stage whose Easy moves. Files: src/game/gen2/pipeline.ts (~4295). Done: a test that an Easy build's Normal plan
  equals the Normal build's plan for 3 liana stages.
- **LEAD (t-build-16 merge)**: t-build-16's pipeline.ts:329 hand-sets the swing a third time (ENG-16E's forward-end check); the
  one-helper test will name it at merge: the conversion is the 10-line withSetting form (done in my t-build-16 worktree for the 1-6 diff).
- **LEAD (HANDOFF §6, PM.md "EnK5 rebuild", release.md)**: add step "after the publish succeeds: `python3 tools/testlink/build.py
  --published`". Without it every map is a fresh-machine map.

## 5. Unresolved
- PENDING (filled at the end).

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
PENDING

## EXACT NEXT STEP
PENDING
