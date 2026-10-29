# polish-edges: clean backdrop edges (VI-1, VI-5, VI-6) and upright no longer faded (X-16), with VI-18 for World 4

Branch `polish-edges`, built on the latest work branch. Merged in: `polish-a1` (seamless strips) and `hf-art-backdrops` (Matt's native
near and mid strips). `src/assets/backdrops-hd/` is folded in and deleted.

## 1. The edge fix, redone after the lead's review (it had softened the paintings)

`tools/art/edges/defringe.py --band 4`, run by `run_all.py` (native strips) and `hdset_in.py` (the new native mood and canopy strips).

- **Inside the painting: untouched.** Only pixels within 4 px of an alpha edge may change. Every pixel deeper in, and every thin feature
  (vines), is the source's own, byte for byte. The alpha is the source's own: no erode, so leaf tips don't bead. Encoded at WebP q95.
  - Proof: `diffmask/<strip>.jpg` shows changed pixels in red, along the outlines only.
  - `diffmask/interior.txt`: interior changed 0.01-0.31% (WebP noise) on all 20 native strips. w4-mid is 3.4% because of its VI-18
    grade, which changes its colours everywhere on purpose.
- **In the band.** The smeared sticker ring is replaced by the paint just inside, then an even line at 0.42x the local colour.
  - Where the painting's own outline is darker and crisper, it is kept: per pixel, the darker of the two wins. This keeps w2's rock
    line.
  - No line on see-through strokes such as water ripples.
- **Strips that were already clean are left exactly as painted.** A strip counts as clean when under half of its outer 2 px is darker
  than 0.7x the paint inside. That is w8-near, which the earlier pass had made noisier.
- **2x crops:** `zoom2x/` covers 10 strips, before and after at 2x zoom. Inner lines, petals and vines match. The outline goes from
  blotchy to one even line.
- **Evenness:** the share of pixels darker than 0.7x the paint inside, at 1 and 2 px in. For example, w1-near goes from 0.72/0.80
  (blotchy) to 1.00/1.00 (one line).
- **VI-5 (W1 canopy white halo) and VI-6 (World 5 magenta spill):** as before, now on their native repaints. Spill is 0.0-0.1%.
- **w5dusk2-near's background panels:** cut out (`unpanel.py`).

## 2. X-16: upright looked faded (Matt, 3:45 PM ET)

- **Code.**
  - Upright, the engine passes `stripVh`, the height sideways would show for the same width of world.
  - `renderScenery` draws the mid and near strips at that scale, on the same ground line. Sideways is unchanged.
  - The far strip has its painted sky above it (`<stem>-sky.webp`, `drawStrip`). Where no sky passed review, the far strip is drawn
    just large enough to reach the top of the view (`farScale`). On a phone that is about 1.2x the sideways size, against 1.76x when
    everything was fitted to the tall view. The drawn gradient never shows over a painted scene.
  - Middle strips whose top edge is solid paint, or cut off straight (w8), fade out over their top 7% (16% on w8). Upright that top is
    now on screen.
  - Per frame this adds one `drawImage` per strip copy when there is a sky. No gradients.
  - `farCoverTop()` is exported for PF-1's sky skip, so the placement math lives in one place (agreed with PF-1).
  - Tests: `sceneryStrip.test.ts` (ground line kept, sideways unchanged, sky and cover cases); the stage-backdrop size tests follow
    the native size.
- **Art, Matt's rule (no upscaling).** One batched HF job (`hdset.sh`):
  - All 34 far strips and the 14 World 5 mood and W1 canopy middle and near strips were repainted at native resolution, 1302 px (near
    1736 px), the same way as the HD near and mid strips: img2img at 0.25 with the style model, tiled round the strip so it stays
    seamless.
  - Then the sky was inpainted above each new native far strip, from the native strip itself.
  - **Skies kept: 18.** w1, w10, w10dusk, w2rapids, w3, w3cavern, w4, w4mist, w4terraces, w5, w5dusk1, w5gold2, w5night, w6dusk, w8,
    w8night, w8sunset, w9night.
  - **Skies held back: 16.** w1kapok, w1sunrise, w2, w2evening, w3sinkhole, w5dusk2, w5twi1, w5twi2, w6, w6dawn, w7, w7dawn, w7dusk,
    w9, w9dawn, w10after.
    - They stacked a second landscape above the strip, showed tile-panel ghosts, or went dark and streaky.
    - Two retry rounds didn't fix it: a plain start and a sky-only prompt painted frames and panels, and one painted a sloth.
    - These sets use the cover fit described above. That is the plain extension, and the reason it was chosen is that every AI take
      failed review.
- **Spend:** about $3.6 of the $8 X-16 budget (pilots $0.83, batch $2.27, two cancelled retries $0.46), logged in
  `tools/art/hfbatch/jobs.txt`.
- **In-game proof:** `x16/<stage>-up.jpg` (before and after upright) and `x16/<stage>-side.jpg` (before and after sideways), for 15
  stages covering every world plus the mood sets: 1-5, 1-8, 2-1, 3-1, 3-7, 4-5, 4-8, 5-1, 5-5, 6-5, 6-8, 7-1, 8-1, 9-1, 10-1.
  - Before is the work branch at aac019e1, after is this branch, with the same roll (layout 0).
- **Numbers:** `x16/colour.md`, measured over the backdrop band.

| | upright before | upright after | sideways before | sideways after |
|---|---|---|---|---|
| luma SD (contrast) | 37.2 | **44.2** | 47.1 | 48.1 |
| HSV saturation | 0.371 | 0.325 | 0.337 | 0.335 |

Contrast upright now sits close to sideways. HSV saturation reads lower upright after the change: the old upright crop was darker, and
HSV saturation balloons on dark pixels. The paired shots show the colour itself is not weaker. Sideways is unchanged, within noise.

## Polish check (STAGE-RULES §5b)

1. **Painted, not drawn: pass.**
   - Every new picture is painted on HF from the game's own strips.
   - Where no painted sky passed, the painted far strip covers the view. No drawn gradient shows over a painted scene (`x16/7-1-up.jpg`).
2. **Nothing copy-pasted: pass.** The native strips are tiled round their seam (A1's join is kept). The skies are inpainted round the
   strip as a circle.
3. **Art matches what it is: pass.**
   - The sky continues each strip's own light (`x16/8-1-up.jpg`, `x16/3-1-up.jpg`).
   - The w8 trees fade up into the moonlight instead of ending in a cut line.
4. **Light fits the place: pass.** Night and cave worlds stay dark (8-1, 3-7). World 4 is warmer.
5. **Pokey on model:** not affected.
6. **Framing works both ways: pass, improved.** Upright shows trees and banks at the sideways size instead of a 2.2x crop of mist
   (every `x16/*-up.jpg`).
7. **Text:** not affected.
8. **Every move it teaches:** not affected.
9. **Moments:** not affected.
10. **Motion:** the strips keep their parallax. Climbs: `yo` is computed at the strips' scale, and a far strip without a sky covers
   the view at any camera height.

## Rough spots, named

- **16 skies held back.** Those sets look right upright (cover fit) but don't have the taller painted sky. A clean retry needs a
  different method (a dedicated sky painted on its own, then joined), not more rounds of the same inpaint.
- **A faint soft band where the sky meets the far strip on some worlds** (5-1, 1-8 at the top). It's a smooth fade, not a cut, and
  sits under the HUD.
- **Unchanged from before:** w5dusk2-near's join (the log ends in an abrupt point), and 8-1's layer line under the HUD sideways, which
  belongs to the drawing code.

## Checks

- `npx tsc --noEmit -p .` passes.
- Full suite with every HF-ART-BRIEF glob: see the lead message.
- `npx vite build` passes, with nothing over 4 MiB. The largest backdrop is under 0.5 MiB.
