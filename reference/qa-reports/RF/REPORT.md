# RF report: Matt's stranded render reports on the merged engine, plus the thorn hollow's look (2026-11-12, 8:50 AM ET)
Branch `t-render-fixes` (base t-int-engine@3616dfd9, merged with its head f8f467f5). No PR. Stills in this folder: 2x, upright 412x915, sideways 915x412.

## Items
- **R-164.7 (HUD faded under ledges): FIXED.** On the merged engine a ledge, log or branch top under a HUD piece still faded it to 30%
  (seeThrough.ts needsUnder). I ported 9b384389's seeThrough/hud.css part. Its test (seeThrough 3) fails on 3616dfd9 and passes here. Before:
  1-5 L1 x2750 sideways, hearts 2-5 and the lives plate faded over the tall bank (`hud-before-*`); after, solid (`hud-after-*`,
  `hud-compare-sideways.jpg`). Pokey, pickups and animals still fade the HUD. Upright: no spot on 1-4 or 1-5 puts a ledge top under the hearts
  (probed every 150-300 px), so there is no upright still. The rule doesn't depend on orientation.
- **R-164.6 (black pit column) and R-164.8 (dark box, seam): NOT REPRODUCED.** 9b384389's drop rule is already on the merged engine (pitWalls,
  dropOutline; w1Pits tests 8-10 green). The mixer's 1-5 that Matt shot is gone (0.9.5), and no World 1 stage marks a drop (test 10 asserts
  it on 1-2..1-9). A dark soil box under 1-5's stump in my first stills was MY HARNESS. stills-at.mjs's way (60 updates, ONE render) paints
  only 3 ground squares, and the rest are painted live with one gradient per bank. With 30 rendered frames the box is gone (`hud-*`). Every
  still here uses 30 rendered frames. tools/engine/runs/stills-at.mjs has the same fault and should be fixed before anyone trusts its stills.
- **R-164.1 (a fall to the ledge below kills): NOT REPRODUCED.** The fix lived in w1Rhythm.ts (fall zones over the bough legs), which is gone.
  1-2 on the merged engine is the hand-built stage: 0 heart-fall zones on layouts 1-8, both settings, and every ledge sits above the water's
  death line (lowest top 710 against 730). No World 1 stage has a heart-fall zone over a ledge (1-1..1-10, layouts 1-4, both settings).
  Not done: a real-engine drop from every ledge on 1-2.
- **The thorn hollow (EN-W Roughs 1-4): FIXED.** I reproduced it on the merged engine with the library's 1-2 kit, built in the page
  (scratch, never committed: EN-W's recipe), seed 1. Causes, each proved by turning the layer off:
  1. **Root column:** the two 84 px torn lips each hang 32 px in, so over a 49-70 px hollow they meet.
  2. **Grey-green box:** the banks' faces lean out under their end pieces, so backdrop showed beside the straight-sided dark.
  3. **Hard straight cut:** the hollow is just over the 150 px "canopy wall" rule, so one bank stood as a straight cut.
  4. **Box at the foot:** a rectangular shade.
  5. **Low-contrast thorns.**
  6. **A flash of bare slab:** the thorn pictures loaded only once a hollow was on screen.

  The fix:
  - **w1Pits.ts:**
    - each lip hangs into at most a quarter of the hollow (hollowLipWidth), its flat foot faded;
    - the inside is drawn over the ground between uneven walls (hollowWalls, biting at most 14 px into each bank);
    - the shade under the thorns is an oval, and the brambles are clipped to the same walls and lifted (THORN_LIFT, a brightness filter on
      World 1's own picture, no new art);
    - the thorns load on the stage's first frame.
  - **protoArt.ts:** a bank's side over a hurt floor is closed (sideOverHollow), and a hurt floor never makes its bank a wall.
  - **Tests:** w1Pits 13 and 14 fail on 3616dfd9 and pass here.
  - **Stills:** `hollow-{before,after}-x{3500,34250}-{upright,sideways}.jpg` and `hollow-compare-*.jpg`. x3500 has three narrow hollows (64,
    49, 66 px); x34250 is a stepped run of hollows with unequal lips.

## Polish check (I looked at every still, upright and sideways)
- Hollows: each reads as a hole. Mossy torn corners, a dark inside with uneven earth walls, a bright thorn bed, and a soft shade at its foot. No
  column, no box, no sliver, no straight edge. What's in the frame and why: the banks are the ground, the lips are World 1's w1-lip picture,
  the thorns are w1-thorn-long/low on the hurt floor, mushrooms and petals are the roll's pickups.
- HUD: hearts and lives are solid over the bank; nothing in the frame changed but the fade.
- Plain: no shipped stage lays a hollow yet (only the library kit does), so Matt sees this when 1-2 ships on the library.

## Checks on the final code (b624e6ca + this report), times ET
- tsc clean.
- Tests: seeThrough, w1Pits, briefPits, hurtFloor 36/36.
- Stage lock 102/102 unchanged (`lockall --layouts 2`, base recorded at f8f467f5).
- seedlist 1-1 PASS (355 seeds).
- drawcheck PASS (364 s), clipcheck PASS (83 known, none new).
- mixer/stumps.test.ts 1 fails on the base too ("no log on a stump was laid"). It is pre-existing and not in the standard list.
- I ran drawcheck once across the merge. That run was thrown away and re-run on the final code.
