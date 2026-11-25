# ART-W3 REPORT (R-165.449): World 3 standing + climbing art, 2-9 court art

**EXACT NEXT STEP:** sandbox 6b0719adb6a90bbe997e1e17 (hf_sandbox handle hfsb2:mshaffe111:6b0719adb6a90bbe997e1e17) runs 3 specs back to
back: spec-w3a (q.log), spec-w3b 2-9 bell + far (q2.log), spec-w3c root redo (q3.log). Per READY-<group>: `hf_sandbox_fs cat /w/<group>.tar.pN
--max-bytes 100000` for N < the READY count, `python3 -I tools/art/hf1113/pull.py /w/<group>.tar <scratch>/<group>.tar`, untar, judge with
`python3 -I tools/art/hfw3/sheet.py <dir> <out.jpg>`, cut picks with tools/art/hfw3/cut3.py (K 1), add to reference/art/hfw3/cut/picks.json,
`python3 -I tools/art/hfw3/catalog3.py && python3 tools/art/catalog_master.py --emit`, stills `tools/art/hfw3/stills.py`. TERMINATE the
sandbox after the w3c pull. Then: HF-SPEND line, inventory.test count (226 + the W3A rows), pack.py dry-run proof, gates.

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
