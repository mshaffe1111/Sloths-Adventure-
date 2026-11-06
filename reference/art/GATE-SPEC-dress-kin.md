# Gate spec: G-dress and G-kin, for engine-core (art director, 2026-11-06)

Two gates every world will run (lead, 11-06 9:03 AM ET). Built now on World 1; Worlds 2-10 start with a known-defect list that can only
shrink (LAWS 5; the clipknown.json pattern), each entry with a stage and a still from reference/art/PHASE-A-FIXES.md. Both are fast
(seconds), run in `npx tsx --test` and in CI next to knowncheck. Each has planted failures that MUST fail, or the gate is broken.

## G-dress: nothing harmless looks dangerous where Pokey lands

The audit's L3 fails come from two places, so the gate checks both.

### Part A: the art itself (red spikes painted INTO a standable piece)
World 1's `branch` frame (PROTO_FRAMES, props-atlas.webp 381,1583 598x180) has the red bromeliad painted on its top; W5 draws the same
frame; W9's `mossStrip` (kits/w9.webp) has red spike flowers painted along its top. No placement data shows them, only the pixels.
- For every atlas frame the engine draws as a standable top (per world: bank, bankEnd, mossStrip, branch, branchCreak, snapL/R, perch,
  log, stump, boulder, fill; plus PROTO2/PROTO3 and any w*-new.json frame used as a platform), take the top band (top 35% of the frame,
  opaque pixels only).
- Red-spike pixel: alpha > 0.5, r > 1.6 g, r > 1.3 b, saturation > 0.45, value > 0.35.
- FAIL when the largest connected red-spike cluster in the band is over 400 px (at the frame's native size).
- Measured today (my script, 11-06): W1 branch 1805 px in band (FAILS, correct), branchCreak 17, log 101, mossStrip 292 scattered
  (pass). Re-measure W9 mossStrip, W5 kit, and every other world when wiring it; put each failing frame on the known list with its still.
- **Planted failures:** (1) a fixture frame = W1 `log` with a red bromeliad from `plantSprites` pasted on its top centre: must FAIL;
  (2) the real W1 `branch` frame with the known-list entry removed: must FAIL; (3) the plain W1 `log`: must PASS.

### Part B: placed dressing (sprites put on or next to a landing top)
- A tag table `src/game/dressTags.json`: every dressing sprite id (plantSprites, flowersAtlas, dressAtlasData, dressNew*, w8DecorData,
  envPlants kinds) tagged `spiky`, `red`, `remains` or `sign` where they apply. A sprite with no entry is untagged (fine). Tagging the
  tables is an art job: I can do it, with a contact sheet so the lead can check it.
- For every built stage (designed roll plus seeds 1-3, the same rolls the inspector uses), for every placed dressing item tagged
  `spiky` or `red`: FAIL if its drawn footprint overlaps the landing band of any standable platform: x within the platform's span,
  y from the top to 40 px above it (Pokey's feet and the jump arc's landing frames), or the walk line on a ground bank.
- **Planted failures:** a fixture stage with a tagged red bromeliad placed on a branch top (must FAIL); the same bromeliad 120 px behind
  the platform in the backdrop band (must PASS).

### Part C: remains (the lead's ruling, 11-05 night, NOT Matt's words)
- No skulls or bones as soil or dressing REMAINS anywhere. A warning SIGN with a skull (Matt's own 7-4 flume concept: "skull sign and
  TURN BACK") is a hazard signal and is allowed: tag `sign`, exempt.
- Dressing tagged `remains`: FAIL if any stage places it. Painted-in remains (W9's soil, `ground/w9.webp` and the W9 bank/fill frames,
  seen in 9-8) can't be found from data: list the textures in the tag table as `remains`, so the gate fails while a stage uses them;
  W9 starts on the known list (still `kit-audit/9-8.jpg`), cleared when the soil is repainted.
- **Planted failure:** a fixture stage placing a `remains` sprite: FAIL; the same with a `sign` sprite: PASS.

## G-kin: a support belongs to what it holds

Matt 11-06 12:15 AM ET: stacked unrelated pieces look tacky (a root or trunk on a board). The audit found 7-8 (vine pillar on a carved
slab), 5-8 (trunk under a branch), 6-8 (posts under planks, logs on posts), 9-2 / 9-8 (ladders on slabs, a trunk hanging with no base),
1-5 (bank and root wall side by side as one pillar).

### Kin table (every standable or supporting piece gets one)
| Kin | Pieces |
|---|---|
| ground | bank, bankEnd, fill, mossStrip, wall, buttress, the stage floor |
| living-wood | trunk, stump, branch, bough, root, liana |
| made-wood | plank, post, perch, ladder, frame, raft, dock |
| stone | boulder, slab, column, carved slab, rock ledge |
| metal | grate, chain, iron pole |

### Rules (checked on every built stage, same rolls as above)
A "support" is any piece whose top touches (within 6 px) the bottom of a standable piece above it and is drawn as holding it up (the
support pass's output, and any stacked pieces in hand-built stages).
1. **ground holds anything.** (Things stand on the earth.)
2. **Same kin holds same kin.** Living-wood on living-wood (a bough on its trunk), made-wood on made-wood (a plank on posts), stone on
   stone.
3. **Never:** living-wood standing ON made-wood, stone or metal (a trunk or vine pillar on a plank or slab: 7-8); stone or ground
   standing on wood; a ladder whose foot is on a slab, plank or grate (9-2) instead of ground or a ledge's own top.
4. **No baseless verticals:** a trunk, post, pillar or ladder must reach ground, the stage floor, or water (bottom within 6 px), or be
   drawn hanging from something above it with a visible top anchor (a chain, a liana). A trunk ending in mid-air fails (9-8).
5. **One picture per vertical face:** two different textures side by side as one column (1-5's bank + root wall) fail; the fix is one
   piece (the earth walls W1-23, Matt's sheets 36/38/39).
- **Planted failures (each must FAIL):** (a) trunk on a plank, the 7-8 shape; (b) ladder foot on a stone slab, the 9-2 shape;
  (c) a trunk whose bottom is 80 px above anything, the 9-8 shape; (d) a bank and a wall frame side by side as one column, the 1-5 shape.
  **Must PASS:** (e) a trunk on a ground bank; (f) a plank on two posts; (g) a bough on its own trunk.

## Reporting a breach
Print the stage id, roll, the two pieces (frame names), their x/y, and the rule number; for Part A the frame name and cluster size. That
is enough to find it in a still with `node tools/art/kitaudit/shoot.mjs`.

## Owners
engine-core builds both gates and the fixtures. The art director: the dressTags.json tagging with a contact sheet, the known-list
entries with stills, and judging the first breach report against real stills.
