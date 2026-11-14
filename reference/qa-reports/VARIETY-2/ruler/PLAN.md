# RULER PLAN (the per-gap pit ruler; packet reference/packets/2026-11-13/RULER.md on ccr-ea739a2f-dfcee4). t-ruler from t-nodes@1829470f.
Written 8:57 PM ET 11-13. Box: to 10:21 PM ET or 40% context. Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
**WRITE files (only these):** src/game/w1Pits.ts (findOpenPits and its helpers only), src/game/w1Pits.test.ts (the planted tests),
reference/qa-reports/VARIETY-2/ruler/ (this PLAN, REPORT.md, the scan script + output, before/after stills). No engine.ts, no pipeline.ts.
**Approach:** ground is earth only (floorish, height >= 90: the ruler's own `banks`); a log or bough is a platform over a gap, never a lip.
Each gap is a hole/valley in the earth's top line between two banks, judged by ITS OWN lips: the floor window (SOFT_BELOW..FALL_BELOW)
and SOFT_FLOOR read from the gap's lower lip, never the stage-wide G. No 1600 px cap between two banks (any width >= 24). Thresholds unchanged.
**Order:** 1 planted tests first (repro string 57 seed 58 + synthetic: far ground, log chain over a hole, a 2,000 px hole), red on 1829470f.
2 the ruler. 3 scan old (d8d6a97's w1Pits) vs new, 102 stages x 16 layouts, every changed fall/soft/drop. 4 before/after sideways stills of
each changed gap. 5 seedlist 1-1 --check, lockall vs d8d6a97, mixlist.ts (floor.unmarked was 36). 6 full Checks, REPORT.md.
