# Method: score a stage on the hardness meter (first written 2026-11-12 by DIFF-ALGO, R-165.172; the design is reference/design/DIFFICULTY.md)

Use it for: a level design's Normal target, judging a build against it, and any "is this harder than that" question. The meter is
a TOOL reading: it never runs on a phone, and it never overrides a fairness floor (STAGE-RULES §1b).

## Steps
1. **Prove the tool first** (LESSONS: test the measuring tool before trusting its numbers): `npx tsx tools/difficulty/score.ts --check`
   must print "14 planted cases pass". Then re-score the anchors: `--stages 1-1,1-2,1-3 --seeds 1-4` must still read about 4 / 2 / 1
   on Normal. If they moved, the tool or World 1 changed: find which before reading anything else.
2. **Score the stage with its world before it, in game order** (novelty carries through the list): e.g. `--stages 1-1,1-2,1-3,1-4
   --seeds 1-4 --detail`. Read the MEDIAN and the range over the layouts; a single layout is not a reading. To compare across a run
   that does not include 1-1, pass the calibrated `--scale` from an anchor run (today 0.30654).
3. **Read the route column first:** `check` is a route the level check proved; `extended` or `presumed` means the inspector added
   links it could not check. Open `--detail`: every heavy challenge must be something a player really does there. A "beyond" move,
   a rise over 300 px, or a pit where the stage has a floor is a route artifact: name it, never design to it.
4. **Judge against the target** (DIFFICULTY.md §4): Normal within its slot +-1.5 in World 1 (+-3 after), no layout over target + 3,
   Easy at most 0.6 x Normal. Off target: move it with the levers (DIFFICULTY.md §5-§6), then re-score; never move the target.
5. **Cross-check with the bots** (outcomes, not demand): `npx tsx tools/inspect/tierBots.ts --stage <id> --tiers child,middle,expert
   --seeds 1-8 --setting both`. Their put-backs and lives a minute should rank the stages the same way. Their Easy personas are other
   testers: never read Easy vs Normal from the bots.
6. **Write it down:** the design doc's header gets "Normal target N, measured M (range), Easy E"; the build's report pastes the
   score.ts lines and the commit they were measured on.

## Traps (each happened 11-12)
- The inspector's route jumps over a raised block or a lower dip and calls it a pit (1-2's root humps); score.ts corrects it, the
  inspector does not yet.
- The inspector cannot build a designed arc (1-2) on Easy; build through realPlay.ts, as score.ts does.
- stageTime's model can read near 0 s (4-3): score.ts floors minutes at the route's own clock.
- FREE_BITS is the one constant the anchors depend on; change it only with the anchors re-run and the lead's word.
