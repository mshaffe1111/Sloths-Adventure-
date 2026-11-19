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
