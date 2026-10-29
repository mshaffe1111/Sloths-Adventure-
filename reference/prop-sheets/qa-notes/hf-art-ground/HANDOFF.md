# hf-art-ground: handoff (2026-10-29, ~2:25 PM ET)

The lead moved this job to a cloud machine. Branch `hf-art-ground` (from ccr-0d59a91c-oy3imz at 6f0e095). Brief: polish report VI-8,
VI-13, VI-17 and VI-18, with a hard cap of $14 of Hugging Face time.

## Spend
About 37.5 GPU minutes on rtx-pro-6000, roughly **$1.72** of the $14 cap. The ledger is `tools/art/hfground/jobs.txt` (job ids, times,
cost). No job is running.

## Done (committed)
1. **Ground, VI-8: all 10 worlds, wired in, old path deleted.**
   - Art: `src/assets/ground/w1..w10.webp` (2048 square, 120-280 KB each) and `src/game/groundAtlasData.ts`. Each sheet holds three
     1024 soil textures, a 1024x160 top lip, and a 384x576 bank end.
   - Brick-bond tiling. Textures are periodic on a half-offset lattice (`tools/art/hfground/seam.py`), so rows offset by half a tile
     meet with no seam. The three variants share their edge band, so any variant sits next to any other with no seam.
   - Per-tile flips were NOT done: on a seamless texture a flip makes a mirror seam (VI-4's "inkblot"). The hashed variants plus the
     half-tile row offset replace them.
   - Code: `src/game/groundPaint.ts` (drawSoil, drawLip, drawEnd, endFace, the blob darkening field, the view-anchored depth gradient
     at 45% darker by the bottom of the view). `protoArt.ts drawBankArt`/`drawEarthWall` were rewritten. BANK_CROP, BANK_END_ROWS,
     SEAMLESS_BANK, seamlessBank and drawGroundFill are deleted.
   - terrain.ts skips a bank's code-drawn body when `bankPainted(p)` is true (it keeps topDecor). `setGroundPaint` is set from
     engine paintKit.
   - Ends: an open side gets the end piece plus a wobbling face (`endFace`). A step down to a lower bank gets the piece faded out
     above the lower bank's top (`leftStep`/`rightStep`). End pieces are rims only (the soil shows through), so narrow islands are
     not mirrored blobs.
   - Moss_stone banks are painted like the rest now. The moss strip remains only for the journal scenes (`moss=true`).
   - stagePreload warms the ground sheet with the stage's highest `kit:N`.
   - Picks: `tools/art/hfground/picks.json`. Review sheets (with 3x3 brick checks): `review-w1..w10.jpg` in this folder.
     - World 7: takes a and b failed (a was a diagonal jumble; b had a straight mortar grid). The redo, take d, passes.
     - World 10: take a has scale-like rocks, acceptable; take b showed row bands.
2. **Water signs, VI-13: carved wood, still and rattled.**
   - Art: `src/assets/props/water-signs.webp` and `src/game/waterSignData.ts` (made by `packsigns.py`). Frames: sign-w5,
     sign-w5-rattle, sign-jungle, sign-jungle-rattle, each 168x232.
   - Round 1 (spec-art2) FAILED: it kept the comic outline and the painted wave. Round 2 (spec-art3, from `starts2.py sign_sketch`)
     passes. Picks: w5 s72-19, jungle s62-7. `signs-packed.jpg`.
   - The rattle frame is the same painting with its board turned 7 degrees on the post.
   - Code: `waterSign.ts` (waterSignFor(world, rattled), signRattle). The engine rattles a sign for 0.7 s when Pokey comes within
     150 units. artCutin.test.ts was updated.
3. **World 5 props, VI-13: 18 repainted in place in `src/assets/props/w5-props.webp`.**
   - The pieces: cakes x8, teapots, teacups, armchairs x4, tea tables x2. The frames are unchanged, so every reference still works.
   - No black outline, darker-hue edges, light from the upper left. `w5-props-after.jpg` shows before and after on dark and grey.
   - Made by `packw5props.py`. Its de-purple step works on the silhouette edge only, so the cherries stay red.
4. **World 6 water, VI-18: `src/assets/props/w6-water.webp` at 1024 wide.**
   - Chop strip 1024x528, leaves repainted, streaks upscaled from the old sheet (`starts/w6water-streaks-old.webp`).
   - `badWaterArt.ts` FRAMES/DEEP/SURFACE updated. Packed by `packwater.py`. `w6-water-packed.jpg`.

## In progress (code written and type-checked, NOT yet committed before this handoff; it is in the commit that carries this file)
5. **Dressing, VI-17.**
   - Art: `src/assets/props/dress.webp` and `src/game/dressAtlasData.ts` (36 pieces, made by `packdress.py`):
     - World 5: 14 new pieces (bank A/B x3, a hanging pair, clutter A/B x3);
     - Worlds 1 and 2: 2 new hanging-moss pieces each, plus copies of their own painted pieces.
     - `dress-packed.jpg`, `review-dress.jpg`.
   - Code: `src/game/dressArt.ts` (load, drawDress). `artDress.ts`: DRESS_SETS and `dressSets()` (bank/hang/clutter, two sets each,
     rollLook). `protoStage.ts addDress()` is called from buildProtoStage, from World 2's branch and from gen2's in
     stageGenerator.generateStage. The engine draws `proto.dress` after the kit decor. stageSheets adds `'dress'` for built stages
     in Worlds 1, 2 and 5. stagePreload handles 'dress'.
   - Tests: artDress.test.ts has two new tests (pass). bankCull.test.ts was updated (pass).
   - Seen in game: 5-1's bank set A sits well at a bank edge.
   - Just fixed, NOT re-checked in game: a hanging piece in 1-2 hung from a ground-level log into the soil. Ledges must now be 150 or
     more units above the nearest bank top.
   - Likely to need updating: `src/game/gen2/game.test.ts` lines 142-143 expect 5-7/5-9 sheet lists without `'dress'` (add it after
     'w5-props'). Also check stageSheets.test.ts.

## Next
1. Run the full gate. The suite was still running at test 221 with no failures when I stopped; it was not finished.
   - `npx tsc --noEmit -p .` (passes)
   - `npx tsx --test src/audio/*.test.ts src/game/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/components/*.test.ts src/components/**/*.test.ts tools/inspect/*.test.ts tools/gen2/*.test.ts`
   - `npx vite build` (nothing over 4 MiB; the largest new asset is about 370 KB)
   - Before committing: `git checkout -- dev-dist; rm -f dev-dist/registerSW.js`.
2. Before/after shots of each world's ground (1-1, 2-1, 3-1, 4-1, 5-1, 5-7, 6-1, 7-1, 8-1) and each World 5 change, upright and
   sideways, into this folder.
   - Before build: `git archive 6f0e095 | tar -x -C <dir>`, link node_modules, then `NODE_ENV=development npx vite build`.
   - After build: the same from this branch.
   - Serve with `python3 -m http.server <port> -d <dist>`.
   - Shoot with `node tools/art/hfground/shots.mjs <port> <outDir> <tag> 6-1 7-1 ...`. Use `stage:dx` to move Pokey dx units right;
     `SETTLE=6000` waits out the stage card.
   - Combine with `tools/art/hfground/combine.py` or `strip.py`.
   - `tools/art/hfground/probe.mjs <port> <stage>` lists the platforms and dress pieces in view.
   - Headless Chromium crashes now and then here (retry it). The first round of before shots was lost when the shared scratchpad was
     wiped.
3. Look at the dressing in Worlds 1 and 2 in game: 1-2 at x 2300 and 7300; 2-2 bank reeds at x 0-720 and 11700. Check the hanging
   pieces after the fix.
4. Rebuild and republish Matt's test link: `python3 tools/testlink/build.py`, then the Artifact tool (HANDOFF §6).
5. Write the report with the Polish check.

## How the art is made (exact commands)
- Starts:
  - `python3 tools/art/hfground/starts.py [worlds]` (soil, lip, end per world)
  - `python3 tools/art/hfground/starts2.py` (props, signs, dressing, water)
  - Force-add them: `git add -f tools/art/hfground/starts/*.webp`, commit, push. The specs read starts from GitHub raw at a pinned
    commit.
- Specs:
  - `make_spec.py <commit>` writes spec-ground-a/b/c
  - `make_spec2.py <commit>` writes spec-art2
  - `make_spec3.py <commit>` writes spec-art3
- Job: `mcp__Hugging_Face__hf_jobs run` with:
  - image `ostris/aitoolkit:latest`, flavor `rtx-pro-6000`
  - secrets `{"HF_TOKEN": "$HF_TOKEN"}`
  - volumes `["hf://buckets/mshaffe111/w5-xfer:/out"]`
  - command: `bash -lc "mkdir -p /out/hfground/jobs && python -c \"import urllib.request as u; B='https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/<commit>/tools/art/hfground/'; open('/tmp/groundgpu.py','wb').write(u.urlopen(B+'groundgpu.py').read()); open('/tmp/seam.py','wb').write(u.urlopen(B+'seam.py').read()); open('/out/hfground/jobs/<spec>.json','wb').write(u.urlopen(B+'<spec>.json').read())\" && SUB=hfground/<area> SPEC=hfground/jobs/<spec>.json TAG=<tag> python /tmp/groundgpu.py"`
  - groundgpu.py item kinds: tile (two passes plus brick seam), strip (wraps left to right), plain.
- Results: `hf_fs attach hf://buckets/mshaffe111/w5-xfer/hfground/<area>/carrier-<tag>-0.png`, then
  `python3 -I tools/art/w5/unpack_carrier.py <attached png> tools/art/hfground/work/raw`.
  - The bucket holds hfground/ground (carriers ga, gb, gc), hfground/art2 (a2) and hfground/art3 (a3). Unpack ground into `raw` and
    art2/art3 into `raw2`.
  - `tools/art/hfground/work/` is git-ignored (it has its own `.gitignore`). Keep work there, not in the shared scratchpad, which
    other sessions wipe.
- Review: `review.py <raw> <out> <worlds>`, `review2.py <raw> <out.jpg> <prefix>`.
- Pack:
  - `pack.py <raw>` (ground, from picks.json)
  - `packsigns.py <raw2>`
  - `packw5props.py <raw2>` (run it on a fresh `git checkout src/assets/props/w5-props.webp`: it clears and refills the frames)
  - `packwater.py <raw2>`
  - `packdress.py <raw2>`

## Gotchas
- The magenta key leaves dark purple in thin roots: use `keying.depurple`. On a prop with real reds and pinks, pass `edge_only`, or
  cherries turn brown.
- `pack.py` runs when imported. Shared helpers live in `keying.py`.
- This container's disk ran out twice (other sessions). A full write truncated a start file (restored from git).
- The worktree guard refuses compound shell commands that mix git with heredocs or variables: run git on its own.
- Rough spots seen, not mine to fix here:
  - a flat green code-drawn block in 5-1's pit (a rock platform, x about 7700);
  - the lips are thin (a 22-30 unit moss band). LIP_W in groundPaint.ts can be raised to about 700 if Matt wants a heavier lip.

## Cloud round (2026-10-29, ~3:30 PM ET)
- Dressing (VI-17) checked over every World 1/2/5 stage, 8 rolls each (`work/dresscheck.ts`, git-ignored): nothing floats; fixed
  pieces standing in bounce pads, steps and walls (`free()`), hanging moss in front of a pickup, hanging moss under logs lying at ground
  level across wide water (now the two nearest banks, any distance), two bank sets facing each other across a pit (600+ apart now), the
  same piece twice side by side (clutter keeps 440/700 clear of bank sets), and each set laid in a turned order. Left: the fern always
  stands half in front of the mushroom in World 1's bank set A (by design: a cluster).
- 5-6 and 5-8 are the old generator and get no dressing (no `proto`).
- LIP_W 560 -> 700 (`work/lip-*.jpg` compared 560/700/840; 840 covered his feet in World 9's stone).
- World 10 soil redone: new start (`starts3.py`, broken blocks), job hfg-ground-d, pick fill-w10-c swapped in by `packfill.py`.
  `review-w10-redo.jpg`.
- Water signs: gen2 stood the sign at the higher of a gap's two lips, so on 6-1 it hung 80 units in the air; it now stands on the near
  lip (gen2/pipeline.ts). `after-6-1-sign-*.jpg`.
- Before/after: `ba-<stage>.jpg` (upright and sideways, before above, after below).

## Round 3 (2026-10-29, ~4:45 PM ET; the lead's review)
- World 5 soil retaken: start `starts4.py` fill-w5r (World 1's soil warmed), job hfg-art4, pick fill-w5-r (packfill.py).
  `review-w5-soil-redo.jpg`, `r3-5-1-x2000.jpg`, `r3-5-4-x1500.jpg`, `r3-5-7-x3000.jpg`.
- The green blocks in 5-1's and 1-2's pits were the soft pit's low step (moss_stone, 55 tall) drawn by terrain's code body. The step
  and the pit walls now carry `soil: true` (protoStage, w5Stages, w5Stage54): the step is painted as soil (bare: no end pieces, lip to
  its ends), the walls are left to the bank above them; drawProtoScene draws the lowest pieces first and closes a bank's end where a
  piece stands on it. `r3-1-2-x4250.jpg`, `r3-1-2-x11500.jpg`, `r3-5-1-x7300.jpg`.
- The white bar in 10-1 was the code-drawn toadstool's stalk. The bounce plants are painted now (job hfg-art4 stalks, hfg-art5 caps;
  `packbounce.py`, `picks-bounce.json`, `src/assets/props/bounce.webp`, `bounceArt.ts`); spanArt.ts's drawBounce is deleted. The stalk
  darkens downward; the cap and cue draw again over the painted ground (terrain.ts drawBounceCaps). `r3-10-1-x500.jpg`,
  `r3-1-2L4-x11600.jpg`, `review-bounce-caps.jpg`, `bounce-packed-*.jpg`.
