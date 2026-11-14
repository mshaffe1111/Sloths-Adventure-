# ENG-S1 REPORT (t-eng-s1 from origin/t-a1-swing@3edc896c; packet reference/packets/2026-11-14/ENG-S1.md on the lead's branch)
Code head c3a753e8 (gates below ran on it, in its own worktree); later commits are reference/ only (this folder, engine-core.md).

## Done: item 1 of 4 (the swing camera), THE FAR CAP, 1-6.md. Items 2-4 NOT started (box): EXACT NEXT STEP at the end.
1. **THE FAR CAP, in one place** (Matt 2:02 AM "shorter swings", R-165.225; lead ruling (A) 2:28 AM): cameraFollow.ts `SWING_SEEN` = **414 px**.
   A release press counts toward a liana's window only if the perch's far end (of a long landing, its first SWING_CAM.perch = 300 px) lies
   within 414 px ahead of his swing point as he presses. That means whole in view, with ALL of his drawn swing pose in view too, at the swing
   camera's full 1.3x on the narrowest gate phone (412x915 / 400x880 on a 900 px level: 405 px usual). physics.ts `pressWindow(..., seen?)`
   (optional; absent = byte-identical); pipeline `lianaRelease` passes it for DIALLED lianas only (World 1's rows), so Worlds 6-8 are unchanged.
   Measured first (cap.ts, cap.out.txt): the foot's window does not depend on the perch's width, so FAR = a narrow perch.
   **Correction owned:** my 2:28 figure (471 px, so FAR 460-500) used his 56 px collider. My own first still (shots/first/, 412x915) showed his
   head cut at the back edge. On a swing he is drawn turning about his hands and trailing: up to 91 px behind his swing point (heroVine's
   frames). SWING_CAM.body is now pinned by a test to those frames, and the cap follows it. The lead was told at 2:59 AM.
2. **World 1's FAR row** (w1Swing.ts): perch 120-140 px; row windows Normal 0.3 s / Easy 0.55 s (new optional `window` on the 'land' place,
   gen2/types.ts). Laid on 1-6's kit (lay-s1.out.txt):
   - FAR Normal **407-426 px** (400-500 ms foot window).
   - FAR Easy 364-371 (667-700 ms). That equals Easy LONG (357-369), as 1-6.md already says ("Easy lays every FAR as LONG").
   - LONG Normal 340-364, under FAR.
   - SHORT 101-183 Normal, 81-153 Easy (the top hold must see its perch whole too).
   FAR is no longer foot-only (the middle hold flies it too). What makes it FAR is that the TOP never does (0 ms).
   **For the 1-6 builder (lead, 3:13 AM):** LONG (340-364) and FAR (407-426) sit only ~50 px apart. FAR must read different by HOLD (the
   foot; the top never makes it) and by the narrow perch (120-140 px), not by distance alone. The lead kept 0.3 s / 1.3x: Pokey whole and
   a fair window beat 30 more px.
   Two defects the cap exposed, fixed:
   - Easy's landing pad widened a perch AFTER its band, so its far end left the view (Easy FAR windows fell to 0).
   - The window was recorded on unrounded px (2 frames off).
3. **The swing camera, every stage, upright** (cameraFollow.ts SWING_CAM, swingWideTarget, swingWideEase, perchBox, swingHeroBox; engine.ts
   swingWideStep, swingWideCut):
   - On a swing the view eases out up to 1.3x (Pokey 77%) at 4.5/s, is held through the flight, and eases back in at 3/s once he is down or holds on.
   - It widens about him (his place on the screen holds).
   - It lifts the level-height floor (engine.ts:1247 roomUsual): the zoom is divided after it; overTop shows sky; the view's foot is the level's foot.
   - It leads with the WHOLE perch (landingAhead `whole`, upright only).
   - It keeps all of his drawn pose in: showBoth's hero box on a swing, plus the eased camera clamped.
   - While widened, the aim leads him by vx / RUN.follow. The real-engine test found the eased view trailing his sweep by ~60 px and losing the perch's far end.
   - Sideways nothing changes. A cut (respawn, start) snaps it back. On a chase stage (1-8) the chase's own aim still wins, as before.
4. **Tests** (src/game/swingCam.test.ts, 7). Each part goes red without it: planted.out.txt has 8 mutations, re-run on the final code.
   - The cap against showBoth at every landing press.
   - gen2's dialled band: the old FAR (540 px, 240 wide) gives 0.
   - The whole-perch box.
   - The drawn pose pinned to heroVine.
   - The ease rates.
   - The REAL engine upright on 412x915, 390x844 and 400x880: eases out; view taller than the level with its foot on the level's foot; his pose never out at the back edge; the whole perch in view at every frame gen2 counts as seeing it; back in after landing.
   - Sideways never widens.
   A1's w1Swing.test.ts was revised to the cap (FAR on a 120 px perch; the old FAR asserted unlayable; SHORT from the top onto World 1's SHORT perch). Its toy FAR line is the plain check's own 380 px on Normal, and LONG's 340 on Easy (Easy lays FAR as LONG). For the Critic: each test keeps its intent on the geometry Matt's decision allows. No check was loosened to clear a defect.
5. **1-6.md revised** on t-16-design@c99917f1 (fast-forwards, no PR on it): FAR rows with citations and the correction, beat 7 ("below the
   top"), and the "phone both ways" paragraph (the camera job is done).
6. **lockall**: 102/102 stages unchanged vs t-a1-swing@3edc896c (16 layouts, both settings: lock-check run on 488a5aac; c3a753e8 changes only
   dialled lianas and the camera, and no shipped stage lays a dialled liana yet). generality: in the gates.

## Gates (full CLAUDE.md Checks + CI's lists, gates.sh, on c3a753e8 in its own worktree, CI=1)
(filled in when the run ends)

## Polish check (real page, the engine's own camera, Normal read from the game, 6-3's liana with a FAR perch at the cap pushed in)
- shots/upright-412x915-1-decision.png, upright-390x844-1-decision.png: the press frame. View 527 / 541 px, Pokey 77%, ALL of him in view
  at the back edge with room, the whole 130 px perch in view at the front: YES (printed from the game).
- shots/*-2-after.png: the press on that frame lands ON THE PERCH on both phones; the view back at 100%.
- shots/*-clip.mp4: the whole action at ~22 fps on 412x915, 390x844 and 915x412: catch, slide to the foot, the ease out, two sweeps,
  the press, the flight, the landing, the ease back in. Sideways: no zoom, perch in view.
- No lurch (lurch.ts / lurch.out.txt: the real engine, a real release):
  - swing: the camera's largest step is 21 px a frame (cameraTurn's pumping bound is 30);
  - flight, landing and ease-in: 31-32 px x (the turn bound is 40; the glitch watch calls 120 a jump);
  - 27 px y while it zooms in about him: in world units; on screen he holds his place.
- The head-cut still (shot on 488a5aac, 412x915, his head at the back edge) is in history: `git show c3a753e8:reference/qa-reports/ENG-S1/shots/upright-412x915-1-decision.png`.
- Named, not mine:
  - 6-3's level-bottom water band shows as a hard horizontal edge low in the view. It shows at the usual zoom too, so it is pre-existing (A1 named the same on 1-8).
  - A hard-edged backdrop rectangle (lantern and pitcher plant, upright after-shot; a vertical seam at the left of the far island sideways). Possibly an artifact of the shot removing 6-3's own ledges, or a 6-3 art seam. Not checked on an untouched 6-3: the lead should have it looked at.
- Rough spot I could not fix in the box: upright the widened view shows a lot of sky over the level (the foot stays the level's foot). It reads as calm canopy on 6-3. On a level with a plain top it should be looked at on 1-6's first build.

## Not done: packet items 2-4 (the vine snake piece, the false liana, chains / len per row / LONG with a dial). Not started.

## Method used / Lessons applied / Method update / Learned
- **Method used**: stage-piece.md (data first, planted test first, 2+ phones, lock, shoot the real page), gates.md, D63's clip.
- **Lessons applied**:
  - D19: the cap is the camera's own constant, and the gen2 band and both tests read it.
  - D7/D24: every number measured (cap.ts, lay-s1.ts, body.ts in the scratchpad, folded into the test).
  - D36: lock and gates in their own worktrees.
  - D40: camera before snake.
  - D43: no stage literal.
  - D46: the plain flight is untouched.
  - D57: queue read at each push.
  - D59: gates waited for.
  - D62: setting printed from the game.
  - D63: judged on clips.
  - Law 3: the first still was believed over my arithmetic.
- **Method update** (proposed for stage-piece.md / render-fix.md):
  - (a) Any camera promise gets a REAL-engine test (RealPlay with updateCamera put back): the pure aim passed while the eased engine lost the perch by 60 px.
  - (b) Size a view against his DRAWN pose for that move, never heroBox: the swing pose trails 91 px.
  - (c) Playwright recordVideo on headless Chromium draws the page at half size in a corner. Sample page.screenshot frames and join them with ffmpeg (shoot.mjs CLIP=1).
  - (d) A shooter that spawns `npx vite` must kill the process group and exit, or it hangs after its last shot.
- **Learned** (for the next builder):
  1. A still beat my arithmetic in 30 seconds: shoot before telling the lead a number.
  2. A gap rule tied to the camera must count only presses he can see: a window that counts blind presses makes a blind jump fair on paper.
  3. Widening any landing after its band (Easy's pad) breaks every rule that reads the landing's width.
- **Proposed rule** (level.md, for the lead): "A liana's landing is whole in view, with all of Pokey, at the moment he presses (SWING_SEEN); the band enforces it; check: swingCam.test.ts."

## EXACT NEXT STEP
1. Lead: look at shots/*.png and *.mp4. Rule on the FAR range (407-426 Normal with Pokey whole; or Normal's row window to 0.167 for ~440, or a 1.33x ease for ~+12 px).
2. ENG next (packet item 2, the vine snake), on t-eng-s1:
   - Art: `git show origin/t-art-678b@a93e335` for w16-vinesnake-*, recoloured BROWN (a hue shift in the cut).
   - New: src/game/pieces/vineSnakePiece.ts as a PieceKind in PIECE_KINDS (pieces/index.ts).
   - It reads a liana's `snake` row from the stage data, laid by a new gen2 lay (the RIDE pattern) and a letter in gen2/nodeLetters.ts.
   - It rides the grip line (a 0..1 share down the vine) on the stage clock: down-and-off / down-and-back / up-from-the-foot.
   - Tell >= 0.5 s (PREDATORS floor).
   - Touching his hands makes him let go. The PieceHost has no let-go: the Architect must add `host.letGo()` (an engine call to the swing's
     'now' release, a hop) — ask the lead first: it is an interface.
   - Planted test through RealPlay on 2 worlds' lianas (pieceHook.test.ts template). Clip upright and sideways with shoot.mjs.
3. Then item 3 (the false liana: a still StagePiece on a bough, the startle-drop, tongue every 2.5 s).
4. Then item 4 (A1 pushbacks b/c/d): `len` on the swing rule; LONG with grip 'low' + share 0.5-0.7, re-laid under SWING_SEEN; and gen2's levelCheck liana->liana link with chainPhase for 1-6 beat 4.
