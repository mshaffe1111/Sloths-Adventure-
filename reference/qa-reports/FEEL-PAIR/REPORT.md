# FEEL-PAIR: the two-vine climb, alone, for Matt's feel test (R-165.170). Branch t-feel-pair from t-int-2@465023ef. Opus 5.5 xhigh
**How Matt gets there (test link):** title screen, the gear (top corner), the **About** tab, top row **"Vine pair test"**, **Play**. (Also
`#autostart=1&level=feel-pair` after the link.) Leave by the pause menu. Only in a QA build: the shipped game shows no row (checked on both
real builds: test-link build row 1, ship build row 0) and cannot build the room even by id (planted: drop the gate, the test goes red).
## Done-items
1. **The pair as one grab, speed on the piece** (vinePair.ts, engine.ts): `Vine.climbSpeed` (up and down) and `Vine.pair` (strand gap 40);
   up from between the strands or beside either takes both. Single = 220 px/s unchanged (constant CLIMB_SPEED, same rustle, same reach
   54/60). vinePair.test.ts 4/4, touch upright and sideways; **planted:** on the base engine the pair climbs at 220.0 and 64 px off-centre
   takes nothing (2 red), single stays green. Measured per frame: single 7.33 px (220/s), pair 2x 14.67 (440/s).
2. **The room** (feelPairStage.ts): single kapok climb and the draped pair 160 apart (120+ from the nearer strand), both 720 px (about
   three storeys, eight Pokeys), sound floor, one walk across the top (the kapok's perch, then the pair's bough), the flag on it, nothing
   that hurts, no door. feelPairRoom.test.ts 5/5: layout, QA-only, stepping off the top costs nothing (engine's own loseLife, counters 0).
3. **Speed sign** at the pair's foot (2x first, a tap by it: 1.6x; tap again: 2x). The tap is no punch (test + browser: speed 352, punching false).
4. **Stopwatch** (FeelPairClock.tsx): each climb, grab to standing on top, last time per line: One vine 3.5 s, Two vines 2x 1.9 s, 1.6x 2.3 s
   (keyboard, sideways; climb alone 3.27 / 1.64 / 2.05 s; the rest is the grab and the vault).
5. **Art:** the liana is World 1's painted vine laid along a code path (pairArt.ts): trailing ends, two strands, a round loop over the bough.
6. **Checks:** STATUS_GATES
## Polish check (stills and clips in this folder, upright 390x844 and sideways 844x390)
- Room sideways/upright: both climbs and the sign in one view; floor framed (fixed: 300 px of soil under it showed half a screen of dirt).
- Single top: was a trunk under a long plank (read as a post and beam): fixed, the kapok's own perch now; the pair hangs over a plain bough.
- Stopwatch: was top-centre, his head climbed under it sideways (measured feet 45-50%): fixed, sideways it sits under the lives. Lines in a
  fixed order (they jumped when the sign switched: fixed). Tip text was 11 px: fixed to 12 (textSize.test.ts caught it).
- Sign lettering: too small at first: bigger; rebaked if the phone drops the canvas or before the font arrives (test).
- Clips: a grey band under the picture was the recorder (headless full screen), not the game: fixed in the script.
## Placeholders (named plainly; the painted pair is the lead's art call)
(a) the liana: the shimmy vine's painted twist on a code path, the loop is code geometry; (b) the pair's bough: stock branch art; (c) the
sign's "2x/1.6x": code-lettered on the kit's painted signpost; (d) the stopwatch: a plain dark panel (QA-only tool, not the menu kit);
(e) **no arms-out frames**: the climb clip is a side view, so stretching it would not read as arms out; on a pair the same clip runs over
1.5x the height per cycle (longer pulls) with a +-0.07 rad sway. Arms-out needs new frames.
## Pushback
- `Vine.pair`, `Vine.climbSpeed`, `PlayerState.climbPair` are new optional fields in types.ts (the Architect's file): the packet asked for
  the speed on the piece; name it to the Architect. Nothing else in types changed.
- At 2x the camera's ease trails the climb a little (feet 45% of the view vs 50% on a single, sideways; 50% vs 52% upright). I did not
  touch the camera: 1-4's piece 5 (the climb camera) owns climb framing (D40). Matt may feel it; tell him it is the camera, not the pair.
## Suggestions
- Engine: stage time estimates (w3Sections, w6Stages, w8Lantern, w4Stage43: `CLIMB = 220`) read vinePair.ts CLIMB_SPEED (no behaviour change).
## Unresolved
UNRESOLVED
## Method used / lessons / update
Method: none existed, written: reference/methods/feel-room.md (+ README row). Lessons applied: D1/D2 (both orientations, real screens),
D6 (canvas loss rebake + test), D19 (tests drive the real engine by touch), D30 (times from date), D37/trap 9 (loseLife unstubbed), D41 (sized
against 89.1), D43 (no stage id in engine code; generality PASS), D40 (camera left to piece 5). Method update: shoot a room with real held
input and stub requestFullscreen for clips (in feel-room.md). Turnover: engine-core.md section 0h (commit a6c596f9).
