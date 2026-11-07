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

## Player bots: the testers to model (Matt, 11-06 ~9:15 PM), built AFTER the play window
Matt is asking each of them to play as many runs as they can between now and Tuesday (his reset). The bots are built from their
recordings, with a learning curve across runs (reference/notes/IDEAS.md).
| Bot | Player (sheet name, tester code) | Level |
|---|---|---|
| Expert | Matt (Pixel JTTCRV, OnePlus 46KLT7) | high |
| Steph | Steph Roberts (iPhone, WBAUF3) | her own profile |
| Middle | Jen (Android, 5TUSYM) | middle |
| Child | Sally, who plays as "Sasa" (R5BXF5; ONE person, Matt 11-07) | the kid profile |
- Matt sends small updates like this as he looks things over. The lead adds each one to the roadmap as it arrives.
- Data hygiene: if a phone's settings are changed (for example GPU flags), the player name says so (e.g. "Matt OnePlus flags"), so those
  runs never mix into the baseline or the bots.

## "Can it float?": training the art director on Matt's eye (Matt, 11-06 ~9:25 PM)
Matt: floating earth "depends how it looks. If it looks like the planks and it just makes sense, then yes. But if it looks like blocks of
earth just floating, then no ... Maybe we go through different art pieces ... and I provide yes or no's ... and it can train itself."
Plan (the art director, low effort):
1. A rating page (an artifact with yes/no buttons, answers saved in its database): about 40 pieces from Matt's sheets and the kits.
   Include earth chunks, ledges, root tangles, slabs, planks, logs and boughs, each shown floating in a 1-1 still, in random order.
2. Matt taps Float OK / Must touch ground on each, with an optional word on why.
3. The art director writes the rule as features (a flat walkable top, a plank or log-like silhouette, roots that trail rather than a
   squared earth base, thin rather than chunky, and so on), with Matt's yes and no pieces as the examples. The rule goes in
   reference/art/manifest.
4. Check it on 10 held-back pieces Matt rates afterwards. The rule must predict his answer on at least 9 of 10 before the engine uses it.
Until then, the standing rule holds: no floating earth.
- Canvas sizing audit (Matt's question, 11-06 ~10:45 PM; engine.ts renderDpr and resizeCanvas, lines 1024-1067):
  - The buffer IS sized from the live CSS box times a ratio on every resize, both ways, with no fixed 720/1080 height.
  - BUT the ratio is capped: q0 2.0, q1 1.5, q2 1.0 (renderDpr). Matt's Pixel (dpr 3.06) draws 878x1825, so the compositor stretches it
    1.5x. The OnePlus and Steph's iPhone sit at q2 = 1.0x much of the time, so the compositor stretches them about 3x (soft picture).
  - Raising the cap on Canvas 2D costs fill rate: 3x instead of 2x is 2.25x the pixels, so the frame rate gets worse. Not a free fix.
  - On WebGL the fill is cheap: after the port, raise q0 to native dpr (up to 3) on phones that hold 30. The GPU plan's stage 5 measures
    it. Matt's bar: no compositor stretch on phones that can take it.

## OUTSIDE REVIEW 11-07 (reference/consultant/2026-11-07-REVIEW.md, max effort; answers in responses.md)
Its root-cause claim goes FIRST next week: the builder's reach model doesn't match the 30 fps game. It rates the jump about 10 px and
the bounce about 14 px higher than the game, and the single-jump distance 20-50 px too short (Pokey's 44 px width and coyote time are
ignored). So a running single jump crosses the 195-203 px 'double' teach gaps, and the w1-hop-bounce walls (116 of 138 layouts) sit
1-16 px beyond a bounce. engine-core verifies it in the real engine against reference/consultant/2026-11-07-scripts/sim.py, then the
planner re-lays the lessons (double teach: a rise of 136 px or more; bounce teach: 205 px or less) and the list is rebuilt.

## TOP FINDING: Sally (a child, "Sasa") on Easy, layout 12727
ONE run took **2,231 s (37 minutes)**, with **187 soft falls** (put-backs) and 23 checkpoints. Her survey:
- hardest: "The tall steps (double jump)" and "Bounce, then double jump";
- length "About right", knew what to do "Mostly", Dot's tips "No", fun 4;
- would she play the next level: **No**.
The put-back kept her going, but a child needed 37 minutes and 187 retries on EASY. That's the real "gentle intro" and difficulty
answer, and it outranks every other 1-1 item. Easy must not require tall double-jump steps or bounce-into-double combos for a first-timer.
Measure it with her recording (where the 187 falls happen) and rebuild layout 12727 on Easy. Then the kid bot is built from her data.

## Tester notes with their layouts (the sheet to 11-07 ~1 AM; each layout can be rebuilt from its seed)
- Log under a log, petals unreachable without a blind drop: seeds 21537, 15406 (Matt Pixel) and 15458 (Matt Pixel 5VSSHX). This is the
  headroom and visible-drop rule above, so build its planted failures from these three seeds.
- Petals not on a flowing double-jump line (Normal): 15406. With the float, 29944 "feels perfect", but first-timers won't have it.
- Rocks stretched with jaggy edges: 35936 (Matt). Check the boulder stretch cap (1.5x) and the source size. This needs bigger art.
- Portrait, the graphics "shifted" going up onto logs: 28212 (Jen). Check the camera's vertical follow on step-ups upright.
- "The mounds had funky parameters that didn't seem intuitive": 17581 (Andrew, on Matt's Pixel).
- Landscape felt less responsive jumping and moving: 23436 (Matt Pixel); "didn't feel as fluid": 7878 (Fold 4). Ties to the hitch data.
- Frame rate bad at times: 26525 and 21533 (the OnePlus).
- "Visuals a little faded": 18266 (Pixel upright). Ties to the upright magnification finding.
- Liked: Steph, "the rocks move to cover the holes you would fall into" (29048); Matt, "3 mushroom bounces had a good flow" (3024); Fold 4,
  "felt the best" (25908).
- Data hygiene: the tester code is per DEVICE. Andrew played on Matt's Pixel under the name "Master Andrew" with the same code (JTTCRV),
  so the bots separate players by name AND code, never by code alone.

## After WebGL and the 1-1 fixes: the lead's recommended order (11-07, for Matt)
1. Build rules into the generator, correct by construction: petals laid on the setting's arc, headroom on tiers, floors under gaps,
   Easy's steps within Easy's jump. Tonight 1 roll in about 300 passed, so the engine mostly rolls and throws away. That won't scale to
   100 stages times 2 settings. Keep the filters as a safety net, not the method. Target: at least 30% of rolls pass.
2. Make the setting a real input, with Easy's own curve. Sally (a child) needed 37 min on Easy 1-1. The real-player bots (child, middle,
   expert) become a release gate: a stage ships only if the child bot finishes Easy in a few minutes.
3. Prove the engine on 1-2, built by a cold helper from a short brief. Measure brief-to-proven time; the target is a day or less. If 1-2
   needs a week of hand-tuning like 1-1, the engine isn't ready to scale, and we fix the engine, not the stage.
4. Then 1-3 to 1-10 at that pace, each played by the testers, before any World 2 work.
5. Help for stuck players (Matt researching). The lead's view, from shipped games: after repeated failures at the same spot, offer the
   player a choice, never force it. Examples: Mario's Super Guide, Celeste's Assist Mode, Crash's extra mask after deaths. Dot offers
   help, a vine or a leaf bridge appears, or a skip to the next flag, and the help used is logged.
6. Watch for: too many overlapping rules (consolidate them as each stage passes), and the art at full size before more stages.

## What the recordings show beyond the notes (the lead's analysis, 11-07 ~1:30 AM; 41 runs, 6 players)
- **One section caused nearly all of Sally's trouble:** 155 of her 187 put-backs were in `w1-log-chain` (double, double, bounce, double),
  on Easy, and she entered it 9 times. No other player put back there at all. So the log chain on Easy is the fix, not the whole stage.
  It's also the slowest section for everyone (median 30 s).
- **Real lives are lost in 1-1 (21 times):** Jen 7, Matt (Pixel) 7, Steph 3, Bravo 3, Fold 1. They're all "pit" deaths, in
  `w1-mushroom-chain-back` (5), `w1-log-chain-rise` (5), `w1-mushroom-chain` (4), `w1-log-chain` (3) and `w1-canopy-rungs` (3). The rest of
  the stage puts you back softly. Decide whether a first stage should have lethal pits, and if so they must look different from the
  soft ones (players can't tell which is which).
- **Taps read as punches in a stage with no enemies:** Sally 167, Andrew 114, Fold 4 88, Steph 33; adults on their own phones 5-23.
  Kids and the Fold produce many taps the game reads as punches. Check whether these were meant as jumps (a flick read as a tap).
  If so, it's an input misread that makes jumps fail. The recording's touch lines can answer it.
- **Finish times without Sally:** median 3.5 min (212 s), from 152 s to 612 s (Bravo 612 and 444).
- **Dot's double-jump tip showed in 31 of 41 runs:** the 5:13 PM fix works, mostly. The 10 runs without it need a look (did the run skip
  the teach section?).
- **Screen glitches caught by the recorder:** a camera jump of 138 px (OnePlus, layout 12943; matches Jen's "graphics shifted"), Pokey
  jitter twice (Sally 12727 at x 35918, Jen 30782 at x 3985), a blank backdrop wait (Sally, w1c-mid), and 4 image load failures.
- **Make this a tool:** a tester-data report run after each play window. Per section: entries, time, put-backs, lives lost. Per player:
  taps read as punches, help-worthy fall clusters. Per phone: fps, freezes, quality drops. Plus every glitch, with the layout and x to
  rebuild it. The weekend's data then becomes a ranked fix list automatically.
