# REPORT (attempt 2): ART-CAT part A (cut pieces not yet in the game) and the merge, art director, 2026-11-11

## 1. What was built
- `tools/art/catalog_master.py`: `--cut` builds part A from sources 1-3 (it extracts origin/art-raw-2026-11-07 and origin/art-director
  itself); `--merge` joins A with `catalog-game-B1..B4.csv` into `CATALOG-MASTER.csv/.md` and fails on any row with no world, no engine
  slot, no layer, a made thing tagged W1, a standable row without footing or ship_px, or an image under src/assets with no row.
- `reference/art/CATALOG-MASTER.csv/.md` (the merge, section 6), `reference/art/catalog-cut.csv` (363 rows, the packet's columns plus `notes`), `holds-rejects.csv` (9), `catalog-cut-sizes.json`,
  `master-sheets/` (62 sheets, one per world and layer, plus `1-1-best12.jpg`).

## 2. Counts (sources minus overlap)
- 1 art-raw 11-07: 91 kept. 2 art-director manifest: 111 = 89 A rows + 18 in 1-1's atlas (B1's rows, skipped here) + 4 holds.
- 3 matt-11-09: 54 kept + 4 rejected; matt-11-11: 54 + 1; matt-11-11b: 45; hf-list1: 16. 2b the 14 W1-tinted twins on art-director (e8061008: walls, caps, feet,
  earth ledges, ground chunk; base footing holds). A total: 363 rows, 9 held/rejected.

## 3. Re-tagging the older two batches (by looking, not copying W1/W2)
All 180 older pieces were looked at on six contact sheets at play size. 38 of the ones tagged W1 lost W1: sawn ring-top stumps and
logs, plank-topped "earth ledges" (all five w1-ledge-* have a wooden board on top, zoomed), rope-lashed posts and frames, the cut-stone
stair block (lead 11-11: no made things, no saws in the home forest). 105 A rows are made things, none tagged W1. Best fits for the old batches
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
- 66 rows need a fix (60 before; the other 6 are the W1 tints of the five board-topped ledges and the ground chunk's ledge twins that
  cannot be W1). Attempt 2: every source-3 row re-read by eye for made things; 12 more set made (M-01-c, M-04-a/b/c/d, M-06-b/c/d
  carved or built; N-02-f, N-05-c squared stone; N-01-d, N-03-c hand-stacked cairns).

## 6. The merge (A + B1-B4) and what is open
- Attempt 2 merge against B1 6a4a6d2d, B2 9c9751e8, B3 040a1561, B4 50640eb5: 9,364 rows, 0 check failures, images under src/assets
  covered 903/903 (A 363, B1 812, B2 3,531, B3 200, B4 4,458; 83 boss and pokey-jar frames kept once).
- B2/B4 clashes on the boss atlases and pokey-jar kept once (characters/enemies/UI to B4, set pieces and hazards to B2).
- The W1 made-things table (26 rows) carries Matt's 11-11 ruling: SWAP 5 (1-1 planks a/b/c, w1-stump-wide, trail post), STAY 10
  (gate shut/open, two puzzle doors, six keepsakes), Matt's call 11 (hollow log, perch, trunk, wood stump, toucan, fallen log,
  checkpoint flag x2, jungle sign, rope tile and post).
- App size: only the in-build saving, as an estimate: 94.1 MB now, about 71.7 MB at ship_px, about 22.4 MB saved (area shares, not
  re-encoded; not-imported and no-stage rows left out).
- Critic item 3 (ground/w*#fills cite groundPaint.ts:219): those are B2's rows; B2 is re-reading its code-sourced slots.

## 7. Rules kept
Nothing under src/ changed; no art placed, cut or generated; no Hugging Face job; no tester text.
