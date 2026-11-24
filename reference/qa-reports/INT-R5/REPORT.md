# INT-R5 REPORT: release 4 (0.10.3) candidate, release-0.10.3

Session 1: started 2:31 PM ET 11-24 (by `date`), handed over at the 28-minute box. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.

## EXACT NEXT STEP (session 2 starts here)
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

## What's New draft (packet step 2): NOT committed, to the lead first
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
