# PF-1 measurements (polish-pf1, 2026-10-29)

Stand-in: Playwright Chromium, software raster (--disable-gpu), 390x844 (upright) / 844x390 (sideways) at devicePixelRatio 3 (the game caps it at 2: 780x1688 canvas), CPU throttled 4x. Frame = update + draw + raster flush, ms. 12 stages x 4-7 spots each (start, flags 1-4, a climb, a swing, a dark stretch), 20 frames per spot. Before = ccr 8bdd9f4, after = the same plus PF-1. Runs sequential, not overlapping.

## Upright
| stage | median before → after | p90 before → after | longest before → after | median saved |
|---|---|---|---|---|
| 1-1 | 293 → 150 | 348 → 178 | 624 → 551 | 49% |
| 1-4 | 296 → 164 | 341 → 195 | 368 → 344 | 45% |
| 1-6 | 300 → 158 | 356 → 188 | 762 → 229 | 47% |
| 2-3 | 305 → 164 | 345 → 197 | 496 → 238 | 46% |
| 3-5 | 323 → 183 | 377 → 216 | 461 → 254 | 43% |
| 4-3 | 315 → 184 | 367 → 220 | 805 → 261 | 41% |
| 5-2 | 374 → 226 | 422 → 275 | 906 → 378 | 40% |
| 6-2 | 297 → 175 | 348 → 216 | 609 → 646 | 41% |
| 7-2 | 263 → 122 | 304 → 155 | 990 → 888 | 54% |
| 8-2 | 301 → 171 | 355 → 213 | 486 → 255 | 43% |
| 3-10 | 223 → 132 | 270 → 161 | 776 → 208 | 41% |
| 5-10 | 175 → 96 | 197 → 113 | 390 → 310 | 45% |

section, mean ms per frame across stages, before → after:
  o.front       53.0 → 4.5
  o.vig         51.1 → 18.8
  s.sky         38.0 → 3.3
  worldobj      33.7 → 32.6
  s.midnear     33.5 → 33.3
  s.far         16.8 → 16.3
  s.pool        13.2 → 5.1
  protoScene     9.9 → 9.6
  water          8.6 → 8.1
  o.life         6.0 → 5.4
  items          5.8 → 5.7
  veils          5.2 → 5.2
  s.grade        5.0 → 4.8
  s.mist         3.2 → 1.3

## Sideways
| stage | median before → after | p90 before → after | longest before → after | median saved |
|---|---|---|---|---|
| 1-1 | 326 → 196 | 399 → 224 | 550 → 423 | 40% |
| 1-4 | 313 → 183 | 387 → 228 | 443 → 563 | 42% |
| 1-6 | 304 → 188 | 355 → 221 | 842 → 545 | 38% |
| 2-3 | 326 → 198 | 367 → 228 | 797 → 289 | 39% |
| 3-5 | 344 → 216 | 398 → 249 | 1034 → 304 | 37% |
| 4-3 | 336 → 212 | 383 → 246 | 428 → 516 | 37% |
| 5-2 | 396 → 271 | 444 → 305 | 1152 → 350 | 31% |
| 6-2 | 348 → 197 | 385 → 225 | 834 → 477 | 43% |
| 7-2 | 284 → 151 | 313 → 189 | 343 → 515 | 47% |
| 8-2 | 325 → 195 | 399 → 239 | 458 → 446 | 40% |
| 3-10 | 257 → 183 | 298 → 221 | 470 → 587 | 29% |
| 5-10 | 177 → 119 | 200 → 144 | 255 → 320 | 33% |

section, mean ms per frame across stages, before → after:
  o.vig         50.4 → 18.9
  worldobj      46.3 → 44.7
  s.midnear     40.8 → 38.6
  s.sky         36.2 → 2.7
  o.front       32.9 → 3.1
  s.far         19.4 → 18.5
  s.pool        18.5 → 6.8
  protoScene    12.7 → 12.1
  water         10.0 → 10.1
  o.life         8.9 → 8.6
  items          6.5 → 6.3
  s.grade        5.4 → 4.5
  veils          4.9 → 4.6
  midprops       4.6 → 4.6

Longest frame: single spikes at random points in both runs (GC / scheduling in the throttled container), not reproducible per stage.

## Look unchanged (look-before-after.webp)

The same frame drawn twice in one page, PF-1 off then on (a temporary debug switch, not shipped), 134 frames: 12 stages, both
orientations, every spot. Worst difference 6 colour levels out of 255 on under 0.3% of pixels (soft gradients: vignette, mist, the
dark veil), invisible at phone size. The one frame that differed more (5-10 climb) differs from itself on a redraw (an animation).

## Why iPhones are slow upright even at the lightest quality (tester logs + call counts)

- Tester logs (QA sheet, 5 iPhone sessions 2026-10-28): slow spells are steady 42-47 ms frames and stay slow at q2 (dpr 1, a quarter of
  the pixels). The cost is per call, not per pixel.
- Canvas calls per frame (counted on every 2D context): 1-1 about 980, 5-2 about 3,300, 8-2 about 2,600, 3-10 about 4,100. Nearly all
  are vector path calls (quadraticCurveTo, lineTo, beginPath, fill), plus 10-20 new gradients per frame. No getImageData, no filters,
  at most one shadowBlur per frame. On iOS Safari each canvas call crosses into the GPU process, so this cost does not shrink with
  resolution.
- Who makes the path calls (per frame): 1-1 snake skin 138, ground bands (groundTiles paintBands) 103, water 67, ground body 63,
  grass 50, painted-leaf sprites 48, hollow logs 40; 5-2 World 5 `leaf` 1,083 and `orb` 840 (w5Art); 8-2 ground-edge ferns (fernFrond
  via paintDecorAt / envPlants) 1,410, night-sky stars 280 (removed by PF-1's sky fix); 3-10 the Prowler lair: glowcap 731, cave floor
  596, bands 534, rope 438, root pillars 412. All of it is procedural art drawn again from paths every frame.
- React: the HUD's distance share changed every frame he moved, so the whole App re-rendered about 0.66 times per frame while running.
  PF-1 rounds it to 1/400 (under a pixel on the trail): about 0.10 per frame.
