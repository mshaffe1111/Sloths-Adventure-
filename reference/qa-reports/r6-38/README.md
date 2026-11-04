# R-6.38: World 1's pits read as pits (fix-petals, fun-validator 95a2de06)

The lead moved R-6.38 from w8-rope2 to fix-petals on 2026-11-04 (the keeper's estimate: 3 h). The art is the R-159.1 pit list that
Matt approved and the lead accepted: the drop s52-7, the lip s55-7, the bed s60-7 and the high drop s65-23. **No new painting and no
spend.** The takes came from `hf://buckets/mshaffe111/w5-xfer/r159/r159-pits/props/`.

## Before and after (layout 1, Normal, the real game, upright 412x915 and sideways 915x412)
- `pits-sideways-before-after.jpg`: 1-3, 1-5, 1-9, 1-6, 1-7 and 1-8. Left is the base (6dc4dab8), right is this build.
- `pits-upright-before-after.jpg`: the same six, upright.

| stage | before (the QS's words) | after |
|---|---|---|
| 1-3, 1-5, 1-9 (and 1-1, 1-6, 1-7) soft pits, World 1's vault pits | "a log and a muddy stream bottom": the pit's floor art and the backdrop through the opening | dark earth and roots down the walls, the torn lip at each bank's end, the leaf bed on the floor: a pit, and a soft one |
| 1-8, the long branch | "more foliage": the backdrop's bushes through each gap | the high drop: a little canopy far below, the mist band, then black. Feathered 24 px at the sides |
| 1-6's four floorless gaps | water, with Dot's "Careful, water!" and its sign | unchanged: it is water, and Dot says so |

## What was done
- **The art** (`tools/art/combat/pitcut.py`, output in `src/assets/props/pits/`, 96 KB for all four):
  - the drop and the high drop are made to tile with the backdrops' own seamless join (`scripts/backdrop-strip.py`). The drop's raw
    take showed a seam through a rock; tiled three times now, none shows;
  - the lip and the bed are keyed off their magenta, with the edge's pink pulled out and the alpha eroded by 1 px.
- **The pits** (`src/game/w1Pits.ts`, found once per stage from its platforms):
  - a soft pit has a floor 100-200 px under the ground line. 1-1's 75 px sunk steps are steps, not pits;
  - a fall has no floor;
  - 1-8's pits are the holes between the chase's sections;
  - a tall stump on the ground is ground, and a breaking branch over a gap is not a floor.
- **The draw** (`protoArt.ts` drawProtoScene, World 1 only):
  - the drop is drawn under the ground, so the ground's own pit shade, floors, bank faces and steps draw over it as before;
  - nothing is painted over a step. Some steps are drawn by the platforms' own pass before the ground (1-5's middle stump), so the
    drop leaves each step's box clear;
  - the lips and the leaf bed are drawn over the ground;
  - each pit's gradients are made once and kept (drawcheck counts gradients per frame).
- **Loading**: `stageSheets.ts` adds 'pit-art:1' to every World 1 stage and `stagePreload.ts` loads the four pictures, so a stage starts
  with them.
- engine.ts is untouched, and no platform moved. funcheck PASS (152 known), so the stages' structure is the same.

## Proof
- `src/game/w1Pits.test.ts` (4 tests):
  - fixtures: a soft pit with its step; a sunk step that is not a pit; a fall; a stump on the ground; a breaking branch over a gap;
  - 1-8's chase gaps;
  - the real World 1, layout 1: every soft pit has a step out, and the only floorless gaps outside 1-8 are 1-6's water.
- World 1, layout 1, counts: soft pits 1-1: 1, 1-3: 4, 1-5: 4, 1-6: 3, 1-7: 1, 1-9: 9 (1-2 and 1-4 have none); 1-8: 27 gaps; 1-6: 4
  water gaps, left as water.

## Judgement calls, for the QS and the lead
- **The leaf bed is on every World 1 soft pit, not only 1-3's.** The pit list names "1-3's soft bed", but every World 1 soft pit is
  soft (a miss costs nothing), so all of them say so. It is the approved picture reused, at $0. Say if only 1-3 should carry it.
- **1-6's water stays water.** The floorless gaps there are water pits that Dot warns of by name.

## Polish check (both ways up, on the stills above)
- The vault pits read as pits at a glance: dark inside, a lit leaf bed at the bottom, and torn lips with roots at the banks. Upright and
  sideways both fine.
- 1-5's middle stump step and the soil steps at the walls show as before. A first cut hid the stump, and a second drew the steps as
  dark boxes; both were found on the stills and fixed.
- Rough spot, named: where a soil step stands at a pit's wall, its box reads slightly lighter than the drop around it (1-5 upright, the
  right wall).
- Rough spot, named: 1-8's gap still reads a little as a rectangle cut in the scene where its sides meet the foliage behind the branch,
  even feathered. A painted end for a branch would close it; that is new art, not on the approved list.
