# World 1 mechanics in use (R-150.4)

Made 2026-11-04 9:00 AM ET by tools/validate/mechtable.ts on f89b87a5 Merge remote-tracking branch 'origin/ccr-0d59a91c-oy3imz' int. Every stage as the engine builds it (RealPlay: generateStage, withGoals), Normal, layouts 1-16. A cell is the count on a layout (min-max over the layouts; "(n/16)" when only n layouts have it; blank: none on any layout).

## What each stage holds

| mechanic | 1-1 | 1-2 | 1-3 | 1-4 | 1-5 | 1-6 | 1-7 | 1-8 | 1-9 | 1-10 |
|---|---|---|---|---|---|---|---|---|---|---|
| gaps to jump | 174-285 | 199-273 | 108-160 | 48-60 | 152-173 | 130-155 | 112-191 | 124-130 | 92-114 | 3 |
| mushroom bounce | 1-20 | 17-54 | 0-7 (9/16) |  | 1-15 | 0-4 (5/16) | 0-21 (13/16) |  | 1-10 |  |
| liana swing |  |  |  |  |  | 16-32 |  | 4-13 |  | 1 |
| trunk climb |  |  |  | 20-22 | 2-12 | 4-9 | 1 | 2-5 | 0-9 (7/16) | 3 |
| rope shimmy |  |  | 3 | 8-9 | 1-2 |  | 1 |  | 0-2 (7/16) |  |
| breaking branch |  |  |  |  | 8-24 | 1 |  |  |  |  |
| collapsing branch (chase) |  |  |  |  |  |  |  | 1 |  |  |
| eagle / watcher |  |  |  |  |  |  | 10-18 |  |  |  |
| bushes to hide in |  |  |  |  |  |  | 26-48 |  |  |  |
| water / river |  |  |  |  |  | 1 |  |  |  |  |
| snake |  |  | 21-29 | 0-4 (8/16) | 1-14 | 1-11 |  | 5-8 | 11-17 |  |
| boa |  |  |  |  |  |  |  |  | 2-8 |  |
| snake ring |  |  |  |  |  |  |  |  | 2 |  |
| log / boulder to push |  |  |  |  |  | 4 |  |  |  |  |
| puzzle room |  |  |  | 2 |  | 3 | 2 |  |  |  |
| hidden find |  | 1 | 1 | 1 | 1 |  |  | 1 |  |  |

## The six things and their pairs (STAGE-RULES §0b.5: run, jump, branches, vines, wind, slow; 15 pairs in all)

| stage | things | pairs |
|---|---|---|
| 1-1 Into the Canopy | run, jump | 1: run+jump |
| 1-2 The Petal Trail | run, jump | 1: run+jump |
| 1-3 Branch Snakes | run, jump | 1: run+jump |
| 1-4 Up the Kapok | run, jump, vines | 3: run+jump, run+vines, jump+vines |
| 1-5 Where She Walked | run, jump, branches, vines | 6: run+jump, run+branches, run+vines, jump+branches, jump+vines, branches+vines |
| 1-6 First Lianas | run, jump, branches, vines | 6: run+jump, run+branches, run+vines, jump+branches, jump+vines, branches+vines |
| 1-7 A Very Good Bush | run, jump, vines | 3: run+jump, run+vines, jump+vines |
| 1-8 The Long Branch | run, jump, branches, vines | 6: run+jump, run+branches, run+vines, jump+branches, jump+vines, branches+vines |
| 1-9 The Boa's Branches | run, jump, vines | 3: run+jump, run+vines, jump+vines |
| 1-10 the boss lair (Venom Fang) | run, jump, vines | 3: run+jump, run+vines, jump+vines |

World 1 shows 6 of the 15 pairs. Wind and slow-downs are not in World 1 at all, so none of their 9 pairs appear.

## What the first-timer bot actually used (Normal, layouts 1-3, trial 0, the fixed bot; per layout)

| stage | lianas swung | trunks climbed | ropes | mushroom bounces | branches broken | hid in a bush | logs pushed | animals beaten | eagle hits | the runs |
|---|---|---|---|---|---|---|---|---|---|---|
| 1-1 | 0/0/0 | 0/0/0 | 0/0/0 | 16/20/13 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | shrine 209 s, 3 rescues; shrine 241 s, 8 rescues; shrine 210 s, 4 rescues |
| 1-2 | 0/0/0 | 0/0/0 | 0/0/0 | 5/23/8 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | sealed door 182 s, 2 rescues; shrine 189 s, 3 rescues; sealed door 190 s, 2 rescues |
| 1-3 | 0/0/0 | 0/0/0 | 0/0/0 | 8/3/9 | 0/0/0 | 0/0/0 | 0/0/0 | 16/18/6 | 0/0/0 | shrine 132 s, 0 rescues; shrine 130 s, 0 rescues; sealed door 127 s, 0 rescues |
| 1-4 | 0/0/0 | 89/69/93 | 11/13/11 | 0/1/1 | 0/0/0 | 0/0/0 | 0/0/0 | 0/3/1 | 0/0/0 | shrine 349 s, 11 rescues; shrine 325 s, 12 rescues; time 360 s, 13 rescues |
| 1-5 | 0/0/0 | 2/1/0 | 0/0/0 | 18/17/1 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | sealed door 197 s, 2 rescues; sealed door 164 s, 1 rescues; sealed door 203 s, 10 rescues |
| 1-6 | 32/39/46 | 2/0/2 | 0/0/0 | 6/2/0 | 0/0/0 | 0/0/0 | 2/2/2 | 2/2/1 | 0/0/0 | shrine 267 s, 6 rescues; shrine 268 s, 6 rescues; shrine 285 s, 7 rescues |
| 1-7 | 0/0/0 | 0/0/0 | 1/0/1 | 22/18/21 | 0/0/0 | 4/3/2 | 0/0/0 | 0/0/0 | 1/1/1 | shrine 178 s, 0 rescues; shrine 160 s, 0 rescues; shrine 226 s, 2 rescues |
| 1-8 | 5/13/13 | 2/2/2 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | shrine 137 s, 0 rescues; shrine 125 s, 0 rescues; shrine 128 s, 0 rescues |
| 1-9 | 0/0/0 | 0/0/0 | 0/0/0 | 3/1/2 | 0/0/0 | 0/0/0 | 0/0/0 | 14/12/12 | 0/0/0 | sealed door 140 s, 2 rescues; sealed door 157 s, 2 rescues; sealed door 130 s, 2 rescues |
| 1-10 | - | - | - | - | - | - | - | - | - | - |

A run with more than 3 rescues was not really played by the bot (its rescues put it past spots it could not do): read its "used" numbers as a floor. A 0 under "branches broken" on a stage that holds them (1-5) means the run never stood on one: the way on goes along the floor under them (the validator's branch probe crosses them on purpose: see its pages).

## Built once, never back (STAGE-RULES §0.1: a mechanic taught comes back, harder or combined)

| mechanic | stages that hold it (on any layout) | first | comes back later in World 1? |
|---|---|---|---|
| mushroom bounce | 1-1, 1-2, 1-3, 1-5, 1-6, 1-7, 1-9 | 1-1 | yes |
| liana swing | 1-6, 1-8, 1-10 | 1-6 | yes |
| trunk climb | 1-4, 1-5, 1-6, 1-7, 1-8, 1-9, 1-10 | 1-4 | yes |
| rope shimmy | 1-3, 1-4, 1-5, 1-7, 1-9 | 1-3 | yes |
| breaking branch | 1-5, 1-6 | 1-5 | yes |
| collapsing branch (chase) | 1-8 | 1-8 | **no** |
| eagle / watcher | 1-7 | 1-7 | **no** |
| bushes to hide in | 1-7 | 1-7 | **no** |
| water / river | 1-6 | 1-6 | **no** |
| snake | 1-3, 1-4, 1-5, 1-6, 1-8, 1-9 | 1-3 | yes |
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
