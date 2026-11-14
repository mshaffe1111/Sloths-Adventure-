# FEEL-CAM report (R-165.214, second half), t-feel-cam from origin/t-feel-vine b3b0eaf, written 7:41 PM ET. Opus 5.5 xhigh (engine).
**Measured on the real page** (NEW tools/inspect/camFeel.mjs: e.camera per ENGINE STEP, 390x844 and 844x390, grab, vault, field step,
leap, jump off + land, climb down; 1-4 and 6-1). The cut was the camera's ANCHOR re-picked in one frame: at a catch (in the air it held
the ground he left; on the vine it is him: 62-91 px at once) and at the landing after jumping off (140 px): the view went from rest to
14-28 css px a frame in one frame. Body snaps (hand step 40 px) moved it too. The lead's 150-180 px was the harness's placement cut.
**Fix (every stage, no stage data):** cameraFollow.ts repick: the camera aims at an EASED subject. Where his body and the anchor move as
they did, it follows them exactly (a run, climb, hop, fall frame as before: tested); the part of a move his body does not explain (a
re-pick, a snap) goes into an offset a critically damped spring (8/s) takes up, so the view starts from rest. Cuts stay cuts: respawn,
stage start, flag/door/teleport (body >96 px in a frame), the camera set by anything else (markCam). Kept inside the air band and, held
higher, REPICK.hudRoom (60 px) under the HUD band, so the HUD rule never yanks the view. engine.ts: updateCamera only (approved 6:53 PM).
**Jerk, css px per step, BEFORE -> AFTER** (measure-before/, measure-after/): 1-4 upright grab 17.5->2.6, leap catch 13.9->2.6, off+land
26.9->4.5, step 7.7->0.6, vault 3.0->1.8, down 2.4->3.0; sideways grab 14.2->2.1, leap 12.0->2.1, off 16.6->4.4, step 6.3->0.5; 6-1 upright
grab 6.9->1.7. Head/feet on screen: within 19 px of before (climb down upright: head 564 vs 583 css px down, HUD band 140), never off the view. **Tests:** src/game/camRepick.test.ts, 8:
planted (red on the old engine: 1-4 19.7, 1-5 9.3), exact-follow, cuts, fastest fall both framings, real engine on 1-4/1-5/6-1 in view.
**Clips (Matt):** clips/{grab,leap,off}-{up,side}.mp4 (BEFORE left/top, AFTER right/bottom) + -half.mp4; stills/*-sheet.jpg.
## Polish check
- grab-up-sheet: BEFORE f11->12 the whole world jumps; AFTER it glides up. off-up-sheet: BEFORE f26->27 jumps ~45 px; AFTER eases.
- Rough spots named: (1) after landing off a trunk the view now comes down over ~0.5 s, so for that time he stays as low as he landed
  (upright feet ~94% down, partly behind the foreground fern; same spot as before, held longer). (2) 6-1 sideways (a run stage on a squat
  view): no room under the HUD, so a jump-grab still re-picks at once (jerk 13.8->12.1). (3) The look across a gap (engine.ts:251
  LAND_EASE, first-order, QA 10-26's speed) whips the view 15-34 px/frame when he stands on a bough after a vault (6-1 vault 8.9): its own
  rule, not changed; proposal: the same spring for it (next packet). (4) Clips show Dot's tip box (as FEEL-VINE's); 0-step frames are the
  harness's clock (33/34 ms), counted out of the numbers.
## Gates on 9df1bdf + this report: tsc, unit (3280 pass, 0 fail), build, chunkcheck, artcheck, knowncheck, generality, kbdcheck, seedlist
1-1 (257), engine tools (33), tierBots (7), drawcheck PASS. buildcheck PASS alone (154 ms beside the unit suite: CPU). roadmapcheck FAIL
inherited: feel-fix.md (FEEL-VINE's) not in methods/README.md; lands with its final head. clipcheck: beside drawcheck one screen timed out
(Dot's first tip, 5 s); re-run alone: PASS (83 known, 264 s). Lock: not run (no generator or verdict reads cameraFollow's changed parts: grep).
## Learned / method update
- Count engine steps per frame when measuring motion on the real page: Playwright's 1/30 s is 33 or 34 ms, so a frame takes 0 or 2 steps
  and fakes a 10-20 px jerk (feel-fix.md: add it to the measure step). - Detect a re-pick by the part of the move the body does not
  explain, never by a change of speed: the air rule starting to follow a fall is a speed change, and easing it dropped him off the view.
- RealPlay stubs updateCamera as paint: a camera test re-binds the engine's own (D19). Lessons: D37, D19, D43, D15, D21, D55, D57, D59.
EXACT NEXT STEP: (1) when FEEL-VINE's final head lands: git merge origin/t-feel-vine; tsc, camRepick + vineFeel tests, roadmapcheck.
(2) Lead: R-id for the landing-look spring and the squat-view HUD room. (3) Matt: clips/off-up-half.mp4 and grab-up-half.mp4 first.
