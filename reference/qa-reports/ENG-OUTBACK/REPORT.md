# ENG-OUTBACK REPORT (engine; R-165.583, R-165.584, R-165.585)

## EXACT NEXT STEP (box 1, started 9:15:46 PM ET (from date); hand-over written 9:25 PM ET (from date); branch t-eng-outback, head: see the lead message / git ls-remote)
STATE: (A) FIXED, RED-first, pushed (e10e208f5). (B) TRACED: the engine side agrees by construction; one HUD fallback NOT proved either
   way (below). (C) NOT STARTED (no bot code written). Nothing landed on t-build-28-wip. No freeze, no gates beyond tsc, generality and the
   river/flood suites. The lead has the step-4 table for (A) only (message sent with this hand-over).
NEXT, in order:
   1. READ THE LEAD'S REPLY to the (A) table. Then (C), RED first, per the packet: an out-and-back toy (the goal behind the spawn, an open
      road to a sealed exit, Dot's 'must' line at the door); RED on be2ebe7d2 AND on e10e208f5 (A does not touch the bot). The fix point:
      tools/inspect/firsttimer.ts:5807, `if (!this.hunt && told && e.cast && ...)` hunts only `e.enemies` (:5808) and only when `e.cast`
      is set. Make it: at a sealed exit after Dot's line, turn back for the nearest unmet goal item of the stage's goal kind (cages =
      collectibles of type 'cage' not yet opened; petals; animals = enemies), cast or not. KEEP the measurement guard's intent (the
      comment at :5805: 5-9's Easy goal comes from the kid's runs, firstTimerBot.test.ts:177 KID_RUNS_59): rule 28 on every listed stage,
      re-record KID_RUNS_59 under R-165.496 only if it moves (5-9's Easy goal stays 5).
   2. (A)'s rule 28: castBots on EVERY listed stage vs its record. (A) changes only a stage whose built data has `flood` (w2Finish's remap is
      a no-op without one; floodRiverIndex.test.ts test 1 finds only 2-8 among the listed stages laying a flood, layouts 1-3, both settings),
      so every other row must come back identical: run it, do not assume it.
   3. TRACE the moved 2-8 rows below that (A) does not explain: kid/adult PASS rose (kid Normal 4 -> 22) although the bot still walks home
      first (C unfixed: 'stranded goal 0/4' is still their top fail). Run kid Normal seed 30 on be2ebe7d2 and on e10e208f5 with the
      per-frame trace (BUILD-28 bots-s19/run28.mts.txt) and name what changed. Also name 'shrine rescued xN' (now the top fail for
      child/middle/expert): a fall the shrine catches, where.
   4. (B)'s open point: src/components/hud/VineHud.tsx:112 shows `targetObjectiveCount || levelConfig.targetCount`; until the engine's
      first onProgressUpdate (engine.ts:3768) the HUD falls back to the RAW level config (worldsData: 2-8 says 3; the engine plays 4 on
      Normal). Check which levelConfig the App hands VineHud and whether any frame or card shows 3. If one does: RED test, fix (the HUD
      reads the stage's goal, never the raw config), plant.
   5. Then the packet's steps 4-5 (castBots x40 both settings after C, table to the lead BEFORE landing; pre-freeze vs main 49fdc8cb6,
      freeze, gates on the frozen head, lock --check with the key-set diff, 6 shards, the CI line, tierBots; land by ff or merge only
      after the lead reads step 4). The stage lock WILL move for 2-8 (its flood waters' river indices change): that move is intended (A).

## 1. Done-items
(A) R-165.583 THE SAFE MARSH THAT KILLS: ROOT FOUND AND FIXED.
- ROOT: src/game/gen2/worlds/w2.ts:565 (before the fix) `st.rivers = rivers.sort((a, b) => a.x0 - b.x0)`. World 2's finish runs AFTER the
  pipeline (gen2/game.ts:163 entry.finish; listed.ts:75; curate.ts:72; the toys' `world:`), and the pipeline laid the flood first
  (pipeline.ts:4368 layFlood), whose waters name their river by its INDEX (flood.ts:57 FloodWater.river; floodLay.ts:53/77 `river: i`).
  The engine raises `rivers[w.river]` to each water's level every frame (engine.ts:1995-2001). After the sort every 2-8 water named
  ANOTHER river (flood.mts.txt, seed 28 Normal: water 0, the teach marsh x 11381-12081 surface 941, named river 0, the parade marsh
  x 2354-3154). So the parade's live surface sat at y 880-941, 700 px over its own floor (y 1639); riverAt's window (river.ts:99,
  `y < surfaceY + RIVER_DEPTH`, 120) never held his fall through a dip, the safe splash-back (engine.ts:3006) never fired, and he fell
  to the pit line (levelHeight 1959 + 120 = 2079: the deaths BUILD-28 saw at y 2080-2104, as 'pit').
- NOT a dir -1 fault: the mirror (the right-running teach marsh at x 11389, way 1) was RED too (never set back), from the same skew.
- FIX (general, no stage id, seed or x): w2Finish remembers the river each flood water names before the sort and re-points it after
  (throws by name if one is lost). tsc PASS; generality check PASS (72 engine files, 26 literals, 26 known) at each step.
- TESTS (RED first, then GREEN; src/game/floodRiverIndex.test.ts, run by the CI glob src/game/*.test.ts):
  1. 'every flood water names the river it was laid from (x0, x1), on every listed stage with a flood, both settings': RED on be2ebe7d2
     (all 7 waters of 2-8 wrong on layouts 1-3, Normal and Easy), GREEN on e10e208f5.
  2. 'in the real engine (engineCoreHarness, nothing replaced), a drop through every dip of every SAFE marsh on a flood stage splashes him
     back, no life lost, either way': RED on be2ebe7d2, naming the frame: "2-8 normal: marsh x 2359-3159 (way -1) dip 2559-2659: not set
     back (deepest y 2158, floor 1694, live surface 880; past the water's depth at frame 10; lives 3 -> 2)", both dips, both settings, and
     the way-1 teach marsh's dips (not set back). GREEN on e10e208f5.
  PLANT: the fix removed IS be2ebe7d2's w2Finish; both tests were run RED on it in this box (outputs above), GREEN with it.
- River/flood suites whole on e10e208f5: flood, floodRiverIndex, gen2/floodLay, gen2/riverLay, gen2/riverLeft, gen2/riverSection, river,
  riverLook, riverRaft, riverTail: 72 pass, 0 fail.
- 2-8 castBots x40, every bot, both settings, on e10e208f5 (castBots-2-8-x40-e10e208f5.txt, rows .jsonl.gz), vs BUILD-28's be2ebe7d2 record:
  | bot    | Normal PASS before -> after | Normal lives before -> after         | Easy PASS before -> after | Easy lives before -> after | top fail after (Normal / Easy)                 |
  |--------|-----------------------------|--------------------------------------|---------------------------|----------------------------|------------------------------------------------|
  | kid    | 4 -> 22                     | 11 (pit 8, water 3) -> 0             | 10 -> 27                  | 1 (water 1) -> 0           | stranded 0/4 x8, shrine x8 / stranded 0/3 x9    |
  | adult  | 4 -> 18                     | 6 (pit 6) -> 0                       | 13 -> 22                  | 1 (water 1) -> 0           | stranded 0/4 x19 / stranded 0/3 x17             |
  | child  | 3 -> 28                     | 101 (pit 92, water 9) -> 9 (water 9) | 7 -> 36                   | 18 (water 18) -> 2 (water 2) | shrine x1 x10 / shrine x1 x3                  |
  | middle | 6 -> 35                     | 32 (pit 23, water 9) -> 0            | 9 -> 33                   | 12 (water 12) -> 2 (water 2) | shrine x1 x5 / shrine x1 x6                   |
  | expert | 7 -> 36                     | 19 (pit 15, water 4) -> 0            | (Normal only)             |                            | shrine x1 x3, stranded 0/4 x1                   |
  THE PARADE DEATHS ARE GONE: 0 pit lives on any bot, either setting (was 92 for the child alone). The water lives fell too (child Easy
  18 -> 2): the same skew put other waters' levels (the low road's close, the rises) on the wrong rivers. NOT TRACED: why the kid and the
  adult pass far more while (C) is unfixed (NEXT 3), and where 'shrine rescued' happens.
(B) R-165.584 THE GOAL COUNT: traced, no engine RED.
- BUILD-28's "targetCount 3" is the RAW level config (spawn28.mts.txt:8 prints generateAllLevels()'s cfg.targetCount, before the goals
  are set). The engine builds its stage as `withGoals(generateStage(config, 'normal'))` (engine.ts:1078); goals.ts:179 sets
  config.targetCount to Normal's goal, 4 (all 4 cages laid). goal.mts.txt: Normal: raw 3, engine 4, cages 4; Easy: raw 3, engine 3.
  The exit (engine.ts:3588 quotaMet, :3669 isObjectiveComplete), Dot's goal line (:3603-3608 `need`) and the HUD callback (:3768-3770)
  all read that same engine field: what the player is told and what opens the door agree, 4 on Normal, 3 on Easy.
- OPEN (not proved either way): VineHud.tsx:112 falls back to the raw levelConfig.targetCount while targetObjectiveCount is 0 (NEXT 4).
- The stale constant: w2Arc28.ts CAGES_28 { normal 7, easy 5 } is read by nothing (BUILD-28 (a)); Content's, not this box's.
(C) R-165.585: NOT STARTED.

## 2. Polish check
No screen changed in this box (a data index fix); no stills shot. The player-facing result is the bots' 0 pit lives in the parade; the
parade's look (BUILD-28: "reads as a trench he could stand in") is unchanged and still a Content question, now that a fall there splashes him back.

## 3. Pushback
- The packet's first suspect (dir -1 handling) was wrong: the right-running mirror was RED too. The fault was an index into an array
  another stage pass re-sorts.
- (B) is not RED on the engine: the "3" was a probe reading the raw config. The general test the packet asks for would be GREEN by
  construction on the engine side; the only real risk is the HUD fallback (NEXT 4).

## 4. Suggestions
- A general gate (engine-worthy): anything that stores an INDEX into a stage array (rivers, platforms) across a pass that may reorder it
  should store the object or an id. FloodWater.river is an Architect's type: a packet to make it an id, if the lead agrees.

## 5. Unresolved
(C) whole; (A)'s rule 28 on every other listed stage (NEXT 2); the moved kid/adult rows and 'shrine rescued' (NEXT 3); (B)'s HUD fallback
(NEXT 4); the freeze, the gates and the landing (NEXT 5).

## 6. Method update
stage-fix.md: before blaming a lay's geometry for a fall that should be caught, print the LIVE zone the engine reads (its surfaceY after
the first update), not the lay's: here the lay was right and the engine's copy was moved by a stale index.

## 7. Turnover note
reference/handoffs/engine-core.md NOT rewritten this box (successor: add the trap "flood waters name rivers by index; w2Finish sorts").

LESSONS APPLIED: check the fact before acting on it (the live surface, not the lay's); RED first with the frame named; a pasted date for
every time; the packet's hypothesis tested, not assumed.
