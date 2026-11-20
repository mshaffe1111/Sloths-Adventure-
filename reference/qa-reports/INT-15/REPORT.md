# INT-15 REPORT: the next release's integration (main + FIX-TAB + ENG-ROCK + 2-5)
Integration (Opus 5.5 xhigh), session_01FhBbYL5weS2PSfgDeDQ4kd. Branch t-int-15 from origin/main 107870f5 (0.10.0 live + PR #76).
Packet: reference/packets/2026-11-20/INT-15.md (on ccr-ea739a2f-dfcee4). Started 6:14 PM ET 11-20 (by `date`).

## EXACT NEXT STEP (kept current; written 6:29 PM ET)
Merges (a) and (b) are on t-int-15 and PASSED tsc + the CI tool line. Merge (c) is committed in a side worktree (b75cc44a3, tsc PASS);
its CI tool line is running there (started 6:27 PM ET). Next: (c) tool line PASS -> the same merge on t-int-15 (tree checked equal to
b75cc44a3 but for this report), push; then the stills (item 2) and THE FULL SET (item 3). main's lockall record is running
(/home/user/wt-main, --layouts 16, for `lockall --check --intended 2-5`).

## Merge table (MERGED, never rebased; tsc + the CI tool line (gates.yml, CI=1) after each)
| # | Branch @ head | Merge commit | Conflicts | tsc | CI tool line |
|---|---|---|---|---|---|
| a | t-fix-tab @ e58fe40c | 88645a713 | none | PASS | PASS: 319 tests, 318 pass, 0 fail, 1 todo (6:17-6:22 PM ET; gates/a-toolline.log) |
| b | t-eng-rock @ fa2ef824 | bc53e1d80 (gated on ef3d3156f, the same merge in a side worktree: `git diff ef3d3156f bc53e1d80` = this report only) | none (protoArt.ts and HF-SPEND.md auto-merged: stepDownTo/faceCut and drawRockArt both present; HF-SPEND a union) | PASS | PASS: 319 tests, 318 pass, 0 fail, 1 todo (6:22-6:27 PM ET; gates/b-toolline.log) |
| c | t-build-25 @ 6ddeeead | b75cc44a3 (side worktree) | gates.yml tool line: kept main's 36 tool tests + snapperTaught.test.ts (37); tools/inspect/firsttimer.ts SKILLS: kept main's vineOverTail + 2-5's bonkBrake, letItSnap (keys only, both intents) | PASS | pending |

Auto-merged on (c), checked: src/game/gen2/provenIndex.ts keeps 2-1, 2-2, 2-4 and adds 2-5 (100, bf327cfd); engine-core.md.
No HF-SPEND.md conflict on (c) (t-build-25 does not touch it).
