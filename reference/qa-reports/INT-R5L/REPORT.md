# INT-R5L REPORT: release 4 (0.10.3) = release-0.10.3-lite (main cdffdc627 + t-fix-sidewall + t-fix-soil), Matt's option A

Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Integration: INT-R5d-c. Matt chose A on 11-25 (the lead's message): release 4 ships main + the two
draw fixes; 2-7 and the bot fix wait (release-0.10.3 stays at c73cb9766, release 5's line; its red: INT-R5/REPORT.md on
release-0.10.3-wip-fixes, d/rule28/). The PR is from release-0.10.3-lite; the LEAD opens it on Matt's word.

## EXACT NEXT STEP (written 7:30 PM ET 11-25 by `date`)
**THE FULL SET on code head 2b5f0d6c8 is DONE: every gate GREEN** (funcheck's accepted debt, identical flag for flag to INT-14's ruled
table, as every release since 0.9.5; table below). The integration's part is over. The LEAD builds Matt's test link from
release-0.10.3-lite, asks Matt for 'push', and opens the PR from release-0.10.3-lite (methods/release.md; name funcheck's 22 in the
body, step 7). This branch's later commits are reference/ only (this REPORT, d/).

## Gate table: THE FULL SET on 2b5f0d6c8 (frozen /home/user/int-l2b, chattr +i src tools, proven writable; main /home/user/int-main
at cdffdc627, frozen; lanes per tools/lane.sh, every run_in_background with timeout 7,200,000 ms; summaries in d/fullset-*.txt)
| gate | result |
|---|---|
| `npx tsc --noEmit -p .` | PASS (20 s) |
| the CI tool line (gates.yml:157, read live on this head) | PASS: 357 tests, 356 pass, **0 fail**, 1 todo (chaseBots :110). FIX-SOIL-b's unrun CI line counts here |
| the unit suite, 3 shards (run2.sh) | PASS: 4,042 tests, 4,039 pass, **0 fail**, 3 todo (586 + 1004 + 465 s). pacerLay: NOT on main (no pacer test in this tree; it came with the pulled bot work), so its 23/23 bar does not apply |
| `BASE_PATH=/Sloths-Adventure-/ npx vite build` + chunkcheck | PASS + PASS |
| artcheck, knowncheck, generalitycheck, roadmapcheck, timecheck | PASS each |
| coveragecheck, registrycheck, tipwalk --layouts 4 | PASS each |
| drawcheck | PASS (1062 s; 1-4 and 2-6 scenarios; FIX-SOIL-b's unrun drawcheck counts here) |
| clipcheck | PASS, 83 known, none new (1277 s) |
| kbdcheck | PASS (132 s) |
| buildcheck (LAST and ALONE, nothing else running) | PASS: normal p95 109 ms, easy p95 68 ms (30 builds each, CPU x4) |
| npm run build:store; the slot confirm | PASS; SLOT CONFIRM PASS |
| paintcheck --part 0/3, 1/3, 2/3 (sideWall and soilOvers, no known list for either) | PASS 3/3; 0 SIDE-ON, 0 SOIL OVER in every part (the fall-through rule: known ids only, 0 new) |
| seedlist --check, every listed stage (14 lists, 1-1 in it) | PASS (3429 s) |
| lockall --layouts 4 --check vs main's lock (made on frozen cdffdc627), NO --intended | PASS: **102/102 stages unchanged** (zero moves, as the two draw fixes should) |
| rule 28 vs MAIN (D132): castBots seeds 1-40, kid adult child middle expert, both settings, 2-1 2-2 2-4 2-5 1-4 | PASS: 1,800 rows, **IDENTICAL to main** (differ 0, PASS -> FAIL 0, fail -> pass 0; d/flips.txt, d/rows-head/) |
| castBots 1-4 seeds 1-100 (run1's line) | exit 0; main's own 1-4 (rows 1-40 identical to main): adult N 99, E 100; child N 24, E 37; middle N 58, E 59; expert N 63; every-bot 7/100. Not a bar here (the release's 1-4 relist is not in A); 1-4's bar is its seed list, PASS above |
| tierBots.test (200 calibration runs replay; child/middle/expert vs the testers on 1-1) | PASS 9/9 (188 s) |
| funcheck + fundiff | funcheck FAIL as on main (22 worse or new, 0 to lower or delete, 77 known); fundiff **IDENTICAL 22/22** to INT-14's ruled debt (main 2a87f4cda): the accepted debt, named in the PR (release.md step 7) |
| release.md 4b (CI time limits) | the seed lists and shard plan are main's own (proven/ and the shard print identical to cdffdc627), so main's last deploy (run 45073660336, cdffdc627, all green) is the measure: gates 19.1 / 25 min (76%, the nearest; outside the 20% band: Suggestion), seedlists 4.4 / 6.5 / 14.7 / 25.8 of 45 (shard 4 = 1-3 1-6 2-1 2-5; 57%), drawcheck 16.0 / 30, paintcheck 6.8-7.9 / 25, rolled 13.6 / 60, seedplan 1.1 / 10. Local cross-check under 4-lane load: shard 4 25.4 min |
| PLAY-STORE-RULES §6 | holds: no new screen, sound, save, network or setting; the What's New card is covered by clipcheck (insets, both ways) and build:store (checkStoreBuild) |
| not in A (named): storyTipScan, teachFirstScan (not on main), castBots 2-7 (no 2-7), lockhints (the release's hint stages) | n/a on this head; they ran green on c73cb9766 where they exist (INT-R5/REPORT.md on release-0.10.3-wip-fixes) |

## Suggestions
- The gates job ran 19.1 of its 25 minutes on main's last deploy (76%): one more screen in clipcheck crosses the 20% band. Raise its
  timeout-minutes or split clipcheck into its own job in release 5 (the Critic's gate).

## Option A's base (INT-R5d-c, from the lead's message)
- d2943b94c: merge origin/t-fix-sidewall 1558489a2 into main cdffdc627 (clean).
- e73e7d4dc: merge origin/t-fix-soil 375f5a562 (code 539885c37). Conflicts: protoArt.ts drawProtoScene, resolved as INT-R5d's step 1
  (a2b7dde04): the soil fix's groundBanks(platforms); groundBanks returns the sidewall fix's bankList(platforms,
  platforms.filter(paintedBank)), ONE place for the painter and the paint gate. handoffs/engine-core.md: 0zs-SOIL on top, 0zs-SIDEWALL
  under it. No drawGround/drawBankArt/import conflicts (those were the release's stacked-leg ceiling, not on main; f7c5b8a2e not needed).
  paintcheck.ts auto-merged with both rules (SIDE-ON, SOIL OVER); every other fix file byte-identical to its branch.
- 2b5f0d6c8: package.json and package-lock's two fields 0.10.2 -> 0.10.3; What's New 0.10.3, 2026-11-25, 'Two little fixes' (3 lines:
  whatsNew.test needs 3-8 per entry, so the ruled one-line A could not stand alone). tsc clean; whatsNew.test + playerText.test 79/79.

## Lessons applied
D115 (frozen trees), D119 (commits by -m), D128 (stamps from `date`), D132 (rule 28 vs MAIN), D134 (pushed and ls-remote before every
report), D135 (no red called inherited without main's own result), D138 (the c73cb9766 lanes stopped at the lead's word, what they had
recorded kept).
**Missed (owned):** D128 once: the gate-table commit 396ca6092 carried a hand-typed stamp 2:54 later than its own commit;
timecheck caught it before any report; replaced with the `date` stamp. Countermeasure applied at once: every stamp below is pasted from
`date` in the same command as the edit (timecheck run on the branch after the fix).
