# ENG-GROUND-c REPORT (handover at the context line; branch t-eng-ground, code head 302c28f7e)
a. LOCK vs 0eefc707e (base recorded in a worktree at 0eefc707e; `lockall --layouts 16 --check`, on 6bc57e280 and again on 302c28f7e):
   PASS, 102/102 shipped stages unchanged (the "gained verdicts and drops (not hashed)" line is new unhashed fields, not a move).
   The lead accepted it.
c. RE-SHOOT 2x (stills/after-b on 338029b7f's code: race leg x14950, river x15350, join x18450, upright and sideways): one river under the
   bridge, no column at x15350, the race leg reads under the out leg. The CLOSE-UP found the underside's 16-unit columns each set level
   at its LOWER end: the edge stepped by the line's rise, stairs every 16 (up to 13 units off the line, 49 at the slanted ends). FIX
   (groundStack.ts drawUnderside): each column sheared to the line. PLANT groundStack.test 6 'edge on the line at both column ends':
   RED red-c.txt (35 spans), GREEN. stills/after-c/underside-closeup-before-after.jpg.
d. engine-core.md 0zq-GROUND written (groundStack, the clips, the underside, the join, the traps, the integration order).
e. PAINTED UNDERSIDE (ART-UNDER's rows at origin/t-art-under 63963f54d; shot on a SCRATCH worktree that took only w2.webp and the '2'
   atlas entry, never pushed; stills/painted-scratch/). The hook reads exactly `unders` (x,y,w,h,edge) and `underCorner` (x,y,w,h,edge,cx).
   Two faults found and fixed (b0d6ed6af, 302c28f7e), planted in groundStack.test 6:
   - a HARD SEAM at every strip change (each strip wraps only with itself): the next strip's tail fades in over 96 before each change.
     RED red-c2.txt (7 seams on seed 1), GREEN.
   - the underside ENDED IN A STRAIGHT CUT where a bank ends over open air (the toy's ceiling, both ends): the corner, face on the end,
     sheared to the line, mirrored for a left end (protoArt drawGround `open`; setGroundStacks now takes the stage's rivers so an end
     beside an upper river is not open). RED red-c3.txt (both ends, no corner), GREEN. Drawn whole the corner read as a pasted block:
     its top (0.4) and inner side (0.45) fade in, baked once per world when the sheet loads (no per-frame gradient).
   The lead: the seam fade and the corners are good; DUSK dropped (no dusk look exists in the engine).
   INTEGRATION ORDER: t-art-under's rows land with the art (w2.webp, '2' unders/underCorner, GroundSheet's optional fields); the hook
   draws them with no further change. Never merge t-art-under into an engine branch (t-art-next's lineage; it conflicts in 15+ files).
NOT DONE (the lead's finding on painted-scratch/right-end-x18760-sideways.jpg; I passed over the pale band there as ENG-27's column without
   checking it: my miss, lesson D-"check the fact before attributing"): TWO COLUMNS hang from the descent down to the race leg's floor
   at the toy's right end (seed 1 normal, camera x 18130 sideways): an EARTH column at world x ~18760-18805 and a POND column at
   x ~18955-19015. DIAGNOSIS (data, seed 1 normal): legs right 14049-18726 y680-850, DOWN 18726-20006 y905-1450, left 0-18666 y1400-1647.
   The only zone is the race leg's box (x 0-18666), so the ceiling stops at 18832. The descent's stairs (thin pieces at y905/1045/1169)
   and their still pools R18955-19015 (surface 1087) and R19221-19288 (surface 1211) stand OVER the floor P18666-20006 y1450 (where he
   walks under the stairs), outside every zone: riverLid finds no ceiling, so each pool runs its water, bed and soil to the view's foot.
   The earth column is most likely the same pool's soil run under its left bank (engine drawRivers riverUnderBanks ul ~195: 18955-195 =
   18760): VERIFY FIRST (a recording ctx over world (18780, 1350)). Headroom there is marginal: line = floor - (HEADROOM 233 + 40) = 1177,
   ABOVE the 1211 pool's surface, so the lid must stop at a pool's bed foot (as the line never cuts an upper bank's collider).
GATES on 302c28f7e (run-gates-b.sh a, b, lock in the background): tsc PASS; suite 1/6 PASS (634/634); suite 2/6 PASS (616/617, 1 todo);
   lock PASS. UNRUN (stopped at the handover by the lead's word; logs died with the container): suite 3-6, the CI tool line, tierBots,
   tipwalk, coveragecheck, registrycheck, generalitycheck, knowncheck, roadmapcheck, timecheck, artcheck, seedlists, paintcheck x3,
   build, chunkcheck, clipcheck, kbdcheck, drawcheck, buildcheck. The next member runs them all after its fix (EXACT NEXT STEP 4).
POLISH CHECK: after-b (2x, both ways): river and join PASS; close-up FIXED (stairs). painted-scratch: race leg seam FIXED, both ends'
   corners FIXED (pasted block faded in); right end sideways FAILS (the two columns, above). Upright views carry the underside; sideways
   the ceiling sits mostly above the frame.
LESSONS APPLIED: D57/D87 (inbox read at every step and push; long runs in the background), D96 (CI's own gate lines), D102 (lean reads,
   images downscaled once), D105, D107, D109 (no clock times in messages). LEARNED: a thing in a still that "belongs to another member"
   is checked before it is passed over (the right-end columns).
EXACT NEXT STEP (fresh member, on t-eng-ground at its HEAD):
 1. VERIFY the earth column's painter (recording ctx at world (18780, 1350), seed 1 normal, the toy '2-97' via buildGen2Stage + w2Finish as
    groundStack.test 6 builds it; the engine's drawRivers and drawProtoScene).
 2. PLANT (groundStack.test, new case, both settings, seeds 1-3): over every piece of the lower band (top within the race leg's y0..y1)
    that stands under another leg's paint, ends included (here the floor P18666-20006 under the DOWN leg), no upper paint (bank soil,
    river water/bed/soil, under-bank soil) covers the air from the floor's top up HIS_H; RED on this head at x 18760-19015 (seed 1).
 3. FIX generally (groundStack.ts stackZonesOf/findCeilings, protoArt riverLid): a lower run leg's zone covers every place another leg's
    ground or water stands over its band, ends included (a leg whose box comes down into the band, e.g. the DOWN leg, adds its x span);
    the ceiling's upper side counts upper rivers (their bed foot is the line's highest point there) and thin upper pieces, not only
    painted banks; a lidded river's under-bank soil is clipped with it (clipAboveLines already spans x0-ul..x1+ur). No stage id.
 4. Re-run groundStack.test, lockall --layouts 16 --check vs 0eefc707e (record the base in a worktree), then the gates
    (reference/qa-reports/ENG-GROUND/run-gates-b.sh a, b, lock; CI's tool line from gates.yml line 157 in $G/../tooltests.cmd).
 5. Re-shoot with t-art-under's rows on a SCRATCH worktree (git checkout 63963f54d -- src/assets/ground/w2.webp; copy groundAtlasData '2'
    from 63963f54d; never push it): BOTH ends (left x13900, right x18760) and the join (x18450), 2x, upright and sideways
    (`DSF=2 PW=/opt/node-tools/node_modules/playwright/index.mjs node reference/qa-reports/ENG-27/race-stills-27d.mjs <port> <out>
    13900:none:left-end 18760:none:right-end 18450:none:join`); look at each the way Matt will. Then REPORT and the hash to the lead.

# ENG-GROUND-b REPORT (handover at the context line, by the lead's D76; branch t-eng-ground, code head 7dc775c93)
1. RE-SHOOT (stills/reshoot-6c45381d0/, 2x both ways): the river column at x15350 was NOT gone. Its cause was not the sag: the out leg's
   still pools ran their water, bed and soil to the view's foot (engine.ts drawRivers), outside the banks' ceiling clip. FIX (general):
   a river of an upper leg ends at the ceiling (groundStack.ts ceilingsOverSpan + clipAboveLines; protoArt.ts riverLid/riverUnderside;
   engine.ts drawRivers). PLANT groundStack.test 4-5 (the engine's own river painter on the toy): RED 356/338 points, GREEN (red-b.txt).
   1x re-still after: the column is gone (sideways x15350).
2. JOIN (x18450): the "brown post" was the same pool column (gone with 1). The water slices and the dark band under the planks: World 2's
   finish laid a pocket per gap, so no water ran under a plank (the backdrop's bottom showed) and the middle pocket stood 20 higher. FIX in
   w2.ts w2Finish (general, no stage id): a run of falls joined by planks over the water is ONE river under a bridge, bank to bank, at one
   surface; a fall's bank lies within LIP_RISE of its height (an upper-leg piece 600 px up had its edge 2 px from a plank's and was taken
   for its bank); a fall has its river only when one spans it AT ITS HEIGHT (an x-only match left race-leg falls under the out leg's log
   rivers dry, and one out-leg gap over the race leg dry: a drop-through). No shipped stage lays a plank between two pockets
   (tools/engine/plankscan.ts, plankscan-16.txt: 3264 builds). PLANT w2.test 'bridge over ONE river': RED 50 faults, GREEN.
   1x re-still after: one river under the two planks, the mail boat on it. The lead ruled (b): keep the height fix; nobody retunes the race.
3. THE LEAD'S ART-UNDER RULING: the underside is drawn AFTER the ceiling's clip, over the bank's (or pool's) own span, with the strip's
   roots hanging below the line (drawBankArt's `under` hook removed; drawUnderside cuts its columns at the span's ends). PLANT
   groundStack.test 6: RED (0 roots under the line) on 0f5ca9999, GREEN. groundStack.test 6/6.
4. SEED-2 TRACE (pacerLay.test 'careful middle player' normal seed 2 is RED: 114.9 s against the boat's 112.21 s, caused by the height fix):
   9 lives against 5 on the old finish. All are on log rivers whose data is the same on both finishes; none is in a newly filled gap: hops
   off a log f859 x16027, f1292 x14902, f1656 x14799, f5511 x4068; rode the log into the water f4739 x7069, f5094 x5763; walked off a
   bank's edge f4212 x9936; short hop off a bank f5050 x5977, f6124 x1942. The old win leaned on leaving the out leg at f1122 (x17126 to
   17471). Sent to the lead: ENG-27f's two log misplays plus the bot's carry-off and walk-off, not a new cause; stays red until ENG-27f merges.
GATES on 7dc775c93: tsc PASS. Everything else UNRUN (the run was cut at the context line; scratch worktrees die with the container):
  the full suite (6 shards), the CI tool line, tierBots, tipwalk, coveragecheck, registrycheck, generalitycheck, knowncheck, roadmapcheck,
  timecheck, artcheck, seedlists, paintcheck x3, build, chunkcheck, clipcheck, kbdcheck, drawcheck, buildcheck, lockall vs 0eefc707e.
  Known RED before running: pacerLay seed 2 (above).
POLISH CHECK: river x15350 sideways: no column (1x re-still); join x18450 sideways: one river under a bridge (1x re-still). Upright and the
  2x set NOT re-shot after the fixes; the underside close-up NOT shot.
STEP 4 (painted underside): ART-UNDER's rows were NOT packed yet on origin/t-art-under at 17f2dbe08 (takes pulled; groundAtlasData.ts has
  no `unders`); not drawn.
LESSONS APPLIED: D57/D87 (inbox read at each step and push, long runs in the background), D96 (CI's own gate commands: run-gates-b.sh),
  D102 (lean reads, but one wide grep on groundAtlasData cost context), D105, D107, D109 (no clock times in messages).
EXACT NEXT STEP (ENG-GROUND-c, fresh, on t-eng-ground at its HEAD):
 a. `npm install --legacy-peer-deps`. Base lock: a worktree at 0eefc707e, `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-base.json`;
    on HEAD `npx tsx tools/engine/lockall.ts --layouts 16 --check lock-base.json`. Expect NO shipped stage to move. The finish change hits only
    plank runs and falls under another leg's river; if one moves, name it with its cause.
 b. Gates: `G=<logdir> H=<head worktree> bash reference/qa-reports/ENG-GROUND/run-gates-b.sh a` and `... b` (put CI's tool line, gates.yml
    line 157, in $G/../tooltests.cmd first), in the background; read summary.txt. Expect only pacerLay seed 2 red until ENG-27f's merge.
 c. Re-shoot 2x both ways (vite on 5191; `DSF=2 PW=/opt/node-tools/node_modules/playwright/index.mjs node reference/qa-reports/ENG-27/race-stills-27d.mjs
    5191 reference/qa-reports/ENG-GROUND/stills/after-b 14950:none:race-under 15350:none:river 18450:none:join`) plus an upright underside
    close-up (a crop); look at each, once, downscaled.
 d. Rewrite reference/handoffs/engine-core.md (a new top entry): §2 groundStack.ts (ceilings, clipAbove, clipAboveLines, drawUnderside after the
    clip over its span, underFrames) + protoArt setGroundStacks/riverLid/riverUnderside + engine drawRivers' lid; §3 traps: soil and rivers
    run to the view's foot (a stacked leg needs both lidded); w2Finish matches rivers and banks at a fall's HEIGHT (stacked legs share x);
    a test that builds an engine must build it BEFORE setting protoArt's stacks/world (its stage start resets them).
 e. Step 4 when ART-UNDER's `unders` land: draw them, re-shoot. Then REPORT and the hash to the lead.

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
 d. Turnover note NOT rewritten yet: rewrite reference/handoffs/engine-core.md (§2 groundStack.ts + setGroundStacks; §3 trap: soil runs to the foot, stacked legs need lay zones; the painted-strip hook underFrames).
