# ART-UNDER: World 2's painted earth underside (t-art-under)

Status: takes IN, sheets sent to the lead for the pick. NOT cut into the sheet yet (waits on the pick, packet step 4).

## Spend
One sandbox 6b01e811efaf5e14f4b631ad (rtx-pro-6000, --forward-hf-token, timeout 32m set at the $1.50 cap). SPEND_LINE

## Takes (reference/art/hfunder/takes/, every one pulled + committed as its piece landed, D98)
- spec-under (40 steps): under0 x4, corner s11/s23. REJECTED: the overhang painted NAVY/blue-black (my prompt said "cool deep
  shadow"), top too orange. Run stopped after corner s23; kept for the record.
- spec-under2 (30 steps, "warm dark earthy brown, never blue"; neg blue/navy/purple): warmu0, warmc, warmu1, warmu2, 4 each.
- Sheets: reference/art/hfunder/sheet-<piece>.jpg: raw take | the SHIP CUT at game size (strip 512 wide, tiled twice, hanging from
  W2's own fill; corner 200x300) beside Pokey's 89 px, light (day) and dark (dusk). Numbers on each row.
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

## EXACT NEXT STEP
1. Lead picks one take per strip (warmu0/1/2) and one corner (warmc). 2. For each pick:
   `python3 -I tools/art/hfunder/cut.py reference/art/hfunder/takes/<p>/<p>-s<N>.webp reference/art/hfunder/cut/<id>.png strip --match --shade=0.60`
   (corner: `corner`). 3. `python3 -I tools/art/hfunder/pack.py cut/under0.png cut/under1.png cut/under2.png cut/undercorner.png`
   (writes w2.webp + groundAtlasData "2": unders + underCorner). 4. Catalogue rows w2#under0..2 + w2#undercorner in
   reference/art/CATALOG-MASTER.csv (copy w2#lip0's row shape: World 2, layer platform-underside, footing none, ship size, engine use
   'ground underside' / 'underside corner', used_in 'none (not placed)' until ENG-GROUND-b lands), then `catalog_master.py --emit`.
5. Gates: artcheck, the art tests, groundSeams.test.ts (its stub says 2944 tall: check it still passes), tsc. 6. Shoot 2-7 on a scratch
   merge with origin/t-eng-ground. Trap: hfground/pack.py and packfill.py rewrite the sheet: re-run hfunder/pack.py after them.

## Lessons applied
D57/D87 (queue read at every step and push), D97 (no approval waits), D98 (per-piece pulls), D102 (sheets downscaled, numbers first),
D105, D109 (no clock times to the lead). Learned: "cool shadow" in a prompt paints blue; ask for "darker, warm brown, never blue".
A per-column lift streaks: smooth the edge. A key flood misses pockets closed in by roots: key flat grey too.
