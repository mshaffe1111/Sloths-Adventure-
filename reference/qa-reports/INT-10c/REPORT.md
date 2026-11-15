# INT-10c report: link #4's reds at the root (1-6 + the 1-7 eagle). Branch t-int-10b. Opus 5.5 high. IN PROGRESS
Started 1:14 PM ET (packet). STOPPED at the lead's context guard (X ruling, 1:49 PM). Every time below pasted from `TZ=America/New_York date`.

## Done-items (step 1: each red re-run ALONE, classified on main 73e7bed0 (all GREEN there), fixed at the root, pushed)
1. judgedTable x3 + listed x2 (shard 1): the test-only fixture id was 1-8, now listed for real. Fixture is 1-99, never a real stage, so
   no listing moves it again (a96ab530). GREEN 6/6, 3/3.
2. movesJournal "every tip a page waits for": the collapse page waited on the hand-built 1-8's deleted line; re-pointed to 1-8's crack
   line "It's cracking! Run, and don't look back!" (the keeper's ruling, lines-1-8.md on t-story) (0fb59c47). GREEN.
3. rollGuard 1-8 (2 LISTED seeds, 24 and 75): layTip moved a flag in the gap onto the far branch in x only: 22 px inside it (a respawn
   in the branch). layTip sets its height; readyStillFork (the pair, D21) stands a moved flag on the ground under it. Planted x2 in
   chaseTipLay.test (red without, green with) (0fb59c47). GREEN.
4. landingRepair: the existence proof (seeds from 50001 until one is repaired) replaced by a PLANTED dead-zone petal on real 1-1 seed
   50001 (every dead-zone piece deadZones finds; the repair moves each into its own section, onto a clean piece); 100-roll clean
   check kept, no wider range (df5e9810). GREEN 8/8.
5. stageSheets: preloads follow what the built stage draws: 1-8 eagle + props2 (still fork), no gold snake on 1-6 or 1-8; W1_ROOMS's
   check counts kit decor (1-4's nest door draws from the kit sheet; D19) (4b247659). GREEN 8/8.
6. wayside 1-8: the keeper's first-person line "Dot keeps flying rings round me. Show-off." (t-story 356159b8) laid verbatim in
   wayside.ts, WAY_18, dotLinesData; the dated note moved out of the line cell w1Arc18.test reads (956aa67a). GREEN.
7. seeds 8-2 + w8Fair (0 fungus steps): TOOLS-2 (R-165.258) lays Easy on its own dials; Easy's harvest top-up laid a petal row in the
   hammock room's well under its hammock: fillSockets' clear() read the stage before addKitPlatforms. It now reads the room kit
   pieces. Planted on 878575 both settings (red without) (1eb356ca). GREEN both files.
8. walkedPath D (1-6 L1): an arc petal 37 px over the rest log's near end read as a standing petal where every run is in the air;
   arcPetals skips points that read as standing outside their piece's walked span (1768bf0c). GREEN 5/5; petalArcs GREEN.
9. petals "spread out": OPEN, the lead's call (below).

## Open: petals spread (STRIPPING, not spreading). EXACT NEXT STEP for a fresh member
Main GREEN; head red on 13 stages. Done: the lead's ruling A in walkedSpan.ts (87be4a24: a piece every plain run touches is path; ENG-PETAL
test A restated, A2 added; 1-6's bank rows out, arcs kept, in band; 7-1 hash re-pinned, revert proof mainpins.txt). 6-2 back to 83 petals
(main 73), 1-1 104 (main 104). Still red: 1-4, 1-6, 1-8, 2-8, 5-9, 6-1, 6-3, 6-6, 7-9, 8-3, 8-9, 9-8, 10-9. Causes traced:
1. Liana perches (1-6, 6-1, 6-3, 8-3): A's liana half (`swungOn`: a let-go sets him down on it, and a catch of the liana ahead leaves it)
   made these four green, but walkedSpan.test.ts:21's toy asserts the perch's span starts at the let-go (ENG-PETAL's 1-6 sealed-door
   evidence: petals behind every landing). Lead: is a perch between two lianas "touched" (A) or does its petal stay at/after the let-go?
2. Contiguous stair steps (2-8 x 9092-11448, rises of 20 px, no gaps): over SEAM (10 px) each is a plain jump, a full run "clears" it
   (lo capped at its end: `clears`). Measure whether the engine walks a 20 px step; if a run must hop each, the step is touched (A).
3. 5-9 (x 10014-12398) and 9-8 (3858-6047): the pieces there HAVE spans (5-9 36: 10315-10634, 44: 11186-11451) yet hold no petal: trace
   the fill and walkPetals (tools: reference/qa-reports/INT-10c/gap.mts and g28.mts; they import absolute paths of this checkout: edit the root).
4. 1-8 (33525: the last stretch + the tip, where layTip clears pickups) and 1-4 (from x -9489, the climb's axis): special stages? the lead.
Then step 2-3 of the packet: the full gate run on the final head, lockall vs the base, stills/clips, build.py --published.

## Not yet run (step 2-3 wait on GREEN): the full gate run, lockall, stills/clips, build.py.

## Pushback
- The packet's "fix each red" hid a design conflict (ENG-PETAL's "petal only where every run walks" vs Matt's 2-screen rule); a fix
  there is a rule ruling, not an integration fix.

## Lessons applied / method
D19 (W1_ROOMS check read rooms only), D21 (layTip's flag pair), D29, D36, D40, D46 (landing plant), D57 (queue at each push), D59.
Miss: D30 again: one message to the lead carried a typed time (1:47 for 1:41); corrected the same turn.
