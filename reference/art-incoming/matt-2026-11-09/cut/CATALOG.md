# Matt's 15 sheets of 2026-11-09: cut catalog (R-165.85, attempt 2)

15 sheets in (`reference/art-incoming/matt-2026-11-09/01.jpg`-`15.jpg` on branch ccr-ca657d3c-n09zty), **54 pieces kept**, 4 cuts rejected, plus one label fragment dropped (M-03-e, part of the word "Weathered"). Ids are `M-<sheet>-<letter>` (letters in reading order). Kept pieces are full-resolution transparent PNGs in `src/assets/w1-1109/` (no code refers to them; nothing is placed). `catalog.csv` has one row per cut, kept and rejected. `sheets/<kind>.jpg` are the contact sheets by kind, dark ground on the left, light on the right, cyan line = the measured flat walkable top; `sheets/rejected.jpg` shows every rejected cut with its reason, and `rejected/` holds each as JPEG. `cutter/` is the code and per-sheet config (how to re-run: `cutter/README.md`).

Attempt 2 (the critic, 11-10): six pieces under 600 px are kept by the lead's ruling (M-06-b, M-06-d, M-12-d, M-12-e, M-12-h, M-14-b); M-12-g stays rejected. Every kept piece went through `cutter/edgefix.py` (ground-hued pockets faded out, spill pulled from an 8 px edge band), and `cutter/pinkscan.py` now also catches the darker magenta (r>g+45 and b>g+25 within 8 px of the edge). It finds **0 edge pixels on 49 of 54 kept pieces**. The other five are painted, checked at 2x on dark and light: M-02-a and M-03-a (the Victoria pads' red-purple rims), and M-02-b, M-02-e and M-03-d (the lotus buds and flowers). Walk lines must be at least 50% within 3 px of level; any top that fails is "by hand", with the silhouette reading in its notes. Only five pieces have a true flat top: M-13-b's crown, M-14-a/b and M-15-a/b.

## Counts per kind

| Kind | Kept | Rejected | fits W1 | fits W2 |
|---|---|---|---|---|
| block | 1 | 0 | 0 | 0 |
| danger-looking | 1 | 0 | 1 | 0 |
| den or hide spot | 4 | 0 | 2 | 0 |
| lily pad | 8 | 0 | 0 | 8 |
| plant or dressing | 10 | 4 | 6 | 2 |
| puzzle piece | 8 | 0 | 2 | 4 |
| rock | 2 | 0 | 1 | 1 |
| soft landing | 7 | 0 | 5 | 3 |
| step set piece | 2 | 0 | 0 | 1 |
| tree | 6 | 0 | 2 | 4 |
| walkable log or plank | 5 | 0 | 5 | 3 |
| **total** | **54** | **4** | **24** | **26** |

Per sheet (pieces shown on the sheet = cuts here): 01: 4, 02: 4 pads + 1 reed tuft, 03: 4, 04: 4, 05: 2, 06: 4 labelled items = 6 cuts (the totems are three separate stones), 07: 4, 08: 4, 09: 2, 10: 4, 11: 4, 12: 8 plants = 9 cuts (one leaf keyed loose), 13: 2, 14: 2, 15: 2.

Float class is Matt's 11-07 ruling (STAGE-RULES "What may float"): **may float** = reads as a platform (logs, planks; lily pads on water only); **attached** = hangs from or grows on a trunk, post or rope; **grounded** = rocks, blocks, puzzle pieces, soft landings on the floor, set pieces, dressing, hide spots.

## Flags (the lead named these; art not edited)

- **M-04-b Heavy Wooden Crate has painted words, "CAUTION: FRAGILE"**: a problem for players who can't read. Use the wordless root-bound crate M-01-d instead, or ask Matt for a wordless re-paint.
- **M-06-e Pitcher Plant Patch reads as danger** (open carnivorous pitchers): either make it a real hazard or keep it off every landing and path. Never harmless dressing where Pokey lands.
- **Sheet 02 is the lily pads from above**: cut and kept, but marked "top view, not for platforms". Sheet 03's side-on pads are the platform set.

## By world (Matt, 11-11: "determine where they work the best... some may work in multiple worlds")

Every world a piece fits, judged by material and mood (STORY-KEEPER's ten worlds); **bold** = that world is the piece's best fit. The gap is what reference/art/KIT-AUDIT.md (11-06) says the world's kit is short of. **Made things are never World 1** (the lead, 11-11: no made things in the home forest; rope is a made thing, like the lantern): ladders, rope bridges and rope posts, crates, barrels, the lever, sawn posts and boards, carved totems and carved or rune stones go to W2 Sunlit Riverbank (rope and wood work) or W7 Ancient Ruins (carved stone, the lever). Natural pieces (rock, stump, log, root steps, moss, fungus) stay as tagged.

| World | Pieces (best fit in bold) | Its kit gap |
|---|---|---|
| 1 Emerald Canopy (24) | M-01-a, M-01-b, **M-06-a**, M-06-e, M-06-f, M-07-a, **M-07-b**, **M-07-c**, **M-08-b**, M-08-c, **M-10-a**, M-10-d, **M-11-c**, M-11-d, **M-12-a**, M-12-b, M-12-e, M-12-h, **M-12-i**, M-13-a, **M-14-a**, **M-14-b**, **M-15-a**, **M-15-b** | floor kinds (stones, stumps, logs), a painted thorn hazard |
| 2 Sunlit Riverbank (26) | M-01-b, **M-01-d**, **M-02-a**, **M-02-b**, M-02-d, M-02-e, **M-03-a**, **M-03-b**, M-03-c, M-03-d, **M-04-b**, M-04-c, **M-05-b**, M-06-f, M-07-b, **M-07-d**, **M-08-d**, M-09-a, **M-09-b**, **M-10-b**, M-10-c, M-12-b, M-12-i, M-13-b, M-15-a, M-15-b | docks, rafts, floor kinds, painted water |
| 3 Mossy Grotto (12) | M-01-a, M-01-c, M-04-a, M-06-b, M-06-c, M-06-d, **M-07-a**, **M-08-a**, **M-08-c**, M-11-a, M-11-b, **M-13-a** | floor kinds, darker shelves |
| 4 Mist Cascades (3) | M-11-b, M-13-a, **M-13-b** | floor kinds, a painted hazard |
| 5 Orchid Sanctuary (27) | M-02-b, **M-02-e**, M-03-a, M-03-b, **M-03-d**, M-05-a, M-05-b, **M-06-e**, M-07-b, M-07-c, M-07-d, M-08-b, M-08-d, M-09-b, M-10-b, **M-10-d**, M-11-d, M-12-a, **M-12-b**, **M-12-d**, **M-12-e**, **M-12-h**, M-12-i, M-14-a, M-14-b, M-15-a, M-15-b | its own floor (no branch, log, liana or perch) |
| 6 Deep Mangrove (20) | **M-01-b**, M-01-d, M-02-a, M-02-b, **M-02-d**, M-02-e, M-03-a, M-03-b, **M-03-c**, M-03-d, M-05-b, M-06-a, M-06-e, **M-06-f**, **M-10-c**, **M-11-a**, M-11-c, M-12-a, M-14-a, M-14-b | variety (one log tiled three times) |
| 7 Ancient Ruins (13) | **M-01-c**, M-01-d, **M-04-a**, **M-04-d**, **M-05-a**, **M-06-b**, **M-06-c**, **M-06-d**, M-09-a, M-10-a, M-10-d, **M-11-b**, M-12-d | rubble blocks, fallen columns, root-split slabs |
| 8 Twilight Treetops (12) | M-06-a, M-07-a, M-07-c, M-08-b, M-08-c, **M-09-a**, M-10-a, M-11-c, **M-11-d**, M-12-h, M-14-a, M-14-b | a painted hazard, floor kinds |
| 9 Volcanic Jungle (6) | **M-01-a**, M-08-a, M-09-b, M-10-b, M-12-d, M-13-b | floor kinds |
| 10 Stormy Highlands Fortress (5) | M-04-b, **M-04-c**, M-04-d, M-13-a, M-13-b | anything but the iron grate |

## Every piece

walk = the measured flat top in the PNG's own pixels: y from the top, then the x-range, then the share within 3 px of level. "by hand" = no flat top.

| id | label | kind | size | walk y (x0-x1) flat | worlds, best first | why | float | notes |
|---|---|---|---|---|---|---|---|---|
| M-01-a | Mossy Volcanic Boulder Block | puzzle piece | 735x678 | by hand | 9 Volcanic Jungle; 3 Mossy Grotto; 1 Emerald Canopy | volcanic boulder block (porous lava rock under moss): volcano first; a puzzle block in grotto or forest | grounded | Pushable or breakable block (R-165.81). Three-quarter view cube: the line is the back edge of the top face; set the stand line on the front edge by hand. Fern sprigs at two corners. No flat top: the silhouette top near y 55 (x 207-605) is only 8% within 3 px of level; stand line by hand. |
| M-01-b | Heavy Water-Logged Mahogany Log | puzzle piece | 810x596 | by hand | 6 Deep Mangrove; 2 Sunlit Riverbank; 1 Emerald Canopy | water-logged mahogany log: swamp and riverbank; a roll or push puzzle | grounded | Rollable or pushable log, shown on a diagonal (three-quarter view), so it is not a side-on platform. Shelf fungi along the side. No flat top: the silhouette top near y 56 (x 457-776) is only 6% within 3 px of level; stand line by hand. |
| M-01-c | Carved Stone Monolith Block | puzzle piece | 517x712 | by hand | 7 Ancient Ruins; 3 Mossy Grotto | carved stone monolith block: ruins first; fills 7 rubble blocks | grounded | Tall carved block (a face on the front). Three-quarter view; stand line by hand. No flat top: the silhouette top near y 51 (x 135-488) is only 8% within 3 px of level; stand line by hand. |
| M-01-d | Heavy Root-Bound Wooden Crate | puzzle piece | 672x705 | by hand | 2 Sunlit Riverbank; 6 Deep Mangrove; 7 Ancient Ruins | root-bound crate: a village crate the swamp and roots took back (made thing; lead 11-11: no made things in the home forest) | grounded | Crate wrapped in roots, no painted words. Three-quarter view; stand line by hand. No flat top: the silhouette top near y 58 (x 159-535) is only 16% within 3 px of level; stand line by hand. |
| M-02-a | Victoria Lily Pad Platform | lily pad | 815x543 | by hand | 2 Sunlit Riverbank; 6 Deep Mangrove | top-view Victoria pad: water-surface decor only | may float | TOP VIEW, NOT FOR PLATFORMS (the game is side-on; use M-03-a). Water-surface decor at most. No flat top: the silhouette top near y 44 (x 102-712) is only 6% within 3 px of level; stand line by hand. |
| M-02-b | Soft Lotus Pad Platform | lily pad | 707x438 | by hand | 2 Sunlit Riverbank; 6 Deep Mangrove; 5 Orchid Sanctuary | top-view lotus pad: water decor | may float | TOP VIEW, NOT FOR PLATFORMS (use M-03-b). No flat top: the silhouette top near y 37 (x 130-567) is only 5% within 3 px of level; stand line by hand. |
| M-02-d | Weathered Lily Pad Platform | lily pad | 866x568 | by hand | 6 Deep Mangrove; 2 Sunlit Riverbank | top-view weathered pad: water decor | may float | TOP VIEW, NOT FOR PLATFORMS (use M-03-c). No flat top: the silhouette top near y 23 (x 189-679) is only 12% within 3 px of level; stand line by hand. |
| M-02-e | Flowering Lily Pad Platform | lily pad | 842x552 | by hand | 5 Orchid Sanctuary; 2 Sunlit Riverbank; 6 Deep Mangrove | top-view flowering lotus pad: garden pond first | may float | TOP VIEW, NOT FOR PLATFORMS (use M-03-d). The pink is the painted lotus flower, not ground. No flat top: the silhouette top near y 26 (x 172-670) is only 10% within 3 px of level; stand line by hand. |
| M-03-a | Victoria Lily Pad Platform | lily pad | 816x397 | by hand | 2 Sunlit Riverbank; 6 Deep Mangrove; 5 Orchid Sanctuary | Victoria pad platform: the river first, the swamp; fills 2 rafts and floor | may float | Side-on platform set. Raised red rim all round; no flat top (the rim curves away at both ends): stand line by hand. Floats on water only. |
| M-03-b | Soft Lotus Pad Platform | lily pad | 820x275 | by hand | 2 Sunlit Riverbank; 5 Orchid Sanctuary; 6 Deep Mangrove | lotus pad platform: river, garden pond | may float | Side-on, thinnest pad (275 px tall); lotus bud on the left edge. No flat top (edges curl down): stand line by hand. Floats on water only. |
| M-03-c | Weathered Lily Pad Platform | lily pad | 868x393 | by hand | 6 Deep Mangrove; 2 Sunlit Riverbank | weathered holed pad: swamp first (reads old, a crumble candidate) | may float | Side-on, mottled and holed: reads as old, could be the crumbling version. No flat top: stand line by hand. Floats on water only. |
| M-03-d | Flowering Lily Pad Platform | lily pad | 848x361 | by hand | 5 Orchid Sanctuary; 2 Sunlit Riverbank; 6 Deep Mangrove | flowering lotus pad: the orchid garden pond first (fills 5 floor) | may float | Side-on; a big lotus flower sits in the middle of the top, so there is no flat top: stand line by hand. Floats on water only. |
| M-04-a | Ancient Stone Block | puzzle piece | 671x681 | by hand | 7 Ancient Ruins; 3 Mossy Grotto | glyph-carved stone block: ruins puzzle block | grounded | Carved glyph block. Three-quarter view; stand line by hand. No flat top: the silhouette top near y 58 (x 69-621) is only 18% within 3 px of level; stand line by hand. |
| M-04-b | Heavy Wooden Crate | puzzle piece | 606x567 | by hand | 2 Sunlit Riverbank; 10 Stormy Highlands Fortress | painted crate (FLAG: words): village storehouse, fortress stores | grounded | FLAG: painted words "CAUTION: FRAGILE" on the side, a problem for players who cannot read (and breaks the no-words-in-art feel). Art not edited. Use M-01-d, or ask for a wordless re-paint. No flat top: the silhouette top near y 45 (x 80-525) is only 10% within 3 px of level; stand line by hand. |
| M-04-c | Rusted Iron Barrel | puzzle piece | 510x669 | by hand | 10 Stormy Highlands Fortress; 2 Sunlit Riverbank | rusted iron barrel: the iron fortress first, the village; fills 10 non-grate props | grounded | Two loose iron rings lie at its foot (part of the cut). Man-made and rusty: reads more as a ruin or W2 prop than W1 rainforest. No flat top: the silhouette top near y 17 (x 4-398) is only 13% within 3 px of level; stand line by hand. |
| M-04-d | Puzzle Lever Mechanism | puzzle piece | 838x691 | by hand | 7 Ancient Ruins; 10 Stormy Highlands Fortress | gear-and-lever on a stone base: ruins mechanism, fortress machinery | grounded | Lever and gear on a stone base. Needs an on and off pose for a real lever; only one pose is painted. No flat top: the silhouette top near y 47 (x 224-569) is only 10% within 3 px of level; stand line by hand. |
| M-05-a | Mossy Banyan Root Terraced Steps | step set piece | 1871x896 | by hand | 7 Ancient Ruins; 5 Orchid Sanctuary | banyan roots over cut stone stairs: an overgrown ruin stair first, the garden (made thing; lead 11-11: no made things in the home forest) | grounded | A climb up root-wrapped stone steps (fills the root-step gap as one big set piece). Matt painted the trunk top fading into the ground colour; the fade is now a clean transparent fade (cutter/fadefix.py), so lay foliage or a canopy over its top. Steps are not flat: stand lines by hand. |
| M-05-b | Giant Water Lily Pad and Stone Step Formation | step set piece | 1849x637 | by hand | 2 Sunlit Riverbank; 5 Orchid Sanctuary; 6 Deep Mangrove | lily pond with stepping stones: river crossing, garden pond; fills 2 painted water | grounded | A pond crossing: lily pads and stone steps in painted water. The water is part of the picture: if the player can fall in, it must read as the hazard (STAGE-RULES §4). Stand lines by hand. |
| M-06-a | Hollow Stump Den | den or hide spot | 952x634 |  | 1 Emerald Canopy; 6 Deep Mangrove; 8 Twilight Treetops | hollow stump hide spot | grounded | Hide spot with a dark doorway, spreading roots. |
| M-06-b | Ancient Stone Totems | plant or dressing | 190x466 |  | 7 Ancient Ruins; 3 Mossy Grotto | carved stone totem: ruins | grounded | Left totem of three. Under 600 px, kept by the lead (11-10). |
| M-06-c | Ancient Stone Totems | plant or dressing | 218x607 |  | 7 Ancient Ruins; 3 Mossy Grotto | carved stone totem: ruins | grounded | Middle (tallest) totem of three; the only one at 600 px or more. |
| M-06-d | Ancient Stone Totems | plant or dressing | 168x380 |  | 7 Ancient Ruins; 3 Mossy Grotto | carved stone totem: ruins | grounded | Right totem of three. Under 600 px, kept by the lead (11-10). |
| M-06-e | Pitcher Plant Patch | danger-looking | 890x634 |  | 5 Orchid Sanctuary; 6 Deep Mangrove; 1 Emerald Canopy | pitcher plants: the orchid garden (carnivorous plants, the Tarantula Queen's garden), swamp; a painted hazard candidate | grounded | FLAG: reads as danger (open carnivorous pitchers). Either make it a real hazard or keep it off every landing and path; never decor where Pokey lands. |
| M-06-f | Swamp Log & Puddle | walkable log or plank | 981x533 | by hand | 6 Deep Mangrove; 1 Emerald Canopy; 2 Sunlit Riverbank | log in a mud puddle: swamp first; fills 6 log variety | grounded | Mossy log lying in a painted mud puddle: grounded, not a floating platform. The puddle is wide; lay it on flat ground. No flat top: the silhouette top near y 111 (x 465-842) is only 8% within 3 px of level; stand line by hand. |
| M-07-a | Giant Shelf Fungus | soft landing | 912x562 | by hand | 3 Mossy Grotto; 1 Emerald Canopy; 8 Twilight Treetops | giant shelf fungus: grotto first | attached | Stacked bracket fungus. Bracket fungi grow on trunks: attach to a trunk or stump. Bumpy top: stand line is the top tier. No flat top: the silhouette top near y 54 (x 136-782) is only 19% within 3 px of level; stand line by hand. |
| M-07-b | Coiled Vine Mat | soft landing | 903x487 | by hand | 1 Emerald Canopy; 5 Orchid Sanctuary; 2 Sunlit Riverbank | coiled vine mat | grounded | Flat coiled mat, low and wide: a landing pad on the ground. No flat top: the silhouette top near y 28 (x 181-742) is only 6% within 3 px of level; stand line by hand. |
| M-07-c | Leaf Nest | soft landing | 1089x522 | by hand | 1 Emerald Canopy; 5 Orchid Sanctuary; 8 Twilight Treetops | leaf nest | grounded | Pile of big leaves; leaf tips stick up past the walk line. No flat top: the silhouette top near y 60 (x 265-912) is only 14% within 3 px of level; stand line by hand. |
| M-07-d | Frond Bundle | soft landing | 960x525 | by hand | 2 Sunlit Riverbank; 5 Orchid Sanctuary | tied frond bundle: village, garden (made thing; lead 11-11: no made things in the home forest) | grounded | Tied bundle of fronds; near-flat top. No flat top: the silhouette top near y 37 (x 364-787) is only 10% within 3 px of level; stand line by hand. |
| M-08-a | Mossy Tuff Block | block | 737x579 | by hand | 3 Mossy Grotto; 9 Volcanic Jungle | moss block with glowing cyan crystals: grotto first, volcanic tuff second | grounded | Moss-topped stone block with glowing cyan crystals (a hint the block is special). Three-quarter view; stand line by hand. No flat top: the silhouette top near y 52 (x 81-616) is only 10% within 3 px of level; stand line by hand. |
| M-08-b | Vine Coil Cushion | soft landing | 895x475 | by hand | 1 Emerald Canopy; 8 Twilight Treetops; 5 Orchid Sanctuary | vine coil cushion | grounded | Coiled vine nest with a dip in the middle; same family as M-07-b. No flat top: the silhouette top near y 27 (x 175-723) is only 16% within 3 px of level; stand line by hand. |
| M-08-c | Spongy Fungi Mat | soft landing | 1077x477 | by hand | 3 Mossy Grotto; 1 Emerald Canopy; 8 Twilight Treetops | spongy fungus mat: grotto | grounded | Flat spongy fungus mat; close cousin of M-07-a but flat. No flat top: the silhouette top near y 38 (x 258-770) is only 16% within 3 px of level; stand line by hand. |
| M-08-d | Frond Bundle Pad | soft landing | 1124x483 | by hand | 2 Sunlit Riverbank; 5 Orchid Sanctuary | tied frond bundle pad: village, garden (made thing; lead 11-11: no made things in the home forest) | grounded | Flatter frond bundle; same family as M-07-d. No flat top: the silhouette top near y 63 (x 304-812) is only 15% within 3 px of level; stand line by hand. |
| M-09-a | Giant Ceiba Tree | tree | 1156x1750 |  | 8 Twilight Treetops; 7 Ancient Ruins; 2 Sunlit Riverbank | giant ceiba with plank shelves built into its buttresses: a treetop village landmark, ruins (made thing; lead 11-11: no made things in the home forest); without the planks it would be W1's best landmark | grounded | Huge backdrop tree with buttress roots and plank shelves between them (1750 px tall). Backdrop or climb. A few small dark-red pockets stay deep between the left and right roots (ground seen through): plain on a light ground, faint on dark and jungle-green grounds too. |
| M-09-b | Royal Palm | tree | 785x1726 |  | 2 Sunlit Riverbank; 9 Volcanic Jungle; 5 Orchid Sanctuary | royal palm: riverbank, volcanic jungle, garden | grounded | Tall smooth palm (1734 px); bare trunk is a pole climb candidate. |
| M-10-a | Strangler Fig | tree | 985x763 |  | 1 Emerald Canopy; 7 Ancient Ruins; 8 Twilight Treetops | strangler fig cage of roots: canopy, ruins (figs swallow temples) | grounded | Wide tree on a cage of roots; the roots read as climbable. |
| M-10-b | Traveler's Palm | tree | 624x756 |  | 2 Sunlit Riverbank; 5 Orchid Sanctuary; 9 Volcanic Jungle | traveler's palm: riverbank, garden | grounded | Fan palm on a thin trunk; backdrop. |
| M-10-c | Red Mangrove | tree | 635x684 |  | 6 Deep Mangrove; 2 Sunlit Riverbank | red mangrove on stilt roots in water: the mangrove world | grounded | Stilt roots stand in a strip of painted water: a waterside tree. |
| M-10-d | Cannonball Tree | tree | 509x695 |  | 5 Orchid Sanctuary; 1 Emerald Canopy; 7 Ancient Ruins | cannonball tree in flower: the orchid garden first | grounded | Trunk with cannonball fruit and flowers; crown cut short at the top by the painter. |
| M-11-a | Cypress Knee Cavern | den or hide spot | 1005x743 |  | 6 Deep Mangrove; 3 Mossy Grotto | cypress knee cavern: swamp first (cypress knees), grotto | grounded | Cave mouth under cypress knees and roots. |
| M-11-b | Vine-Curtained Rock Arch | den or hide spot | 1020x659 |  | 7 Ancient Ruins; 3 Mossy Grotto; 4 Mist Cascades | vine-curtained rock arch: ruins gateway, grotto, cliffs | grounded | Walk-through arch. Matt painted a floor shadow under it in the ground colour; it is now a clean grey see-through shadow (cutter/floorfix.py). |
| M-11-c | Burl Hollow Den | den or hide spot | 899x662 |  | 1 Emerald Canopy; 8 Twilight Treetops; 6 Deep Mangrove | burl hollow den | grounded | Big burl trunk with a dark hollow; a small dead branch on the right. |
| M-11-d | Palm Frond Canopy | plant or dressing | 839x670 |  | 8 Twilight Treetops; 1 Emerald Canopy; 5 Orchid Sanctuary | frond canopy to hang under: treetops, canopy | attached | A canopy to hang under (R-160.1): fronds hang from a vine bar. Attach both ends to trunks. |
| M-12-a | unlabelled (elephant ear plant) | plant or dressing | 629x586 |  | 1 Emerald Canopy; 5 Orchid Sanctuary; 6 Deep Mangrove | elephant ear plant | grounded | Ground dressing, in front or behind. |
| M-12-b | unlabelled (bird of paradise) | plant or dressing | 624x602 |  | 5 Orchid Sanctuary; 2 Sunlit Riverbank; 1 Emerald Canopy | bird of paradise: garden first | grounded | Ground dressing with orange flowers. |
| M-12-d | unlabelled (snake plant) | plant or dressing | 410x546 |  | 5 Orchid Sanctuary; 7 Ancient Ruins; 9 Volcanic Jungle | snake plant: garden, ruins courtyard, volcanic scrub | grounded | Under 600 px, kept by the lead (11-10). |
| M-12-e | unlabelled (flowering shrub) | plant or dressing | 507x576 |  | 5 Orchid Sanctuary; 1 Emerald Canopy | flowering shrub: garden | grounded | Under 600 px, kept by the lead (11-10). |
| M-12-h | unlabelled (bromeliad) | plant or dressing | 580x427 |  | 5 Orchid Sanctuary; 1 Emerald Canopy; 8 Twilight Treetops | bromeliad: garden (keep red spikes off landing tops, KIT-AUDIT L3) | grounded | Under 600 px, kept by the lead (11-10). |
| M-12-i | unlabelled (berry bush) | plant or dressing | 615x498 |  | 1 Emerald Canopy; 5 Orchid Sanctuary; 2 Sunlit Riverbank | berry bush | grounded | Round berry bush; ground dressing. |
| M-13-a | unlabelled (mossy rock) | rock | 909x577 | by hand | 3 Mossy Grotto; 4 Mist Cascades; 1 Emerald Canopy; 10 Stormy Highlands Fortress | mossy grey rock: grotto, cliffs, forest, highlands | grounded | Full-size grounded rock, moss on top; uneven top, the measured line is its highest flat run. No flat top: the silhouette top near y 32 (x 164-771) is only 32% within 3 px of level; stand line by hand. |
| M-13-b | unlabelled (smooth brown boulder) | rock | 890x548 | 3 (355-604) 1.0 | 4 Mist Cascades; 10 Stormy Highlands Fortress; 9 Volcanic Jungle; 2 Sunlit Riverbank | smooth brown boulder, flat crown: cliffs, highlands, volcano, riverbank | grounded | Full-size grounded boulder, domed top: the walk line is the flat crown only (x 355-604); the sides fall away. |
| M-14-a | unlabelled (long dark log platform) | walkable log or plank | 1215x298 | 3 (33-1183) 0.97 | 1 Emerald Canopy; 6 Deep Mangrove; 8 Twilight Treetops; 5 Orchid Sanctuary | dark side-on log platform: forest, swamp, night canopy, the garden that has no log (fills 5) | may float | Flat-topped side-on log, long. Darker wood than 15. |
| M-14-b | unlabelled (short dark log platform) | walkable log or plank | 566x296 | 2 (26-534) 0.94 | 1 Emerald Canopy; 6 Deep Mangrove; 8 Twilight Treetops; 5 Orchid Sanctuary | short dark log platform | may float | Under 600 px, kept by the lead (11-10). |
| M-15-a | unlabelled (plank or log platform) | walkable log or plank | 880x363 | 16 (62-823) 0.75 | 1 Emerald Canopy; 2 Sunlit Riverbank; 5 Orchid Sanctuary | light side-on log platform: forest, riverbank, garden | may float | Flat-topped side-on log, lighter wood. Near-twin of M-15-b (same length, slightly different grain): counts as one shape for variety. |
| M-15-b | unlabelled (plank or log platform) | walkable log or plank | 881x363 | 16 (62-824) 0.84 | 1 Emerald Canopy; 2 Sunlit Riverbank; 5 Orchid Sanctuary | twin of M-15-a | may float | Near-twin of M-15-a. |

## Rejected

| id | what | size | reason |
|---|---|---|---|
| M-02-c | unlabelled (reeds tuft beside the weathered pad) | 285x215 | unlabelled reeds with a smear of magenta painted under them (the smear is the same hue as the ground and cannot be keyed apart); also under 600 px |
| M-12-c | unlabelled (one loose leaf) | 219x125 | a single loose leaf the keyer split off the bird of paradise (M-12-b); a fragment, not a piece; also under 600 px |
| M-12-f | unlabelled (maidenhair fern) | 647x429 | polish: its stems are painted magenta like the ground and keyed out with it, so the leaves hang loose in the air (rough at phone size) |
| M-12-g | unlabelled (spider plant) | 370x357 | not clean: mauve ground keyed in between its leaves and pink edges on a light ground; also under 600 px |

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
a wordless crate, and a clean re-key or re-roll of the spider plant M-12-g.
