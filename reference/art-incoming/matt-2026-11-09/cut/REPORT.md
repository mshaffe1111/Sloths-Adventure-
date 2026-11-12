# REPORT: R-165.85 (cut only), Content, attempt 2 (delta), 2026-11-11
## Attempt 2: the critic's five items
1. Pink scan widened (r>g+45, b>g+25 within 8 px of the edge) and run on all pieces; new cutter/edgefix.py on every piece. M-07-d's
   spikes are gone. Edge count 0 on 49 of 54 kept; the 5 left are painted (Victoria rims M-02-a/M-03-a, lotus M-02-b/e, M-03-d), checked at 2x.
2. M-05-a bromeliad: magenta fringe gone (edge count 0); the bromeliad's own red is kept.
3. M-13-b walk line = flat crown y 3, x 355-604 (100% within 3 px). M-03-a to d "by hand". The same test applied to EVERY line:
   only M-13-b, M-14-a/b, M-15-a/b pass; 28 tops are "by hand" with their silhouette reading in the notes.
4. Six small pieces moved to kept (the lead's ruling); M-12-g stays rejected. Now 54 kept, 4 rejected, 31 MB total added.
5. M-09-a note: the root pockets are plain on light and faint on dark and jungle-green grounds.

## Attempt 1
(Kept here, not at the repo root, so the diff stays inside reference/ and src/assets/w1-1109/ as done-item 5 asks.)

## Method used
The 27-sheet cutter from art-raw-2026-11-07 (per-sheet border-median seed + local tile background), reused cold as the packet says:
sheets copied to artraw/M/M-sheet-NN.jpg, scipy into pylib/. Three changes, all in `cutter/` (README there): glob `artraw/*/`; an automatic
label remover (glyph blobs grouped into text lines, low-chroma pixels cleared in each line box); two one-piece overlay unmixes
(fadefix.py, floorfix.py). Then mbuild.py: 600 px rule, walk tops with the old `walk.py`, contact sheets, csv.
## Lessons applied
- art-director note trap 3: judged every cut on a dark AND a light ground; pinkscan edge count 0 on all kept pieces.
- trap 2: three-quarter-view blocks and the diagonal log are named as having no true side-on stand line.
- trap 6: looked at every cyan line; M-03-a's line (half the back rim) is named in its notes rather than trusted.

## 1. Done-items
1. Every piece on the 15 sheets is kept (48 PNGs, src/assets/w1-1109/) or in rejected/ with its reason (10). Counts per sheet in
   CATALOG.md "Per sheet" match the sheets (06's totems are 3 stones, 12 has 8 plants + 1 keyed-loose leaf). No label text: every
   piece's bottom looked at; M-09-a's leftover "Giant Ce" was found and removed. Pink: `pinkscan.py` 0 edge pixels on every kept piece.
2. catalog.csv + CATALOG.md: one row per cut with id, sheet, label (or "unlabelled"), kind (the packet's 11), size, walk top
   (y, x0-x1; "by hand" for the two step set pieces), world, float class, notes.
3. sheets/<kind>.jpg x11 + rejected.jpg, dark left / light right, cyan walk lines. All looked at full size (polish below).
4. CATALOG.md "Against the 91-piece catalogue's Still missing list": filled rocks (#3), W1 hide spots (#7), lily pads (#8); partly root
   steps (#2) and W1 hazards (#6); open pits (#1), mid stumps (#4), ground band (#5), W2 bridges etc.
5. Diff = reference/ + src/assets/w1-1109/ only; no file over 4 MiB; **added 30 MB** (27 MB PNGs + 3 MB reference); note rewritten.
## 2. Polish check
- Every kind sheet on both grounds: clean edges, no halo. Fixed on the way: labels merged into 20+ pieces (sheets 01, 04-11);
  M-05-a trunk top faded into magenta (now a real fade); M-11-b pink-red floor strip under the arch (now a grey see-through shadow);
  M-12 plants had magenta pockets between leaves (speckkill); M-09-a dark-red root pockets (most cleared).
- Still rough, named: M-09-a keeps a few small dark-red pockets deep between its roots (only visible on a light ground). M-05-a's
  faded trunk top is slightly mauve; lay foliage over it. M-14-a has a thin dark under-band (painted; reads as shadow).
- Cut, not fixed: M-12-f fern (its stems are painted magenta and key out with the ground; leaves hang loose) and M-02-c reeds (pink smear).
## 3. Pushback
- The 600 px rule rejects 7 clean pieces: the short log M-14-b (566), two of the three totems, four plants (546-580). At the game's
  draw size they are likely big enough; suggest the lead allow them at under 600 px rather than re-roll.
- cut.py's glob is `artraw/W*/`, so the packet's `artraw/M/` would not be found; widened to `artraw/*/` (in cutter/).
## 4. Suggestions
- Packet (Content, low): wordless crate and a second lever pose, on Matt's next picture list (FLAG M-04-b, M-04-d).
- Packet (Designer): decide M-06-e pitcher plants: real hazard, or banned from landings and paths.
## 5. Unresolved
- Nothing placed (by design). M-03-a's stand line and every three-quarter block's stand line are for the placer to set by hand.
## 6. Method update
Art cutting method should say: run the label remover and check every piece's bottom edge; painted fades and shadows in the ground's hue
are unmixed as an overlay, never erased by hue; never pipe the builder into head (a broken pipe skips contact sheets).
## 7. Turnover note
reference/handoffs/art-director.md rewritten in this commit (new §0, the 11-07 float ruling in §4, traps 12-15).
