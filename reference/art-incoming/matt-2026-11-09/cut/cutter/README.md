# The cutter for Matt's 11-09 sheets

The 27-sheet cutter from art-raw-2026-11-07 (cut/cutter/), reused, with three changes:
1. `cut.py` globs `artraw/*/*-sheet-*` (was `W*`), so the sheets go in as `artraw/M/M-sheet-01.jpg` ... and ids come out `M-01-a`.
2. `cut.py` removes Matt's printed labels by itself: it finds glyph-sized low-chroma blobs on the ground, groups 4 or more into a text
   line, and clears the low-chroma pixels in each padded line box (green or brown art in the box survives). Config keys:
   `glyphchroma`, `labelchroma` (M-05's brighter magenta needs 75/65), `labelbox` (a manual box, used for M-09's "Giant Ceiba Tree").
3. Two one-piece fixes, run after the cut: `fadefix.py` (M-05-a: the trunk top Matt faded into the ground becomes a real
   transparent fade) and `floorfix.py` (M-11-b: the ground-coloured floor shadow under the arch becomes a grey see-through shadow).
Per-sheet keys in `config.json` (speckkill/keyall/pocketc on M-06, M-09, M-11, M-12) are the old cutter's, as used on W2-04/05.

Run (scipy goes in pylib/: `pip install --target ROOT/pylib scipy`): lay out ROOT/artraw/M/, ROOT/cutcode/ (these files), then
`python3 cutcode/cut.py ROOT`, `python3 cutcode/fadefix.py ROOT`, `python3 cutcode/floorfix.py ROOT`,
`python3 cutcode/mbuild.py ROOT <this cut folder> <repo>/src/assets/w1-1109`, and `python3 cutcode/pinkscan.py ROOT 'M-*'`
(the edge count must be 0 on every kept piece). `mtable.py` holds each piece's label, kind, world, float class and notes.
`keylib.py` and `walk.py` are unchanged from the 27-sheet cutter.
