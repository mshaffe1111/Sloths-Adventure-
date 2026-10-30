# Clean sweep: every stage walked both ways, findings by cause and owner (polish-clean, 2026-10-29)

Matt, 4:08 PM ET: "with polish, what we lack the most is seams and putting that extra cleanness on things."

**What was walked.** All 102 stages of Worlds 1-10 (every stage, the ten boss lairs, 4-D and 5-M), upright 390x844 and sideways 844x390,
dpr 2, on the work branch head (polish-clean abb8b4f5 = ccr 87de733e + the tool): 204 walks, 13,404 frames, a 4 s clip of each
(`tools/inspect/walk.mjs`, `tools/inspect/seams.py`; how to run: `tools/README.md`). 4-D and 7-4 run on a clock with right held (not
walked end to end). Plus a start check of every stage (the first 3 s) and a pickup count.

**How far to trust the detector** (hand-checked random samples, after the filters in `seams.py wanted()`): about 70% of findings are
real problems overall. By kind: repeats ~95%, code-drawn shapes ~85%, key colour ~65%, straight lines ~50% (painted lines in the art
fool it). So every line item below was checked by eye on its crop; the raw list is `CLEAN-SWEEP-DETAIL.md`.

Counts are frames where the cause shows (of 13,404). Crops are in `clean-sweep/`. Nothing below has been fixed yet: this list goes to
the lead first for routing.

Already fixed on the head, not reported: polish-edges' strip edges and skies (the "dark ring" on strips the detector measures is now
the strips' painted outline: left out), the 1-4 lift rooms, the painted checkpoint flag, the 6-5 soil bands (see G4).

## hf-art-ground: soil, ground and dressing (the biggest share)

| # | Cause | Where | Frames | Crop |
|---|---|---|---|---|
| G1 | **The new painted soil tiles repeat side by side, identical, with a visible join** (the same 1024 px tile and its 160 px lip row drawn again and again, no flip or variant) | every world's ground; worst W3, W5, W6, W10 | ~6,000 | [W3](clean-sweep/repeat_same_piece_same_piece_w3_webp_1024_1024_1024_160_.jpg), [W5](clean-sweep/repeat_same_piece_same_piece_w5_webp_1024_1024_1024_160_.jpg), [W6](clean-sweep/repeat_same_piece_same_piece_w6_DRUb1t_g_webp_0_0_1024_1024_.jpg) |
| G2 | **Soft pits read as code-cut boxes** (the lead's report): every pit end is the same piece (`drawEnd` endFaded, 384x576), so each pit has the same straight vertical cuts and flat inner ledge | all ground worlds | ~2,400 | [lead's still](clean-sweep/lead_pit_notches_w1_side.jpg), [W1](clean-sweep/repeat_same_piece_same_piece_cache_w1_DC91Pjzk_webp_endFaded_drawEnd_0_0_384_576.jpg) |
| G3 | **Hard joins inside the soil tiles**: horizontal steps where tile rows meet, light/dark lines along the grass lip (`blobField`/`drawSoil`) | W1-W5 mostly | ~1,500 | [W3 step](clean-sweep/line_horizontal_step_w3_webp.jpg), [lip line](clean-sweep/line_horizontal_light_line_canvas_blobField_drawSoil_.jpg) |
| G4 | **Soil banding top to bottom** (the lead's 6-5 report). On the head 6-5's soil is repainted and shows no bands ([6-5 now](clean-sweep/6-5_up_head_no_bands.jpg)); the band check (start frames, upright) still finds them in **9-2 and 5-10** (strong) and weakly in 7-4 and the lairs 1-10, 6-10, 7-10, 8-10 | 9-2, 5-10 | (start check) | [9-2, 5-10](clean-sweep/bands_9-2_5-10_up.jpg) |
| G5 | **Ground still drawn in code**: pit insides and shafts (`drawColumn`, flat #060f19 W3), flat colour bands under the soil (#30312c, W6-W10), code ground outlines (#3b1f0c, #282018, #655441) | 73 stages | ~5,400 | [shaft](clean-sweep/shape_code_texture_code_made_texture_codecanvas_bakeSprite_drawColumn_3_.jpg), [flat band](clean-sweep/shape_flat_rect_flat_rect_30312c.jpg), [W3 pit](clean-sweep/shape_flat_rect_flat_rect_060f19.jpg) |
| G6 | **Dressing drawn in code**: stick plants and flower stems (W2 #442f1e, W9 #251a18 #2c2222), sand blobs (W2 ellipses), slabs (W10 #63647b), the olive log stub (W1 #706640), mushroom domes and root arches (W3) | 54 stages | ~2,600 | [W9](clean-sweep/shape_code_line_code_line_251a18.jpg), [W1 log](clean-sweep/shape_flat_rect_flat_rect_706640.jpg), [W2 blobs](clean-sweep/shape_flat_ellipse_flat_ellipse_ff5a5a.jpg) |
| G7 | **Platforms drawn in code** (`platformSprites` thin ledges and slabs) | 1-2, 1-7, 9-10 | 80 | [crop](clean-sweep/shape_code_texture_code_made_texture_codecanvas_spriteFor_drawThin_.jpg) |
| G8 | Copy-paste dressing: bounce plants and crumble blocks identical side by side | W1, W7, W10 | ~250 | in DETAIL |

## hf-art-stage: water, hazards, stand-ins

| # | Cause | Where | Frames | Crop |
|---|---|---|---|---|
| S1 | **World 2 pit water still drawn in code** (flat teal rects #264247 and gradient paths) | 2-1 to 2-9 | ~950 | [crop](clean-sweep/shape_flat_rect_flat_rect_264247.jpg) |
| S2 | **Hazards drawn in code: World 9's spikes (#12101a) and World 10's thorn shards (#2a2830)**: things that hurt Pokey (STAGE-RULES §4) | W9, W10 | 262 | [W9](clean-sweep/shape_flat_poly_flat_poly_12101a.jpg), [W10](clean-sweep/shape_flat_path_flat_path_2a2830.jpg) |
| S3 | **World 7 stand-ins drawn in code**: the stone blocks with yellow faces, striped boards, tablets (#c7b895, #5a4630) | 7-1 to 7-9 | ~650 | [crop](clean-sweep/shape_flat_path_flat_path_c7b895.jpg) |
| S4 | **The dirty-water tile and its debris pieces repeat** (w6-water: the same 512 px debris piece and 1024 px water tile again and again) | W6-W10, 35 stages | ~4,500 | [crop](clean-sweep/repeat_same_piece_same_piece_w6_water_webp_512_530_512_142_.jpg) |
| S5 | The code-drawn pools' edges (`lanePool`, `poolPic`) show straight lines | many | ~500 | in DETAIL (lines: check by eye) |

## hazard-anim: repeating effects

| # | Cause | Where | Frames | Crop |
|---|---|---|---|---|
| H1 | **World 10's lightning is a code-drawn white line** | 10-1 to 10-9 | 22 | [crop](clean-sweep/shape_code_line_code_line_ffffff.jpg) |

## polish-edges: backdrop strips

Strip edges, halos and magenta are clean on the head. Left: the World 7 canopy strip (w7c-b) drawn with a 3 px outline next to 0.4 px
pieces upright (7-1, 7-6, minor) and a few copy-paste repeats in w3-near, w4-near and w10-sky (13 frames). DETAIL has them.

## polish-clean (mine)

| # | Cause | Where | Frames | Crop |
|---|---|---|---|---|
| C1 | **Key colour left on cut-out sheets**: magenta spill on the soft edge of w2.webp (W2 soil lip), w8.webp, w4-props (the purple-tinted outline), props-atlas, dress, dot-props; green spill round W3's glowing mushrooms (w3-props). One defringe pass over every cut-out sheet (`tools/art/defringe.py`), with before/after proof per sheet | 58 stages | ~3,700 | [w2](clean-sweep/key_magenta_edge_magenta_key_on_the_edge_of_w2_webp-proof.jpg), [w4-props](clean-sweep/key_magenta_edge_magenta_key_on_the_edge_of_w4_props_webp-proof.jpg), [w3 green](clean-sweep/key_green_edge_green_key_on_the_edge_of_w3_props_webp-proof.jpg), [dress](clean-sweep/key_magenta_edge_magenta_key_on_the_edge_of_dress_webp-proof.jpg) |
| C2 | Light halos on cut-outs: puzzle-kit (cage, basket), hud-atlas board edge (4-D) | 19 stages | ~220 | [puzzle-kit](clean-sweep/fringe_light_halo_light_halo_on_puzzle_kit_webp-proof.jpg) |
| C3 | **HUD: Dot's box, a score pop-up or a boss name lies over the lives counter** (sideways stages; upright boss fights) | 25 stages | 83 | [Dot](clean-sweep/hud_text_on_text_HUD_overlap_3_Dot.jpg) |
| C4 | Floating ledge posts in 6-8 (ledges.webp, a gap under the post) | 6-8 | 151 | [crop](clean-sweep/float_floating_prop_ledges_webp_420_471_90_145_floats.jpg) |
| C5 | puzzle-kit pieces blown up 2.4-5x in 2-3 and 2-8 (soft next to the rest) | 2-3, 2-8 | 7 | in DETAIL |

## The two new checks (the lead, 10:03 PM ET)

- **Flat background**: none. Every stage checked has its painted backdrop from the first frame (0.2 s) on, both ways (188 of 204
  walks; 9-10 both ways and 10-3 sideways timed out and need a re-run). Each walk now also fails any frame without a backdrop (`bg`).
- **Pickup clutter (more than 6 on one screen)**: 110 of 188 walks. Worst: 4-7 (27 on one screen), 4-1 (24), 2-6 (23), 8-3, 8-1,
  3-4, 1-4 (20). Matt's one-petal change (polish-levels) is the fix; the walk now fails any frame over 6 (`clutter`) and `start.json`
  gives each stage's worst screen.

## Counts per stage

`CLEAN-SWEEP-DETAIL.md` (bottom) has the count per stage and orientation by owner; `CLEAN-SWEEP-DETAIL-counts.json` is the same for the
before/after comparison after fixes.
