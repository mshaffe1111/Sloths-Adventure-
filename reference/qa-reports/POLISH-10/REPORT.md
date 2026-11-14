# POLISH-10 REPORT (t-polish-10 from t-int-8@0a9be28c; written 3:42 PM ET 11-14). Status: items 1, 2 and 3a GREEN; 3b (flag ring) NOT done (ready packet below); drawcheck PASS.

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
   (column step 0.7). The lead's 3:52 check: a lone rock shard at the strip's bottom (cols 143-222, rows 1194-1276, in the old file too)
   floated at every repeat: removed from the original, then re-joined once (one lossy encode). Still: canopy-w1c-mid-join-before-after.jpg
   (two copies tiled as drawStrip tiles them, join mid-view; after: no shard, crown continuous).
   Width 2113 -> 1815 (pitch follows the file; journalScenes' blurred crop of it shifts ~1%).

2. **Bounce arrow: GREEN, dropped.** Stills both ways (bounce-arrow-with-vs-without-side.jpg, bounce-no-arrow-up.jpg): the flat white
   triangle read as a UI glyph over painted art; the glowing cap reads alone as the thing to use (and Dot teaches the first one). Removed
   from the painted cap (bounceArt.ts) AND its pair, the vector fallback cap (terrain.ts); comments in bounceArt.ts/platformPlan.ts updated.
   Not shot: the vector fallback's glow (it shows only before the sheet loads). Commits 97dbb994 + next.

## Not done (named plainly)
- **Item 3b, the flag's gold rim ring: NOT started.** It is drawAura(ctx, 'take', ...) at engine.ts drawWaterAndFlags (readable.ts).
  Next: stills ring vs a soft filled glow on 1-1/1-4/3-1 upright+sideways (RIM crop on t-int-7), the lead judges.
- **Other worlds' strip wraps** (same cause as 3a), ratio join/column step: w2mist-mid 22.8, w1kapok-mid 19.5 (1-7, 1-9), w1sunrise-mid
  15.2 (1-3), w8sunset-mid 15.0, w6dawn-mid 12.9, w1rain-mid 10.5 (1-2/1-5/1-8), w3sinkhole-mid 10.1, w6moon-mid 7.9, w1dusk-mid 7.5,
  w1-mid 6.4 (1-4). A forced re-join of w1-mid left floating branch bits: each needs a per-strip look, so not batch-run.
- drawcheck: PASS (522 s) on the final source (one 1-1 retry when the shard-free strip was copied in, then re-measured on it).

## Gates (scoped, LAWS 5): tsc 0; artcheck PASS; unit: groundSeams, bankCull, groundwork, sceneryStrip, stageBackdrops, stripInk,
   paintedKeep, w5Backdrop, journal 56/56; bounce/terrain/platformPlan 22/22; drawcheck PASS.

## Polish check
- 1-1 roll A x11560 sideways + upright after: no line over sky/trees; lip, mushroom, bank unchanged. 1-4 canopy at (634,1300) sideways
  after: canopy band continuous. Not shot: 1-7 carpet spot after (same lip code path; the line detector should be run there by the next).

## Pushback: none on the packet. One note: "line across World 1's background art" was ground-lip code, all worlds.
## Suggestions (ready packets)
- **FLAG-RING (R-165.237b), engine tier, ~1 h.** Objective: the unlit flag's gold rim stops reading as a hollow halo ring. Files: READ
  engine.ts drawWaterAndFlags (the drawAura(ctx, 'take', ...) call), readable.ts drawAura; WRITE readable.ts (a filled 'take' variant or
  a flag-only option) and its test. Done: stills ring vs soft filled glow, upright + sideways, at a flag on 1-1/1-4/3-1 (RIM crop on
  t-int-7 is the before); the lead picks; the pick replaces the ring outright; drawcheck within limits; the 'take' aura elsewhere unchanged.
- **STRIP-JOINS (R-165.237c), Content + engine stills, ~2-3 h.** Objective: every strip repeats with no seam. Files: WRITE the ten strips
  (w2mist-mid 22.8, w1kapok-mid 19.5, w1sunrise-mid 15.2, w8sunset-mid 15.0, w6dawn-mid 12.9, w1rain-mid 10.5, w3sinkhole-mid 10.1,
  w6moon-mid 7.9, w1dusk-mid 7.5, w1-mid 6.4: join / column step), tools/art/ a join check. Done: each re-joined with
  scripts/strip-seamless.py --force ONE AT A TIME, two copies tiled at play size before/after, no floating bits (w1-mid's forced join
  left some: repaint on HF if the ends differ that much); a gate fails any w*-far/mid/near strip whose join is over 3x its column step.
- SHEET-GUTTER (Content): repack the ground sheets with a 4 px clear gutter between pieces, then LIP_INSET/FILL_INSET can drop.
## Method update (render-fix.md): to find a hairline, trace draws by one pixel's before/after (tools: /tmp scratch trace2/trace4 pattern,
   worth adding as tools/inspect/pixeltrace.mjs) instead of guessing layers; then measure the sheet rows around the piece's frame.
## Lessons applied: D19 (test calls the same drawLip the screen calls), D21/D43 (every world, no stage literal), RF2 0g (sheet edge rows).
## Turnover note: reference/handoffs/engine-core.md section 0t (this commit).
