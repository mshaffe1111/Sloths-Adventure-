# REL-0101 REPORT: release 2 = 0.10.1 "Count to four" (the candidate, THE FULL SET, the PR body)
Release member, session_01FhBbYLMy4W3acXCBoim6nH. Packet reference/packets/2026-11-21/REL-0101.md (ccr-ea739a2f-dfcee4). Started 9:35 AM ET 11-21.
Branch release-0.10.1 from origin/main 107870f5d. Times from `TZ=America/New_York date`.

## EXACT NEXT STEP (kept current)
9:58 AM ET: the first four merges are in, each green. Waiting on the lead for the t-keeper-pick and t-hud-vine hashes (cutoff 11:30 AM ET).
Early reads on 8224efdeb (not the final set): lockall vs main 107870f5's lock (recorded 9:58-10:06 AM ET, 3,264 builds of 102 stages)
--intended 2-5 PASS, 101/102 unchanged, only 2-5 moved (10:06-10:14 AM ET); funcheck the same as main's, run side by side (22 worse/new, 77 known;
the two logs differ only in run time, 82 s vs 83 s).

## Merge table (MERGED with --no-ff, never rebased; tsc + the CI tool line (gates.yml, CI=1) after EACH, D92)
| # | Branch @ head | Merge commit | Conflicts | tsc | CI tool line |
|---|---|---|---|---|---|
| a | t-int-15 @ 23ac2e4bc | 08fe52244 | none (tree = 23ac2e4bc) | PASS | PASS: 332 tests, 331 pass, 0 fail, 1 todo (9:38-9:43 AM ET) |
| b | t-fix-idle @ 9763d4f39 | ab621d1df | reference/handoffs/engine-core.md: both added a top section; kept both, 0zr-IDLE above 0zq-TAB | PASS | PASS: 332 / 331 / 0 / 1 todo (9:43-9:48 AM ET) |
| c | t-env-w2 @ 63afa83c1 | 60aea887b | none | PASS | PASS: 332 / 331 / 0 / 1 todo (9:48-9:53 AM ET) |
| d | t-link-room @ 4c1601fd3 | 8224efdeb | none | PASS | PASS: 336 / 335 / 0 / 1 todo (9:53-9:58 AM ET) |
The todo each time: the open chase-bots line (child bot, Normal, 1 of 3 seeds; ENG-B4).
