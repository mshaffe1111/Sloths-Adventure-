# ENG-26 REPORT: 2-6's water wheel (NEW 1) and the bot skill rideWheel (NEW 2)
t-eng-26 from t-meter-3@42459a5c; code head 07efe1abc2 (gates run on it). Method: level.md rules 21/23/24, engine-core.md §4. Lessons: D40,
D57/D87 (inbox at each push, long runs in the background), D59 (nothing left running), D75 (a rolled gen2 row, not a fixture), D81/D86 (full list).
## Done-items
1. NEW 1, DONE + planted: wheel.ts (pure), pieces/wheelPiece.ts (bucket and rider by dx AND dy, the engine's carryVx), place `{ kind:
   'wheel', after: <jetty>, row }` (wheelLay.ts: buckets + a safe pond; a tower's way up a storey, turned on a leftward storey), wheelFaults
   in checkStage, W2_WHEELS teach/edge/top/great. Toy: tools/inspect/wheelToys.ts (tower 2-95, World 2's ground, a listed test row).
   src/game/gen2/wheel.test.ts 7/7: GREEN as designed both settings; RED by name: street moved 90 px (the engine agrees: 0.83 s < 1.5),
   jetty moved, bough in the sweep, drowned ledge, no pond, unflown row, up street 100 px.
2. NEW 2, DONE + planted: firsttimer.ts SKILLS.rideWheel; tools/inspect/wheelRide.test.ts 2/2 (in gates.yml): ON every tier/setting (child
   E/N, middle N/E, expert N; 2 variants; rows sparse + top) 0 scrambles, 0 pond falls, across in 5.7-9.1 s (< a turn); OFF (the plant)
   every tier scrambles 1-33 a run, pond falls up to 6. No run row field added: calibration not recommitted.
3. Look: placeholder code shapes on the toy only, one hook (wheelDraw.ts drawWheel). Stills/clip: NOT DONE (Polish).
## Fairness numbers FLOWN (wheelFlights.data.ts: real engine, 80 ms tap, every phase): board tap / step-off window a turn
| row | Normal | Easy |
|---|---|---|
| teach R160 V60/E50, in | 100% 2.8 s / ride sets him down; walk 3.73, tap 3.87 | 100% 3.37 / walk 4.5, tap 4.93 |
| edge R180 V70/E60, edge | 100% 2.7 / walk 1.77, tap 2.87 | 100% 3.13 / walk 2.2 (under the ruled 2.5), tap 3.5 |
| top R180 V70/E60, up 80/60 | 100% 2.7 / held jump 2.27 | 100% 3.13 / jump 4.07 |
| great R200 V70/E60, in | 100% 3.0 / walk 3.5, tap 3.43 | 100% 3.5 / walk 4.13, tap 4.1 |
Within 2 frames of the design's flight (2-6.md:11-15).
## Gate table (the CLAUDE.md list, once, on 07efe1abc2; logs in the member's scratchpad)
PASS: tsc; suite shards 1/3 (1463) and 2/3 (1038); BASE_PATH build + chunkcheck; artcheck; knowncheck; roadmapcheck (unshallowed); kbdcheck;
coveragecheck; registrycheck (10 stages); seedlist 1-1 --check (161); the CI tool line with wheelRide.test.ts (222 pass); lockall vs main
(102/102 unchanged); drawcheck (577 s); clipcheck (83 known); buildcheck (1-1 p95 116 ms).
RED, MINE: generalitycheck: `RealPlay('2-6'` at src/game/gen2/wheelFlights.ts:90; shard 3/3: 30 fails, all generality.test.ts, the same
literal. NEXT STEP 1. The branch does not ship until it is fixed.
RED, INHERITED: tierBots.test.ts "replay exactly as committed": the run row has ENG-24's `ontoLog`/`fromLog`, the committed calibration
does not; identical on origin/t-meter-3@42459a5c (run in a clean worktree). Not touched here: whoever recommits ENG-24's calibration.
## What the 2-6 builder wires
2-6's kit adds `wheels: W2_WHEELS` (not in w2Manifest: no shipped roll moved); a wheel is a jetty plus the street `{ place: { kind:
'wheel', after: 'jetty', row } }` (the row decides all); a new row is flown (`npx tsx tools/engine/wheelflights.ts --write`) and its
table committed; a flag at a wheel stands on the jetty (2-6.md:48). The tower keeps room under the jetty for the pond itself.
## What ART-W2B must paint (Pokey drawn 89.1 px, heroSprite.ts:30)
Rim + spokes behind the buckets: R160/180/200 = 320/360/400 px across (3.6/4.0/4.5 Pokeys), the sweep 440/480/520 px (4.9/5.4/5.8).
Bucket: a trough 120 px wide (1.35 Pokeys) x ~34 px walls (0.38), floor = the platform top, 16 px thick; dry and spilling frames. Pond:
sweep +-160 px (R180: 800 px), surface 160 px under the bottom floor. The millrace lip. Hook: wheelDraw.ts drawWheel(ctx, wheel, buckets, seen).
## Polish check
NOT MET: no still or clip of the wheel. reference/qa-reports/ENG-26/stills.mjs (the toy swapped into the live engine) does not take: the page
keeps 2-6's world (stills/swap-failed-edge-land.png). The ride is proven on the engine and by the bots, not on a screen. NEXT STEP 5.
## Pushback (rulings, lead 7:25 PM ET)
2-6.md:7's direction vs its flight: built as flown, the doc is corrected (step 3). Easy floor = the walk-off (step 2). Easy V50/V60 as
flown, the listed test row, the optional fields on Architect types: accepted.
## EXACT NEXT STEPS for ENG-26b
1. RED (mine): `flyWheel(L, setting, stageId)` as landFlights.ts flyLandFlights takes it; tools/engine/wheelflights.ts and wheel.test.ts
   hand in a World 2 id from world data; re-run generalitycheck, generality.test.ts, wheelflights --check, wheel.test.ts.
2. Easy floor = walk: wheelFaults reads f.walk.window on Easy; slower easyV for edge and sparse (Easy walk 2.2 s), fly (--write), re-run
   wheel.test.ts + wheelRide.test.ts (the bot steps off 'edge' with f.tap: it may then walk on Easy).
3. Correct 2-6.md:7: the bottom moves toward the JETTY (wheel26.ts:10-12).
4. A piece layer drawn BEFORE the platforms ('back': stagePiece.types.ts PieceLayer + engine.ts render); wheelPiece.ts onto it (2-6.md:22).
5. `?fixture=wheel` (DEV only, chaseFixtureStage.ts pattern) on wheelToys.kitFor('edge'); stills board / mid-ride / step-off both ways; a
   clip naming the board and step-off frames (D63).
6. The meter's wheel channel (route move + score.ts; coveragecheck is green only because no stage lays one).
7. Perf: per wheel per frame 1 save/restore, 2 arcs, 1 spoke path, 4N fillRects (N=6: 24), untimed; time it with the painted art.
8. After ENG-285 (in-air turn): wheelflights --check and wheelRide.test.ts again.
9. For INT-13: optional fields Platform.wheel (types.ts), RiverZone.wheelPond (river.ts), PlaceRule 'wheel' + WorldManifest.wheels (gen2/types.ts).
## Learned
Axle state outside a platform must move with every stage shift (the lip check caught it). A new floor-like thing (a pond) joins every tower
read (catches, falls, extent). A bot skill on a moving floor reads the engine's standingOn and holds its commitment across frames. And:
run generalitycheck on a new engine file before the push (a stage id in a flight helper is still a stage id in engine code).
## Method update
level.md rule 24: fly the PIECE the game runs (not a copy), keep the flight as a committed table a test re-flies, and refuse any layout but
the flown one. Turnover note: reference/handoffs/engine-core.md §0zm.

# ENG-26b (t-eng-26, 11-18): the wheel finished. Code head fa8a92bf (gates run on it); report commit after
Method used: reference/methods/level.md rules 21/23/24, engine-core.md §4, ENG-26's EXACT NEXT STEPS 1-7 in order. Lessons applied: D40 (built in
order; nothing patched that ART-W2B replaces), D43 (no stage id in engine code), D57/D87 (inbox at each push; every long run in the
background), D59 (nothing left running at the stop), D63/D69 (a clip of the whole action, each claimed action named by frame, every press
lift-checked), D75 (the fixture is the gen2 toy row, not a hand stage), D79 (the whole screen judged), D81/D86 (the full CLAUDE.md list).
## Steps
1. DONE: generality GREEN. `flyWheel(L, setting, stageId)`; world data names the stage (w2.ts `W2_WHEEL_STAGE`); wheelflights.ts
   WORLD_WHEELS carries `{ stage, rows }`. generalitycheck PASS (26 known, none new); generality.test 39/39.
2. DONE + planted: Easy's floor is the WALK-off (wheelLay.ts `stepFault`, in wheelFaults). Planted RED with the old table: wheel.test 4 fails
   naming "the walk off onto the street is open 2.2 s a turn, under the 2.5 s easy asks". Easy edge and toy sparse V60 -> V50 (flown in
   steps of 2: V52 is 2.50 s exactly, no margin; V50 2.63 s). Table re-flown (--write, 10 rows); wheel.test 8/8; wheelRide 2/2 (Easy bots
   step off V50 clean).
3. DONE: 2-6.md:7 corrected (the bottom moves toward the JETTY, as wheel26.ts:9-11 flew it). The file lives on t-design-26 (f596350d), not
   on this base, so it is brought onto t-eng-26 with the one-line fix: the integrator merges it (same base text, one line changed).
4. DONE + planted, with a FIND: layer 'back' (stagePiece.types.ts; ordered before 'world'). On the real page the wheel on 'back' was
   INVISIBLE (stills-26b, first shoot): the soil of a bank ABOVE runs all the way down through the sweep (protoArt.ts drawProtoScene's
   ground pass, after the engine's platform pass). Proven by a pixel bisect (paint kit off: wheel shows; banks thinned: wheel shows).
   Fix: drawProtoScene takes `afterGround` (called after the soil, before trunks and ledges); engine.ts hands it its ONE `drawBack`
   (drawn before the platforms instead when the ground is code-drawn). pieceHook.test pins both; RED with the hook call removed.
5. DONE (one direction on the page): `?fixture=wheel` [&wheel=row] (src/game/wheelFixtureStage.ts, DEV only; the toys' ONE kit, wheelToys.ts
   re-exports it), and reference/qa-reports/ENG-26/wheelClip.mjs (frame-stepped, every press lift-checked, steps off in the FLOWN window,
   exit 3 on no board / pond / no street). Clips OK, each action named by frame (stills-26b/):
   | clip | board | step-off press | landed |
   |---|---|---|---|
   | edge Normal upright (tap hop) | f17 | f148 | f155 |
   | edge Easy upright (WALK off) | f15 | f153 | f158 |
   | edge Normal sideways | f16 | f139 | f146 |
   | edge Easy sideways | f14 | f143 | f148 |
   | top Normal sideways (held jump off the top) | f16 | f119 | f127 |
   NOT DONE: travelling RIGHT on the page. `?fixture=wheel-right` (the toy run) lays no wheel: it is rolled with no graph, so `required`
   cannot place the section, and with the meadow left out of the middle phases the pool runs dry (pipeline.ts "no section fits node n2").
   The rightward wheel is proven by the engine only (wheel.test 'turned the other way round': the mirrored lay clean, the flight identical).
   And the toy TOWER never turns right: seeds 1-300, rows edge and top, both settings, every clean one-wheel roll travels LEFT (probe in a
   separate worktree, 9:18 PM ET).
   The fixture keeps the id; EXACT NEXT STEP below.
6. DONE + planted: the meter's wheel channel. route.ts rides a wheel as ONE move 'wheel' (jetty -> street; buckets no route floor; dt half
   a bucket period + half a turn); score.ts `wheelChallenges` ('wheel-board': 0 bits when every moment boards; 'wheel-off': windowBits over
   the turn of the flown step window, the easiest way; none for an 'in' street; cost soft: the pond); unflown row refused ('move:wheel').
   meter-coverage.json `move:wheel` (bot SKILLS.rideWheel, rows 20/25). Planted RED before: the meter REFUSED the toy ("unpriced piece
   platform:moving", every row, both settings). tools/difficulty/wheelChannel.test.ts 4/4 (in gates.yml's tool line); coveragecheck PASS.
   Prices: edge N 2.73 / E 2.67 bits, top N 3.02 / E 2.49, teach board only (0).
7. DONE (placeholder): the wheel's draw 0.020 ms a frame upright, 0.021 sideways (300 frames each, Chromium, dev build, dsf 2): 0.25% of
   the 8 ms design budget. Whole frames 8.7 / 15.8 ms on that run are a dev build on 4 cores at load 6 (the gate suite running): not a
   phone figure. Time it again with ART-W2B's painted wheel.
8. WAITS for ENG-285 (tomorrow), as the packet says.
9. For INT-13: unchanged from ENG-26 (Platform.wheel, RiverZone.wheelPond, PlaceRule 'wheel', WorldManifest.wheels), plus PieceLayer 'back'
   (stagePiece.types.ts) and drawProtoScene's optional `afterGround` (protoArt.ts).
## Gate table (the CLAUDE.md list, once, on fa8a92bf; 8:25-9:58 PM ET; logs in the member's scratchpad)
| gate | result |
|---|---|
| tsc | PASS |
| unit suite (the CLAUDE.md globs, one run) | PASS: 3803 tests, 3801 pass, 0 fail, 2 todo (1779 s) |
| BASE_PATH build + chunkcheck | PASS |
| artcheck, knowncheck, generalitycheck, roadmapcheck (unshallowed) | PASS each |
| coveragecheck | PASS (12 built stages; the toy's move:wheel priced) |
| wheelflights --check | PASS (10 rows) |
| seedlist 1-1 --check | PASS (161) |
| CI tool line (gates.yml:100, with wheelChannel.test.ts) | PASS: 226 pass, 0 fail |
| tierBots.test.ts | RED, INHERITED: 'replay exactly as committed' differs only by ENG-24's `fromLog`/`ontoLog` (packet: INT-12 fixed it as 25b3bddc; not touched here) |
| lockall vs 908ee7e5 (ENG-26's head, proven = main) | PASS: 102/102 unchanged |
| drawcheck | PASS (576 s) |
| clipcheck | PASS (83 known) |
| kbdcheck | PASS (its re-shot stills reverted, not mine) |
| buildcheck | PASS (1-1 p95 96 ms Normal, 59 ms Easy) |
| every proven seed list (registrycheck --lists: 1-1..1-8, 2-1, 2-2) | 1-1..1-8 PASS, 2-2 PASS; **2-1 RED, INHERITED**: seeds 3, 9, 28, 83, 86, 100 "replay differs from its search" (both settings; quiet 4.1-4.5 s over the 4 s line). The SAME on the base 908ee7e5 (run in a clean worktree, 9:58 PM ET), and lockall shows 2-1 unchanged by this branch. Not fixed here (2-1's list is not the wheel's); whoever owns 2-1's list rebuilds it (`npx tsx tools/engine/seedlist.ts 2-1`). ENG-26 ran only 1-1's list, so this was unseen. |
Also: the dev fixtures ship as dead code: the bundle's oldgen chunk holds the wheel fixture's toy kit (and the chase fixture's), never run
outside a dev build (chunkcheck passes). Suggestion: an inline `import.meta.env.DEV &&` at the stageGenerator/App/stageSheets call sites
so the build drops both.
## Polish check
- The whole action reads on the real page, upright and sideways, Normal and Easy: board, ride, step-off, land (stills-26b/*.jpg, clips).
- NOT POLISHED, named: the wheel is ENG-26's placeholder (flat brown boxes and lines, wheelDraw.ts), brown on the brown soil; it reads only
  just. That is ART-W2B's painting (the one function it replaces), not patched here (D40).
- The toy tower stands inside earth columns (its storeys are 90 px banks whose soil runs down): the fixture's look, not 2-6's.
- Sideways the camera keeps Pokey low, so the wheel's lower half leaves the screen on the ride up; the caption bar in the clips is the
  tool's overlay, not the game's.
- Not shot: travelling right on the page (above).
## Note for the meter's owner
Easy's step-off prices nearly as Normal (edge 2.67 vs 2.73 bits): a slower wheel stretches the window and the turn alike, so window/turn is
about the same. If Easy should read easier, that is the channel's model (windowBits over the turn vs an absolute window), a Designer call.
## Mid-run slip (named)
At 8:28 PM ET I edited src/game/wheelFixtureStage.ts in the gate tree while the suite ran (the rightward try), and reverted it within a
minute. Only `toyStage(..., 'right')` reads that code and no test calls it, so no gate result could change. Further tries went to a
separate worktree.
## EXACT NEXT STEPS
1. Rightward on the page: a toy whose wheel storey runs RIGHT (a tower kit whose storey before the wheel runs right, or the toy run given
   a graph: toyWorld has none for 'sprint'); then `node reference/qa-reports/ENG-26/wheelClip.mjs <port> <out> normal up wheel-right edge`
   and sideways, Normal and Easy.
2. After ENG-285: `npx tsx tools/engine/wheelflights.ts --check`, wheel.test.ts, wheelRide.test.ts; re-fly (--write) if the air changed.
3. After ART-W2B: time the painted wheel (the step-7 probe), drawcheck on the fixture, stills again.
## Learned
- A layer named "behind the platforms" is not one place in the frame: the painted ground draws soil AND ledges in one pass, after the
  engine's platform pass. Find where the occluder is drawn (a canvas-call trace, then a pixel bisect) before choosing a layer.
- A fixture is proven by the page, not the build: the toy run's kit "existed" since ENG-26 and had never laid a wheel.
- Never edit the tree a gate run is reading; probe in a second worktree.
## Method update
methods/render-fix.md (proposed): a new piece layer is judged on the real page over EVERY ground the worlds draw (painted soil, code
terrain, a bank wall), with a still; the order test pins the protoArt pass too, not just engine.ts. level.md rule 24 (proposed addition):
the flight table's stage comes from world data.
