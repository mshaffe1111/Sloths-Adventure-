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
