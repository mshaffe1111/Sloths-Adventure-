# TIME-168 REPORT: the time-stamp gate (R-165.168)
Branch t-time-168 from origin/main@6e7b85f8; head: the commit that adds this file (hash in the lead message, pasted from git).
Engine member (tools half). Method used: reference/methods/gates.md "Adding a new check" (copied knowncheck's shape: plain node,
seconds, exit 0/1/2, one ✗ line per breach).

## 1. Done-items
1. **tools/timecheck.mjs**: per commit in a range (default merge-base(origin/main)..HEAD, HEAD^1..HEAD on main; `--range A..B`;
   `--since YYYY-MM-DD --rev B`) it blames (`-w -M -C`, full history) the head's lines of reference/STATE.md, LESSONS.md,
   handoffs/*.md, packets/**/*.md and qa-reports/**/REPORT.md and judges only lines a commit in the range last wrote, against that
   commit's committer time in ET, 2-min grace (the lead's 5:45 PM ruling: a corrected stamp clears, history is not rewritten).
   Shapes read (all from STATE/LESSONS/packets): "11-18 5:31 PM ET", "2026-11-14 2:05 AM ET", "Written 5:37 PM ET 11-18",
   "(D87, 11-18 5:31 PM ET", ranges "11:07-11:24 AM ET" (end judged), "MATT 5:13 PM:" / "(Matt, 11-14 1:51 PM ET" quotes, "Fri 5:44 PM".
   Day: the date next to the time, else the ledger line's leading date, else the commit's day (the day before if that is > 1 h
   ahead), a weekday = the latest such day. Not stamps: other zones; plans (a plan word or `~` right before the time inside its
   clause, "at" only in a planning clause, "8:00 PM checkpoint"); "first typed 5:40 PM". 3 s over the lead branch's 217 commits.
2. **Planted tests** tools/timecheck.test.mjs: 10 tests, all pass. 10 min ahead fails (file:line, stamp, commit, exit 1); on the
   minute passes; 2 min passes, 3 fails; earlier days pass; a line moved (in-file and to another file) or re-indented is not judged;
   a stamp corrected by a later commit clears; only the 5 file sets are read; default range / --since / exit 2. Each rule proved red
   without it (mutation run): no grace 1 fail, no -M -C 1, no range filter 2, no plan words 3, no night rule 1, no zone skip 1.
3. **Lead branch, 11-15..11-18** (ccr-ea739a2f-dfcee4@2395afa9, the merge range the next release is judged on): **75 breaches**,
   68 on 11-18 (49 STATE ledger lines 10:03 AM-5:32 PM, 2:01 to 9:00 ahead; 18 packet "Written" lines incl. PITCH-29A/B 5:20 vs 5:15, ART-22P
   9:54 vs 9:48; LESSONS.md:107 D84 10:52 vs 10:49) and 7 on 11-15 (METER-2a "APPROVED it 11:20 AM" 10:26 ahead, the largest).
   Every hit read by eye: all real. Full list: breaches-lead.txt. The corrected D87 line (LESSONS.md:110, "5:31 PM ET ... first typed
   5:40") passes. 11-16: 11 commits, no breach; 11-17: no commits. The lead's "all 24 packets" is 18 of 24 by the commit clock.
4. **Wired**: gates.yml runs `node tools/timecheck.mjs` after roadmapcheck and the test on the tools tsx line; CLAUDE.md one clause
   after roadmapcheck (LEAD REVIEWS the wording, Matt's file); gates.md row 5c. ciTests.test.ts sees the test (4/4 pass).
5. **Checks** (scoped, no game code): see the lead message for each result line (tsc, roadmapcheck, knowncheck, generality, the
   tool's tests, its run over this branch's range, the CI tool line with CI=1 FORCE_COLOR=1).

## 2. Polish check
No screen. The breach line was read as a reader would: `✗ reference/STATE.md:1500  "11-18 3:18 PM ET" is 9:00 after its commit
a24b2506 (3:09:00 PM ET 11-18)`; m:ss so a 2:20 breach does not read "2 min" inside a 2-min grace (first version did).

## 3. Pushback
**MERGE ORDER: wiring this into gates.yml makes the next release's gate RED until the 75 lead-branch stamps are corrected** (the
deploy judges HEAD^1..HEAD, every commit of the release). The lead corrects them before the release PR (its ruling); timecheck
over the lead head must print PASS first.

## 4. Suggestions (outside my walls)
- Keeper: ROADMAP R-165.168 -> done (this branch's merge commit) once merged; LESSONS D30 countermeasure line names timecheck.
- Lead: write plan times with their word or `~` ("box 8:30 PM", "~6:45 PM"): a bare "(1:15 PM)" after a plan is read as a stamp.

## 5. Unresolved (named)
- History false hits outside the next range (10-day scan, 151 hits, 4 false): an appositive "after the weekly reset,\n Wednesday
  11-11 2:00 AM ET" (STATE:72), "after W1C (1:15 PM)" (STATE:466), "Check-in armed (trig_..., 10:31 AM)" (STATE:849); and a quoted
  wrong stamp "it stamped '1:58 PM'" (STATE:942, counted by the ruling on quotes). None is in a future range unless re-written.
- DST: a stamp inside the 2 AM change hour can read an hour off (stated in the tool header).

## 6. Method update (gates.md "Adding a new check")
Add: "A text gate over history is tuned on a 10-day scan of the real branch: read every hit AND every skip (a skipped-times
listing), and add each false shape as a planted test both ways". Two real stamps were lost by my first plan rule ("DECIDED by
Matt 11-09 9:10 PM ET", "the lead's 11:35 AM ET quality check") and only the skip listing found them.
Also: this container's clone was shallow (blame attributed old lines to the graft commit); the tool exits 2 on a shallow clone.

## 7. Turnover note
reference/handoffs/engine-core.md §0zl written (commit: the one that adds this file).

## Learned / Lessons applied
D30 (all three repeats: every time here from `date`), D31 (run as CI runs), D53/D84 (roadmapcheck before push), D57 (inbox at
push), D59 (no background job left at stop), D86 (the CLAUDE.md list for a no-game-code branch), D87 (long runs in background).
Learned: a blame range (`A..B`, `--since`) marks commits as boundary unreliably (and a shallow clone grafts); blame the full history
and filter by `rev-list` membership.
