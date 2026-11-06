# Release clerk status: release-0.9.5 (gen2 1-1 goes live)

Brief: the lead's plan `reference/notes/release-plan-1-1.md` on ccr-23292c36-550qmt. Branch: `release-0.9.5`, cut from origin/main 68b31e665 (0.9.4).
Never from ccr-0d59a91c-oy3imz, the lead branch or engine-spec (D40).

Last update: 6:47 PM ET, 2026-11-06 (times from `TZ=America/New_York date`)

## 5:45 PM: ready for the final (the lead's 5:31 order) + funcheck on the candidate shape
- Order at the final: merge engine-core -> `old11-delete.py` -> vite build, `lazy-seeds.py` only if main JS > 4 MiB -> `release-prep.py`
  -> tsc + seed-list tests -> PUSH, commit written here -> the full gate on that commit.
- New: `reference/qa-reports/0.9.5/release-prep.py` (funknown.json from main's recorded list `funknown-main.json`; R-165.1 cites
  engine-core/NEXT.md; package.json 0.9.5; the What's New entry, line 3 "Dot has new things to say as you climb."). Tried on 387c5484 +
  the deletion: roadmapcheck **PASS**, whatsNew.test 4/4 pass.
- **funcheck on that shape (main's list): FAIL (12 worse or new, 26 to lower or delete; 61 s).** For the lead:
  - gen2 1-1 is judged WORSE than main's 1-1 by the fun gate (1-1 is on the truer rules, REBUILT): "dead walk" 16/16 layouts (main 14;
    e.g. "3.1 s of walking with nothing to do at x 140"), "pacing" Normal 14 (8) and Easy 14 (2) ("no gentle intro: the first 15 s already
    ask for more than 0.8 moves a second"), "nothing bites" Normal 11 (4), Easy 8 (4) ("90% of the beats after the first 30 s cost nothing
    when missed"). Better: "padding" and "template repeat" gone (16 -> 0 both settings), "repeat" Easy 16 -> 8.
  - 1-2 "nothing new" 10 -> 14 both settings (judged against the stage before it, now gen2 1-1); 1-2's "like/looks like the stage
    before" gone.
  - On lock-identical stages: 1-3 Normal "repeat" 11 -> 13, 1-9 Normal "repeat" 12 -> 15, 1-9 Easy "nothing new" 13 -> 16, 1-6 Easy
    "repeat" new (1 layout); and lower counts on 1-6/1-7/1-9. tools/validate is unchanged, so this is the engine's play changing on
    identical stages (the same pattern as requiredMove 1-6 and firstTimerBot 5-9): the planner's checker-only proof should cover it.
  - The gate's rule: worse = FAIL. I will not lower or re-record the list to pass it (Law 5). Rulings needed: is funcheck in this
    release's gate (it is not in gates.yml; the plan lists it as gate 10), and what about gen2 1-1's dead walk / pacing / nothing bites?

## 5:35 PM: engine-core moved to 387c5484 (4:35 PM ET); patches turned into scripts
- engine-core 387c5484 ("0.9.5: the ctest survey's words for the Round 12 sections, and main's 1-5 golden-snake sheet back"). Not in it
  yet: tester-page (now 03757d4e; 4320a9b25 not in engine-core either) and engine-chunks (now 25d2d115). They come with the final.
- Trial re-merged (release-0.9.5 + engine-core 387c5484): merges cleanly; tsc PASS.
- **My .patch files stopped applying** (engine-core changed the same lines: 1-5's keep-out joins `specFor`'s skip, and a new
  `builtOnGen2()` repeats the `pick11() !== 'old'` test). Both are now **scripts that assert every anchor once and fail loudly**, replacing
  the patches (deleted):
  - `reference/qa-reports/0.9.5/old11-delete.py`: 5 files (WorldMap.tsx, worldMap.css, protoStage.ts, stageGenerator.ts incl.
    builtOnGen2, testlink1_1.ts). On 387c5484: applies, tsc PASS, grep for 'old' picks/picker empty. 16 insertions, 91 deletions.
  - `reference/qa-reports/0.9.5/lazy-seeds.py`: 2 files. On 387c5484 + the deletion: applies, tsc PASS.
- **Bundle now (387c5484 + the deletion): main JS 4,155,127 B, 39.2 KB under 4 MiB.** The final adds the Dot fix, the branch line and a
  ~300-seed list; I measure at the merge and apply lazy-seeds.py only if over 4 MiB (the lead's rule).
- Running now on 387c5484 + the deletion (the candidate's shape): the lock check (expect only 1-1) and the 3 shards. Results in the next
  update; they tell engine-core what is still red before the final.

## 5:02 PM: the lead's 5:01 PM rulings
- tester-page PASSES (the lead's look at its stills). It arrives inside engine-core's final; I merge tester-page myself only if the final
  does not contain 4320a9b25 (checked at the merge with `git merge-base --is-ancestor`).
- The lazy-seeds contingency: applied ONLY if the final's main JS is over 4 MiB (4,194,304 B); otherwise a roadmap item with its numbers.
- CoachOverlay.tsx stays in 0.9.5; the pad's two old coach titles are logged for the next release (player text, Matt's words). Same as
  live today, not a regression.

## 4:58 PM: CoachOverlay.tsx (the lead, 4:53 PM) and the gate moved to ~6:30-7:15
- **CoachOverlay.tsx can NOT go with the old-1-1 patch: it is still read by the live game.** It no longer draws anything (no component);
  it holds `COACH_TEXT`, which `components/dot/DotGuide.tsx:46,492-493` reads for Dot's first-stage coach:
  - the coach runs on any stage with id 1-1 (`touchCoach.ts:66 coachWanted`, `engine.ts:1142`), so it runs on gen2 1-1 too: it is not
    part of old 1-1's builder;
  - touch-screen players: Dot says `dotLine('coach.' + step)` (dotLinesData.ts:94-96), not COACH_TEXT; `coach.nice` has no new words
    (cut), so on the touch screen "nice" says nothing;
  - **on-screen pad players: Dot says COACH_TEXT.pad's OLD titles, "Push the pad to run" and "Press Jump"** (DotGuide.tsx:493;
    pad 'nice' is null, so Matt's cut "Nice jump!" is NOT said there either);
  - controlsB4.test.ts:80 also reads COACH_TEXT.pad.nice.sub.
  - So the only old words still on screen are the pad's two coach titles. Fix (owner: the planner or engine-core, the lead's call): give
    the pad its own approved dotLines rows (coach.pad.run / coach.pad.jump) and read those, then delete CoachOverlay.tsx and its test line.
    Not in my patch: it is player text, which needs approved words.
- engine-core's final slips to ~6:15-6:30 (the Dot fix ~5:10, then the list rebuild). My gate: ~6:30-7:15.

## 4:47 PM: the bundle contingency (the lead, 4:31 PM) and Roll B
- **Ready, NOT applied:** `reference/qa-reports/0.9.5/lazy-seeds-contingency.patch` (on top of old11-delete.patch). gen2/seeds.ts (the
  curated rolls, unchanged from main) and gen2/provenSeeds.ts load as their own chunk by a top-level `await import()` in gen2/game.ts and
  gen2/seedList.ts: loaded during start-up, before any stage is built, so Play never waits and no reader changes.
  - main JS 4,168,556 -> 3,892,798 bytes (store build 3,891,595): about 301 KB of headroom. Chunks seeds 219,526 and provenSeeds 44,041
    bytes, both in sw.js's precache. tsc PASS; build:store PASS ("Store build check passed...").
  - Open to the first frame of 1-1 at CPU x4 (tools/perf/firstframes.cjs, 448x998, 3 runs, warm cache): before 18.7 / 11.9 / 10.7 s,
    after 11.5 / 10.6 / 11.5 s (no slower; run-to-run noise ~1 s). Frames over 100 ms in the first 10 s: 42-48 before, 46-49 after (headless,
    no GPU: the same both ways).
  - tests on it (5:05 PM): seeds 2/2, game 12/12, seedList 4/4, buildAhead 2/2, stage11gen2 4 pass + 1 todo (the double-gap todo, the same as
    without the patch): 0 fail. (My first combined run hit its 20-min timeout; re-run one file per process.)
  - Rule (the lead): applied at 6:00 only if the candidate's main JS is over 4 MiB; otherwise a roadmap item with these numbers.
- Rolls A/B/C stay as QA seed pins (approved). Tests pinned to Roll B: rollEnv.test.ts (the pick's plumbing only) and
  gen2/stage11gen2.test.ts (every promise on A, B and C). On the trial (engine-core 5e221f9d) none fails on B but the double-gap todo.
  **engine-core: if Roll B's seed now fails V19, move testlink1_1.json's B (and these tests) to a proven seed.**
- At 6:00: stageQuality's corridor `max 10687` named by stage, with the number (the lead's check against QUIET_MAX 4 s if it is 1-1).

## 4:29 PM: check-in
- engine-core still 5e221f9d (18:56 UTC), so the trial results below stand: nothing re-run. release-0.9.5 is at 45796509 (main + lockall.ts,
  the main lock, the notes); nothing merged into it yet, by design (the final comes at 6:00).
- The lead branch (4b1016c2, 46bc6804) matches my notes: 1-5 out, 4-9 held, no new todo; the planner proves the 1-6/5-9 bot moves are
  checker-only by 4:30 (requiredMove 1-6 and firstTimerBot 5-9 in my red list); soft floors under the floorless spots by 5:30 (w1Pits
  "1-1: 11 floorless gaps").
- Ready for 6:00: the old-1-1 deletion patch, funknown.json from main, the roadmap NEXT.md fix, the What's New entry and the version bump.

## 4:00 PM: the new timetable (the lead, 3:58 PM)
- engine-core's final commit is due 6:00 PM ET (it brings engine-chunks and the planner's bb55a0a7). I run the full gate on the candidate
  6:00-6:45 while the lead builds the test link from the same commit; Matt plays at 7:00. Status here at 4:30 and 5:30.
- build:store on the trial merge: already run, PASS (3:36 PM, below). Re-run on the candidate at 6:00 as gate 4.
- The old-1-1 deletion patch is ready (below); I re-check at 5:30 that it still applies to engine-core's newest commit.

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

## >>> 6:47 PM ET: the fix is PR #64 (fix-0.9.5-pockets 358e9cc6); standing by for the live publish <<<
- PR #64 vs main e92bdcdb: one file, src/game/pitPocket.test.ts (3 insertions, 2 deletions). Run here: `✔ gen2 1-1 Roll B's dip pockets
  are found, each narrow and closed in by higher banks`, `✔ no stage the old generator builds (Worlds 1 to 4) has a pocket`: 2/2 pass.
- The shards CI cancelled hide no other red: my full local suite on bf3684ec (the same code as main e92bdcdb) had exactly one real red,
  this test. So after #64 the publish's test shards should be green.
- APK v0.9.5-32 is on Releases (the lead).
- Standing by until "Publish game to the gh-pages branch" is green on #64's merge; then I stand down.

## >>> 6:45 PM ET: PR #63 merged (main e92bdcdb); the DEPLOY FAILED on pitPocket.test; the live site is still 0.9.4 <<<
- "Publish game to the gh-pages branch" run 42312637467: test (4) FAILED on `not ok 262 - gen2 1-1 Roll B's dip pockets are found (x 3671,
  4070, ...)` (pitPocket.test.ts:21:1, error '2003 2387 5155 6289 10207 13051 14551 15805 16672 24583'): the same red as my local shard 1.
  The other test shards were cancelled; **publish SKIPPED** (the gate held the live site at 0.9.4). gates / gates (artcheck, knowncheck,
  roadmapcheck, clipcheck), gates / drawcheck and gates / rolled (seedlist 1-1 --check, buildcheck) all PASSED in CI.
- The APK build run 42312637346 was still running at the time of writing (it builds from main without the test shards: check whether it
  publishes v0.9.5 to Releases before the site does, and whether that is wanted).
- **Follow-up fix PR needed tonight:** re-pin pitPocket.test.ts:21 to a seed on the final's proven list (or the new Roll B 15458) with that
  seed's real pocket x values, planted (it must fail when isPocket breaks), then re-run the whole suite. Owner: tester-page (its test) or the lead.

## The full gate on bf3684ec (= the merged code), final
| # | Gate | Result |
|---|---|---|
| 1 | tsc | PASS |
| 2 | tests, 3 shards | **FAIL: 1 real red**, pitPocket.test.ts:21 (above). Shard 1 775 / 773 pass / 1 fail / 1 todo (main's); shard 2 863 / 862 / 1 (stageQuality:287 timing under load; PASS alone, a load artefact); shard 3 828 / 827 / 0 / 1 todo (main's). No new todo |
| 3 | vite build, no asset over 4 MiB | PASS (main JS 4,162,883 B) |
| 4 | npm run build:store | PASS |
| 5 | artcheck | PASS |
| 6 | knowncheck | PASS |
| 7 | clipcheck | **PASS** (`PASS (83 known) (257 s)`) |
| 8 | drawcheck | **PASS** (`PASS (366 s)`) |
| 9 | roadmapcheck | PASS |
| 10 | funcheck | FAIL, named and accepted (Matt; the lead 6:20 PM) |
| 11 | lockall --check --intended 1-1 | **PASS** (`lock: 101/102 stages unchanged`, 1-1 intended, exit 0) |

## >>> 6:32 PM ET: GATE RED on bf3684ec (PR #63): pitPocket.test.ts:21 <<<
(This note is on branch release-0.9.5-notes, the lead's 6:32 PM order: nothing more is pushed to release-0.9.5.)
- **RED, a real failure (merge interaction):** `src/game/pitPocket.test.ts:21` "gen2 1-1 Roll B's dip pockets are found (x 3671, 4070, ...)"
  -> `AssertionError: 2003 2387 5155 6289 10207 13051 14551 15805 16672 24583`. tester-page 4320a9b25 pinned the test to Roll B's pockets at
  x 3671 and 4070 with Roll B = seed 110867 (its testlink1_1.json). engine-core's final changed the rolls to A 172, B 15458, C 26525, so Roll
  B is another stage and those pockets don't exist. The pocket code may be fine: the test's pinned x values are stale. Fix (tester-page or
  engine-core): re-pin the test to a seed on the final's proven list (the lead: "any test pinned to Roll B must move to a proven seed"),
  with the pockets that seed really has, and show it still fails when the pocket rule is broken. Then the candidate needs a new commit:
  bf3684ec cannot pass.
- Shards on bf3684ec: shard 1 775 tests, 773 pass, **1 fail (pitPocket)**, 1 todo (w4Runtime, on main already); shard 2 863, 862 pass,
  1 fail (stageQuality:287 timing, p90 613 ms under full CPU load). **Re-run ALONE at 6:33 PM on an idle machine: PASS** (`✔ generating a stage is quick: p90 under 500 ms, none over 1500 ms`, 7.1 s): a load artefact, not a defect; shard 3 828, 827 pass, 0 fail, 1 todo
  (w4RealReach 4-3, on main already). No new todo: the gen2 1-1 double-gap todo is gone.
- **Lock: `lock: 101/102 stages unchanged`, only 1-1** (exit 1 only because the run had no `--intended 1-1`; re-running with it).
- clipcheck and drawcheck: starting now.

## >>> 6:22 PM ET: the release is ON again (the lead, 6:20 PM) <<<
- Matt played bf3684ec 5 times, "felt great", wants it released and merged (relayed by the lead). funcheck ships as a NAMED, ACCEPTED
  FAIL on the lead's ruling (dead walk inside the 4 s quiet line; nothing bites = ruling A, a forgiving teaching stage; no gentle intro
  open, next week's first fix). The list is NOT lowered or re-recorded. Law 5 says never "expected-fail" a check: this is Matt's and the
  lead's explicit decision, recorded here and in the PR body, not mine.
- Roadmap rows R-165.48-.51 updated to say so (R-165.48 next week's first fix); roadmapcheck PASS.
- **PR body draft: `reference/qa-reports/0.9.5/PR-BODY.md`** (what changed, merged branches, the gate table, funcheck's findings with
  numbers and Matt's acceptance, the §6 table with proof or "not checked, and why", rough spots). Gate cells still GATE-2/7/8/11 until those
  finish; I fill them and say so here.
- Shard 2 has 1 red: `stageQuality.test.ts:287 generating a stage is quick: p90 under 500 ms, none over 1500 ms` -> `p90 613 ms`. It ran
  with 4 other heavy jobs on 4 CPUs (2 shards, the lock, my vite/funcheck runs). I re-run it ALONE when the rest ends; it is red until
  that run passes. Never loosened.

## >>> 6:03 PM ET: 0.9.5 does NOT go live tonight (the lead, 6:02 PM) <<<
- funcheck IS in this release's gate, and it FAILS on bf3684ec (gen2 1-1 worse than live on pacing, dead walk and nothing bites). No
  release unless the ruler is proven wrong with evidence. Nothing goes toward main; no PR.
- The TEST LINK still goes out from bf3684ec (the testers' data answers pacing, dead walk and nothing bites).
- The rest of the gate keeps running on bf3684ec (suite, lock, clipcheck, drawcheck); every result below.
- Roadmap: R-165.48 (1-1 gentle intro), R-165.49 (dead walk), R-165.50 (nothing bites after 30 s), R-165.51 (the lock-identical stage
  moves, the planner: prove checker-only or fix), Day 1, each with its numbers; BUILD-PLAN's "roadmapcheck prints" 607 -> 615.5 with the
  line saying why. roadmapcheck PASS.

## >>> THE CANDIDATE: release-0.9.5 @ bf3684ec147b888714fc71be9ec25c6afcd361fc (pushed 5:56 PM ET) <<<
Build the test link from bf3684ec. Commits after it on this branch are notes only (this file), no code.
- = origin/main 68b31e66 (0.9.4) + engine-core 94a31ca0 (the final; contains 6c5232ec and engine-chunks 25d2d115) + tester-page 4320a9b25
  (merged by me: the final does not contain it; the lead passed it 5:01 PM) + the old-1-1 deletion (old11-delete.py) + version 0.9.5,
  What's New, funcheck's list from main (release-prep.py; roadmap needed no edit: the final already cites engine-core/NEXT.md).
- tsc PASS. seedList, whatsNew, buildAhead tests: 10/10 pass. vite build PASS: main JS 4,162,639 B (31.7 KB under 4 MiB), no file over
  4 MiB, so **lazy-seeds.py NOT applied** (the lead's rule).
- The full gate on bf3684ec (a detached worktree at that commit), so far (5:59 PM ET, from date):

| # | Gate | Result on bf3684ec |
|---|---|---|
| 1 | tsc | **PASS** (no output) |
| 2 | tests, 3 shards | RUNNING (started 5:57 PM, ~30-40 min) |
| 3 | vite build, no asset over 4 MiB | **PASS**: main JS 4,162,883 B (31.4 KB under 4 MiB); 0 files over 4 MiB |
| 4 | npm run build:store | **PASS**: "Store build check passed: dist has no tracking, ads, collector, service worker or outside addresses." (main JS 4,161,697 B) |
| 5 | artcheck | **PASS** |
| 6 | knowncheck | **PASS** (vs 68b31e66: clipknown 44, playerText.known 4, limits 14, artUse.allow 210, 66 fewer than main). Note: funknown.json is not in knowncheck's LISTS |
| 7 | clipcheck | NOT RUN yet (after the shards: CPU) |
| 8 | drawcheck | NOT RUN yet (after the shards) |
| 9 | roadmapcheck | **PASS** |
| 10 | funcheck | **FAIL**: `FAIL (12 worse or new, 26 to lower or delete; 144 known, 1872 stage-layout flags; 60 s)`. The same 12 as the 5:45 entry: gen2 1-1 dead walk 16/16 both settings (main 14), pacing Normal 13 (8) / Easy 11 (2), nothing bites Normal 12 (4) / Easy 8 (4); 1-2 nothing new 14 (10) both; 1-9 repeat N 15 (12), nothing new E 16 (13); 1-3 repeat N 13 (11); 1-6 Easy repeat new (1). **Needs the lead's ruling; I do not lower the list (Law 5).** |
| 11 | lockall --check | RUNNING (with the shards) |

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
1. (answered: tester-page and engine-chunks passed, both arrive in engine-core's final) Has tester-page passed? Has engine-chunks passed? (I merge each only on your word, here or in STATUS.md. engine-chunks needs its
   provenSeeds.ts re-generated on the merge.)
2. 1-5 stays out: confirm, and name who puts main's 1-5 back (engine-core, I'd say: it's their code).
3. 4-9 layout 4's moved find: take it (intended) or hold it?
4. gen2 1-1's todo'd double-gap test: fixed by 5:00, or your ruling.
5. funcheck's `REBUILT = ['1-1', '1-4']` gates 1-4 on the truer rules, but 1-4 is main's 1-4. Should 1-4 come off? (I did not touch it.)
6. The What's New draft (reference/qa-reports/0.9.5/release-notes-draft.md): approve or rewrite.
