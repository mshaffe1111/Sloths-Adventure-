# POLISH-10 REPORT (t-polish-10 from t-int-8@0a9be28c; written 3:42 PM ET 11-14). Status: 2 of 3 items GREEN, item 2 and the ring NOT done.

## Done-items
1. **R-165.243 line: GREEN, fixed at the root for every world.** Not the backdrop art: a per-draw pixel trace at 1-1 roll A x11560
   (915x412 @2x, device row 342) named drawGroundChunks, then inside the 397 px ground square drawLip (groundPaint.ts). Lips 0/1 are
   packed right under the soil fills; the row above them is opaque soil in all 10 worlds; drawn to the frame edge, the filter pulled it
   in: one row of soil at alpha 95 across the square, 30-40 units above every bank, so a line straight across the backdrop on every stage
   with lips (all worlds; most visible over sky/haze). Fix: lipSrc() samples LIP_INSET=4 rows in from top and bottom (clear rows in
   W1-5/9/10, cut blade tips only in 6-8), each row drawn where it sat (art unmoved), full width kept (lips share their ends).
   Test: groundSeams.test.ts "every ground lip ... (R-165.243)", red before (planted), green after. Commit 8fcfef2e.
   Stills: reference/qa-reports/POLISH-10/line-1-1-x11560-rollA-side-before-after.jpg (line gone), 1-1-x11560-rollA-{side,up}-after.jpg.
   Line detector (rows darker than both neighbours over >8% width): before y342, after none.
3a. **R-165.237 canopy seam: GREEN for 1-4's canopy strip.** w1c-mid.webp's wrap was a straight cut through the canopy's underside and a
   vine, its end hazier than its start (INT-7b's "hazier left"). Re-joined with scripts/strip-seamless.py --force: join 4.7 -> 0.3
   (column step 0.7). Still: canopy-w1c-mid-join-before-after.jpg (two copies tiled as drawStrip tiles them, join mid-view). Commit b3d27f6e.
   Width 2113 -> 1815 (pitch follows the file; journalScenes' blurred crop of it shifts ~1%).

## Not done (named plainly)
- **Item 2, the bounce arrow (bounceArt.ts:134): NOT started.** Box spent on items 1/3a. Next: shoot the mushroom with and without the arrow
  (1-1 roll A x11560 is a bounce spot), upright+sideways; if the glow reads alone, delete the arrow draw; else a painted cue.
- **Item 3b, the flag's gold rim ring: NOT started.** Next: stills ring vs soft filled glow on 1-1/1-4/3-1 (RIM crop on t-int-7).
- **Other worlds' strip wraps** (same cause as 3a), ratio join/column step: w2mist-mid 22.8, w1kapok-mid 19.5 (1-7, 1-9), w1sunrise-mid
  15.2 (1-3), w8sunset-mid 15.0, w6dawn-mid 12.9, w1rain-mid 10.5 (1-2/1-5/1-8), w3sinkhole-mid 10.1, w6moon-mid 7.9, w1dusk-mid 7.5,
  w1-mid 6.4 (1-4). A forced re-join of w1-mid left floating branch bits: each needs a per-strip look, so not batch-run.
- drawcheck: running at report time (tools/perf/drawcheck.mjs); result in the message to the lead.

## Gates (scoped, LAWS 5): tsc 0; artcheck PASS; unit: groundSeams, bankCull, groundwork, sceneryStrip, stageBackdrops, stripInk,
   paintedKeep, w5Backdrop, journal tests 56/56 pass; drawcheck: see above.

## Polish check
- 1-1 roll A x11560 sideways + upright after: no line over sky/trees; lip, mushroom, bank unchanged. 1-4 canopy at (634,1300) sideways
  after: canopy band continuous. Not shot: 1-7 carpet spot after (same lip code path; the line detector should be run there by the next).

## Pushback: none on the packet. One note: "line across World 1's background art" was ground-lip code, all worlds.
## Suggestions (ready packets)
- STRIP-JOINS: re-join each strip above with strip-seamless.py --force, one at a time, stills of each join tiled; repaint (HF) any whose
  ends differ too much (w1-mid). Add a gate: join/column-step <= 3 for every w*-mid/near/far strip (a python check in tools/art).
- SHEET-GUTTER (Content): repack the ground sheets with a 4 px clear gutter between pieces, then LIP_INSET/FILL_INSET can drop.
## Method update (render-fix.md): to find a hairline, trace draws by one pixel's before/after (tools: /tmp scratch trace2/trace4 pattern,
   worth adding as tools/inspect/pixeltrace.mjs) instead of guessing layers; then measure the sheet rows around the piece's frame.
## Lessons applied: D19 (test calls the same drawLip the screen calls), D21/D43 (every world, no stage literal), RF2 0g (sheet edge rows).
## Turnover note: reference/handoffs/engine-core.md section 0t (this commit).
