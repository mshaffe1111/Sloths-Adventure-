# polish-edges: clean backdrop edges (VI-1, VI-5, VI-6, with VI-18 for World 4)

Branch `polish-edges`. Merged in: `polish-a1` (seamless strips), the work branch, and `hf-art-backdrops` (native-resolution strips).
Only image files and `tools/art/edges/` changed, plus a header note in `tools/art/upscale/up.py`. No drawing code changed.
`src/assets/backdrops-hd/` is folded into `src/assets/backdrops/` and deleted, as the lead asked.

## What ships, per strip

| Strips | Source | Treatment |
|---|---|---|
| w1-w10 near and mid (except World 5's mood sets) | Matt's native-resolution strips, `hf-art-backdrops` cd71d17 (already joined: no seamless pass) | Edge fix in place, ink line scaled to the resolution (`--px 2.5` near, `1.9` mid). World 5's gold set (w5) keeps its own line. w4-mid is also graded (VI-18). |
| w1c (canopy) | 31c243f, 2048 | A1's join, then the white halo un-mixed (VI-5), leftover key cleared from the sky, ink line |
| w5gold2, w5dusk1/2, w5twi1/2, w5night | 8c1f0ab / 1baf7ca, 2048 | A1's join, then the magenta spill clamped (VI-6) and the black under the cut replaced; their own ink line kept. w5dusk2-near: unkeyed background panels cut out first (`unpanel.py`) |
| w4-far, w4mist-far, w4terraces-far | A1's seamless strips, 3a1247a | VI-18 grade only (`grade.py`): saturation +12%, highlights warmed |

`python3 -I tools/art/edges/run_all.py` rebuilds all of them from those pinned sources (`--only` for single files). Each future strip
goes through it: add a row to `RECIPES`. The 2048 route for the old strips (1024 originals at 18bedcc^ through Real-ESRGAN, then
A1's join) is still in the script's notes, but the native-resolution strips replaced it.

## Method (`tools/art/edges/defringe.py`)

1. **Trusted colour.** Opaque paint more than a ring in from the cut: 1.5 px at the 1024 originals, 3 px on 2048 strips, 6 px on
   native near strips, 4.5 px on native mids. Thin features (hair vines, twigs) keep their own colour.
2. **Bleed.** The trusted colour is bled 16 px out with a normalised Gaussian fill (sigma 1, 2, 4, 8). This replaces the stored
   colour of the dark ring and of every half-see-through pixel, so it also un-premultiplies.
3. **Enlarging.** Only for the old 1024 route: Real-ESRGAN on colour and alpha separately, with no black left to smear in.
4. **Alpha.** Eroded 1 px and feathered about 1.2 px. Thin features keep their alpha, so vines survive. The width counted as thin
   scales with the strip's resolution, so the outline doesn't step where protected edges meet eroded ones.
5. **Ink line.** An even line, 1.6 px at the 2048 scale (4 px on a native near), at 0.42x the local colour. It is left off
   see-through strokes (World 2's water ripples): it fades out where the paint around is mostly half see-through. Reeds and
   cattails keep it.
6. **W1 canopy (VI-5).**
   - The white key is un-mixed: paint = (stored - (1 - a) x white) / a.
   - Key-white opaque pixels at the cut go. Lianas don't: they are painted pale grey-green on purpose.
   - Specks and faint veils of key are cleared from the sky.
7. **World 5 (VI-6).**
   - At the cut, red and blue are clamped to green + 12 over the paint just inside. Real pinks (orchids, the dusk haze) pass
     untouched.
   - World 5's dark edge is its own clean ink line, Gemini's cartoon style, not damage. Stripping it made the orchids fuzzy and grey
     (tried), so it is kept.
   - The faint cobwebs are kept.
8. **w5dusk2-near (the lead's catch).**
   - Gemini painted background trees and a sunset sky down both sides of the green key (raw `w5g-dusk-near-11`). The first cut only
     faded their tops out.
   - `unpanel.py` cuts what is background above a hand-drawn ground line: regions reaching the faded top, and ink-closed regions of
     trunk purple or sky salmon.
   - It keeps orchids, buds, falling petals, moss, the log and the ribbons. One white orchid whose stem was background would have
     floated, so it goes too.

## Ink line or none: recommendation

**Ink line, and it ships.** The paintings are inked inside (veins, bark), and Matt's strips already had a painted rim. The no-ink take
measures on target (0.98-1.01 on the native strips: `crops/edges.md`, no-ink column), but at phone size its leaves blur into the sky
next to the crisp inner lines (`ink-vs-clean/`).

The ink take's "rim" reads about 0.45 on purpose. What changes is evenness: the share of edge pixels darker than 0.7x the paint
inside, measured 1, 2, 3 and 4 px in.
- **Before:** blotchy, the sticker smear. For example w1-near HD measures 0.72 0.80 0.66 0.40.
- **After:** one even ring. w1-near measures 0.98-1.00 across its line (4 px wide on a native near), and the mids 0.86-1.00.

To ship the no-ink take instead: `run_all.py --clean`.

## Per-file table

- `crops/edges.md` covers all 34 strips against A1's strips: what the game had before this branch.
- `crops-hd/edges.md` covers 5 worlds against the raw native-resolution strips.
- Magenta spill is 0.0-0.1% after on every file, from up to 2.0%.
- Every file is under 400 KB, the largest 394 KB (w2-near). No asset is over 4 MiB.
- The native strips keep their own dimensions (near 1736 tall, mid 1302); the 2048 ones keep A1's.

## Proof

All paths are under `reference/prop-sheets/qa-notes/polish-edges/`.

- `crops-hd/w1-*.jpg`, `w2`, `w4`, `w7`, `w8`, each `-up` (390x844) and `-side` (844x390): the raw native strips (left) against
  this branch (right). These are the before/after phone crops the lead asked for.
- `crops/<set>-up.jpg` / `-side.jpg`: all 17 sets against A1's strips. Each is drawn as the game layers it and cropped where the
  most cut edge is, at phone magnification.
- `ingame/<stage>-up.jpg` / `-side.jpg` (phone size) and `-3x.jpg` (the phone's full resolution, top of the backdrop): this commit
  against the same commit with A1's strips swapped back in. Stages: 1-1, 1-8 (canopy), 2-1, 4-1, 5-1, 5-5 (dusk B), 5-7, 6-2, 7-1
  and 8-1. The soil and props can differ between the two because the game rolls its dressing per play; only the strips differ in
  the build.
- `joins-all.jpg`: every mid and near strip tiled against itself around its join (red tick). No seam on any.
- `ink-vs-clean/`: native w1, w2, w8 and w10 strips and the W1 canopy, no ink against ink.

## Polish check (STAGE-RULES §5b)

1. **Painted, not drawn: pass.** Nothing new is drawn in code. The ink line lives in the image files, follows the painting's own
   linework, and is left off the water (`ink-vs-clean/w1-near.jpg`, `crops-hd/w2-side.jpg`).
2. **Nothing copy-pasted: pass.** Every join is still seamless after the fix (`joins-all.jpg`).
3. **Art matches what it is: pass, with one rough spot named.**
   - Canopy lianas stay whole (`ink-vs-clean/w1c-mid.jpg`).
   - w5dusk2's background panel is gone, so the middle layer shows where it hung (`crops/w5dusk2-side.jpg`).
   - **Rough spot:** at w5dusk2-near's join, the rising log ends in a fairly abrupt point behind a fern leaf (`joins-all.jpg`). At
     phone size it reads as the log's end. A real fix is a re-cut or repaint of that strip.
4. **Light fits the place: pass.** World 4 is warmer and less grey (`crops-hd/w4-side.jpg`). Night and dusk keep their light.
5. **Pokey and the cast:** not affected.
6. **Framing:** not affected by me. The native strips' layer heights are the HD helper's change.
7. **Text:** not affected.
8. **Every move it teaches:** not affected.
9. **Moments:** not affected.
10. **Motion:** not affected.

## Seen but not mine

- **A hard horizontal line near the top of the backdrop on 8-1** (`ingame/8-1-up.jpg`, about y 115 of 844, upright), in both
  before and after. It's a layer's top edge: drawing code or the VI-2/VI-18 "visible strip edges".
- **The canopy lianas** now read as pale painted vines, where they used to look like thin dark cracks (1-4, 1-8).

## Checks

- `npx tsc --noEmit -p .`
- The full suite passes: 1665 tests, 0 failures (1 known TODO).
- `npx vite build`, with nothing over 4 MiB.
