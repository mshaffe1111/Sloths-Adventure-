# INT-10d report: the petal rule decoupled, then link #4 (1-6 + the 1-7 eagle). Branch t-int-10b. Opus 5.5 high. IN PROGRESS
Started 1:55 PM ET (packet 1:54 PM). Every time below pasted from `TZ=America/New_York date`.

## Done-items
1. **Placement is main's lay again** (2cc8be2a): pipeline.ts fillSockets lays a pickup socket at `k.x` on its own piece as main does
   (node-fixed counts `pickLeft` kept); petals.ts fillGaps as main: ENG-PETAL's ledge clip to walked spans and ENG-16E's off-path guard
   (pit floors, hurt floors, creaky-limb jumps) out; walkPetals (the built-stage move/strip) and walkedSpan.ts walkedPiece deleted (new
   replaces old). Kept (not the walked model): 1-4's lid head stop in climb trails (vineField shutLidFeet), pairPetals' 38 px one-hand
   reach, 1-6's arcs (Collectible.arc, never counted), the harvest top-up fix (8-2), the LOW brief (now ruling C below). Searched for a
   2-1 river/arc or log/pad petal rule on the branch (`git diff origin/main...HEAD` over src/game for petal+ride/log/pad/river): none
   exists beyond main, so nothing to keep there.
2. **The door counts only walked petals** (2cc8be2a): petals.ts `markWalked` stamps `Collectible.walked` on every flower/leaf of a gen2
   stage, last in stageGenerator finishStage (after petalPass and pairPetals, so it judges the stage the game plays): standing on a
   solid/creaky piece -> true only inside its walked span (ENG-PETAL's model with ruling A, WALKED_MIN, 2 px give) on a piece off no miss;
   on a ride (log, pad, lift) -> true; in the air -> true unless inside a fall below its lower lip. goals.ts goalCounts skips
   `walked === false` (plus arc and crumbling as before). The HUD counter and the engine's tally count every petal picked (no filter
   there: grep of engine.ts), so an off-path petal still shows and still adds; it never seals a door.
3. **Ruling C** (lead 2:08 PM ET; f3df3855): a LOW brief's fill runs only over stretches longer than SPREAD_MAX (2 x 840 + 400 px, the
   spread test's 2 screens), petals.ts fillGaps `min`, so it lays the petals that close such a stretch and no more.
4. **Planted** (reference/qa-reports/INT-10d/planted-door-off.txt): (a) petalFill.test 1 and 3 (a fill petal on a soft pit's floor / a
   thorn bed is laid by main's fill and never counted) and walkedPath.test F (1-6 layouts 1-3: petals off the path exist; the goal is
   within what every run passes; with the exclusion off the share asks more than every run passes) all RED with `x.walked !== false`
   taken out of goalCounts, GREEN with it. (b) walkedPath.test G: 6-2 layout 1 Normal holds main's 73 petals (the walked lay left 5).
   E (ruling C): a 2.8-screen bare stretch on a LOW stage gets petals only inside it and none left over 2 screens, 1.5 screens gets
   none; RED on the old LOW skip. ENG-PETAL's toys restated to the door rule (A, A2, C via markWalked; D: on 1-6 L1-3, 1-1, 1-7, 6-1,
   7-3, 8-2 both settings every standing petal is counted exactly when its span says so); walkedSpan.test's 1-6 socket case is D now;
   petalFill.test restated (ENG-16E's creaky-limb-arc toy dropped: no door equivalent, the arc off a required limb is walked).
5. **petals.test GREEN** 3/3 (spread: 13 reds -> 0), with petalArcs, fieldPetals, goalsGathers, petalFill: 21/21 (2:12 PM run).
6. **1-6 at the band under main's lay** (screens.mts, Normal layouts 1-5 mean, petals per upright screen): 1-1 1.52, 1-2 1.06, 1-3 1.72,
   1-5 1.42, **1-6 113 petals, 1.05**, 1-7 0.73, 1-8 0.76. 1-6 sits with the other LOW stage (1-2); no bank rows to remove (INT-10c took
   them out), arcs kept (bonus, never counted). petalArcs.test's band check passes (0.86-1.2).
7. **FIX-21 cherry-picked** (827436784 -> b80451f6): one import conflict in pipeline.ts (kept HEAD's physics imports, took
   comboGuaranteedAt/missionOf); bounceAlone.test 2/2.

## Pushback
- None on the ruling. One note: the band numbers in petalArcs.test's title (1-3 0.86, 1-5 1.04) were measured on the stripped lay; under
  main's lay World 1 reads 1.42-1.72. The test still guards 1-6; the title is history.
