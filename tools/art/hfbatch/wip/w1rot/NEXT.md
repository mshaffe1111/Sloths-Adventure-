# W1 rotten wood (a ground breakable): WIP, paused 2026-11-05 12:44 PM ET (Matt put the day on the core engine; resumes next week)

R-id: none yet (the lead to assign: W1 rotten wood, approved 2026-11-05).
Done: starts (../../rotwoodstarts.py, starts/w1rot/), spec (../../make_rotwood_spec.py, spec-hfb-rotwood-1.json), one HF job
hfb-w1rot-r1 6aecbeb80e0338d1bb8097f2 (17:36:56Z-17:39:01Z, ~2.1 min, ~$0.10): 8 takes in takes/ and sheet-r1-0.jpg (full PNGs in the
bucket mshaffe111/w5-xfer hfbatch/w1rot/props/). Picked (not yet judged on a stage): the pair whole-s65-5 / creak-s65-5 (one seed so
whole and creak line up). Cut by ../../rotwoodcut.py into w1-rotwood.webp + w1-rotwood-frames.json here: rotWood, rotWoodCreak,
rotSnapL, rotSnapR (protoArt.ts drawBranchArt's whole / creak / snapped halves; the halves are the creak take split down its split).
Known rough spots to judge: the creak take has two blue-grey mud blobs under it that the whole one lacks (they pop in at the creak);
the snapped ends are near-vertical cuts with splinters; drawBranchArt clamps a log to 54 px tall, which squashes this 2.9:1 frame on
a wide crossing (as it does the kit branch).
Stage for the stills: 1-5's ground crossing, the fragile log at x 45461 (w 315, y 930) between its banks; rot15bare-*.png are the
real game there with the old log hidden (tools/art/hfbatch: shot with the engine paused, Pokey at x 45860).
Next: composite rotWoodCreak (and whole, snapped) on rot15bare at drawBranchArt's size, upright and sideways, with Pokey for scale and
both banks it rests on; the key-hue gate (keyscan.py --write --image); every gate; jobs.txt; move the sheet to src/assets/props/ only
when engine-render wires it (artUse.test.ts); push art-w1-rotwood.
