# ART-678 plan (t-art-678 from t-hooks@994ea4e7). Lead approves before the sandbox starts (hf-art.md §10). Cap $8; est. ~$2.
Prompt file: `tools/art/hf678/make_spec.py` -> `spec-t2i.json` (24 stills: 6 sheets x seeds 11/23/37/53, Qwen-Image + style LoRA 1.0,
30 steps, cfg 4) and `spec-edit.json` (12 edits: Qwen-Edit-2511 from the game's own harpy walkB frame, no Pokey LoRA).
## Sheet layout (one take = several pieces; sizes in game units vs Pokey's DRAWN 89.1)
| Sheet | Canvas / key | Pieces (target size) | Level |
|---|---|---|---|
| snake | 1792x1344 magenta | brown vine snake (Oxybelis: vine-brown to olive, pointed head, eye stripe): hanging head-down ~115, sliding S, coiled stiff on a mossy bough as a 'liana' ~130, hiss | 1-6 |
| moss | 1792x1344 magenta | carpet top strip (~28 thick, tiled by wrapfix), cushion patch ~180x40, Spanish-moss drape 130-150, mossy liana tile, fork moss | 1-7, 1-8 |
| harpy (edits) | 1024 grey, from harpy-atlas walkB | perched: look ahead, look down, head turned to us, blink (~130 tall); same bird as the enemy | 1-7, 1-8 |
| snag | 1344x1792 magenta | 2 dead snags with perch stubs (~300 tall) | 1-7, 1-8 |
| nuts | 1792x1344 magenta | palm nut ~26, cannonball fruit ~40, fruit split, cracked nut, squirrel-tracks strip ~120. w1NutPod at 40 shown beside as the "existing first" option | 1-8 |
| under | 1792x896, magenta above a ragged top | W1 earth-and-roots underlayer band (R-165.224), opaque, tiled sideways by wrapfix; 2-3 candidates + a 1-1 upright mock-up | 1-1, 1-4, 1-5 |
| post | 1792x1344 magenta | 3 living-wood stumps (vine-wrapped, broken top, never sawn) to replace the square posts (R-165.209) | 1-1, 1-4, 1-5 |
## Run (the 11-13 route, HANDOVER.md "Route")
One rtx-pro-6000 sandbox (aitoolkit image, token forwarded); ONE queued script: edits first (Qwen-Edit ~60 s load), then the 24 stills;
contact sheets in the sandbox, pulled by sbx.py parts; picks cut there (cutprops key_own, biggest piece -> per-piece boxes), tar back;
terminate the moment the last file lands. Native pass only if a picked strip is soft at ship size (expected: none; 3 px/unit ship).
## Out
Cuts in `src/assets/w1-678/`, catalog rows -> CATALOG-MASTER.csv -> inventory; one contact sheet per sheet beside Pokey (89.1) at game
scale; the 1-1 mock-up; HF-SPEND rows with $ per piece. Nothing wired.
