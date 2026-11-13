# Method: smoothing a move that "feels off" (a snap, a stall, a dead stop) without moving any stage

First used by FEEL-VINE (R-165.214, 11-13: Matt on 1-4, "the climbing vines and going from vine to vine... not very smooth").

1. **Measure on the real engine first, frame by frame (D37).** Drive RealPlay at 30 fps through the move Matt named, found from the
   stage's own pieces (no stage id, seed or x in the tool), both settings, a FRESH stage per move (a crumbled bough or held hands carry
   over otherwise). Name each rough frame with a number: the on-screen jerk (change in the per-frame move, px; a snap onto a vine was
   40-50, gravity is 1.2, a run start 3-4), stalls with a thumb held, speed changes, pose swaps, camera moves. Tool:
   `npx tsx tools/inspect/vineFeel.ts <stage> <seed> [-v] [-f]`.
2. **Decide body or drawing.** If every reach, vault or verdict number is measured from the body's snap (vineTop.ts, climbReach, gen2
   verdicts), keep the body exact and carry the snap in a DRAWN offset (vineFeel.ts: a critically damped spring, drawn only, the way
   wallOff is). A body change re-proves every verdict and moves seeds; a drawn change moves nothing (lock N/N, seed lists PASS).
3. **Carry where he WOULD have been**, not where he was: the catch frame moves him on at his own speed (old pos + v*dt), or the eye
   sees a one-frame stall before the slide. A snap made outside your block (a collision) is drawn from the same frame (drawnOff).
4. **Guards:** a body jump past the cap (respawn, flag) clears it; nothing is carried once he lets go; at rest he lines up within a
   few px by 150 ms (planted test). A placement in a recorder must not leave invincibility on (it draws him faded).
5. **Plant a test per snap** on 2+ worlds' stages (drawn jerk bound, the body's own snap still there), and prove it red with the fix
   off. Clips: `node tools/inspect/vineFeelClip.mjs <beforePort> <afterPort> <out>` (two dev servers, the clock installed BEFORE the
   page loads or the loop runs one step in ten), side by side at full and half speed, upright and sideways; look at the strips.
