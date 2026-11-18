# INT-12 REPORT: tonight's link head (t-int-12 from origin/main 6e7b85f8)

## Head
- FINAL: (pending VAR-1)

## Merges (packet order 4, 3, [2 after its final hash], 1)
| # | Branch @ hash (lead, 12:57 PM ET) | Merge commit | Conflicts and resolution |
|---|---|---|---|
| 4 | t-eng-24 @ b0e94c85 | 3cf7614e | none |
| 3 | t-art-22p @ 877f12f6 | 17c65361 | engine-core.md: both wrote a top §0zl; kept both (ART-22P's later suffixed 0zm-22p, ENG-24's 0zl-24 in bbb00685: BUILD-19's 0zl/0zm/0zn keep the labels its REPORT cites) |
| 1 | t-build-19 @ 2097adf7 | adb5392a | gates.yml rolled tool-test line (lianaRide + boaBots, union); CATALOG-MASTER.csv (roost + hyacinth + 12 drift petals, union, no dup ids); HF-SPEND.md (ENG-19a/b then ART-22P sections + a combined balance line ~$52.5) |
| 2 | t-var-1 @ (pending) | | trial on 78080101: gates.yml (sweeper test, union), provenIndex.ts (VAR-1's 1-6/1-7/1-8 + BUILD-19's 1-9) |
Auto-merged code touched by two branches (hunks apart, read): pipeline.ts, levelCheck.ts, firsttimer.ts (ENG-24 + BUILD-19); stagePlan.ts,
stagePreload.ts (ART-22P + BUILD-19).

## Prep on the 3-branch head (evidence only, the lead 2:45 PM; every gate re-runs on the final head)
- tierBots RED on b0e94c85 itself (ENG-24's miss: tierBots.ts:39-40 added ontoLog/fromLog, calibration-main.jsonl not recommitted, BOTS.md:10-12);
  fixed in 25b3bddc by the BOTS.md re-run: 210/210 lines identical except the two fields, 0 in all 200 runs (no run moved); 7/7.
- On 25b3bddc: suite 3,836 tests / 0 fail / 2 todo; 11 seed lists PASS; lock 101/102 unchanged, only 1-9 moved; drawcheck, clipcheck
  (83 known), kbdcheck, buildcheck (N p95 130 ms), build + chunkcheck + artcheck PASS; castBots 1-3/1-9/2-2 calibrated tiers 40/40.
- funcheck (advisory, the lead 3:48 PM): main 34 worse/new (funcheck-main-6e7b85f8.txt) -> 43 (funcheck-prep-25b3bddc.txt): 9 new on
  1-9 (BUILD-19 never ran it: packet miss). Carried for tonight's link, named; 1-9 variety pass R-165.291 before any release.
