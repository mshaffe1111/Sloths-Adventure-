# METER-3 REPORT: the meter prices a liana-to-log drop / log-to-liana catch (R-165.287) and a posted boa's read (R-165.286)
Meter/tools, t-meter-3 from origin/t-eng-24 (b0e94c85). Started 12:39 PM ET 11-18 (by `date`). Packet reference/packets/2026-11-18/METER-3.md.
Commits: ec5bea3d (R-165.287), f39cc186 (R-165.286), then this report's commit. No src/ file changed: route.ts, score.ts, the coverage
table, tests, gates.yml's test list. **Over the box: ended at about 65% real context (box 50%)**; gates were run, the scope was not cut.

## R-165.287: a liana over a log river (ENG-24's pieces, 2-4 NEW 1-2)
- **Route** (tools/inspect/route.ts): two new moves, `lianaDrop` (let go from a liana over the river: onto a log, or past the water onto
  the far bank, one let-go) and `logCatch` (jump off a riding log up to a liana). Where the near bank catches a liana over the river
  (levelCheck `lianaCaught`, the judge's own test), the route boards that river FROM THE AIR: no ground edge into its logs (under a liana
  the hop rule gives way and lianaRiverFaults holds the drop, so no rule vouches for the bank's board; 2-4.md: "2-1 boards logs from the
  bank; 2-4 boards from the AIR"). Where no bank catches it (the catch toy), the bank board stays and `logCatch` is added from each log
  `logCatches` passes. Stages with no liana over a river route exactly as before.
- **Channel** (score.ts `lianaChallenges`, MOVE_CHANNEL): drop = `windowBits(1, share)`, the share of let-go moments that land read by
  ENG-24's judge (gen2/riverLay.ts `lianaDrops`, the engine's flight); the worst wait is in the note (wait-and-go: seconds, not bits).
  Catch = `windowBits(period, logCatchWindow)`, catchWindow's form off the moving log (its carry RIDE.keep). A miss: the splash-back (soft).
- **Gate**: `piecesUsed` adds `move:lianaDrop` (and `move:logCatch` where a log carries him into reach) from the stage's LAY, whatever the
  route takes; meter-coverage.json rows (bots SKILLS.dropOnLog / vineFromLog).
- **Numbers on the toys** (lianaProbe.ts; shares = ENG-24's table to the point): Normal long 86% 1.12 bits, ride 82% 1.15, twin 80% 1.17,
  gap280 41% 1.78 (worst wait 2.70 s); Easy long 92% 1.06, deep 89% 1.09.
- **Bots** (lianaBots.ts, real InputEngine, 5 variants, Normal; lianaBots-normal.txt): the child misses 2/5 on gap280, 0 on long/ride/twin;
  gap280 is the slowest piece for every tier (child 22.6 s vs 13-17). Same order as the bits. Easy: the run stopped at "no expert bot on
  easy" (tierBots has no Easy expert), child + middle on long only; not re-run.
- **Planted** (tools/difficulty/lianaChannel.test.ts, added to gates.yml): the old route boarded gap280 from the bank (a ride-board, no
  let-go: seen before the fix, lianaProbe) -> the test fails on it; MOVE_CHANNEL without lianaDrop -> scoreStage refuses the toy
  (UnpricedPiece move:lianaDrop); the table without either channel -> coveragecheck `(b) move:lianaDrop / move:logCatch on <toy>: no channel`.

## R-165.286: a predator read (the posted boa)
- **Channel** (score.ts `freezeWindow`, `isPredatorRead`): an animal beaten by stillness that is no watcher and never walks. The window
  is FLOWN, not a constant: boaFreeze.test's flight made general (the REAL engine at 30 fps + the REAL kit via CastPlay on the stage's own
  def): he runs in, lifts k frames after the rear begins; the window is the first k that is struck. Bits creatureBits(window), a threat,
  a heart. A cast boa on the route is a `predator-read` instead of a plain `creature` (which priced its whole rear).
- **It reproduces the engine's own edges**: t-build-19's BOA (tell 1.0, coil): 0.467 s Normal / 0.633 s Easy = boaFreeze.test's 13 / 18
  frames still, 14 / 19 hit (freeze-t-build-19.txt). main's BOA (tell 0.8, no coil): 0.267 s / 0.667 s ("0.8 s gave 7").
- **Scores** (anchored with 1-1, seeds 1-4; 1-9 is NOT on this base, so scored on a LOCAL scratch merge of origin/t-build-19 4adec324,
  never pushed; score-1-9-before/after.txt):

  | Stage | Normal before -> after (target) | Easy before -> after (<= 0.6 x Normal target) |
  |---|---|---|
  | 1-9 | 1.7 -> **2.7** (9.5) | 1.2 -> **1.8** (5.7) |
  | 1-7 | 2.2 -> 2.2 (5.5): no boas, unchanged | 1.4 -> 1.4 |
  | 1-1 (anchor) | 4 -> 4 | 2.6 -> 2.6 |
  No stage or anchor tuned (law 22). Every other built stage: no cast boa (main's hand 1-9 has none: its boas stay plain 0.5 s creatures,
  so main's 1-9 does not move), and the liana change touches only rivers with a liana over them (none built), so nothing else moves.
- **Bots' hits agree in direction** (BUILD-19 castBots 1-40): middle 2.0 hits a run Normal vs 1.2 Easy; bits 1.64 vs 1.37.
- **Not priced (named, not hidden):** the hold after the freeze until it flees (an endurance hold; no slip rate measured for any tier,
  METER-COVERAGE §1 WR) and the bait/roost as their own asks (the roost boa is read like any posted boa; a trapped one is the existing
  choice when a trap's load lands within 160 px: none of 1-9's 11 do). These are the likely rest of 1-9's gap to 9.5.
- **Planted** (score.test.ts): the boa only (not the eagle or snake); a longer rear (kit tell +0.5) widens the window; Easy never narrower;
  on 1-9 every cast boa is a predator-read at creatureBits(freezeWindow) (vacuous on main's hand 1-9, bites with the gen2 1-9: run on
  the scratch merge).

## Gates
GATES_TABLE

## Learned
- A meter channel should read the engine's own judge (lianaDrops, the boa's flight), never a constant: both numbers matched the engine's
  tests to the frame on the first run, so the planted tests can pin properties, not positions.
- A new piece belongs in `piecesUsed` from the LAY, not only from the route: the route takes the quicker way, so a gate that reads route
  moves alone passes a stage whose hard way it never walks.
- Proposed rule (level.md / gates.md): before a level's meter verdict, the level's own branch must hold the meter; 1-9's score needed a
  scratch merge here.

## Method used / Lessons applied / Method update
- Method: reference/methods/gates.md (coveragecheck, the meter), planted-first tests. Lessons applied: "a gate must call the same code the
  screen calls" (D19: both channels call the engine's own flight); "check the fact before acting" (shares checked against ENG-24's table);
  context box (D64): I ran past 50% — reported the real figure.
- Method update (proposed): METER packets that re-score a stage name the branch that holds it, or ask for the merge first.
