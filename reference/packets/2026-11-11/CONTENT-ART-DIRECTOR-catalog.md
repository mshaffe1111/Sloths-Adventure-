# TASK ART-CAT A and B (the art director's master catalog: EVERY piece, cut or already in the game, every world, how the engine uses it)   to: Content (art director)
# model: claude-opus-5-5   effort: high   due: <dispatch + about 3 h>
## Why
Matt, 11-11: "All pieces need that rule. The art director should have that all figured out with how the engine uses them." Then:
"Every piece in the game needs that with how it can be used." So: every image the game ships (all ten worlds: level pieces, props,
decor, hazards, backdrops, animals and enemies, characters, UI art) AND every cut piece not yet placed (about 385, five catalogs). The two older batches were tagged W1/W2 only, before Matt's
11-11 rule (roles/CONTENT.md: every piece, all ten worlds, best first with a reason, plus a By-world section). C2 places art onto the
re-laid 1-1 when it is ready to finish; this catalog is what C2 places from. Built on: the cut PNGs (stay); replaced this sprint by:
nothing (D40). No art is placed, cut again or generated here; no HF job.
## First
`git fetch origin ccr-ca657d3c-n09zty main t-c2-art-cut art-raw-2026-11-07 art-director`. Read reference/roles/CONTENT.md,
reference/LAWS.md, reference/LESSONS.md (D37-D40), reference/STAGE-RULES.md §4 (art) and §5b (polish), reference/PERFORMANCE-RULES.md
§1 and §8, reference/methods/kit-audit.md, and how the engine draws and stands on art: tools/engine/catalog-map.json (every kit slot:
cat, arr, key, footing, mayFloat, uses, worlds), src/game/w1CutArt.ts, src/game/stageArt.ts and src/game/stageArtData.ts (how a cut piece becomes a
drawn piece with a footing line), src/game/paintedScenery.ts (decor layers), src/game/paintedBackdrops.ts (backdrop and near strips).
## Two members, one table (run in parallel; identical columns; part A merges at the end)
- PART A: the cut pieces not yet in the game (sources 1-3 below). Output reference/art/catalog-cut.csv.
- PART B: everything the game ships today: every image under src/assets (each atlas frame or sprite separately, by the atlas's own
  frame list where it has one), every kit slot in tools/engine/catalog-map.json, src/game/stageArtData.ts, the world props and dress
  atlases, backdrops (sky/far/mid/near and their variants), hazards, animals and enemies, characters, UI art. Output
  reference/art/catalog-game.csv, plus the 18 1-1 pieces (source 4). For pieces the engine uses today, engine_slot and footing are read
  from the code (file:line), not guessed (D37); `worlds` says where it is USED now and where it COULD be used, separately.
- Part A, when B has pushed, runs catalog_master.py to merge both into CATALOG-MASTER.csv/.md.
## Sources for part A
1. art-raw-2026-11-07: cut/catalog.csv (91 kept; world_fit W1/W2/both)
2. art-director: reference/art/cut/manifest.json (107 keep, 4 hold; tags by kin)
3. t-c2-art-cut: reference/art-incoming/matt-2026-11-09/cut, matt-2026-11-11/cut, matt-2026-11-11b/cut, hf-list1 (catalog.csv each)
4. (part B) The 18 pieces already in 1-1's atlas (w1CutArt.ts / w1-cut.json): all 18 are ALREADY rows of the art-director manifest
   (source 2, from gemini-2026-11-05): set status "in game" on those rows, keyed by file stem = atlas name; never add them twice.
   Print every count as sources minus overlap.
## Build (part A branch t-art-catalog-a, part B t-art-catalog-b, both from origin/t-c2-art-cut; WRITE: reference/art/catalog-cut.csv
## (A), reference/art/catalog-game.csv (B), reference/art/CATALOG-MASTER.csv/.md and tools/art/catalog_master.py (A),
## reference/art/master-sheets/ (both), REPORT.md (each its own); nothing under src/)
1. tools/art/catalog_master.py merges every source into ONE table, one row per kept piece (holds and rejects listed separately), the
   same columns for all: id, source, file, kind, w, h, walk_y, walk_x0, walk_x1, flat, float_class, world_best, worlds (all ten, best
   first, each "N reason"), no_fit (the rest, each with why), made_thing (y/n: never W1), and the ENGINE columns: engine_slot (the
   catalog-map.json cat/arr/key it can fill (stage-data slots); for cut platforms ALSO w1CutArt.ts pickCut's kind (stone/stump/log)
   with its size window; for backdrops the paintedBackdrops.ts strip; or "new slot: <what>"), footing (the walk line in piece pixels, or none for decor), layer
   (platform / step / soft landing / danger look / decor near / decor mid / backdrop), on_screen_px (its drawn size at play scale),
   ship_px (the size to ship it at: no bigger than on_screen x 2, R-165.99 app size), file_kb now and at ship_px, draw_cost (one
   blit or a part of an atlas, and which), used_in (stages it appears in today, from the code), status (in game / ready / needs fix:
   what). Characters, enemies and UI use layer = character / enemy / ui and engine_slot = the code that draws them.
2. Re-tag the two older batches under the ten-world rule by LOOKING at each piece (contact sheets at play size), not by copying W1/W2.
3. CATALOG-MASTER.md: for EACH of the ten worlds: counts by layer and engine slot (in game today vs available), the gaps (slots with
   fewer than 3 pieces), pieces that could move in from other worlds' kits; the 12 best candidates for the re-laid 1-1 by slot with a
   contact sheet; the app-size saving if every piece shipped at ship_px.
4. A contact sheet per world and layer (reference/art/master-sheets/), looked at the way Matt will: anything rough (halo, fringe,
   wrong footing, angled sold as side-on) gets status "needs fix" with what.
## Done (the Critic checks each)
1. Every kept piece from all sources, and every image the game ships, is in the master table once (count per source printed and matched); no row lacks a world,
   an engine slot or a layer. 2. A spot-check list of 20 older-batch pieces with old tag vs new tags and the reason. 3. footing and
   ship_px filled for every platform/step/soft-landing row. 4. Made things never W1. 5. No tester text; no HF job; nothing under src/.
## Return
Push, ls-remote, REPORT.md (7 sections, 40 lines), ONE send_message to the lead (session_01FhBbYMoqqEdVR3qFjTCugy), 6 lines. Stop. Part B also messages part A its head.
