# FEEL-CAM plan (R-165.214, second half), written 6:46 PM ET, branch t-feel-cam from origin/t-feel-vine (b3b0eaf)
1. MEASURE on the real page first: tools/inspect/camFeel.mjs (new) logs e.camera x/y every 1/30 s frame through grab, vault, field
   step, leap catch and getting off, upright 390x844 and sideways 844x390, on 1-4 and one other world's climbing stage; flags every
   frame the view moves more than the eye reads as a cut, and names which camera rule moved it (anchor, landing look, HUD hold, lift).
2. Fix at the root for every stage: the camera's anchor eases into and out of a climb (a damped follow), never a one-frame re-pick;
   cameraFollow.test.ts stays whole; Pokey stays inside the safe band. Planted test first (red without the fix).
3. BEFORE/AFTER sheets + clips both ways; full CLAUDE.md Checks on the head; merge t-feel-vine's final head when its REPORT lands.
## WRITE files
- src/game/cameraFollow.ts, src/game/cameraFollow.test.ts (token: free per the packet)
- NEW: src/game/camClimb.test.ts (if the planted test needs its own file), tools/inspect/camFeel.mjs, reference/qa-reports/FEEL-CAM/**
- src/game/engine.ts updateCamera (~6107-6268) ONLY if the fix cannot live in cameraFollow.ts: I ask the lead first.
