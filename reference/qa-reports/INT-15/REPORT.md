# INT-15 REPORT: the next release's integration (main + FIX-TAB + ENG-ROCK + 2-5)
Integration (Opus 5.5 xhigh), session_01FhBbYL5weS2PSfgDeDQ4kd. Branch t-int-15 from origin/main 107870f5 (0.10.0 live + PR #76).
Packet: reference/packets/2026-11-20/INT-15.md (on ccr-ea739a2f-dfcee4). Started 6:14 PM ET 11-20 (by `date`).

## EXACT NEXT STEP (kept current; written 7:07 PM ET)
THE FULL SET is running on the frozen worktree /home/user/wt-final at 0eefc707e (three jobs, started 6:40 PM ET; logs in
/home/user/int15-out/gates/, one PASS/FAIL line each in summary-1/2/3.txt). Green so far: tsc, artcheck, vite build (deploy base),
chunkcheck, knowncheck, generalitycheck, coveragecheck, roadmapcheck, timecheck, registrycheck, clipcheck, kbdcheck, suite shards 1-2 of 6,
the CI tool line, seed lists 1-1..1-5. Still to land: drawcheck, suite shards 3-6, seed lists 1-6..2-5, paintcheck 0-2/3, tipwalk,
tierBots, lockall --intended 2-5, funcheck, castBots 2-5, the test-link count; then build:store and buildcheck ALONE. If stopped: rerun
the missing lines with /home/user/int15-out/job*.sh's own commands on 0eefc707e.

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

## D99 / release.md 4b: CI's own time limits with 2-5's list added (CI times read from main's last deploy run, 44828148552, on 107870f5, 11-20 5:20-5:43 PM ET; per-list times from each seed-list job's log stamps)
Per seed list on a CI runner: 1-1 2:00, 1-2 0:58, 1-3 0:27, 1-4 2:03, 1-5 1:22, 1-6 8:53, 1-7 3:27, 1-8 0:33, 1-9 1:31, 2-1 5:27, 2-2 0:14,
2-4 7:15; 2-5 is new (here: 19 s on the merged code, about as long as 2-2 here; CI estimate below from the same-run ratio once job 3's
lists finish). With 2-5 the registry makes **4 shards** (registrycheck --shards: [1,2,3,4]), each about 1 min of setup plus:
| Seed-list shard (4 on this head) | Lists | Expected CI time | Limit | Share |
|---|---|---|---|---|
| 1/4 | 1-1 1-8 2-4 | 9:48 + ~1 setup = ~11 min | 45 | 24% |
| 2/4 | 1-5 1-7 2-2 | 5:03 + ~1 = ~6 min | 45 | 13% |
| 3/4 | 1-2 1-4 1-9 2-5 | 4:32 + 2-5 + ~1 = ~6-7 min | 45 | ~15% |
| 4/4 | 1-3 1-6 2-1 | 14:47 + ~1 = ~16 min | 45 | 36% |
The other jobs with a limit (main's run, minutes): gates 10.8 / 25 (43%), drawcheck 11.4 / 30 (38%; +2-5's two builds), seedplan 0.8 / 10,
paintcheck 7.5 / 9.2 / 6.9 of 25 (max 37%; 2-5 joins one part), rolled 10.9 / 60 (18%; + snapperTaught.test). deploy.yml's jobs carry no
timeout-minutes (GitHub's 360-min default); its longest test shard was 15.7 min. **No job is within 20% of its limit: nothing to raise or split.**
