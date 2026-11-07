# gen2 1-1: next week's fixes (from 0.9.5 live play, 2026-11-06 evening)

Owners: the planner (pipeline verdicts) and the designer (section data). Each fix gets a seedlist --check verdict with a planted failure,
so a breaking roll can never reach the proven list.

## From Matt's play (11-06, ~7:30 PM ET), his words in short
1. **Petals over a gap must be collectable in ONE pass with the moves the stage has.** In a stage with no leaf float (glide), a petal
   line over a gap has to sit on a double-jump arc, so the player takes them all in one jump. Never placed so the player has to jump
   back and forth to collect them.
   MATT FOUND THE CAUSE (11-06 ~9:10 PM): the petals are spread for EASY's arc, and Easy's jump is more lenient, so on Easy you can take
   them all; on NORMAL the double-jump arc is different and they don't line up. Pickups must be placed PER SETTING, on that setting's
   own arc (Normal's double for Normal, Easy's for Easy), never one placement shared by both.
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

## The GPU move (PixiJS on WebGL 2) and the 60 fps budget (Matt, 11-06 evening)
Matt: "we should build for 60 frames, even if we're only going to run at 30 frames. That way, we're always going to meet our goals,
regardless of the phone we test."
- The lead agrees, with this reasoning: the loop stays locked at 30 fps, but the frame work must fit a 60 fps frame (16.7 ms all in).
  So a phone half as fast still holds 30. The budget becomes our update plus draw at 8 ms or less on a mid-range phone at q0 (it was
  12 ms), and 30 fps held on Matt's 2020 OnePlus. That's a rule change in PERFORMANCE-RULES §1 and tools/perf/limits.json, with a
  planted test.
- Where it stands: stage 0 (PixiJS v8 plus one WebGL canvas) was finished on warmup-5m (65b6c33a, 11-04) but NEVER reached main (main has
  no pixi). Stages 1-6 haven't started. So the live game is still 100% Canvas 2D.
- Plan: next week, its own lane, alongside the 1-1 fixes. The GPU work touches the render layer, the 1-1 work touches the generator,
  so they don't share files.
  - First port stage 0 onto main, measured on the three phones.
  - Then the stages in order: skies, ground, creatures and Pokey, props and particles, measure the rest, then the APK at 60 Hz.
  - About 3-5 working days (GPU-RENDERER-PLAN.md).
- Baseline to beat (Matt's Pixel, 11-06): upright 29.9 fps (worst frame 58 ms, 2 dips), sideways 29.8 fps (worst 96 ms, 5 dips).
  Same pixel count both ways, so sideways hitches come from what's drawn, not from size.

## Frame rate on real phones (the testers' sheet, 11-06 evening), the GPU move's evidence
| Player / phone | Way up | Avg fps | Lowest window | Windows under 24 | Worst frame | Quality dropped to |
|---|---|---|---|---|---|---|
| Matt, 2020 OnePlus | upright | 28.1 | 17.6 | 3 | 700 ms | q2 most of the time |
| Matt, 2020 OnePlus | sideways | 24.9 | 16.2 | 12 | 970 ms (a near 1 s freeze) | q2 |
| Bravo, Samsung | upright | 26.3 | 24.2 | 0 | 152 ms | q2 almost always |
| Sasa, Android (320 px wide) | upright | 30.3 | 27.8 | 0 | 132 ms | q0-q2 |
| Jen, Android | sideways | 29.9 | 26.5 | 0 | 150 ms | q0 |
| Matt, Pixel | upright / sideways | 29.9 / 29.8 | 26 | 0 | 58 / 96 ms | q0 |
The budget phone falls well short, worst sideways, with freezes of 0.7-1 s. Matt: "if I had that phone ... I'd quit because of the frame
rate." Mid phones (the Samsung) already drop to the lowest quality to hold 26. This is the GPU move's case, and the baseline it must
beat: 30 fps held on the OnePlus both ways, no frame over 100 ms.
