# S1: every number that moved, old (t-s1@8a8877a9, before S1) -> new (t-s1@9bb17015). Generated 10:53 AM ET 11-13.
**11:30 AM ET update: the lead scoped the step rule to the meter.** The meter rows below stand. The funcheck, tier-bot, calibration and seed-list sections describe the step route on every tool, which no longer ships: they are the findings for the follow-on packet. The calibration as committed is in REPORT.md item 5.

## Meter (score.ts --seeds 1-4, median (range); SCALE fixed at DIFFICULTY.md's 0.30654; re-anchored SCALE now 0.30179: world1-reanchored.txt)
| stage | setting | DIFFICULTY.md | now | why |
|---|---|---|---|---|
| 1-1 | Normal | 4.0 (2.9-4.1), route presumed | 4.1 (3.3-4.8), route check | double-test gap now judged on flown arcs; hops onto 77-82 px stumps read as doubles (jumps.ts maxRise, see REPORT) |
| 1-2 | Normal | 2.0 (1.6-2.2) | 1.0 (1.0-1.5) | its heaviest, a 235 px "double" over a stair, is a walk down; humps read 53 px hops |
| 1-3 | Normal | 1.1 (0.8-1.4) | 1.2 (0.8-1.6) | small |
| 1-1 | Easy | 2.4 (1.3-3.1) | 2.5 (2.2-3.2) | |
| 1-2 | Easy | 0.9 (0.2-1.9) | 0.3 (0.2-0.4) | as Normal |
| 1-3 | Easy | 0.6 (0.5-0.6) | 0.7 (0.6-0.7) | small |

## funcheck (World 1, layouts flagged of 16, gated counts; 15 of 124 entries moved; funcheck is not in CI and FAILed before S1 too: 17 worse/new -> 23)
- 1-1 easy pacing: 12 -> 13
- 1-1 normal repeat: 13 -> 9
- 1-2 easy like the stage before: 10 -> 11
- 1-3 easy nothing bites: 1 -> 10
- 1-3 normal nothing bites: 0 -> 11
- 1-5 easy like an earlier stage: 1 -> 2
- 1-5 normal dead walk: 15 -> 16
- 1-6 easy nothing bites: 1 -> 4
- 1-6 easy repeat: 1 -> 3
- 1-6 normal like the stage before: 0 -> 1
- 1-6 normal nothing bites: 1 -> 4
- 1-6 normal repeat: 0 -> 2
- 1-9 normal dead walk: 12 -> 14
- 1-9 normal nothing bites: 15 -> 16
- 1-9 normal repeat: 15 -> 14

## First-timer tier bots (tierBots.ts, seeds 1-8; runs, at shrine, finish p50 s, put-backs/run, rescues, lives/run)
- 1-2 child easy: (8, 8, 248.6, 0.25, 1, 0) -> (8, 8, 251.5, 0.12, 1, 0)
- 1-2 child normal: (8, 8, 337.6, 0, 4, 0) -> (8, 8, 356.1, 0.12, 4, 0)
- 1-2 expert normal: (8, 8, 144.9, 0.5, 0, 0) -> (8, 8, 144.2, 0.75, 0, 0)
- 1-2 middle easy: (8, 8, 158.3, 0.38, 1, 0) -> (8, 8, 160.2, 0.25, 1, 0)
- 1-2 middle normal: (8, 8, 167.9, 0, 0, 0) -> (8, 8, 163.7, 0, 0, 0)
- 1-3 child easy: (8, 8, 307.6, 0, 0, 0) -> (8, 8, 307.6, 0, 0, 0)
- 1-3 child normal: (8, 8, 458.3, 0, 0, 0) -> (8, 8, 458.2, 0, 0, 0)
- 1-3 expert normal: (8, 8, 197.6, 0, 0, 0) -> (8, 8, 197.6, 0, 0, 0)
- 1-3 middle easy: (8, 8, 209.0, 0, 0, 0) -> (8, 8, 209.0, 0, 0, 0)
- 1-3 middle normal: (8, 8, 233.8, 0, 0, 0) -> (8, 8, 233.8, 0, 0, 0)
- 1-1: the 40-seed calibration, below.

## 1-1 tier-bot calibration (calibration-main.jsonl, variants 1-40; the table did not pass before either, BOTS.md:13-15)
- child easy finishSeconds p50: 325.5 -> 323 (testers 2231; pass False -> False)
- child easy putbacksPerRun mean: 0.8 -> 0.33 (testers 187; pass False -> False)
- child easy rescues: 3 -> 0 (testers 0; pass True -> True)
- child normal finishSeconds p50: 474.7 -> 484.6 (testers 444; pass True -> True)
- child normal putbacksPerRun mean: 2.58 -> 2.23 (testers 3.4; pass True -> False)
- child normal rescues: 8 -> 16 (testers 0; pass True -> True)
- middle easy finishSeconds p50: 201.7 -> 203.9 (testers 187; pass True -> True)
- middle easy putbacksPerRun mean: 0.3 -> 0.35 (testers 1.2; pass False -> False)
- middle easy top three pieces: w1-quiet-arrival 0.03, w1-dip-double-teach 0, w1-double-teach 0 -> w1-dip-double-teach 0, w1-double-teach 0, w1-hollow-twoway 0 (testers w1-double-teach 0.8, w1-dip-double-teach 0.6, w1-hollow-twoway 0; pass True -> True)
- middle normal finishSeconds p50: 212.3 -> 210.9 (testers 213; pass True -> True)
- middle normal putbacksPerRun mean: 0.55 -> 0.8 (testers 0.7; pass True -> True)
- middle normal top three pieces: w1-double-teach 0.6, w1-dip-double-teach 0.39, w1-canopy-rungs-level 0 -> w1-dip-double-teach 0.43, w1-double-teach 0.4, w1-canopy-rungs-level 0 (testers w1-canopy-rungs-level 0.83, w1-double-teach 0.55, w1-dip-double-teach 0.2; pass True -> True)
- middle normal rescues: 0 -> 1 (testers 0; pass True -> False)
- expert normal finishSeconds p50: 176.9 -> 177.3 (testers 167; pass True -> True)
- expert normal putbacksPerRun mean: 0.38 -> 0.35 (testers 0.2; pass True -> True)
- expert normal top three pieces: w1-dip-double-teach 0.39, w1-double-teach 0.27, w1-log-chain 0.06 -> w1-dip-double-teach 0.43, w1-double-teach 0.2, w1-log-chain 0.03 (testers w1-canopy-rungs-level 0.3, w1-log-chain 0.21, w1-leap-stones 0.2; pass False -> False)

## Inspector route summary (inspect.ts --stages 1-1,1-2,1-3, layout 1)
- 1-1: old built the deleted hand-built 1-1 (172 s, 102 beats, 14 s dead); new builds the game's gen2 1-1: 1-1 check 145s beats 69.5 dead 57s (547 ms)
- 1-2, 1-3: old crashed at 1-2 Easy (easyStage: built for Normal); new: 1-2 check 138s beats 70 dead 47s (2415 ms); 1-3 check 184s beats 79 dead 72s (263 ms)

## 1-1 seed list (seedlist.ts 1-1 --check): PASS -> FAIL, seeds 28729 and 43005: their quiet line on Normal by the new route reads 4.1 s and 4.4 s, over QUIET_MAX 4 (old route: 4.0 and 3.3). PUSHBACK.md.
