# World 1 mechanics in use (R-150.4)

Made 2026-11-05 11:22 AM ET by tools/validate/mechtable.ts on 021ef4e93 Engine: the library for every world (src/game/mixer/catalog.. Every stage as the engine builds it (RealPlay: generateStage, withGoals), Normal, layouts 1-4. A cell is the count on a layout (min-max over the layouts; "(n/4)" when only n layouts have it; blank: none on any layout).

## What each stage holds

| mechanic | 1-1 | 1-2 | 1-3 | 1-4 | 1-5 | 1-6 | 1-7 | 1-8 | 1-9 | 1-10 |
|---|---|---|---|---|---|---|---|---|---|---|
| gaps to jump | 233-238 | 136-149 | 169-177 | 57-58 | 189-194 | 136-154 | 115-185 | 124-130 | 98-101 | 3 |
| mushroom bounce | 1-2 |  | 6 |  | 8-9 | 0-4 (2/4) | 12-20 |  | 1 |  |
| liana swing |  | 11 |  | 2 |  | 18-31 |  | 5-13 |  | 1 |
| trunk climb | 3 |  |  | 17 | 9-13 | 4-8 | 1 | 2 |  | 3 |
| rope shimmy |  |  | 1 | 4 |  |  | 1 |  | 1 |  |
| breaking branch |  | 11-21 |  | 9 | 55-60 | 1 |  |  |  |  |
| collapsing branch (chase) |  |  |  |  |  |  |  | 1 |  |  |
| eagle / watcher |  |  |  |  |  |  | 10-13 |  |  |  |
| bushes to hide in |  |  |  |  |  |  | 26-32 |  |  |  |
| water / river |  |  | 1 |  |  | 1 |  |  | 1 |  |
| snake |  | 0-1 (1/4) | 26-28 | 1 |  | 6-13 |  | 5 | 13 |  |
| boa |  |  |  |  |  |  |  |  | 9 |  |
| snake ring |  |  |  |  |  |  |  |  | 2 |  |
| log / boulder to push |  |  |  |  |  | 4 |  |  |  |  |
| puzzle room |  |  |  | 2 |  | 3 | 2 |  |  |  |
| hidden find |  | 1 | 1 | 1 | 14 |  |  | 1 |  |  |

## The six things and their pairs (STAGE-RULES §0b.5: run, jump, branches, vines, wind, slow; 15 pairs in all)

| stage | things | pairs |
|---|---|---|
| 1-1 Into the Canopy | run, jump, vines | 3: run+jump, run+vines, jump+vines |
| 1-2 The Petal Trail | run, jump, branches, vines | 6: run+jump, run+branches, run+vines, jump+branches, jump+vines, branches+vines |
| 1-3 Branch Snakes | run, jump | 1: run+jump |
| 1-4 Up the Kapok | run, jump, branches, vines | 6: run+jump, run+branches, run+vines, jump+branches, jump+vines, branches+vines |
| 1-5 Where She Walked | run, jump, branches, vines | 6: run+jump, run+branches, run+vines, jump+branches, jump+vines, branches+vines |
| 1-6 Snake Vines | run, jump, branches, vines | 6: run+jump, run+branches, run+vines, jump+branches, jump+vines, branches+vines |
| 1-7 A Very Good Bush | run, jump, vines | 3: run+jump, run+vines, jump+vines |
| 1-8 The Long Branch | run, jump, branches, vines | 6: run+jump, run+branches, run+vines, jump+branches, jump+vines, branches+vines |
| 1-9 The Boa's Branches | run, jump | 1: run+jump |
| 1-10 the boss lair (Venom Fang) | run, jump, vines | 3: run+jump, run+vines, jump+vines |

World 1 shows 6 of the 15 pairs. Wind and slow-downs are not in World 1 at all, so none of their 9 pairs appear.

## What the first-timer bot actually used (Normal, layouts 1-0, trial 0, the fixed bot; per layout)

| stage | lianas swung | trunks climbed | ropes | mushroom bounces | branches broken | hid in a bush | logs pushed | animals beaten | eagle hits | the runs |
|---|---|---|---|---|---|---|---|---|---|---|
| 1-1 |  |  |  |  |  |  |  |  |  |  |
| 1-2 |  |  |  |  |  |  |  |  |  |  |
| 1-3 |  |  |  |  |  |  |  |  |  |  |
| 1-4 |  |  |  |  |  |  |  |  |  |  |
| 1-5 |  |  |  |  |  |  |  |  |  |  |
| 1-6 |  |  |  |  |  |  |  |  |  |  |
| 1-7 |  |  |  |  |  |  |  |  |  |  |
| 1-8 |  |  |  |  |  |  |  |  |  |  |
| 1-9 |  |  |  |  |  |  |  |  |  |  |
| 1-10 | - | - | - | - | - | - | - | - | - | - |

A run with more than 3 rescues was not really played by the bot (its rescues put it past spots it could not do): read its "used" numbers as a floor. A 0 under "branches broken" on a stage that holds them (1-5) means the run never stood on one: the way on goes along the floor under them (the validator's branch probe crosses them on purpose: see its pages).

## Built once, never back (STAGE-RULES §0.1: a mechanic taught comes back, harder or combined)

| mechanic | stages that hold it (on any layout) | first | comes back later in World 1? |
|---|---|---|---|
| mushroom bounce | 1-1, 1-3, 1-5, 1-6, 1-7, 1-9 | 1-1 | yes |
| liana swing | 1-2, 1-4, 1-6, 1-8, 1-10 | 1-2 | yes |
| trunk climb | 1-1, 1-4, 1-5, 1-6, 1-7, 1-8, 1-10 | 1-1 | yes |
| rope shimmy | 1-3, 1-4, 1-7, 1-9 | 1-3 | yes |
| breaking branch | 1-2, 1-4, 1-5, 1-6 | 1-2 | yes |
| collapsing branch (chase) | 1-8 | 1-8 | **no** |
| eagle / watcher | 1-7 | 1-7 | **no** |
| bushes to hide in | 1-7 | 1-7 | **no** |
| water / river | 1-3, 1-6, 1-9 | 1-3 | yes |
| snake | 1-2, 1-3, 1-4, 1-6, 1-8, 1-9 | 1-2 | yes |
| boa | 1-9 | 1-9 | **no** |
| snake ring | 1-9 | 1-9 | **no** |
| log / boulder to push | 1-6 | 1-6 | **no** |
| puzzle room | 1-4, 1-6, 1-7 | 1-4 | yes |
| hidden find | 1-2, 1-3, 1-4, 1-5, 1-8 | 1-2 | yes |

## What the engine has that World 1 never uses

| mechanic | where the game uses it |
|---|---|
| silk line | 5-4, 5-5 |
| warm air (glide) | 4-7 |
| moving platform | 2-10, 5-10, 6-10, 7-10, 8-10, 9-5 and 3 more |
| lift | 2-7 |
| river logs | 2-1, 2-2, 2-3, 2-4, 2-5, 2-7 and 1 more |
| thorn vine | 3-4, 3-5, 3-7, 3-8 |
| wind | 4-2, 4-4, 4-6, 4-8, 4-9 |
| web | 5-6 |
| spore | 3-1, 3-3, 3-6 |
| dark | 3-1, 3-2, 3-3, 3-5, 3-6, 3-7 and 10 more |
| tide | 6-4, 6-5, 6-9 |
| crumbling floor | 7-1, 7-5, 7-6 |
| geyser | 9-1, 9-3, 9-4, 9-5, 9-6, 9-8 and 1 more |
| bolt | 10-1, 10-3, 10-6, 10-7, 10-9 |
| snapper | 2-5, 2-9 |
| frog | 6-1, 6-3, 6-4, 6-5, 6-6, 6-7 and 7 more |
| ocelot | 3-3, 3-9, 5-6, 5-8, 6-5, 6-9 and 17 more |
| jaguar | 3-3, 3-9, 7-8, 8-7, 8-9, 9-2 and 10 more |
| spider | 5-1, 5-2, 5-3, 5-4, 5-5, 5-7 and 1 more |
| tayra | 5-6, 5-8, 6-3, 6-5, 6-7, 6-8 and 23 more |
| eagle (swooper) | 5-6, 5-8, 7-2, 7-8, 8-7, 9-1 and 17 more |
| caiman | 6-5, 6-9, 9-1, 9-3, 9-4, 9-5 and 7 more |
| harpy | 8-7, 8-8, 9-1, 9-2, 9-3, 9-5 and 11 more |
| cage to free | 2-3, 2-8, 4-8 |

## How it is counted

- From the stage data (tools/validate/mechanics.ts MECHS): platforms by type (mushroom = bouncy, breaking = fragile or a crumble time, moving, lifts, river logs, logs to push), vines by type (lianas, trunks, silk), ropes, updrafts, zones by kind (wind, web, spore, dark, tide, crumbling floor, geyser, bolt), animals by type, the eagle's watched stretches and the bushes, the chase, thorn vines, water, puzzle rooms, cages and finds. "gaps to jump" counts solid ledges, a stand-in for how much plain jumping there is.
- What the player used comes from the first-timer bot playing the real engine (tools/validate/play.ts botRun), frame by frame: starts of a swing, a climb, a rope hang, a bounce, a duck into a bush, a push; breaking pieces broken by the run's end; animals beaten; eagle hits.
- The engine's mechanics are those any stage of any world uses on layout 1 (Normal).
