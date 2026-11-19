# ENG-26 REPORT: 2-6's water wheel (NEW 1) and the bot skill rideWheel (NEW 2)
Branch t-eng-26 (from t-meter-3@42459a5c). Code head: HEADPLACEHOLDER. Method: reference/methods/level.md rules 21/23/24, engine-core.md §4.
Lessons applied: D40 (built on t-meter-3, nothing replaces it this sprint), D57/D87 (ReadNotifications at each push; long runs in the
background), D59 (a gate still running is UNRUN), D75 (proven on a rolled gen2 row, not a fixture), D81/D86 (the full list, drawcheck named).

## Done-items
1. NEW 1 the wheel: `src/game/wheel.ts` (pure: bucketAt, lips, sweep), `pieces/wheelPiece.ts` (moves each bucket and its rider by dx AND dy;
   the engine's carryVx), place `{ kind: 'wheel', after: <jetty>, row }` (gen2/wheelLay.ts layWheel: buckets + the safe pond; a tower's way
   up a storey, laid turned on a leftward storey), `wheelFaults` in checkStage (each fault in words), `W2_WHEELS` rows teach/edge/top/great.
   Toy: tools/inspect/wheelToys.ts (toy tower 2-95, World 2's ground, rolled as a listed test row). `src/game/gen2/wheel.test.ts` 7/7:
   GREEN as designed on both settings; RED by name with the street moved 90 px (and the engine agrees: its window 0.83 s < 1.5), a moved
   jetty, a bough in the sweep, a drowned ledge, no pond, an unflown row, an up street 100 px.
2. NEW 2 rideWheel (firsttimer.ts SKILLS): `tools/inspect/wheelRide.test.ts` 2/2 (added to gates.yml's tool line): ON, every tier on its
   settings (child E/N, middle N/E, expert N x 2 variants x rows sparse+top) boards, rides, steps off: 0 scrambles, 0 pond falls, across in
   under a turn (5.7-9.1 s). OFF (the plant): every tier scrambles bucket to bucket (1-33 a run) and falls in the pond (up to 6). tierBots:
   see the gate table (the skill acts only on a stage with a wheel; no draw moved).
3. The look: placeholder code shapes on the toy only (wheelDraw.ts `drawWheel`, the one function the art replaces). Stills: NOT DONE (Polish).
4. Gates: table below.

## Fairness numbers FLOWN (wheelFlights.data.ts; real engine, InputEngine 80 ms tap; every phase) - board tap / step-off window a turn
| row | Normal | Easy |
|---|---|---|
| teach R160 V60 (E50) in | 100% 2.8 s / ride sets him down; walk 3.73, tap 3.87 | 100% 3.37 / walk 4.5, tap 4.93 |
| edge R180 V70 (E60) edge | 100% 2.7 / walk 1.77 (11%), tap 2.87 (18%) | 100% 3.13 / walk 2.2, tap 3.5 |
| top R180 V70 (E60) up 80/60 | 100% 2.7 / held jump 2.27 (16%) | 100% 3.13 / jump 4.07 |
| great R200 V70 (E60) in | 100% 3.0 / walk 3.5, tap 3.43 | 100% 3.5 / walk 4.13, tap 4.1 |
Matches the design's flight within 2 frames (2-6.md:11-15; edge walk 1.77 vs 1.7, up80 2.27 = 2.27).

## Gate table (one run on the code head, the CLAUDE.md list)
GATEPLACEHOLDER

## What the 2-6 builder wires
- 2-6's kit adds `wheels: W2_WHEELS` (not in w2Manifest: no shipped roll moved). A wheel is two pieces: a jetty (any key) and the street
  `{ place: { kind: 'wheel', after: 'jetty', row } }`; the row decides everything (no dy/share). A new row: add it to W2_WHEELS, run
  `npx tsx tools/engine/wheelflights.ts --write`, commit the table (wheelFaults refuses an unflown row by name).
- The jetty's storey needs room under it for the pond (the tower keeps it: localExtent); a flag at a wheel stands on the jetty (2-6.md:48).
- Dot lines and the journal entry are the story keeper's (2-6.md:64-65); the meter does not price a wheel yet (Unresolved).

## What ART-W2B must paint (Pokey drawn 89.1 px, heroSprite.ts:30)
- The noria rim + spokes behind the buckets: rim through the bucket floors, R 160/180/200 = 320/360/400 px across (3.6/4.0/4.5 Pokeys);
  the sweep with buckets 440/480/520 px (4.9/5.4/5.8 Pokeys). The bucket: a trough 120 px wide (1.35 Pokeys) x ~34 px walls (0.38), its
  floor the platform's top, 16 px thick; dry and spilling frames. The pond: sweep +-160 px wide (R180: 800 px), surface 160 px under the
  bottom floor. The millrace lip. Hook: wheelDraw.ts drawWheel(ctx, wheel, buckets, seen).

## Polish check
- NOT MET: no still or clip of the wheel. The page probe (reference/qa-reports/ENG-26/stills.mjs: 2-6 loaded, the toy's laid stage swapped
  into the running engine) does not take: the page keeps 2-6's own world and camera (stills/swap-failed-edge-land.png: bamboo and plank of
  the hand build, no wheel). Stopped there on the lead's wind-down (6:54 PM). The ride is proven on the engine (wheel.test.ts carry, the
  bots' crossings), not on a screen. Nothing of the wheel's look is judged.
- EXACT NEXT STEP: a dev fixture as chaseFixtureStage.ts does (`?fixture=wheel`: stageGenerator.ts builds the toy (wheelToys.kitFor('edge'),
  World 2) under its own id in a DEV build only; App.tsx's fixture line), then shoot board / mid-ride / step-off, upright and sideways, and a
  clip naming the board frame and the step-off frame (2-6.md:50, D63). Placeholder shapes only, so the shots judge geometry and camera.

## Pushback
- 2-6.md:7 "the bottom moves toward the street side" contradicts its own flight (wheel26.ts:10-12: bottom toward the JETTY). Built as flown.
- "Step-off >= 2.5 s Easy" was read as the better of walk and tap (Easy edge walk-off 2.2 s); RULED 7:25 PM: the walk-off (next step 2).
- Easy V is the flown V50/V60 (2-6.md:15,21), not V x 0.85 (51/59.5): accepted. The listed test row (rule 23): accepted.
- Optional fields on Architect-owned types (next step 9): accepted.

## Unresolved: EXACT NEXT STEPS for ENG-26b (with the lead's rulings, 7:25 PM ET)
1. RED (mine): generality fails on `new RealPlay('2-6', 1)` at src/game/gen2/wheelFlights.ts:90 (a stage id in engine code); the suite's
   30 fails (shard 3, all src/game/gen2/generality.test.ts) are this one literal. Fix: `flyWheel(L, setting, stageId)` as landFlights.ts
   flyLandFlights takes it, the stage handed in by tools/engine/wheelflights.ts and wheel.test.ts from world data (a World 2 id from the
   stage table, never a literal in engine code); re-run generalitycheck, generality.test.ts, wheelflights --check, wheel.test.ts.
2. Ruling (1): Easy's 2.5 s floor is the WALK-off. wheelLay.ts wheelFaults reads `f.walk.window` (not the better of walk and tap) on Easy;
   give the edge row (and any row whose Easy walk is under 2.5 s: edge 2.2, sparse 2.2) a slower easyV, fly it (wheelflights --write),
   re-run wheel.test.ts and wheelRide.test.ts (the bot's Easy step-off may then walk: firsttimer.ts wheelRide reads f.tap for 'edge').
3. Ruling (2): correct 2-6.md:7 to the flight (the bottom moves toward the JETTY; wheel26.ts:10-12).
4. Ruling (6): a piece layer drawn BEFORE the platforms ('back': stagePiece.types.ts PieceLayer + engine.ts render) so the wheel sits
   behind the jetty and street (2-6.md:22); move wheelPiece.ts to it.
5. Ruling (6): `?fixture=wheel` (DEV only, chaseFixtureStage.ts pattern: stageGenerator.ts + App.tsx's fixture line) building
   wheelToys.kitFor('edge') on World 2; then stills board / mid-ride / step-off upright and sideways, and a clip naming the board and
   step-off frames (D63). reference/qa-reports/ENG-26/stills.mjs (a live-engine swap) does NOT work: the page keeps 2-6's world.
6. Ruling (6): the meter's wheel channel (a route move and score.ts channel; coveragecheck is green only because no stage lays one).
7. Perf: the placeholder per wheel per frame is 1 save/restore, 2 arcs, 1 spoke path, 4N fillRects (N=6: 24), untimed; time it with the
   painted art; drawcheck walks shipped stages (none lays a wheel).
8. ENG-285 (in-air turn) changes the air model: re-fly the table (wheelflights --check) and wheelRide.test.ts after it merges.
9. For INT-13 (ruling 5, accepted): optional fields on Architect-owned types: Platform.wheel (src/game/types.ts), RiverZone.wheelPond
   (src/game/river.ts), PlaceRule 'wheel' and WorldManifest.wheels (src/game/gen2/types.ts).
## Learned (for the next builder)
- Shared state outside a platform (an axle) must move with every stage shift; the fairness check's lip test caught it at once.
- A new floor-like thing (a pond) must join every tower read (catches, falls, extent), or the tower lays boughs through it.
- A bot skill on a moving floor reads the engine's standingOn, holds its commitment across frames, and drops presses decided before.

## Method update
level.md rule 24: fly with the PIECE the game will run (wheelFlights flies pieces/wheelPiece.ts, not a copy), keep the flight as a
committed table re-flown by a test, and let the fairness check refuse any layout but the flown one.

Turnover note: reference/handoffs/engine-core.md §0zm (this branch).
