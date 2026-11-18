# FIX-22b: 2-2 draw budget at the spur (drawcheck RED). Level/scenery fix, Opus 5.5 high. Written 8:50 PM ET 11-15. LEAN; Matt is at 90%
weekly tokens. BOX: hash to the lead by 10:00 PM ET (Matt's 11:30 cutoff; the full gate set re-runs after you, ~60 min). At the stop:
push, REPORT, EXACT NEXT STEP.
Read FIRST: reference/PERFORMANCE-RULES.md §1 and §8, reference/methods/gates.md (drawcheck), level.md Building rules, FIX-22's REPORT
(origin/t-fix-22: reference/qa-reports/FIX-22/REPORT.md), the red log (REL-099 pushes drawcheck.txt to origin/release-0.9.9-notes;
path from the lead).
THE RED (release-0.9.9 @ 6cec5bf8 = main + t-int-11 + t-fix-22 @ a1acbbe2): drawcheck '2-2 land (sideways)': drawImageScreens 8.18 at
spot 1 (x 9388) > limit 7.5. Top sites: scenery.ts:2082 drawFitted 2.67/frame, sheetBake.ts:125 drawSheet 2.56 + 1.25, scenery.ts:2389
drawVignette 1.00, protoArt.ts:1591 drawGroundChunks 0.86, paintedScenery.ts:102/104 drawGroundFlora 0.50 + 0.50, groundPaint.ts:175
0.48, scenery.ts:1507 lanePool 0.40. Upright passes; every other stage passes; the placeholder 2-2 passed (e59aaad8). New with the spur.
Branch t-fix-22b from origin/t-fix-22 (a1acbbe2).
1. Find what at x 9388 sideways stacks the painted screens (the spur's painted stones, pads, flora, backdrops overlapping) and bring
   2-2 under 7.5 there with margin (aim <= 7.0), by fixing the cause: fewer/overlapping pieces, right layer, no full-screen piece drawn
   twice. NEVER raise a limit or add a known entry (law 22, knowncheck). Engine change only if it is a general bug (no stage id/x in
   engine; generalitycheck). Prefer decor-only data so collision and the bots' paths do not move.
2. Checks ONCE: drawcheck (2-2 both ways at least; whole run if the tool can't filter), tsc, the suite once. If ANY collision/layout
   moved: castBots 2-2 1-40 x tiers x settings + seedlist 2-2 --check + lockall --intended 2-2. If decor only, say so with the proof
   (the stage's solid/collider list unchanged) and skip castBots.
3. Polish: stills of x 9388 BOTH ways, Normal, before and after, the whole screen (D79): the spur must still read as finished painted
   art, not bare. Name anything rough.
4. Send the lead (session_01FhBbYN2CVHnFXg7XzqKXpM) the hash + the drawcheck number, then REPORT; the lead hands the hash to REL-099
   (which merges it and runs the full set). Don't message REL-099 yourself unless the lead says so.
