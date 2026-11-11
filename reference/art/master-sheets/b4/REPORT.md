# ART-CAT part B4: characters, animals and enemies, UI, icons, story and photos (2026-11-11)

## 1. What was made
- `reference/art/catalog-game-B4.csv`: 324 shipped images, 4,530 rows (one per atlas frame from the game's own frame tables, or one per single sprite). Columns are the packet's, in its order.
- `reference/art/master-sheets/b4-all-<layer>.webp` (every image whole, on a light and a dark checker) and `b4-play-w1..w10.webp` (one frame of every sheet a world draws, at on-screen size x2 over that world's mid backdrop).
- `reference/art/master-sheets/b4/`: `extract_b4.mts` (frames, stage sheets, creature sheets, read from src/game), `build_b4.py` (the CSV), `sheets_b4.py`, `edgecheck_b4.py` (fill, white fringe, white edge specks per frame), `rects.json`, `edgecheck*.json`. Nothing under src/ changed. No HF job.

## 2. Counts (per source, matched)
- Images by folder: story 92, enemies 52, icons 49, photos 40, hero 28 (19 clips), ui 14, characters 13, items 12, title 8, pickups 7, bosses 4, flora 2 (birds, butterflies), hud 1, medals 1, w8 1 (pokey-jar) = 324, each once.
- Rows: 122 sheets give 4,328 frames; 202 single sprites give 202 rows. By layer: enemy 2,224, character 1,518, ui 431, backdrop 120 (story plates, live plates, story ground, castles), decor mid 88 (birds, butterflies), danger look 79 (boss attacks, boss fx), decor near 63 (9-10/10-10 set pieces), pickup 7.
- Every row has world_best, worlds, engine_slot and layer (0 missing). Menu-only art has world_best `menu`.
- Overlap: none inside B4. Boundary left to other parts: `lairs/*` (7, boss lair backdrops: B3), `flora/` flowers/leaves/plants/petals/heartbloom (B1), `w8/lantern`, `w6to10/creatures/*` (fruit bat, sentry: B2), `proto/*`, `kits/*`, `ground/*`. Part A: dedupe on `file` if a neighbour also listed one.

## 3. How the engine facts were read (D37: code, not guesses)
- Frames: the data module export named in engine_slot (e.g. `boaAtlasData.ts BOA_FRAMES`); grids from `heroClipsData.ts`, `livePlateData.ts`, `titleCast.ts`, `heroSwimData.ts`; pages from `storyCelData.ts` (a) and `storyHdData_*.ts` (p).
- used_in: `stageSheets()` run over all 102 stages (hand-built and painting on) plus `spriteSheets.ts` SPRITES and `stageManifest.ts` ALWAYS. Bosses: their world's -10 lair. Story: chapter `w:` before each plate key in storyWorlds/Memories/Finale.
- footing: characters and enemies carry their anchor (ax, ay) from the frame table; it is the feet/ground line where the module says so, the body middle for flyers and the dangler (see each module's header). Decor, UI, story: none.
- on_screen_px: CSS px on an upright 390x844 phone (engine.ts applyZoom: 0.94 canvas px per world unit; sideways is 0.72, smaller). A plain number uses the module's own scale (cited in engine_slot: boss `k`, creature `K`, `*_ANIM_UP`, hero 66x1.35/200, hero-atlas /303.2, studies x frame `sc`). `est:N` is an estimate: HUD = sheet/3 (HUD_ART_SCALE), icons and most UI = sheet/2 (they ship at 2x), story plates = 844 wide, cards = 844, pickups 34 units, birds 30, butterflies 34, unwired creatures 0.4 units/px.
- ship_px = min(frame size, on_screen x2). file_kb per frame is the sheet's size split by area.

## 4. Polish check (looked at on dark ground at play size x2, upright)
- **needs fix, 25 rows: General Iron-Claw (`enemies/ironclaw-atlas`, the 10-10 boss)**: white key-out specks along his cape and edges on 25 of 37 frames (idle, march, slash, jumpup, chaos, ultslam...). Plain on a dark lair. Proof: zoom of all 37 frames was checked; the per-frame score is in `b4/edgecheck-frames.json`.
- **needs fix, 2 rows: medal emblems `leaf` and `fist`** (`medals/medals.webp`): a thick white sticker rim round the emblem.
- **needs fix, 10 rows: dead weight**: `story/drake/*` (9 files: Drake and tea set) and `ui/slider-track.webp` ship in the app but no code reads them. Wire the Drake set into the 9-10 tea scene or drop them.
- Checked and passed: Pokey's clip sheets scored a little light at the edge (0.13-0.20) but at play size x2 on dark ground no rim shows; every other sheet under 0.05 white specks except bright paint that is meant (lightning, clouds, webs, the dangler's hair). Icons all fill 60%+ of their canvas. Croc-atlas `blast` is hard-cropped on its right edge, but that sheet is crest-only (the fight draws croc-anim), so not shown.

## 5. Status counts
in game 3,944; in game (crest only) 50; ready: data wired, no stage draws it 418 (butler, seamstress, dangler, dozer, mantis, meeca-carve); ready: cut, not drawn yet 63 (boss-910, boss-1010 set pieces); ready: classic-snake fallback 18; needs fix 37 (above).

## 6. App size (R-165.99)
B4 ships 70.7 MB of images. Shipped at ship_px they would be about 48.4 MB (saving 22.3 MB): 8.4 MB of it from sheets whose scale is read from code (sure), 13.9 MB from estimated ones (check before cutting). Biggest: soldier-anim, flicker-anim, mantis-anim, goldsnake-anim, pell-anim, prowler-anim (each about 0.9-1.6 MB).

## 7. For the lead
- Made things in World 1: the 6 keepsake pickups (bell, locket, rattle, ribbon, scroll, teddy) load on every stage, World 1 included (stageManifest ALWAYS 'pickups'). They are story keepsakes, not level art, so I left them as they are and flag it here. Your call.
- Per world (images shown there): W1 91, W2 79, W3 78, W4 76, W5 91, W6 88, W7 91, W8 84, W9 85, W10 92; menus 152.
- Rerun: `npx tsx reference/art/master-sheets/b4/extract_b4.mts /tmp/b4.json && python3 reference/art/master-sheets/b4/build_b4.py /tmp/b4.json && python3 reference/art/master-sheets/b4/edgecheck_b4.py && python3 reference/art/master-sheets/b4/sheets_b4.py`.
