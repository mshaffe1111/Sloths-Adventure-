# ENG-S5 PLAN (t-eng-s5 from origin/t-eng-s4@4bafe110; packet reference/packets/2026-11-14/ENG-S5.md on the lead's branch)
Start 10:29 AM ET 11-14 (pasted from date). Box: 90 minutes (to ~12:00 PM ET) or 400k of the 1M window. Opus 5.5 xhigh.
Built on (D40): A1's grip dial + gripLandings (pressWindow), ENG-S1's SWING_SEEN 414, the self-swing's chainPhase/isChain
(physics.ts :582, :855) and swingSetup's chain phase. Nothing planned this sprint replaces them; BUILD-16 lays 1-6 on top of this.
Lane (packet): engine/gen2 swing + levelCheck only (physics.ts, levelCheck.ts, gen2 pipeline swing/land branch, gen2 types swing/land,
w1Swing.ts + tests). No Vine type change if avoidable; no 1-6 stage edits (BUILD-16's).

Order (foundations first; gates are never cut, scope is):
1. ONE chain measure, the engine's: chainRelease(A, B) = physics pressWindow on A (A's grip dial holds) hitting canGrabSwing on B
   with B at chainPhase(A, B), counting only presses with B's whole grip reach (B.x + its swing's reach) within SWING_SEEN of him.
   Normal and Easy (setTimedSwing). Planted test first (red without the measure).
2. levelCheck: liana -> liana. For every chain pair (isChain, after swingSetup): ledge -> A (the plain catch), A -> B (pressWindow
   onto B, 6 lines+), B -> ledge (pressWindow at B's holds). Vine nodes `v<id>` (already a node kind). Planted: a 3-liana chain
   with no perch between is unreachable today, reachable after; one spaced too far stays unreachable.
3. gen2: a `swing` place whose `after` is a liana lays a chain liana: the anchor where chainRelease >= the setting's window (row
   `share` along the band, SHORT = A's top hold flies it, LONG = low holds), its swing fitted so the two never meet (swingClearance),
   no perch or pit between; a `land` after a chained liana links by the same pressWindow. Gap under the whole chain: thorns
   (hurt floor); Easy: moss under the middle.
4. W1 chain row in w1Swing.ts: bough, liana, liana (SHORT), liana (SHORT), perch (LONG). Tests: lays on W1 (1-6) and W6 kits,
   both settings, levelCheck passes, every window >= LIANA.window, planted.
5. lockall --check vs the base recorded on 4bafe110 (expect 102/102 unchanged: no shipped stage lays a chain).
6. Clips (D63): a three-liana chain flown on the real page, upright + sideways, Normal + Easy, setting printed from the game (D62).
7. Full CLAUDE.md Checks; buildcheck ALONE (packet). Nothing left running at the stop (D59).
Report: REPORT.md with exactly how BUILD-16 lays beat 4 with the row; Polish check; Method used / Lessons applied / Method update /
Learned; EXACT NEXT STEP. Context % in every message (D55, D64). Queue read at every push (D57). No wait loops (D67).
