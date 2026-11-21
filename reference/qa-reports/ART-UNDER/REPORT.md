# ART-UNDER: World 2's painted earth underside (t-art-under)

Status: DONE to the packet's step 4. The lead's picks (under0 warmu0 s11, under1 warmu1 s11, under2 warmu2 s11, corner warmc s41)
cut, packed into src/assets/ground/w2.webp (2048x3256), groundAtlasData '2' unders + underCorner, catalogued. NOT placed: ENG-GROUND-c.

## Spend
One sandbox 6b01e811efaf5e14f4b631ad (rtx-pro-6000, --forward-hf-token, timeout 32m at the cap): 25.8 min creation to terminate, **~$1.18** of $1.50. Balance ~$40.07. HF-SPEND row in.

## Takes (reference/art/hfunder/takes/, every one pulled + committed as its piece landed, D98)
- spec-under (40 steps): under0 x4, corner s11/s23. REJECTED: the overhang painted NAVY/blue-black (my prompt said "cool deep
  shadow"), top too orange. Run stopped after corner s23; kept for the record.
- spec-under2 (30 steps, "warm dark earthy brown, never blue"; neg blue/navy/purple): warmu0, warmc, warmu1, warmu2, 4 each.
- Sheets: reference/art/hfunder/sheet-<piece>.jpg: raw take | the SHIP CUT at game size (strip 512 wide, tiled twice, hanging from
  W2's own fill; corner 200x300) beside Pokey's 89 px, light (day) and dark (dusk). Numbers on each row.
- FRAME EDGE (reject before the pick): warmu2 s37 (bottom 1.0%), s41 (1.2%): roots run off the frame. Pickable: warmu0 x4,
  warmu1 x4, warmu2 s11/s23, warmc x4.
- Corner: s23/s37 carry a dark stone dome at the rim that reads like a cave mouth (from my start); s11 and s41 are clean.

## The cut (tools/art/hfunder/cut.py, what the sheets show)
`cut.py <take> <out> strip|corner --match --shade=0.60`: key from the bottom (corner: bottom + right), grey under the edge and flat
grey pockets keyed, loose bits dropped, rim un-mixed; --match = per-channel gain to the fill's mean (top 140,101,69 -> 143,103,70);
--shade lifts the overhang band from ~0.33 to 0.55-0.63 of the top (the order: 55-65%) on a smoothed edge, chroma at 0.4 of the lift,
roots untouched; wrap closed (hf-art.md 11-11 alpha rule): wrap 2.5-4.2 (bar < 6). Top feathered 20 px (it lies over the bank's fill);
corner top + left feathered. Strip comes out 1024 x 293 (roots reach past 256): the hook reads each frame's own h, so 293 is kept.
`edge` (soil's ragged edge, mean share of height): strips ~0.60-0.62, corner ~0.69-0.70.

## Engine (the lead's rulings)
- `edge` = the soil edge's mean (accepted). The underside is drawn INSIDE the soil clip on t-eng-ground: ENG-GROUND-b draws it after
  the restore (the lead).
- The hook names no corner id: I use `w2#undercorner`, groundAtlasData `underCorner` {x,y,w,h,edge,cx} (the lead to confirm).
- Sheet grows 2048x2944 -> 2048x3216 (strips stacked at x 0 from y 2368, 4 px apart; corner at 1408,2208): decoded 23.0 -> 25.1 MiB.

## Packed (tools/art/hfunder/pack.py; cuts in reference/art/hfunder/cut/)
- unders: w2#under0 (0,2368 1024x293 edge 0.6169), w2#under1 (0,2665 1024x293 edge 0.6146), w2#under2 (0,2962 1024x293 edge 0.6229);
  underCorner w2#undercorner (1408,2208 384x576 edge 0.7002 cx 0.8262). Shade 0.58-0.62, wrap 1.9-4.6. GroundSheet gains optional
  `unders?`/`underCorner?`. Sheet 239.8 -> 349.0 KB, decoded 23.0 -> 25.4 MiB; re-encode (q82, as pack.py) left the old frames at
  PSNR fills 47.0, lips 37.4-37.8, end 34.3 dB, alpha unchanged.
- Rows: CATALOG-MASTER.csv (part UNDER, after w2#end0; layer decor mid, footing none, float hangs, used_in 'none (not placed)'), emitted.

## Gates
tsc PASS; art tests + groundSeams 24/24; ground*/protoArt* tests 13/13; artcheck PASS; knowncheck PASS; generalitycheck PASS;
vite build (BASE_PATH) + chunkcheck PASS. roadmapcheck FAIL: "shallow clone, proofs cannot be checked" (this checkout's depth, not
this change). NOT run (context line): the full suite, drawcheck, clipcheck, the CI five: the critic or CI runs them.

## EXACT NEXT STEP
ENG-GROUND-c wires it (draw after the soil restore so the roots hang; mirror underCorner for a left end) and shoots 2-7 day and dusk on a
scratch merge of t-art-under + t-eng-ground. Trap: hfground/pack.py or packfill.py rewrite w2.webp: re-run hfunder/pack.py with the cuts.

## Lessons applied
D57/D87 (queue read at every step and push), D97 (no approval waits), D98 (per-piece pulls), D102 (sheets downscaled, numbers first),
D105, D109 (no clock times to the lead). Learned: "cool shadow" in a prompt paints blue; ask for "darker, warm brown, never blue".
A per-column lift streaks: smooth the edge. A key flood misses pockets closed in by roots: key flat grey too.
