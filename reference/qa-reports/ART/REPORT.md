# ART attempt 3 report (t-art-1113, ART session; the lead's packet ART.md + HANDOVER.md). HEAD: see the last commit; gates below.
**Done (all cut, catalogued in CATALOG-MASTER.csv + inventory emitted; NOT wired: B14/B15 and the engine place them)**
1. 1-5 creek hurt floor `src/assets/props/pitwater/w15-creek.webp` (1344x392, 83 KB) + `.json` (surface row 92 = the floor line, bed #382933,
   1/3 unit a px). Take creek-53, join moved to the middle and repainted (creek8 band s45-9), feathered back: wraps (end step 2.0 vs
   ~1.7 between any two columns). Keeper's rules: white riffles and foam at stones, stones/pebble bed showing, no lily pads, no petals.
2. Oropendola flyer `src/assets/enemies/oropendola.webp` + `.json`: up-37 / mid-s1 / down-s2 registered on the blue cheek, cycle
   up-mid-down-mid at 8 fps, bill to tail 70 units.
3. Leafcutter ant `src/assets/enemies/leafcutter.webp` + `.json`: leafcutter-11 + two Qwen-Edit strides (antA-s1, antB-s2), cycle
   rest-A-rest-B at 8 fps, registered on its leaf, feet on one line; 26 units tall with the leaf (about 0.3 Pokey).
**Polish check** (reference/qa-reports/ART/): creek-tiles.jpg (6 takes x2 tiles: s50-5 had a join line in the key, rejected; creek-11's
stones poke through the surface and read as stepping stones, rejected); w15-creek-sideways.jpg / -upright.jpg (mock at game scale,
2 px a unit, Pokey 89.1 u, drifted 180 u so a tile join is in view: none shows). Fixed on my own look: at World 1's pit scale (0.41)
the stones drew Pokey-sized and the creek read as a river, now 3 px a unit; the pebble bank stopped on a hard line above the bed fill,
now fades into it. oropendola-strip.jpg: the up frame's black neck was speckled by the hue key, fixed (near-blacks neutralised before
keying). leafcutter-strip.jpg, beside-flyer-ant.jpg (both vs Pokey). Rough spots named: the orange sun glint repeats once a tile
(448 units); the down frame hides the bird's legs behind the wing (reads as a wingbeat); the ant is drawn far larger than life to read.
The mocks are art-only (not the engine), so no main merge before them (D23 covers in-game shots; B15's stills are the real check).
**Spend:** one sandbox 12:10-12:18 PM ET, ~$0.37; today ~$4.59 of the $15 cap (HF-SPEND.md).
**Gates on the head:** GATES
**Pushback:** the creek's surface row (92 px) sits under the spray; the engine should draw it like w1Creek.ts (top = floor - surface).
**Method used:** hf-art.md + HANDOVER's sandbox route. **Lessons applied:** D41 (Pokey 89.1 u for every scale), D16, D30 (times from
`date`), D53 (fast gates before pushes), art "judge the absolute floor". **Method update (proposed for hf-art.md):** a hurt-floor or
any tile whose sides are not key colour needs a top-only key (creekpack.py), key_own measures the border ring and fails there; near-black
paint takes a pink cast and the hue key holes it: neutralise <70 first (animpack.py); one chain file for img2img + edits ran 6+6 takes
in 8 min. rows.py reran would have doubled the dusk rows (filter fixed). **Learned:** mock the hurt floor at game scale BEFORE picking a
ship scale: the pit-water scale was wrong for a shallow creek. My miss: the flyer was cut before its sheet went to the lead.
