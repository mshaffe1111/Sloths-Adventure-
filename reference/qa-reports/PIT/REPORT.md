# PIT report: the thorn hollow looks like a real pit (2026-11-12, written 9:58 AM ET)
Branch `t-pit-polish` (base t-render-fixes@b8e98fac). No PR. Stills here: 2x, upright 412x915, sideways 915x412, 30 rendered frames each. The stage is the library's 1-2 kit (flown rows, seed 1), laid into the real page. Before = b8e98fac, after = this branch, same scene seed. Spots: x3500, x34250 (RF's spots) and x3850 (three close hollows, 49-66 px wide on 150-160 px banks). Files: `hollow-{before,after,compare}-x{3500,34250,3850}-{upright,sideways}.jpg`.

## What changed (w1Pits.ts, protoArt.ts)
- **Walls:** each wall is World 1's own bank end piece, at its bank's painted end face (groundPaint endFace). It shows 28 px into the bank and fades into the soil, shaded darker toward the bottom. The right one is set 38 px up its piece, so the two sides are not one mirrored picture. The piece is drawn at 0.6 width so its face fits: at most 8 px into the hole, at most 24 px back. Nothing is clamped, so no wall runs as a straight cut.
- **Inside:** the pit's drop art, going darker with depth. Each wall casts a shade along its own line. The far grass rim is World 1's ground lip, dimmed. The floor is rounded, so it is never a rectangle. There is no translucent band at the top.
- **Thorns:** no dark backing. They sit between the walls, and their feet fade into the floor.
- **Close hollows:** nothing dark lies past a wall, so the bank between keeps its soil.
- **Root causes of the leftover boxes:**
  1. The ground painter's generic pit shade (a blue-grey gradient with straight sides) was also laid over the hurt floor. It now skips it.
  2. The hurt floor's own grass lip showed as a slab under the thorns. It is now lipless.
- **No new art:** only the end piece, the lip, the drop and the w1-thorn pictures.
- **Cost:** the steady draw is 4-5 drawImage per hollow (about 0.02 ms for three, desktop). Baking is about 2.5 ms per hollow on desktop, so bakes are spread to one hollow per frame from the stage's first frame, nearest first. The thorn lift filter and the ground-sheet reads now happen once per stage.
- **Tools:** `stills-at.mjs` now renders 30 frames (it showed false soil boxes) and clears the flash before every render. Checked on 1-5 L1 x2750: no boxes. New: `hollowStills.mjs` (now in stillsTools.test's list) and `hollowKit.ts`.

## Polish check (I looked at every still, upright and sideways)
- Each hollow reads as a hole: torn lips, painted earth walls with roots, a dark back that deepens downward, and thorns on a rounded floor. No rectangle, no square patch, no slab, no blue box.
- Close hollows: clean soil banks between them.
- **Still rough, named:**
  1. On a few hollows one wall's painted face is fairly straight for about 60 px, because that is the end piece's own shape.
  2. The dimmed far rim shows as a dark green band under the lip.
  3. The backdrop seams in these stills (a vertical cut by the mushroom, the rain) come from laying the kit over 1-2's dressing. They are not the hollow.

## Checks (final code), times ET
- **Passed:**
  - tsc is clean.
  - w1Pits + briefPits + hurtFloor 34/34. The new test (walls are the end face, never on a bound, rounded, thorns and dark inside the walls, close banks clear) failed first, then passed.
  - Lock 102/102 unchanged (`lockall --layouts 2` against b8e98fac).
  - seedlist 1-1 PASS (355). drawcheck PASS (412 s, 9:48).
  - generality and knowncheck PASS.
  - clipcheck PASS (83 known, 410 s, 9:55).
- **Suite:** the full standard suite (started 9:22, still running at 9:58) caught one failure, mine: stillsTools.test. My 30-frame loop rendered without clearing the flash. Fixed and passing. No other failure so far.
- **Not covered:**
  - No shipped stage lays a hollow, so drawcheck does not exercise this code.
  - Frame times in this container swung from 1 to 22 ms on the same scene, so I give call counts, not phone milliseconds.
