# INT-R5 REPORT: release 4 (0.10.3) candidate, release-0.10.3

Session 1: started 2:31 PM ET 11-24 (by `date`), handed over at the 28-minute box. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.

## EXACT NEXT STEP (session 4 starts here)
Session 3 (INT-R5c): started 3:20 PM ET 11-24 (by `date`). Head: release-0.10.3 = see `git log -1 origin/release-0.10.3` (session 3
pushed 41cb842a1 part 3, 575022e30 the stamp fix, 86aad83a7 the FILL-14b merge, 6c1740d2b the TEACH-11 merge, 90faac0ba (ENG-PLANT's
two REPORT-only commits merged in), then REPORT-only commits). In order:
0. **Setup (session 3 lost 2 minutes here):** a release tree (`git worktree add -b release-0.10.3 <dir> origin/release-0.10.3`), then
   `npm ci --no-audit --no-fund --legacy-peer-deps` (plain `npm ci` fails ERESOLVE: no node_modules at all), then
   `git fetch --unshallow origin` (timecheck and blame need it; about 2 minutes, in the background).
1. **TEACH-11 is MERGED (6c1740d2b, tsc clean).** If session 3's run on frozen 90faac0ba is not in "Session 3: results" below, run it:
   the CI tool line (gates.yml:157 read live; expect 384 tests with teachFirstScan.test, the same 6 ENG-PLANT reds + the chaseBots todo),
   `npx tsx tools/engine/teachFirstScan.ts --check --seeds 20` (CI's form) and `npx tsx tools/engine/seedlist.ts 1-1 --check`.
2. **ENG-PLANT (lands ON release-0.10.3 itself, about 5:30 PM ET):** `git pull` the release tree; tsc + the CI tool line on a frozen copy:
   **0 FAIL** is the bar (the todo chaseBots :110 aside). If any red: stop and send it to the lead (no re-plant here, LAWS 22).
3. **THE FULL SET, once, on the final head** (session 2's step 3 below is the recipe: frozen worktree + chattr, run1.sh then run2.sh, both
   run_in_background with timeout 7,200,000 ms, never a shell '&'; bars there). rowWheels is gone from the line (part 3). ADD to run1.sh
   before it runs: `g teachfirst "npx tsx tools/engine/teachFirstScan.ts --check"` (every seed: the lead's ruling, CI runs --seeds 20) and
   make lockall's `--intended 2-7,1-4` also cover TEACH-11's 18 hint-only stages (their list and how TEACH-11 ran lockall:
   reference/qa-reports/TEACH-11/REPORT.md; read lockall.ts's --intended first);
   the lead's ruling: lockall vs main's intended moves are 2-7, 1-4's fill, and TEACH-11's 18 hint-only moves; NAME EACH in the table.
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
| 90faac0ba (TEACH-11 merged + ENG-PLANT REPORT commits) | the CI tool line, teachFirstScan --check --seeds 20, seedlist 1-1 --check | RUNNING at session 3's box (results below when in) |

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
