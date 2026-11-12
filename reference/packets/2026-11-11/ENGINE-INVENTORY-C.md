# TASK INV-C (R-165.104 part C: the engine reads the inventory)   to: Engine   model: claude-opus-5-5   effort: medium   due: dispatch + 2 h
Matt, 11-11: "it all needs to be inventoried and placed in a way that the engine has easy access to it." Built on: the passed master
catalog (t-art-catalog-a@e51a7563, Critic PASS); replaced this sprint by: nothing (D40). No stage changes; nothing wired into a stage
(C2 does that when 1-1 is ready to finish).
## First
`git fetch origin ccr-ca657d3c-n09zty t-art-catalog-a t-engine-chunks`. Read reference/roles/ENGINE.md, reference/LAWS.md,
reference/LESSONS.md (D37-D40), the catalog's CATALOG-MASTER.md and tools/art/catalog_master.py on t-art-catalog-a.
## Build (branch t-engine-inventory from origin/t-art-catalog-a)
1. `python3 tools/art/catalog_master.py --emit` writes src/game/art/inventory.json from CATALOG-MASTER.csv (never hand-edited; the
   columns the engine needs only: id, file, frame, world_best, worlds, kind, layer, engine_slot, w, h, walk_y, walk_x0, walk_x1,
   float_class, made_thing, status). Fix the one stale cite the Critic named: ground/w6#fills0 -> groundPaint.ts:139-140.
2. src/game/art/inventory.ts: typed rows, loaded lazily (a dynamic import, never in the main JS chunk); queries: byId, byWorld(w,
   {layer, slot, minW, maxW, standable, includeMade}), bySlot, gaps(world) (slots with fewer than 3 usable pieces). Made things are
   never returned for World 1 unless includeMade.
3. src/game/art/inventory.test.ts: every row's file exists; footing inside the image; made things never W1-best; three queries checked
   against the CSV (e.g. byWorld(1,{layer:'platform',standable:true}) count); gaps(1) printed.
## Done (the Critic checks each)
tsc clean; the new test green; full suite green; lock 102/102 unchanged (lockall vs main); `npx vite build` shows inventory in its own
chunk and the main chunk unchanged (bytes before/after); knowncheck, roadmapcheck. Push, ls-remote, REPORT.md (7 sections, 30 lines),
then send the Critic session_01FhBbYLf7h9oQ8XQVjujSjj the head directly for its audit of done-items, and ONE line to the lead
(session_01FhBbYMoqqEdVR3qFjTCugy). Stop.
