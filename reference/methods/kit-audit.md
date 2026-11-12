**Every art piece gets a world fit (Matt, 11-11 3:11 AM ET, a standing rule for all art going forward): "you need to determine where they work the best. Some of these may work in multiple worlds... That's universal for all art going forward."** Every cut piece, from any batch, is tagged with every world it fits, best first, each with a one-line reason by material and mood, and each catalogue carries a "By world" section. Batches already cut without it are re-tagged.

# Method: a kit audit (art director)

Use it to measure every world's art against one checklist (first run: reference/art/KIT-AUDIT.md, 2026-11-06).

1. Read the kit atlases first (`src/game/kitAtlasData.ts`, `protoAtlasData.ts`, `proto2AtlasData.ts`) and montage the sheets: count
   real kinds per job (two slots holding one picture count as one).
2. Shoot real frames: `npm install --no-save --legacy-peer-deps` once, then
   `node tools/art/kitaudit/shoot.mjs <outDir> 1-2,1-5,... [port]` (two runs in parallel on different ports; ~20 s a still).
   Sideways 844x390 at 20/50/80% along the stage, upright 390x844 at 50%, dsf 1, designed roll, lessons off.
3. `python3 tools/art/kitaudit/sheet.py <outDir> <sheetDir> <stages...>`; look at every sheet; crop and zoom every suspect spot
   before writing a verdict about it.
4. Judge each world on the same lines (KIT-AUDIT.md "The checklist"); "not seen" counts as a fail for the floor.
5. Game-wide findings first, then per world, then the fix order: free code fixes, then Gemini (free), then Hugging Face (lead's OK).

Known artefact: Pokey hangs slightly above the ground in pinned stills (the pin runs before the physics step). Next improvement: pin
after the step, and shoot two rolls per stage.
