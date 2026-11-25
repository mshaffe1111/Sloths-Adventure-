# INT-R5d: release 4 (0.10.3) final: ENG-PLANT's merged head + t-fix-sidewall + t-fix-soil, THE FULL SET, the gate table (R-165.398/.440/.441)
Integration, Opus 5.5 xhigh. A FRESH member. **REPORT BY the time the lead names (target: the gate table within 2.5 h of start); HARD STOP
start + 4 h.** Hand over on the 28-minute clock with an EXACT NEXT STEP, PUSHED and ls-remote-confirmed before the hand-over message (D134).
Every long run with run_in_background and an explicit timeout (THE FULL SET in TWO runs: run1.sh then run2.sh, timeout 7,200,000 ms each;
castBots with --json in lanes so a cut run keeps its rows); NEVER a shell '&'; every run on a chattr-frozen worktree (D115; keep
src/game/gen2/proven writable); no heredoc in the same && chain as a commit (D119); stamps from `date` (D128).
READ LEAN: packets/2026-11-24/INT-R5.md (the release's shape); reference/qa-reports/INT-R5/REPORT.md on release-0.10.3 (sessions 1-3, run1.sh,
lockhints.py); methods/release.md "Before the PR" steps 0-6 and 4b; methods/gates.md THE FULL SET; PLAY-STORE-RULES §6; LESSONS D111-D136
(the lead's branch); the three branches' REPORTs: ENG-PLANT (release-0.10.3-wip-plant-c-report), SIDEWALL-FIX (t-fix-sidewall), FIX-SOIL
(t-fix-soil).
1. STEP 1 EARLY (start before ENG-PLANT's merge; catch the conflicts now, R-165.450): a new branch release-0.10.3-wip-fixes from
   origin/release-0.10.3's CURRENT head. Merge t-fix-sidewall, then t-fix-soil (final head 539885c37 + its stills; both cut from main
   cdffdc627; draw-only). The soil fix moved both painters onto one exported bank list (groundBanks): put sideWall's bankList inside it in ONE
   place. Name every conflict and its resolution. Then on the merged head: tsc; the CI tool line; paintcheck full sweep GREEN with BOTH rules
   (sideWall and soilOvers, no known list); lockall vs main with ZERO moves from the two fixes; stills of the two fixes TOGETHER (1-4 start and
   summit, 1-6's posts, 8-1's sliver, upright and sideways; look at each as Matt would on a phone) to the lead. Push.
1b. When the lead sends ENG-PLANT's merged release-0.10.3 hash: merge it into release-0.10.3-wip-fixes (no force), tsc + the CI line, then
   fast-forward release-0.10.3 to it (no force) and go to step 2.
   (the lead, 11-25 1:40 PM ET: NO separate merger. The hash is ENG-PLANT-CI-f's FINAL head on release-0.10.3-wip-plant-ci, which merges
   plant-tests 0f95b96ed in (merge-tree CLEAN) and runs the bot fix's final checks once there; take it straight into step 1b.)
2. What's New (at most 4 short lines, player words; SEND TO THE LEAD before committing): 2-7 The Mailman's Route; Dot warns before deep water;
   fixed: a wall you could not see on 1-6, a dark column of soil at 1-4's start; smoother rivers. package.json -> 0.10.3.
3. THE FULL SET on that exact head (`git fetch --unshallow` first): run1.sh (lockall vs main --intended 2-7, 1-4's relist and fill, the hint
   stages; lockhints; teachFirstScan; storyTipScan), run2.sh; the suite in shards (0 fail: pacerLay 23/23 after ENG-PLANT's re-plants; every
   red named with its R-number and owner, D135); paintcheck (GREEN with sideWall and soilOvers, no known list); drawcheck + clipcheck; seedlist
   --check on every listed stage; castBots rule 28 vs MAIN on every shipped stage the merge touches (2-1, 2-2, 2-4, 2-5, 1-4: zero bar-relevant
   PASS -> FAIL) and 2-7 vs its landing rows; release.md 4b per-list sums; the build + chunkcheck + artcheck + perf gates; kbdcheck, buildcheck.
4. The gate table in reference/qa-reports/INT-R5/REPORT.md; the final head and the table to the lead. The LEAD builds Matt's test link, asks
   Matt for 'push', and opens the PR (not you).
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Messages carry no clock times. Never a model name in a commit.
