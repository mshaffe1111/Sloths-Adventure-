# ENG-GROUND REPORT (handover at the context line; branch t-eng-ground)
1. LIST (sent to the lead, step 1): soil to the foot in protoArt drawBankArt (THE source), drawGround's W1 dip pockets, groundPaint endFace,
   terrain.ts drawn ground (kit off). Stacks (tools/engine/stackscan.ts; stackscan-gap233.txt): the out-and-back toy (every roll),
   SHIPPED 1-4 (summit bank #56's soil runs the whole tower: stills/1-4-summit-soil-column-*.jpg) and 7-4 (ruin banks over the floor at
   y960); 17 W3-W5 stages' pit floors tucked 40 px under a bank's end are not legs (stackscan-gap20.txt). Lead ruling (b): 1-4/7-4 to R-165.376.
2. FIX (general, no stage id): src/game/groundStack.ts. stackZonesOf(the lay's legs): a run leg wholly under another run leg; engine.ts sets
   them at a stage's start (setGroundStacks); a stage whose lay stacks no leg has none and draws exactly as before. findCeilings: the
   lower leg's static pieces under earth with headroom (48 + DOUBLE_RISE), a line HEADROOM + 40 over each, 160 past their ends, smoothed
   (cone 0.6), no sag between higher stretches, wobbling UP 2..34 px (never a straight cut), ends slanting into the hillside. protoArt
   drawGround clips each upper bank's paint (soil, wall art, end pieces) clear of the air under the line; a lower piece is no pit floor
   between upper banks. Underside: drawBankArt's new `under` hook draws groundStack drawUnderside inside the soil: the PAINTED strip when
   the ground sheet has `unders` (ids w<n>#under0..2 with `edge`: underFrames, the hook the art member packs into), else the STAND-IN
   (the soil's edge darkened, a 4x64 strip made once: no per-frame gradient). Stand-in is toy-only by the ruling; 2-7 needs the strip.
3. PLANT: src/game/groundStack.test.ts (a recording canvas judges the ground's own draws on the toy, POST_CODE seed 1, both settings:
   walk band + river uncovered, upper earth still under its collider, the line not straight; plus stackZonesOf on non-stacked legs).
   RED on 2460568a9: 588 / 650 points under soil (red-on-2460568a9.txt). GREEN 3/3 (green.txt).
4. LOCK: NOT RUN YET (next step). Base lock saved at 0eefc707e: 3264 builds, 102 stages (recorded in scratch; re-record, see NEXT).
5. STILLS (2x, first pass, stills/after-*.jpg): race leg, river and backdrop show under the out leg; upright the earth band with its wavy
   underside reads as a ceiling. DEFECT seen in them (fixed after, re-shoot pending): over the river at x 15100-15400 the line sagged
   (a river-bed piece) and bank #3's earth hung as a column to just over the race bank: the no-sag rule fixes it (test green).
GATES: tsc PASS; groundStack.test 3/3; generalitycheck PASS. NOT RUN: full suite, paintcheck x3, drawcheck, lockall, the CI tool line.
POLISH CHECK: before (stills/before-*): solid earth over the race leg. After: see 5; the stand-in underside is plain (no roots) by design.
PUSHBACK: none. SUGGESTION: 1-4's summit column (R-165.376) can take this same rule once the tower lay marks its storeys as stacked.
LESSONS APPLIED: D57/D87 (inbox read at every step; long runs in background), D102 (read by grep/ranges), D109 (no clock in messages),
D75/D101 (proven on the toy's REAL gen2 roll, not a fixture-only path), D105/D107 noted.
EXACT NEXT STEP (fresh member, on t-eng-ground at its HEAD):
 a. `npm install --legacy-peer-deps`; `npx vite --port=5191 --host=127.0.0.1` in background; re-shoot with
    `DSF=2 PW=/opt/node-tools/node_modules/playwright/index.mjs node reference/qa-reports/ENG-27/race-stills-27d.mjs 5191 reference/qa-reports/ENG-GROUND/stills 14950:none:after-race-under 15350:none:after-river 18450:none:after-join`
    and check the river column at x 15100-15400 is gone (sideways), the join at the column, upright and sideways; one close-up of the underside.
 b. Lock: on 0eefc707e `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-base.json` (a worktree), then here
    `npx tsx tools/engine/lockall.ts --layouts 16 --check lock-base.json` (expect NO change: the fix is paint only; the toy is not in lockall).
 c. paintcheck x3 (`--part 0/3`, 1/3, 2/3), drawcheck, the full suite, the CI tool line; then REPORT gates and send the lead the hash.
