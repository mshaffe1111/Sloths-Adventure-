# ART-REED-28 REPORT: 2-8's reed island (the cage beat, READY-28 ruling L3; R-165.476). Branch t-art-28 (cut from t-build-28-wip f5dae1de8)
Art, Opus 5.5 high. Packet: reference/packets/2026-11-26/ART-REED-28.md on ccr-ea739a2f-dfcee4. Lead approved the list and the pick.

## Done-items
1. LIST (sent first, approved): reuse check: w2-new#reed-isle-a/b are too small (147/263 cut px of top), the w2-new atlas's dark-outline
   hand, domed (flat 0.095): no reuse. Spec: ~340 world px level stand line (3.8 Pokey), ~45 px over the water, mud sides cut by the water,
   reeds at the ends/back, middle clear; platform, grounded. PASS.
2. JOB: Qwen-Image-Edit-2511, ONE sandbox, img2img from paste-ups of World 2's own w2#bank (cap + soil) and w2-props reeds
   (tools/art/hfreed28/starts.py, spec-reed28.json, spec-reed28b.json, run.sh). Round 1: isleA/isleW x 4 seeds = 8 (all box-shaped: the
   model keeps the paste-up's silhouette); round 2 in the same sandbox: a rounded-mound start, isleC/isleD x 2 = 4. 12 takes in
   reference/art/hfreed28/takes/. Pick isleC-s23 (lead approved). PASS.
3. CUT at Pokey's scale: reference/art/hfreed28/cut/reed-isle-28.webp (+ .png), 720x385 at 2 cut px a world px; walk line y 215, x 19-699
   = 340 world px = 3.8 Pokey (drawn 89.1); reeds to 107 px above the line; wet foot faded out 45-85 px under the top (tools/art/hfreed28/
   catalog.py). Row w2-reed28#reed-isle-28 in CATALOG-MASTER (world 2 best, 6 second; layer platform; grounded; ship 385 px) and
   src/game/art/inventory/w2.json via catalog_master.py --emit. artcheck PASS (scans src/assets; the cut is 720 px, under 4096). PASS.
4. STILLS at 2x on the real 2-8 frame (this branch's head, hand build): reference/qa-reports/ART-REED-28/reed28-on-island-upright-2x.jpg
   and -sideways-2x.jpg (tools/art/hfreed28/stills.mjs). Pokey dropped onto the real island solid by the engine's physics (grounded), the
   cage beside it; upright sent first; the lead judged both. PASS.

## Gates (scoped, law 5: inventory JSON + one test count changed; no drawing, screen or stage code)
tsc 0. Unit suite 3 shards: 4211 pass, 1 fail, 3 todo; the 1 fail is KID_RUNS_59 (firstTimerBot.test.ts:177, actual [8,9,7,7,4,7] vs [3,5,6,7,6,5]), identical to BUILD-28's run on this base f5dae1de8 = the release line's R-165.473, not this branch. Art tests 16/16. Build (BASE_PATH=/Sloths-Adventure-/) 0 + chunkcheck PASS. artcheck PASS, knowncheck PASS,
generalitycheck PASS, roadmapcheck PASS, timecheck PASS (clone unshallowed). Not run (nothing they read changed): drawcheck, clipcheck,
paintcheck, kbdcheck, buildcheck, seedlist, tierBots; they run on the integration head.
inventory.test.ts: the unpacked-cut-piece count 218 -> 219 (this piece; each art batch moves it; BUILD-28 moves it back when it packs it).

## Polish check (the stills)
- Level grass top reads as standable; his feet sit on it (upright and sideways). Reeds only at the two ends, behind the line; he is clear.
- Mossy shoulders and soil bands match the banks beside it (same paint, same light). No grey halo: cut keyed from the flat grey.
- First shot showed the foot's grey water gloss as a pale slab: FIXED by the foot fade (sideways still).
- Named, not mine: the soil column under the island in the stills is the hand build's moss_stone solid, which BUILD-28 replaces.
- Not wired, so the stills draw the cut over the frame (draw order = overlay's); the solid there is 275 wide, the piece 340.

## HF spend
~$0.87 (12 takes, sandbox 5:47:04-6:06:03 PM ET by date, terminated after the last pull) of the $3 cap; HF-SPEND row 11-26.
Balance ~$37.9 from the packet's ~$38.8.

## Method used / Lessons applied / Method update
Method: hf-art.md (paste-up starts, one sandbox, pull per piece), hf-props.md step 6 (stills beside Pokey, DSF 2).
Lessons: D41 (Pokey 89.1 drawn), reuse first (inventory), D65 (judged on the real water it sits on), D30/D42 (times from date),
D36 (own worktree, ls-remote = HEAD), D57 (queue read at each step), D59 (no gate left running at hand-over).
Method update (proposed for hf-art.md "Pitfalls"): (1) Qwen edit keeps the paste-up's outline almost exactly: draw the final SILHOUETTE
into the start (round 1 lost 8 takes to a box start). (2) Never bake water into a piece that stands in moving water: fade its foot.
(3) Stills of an unwired cut: drop Pokey onto the solid by physics; a grounded player has y = the solid's top, so pinning y = top - height
floats him 48 px (first two stills were wrong this way).
Own miss: I first started the three test shards with a shell '&' inside one background command (the brief forbids it); stopped it within a
minute, killed the children, re-ran as three tracked background commands.

## Learned / Suggestions
- BUILD-28-c: copy the webp into a World 2 props sheet (hf-props.md), draw it at the island solid with its top = walk_y, then the row's
  file/status/used_in change and inventory.test.ts goes back to 218.
