# Matt's 15 sheets of 2026-11-09: cut catalog (R-165.85)

15 sheets in (`reference/art-incoming/matt-2026-11-09/01.jpg`-`15.jpg` on branch ccr-ca657d3c-n09zty), **48 pieces kept**, 10 cuts rejected, plus one label fragment dropped (M-03-e, part of the word "Weathered"). Ids are `M-<sheet>-<letter>` (letters in reading order). Kept pieces are full-resolution transparent PNGs in `src/assets/w1-1109/` (no code refers to them; nothing is placed). `catalog.csv` has one row per cut, kept and rejected. `sheets/<kind>.jpg` are the contact sheets by kind, dark ground on the left, light on the right, cyan line = the measured flat walkable top; `sheets/rejected.jpg` shows every rejected cut with its reason, and `rejected/` holds each as JPEG. `cutter/` is the code and per-sheet config (how to re-run: `cutter/README.md`).

Every kept piece has no label text and no pink fringe: `cutter/pinkscan.py` finds 0 magenta pixels on any kept piece's edge, and every contact sheet was looked at on both grounds. The only magenta inside pieces is painted art (the lotus flowers, the pink bromeliads on M-05-a).

## Counts per kind

| Kind | Kept | Rejected | W1 or both |
|---|---|---|---|
| block | 1 | 0 | 1 |
| danger-looking | 1 | 0 | 1 |
| den or hide spot | 4 | 0 | 4 |
| lily pad | 8 | 0 | 8 |
| plant or dressing | 5 | 9 | 5 |
| puzzle piece | 8 | 0 | 7 |
| rock | 2 | 0 | 2 |
| soft landing | 7 | 0 | 7 |
| step set piece | 2 | 0 | 2 |
| tree | 6 | 0 | 5 |
| walkable log or plank | 4 | 1 | 4 |
| **total** | **48** | **10** | **46** |

Per sheet (pieces shown on the sheet = cuts here): 01: 4, 02: 4 pads + 1 reed tuft, 03: 4, 04: 4, 05: 2, 06: 4 labelled items = 6 cuts (the totems are three separate stones), 07: 4, 08: 4, 09: 2, 10: 4, 11: 4, 12: 8 plants = 9 cuts (one leaf keyed loose), 13: 2, 14: 2, 15: 2.

Float class is Matt's 11-07 ruling (STAGE-RULES "What may float"): **may float** = reads as a platform (logs, planks; lily pads on water only); **attached** = hangs from or grows on a trunk, post or rope; **grounded** = rocks, blocks, puzzle pieces, soft landings on the floor, set pieces, dressing, hide spots.

## Flags (the lead named these; art not edited)

- **M-04-b Heavy Wooden Crate has painted words, "CAUTION: FRAGILE"**: a problem for players who can't read. Use the wordless root-bound crate M-01-d instead, or ask Matt for a wordless re-paint.
- **M-06-e Pitcher Plant Patch reads as danger** (open carnivorous pitchers): either make it a real hazard or keep it off every landing and path. Never harmless dressing where Pokey lands.
- **Sheet 02 is the lily pads from above**: cut and kept, but marked "top view, not for platforms". Sheet 03's side-on pads are the platform set.

## Every piece

walk = the measured flat top in the PNG's own pixels: y from the top, then the x-range. "by hand" = no single flat top (stepped set pieces).

| id | label | kind | size | walk y (x0-x1) | world | float | notes |
|---|---|---|---|---|---|---|---|
| M-01-a | Mossy Volcanic Boulder Block | puzzle piece | 735x678 | 55 (207-605) | W1 | grounded | Pushable or breakable block (R-165.81). Three-quarter view cube: the line is the back edge of the top face; set the stand line on the front edge by hand. Fern sprigs at two corners. |
| M-01-b | Heavy Water-Logged Mahogany Log | puzzle piece | 810x596 | 56 (457-776) | both | grounded | Rollable or pushable log, shown on a diagonal (three-quarter view), so it is not a side-on platform. Shelf fungi along the side. |
| M-01-c | Carved Stone Monolith Block | puzzle piece | 517x712 | 51 (135-488) | W1 | grounded | Tall carved block (a face on the front). Three-quarter view; stand line by hand. |
| M-01-d | Heavy Root-Bound Wooden Crate | puzzle piece | 672x705 | 58 (159-535) | W1 | grounded | Crate wrapped in roots, no painted words. Three-quarter view; stand line by hand. |
| M-02-a | Victoria Lily Pad Platform | lily pad | 815x543 | 44 (102-712) | both | may float | TOP VIEW, NOT FOR PLATFORMS (the game is side-on; use M-03-a). Water-surface decor at most. |
| M-02-b | Soft Lotus Pad Platform | lily pad | 707x438 | 37 (130-567) | both | may float | TOP VIEW, NOT FOR PLATFORMS (use M-03-b). |
| M-02-d | Weathered Lily Pad Platform | lily pad | 866x568 | 23 (189-679) | both | may float | TOP VIEW, NOT FOR PLATFORMS (use M-03-c). |
| M-02-e | Flowering Lily Pad Platform | lily pad | 842x552 | 26 (172-670) | both | may float | TOP VIEW, NOT FOR PLATFORMS (use M-03-d). The pink is the painted lotus flower, not ground. |
| M-03-a | Victoria Lily Pad Platform | lily pad | 816x397 | 32 (414-736) | both | may float | Side-on platform set. Raised red rim all round; the measured line is only the right half of the back rim (a notch splits it): set the stand line along the rim by hand. Floats on water only. |
| M-03-b | Soft Lotus Pad Platform | lily pad | 820x275 | 22 (155-669) | both | may float | Side-on, thinnest pad (275 px tall); lotus bud on the left edge. Floats on water only. |
| M-03-c | Weathered Lily Pad Platform | lily pad | 868x393 | 17 (179-681) | both | may float | Side-on, mottled and holed: reads as old, could be the crumbling version. Floats on water only. |
| M-03-d | Flowering Lily Pad Platform | lily pad | 848x361 | 47 (164-686) | both | may float | Side-on; a big lotus flower sits in the middle of the top, so the walk line has a bump in the centre. Floats on water only. |
| M-04-a | Ancient Stone Block | puzzle piece | 671x681 | 58 (69-621) | W1 | grounded | Carved glyph block. Three-quarter view; stand line by hand. |
| M-04-b | Heavy Wooden Crate | puzzle piece | 606x567 | 45 (80-525) | both | grounded | FLAG: painted words "CAUTION: FRAGILE" on the side, a problem for players who cannot read (and breaks the no-words-in-art feel). Art not edited. Use M-01-d, or ask for a wordless re-paint. |
| M-04-c | Rusted Iron Barrel | puzzle piece | 510x669 | 17 (4-398) | W2 | grounded | Two loose iron rings lie at its foot (part of the cut). Man-made and rusty: reads more as a ruin or W2 prop than W1 rainforest. |
| M-04-d | Puzzle Lever Mechanism | puzzle piece | 838x691 | 47 (224-569) | both | grounded | Lever and gear on a stone base. Needs an on and off pose for a real lever; only one pose is painted. |
| M-05-a | Mossy Banyan Root Terraced Steps | step set piece | 1871x896 | by hand | W1 | grounded | A climb up root-wrapped stone steps (fills the root-step gap as one big set piece). Matt painted the trunk top fading into the ground colour; the fade is now a clean transparent fade (cutter/fadefix.py), so lay foliage or a canopy over its top. Steps are not flat: stand lines by hand. |
| M-05-b | Giant Water Lily Pad and Stone Step Formation | step set piece | 1849x637 | by hand | both | grounded | A pond crossing: lily pads and stone steps in painted water. The water is part of the picture: if the player can fall in, it must read as the hazard (STAGE-RULES §4). Stand lines by hand. |
| M-06-a | Hollow Stump Den | den or hide spot | 952x634 |  | W1 | grounded | Hide spot with a dark doorway, spreading roots. |
| M-06-c | Ancient Stone Totems | plant or dressing | 218x607 |  | W1 | grounded | Middle (tallest) totem of three; the only one at 600 px or more. |
| M-06-e | Pitcher Plant Patch | danger-looking | 890x634 |  | W1 | grounded | FLAG: reads as danger (open carnivorous pitchers). Either make it a real hazard or keep it off every landing and path; never decor where Pokey lands. |
| M-06-f | Swamp Log & Puddle | walkable log or plank | 981x533 | 111 (465-842) | both | grounded | Mossy log lying in a painted mud puddle: grounded, not a floating platform. The puddle is wide; lay it on flat ground. |
| M-07-a | Giant Shelf Fungus | soft landing | 912x562 | 54 (136-782) | W1 | attached | Stacked bracket fungus. Bracket fungi grow on trunks: attach to a trunk or stump. Bumpy top: stand line is the top tier. |
| M-07-b | Coiled Vine Mat | soft landing | 903x487 | 28 (181-742) | W1 | grounded | Flat coiled mat, low and wide: a landing pad on the ground. |
| M-07-c | Leaf Nest | soft landing | 1089x522 | 60 (265-912) | W1 | grounded | Pile of big leaves; leaf tips stick up past the walk line. |
| M-07-d | Frond Bundle | soft landing | 960x525 | 37 (364-787) | W1 | grounded | Tied bundle of fronds; near-flat top. |
| M-08-a | Mossy Tuff Block | block | 737x579 | 52 (81-616) | W1 | grounded | Moss-topped stone block with glowing cyan crystals (a hint the block is special). Three-quarter view; stand line by hand. |
| M-08-b | Vine Coil Cushion | soft landing | 895x475 | 27 (175-723) | W1 | grounded | Coiled vine nest with a dip in the middle; same family as M-07-b. |
| M-08-c | Spongy Fungi Mat | soft landing | 1077x477 | 38 (258-770) | W1 | grounded | Flat spongy fungus mat; close cousin of M-07-a but flat. |
| M-08-d | Frond Bundle Pad | soft landing | 1124x483 | 63 (304-812) | W1 | grounded | Flatter frond bundle; same family as M-07-d. |
| M-09-a | Giant Ceiba Tree | tree | 1156x1750 |  | both | grounded | Huge backdrop tree with buttress roots and plank shelves between them (1750 px tall). Backdrop or climb. A few small dark-red pockets stay deep between the left and right roots (ground seen through; only visible on a light ground). |
| M-09-b | Royal Palm | tree | 785x1726 |  | both | grounded | Tall smooth palm (1734 px); bare trunk is a pole climb candidate. |
| M-10-a | Strangler Fig | tree | 985x763 |  | W1 | grounded | Wide tree on a cage of roots; the roots read as climbable. |
| M-10-b | Traveler's Palm | tree | 624x756 |  | both | grounded | Fan palm on a thin trunk; backdrop. |
| M-10-c | Red Mangrove | tree | 635x684 |  | W2 | grounded | Stilt roots stand in a strip of painted water: a waterside tree. |
| M-10-d | Cannonball Tree | tree | 509x695 |  | W1 | grounded | Trunk with cannonball fruit and flowers; crown cut short at the top by the painter. |
| M-11-a | Cypress Knee Cavern | den or hide spot | 1005x743 |  | both | grounded | Cave mouth under cypress knees and roots. |
| M-11-b | Vine-Curtained Rock Arch | den or hide spot | 1020x659 |  | W1 | grounded | Walk-through arch. Matt painted a floor shadow under it in the ground colour; it is now a clean grey see-through shadow (cutter/floorfix.py). |
| M-11-c | Burl Hollow Den | den or hide spot | 899x662 |  | W1 | grounded | Big burl trunk with a dark hollow; a small dead branch on the right. |
| M-11-d | Palm Frond Canopy | plant or dressing | 839x670 |  | W1 | attached | A canopy to hang under (R-160.1): fronds hang from a vine bar. Attach both ends to trunks. |
| M-12-a | unlabelled (elephant ear plant) | plant or dressing | 629x586 |  | W1 | grounded | Ground dressing, in front or behind. |
| M-12-b | unlabelled (bird of paradise) | plant or dressing | 624x602 |  | W1 | grounded | Ground dressing with orange flowers. |
| M-12-i | unlabelled (berry bush) | plant or dressing | 615x498 |  | W1 | grounded | Round berry bush; ground dressing. |
| M-13-a | unlabelled (mossy rock) | rock | 909x577 | 32 (164-771) | both | grounded | Full-size grounded rock, moss on top; uneven top, the measured line is its highest flat run. |
| M-13-b | unlabelled (smooth brown boulder) | rock | 890x548 | 17 (166-756) | both | grounded | Full-size grounded boulder, domed top. |
| M-14-a | unlabelled (long dark log platform) | walkable log or plank | 1215x298 | 3 (33-1183) | both | may float | Flat-topped side-on log, long. Darker wood than 15. |
| M-15-a | unlabelled (plank or log platform) | walkable log or plank | 880x363 | 16 (62-823) | both | may float | Flat-topped side-on log, lighter wood. Near-twin of M-15-b (same length, slightly different grain): counts as one shape for variety. |
| M-15-b | unlabelled (plank or log platform) | walkable log or plank | 881x363 | 16 (62-824) | both | may float | Near-twin of M-15-a. |

## Rejected

| id | what | size | reason |
|---|---|---|---|
| M-02-c | unlabelled (reeds tuft beside the weathered pad) | 285x215 | unlabelled reeds with a smear of magenta painted under them (the smear is the same hue as the ground and cannot be keyed apart); also under 600 px |
| M-06-b | Ancient Stone Totems | 190x466 | under 600 px on its long side (466 px): re-roll larger |
| M-06-d | Ancient Stone Totems | 168x380 | under 600 px on its long side (380 px): re-roll larger |
| M-12-c | unlabelled (one loose leaf) | 219x125 | a single loose leaf the keyer split off the bird of paradise (M-12-b); a fragment, not a piece; also under 600 px |
| M-12-d | unlabelled (snake plant) | 410x546 | under 600 px on its long side (546 px): re-roll larger |
| M-12-e | unlabelled (flowering shrub) | 507x576 | under 600 px on its long side (576 px): re-roll larger |
| M-12-f | unlabelled (maidenhair fern) | 647x429 | polish: its stems are painted magenta like the ground and keyed out with it, so the leaves hang loose in the air (rough at phone size) |
| M-12-g | unlabelled (spider plant) | 370x357 | under 600 px on its long side (370 px): re-roll larger |
| M-12-h | unlabelled (bromeliad) | 580x427 | under 600 px on its long side (580 px): re-roll larger |
| M-14-b | unlabelled (short dark log platform) | 566x296 | under 600 px on its long side (566 px): re-roll larger |

## Against the 91-piece catalogue's "Still missing" list (art-raw-2026-11-07 cut/CATALOG.md)

| # | Gap | These pieces | Left open |
|---|---|---|---|
| 1 | Pit pieces (floor, left and right lips, a narrow pit) | none | **all of it** |
| 2 | Root steps at 2-3 heights | **partly**: M-05-a, a whole banyan-root staircase (one set piece, not modular steps). M-11-a's cypress knees are a cave, not steps. | modular root arches or knees at set heights |
| 3 | Full-size W1 grounded rocks | **filled**: M-13-a mossy rock (909 px), M-13-b boulder (890 px); M-08-a tuff block and M-01-a volcanic block also read as rock | none for size; W1 still has only two free-standing rock shapes |
| 4 | Mid-size stumps at 600+ px | none (M-06-a is a hide-spot stump, not a step) | **all of it** |
| 5 | A W1 ground or dirt band | none | **all of it** |
| 6 | W1 hazards of its own | **partly**: M-06-e pitcher plants read as danger (could be a W1 hazard if the team makes it one); painted water in M-05-b and M-10-c | thorns and pits for W1 |
| 7 | W1 hide spots | **filled**: M-06-a stump den, M-11-a cypress cavern, M-11-b rock arch, M-11-c burl hollow | none |
| 8 | W2 prop sets (bridges, scaffolds, ladders, cairns, lily pads, palisade) | **lily pads filled**: M-03-a to d, side-on, 816-868 px wide | bridges, scaffolds, ladders, cairns, palisade |

New kinds the old list didn't ask for: 8 puzzle pieces (R-165.81: blocks, crate, log, barrel, lever), 7 soft landings, 6 big trees,
a frond canopy to hang under (R-160.1), 4 side-on platform logs. Still worth asking for: the lever's second pose (M-04-d has one),
a wordless crate, and the 600 px re-rolls in "Rejected" (the short log M-14-b and five plants are clean, only small).
