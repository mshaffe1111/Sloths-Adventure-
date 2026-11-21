# REL-0101 REPORT: release 2 = 0.10.1 "Count to four" (the candidate, THE FULL SET, the PR body)
Release member, session_01FhBbYLMy4W3acXCBoim6nH. Packet reference/packets/2026-11-21/REL-0101.md. Started 9:35 AM ET 11-21 (by `date`).
**GATED HEAD 0e8cf8452** (THE FULL SET, 11:47 AM-1:01 PM ET 11-21, frozen worktree). **Final hash: the commit carrying this report**; every commit
after 0e8cf8452 touches only reference/qa-reports/REL-0101/ (proven by `git diff --stat`; timecheck + roadmapcheck + tsc re-run on the final).
EXACT NEXT STEP: none in this packet. Next is the lead's: republish Matt's test link from this branch, open the PR (PR.md) on Matt's "push".

## Merge table (MERGED --no-ff, never rebased; tsc + the CI tool line (gates.yml, CI=1) after EACH, D92)
| # | Branch @ head | Merge | Conflicts and resolution | tsc | CI tool line (tests/pass/fail/todo) |
|---|---|---|---|---|---|
| a | t-int-15 @ 23ac2e4bc | 08fe52244 | none (tree = 23ac2e4bc) | PASS | PASS 332/331/0/1 |
| b | t-fix-idle @ 9763d4f39 | ab621d1df | handoffs/engine-core.md: both added a top section; kept both (0zr-IDLE above 0zq-TAB) | PASS | PASS 332/331/0/1 |
| c | t-env-w2 @ 63afa83c1 | 60aea887b | none | PASS | PASS 332/331/0/1 |
| d | t-link-room @ 4c1601fd3 | 8224efdeb | none | PASS | PASS 336/335/0/1 |
| e | t-keeper-pick @ 599c4d5b3 (carries t-pick-w1 @ ef5622725) | a8824ad4a | engine-core.md again: kept both (0zq-PICK above 0zr-IDLE; each section once) | PASS | PASS 336/335/0/1 |
| f | t-hud-vine @ 83b51c91f | 008d82625 | none | PASS | PASS 336/335/0/1 |
| g | t-pick-thumbs @ 77a84713e (carries t-keeper-pick) | 933203aa5 | none; the corrected PICK-W1:99 line kept | PASS | PASS 336/335/0/1 |
| v | version + What's New | 6b8fda31c | 0.10.1 in package.json + package-lock's own 2 fields; the keeper's 7 lines by script, title "Count to four" | PASS | whatsNew.test 4/4 |
| t | timecheck fix (the lead's ruling) | 051e77b45 | PICK-W1 REPORT:99 "The lead (9:26 PM ET)" (2:12 after its commit 1b5d2fff8) -> "(11-20, before 9:24 PM ET; first typed 9:26 PM)" | | timecheck PASS |
The todo every time: the open chase-bots line (ENG-B4). Rulings: HUD-VINE and PICK-THUMBS ship with no What's New line (the lead).

## Gate table: THE FULL SET on 0e8cf8452 (gates.md D96; logs gates/, one line per gate in gates/table.md)
| Gate | Verdict |
|---|---|
| tsc, artcheck, vite build (BASE_PATH /Sloths-Adventure-/) + chunkcheck, knowncheck, generalitycheck | PASS each |
| coveragecheck 153 s, roadmapcheck (unshallowed), timecheck (unshallowed), registrycheck (13 stages) 118 s | PASS each |
| clipcheck (CI=1) 707 s, 83 known / kbdcheck (CI=1) 138 s / drawcheck 793 s / npm run build:store | PASS each |
| the suite, 6 shards (deploy.yml's split) | PASS: 629 + 704 + 628 + 552 + 766 + 738 = **4,017 tests, 4,014 pass, 0 fail, 3 todo** |
| the CI tool line (gates.yml, CI=1) | PASS: 336 tests, 335 pass, 0 fail, 1 todo |
| every registered seed list --check (13; s, under load) | PASS 13/13, 0 refused each: 1-1 328, 1-2 87, 1-3 42, 1-4 219, 1-5 251, 1-6 1033, 1-7 301, 1-8 63, 1-9 170, 2-1 386, 2-2 15, 2-4 551, 2-5 16 |
| paintcheck 0/3, 1/3, 2/3 | PASS each (1,058 / 622 / 592 s) |
| tipwalk --layouts 4 / tierBots | PASS / PASS 9/9 |
| lockall --layouts 16 --check vs main 107870f5's lock (recorded 9:58-10:06 AM ET) --intended 2-5 | PASS: **101/102 unchanged; only 2-5 (intended) moved** |
| funcheck (BUILD-25d's method: a same-run diff vs main) | **FAIL, exit 1, IDENTICAL to main 107870f5's run in the same chain**: 22 worse/new, 0 to lower, 77 known, 1,067 flags; the logs differ only in run time (124 s / 104 s). Not in gates.yml |
| castBots 2-5, seeds 1-40, 5 bots x both | PASS: adult / child / middle 40/40 both, expert 40/40 Normal, kid 0/40 (not the bar); the same numbers as INT-15 line for line (adult 160 / 165.8 s; child 379.6 / 281.9 s, 24 water lives Normal) |
| test-link count (build.py, LINK-ROOM's floor 40 free) | PASS: **408 files of 480, 72 free**, largest 10.4 MB (limit 13) |
| buildcheck, ALONE (after every chain ended) | PASS: Normal p95 103 ms, Easy p95 58 ms (budget 150) |

## D99: CI's own time limits (release.md 4b): no job within 20% of its limit, nothing to raise or split
Per-list CI times from main 107870f5's gates run 44828148552 (job logs, the "== <stage>" lines), min: 1-1 2.0, 1-6 8.9, 1-9 1.5, 2-4 7.2, 1-4 2.1,
1-5 1.4, 1-8 0.6, 2-2 0.2, 1-2 1.0, 1-3 0.5, 1-7 3.4, 2-1 5.5; setup 0.6-1.2. 2-5 new (~0.5). Candidate plan (registrycheck --shards): 13 lists, 4 shards.
| CI job (limit) | expected on a runner | share |
|---|---|---|
| seedlists 1/4 1-1 1-8 2-4 (45) / 2/4 1-5 1-7 2-2 / 3/4 1-2 1-4 1-9 2-5 | 11.0 / 6.2 / 6.3 min | 24% / 14% / 14% |
| seedlists 4/4 1-3 1-6 2-1 (45) | 16.1 min (24.8 if 1-6 runs as 0.10.0's 17.6) | 36% (55%) |
| gates (25) / drawcheck (30) / paintcheck max (25) / rolled (60) / seedplan (10) | main 10.8 / 11.4 / 9.2 / 10.9 / 0.8 min (+2 clipcheck judges, +4 tool tests) | 43% / 38% / 37% / 18% / 8% |

## Pushback / misses (named plainly)
- Gate red caught before the PR: timecheck on PICK-W1 REPORT:99 (a typed-ahead time in a report-only commit after PICK-W1's gated head); fixed on the lead's ruling.
- My own miss: one message to the lead carried a typed hash (93b61d6b5), not the pushed 30787afc3; corrected next message; hashes pasted since.
- Load: 4 chains on 4 cores ran at load 7-18; nothing went red from it, but times above are under load (CI's own times used for D99).

## Suggestions (ready packets; outside my walls)
1. gates.md / dispatch-packet.md: "timecheck + roadmapcheck run on the FINAL hash, report commits included" (a member's report is judged by CI).
2. R-165.352 (shard by measured time): use the per-list CI times above (registrycheck could read them from the job log the same way).

## Lessons applied
D86 (the suite line names 6 shards and its totals), D92 (tsc + tool line after each of 7 merges), D93 (a verdict word per gate; funcheck judged by
its same-run diff, not called green), D94 (lockall/funcheck against the integration base main 107870f5), D96 (every gates.yml line by name), D99
(CI limits from CI's own logs), D102 (read lean: greps and line ranges), D103 (rulings read as they came), D109 (no clock times in messages).
Turnover note: none named by the packet or the retired card; the method notes are Suggestions 1-2. PR body: PR.md (not opened).
