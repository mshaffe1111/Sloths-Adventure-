# SIDEWALL-FIX (R-165.440): the two invisible walls on shipped stages, drawn as their colliders

EXACT NEXT STEP (session 3, SIDEWALL-FIX-c; the lead's rulings applied):
1. GATES on the final head (the commit after "SIDEWALL-FIX-c: 'joined' says what it guarantees"), each once, results in "Gates (session 3)"
   below: lockall `npx tsx tools/engine/lockall.ts --layouts 16 --check reference/qa-reports/SIDEWALL-FIX/lock-main-cdffdc62.json`
   (ZERO moves; any move goes to the lead first); paintcheck `--part 1/3`, `2/3`, `3/3` (GREEN, side-wall rule, no side-wall known
   list); the CI tool line (gates.yml, the `npx tsx --test tools/engine/library.test.ts ...` run line); the suite in shards; tsc.
2. Push to t-fix-sidewall, `git ls-remote` = HEAD, send the lead the hash and the gate table. Integration merges it into release 4.

The lead's rulings (session 3 brief): (1) 1-6 APPROVED: both posts read as vine-wrapped support posts under the branch, drawn last,
standing on the floor. (2) 8-1 ACCEPTED for release 4: the sliver 'joined' draws as a STANDARD bank end, consistent with every other
World 8 bank end. 'joined' is kept, and it guarantees only this: the sliver is part of a bank drawn by the bank painter, so no narrow
solid is painted as backdrop soil. It does NOT guarantee the face reaches the collider: the World 8 end-face inset (14-25 px inside
the collider below the lip, on every bank end) is R-165.442, release 5, not this job. narrowBank.ts's doc, sideWall.ts's comment and
sideWall.test.ts's test name and message now say exactly that (the test's check is unchanged: the merged bank's BOX ends at the
sliver's collider edge; no claim about the drawn face). (3) The 1-6 stair boulder drawn past its collider is R-165.443, not this job.
The earlier hand-over 2 step 1 (choose a painter fix or a narrower rule) is closed by ruling 2.

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
  (`bankList`, the union box), so the sliver is part of a bank the bank painter draws: a STANDARD bank end, no narrow solid painted as
  backdrop (8-1). It does not move the end face to the collider (World 8's end-face inset, R-165.442).
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

## Hand-over 2 findings (the after stills)
- 1-6, first try (d096f933): the post was HIDDEN. 1-6's stair (ids 130-132 at x 28053) is drawn by drawCutArt as a w1-cut boulder 503 x 166
  world units, about 200 px past its own collider into the trough, after the post (a one-frame draw log on the real page, tools/trace in
  the scratchpad). That boulder is the "backdrop boulder" TOOLS saw. Fix (29cc04d4): the post is drawn LAST in drawProtoScene (after the
  cut pieces and rocks), starting under what rests on it (the branch's underside, 874), so it never paints over the branch. After
  stills (after/): it stands on the floor, vine-wrapped, shaft about the collider's width, under the branch, both posts, upright and
  sideways. It reads as a support post. NOTE: the cut boulder drawn 200 px past its collider is a separate look-vs-collider mismatch
  (art where nothing is solid). He walks in front of it, so it is not a wall, but it is worth an R-number.
- 8-1: the before and after pixels in the collider strip are IDENTICAL (every column, all shots). The baked ground chunks draw this bank,
  and the merged bank's right end at 1480 paints the same as the sliver's own end did: the end face follows the end piece's profile
  (groundPaint.ts endFace), which on World 8 sits 14-25 px inside the end x below the lip (crops/8-1-face-inset-after.png: the face and
  its moss curtain end left of the collider; the strip shows pit). So the gap is the painter's end-face inset, on EVERY bank end, and the
  sliver only made it 14 px worse. The merge is right in principle (one bank, not two) but fixes nothing on screen.
- The check: sideWall.ts skips a 'joined' sliver as drawn, so paintcheck would read 8-1 GREEN with the look unchanged. That is a false
  green; it must not be taken as proof (step 1).

## Status
- Code head 002161a1 (pushed). Planted test 2/2; tsc 0; generalitycheck PASS; knowncheck PASS; artUse + art inventory + manifest/preload
  tests 22/22. Probe (2 seeds a listed stage, all 16 layouts on 8-1, both settings): sideWalls 0 on 1-6 and 8-1 with the drawer.
- BEFORE stills (main cdffdc62) in before/ (20 shots: 1-6 and 8-1, upright and sideways, Normal and Easy, close/wide/top; boxes.json).
  NOT YET LOOKED AT side by side with the after set; the after set was half shot at hand-over.
- NOT RUN yet: lockall, paintcheck (full), the CI tool line, the suite. No layout code is touched (narrowBank.ts reads geometry only;
  stageManifest adds a sheet key), so lockall should show 0 moves: that is a claim until step 2 runs.
- For Content (not mine to edit): the inventory row hf678/w1-livepost-tall still reads "cut, not placed" (in_game false); it is now
  drawn (livePostArt.ts) on 1-6. Tester data for stalls at 1-6 x ~27,900: not looked for (the packet: skip if not in the repo).
- 1-6 has TWO posts per layout (seed 1: x 27896 and x 45995), both now posts; 1-6 Easy lays none (probe, layouts 0 and 1).
