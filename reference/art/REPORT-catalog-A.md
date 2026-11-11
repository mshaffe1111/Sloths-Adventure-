# REPORT: ART-CAT part A (cut pieces not yet in the game) and the merge, art director, 2026-11-11

## 1. What was built
- `tools/art/catalog_master.py`: `--cut` builds part A from sources 1-3 (it extracts origin/art-raw-2026-11-07 and origin/art-director
  itself); `--merge` joins A with `catalog-game-B1..B4.csv` into `CATALOG-MASTER.csv/.md` and fails on any row with no world, no engine
  slot, no layer, a made thing tagged W1, or a standable row without footing or ship_px.
- `reference/art/CATALOG-MASTER.csv/.md` (the merge, section 6), `reference/art/catalog-cut.csv` (349 rows, the packet's columns plus `notes`), `holds-rejects.csv` (9), `catalog-cut-sizes.json`,
  `master-sheets/` (62 sheets, one per world and layer, plus `1-1-best12.jpg`).

## 2. Counts (sources minus overlap)
- 1 art-raw 11-07: 91 kept. 2 art-director manifest: 111 = 89 A rows + 18 in 1-1's atlas (B1's rows, skipped here) + 4 holds.
- 3 matt-11-09: 54 kept + 4 rejected; matt-11-11: 54 + 1; matt-11-11b: 45; hf-list1: 16. A total: 349 rows, 9 held/rejected.

## 3. Re-tagging the older two batches (by looking, not copying W1/W2)
All 180 older pieces were looked at on six contact sheets at play size. 38 of the ones tagged W1 lost W1: sawn ring-top stumps and
logs, plank-topped "earth ledges" (all five w1-ledge-* have a wooden board on top, zoomed), rope-lashed posts and frames, the cut-stone
stair block (lead 11-11: no made things, no saws in the home forest). 88 rows are made things; none is W1. Best fits for the old batches
now: W1 77, W2 48, W3 28, W8 6, W10 6, W5 5, W6 4, W4 3, W7 2, W9 1. Spot-check of 20 (one per family): CATALOG-MASTER.md.

## 4. Engine columns
engine_slot is the catalog-map.json cat/arr key the piece can fill, plus w1CutArt.ts pickCut's kind and size window for stones,
stumps and logs, or "new slot: ..." (ground band strip, pit lip pair, step set piece, one-piece wall, lava hazard, scaffold).
Footing: from the cut catalogs or footing.json where measured; otherwise measured here (flattest long top line) and marked "by hand"
when under 50% flat. on_screen_px: standable pieces drawn so the stand span is a typical platform width (cutBox's rule); ship_px =
min(own size, 2 x on screen). A's 349 pieces: 180.8 MB as cut PNGs, 20.6 MB as full-size WebP, 6.0 MB as WebP at ship_px.

## 5. Polish check (looked at every sheet named here, dark and light halves)
- w01-platform, w01-step, w01-danger-look, w02-platform, w07-step, 1-1-best12: footing lines sit on the drawn tops.
- Found and set "needs fix": P-07-d's pink glow reads as key fringe on dark; M-04-d, N-02-c, M-05-a are three-quarter (not in their
  notes); M-14-a/b and M-15-a/b are squared sawn beams (made, not in their notes); W1-19-b, W1-20-c too twisted to stand on (dressing).
- 60 rows need a fix: 23 angled/three-quarter, 8 small P pieces with a 2000 px HF redo, 26 under 1.5x their play size, 3 other
  (M-04-b painted words, P-01-a tile seam, P-07-d pink glow).

## 6. The merge (A + B1-B4) and what is open
- CATALOG-MASTER.csv: 6,926 rows, 0 check failures. A 349, B1 812, B2 1,111, B3 200, B4 4,454; 83 B2/B4 clashes on the boss atlases
  and pokey-jar kept once (characters/enemies/UI to B4, set pieces and hazards to B2); no B row repeats an A file. 849 B4 rows are
  menu-only (worlds = "menu"), accepted as their place shown.
- 15 made things the game shows in W1 today are listed for the lead's call, not failed: 1-1's planks a/b/c and w1-stump-wide (both
  B1 and I read them as sawn boards), the trail post, W1's gate (shut/open), two puzzle-kit doors, six keepsake pickups.
- Shipped art at ship_px: 140.4 MB listed to 104.4 MB (saving 36.0 MB, B's per-frame shares). Gaps per world are in the .md.
- Open: B rows' own "needs fix" (198 across the table) are B's findings, carried as written.

## 7. Rules kept
Nothing under src/ changed; no art placed, cut or generated; no Hugging Face job; no tester text.
