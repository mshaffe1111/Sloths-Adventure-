# Tester data: stage 1-1

Source: play sessions recorded by the game on testers' phones between 2026-11-06 and 2026-11-07, stage 1-1 only. Aggregates only. Players are labelled by letter; one letter is one tester sign-in. Players B, D, E and F are one person on 4 different sign-ins and phones; player G played on the same phone as player B. Times are seconds of play from stage start to the finish.

- Runs started: 47 (39 Normal, 8 Easy); players: 9; distinct layouts played: 43.
- Runs finished: 44; not finished: 3.

## Finish times (seconds)

| Setting | Finishes | Min | 25th pct | Median | 75th pct | Max |
|---|---|---|---|---|---|---|
| Normal | 36 | 152 | 178 | 204 | 240 | 612 |
| Easy | 8 | 172 | 192 | 206 | 258 | 2231 |

## Per player

"Put-backs" are non-lethal falls returned to the last safe spot. "Lives lost" are lethal falls. "Punch" counts touches the game read as a punch; "punch cancelled" counts punches cancelled before they resolved. "Jump inputs" counts jump presses; "double jumps" counts double jumps performed.

| Player | Phone | Runs (Normal / Easy) | Finish times, in play order | Put-backs | Lives lost | Jump inputs | Double jumps | Punch | Punch cancelled | Play again |
|---|---|---|---|---|---|---|---|---|---|---|
| player A | iPhone (Apple GPU), Safari | 12 / 4 | 213, 282, 212, 223, 193, 213, 200, 257, 192, 188, 193, 173, 208, 180 | 15 | 3 | 2349 | 31 | 53 | 2 | 10 |
| player B | Android, Imagination GPU, Edge | 11 / 0 | 177, 162, 175, 189, 152, 204, 201, 218, 234, 239, 244 | 2 | 6 | 1563 | 22 | 23 | 0 | 7 |
| player C | Android, Imagination GPU, Chrome | 5 / 0 | 253, 227, 279, 237, 241 | 4 | 7 | 585 | 10 | 4 | 0 | 3 |
| player D | Android, Adreno 619, Chrome | 1 / 3 | 178, 172, 191, 270 | 9 | 0 | 461 | 8 | 15 | 2 | 1 |
| player E | Android, Adreno 730, Chrome | 4 / 0 | 157, 170, 182, 249 | 4 | 1 | 584 | 8 | 88 | 55 | 3 |
| player F | Android, Imagination GPU, Chrome | 2 / 0 | 193, 205 | 0 | 1 | 309 | 4 | 5 | 0 | 1 |
| player G | Android, Imagination GPU, Edge | 2 / 0 | 162 | 0 | 0 | 114 | 2 | 114 | 102 | 1 |
| player H | Android, Adreno 750, Samsung Internet | 2 / 0 | 612, 444 | 3 | 3 | 523 | 4 | 19 | 0 | 0 |
| player I | Android, Adreno 735, Chrome | 0 / 1 | 2231 | 187 | 0 | 932 | 2 | 167 | 0 | 0 |

Lives lost by cause: {'pit': 21}. Damage hits from creatures: 0.

## Report output (sections, players, glitches)

Output of the data report script on all sessions, player codes replaced by letters. Sections ranked by (put-backs + 3 x lives lost) per entry; top 20 shown by the script. Times are median seconds spent in the section.

```
47 runs, 9 players, 43 layouts

SECTIONS (ranked by put-backs plus 3x lives lost, per entry)
  w1-log-chain                     entries   19  median  29.7s  put-backs  155  lives lost   3
  w1-log-chain-rise                entries    8  median  21.7s  put-backs    2  lives lost   5
  w1-mushroom-chain                entries    7  median  16.8s  put-backs    0  lives lost   4
  w1-canopy-rungs                  entries    4  median  15.1s  put-backs    0  lives lost   2
  w1-canopy-rungs-level            entries   20  median  20.2s  put-backs   26  lives lost   1
  w1-mushroom-chain-back           entries   11  median  23.7s  put-backs    0  lives lost   5
  w1-two-answers                   entries    3  median  27.6s  put-backs    4  lives lost   0
  w1-dip-double-teach              entries   23  median  13.2s  put-backs   13  lives lost   0
  w1-leap-stones                   entries   28  median   5.1s  put-backs   14  lives lost   0
  w1-double-teach                  entries   22  median  15.0s  put-backs   10  lives lost   0
  w1-high-walk-up                  entries    8  median   5.9s  put-backs    0  lives lost   1
  w1-meadow                        entries   27  median  12.2s  put-backs    0  lives lost   0
  w1-learn                         entries   31  median  15.0s  put-backs    0  lives lost   0
  w1-hop-bounce                    entries   59  median  17.8s  put-backs    0  lives lost   0
  w1-mound-log                     entries   11  median  15.8s  put-backs    0  lives lost   0
  w1-twin-mushroom-fork            entries   19  median  17.9s  put-backs    0  lives lost   0
  w1-fern-bank                     entries   21  median   4.4s  put-backs    0  lives lost   0
  w1-log-stair-test                entries   21  median  13.1s  put-backs    0  lives lost   0
  w1-clearing                      entries   10  median   5.4s  put-backs    0  lives lost   0
  w1-seed-perch                    entries   54  median  18.4s  put-backs    0  lives lost   0

PLAYERS
  player A                             finished  14  median    204s  trend [213, 282, 212, 223, 193, 213]  lives lost   3  taps read as punches   53
  player B                             finished  11  median    201s  trend [177, 162, 175, 189, 152, 204]  lives lost   6  taps read as punches   23
  player C                             finished   5  median    241s  trend [253, 227, 279, 237, 241]  lives lost   7  taps read as punches    4
  player D                             finished   4  median    184s  trend [178, 172, 191, 270]  lives lost   0  taps read as punches   15
  player E                             finished   4  median    176s  trend [157, 170, 182, 249]  lives lost   1  taps read as punches   88
  player H                             finished   2  median    528s  trend [612, 444]  lives lost   3  taps read as punches   19
  player F                             finished   2  median    199s  trend [193, 205]  lives lost   1  taps read as punches    5
  player I                             finished   1  median   2231s  trend [2231]  lives lost   0  taps read as punches  167
  player G                             finished   1  median    162s  trend [162]  lives lost   0  taps read as punches  114

GLITCHES (player, stage, layout, kind, detail)
   ('player I', '1-1', '12727', 'jitter', 'pokey-x n7 span8.2 x35918 y564 g')
   ('player I', '1-1', '12727', 'blank', 'wait w1c-mid-CbQ9qVCV x36288')
   ('player D', '1-1', '12943', 'camjump', 'dx42 dy138 x29324 y741 g')
   ('player C', '1-1', '30782', 'jitter', 'pokey-x n7 span6.7 x3985 y1413 g')
```

## Every section entered

| Section | Entries | Median s | Put-backs | Lives lost | Put-backs per entry |
|---|---|---|---|---|---|
| w1-hop-bounce | 59 | 17.8 | 0 | 0 | 0.00 |
| w1-seed-perch | 54 | 18.4 | 0 | 0 | 0.00 |
| w1-learn | 31 | 15.0 | 0 | 0 | 0.00 |
| w1-quiet-arrival | 30 | 0.0 | 0 | 0 | 0.00 |
| w1-leap-stones | 28 | 5.1 | 14 | 0 | 0.50 |
| w1-meadow | 27 | 12.2 | 0 | 0 | 0.00 |
| w1-log-walk | 25 | 5.6 | 0 | 0 | 0.00 |
| w1-root-stair-fork | 24 | 13.2 | 0 | 0 | 0.00 |
| w1-dip-double-teach | 23 | 13.2 | 13 | 0 | 0.57 |
| w1-double-teach | 22 | 15.0 | 10 | 0 | 0.45 |
| w1-fern-bank | 21 | 4.4 | 0 | 0 | 0.00 |
| w1-log-stair-test | 21 | 13.1 | 0 | 0 | 0.00 |
| w1-canopy-rungs-level | 20 | 20.2 | 26 | 1 | 1.30 |
| w1-twin-mushroom-fork | 19 | 17.9 | 0 | 0 | 0.00 |
| w1-log-chain | 19 | 29.7 | 155 | 3 | 8.16 |
| w1-stair-fork | 19 | 16.3 | 0 | 0 | 0.00 |
| w1-home-banks | 14 | 6.0 | 0 | 0 | 0.00 |
| w1-morning-path | 14 | 6.1 | 0 | 0 | 0.00 |
| w1-bounce-double | 14 | 15.6 | 0 | 0 | 0.00 |
| w1-log-teach | 12 | 11.4 | 0 | 0 | 0.00 |
| w1-mound-log | 11 | 15.8 | 0 | 0 | 0.00 |
| w1-mushroom-chain-back | 11 | 23.7 | 0 | 5 | 0.00 |
| w1-clearing | 10 | 5.4 | 0 | 0 | 0.00 |
| w1-mushroom-bank-teach | 9 | 16.1 | 0 | 0 | 0.00 |
| w1-high-walk-up | 8 | 5.9 | 0 | 1 | 0.00 |
| w1-hollow-twoway | 8 | 10.8 | 0 | 0 | 0.00 |
| w1-last-step-up | 8 | 2.2 | 0 | 0 | 0.00 |
| w1-stair-run | 8 | 12.1 | 0 | 0 | 0.00 |
| w1-log-chain-rise | 8 | 21.7 | 2 | 5 | 0.25 |
| w1-sunlit-log | 7 | 0.0 | 0 | 0 | 0.00 |
| w1-forest-edge | 7 | 6.6 | 0 | 0 | 0.00 |
| w1-bank-run | 7 | 9.0 | 0 | 0 | 0.00 |
| w1-mushroom-chain | 7 | 16.8 | 0 | 4 | 0.00 |
| w1-twin-bounce | 6 | 14.9 | 0 | 0 | 0.00 |
| w1-fallen-trunk | 6 | 17.2 | 0 | 0 | 0.00 |
| w1-bough-bench-up | 5 | 4.4 | 0 | 0 | 0.00 |
| w1-high-walk | 4 | 4.9 | 0 | 0 | 0.00 |
| w1-canopy-rungs | 4 | 15.1 | 0 | 2 | 0.00 |
| w1-bough-bench | 3 | 4.3 | 0 | 0 | 0.00 |
| w1-two-answers | 3 | 27.6 | 4 | 0 | 1.33 |
| w1-log-steps-descent | 3 | 15.0 | 0 | 0 | 0.00 |
| w1-stone-dips | 3 | 16.0 | 0 | 0 | 0.00 |
| w1-step-stones-teach | 3 | 13.0 | 0 | 0 | 0.00 |
| w1-stump-stones | 3 | 16.7 | 0 | 0 | 0.00 |
| w1-zigzag-run | 3 | 11.3 | 0 | 0 | 0.00 |
| w1-stone-zigzag | 2 | 15.7 | 0 | 0 | 0.00 |
| w1-cache-stones | 2 | 20.9 | 0 | 0 | 0.00 |
| w1-bounce-wall | 2 | 24.0 | 0 | 0 | 0.00 |
| w1-canopy-drop | 2 | 13.0 | 0 | 0 | 0.00 |
| w1-stump-descent | 2 | 23.2 | 0 | 0 | 0.00 |
| w1-bounce-over-dip | 2 | 13.0 | 0 | 0 | 0.00 |
| w1-stair-gap-twist | 2 | 13.2 | 0 | 0 | 0.00 |
| w1-bank-double-teach | 1 | 15.0 | 0 | 0 | 0.00 |
| w1-second-jump | 1 | 17.6 | 0 | 0 | 0.00 |
| w1-mushroom-lift | 1 | 19.7 | 0 | 0 | 0.00 |
| w1-bank-stair-test | 1 | 17.3 | 0 | 0 | 0.00 |
| w1-floor-dash | 1 | 12.4 | 0 | 0 | 0.00 |

Put-backs by player in the sections with any put-backs: w1-log-chain: {'player I': 155}; w1-canopy-rungs-level: {'player H': 2, 'player I': 14, 'player E': 3, 'player A': 5, 'player C': 2}; w1-leap-stones: {'player I': 12, 'player E': 1, 'player A': 1}; w1-dip-double-teach: {'player B': 2, 'player H': 1, 'player I': 6, 'player D': 2, 'player A': 2}; w1-double-teach: {'player A': 3, 'player C': 2, 'player D': 5}; w1-two-answers: {'player A': 4}; w1-log-chain-rise: {'player D': 2}

## Frame rate by phone and orientation

The game samples its frame rate every few seconds (target 30 fps). "Frame p90" is the 90th-percentile frame time in the sample. "Stalls" are single frames the game logged as a hitch. "Quality steps" are automatic quality-level changes (q0 is full quality; higher numbers draw less).

| Phone | Orientation | Samples | Median fps | 10th pct fps | Lowest fps | Median frame p90 ms | Worst frame ms |
|---|---|---|---|---|---|---|---|
| Android, Adreno 619, Chrome | landscape | 34 | 25.2 | 19.5 | 16.2 | 50 | 970 |
| Android, Adreno 619, Chrome | portrait | 118 | 29.0 | 25.0 | 15.2 | 33 | 700 |
| Android, Adreno 730, Chrome | landscape | 81 | 29.9 | 26.8 | 24.2 | 33 | 113 |
| Android, Adreno 730, Chrome | portrait | 66 | 29.9 | 27.0 | 26.7 | 33 | 106 |
| Android, Adreno 735, Chrome | portrait | 445 | 30.4 | 30.1 | 27.4 | 33 | 132 |
| Android, Adreno 750, Samsung Internet | portrait | 241 | 26.4 | 24.6 | 23.0 | 45 | 418 |
| Android, Imagination GPU, Chrome | landscape | 103 | 30.0 | 29.8 | 26.0 | 33 | 150 |
| Android, Imagination GPU, Chrome | portrait | 222 | 30.0 | 29.8 | 26.0 | 33 | 167 |
| Android, Imagination GPU, Edge | landscape | 153 | 30.0 | 29.9 | 26.2 | 33 | 96 |
| Android, Imagination GPU, Edge | portrait | 317 | 30.0 | 29.8 | 25.5 | 33 | 94 |
| iPhone (Apple GPU), Safari | portrait | 574 | 28.4 | 23.5 | 21.7 | 42 | 129 |

Stalls and quality steps per phone (both orientations): Android, Adreno 619, Chrome: stalls 96, steps {'q0→1': 6, 'q1→2': 5, 'q2→1': 4, 'q1→0': 3}; Android, Adreno 730, Chrome: stalls 2, steps {'q0→1': 1, 'q1→2': 1, 'q2→1': 1, 'q1→0': 1}; Android, Adreno 735, Chrome: stalls 13, steps {'q0→1': 2, 'q1→0': 1, 'q1→2': 1}; Android, Adreno 750, Samsung Internet: stalls 18, steps {'q0→1': 4, 'q1→2': 5, 'q2→1': 2, 'q1→0': 1}; Android, Imagination GPU, Chrome: stalls 6, steps {'q0→1': 2, 'q1→0': 2}; Android, Imagination GPU, Edge: stalls 0, steps none; iPhone (Apple GPU), Safari: stalls 2, steps {'q0→1': 12, 'q1→2': 25, 'q2→1': 13, 'q1→0': 6}

## Glitch events logged by the game

| Player | Layout | Setting | Event | Detail (x, y in world px) |
|---|---|---|---|---|
| player I | 12727 | easy | jitter | pokey-x n7 span8.2 x35918 y564 g |
| player I | 12727 | easy | blank | wait w1c-mid-CbQ9qVCV x36288 |
| player D | 12943 | easy | camjump | dx42 dy138 x29324 y741 g |
| player C | 30782 | normal | jitter | pokey-x n7 span6.7 x3985 y1413 g |

Other error lines outside 1-1 runs (all sessions): {'res load failed: <image>': 3, 'res load failed: <link>': 1}

## Survey (end of each finished run)

42 surveys sent. The first three questions are required; the rest may be skipped, so their totals are lower.

| Question | Answers (count) |
|---|---|
| How fun was it? (1 Not fun, 2 A little fun, 3 OK, 4 Fun, 5 Loads of fun) | 5: 25; 4: 15; 3: 2 |
| How long did it feel? | About right: 42 |
| Did you know what to do? | Always: 24; Mostly: 18 |
| What felt hardest? (tap any; the choices list that run's own stretches) | The mushroom bounce: 8; Nothing: 7; The tall steps (double jump): 1; Bounce, then double jump: 1; The climb into the branches: 1; The double-jump gaps: 1 |
| Did Dot's tips help? | Didn't notice them: 12; No: 1; Yes: 1 |
| Did anything look wrong or out of place? | No: 15; Yes: 5 |
| Would you play the next level? | Yes: 13; Maybe: 2; No: 1 |

Mean fun score: Normal 4.56 (n=34); Easy 4.50 (n=8).

### Survey per run, with notes

Notes are paraphrased in neutral words. "Looked wrong" is the text box shown after answering Yes to "Did anything look wrong or out of place?".

| Player | Layout | Setting | Fun | Length | Knew what to do | Hardest | Tips | Looked wrong | Next level | Looked-wrong note | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| player B | 26525 | normal | 4 | About right | Always | Nothing | Didn't notice them | No | Yes | - | Nothing felt wrong; play felt very smooth. |
| player B | 13840 | normal | 5 | About right | Always | Nothing | - | No | - | - | - |
| player B | 14902 | normal | 5 | About right | Always | Nothing | - | - | - | - | Felt good. |
| player B | 23436 | normal | 3 | About right | Always | - | - | - | - | - | Sideways (landscape) felt less responsive for jumping and moving; wants to play more before judging. |
| player B | 3024 | normal | 5 | About right | Always | Nothing | - | No | - | - | A run of three mushroom bounces onto rocks flowed well. |
| player B | 35147 | normal | 5 | About right | Always | - | - | No | - | - | A phone call came in and paused the game; that worked well. |
| player B | 21537 | normal | 5 | About right | Always | - | - | Yes | - | Petals sat on a log directly under another log and were hard to reach with the logs that close together. | Ran out of room where the path forked; the logs were too close together to reach the petals. Lost one life trying. It was unclear whether to run to the spot, jump to it or drop to it; jumping kept landing on the upper log. (The note is cut off in the data.) |
| player B | 15406 | normal | 5 | About right | Always | - | - | Yes | - | Petals sat on a log directly under another log and were hard to reach with the logs that close together. | Without the float move, the petal placement does not read clearly; on this layout the double jump does not collect the petals in one smooth line. |
| player A | 28382 | normal | 4 | About right | Mostly | The mushroom bounce | Didn't notice them | No | Yes | - | - |
| player A | 29048 | normal | 4 | About right | Always | Nothing | Didn't notice them | No | Yes | - | Liked how rocks move in to cover holes the player would fall into. |
| player H | 3747 | normal | 4 | About right | Mostly | The mushroom bounce | Didn't notice them | No | Maybe | - | - |
| player I | 12727 | easy | 4 | About right | Mostly | The tall steps (double jump), Bounce, then double jump | No | No | No | - | - |
| player H | 1769 | normal | 4 | About right | Mostly | The climb into the branches | Didn't notice them | No | Maybe | - | - |
| player C | 15861 | normal | 4 | About right | Mostly | The mushroom bounce | Didn't notice them | No | Yes | - | - |
| player C | 28212 | normal | 4 | About right | Mostly | - | Didn't notice them | Yes | Yes | Playing upright (portrait), the picture shifted when climbing up onto logs. | - |
| player D | 26525 | normal | 3 | About right | Always | - | - | - | - | - | The frame rate was poor at times. |
| player D | 21533 | easy | 4 | About right | Always | - | - | - | - | - | The frame rate was poor at times. |
| player D | 12943 | easy | 4 | About right | Always | - | - | - | - | - | - |
| player D | 476 | easy | 4 | About right | Always | - | - | - | - | - | - |
| player E | 18341 | normal | 5 | About right | Always | - | - | - | - | - | Felt good on the narrow screen. |
| player E | 4364 | normal | 5 | About right | Always | - | - | - | - | - | - |
| player E | 25908 | normal | 5 | About right | Always | - | - | - | - | - | Felt the best of the runs so far. |
| player E | 7878 | normal | 4 | About right | Always | - | - | - | - | - | Did not feel as fluid as other runs. |
| player A | 7886 | easy | 5 | About right | Mostly | Nothing | Didn't notice them | No | Yes | - | - |
| player A | 172 | easy | 5 | About right | Always | The mushroom bounce | - | - | - | - | - |
| player A | 33940 | easy | 5 | About right | Mostly | - | - | - | - | - | - |
| player A | 25908 | easy | 5 | About right | Mostly | - | - | - | - | - | - |
| player F | 15458 | normal | 5 | About right | Always | - | - | - | Yes | - | Again nearly lost a life: petals were on a log that could not be jumped to or dropped onto, as it was under another log; had to run off an edge and fall onto it. |
| player F | 18266 | normal | 5 | About right | Always | - | - | - | Yes | - | Felt good and smooth; the picture looked a little washed out. |
| player A | 1769 | normal | 5 | About right | Mostly | - | - | - | - | - | - |
| player C | 29083 | normal | 4 | About right | Mostly | The double-jump gaps | Didn't notice them | No | Yes | - | - |
| player C | 28035 | normal | 4 | About right | Mostly | The mushroom bounce | Didn't notice them | - | Yes | - | - |
| player C | 30782 | normal | 4 | About right | Always | - | Yes | No | Yes | - | - |
| player G | 17581 | normal | 5 | About right | Mostly | The mushroom bounce | Didn't notice them | Yes | Yes | The mounds behaved in a way that did not feel intuitive. | - |
| player B | 29944 | normal | 5 | About right | Always | - | - | No | - | - | Once the float move is unlocked the petal jumps feel right; on a first play of stage 1-1 most players will not have the float yet. |
| player B | 35936 | normal | 5 | About right | Always | - | - | Yes | - | A few rocks look stretched, with jagged edges. | - |
| player B | 20767 | normal | 5 | About right | Always | - | - | - | - | - | - |
| player A | 34921 | normal | 5 | About right | Mostly | The mushroom bounce | - | - | - | - | - |
| player A | 35936 | normal | 5 | About right | Mostly | Nothing | Didn't notice them | No | Yes | - | - |
| player A | 24572 | normal | 5 | About right | Mostly | - | - | - | - | - | Jumped off cliffs while trying to collect the pink balls. |
| player A | 18503 | normal | 5 | About right | Mostly | The mushroom bounce | - | - | - | - | - |
| player A | 12807 | normal | 5 | About right | Mostly | - | - | - | - | - | - |
