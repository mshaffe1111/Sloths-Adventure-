# INV-C (R-165.104 C): the engine reads the inventory. Branch t-engine-inventory (from t-art-catalog-a@17827423)
## 1. Done-items
- Emit: `python3 tools/art/catalog_master.py --emit` writes src/game/art/inventory.json (9,364 rows, the 16 columns, {cols, rows}); a second emit gives the same bytes (md5 65b95163).
- Stale cite: not one cell but 60 (all w5-w10 ground fills/lips/ends cited groundPaint.ts:219, which is endFace). Fixed at merge (`CITE_FIX`): fills -> 139-140, lips -> 202-203, ends -> 68; `--merge` rerun: only those 60 CSV lines move, 9,364 rows, 0 problems.
- inventory.ts: typed ArtRow, `loadInventory()` (dynamic import, once), byId, byWorld(w,{layer,slot,minW,maxW,standable,includeMade}), bySlot, gaps(w).
- inventory.test.ts 7/7: same ids and order as the CSV; every file exists (9,170 on disk, 194 cut pieces via `git ls-tree` on origin/art-director and origin/art-raw-2026-11-07); 538 footings inside their image; made things never W1-best; byWorld(1,{platform,standable}) = 110 = CSV, byWorld(5,{step,100-300}) = 9 = CSV, bySlot(tree_climb) 18; gaps(1) printed.
- Planted failure: removing the W1 made filter turns tests 4 and 5 red.
- gaps(1) [13]: ropes rope, vines swing_liana, bouncy, fragile ruin, solid -, solid branch, solid canopy_bridge, solid fungus_shelf, pit lip pair, pickCut log, pickCut perch, pickCut stump, PIT_WATER strip (= the catalog's 12 + pickCut log, under 3 once made logs leave W1).
- tsc clean. Full suite (6 shards, + src/game/art): 2,473 pass, 2 todo, 0 fail (stageQuality "generating a stage is quick" missed p90 at 893 ms with 6 shards on one CPU; alone: pass).
- Lock: `lockall --layouts 16 --check` vs main: 102/102 stages unchanged. seedlist 1-1: PASS (138). knowncheck PASS, roadmapcheck PASS, artcheck PASS.
- Build: main chunk index-DKO7_XPD.js 4,164,567 B before and after (byte-same: nothing imports the inventory yet). Probe build with one caller in main.tsx (reverted): inventory-*.js its own chunk, 2,152,595 B (< 4 MiB); main grows 1,613 B for the loader.
## 2. Polish check
No screen changes. The json is generated only; the tool says so in its note field.
## 3. Pushback
- The six keepsakes (B4:pickups/*) are made things with world_best 1. Matt 11-11: "keepsakes stay"; the test names exactly those six as the one exception, it does not loosen the rule.
- engine_slot in the json is the catalog's slot_key (one key across the parts' wordings), not the CSV's prose, so bySlot/gaps work; the prose stays in the CSV.
- Out of my WRITE lane, needed for the test to run anywhere: `src/game/art/*.test.ts` added to the suite in CLAUDE.md, methods/gates.md and deploy.yml; deploy.yml's test job also fetches art-director and art-raw-2026-11-07 (depth 1). The Critic may bounce these.
## 4. Suggestions
- Packet for Content: pack the 194 origin/* cut pieces into src/assets so every inventory row is loadable at runtime (today 194 are branch-only).
- t-engine-chunks edits the same CLAUDE.md and gates.md lines: a small hand-merge when both land; its chunkcheck cap is unaffected (inventory is lazy).
## 5. Unresolved
Nothing wired into a stage (C2's). The 4-3 boulder TODO test stays a TODO.
## 6. Method update
Run the full suite as 6 shards (CI's way): one process passes the 30-min background limit.
## 7. Turnover
reference/handoffs/engine-core.md §1: the inventory row (where, how to regenerate, queries).
## Delta (lead, after the Critic's PASS of 5d147f9a): per-world files, a test that holds without the art branches
- Split: `--emit` writes src/game/art/inventory/w1..w10.json (the level art that fits each world, a piece in every world it fits; 564-1,070 rows, 122-225 KB, w1 about 24 KB gzipped) and cast.json (characters, enemies, pickups, UI, backdrops, no-world rows: 7,283 rows, 1.7 MB). The one inventory.json is gone. `loadInventory(world | 'cast')`: one spelled-out dynamic import a file, each its own chunk (probe build: w1-*.js 169,824 B ... w6 227,764 B, cast 1,706,540 B). World files carry play_slots (the catalog-wide slot list) so gaps() needs no other file; gaps(N) on another world's file throws.
- Test 7/7, rewritten per file: every catalog row in exactly the files it belongs to (w<N> = the CSV's level rows fitting N, in order; cast = the rest); each world file < 300 KB; gaps(1) = the catalog md's World 1 line + pickCut kind log, read from the md.
- Branch-only rows: with origin/art-director and origin/art-raw-2026-11-07 deleted locally the test passes and prints "branches not in this checkout (files unchecked, rows checked not placed): origin/art-director (103), origin/art-raw-2026-11-07 (91)"; those 194 rows are asserted never "in game" and CSV used_in "none (not placed)" (their status is ready / needs fix, not "not placed": the lead's wording, the data's field differs). Every src/ row is still checked on disk. CI's fetch of the two branches is kept, non-fatal.
- Planted: removing the W1 made filter turns tests 4, 5, 6 red.
- Main chunk: the build stamps the git commit and its time, so bytes move a little with every commit (4,164,567 -> 4,164,568 between my two commits with no code change). Pinned (GAME_BUILD_TIME, GAME_GIT_COMMIT): base t-art-catalog-a and this branch both 4,164,551 B, index-M91tLpym.js, cmp identical.
- Lock: no engine file changed since the 102/102 check (nothing outside src/game/art imports it: grep). Full suite (6 shards, on 322f4ac9): 2,472 pass + stageQuality "generating a stage is quick" (p90 789 ms with 6 shards on one CPU; alone: pass), 2 todo, 0 other fail. tsc clean.
