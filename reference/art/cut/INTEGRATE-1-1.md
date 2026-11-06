# World 1 cuts ready to integrate in 1-1 (art director, 2026-11-06, for engine-core)

Lead 10:36 AM ET: so 1-1's art swap uses several painted kinds, not one boulder. **Data: `footing.json`** (same folder), rebuilt by
`python3 tools/art/w1keepers/footing.py`. Contact sheets with each footing line drawn in yellow: `footing-sheet-0.jpg`, `footing-sheet-1.jpg`.

## How to read footing.json
- `footing`: the standable top(s) in the cut PNG's own pixels: `y` from the image top, `x0..x1` the stand span. One entry per piece; a wall
  has one per ledge (a SET PIECE: one platform per ledge at exactly that height, the section built around it).
- `pokey_h`: the piece's drawn height in Pokey heights (Pokey's collider = 48 game px, engine.ts player.height). `drawn_game_h/w`: that
  in game px. `footing_game_y`: the footing's y in game px from the drawn top, so platform.y = drawTop + footing_game_y.
  The scales are my picks from the show-first stills; change them per placement, and the footing scales with the drawing.
- Draw each piece with its bottom at the ground line (sunk ~3 px, as the kit's `stand()` does). Matt's floating rule (via the lead, 11-06 11:31 AM ET): walked-on platforms (boughs, logs, planks) may float with no support; rocks, stones, pads and props never float; earth ledges pending Matt, so until he answers they are used from the floor up only.

## What 1-1 can place (27 measured + 3 walls)
| Kind | Pieces | Notes |
|---|---|---|
| stone (10) | rock-boulder-moss, rock-boulder-moss-big, boulder-grey-moss, boulder-grey-moss-b, rock-block-big, rock-root-block, rock-slabs-stacked, rock-slabs-stacked-big, rock-slabs-low, rock-roots | 4 kinds: round boulders (stand span = flat middle only), flat blocks (best platforms), stacked slabs, grey boulders |
| stump (4 heights) | stump-wide 1.6 P, hide-stump-hollow 2.4 P, hide-stump-hollow-tall 3.0 P, post-tall-vine 4.0 P | + the kit stump. The two hollow stumps are PERCHES ONLY (lead 11-06): narrow tops, never a floor |
| log (5 for W1) | log-plank-a, log-plank-b, plank-ledge-a/b/c | thin logs. log-lashed-short is W2 ONLY (rope-lashed, a made thing; lead 11-06): not in 1-1 |
| ledge (4; may float: pending Matt; use from the floor up only) | ledge-earth-long, ledge-earth-a, ledge-overhang-big, ground-chunk | ledge-earth-a is a small cut: upscale before a big draw |
| wall (3) | wall-earth-A (master), B, C | 7 / 7 / 9 standable tops each; C has two small middle ledges (y 250, 367); its right ledge tips were re-cut whole on 11-06 (now 467 px wide) |
| branch | branch-long-a, branch-knotted, branch-leafy | NOT platforms: drawn DIAGONAL in Gemini's sheet (no footing). Dressing only (lead 11-06); flat re-roll is redo R-09 |

## The earth-wall tint (use these in 1-1)
`<name>-w1.png` for the walls, caps, feet, earth ledges and ground chunk: the soil moved to World 1's bank soil colour (props-atlas `bank`),
moss and grass untouched, by `python3 tools/art/w1keepers/tint.py` (strength 0.85; soil mean 67,48,37 -> 75,56,49, bank 77,58,52).
Same pixels' shape, so the footings above hold for the -w1 files. Before/after in a real 1-5 frame:
`reference/art/show-first/sideways-C-wall-tint.png`, `upright-C-wall-tint.png`. Read: cooler and greyer, closer to the bank under it;
subtle. Strength 1.0 is one flag away if the lead wants more. The originals stay for W3's "darker" kin.

## Polish check
- Every footing line looked at on the contact sheets and the walls at full size: lines sit on the drawn tops within ~2 px. PASS.
- Fixed while measuring: the big overhang ledge was cut wrong (a box clipped most of it), re-cut whole; the ground chunk's auto line took
  half the top, set by eye. Bush names were swapped earlier, fixed.
- Not yet: any of this in the running game (that is engine-core's integration), and the drawcheck budget for more painted pieces.

## Rulings applied (lead, 11-06 11:12 AM ET)
Lashed log W2 only; hollow stumps perches only; diagonal branches dressing only + R-09; wall C re-cut with whole ledge tips (and a speck filter now drops islands under 150 px on every cut); wall tint kept at 0.85.
