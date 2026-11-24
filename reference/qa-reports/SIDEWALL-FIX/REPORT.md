# SIDEWALL-FIX (R-165.440): the two invisible walls on shipped stages, drawn as their colliders

EXACT NEXT STEP: see "Status" below (kept current at every push).

Engine member, branch t-fix-sidewall cut from origin/main cdffdc62. Drawing only: no layout code was touched.

## What was wrong, at its root
The painted ground (w1Pits.ts paintedBank, protoArt.ts bankPainted) takes every block 90 px or taller, but shows a bank against the
soil behind only by its lip and its end cap; a block narrower than his body (44) gets soil fill only, the backdrop's colour. Two shapes
of that shipped:
- 1-6 Normal: the 24 x 345 moss_stone support under each 157 px fragile branch (TWO a layout: seed 1 has them at x 27896 and x 45995;
  layout 1 at 29088 and 46173), standing in the floor trough, both sides open (225 px). The probe found none on 1-6 Easy (layouts 0, 1).
- 8-1 seed 38747: a 14 x 224 log (Easy 14 x 214) flush beside the 169 px log bank it continues (same top, same bottom): the bank's face
  and lip stopped at x 1466, the collider at 1480.

## The fix (general, by shape, never by stage)
`src/game/narrowBank.ts` decides, once a stage (memoised), the look of every painted bank narrower than his body:
- 'joined': flush against a painted bank of the same top and bottom (2 px) at least his width: the painter draws the two as ONE bank
  (`bankList`, the union box), so the face and lip end where the collider does (8-1).
- 'post': standing alone with a side open over his height (48) and its foot on a solid: drawn by `src/game/livePostArt.ts` as the
  inventory's World 1 tall live post (hf678/w1-livepost-tall, layer 'support', a made thing, "cut, not placed"), from the block's top to
  the floor top it stands on, root pad on the floor, the shaft (50 px of the picture's 142) drawn at the collider's width + 8 (32 px for
  24), the picture's own shape kept within 20% (1-6: 91 x 248 drawn, x scale 0.64, y 0.75); left out of the painted soil. Drawn by the
  painted ground after its soil, before the 'back' layer, so the branch sits over its top. Preloaded: stageManifest 'live-post',
  stagePreload. One drawImage per post in view; no allocation a frame (the post list and the merged bank list are memoised).
- Neither shape (a narrow block floating in the air, or both sides closed): unchanged, and the side-wall check FAILS it.
`tools/engine/sideWall.ts` reads the same decision (`narrowLook`), so the check and the screen cannot disagree.

## Planted
`tools/engine/sideWall.test.ts` (on the CI tool line): test 1 as TOOLS-1124b wrote it (2-6 as built GREEN; a floating 24 x 94 face
RED; 60 wide GREEN) still passes unchanged. Test 2 (new): with the drawer's decision taken away, 1-6 (layout 0) and 8-1 (seed 38747,
Normal and Easy) are RED; with it, GREEN; every caught 1-6 block is a post whose drawn shaft covers its collider (no more than 12 px
fatter) with its root pad on the floor; 8-1's sliver is no bank of its own and the merged bank's face stands at the collider's edge.
2/2 pass (d096f933).

## Status
(filled at hand-over)
