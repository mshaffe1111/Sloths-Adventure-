# REL-0101 REPORT: release 2 = 0.10.1 "Count to four" (the candidate, THE FULL SET, the PR body)
Release member, session_01FhBbYLMy4W3acXCBoim6nH. Packet reference/packets/2026-11-21/REL-0101.md (ccr-ea739a2f-dfcee4). Started 9:35 AM ET 11-21.
Branch release-0.10.1 from origin/main 107870f5d. Times from `TZ=America/New_York date`.

## EXACT NEXT STEP (kept current)
10:21 AM ET: merges a-e and the version commit are in, each green (6b8fda31c, pushed). Waiting on t-hud-vine's final (cutoff 11:30 AM ET);
then THE FULL SET on the exact head. Seed lists timed alone on 6b8fda31c meanwhile (early, for the D99 table).
Lead rulings: 10:25 AM ET, HUD-VINE ships with NO What's New line (the keeper's 7 stand). 10:33 AM ET (Matt 10:28, R-165.368): PICK-THUMBS
(picture tiles, 'what the game is about', 'how to start'; base t-keeper-pick 599c4d5b3; about 12:30 PM ET) goes INTO release 2; THE FULL SET
HOLDS for its hash (the 11:30 start-without rule withdrawn); no What's New line (page-only). Meanwhile: a TRIAL of the slow gates on
6b8fda31c (early warning, not the set), the D99 table, the PR body draft.
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
| e | t-keeper-pick @ 599c4d5b3 (the lead's final, 10:08 AM ET; words head 1fdf0a144; carries t-pick-w1 @ ef5622725) | a8824ad4a | reference/handoffs/engine-core.md: PICK-W1 and FIX-IDLE each added a top section; kept both, 0zq-PICK above 0zr-IDLE (each section once, checked) | PASS | PASS: 336 / 335 / 0 / 1 todo (10:17-10:21 AM ET) |
| f | t-hud-vine @ 83b51c91f (the lead's final, 10:40 AM ET; code 2e3b17c99) | 008d82625 | none | PASS | PASS: 336 / 335 / 0 / 1 todo (10:39-10:54 AM ET, under the trial's load) |
| v | version + What's New (not a merge) | 6b8fda31c | 0.10.0 -> 0.10.1 in package.json and package-lock's own two fields (as 0.10.0 did); whatsNew.ts top entry = the keeper's 7 lines, title "Count to four", copied by script from whats-new-0.10.1.md | PASS | whatsNew.test PASS 4/4 |
| t | timecheck correction (not a merge; the lead's ruling) | 051e77b45 | reference/qa-reports/PICK-W1/REPORT.md:99 only: "The lead (9:26 PM ET)" (2:12 after its commit 1b5d2fff8, a typed-ahead stamp in the lead's message) -> "The lead (11-20, before 9:24 PM ET; first typed 9:26 PM)" | | timecheck PASS (112 commits, 110 stamps) |
The todo each time: the open chase-bots line (child bot, Normal, 1 of 3 seeds; ENG-B4).

## D99: CI's own time limits (release.md 4b), with the new seed-list plan
Per-list CI times are read from main 107870f5's own gates run (run 44828148552, 11-20 5:21-5:43 PM ET; job logs, the "== <stage>" line
times): 1-1 2.0, 1-6 8.9, 1-9 1.5, 2-4 7.2 | 1-4 2.1, 1-5 1.4, 1-8 0.6, 2-2 0.2 | 1-2 1.0, 1-3 0.5, 1-7 3.4, 2-1 5.5 min; setup 0.6-1.2 min.
lockall: only 2-5 moved, so the other twelve lists' work is main's. 2-5 is new to the lists (about 0.5 min, from its 15 s locally in INT-15).
The candidate's plan (registrycheck --shards --print): 13 lists in 4 shards (main: 12 lists in 3).
| CI job | limit | expected on a runner | share | verdict |
|---|---|---|---|---|
| seedlists 1/4: 1-1 1-8 2-4 | 45 | 9.8 + 1.2 setup = 11.0 min | 24% | PASS |
| seedlists 2/4: 1-5 1-7 2-2 | 45 | 5.0 + 1.2 = 6.2 min | 14% | PASS |
| seedlists 3/4: 1-2 1-4 1-9 2-5 | 45 | 5.1 + 1.2 = 6.3 min | 14% | PASS |
| seedlists 4/4: 1-3 1-6 2-1 | 45 | 14.9 + 1.2 = 16.1 min (24.8 if 1-6 runs as slow as 0.10.0's 17.6) | 36% (55%) | PASS |
| gates (tsc ... clipcheck, kbdcheck) | 25 | main 10.8 min; this release adds 2 clipcheck judges + 1 kbdcheck pick | 43% | PASS |
| drawcheck | 30 | main 11.4 min (no new scenario) | 38% | PASS |
| paintcheck 0/1/2 | 25 | main 7.5 / 9.2 / 6.9 min | 37% max | PASS |
| rolled (tool line, tipwalk, registrycheck, tierBots, buildcheck) | 60 | main 10.9 min (+4 tool tests) | 18% | PASS |
| seedplan | 10 | main 0.8 min | 8% | PASS |
| deploy test shards 1-6 | none set (GitHub's 360) | main 5.4-15.7 min | 4% | PASS |
No job is within 20% of its limit: nothing to raise or split.

## Trial (early warning, NOT the set): the slow gates on 6b8fda31c (merges a-e + version), 10:31-11:32 AM ET, 3 chains at once
Every line PASS but two: timecheck FAIL (the PICK-W1:99 stamp, fixed in 051e77b45, PASS after) and funcheck FAIL, IDENTICAL to main
107870f5's run in the same hour (22 worse/new, 0 to lower, 77 known, 1,067 stage-layout flags; the two logs differ only in run time).
Suite 6 shards: 759 + 625 + 537 + 789 + 698 + 606 = 4,014 tests, 4,011 pass, 0 fail, 3 todo. lockall --intended 2-5: 101/102 unchanged.
castBots 2-5 1-40 x 5 bots x both: the same numbers as INT-15's / BUILD-25d's, line for line (adult 160 / 165.8 s; child 379.6 / 281.9 s,
24 water lives on Normal; middle 204.5 / 203.3 s; expert 184.2 s; kid 0/40, not the bar). clipcheck 963 s, kbdcheck, drawcheck 793 s,
paintcheck 0/1/2, tipwalk, tierBots, coveragecheck, registrycheck, roadmapcheck, build:store: PASS. Not in the trial: seed lists, tool
line (run after each merge instead), test-link count, buildcheck.
