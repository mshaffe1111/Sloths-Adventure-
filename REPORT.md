# EN-C: one clock for every timer (GAME-MAP A14)

Branch `t-engine-clock`, base `origin/t-engine-yield` @347d50fa. No PR. Nothing on screen changed, so there are no screenshots to judge.
## Done, with proof
1. **`src/game/clock.ts`.** One walk, `cycleRead`, under every timer; `ClockDef` (ADR-003 decision 4) made ready by `beatOf` and read
   by `beatAt` / `clockAt`; `stageClock(defs, easy)` owns game time (`step(dt)` only: a pause holds it; no wall clock, no random
   roll). A read gives the phase, seconds into it, seconds left, whole cycles, and seconds to the next 'on'. `checkClock` refuses an
   'on' not entered from a 'warn', a phase with no length, and `easyStretch` under 1; at run time a stretch under 1 counts as 1, so
   Easy can never be faster. Easy stretches the offset too, so lanes keep their stagger.
   Proof: `clock.test.ts`, 8 tests written first (phases in order, warn before on, Easy never shorter, offsets stagger, pause holds,
   the stage clock's time equals the engine's own `gameTime += dt` sum bit for bit). Mutation tried: letting Easy shrink fails it.
2. **Timers moved, each proven unchanged.** `clockMove.test.ts` keeps every old function frozen word for word and compares the live
   one with `Object.is`, about 2 million reads a group: the engine's frame sums (30 and 60 a second), tenths (where phase edges
   sit), a time before 0, and seeded rolls. Mutation tried: a one-rounding-step change in the walk fails it.
3. **`src/game/beatBrick.ts`.** The "on a beat" base for B5 pieces: a brick names a clock and says what it does while the clock is on
   ('bites' or 'gone'); the clock's warning is its tell. `brickFair` is the builder's check (warning long enough to read, every safe
   spell long enough to cross). Test-side example (`beatBrick.test.ts`): a snap-jaw stone safe on beats 1 to 3, biting on 4, its jaw
   opening through the warning; four stones a beat apart never bite two at once; a sinking pad. Mutation tried: biting during the
   warning fails 3 tests.
4. **`tools/engine/clockaudit.ts`** (test-side): every hazard beat a built stage carries, found by its fields. 102 stages x 2 layouts
   x 2 settings, 1,334 timers: **0 hurting with no warning, 0 stages where Easy is faster.** Shortest warnings: orchid 0.8 s, teapot
   0.9, spore 1.0, wind and thorn vine 1.1, nest and bolt 1.2, geyser 1.3, rock 1.4, surge fall 1.5, tide 1.8. Worth knowing: only
   rocks (3.8 to 4.7 s) and wind (5.4 to 5.6 s) are any slower on Easy today; every other beat is the same on both settings.

## Which timers moved (all bit-identical)
| Timer | Function |
|---|---|
| Falling rocks (World 4) | rockfall.ts `rockAt` |
| Zones: spores, wind, tide troughs (World 6), geysers (9), bolts (10) | zones.ts `zoneState` |
| Thorn vines (World 3), the awake one too | thornVine.ts `vinePhase` |
| Eagle nests; teapots and orchids (World 5); surging falls | `nestAt`; `potAt`, `orchidAt`; `surgeFlow` |
| Dot's gusts, river logs, lifts | `gustState`, `driftX`, `driftProgress`, `liftY`: cycle position from the clock (a lift's four stops stay its own sums) |
| The reach checker's four copies | realReach.ts `calmFor` reads `cyclePos` |

## Not moved, and why
- **6-8's rising tide (risingTide.ts `stepTide`).** Its surge beat only runs while the water rises: it stops for the warning, a hold
  and while he rests on a flag. On game time the surges would land at different moments, a change to play. It needs a clock that
  can be held; decide with the lead.
- **The swinging lianas (engine `vineClock`).** Equal to game time in play, but the reach checker and five tests set it by itself to
  try every swing phase. Merging it means changing those tools first.
- **River sluices (`RiverZone.flowT`):** a river a puzzle runs keeps its own time on purpose. **World 7 doors, World 2 pads and
  jaws, World 9 crust:** not in the code yet (B5 pieces; they start on `beatBrick`). One-shot timers that start on an event
  (crumble regrow, flood rise, drowsy linger) and drawing-only loops were left alone.

## Checks
- `npx tsc --noEmit -p .`: clean.
- Stage lock, recorded at 347d50fa before any edit and checked after: **102 of 102 unchanged** (`lockall --layouts 2`, both settings).
  Against the committed `lockall-main-0.9.5.json` only 1-1 differs, exactly as it does at the base (not from this branch).
- `npx tsx tools/engine/seedlist.ts 1-1 --check`: PASS, 200 seeds clean on both settings.
- Tests on the final code: the 3 new files plus every existing test file of a moved timer (rocks, zones, lifts, rivers, falls, Dot's
  flight, all of Worlds 3, 4 and 5): **459 tests, 0 failed** (2 are those files' own standing TODOs). Not run: the rest of the
  suite, drawcheck, clipcheck (nothing that draws changed). `roadmapcheck` cannot run here (shallow clone); `knowncheck` passes.
- Bytes: main JS 3,995,263 at base, **3,995,403 now (+140 B)**; the limit is 3,994,304, so it was 959 over and is 1,099 over. Only
  `cycleRead`, `cycle3` and `cyclePos` ship; `beatOf`, `stageClock`, `checkClock` and `beatBrick` are not imported by the game yet.

## Left, and the exact next step
1. Wire `stageClock` into the engine when the StageBrief runtime lands: build it at stage start from `brief.clocks`, call `step(dt)`
   on the line that does `gameTime += dt` (engine.ts 1503), and serve `ModeHost.clock(id)` from `read(id)`.
2. First B5 piece: a real snap-jaw stone = `BeatBrick` + art + `brickFair` in the builder with the crossing time as `safe`.
3. The rising tide's held clock, then move it behind a frozen-oracle test like the others.

## STILLNESS (the lead's follow-on, 9:03 PM ET; MAP-REVISIONS §1 and §8)
- **`src/game/stillness.ts`** (pure, 90 lines; not imported by the game yet, so 0 bytes shipped: main JS still 3,995,403).
  - The state: `stepStill` / `isStill` / `calm`. Still = on the ground at or under 25 px/s, or holding a vine without climbing (a
    liana's swing may carry him); never in the air. It takes `calmIn` to come in (Normal 0.5 s, Easy 0.35 s, in `STILLNESS`) and is
    gone the frame he moves. `calm` 0..1 is the tell the art lane will draw. No art, no player words.
  - The watcher contract: `watcherSees(watcher, inSight, still, covered)`. Movement in sight is always seen, in cover too; still in
    cover is unseen; still in the open is seen only by a watcher marked `seesStill`. `inCover` is the same place the bush hide uses.
- **Proof (`stillness.test.ts`, 9 tests written first):** the state's rules; Easy never harder; the contract's truth table; `inCover`
  agrees with watcher.ts `hidden` across a sweep; "moving" is the thorn vines' own line (`vineSees`) at every speed tried. The 1-7
  example runs watcher.ts's real rhythm and shadow: running between bushes he is spotted; frozen in the bush with calm fully in
  before the sweep, two passes cross him unseen; fidgeting in the bush or frozen in the open, the eagle sees him; a movement-only
  hunter loses him in that same open spot. Mutations tried (cover ignored, airborne counts, no calm-in): each fails 2 or 3 tests.
- **Checks:** tsc clean; stage lock 102 of 102 unchanged; 34 tests in the clock, brick, stillness and watcher files pass.
- **Open for the lead:** (a) World 5's spiders are `seesStill`, so a still Pokey in cover is still unseen by them; if touch must beat
  cover too it needs one more flag. (b) 1-7 today hides him by ducking in a bush with no calm-in; wiring this in changes that
  stage's play, so it is a design call plus a 1-1-style recalibration, not a refactor.
- **Next step:** the engine keeps one `StillState`, steps it beside `gameTime += dt`, and 1-7's `sees` (watcher.ts) reads
  `watcherSees({ seesStill: true }, ...)`; then thorn vines read `moving` (already proven the same line).
