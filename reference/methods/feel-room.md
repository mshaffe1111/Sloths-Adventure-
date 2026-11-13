# Method: a feel-test room (one new move, alone, for Matt to judge by feel)

First used by FEEL-PAIR (R-165.170, 11-12: the two-vine climb before 1-4 is built on it). Use it whenever a new move must be felt
before a level depends on it.

1. **The move is an engine piece first, with a planted failure.** Its numbers live on the piece (a field on the vine, the platform),
   never in the room; the old move's numbers stay where they were, and a test proves them unchanged (vinePair.test.ts: the single at
   220 px/s up and down, reach 54/60). Run the stage lock against the base: nothing outside the room may move.
2. **The room is QA-build only.** `qaBuild()` gates its config AND its builder (generateStage), and a test proves the shipped game
   cannot build it even asked by id (planted: remove the gate, the test goes red). Check both real builds: the test-link build shows
   the entry, the ship build does not (serve dist under /Sloths-Adventure-/).
3. **A plain way in Matt can find on his phone:** a row on the title's Settings card (About), plus `#autostart=1&level=<id>` for tools
   (a shared Claude link passes only the # part). Straight in: no story, no roll (App.tsx playFeelRoom).
4. **The room compares, it does not test skill:** the old move and the new side by side in one upright view, sound footing, nothing
   that hurts (a test with the engine's own loseLife, not RealPlay's stub), a stopwatch per try, and any variant Matt should try chosen
   in the room by a tap (a sign), never by a menu.
5. **Shoot it the way Matt plays it:** real input (held keys, 150 ms or more a press), both orientations, stills and a clip per try
   (reference/qa-reports/FEEL-PAIR/shoot.mjs: stub requestFullscreen in the recording context or the clip shrinks). Measure the camera
   on the new move against the old (feet as a share of the view) before calling the feel fair.
6. **Overlays obey the screen rules:** 12 px text or more (textSize.test.ts), clear of the notch, never over where his head goes.
7. **Name every placeholder** (code-drawn joins, stock art used for a new thing, missing frames) in the report: the painted version is
   the lead's art call after Matt keeps the move.
