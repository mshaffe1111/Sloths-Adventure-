# FIX-15: 1-4 fig gate: Pokey must not get over or through a shut bough from ANY approach (R-165.212, Matt's ask, failed on video twice). Opus 5.5 xhigh (engine). Written 11:39 AM ET 11-14 by the lead.
Branch t-fix-15 from origin/t-int-8-clip (INT-8s side branch: link #2 head + tools/inspect/clip.mjs and its CI test; its own full gate run). READ FIRST: INT-8's evidence
on t-int-8: stills/1-4/gateover-normal-side.mp4 + .txt (the TRY lines), sheets/gateover-normal-side-ledge.jpg, the OVER/THROUGH stills;
reference/qa-reports/FIX-14b/REPORT.md (what the lid does); Matt's words in R-165.212 (ROADMAP); LESSONS D63, D69.
## What is wrong (INT-8, 11:39 AM ET, real touch presses with lift logged)
Normal sideways, 1-4 seed 1, gate 6 (bough x 414-934 y 1923, far end sags to a drawn top ~1977). With a tie still holding:
- from the far-end ledge (x 876-1056, y 2022, ~45 px under the sagged end), a straight-up flick with left held at x 1030 puts his feet at
  1924, above the shut bough; a second flick reaches 1841, passes over the thatch and drops THROUGH it (a shut bough is no footing).
- standing on that ledge at x 869-956 his head is drawn ~72 px into the thatch.
Root: fieldPlay.ts lid() only stops a rise that STARTS under the drawn top inside span + lidSide 22; entering the span from the side
already above the top is "left alone".
## Fix (at the root, every stage that uses the gate; no stage id, no x position)
1. A shut bough is a solid: no body crosses it upward OR downward from any approach (rise from under, side entry above, fall from above:
   he lands on it). Only the fruit passes (Matt: "a head/shoulder stop so only the fruit passes").
2. The ledge under the sagged end: his drawn head never overlaps the thatch (lay rule: clearance >= his standing height + margin, in
   the lay or a verdict, so every roll obeys it).
3. Planted tests from INT-8's TRY lines: the far-ledge flick, the double from the ledge, the fall onto the bough, the vine-top leap;
   each must go RED with today's lid and GREEN with yours.
4. CLIPS with tools/inspect/clip.mjs (INT-8's fixed tool, touch pad, JUMP-NO-LIFT): every TRY line again, Normal + Easy, sideways and
   upright; each caption prints the press frame's vy and his head vs the bough underside. Name the frame where he is stopped (D69).
5. Full CLAUDE.md Checks (buildcheck ALONE); castBots 1-4 both settings (the bots still solve the gate the fair way).
No until/sleep wait loops (D67). BOX: 90 minutes or 40% context (400k of 1M by the real figure): push, REPORT with EXACT NEXT STEP, stop.
Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
