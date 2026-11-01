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

## Exact next step

Upright skies for the 9 old far sets: two more tries failed today. First tallstart s48/s58 (S0/S1), then painted sky-only donors
(spec-K, `skydonor.py`, s30, S2). The real cause is the old far strips themselves: their trunks and crowns run off the top edge, so any
sky above them shows those cut off under a soft band. The fix is to repaint each of those far strips with its own sky, the way today's
11 new sets were made (`make_spec2.py F`-style text to image matching the old strip's scene, then `tallkey`, `hdspec`, `tallsplit`).
About $0.50 a set, about $5 for all 9, plus a check that the middle strips still sit right on the new far.

## Lead's review (2 PM ET), done
- W8 dawn, W10 gale and W2 misty dawn: far + sky repainted (round F4, 5 seeds each) with dark silhouettes and rich colour; middle strips
  at half haze (0.09) and darkened 15% for a value step.
- W1 sunrise far: contrast up (depth.py 1.3).
- W4 storm and W3 sinkhole: depth pass too.
- W1 middle repeat at 1-6: re-finished without the flat 7% top fade (TOPFADE=0), so its crowns are separate shapes again.
  The strip is still one 2113 px tile, so the same 3 trees repeat once per screen width sideways. A second crown variant needs a new
  take: not done.
- Luminance spread, top 60% upright, after/before (pass >= 0.8):
  - 1-1 1.16, 1-3 1.04, 1-4 1.03, 1-6 1.01;
  - 2-1 0.93, 2-3 0.90;
  - 3-4 0.85, 3-6 1.02;
  - 4-2 1.04, 4-5 0.83;
  - 8-1 1.48, 8-3 1.01, 8-8 0.99;
  - 10-2 1.23, 10-4 1.27, 10-6 2.08.
  - Still under 0.8: 3-8 (W3 crystal, a darker cave on purpose; the lead passed it) and 8-4. 8-4 is NOT a changed set: it plays the
    world's own set before and after. Its number moves with the lantern light around Pokey.

## Checks (2026-11-01, 2:05 PM ET)

- `npx tsc --noEmit -p .`: clean
- full test suite: 2153 tests, 2151 pass, 0 fail (+1 known `# TODO`, 4-3's boulder wall)
- `npx vite build`: OK, no asset over 4 MiB
- `artcheck`: PASS
- `drawcheck`: PASS (650 s)

Every changed strip is under 250 KB.

## Polish check (sheets `w<N>-before-after.jpg` here)

- **Seams:** none seen. The ends were joined at full width and the floating pieces dropped.
- **Bands:** the W8 canopy band is gone (w8 sheet, 8-1/8-3/8-5).
- **Notches:** none on the W4/W6 near strips (w4 4-1, w6 6-1). The W3 sinkhole cut is gone (w3 3-4).
- **Odd colours:**
  - fixed: W3 crystal had a day sky in a dark cave world, now graded to night-cave blue (w3 3-2/3-5/3-8);
  - fixed: no pink water on W2 (w2 2-4/2-6).
- **Flat or washed-out:**
  - fixed: W10 gale was pale grey, now graded into the storm light (w10 10-2/4/6);
  - fixed: W2 evening haze is down to 0.1;
  - still soft: W1 rain (1-2/1-5/1-8) is soft and misty on purpose, middle haze cut to 0.07; it still reads paler than its neighbours.
- **Pokey's readability:** he reads clearly in every after shot. The darkest stages (3-2, 3-5, 6-4, 8-4) keep the world's own darkness.
- **Known rough spots, not fixed:**
  - 9 sets still have no painted upright sky, as before (see Held back);
  - 1-4/1-6 crowns on the old W1 middle now read as broad flat-topped canopies (round, no cut).
