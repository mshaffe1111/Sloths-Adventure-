# REPORT: R-165.85, the 11-11 batch (13 sheets), Content, 2026-11-11
## Attempt 2 (the critic's three items, and the lead's made-things ruling)
1. N-03-d: W3 dressing only, never on a walk line; W10 a painted hazard candidate.
2. N-06-e: the box outline and smear above the broken top are cleared (cutter/snagfix.py, 1393 px; checked at 2x on dark and light).
3. Alpha-zero proof on N-01-a, N-09-b, N-11-b: 0 visible (alpha > 0) pixels changed, alpha identical everywhere; only hidden RGB was zeroed.
4. Made things out of W1 in all four sets (By world sections say so). 11-05 tags re-checked against the pictures: 21 of 111 changed.

## Method used
The 11-09 cutter and its attempt-2 checks from the start (edgefix, widened pinkscan, 3 px flatness test). New: labelbox boxes for
sheet 09's prompt text and 10's labels, stepped boxes to free the palm from 06's smeared ledge, specks.py for stray text dots,
TABLE=ntable for the builder, and an RGB-under-alpha-0 zero plus optimised save to get under 40 MB (cutter/README.md).
## Lessons applied
The critic's 11-10 finds (dark magenta, flatness, label remnants at the bottom of pieces) were checked on every piece before reporting.
## 1. Done-items
1. 54 kept + 1 rejected = every item on the 13 sheets (per-sheet counts in CATALOG.md). No text in any piece; pinkscan 0 on all 54.
2. catalog.csv + CATALOG.md, one row per cut, every field; flat share per line.
3. sheets/ by kind on dark and light. I looked at all ten stitched together, and at 09, 08, 06 and 12 at 2x on light.
4. CATALOG.md gap table: root steps, rocks, mid stumps, cairns and ladders filled; pits, ground band, W1 hazards, scaffolds and palisade open.
5. Diff only in reference/ + src/assets/w1-1111/; no file over 4 MiB; **39.6 MB added** (36.8 MB PNGs + 2.7 MB reference).
## 2. Polish check
Clean on both grounds. The palm snag N-06-e may keep a few px of ledge smear inside its broken-top notches (the pink was faded out).
N-02-a and N-02-d are near twins; so are N-12-b/N-13-a and N-12-a/N-13-b (one shape each for variety).
## 3. Pushback
39.6 MB is close to the 40 MB line only because of the lossless re-save; the next batch of this size will cross it. Suggest WebP for
kept art once a piece is picked for the game (the pipeline packs atlases anyway).
## 4. Suggestions
Apply the same lossless zero-under-alpha re-save to src/assets/w1-1109 (about 1.5 MB back).
## 5. Unresolved
Nothing placed (by design). Every stand line except N-08-d's is by hand.
## 6. Method update
Run every check from the start on a new batch; set the size trick before measuring MB.
## 7. Turnover note
reference/handoffs/art-director.md rewritten (new §0a, traps 17-18) in this commit.
