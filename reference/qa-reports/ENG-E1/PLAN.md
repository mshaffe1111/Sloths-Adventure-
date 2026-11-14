# ENG-E1 PLAN: 1-7's eagle and cover on the hiding the game already has (packet reference/packets/2026-11-14/ENG-E1.md on the lead's branch)
Branch t-eng-e1 from origin/t-eng-s1@a1739b43. Started 8:57 AM ET 11-14. Box: 90 min (to ~10:27 AM ET) or 400k tokens.
Opus 5.5 xhigh (engine tier). Lessons in force: D40, D57 (queue read at every push), D59 (no gate left running), D61-D67 (D63: CLIPS of
the whole action, D66: reuse what exists, D67: no until/sleep loops).

## What EXISTS (read in the code, 11-14 9:05-9:20 AM ET), reused, not rebuilt
- The kit eagle: predators/world1.ts:74-96 (sweep habit, warn 2 s, eye 320 px/s seeing 70 px, tell 0.75 s, act aim 'him', cool 5,
  giveUp 2, seesStill, callsOff on hiding); core.ts rest/hunt/tell/act/recover for a sweeper (:330-381, :430-445) and endPass's give-up (:265-277).
- Stillness and cover: stillness.ts (calm(), isStill, inCover incl. hanging cover); castPlay.ts steps both for every cast member (:112-121).
- The OLD watcher's drawing (engine.ts drawWatchBack :8486-8577, drawWatchShadow :8609-8640): the circling eagle, the edge warn, the
  shadow sprite (drawSoftShadow), the dive pose, drawEagleSprite (painted harpy-atlas). The kit sweeper is drawn THROUGH these, not new
  primitives. The screech: sound.playEagleScreech.
- watcher.ts:110/:138's free-first rule (zone.freeFirst; harmlessPass) = the rule item 4 moves into the kit.
- gen2 stillLay.ts lays hides as proto.bushes (the covers castPlay already reads) from a world's rows; CreatureDef terrain 'air' = a flier over a stretch.

## The build, in D40 order (each with planted tests; RED first where it can be)
1. **Eagle as a World 1 cast row** (w1Cast.ts): an 'eagle' CreatureDef (terrain air: its patrol = its stretch), rows for a taught stretch
   (free first pass, longer cool) and a plain one; registry gives castDef('eagle', 1) = EAGLE. Test: a roll/lay with the row gets a cast member
   with habit sweep over the right stretch.
2. **The kit sweeper DRAWN** through the old watcher's art: a pure pose (new sweepPose.ts: from the kit state and the camera, where the body
   flies, its scale/alpha, the shadow at eyeX, the dive during the tell, the pull-up when called off or spared) + the engine drawing the
   cast eagle with it; the screech on the pass's call (ev.notice), not a '?'. Test: pose over a pass; a clip.
3. **Moss tint + calm sound** from calm(): CastPlay.calmNow() (0..1, in cover only); the tint drawn on Pokey (code-drawn, STAGE-RULES §4)
   and one soft calm sound when it comes all the way in. Never outside cover. Test: none outside cover, full in cover after calmIn.
4. **The free first pass over a new stretch** in the kit: a member laid free (and every one on Easy) dives and pulls up short on its
   first pass, no heart; Dot's line once. Test: first pass no hurt, second pass hurts.
7. **The eagle's cool per stretch**: the laid row's cool (Post.cool) beats def.cool everywhere core reads it (coolOf). Test.
6. **A mossy liana is cover while held** (inCover + liana data: a cover tied to a rope id, followed wherever it swings). Test.
5. **Cover as gen2 content**: World 1 hide rows (bush, moss carpet/patch, hanging Spanish moss) through stillLay; NODE-KEY letter 'm';
   art from t-art-678b w17-moss-* (cut pieces through the inventory). LIKELY CUT by the box (see below).
8. **The perch**: rides unset = body on a snag, eye swept (already true in core); head-turn tell + perched-harpy art. LIKELY CUT.
10. **Bots that hold still in cover**. LIKELY CUT.

## Honest scope call at the start
90 minutes with the full CLAUDE.md Checks (~20 min of gates: drawcheck ~6, clipcheck ~4, tests, build) leaves ~50 min to build. I aim to
land 1, 2, 3, 4, 7 polished with tests and clips (the eagle works and SHOWS, D40's first group), then 6. 5, 8 and 10 are named in the
REPORT as not done with the exact next step for each, never half-built on the branch.

## Proof
- Planted tests (RED on the base, GREEN on the branch) in src/game/*.test.ts / gen2 tests.
- CLIPS both ways (upright 412x915, sideways 915x412): the shadow sweeping, Pokey still in moss (the tint), the eagle passing over, the
  dive when he's caught. Shot on a test stage laid from the rows (not a shipped stage: 1-7 is the builder's).
- Full CLAUDE.md Checks; log in reference/qa-reports/ENG-E1/gates.log.
- REPORT ends with what the 1-7 builder can lay now.
