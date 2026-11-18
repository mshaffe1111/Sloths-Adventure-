# ENG-S3 REPORT (t-eng-s3 from origin/t-eng-s2@9809f11c; packet reference/packets/2026-11-14/ENG-S3.md on the lead's branch)
Start 5:12 AM ET. STOPPED 5:31 AM ET by the lead (Matt paused the team). Code head **83f0da6db**. Context at the stop: ~57% of 1M (over the
40% box: named). Nothing left running (D59): the clip pass was killed at the stop, so **no clips exist** (named below).

## Done-items (unit-proven; NOT yet proven on the real page: see Unresolved 1)
1. **CAM-THREAT, the mechanism** (lead-approved interface):
   - `PieceHost.focus(box)` (stagePiece.types.ts, `FocusBox`): a request good for one step; engine.ts clears it before the pieces step.
   - cameraFollow.ts `focusY` (pure): keeps the box between the HUD band and the foot his feet are kept above (AHEAD.heroPad.b),
     FOCUS_CAM.pad (8) inside, moved from the aim as little as does it; too tall: him whole, the side the box reaches further shown.
     `FOCUS_CAM` {lead 1.2 s, pad 8, shortest 288}, `focusHero`, `sideClear`; `WORLD_VIEW_H` and `ZOOM_RANGE` moved here from
     engine.ts (one source: applyZoom and the verdict read the same numbers). VINE_HANG moved to heroVineData.ts (pure; heroVine re-exports).
   - engine.ts updateCamera: applies focusY after the HUD hold; while focused (and easing back) the view moves at most CAM_RISE_STEP (11)
     a frame, but never at his cost (his body stays in the clear view, so a let-go's fall is followed).
   - vineSnakePiece: asks while he swings on ITS liana and the snake is in its tell, due within FOCUS_CAM.lead (clock read ahead), or
     travelling on his threat side; box = `snakeFocusBox` (his body + the tell pose at its start end).
   - gen2 verdict `snakeViewFaults` (pure, same focusY + snakeFocusBox as the screen): every hold from the foot up, on the squattest
     sideways phone (288 css px): in the clear view SNAKE.seen (1 s, 1-6.md:43) before it reaches his hands, or all it gives at a high hold.
     `snakeFaults(stage)` (rideFaults' shape) adds the beat check, a missing beat, a swinging false liana: for the lay to call.
   - Tests: src/game/snakeCam.test.ts (8): real engine + real camera, sideways 915x412 / 844x390 / 782x288 held high (tell >= 90% of
     frames) and low (snake in view >= 1 s), upright 412x915 / 390x844, rising snake, focusY, the verdict, verdict-vs-engine agreement
     at a middle hold (4 s trip refused, 6 s passes, both ways), levelCheck + snakeFaults on 6-3.
2. **False liana's landing**: startled, it is flung off AWAY from him (FALSE_LIANA.fling 300 px/s) as it drops; on the floor its slither
   starts clear of his body (`slitherClear`, FALSE_LIANA.clear 16 px), at the scale it hangs on the liana (`slitherSize`), and heads away.
   Near it (FALSE_LIANA.near 520 px) the view keeps its foot (head, the tell) in. Tests: vineSnake.test.ts +3 (both sides, 6-3 and 2-4;
   its body never over his from landing to gone).
3. **levelCheck** leaves a false liana out of the route (`isFalseLiana`, levelCheck.ts:540).
4. **Planted** (planted.out.txt): M1-M8 all RED. **M9 (the levelCheck filter) stayed GREEN**: the test cannot tell (a still false liana
   already gives no swing edge). The filter is unproven by a test: named.
5. **Lock**: base recorded (lockall --layouts 16 on 9809f11c, 3264 builds). **--check on the head: UNRUN** (no stage lays a snake; expected
   102/102 unchanged, not shown).

## Gates on 83f0da6db
tsc PASS; snakeCam/vineSnake/swingCam/cameraFollow/pieceHook tests 50/50 PASS; generalitycheck exit 0; knowncheck exit 0; roadmapcheck PASS.
**UNRUN (cut at the lead's stop, D59):** the full unit suite, the build (BASE_PATH), chunkcheck, artcheck, drawcheck, clipcheck, kbdcheck,
buildcheck, seedlist --check, engine tools' tests, tierBots, registrycheck, lockall --check. NOT GREEN: do not integrate before they run.

## Polish check (real page, 6-3, Normal from localStorage; stills in shots/, shot.log)
- **FAILS, named: sideways 915x412 held 240 (shots/sideways-915x412-hold240-1-tell.png): the tell is NOT in the clear view (0/6 frames),
  though the focus is on.** Root cause seen in the still: 6-3's liana hangs from y 124, 124 px under the LEVEL'S TOP; sideways the view
  never shows past the level's top (engine.ts updateCamera clamp, overTop false), and the HUD band is 147 px of world, so no camera can
  put the anchor's tell under the HUD. The unit tests used an anchor 400 px down an 1100 px level, so they passed. Upright the same shot
  also read 0/6 (cause not yet found: likely the same top clamp; NOT confirmed).
- Held 380 sideways (915x412, 844x390): the box cannot fit; tell 0/5 and 0/4 as designed for a low hold; the trip-in-view time was not
  printed by the shot (the unit test measures it): unproven on the page.
- False liana landing: NOT shot (the clip pass was killed). No clips at all (D63 not met).

## Pushback
- The verdict as written misses the level's top: a snake anchored within (band + tell) of the level's top is unshowable sideways. The
  fix is in the verdict AND the lay, not a camera stopgap (D40): see EXACT NEXT STEP 1.

## Unresolved
1. The real-page tell (above). 2. No clips (D63). 3. M9 unproven. 4. SNAKE-LAY (item 3: gen2 lay + NODE letter) NOT started; catalog rows
for the 2 brown cuts NOT done. 5. Item 4 (chains) NOT started. 6. Full gates UNRUN.

## Method used / Lessons applied / Method update / Learned
- Method: stage-piece.md, gates.md; planted tests first per item. Lessons: D40 (camera, not a patch), D57 (queue read at every push),
  D59 (killed the shot at the stop, named UNRUN), D62 (labels print what the game built), D64 (context % in every message; over 40%: named).
- Method update: a camera promise's unit test must use the stage's REAL geometry (anchor height from the level's top), not a bare world
  with room above: the bare world hid the level-top clamp. Shoot the real page BEFORE the unit tests are called done.
- Learned: the clear view (under the HUD) is the measure; ENG-S2's "in view" counted the HUD band as visible.

## Turnover
reference/handoffs/engine-core.md §0w (this commit).

## EXACT NEXT STEP
1. vineSnake.ts snakeViewFaults + snakeFaults: take the liana's anchor height from the level's top (and the level's height) and clamp the
   view's top at 0 sideways (as engine.ts updateCamera does); refuse a snake whose tell cannot be under the HUD band. Add a snakeCam test on
   6-3's REAL liana (anchor y 124): red now. Then confirm the upright 0/6 cause on the page (print camera.y, band, anchor in the label).
2. Re-shoot with reference/qa-reports/ENG-S3/shoot.mjs (HOLD=240 / 380; CLIP=1) on a liana hung >= 280 px under the level's top
   (sideways), and the false liana (ENG-S2 shootfalse.mjs) for the landing: clips both ways (D63).
3. Make M9 discriminating (a false liana WITH swing data, or count stats.vines) and re-run planted.
4. Full gates + lockall --check vs the base (rerecord: lockall --layouts 16 on 9809f11c).
5. SNAKE-LAY (rideLay.ts pattern; snakeFaults is ready for it), the brown cuts' catalog rows, then chains (packet item 4).
