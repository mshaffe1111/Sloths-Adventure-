# FIX-SOIL-b (session 2 of FIX-SOIL; t-fix-soil from main cdffdc627). Started 8:58 AM ET 11-25 (by `date`); this box written 10:11 AM ET


## EXACT NEXT STEP
**FINAL CODE HEAD 539885c37 (the lead's ruling SHADE: 003e8b323 + the underside turf darkened toward the world's deep tone, 0.55, in
its one-time bake). Every gate ONCE on it, on frozen scratch wt-final3. RUNNING: paintcheck full sweep, lockall vs main's lock. NEXT, in
order: (1) read both (zero moves; trace any move); (2) stills on the final head: 1-4 layout 1 both settings both ways (shoot-b.mjs on a
vite of wt-final3) and 2-6 B/C/A upright AND sideways (scratch shoot26.mjs on a vite of wt-26f = a9439e586 + the final patch); look at
each on the phone frame; (3) suite in 4 shards (scratch shard0-3.txt), the CI tool line (scratch ciline.sh), drawcheck; (4) gate table
here, push, ls-remote, hash + paths to the lead. Name the 2-6 lighter soil block (W2-LANE's, not ours) with its still. Do NOT merge into
the 2-6 branch.**

## What changed (draw-only; no layout moves: lockall pending)
- src/game/protoArt.ts: drawGround's per-bank side logic moved, unchanged, into exported bankOpen(); the soil's clip outline into
  exported soilOutline() (a non-hung bank's path is the same points in the same order as before). NEW soilHangs(): a bank whose soil,
  run on down, would cover a lower bank's top or the 48 units of room over it (more than the 3-unit join where two soils meet), with a
  gap of at least 48 (his height), is HUNG: its soil stops at its own bottom. Tucks (gap under 48) and step-down joins are unchanged.
  groundSoil() exports the soil regions exactly as drawGround paints them (paint order, pockets after). groundLine() leaves hung banks
  out (else the summit's top, 10,000 up, stepped the start floor's soil shade at x ~244: visible in main's start stills too).
- The underside (code-drawn small touch, STAGE-RULES §4, from the world's OWN painted lip): the bottom edge rounds up 30 into each open
  end's face over 110 units (a belly, never below the collider), a soft clumped line between (world-anchored), the lip's turf underside
  and its roots (hung 1.8x long) laid along it (groundPaint.ts drawUnderside, baked once per bank, 1 image a frame on the live path),
  the soil shaded toward it (the world's deep tone, 0.7), the end pieces faded into the soil above the rounding.
  No inventory piece fits: the overhang/underside rows (w1-ledge-overhang-big, w1-hide-slab-overhang, w3 shelfS) are standalone
  props off main (art-director/t-art-next branches), a different shape from a bank of any width; flume-props rootsHang is World 7's.
- tools/engine/paintFall.ts soilOvers(): the planted rule, wired into paintcheck (no known list: every breach fails).
- tools/engine/paintFall.test.ts (CI-run): 4 tests: the two-bank plant (RED on main's column, GREEN as drawn, never under the collider),
  a tuck and a step join (no breach, not hung), a face clear of a floor under its end (no breach), the depth line.

## Proven so far
- 1-4 paintcheck --stages 1-4, 200/200 builds: GREEN on the fix (WIP 8ef75a90b's tree); RED with the cut off (335 SOIL OVER lines,
  every build: the plant tree = the fix with soilHangs' line off).
- paintFall.test.ts 15/15; the 15 src/game tests that import protoArt or groundPaint: 107/107; tsc clean.

## Stills (law 2; b/): 1-4 layout 1 (seed 2), main cdffdc627 (top row) vs c22702edc frozen (bottom row): start, 1/3, 2/3, just
under the summit, the summit
- b/BA-normal-sideways.jpg, b/BA-normal-upright.jpg, b/BA-easy-sideways.jpg, b/BA-easy-upright.jpg; b/BA-underside-closeups.jpg (2x).
- Polish check: the pillar is gone from every frame; the start floor's lip and soil whole, its shade even; the summit reads as a
  floating earth clump with a rounded mossy underside and roots, not a cut. Named, not mine: Pokey drawn faint in the placed frames is
  his hurt-blink (the shot sets invincibleTimer); Easy frames carry Dot's hint card (same in main).

# FIX-SOIL (BUILD-26y, session 9 of BUILD-26q; t-fix-soil cut from main cdffdc627). Started 7:06 PM ET 11-24 (by `date`); this box written 7:13 PM ET

## EXACT NEXT STEP
**Step 1 DONE (the pillar is on main). NEXT: step 2, lay (a) in protoArt.ts drawGround (the evenodd cut over a lower standable bank,
from its lip top down; no stage id), then (b) the planted check (paintFall.ts + paintFall.test.ts), RED on main then GREEN.**

## Step 1: the pillar on main's 1-4 (cdffdc627)
- EVERY build shows it: all 100 listed 1-4 seeds, Normal and Easy, 200/200 (scan-1-4-main.txt; the scan: scan14.mts.txt). The
  summit bank (y 360, h 120, id 55/56/57 by roll) stands over the start floor (#1 and/or #2, y 10326-11546): a gap of about 10,000.
- What reaches the screen (main-1-4-L1-normal-sideways.jpg, layout 1 = seed 2, Normal, 915x412, top left the start, then Pokey placed
  at 2/3, 1/3 and the top of the climb): the summit bank's soil is ONE dark column the whole height of the climb, through the sky
  behind every step, and at the start it covers the floor's lip and soil (the lip is cut where the column crosses it).
- Note for the lead's judging: the ruled cut (a) starts at the lower floor's lip top, so the floor's lip, top and soil show, and the
  column above the floor STAYS (it will stand on the floor's lip, up through the climb). Shown in the after stills.
