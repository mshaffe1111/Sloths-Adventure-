# BC-FIX: 1-1's stage build is 3x over budget on a slow phone (R-165.163, blocks 0.9.7) (the lead, 2026-11-12 8:38 PM ET). Opus 5.5 xhigh
(engine: a core-engine fix). Branch t-bc-fix from INT-2's final head (the lead names the sha).

Why: buildcheck (CI gate, tools/perf/buildcheck.mjs) fails: 1-1's stage build p95 at CPU x4 is 446 ms Normal / 430 ms Easy on
t-int-2@465023ef against a 150 ms budget. INT-2 bisected on a quiet box, one head at a time (reference/qa-reports/INT-2/REPORT.md on
t-int-2): d0276817 104/85 PASS; W1C pre-merge 114/82 PASS; t-11-pass@36a4ef1c ALONE 259/269 (P11: its new verdicts / landings in the
build, about +180 ms); d9563016 (Y2 merged: two searches / landingRepair) 474/494 (about +180 ms more); every other merge flat. The
player feels this as a pause every time a stage starts or restarts on a mid-range phone.
First read reference/roles/README.md, ENGINE.md, LAWS.md, LESSONS.md, PERFORMANCE-RULES.md, reference/methods/gates.md and perf-measure.md.

## Fix the cause, never the budget (Law 22)
- Profile one 1-1 build at CPU x4: which calls P11 and Y2 added cost the time (file:line, ms each). Write the 5-line finding to
  reference/qa-reports/BC-FIX/PLAN.md and push BEFORE changing code.
- Then make the work cheaper or move it out of the stage start, keeping every result identical: e.g. a proven seed (1-1's 257 list)
  was already judged when it was recorded, so its build need not re-run the searches that proved it; cache what is pure; stop a
  search at its first answer. The laid stage must be byte-identical for every listed seed (the lock and seedlist 1-1/1-3 --check
  unchanged); a fresh roll (not on the list) must lay exactly as today.
- Never loosen buildcheck's 150 ms, a verdict, a fairness rule or a seed list. Measure the way buildcheck does (quiet box, one run at a
  time; INT-2's numbers are the baseline).
Done: buildcheck PASS on your head, CLAUDE.md "Checks" all green, lock unchanged. Return REPORT.md (40 lines or fewer: cause, fix,
before/after ms) and a send_message to the lead (session_01FhBbYP63h7cCX8DyW69stq), 10 lines or fewer. No PR.
