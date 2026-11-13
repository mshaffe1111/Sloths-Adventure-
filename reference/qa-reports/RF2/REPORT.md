# RF2: World 1's ground seams (R-165.146, R-165.129's open part). Branch t-render-2, built on t-int-2@168b9309 + origin/t-w1-creatures

## Done-items
1. **Reproduced on the real page first** (t-int-2, dev page, stills-at's way; `stills/before-*`), each traced to its draw call with
   `ground-trace.mjs` (every draw into the ground squares that changes a pixel) and `screen-trace.mjs` (every draw covering a screen px).
   Four causes, all shared code, no stage id, seed or x (generalitycheck PASS):
   - **Soil hairline every 600 units** (1-1's pillar at y 1200; 1-3's floor line at 600): WebP bleed. Fills 2-3 of every world sit on
     the lip strip; World 1 fill 2's last 3 rows fall 60 -> 45 -> 36 (fill 0: flat 60). Fix: `fillSrc`, sampled FILL_INSET 3 px in.
     Edge strips are shared (near-edge rows differ 1.6 between fills vs 7 mid-tile), so nothing shows at a join.
   - **The box under a raised bank** (W1C's still, 1-2, 1-3): the floor's lip stopped at the bank's edge. Short step (< 60) between two
     floors: `stepFootLips`, the floor's lip drawn after the run over its end pieces' clean cut. Any higher bank: `lipUnder`, the lip runs
     60 on under it, drawn before it, so only the gap where its end face curves in shows it.
   - **Lighter box between 1-1's earth pillars**: the dip pocket's soil was drawn live over the baked ground, darkened by the view. Now
     painted in `drawGround` (the squares) with the ground line's darkening.
   - **Streaky "pit-wall" band under 1-1's low log**: not ground. The backdrop strips' last 3% of rows stretched down over the chasm.
     Now `stripFoot`: the bottom edge averaged to 48 columns, darker downward (FOOT_DARK 0.45), one draw a copy as before.
   - Tests (`src/game/groundSeams.test.ts`, 6): red on 168b9309 (the whole file: missing exports; the pocket test alone, run against the
     real drawProtoScene with stubbed sheets: "4 soil tiles drawn live"), green here.
2. **Stills** `stills/` (before-*/after-*, upright 412x915 and sideways 915x412, 2x; `sheet-upright.jpg`, `sheet-sideways.jpg`): 1-1 seed
   9800 (L18) at x10040 (pillars) and x30000 (low log); 1-2 L2 x1400 (raised bank); 1-3 L1 x8250 (38-up bank) and x700 (76-up banks).
   **1-3 trap1's frame: NOT shot.** origin/t-w1-creatures is merged (one conflict: root REPORT.md, kept t-int-2's), but on the page 1-3 has
   no cast (`trap-stills.mjs`: "this stage has no cast"; nothing imports w1Cast.ts, and W1C's page setup is not in the repo). W1C's
   bank stood 91 up; the 76-up bank (x700) is the same case and is fixed.
3. **Gates on ff514d33:** tsc clean; touched tests 80/80 (14 files); artcheck, knowncheck, generalitycheck PASS; drawcheck PASS 351 s on
   ff514d33; lock, 16 layouts vs 168b9309: 102/102 stages unchanged. Drawing only; no gameplay file touched.

## Polish check (whole picture: every object, why there, what holds it up)
- 1-3 x8250 upright: the floor's moss now runs on under the moss stone; no box, no straight foot; joins checked at 3x (a first try left
  a hairline at each join: the bank's soil overlaps the floor lip by 1 unit; fixed by clipping 2 past each end below the floor's top).
  A thin vertical dark line below the lip at x~8436 is a painted hanging root of the lip art (traced), not a seam.
- 1-3 x700: the grey box beside each bank's foot is gone; grass runs to the faces. 1-2 x1400 both ways: box gone.
- 1-1 x10040: the y-1200 hairline across the pillar and the lighter pocket column are gone; the pillars read as one earth.
- 1-1 x30000: streaks gone; the strip's painted floor fades into a dark drop. Its own painted bottom edge is still faintly visible as a
  soft line (the strip's art), named, not hidden.

## Pushback
- The packet named the low-log band as ground; it is the backdrop over a bottomless chasm. The fade to dark is a code touch (§4: depth
  fades into darkness). A painted chasm depth would be better; that is a Hugging Face call for the lead, not needed for tonight.

## Suggestions
- Content (tools/art/hfground/pack.py): repack the ground sheets with 4 px of padding between pieces, then FILL_INSET can go to 0.
- Critic: a browser gate that samples soil tone across every bank edge in World 1 stills (both sides within 6 levels).

## Unresolved
- The trap1 still (above). Not run: the full suite, clipcheck, vite build/chunkcheck (no menu or bundle change beyond 3 small exports).

## Method update (render-fix.md)
- Step 4: add "trace by pixel": wrap drawImage/fill/fillRect, read the target pixel back before and after each call on the ground
  square canvases (`ground-trace.mjs`); a live layer over the baked one shows up at once with `screen-trace.mjs`.
- Pitfall: lossy atlases bleed into their pieces' edges; measure the edge rows before trusting a "periodic" fill.

Lessons applied: judge the real screen in both orientations (D1/D2); a gate calls the same code the screen calls (the pocket test runs
drawProtoScene) (D19); spread the fix to its pair (the floor lip at short AND tall steps; the fill inset in every world) (D21).
Turnover note: reference/handoffs/engine-core.md §0g rewritten in this commit.
