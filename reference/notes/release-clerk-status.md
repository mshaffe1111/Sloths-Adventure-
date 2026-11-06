# Release clerk status: release-0.9.5 (gen2 1-1 goes live)

Brief: the lead's plan `reference/notes/release-plan-1-1.md` on ccr-23292c36-550qmt. Branch: `release-0.9.5`, cut from origin/main 68b31e665 (0.9.4).
Never from ccr-0d59a91c-oy3imz, the lead branch or engine-spec (D40).

Last update: 4:00 PM ET (shards 2 and 3 in); before that 3:38 PM ET, 2026-11-06 (times from `TZ=America/New_York date`; my 3:30/3:35 stamps were written early, at about 3:20 and 3:29).

## 3:40 PM: engine-chunks
- The lead (3:38 PM): engine-chunks 75472091 PASSES the Law 5 check (rolledFlags, forks11, catchStyles planted both ways; stageVariety
  ruler). It is NOT merged separately: engine-core merges it, re-generates provenSeeds.ts with seedlist.ts, and it arrives in engine-core's
  final commit. I check at the final merge that shard 2's variety red has cleared, and flag it if not.

## 3:38 PM: the lead's answers (3:31 PM message) and what I did
- tester-page, engine-chunks: NOT passed; I wait for the lead's word on each.
- 1-5 stays out (engine-core restores main's 1-5). 4-9 held (engine-core limits roofedDrop to builtOnGen2 stages). The lock must read
  101/102, only 1-1. No new todo (engine-core drops breaking rolls from the proven list). funcheck REBUILT keeps 1-4.
- What's New approved, line 2 now "It’s laid out a little differently every time you play." (draft updated); line 3 the lead's, later.
- **build:store on the trial merge: PASS** ("Store build check passed: dist has no tracking, ads, collector, service worker or outside
  addresses"), 25 s. No file over 4 MiB, BUT **the main JS bundle is 4,168,597 bytes: 25.7 KB under the 4 MiB (4,194,304) limit.** Main's
  is 3,943,385, so engine-core adds about 225 KB. Not a fail today; the next release that adds anything to the bundle breaches it. For the
  lead to route (likely the proven seed plans in gen2/provenSeeds.ts and the mixer, which could load as their own chunk).
- **The old-1-1 deletion, ready:** `reference/qa-reports/0.9.5/old11-delete.patch` (made on the trial merge, engine-core 5e221f9d):
  - deletes Matt's picker (WorldMap.tsx's Old 1-1 / Roll A-C row, worldMap.css's .wm-pick11), the 'old' pick and `skip11Spec`
    (testlink1_1.ts), old 1-1's builder block in protoStage.ts (the "TEST-LINK ONLY, REMOVE BEFORE ANY RELEASE" 1-1 plan), and
    stageGenerator's `pick11() !== 'old'`: 1-1 is gen2, always.
  - keeps Rolls A/B/C as QA seed pins (set only by the tests and stage.ts --roll, in a QA build, never a button): every pick is gen2, so
    it is not a builder switch. Say if you want them gone too (stage11gen2.test.ts and rollEnv.test.ts would move to named proven seeds).
  - proof: tsc PASS; stage11, rollEnv, buildAhead, w1CutArt, gen2/stage11gen2, whatsNew tests: 19 pass, 0 fail, 1 todo (the double-gap
    todo engine-core is removing); `vite build` then no "Old 1-1" or "wm-pick11" in any JS file.
  - **Phase 2, engine-core's (not in the patch):** the mixer's own 1-1 (mixer/stages.ts SPEC_11, built through buildProtoStage(cfg, s,
    '1-1')) is now reached by no player path, but stage11.test.ts, mixer/support.test.ts, propSupport.test.ts, nodePieces(.test).ts and
    tools/engine/{stage,seedlist,snapshot,rulers,probe-order,cp4-jumps11}.ts read it; w1Sections.ts '1-1' is read only through it. New
    replaces old says it goes; it is engine-core's code and tests. Lead: in 0.9.5 or the next?

## 3:35 PM addendum
- The container restarted at about 3:24 PM and killed shards 2 and 3 on the trial merge (shard 1 had finished). Restarted 3:27 PM; I
  then stopped them by mistake at 3:31 PM (I read a 3-branch `git log -1` as engine-core moving; it was engine-chunks) and restarted
  them at 3:33 PM on the same trial (engine-core 5e221f9d, unchanged). Results expected around 4:05 PM.
- engine-chunks is now 75472091 (3 commits past engine-core, it does NOT contain engine-core 5e221f9d's tip; tester-page 17110e7b does).
  Its commit makes `builtOnGen2(cfg)` and has levels.test, stageQuality.test and platformPlan.test judge only the old generator's stages
  (gen2 1-1's flags move to rolledFlags.test, on your 2:37 PM ruling). That narrows three tests' scope: for your Law 5 check when you
  pass engine-chunks (the replacement tests exist and are planted both ways, per its message; I have not verified that yet).

## HEADLINE for the lead (3:30 PM)
1. **engine-core 5e221f9d is NOT ready: 8+ red tests (shard 1 alone: 7 red + 2 todo-masked), listed below with causes.** Shards 2 and 3
   still running (2 red so far).
2. **The lock: 99/102 stages identical to main. Changed: 1-1 (intended), 1-5 (the whole stage), 4-9 (one find, layout 4).**
3. **1-5 must stay out** (my call, for you to confirm): its player text still describes the old stage (R-165.45), its own tests fail (3, two
   of them marked `todo`), and the plan says no other stage changes. Someone (engine-core) has to put main's 1-5 back on the candidate:
   the 1-5 build path, and stagePlan.ts's '1-5' line (engine-core changed it from 'harvest' "The petals go on. Gather more." to
   'relic_hunt' "Follow her marks to the shrine"), and W1's 'marks' count words. Then the lock must show only 1-1 (and 4-9 if you take it).
4. **4-9: you decide.** Layout 4 (Normal and Easy): find `w4_snail` (id 184) moves from x 9355 to x 12075, y 3031 both. Cause: engine-core's
   new `roofedDrop` rule in levelCheck.ts (a drop straight down onto a piece under the road you stand on is not a link), which applies to
   every stage. Most likely a fix (NEXT.md names "4-9 layout 4's dead log stair (ids 86-89) under its branch-bridge road" as a live
   defect), but it is a stage change outside 1-1. Options: take it as `--intended 1-1,4-9` with a still of the new spot, or hold it.
5. **Law 5: engine-core adds 3 `todo` (expected-fail) markers** that main doesn't have: `gen2/stage11gen2.test.ts:62` (gen2 1-1: no gap
   needs the double right after it is taught; the double tags are held), `stage15.test.ts:59` and `:71` (1-5). Main's own 3 todos
   (rollGuard, w4RealReach, w4Runtime) predate this. The 1-5 two go away if 1-5 stays out (the tests go back to main's). The 1-1 one is
   a promise gen2 1-1 doesn't keep: fix it or the lead rules on it; I will not ship a new expected-fail.

## Done
- 2:46 PM: release-0.9.5 cut from origin/main 68b31e66 and pushed.
- 2:47 PM: dependencies installed (`npm install --legacy-peer-deps`, as CI does; package-lock.json not committed, kept out locally).
- 2:50 PM: roadmapcheck on main: **PASS** once main is unshallowed (the "7 fails" are not on main). On engine-core 5e221f9d, 4 fails: 3
  (R-165.36's 0dffc84e and 1dbf26e9 on engine-spec, f54181e6 on engine-critic-spec) pass once every origin branch is fetched (the checker
  accepts a commit on any remote branch; CI's fetch-depth 0 fetches them). 1 is real data: `reference/qa-reports/engine-core/NEXT.md` is
  cited by no R-item. I fix it on the merged branch (cited on R-165.1, engine-core's item), never the checker.
- 2:53 PM: **funcheck's known list re-recorded from main** (R-165.44). A worktree of origin/main 68b31e66 with engine-core's
  `tools/validate/` copied in (every import resolves on main):
  - with engine-core's list: `FAIL (80 worse or new, 1 to lower or delete; 75 known, 1061 stage-layout flags; 58 s)`;
  - `FUNCHECK_WRITE=1 npx tsx tools/validate/funcheck.ts`: `wrote 144 entries`;
  - run again twice: `PASS (144 known, 1872 stage-layout flags, World 1, 16 layouts, Normal and Easy; 54 s)`, the same both times.
  - It goes in with the merge (the file is new to main, so knowncheck treats it as a new list). On the candidate, 1-1's rows will change
    (gen2 1-1): any 1-1 count that rises is a real flag for engine-core, any that falls is lowered in the same commit.
- 3:03 PM: **the main lock recorded**: `npx tsx tools/engine/lockall.ts --layouts 16 --out tools/engine/lockall-main-0.9.4.json` on main
  68b31e66: 3264 builds of 102 stages, no build errors (commit 87e3ac8f). lockall.ts is engine-core's, unchanged (commit on this branch).
- 3:07 PM: the lock re-checked on main against itself: `lock: 102/102 stages unchanged` (deterministic).
- 3:18 PM: the lock on a trial merge (release-0.9.5 + engine-core 5e221f9d, scratch worktree, not pushed): `lock: 99/102 stages unchanged`
  - 1-1: size, platforms, collectibles, spawnY, exitTotemX/Y, checkpoints, heartFalls, gen2, proto.hints/beats/mixDress/dress, waterY, proto.movedPickups
  - 1-5: size, trees, platforms, vines, ropes, enemies, collectibles, spawn, exit, checkpoints, easyGoal, normalGoal, waterSigns, proto.* , waterY, easyToday
  - 4-9: collectibles (layout 4 only, both settings: above)
- Trial merges: engine-core merges cleanly into release-0.9.5; tester-page merges cleanly on top; **engine-chunks conflicts in
  src/game/gen2/provenSeeds.ts** (generated by tools/engine/seedlist.ts: "do not edit by hand"). It needs the seed list re-generated on
  the merged code by its owner, not a hand pick of sides.
- 3:10 PM: release notes draft: `reference/qa-reports/0.9.5/release-notes-draft.md` (version, What's New top entry for your approval,
  the §6 table with what each item needs). package.json not bumped yet.

## Red tests on the trial merge (engine-core 5e221f9d + main), with causes
Shard 1/3 (done, exit 1):
| Test | Failure | Cause / owner |
|---|---|---|
| artUse.test.ts:20 every packed piece and art file is drawn | 8 unused W1 cut pieces: w1-cut.json#w1-boulder-grey-moss, plank-ledge-a/b/c, post-tall-vine, rock-boulder-moss, rock-roots, stump-wide | engine-core: new art packed but not drawn (or the art swap §3.2-3.5 held). Draw them or don't pack them; the allow list may not grow |
| levels.test.ts:52 a flag every ~1500 px (never more than 2300 apart) | `1-1 flag gap 2580` | engine-core: gen2 1-1's checkpoints |
| w1Pits.test.ts:57 the only unmarked floorless gaps outside 1-8 are 1-6's water | `1-1: 11 floorless gaps` | engine-core: gen2 1-1's gaps are not soft pits with steps (or the test must learn gen2's soft pits: the owner's call, with proof, never loosened) |
| requiredMove.test.ts:8 the limited bot stops short on 1-6 without the bounce | `without the bounce: shrine, bounced 1` | engine-core (likely the shared levelCheck/engine change; 1-6 itself is lock-identical, so the bot or engine changed) |
| stage15.test.ts:83 1-5: creaking branches, a seed waits for the glide | `seed 1: a glide seed` | 1-5 (goes away if 1-5 stays out) |
| stage15.test.ts:59, :71 (todo-marked) | `seed 1: a rope`; the fern | 1-5 (same) |
Shard 2/3 (done 3:55 PM, exit 1: 734 tests, 733 pass, 1 fail, 0 todo):
| Test | Failure | Cause / owner |
|---|---|---|
| platformPlan.test.ts:108 the plan meets the variety targets | `1-1: branch is 41% of 51 platforms` | gen2 1-1's look mix. The lead: should clear with engine-chunks (platformPlan judges only old-generator stages, gen2's held by the stageVariety ruler). I re-check at the final merge |

Shard 3/3 (done 3:57 PM, exit 1: 771 tests, 763 pass, 6 fail, 2 todo):
| Test | Failure | Cause / owner |
|---|---|---|
| firstTimerBot.test.ts:176 5-9's Easy goal rests on the kid's runs | `the kid bot or 5-9 changed: re-measure` (runs now include 3 and 7) | engine-core: 5-9 is lock-identical, so the kid bot or the engine changed. Re-measure and set the goal from the new runs, or find what moved the bot |
| stageQuality.test.ts:86 one to three forks | `1-1@null: 0 forks` | gen2 1-1 judged by the old-generator rule: clears with engine-chunks (builtOnGen2; forks11 replaces it) |
| stageQuality.test.ts:186 no long empty corridors | `max 10687` (over every old-generator stage, 1-1 included) | almost surely gen2 1-1 (engine-chunks names "free stretches to 5.6k"): clears with engine-chunks if so; I check which stage at the final merge |
| stageQuality.test.ts:207 checkpoints 900-1900 apart | `1-1: flags 366 px apart` | gen2 1-1: clears with engine-chunks (rolledFlags) |
| stageQuality.test.ts:221 four styles, none over 40% | `1-1: 3 styles` | gen2 1-1: clears with engine-chunks (catchStyles) |
| w1NewArt.test.ts:25 1-1's dressing names pieces the sheet has | `[{"n":"bootprint","x":36695,"b":419}]` | engine-core: gen2 1-1 lays a "bootprint" dressing the 1-1 sheet has no frame for (or the sheet isn't preloaded) |
| todo (red): gen2/stage11gen2.test.ts:62 the double-gap promise | as before | engine-core removes the todo (the lead: breaking rolls leave the proven list) |
| todo (red): w4RealReach.test.ts:26 4-3 | the wall-check todo | on main already, not new |

**What engine-core must fix by 5:00 (if engine-chunks clears its four):** artUse (8 unused W1 cut pieces), levels flag gap (if not
covered by rolledFlags), w1Pits (1-1: 11 floorless gaps), requiredMove (1-6 bounce bot), firstTimerBot 5-9 kid runs, w1NewArt bootprint,
the stage11gen2 todo, and 1-5 back to main (clears stage15's three).

## Old 1-1 path: what is deleted once gen2 1-1 ships (step 6; deleted only after engine-core's final commit)
- testlink1_1.ts: the 'old' and 'A'/'B'/'C' picks, `skip11Spec`, `roll11Seed`, `pickerOn`, testlink1_1.json (Rolls A/B/C); keep only Play's
  seed draw (newPlay11 / peekPlay11 / play11Seed / withPlaySeed / clearPlay11).
- WorldMap.tsx:356-361 (Matt's picker: "Old 1-1", "Roll A/B/C") and worldMap.css:38-42 (.wm-pick11).
- App.tsx:684-685 the dev `__setPick11` hook (used by stage.ts --roll and tools/engine/runs/stills-at.mjs: those tools move to Play seeds).
- stageGenerator.ts:2870-2888: `gen2Roll11` / `roll11` / the `skip11Spec` branch; 1-1 always takes the gen2 path.
- protoStage.ts: the restored old '1-1' plan (from :1489, "copied unchanged from main") and HAND_STAGES '1-1'.
- w1Sections.ts '1-1' (:238) and mixer/stages.ts SPEC_11 '1-1', if nothing else reads them (to check by grep after the final commit;
  gen2/worlds/w1.ts only COPIED old 1-1's sections, it imports none of these).
- Tests that pick rolls: gen2/stage11gen2.test.ts (ROLLS via setPick11) and stage11.test.ts move to Play's proven seeds.
- No Play=gen2 toggle exists outside the QA picker (pick11() is 'play' in every non-QA build).

## Gate table (the candidate): nothing on release-0.9.5 yet; trial-merge numbers in brackets
| # | Gate | Result |
|---|---|---|
| 1 | tsc | NOT RUN on the candidate [trial: PASS, 7 s] |
| 2 | tests, 3 shards | NOT RUN on the candidate [trial: FAIL: shard 1 7 red + 2 todo, shard 2 1 red, shard 3 6 red + 2 todo] |
| 3 | vite build (no asset over 4 MiB) | NOT RUN |
| 4 | npm run build:store | NOT RUN on the candidate [trial: PASS; bundle 4,168,597 B, 25.7 KB under 4 MiB] |
| 5 | artcheck | NOT RUN |
| 6 | knowncheck | NOT RUN |
| 7 | clipcheck | NOT RUN |
| 8 | drawcheck | NOT RUN |
| 9 | roadmapcheck | main PASS; engine-core 1 real fail (NEXT.md citation, fixed at the merge) |
| 10 | funcheck | main re-recorded PASS (144 known); candidate NOT RUN |
| 11 | lockall --check | baseline recorded and deterministic; trial 99/102: 1-1 intended, 1-5 and 4-9 NOT intended yet |

## Questions for the lead
1. Has tester-page passed? Has engine-chunks passed? (I merge each only on your word, here or in STATUS.md. engine-chunks needs its
   provenSeeds.ts re-generated on the merge.)
2. 1-5 stays out: confirm, and name who puts main's 1-5 back (engine-core, I'd say: it's their code).
3. 4-9 layout 4's moved find: take it (intended) or hold it?
4. gen2 1-1's todo'd double-gap test: fixed by 5:00, or your ruling.
5. funcheck's `REBUILT = ['1-1', '1-4']` gates 1-4 on the truer rules, but 1-4 is main's 1-4. Should 1-4 come off? (I did not touch it.)
6. The What's New draft (reference/qa-reports/0.9.5/release-notes-draft.md): approve or rewrite.
