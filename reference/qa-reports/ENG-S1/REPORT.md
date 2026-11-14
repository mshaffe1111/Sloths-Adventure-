# ENG-S1 REPORT (t-eng-s1 from origin/t-a1-swing@3edc896c; packet reference/packets/2026-11-14/ENG-S1.md on the lead's branch)
DRAFT: gates and the polish check are filled in below as they finish.

## Done (item 1 of 4, plus the cap and 1-6.md; items 2-4 NOT started: EXACT NEXT STEP)
1. **THE FAR CAP, one place** (Matt 2:02 AM "shorter swings", R-165.225; lead ruling (A) 2:28 AM): cameraFollow.ts `SWING_SEEN` = 471 px: a
   release press counts only if the perch's far end (of a long landing, its first `SWING_CAM.perch` = 300 px) lies within 471 px ahead of his
   hands as he presses = whole in view at the swing camera's full 1.3x ease on the narrowest gate phone (412x915 / 400x880 on a 900 px level:
   405 px usual), his middle HERO_KEEP from the back edge. physics.ts `pressWindow(..., seen?)` (optional; absent = byte-identical),
   pipeline `lianaRelease` passes it for DIALLED lianas only (World 1's rows), so Worlds 6-8 lay exactly as before (lockall below).
   Measured first (cap.ts): the foot's window does not depend on the perch's width (cap.out.txt: 100-240 px identical), so FAR = a narrow perch.
2. **World 1's FAR row** (w1Swing.ts): perch 120-140 px, row windows Normal 0.3 s / Easy 0.55 s (new optional `window` on the 'land' place,
   gen2/types.ts). Laid on 1-6's kit (lay-s1.out.txt): FAR Normal 460-485 px (400-500 ms), Easy 400-430 (667-767 ms); LONG 340-369 under it;
   SHORT 159-200 (the top sees its perch whole). Two defects the cap exposed, fixed: Easy's landing pad widened a perch AFTER its band (its far
   end left the view: Easy FAR windows fell to 0), and the window was recorded on unrounded px (2 frames off).
3. **The swing camera, every stage, upright** (cameraFollow.ts SWING_CAM, swingWideTarget, swingWideEase, perchBox; engine.ts swingWideStep):
   on a swing the view eases out up to 1.3x (Pokey >= 77%) at 4.5/s, held through the flight, back in at 3/s once he is down or holds on;
   it widens ABOUT HIM (his place on the screen holds); the level's height floor (engine.ts applyZoom roomUsual) is lifted while widened: the
   zoom is divided after it and the view may show sky over the top (overTop), its foot the level's foot; the landing it leads with is the WHOLE
   perch (landingAhead `whole`, upright only); and while widened the aim leads him by vx / RUN.follow (the real-engine test found the eased view
   trailing his forward sweep by ~60 px, losing the far end SWING_SEEN promised). Sideways nothing changes. A cut (respawn, stage start) snaps it.
4. **Tests** (src/game/swingCam.test.ts, 6; each part red without it: planted.out.txt, 7 mutations all RED): the cap against showBoth at every
   landing press; gen2's dialled band (old FAR 540/240 = 0); the whole-perch box; the ease rates; the REAL engine upright on 412x915, 390x844,
   400x880 (eases out, view taller than the level with its foot on the level's foot, the whole perch in view at every frame gen2 counts as seeing
   it, back in after landing); sideways never widens. A1's w1Swing.test.ts revised to the cap (FAR on a 120 px perch; old FAR asserted unlayable;
   SHORT from the top onto World 1's SHORT perch): no check loosened, each keeps its intent on the geometry Matt's decision allows.
5. **1-6.md revised** on t-16-design@b98c5ddb (fast-forward, no PR on it): FAR rows with citations, beat 7 ("below the top"), the phone paragraph.

## Not done (box): items 2-4 of the packet. EXACT NEXT STEP at the end.

## Gates
(filled in)

## Polish check
(filled in)
