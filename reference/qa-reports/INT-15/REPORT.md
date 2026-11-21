# INT-15 REPORT: the next release's integration (main + FIX-TAB + ENG-ROCK + 2-5)
Integration (Opus 5.5 xhigh), session_01FhBbYL5weS2PSfgDeDQ4kd. Branch t-int-15 from origin/main 107870f5 (0.10.0 live + PR #76).
Packet: reference/packets/2026-11-20/INT-15.md (on ccr-ea739a2f-dfcee4). Started 6:14 PM ET 11-20 (by `date`).

## EXACT NEXT STEP (kept current; written 8:13 PM ET)
DONE. THE FULL SET ran once on the final code head 0eefc707e (frozen worktree, 6:40-8:13 PM ET): every line PASS but funcheck, whose output
is IDENTICAL to main 107870f5's (the 22 ruled lines, 0 to lower, no 2-5 line). The table below; logs in gates/full/. Final hash: the commit
carrying this line (sent to the lead). Next is the lead's: the release-candidate steps (version + What's New from the draft below, the
test link rebuild), and the idle fix joins release 2 tomorrow (t-fix-idle, the lead's note; not taken here).

## Merge table (MERGED, never rebased; tsc + the CI tool line (gates.yml, CI=1) after each)
| # | Branch @ head | Merge commit | Conflicts | tsc | CI tool line |
|---|---|---|---|---|---|
| a | t-fix-tab @ e58fe40c | 88645a713 | none | PASS | PASS: 319 tests, 318 pass, 0 fail, 1 todo (6:17-6:22 PM ET; gates/a-toolline.log) |
| b | t-eng-rock @ fa2ef824 | bc53e1d80 (gated on ef3d3156f, the same merge in a side worktree: `git diff ef3d3156f bc53e1d80` = this report only) | none (protoArt.ts and HF-SPEND.md auto-merged: stepDownTo/faceCut and drawRockArt both present; HF-SPEND a union) | PASS | PASS: 319 tests, 318 pass, 0 fail, 1 todo (6:22-6:27 PM ET; gates/b-toolline.log) |
| c | t-build-25 @ 6ddeeead | 0eefc707e (gated on b75cc44a3, the same merge in a side worktree: `git diff b75cc44a3 0eefc707e` = this report only) | gates.yml tool line: kept main's 36 tool tests + snapperTaught.test.ts (37); tools/inspect/firsttimer.ts SKILLS: kept main's vineOverTail + 2-5's bonkBrake, letItSnap (keys only, both intents) | PASS | PASS: 332 tests, 331 pass, 0 fail, 1 todo (6:27-6:32 PM ET; gates/c-toolline.log; the todo is the standing chase-bots one) |

Auto-merged on (c), checked: src/game/gen2/provenIndex.ts keeps 2-1, 2-2, 2-4 and adds 2-5 (100, bf327cfd); engine-core.md.
No HF-SPEND.md conflict on (c) (t-build-25 does not touch it).

2-5 on the merged code builds as on t-build-25: layout 1 (seed 2) has the same 16 painted rocks at the same x (818, 1494, 1958, 3212,
3620, ...) on both heads (probe: a headless build of each, /home/user/int15-out/rocks2.mts).

## Item 2: stills (pushed UNOPENED for the lead; shot 6:35-6:38 PM ET on a dev server of b75cc44a3, whose code = the final head 0eefc707e)
reference/qa-reports/INT-15/stills/ (whole screen, 2x device pixels) and stills/crop2x/ (a 400x250-unit box round his feet, scaled 2x).
Shooter: FIX-TAB's frozen-clock page shooter (stills/logs/shoot.mjs, unchanged), Normal; every file name carries the seed the page
BUILT (stills/logs/shoot-*.log: the BUILT line, the platform he stands on, his feet). Not opened by me (the packet).
| Stage / layout (built seed) | Spots | Orientation | Notes (facts from the logs, not a judgement) |
|---|---|---|---|
| 2-5 L1 (seed 2) | x821, x1495 (`rock-left-edge-on-bank`) | sideways | your x's are each rock's left edge (rocks 818-934, 1494-1613): placed on the rock, he slid off onto the bank (feet 580, rock top 530) and stands overlapping the rock's left end; renamed so the file says so |
| 2-5 L1 (seed 2) | x1832, x3082, x3420 (`bank`) | sideways | on the bank 126 / 130 / 200 px before the rocks at 1958, 3212, 3620 |
| 2-5 L1 (seed 2) | x876, x1553, x2017, x3268, x3676 (`rock-centre`) | sideways | ADDED: him standing ON each of the first five rocks (feet 530 = the rock top): looks rock-b mirrored, boulder, rock-b mirrored, rock-a mirrored, boulder mirrored (assignRockLooks on this build) |
| 2-5 L1 (seed 2) | x876 (`rock-centre`, on rock-b), x1832 (`bank`) | upright | the one upright, plus the bank spot |
| 2-1 L1 (seed 2) | x5747 on the rock (5689-5804, rock-b) | both | ENG-ROCK's spot again |
| 2-2 L1 (seed 2) | x7405 on the rock (7348-7458, boulder mirrored) | both | ENG-ROCK's spot again |
| 2-4 L1 (seed 65370) | x4646 on the rock (4590-4702, rock-b) | both | ENG-ROCK's spot again |
| 1-6 L0 (seed 1) | x5977, on floor 36 (5827, top 1058: FACTS.md's floor) | sideways | FIX-TAB's tab spot; the crop holds world x 5775-6175, y 888-1138 (the tab was at 5792-5827, 1061-1081) |

The lead ACCEPTED the item 2 stills (message read 7:08 PM ET). The lead's one question, x3268 (him drawn see-through), checked 7:11 PM ET:
**NOT the stillness fade.** stills/logs/probe.mjs read the page at each of the five 2-5 rock spots after the shot's frames: cast on, still
true, covered false, moss (calmNow) 0, invincibleTimer 0 at every spot, x3268 included: the same state as the four solid ones. It is the
**idle clip's cross-fade** (src/game/heroSprite.ts:313-322: the plain pose drawn at 1-blend under the clip at blend, so mid-melt he is
partly see-through, two poses showing). Proof: the same spot and build shot fresh after 8, 20 and 40 settle frames
(stills/logs/x3268-settle-8-20-40.jpg): solid at 8 and 20, see-through with a doubled head at 40; the pushed still was shot later in the
page's clock (the 4th spot in a row). heroSprite.ts / heroClips.ts / heroStandard.ts are unchanged by these merges (on main as live).
NAMED for the lead (a game look, not tonight's): while he idles, a clip melting in or out shows him see-through for those frames.

## Item 3: THE FULL SET (gates.md D96) on 0eefc707e, frozen worktree /home/user/wt-final, 6:40-8:13 PM ET (three jobs side by side, then buildcheck ALONE on an idle machine; every line its own exit; logs gates/full/)
| Gate | Result |
|---|---|
| tsc | PASS (6:40:50 PM-6:41:01 PM ET, 11 s) |
| artcheck | PASS (6:41:01 PM-6:41:01 PM ET, 0 s) |
| vite build, deploy base (BASE_PATH=/Sloths-Adventure-/) | PASS (6:41:01 PM-6:41:12 PM ET, 11 s) |
| chunkcheck (CHUNKCHECK_BASE=/Sloths-Adventure-/) | PASS (6:41:12 PM-6:41:12 PM ET, 0 s) |
| knowncheck | PASS (6:41:12 PM-6:41:12 PM ET, 0 s) |
| generalitycheck | PASS (6:41:12 PM-6:41:13 PM ET, 1 s) |
| coveragecheck | PASS (6:41:13 PM-6:42:32 PM ET, 79 s) |
| roadmapcheck (repo unshallowed) | PASS (6:42:32 PM-6:42:36 PM ET, 4 s) |
| timecheck (repo unshallowed) | PASS (6:42:36 PM-6:42:38 PM ET, 2 s) |
| registrycheck | PASS (6:42:38 PM-6:43:47 PM ET, 69 s) |
| clipcheck | PASS (6:43:47 PM-6:55:42 PM ET, 715 s) |
| kbdcheck (its rewritten keyboard stills restored, never committed) | PASS (6:55:42 PM-6:58:00 PM ET, 138 s) |
| drawcheck (2-5 in its stage list) | PASS (6:58:00 PM-7:11:44 PM ET, 824 s) |
| the suite, 6 shards (deploy.yml's split) | PASS: 695 + 654 + 684 + 639 + 647 + 684 = **4,003 tests, 4,000 pass, 0 fail, 3 todo** (6:40-7:37 PM ET) |
| the CI tool line (gates.yml, CI=1; 37 tool tests incl. snapperTaught) | PASS (6:40:50 PM-6:54:30 PM ET, 820 s): 332 tests, 331 pass, 0 fail, 1 todo |
| every registered seed list --check (13, registrycheck --lists) | PASS 13/13, 0 refused each: 1-1 191 s; 1-2 79 s; 1-3 39 s; 1-4 196 s; 1-5 131 s; 1-6 858 s; 1-7 199 s; 1-8 41 s; 1-9 125 s; 2-1 302 s; 2-2 16 s; 2-4 541 s; 2-5 15 s |
| paintcheck 0/3, 1/3, 2/3 | PASS, PASS, PASS (269 / 359 / 341 s) |
| tipwalk --layouts 4 | PASS (7:56:13 PM-7:56:27 PM ET, 14 s) |
| tierBots | PASS (7:56:27 PM-7:59:23 PM ET, 176 s) |
| lockall --layouts 16 --check vs main 107870f5's lock --intended 2-5 | PASS (7:59:23 PM-8:06:44 PM ET, 441 s): **101/102 stages unchanged; only 2-5 (intended) moved**. The draw-only merges moved nothing |
| funcheck | **FAIL, exit 1, IDENTICAL to main**: the same run on main 107870f5 (gates/full/funcheck-main-107870f5.log) flags the same 22 worse/new lines (World 1's ruled debt), 0 to lower, 77 known; the two outputs differ only in run time; **2-5 lines: none**. Not in gates.yml |
| castBots 2-5, seeds 1-40, 5 bots x both settings | PASS (8:08:02 PM-8:12:58 PM ET, 296 s): adult / child / middle 40/40 on both settings, expert 40/40 Normal; kid 0/40 both (not the bar, level.md rule 4). **The same numbers as BUILD-25d's**, line for line (adult 160 / 165.8 s, child 379.6 / 281.9 s with 24 water lives on Normal, middle 204.5 / 203.3 s, expert 184.2 s) |
| npm run build:store | PASS (7:19:35 PM-7:19:43 PM ET, 8 s) |
| test-link count (tools/testlink/build.py) | PASS (8:12:58 PM-8:13:01 PM ET, 3 s): **479 files, limit 480: ONE file of room** (see Unresolved) |
| buildcheck, ALONE (load 0.9) | PASS (8:13:10 PM-8:13:15 PM ET, 5 s): Normal p95 86 ms, Easy p95 52 ms (limit 150) |

## Unresolved / named plainly
- **The test link is at 479 of its 480-file limit** (R-165.252's cap: the artifact holds 511 a version). The next release that adds a file
  (Pokey's new clips, the art batches) fails build.py. Not a fail today; it needs an owner before the next round grows the build.
- funcheck: World 1's 22 ruled lines, unchanged here (main's own output).
- The idle clip's see-through melt (x3268, above): a live game look on main, named for the lead; the fix (t-fix-idle) is release 2's.
- 2-5's flag sockets are dead on a rolled stage (BUILD-25d's pushback, carried; not this packet's).

## Lessons applied / method
- Merged, never rebased, in the packet's order; tsc + the CI tool line after EACH merge (D92); conflicts kept both intents (gates.yml's
  tool tests from both sides). Each merge was gated in a side worktree while the previous gate ran, then made again on t-int-15 and its
  tree checked equal (`git diff` = this report only), so no gate was skipped and the branch never held an ungated merge.
- Check the fact before acting (law 3): the lead's x list checked against the real build (rocks at 818/1494/1958/3212/3620); the x3268
  "stillness" reading checked on the page (it was the idle clip's cross-fade).
- Every clock time from `date` in the same command (D30); CI's UTC times converted with `date`, not by hand.
- THE FULL SET by name (D96), with funcheck judged by a same-run diff against main, not by its exit (BUILD-25d's method update).
- D99: the seed-list shards' CI times read from the last deploy run's own log stamps, per list.
Method update (proposed): integration.md / release.md: "gate a merge in a side worktree while the previous merge's tool line runs, then
re-make it on the branch and prove the tree equal by `git diff` (report files only)": it cut the three merges to 16 minutes.

## Release notes draft (player words; for the lead's approval; whatsNew.test caps checked: 3-8 lines (5), each <= 90 characters, no workshop word)
Title: **Count to four** (13 chars). Lines (characters | line | checked TRUE against):
| chars | line | checked |
|---|---|---|
| 84 | River Snappers is rebuilt: every snap stone bites on four, so I hop off before four. | TRUE: w2Arc25.ts ONE idea: 'every snap stone bites on four, so hop on one-two-three and be off before four'; stagePlan.ts 2-5 is rebuilt as the designed arc (stageTable.ts '2-5' kit w2-25; the hand-built 2-5 deleted) |
| 87 | The snappers keep the same count. Right after one snaps, a kick sends it paddling home. | TRUE: w2Arc25.ts: 'The snappers keep the SAME count (their snap on four): kick one right after it snaps and it paddles off downstream' (TURTLE: the kick only when open); stagePlan desc 'send the snappers home' |
| 73 | No snapper is ever hurt: a kicked one just paddles off downstream, huffy. | TRUE: w2Arc25.ts 'huffy, never hurt'; stagePlan.ts '2:purge' / PURGE_WORDS: World 2's snappers are only chased off ('Chase off'), nobody is hurt in World 2 |
| 83 | The river’s rocks come in three painted shapes now, and no two in a row look alike. | TRUE: rockLooks.ts ROCK_FRAMES[2] = the kit boulder + rock-a + rock-b; assignRockLooks: never the same look as the rock before it (rockLooks.test.ts); every 2-x stage's rocks |
| 81 | The ground under the forest’s stones and stumps is tidy now, with no stray grass. | TRUE: FIX-TAB: the grass tab (floor lip under a wall) under World 1's painted stones/stumps on 1-6 and 1-7, 100 -> 0 (protoArt.ts stepDownTo); 1-6 x5977 still |

## D99 / release.md 4b: CI's own time limits with 2-5's list added (CI times read from main's last deploy run, 44828148552, on 107870f5, 11-20 5:20-5:43 PM ET; per-list times from each seed-list job's log stamps)
Per seed list on a CI runner: 1-1 2:00, 1-2 0:58, 1-3 0:27, 1-4 2:03, 1-5 1:22, 1-6 8:53, 1-7 3:27, 1-8 0:33, 1-9 1:31, 2-1 5:27, 2-2 0:14,
2-4 7:15; 2-5 is new (here 15 s in the full set, the same as 2-2's 16 s; 2-2 is 0:14 on CI). With 2-5 the registry makes **4 shards** (registrycheck --shards: [1,2,3,4]), each about 1 min of setup plus:
| Seed-list shard (4 on this head) | Lists | Expected CI time | Limit | Share |
|---|---|---|---|---|
| 1/4 | 1-1 1-8 2-4 | 9:48 + ~1 setup = ~11 min | 45 | 24% |
| 2/4 | 1-5 1-7 2-2 | 5:03 + ~1 = ~6 min | 45 | 13% |
| 3/4 | 1-2 1-4 1-9 2-5 | 4:32 + 2-5 (~0:15-0:20: here 15 s, the same as 2-2's 16 s, which is 0:14 on CI) + ~1 = ~6 min | 45 | 13% |
| 4/4 | 1-3 1-6 2-1 | 14:47 + ~1 = ~16 min | 45 | 36% |
The other jobs with a limit (main's run, minutes): gates 10.8 / 25 (43%), drawcheck 11.4 / 30 (38%; +2-5's two builds), seedplan 0.8 / 10,
paintcheck 7.5 / 9.2 / 6.9 of 25 (max 37%; 2-5 joins one part), rolled 10.9 / 60 (18%; + snapperTaught.test). deploy.yml's jobs carry no
timeout-minutes (GitHub's 360-min default); its longest test shard was 15.7 min. **No job is within 20% of its limit: nothing to raise or split.**
