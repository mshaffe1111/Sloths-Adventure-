# FIX-TAB steps 1-2: facts (written 2:38 PM ET 11-20; base 453b69c2, main 6e7b85f8)

## 1. What the tab is, and is it on main
- The spot (1-6 L0 Normal seed 1, x5977, sideways) is rebuilt exactly on 453b69c2: stills/453b69c2-*.jpg. The tab is floor 36's grass lip
  (platform 36: 5827..6376, top 1058) run on 60 units LEFT under the wall bank 22 (5567..5827, top 818): protoArt.ts lipUnder
  (LIP_UNDER 60), drawn by drawBankArt's underL. Seen at world x 5792..5827, y 1061..1081: above it the painted stone 38's art
  (w1-rock-block-big, drawn 5709..6069, in front of the wall, as groundRun allows) ends at its foot 1061; to its right the step banks
  39/38 (stood on floor 36 at x5827) cover the floor's own lip with their soil; to its left the wall's soil is cut back along its end face.
- Proof: with lipUnder forced to 0 the same spot is a see-through HOLE (stills/...lipUnder-off-HOLE-crop2x.jpg): only the lip fills it.
- Root (draw): drawGround's lower(side) takes the FIRST lower bank beside the wall's end in array order (floor 36, top 1058), not the one
  that actually stands against it (step bank 39, top 878). So the wall's end face and its soil cut-back run down to 1058+24 = 1082
  instead of 878+24 = 902, and the notch between the face and x5827 is left to the floor's lip-under alone.
- On main: YES. main builds 1-6 L0 seed 1 differently (no stone at x5977), but the same tab shows under a painted stump in that still
  (stills/main6e7b85f8-1-6-stump-tab-crop.jpg); the probe counts 71 on main's 1-6 (8 builds).

## 2. Count (probe: probe/lipprobe.mjs, real draw, live ground; per-build lines in probe/count-per-build.txt)
Every floor lip-under run whose floor's own lip at that end is under another bank's soil, with a painted stone/log/stump art over it
(foot at the floor's top), and visible: pixels that change when that run is drawn vs not (>20 px). 72 builds (1-1..1-9 x Normal/Easy
x layouts 0-3, the shooter's frozen seeds):
- **100 tabs in 16 builds, all on 1-6 (Normal 51, Easy 25) and 1-7 (Normal 16, Easy 8)**; 1-1..1-5, 1-8, 1-9: 0.
- Also 43 lone lip-under strips with no art over them (1-6 only; tops of stair steps): sample sheet shows no visible tab.
- Probe limit: it counts this mechanism. A colour scan of every piece's foot found no other tab cause in the 4 spots checked.
- Probe needs two temporary hook lines in protoArt.ts (never committed): lipUnder returns 0 when globalThis.__noLipUnder;
  drawGroundChunks returns false when globalThis.__liveGround.
- EXPERIMENT (scratch worktree, not committed): lower() = the highest lower bank beside the end: 1-6 + 1-7, 16 builds: 100 -> 0 tabs,
  43 -> 0 lone strips (probe/count.txt); still: stills/EXPERIMENT-*.jpg, soil runs on under the stone.

## Seam (named, not fixed)
The vertical soil tone seam in the still is at world x ~5606 (2x px 199): left of it the soil is not darkened with depth (RGB ~63,49,44
vs 43,32,28 at the same height). It is OFF the soil tile grid (brick bond joins every 300 units: 5400, 5700), so it is a depth-shade step
between two banks' soils, NOT R-165.324's root (groundPaint's tile joins). Source not traced (likely wall 22's left end piece / its shade).
