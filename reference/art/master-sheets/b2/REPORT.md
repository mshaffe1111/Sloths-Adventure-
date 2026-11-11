# ART-CAT part B2: Worlds 5-10 art the game holds (2026-11-11, attempt 2)

## 1. What was done
`reference/art/catalog-game-B2.csv`: 3,538 rows (attempt 1: 1,118), the packet's 25 columns, one row per piece. Built by `build_b2.py` (here; re-runnable,
reads only) from the asset .json frame lists and the src/game data modules that draw them (dumped with `dump.mts`/`dump2.mts`/`dump3.mts`).
Attempt 2 (the Critic): creature and boss atlases are now one row per atlas frame (690 creature + 1,875 boss frames), from the
game's own frame lists where it has one (fruitbatAnimData.ts, sentryAnimData.ts) else the sheet's .json, each naming its clip(s);
every soil fill tile (ground fills, kit fill, all *var#fill-b, not only w5var's) is layer decor mid with no walk line.
Contact sheets: 58 here, `w<N>-<layer>.webp`, each piece at play size on a checker, magenta line = the walk line, bar = status.
No art placed, cut or generated; no HF job; nothing under src/; no tester text.

## 2. Scope and counts (161 images, sources minus overlap = 0: every id is unique, asserted)
w6to10/ 2,920 (props-made, gemini, props, lairs, story, slide, creatures, bosses) | props/ 281 (W5-W10 frames of dress.webp, dressnew-w5..7,
w5-props, meeca-night, faces810, w5-sway, water strips, gates/w5-10, pitwater/w5) | kits/w5-10 83 | ground/w5-10 60 | bosses/ 76
(boss-910, boss-1010, the W9/W10 zone frames of boss-fx) | w7slide 67 | w7 22 | w6 16 | w8 13. `orch/` is 220 audio files, 0 images.
Split rules A must know: shared atlases are split by frame name (dress.webp: w5-w10 frames here, w1-w4 to B1); boss-fx: only lava, pole,
rods, bolt, storms, vents, scorch here, the rest to B4. Overlap risk with B4: w6to10/creatures and /bosses (packet names w6to10 for B2;
rows are one per atlas frame, `#<frame>`, the same unit as B4): dedupe on id. Not taken: lairs/ (croc, sov, prowler: W1-W4) and boss-atk.

## 3. Status (read from the code, file:line in engine_slot/used_in)
in game 749 | ships, frame not drawn 51 (kits' bank/fill/bankEnd/buttress outside W8; 10 meeca-night, 12 w5-props, 5 w6balt frames)
| ready, not imported (does not ship) 2,648 (most of w6to10: W9/W10 props-made, all lairs but the Queen's, 16 of 18 creature/boss
sheets (2,406 frames), story, gemini story poses) | needs fix 90.

## 4. Needs fix (looked at on the sheets)
- 63 rows: boss-910.webp and boss-1010.webp have frame lists (boss910Data.ts, boss1010Data.ts) but no import: they never ship.
- IN GAME and rough: W10 kit branch/branchCreak/snapL/snapR are an iron grate seen from above, drawn as side-on boughs; W9 kit wall is
  hex columns in 3/4 view stretched as a bank face; W5 kit boulder (the W5 moss_stone, 420 laid) is a stump with an orchid on its top:
  Pokey stands in the flower.
- Ready pieces: halos (white sticker rims) on grandma-things x6, collar x2, w5 orchidIcon, props w8-bough-5; flowers on walk tops
  (w9-stump-5, w8-burl x2, w5var stump-b, w5a-b mossy-log); angled (w10-stair x2, w7-block-5, w7b push-block); w6d#log holds a 2nd piece.
- The rim test fired on 33; 23 were truly white things (cups, doilies, silk) and were not flagged. No key-colour fringe found.

## 5. Gaps by world (fewer than 3 in game in a layer)
W5: soft landing 0, climb 2 | W6: danger look 1 (only the bad water), climb 2, soft landing 2 | W8: danger look 1, soft landing 2 |
W9: step 2, climb 2, no enemy art in game | W10: step 2, climb 2, no enemy art in game. W9 has 36 platform pieces ready, not imported.

## 6. Units and app size
on_screen_px = longest side in world units at play scale (540-unit view, engine.ts:221); ship_px = min(native, 2 x on_screen);
atlas frame kb is the sheet's kb by area share. Shipped B2 rows: 9,485 KB now, 5,995 KB at ship_px (about 3.5 MB saved).

## 7. Open for A / the lead
Layers added beyond the packet's list: climb (lianas, trunks, ladders), plus enemy/character/ui as for B4. Footing: alpha scan unless
the code gives one (w6 ledges ay, w8fungus walkTop, ground lip surf, protoArt solidTop); the scan is fooled by things on a top
(flagged). world fits are by family (each world's theme), not by piece-by-piece looks for the not-in-game rows. Contact sheets show the first
frame of each creature/boss clip (the table lists every frame).
