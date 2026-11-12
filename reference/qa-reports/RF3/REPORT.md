# RF3: World 1's hollow painter, two limits. Branch t-render-3 on origin/t-int-2@daa21d53 (1-2 shot on t-int-2 + origin/t-12-design, scratch)

## Done-items
1. **(a) Taller wall in a narrow hollow: FIXED.** Reproduced on the page (1-2 L1 stair, x0 8777/8960/9152: 63-74 px, stump 77-80 px over the
   lower lip; baked canvases dumped, `stills/bakes-before.jpg`). Causes: above the hollow's top the taller wall's band was masked to the line
   at the top (`hollowWalls(g, max(y, top))`): a straight strip with a square top over the bank's straight closed side; in the hollow the face
   was held on HOLLOW_BACK (up to 32 px dead straight). Fix (w1Pits.ts): each wall's line is its end face *fitted* (its slow drift moved and
   narrowed, its swings kept; a face that fits stays as it is); above the top a taller wall stands 1-7.5 px out past its bank's cut; the bake
   moves each 3 px row of the painted face onto the line (`hollowWallShift`), so the painted edge IS the wall at every height. The back runs
   on under a wall that stands out (a sky sliver showed there; found on the zoomed still, fixed).
2. **(b) Mirrored walls: FIXED.** `hollowFaceLift` = HOLLOW_FACE_LIFT + any step down, so the two faces always show piece rows >= 38 px apart.
   1-2 L1 long chain (x0 12528, 35 px dip): before, the right wall showed the left's own roots mirrored; after, another part (`zoom-beatX.jpg`).
3. **Tests** `src/game/hollowWalls.test.ts` (2, planted: 6 widths x 13 steps x 5 x; steps -120..120 every px). On the base: red ("101 px
   dead straight"; "differ on 0 of 69 rows" at a 31 px step). Here green. w1Pits.test 15/15 (the wall test now reads hollowFaceLift and
   checks face = wall only where the face fits; its D12-content red "held on a bound (a straight cut)" at x 8735 is this fault).

## Polish check (looked at every still at 2x, upright and sideways; `stills/`)
- Stair (`sheet-1-2-x8920-*`, `zoom-stair.jpg`): stump sides above the holes are painted faces, no ruler cut, no square strip; walls in
  the holes curve; no sky sliver. Long chain (`sheet-1-2-x12480-*`, `zoom-beatX.jpg`): two different walls.
- 1-1 L18 x10040, 1-3 L1 x8250 (`sheet-11-13-*`): same before/after (no thorn hollow on 1-1/1-3 layouts 1-4; the code runs only for them).
- Whole picture: every object is ground, stumps, caps, thorns, rain, Pokey, HUD, Dot. **Left, not mine (named):** the hollow's dimmed far
  rim ends in a hard horizontal top line (PIT's rough 2); Dot's start line sits over the shots; the tall narrow stair holes read as dark slots
  (the lay). No painted art needed.

## Checks (final code)
GATES_PLACEHOLDER

## Method used / Lessons applied / Method update
- render-fix.md 1-8. Lessons: judge the real screen at 2x zoom (D1, found the sliver); a test that fails on the base (render-fix 6); every
  object asked "why there" (D16); check the fact in code (D7: hollows exist only on 1-2).
- Method update (proposed): step 3b, **dump the baked canvas** on magenta (`dump.mjs`, the bake map exposed in the scratch tree): it showed
  the square strip in one look after three still crops did not. `shoot.mjs` (stills-at plus a world-rect crop, camera centred on it).
