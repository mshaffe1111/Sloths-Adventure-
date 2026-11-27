# ENG-CAM29 (R-165.513): the puzzle-room camera, leaving a room and framing a gate-less bell

## LANDED (11-27 12:28 PM ET, from `date`) on t-eng-29, by the lead's ruling (a)
- **The 5-9 red** (firstTimerBot.test.ts:177, KID_RUNS_59) is **t-eng-29's, owner BUILD-29-l (4799f6026)**. Release 5's
  EASY_GOAL_59 data and the re-recorded KID_RUNS_59 (R-165.496) are not on t-eng-29 yet. BUILD-29-l merges release 5's frozen head and
  re-records the runs there.
- **The last three gates on frozen 6ea9e7623:**
  - clipcheck: 'PASS (83 known) (468 s)';
  - drawcheck: 'PASS (879 s)';
  - generalitycheck: '71 engine files (228 exempt under the engine folders), 26 literals, 26 known' PASS.
- t-eng-29 had not moved from 7387d089a, so the earlier tsc and lock results stand ('lock: 102/102 stages unchanged').

## TAIL RESULT (11-27 12:05 PM ET, from `date`): STOPPED ON A RED, NOT LANDED
The tail ran the gates on the frozen 6ea9e7623, as the lead ruled.
- **The red:** shard 3, firstTimerBot.test.ts:177, "5-9's Easy goal rests on the kid's runs". KID_RUNS_59 is expected [3,5,6,7,6,5]; the
  actual is [8,9,7,7,4,7]. The SAME test on the frozen base 7387d089a fails with the IDENTICAL actual [8,9,7,7,4,7]. It is on t-eng-29
  itself, not caused by this camera change. Following the lead's rule: recorded, no fix, not merged.
- **Lock gate:**
  - run 1 on 7387d089a: 'lock: wrote 3264 builds of 102 stages';
  - run 2, `--check` on 6ea9e7623: 'lock: 102/102 stages unchanged', exit 0.
- **The 6 shards:**

  | Shard | Tests | Pass | Fail | Notes |
  |---|---|---|---|---|
  | 1 | 692 | 691 | 0 | todo 1 |
  | 2 | 692 | 692 | 0 | |
  | 3 | 831 | 830 | 1 | the red above |
  | 4 | 740 | 740 | 0 | |
  | 5 | 636 | 635 | 0 | todo 1, R-165.312 |
  | 6 | 652 | 651 | 0 | todo 1, the 4-3 wall check |

- **Other gates:** tsc clean; the CI tool line (gates.yml:157) exit 0; generalitycheck PASS on 471d6fead. Clipcheck, drawcheck and
  generalitycheck on 6ea9e7623 were still running in the tail's chain at this stamp.
- **puzzleCamera.test with the final patch:** t-build-28-wip 4/4 (its own test file and the final one), t-build-29 4/4.

## EXACT NEXT STEP (hand-over, 11-27 11:03 AM ET, from `date`)
Candidate: **6ea9e7623** on origin/eng-cam29 (base t-eng-29 7387d089a). Both defects are fixed, puzzleCamera.test is GREEN, and both plants are RED.
The GATES are NOT RUN on 6ea9e7623. The next session runs them ONCE, in this order, on a FROZEN worktree of 6ea9e7623 (D115, with
src/game/gen2/proven/ writable):
1. The lock gate, run 2: `npx tsx tools/engine/lockall.ts --layouts 16 --check <base.json>`, with its counts line. Run 1 (`--layouts 16 --out
   /tmp/claude-0/s/base.json` on a frozen 7387d089a) was still running in ENG-CAM29's session at hand-over. If that file is gone, re-run
   run 1 on 7387d089a. The same chain then runs `--check` on the OLD 471d6fead tree: that result is STALE, so IGNORE it.
2. tsc and the CI tool line (CLAUDE.md "Checks").
3. The suite in 6 shards (deploy.yml line 38, `--test-shard=i/6`), recording each shard's totals. A first shard run on 471d6fead was
   stopped because the candidate changed, so there are no results.
4. clipcheck, then drawcheck (the zoom change must hold the frame budget), then generalitycheck. generalitycheck PASSED on 471d6fead;
   re-run it on 6ea9e7623.
5. All green: merge (never rebase, never force) eng-cam29 into t-eng-29 and push. Send the lead the hash, each shard's totals and the stills
   below. Send BUILD-29-k (session_01FhBbYMFJkAfX4QDuTWhypD) the hash.

## What changed (general: no stage id, seed or x in engine code)
1. **Leaving a room** (src/game/puzzleCamera.ts `ROOM_CAM.slew`, `roomZoomStep`; engine.ts `stepKit`).
   - Cause: inside the kit's bell room the zoom was still easing OUT as Pokey walked to the edge. At the edge, the exponential ease flipped
     to easing IN at its fastest rate, 0.025 zoom in one frame. Upright, the view is held to the level's bottom, so the view top moved by
     the whole change in view height: 1394 to 1340 world px, 54 px in one frame.
   - Fix: the ease is unchanged, but the view's longer side may change by at most 360 world px a second (12 px a frame at 30 fps), in or
     out, at every phone size.
   - Traced on the kit's bell room, the most the camera moves in one frame:

     | Phone | dy | dx |
     |---|---|---|
     | 390x844 | 12 | 19.3 |
     | 360x740 | 12 | 19.3 |
     | 844x390 | 9.7 | 12.1 |

     Before the fix, dy was 54 at 390x844. dx is the room's framing blending out while he walks, as before; it is under the 24 bar.
2. **Framing a gate-less bell** (the lead's ruling A; puzzlePlay.ts `keyBox`/`withEars`/`called`/`ring`; puzzleCamera.ts `CamEar`/`earOf`;
   engine.ts `kitEars`).
   - A bell that no gate is wired to now has the guards it calls in its framing (noise.ts bell reach, measured from the ring's own noise
     spot). They are added nearest first, as many as fit beside Pokey at the room's floor zoom. This is keyBox's own rule for every chain,
     so ZOOM OUT, never below the floor: Pokey is never drawn smaller upright than sideways.
   - On the FIRST ring, the guards it calls that did not fit get a pan, the far gate's way (ROOM_CAM.pan, 1.5 s), and then the view eases
     back to him.
   - Room pans now skip keepHeroX while they last (engine.ts updateCamera). Before this, the camera never left him, so a far-gate pan
     could not reach its gate either.
   - Why a pan and not more zoom: on 2-9's gallery1 the three called guards and Pokey span 784 world px. The widest upright view at the floor
     is 720. Fitting them all would draw Pokey at about 41 to 46 css px, under the size rule (the lead declined option B).
3. **puzzleCamera.test** brings in BUILD-28-i's moments (31451e6be, src/game/puzzleCamera.test.ts: the bell and pebble moments, earsOf,
   guardBox, calls, and the derived STAGES). It also brings in t-build-29's leave-the-room test (93562b80b's hunk: the kit's bell room).
   - The gate-less bell moment reads the LIVE called guards. Those that fit beside him at the floor must be in view. The rest must each be in
     view at some frame of the ring's pan, and afterwards the view is back on him (the lead's ruling).
   - NOT brought in: BUILD-28-i's per-piece check, 'every bell, lever, plate and item is in a moment'. On t-eng-29 the hand-built 2-8 it
     replaces is still in, and its cage4's stone40 has no moment (RED). That check comes in with BUILD-28's own landing, with its designed
     2-8. This is named in the test's comment.

## Proof
- **puzzleCamera.test GREEN (4/4).** Each run used 6ea9e7623's camera code or its patch:
  - on this branch: 93 moments, smallest scale 0.500;
  - on t-build-28-wip acc3962f with the camera patch and its own test file: 36 moments, 4/4, before the pan commit;
  - on t-build-29 1846b25b with the patch and its own test: 84 moments, 4/4, before the pan commit. Its 2-9 has no puzzle room, so there
    only the kit's leave test applies.
  - The t-build-28-wip and t-build-29 runs were NOT re-run after the pan commit 6ea9e7623.
- **Plants, each RED (all restored):**
  - slew 1e9: the leave test fails with '390x844: camera (3772.87, -493.97) to (3757.78, -440.03)', the 54 px jump back.
  - No guards framed: '390x844 2-9 gallery1, at bell1: guard:9 [8740..8772] in view [8279..8695]', the exact report.
  - No pan: '390x844 ... rung, the view goes to guard:11, which did not fit beside him'.
  - The lead's 'drop the nearest guard' plant stays GREEN, and the reason is geometric: guard 9 stands between the bell and guard 10, so
    framing 10 frames 9 too. The 'no guards framed' plant is the one that bites.
- **Stills** (the real game on the vite dev server, `window.__play('2-9', 1)`; draw path: engine.ts render with puzzlePlay's
  drawBack/front and the zoom from stepKit/roomZoomStep), in reference/qa-reports/ENG-CAM29/:
  - up390/up360/side-at-bell.png: upright, the bell and guards 9 and 10, Pokey readable (about 50 css px tall). Sideways, all three guards.
  - up390/up360-rung-pan.png: the pan's far end, guards 10 and 11 (Pokey is off the view for the pan's moment, as at a far gate).
  - *-rung-back.png: back on him with 9 and 10. Sideways never pans, because all three fit.
  - Logged views:
    - 390x844: at the bell, zoom 0.648, view 8388..8990; at the pan, 8851..9442; back, 8389..8958.
    - 360x740: at the bell, zoom 0.569, view 8388..9021; at the pan, 8868..9492.

## Polish check (named, not hidden)
- Upright, the room's pulled-back view spends about 40% of the screen on ground fill under the court. That is the existing upright room
  framing (the view is held to the level's bottom), not changed here. It is worth a look by the lead or Matt.
- After the ring, the guards only shuffle about 30 px toward the bell. 'The guards come to look' reads weakly. That is predatorAI or
  2-9's design, not the camera.
- dx up to 19 px a frame while leaving a room: under the bar, but it is the fastest moment of the ease-out.

## Learned
- A camera clamp downstream (keepHeroX) silently cancelled every room pan. Test a pan by its VIEW, not by its aim (roomAim said pan:true
  while the view never moved).
- The guard list for a moment must be read live: guards patrol, and the moment's list from engine creation differs from the one at check
  time.
