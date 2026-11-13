# CATALOG-MASTER: every art piece, cut or in the game, all ten worlds

Built by `python3 tools/art/catalog_master.py --merge` from `catalog-cut.csv` (part A: cut pieces not yet placed) and `catalog-game-B1..B4.csv` (part B: everything the game ships). Never hand-edited. Columns: see `tools/art/catalog_master.py` COLS.
Play scale: 540 game px tall sideways, Pokey 48 game px; ship_px is at most twice the drawn size (R-165.99).

## Counts per source (sources minus overlap)

| source | rows |
|---|---|
| (B4 rows shown in menus only: worlds = menu) | 849 |
| (images under src/assets covered) | 903/903 |
| A catalog-cut | 363 |
| B1 | 812 |
| B2 | 3531 |
| B2 overlap with B4 (dropped) | 7 |
| B3 | 200 |
| B4 | 4458 |
| B4 overlap with B2 (dropped) | 76 |

Total rows: **9364**. Duplicates dropped: 83. Rows failing a check: 0.

### In-game World 1 pieces out of scale (R-165.107: drawn height / Pokey standing 89.1 units, heroSprite.ts:30,32)

Ranges (catalog_master.py SCALE_RANGE): step 0.5-1.0; platform and soft landing no taller than 1.0; terrain (ground, banks, soil, walls, set pieces laid one platform a ledge) exempt; decor near 0.2-2.0; backdrop, climb, danger look and decor mid: no range set; tiled or stretched pieces (trunks, lianas, moss strips, rope posts) get no verdict. Pokey is 89.1 units drawn (the 48 in older notes is his collider, engine.ts:954). Columns pokey_scale, scale_ok, scale_basis in the csv.

| id | layer | pokey_scale | range | on screen | used in |
|---|---|---|---|---|---|
| puzzle-kit#acornTree | decor near | 3.37 | 0.2-2.0 | 361x300 (KIT_ART k=1.163 (puzzleArt.ts:3 | puzzle rooms (which room lays this piece |
| w1#shut | decor near | 2.81 | 0.2-2.0 | 195x250 (GATE_H 250 (stageArt.ts:307)) | 1-1 1-2 1-3 1-4 1-5 1-6 1-7 1-8 1-9 1-10 |
| w1#open | decor near | 2.81 | 0.2-2.0 | 198x250 (GATE_H 250 (stageArt.ts:307)) | 1-1 1-2 1-3 1-4 1-5 1-6 1-7 1-8 1-9 1-10 |
| props-atlas#perch | platform | 2.42 | up to 1.0 | 260x216 (perch w = reach + 70 (protoArt. | 1-1 1-2 1-3 1-4 1-5 1-6 1-7 1-8 1-9 1-10 |
| props2-atlas#bushTall | decor near | 2.26 | 0.2-2.0 | 140x201 (bush / hollow ~140) | 1-7 4-5 6-2 6-3 6-7 8-2 |
| w1-new#hollowlog-moss | platform | 2.21 | up to 1.0 | 403x197 (hollow log 310-380 wide x1.06 ( | 1-4 3-4 4-1 4-6 |
| puzzle-kit#gustCrack | decor near | 2.02 | 0.2-2.0 | 174x180 (KIT_ART k=1 (puzzleArt.ts:30 ki | puzzle rooms (which room lays this piece |
| w1-new#hollowlog-plain | platform | 2.01 | up to 1.0 | 403x179 (hollow log 310-380 wide x1.06 ( | 1-4 3-4 4-1 4-6 |
| puzzle-kit#pulleyPost | decor near | 2.01 | 0.2-2.0 | 68x179 (KIT_ART k=1 (puzzleArt.ts:30 kit | puzzle rooms (which room lays this piece |
| crown#crown | platform | 1.62 | up to 1.0 | 300x144 (crown ~300) | 1-8 |
| props-atlas#stump | step | 1.43 | 0.5-1.0 | 160x127 (platform x1.15 (protoArt.ts:367 | 1-1 1-2 1-3 1-4 1-5 1-6 1-7 1-8 1-9 1-10 |
| leaves-atlas#warm_A11_0 | decor near | 0.18 | 0.2-2.0 | 38x16 (leaf size <=38, glide leaf ~60 (l | 1-1 1-2 1-3 1-4 1-5 1-6 1-7 1-8 1-9 1-10 |
| puzzle-kit#pebble | decor near | 0.16 | 0.2-2.0 | 21x14 (KIT_ART k=0.629 (puzzleArt.ts:30  | puzzle rooms (which room lays this piece |

Not judged: 14 in-game W1 pieces drawn to fit their platform (w1CutArt.ts cutBox:40-53; their size is the platform's, the generator's numbers): w1-boulder-grey-moss, w1-boulder-grey-moss-b, w1-plank-ledge-a, w1-plank-ledge-b, w1-plank-ledge-c, w1-rock-block-big, w1-rock-boulder-moss, w1-rock-boulder-moss-big, w1-rock-root-block, w1-rock-roots, w1-rock-slabs-low, w1-rock-slabs-stacked, w1-rock-slabs-stacked-big, w1-stump-wide.

Not judged, tiled or stretched (one tile is no verdict): props-atlas#branch, props-atlas#liana, props-atlas#trunk, props-atlas#mossStrip, rope-kit#tile, rope-kit#post.

### Made things the game shows in World 1 today (Matt, 11-11: swap the 1-1 planks, the sawn wide stump and the trail post; the gate, puzzle doors and keepsakes stay; the rest are his call)

| part | id | used in | ruling | status |
|---|---|---|---|---|
| B1 | w1-plank-ledge-a | 1-1 | SWAP (Matt 11-11): replace with natural W1 pieces | in game; needs fix: reads as a sawn board, square ends (a made thing laid in 1-1); W1 rule check: a  |
| B1 | w1-plank-ledge-b | 1-1 | SWAP (Matt 11-11): replace with natural W1 pieces | in game; needs fix: reads as a sawn board, square ends (a made thing laid in 1-1); W1 rule check: a  |
| B1 | w1-plank-ledge-c | 1-1 | SWAP (Matt 11-11): replace with natural W1 pieces | in game; needs fix: reads as a sawn board, square ends (a made thing laid in 1-1); W1 rule check: a  |
| B1 | w1-stump-wide | 1-1 | SWAP (Matt 11-11): replace with natural W1 pieces | in game; needs fix: sawn flat top with rings and pegged steps (a made thing laid in 1-1); W1 rule ch |
| B1 | w1-new#hollowlog-plain | 1-4 3-4 4-1 4-6 | Matt's call | in game; W1 rule check: a made thing in a World 1 stage today (Matt 11-11: made things never W1; lea |
| B1 | props-atlas#perch | 1-1 1-2 1-3 1-4 1-5 1-6 1-7 1-8 1-9 1-10 | Matt's call | in game; needs fix: sawn trunk top (reads made in W1); W1 rule check: a made thing in a World 1 stag |
| B1 | props-atlas#trunk | 1-1 1-2 1-3 1-4 1-5 1-6 1-7 1-8 1-9 1-10 | Matt's call | in game; needs fix: sawn top (reads made in W1); W1 rule check: a made thing in a World 1 stage toda |
| B1 | dressnew-w1#w1WoodStump | 1-1 1-2 1-3 1-5 1-6 1-7 1-9 | Matt's call | in game; W1 rule check: a made thing in a World 1 stage today (Matt 11-11: made things never W1; lea |
| B1 | dressnew-w1#w1Toucan | 1-1 1-2 1-3 1-5 1-6 1-7 1-9 | Matt's call | in game; W1 rule check: a made thing in a World 1 stage today (Matt 11-11: made things never W1; lea |
| B1 | dressnew-w1#w1TrailPost | 1-1 1-2 1-3 1-5 1-6 1-7 1-9 | SWAP (Matt 11-11): replace with natural W1 pieces | in game; W1 rule check: a made thing in a World 1 stage today (Matt 11-11: made things never W1; lea |
| B1 | dressnew-w1#w1FallenLog | 1-1 1-2 1-3 1-5 1-6 1-7 1-9 | Matt's call | in game; W1 rule check: a made thing in a World 1 stage today (Matt 11-11: made things never W1; lea |
| B1 | w1#shut | 1-1 1-2 1-3 1-4 1-5 1-6 1-7 1-8 1-9 1-10 | STAYS (Matt 11-11) | in game; W1 rule check: a made thing in a World 1 stage today (Matt 11-11: made things never W1; lea |
| B1 | w1#open | 1-1 1-2 1-3 1-4 1-5 1-6 1-7 1-8 1-9 1-10 | STAYS (Matt 11-11) | in game; W1 rule check: a made thing in a World 1 stage today (Matt 11-11: made things never W1; lea |
| B1 | stage-art#flagUnlit | 1-1 1-2 1-3 1-4 1-5 1-6 1-7 1-8 1-9 1-10 2-1 2-2 2-3 2-4 2-5 | Matt's call | in game; W1 rule check: a made thing in a World 1 stage today (Matt 11-11: made things never W1; lea |
| B1 | stage-art#flagLit | 1-1 1-2 1-3 1-4 1-5 1-6 1-7 1-8 1-9 1-10 2-1 2-2 2-3 2-4 2-5 | Matt's call | in game; W1 rule check: a made thing in a World 1 stage today (Matt 11-11: made things never W1; lea |
| B1 | water-signs#sign-jungle | 1-5 1-6 2-1 2-2 2-3 2-4 2-5 2-7 2-8 2-9 3-1 3-2 3-3 3-5 3-6  | Matt's call | in game; W1 rule check: a made thing in a World 1 stage today (Matt 11-11: made things never W1; lea |
| B1 | puzzle-kit#nestDoorShut | 1-4 | STAYS (Matt 11-11) | in game; W1 rule check: a made thing in a World 1 stage today (Matt 11-11: made things never W1; lea |
| B1 | puzzle-kit#branchGate | 1-6 | STAYS (Matt 11-11) | in game; needs fix: solid along the cell's left edge: likely cut off; W1 rule check: a made thing in |
| B1 | rope-kit#tile | 1-3 1-4 1-5 1-7 1-9 10-1 2-6 3-4 4-1 4-6 8-2 9-1 9-5 9-8 | Matt's call | in game; W1 rule check: a made thing in a World 1 stage today (Matt 11-11: made things never W1; lea |
| B1 | rope-kit#post | 1-3 1-4 1-5 1-7 1-9 10-1 2-6 3-4 4-1 4-6 8-2 9-1 9-5 9-8 | Matt's call | in game; W1 rule check: a made thing in a World 1 stage today (Matt 11-11: made things never W1; lea |
| B4 | B4:pickups/bell | every stage (keepsake pickups (ALWAYS 'pickups', stageManife | STAYS (Matt 11-11) | in game |
| B4 | B4:pickups/locket | every stage (keepsake pickups (ALWAYS 'pickups', stageManife | STAYS (Matt 11-11) | in game |
| B4 | B4:pickups/rattle | every stage (keepsake pickups (ALWAYS 'pickups', stageManife | STAYS (Matt 11-11) | in game |
| B4 | B4:pickups/ribbon | every stage (keepsake pickups (ALWAYS 'pickups', stageManife | STAYS (Matt 11-11) | in game |
| B4 | B4:pickups/scroll | every stage (keepsake pickups (ALWAYS 'pickups', stageManife | STAYS (Matt 11-11) | in game |
| B4 | B4:pickups/teddy | every stage (keepsake pickups (ALWAYS 'pickups', stageManife | STAYS (Matt 11-11) | in game |

## World 1: Emerald Canopy

2417 pieces fit (2087 in game today, 330 available; 2038 have it as best fit).

| layer | in game | available | ready | needs fix |
|---|---|---|---|---|
| backdrop | 60 | 6 | 0 | 6 |
| character | 1191 | 3 | 3 | 0 |
| climb | 2 | 11 | 6 | 5 |
| danger look | 74 | 43 | 40 | 3 |
| decor mid | 66 | 25 | 15 | 4 |
| decor near | 267 | 109 | 102 | 3 |
| enemy | 306 | 18 | 18 | 0 |
| pickup | 7 | 0 | 0 | 0 |
| platform | 68 | 58 | 40 | 16 |
| soft landing | 3 | 12 | 12 | 0 |
| step | 11 | 45 | 40 | 5 |
| ui | 32 | 0 | 0 | 0 |

Cast and UI shown here (not level art): character 1194, enemy 324, pickup 7, ui 32.

| level-art engine slot (top 20 by pieces) | in game | usable (in game + ready) |
|---|---|---|
| src/game/butterflySprites.ts | 40 | 40 |
| src/game/bossFx.ts | 33 | 33 |
| landing/platforms solid moss_stone | 0 | 32 |
| stage plants | 32 | 32 |
| stage flowers | 32 | 32 |
| W4 set pieces | 26 | 30 |
| falling leaves, the glide leaf, leaf bits | 17 | 27 |
| src/game/bossAtk.ts | 27 | 27 |
| prop/proto.dress | 0 | 20 |
| other/proto.stilt moss-hide / log-hide / root-arch | 0 | 17 |
| other/proto.thorns | 0 | 17 |
| drifting petals | 17 | 17 |
| proto.mixDress | 6 | 12 |
| src/game/livePlates.ts | 12 | 12 |
| landing/platforms bouncy moss_stone | 0 | 11 |
| prop dress | 0 | 11 |
| pickCut kind stone | 10 | 10 |
| src/game/plates.ts | 10 | 10 |
| prop/proto.dress w1Pebble / w1Stones / w1Sprig | 0 | 9 |
| new slot: wall corner cap or foot | 0 | 8 |
| (294 more slots, 411 pieces: see the csv) | | |

**Gaps** (standable, climb and danger slots with fewer than 3 usable pieces here): climbable/ropes rope, climbable/vines swing_liana, landing/platforms bouncy, landing/platforms fragile ruin, landing/platforms solid -, landing/platforms solid branch, landing/platforms solid canopy_bridge, landing/platforms solid fungus_shelf, new slot: pit lip pair, pickCut kind perch, pickCut kind stump, stageArtData.ts PIT_WATER strip.

**Could move in from other worlds' kits** (234 level pieces in game elsewhere, tagged to fit here; first 30): w1-plank-ledge-a, w1-plank-ledge-b, w1-plank-ledge-c, w1-stump-wide, w1-new#hollowlog-plain, props-atlas#perch, props-atlas#trunk, w2#stump, w2#boulder, w2-props#limbShort, w3-props#fern, w3-props#mossCurtain, w4-props#capEat, w4-props#capFists, w4-props#capGuard, w4-props#capHang, w4-props#capHoldPetal, w4-props#capNest, w4-props#capPoint, w4-props#capRunPetal, w4-props#capScreech, w4-props#capSitBranch, w4-props#capStartled, w4-props#capWalk, w4-props#capWorried, w4-props#coverFern, w4-props#coverHollow, w4-props#coverMossRock, w4-props#coverStump, w4-props#coverWide.

## World 2: Sunlit Riverbank

2642 pieces fit (2348 in game today, 294 available; 679 have it as best fit).

| layer | in game | available | ready | needs fix |
|---|---|---|---|---|
| backdrop | 50 | 5 | 0 | 5 |
| character | 1191 | 3 | 3 | 0 |
| climb | 2 | 14 | 13 | 1 |
| danger look | 79 | 34 | 34 | 0 |
| decor mid | 76 | 9 | 7 | 0 |
| decor near | 323 | 106 | 99 | 3 |
| enemy | 479 | 0 | 0 | 0 |
| pickup | 7 | 0 | 0 | 0 |
| platform | 96 | 63 | 47 | 12 |
| soft landing | 3 | 10 | 9 | 0 |
| step | 10 | 50 | 39 | 10 |
| ui | 32 | 0 | 0 | 0 |

Cast and UI shown here (not level art): character 1194, enemy 479, pickup 7, ui 32.

| level-art engine slot (top 20 by pieces) | in game | usable (in game + ready) |
|---|---|---|
| W4 set pieces | 40 | 51 |
| src/game/birdSprites.ts | 48 | 48 |
| src/game/bossFx.ts | 39 | 39 |
| stage plants | 32 | 32 |
| stage flowers | 32 | 32 |
| landing/platforms solid moss_stone | 0 | 27 |
| falling leaves, the glide leaf, leaf bits | 17 | 27 |
| src/game/bossAtk.ts | 27 | 27 |
| new slot: World 2 river props | 0 | 20 |
| drifting petals | 17 | 17 |
| landing/platforms solid log | 0 | 16 |
| other proto.stiltLedges | 16 | 16 |
| proto.mixDress | 6 | 15 |
| falls43 / fallZones | 12 | 12 |
| stageArtData.ts PIT_WATER strip | 0 | 10 |
| pickCut kind stone | 10 | 10 |
| checkpoints | 2 | 10 |
| new slot: World 4 cascades props | 0 | 9 |
| landing/platforms solid canopy_bridge | 0 | 8 |
| climbable/vines tree_climb | 0 | 8 |
| (372 more slots, 465 pieces: see the csv) | | |

**Gaps** (standable, climb and danger slots with fewer than 3 usable pieces here): climbable/vines swing_liana, landing/platforms bouncy, landing/platforms fragile ruin, landing/platforms solid branch, landing/platforms solid fungus_shelf, new slot: ground band strip, new slot: one-piece wall set piece, new slot: pit lip pair, new slot: wall corner cap or foot, other/proto.thorns, pickCut kind perch, pickCut kind stump.

**Could move in from other worlds' kits** (403 level pieces in game elsewhere, tagged to fit here; first 30): w1-boulder-grey-moss, w1-boulder-grey-moss-b, w1-hide-stump-hollow, w1-hide-stump-hollow-tall, w1-log-plank-a, w1-log-plank-b, w1-plank-ledge-a, w1-plank-ledge-b, w1-plank-ledge-c, w1-rock-block-big, w1-rock-boulder-moss, w1-rock-boulder-moss-big, w1-rock-root-block, w1-rock-roots, w1-rock-slabs-low, w1-rock-slabs-stacked, w1-rock-slabs-stacked-big, w1-stump-wide, w1-new#squirrel-sit, w1-new#squirrel-wave, w1-new#squirrel-tip, w1-new#squirrel-run, w1-new#hollowlog-moss, w1-new#hollowlog-plain, props-atlas#log, props-atlas#logPush, props-atlas#boulder, props-atlas#curtain, props-atlas#curtainOpen, props-atlas#branch.

## World 3: Mossy Grotto

2650 pieces fit (2317 in game today, 333 available; 571 have it as best fit).

| layer | in game | available | ready | needs fix |
|---|---|---|---|---|
| backdrop | 48 | 6 | 5 | 1 |
| character | 1191 | 3 | 3 | 0 |
| climb | 12 | 9 | 5 | 4 |
| danger look | 139 | 57 | 55 | 2 |
| decor mid | 79 | 18 | 12 | 4 |
| decor near | 287 | 98 | 93 | 3 |
| enemy | 434 | 0 | 0 | 0 |
| pickup | 7 | 0 | 0 | 0 |
| platform | 66 | 70 | 57 | 11 |
| soft landing | 2 | 11 | 11 | 0 |
| step | 20 | 61 | 51 | 10 |
| ui | 32 | 0 | 0 | 0 |

Cast and UI shown here (not level art): character 1194, enemy 434, pickup 7, ui 32.

| level-art engine slot (top 20 by pieces) | in game | usable (in game + ready) |
|---|---|---|
| W4 set pieces | 48 | 60 |
| src/game/butterflySprites.ts | 40 | 40 |
| W4 falling-rock effects | 39 | 39 |
| src/game/bossFx.ts | 36 | 36 |
| landing/platforms solid moss_stone | 0 | 34 |
| stage plants | 32 | 32 |
| falling leaves, the glide leaf, leaf bits | 17 | 27 |
| src/game/bossAtk.ts | 27 | 27 |
| other/proto.thorns | 0 | 19 |
| new slot: World 3 grotto props | 0 | 18 |
| drifting petals | 17 | 17 |
| other/proto.stilt moss-hide / log-hide / root-arch | 0 | 16 |
| proto.mixDress | 6 | 14 |
| landing/platforms solid | 0 | 14 |
| climbable/vines swing_liana | 14 | 14 |
| falls43 / fallZones | 12 | 12 |
| stage flowers | 12 | 12 |
| pickCut kind stone | 10 | 10 |
| prop dress | 0 | 9 |
| new slot: wall corner cap or foot | 0 | 8 |
| (354 more slots, 490 pieces: see the csv) | | |

**Gaps** (standable, climb and danger slots with fewer than 3 usable pieces here): climbable/ropes rope, landing/platforms fragile ruin, landing/platforms solid -, landing/platforms solid branch, landing/platforms solid canopy_bridge, landing/platforms solid fungus_shelf, new slot: pit lip pair, pickCut kind perch, pickCut kind stump, stageArtData.ts PIT_WATER strip.

**Could move in from other worlds' kits** (516 level pieces in game elsewhere, tagged to fit here; first 30): w1-boulder-grey-moss, w1-boulder-grey-moss-b, w1-hide-stump-hollow, w1-hide-stump-hollow-tall, w1-log-plank-a, w1-log-plank-b, w1-plank-ledge-a, w1-plank-ledge-b, w1-plank-ledge-c, w1-rock-block-big, w1-rock-boulder-moss, w1-rock-boulder-moss-big, w1-rock-root-block, w1-rock-roots, w1-rock-slabs-low, w1-rock-slabs-stacked, w1-rock-slabs-stacked-big, w1-stump-wide, w1-new#squirrel-sit, w1-new#squirrel-wave, w1-new#squirrel-tip, w1-new#squirrel-run, w1-new#hollowlog-moss, props-atlas#log, props-atlas#logPush, props-atlas#boulder, props-atlas#curtain, props-atlas#curtainOpen, props-atlas#branch, props-atlas#branchCreak.

## World 4: Mist Cascades

2172 pieces fit (1991 in game today, 181 available; 293 have it as best fit).

| layer | in game | available | ready | needs fix |
|---|---|---|---|---|
| backdrop | 74 | 11 | 8 | 3 |
| character | 1178 | 0 | 0 | 0 |
| climb | 2 | 2 | 2 | 0 |
| danger look | 125 | 18 | 18 | 0 |
| decor mid | 82 | 5 | 2 | 1 |
| decor near | 175 | 63 | 60 | 2 |
| enemy | 249 | 0 | 0 | 0 |
| pickup | 7 | 0 | 0 | 0 |
| platform | 45 | 29 | 26 | 2 |
| soft landing | 1 | 0 | 0 | 0 |
| step | 15 | 53 | 47 | 6 |
| ui | 38 | 0 | 0 | 0 |

Cast and UI shown here (not level art): character 1178, enemy 249, pickup 7, ui 38.

| level-art engine slot (top 20 by pieces) | in game | usable (in game + ready) |
|---|---|---|
| W4 set pieces | 56 | 74 |
| src/game/birdSprites.ts | 48 | 48 |
| W4 falling-rock effects | 39 | 39 |
| src/game/bossFx.ts | 36 | 36 |
| src/game/bossAtk.ts | 27 | 27 |
| landing/platforms solid moss_stone | 0 | 23 |
| 4-D Dot's flight set + W5 web patches | 22 | 23 |
| falling leaves, the glide leaf, leaf bits | 17 | 17 |
| drifting petals | 17 | 17 |
| new slot: World 4 cascades props | 0 | 16 |
| falls43 / fallZones | 12 | 12 |
| stage plants | 12 | 12 |
| stage flowers | 12 | 12 |
| pickCut kind stone | 10 | 10 |
| landing/platforms solid | 0 | 10 |
| prop/proto.dress w1Pebble / w1Stones / w1Sprig | 0 | 9 |
| other/proto.stilt moss-hide / log-hide / root-arch | 0 | 9 |
| new slot: wall corner cap or foot | 0 | 8 |
| banks of World 4 | 8 | 8 |
| checkpoints | 2 | 8 |
| (210 more slots, 268 pieces: see the csv) | | |

**Gaps** (standable, climb and danger slots with fewer than 3 usable pieces here): climbable/ropes rope, climbable/vines swing_liana, climbable/vines tree_climb, landing/platforms bouncy, landing/platforms bouncy moss_stone, landing/platforms fragile ruin, landing/platforms solid -, landing/platforms solid branch, landing/platforms solid canopy_bridge, landing/platforms solid fungus_shelf, landing/platforms solid log, new slot: ground band strip, new slot: pit lip pair, new slot: step set piece, other/proto.thorns, pickCut kind log, pickCut kind perch, pickCut kind stump.

**Could move in from other worlds' kits** (262 level pieces in game elsewhere, tagged to fit here; first 30): w1-boulder-grey-moss, w1-boulder-grey-moss-b, w1-rock-block-big, w1-rock-boulder-moss, w1-rock-boulder-moss-big, w1-rock-root-block, w1-rock-roots, w1-rock-slabs-low, w1-rock-slabs-stacked, w1-rock-slabs-stacked-big, w1-new#hollowlog-moss, w1-new#hollowlog-plain, props2-atlas#hollowGlow, props2-atlas#hollow, props2-atlas#bushTall, props2-atlas#fernClump, props2-atlas#bushWide, w2#stump, w2#boulder, w3-props#pillar, w3-props#pillarBroken, w3-props#pillarCracked, w3-props#ringWall, w3-props#trickle, w3-props#wallTile, dressnew-w1#w1MossBoulder, w1#strip, w1#shine, w3#strip, w3#shine.

## World 5: Orchid Sanctuary

3497 pieces fit (3223 in game today, 274 available; 1211 have it as best fit).

| layer | in game | available | ready | needs fix |
|---|---|---|---|---|
| backdrop | 80 | 6 | 4 | 2 |
| character | 1545 | 17 | 11 | 0 |
| climb | 4 | 5 | 4 | 1 |
| danger look | 82 | 26 | 25 | 1 |
| decor mid | 106 | 18 | 12 | 0 |
| decor near | 359 | 99 | 88 | 1 |
| enemy | 934 | 0 | 0 | 0 |
| pickup | 7 | 0 | 0 | 0 |
| platform | 51 | 57 | 43 | 11 |
| soft landing | 3 | 18 | 18 | 0 |
| step | 14 | 28 | 21 | 5 |
| ui | 38 | 0 | 0 | 0 |

Cast and UI shown here (not level art): character 1562, enemy 934, pickup 7, ui 38.

| level-art engine slot (top 20 by pieces) | in game | usable (in game + ready) |
|---|---|---|
| src/game/birdSprites.ts | 48 | 48 |
| src/game/butterflySprites.ts | 40 | 40 |
| src/game/bossFx.ts | 36 | 36 |
| stage plants | 32 | 32 |
| stage flowers | 32 | 32 |
| W4 set pieces | 26 | 30 |
| falling leaves, the glide leaf, leaf bits | 17 | 27 |
| src/game/bossAtk.ts | 27 | 27 |
| 4-D Dot's flight set + W5 web patches | 22 | 23 |
| landing/platforms solid moss_stone | 0 | 18 |
| drifting petals | 17 | 17 |
| landing/platforms solid log | 0 | 16 |
| proto.mixDress | 5 | 13 |
| prop dress | 0 | 13 |
| prop/proto.dress | 0 | 10 |
| landing/platforms bouncy moss_stone | 0 | 10 |
| checkpoints | 2 | 8 |
| painted ground fills | 8 | 8 |
| prop/proto.bushes wide / tall / fern | 0 | 6 |
| new slot: World 2 river props | 0 | 6 |
| (419 more slots, 515 pieces: see the csv) | | |

**Gaps** (standable, climb and danger slots with fewer than 3 usable pieces here): climbable/ropes rope, climbable/vines swing_liana, landing/platforms fragile ruin, landing/platforms solid branch, landing/platforms solid canopy_bridge, landing/platforms solid fungus_shelf, new slot: ground band strip, new slot: one-piece wall set piece, new slot: pit lip pair, new slot: wall corner cap or foot, pickCut kind perch, pickCut kind stone, pickCut kind stump, stageArtData.ts PIT_WATER strip.

**Could move in from other worlds' kits** (475 level pieces in game elsewhere, tagged to fit here; first 30): w1-hide-stump-hollow, w1-hide-stump-hollow-tall, w1-log-plank-a, w1-log-plank-b, w1-plank-ledge-a, w1-plank-ledge-b, w1-plank-ledge-c, w1-stump-wide, w1-new#squirrel-sit, w1-new#squirrel-wave, w1-new#squirrel-tip, w1-new#squirrel-run, w1-new#hollowlog-moss, props-atlas#log, props-atlas#logPush, props-atlas#boulder, props-atlas#curtain, props-atlas#curtainOpen, props-atlas#branch, props-atlas#branchCreak, props-atlas#snapL, props-atlas#snapR, props-atlas#liana, props-atlas#stump, props2-atlas#hollowGlow, props2-atlas#hollow, props2-atlas#bushTall, props2-atlas#fernClump, props2-atlas#bushWide, props3-atlas#chaseTip.

## World 6: Deep Mangrove

3368 pieces fit (2531 in game today, 837 available; 688 have it as best fit).

| layer | in game | available | ready | needs fix |
|---|---|---|---|---|
| backdrop | 65 | 12 | 4 | 8 |
| character | 1219 | 11 | 11 | 0 |
| climb | 2 | 20 | 16 | 4 |
| danger look | 126 | 53 | 51 | 2 |
| decor mid | 75 | 17 | 10 | 5 |
| decor near | 350 | 134 | 129 | 1 |
| enemy | 519 | 431 | 431 | 0 |
| pickup | 7 | 0 | 0 | 0 |
| platform | 111 | 90 | 67 | 19 |
| soft landing | 5 | 6 | 5 | 0 |
| step | 20 | 61 | 54 | 6 |
| ui | 32 | 2 | 2 | 0 |

Cast and UI shown here (not level art): character 1230, enemy 950, pickup 7, ui 34.

| level-art engine slot (top 20 by pieces) | in game | usable (in game + ready) |
|---|---|---|
| W4 set pieces | 50 | 64 |
| src/game/birdSprites.ts | 48 | 48 |
| W4 falling-rock effects | 39 | 39 |
| src/game/bossFx.ts | 36 | 36 |
| stage plants | 32 | 32 |
| landing/platforms solid moss_stone | 0 | 31 |
| falling leaves, the glide leaf, leaf bits | 17 | 27 |
| src/game/bossAtk.ts | 27 | 27 |
| landing/platforms solid log | 0 | 23 |
| other/proto.thorns | 0 | 22 |
| new slot: World 2 river props | 0 | 20 |
| drifting petals | 17 | 17 |
| other proto.stiltLedges | 16 | 16 |
| proto.mixDress | 6 | 15 |
| other/proto.stilt moss-hide / log-hide / root-arch | 0 | 13 |
| prop/proto.dress | 0 | 12 |
| new slot: World 4 cascades props | 0 | 12 |
| falls43 / fallZones | 12 | 12 |
| stage flowers | 12 | 12 |
| climbable/vines tree_climb | 0 | 11 |
| (457 more slots, 613 pieces: see the csv) | | |

**Gaps** (standable, climb and danger slots with fewer than 3 usable pieces here): climbable/vines swing_liana, landing/platforms bouncy, landing/platforms bouncy moss_stone, landing/platforms fragile ruin, landing/platforms solid branch, landing/platforms solid fungus_shelf, new slot: pit lip pair, pickCut kind perch, pickCut kind stump.

**Could move in from other worlds' kits** (593 level pieces in game elsewhere, tagged to fit here; first 30): w1-boulder-grey-moss, w1-boulder-grey-moss-b, w1-hide-stump-hollow-tall, w1-log-plank-a, w1-log-plank-b, w1-rock-block-big, w1-rock-boulder-moss, w1-rock-boulder-moss-big, w1-rock-root-block, w1-rock-roots, w1-rock-slabs-low, w1-rock-slabs-stacked, w1-rock-slabs-stacked-big, w1-new#squirrel-sit, w1-new#squirrel-wave, w1-new#squirrel-tip, w1-new#squirrel-run, w1-new#hollowlog-moss, w1-new#hollowlog-plain, props-atlas#log, props-atlas#logPush, props-atlas#boulder, props-atlas#curtain, props-atlas#curtainOpen, props-atlas#branch, props-atlas#branchCreak, props-atlas#snapL, props-atlas#snapR, props-atlas#perch, props-atlas#liana.

## World 7: Ancient Ruins

3120 pieces fit (2538 in game today, 582 available; 772 have it as best fit).

| layer | in game | available | ready | needs fix |
|---|---|---|---|---|
| backdrop | 78 | 9 | 9 | 0 |
| character | 1190 | 63 | 63 | 0 |
| climb | 14 | 6 | 6 | 0 |
| danger look | 122 | 11 | 11 | 0 |
| decor mid | 110 | 13 | 9 | 0 |
| decor near | 246 | 70 | 67 | 1 |
| enemy | 653 | 325 | 325 | 0 |
| pickup | 7 | 0 | 0 | 0 |
| platform | 66 | 55 | 45 | 8 |
| soft landing | 1 | 2 | 2 | 0 |
| step | 19 | 28 | 20 | 8 |
| ui | 32 | 0 | 0 | 0 |

Cast and UI shown here (not level art): character 1253, enemy 978, pickup 7, ui 32.

| level-art engine slot (top 20 by pieces) | in game | usable (in game + ready) |
|---|---|---|
| src/game/birdSprites.ts | 48 | 48 |
| src/game/butterflySprites.ts | 40 | 40 |
| W4 falling-rock effects | 39 | 39 |
| src/game/bossFx.ts | 36 | 36 |
| W4 set pieces | 20 | 29 |
| src/game/bossAtk.ts | 27 | 27 |
| landing/platforms solid | 0 | 22 |
| prop dress | 0 | 18 |
| falling leaves, the glide leaf, leaf bits | 17 | 17 |
| drifting petals | 17 | 17 |
| new slot: World 2 river props | 0 | 14 |
| climbable/vines swing_liana | 14 | 14 |
| stage plants | 12 | 12 |
| stage flowers | 12 | 12 |
| src/game/livePlates.ts | 12 | 12 |
| new slot: World 4 cascades props | 0 | 11 |
| pickCut kind stone | 10 | 10 |
| checkpoints | 2 | 10 |
| landing/platforms solid canopy_bridge | 0 | 9 |
| painted ground fills | 8 | 8 |
| (353 more slots, 428 pieces: see the csv) | | |

**Gaps** (standable, climb and danger slots with fewer than 3 usable pieces here): climbable/ropes rope, climbable/vines tree_climb, landing/platforms bouncy, landing/platforms bouncy moss_stone, landing/platforms fragile ruin, landing/platforms solid -, landing/platforms solid branch, landing/platforms solid fungus_shelf, landing/platforms solid log, new slot: ground band strip, new slot: one-piece wall set piece, new slot: pit lip pair, new slot: step set piece, new slot: wall corner cap or foot, other/proto.thorns, pickCut kind log, pickCut kind perch, pickCut kind stump, stageArtData.ts PIT_WATER strip.

**Could move in from other worlds' kits** (460 level pieces in game elsewhere, tagged to fit here; first 30): w1-boulder-grey-moss, w1-boulder-grey-moss-b, w1-rock-block-big, w1-rock-boulder-moss, w1-rock-boulder-moss-big, w1-rock-root-block, w1-rock-roots, w1-rock-slabs-low, w1-rock-slabs-stacked, w1-rock-slabs-stacked-big, w1-new#hollowlog-plain, props-atlas#perch, props-atlas#trunk, w2#liana, w2#perch, w2#snapL, w2#branchCreak, w2#snapR, w2#branch, w2#stump, w2#boulder, w4#liana, w4#wall, w4#trunk, w4#perch, w4#buttress, w4#bankEnd, w4#fill, w4#bank, w4#stump.

## World 8: Twilight Treetops

3238 pieces fit (2617 in game today, 621 available; 527 have it as best fit).

| layer | in game | available | ready | needs fix |
|---|---|---|---|---|
| backdrop | 76 | 10 | 6 | 4 |
| character | 1198 | 36 | 36 | 0 |
| climb | 6 | 22 | 16 | 6 |
| danger look | 88 | 36 | 35 | 1 |
| decor mid | 67 | 24 | 11 | 5 |
| decor near | 456 | 119 | 107 | 2 |
| enemy | 538 | 275 | 275 | 0 |
| pickup | 7 | 0 | 0 | 0 |
| platform | 117 | 59 | 43 | 9 |
| soft landing | 6 | 16 | 15 | 0 |
| step | 20 | 21 | 17 | 1 |
| ui | 38 | 3 | 3 | 0 |

Cast and UI shown here (not level art): character 1234, enemy 813, pickup 7, ui 41.

| level-art engine slot (top 20 by pieces) | in game | usable (in game + ready) |
|---|---|---|
| src/game/butterflySprites.ts | 40 | 40 |
| W4 set pieces | 30 | 36 |
| src/game/bossFx.ts | 36 | 36 |
| stage plants | 32 | 32 |
| stage flowers | 32 | 32 |
| falling leaves, the glide leaf, leaf bits | 17 | 27 |
| src/game/bossAtk.ts | 27 | 27 |
| 4-D Dot's flight set + W5 web patches | 22 | 23 |
| new slot: World 3 grotto props | 0 | 18 |
| prop dress | 0 | 18 |
| drifting petals | 17 | 17 |
| other proto.stiltLedges | 16 | 16 |
| landing/platforms solid moss_stone | 0 | 15 |
| proto.mixDress | 6 | 15 |
| prop/proto.dress | 0 | 13 |
| painted ground fills | 12 | 12 |
| climbable/vines tree_climb | 0 | 11 |
| landing/platforms solid | 0 | 11 |
| new slot: World 2 river props | 0 | 10 |
| checkpoints | 2 | 10 |
| (550 more slots, 696 pieces: see the csv) | | |

**Gaps** (standable, climb and danger slots with fewer than 3 usable pieces here): climbable/vines swing_liana, landing/platforms fragile ruin, landing/platforms solid -, landing/platforms solid branch, landing/platforms solid canopy_bridge, landing/platforms solid fungus_shelf, new slot: ground band strip, new slot: one-piece wall set piece, new slot: pit lip pair, new slot: wall corner cap or foot, other/proto.thorns, pickCut kind perch, pickCut kind stone, pickCut kind stump, stageArtData.ts PIT_WATER strip.

**Could move in from other worlds' kits** (669 level pieces in game elsewhere, tagged to fit here; first 30): w1-hide-stump-hollow, w1-hide-stump-hollow-tall, w1-log-plank-a, w1-log-plank-b, w1-plank-ledge-a, w1-plank-ledge-b, w1-plank-ledge-c, w1-stump-wide, w1-new#squirrel-sit, w1-new#squirrel-wave, w1-new#squirrel-tip, w1-new#squirrel-run, w1-new#hollowlog-moss, w1-new#hollowlog-plain, props-atlas#log, props-atlas#logPush, props-atlas#boulder, props-atlas#curtain, props-atlas#curtainOpen, props-atlas#branch, props-atlas#branchCreak, props-atlas#snapL, props-atlas#snapR, props-atlas#perch, props-atlas#liana, props-atlas#trunk, props-atlas#stump, props2-atlas#hollowGlow, props2-atlas#hollow, props2-atlas#bushTall.

## World 9: Volcanic Jungle

2837 pieces fit (2144 in game today, 693 available; 652 have it as best fit).

| layer | in game | available | ready | needs fix |
|---|---|---|---|---|
| backdrop | 66 | 11 | 10 | 1 |
| character | 1178 | 0 | 0 | 0 |
| climb | 14 | 6 | 6 | 0 |
| danger look | 80 | 24 | 20 | 4 |
| decor mid | 72 | 18 | 11 | 3 |
| decor near | 159 | 64 | 51 | 11 |
| enemy | 504 | 475 | 475 | 0 |
| pickup | 7 | 0 | 0 | 0 |
| platform | 24 | 78 | 48 | 28 |
| soft landing | 1 | 0 | 0 | 0 |
| step | 7 | 17 | 13 | 4 |
| ui | 32 | 0 | 0 | 0 |

Cast and UI shown here (not level art): character 1178, enemy 979, pickup 7, ui 32.

| level-art engine slot (top 20 by pieces) | in game | usable (in game + ready) |
|---|---|---|
| src/game/birdSprites.ts | 48 | 48 |
| src/game/bossFx.ts | 36 | 36 |
| landing/platforms solid | 0 | 32 |
| src/game/bossAtk.ts | 27 | 27 |
| prop dress | 0 | 25 |
| falling leaves, the glide leaf, leaf bits | 17 | 17 |
| drifting petals | 17 | 17 |
| climbable/vines swing_liana | 14 | 14 |
| stage plants | 12 | 12 |
| stage flowers | 12 | 12 |
| hazard look | 0 | 11 |
| W4 set pieces | 4 | 8 |
| checkpoints | 2 | 8 |
| painted ground fills | 8 | 8 |
| landing/platforms solid moss_stone | 0 | 7 |
| bank face | 7 | 7 |
| painted ground lips | 6 | 6 |
| puzzle room lever | 2 | 6 |
| puzzle room plate | 2 | 6 |
| landing/platforms solid canopy_bridge | 0 | 6 |
| (231 more slots, 277 pieces: see the csv) | | |

**Gaps** (standable, climb and danger slots with fewer than 3 usable pieces here): climbable/ropes rope, climbable/vines tree_climb, landing/platforms bouncy, landing/platforms bouncy moss_stone, landing/platforms fragile ruin, landing/platforms solid -, landing/platforms solid branch, landing/platforms solid fungus_shelf, landing/platforms solid log, new slot: ground band strip, new slot: lava or vent hazard, new slot: one-piece wall set piece, new slot: pit lip pair, new slot: step set piece, new slot: wall corner cap or foot, pickCut kind log, pickCut kind perch, pickCut kind stone, pickCut kind stump, stageArtData.ts PIT_WATER strip.

**Could move in from other worlds' kits** (312 level pieces in game elsewhere, tagged to fit here; first 30): w4-props#eagletFly, w4-props#floatLedge, w4-props#nestEaglet, w4-props#nestEmpty, dressnew-w4#w4VineHang, dressnew-w4#w4LeafHang, dressnew-w4#w4BellHang, dressnew-w4#w4BellOne, dressnew-w4#w4Thistle, dressnew-w4#w4SeedGrass, dressnew-w4#w4WindShrub, dressnew-w4#w4Feather, dressnew-w4#w4FernTuft, dressnew-w4#w4Marmot, dressnew-w4#w4Lizard, stage-art#flagUnlit, stage-art#flagLit, bounce#cap-w4, bounce#stalk-w4, rope-kit#tile, rope-kit#post, plants-atlas#p18, plants-atlas#p19, plants-atlas#p21, plants-atlas#p23, plants-atlas#p28, plants-atlas#p30, plants-atlas#p32, plants-atlas#p49, plants-atlas#p51.

## World 10: Stormy Highlands Fortress

3614 pieces fit (2415 in game today, 1199 available; 1084 have it as best fit).

| layer | in game | available | ready | needs fix |
|---|---|---|---|---|
| backdrop | 120 | 19 | 18 | 1 |
| character | 1178 | 17 | 17 | 0 |
| climb | 16 | 13 | 13 | 0 |
| danger look | 136 | 44 | 37 | 7 |
| decor mid | 72 | 14 | 8 | 0 |
| decor near | 266 | 120 | 85 | 32 |
| enemy | 497 | 850 | 825 | 25 |
| pickup | 7 | 0 | 0 | 0 |
| platform | 67 | 86 | 63 | 20 |
| soft landing | 1 | 2 | 2 | 0 |
| step | 17 | 34 | 28 | 6 |
| ui | 38 | 0 | 0 | 0 |

Cast and UI shown here (not level art): character 1195, enemy 1347, pickup 7, ui 38.

| level-art engine slot (top 20 by pieces) | in game | usable (in game + ready) |
|---|---|---|
| src/game/butterflySprites.ts | 40 | 40 |
| W4 falling-rock effects | 39 | 39 |
| src/game/bossFx.ts | 36 | 36 |
| src/game/livePlates.ts | 36 | 36 |
| landing/platforms solid | 0 | 32 |
| W4 set pieces | 20 | 29 |
| src/game/bossAtk.ts | 27 | 27 |
| prop dress | 0 | 25 |
| 4-D Dot's flight set + W5 web patches | 22 | 23 |
| landing/platforms solid moss_stone | 0 | 19 |
| falling leaves, the glide leaf, leaf bits | 17 | 17 |
| drifting petals | 17 | 17 |
| other/proto.thorns | 0 | 14 |
| climbable/vines swing_liana | 14 | 14 |
| stage plants | 12 | 12 |
| stage flowers | 12 | 12 |
| painted ground fills | 12 | 12 |
| new slot: World 4 cascades props | 0 | 11 |
| hazard look | 0 | 11 |
| landing/platforms solid canopy_bridge | 0 | 10 |
| (387 more slots, 525 pieces: see the csv) | | |

**Gaps** (standable, climb and danger slots with fewer than 3 usable pieces here): climbable/ropes rope, landing/platforms bouncy, landing/platforms bouncy moss_stone, landing/platforms fragile ruin, landing/platforms solid -, landing/platforms solid branch, landing/platforms solid fungus_shelf, landing/platforms solid log, new slot: ground band strip, new slot: one-piece wall set piece, new slot: pit lip pair, new slot: step set piece, new slot: wall corner cap or foot, pickCut kind log, pickCut kind perch, pickCut kind stone, pickCut kind stump.

**Could move in from other worlds' kits** (539 level pieces in game elsewhere, tagged to fit here; first 30): w1-new#hollowlog-plain, props-atlas#perch, props-atlas#trunk, w2#liana, w2#perch, w2#snapL, w2#branchCreak, w2#snapR, w2#branch, w4#liana, w4#wall, w4#trunk, w4#perch, w4#buttress, w4#bankEnd, w4#fill, w4#bank, w4#stump, w4#boulder, w4#branchCreak, w4#mossStrip, w4#snapR, w4#snapL, w4#branch, w2-props#archway, w2-props#banner, w2-props#bell, w2-props#chimney, w2-props#dais, w2-props#door.

## The 12 best candidates for the re-laid 1-1

Contact sheet: `master-sheets/1-1-best12.jpg` (dark half / light half, cyan = footing).

| slot | id | size | footing | on screen | why |
|---|---|---|---|---|---|
| ground band strip | HF1-P-04-c | 1888x264 | y 12 x 0-1887 (cut catalog, flat 0.57) | 644x90 | 1 Emerald Canopy: thin root-soil strip |
| ground band strip | P-04-e | 737x200 | y 54 x 3-376 (cut catalog, flat 0.93) | 332x90 | 1 Emerald Canopy: ground cap and step |
| stone step | P-05-d | 454x158 | y 3 x 3-435 (cut catalog, flat 1.0) | 105x37 | 1 Emerald Canopy: moss ledge |
| stone step | P-05-b | 412x289 | y 6 x 6-395 (cut catalog, flat 0.93) | 106x74 | 1 Emerald Canopy: moss help step |
| stone step | P-05-a | 332x123 | y 6 x 3-317 (cut catalog, flat 0.92) | 106x39 | 1 Emerald Canopy: moss help step |
| stump step | HF1-stump-tall | 938x1703 | y 12 x 261-779 (cut catalog, flat 0.51) | 110x200 | 1 Emerald Canopy: tall natural snag rotted level, moss top, vines |
| walkable log | W1-27-b | 1211x397 | y 18 x 30-1184 (cut catalog, flat 0.79) | 210x69 | 1 Emerald Canopy: a mossy fallen log: the home forest |
| walkable log | W2-06-b | 1219x250 | y 11 x 77-1125 (cut catalog, flat 0.79) | 233x48 | 1 Emerald Canopy: a mossy fallen log: the home forest |
| soft landing | N-08-d | 950x799 | y 5 x 270-675 (cut catalog, flat 0.71) | 143x120 | 1 Emerald Canopy: vine nest with a fungus pad: canopy and treetops |
| hide spot | W2-12-d | 1335x653 | none (decor) | 245x120 | 1 Emerald Canopy: a hollow stump den: the home forest |
| pit lip / danger | W1-02-a | 2345x1276 | none (hurts: no stand line) | 420x229 | 1 Emerald Canopy: fern-lined earth pit: fills the W1 kit gap (pit floors and lips) |
| floating ledge | W1-10-j | 1226x275 | y 7 x 38-1185 (cut catalog, flat 0.6) | 192x43 | 1 Emerald Canopy: woven roots and moss: the forest floor |

## App size if every in-build piece shipped at ship_px (an estimate)

- 5532 rows the build imports and a stage or screen shows: 94.2 MB now, about 71.8 MB at ship_px: an estimated saving of **22.4 MB**.
- Estimate: atlas frames carry an area share of their sheet's file size and the ship size is scaled by area, not re-encoded. Rows not imported by the build or shown on no stage are left out; cut pieces (part A) are not in the build.

## Spot-check: 20 older-batch pieces, old tag against new

| id | old tag | new worlds (best first) | why |
|---|---|---|---|
| W1-09-j | W1 | 2, 6, 8 | looks like a tall trunk with a sawn top (made thing); best: 2 Sunlit Riverbank: a village post |
| W1-10-a | W1 | 2, 5, 6 | looks like sawn wood with ring ends (made thing; lead 11-11: saws are not in the home forest); best: 2 Sunlit Riverbank: worked wood: the riverbank village |
| W1-16-a | W1 | 7, 3, 10 | looks like a cut-stone stair block (made thing); best: 7 Ancient Ruins: masonry stairs: the ruins |
| W1-24-a | both | 2, 6, 10, 7 | looks like sawn boards or a woven plank bridge (made thing); best: 2 Sunlit Riverbank: boards and bridges: the village |
| W2-13-c | both | 7, 10, 3 | looks like a dry-stone hut of stacked slabs (made thing); best: 7 Ancient Ruins: a stacked stone shelter: the ruins |
| w1-frame-a | W1,W2 | 2, 6, 10, 8 | looks like rope-lashed poles or rope (made thing); best: 2 Sunlit Riverbank: rope and lashing: village work |
| w1-ledge-earth-a | W1,W3~darker | 2, 6, 10 | looks like an earth ledge topped with a wooden board (made thing: never W1); best: 2 Sunlit Riverbank: a board laid on a bank: village work |
| w2-lantern-hanging | W2 | 2, 5, 7 | looks like a hanging lantern (made thing); best: 2 Sunlit Riverbank: a village lantern |
| W1-09-e | W1 | 3, 7, 1, 6 | looks like a stone pillar gripped by roots; best: 3 Mossy Grotto: root-gripped stone: the grotto |
| W1-22-c | W1 | 2, 6, 4 | looks like bleached driftwood; best: 2 Sunlit Riverbank: driftwood on the river bank |
| W2-08-a | both | 4, 10, 3, 9 | looks like bare brown rock; best: 4 Mist Cascades: bare cliff rock: the cascades |
| W2-10-a | W2 | 5, 1, 8 | looks like a flowering vine; best: 5 Orchid Sanctuary: a flowering vine: the sanctuary |
| W2-13-a | both | 3, 4, 10, 1 | looks like a rock cave or arch; best: 3 Mossy Grotto: a stone cave: the grotto |
| W2-14-a | both | 3, 9, 6 | looks like a red thorn net (hurts); best: 3 Mossy Grotto: a harsh red briar in the grotto |
| W2-14-c | both | 6, 9, 3 | looks like a trunk bristling with black spines (hurts); best: 6 Deep Mangrove: a spiny palm trunk in the swamp |
| W2-14-d | both | 9 | looks like a prickly-pear cactus; best: 9 Volcanic Jungle: a dry, harsh plant: the only world dry enough is the volcanic slope |
| W2-16-a | W2 | 2, 6 | looks like a brown muddy water band; best: 2 Sunlit Riverbank: river water |
| W2-16-c | W2 | 10, 4, 2 | looks like big dark storm waves; best: 10 Stormy Highlands Fortress: storm surge under the fortress |
| W2-19-a | both | 5, 8, 1 | looks like a twisted orange bough with flowers; best: 5 Orchid Sanctuary: a flowering bough: the sanctuary |
| W2-19-c | both | 8, 1, 6 | looks like a mossy level bough; best: 8 Twilight Treetops: a mossy bough: the treetops |

## Holds and rejects (not in the table)

See `holds-rejects.csv`.

