# INT-15 REPORT: the next release's integration (main + FIX-TAB + ENG-ROCK + 2-5)
Integration (Opus 5.5 xhigh), session_01FhBbYL5weS2PSfgDeDQ4kd. Branch t-int-15 from origin/main 107870f5 (0.10.0 live + PR #76).
Packet: reference/packets/2026-11-20/INT-15.md (on ccr-ea739a2f-dfcee4). Started 6:14 PM ET 11-20 (by `date`).

## EXACT NEXT STEP (kept current; written 6:23 PM ET)
Merge (a) is on t-int-15 and PASSED tsc + the CI tool line. Merges (b) and (c) are committed in side worktrees (ef3d3156f, b75cc44a3),
each with tsc PASS; (b)'s CI tool line is running (started 6:22 PM ET). Next: (b) tool line PASS -> fast-forward t-int-15 to ef3d3156f,
push; then (c)'s CI tool line on b75cc44a3 -> fast-forward, push; then the stills (item 2) and THE FULL SET (item 3).

## Merge table (MERGED, never rebased; tsc + the CI tool line (gates.yml, CI=1) after each)
| # | Branch @ head | Merge commit | Conflicts | tsc | CI tool line |
|---|---|---|---|---|---|
| a | t-fix-tab @ e58fe40c | 88645a713 | none | PASS | PASS: 319 tests, 318 pass, 0 fail, 1 todo (6:17-6:22 PM ET; gates/a-toolline.log) |
| b | t-eng-rock @ fa2ef824 | ef3d3156f (side worktree) | none (protoArt.ts and HF-SPEND.md auto-merged: stepDownTo/faceCut and drawRockArt both present; HF-SPEND a union) | PASS | running |
| c | t-build-25 @ 6ddeeead | b75cc44a3 (side worktree) | gates.yml tool line: kept main's 36 tool tests + snapperTaught.test.ts (37); tools/inspect/firsttimer.ts SKILLS: kept main's vineOverTail + 2-5's bonkBrake, letItSnap (keys only, both intents) | PASS | pending |

Auto-merged on (c), checked: src/game/gen2/provenIndex.ts keeps 2-1, 2-2, 2-4 and adds 2-5 (100, bf327cfd); engine-core.md.
No HF-SPEND.md conflict on (c) (t-build-25 does not touch it).
