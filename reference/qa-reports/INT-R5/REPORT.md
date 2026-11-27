# INT-R5 REPORT: release 5 (0.10.4) candidate, release-0.10.4 (packet reference/packets/2026-11-26/INT-R5.md)

## EXACT NEXT STEP (written 8:47 AM ET 11-27 by `date`; release-0.10.4, box 1 of 11-27; the old release-0.10.3 report is below the line)
0. **CRITICAL PATH, FIRST (the lead's message, 8:52 AM ET 11-27):** 2-7's proven list is STALE on this candidate. t-land-26's 5a67dba93
   (ENG-26e: the drop judge reads water through river.ts waterUnder) changed 2-7's lays, and the list was built without it. ENG-QUIET-c
   (t-eng-quiet fc315db2e) found seeds 3 8 9 11 12 15 17 19 20 22 and more fail with "replay differs from its search". Do these in order:
   (a) Prove it on the release head: `npx tsx tools/engine/seedlist.ts 2-7 --check` (box 1's discovery g-seedlists.log will show it too).
   (b) Rebuild the list on a work tree of the head: `npx tsx tools/engine/seedlist.ts 2-7 --count 100` (or the --worker i/n parts, then
       --merge; seedlist.ts:153). Two other branches rebuilt it to version c9e1e269 with 35 seeds changed: say whether this rebuild differs.
   (c) castBots on EVERY changed variant, both settings, the old list vs the new one (rule 28: trace every miss). ANY new miss goes to the
       lead BEFORE the final full set.
   (d) Every test that pins a 2-7 roll or seed (release.md step 6; the grep finds src/game/gen2/judgedTable.test.ts, but run the full
       step-6 grep). Then tsc and the CI tool line. Commit the list; push.
1. **DONE**: the What's New title is now "Water wheels and the mail boat" (the lead's ruling A; "Two new stages" duplicated 0.9.8's title).
   whatsNew.test + playerText.test: 79 pass, 0 fail. This is the first commit of the final head; no code was touched.
2. **The DISCOVERY run on 5b9389168** (frozen /home/user/wt/c1, main frozen /home/user/wt/main, results in /home/user/wt/out-c1) runs
   in box 1's container. It is the gates of the same frozen candidate, so box 1 lets it finish (D138) and pushes each lane's
   fullset-*.txt plus every failing g-*.log tail to reference/qa-reports/INT-R5/r104/out-c1/. The lanes are listed under "THE FULL
   SET" below. Read the pushed results; fix every red (a stale seed list per release.md step 6, then the roll/seed-pinning tests);
   each fix is its own commit, with tsc and the CI tool line after it.
3. Then THE FULL SET on the FINAL head: freeze it (git worktree add --detach; chattr per dispatch-packet.md D115, src/game/gen2/proven
   writable), the same six lanes with r104/lane.sh (r104/run1.sh holds every gate line; read the lane list below). Each shard's totals
   go in the gate table. The lockall moves must be NAMED: 2-6, 2-7, C14's and release-0.10.3's own (INT-R5 below listed them), each judged.
4. The PLAY-STORE §6 table; release.md 4b (CI time limits per the candidate's shard plan: g-shardplan.log); the test link PRE-BUILT
   (python3 tools/testlink/build.py, in its own worktree of the final head) and NOT published. STOP before the PR.

## Merges (release-0.10.4 cut from origin/main 4bf2cbaaa, every merge --no-ff, in the packet's order)
| # | Branch @ head | Merge commit | Commits | Conflicts (named) | tsc | CI tool line |
|---|---|---|---|---|---|---|
| 1 | release-0.10.3 c73cb9766 | 96998505d | 681 not on main (1558489a2..c73cb9766) | whatsNew.ts (kept main's SHIPPED 0.10.3 "Two little fixes" entry, which players saw); reference/handoffs/engine-core.md (one blank line: took release-0.10.3's) | clean | running (box 1 pushes the totals) |
| 2 | t-eng-thumb-wip 35d5252c2 | 2576ddf24 | 42 over release-0.10.3 | none | clean | running |
| 3 | t-land-26 2f681402e | abdc6e4d1 | 38 over release-0.10.3 | none: the expected protoArt conflict did NOT arise (release-0.10.3 already holds the soil fix's protoArt) | clean | running |

## 5-9's Easy goal (R-165.496), commit 4799f6026
- KID_RUNS_59 re-measured on merge 3 (abdc6e4d1): **[14, 13, 17, 18, 5, 5]**, as the packet expected. Re-recorded in gen2/game.ts.
- EASY_GOAL_59 = 5 is DATA in gen2/game.ts, and 5-9's entry uses it. The kidMedian derivation is gone. goals.ts kidReaches(goal, runs): goal at or
  under the runs' lower median (13 here).
- firstTimerBot.test.ts: the re-measure test (it now says "re-record KID_RUNS_59 (the goal stays EASY_GOAL_59)"), plus a new test:
  the goal is 5, the entry uses it, the kid reaches it, and the test's own negatives (14 over those runs fails; 13 passes; no runs fails).
- Frozen 4799f6026: 2 pass, 0 fail. **Planted RED A** (runs re-recorded as [3,3,4,4,4,4]): both fail, "the kid's runs 3, 3, 4, 4, 4, 4
  (lower median 4) do not reach the goal 5". **Planted RED B** (easyGoal back to kidMedian(KID_RUNS_59), the "re-record lifts the goal"
  case): test 2 fails, actual 13, expected 5. Each plant ran in its own fresh worktree, which was removed afterwards.
- Other stages: no other Easy goal comes from a bot's runs. `kidRuns` appears only on 5-9 (grep src). World 1's marks goals (w1mix.ts:1264)
  come from the stage designs' goal counts. stageGenerator.ts:2955 only caps the gen2 goal at the enemies laid.

## Version and What's New (commit fca8ed1cb): 0.10.4, package.json + package-lock.json; the lead APPROVED the entry as drafted (A)
"Two new stages": Up the Bank Houses (water wheels); The Mailman's Route; Dot warns before deep water, on every setting; the rivers run
smoother and the bouncy plants' stems reach the ground they grow from. Lines 2-4 come from release-0.10.3's approved draft, which never shipped.
**The title is a duplicate (step 1 above).**

## THE FULL SET: discovery run on 5b9389168 (NOT the green run: the title must change)
Lanes (r104/lane.sh <frozen> <main> <out> <lane> <gates>; each run_in_background, timeout 7,200,000 ms):
A1 suite1 suite2 suite3 | A2 suite4 suite5 suite6 | B seedlists seed11 shardplan registrycheck | C tsc vitebuild chunkcheck artcheck
knowncheck generalitycheck coveragecheck roadmapcheck timecheck drawcheck clipcheck kbdcheck buildcheck buildstore | D lockbase lockall
paint0 paint1 paint2 | E toolline tipwalk storytipscan teachfirst castbots26 castbots27 funcheck fundiff tierbots.
Known so far: playerText.test 1 fail (the title). Everything else is running.

## release.md 4b: the CI time limits, the BASE numbers (main's last deploy, run 45742721127 on 4bf2cbaaa, all green)
| Job (limit) | main's time | share |
|---|---|---|
| gates (25) | 13.8 | 55% |
| drawcheck (30) | 15.0 | 50% |
| seedplan (10) | 0.8 | 8% |
| seedlists 1/2/3/4 (45 each) | 5.7 / 7.8 / 21.0 / 20.8 | 13-47% |
| paintcheck 0/1/2 (25 each) | 5.1 / 9.3 / 6.5 | 20-37% |
| rolled (60) | 16.6 | 28% |
| test 1-6 (deploy.yml: no timeout-minutes) | 8.6 / 19.0 / 7.1 / 11.9 / 16.4 / 5.9 | n/a |
**Still to do (D124):** the candidate adds TWO proven lists that main does not run, 2-6 and 2-7 (seeds-2-6.ts, seeds-2-7.ts are new vs
main), so the shards reshuffle. Take the candidate's shard plan from out-c1 g-shardplan.log (`registrycheck --lists --shard k/n`) and
each list's time from the deploy's seedlists logs (the '== <id>' timestamps; get_job_logs on the four seedlists jobs of 45742721127).
2-6 and 2-7 have no CI time, so use the local g-seedlists.log '== <id> <epoch>' deltas, scaled by the ratio of a list both runs share.
Then sum per shard. Any shard within 20% of 45 (36 min or more) is split BEFORE the PR.

## PLAY-STORE §6 (draft from the diff origin/main..release-0.10.4 -- src; the gate-proved rows are filled when the final head's lanes finish)
The diff touches no screen, menu, sound, save or setting file. Outside src/game it touches only src/App.tsx (a `?fixture=home` dev toy added
beside main's chase and wheel fixtures), components/dot/DotGuide.tsx (Dot's line gains `who` and `warn`: the race's end line and the
deep-water warning) and components/stageClue.ts (2-6's clue). A grep of the added lines finds no fetch, XMLHttpRequest, sendBeacon,
localStorage write, wake lock, new Audio or URL.
| # | Item | Holds? | Proof |
|---|---|---|---|
| 1 | Nothing under the insets, both ways, foldable | pending | clipcheck on the final head (lane C); the What's New card's new entry is the only menu text that changed |
| 2 | Back is sensible | holds: no new screen | diff: no new screen or route |
| 3 | Nothing new sent off the phone | holds by diff; build:store pending | no network call added (grep above); `npm run build:store` (checkStoreBuild) on the final head |
| 4 | Works offline | holds by diff; pending buildcheck | no web load added; buildcheck on the final head |
| 5 | Sound stops in the background; no wake lock | holds: no audio or wake-lock change | diff: no src/audio file, no wakeLock |
| 6 | Leave/return/rotate keeps the place | holds: no save or resume change | diff: no save file; 2-6/2-7 rotate per the suite's stage tests (final head) |
| 7 | No dead ends or placeholders in the store build | pending build:store | `?fixture=home` is a URL-only dev toy, like main's chase/wheel fixtures. **For the lead (release.md step 2, "remove test-only toggles"):** it is existing debt that this release adds to, so I am not deleting it; ruling asked |
| 8 | Saves survive everything | not checked here: no save code changed; the real-phone kill check is Matt's closed-test step | diff |

## Lessons applied
D92 (tsc + the CI tool line after each merge), D115 (every run on a frozen, chattr'd tree; the plants in fresh trees), D119 (no heredoc in
a commit chain), D128 (stamps from `date`), D134 (this step pushed and ls-remote checked before the hand-over), D138 (only this candidate's
gates run past the box), D140 (ReadNotifications at each step), CI #89 (20-minute default), CI #93 (totals for the hash in each message).
**My miss (for LESSONS): I ran whatsNew.test after drafting and then edited a line without re-running it, and never ran playerText.test,
which checks titles for duplicates across every release. Countermeasure proposed: release.md step 3 names BOTH tests (whatsNew.test
and playerText.test), re-run after ANY edit to the entry, before the lead is asked.**

---

# INT-R5 REPORT: release 4 (0.10.3) candidate, release-0.10.3

Session 1: started 2:31 PM ET 11-24 (by `date`), handed over at the 28-minute box. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.

## EXACT NEXT STEP (session 7 starts here; INT-R5d-c, started 4:12 PM ET 11-25 by `date`)
**INT-R5d-c: item 1 below is DONE at 0597cd057** (pushed, ls-remote confirmed): the lead re-ruled the 4th line to option A, 89 chars
('Fixed: a wall I couldn’t see in First Lianas, and dark soil at the start of Up the Kapok.'), because the first ruled line (101)
broke whatsNew.test.ts:32's 90 cap (test untouched); date 2026-11-25; tsc clean; whatsNew.test + playerText.test 79/79. NEXT is item 2:
WAIT for the lead's bot-fix hash (release-0.10.3-wip-plant-ci's FINAL head, no separate merger), then items 2-3 below. Step 3 adds
(packet INT-R5d step 3, D132) castBots vs MAIN on 2-1, 2-2, 2-4, 2-5, 1-4 (zero bar-relevant PASS -> FAIL) and release.md 4b sums.

### Previous box (INT-R5d-b, written 12:15 PM ET 11-25 by `date`)
INT-R5d-b started 11:35 AM ET 11-25. Branch **release-0.10.3-wip-fixes**, code head still **f7c5b8a2e** (REPORT/stills commits only
since). Step 1 is DONE and the lead APPROVED the after stills (d/s1-*.jpg). drawcheck and clipcheck on f7c5b8a2e are DONE, both PASS
(rows below: the lead's early warning, so they do NOT need to run first). NEXT, in order:
1. WHAT'S NEW, ruled by the lead (approved as proposed): in src/game/whatsNew.ts's top entry (version '0.10.3', already there from
   57d8b8ffb; package.json is already 0.10.3, nothing to change there) set `date: '2026-11-25'` and add a 4th item, verbatim with
   the curly apostrophe the entry uses: 'Fixed: a wall I couldn’t see in First Lianas, and a dark column of soil at the start of Up
   the Kapok.' Then `npx tsc --noEmit -p .` and `npx tsx --test src/game/whatsNew.test.ts src/game/playerText.test.ts` (find
   playerText's path with git ls-files), commit by -m flags, push, ls-remote.
2. ReadNotifications. On the lead's ENG-PLANT merged origin/release-0.10.3 hash (c27, the bot fix): `git fetch origin
   release-0.10.3`, confirm the hash, `git merge --no-ff origin/release-0.10.3` (message by -m flags) into release-0.10.3-wip-fixes
   (no force; name every conflict), tsc, then the CI tool line (gates.yml:157 read live) on a FROZEN worktree of the merge (`git
   worktree add --detach`, node_modules symlinked, `chattr -R +i src tools`, `chattr -R -i src/game/gen2/proven`): 0 FAIL, the todo
   chaseBots :110 aside. Then fast-forward release-0.10.3 to it (`git push origin <merge>:release-0.10.3`, no force).
3. THE FULL SET on that exact head (packet step 3; run1.sh then run2.sh, each run_in_background, timeout 7,200,000 ms; drawcheck and
   clipcheck run again there), then the gate table here and the head + table to the lead. FIX-SOIL-b's CI line and drawcheck count
   on this merged tree (CI #77): name them.
Stills tool: reference/qa-reports/INT-R5/tools/int-shots.mjs `<tree> <port> <out> <tag> groundCeilings <1|0> <27,14,16,81,16d>`
(refuses a busy port, checks the served tree by the marker in src/game/protoArt.ts, kills its vite; pkill the port after anyway).

## Gate table, step 1 (INT-R5d; each on a FROZEN detached worktree, chattr +i src tools, proven writable)
| head | gate | result |
|---|---|---|
| a2b7dde04, 7ee9b7bcb, f7c5b8a2e | `npx tsc --noEmit -p .` | clean, every head |
| dfe631913 (release base) | lockall `--layouts 16 --check SIDEWALL-FIX/lock-main-cdffdc62.json` | 70/102 unchanged; 32 moved = the release's own (1-4's relist and fill, 2-7, the hint stages' proto.hints) |
| a2b7dde04 (the two fixes merged) | the same lockall | move list IDENTICAL to the base's (diff empty): ZERO moves from the two fixes |
| f7c5b8a2e (+ the engine piece) | the same lockall | move list IDENTICAL to the base's: ZERO moves |
| f7c5b8a2e | paintcheck `--part 0/3`, `1/3`, `2/3` (sideWall, soilOvers, soilShorts; no known list) | PASS 3/3: 1,882 + 2,196 + 1,928 = 6,006 builds of 102 stages, both settings, 0 SIDE-ON, 0 SOIL OVER, 0 SOIL SHORT (1-4, 1-6, 2-7, 8-1 in it) |
| f7c5b8a2e with bankOpen's ceiling test removed (the 7ee9b7bcb rule) | paintcheck `--stages 2-7` (THE PLANT) | FAIL, 3,719 SOIL SHORT lines (normal seed 1 bank #1 x 3881: short 307 across 568) |
| f7c5b8a2e | paintcheck `--stages 2-7` | PASS: 0 SOIL SHORT, 0 SOIL OVER, 0 SIDE-ON |
| f7c5b8a2e | `npx tsx --test tools/engine/paintFall.test.ts` | 16/16 (the planted stacked-ceiling test: RED without the ceilings, GREEN with) |
| bb29e048d | `npx tsx --test src/game/art/*.test.ts` (inventory) | 16/16 |
| a2b7dde04 | paintcheck part 0/3 (before the engine piece) | PASS (superseded by the sweep on f7c5b8a2e) |
| f7c5b8a2e (frozen a9cb936da) | `node tools/perf/drawcheck.mjs` (the lead's early warning) | PASS, 42 runs, 0 breaches (1-4, 1-6, 2-7 upright and sideways in it; 8-1 is not on drawcheck's list); 1159 s |
| f7c5b8a2e (frozen a9cb936da) | `node tools/perf/clipcheck.mjs` (the lead's early warning) | PASS (83 known, none new); 1038 s |
| f7c5b8a2e (frozen a9cb936da) | the CI tool line (gates.yml:157, live) | 397 tests: 390 pass, **6 fail = ENG-PLANT's** (firsttimer :184; riverRide :107 :145 :207 :213 :229; owner ENG-PLANT, its merge clears them), 1 todo (chaseBots :110). No other red |
| f7c5b8a2e vs dfe631913 | stills (APPROVED by the lead) 2-7 bank #1 (Normal x 3881, Easy x 4339; on its top and on the leg under it), 844x390 and 390x844 | base and head IDENTICAL; the soil runs solid to the frame bottom, no backdrop gap (d/s1-2-7-bank1-*-base-dfe63191-vs-f7c5b8a2e.jpg) |
| f7c5b8a2e | stills 1-4 layout 1 start and summit, both settings, both ways | no soil column at the start; the summit bank reads clean (d/s1-1-4-*.jpg); Easy shows Dot's hint card (the hint stage, expected) |
| f7c5b8a2e | stills 1-6 posts (Normal) and 8-1 sliver (both settings), both ways | 1-6: both posts read as vine-wrapped support posts (the lead's 11-24 ruling); Easy's 1-6 build has NO narrow post (searched: width <= 30, height >= 150: none). 8-1: a standard World 8 bank end, as ruled; the end-face inset is R-165.442, release 5 (d/s1-1-6-posts-8-1-sliver-*.jpg) |
| 539885c37 (FIX-SOIL-b) | its CI tool line and drawcheck | NOT RUN by FIX-SOIL-b; they count on this merged tree (CI #77): the CI line here, drawcheck in THE FULL SET |

## The engine piece f7c5b8a2e (the lead's ruling, after the stills showed the gap)
- What the merge broke: on 2-7 the soil fix hung the upper leg's banks (soil stopped at their own bottom over its underside) while the
  release's stacked-leg ceiling clipped the earth and drew its own underside at its line, 120+ lower: the backdrop between (stills
  d/gap-2-7-*-normal-*-base-vs-7ee9b7bcb.jpg, base left, merged head right). A headless probe found 249 such banks in 12 builds
  (every hung bank on 2-7 is under a ceiling); confirmed live: bankOpen on the head's dev server returned underside true for bank #1.
- The fix: protoArt.ts groundCeilings() (one place for the painted ground's ceilings); bankOpen/groundSoil/groundLine take them; a
  bank a ceiling runs under is never hung (the ceiling owns its end). paintFall.ts: soilOvers judges the soil clipped at the ceiling;
  soilShorts (new); paintcheck sets setGroundStacks(stackZonesOf(gen2.tower.legs), rivers) per build as engine.ts does (D136).
- Named: the rule's first draft also fired on open-end faces leaning in on the fix (1,815 lines of 8-32 units on 2-7); narrowed before
  the plant: the soil must END under the foot (within his height, the line lower still) across more than his width.

## Lessons applied / to log (INT-R5d)
- Applied: D115 (every run on a frozen worktree), D119 (commit messages by -m, no heredoc in a commit chain), D128 (stamps from
  `date`), D134 (pushed and ls-remote-confirmed before every report), D135 (no red called inherited), D136 (the gate now reads the
  soil as drawn on a stacked stage), D137 (the 28-minute box; handed over at the lead's word with the two running gates finished).
- NEW, my miss, caught before it reached the lead as a finding: the base tree's vite survived its run (npx's child outlives
  `vite.kill()`), and the head's run on the same port with --strictPort reused it, so the "head" stills were the base's. Proposed
  countermeasure (a check): shoot scripts pkill their port after each tree and refuse to start on a busy port; the shot log prints
  the served tree's `git rev-parse HEAD` from a file vite serves (or the page reads a build stamp) and the run fails on a mismatch.

## Step 1 (INT-R5d): the conflicts and their resolutions
- Merge t-fix-sidewall (0492396b), all text, union: gates.yml:157 the CI tool line (the release's line + tools/engine/sideWall.test.ts);
  gates.md row 8c (the fix's side-on-wall sentence) with the release's rows 8d/8e; handoffs/engine-core.md (0zs-SIDEWALL on top).
- Merge t-fix-soil (a2b7dde04), src/game/protoArt.ts, 4 hunks + 2 follow-ons:
  - drawBankArt: the soil fix's soilOutline(); the release's ENG-GROUND-e endFace `inner` argument (right ? p.x : p.x + p.width) carried
    into soilOutline's one endFace call (else it would silently drop the release's narrow-wall fix).
  - drawGround (2 hunks): the soil fix's bankOpen() (how.open, how.isWall), then the release's stacked-leg ceiling clip (ceilingsOver,
    clipAbove) and, after drawBankArt, the release's ceiling underside (groundStack drawUnderside), as on the release.
  - drawProtoScene: groundBanks(platforms); groundBanks now returns the sidewall fix's bankList(platforms, platforms.filter(paintedBank)):
    ONE place, read by the painter and by the paint gate (paintFall.ts soilOvers).
  - imports: two different drawUnderside (groundPaint's hung-bank underside, R-165.441; groundStack's stacked-leg ceiling); groundPaint's
    is imported as drawHungUnderside.
  - handoffs/engine-core.md: 0zs-SOIL on top.
  - tsc clean on a2b7dde04.
- Watch (engine's call, not mine): on 2-7 (stacked out-and-back legs) a bank over the lower leg can be BOTH hung (soilHangs, the soil
  fix, cut from main where no leg is stacked) and under a ceiling (the release's clip + underside). The soil fix never met a stacked
  leg; paintcheck's soilOvers on 2-7 and a 2-7 still at a stacked zone answer it.
- Inventory (bb29e048d): hf678/w1-livepost-tall 'cut, not placed' -> placed on 1-6 (engine slot, footing, layer support, about 131x380
  units on 1-6, pokey_scale 4.26, used in, status); CATALOG-MASTER.csv + catalog-rows-hf678.csv the same row; inventory/*.json
  re-emitted (only that row changes, checked); src/game/art tests 16/16.

## EXACT NEXT STEP (session 4 starts here; written by INT-R5c, kept for history)
Session 3 (INT-R5c): started 3:20 PM ET 11-24 (by `date`). Head: release-0.10.3 = see `git log -1 origin/release-0.10.3` (session 3
pushed 41cb842a1 part 3, 575022e30 the stamp fix, 86aad83a7 the FILL-14b merge, 6c1740d2b the TEACH-11 merge, 90faac0ba (ENG-PLANT's
two REPORT-only commits merged in), then REPORT-only commits). In order:
0. **Setup (session 3 lost 2 minutes here):** a release tree (`git worktree add -b release-0.10.3 <dir> origin/release-0.10.3`), then
   `npm ci --no-audit --no-fund --legacy-peer-deps` (plain `npm ci` fails ERESOLVE: no node_modules at all), then
   `git fetch --unshallow origin` (timecheck and blame need it; about 2 minutes, in the background).
1. **TEACH-11 is MERGED and checked (6c1740d2b; on 90faac0ba: tsc clean, the CI line 383/6 FAIL (ENG-PLANT's six only)/1 todo,
   teachFirstScan --seeds 20 PASS, seedlist 1-1 PASS; "Session 3: results" below).** FILL-14b likewise (86aad83a7: seedlist 1-4 PASS,
   castBots 1-4 100/100). Nothing left to merge but ENG-PLANT.
1b. **FIRST: WAIT FOR THE LEAD'S RULING ON ENG-PLANT-b'S ATTRIBUTION** (the lead's change of plan, session 3): ENG-PLANT found shipped
   2-1, 2-2 and 2-4 rows going pass to fail against MAIN on the merged release (most of it from the merge, not its fix); ENG-PLANT-b is
   attributing it (main / main+t-build-26 / pre-fix / fix). Release 4 does NOT run THE FULL SET until the lead rules. ReadNotifications
   at every step boundary; do nothing below until the ruling names what to do.
2. **ENG-PLANT (lands ON release-0.10.3 itself, when the lead says):** `git pull` the release tree; tsc + the CI tool line on a frozen copy:
   **0 FAIL** is the bar (the todo chaseBots :110 aside). If any red: stop and send it to the lead (no re-plant here, LAWS 22).
3. **THE FULL SET, once, on the final head, only when the lead says** (session 2's step 3 below is the recipe: frozen worktree + chattr,
   run1.sh then run2.sh, both run_in_background with timeout 7,200,000 ms, never a shell '&'; bars there; a main worktree at origin/main
   for lockbase). rowWheels is gone from the line (part 3). **run1.sh is updated (9d4330707):** `g teachfirst` (teachFirstScan --check,
   every seed; CI runs --seeds 20) after storytipscan; lockall's --intended = 2-7, 1-4 and the 30 hint stages (WARN-412's 22 + TEACH-11's
   18, union), then `g lockhints` (tools/lockhints.py: each hint stage must have moved ONLY proto.hints; prints every moved stage, its
   parts and whose move it is, for the table). The lead's ruling: the intended moves are 2-7, 1-4's fill and the hint-only moves; NAME EACH.
4. Gate table into this REPORT; the final head and table to the lead (no clock times).

## Session 3 (INT-R5c): what it did
- **Part 3 (the lead's ruling 1), commit 41cb842a1:** rowWheels.test was never on main (`git ls-tree origin/main`: no rowWheels, no
  w2Arc26 file), so not a shipped gate. Removed: src/game/gen2/worlds/w2Arc26.test.ts, tools/inspect/rowWheels.test.ts,
  tools/inspect/rowWheels.ts (only rowWheels.test imported it); rowWheels.test.ts off gates.yml:157. **Kept, the lead agreed:**
  w2Arc26.ts as the unlisted fixture: three suite tests import its kitLib26/STAGE_26 and cover engine code that ships in release 4
  (gen2/towerWater.test.ts, ENG-26d 59a5e4794: stacked water by riverAt; gen2/listedWheelSheet.test.ts, ENG-26f 4a0a8677c: a listed
  stage that lays a wheel preloads the noria; gen2/nodeClock.test.ts, ENG-26c f79e86f2a), plus tools/inspect/b26/probe.ts; and
  tools/inspect/plantRow.ts (draftRoute.mjs, the DEV page, uses it). **Release 5's revert list to bring 2-6 back: 8d094787c, 4816edd31,
  41cb842a1.**
- **timecheck (the lead's ruling 2), commit 575022e30:** REPORT.md:201 'hand-over at 3:19 PM ET' was typed at 3:10 PM in f23e3ae12 (a
  box end written as a stamp); now 'hand-over at 3:10 PM ET, the commit's real time; first typed 3:19 PM, the box's end, D128'.
  `node tools/timecheck.mjs` on 575022e30's successor (full history): PASS (557 commits, 84 stamps).
- **FILL-14b merged (the lead's ruling 3), commit 86aad83a7** (`--no-ff` 40a9c4bd2, t-build-26): one conflict,
  reference/handoffs/engine-core.md: both new turnover entries kept (0zr-W2FIN, then 0zr-FILL14). Auto-merged: provenIndex.ts (1-4
  version 698829e6, the lead's number; no 2-6 row), seeds-1-4.ts, seedlist.ts/seedlistFile.ts/seedlist.test.ts, methods/seed-list.md.
  No 2-6 file came back.
- **TEACH-11 merged (the lead's ruling 3), commit 6c1740d2b** (`--no-ff` 288cca7d7, t-eng-27 fast-forwarded from 90552d3ec). Two conflicts:
  .github/workflows/gates.yml:157, the CI tool line (release: cageChannel.test + cageBot.test, no rowWheels; TEACH-11: teachFirstScan.test):
  the union, teachFirstScan.test after storyTipScan.test as on t-eng-27 (sorted file lists compared: release's + 1, TEACH-11's + 2); the
  rolled job's new `teachFirstScan.ts --check --seeds 20` step merged clean. reference/handoffs/engine-core.md: both sides' entries kept
  (release's 0zr-W2FIN/FILL14/26s/26q/26, then t-eng-27's 0zq-teach). tsc clean.
- **ENG-PLANT's two REPORT-only commits** (963aa5eb7, e86cb8f4a; only reference/qa-reports/ENG-PLANT/) were on origin: merged in, 90faac0ba,
  pushed (fast-forward).

### Session 3: results (each on a FROZEN detached worktree, chattr +i src/tools, proven writable)
| Head | Gate | Result |
|---|---|---|
| 86aad83a7 (FILL-14b merged) | tsc | clean |
| 86aad83a7 | the CI tool line (gates.yml:157) | 383 tests: 376 pass, **6 FAIL**, 1 todo (chaseBots :110). The 6 = ENG-PLANT's: firsttimer :184 (2-2 child N 36 / middle N 17) and riverRide :107 :145 :207 :213 :229. The 11 w2Finish reds (ENG-W2FIN) and rowWheels :91 (part 3) are gone. |
| 86aad83a7 | seedlist 1-4 --check | PASS (100 seeds, each clean on both settings) |
| 86aad83a7 | castBots 1-4 --seeds 1-100, 4 bots, both, par 4 | proven 100 of 100; every row PASS 100/100, 0 under the 100 s floor; medians = FILL-14b's (adult N 121.6, child N 210.3, middle N 142, expert N 131.5 s) |
| 575022e30's successor | timecheck (full history) | PASS (557 commits, 84 stamps) |
| 6c1740d2b (TEACH-11 merged) | tsc | clean |
| 90faac0ba (TEACH-11 merged + ENG-PLANT REPORT commits) | the CI tool line (gates.yml:157, with teachFirstScan.test) | 390 tests: 383 pass, **6 FAIL**, 1 todo (chaseBots). The SAME 6 ENG-PLANT reds (firsttimer '2-2 child N 36 / middle N 17'; riverRide x5); TEACH-11 adds none (its 7 teachFirstScan.test tests pass). |
| 90faac0ba | teachFirstScan --check --seeds 20 (CI's form) | PASS: 0 misses over 600 rolls of 15 listed stages |
| 90faac0ba | seedlist 1-1 --check | PASS (161 seeds, each clean on both settings) |

### Session 3: unresolved, pushback, method update
- Unresolved: release 4 is NOT green yet: the CI line's 6 ENG-PLANT reds (lands about 5:30 PM ET); THE FULL SET not run (waits on ENG-PLANT).
- Pushback: one part of ruling 1 not done, the lead agreed: w2Arc26.ts stays (three engine tests' fixture).
- Slip, named: I read the REPORT lean (EXACT NEXT STEP only) and missed session 1's 'Setup notes' (npm ci ERESOLVE): the first install
  failed, about 2 minutes lost. Method update: the setup lines now sit in the EXACT NEXT STEP itself (step 0), where a fresh session reads.
- Lessons applied: D92 (tsc + the CI line after each merge), D111 (28-minute box; extension asked for a running gate), D113/D122 (every
  long run in the background with a timeout, no foreground wait, no '&'), D115 (frozen worktrees, chattr), D119 (commit messages by -m),
  D128 (the stamp corrected to the commit's real time), D109 (no clock times to the lead).

## Session 2's next step (superseded by session 3's above; kept for the record)
Session 2 (INT-R5b): started 2:51 PM ET 11-24 (by `date`). Head: release-0.10.3 = see `git log -1 origin/release-0.10.3` (session 2 pushed
57d8b8ffb, the bump, then REPORT-only commits). In order:
1. **Wait for three hashes from the lead (ReadNotifications at every step boundary):** ENG-W2FIN's w2.ts root fix (red class (A); it
   merges into release-0.10.3 itself; due 4:00 PM ET), ENG-PLANT's (bots: red classes (B) riverRide x5 and (C) firsttimer :184, re-planted
   at the same bar, riverRide :207's real 2-1 case traced to its cause; it reads the bisect below) and FILL-14b's (1-4's slots 26/45/66/69
   filled in place). On each: `git pull` the release tree,
   `npx tsc --noEmit -p .`, then the CI tool line (gates.yml:157, read live) on a FROZEN `git worktree add --detach` of the new head
   (the D92 rule: the CI line after EACH merge). FILL-14b: merge it (`git merge --no-ff <hash>`, message by `-m` flags, never a heredoc),
   then `npx tsx tools/engine/seedlist.ts 1-4 --check` and castBots 1-4 100/100 (run1.sh's castbots14 line).
2. **The lead's rulings in force (session 2):** HOLD part 3: the 2-6 draft (w2Arc26.ts/.test.ts, rowWheels.test) STAYS; if ENG-W2FIN's fix
   makes w2Arc26.test green it stays as the unlisted draft; if not, the lead revisits. Release 4 ships only with a fully green CI line: every
   red fixed at its cause, none taken off the line (LAWS 22). The red list on 0077c62c6 is under "Session 2: the CI 'rolled' job" below.
3. **THE FULL SET, once, on the final head (all three hashes in):** `git fetch --unshallow` in the release tree first; then a FROZEN worktree
   (`git worktree add --detach <dir> <head>`, node_modules symlinked, `chattr -R +i <dir>/src <dir>/tools` then `chattr -R -i
   <dir>/src/game/gen2/proven`); then TWO background runs (run_in_background, timeout 7,200,000 ms, NEVER a shell '&'):
   `bash reference/qa-reports/INT-R5/tools/run1.sh <frozen> <main worktree at origin/main> <outdir>` (every gate but the suite: the six
   'rolled' steps, the build gates, drawcheck, clipcheck, kbdcheck, lockall vs main --intended 2-7,1-4 (name WARN-412's hint-line moves),
   every seed list --check, the shard plan for release.md 4b, paintcheck 0-2/3, castBots 2-7 and 1-4 on their lists, funcheck + fundiff,
   build:store, the slot confirm, tierBots, buildcheck LAST and ALONE), then `bash .../run2.sh <frozen> <outdir>` (the suite in 3 shards).
   Bars: castBots 2-7 on the list = BUILD-27g's 69/100 (adult N 96 ...; the 1-40 yield 29/40, BUILD-27/REPORT.md:136-141); 1-4 = 100/100
   after FILL-14; fundiff IDENTICAL to INT-14's ruled debt; buildcheck alone on an idle box. release.md 4b: sum each seed-list shard by
   LIST from the shard plan (g-shardplan.log) with each list's time from g-seedlists.log's '== <id> <epoch>' lines; any job within 20% of
   gates.yml's timeout-minutes (seedlists: 45) is raised or split before the PR.
   After ENG-W2FIN + ENG-PLANT: the CI tool line must be 0 FAIL (the todo chaseBots :110 aside) before THE FULL SET starts.
   Session 2's runs on 0077c62c6 are NOT the full set (the head will change); re-run every gate on the final head.
4. Gate table into this REPORT; the final head and table to the lead (no clock times). The lead builds the test link and opens the PR.

## Session 2 (INT-R5b): what it did
- **Version 0.10.3 + What's New (packet step 2), commit 57d8b8ffb, pushed:** package.json and package-lock.json's own two fields
  0.10.2 -> 0.10.3; whatsNew.ts top entry 0.10.3, 2026-11-24, 'The Mailman’s Route', the lead's three approved lines verbatim (curly
  apostrophe as every What's New entry uses). tsc clean; whatsNew.test + playerText.test 79 pass, 0 fail.
- **Full-set scripts ready (reference/qa-reports/INT-R5/tools/):** run1.sh (no suite), run2.sh (the suite, 3 shards), fundiff.sh,
  castcmp.py, slotconfirm.mjs (the last three copied from INT-R4's, 237337d33).

### Session 2: the CI 'rolled' job on 0077c62c6 (frozen), every step, continuing past reds
Script: the six `run:` steps of gates.yml's `rolled` job in order (the tool line :157 read live, tipwalk --layouts 4, storyTipScan --check,
registrycheck, tierBots, buildcheck), each continuing past a red. Sent to the lead in full.
- **The CI tool line: 386 tests, 368 pass, 17 FAIL, 1 todo.** By cause:
  - **(A) the w2Finish throw, 11 reds**, every one 'World 2 finish: the fall at x=... has no bank at one end' (w2.ts:333):
    wheelChannel.test :40 :56 :79 :92 and wheelRide.test :26 :42 (x=335-731, ENG-26's wheel toy; t-build-26's wheelRide fix is masked:
    the test throws before its ride); rowWheels.test :23 :50 :65 :81 (x=274-670) and :91 (x=437-859), 2-6's row. ENG-W2FIN's root fix.
  - **(B) riverRide.test x5, not the throw:** :107 (planted: ride skill off, the middle N still crosses, toy-one-river), :145 (planted:
    handed-to-the-bank off, the middle N still crosses), :207 (2-1 adult N seed 12 rescued x1, set down 3x at x=25624), :213 (planted:
    upstream off: -1 more lives, needs 5, child N 4), :229 (planted: bankUp off: 1 more, needs 5, child N 40). The same five BUILD-27g
    had on 27e (:107 :145 :197 :203 :219; +10 lines from t-build-26's added plants). riverRide.test.ts is a 3-way merge of both sides
    (t-build-26 fe5793747, 27e 7926daba9, merged 22b3a4455); firsttimer.test.ts likewise (0d827c23b, d6496c636 -> 5612f4569).
  - **(C) firsttimer.test :184 x1:** 2-2 child N seed 36 / middle N 17, SKILLS.boardHop planted: 'RED with it off: 0 of 1 stands'.
  - (D) chaseBots :110 is the todo (OPEN: the child N reaches the fork 1 of 3), not a fail.
- tipwalk --layouts 4 PASS; storyTipScan --check PASS; registrycheck PASS; tierBots 9/9 PASS; **buildcheck FAIL by 3 ms, run alone on the idle box:
  1-1 Normal p50 69 / p95 153 / max 160 ms (budget p95 150 at CPU x4), Easy p50 58 / p95 90 / max 97 ms** (BUILD-27g on 27e alone: Normal
  127, Easy 67). Measured next against main (cdffdc627) on the same box, alternating, 3 rounds each (tools/bcmp.sh; scratch paths inside):
  **Box noise, not a regression:** head 0077c62c6 PASS 3 of 3 (Normal p50 68/65/70, p95 134/141/141 ms; Easy p95
  72/81/87); main cdffdc627 on the same box, interleaved: Normal p50 67/84/71, p95 136/**202 (FAIL)**/119 ms; Easy p95 131/96/88. The
  head's p50 matches main's; main itself fails the gate once in three here. So the first FAIL (153) is the 30-build p95's tail on this box.
  THE FULL SET runs buildcheck LAST and ALONE (run1.sh); CI runs it on its own runner. Suggestion for the gate's owner (the Critic), not
  acted on: the p95 of 30 builds swings 119-202 ms on main on an idle 4-core box; more builds per setting would steady the same 150 ms bar
  without moving it (evidence: tools/bcmp.sh's three rounds above).
- Bisect of (B) + (C): **the t-build-27e merge (b3195f31e) brings all six back.** Frozen detached
  worktrees, `npx tsx --test tools/inspect/riverRide.test.ts tools/inspect/firsttimer.test.ts` (tools/bisect.sh), run alone after the CI job:
  8d094787c (main + t-build-26 + 2-6 as on main, BEFORE 27e): **30 pass, 0 fail**. b3195f31e (+ t-build-27e @ 801cae9e8, which carries
  t-eng-27 to 091ba947): **30 pass, 6 fail**: firsttimer :184 and riverRide :107 :145 :207 :213 :229, the same errors as on 0077c62c6
  (so c5143db85, the t-eng-27 @ 90552d3ec merge, adds none). For ENG-PLANT, the 27e merge's non-test src changes that touch the bots'
  river crossings (`git diff --stat 8d094787c b3195f31e -- src tools ':!*.test.ts'`): engine.ts (+172/-), w2.ts (+146), riverArt.ts (+88),
  tower.ts (+54), easyMode.ts (+16), physics.ts (+4); the bot code (tools/inspect/ riverRide's bots) is unchanged by it. Both test files
  are 3-way merges (riverRide.test 22b3a4455, firsttimer.test 5612f4569). Not traced further (ENG-PLANT's job, the lead's ruling).

### Session 2: unresolved, pushback, method update
- Unresolved: release 4 is NOT green: the CI tool line has 17 reds (11 ENG-W2FIN's, 6 ENG-PLANT's); THE FULL SET not run (waits on
  ENG-W2FIN, ENG-PLANT, FILL-14b, the lead's ruling). Part 3 (the 2-6 draft out) HELD by the lead.
- Pushback: none on the rulings. One correction to my own first message: I wrote that t-build-26's riverRide fix 'does not survive the
  merge' before the bisect; the bisect now proves it (green before 27e, red after).
- Method update (gates.md 'THE FULL SET' / release.md): a timing gate that FAILs within a few ms of its bar is measured against main on
  the same box, interleaved, before it is called a regression (tools/bcmp.sh's shape: 3 rounds, alone, after other runs end).

## Session 1's next step (superseded by session 2's above; kept for the record)
Head: release-0.10.3 = **4816edd31** (pushed). It is NOT green yet: 2-6's draft test is RED (below). In order:
1. **Wait for the lead's ruling on 2-6's draft (asked in session 1's last message; options A/B under "The 2-6 draft red").** On B
   (my pick): one commit 'INT-R5: 2-6 as on main (part 3)': `git rm src/game/gen2/worlds/w2Arc26.ts src/game/gen2/worlds/w2Arc26.test.ts
   tools/inspect/rowWheels.test.ts` (+ rowWheels.ts and tools/inspect/b26/ if nothing else imports them: `git grep -l "rowWheels\|w2Arc26"`),
   take rowWheels.test.ts off the gates.yml CI tool line (line 157), then `npx tsc --noEmit -p .`, then
   `grep -rl "Arc26\|STAGE_26\|kitLib26" src tools` must print nothing. On A: an ENG packet, not ours.
2. Read the two runs session 1 left (their files in the session's scratchpad are gone with the container; RE-RUN them on a FROZEN
   worktree of the new head, run_in_background, never a shell '&'):
   - the src tests that mention 2-6: `npx tsx --test $(git grep -l -E "2-6|Arc26|w2-26" -- 'src/**/*.test.ts')` (about 5 min);
   - the CI tool line (gates.yml line 157 'run:' text). Session 1's run on b3195f31e (the 27e merge) showed wheelChannel reds at once
     (not ok 53-56: 'THE ROUTE rides a wheel as ONE move', 'THE CHANNEL prices the board...', two PLANTED): find out if they are 2-6's
     unlisting (they may plant 2-6's listed row: then they go with B or are re-pointed at a toy) or the merge (bisect 73431eecb /
     8d094787c / b3195f31e). BUILD-27g named 'wheelChannel 4' as an inherited red on t-build-27e and ENG-26u had the line 367/0 on
     t-build-26: so check 73431eecb first (should be 0 reds), then 8d094787c.
3. Then packet step 2: version 0.10.3 + What's New, words to the lead FIRST (draft below), then THE FULL SET (packet step 3).
4. FILL-14 / TEACH-11 when the lead sends hashes (packet step 4).

**CORRECTION (end of session 1, sent to the lead):** the wheelChannel reds on b3195f31e (tools/difficulty/wheelChannel.test.ts:40,
56, 79, 92) are the SAME throw ('World 2 finish: the fall at x=335-731 has no bank at one end') on that test's own toy wheel row. The root
is one merge interaction: t-build-26's wheel lays (wheel ponds) vs t-eng-27's w2.ts falls judged by height (ENG-GROUND-b, w2.ts:321-333).
Green on t-build-26 alone; BUILD-27g saw 'wheelChannel 4' red on 27e. So B below does NOT clear it: a w2.ts fix is needed for release 4
either way (asked the lead: an ENG packet (my pick) or the next INT session at the root with a planted test). Step 1 waits on that ruling.
**The root, read (not yet fixed):** w2.ts `banks()` on t-build-26 took any solid ending/starting at the fall's x at or above its lip
(`p.y <= y + LIP_RISE`, the topmost); the merged w2.ts (ENG-27e / ENG-GROUND-b) takes only a solid ON the fall's storey
(`lip(p, y)`: y-2 .. y+LIP_RISE: 'never a solid over the fall's height', so a stacked leg's edge is not taken as a bank). A wheel's fall
has its far bank, the street, standing OVER the jetty by design (the wheel lifts him up the bank), so the street is no longer found and
the finish throws, unless `hasRiver` gives the fall its pond (it reads a river only at the fall's own height; the wheel pond lies
WHEEL.pond under the wheel). The ENG fix: a fall over a wheel's pond (`r.wheelPond` spanning it) has that pond as its river, or banks()
accepts the wheel's own jetty/street (wheel.lay.jetty / streetId) at any height; planted: wheelChannel.test's four, towerWater's draft
test, w2Arc26.test.
**Run on 4816edd31 (frozen), every src test file that mentions 2-6 (21 files):** 119 pass, 2 fail: towerWater.test "2-6's draft row
... the first frames keep him at the spawn" and w2Arc26.test (the file): both the 2-6 draft on the merged w2.ts. qaW123, dotBox,
towerBots, listedWheelSheet, w2Stages and the rest pass with 2-6 as on main.

**THE LEAD'S RULINGS (end of session 1):** (1) B approved: part 3 takes the 2-6 draft out (w2Arc26.ts, w2Arc26.test.ts, rowWheels.test
and its tool if unused, rowWheels off gates.yml line 157); release 5 reverts all three 2-6 commits (8d094787c, 4816edd31, part 3) with a
w2.ts fix. "If the bisect shows wheelChannel's reds are the same w2Finish throw on a 2-6/wheel fixture, they leave with the draft the
same way... If they are something else, stop and tell me. The release's CI line must be green either way." (2) What's New approved as
drafted, title 'The Mailman's Route'.
**STOPPED AND TOLD THE LEAD (session 1, before part 3):** wheelChannel.test.ts is ON MAIN, unchanged by every merged branch
(`git log origin/main..HEAD -- tools/difficulty/wheelChannel.test.ts` is empty), and lays ENG-26's wheel TOYS (src/game/wheelFixtureStage.ts),
not 2-6's draft. It was green on main and on t-build-26; it is red since t-eng-27's w2.ts (BUILD-27g's 'inherited' wheelChannel 4).
Taking it out would remove a shipped gate to get around a defect (LAWS 22). So the CI line needs the w2.ts fix in release 4, not a
removal; part 3 (the draft only) still holds. Session 2: do part 3 as ruled, then wait for the lead's answer on the w2.ts fix.

## What merged (packet step 1), in order
| commit | what |
|---|---|
| 73431eecb | merge t-build-26 @ e8e99d167 (release 4's base). No conflicts (main is in t-build-26). |
| 8d094787c | **2-6 as on main, part 1** (the lead's ruling A, 11-24): unlisted; main's hand-built 2-6 restored for players. |
| b3195f31e | merge t-build-27e @ 801cae9e8 (2-7). 10 conflicts, below. |
| c5143db85 | merge t-eng-27 @ 90552d3ec (WARN-412). 2 conflicts, below. |
| 4816edd31 | **2-6 as on main, part 2 (WIP)**: the tests back to main's or to the draft. |

**Order (the lead approved, 11-24):** t-build-27e before t-eng-27. 27e already carries t-eng-27 to 091ba947 with BUILD-27's tested
resolutions against main, so the t-eng-27 merge brought only WARN-412's five commits (2 conflicts). The packet order gave 16 conflicts
on the t-eng-27 merge and then a criss-cross merge against 27e's own resolutions.

**Release 5 must revert the 2-6 commits: 8d094787c, 4816edd31 and part 3 (when made)**, or merging main back into t-build-26 silently
deletes the new 2-6 there (the revert-of-a-revert trap; the lead is filing it on the roadmap).

### 2-6 as on main (8d094787c + 4816edd31)
t-build-26 listed the new 2-6 (fab3a8a20) and deleted main's hand-built one. Restored to main's version whole (each file's only change was
2-6's): gen2/worlds/flownArcs.ts (n26 rows), gen2/judgedTable.test.ts, gen2/listed.ts (kit 'w2-26'), gen2/worlds/stageTable.ts ('2-6'
row), w2Stages.ts + protoStage.ts (the village climb), w2Sections.ts, w2Stages.test.ts (the village test back), components/stageClue.ts,
dotLinesData.ts (hint.2-6.climb), pokeyJournal.ts, stagePlan.ts, qaW123.test.ts, dotBox.test.ts, gen2/towerBots.test.ts. Hunk edits:
provenIndex.ts (2-6 row out; 1-4's 9fdaeff4 kept), stageSheets.ts ('2-6' draws back; its general laysWheel kept). Deleted:
gen2/proven/seeds-2-6.ts. Back to the draft form (c45496570^): gen2/listedWheelSheet.test.ts, gen2/towerWater.test.ts. w2Arc26.test.ts:
rolled on the draft row (withTestStage, kitLib26, W2's finish, finish26). Kept (general engine, 1-4 uses it): tower.ts, wheelLay.ts,
engine.ts / protoArt.ts earth-wall cull, gradCache.ts, river.ts waterUnder. tsc clean on 8d094787c.

### The 2-6 draft red (found by this session)
w2Arc26.test.ts on the draft row: on 8d094787c (before 2-7) 4 of 5 pass; on 4816edd31 the module throws in World 2's finish:
`World 2 finish: the fall at x=274-670 has no bank at one end` (gen2/worlds/w2.ts:333). On t-build-26 itself the file is 5/5. So the
t-build-27e merge's w2.ts (falls judged by height: hasRiver at the fall's own height, stackedUnder legs, ENG-GROUND-b) breaks the new 2-6's
lay: **a release-5 defect for 2-6 found early** (it would hit 2-6's relist too). Test 4 (the village look + hearts through RealPlay)
fails in the draft form even before 2-7 (RealPlay inside withTestStage with no seeds). rowWheels.test (CI tool line) plants the same
draft row, so it will hit the same throw.
- **B (my pick):** the draft leaves release 4 too: w2Arc26.ts, its test, rowWheels.test (+ tool) out in part 3; release 5's revert
  brings them back with the w2.ts fix. Nothing half-finished in main, no red, one revert for release 5.
- A: an ENG job fixes w2.ts / w2Arc26 for 2-6's falls now (release-5 work pulled into release 4's critical path).

### Conflicts and resolutions
t-build-27e merge (b3195f31e), each keeping both sides:
| file | resolution |
|---|---|
| .github/workflows/gates.yml | CI tool line = the union (27e's pacerRespawn, hopJudged + t-build-26's rowWheels) |
| src/game/levelCheck.ts | walk(): both: runs.clear() (ENG-26h's cache) then runLegs() (ENG-27's legs) |
| src/game/river.ts | t-build-26's waterUnder / waterNear kept (27e had nothing there) |
| src/game/engine.ts | import union (earthWallCovers + dressFeet, porchPosts); porch posts and rivers both undrawn when the earth wall fills the view |
| src/game/protoArt.ts | import union (gradCache + columnDress) |
| src/game/riverArt.ts | 27e's DRESS-27b soil cut (drawSoilCut, no clip, vGradient once): covers t-build-26's intent with no clip; unused gradCache import dropped |
| src/game/gen2/pipeline.ts | import unions (towerGateRoofs, gateBand, onClock + alongOf, inMetOrder, legOverlaps) |
| tools/inspect/firsttimer.ts | pacer import (27e); physics import union (FORGIVE + ASSIST, secondJumpV, drowsyJump, GLIDE); SKILLS = 27e's + trunkCatch and its note; laid route when takesTowerRoute OR legsLaid; floorUnder reads each floor's river at its own y (t-build-26's R-165.390 form) |
| reference/handoffs/engine-core.md, reference/specs/chain.md | both sections kept |

t-eng-27 merge (c5143db85): gates.yml CI tool line + storyTipScan.test.ts (union); engine-core.md both kept. tsc clean after each merge.
**Watch in the gates:** the two bot choices in firsttimer.ts (route, floorUnder) move castBots 2-7 vs BUILD-27g's rows and 1-4 vs
ENG-26u's rows if they move anything: compare both.

## What's New (packet step 2): approved by the lead, committed in 57d8b8ffb (session 2)
0.10.3, 'The Mailman's Route' (at most 4 lines, player words):
- New stage: The Mailman's Route. I post the letters, then race the mail boat home.
- Dot warns me before deep water, on every setting.
- The rivers run smoother.

## Gate table
Not run yet (the head is not final). Session 1 ran: tsc (clean on 8d094787c, b3195f31e, c5143db85, 4816edd31); the 2-6 test files on
8d094787c (7 reds, all the listed 2-6's re-pointed tests, fixed in 4816edd31 but for w2Arc26.test).

## Setup notes for session 2
- `npm ci` fails ERESOLVE: use `npm ci --no-audit --no-fund --legacy-peer-deps` (CI uses --legacy-peer-deps). `git fetch --unshallow` first.
- Worktrees: the release tree for merges and edits; a FROZEN `git worktree add --detach` per run, node_modules symlinked.

## Lessons applied
D92 (tsc after each merge; the CI tool line started on the 27e merge head), D111 (28-minute box), D113/D122 (background runs with
timeouts, no '&'), D115 (frozen worktrees for every run), D109 (no clock times to the lead). D119 only in part: two merge commits took
their message from a heredoc as the LAST link of an && chain (nothing after it depended on it; each commit checked by `git log` after);
session 2 uses `git commit -F <file>` instead.
Session 2 (INT-R5b): D92 (the CI line on the merged head before anything else; re-run after each fix merge), D111 (the 28-minute box:
hand-over at 3:10 PM ET, the commit's real time; first typed 3:19 PM, the box's end, D128), D113/D122 (every long run run_in_background with a timeout, waiting by a monitor, never a foreground wait,
never a shell '&'; the bisect waits for the CI job in its own background loop so buildcheck runs alone), D115 (every run on a detached
worktree nobody edits; THE FULL SET adds chattr +i), D119 (commit messages by -m flags only), D124 (run1.sh prints the candidate's own
shard plan for the per-list sums), D109 (no clock times to the lead). Slip, named: 57d8b8ffb's Claude-Session trailer names the lead's
session, not this one (pushed before it was seen; not rewritten, the branch is shared).
