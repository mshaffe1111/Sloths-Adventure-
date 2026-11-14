# ART-678 handover (t-art-678), for the next art session. All CPU, no new Hugging Face spend. Read hf-art.md §10 + this.
**In the repo:** 25 cuts in `src/assets/w1-678/` (lossless WebP, 3 px per game unit, colour zeroed under clear px; NOT catalogued, NOT
placed): w16-vinesnake-hang/-slide/-liana/-hiss (snake-37); w17-moss-carpet/-patch/-liana/-fork (moss-37), w17-moss-drape (moss-11, hand
box); w17-snag-a/-b (snag-23); w18-palmnut/-cannonball/-cannonball-split/-nut-cracked/-squirreltracks (nuts-53); w1-underlayer-a
(under-11, 1792x522) and -b (under-53); w1-livepost-short/-mid/-tall (post-53); w17-harpy-perchfeet-ahead/-blink/-down/-turn (edits of
the s2 set). Sizes per piece: the cutter's sizes.json logic (tools/art/hf678/cutsheet.py + picks*.json hold every take, point, unit).
The stride-legged harpy cuts (the lead FAILED them for a perch) are in reference/art/hf678/rejected/. All 40 raw takes (q95 WebP) are in
`reference/art/hf678/raw/` so a re-pick or re-cut costs nothing; contact sheets in reference/qa-reports/ART-678/ (takes/stills-sheet,
takes/edits-sheet, cuts-sheet = the FIRST cut, perch-sheet). The lead PASSED the picks (snake-37, moss-37, snag-23, nuts-53, post-53,
perch-feet harpy). Cut locally with the same scripts: copy tools/art/hfprops/cut.py beside cutsheet.py as hfcut.py (cutprops' layout).
## The lead's FAILS to fix next (in this order)
1. Underlayer: cuts-sheet shows the failed first cut (key_own kept a magenta strip). The shipped w1-underlayer-a/-b are the re-cut
   (key_top: only magenta joined to the top edge goes clear). Show the band tiled 3x side by side under a real 1-1 upright frame (today's
   frame: origin/t-polish-3 reference/qa-reports/POLISH-3/stills/1-1-L1-normal-upright-x26000-after.jpg; the empty fog is ~y 1440-1660
   of 1830). It does NOT tile yet: close its wrap with tools/art/hflist1/wrapfix.py (alpha rule in hf-art.md) and measure the join.
2. Moss drape: the shipped drape (moss-11 box) has no tree, but its twig is cut square at both ends: soften/round the ends. The lead
   also wants the moss-37 drape+little moss tree split into TWO pieces (raw moss-37; hand boxes).
3. perchfeet-ahead and -blink: the grey beak is keyed away on the grey ground (the Crocus lesson): re-cut beak-safe (protect the beak
   region from the key, or key by distance only from the border-connected grey).
4. Every cut has a soft dark halo outside its line (post-short's left edge, snake-hang): show each on a LIGHT backdrop and in a real
   game frame; despill (edges/defringe.py, hfbatch edgefix) until it's gone.
5. Beside-Pokey sheets at 89.1 (tools/art/hf1113/beside.py <out> <piece>:<units>:<label>), catalog rows (copy hf1113/rows.py's pattern:
   kind, layer, footing, worlds, scale vs Pokey) -> CATALOG-MASTER.csv -> `python3 tools/art/catalog_master.py --emit` -> full Checks.
Also open: the snake reads olive-green more than vine-brown at phone size (judge beside Pokey); w1NutPod at 40 u was not compared.
## Lessons (own misses)
- Clock misread TWICE (11:58 written at 11:38; the sandbox started ~3 min after a "5 min" promise): run `TZ=America/New_York date`
  before every time written; a window given is a promise.
- Two Qwen pipelines do not fit one rtx-pro-6000 (OOM): never start a parallel model; queue it (the download did overlap usefully).
- key_own is for pieces on a key; an opaque band needs key_top. Pieces that touch merge into one blob even with "well spaced" asked:
  check the blob boxes and use hand boxes. A grey-beaked bird on a grey start loses its beak: start creatures on magenta.
- Each 95 KB cat costs ~600 tokens of the member's context: give the copies to a helper agent from the start (it did 161 in 4 min).
