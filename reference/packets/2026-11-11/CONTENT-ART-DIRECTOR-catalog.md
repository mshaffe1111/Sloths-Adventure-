# TASK ART-CAT (the art director's master catalog: every piece, every world, how the engine uses it)   to: Content (art director)
# model: claude-opus-5-5   effort: high   due: <dispatch + about 3 h>
## Why
Matt, 11-11: "All pieces need that rule. The art director should have that all figured out with how the engine uses them." About 385
cut pieces sit in five catalogs in three formats; only 18 are in the game. The two older batches were tagged W1/W2 only, before Matt's
11-11 rule (roles/CONTENT.md: every piece, all ten worlds, best first with a reason, plus a By-world section). C2 places art onto the
re-laid 1-1 when it is ready to finish; this catalog is what C2 places from. Built on: the cut PNGs (stay); replaced this sprint by:
nothing (D40). No art is placed, cut again or generated here; no HF job.
## First
`git fetch origin ccr-ca657d3c-n09zty main t-c2-art-cut art-raw-2026-11-07 art-director`. Read reference/roles/CONTENT.md,
reference/LAWS.md, reference/LESSONS.md (D37-D40), reference/STAGE-RULES.md §4 (art) and §5b (polish), reference/PERFORMANCE-RULES.md
§1 and §8, reference/methods/kit-audit.md, and how the engine draws and stands on art: tools/engine/catalog-map.json (every kit slot:
cat, arr, key, footing, mayFloat, uses, worlds), src/game/w1CutArt.ts, src/game/stageArt.ts and src/game/stageArtData.ts (how a cut piece becomes a
drawn piece with a footing line), src/game/paintedScenery.ts (decor layers).
## Sources (all of them)
1. art-raw-2026-11-07: cut/catalog.csv (91 kept; world_fit W1/W2/both)
2. art-director: reference/art/cut/manifest.json (107 keep, 4 hold; tags by kin)
3. t-c2-art-cut: reference/art-incoming/matt-2026-11-09/cut, matt-2026-11-11/cut, matt-2026-11-11b/cut, hf-list1 (catalog.csv each)
4. The 18 pieces already in 1-1's atlas (w1CutArt.ts / w1-cut.webp)
## Build (branch t-art-catalog from origin/t-c2-art-cut; WRITE: reference/art/CATALOG-MASTER.csv, reference/art/CATALOG-MASTER.md,
## tools/art/catalog_master.py; nothing under src/)
1. tools/art/catalog_master.py merges every source into ONE table, one row per kept piece (holds and rejects listed separately), the
   same columns for all: id, source, file, kind, w, h, walk_y, walk_x0, walk_x1, flat, float_class, world_best, worlds (all ten, best
   first, each "N reason"), no_fit (the rest, each with why), made_thing (y/n: never W1), and the ENGINE columns: engine_slot (the
   catalog-map.json cat/arr/key it can fill, or "new slot: <what>"), footing (the walk line in piece pixels, or none for decor), layer
   (platform / step / soft landing / danger look / decor near / decor mid / backdrop), on_screen_px (its drawn size at play scale),
   ship_px (the size to ship it at: no bigger than on_screen x 2, R-165.99 app size), draw_cost (one blit or a part of an atlas, and
   which), status (in game / ready / needs fix: what).
2. Re-tag the two older batches under the ten-world rule by LOOKING at each piece (contact sheets at play size), not by copying W1/W2.
3. CATALOG-MASTER.md: counts by world (best and any fit), by layer and slot for World 1; the gaps (World 1 slots with fewer than 3
   pieces); the 12 best World 1 candidates for the re-laid 1-1 by slot, with a contact sheet; a By-world section for all ten.
4. A contact sheet per layer for World 1 (reference/art/master-sheets/), looked at the way Matt will: anything rough (halo, fringe,
   wrong footing, angled sold as side-on) gets status "needs fix" with what.
## Done (the Critic checks each)
1. Every kept piece from all five sources is in the master table once (count per source printed and matched); no row lacks a world,
   an engine slot or a layer. 2. A spot-check list of 20 older-batch pieces with old tag vs new tags and the reason. 3. footing and
   ship_px filled for every platform/step/soft-landing row. 4. Made things never W1. 5. No tester text; no HF job; nothing under src/.
## Return
Push, ls-remote, REPORT.md (7 sections, 40 lines), ONE send_message to the lead (session_01FhBbYMoqqEdVR3qFjTCugy), 6 lines. Stop.
