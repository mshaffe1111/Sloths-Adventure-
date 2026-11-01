# hf-backdrops2: where it stands (2026-11-01, art helper, ~1:30 PM ET)

Branch `hf-backdrops2` (from `release-0.9.2`). HF spend today: **~$9.70 of the $35 cap** (log: `tools/art/hfbackdrops/jobs.txt`).
Contact sheets: `w<N>-before-after.jpg` here (upright 412x915 before/after rows, then sideways 915x412 before | after pairs).

## Done (in the game, checked)

1. **Rejects redone** (`tools/art/hfbackdrops/starts2.py`, round R): every W8 middle (w8sunset-mid, w8night-mid: canopy band trimmed,
   round crowns), W2 near x2 (w2rapids-near, w2evening-near: half-clear water dropped from the start, no pink), W4 terraces near and
   W6 dawn near (ragged overlapping joins, no notches), W3 sinkhole middle + near (no cut), W6 dawn and W9 dawn middles. All full width
   (2113 / 2902 px; `keyfull` + floating pieces dropped).
2. **Fixes**: crown tops on w1, w1c, w3, w6, w7, w1sunrise, w1kapok middles (repainted round, graded back to each old strip's colours:
   `matchold.py`); a new W5 gold middle (`w5-mid`, several different orchid trees); W2 evening middle haze 0.1; painted upright sky for
   w5twi2.
3. **New moods**, each a full set (far + sky + middle + near; far painted text to image, joined end to end, native pass):
   w1rain, w2mist, w3crystal (graded to night-cave light), w4storm, w6moon, w7court, w8dawn, w9ash, and for World 10 two rain-safe
   storms: w10gale (grey gale, rope bridge; graded darker) and w10storm (night thunderstorm). `FAR_BY_STAGE` alternates them so no two
   neighbouring stages share a set (test: `stageBackdrops.test.ts`); every world has 4 sets in play.

## Held back (named plainly)

- **w10night** (clear starry summit) and **w10after**: painted, unused. They wait for Matt's answer on whether World 10's rain ends.
- **9 upright skies** still missing: w1sunrise, w1kapok, w3sinkhole, w6dawn, w7, w7dawn, w7dusk, w5dusk2, w5twi1 (w10after too).
  Round S (tallstart starts at s48/s58) still left a straight line or a flat smoke slab where the sky meets the strip. They keep the
  cover fit, as before. The takes are in the bucket `hfbackdrops2/hfbd2-S0|S1/`.

## Upright skies: done (2:55 PM ET)

The 9 old far sets without an upright sky (w1kapok, w1sunrise, w3sinkhole, w5dusk2, w5twi1, w6dawn, w7, w7dawn, w7dusk) are
repainted far + sky together (round F5: text to image matching each old scene, 3 seeds; tallkey; native pass; tallsplit). No cut
line: the sky and the far strip come from one painting. Each far strip was widened from 1972 to 2160 px (a 9% horizontal stretch) to
keep the 2100 px minimum the test checks.
Depth, after/before: 1-1 1.26, 1-7 1.14, 3-4 0.89, 3-5 0.98, 6-1 0.99, 7-1 1.04, 7-4 0.88, 7-7 1.54, 5-4 1.14, 5-7 1.21.
Only w10after still has no upright sky. It is held anyway.

## Last round (2:10-2:45 PM ET, the lead's 2:03 review)

Times in this file before this section were written as UTC-4. Daylight saving ended on Nov 1, so subtract one more hour.

- **New absolute floor** (`tools/art/hfbackdrops/floor.py`), on the top 60% of the upright 412x915 frame:
  - luminance std >= 31: the lowest approved set, 8-8 (W8 dawn);
  - darkest 10% (p10) <= 73: the brightest approved set, the W7 courtyard.
  - The p10 check catches pale haze, which keeps its spread but has no dark shapes. 7-1 passed the ratio (1.04) but had p10 89.
  - Night and cave sets pass p10 easily but fail the std floor, and the lead approved them (8-7, 10-9). Judge those by p10 alone.
- **W7 dawn:** repainted (F7, 5 seeds; a dark carved-face tree and temple towers against a gold and rose sunrise).
  - 7-1: std 43.6, p10 52, ratio 1.26.
  - 7-3: std 42.9, p10 50, ratio 1.14.
- **W5 dusk2:** repainted (F7; dark trees and orchids under an orange and pink sunset). 5-4: std 44.2, p10 69, ratio 1.31.
- **Contrast pass** (depth.py far 1.22) on the light sets that failed p10:
  - now PASS: 1-2, 1-5, 1-7, 1-8, 1-9, 2-9, 4-2, 4-5, 7-7, 7-9.
  - still FAIL p10: 2-1 (86), 2-3 (80), 2-4 (79), 2-6 (64, but std 17), 2-7 (92), 4-8 (75).
    W2's upright frames are mostly its own pale water and sky. Passing them needs the W2 sets repainted with dark silhouettes, as F7 did.
- **W1 second middle variant** (`w1b-mid`, starts2.py remix, s78 seed 41) plays at 1-6 as its own set `w1b`: W1's far and sky, the new
  middle. 1-4 and 1-6 now show different trees. 1-4: std 44.0, p10 62. 1-6: std 45.7, p10 59.
- Unchanged sets failing the floor, not touched today: 5-1..5-3 (W5 gold), 5-5 (W5 dusk1).

## Exact next step
1. Repaint W2 mist, rapids and evening far + sky to the F7 standard (dark silhouettes, rich colour), then check floor.py on 2-1..2-9.
2. Hold the W5 gold and dusk1 far sets to the floor the same way.
3. w10night and w10after stay held until Matt answers on World 10's rain.
