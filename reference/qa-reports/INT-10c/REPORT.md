# INT-10c report: link #4's reds at the root (1-6 + the 1-7 eagle). Branch t-int-10b. Opus 5.5 high. IN PROGRESS
Started 1:14 PM ET (packet). Every time below pasted from `TZ=America/New_York date`.

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

## Open: petals spread (STRIPPING, not spreading)
Same seed/plan, layout 1 Normal, main vs head: 6-2 73->5, 5-9 87->47, 2-8 53->23, 1-1 104->83. ENG-PETAL's socket lay drops every
petal on a piece with an inverted walked span (a full run's jump lands on it and leaves at once): 6-2 198 of 201 sockets. Lead's
ruling A (1:41 PM) built: reference/qa-reports/INT-10c/ruleA-walkedSpan.diff (13 -> 9 stages red) but HELD: it contradicts ENG-PETAL's
planted walkedPath test A word for word, lifts 1-6 to 1.69 petals/screen (band 0.86-1.04: INT-10's arcs/rows made up for the stripping)
and moves verdicts' 7-1 hash. Still red with A: 1-4, 1-8, 2-8, 5-9, 6-6, 7-9, 8-9, 9-8, 10-9 (untraced).

## Not yet run (step 2-3 wait on GREEN): the full gate run, lockall, stills/clips, build.py.

## Pushback
- The packet's "fix each red" hid a design conflict (ENG-PETAL's "petal only where every run walks" vs Matt's 2-screen rule); a fix
  there is a rule ruling, not an integration fix.

## Lessons applied / method
D19 (W1_ROOMS check read rooms only), D21 (layTip's flag pair), D29, D36, D40, D46 (landing plant), D57 (queue at each push), D59.
Miss: D30 again: one message to the lead carried a typed time (1:47 for 1:41); corrected the same turn.
