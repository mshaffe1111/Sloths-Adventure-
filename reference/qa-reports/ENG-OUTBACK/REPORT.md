# ENG-OUTBACK REPORT (engine; R-165.583, R-165.584, R-165.585)

## EXACT NEXT STEP (box 1, started 9:15:46 PM ET (from date); hand-over written 9:32 PM ET (from date), the last box tonight (the lead: no successor until Matt restarts the team tomorrow); branch t-eng-outback, head: see the lead message / git ls-remote)
STATE: (A) FIXED, RED-first, pushed (e10e208f5). NEW: on the fix the top 'stranded' cause is the little ones' line FREEZING at the
   far turn (adult seed 18, NEXT 3a), not the bot. (B) CLOSED, no defect (the engine and the HUD both show the number that opens the
   door; the HUD waits for it, UI-22). (C) NOT STARTED (no bot code written). Nothing landed on t-build-28-wip. No freeze, no gates beyond tsc, generality and the
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
   3. TRACE the moved 2-8 rows (started; run28.mts.txt, run-kid30-child12-*.txt in this folder):
      (a) kid Normal seed 30: on be2ebe7d2 'sealed door t 47 x 226, goal 0/4' (straight home); on e10e208f5 'shrine t 160.8, goal 4/4'
          (a win). So (A) changed the bot's ROAD, not only its lives. Per-second x (kidx.mts.txt, kidx-kid30-*.txt): on BOTH heads he
          walks RIGHT from the spawn (x 6699) for 8 s, to x 8581; on be2ebe7d2 he turns there and walks home (x 226 at 44 s); on the fix
          he goes on right for the cages. Seed 30's rivers (flood.mts 30 on the fix): river 3 is x 8356-8498, surface 847, on that way
          right, just before where he turned. On be2ebe7d2 it took water 2's level (1648 -> 1628), 780 px under its own surface. That
          assumes seed 30's pre-sort indices follow seed 28's printed pattern (water j -> river 0,2,3,4,5,6,7), which is INFERRED, not
          printed for seed 30 on the base. So BUILD-28's "every bot walks straight home first" was largely (A)'s skew: the bot's route
          already runs out and back (it walks right first). (C) STILL LIVES on the seeds that stay 'stranded goal 0/N' (adult Normal
          19/40, kid 8/40). TRACED ONE (cagenear.mts.txt, cagenear-adult-normal-18-7a7efac76.txt): adult Normal seed 18 on the fix
          reaches and OPENS ALL FOUR cages (each within 30 px, open by 59 s); all four little ones join and follow (the line at x
          20518-20632 at 70 s); he turns at the far end (x 21716 at 70 s); and at ~75-80 s THE LINE FREEZES at x 20858-20960, y 680, state
          'follow', and never moves again while he walks home (x 229 at 160 s): goal 0/4, 'stranded'. So the top 'stranded' cause on the
          fix is NOT the bot skipping cages (BUILD-28's (C)) but the FOLLOW LINE stopping at the out-and-back's far turn: an engine
          question (follow.ts trail / stepLine / wallCap at the turn, where he leaves the out leg, y ~680-790, for the home leg, y ~1564).
          PRE-EXISTING, NOT FROM (A): the same probe on be2ebe7d2 prints the same run frame for frame (same cages opened, same freeze at
          x 20858-20960, y 680 from ~80 s). A real player who takes the same way down would lose the line too. NEXT for a fresh box: (i) still the far turn on seed 18
          (stills tool, both orientations) to see the way he goes down and where the line stands; (ii) per-frame his x, y and the line's
          s, x, y for 65-85 s, to name the frame and the follow rule that holds them (follow.ts); (iii) RED toy: an out-and-back turn
          where he drops a storey, the line must follow him down (or Dot must say why not), RED on 7a7efac76; (iv) only then (C)'s bot
          turn-back (firsttimer.ts:5807), if any seed still walks home with cages shut. Check 2-3 seeds of each 'stranded' bot first
          (adult 18, 36, 11; kid 24, 5) to see if they all freeze at the turn.
      (b) 'shrine rescued xN' is the PARADE again, without a life: child Normal seed 12 on e10e208f5 splashed back 8 times at the dip
          x 2554-2654 (stuck 'set down here 8 times' at x 2579), then the bot's rescue at x 3221 (the splash-back point is 3224). A child
          missing a flat 100-px hop 8 times is a bot-skill question (fly-2-8: maxGap(0) single 143.3 px) or a lay one (the run-up: he is
          set back 70 px from the marsh's edge, then two 200-px floor pieces and a dip; where does his jump start?). Trace his take-off x
          on one splash; do not change the bot until the lead rules (level.md rule 22).
   4. (B) needs nothing more from the engine (closed below). Content's: the stale CAGES_28 constant and its wrong comment (w2Arc28.ts:98-99).
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
  NOTHING ELSE MOVED (data): every listed stage built on layouts 1-3, both settings, hashed on be2ebe7d2 and on e10e208f5
  (hashall.mts.txt, hash-listed-*.txt): 102 rows, 96 identical; the 6 that differ are 2-8's (its flood indices). The engine code is
  unchanged (the fix is in World 2's finish), so every other stage's bot runs must match too; the castBots run on every listed stage
  (rule 28) is still owed (NEXT 2), not run tonight by the lead's word.
  THE PARADE DEATHS ARE GONE: 0 pit lives on any bot, either setting (was 92 for the child alone). The water lives fell too (child Easy
  18 -> 2): the same skew put other waters' levels (the low road's close, the rises) on the wrong rivers. NOT TRACED: why the kid and the
  adult pass far more while (C) is unfixed (NEXT 3), and where 'shrine rescued' happens.
(B) R-165.584 THE GOAL COUNT: traced, no engine RED.
- BUILD-28's "targetCount 3" is the RAW level config (spawn28.mts.txt:8 prints generateAllLevels()'s cfg.targetCount, before the goals
  are set). The engine builds its stage as `withGoals(generateStage(config, 'normal'))` (engine.ts:1078); goals.ts:179 sets
  config.targetCount to Normal's goal, 4 (all 4 cages laid). goal.mts.txt: Normal: raw 3, engine 4, cages 4; Easy: raw 3, engine 3.
  The exit (engine.ts:3588 quotaMet, :3669 isObjectiveComplete), Dot's goal line (:3603-3608 `need`) and the HUD callback (:3768-3770)
  all read that same engine field: what the player is told and what opens the door agree, 4 on Normal, 3 on Easy.
- THE HUD: App.tsx:854 sends 0 until the engine's first frame (UI-22: "the plan's number can be wrong"); VineHud.tsx:120 `counting`
  hides the goal card (:623) and the counter (:249 ckind 'none') while it is 0, and every label (:340, :359) reads the engine's target. So
  the raw 3 is never shown. CLOSED: no defect. No new test: a test of the engine against itself cannot go RED; UI-22's own tests stand
  (src/components/hud/goalCardClock.test.ts, src/game/stagePlanGoals.test.ts).
- The stale constant: w2Arc28.ts CAGES_28 { normal 7, easy 5 } is read by nothing (BUILD-28 (a)); Content's, not this box's.
(C) R-165.585: NOT STARTED.

## 2. Polish check
No screen changed in this box (a data index fix); no stills shot. The player-facing result is the bots' 0 pit lives in the parade; the
parade's look (BUILD-28: "reads as a trench he could stand in") is unchanged and still a Content question, now that a fall there splashes him back.

## 3. Pushback
- The packet's first suspect (dir -1 handling) was wrong: the right-running mirror was RED too. The fault was an index into an array
  another stage pass re-sorts.
- (B) is not a defect: the "3" was a probe reading the raw config; the player is shown 4 and the door opens at 4 (Normal).

## 4. Suggestions
- A general gate (engine-worthy): anything that stores an INDEX into a stage array (rivers, platforms) across a pass that may reorder it
  should store the object or an id. FloodWater.river is an Architect's type: a packet to make it an id, if the lead agrees.

## 5. Unresolved
(C) whole; (A)'s rule 28 on every other listed stage (NEXT 2); the moved kid/adult rows and 'shrine rescued' (NEXT 3); the freeze,
the gates and the landing (NEXT 5). Not run in this box: the full checks list (vite build, perf gates, paintcheck, lock --check, shards,
tierBots), by the lead's word (no long runs tonight).

## 6. Method update
stage-fix.md: before blaming a lay's geometry for a fall that should be caught, print the LIVE zone the engine reads (its surfaceY after
the first update), not the lay's: here the lay was right and the engine's copy was moved by a stale index.

## 7. Turnover note
reference/handoffs/engine-core.md §0zs-OUTBACK added (what changed, the tests, three traps, the open (C)), in this box's last commit.

LESSONS APPLIED: check the fact before acting on it (the live surface, not the lay's); RED first with the frame named; a pasted date for
every time; the packet's hypothesis tested, not assumed.
