# Polish plan from the 2026-10-29 review (reference/polish-report/polish-report-1.txt)

Matt: prioritize easy wins first; run another agent or two on the hardest things we can start. Issue ids are the report's.

## Wave A: quick wins (code only, hours each; two helpers)

**A1, picture and screens** (branch polish-a1):
- VI-2 code: imageSmoothingQuality 'high' after each resize.
- AN-4: parallax snapped to device pixels (no background stutter).
- VI-3: backdrops and canopies in the start wait list, 2.5 s allowance, a 250 ms crossfade if late, KEEP_WORLDS counts worlds.
- VI-4: no mirrored strip copies; seamless crossfade instead.
- VI-7: crop the grey slab rows out of the World 6 bank piece.
- ST-1 code part: story dpr cap 2, bloom 0.15-0.2 on highlights only, close-up zoom cap 1.5x, feet above the text box.
- UI-1: Pokey on the win card in portrait.
- UI-3: animated confetti.
- UI-11: map star total from levels.length x 3.
- UI-14: 12 px minimum text.
- LV-1: an explicit Easy / Normal choice on a first save, and a mode chip on the stage card, pause and Stage Cleared.

**A2, Dot, levels, sound** (branch polish-a2):
- DOT-4: 1-9's null ring row.
- DOT-5: Skip tips not on the first coach line.
- DOT-6: honour minShowMs on the lesson cut.
- DOT-7: the reading clock starts when the bubble shows.
- DOT-8: calm rules for World 5.
- DOT-10: specific death help mapped by cause; Push the log first.
- LV-6: hollow Easy targets.
- LV-9: flags at most 4000 px apart on hand-built stages.
- LV-12: 4-8's failing jump.
- LV-13: cover within 100 px of 4-5's first eagle strike.
- LV-11: steps out of 2-3 and 5-8's dips.
- CT-8 step 1: remove the assistOn gate.
- CT-20: carve-spot and flags reset.
- SN-2: loudness normalised to -16 LUFS, variants within 1.5 dB.
- SN-5: the full sting moves to the card.
- SN-6: pause keeps the world's tune.
- SN-7: ducking under speech, and Dot's chirp.
- AN-9: haptics behind a setting.

## Wave B: the hard ones, started now (one agent each)

- **B1, controls that never misread** (branch polish-controls; the report's Build 2):
  - CT-1, CT-2, CT-3, CT-4, CT-9, CT-7, CT-6, CT-12 and CT-10, plus CT-5 after Matt's call.
  - Replay the testers' touches before and after each change, and make the scratchpad scripts regression tests.
  - Matt's phone test is the referee.
- **B2, clean backdrop edges** (VI-1, VI-5, VI-6; branch polish-edges):
  - Re-run the backdrop pipeline from the originals at 18bedcc^: bleed the edge colour, erode and feather the alpha, protect hair vines, despill magenta.
  - Covers every world, upright and sideways before/after.

## Later waves, in order
- Dot without spoilers: DOT-1 and DOT-2.
- Water taught first on hand-built stages (LV-8).
- iPhone portrait frame rate (PF-1).
- Soil tiling code (VI-8).
- Stage Cleared count-up (UI-2) and the boss cards in the wood kit (UI-5).
- Sound effects to source (SN-3).
- Normal's difficulty curve (LV-2).
- World 5 on gen2 with the carvings payoff (LV-10, ST-3).
- Art waves (Matt's Gemini): native backdrops (VI-2 art), soil kits, painted water W1-5, flags and exit, pickups, story cels.

## Decisions for Matt, one at a time
1. Build 1: it was made in another session and is not on GitHub. Push it to a branch so it can be merged.
2. SN-1: orchestral effects only?
3. CT-5: a second thumb's straight flick on a vine climbs?
4. DOT-12: 8 words or under 10?
5. LV-3, CT-19, CT-13 and CT-27.
6. Build 1's four 3-10 Dot tips, and "shrine".
