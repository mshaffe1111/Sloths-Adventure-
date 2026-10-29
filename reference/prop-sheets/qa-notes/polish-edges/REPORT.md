# polish-edges: clean backdrop edges (VI-1, VI-5, VI-6, with VI-18 for World 4)

Branch `polish-edges`. It is built on A1's seamless strips (`polish-a1` merged in, then the work branch). Only image files and scripts
in `tools/art/edges/` changed, plus a header note in `tools/art/upscale/up.py`. No drawing code changed.

## Method (`tools/art/edges/`, README row in `tools/README.md`)

`run_all.py` rebuilds every cut-out strip from a source pinned in git, so it gives the same files every time. For each file:

1. **Source.**
   - Worlds 1-4, 6, 7 and 10: the 1024 px originals from before 18bedcc.
   - Worlds 8-9: Matt's 2800 px strips at 9f2dbfe.
   - World 1 canopy (w1c, 31c243f) and World 5 (8c1f0ab, and 1baf7ca for night): cleaned at their own size.
2. **One-off fix.** `unpanel.py` runs on w5dusk2-near only (see VI-6 below).
3. **A1's seamless join** (`scripts/strip-seamless.py`, the lead's order: seamless first), run in memory and kept lossless. The
   output widths match A1's to within 1 px, and the join contact sheet is `joins-all.jpg`.
4. **`defringe.py`, the edge fix:**
   - Trusted colour = opaque paint more than 1.5 source px from the cut (3 px on the 2048 strips cleaned in place). Thin features
     keep their own colour: runs of 12 px or more and under 2 px wide (4 px on the 2048 strips).
   - The trusted colour is bled 16 px out with a normalised Gaussian fill (sigma 1, 2, 4, then 8 px). This also un-premultiplies:
     the stored colour of half-see-through pixels is replaced.
   - Colour and alpha are each enlarged 4x with Real-ESRGAN anime 6B, then scaled to the output size (2x, or the same size for
     W8/W9). There is no longer any black next to the edge to smear in, and the silhouette comes out as smooth curves instead of
     Lanczos stair-steps.
   - Alpha eroded 1 px and feathered about 1.2 px. Features under 4 px wide (8 px on the 2048 strips) keep their alpha, so hair
     vines and lianas survive.
   - **Ink line**: an even 1.6 px line at 0.42x the local colour, on everything except World 5 (which keeps its own line).
5. **VI-5, W1 canopy** (`--unmix 252,252,252 --unveil 3`): the white key is taken back out of the half-see-through edge pixels
   (paint = (stored - (1 - a) x white) / a). Key-coloured opaque pixels at the cut go, except on lianas: those are painted pale
   grey-green on purpose. The leftover key specks and faint veils in the sky are cleared.
6. **VI-6, World 5** (`--keep-line --despill`):
   - World 5's dark edge is **its own clean, even ink line** (Gemini's cartoon style; the orchids and trunks have it inside too).
     It is not pipeline damage. Stripping it made the orchids fuzzy and grey (tried; `crops/` has the World 5 sets). So it is kept,
     and the rest of the treatment is minimal.
   - Magenta spill at the cut: red and blue are clamped to green plus 12 over what the paint just inside has. Real pinks (orchids,
     the dusk haze) are as pink inside as at the edge, so they pass untouched.
   - The black under the cut, which lossy WebP smears into the edge, is replaced by bled paint.
   - Faint specks are not cleared on World 5: its cobwebs are faint strands on purpose.
   - **w5dusk2-near's pink panel** (the lead's catch): Gemini painted background trees and a sunset sky down both sides of the
     green key (raw `w5g-dusk-near-11` on HF). The first cut only faded their tops out, so the panel hung over the middle and far
     layers. `unpanel.py` cuts everything above a hand-drawn ground line that is background (regions reaching the faded top, and
     ink-closed regions of trunk purple or sky salmon). It keeps the orchids, buds, falling petals, moss, the log and the ribbons.
     One stemless white orchid would have floated, so it goes too.
7. **VI-18, World 4**: saturation +12% with warmer highlights (luminance kept). `--grade` does this on w4-mid, and `grade.py` does it
   on the three far strips (w4-far, w4mist-far, w4terraces-far, from A1's seamless versions).

## Ink line or no ink line: recommendation

**Ink line, and it is what ships.** The painting's own linework (leaf veins, trunk lines) is ink, and the 1024 originals already had
a 1 px painted rim. The no-ink take measures 0.99-1.04 (the target), but at phone size its leaves blur into the sky next to the crisp
inner lines and read as out of focus. Compare `ink-vs-clean/` and `crops/w1-*.jpg`.

The ink take's "rim" number is 0.6 on purpose. What matters is that the line is even: the share of pixels darker than 0.7x the paint
inside, measured 1, 2, 3 and 4 px in, goes from blotchy (about 0.5 0.8 0.5 0.15: some outer pixels dark, others light, dark again
further in, which is the sticker smear) to one even ring (1.0 1.0 0.45 0.06).

To switch to the no-ink take: `python3 -I tools/art/edges/run_all.py --clean`.

## Per-file table

`crops/edges.md`: 34 files.
- **Before** = A1's seamless strips (3a1247a), which still carried the old dark ring.
- **Columns**:
  - rim / outer px brightness;
  - dark share at 1-4 px;
  - the same after;
  - the no-ink take's rim (built for w1-mid, w1-near, w2-near, w7-near, w10-mid and both canopy strips);
  - magenta spill before and after;
  - size;
  - dimensions.
- **Spill**: 0.0-0.1% on every file after, from up to 2.0% on the A1 versions (the review measured 2.6-4.4% on the originals;
  5.4% on w5twi1-mid in mine).
- **Sizes**: every file is the same size or smaller; the largest is 247 KB.
- **Dimensions**: the same as A1's, within 1 px.

## Proof

All paths are under `reference/prop-sheets/qa-notes/polish-edges/`.

- `crops/<set>-up.jpg` (390x844) and `crops/<set>-side.jpg` (844x390): before on the left, after on the right, for all 17 sets.
  Each is drawn the way the game layers it (far, mid, near) and cropped where the most cut edge is, at phone magnification.
- `ingame/<stage>-up.jpg` / `-side.jpg`: the real game at phone size, A1's branch (before) against this branch (after), for 1-1, 1-8
  (canopy), 2-1, 4-1, 5-1, 5-5 (dusk B), 5-7 (twilight), 6-2, 7-1 and 8-1. The `-3x.jpg` files are the same shots at the phone's
  full 3x resolution, top of the backdrop only.
- `joins-all.jpg`: every mid and near strip tiled against itself around A1's join (the red tick). After the edge fix there is no
  visible seam.
- `ink-vs-clean/`: W1 and W1 canopy, ink against no ink.

## Polish check (STAGE-RULES §5b)

1. **Painted, not drawn: pass.** Nothing new is drawn in code. The ink line is applied in the image files and follows the
   painting's own linework (`crops/w1-up.jpg`).
2. **Nothing copy-pasted: pass.** A1's joins survive the edge fix (`joins-all.jpg`). The edge fix adds no tiling.
3. **Art matches what it is: pass, with one rough spot named.** The canopy lianas stay lianas: they are now read as pale painted
   vines, no longer punched through by the white-key cleanup (`ink-vs-clean/w1c-mid.jpg`). w5dusk2-near's background panel is
   gone, so the middle layer's trunk and orchids show where the panel covered them (`crops/w5dusk2-side.jpg`).
   - **Rough spot, named:** at w5dusk2-near's join, the rising log ends in a fairly abrupt point behind a fern leaf (`joins-all.jpg`,
     w5dusk2-near tile). It reads as the log's end at phone size. Fixing it properly needs the strip re-cut or re-painted.
4. **Light fits the place: pass.** World 4 is warmer and less grey (`crops/w4-side.jpg`). Night and dusk sets are unchanged in light.
5. **Pokey on model: not affected.**
6. **Framing: not affected.** The layer heights are unchanged.
7. **Text: not affected.**
8. **Every move it teaches: not affected.**
9. **Moments: not affected.**
10. **Motion: not affected.** The files are the same size (within 1 px), so parallax is unchanged.

## Seen but not mine

- **8-1 (and other stages):** a hard horizontal line near the top of the backdrop, in both before and after (`ingame/8-1-up.jpg`,
  y about 115 of 844). It is a layer's top edge, so it belongs to the drawing code (A1) or VI-2/VI-18 "visible strip edges".
- **The canopy lianas** are now visible as pale vines, where before they read as thin dark cracks. That matches the painting, but
  it is a visible change on 1-4 and 1-8.

## Checks

- `npx tsc --noEmit -p .` passes.
- `npx vite build` passes, with nothing over 4 MiB.
- The full suite: see the lead's report.
