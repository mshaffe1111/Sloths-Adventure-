# ART-CAT PART B1: Worlds 1-4 props, dressing, hazards, kits, and the 1-1 atlas (2026-11-11)

## 1. What is in the table
`reference/art/catalog-game-B1.csv` has 812 rows, one row per atlas frame (or per single-file image), and no id appears twice. It has the packet's 25 columns in the packet's order. The second file column is `file_kb_ship`. Ids are `<file stem>#<frame>`, except the 18 1-1 atlas pieces, whose ids are the manifest stem (for example `w1-rock-slabs-low`).
- Count by source (the sources don't overlap). w1-cut 18. w1/w2/w3/w4-new 15+20+18+16. W1 kit (proto) 19, props2 6, props3 6, crown 1. Kits w2-w4 45. Ground w1-w4 32. w2/w3/w4-props 41+50+74. w4-grit 39. w4 falls 12. dressnew-w1..w4 75. dress.webp w1/w2 frames 22. stage-art 15. gates w1-w4 8. Pit water w1/w3/w4 6. Creek, splash, drop, lip, bed and bootprint 6. Bounce w1-w4 8. Water signs (jungle) 2. Puzzle kit 115. Rope kit 2. dot-props 29. dot-bridges 4. Plants 32, flowers 32, leaves 27, petals 17.
- Layers: decor near 437, danger look 115, platform 103, decor mid 54, character 41, step 37, ui 12, soft landing 8, backdrop 5.
- Status: 628 rows are in game. 184 are ready, meaning in the repo and never drawn. Those 184 are 130 frames with no draw site (from `tools/art/artuse.mjs`) and 54 frames whose sheets are never loaded (see §3). 34 rows say "needs fix".

## 2. How each column was filled (D37: from the code, not guessed)
- engine_slot comes from the code that draws the sheet, with file:line. In attempt 2 I re-read every cited file:line against the code. Fixed: the bouncy cap (mixer/w1mix.ts:175 plus the protoStage, stageGenerator and post lines), the chase branch (protoStage.ts:6779) and the crown (:6800), which were taken from catalog-map's first-push trace; also the w1CutArt and w1NewArt lines, dressArt:68, and the stage-art and rope slots. It is joined to the stage-data key (catalog-map arr/key: proto.dress, proto.decor, proto.w3decor, proto.kitDecor, platforms ...). For w1-cut rows it also gives pickCut's kind, its size window (w1CutArt.ts:109-111) and the LAID role.
- footing for the w1-cut rows is read from the code: fy/fx0/fx1 in w1-cut.json, applied by cutBox (w1CutArt.ts:45). Ground lips use `surf` from groundAtlasData, and bounce caps use the cap's top row. Every other platform, step or soft-landing row is measured from alpha: the first row where the middle half is 55% solid. Climbables (trunk, liana, rope) get "grip line = centre x, never stood on". All 148 platform, step and soft-landing rows have a footing and a ship_px.
- used_in comes from `tools/engine/inventory.ts`, run today over all 102 stages with 2 layouts (the output was put back afterwards, nothing committed). A few rows instead use the sheet lists in stageSheets.ts or the world's flora lists. Puzzle-kit pieces list the stages that have rooms, because which room lays which piece isn't measured per piece. I say that plainly in each of those rows.
- worlds shows USED (what is laid today) separately from COULD (best first, each with "N reason"). Fit is judged by material (moss rock, slate, glow stone, natural wood, made wood, carved stone, river, cave life, plants, flowers, highland, water, soil). A made thing never fits W1, and its world_best is never 1, even where it is laid in W1 today (0 rows break this). The 18 w1-cut rows also carry the manifest's 11-05 tag.
- on_screen_px is the size the code draws the piece, in world px. For reference, a sideways phone shows 540 world px top to bottom (WORLD_VIEW_H, engine.ts:221). Where the code fixes no size (props drawn at many widths), the value is marked "~ typical". ship_px is the smaller of the native size and 2× on_screen. file_kb is the frame's share of its sheet's file size.

## 3. Findings worth the lead's time
1. w2-new, w3-new and w4-new (54 pieces: nets, crates, barrels, bats, spores, shelves, veils, updrafts, cracking ledges) are never loaded by any code. `vite build` leaves them out of the app. artuse.mjs counts some of them as used only because their names show up in other code. They are cut art waiting for a slot. src/assets/w1-1109, w1-1111, w1-1111b and w1-1111c aren't in the build either. Those are Part A's source 3, so B1 skips them.
2. Made things in World 1 (attempt 2: I looked at every row again; 172 rows are now made_thing=y). 20 are in World 1 stages today:
   - Laid in 1-1: the three plank ledges (sawn boards) and w1-stump-wide (sawn top, pegged steps).
   - The W1 exit gate (shut and open), the checkpoint posts flagLit and flagUnlit (forged), and the jungle water sign (nailed planks).
   - The rope post and rope tile (lashed and twisted rope), the W1 kit's perch and trunk (sawn tops), and the moss-free hollow log (flat sawn ends).
   - Dressing: w1WoodStump, w1Toucan's stump, w1FallenLog (all sawn with rings) and w1TrailPost.
   - Two puzzle pieces: the nest door and the branch gate.
   None of the 172 lists World 1 as its best world. Puzzle-kit use is measured per room, not per piece, so other made puzzle pieces may also sit in World 1 rooms.
3. w1-boulder-grey-moss and its -b version, both laid in 1-1, have see-through holes in the rock face: dark crevices got keyed out, so the background shows through.
4. In the kits (World 2-4 kit sheets), stump and boulder are the same picture in each one. The W3 liana is cut down its right side. The W3 trunk has a grey square in it. The W3/W4 creaking branches have a pink blob under the crack, and the W2 snapped half trails a pink cord: magenta key leftovers. In w1-new, knot-a and knot-b have a flat lime bar floating over them.
5. The automatic edge check found 17 frames solid along a cell edge where that edge shouldn't touch anything (listed in the CSV status). Tiles, hanging pieces and ground-sunk feet were excluded first.

## 4. Gaps for the re-laid 1-1 (slots with fewer than 3 natural pieces)
These are the slots in World 1 with fewer than 3 natural pieces. Natural floating log planks: only log-plank-a/b, and neither is laid yet. Natural stumps: once stump-wide and hide-stump-hollow are taken out as made things, only hide-stump-hollow-tall is left. Pit lip, drop and bed have 1 piece each. Soft landings: 1 bounce cap and 1 pit bed. Pieces that could move in from other worlds' kits are listed in each row's COULD, for example W4 boulderMoss and rockMoss ~moss as hop steps, and the W3 hollowLog.

## 5. App size
The in-game rows add up to about 6,029 KB now. They would come to about 3,601 KB if each shipped at ship_px. That's an estimate from each frame's share of its sheet, not a re-encode.

## 6. Polish check (contact sheets, looked at the way Matt will)
`reference/art/master-sheets/b1/w<N>-<layer>.webp` and `shared-*.webp` are 30 sheets, one per world and layer. Each piece is drawn at its play size, with Pokey's 48 px height as a ruler, its footing line in red, and the label in red where it needs a fix. I checked w1-platform myself: the footing lines sit on the moss tops of the stones, logs and hollow logs. I also looked at every atlas on dark and light halves. That is how I found the holes, the sawn tops, the lime bars and the pink leftovers in §3.

## 7. Rebuild, limits, rules kept
Rebuild: `dump_frames.mts` writes frames.json. You also need misc.json (stage ids and flora lists), inv.json (inventory.ts), artuse.json, and the manifest from origin/art-director. Then run `build_b1.py`, then `sheets_b1.py`, with `B1_SCRATCH` pointing at the folder that holds those inputs.
Limits: on_screen_px for props drawn at many widths is a typical value. Puzzle-kit use is per room, not per piece.
Not done here: nothing under src/ was changed, no Hugging Face job was run, and no tester text appears anywhere.
Boundary: shared files hold some World 5-10 frames (dress.webp w5/w8-w10, bounce w5-w10, water-signs w5, gates and pit water w5-w10, dressnew-w5..w7). B1 leaves those to B2. Pickups, items, birds, butterflies, heartbloom and lairs go to B4.
