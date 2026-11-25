# ART-W3 REPORT (R-165.449): World 3 standing + climbing art, 2-9 court art

**EXACT NEXT STEP (ART-W3-b hand-over):** ART-W3's order is DONE (cut, catalogued, judged by the lead, pack proof run). Nothing is
left for an art session on 3-1; the next step is BUILD-31's: follow "BUILD-31 DROP STEPS" below in the SAME commit as its draw sites.
For 2-9 (BUILD-29): the bell pair and courtFar-s11 are cut and catalogued but not packed (pack:false in picks.json): wire them with
2-9's draw sites (bell: one 2-frame sheet or 2 cells in a World 2 atlas, the same 633x662 box; courtFar: a backdrop beside
w2evening-far, stageBackdrops.ts '2-9').

**PACK PROOF (ART-W3-b, scratch worktree of t-art-w3, deleted after; nothing of it committed):** `python3 -I tools/art/hfw3/pack.py
--drop` = src/assets/w1to4art/w3-grotto.webp 4066x1409, 20 frames, 534 KB (547,180 B shipped; limit 4 MiB and 4096 px) + .json +
src/game/w3GrottoArt.ts. With one scratch import standing in for a draw site: tsc clean; `BASE_PATH=/Sloths-Adventure-/ npx vite build`
exit 0, the atlas ships as one file (w3-grotto-<hash>.webp), no file over 4 MiB; artcheck PASS; chunkcheck PASS; the TEST LINK build
(tools/testlink/build.py) 412 files of 480, 68 free, on this branch's base (the lead's link head is at 413: the atlas makes it about 414,
MIN_ROOM 40 holds). The 20 frames: the 11 ART-NEXT-c HAVE pieces (rimS-s11, rimS-s23, rimShort-s11, rimLong-s11, shelfS-s37, mat-s23,
sleepy-s23, sleepy-s37, lipA-s23, lipA-s37, lipB-s23) + the 9 ART-W3 primaries (shelfL-s37, wallR-s23-tile, wallShelf-s23,
thornBed-s23, thornClump-s23, rootTall-s67, rootShort-s53, rootShort-s67, roofRoot-s37-tile).
**CATCH (fixed in tools/art/hfw3/pack.py):** the drop wrote every frame name into w3GrottoArt.ts's type, so the art-use gate
(artUse.test.ts) counted all 20 frames as drawn with NO draw site (it passed in the scratch tree). The type is now
`keyof typeof FRAMES`; re-run, the gate lists each undrawn grotto frame (rootTall-s67, wallR-s23-tile, rootShort-s53, ...), as it must.

**BUILD-31 DROP STEPS:** (1) on BUILD-31's branch, bring reference/art/hfw3/cut/ and tools/art/hfw3/pack.py from t-art-w3 (`git
checkout origin/t-art-w3 -- reference/art/hfw3/cut tools/art/hfw3/pack.py`) and the ART-NEXT-c cuts (reference/art/hfnext/cut/);
(2) set `"pack": false` in picks.json on any 3-1/3-2 primary 3-1 does NOT draw (the art-use gate fails a packed frame no code draws;
its allow-list only shrinks), then `python3 -I tools/art/hfw3/pack.py --drop`; (3) draw with `drawW3Grotto(ctx, name, cx, bottom, w,
flip)` (bottom = the box's bottom; w = the piece's world width: the catalog's on_screen_px, e.g. shelfL-s37 316, wallShelf-s23 179,
thornBed-s23 183, rootTall-s67 51, roofRoot-s37-tile 173 per tile; the walk line = walk_y / cpu under the box top); the roof root
runs as the tile alone and ends INTO a wall or off-screen (its LAY RULE); a root hangs with its top tucked about 12 units under the
shelf's underside; (4) change each drawn row's status from 'cut, not placed' and used_in from 'none (not placed)' to its draw sites in
CATALOG-MASTER.csv, rerun `python3 tools/art/catalog_master.py --emit`, and LOWER inventory.test's branch-only count by the rows that
moved (242 today); (5) run artUse.test, artcheck, chunkcheck, tsc, the full suite, and the test link build (file count) before the
stills of the real screen.

**ART-W3-b DONE (session 2, head pushed and ls-remote-confirmed; the lead judged the stills, rulings below):**
- CUT (reference/art/hfw3/cut/, picks.json): thornBed-s23 + -s11, thornClump-s23 (4.5 cut px a unit: 183x72, 186x65, 160x60);
  rootTall-s67/-s41, rootShort-s53/-s67 (3 cpu; each take's own rock slab TRIMMED: under a shelf it read as a second, standable ledge);
  roofRoot-s37-tile (s37 cropped off its rock wedge, tiled left-right: seam 8.7 vs the root's own 7.1); bell-s23 + bellSwing-s23 in ONE
  633x662 box (swung s23 matches the still's arch within 3-5 levels; s11/s37 22+), 6.896 cpu = 96 px; courtFar-s11.webp (s11's middle
  pasted into w2evening-far with a feather: the outer edges identical, diff 0.0, so it tiles; 107 KB).
- CATALOG: 16 W3A rows (w3-w3a#), inventory emitted, inventory.test 242 (226 + 16), src/game/art tests 16/16, dressArt/rockLooks/
  w6WheelArt 12/12, artcheck PASS (same as main's baseline), tsc clean, scale gate: no W3A row out of range (thorns danger look, roots
  and roof root climb: no cap; bell decor near 1.08 y; platforms as approved).
- STILLS (reference/qa-reports/ART-W3/stills/, upright 440x952 + sideways 952x440, game size, Pokey 89): thornBed-s23/-s11 and
  thornClump-s23 in the DARK; the roots under shelfL-s37; roofRoot-s37-tile; bell-s23 + bellSwing-s23 beside the barge; courtFar-s11;
  barge.jpg (deck 386) and barge-fit-cpu2.95.jpg (the fits-upright option, deck 329). tools/art/hfw3/stills.py has the scenes.
- LEAD RULINGS (on ed782cb7f): thorns APPROVED (bed s23; s11 kept as the variant row: more pieces, Matt 10-30); roots APPROVED (the
  sideways tall climb cut at the top is the camera's job); roofRoot-s37-tile APPROVED with the LAY RULE in its footing (runs as the tile
  alone, ends INTO a wall or off-screen); roofEnd-s23 NOT COUNTED (two roots at the join, the pale knob an egg): its cut and still
  removed, its take kept; BELL 96 px (1.08 Pokey: the signature beat's landmark), still + swung one box; BARGE: the deck sets the size,
  2.513 cpu, deck 386, whole 507, upright the camera follows (the ruling is in w2-next#barge's note and tools/art/hfnext/catalog.py);
  courtFar-s11 APPROVED.
- PUSHBACK (taken): the barge ask could not hold both ways with this art: the deck (cut x 80-1050) is 76% of the barge's 1275, so a
  384-390 deck makes it 505-510 wide; fitting 440 upright needs 2.95 cpu and a 329 deck.
- POLISH CHECK: each still opened at phone size. Fixed: the roots' second-ledge slab (trimmed, braid tucked under the shelf's
  underside at its column); roofEnd's sawn end (re-shot joined: still rough, named, dropped). Named: the bell's upright still has its
  right beam end at the frame (a mock-up layout, not the art).
- LEARNED: a hanging piece's own anchor (a rock slab) doubles up under the real anchor; trim anchors off climb pieces and let the
  lay's ledge be the anchor. Check two-frame pieces' frames against each other numerically before the pick (the arch diff picked s23).
  Session 1's tools need scipy (`pip install scipy`): cut3.py fails silently inside sheet.py without it.

Pokey drawn 89.1 px. "Drawn" = the inventory's pokey_scale x 89.1 / h, measured from src/game/art/inventory/w3.json on main.
w3-next pieces are CUT and in the catalog (ART-NEXT-c) but their files are on origin/t-art-next, not packed into the build.
HF access: whoami OK (the HF credential expires about 3 hours after this list was written: batches must finish inside that).
HF balance: main's HF-SPEND.md last line says ~$41.25 (after ART-NEXT-d), not ~$50: $12 cap still leaves $29 > $10 reserve.

## 3-1 Into the Grotto (builds tomorrow)
| Beat / need | Piece | Inventory today (drawn size) | Status |
|---|---|---|---|
| 1-2 lit rim over a 160-200 px soft drop | lit-rim shelf S / short / long | w3-next#rimS-s11 111x65, rimS-s23 154x64, rimShort-s11 130x62, rimLong-s11 219x68 | HAVE (pack into build) |
| 2, 8 dark shelves down a wall (S/M) | grotto shelf | w3-next#shelfS-s37 139x67; w3-new#shelf-short 131x63, shelf-long 218x66 | HAVE |
| 8, 9 wide shelf (L, 320) | grotto shelf L | none (lips are 400 wide floor edges, grounded) | **MISSING M3** |
| 1-2 soft landing under the teach | soft fungus mat | w3-next#mat-s23 121x43 | HAVE |
| 6 sleepy mushrooms at a shelf's back | sleepy-mushroom shelf | w3-next#sleepy-s23 219x109, sleepy-s37 225x115 | HAVE |
| 4, 9 grotto floor + bottom lip | floor lip A/B | w3-next#lipA-s11/s23/s37, lipB-s23/s37 (397-433 wide, 93-130 thick) | HAVE |
| 3-8 the down SHAFT the shelves jut from | grotto shaft wall face (tiles up/down, not stood on) + shelf-in-wall end | none in grotto stone (w3#wall is a root wall, w3-props#wallTile is carved = made) | **MISSING M1** |
| 5 climb down a root curtain; Easy walks back up a root | root curtain climb, 2 / 3 / 4 Pokey tall | 0 W3 climb pieces; hf678/w17-moss-liana 49x120 is a forest trunk | **MISSING M2** |
| 8 thorn bed under a dark shelf (bright-rimmed once lit) | thorn bed | w1-thorn-row / bramble-long (world_best 3, 0.63 Pokey) | REUSE; judge in a dark still |
| 2-4, 9 glowworm dots / roof patch | glow | code-drawn (glow.ts, STAGE-RULES §4) | only if ENG-DARK's stills on t-eng-dark-wip show a need |

## 3-2 Glowworm Path
| Need | Piece | Today | Status |
|---|---|---|---|
| 1, 3, 9, 10 roots under the roof (hang/creep) | roof root mid + 2 root-in-rock ends | none (plan batch 2) | **MISSING** (check first whether rope roots are code-drawn, types.ts:496) |
| 4 root curtain up to a shelf | root curtain climb | = 3-1's M2 | MISSING (shared) |
| 6 stone ledge hops | stones / shelves | w3-new#stone-a 129x73, stone-b/c ~70x41, shelves above | HAVE |
| 3, 11 stream banks, shrine ledge | floor lips | w3-next#lipA/lipB | HAVE |
| 7 fern cover | grotto fern | w3-props#mossCurtain | HAVE (scale not scored) |

## 3-3 .. 3-9 (from the plan's art lines; designs 33-35 / 36-39 to read next)
- 3-4 Sinkhole (climb up): root/moss climb columns in grotto stone, sinkhole wall ledges: MISSING (M2 + ledges).
- 3-6 crumbling shelf: w3-new#crack-whole/cracking 129x49 HAVE. 3-8 liana: hf678/w17-moss-liana (plan says fits). Thorn vines: w3-props#thorn0-15.
- 2-9 (packet item 2): King's Barge 384-390 px flat deck at log height, court bell still + swung, throne-island backdrop: all MISSING.
