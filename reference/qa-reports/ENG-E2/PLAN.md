# ENG-E2 PLAN: finish 1-7's engine (moss cover content, the perch, bots that hold still)
Packet reference/packets/2026-11-14/ENG-E2.md (lead's branch ccr-ea739a2f-dfcee4). Branch t-eng-e2 from origin/t-eng-e1@f573675b, with
origin/t-art-678b@a93e335 merged (clean). Started 10:33 AM ET 11-14 (session clock); this plan pushed 10:37 AM ET. Box 90 min (to ~12:03 PM ET) or
400k tokens. Opus 5.5 xhigh. Lessons in force: D40, D57 (queue at every push), D59, D61-D67 (D63 clips, D65 judged on what it sits in,
D66 reuse, D67 no wait loops).

## What EXISTS (read in the code 10:33-10:45 AM ET), reused, not rebuilt
- inCover (stillness.ts) already hides a still sloth in ground cover (bottom on y) and hanging cover (holding, top at y), and a mossy rope
  (Cover.rope, E1). proto.bushes is the cover list (watcher.ts Bush: kinds tall/wide/fern/grotto); drawBushes (engine.ts:9150) draws
  each in front of him, see-through while he is inside, thinning as the moss tint comes (protoArt.ts drawBushArt, E1).
- stillLay.ts: hide rows (HideRow: bush kind + width) laid by hideSocket; stillFaults holds open ground and "no ground under it".
- W1_STILL (w1Cast.ts:169) lays bushTall/bushWide only. The art: t-art-678b's cut pieces at src/assets/w1-678/ (moss-carpet 173x36,
  moss-patch 169x73, moss-drape 173x140, drape-b 78x140, snag-a/b 105x300, harpy-perchfeet-{ahead,turn,down,blink} 115x130 game px;
  catalog 3 units = 1 px of file), each its own file; loaded like w1CutArt.ts (trackAtlas) + a stagePreload key (stageManifest.ts).
- The kit: Post (predators/types.ts:107), def.rides (EAGLE rides its eye, E1), sweepPose.ts (rest/hunt/tell/act/recover/flee).

## The build, in packet order (D40: content the perch sits on first, then the perch, then the bots that fly both)
1. **Moss content**: Bush kinds 'moss' (carpet: tiled along the ground it lies on), 'mossPatch' (a mound), 'mossHang' (a drape, hanging:
   true) drawn by drawBushes from the w17 pieces at Pokey's scale (catalog ship sizes), in front of him like the bushes and thinning the same
   way; W1_STILL rows (w1-hide-moss carpet, w1-hide-moss-patch, w1-hide-moss-hang with hanging: true -> HideRow.hanging); NODE-KEY letter
   'm' asking for hide sockets (nodeLetters.ts); a mossy liana LOOKS mossy (Spanish moss strands drawn on the liana from moss-drape-b).
   Tests (RED first): rows lay the kinds, hanging hide has its top at the bough, letter m, inCover in each kind. Stills: Pokey still inside
   each cover kind with the tint (D65: the see-through rule judged behind moss too).
2. **The perch**: Post.perched -> PredatorState.perched: rides off for that one (body on the snag, eye swept, the act from the snag);
   sweepPose's perched branch: body at its post on the snag, frames ahead (rest), turn (the warn: the head turn), down (the gaze pass with
   its shadow on the moss), blink (its eye over him while he is hidden), the flying sprite for the dive/recover/fly-off. Planted tests.
3. **Bots that hold still in cover**: tier bots go still in the nearest cover on the screech (tools/inspect); castBots flies a stretch.
4. **Clips both ways (D63)**: hide in moss as the shadow passes; the perched eagle's head turn and dive. Full CLAUDE.md Checks.

## Honest scope call at the start
~25 min of gates (drawcheck ~6, clipcheck ~4, tests, build, tier bots) and ~10 min of stills/clips leave ~45 min to build. I aim to land 1
and 2 polished with tests and clips; 3 is the likeliest cut. Anything cut is named in the REPORT with its exact next step, never half-built.
