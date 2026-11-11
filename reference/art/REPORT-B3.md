# Art catalog part B3: every painted backdrop (2026-11-11, packet CONTENT-ART-DIRECTOR-catalog, branch t-art-catalog-b3)

## 1. What is in it
- `reference/art/catalog-game-B3.csv`: 200 rows, the packet's columns. 193 = every file in src/assets/backdrops (49 strip sets:
  47 far, 47 mid, 46 near, 46 sky, plus the Hollow, the two council-garden plates, four Dot-flight plates); 7 = src/assets/lairs
  (Worlds 1-4 lair plates and foreground strips). Sources minus overlap: 193 + 7 - 0 = 200. Left to B2: src/assets/w6to10/lairs (lair
  plates of Worlds 5-10) and src/assets/w7slide/chute-far-dark.webp, so part A does not count them twice.
- Rows: 198 layer=backdrop, 2 layer=decor near (fg-croc, fg-sov). Status: 184 in game, 11 needs fix, 5 ready (unused).

## 2. Engine columns, read from the code (D37)
- engine_slot: paintedBackdrops.ts strip and source (urlFor :55 world set / far-only set stageBackdrops.ts:15 / World 5 w5Backdrop.ts:21;
  canopyUrl :257), drawn by scenery.ts:1849 drawStrip at par 0.05/0.2/0.42 with STRIP_FIT k/a/at (W7 near x1.75, :1842). Plates name
  their file:line and floor share. footing: none (no collision); the "line" is the land line row a*h placed at `at` of the view.
- used_in: `npx tsx tools/art/backdrop_usage.ts` runs the engine's own tables over generateAllLevels (100 stages). N-10 is left off a
  world's strips because those lairs own their scene (lairArt.ts:40), except 9-10 (Drake). Borrowed strips (w1b uses w1-near) are named.
- on_screen_px at a 1080-row sideways phone; every strip ships under 2x on-screen, so ship_px = file size and the app-size saving for
  B3 is 0 KB (29,487 KB now). Dot plates and the Hollow/Prowler plates are drawn larger than the file (soft, not oversize).

## 3. Polish check (contact sheets reference/art/master-sheets/B3-backdrop-w1..w10.webp and -special.webp, looked at)
- NEW defect class, measured for every strip (`python3 tools/art/backdrop_seams.py`) and confirmed by eye at the join: 10 middle
  strips cut a tree or canopy in a straight vertical line at every repeat (rows paint on one edge, clear on the other, 6-28%):
  w3sinkhole 28%, w6dawn 22%, w2mist 22%, w1sunrise 19%, w1kapok 17%, w8sunset 16%, w1rain 11%, w1-mid 8%, w1c 6.5%, w6moon 6.4%.
  Seen on 1-2..1-5, 1-7..1-9 (not 1-1), 2-1, 2-3, 3-4, 3-6, 6-1, 6-3, 6-4, 6-6, 6-8, 8-2, 8-5. Every strip under 3% is clean.
- w1sunrise-far (1-3): white blob fragments at the treeline (the 11-05 orchid remnants) and a colour step at its join.
- Checked and clean: w3sinkhole-far's black void is the painted cave mouth; no key-colour fringe seen on any cut strip.

## 4. Gaps for the level builder
- Canopy strips exist only for World 1 (w1c). stageUsesCanopy asks for w<N>c on 17 climbs (2-6, 3-4, 4-1, 4-3, 4-6, 5-8, 6-8, 7-2,
  7-4, 7-8, 8-7, 9-2, 9-7, 10-2, 10-4, 10-5, 10-8); none exists, so they fall back to the ground strips. New slot: canopy set per world.
  (5-8 could not use one anyway: w5twi2 is not an own-mid set.)
- Unused, ready: w10after-far (far only) and the whole w10night set, held until the rain ends with the storm.
## 5. World tags
- Each row: its own world first, then the worlds it could serve with a reason, then no_fit for the rest with why. Skies move by light
  (a dawn sky fits every world with a dawn set). Made things (huts, ruins, fortress, nets, table) are never W1.
## 6. Not done here
- No art cut, placed or generated; no HF job; nothing under src/. The 10 join fixes are a re-run of strip-seamless with a wider
  crossfade (or an edge mask) plus stills of each stage; that is a fix packet, not this catalog.
## 7. Rebuild
`npx tsx tools/art/backdrop_usage.ts > /tmp/u.json && python3 tools/art/catalog_b3.py /tmp/u.json && python3 tools/art/backdrop_sheets.py`
