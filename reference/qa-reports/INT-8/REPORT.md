# INT-8 REPORT (t-int-8 from origin/t-int-7@007f4421; lead session_01FhBbYNzGRJBDMzn6XbtQK2; R-165.228). 11:01 AM ET on, Opus 5.5 xhigh.
## STATUS: (filled at the end)

## Done (evidence)
- **Step 1, the merge (595ada5d):** origin/t-polish-9@2840b63c onto link #1. One merge base (471bd000, t-polish-5's head, which both sides
  hold). Textual overlap: 2 files, and no conflict in either.
  - src/game/gen2/provenIndex.ts auto-merged with each side's own line: 1-1 `n 162, 9b25668b` (POLISH-9's relist B) and 1-4
    `6b772e6e` (link #1's 1-4 list). Neither side touched the other's line, so nothing was taken wholesale.
  - reference/qa-reports/POLISH-5/item2/mainscan.mts.txt: the same rename on both sides.
  - Read for meaning (no text overlap):
    - Link #1 changed finishStage on every stage (stageGenerator.ts pairPetals: the vine field's paired petals). POLISH-9 locked
      1-1's first run. The lock is judged by seedlist 1-1 --check (first-run.drift).
    - POLISH-9 changed pipeline.ts (refuseGraphs, its own rng stream 68), reach.ts and verdicts.ts. 1-4's new list holds every
      listed seed to its own search, judged by seedlist 1-4 --check.
    - gates.yml: POLISH-9 added firsttimer.test.ts to the tool line, and INT-8's runner takes that line.
  - The first commit's trailer named the lead's session, not mine. I amended it on my own branch before anything was built on it
    (391fa501 -> 595ada5d, force-with-lease on t-int-8 only).
