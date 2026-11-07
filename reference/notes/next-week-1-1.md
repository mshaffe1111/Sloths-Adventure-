# gen2 1-1: next week's fixes (from 0.9.5 live play, 2026-11-06 evening)

Owners: the planner (pipeline verdicts) and the designer (section data). Each fix gets a seedlist --check verdict with a planted failure,
so a breaking roll can never reach the proven list.

## From Matt's play (11-06, ~7:30 PM ET), his words in short
1. **Petals over a gap must be collectable in ONE pass with the moves the stage has.** In a stage with no leaf float (glide), a petal
   line over a gap has to sit on a double-jump arc, so the player takes them all in one jump. Never placed so the player has to jump
   back and forth to collect them.
   Rule to build: for every pickup over a gap, at least one of the stage's taught arcs (jump, double jump; glide only where it's taught)
   from the take-off passes through all of them. The verdict fails any roll where it doesn't.
2. **Branching levels: pieces too close together block the way down.** Example: petals on a log UNDER another log, with no room to drop
   or jump down to it, so the player has to run off blind and sometimes misses. ("Blind faith".)
   Rule to build: a lower landing under an upper piece needs headroom (Pokey's height plus a margin) and a visible way down: an open
   drop zone in view before the edge, not hidden under the upper piece. Any pickup on a lower tier must be reachable by a drop the player
   can see. A verdict, plus a bot that tries the drop.
   Matt logged the example in the testers' sheet: find his survey note ("looked wrong") and the layout number, and rebuild that layout.

## Also open (from today)
- Gentle intro (funcheck: more than 0.8 moves a second in the first 15 s): R-165.48, first.
- Soft floors under the 6 floorless spots (the planner's floors plan), which brings the list back toward 300 (R-165.47).
- Branch share 30% or less (R-165.46): the designer rules what counts as "thin".
- Double-gap test band 205-228 and the Easy twins.
- Dot says nothing while the player stands stuck at a step for 20 s (tester-page's finding).
- The pad's two old coach titles need new words from Matt.

## Tester data so far (11-06 evening, all on the live #ctest)
- Players: Matt (Pixel), Steph Roberts (iPhone, Safari), Bravo (Samsung Internet), Sasa (Android, Chrome, a 320 px-wide screen).
- Bravo's FIRST session ran an old cached build (11-01) before the new one loaded. Tell testers to tap Refresh first.
