# VAR-1: variety for 1-6, 1-7, 1-8 (R-165.276). Level builder, 2026-11-18

Branch `t-var-1` (from origin/main 6e7b85f8f). DRAFT: the numbers below marked TBD are filled from the final head.
Method: reference/methods/level.md (rules 1-29), the lead's GO 10:19 AM ET and rulings 10:00 / 10:50 AM ET.
Lessons applied: D57 (read the inbox: I missed the 10:00 and 10:19 messages until 10:50, my miss), D79 (stills of the whole screen,
both ways, both settings), D81 (drawcheck both ways), D83 (probe scripts use relative imports: reference/qa-reports/VAR-1/probes/).

## 1. What was wrong (measured, main 6e7b85f8f, `funcheck-main-6e7b85f8.txt`)
A runs probe (`probes/runs.ts`: every 4-move run a stage repeats more than 3 times, with the sections each copy spans) and a steps probe
(`probes/steps.ts`: the route's moves by section) found four causes, none of them the stage's idea:
1. **1-7's eagle read as a fight.** `tools/inspect/beats.ts` read every eagle as "eagle swoops" (F, the letter of 1-2's snakes); 1-7's
   eagles are kit sweepers (stillLay.ts castWatches) laid over watched stretches. So 1-7, the hide stage, read "nothing new" and "like 1-2".
2. **1-7 and 1-8 each laid ONE rest five times** (w1-17-rest, w1-18-rest: four root hops, "JJJJ" every time).
3. **1-6 laid the same root hops after every liana** (`hops()`): Easy read 9 swings and ~55 identical jumps ("JVJJ" 7 times).
4. **The rolled join into every beat was a jump**, and every rest ended on root jumps: "rest JJ | join J | liana V" on every roll.

## 2. What changed
### A. The eagle fix (own commit cac760957, the lead's ruling 10:00 AM ET)
- beats.ts: a kit sweeper (isKitSweeper) is skipped as an animal; its stretch (sweptZones) is read as a watched stretch (E), its beat
  family kept `creature:eagle` (the bot and meter channel that already serve it).
- score.ts: that beat is skipped where a kit watcher's ground lies, exactly as the old fight beat was (watchChallenges prices the eye).
  Without it the meter refused 1-7/1-8 ("unpriced beat:watched stretches") and coveragecheck failed: a gate went red and was fixed at
  the root, no list edited (told to the lead 11:03).
- Planted test `tools/inspect/sweeper.test.ts`, in gates.yml: red on main ("1-7: 9 kit sweepers read as a fight"), green with the fix.
- What it moves (only 1-7 and 1-8 lay kit sweepers; every stage-table row checked): funcheck on main+fix: 1-7 "nothing new" cleared
  Normal + Easy (16 -> 0); 1-8 Easy "like the stage before" 16 -> 15; no flag added. Meter seeds 1-4: 1-7 Normal 2.2 -> 2.1 (the
  eagle's fight seconds leave the beat clock), 1-7 Easy 1.4, 1-8 and 1-1 unchanged. coveragecheck PASS, seedlist --check 1-7/1-8 PASS.

### B. The level data (the lead's GO 10:19, conditions: rests stay rests, each rest looks different, 1-6's swing load unchanged)
TBD: the sections table.

## 3. Flags before / after (funcheck, layouts 1-16, both settings)
TBD

## 4. Bots (castBots 1-40, both settings)
TBD

## 5. Meter (score.ts seeds 1-4; before = main + the eagle fix, the same stage set)
| Stage | Before Normal | After Normal | Before Easy | After Easy |
|---|---|---|---|---|
| 1-6 | 5.7 (20 swings) | TBD | 3.2 (10 swings) | TBD |
| 1-7 | 2.1 | TBD | 1.2 | TBD |
| 1-8 | 6.8 | TBD | 3.3 | TBD |

## 6. Gates (on the final head)
TBD

## 7. Polish check
TBD

## 8. Learned (for the next builder)
TBD

## 9. Proposed level.md rules
TBD
