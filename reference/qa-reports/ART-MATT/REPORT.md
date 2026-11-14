# ART-MATT REPORT (t-art-matt from t-art-678b@a93e335), 2:08 AM ET 11-14. R-165.230. HF: 1 sandbox, ~4 min, ~$0.18 of the $1.00 cap.
**Done (5/5; nothing wired). Sheets: reference/qa-reports/ART-MATT/ (each prints piece, ship px, units, Pokeys; frames say what the game BUILT):**
1. Size: each 1024 px sheet upscaled WHOLE 4x (anime6b, CPU, opaque so no edge smear), pods' HF takes too; every piece cut from
   1115-2469 px of paint and shipped DOWN to 3 px/unit (tools/art/hfmatt/sizes.json: src_px, scale <= 0.48, crisp=true for all 19).
2. Sheet 3 (1-1 pits), src/assets/w1-matt/: w1m-pit-floor 300x54 u (0.61 Pokey; walk line y16, flat), w1m-pit-boulder 95x64 u (0.72;
   flat bottom), w1m-pit-lip-l / -r 126x140 u (walk y36/37). pit-assembly.jpg: 300 u gap, floor 130 u down (SOFT_FLOOR), Pokey and the
   boulder on the lip walk lines. Edges: border flood, line kept, no halo at 3x on light/dark (checked).
3. Sheet 1 (1-4 tie): sawn log cleared by bark hue (W1 no made things), coils kept as the wrap. taut/strain/snap on ONE 146x324 canvas,
   anchor (78,277) = knot centre on the bough centre line, sized for a 22 u bough (drawGate thick 16-26) -> 49x108 u (1.21 Pokey).
   w1m-leaf-lid 240x59 u, log stubs cleared, stretch 0.8-1.25x.
4. Sheet 2: w1m-dust-puff 38x50 u (soft alpha from white), w1m-bark-chips 34x50 u + 7 single chips (-1..-7) for a burst. PASS.
   Pods: Matt's pod + a 9 px dark ring on magenta (podstarts.py) -> img2img, style LoRA 1.0, 8 takes (s55/s68 x seeds 11/23).
   Pick: s68 seed 11 (ridged husk, stripes, bold line; least garlic): w1m-pod-hang 30x44 u, w1m-pod-fall 35x40 u (drawPod POD_H 0.45 Pokey).
   Alt s68-23 shown in sheet2 (reads more garlic); all 8 in reference/art/hfmatt/raw/pods-all8.jpg.
5. 19 rows: tools/art/hfmatt/rows.py -> catalog-rows-hfmatt.csv -> CATALOG-MASTER.csv -> catalog_master.py --emit. 3 family slots
   (pit pieces, fig gate tie, falling pod) each >= 3 pieces. Scale verdicts: boulder y, ties y; terrain/lid/danger look no verdict by rule.
**Gates:** artcheck PASS, knowncheck PASS, tsc 0, src/game/art tests 10/10, roadmapcheck PASS (needed --unshallow), generality PASS.
**Polish check:** light/dark rows and 3x edge zooms clean; real frames 1-1/1-4 (Normal, layout 1, dsf 2, zoom read from the game).
Rough spots named: (a) Pokey's pin leaves him in a fall pose above the bough in the frames (scale still true: his drawn 89.1 u);
(b) the tie loop stands 108 u, taller than Pokey: right for its bough, the lead may want it smaller (one scale on all 3 states);
(c) a lip's outer edge is the sheet edge (straight) and its bottom floats: the bank and the deep band must cover both when wired;
(d) the dust is faint on light ground (fine on W1 greens).
**Pushback:** none. **Unresolved:** nothing wired; ant walk sheet (sheet 4) not sent by Matt yet.
**Suggestions:** Engine packet: wire pits (R-165.226: floor stretched to the gap, lips at the banks, boulder only on a walk line),
tie states + lid on the gate bough (R-165.212), pods + dust/chips telegraph (R-165.227); frame.mjs can shoot its stills.
**Lessons applied:** D41 (89.1), D61 (rough spots named, not passed), D62 (frames label built stage/difficulty from the game), D64, D57, D52.
**Method update (hf-art.md "Getting files back"):** an hf_sandbox_fs cat result over the token cap is saved to tool-results/ unread:
pull base64 parts that way (no context cost); the sandbox port URL is blocked. Cutting white sheets: upscale the whole opaque sheet first.
**Turnover:** reference/handoffs/art-director.md §0f rewritten (this commit).
**EXACT NEXT STEP:** the lead judges sheet3-pits.jpg, pit-assembly.jpg, sheet1-tie-lid.jpg, sheet2-pods-dust.jpg (pick or alt pod);
then an Engine packet wires them (Suggestions).
## Learned
A white sheet cuts best upscaled whole while still opaque; a made thing under a natural one (the sawn log) comes off by its own hue,
keeping only the line that touches the vine. Align animation states on a measured anchor (the log), never on the bounding box.
