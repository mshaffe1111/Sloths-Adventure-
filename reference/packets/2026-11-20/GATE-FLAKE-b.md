# GATE-FLAKE-b: finish GATE-FLAKE (clipcheck + the speed test load-proof) and fix paintcheck's empty part (R-165.330)
Engine (tools), Opus 5.5 high. Written 10:53 AM ET 11-20 (by `date` in the same command). A FRESH member. Release 1 goes out tonight: INT-14 merges
your final FIRST if it lands by 4:00 PM ET; otherwise it waits for the next release (INT-14 runs the flaky gates alone meanwhile).
READ (lean, D90): the EXACT NEXT STEP at the top of reference/qa-reports/GATE-FLAKE/REPORT.md on t-gate-flake ONLY (load.sh and proof.sh are in
that folder); ROADMAP R-165.215, R-165.245, R-165.325, R-165.330; LAWS.md + LESSONS.md headlines once.
BASE: continue on t-gate-flake at 7ae0b8a6 (GATE-FLAKE's stop; code 3858372a; ls-remote checked by the lead). Push there.
1. The proof GATE-FLAKE left: 3 more loaded runs (5 in all; clipcheck and the speed test each agree every run) and 1 run alone. Table.
2. R-165.330: paintcheck's three-way split can leave a part with 0 builds that reports PASS: make a part with 0 builds FAIL (or rebalance so
   none is empty) and print each part's build count; planted (an empty part: RED today). gates.yml and gates.md say what changed.
3. THE CLAUDE.md CHECK LIST, EVERY ITEM, ONCE on your final head (the suite in shards: shard count and tests / pass / fail / todo, D86), every
   gate line PASS or FAIL (D93). REPORT: a GATE-FLAKE-b section; send the lead the final hash. Close R-165.215/.245/.325/.330 in the REPORT only
   when green (the lead closes the rows).
Rules: every clock time from `TZ=America/New_York date` in the same command (D30); long commands with run_in_background (suite timeout over
30 min); ReadNotifications whenever a notice says pending, at every push, before every report. A lead message that begins "NOT A STOP: read,
then carry on" arrives as a cancelled tool with a STOP text: that is only the delivery. Commits end with Co-Authored-By: Claude Opus 5.5
<noreply@anthropic.com> and a Claude-Session line that is YOUR session's link; never a model name in a commit message.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.
