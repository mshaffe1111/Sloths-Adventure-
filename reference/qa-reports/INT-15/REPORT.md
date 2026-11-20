# INT-15 REPORT: the next release's integration (main + FIX-TAB + ENG-ROCK + 2-5)
Integration (Opus 5.5 xhigh), session_01FhBbYL5weS2PSfgDeDQ4kd. Branch t-int-15 from origin/main 107870f5 (0.10.0 live + PR #76).
Packet: reference/packets/2026-11-20/INT-15.md (on ccr-ea739a2f-dfcee4). Started 6:14 PM ET 11-20 (by `date`).

## EXACT NEXT STEP (kept current; written 6:33 PM ET)
All three merges are on t-int-15 and each PASSED tsc + the CI tool line; the final code head is 0eefc707e (its code tree = b75cc44a3,
where (c) was gated). Next: item 2 (the stills, from a dev server on the b75cc44a3 worktree, pushed unopened) and item 3 (THE FULL SET on
a frozen worktree at 0eefc707e). main's lock is recorded (/home/user/int15-out/lockall-main-107870f5.json, 3,264 builds of 102 stages,
6:23-6:32 PM ET) for `lockall --check --intended 2-5`. Early check: `seedlist 2-5 --check` on the merged code PASS (0 of 100 refused).

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
