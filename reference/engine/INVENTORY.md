# The piece inventory, measured (2026-11-05)

Every kind each world's builder lays today, read off the built stages: 102 stages, layouts 1-2 on Normal, through
`tools/validate`'s sim (`npx tsx tools/engine/inventory.ts`). Counts per world are layout 1's total over the world's stages. "Stages" is
how many stages lay it on any layout. "Laid at" is the first lines in `src/` that pushed one while the stage built (traced; a kind made another way shows none). A landing's key is
its type, style, art and flags. Nothing here is typed by hand. Built on branch engine-mixer: its 1-1 and 1-5 are the mixer's, every other stage is the shipped builder's.

428 kinds; 0 builds failed.

## air

| array | kind | W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8 | W9 | W10 | first | stages | laid at |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| drafts47 | across |  |  |  | 2 |  |  |  |  |  |  | 4-7 | 1 |  |
| drafts47 | bonus |  |  |  | 2 |  |  |  |  |  |  | 4-7 | 1 |  |
| drafts47 | rock |  |  |  | 3 |  |  |  |  |  |  | 4-7 | 1 |  |
| drafts47 | up |  |  |  | 4 |  |  |  |  |  |  | 4-7 | 1 |  |
| updrafts | (none) |  |  |  | 11 |  |  |  |  |  |  | 4-7 | 1 | W4 src/game/protoStage.ts:5762 |

## animal

| array | kind | W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8 | W9 | W10 | first | stages | laid at |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| enemies | boa | 9 |  |  |  | 1 |  | 7 | 25 | 12 | 12 | 1-9 | 23 | W1 src/game/protoStage.ts:2397, W5 src/game/stageGenerator.ts:559, W7 src/game/stageGenerator.ts:559, W8 src/game/gen2/pipeline.ts:1336, W9 src/game/stageGenerator.ts:559, W10 src/game/stageGenerator.ts:559 |
| enemies | caiman |  |  |  |  |  | 16 |  |  | 13 | 6 | 6-4 | 17 | W6 src/game/gen2/pipeline.ts:1336, W9 src/game/stageGenerator.ts:565, W10 src/game/stageGenerator.ts:565 |
| enemies | eagle |  |  |  |  | 9 |  | 4 | 2 | 73 | 56 | 5-6 | 23 | W5 src/game/stageGenerator.ts:658, W7 src/game/stageGenerator.ts:658, W8 src/game/stageGenerator.ts:658, W9 src/game/stageGenerator.ts:658, W10 src/game/stageGenerator.ts:658 |
| enemies | frog |  |  |  |  |  | 38 | 31 |  |  |  | 6-1 | 15 | W6 src/game/gen2/pipeline.ts:1336, W7 src/game/gen2/pipeline.ts:1336 |
| enemies | harpy |  |  |  |  |  |  |  | 6 | 11 | 18 | 7-8 | 20 | W7 src/game/stageGenerator.ts:585, W8 src/game/stageGenerator.ts:585, W9 src/game/stageGenerator.ts:585, W10 src/game/stageGenerator.ts:585 |
| enemies | jaguar |  |  | 5 |  |  |  | 2 | 9 | 20 | 14 | 3-3 | 20 | W3 src/game/protoStage.ts:2968, W7 src/game/stageGenerator.ts:552, W8 src/game/stageGenerator.ts:552, W9 src/game/stageGenerator.ts:552, W10 src/game/stageGenerator.ts:552 |
| enemies | ocelot |  |  | 35 |  | 4 | 10 | 34 | 21 | 7 | 4 | 3-3 | 30 | W3 src/game/protoStage.ts:2968, W5 src/game/stageGenerator.ts:546, W6 src/game/gen2/pipeline.ts:1336, W7 src/game/stageGenerator.ts:546, W8 src/game/gen2/pipeline.ts:1336, W9 src/game/stageGenerator.ts:546, W10 src/game/stageGenerator.ts:546 |
| enemies | snake | 53 | 9 |  | 3 | 5 |  | 4 | 1 | 40 | 36 | 1-3 | 33 | W1 src/game/protoStage.ts:635, W2 src/game/w2Stages.ts:172, W4 src/game/protoStage.ts:5756, W5 src/game/stageGenerator.ts:540, W7 src/game/stageGenerator.ts:540, W8 src/game/stageGenerator.ts:540, W9 src/game/stageGenerator.ts:540, W10 src/game/stageGenerator.ts:540 |
| enemies | spider |  |  |  |  | 101 |  |  |  |  |  | 5-1 | 7 | W5 src/game/w5Stages.ts:329 |
| enemies | tayra |  |  |  |  | 4 | 13 | 13 | 12 | 23 | 23 | 5-6 | 35 | W5 src/game/stageGenerator.ts:571, W6 src/game/gen2/pipeline.ts:1336, W7 src/game/stageGenerator.ts:571, W8 src/game/gen2/pipeline.ts:1336, W9 src/game/stageGenerator.ts:571, W10 src/game/stageGenerator.ts:571 |
| enemies | turtle |  | 72 |  |  |  |  |  |  |  |  | 2-5 | 2 | W2 src/game/w2Stages.ts:198 |

## climbable

| array | kind | W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8 | W9 | W10 | first | stages | laid at |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ropes | rope | 3 |  |  |  |  |  |  |  | 2 | 1 | 1-3 | 6 |  |
| ropes | rope required | 4 | 11 | 10 | 12 |  |  |  | 16 | 1 |  | 1-4 | 7 |  |
| vines | swing_liana | 37 | 62 | 25 | 52 | 8 | 64 | 15 | 38 | 35 | 41 | 1-2 | 56 | W1 src/game/w1Rhythm.ts:1213, W2 src/game/w2Stages.ts:568, W3 src/game/protoStage.ts:615, W4 src/game/protoStage.ts:615, W5 src/game/stageForks.ts:88, W6 src/game/gen2/pipeline.ts:925, W7 src/game/stageGenerator.ts:2509, W8 src/game/gen2/pipeline.ts:925, W9 src/game/stageGenerator.ts:899, W10 src/game/stageForks.ts:88 |
| vines | swing_liana silk |  |  |  |  | 44 |  |  |  |  |  | 5-4 | 2 | W5 src/game/w5Stage54.ts:179 |
| vines | tree_climb | 41 | 36 | 65 | 85 | 28 | 48 | 42 | 56 | 48 | 63 | 1-1 | 71 | W1 src/game/mixer/w1mix.ts:727, W2 src/game/w2Stages.ts:506, W3 src/game/protoStage.ts:620, W4 src/game/protoStage.ts:5737, W5 src/game/meecaStage.ts:222, W6 src/game/gen2/pipeline.ts:925, W7 src/game/gen2/pipeline.ts:925, W8 src/game/gen2/pipeline.ts:925, W9 src/game/stageForks.ts:206, W10 src/game/stageForks.ts:206 |
| vines | tree_climb kit |  |  |  |  | 2 |  |  |  |  |  | 5-M | 1 | W5 src/game/meecaStage.ts:189 |
| vines | tree_climb kit off |  |  |  |  | 1 |  |  | 1 |  |  | 5-M | 2 |  |
| vines | tree_climb rope |  |  |  | 17 |  |  |  | 5 |  |  | 4-8 | 3 | W4 src/game/protoStage.ts:5189, W8 src/game/w8Lantern.ts:185 |

## landing

| array | kind | W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8 | W9 | W10 | first | stages | laid at |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| platforms | bouncy - | 41 |  |  | 2 |  |  | 1 |  |  |  | 1-1 | 9 | W1 src/game/mixer/w1mix.ts:167, W3 src/game/protoStage.ts:1302, W4 src/game/protoStage.ts:1302, W7 src/game/stageGenerator.ts:2971 |
| platforms | bouncy branch |  |  |  |  | 2 |  | 4 | 4 | 2 |  | 5-8 | 7 | W5 src/game/stageGenerator.ts:379, W7 src/game/stageGenerator.ts:379, W8 src/game/stageGenerator.ts:379, W9 src/game/stageGenerator.ts:379 |
| platforms | bouncy canopy_bridge |  |  |  |  |  |  |  | 2 |  | 3 | 5-8 | 5 | W5 src/game/stageGenerator.ts:379, W8 src/game/stageGenerator.ts:379, W10 src/game/stageGenerator.ts:379 |
| platforms | bouncy log |  |  |  |  |  |  | 1 |  | 3 | 4 | 7-2 | 9 | W7 src/game/stageGenerator.ts:379, W9 src/game/stageGenerator.ts:379, W10 src/game/stageGenerator.ts:379 |
| platforms | bouncy moss_stone |  |  |  |  | 1 |  | 5 | 2 | 5 | 5 | 5-8 | 15 | W5 src/game/stageGenerator.ts:379, W7 src/game/stageGenerator.ts:379, W8 src/game/stageGenerator.ts:379, W9 src/game/stageGenerator.ts:379, W10 src/game/stageGenerator.ts:379 |
| platforms | bouncy ruin |  |  |  |  |  |  | 2 | 1 | 3 | 8 | 7-2 | 11 | W7 src/game/stageGenerator.ts:379, W8 src/game/stageGenerator.ts:379, W9 src/game/stageGenerator.ts:379, W10 src/game/stageGenerator.ts:379 |
| platforms | drift log drift |  | 136 |  |  |  |  |  |  |  |  | 2-1 | 7 | W2 src/game/w2Stages.ts:355 |
| platforms | fragile branch |  |  |  |  |  |  | 1 | 1 |  | 8 | 7-2 | 6 | W7 src/game/stageGenerator.ts:379, W8 src/game/stageGenerator.ts:379, W9 src/game/stageGenerator.ts:379, W10 src/game/stageGenerator.ts:379 |
| platforms | fragile branch creak | 30 |  |  |  |  |  |  |  |  |  | 1-2 | 2 | W1 src/game/w1Rhythm.ts:1192 |
| platforms | fragile branch crumbleAfter | 1 |  |  |  |  |  |  |  |  |  | 1-6 | 1 | W1 src/game/w1Rhythm.ts:1192 |
| platforms | fragile branch pit=drop creak | 55 |  |  |  |  |  |  |  |  |  | 1-5 | 1 | W1 src/game/w1Rhythm.ts:1192 |
| platforms | fragile canopy_bridge |  |  |  |  | 1 |  |  |  |  | 3 | 5-8 | 5 | W5 src/game/stageGenerator.ts:379, W10 src/game/stageGenerator.ts:379 |
| platforms | fragile log |  |  |  |  | 1 |  | 1 | 2 | 2 | 6 | 5-8 | 10 | W5 src/game/stageGenerator.ts:379, W7 src/game/stageGenerator.ts:379, W8 src/game/stageGenerator.ts:379, W9 src/game/stageGenerator.ts:379, W10 src/game/stageGenerator.ts:379 |
| platforms | fragile moss_stone |  |  |  |  |  |  |  | 1 | 4 | 9 | 5-8 | 9 | W5 src/game/stageGenerator.ts:379, W7 src/game/stageGenerator.ts:379, W8 src/game/stageGenerator.ts:379, W9 src/game/stageGenerator.ts:379, W10 src/game/stageGenerator.ts:379 |
| platforms | fragile ruin |  |  |  |  |  |  |  |  | 3 | 10 | 7-8 | 9 | W7 src/game/gen2/pipeline.ts:728, W9 src/game/stageGenerator.ts:379, W10 src/game/stageGenerator.ts:379 |
| platforms | fragile ruin crumbleAfter |  |  |  |  |  |  | 127 |  |  |  | 7-1 | 3 | W7 src/game/gen2/pipeline.ts:728 |
| platforms | fragile ruin pit=drop crumbleAfter | 4 |  |  |  |  |  |  |  |  |  | 1-5 | 1 | W1 src/game/mixer/w1mix.ts:167 |
| platforms | moving - art=lift lift |  | 2 |  |  |  |  |  |  |  |  | 2-7 | 1 | W2 src/game/w2Stages.ts:689 |
| platforms | moving canopy_bridge moveRange |  | 1 |  |  |  |  |  | 1 |  |  | 2-10 | 2 | W2 src/game/stageGenerator.ts:379, W8 src/game/stageGenerator.ts:379 |
| platforms | moving log moveRange |  |  |  |  | 1 | 1 |  |  | 1 |  | 5-10 | 3 | W5 src/game/stageGenerator.ts:379, W6 src/game/stageGenerator.ts:379, W9 src/game/stageGenerator.ts:379 |
| platforms | moving moss_stone moveRange |  |  |  |  |  |  |  |  | 1 | 2 | 9-5 | 3 | W9 src/game/stageGenerator.ts:379, W10 src/game/stageGenerator.ts:379 |
| platforms | moving ruin moveRange |  |  |  |  |  |  | 1 |  |  | 2 | 7-10 | 3 | W7 src/game/stageGenerator.ts:379, W10 src/game/stageGenerator.ts:379 |
| platforms | solid - art=hidden | 1 |  |  |  |  |  |  |  |  |  | 1-9 | 1 | W1 src/game/protoStage.ts:2423 |
| platforms | solid - art=kit | 8 | 17 | 6 | 4 | 12 | 8 | 4 | 11 |  |  | 1-4 | 20 | W1 src/game/puzzleKit.ts:344, W2 src/game/puzzleKit.ts:344, W3 src/game/puzzleKit.ts:337, W4 src/game/puzzleKit.ts:344, W5 src/game/puzzleKit.ts:327, W6 src/game/puzzleKit.ts:333, W7 src/game/puzzleKit.ts:340, W8 src/game/puzzleKit.ts:340 |
| platforms | solid - art=porch |  | 62 |  |  |  |  |  |  |  |  | 2-7 | 2 | W2 src/game/w2Stages.ts:644 |
| platforms | solid - chase | 124 |  |  |  |  |  |  |  |  |  | 1-8 | 1 | W1 src/game/flowerReach.ts:65 |
| platforms | solid - chase chaseTip | 1 |  |  |  |  |  |  |  |  |  | 1-8 | 1 | W1 src/game/flowerReach.ts:65 |
| platforms | solid - crown | 1 |  |  |  |  |  |  |  |  |  | 1-8 | 1 | W1 src/game/flowerReach.ts:65 |
| platforms | solid - lily |  |  |  |  |  |  |  |  |  |  | 2-1 | 3 | W2 src/game/w2Stages.ts:466 |
| platforms | solid branch | 126 | 55 | 59 | 307 | 165 | 2 | 28 | 36 | 70 | 31 | 1-2 | 58 | W1 src/game/mixer/w1mix.ts:1038, W2 src/game/w2Stages.ts:517, W3 src/game/protoStage.ts:553, W4 src/game/protoStage.ts:5732, W5 src/game/meecaStage.ts:217, W6 src/game/gen2/pipeline.ts:728, W7 src/game/stageGenerator.ts:379, W8 src/game/gen2/pipeline.ts:728, W9 src/game/stageGenerator.ts:379, W10 src/game/stageGenerator.ts:379 |
| platforms | solid branch art=frond |  |  |  | 1 |  |  |  |  |  |  | 4-1 | 1 |  |
| platforms | solid branch art=orchid |  |  |  |  | 39 |  |  |  |  |  | 5-3 | 3 | W5 src/game/w5Stages.ts:660 |
| platforms | solid branch art=post lip |  | 53 |  |  |  |  |  |  |  |  | 2-6 | 1 |  |
| platforms | solid branch art=stilt |  |  |  |  |  | 7 |  |  |  |  | 6-8 | 1 |  |
| platforms | solid branch catch | 3 |  |  |  |  |  |  |  |  |  | 1-2 | 1 | W1 src/game/mixer/w1mix.ts:1038 |
| platforms | solid branch catch pit=drop | 80 |  |  |  |  |  |  |  |  |  | 1-1 | 2 | W1 src/game/mixer/w1mix.ts:1038 |
| platforms | solid branch lip |  |  |  | 42 |  |  |  |  |  |  | 4-6 | 1 | W4 src/game/protoStage.ts:5732 |
| platforms | solid branch pillar |  |  |  | 1 |  |  |  |  |  |  | 4-10 | 1 | W4 src/game/protoStage.ts:5732 |
| platforms | solid branch pit=drop | 115 |  |  |  |  |  |  |  |  |  | 1-1 | 4 | W1 src/game/mixer/w1mix.ts:1038 |
| platforms | solid canopy_bridge | 42 |  |  |  | 29 |  |  | 22 | 44 | 144 | 1-2 | 21 | W1 src/game/mixer/w1mix.ts:167, W5 src/game/stageGenerator.ts:379, W8 src/game/stageGenerator.ts:379, W9 src/game/stageGenerator.ts:379, W10 src/game/stageGenerator.ts:379 |
| platforms | solid canopy_bridge art=hidden | 1 |  |  |  |  |  |  |  |  |  | 1-2 | 1 |  |
| platforms | solid canopy_bridge catch | 1 |  |  |  |  |  |  |  |  |  | 1-2 | 1 | W1 src/game/mixer/w1mix.ts:167 |
| platforms | solid canopy_bridge pit=drop | 12 |  |  |  |  |  |  |  |  |  | 1-1 | 2 | W1 src/game/mixer/w1mix.ts:167 |
| platforms | solid fungus_shelf |  |  |  |  |  |  |  |  |  |  | 8-2 | 3 | W8 src/game/gen2/pipeline.ts:728 |
| platforms | solid log | 209 | 391 | 253 | 420 | 283 | 999 | 25 | 887 | 399 | 274 | 1-2 | 90 | W1 src/game/mixer/w1mix.ts:167, W2 src/game/w2Stages.ts:140, W3 src/game/protoStage.ts:548, W4 src/game/protoStage.ts:5765, W5 src/game/meecaStage.ts:240, W6 src/game/gen2/pipeline.ts:728, W7 src/game/stageGenerator.ts:379, W8 src/game/gen2/pipeline.ts:728, W9 src/game/stageGenerator.ts:379, W10 src/game/stageGenerator.ts:379 |
| platforms | solid log art=poolLog |  |  |  | 2 |  |  |  |  |  |  | 4-3 | 1 | W4 src/game/w4Stage43.ts:323 |
| platforms | solid log art=steps |  | 27 |  |  |  |  |  |  |  |  | 2-1 | 3 | W2 src/game/w2Stages.ts:608 |
| platforms | solid log art=stilt |  |  |  |  |  | 38 |  |  |  |  | 6-8 | 1 |  |
| platforms | solid log pit=drop | 111 |  |  |  |  |  |  |  |  |  | 1-1 | 5 | W1 src/game/mixer/w1mix.ts:167 |
| platforms | solid log push | 4 |  |  |  |  |  |  |  |  |  | 1-6 | 1 | W1 src/game/mixer/w1mix.ts:167 |
| platforms | solid moss_stone | 170 | 90 | 573 | 161 | 420 | 107 | 780 | 18 | 152 | 171 | 1-2 | 76 | W1 src/game/mixer/w1mix.ts:167, W2 src/game/w2Stages.ts:857, W3 src/game/protoStage.ts:610, W4 src/game/protoStage.ts:563, W5 src/game/meecaStage.ts:182, W6 src/game/gen2/pipeline.ts:728, W7 src/game/gen2/pipeline.ts:728, W8 src/game/gen2/pipeline.ts:728, W9 src/game/stageGenerator.ts:379, W10 src/game/stageGenerator.ts:379 |
| platforms | solid moss_stone art=boulder push |  |  |  | 4 |  |  |  |  |  |  | 4-3 | 1 | W4 src/game/w4Stage43.ts:347 |
| platforms | solid moss_stone art=rock | 3 |  |  | 81 |  |  |  |  |  |  | 1-2 | 6 | W1 src/game/w1Rhythm.ts:1180, W4 src/game/w4Stage49.ts:197 |
| platforms | solid moss_stone pillar |  |  |  | 1 |  |  |  |  |  |  | 4-10 | 1 | W4 src/game/protoStage.ts:563 |
| platforms | solid moss_stone pit=drop | 172 |  |  |  |  |  |  |  |  |  | 1-1 | 3 | W1 src/game/mixer/w1mix.ts:167 |
| platforms | solid moss_stone push |  |  |  | 4 |  |  |  |  |  |  | 4-8 | 2 | W4 src/game/protoStage.ts:563 |
| platforms | solid moss_stone soil | 196 |  | 156 | 368 | 303 |  |  |  |  |  | 1-3 | 21 | W1 src/game/mixer/w1mix.ts:167, W3 src/game/protoStage.ts:610, W4 src/game/protoStage.ts:563, W5 src/game/meecaStage.ts:182 |
| platforms | solid roost_branch |  |  |  |  |  |  |  | 1 |  |  | 8-1 | 1 | W8 src/game/gen2/pipeline.ts:728 |
| platforms | solid ruin |  |  |  |  | 3 |  | 83 | 16 | 120 | 202 | 5-6 | 24 | W5 src/game/stageGenerator.ts:379, W7 src/game/stageGenerator.ts:379, W8 src/game/stageGenerator.ts:379, W9 src/game/stageGenerator.ts:379, W10 src/game/stageGenerator.ts:379 |
| platforms | solid ruin art=hidden |  |  |  |  |  |  | 1 |  |  |  | 7-4 | 1 |  |

## other

| array | kind | W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8 | W9 | W10 | first | stages | laid at |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| bowlGates | (none) | 1 |  |  |  |  |  |  |  |  |  | 1-9 | 1 | W1 src/game/mixer/w1mix.ts:878 |
| falls43 | plug |  |  |  | 3 |  |  |  |  |  |  | 4-3 | 1 |  |
| falls43 | pool |  |  |  | 1 |  |  |  |  |  |  | 4-3 | 1 |  |
| falls43 | surge |  |  |  | 5 |  |  |  |  |  |  | 4-3 | 1 |  |
| falls43 | tide |  |  |  | 1 |  |  |  |  |  |  | 4-3 | 1 |  |
| fallZones | (none) | 24 |  |  |  |  |  |  |  |  |  | 1-2 | 1 | W1 src/game/mixer/w1mix.ts:878 |
| lanes | (none) |  |  |  |  | 2 |  |  |  | 21 | 15 | 5-6 | 13 | W5 src/game/meecaStage.ts:202, W9 src/game/stageGenerator.ts:1631, W10 src/game/stageGenerator.ts:1631 |
| links | (none) |  |  |  |  |  |  | 2 |  |  |  | 7-4 | 1 | W7 src/game/gen2/pipeline.ts:595 |
| proto.catches | (none) |  |  |  | 10 |  |  |  |  |  |  | 4-1 | 2 | W4 src/game/protoStage.ts:5762 |
| proto.covers | (none) | 2 |  |  | 3 |  |  |  |  |  |  | 1-6 | 5 | W1 src/game/mixer/w1mix.ts:878, W4 src/game/protoStage.ts:5762 |
| proto.glints | (none) | 1 |  |  |  |  |  |  |  |  |  | 1-5 | 1 | W1 src/game/mixer/w1mix.ts:878 |
| proto.hollows | (none) | 1 |  | 1 | 2 |  |  |  |  |  |  | 1-4 | 4 | W1 src/game/mixer/w1mix.ts:878, W3 src/game/protoStage.ts:646, W4 src/game/protoStage.ts:5762 |
| proto.leaves | bushWide | 84 |  |  |  |  |  |  |  |  |  | 1-1 | 2 | W1 src/game/mixer/w1mix.ts:773 |
| proto.stilt | cattails |  |  |  |  |  | 2 |  |  |  |  | 6-8 | 1 | W6 src/game/w6Stages.ts:748 |
| proto.stilt | glow-mushrooms |  |  |  |  |  | 2 |  |  |  |  | 6-8 | 1 | W6 src/game/w6Stages.ts:748 |
| proto.stilt | lantern-flower |  |  |  |  |  | 5 |  |  |  |  | 6-8 | 1 | W6 src/game/w6Stages.ts:748 |
| proto.stilt | log-hide |  |  |  |  |  | 2 |  |  |  |  | 6-8 | 1 | W6 src/game/w6Stages.ts:748 |
| proto.stilt | mooring-post |  |  |  |  |  | 5 |  |  |  |  | 6-8 | 1 | W6 src/game/w6Stages.ts:748 |
| proto.stilt | moss-arch |  |  |  |  |  | 2 |  |  |  |  | 6-8 | 1 | W6 src/game/w6Stages.ts:748 |
| proto.stilt | moss-curtain |  |  |  |  |  | 6 |  |  |  |  | 6-8 | 1 | W6 src/game/w6Stages.ts:763 |
| proto.stilt | moss-hide |  |  |  |  |  | 2 |  |  |  |  | 6-8 | 1 | W6 src/game/w6Stages.ts:748 |
| proto.stilt | reed-hide |  |  |  |  |  | 2 |  |  |  |  | 6-8 | 1 | W6 src/game/w6Stages.ts:748 |
| proto.stilt | root-arch |  |  |  |  |  | 2 |  |  |  |  | 6-8 | 1 | W6 src/game/w6Stages.ts:748 |
| proto.stilt | root-mound |  |  |  |  |  | 3 |  |  |  |  | 6-8 | 1 | W6 src/game/w6Stages.ts:748 |
| proto.stilt | rope |  |  |  |  |  | 3 |  |  |  |  | 6-8 | 1 | W6 src/game/w6Stages.ts:705 |
| proto.stilt | stilt |  |  |  |  |  | 69 |  |  |  |  | 6-8 | 1 | W6 src/game/w6Stages.ts:705 |
| proto.stiltLedges | 1 |  |  |  |  |  | 56 |  |  |  |  | 6-8 | 1 | W6 src/game/w6Stages.ts:656 |
| proto.stiltLedges | 2 |  |  |  |  |  | 4 |  |  |  |  | 6-8 | 1 | W6 src/game/w6Stages.ts:723 |
| proto.stiltLedges | 3 |  |  |  |  |  | 4 |  |  |  |  | 6-8 | 1 | W6 src/game/w6Stages.ts:723 |
| proto.stiltLedges | 5 |  |  |  |  |  | 1 |  |  |  |  | 6-8 | 1 | W6 src/game/w6Stages.ts:723 |
| proto.thorns | (none) |  |  | 74 |  |  |  |  |  |  |  | 3-4 | 5 | W3 src/game/protoStage.ts:646 |
| proto.trunks | (none) | 186 |  |  |  |  |  |  |  |  |  | 1-1 | 3 | W1 src/game/mixer/w1mix.ts:878 |
| rivers | (none) |  | 161 |  |  |  |  |  |  |  |  | 2-1 | 8 | W2 src/game/w2Stages.ts:224 |
| trees | (none) | 26 | 36 | 65 | 85 | 28 | 32 | 26 | 18 | 48 | 63 | 1-4 | 57 | W1 src/game/mixer/w1mix.ts:878, W2 src/game/w2Stages.ts:224, W3 src/game/protoStage.ts:646, W4 src/game/protoStage.ts:5762, W5 src/game/meecaStage.ts:202, W6 src/game/gen2/pipeline.ts:595, W7 src/game/gen2/pipeline.ts:595, W8 src/game/gen2/pipeline.ts:595, W9 src/game/stageGenerator.ts:1631, W10 src/game/stageGenerator.ts:1631 |

## pickup

| array | kind | W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8 | W9 | W10 | first | stages | laid at |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| collectibles | cage |  | 15 |  | 20 |  |  |  |  |  |  | 2-3 | 3 | W2 src/game/w2Stages.ts:985, W4 src/game/protoStage.ts:5181 |
| collectibles | exit_totem | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 1-1 | 90 | W1 src/game/mixer/w1mix.ts:1068, W2 src/game/w2Stages.ts:1151, W3 src/game/protoStage.ts:5601, W4 src/game/protoStage.ts:7089, W5 src/game/w5Stages.ts:1461, W6 src/game/gen2/pipeline.ts:1691, W7 src/game/gen2/pipeline.ts:1691, W8 src/game/gen2/pipeline.ts:1691, W9 src/game/stageGenerator.ts:475, W10 src/game/stageGenerator.ts:475 |
| collectibles | find | 5 | 4 | 4 | 5 | 5 | 5 | 5 | 5 | 5 | 4 | 1-2 | 47 | W1 src/game/w1Rhythm.ts:1233, W2 src/game/w2Sections.ts:548, W3 src/game/protoStage.ts:5565, W4 src/game/stageGenerator.ts:3048, W5 src/game/w5Stages.ts:983, W6 src/game/stageGenerator.ts:3048, W7 src/game/stageGenerator.ts:3048, W8 src/game/stageGenerator.ts:3048, W9 src/game/stageGenerator.ts:3048, W10 src/game/stageGenerator.ts:3048 |
| collectibles | flower | 753 | 795 | 845 | 1248 | 1086 | 762 | 565 | 842 | 712 | 642 | 1-1 | 90 | W1 src/game/mixer/w1mix.ts:238, W2 src/game/w2Stages.ts:144, W3 src/game/protoStage.ts:624, W4 src/game/protoStage.ts:5751, W5 src/game/w5Stages.ts:252, W6 src/game/gen2/pipeline.ts:1208, W7 src/game/gen2/pipeline.ts:1208, W8 src/game/gen2/pipeline.ts:1208, W9 src/game/stageGenerator.ts:432, W10 src/game/stageGenerator.ts:432 |
| collectibles | heart | 37 | 25 | 45 | 56 | 47 | 46 | 36 | 52 | 72 | 63 | 1-2 | 95 | W1 src/game/protoStage.ts:242, W2 src/game/w2Stages.ts:163, W3 src/game/protoStage.ts:242, W4 src/game/protoStage.ts:242, W5 src/game/protoStage.ts:242, W6 src/game/easyMode.ts:234, W7 src/game/easyMode.ts:234, W8 src/game/easyMode.ts:234, W9 src/game/stageGenerator.ts:475, W10 src/game/stageGenerator.ts:475 |
| collectibles | powerup_invincible |  |  |  |  |  |  |  |  | 7 | 10 | 9-1 | 12 | W9 src/game/stageGenerator.ts:475, W10 src/game/stageGenerator.ts:475 |
| collectibles | powerup_magnet |  |  |  |  | 1 |  | 2 |  | 16 | 7 | 5-6 | 18 | W5 src/game/stageGenerator.ts:475, W7 src/game/stageGenerator.ts:475, W9 src/game/stageGenerator.ts:475, W10 src/game/stageGenerator.ts:475 |
| collectibles | powerup_speed |  |  |  |  | 4 |  |  |  | 7 |  | 5-6 | 8 | W5 src/game/stageGenerator.ts:475, W9 src/game/stageGenerator.ts:475 |
| collectibles | relic | 13 |  | 18 |  | 3 |  | 10 |  | 4 |  | 1-5 | 7 | W1 src/game/mixer/w1mix.ts:1065, W3 src/game/protoStage.ts:3606, W5 src/game/stageGenerator.ts:475, W7 src/game/gen2/pipeline.ts:1352, W9 src/game/stageGenerator.ts:475 |
| collectibles | seed | 6 | 9 | 1 | 7 |  |  |  |  |  |  | 1-4 | 22 | W1 src/game/protoStage.ts:5981, W2 src/game/w2Stages.ts:214, W3 src/game/w3Sections.ts:318, W4 src/game/protoStage.ts:5981 |
| collectibles | super_heart |  |  |  |  | 1 |  |  |  | 7 | 5 | 5-6 | 13 | W5 src/game/stageGenerator.ts:475, W9 src/game/stageGenerator.ts:475, W10 src/game/stageGenerator.ts:475 |
| collectibles | thorn_gate |  |  |  |  |  |  | 1 |  |  |  | 7-7 | 1 | W7 src/game/stageGenerator.ts:2973 |

## prop

| array | kind | W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8 | W9 | W10 | first | stages | laid at |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| dress | w10Banner |  |  |  |  |  |  |  |  |  | 8 | 10-2 | 4 | W10 src/game/artDress.ts:301 |
| dress | w10Brazier |  |  |  |  |  |  |  |  |  | 10 | 10-1 | 7 | W10 src/game/artDress.ts:360 |
| dress | w10Cage |  |  |  |  |  |  |  |  |  | 10 | 10-1 | 5 | W10 src/game/artDress.ts:301 |
| dress | w10Crate |  |  |  |  |  |  |  |  |  | 8 | 10-1 | 6 | W10 src/game/artDress.ts:301 |
| dress | w10Crates |  |  |  |  |  |  |  |  |  | 8 | 10-2 | 4 | W10 src/game/artDress.ts:301 |
| dress | w10Rack |  |  |  |  |  |  |  |  |  | 10 | 10-1 | 5 | W10 src/game/artDress.ts:301 |
| dress | w5BankA1 |  |  |  |  |  |  |  |  |  |  | 5-6 | 1 | W5 src/game/artDress.ts:301 |
| dress | w5BankA2 |  |  |  |  |  |  |  |  |  |  | 5-6 | 1 | W5 src/game/artDress.ts:301 |
| dress | w5BankB1 |  |  |  |  | 1 |  |  |  |  |  | 5-6 | 2 | W5 src/game/artDress.ts:301 |
| dress | w5BankB2 |  |  |  |  |  |  |  |  |  |  | 5-6 | 2 | W5 src/game/artDress.ts:301 |
| dress | w5BankB3 |  |  |  |  | 1 |  |  |  |  |  | 5-6 | 2 | W5 src/game/artDress.ts:301 |
| dress | w5Bench |  |  |  |  | 1 |  |  |  |  |  | 5-6 | 1 | W5 src/game/artDress.ts:301 |
| dress | w5Birdbath |  |  |  |  |  |  |  |  |  |  | 5-6 | 1 | W5 src/game/artDress.ts:301 |
| dress | w5BookStack |  |  |  |  | 2 |  |  |  |  |  | 5-6 | 2 | W5 src/game/artDress.ts:301 |
| dress | w5ButterflyBush |  |  |  |  |  |  |  |  |  |  | 5-6 | 1 | W5 src/game/artDress.ts:301 |
| dress | w5ClutA1 |  |  |  |  |  |  |  |  |  |  | 5-6 | 1 | W5 src/game/artDress.ts:360 |
| dress | w5ClutA2 |  |  |  |  |  |  |  |  |  |  | 5-6 | 1 | W5 src/game/artDress.ts:360 |
| dress | w5ClutB1 |  |  |  |  |  |  |  |  |  |  | 5-6 | 1 | W5 src/game/artDress.ts:360 |
| dress | w5ClutB2 |  |  |  |  |  |  |  |  |  |  | 5-6 | 1 | W5 src/game/artDress.ts:360 |
| dress | w5ClutB3 |  |  |  |  |  |  |  |  |  |  | 5-6 | 1 | W5 src/game/artDress.ts:360 |
| dress | w5CupChime |  |  |  |  | 2 |  |  |  |  |  | 5-6 | 2 | W5 src/game/artDress.ts:340 |
| dress | w5FernPot |  |  |  |  | 3 |  |  |  |  |  | 5-6 | 2 | W5 src/game/artDress.ts:301 |
| dress | w5Hang1 |  |  |  |  | 1 |  |  |  |  |  | 5-8 | 1 | W5 src/game/artDress.ts:340 |
| dress | w5Hang2 |  |  |  |  | 1 |  |  |  |  |  | 5-8 | 1 | W5 src/game/artDress.ts:340 |
| dress | w5Ladybug |  |  |  |  |  |  |  |  |  |  | 5-6 | 1 | W5 src/game/artDress.ts:301 |
| dress | w5Lanterns |  |  |  |  | 3 |  |  |  |  |  | 5-6 | 2 | W5 src/game/artDress.ts:340 |
| dress | w5Petals |  |  |  |  |  |  |  |  |  |  | 5-6 | 1 | W5 src/game/artDress.ts:360 |
| dress | w5Pots |  |  |  |  | 1 |  |  |  |  |  | 5-6 | 1 | W5 src/game/artDress.ts:301 |
| dress | w5Spool |  |  |  |  | 2 |  |  |  |  |  | 5-6 | 2 | W5 src/game/artDress.ts:301 |
| dress | w5Teacups |  |  |  |  | 1 |  |  |  |  |  | 5-6 | 1 | W5 src/game/artDress.ts:360 |
| dress | w5TeaTin |  |  |  |  | 1 |  |  |  |  |  | 5-6 | 1 | W5 src/game/artDress.ts:360 |
| dress | w5Thimbles |  |  |  |  | 1 |  |  |  |  |  | 5-6 | 1 | W5 src/game/artDress.ts:360 |
| dress | w5WateringCan |  |  |  |  | 1 |  |  |  |  |  | 5-6 | 1 | W5 src/game/artDress.ts:301 |
| dress | w7Banner |  |  |  |  |  |  | 4 |  |  |  | 7-2 | 2 | W7 src/game/artDress.ts:340 |
| dress | w7BellVine |  |  |  |  |  |  | 4 |  |  |  | 7-2 | 2 | W7 src/game/artDress.ts:340 |
| dress | w7Capuchin |  |  |  |  |  |  | 2 |  |  |  | 7-2 | 2 | W7 src/game/artDress.ts:301 |
| dress | w7Censer |  |  |  |  |  |  | 4 |  |  |  | 7-2 | 2 | W7 src/game/artDress.ts:340 |
| dress | w7FrogIdol |  |  |  |  |  |  |  |  |  |  | 7-2 | 2 | W7 src/game/artDress.ts:301 |
| dress | w7LizardBlock |  |  |  |  |  |  |  |  |  |  | 7-2 | 2 | W7 src/game/artDress.ts:301 |
| dress | w7MonkeyStatue |  |  |  |  |  |  | 2 |  |  |  | 7-2 | 2 | W7 src/game/artDress.ts:301 |
| dress | w7StoneLantern |  |  |  |  |  |  |  |  |  |  | 7-2 | 2 | W7 src/game/artDress.ts:301 |
| dress | w7Tablet |  |  |  |  |  |  | 2 |  |  |  | 7-2 | 2 | W7 src/game/artDress.ts:301 |
| dress | w8Curtain |  |  |  |  |  |  |  | 6 |  |  | 8-7 | 1 | W8 src/game/artDress.ts:340 |
| dress | w8FireflyB |  |  |  |  |  |  |  | 1 |  |  | 8-7 | 1 | W8 src/game/artDress.ts:301 |
| dress | w8FlowersB |  |  |  |  |  |  |  | 1 |  |  | 8-7 | 1 | W8 src/game/artDress.ts:301 |
| dress | w8NestB |  |  |  |  |  |  |  | 1 |  |  | 8-7 | 1 | W8 src/game/artDress.ts:301 |
| dress | w9Fern |  |  |  |  |  |  |  |  | 15 |  | 9-1 | 5 | W9 src/game/artDress.ts:301 |
| dress | w9FernB |  |  |  |  |  |  |  |  | 8 |  | 9-2 | 4 | W9 src/game/artDress.ts:301 |
| dress | w9Log |  |  |  |  |  |  |  |  | 3 |  | 9-3 | 3 | W9 src/game/artDress.ts:360 |
| dress | w9LogB |  |  |  |  |  |  |  |  | 3 |  | 9-4 | 2 | W9 src/game/artDress.ts:360 |
| dress | w9Obsidian |  |  |  |  |  |  |  |  | 12 |  | 9-1 | 5 | W9 src/game/artDress.ts:301 |
| dress | w9ObsidianB |  |  |  |  |  |  |  |  | 11 |  | 9-2 | 4 | W9 src/game/artDress.ts:301 |
| dress | w9Smoke |  |  |  |  |  |  |  |  | 3 |  | 9-3 | 3 | W9 src/game/artDress.ts:360 |
| dress | w9SmokeB |  |  |  |  |  |  |  |  | 3 |  | 9-4 | 2 | W9 src/game/artDress.ts:360 |
| dress | w9Tree |  |  |  |  |  |  |  |  | 12 |  | 9-1 | 5 | W9 src/game/artDress.ts:301 |
| dress | w9TreeB |  |  |  |  |  |  |  |  | 8 |  | 9-2 | 4 | W9 src/game/artDress.ts:301 |
| proto.bushes | fern | 1 |  |  | 19 |  |  |  |  |  |  | 1-7 | 2 | W1 src/game/protoStage.ts:2191, W4 src/game/protoStage.ts:2191 |
| proto.bushes | grotto |  |  | 10 |  |  |  |  |  |  |  | 3-2 | 2 | W3 src/game/protoStage.ts:2191 |
| proto.bushes | tall | 19 |  |  | 4 |  | 48 |  | 1 |  |  | 1-7 | 6 | W1 src/game/protoStage.ts:2191, W4 src/game/protoStage.ts:2191, W6 src/game/gen2/worlds/w6.ts:293, W8 src/game/gen2/worlds/w8.ts:269 |
| proto.bushes | wide | 12 |  |  | 4 |  | 47 |  | 1 |  |  | 1-7 | 6 | W1 src/game/protoStage.ts:2191, W4 src/game/protoStage.ts:2191, W6 src/game/gen2/worlds/w6.ts:293, W8 src/game/gen2/worlds/w8.ts:269 |
| proto.decor | archway |  | 2 |  |  |  |  |  |  |  |  | 2-9 | 1 | W2 src/game/w2Stages.ts:236 |
| proto.decor | banner |  | 7 |  |  |  |  |  |  |  |  | 2-9 | 1 | W2 src/game/w2Stages.ts:236 |
| proto.decor | bell |  | 1 |  |  |  |  |  |  |  |  | 2-6 | 1 | W2 src/game/protoStage.ts:6754 |
| proto.decor | canopy |  | 59 |  |  |  |  |  |  |  |  | 2-4 | 1 | W2 src/game/w2Stages.ts:585 |
| proto.decor | chimney |  | 2 |  |  |  |  |  |  |  |  | 2-1 | 2 | W2 src/game/w2Stages.ts:236 |
| proto.decor | dais |  | 1 |  |  |  |  |  |  |  |  | 2-9 | 1 | W2 src/game/w2Stages.ts:236 |
| proto.decor | door |  | 9 |  |  |  |  |  |  |  |  | 2-1 | 3 | W2 src/game/w2Stages.ts:236 |
| proto.decor | doorRoof |  | 8 |  |  |  |  |  |  |  |  | 2-6 | 1 | W2 src/game/protoStage.ts:6746 |
| proto.decor | gong |  | 1 |  |  |  |  |  |  |  |  | 2-9 | 1 | W2 src/game/w2Stages.ts:236 |
| proto.decor | lantern |  | 18 |  |  |  |  |  |  |  |  | 2-6 | 2 | W2 src/game/protoStage.ts:6747 |
| proto.decor | laundry |  | 14 |  |  |  |  |  |  |  |  | 2-1 | 5 | W2 src/game/w2Stages.ts:236 |
| proto.decor | lilyCarpet |  | 3 |  |  |  |  |  |  |  |  | 2-9 | 1 | W2 src/game/w2Stages.ts:236 |
| proto.decor | limbShort |  | 41 |  |  |  |  |  |  |  |  | 2-4 | 1 | W2 src/game/w2Stages.ts:563 |
| proto.decor | logShort |  | 2 |  |  |  |  |  |  |  |  | 2-1 | 2 | W2 src/game/w2Stages.ts:236 |
| proto.decor | mailbox |  | 40 |  |  |  |  |  |  |  |  | 2-1 | 3 | W2 src/game/w2Stages.ts:236 |
| proto.decor | po.carry_stand |  | 3 |  |  |  |  |  |  |  |  | 2-1 | 2 | W2 src/game/w2Stages.ts:709 |
| proto.decor | pole |  | 11 |  |  |  |  |  |  |  |  | 2-1 | 3 | W2 src/game/w2Stages.ts:236 |
| proto.decor | porch |  | 62 |  |  |  |  |  |  |  |  | 2-7 | 2 | W2 src/game/w2Stages.ts:648 |
| proto.decor | reedLean |  | 73 |  |  |  |  |  |  |  |  | 2-1 | 8 | W2 src/game/w2Stages.ts:227 |
| proto.decor | reedShort |  | 108 |  |  |  |  |  |  |  |  | 2-1 | 9 | W2 src/game/w2Stages.ts:227 |
| proto.decor | reedTall |  | 98 |  |  |  |  |  |  |  |  | 2-1 | 9 | W2 src/game/w2Stages.ts:227 |
| proto.decor | rooftop |  | 1 |  |  |  |  |  |  |  |  | 2-6 | 1 | W2 src/game/protoStage.ts:6753 |
| proto.decor | sign |  | 23 |  |  |  |  |  |  |  |  | 2-1 | 4 | W2 src/game/w2Stages.ts:236 |
| proto.decor | steps |  | 3 |  |  |  |  |  |  |  |  | 2-1 | 3 | W2 src/game/w2Stages.ts:621 |
| proto.decor | swingFrame |  | 2 |  |  |  |  |  |  |  |  | 2-7 | 1 | W2 src/game/w2Stages.ts:555 |
| proto.decor | tc.hat_shout |  | 1 |  |  |  |  |  |  |  |  | 2-6 | 1 | W2 src/game/protoStage.ts:6755 |
| proto.decor | tc.scroll |  | 2 |  |  |  |  |  |  |  |  | 2-1 | 2 | W2 src/game/w2Stages.ts:735 |
| proto.decor | throne |  | 1 |  |  |  |  |  |  |  |  | 2-9 | 1 | W2 src/game/w2Stages.ts:236 |
| proto.decor | window |  | 14 |  |  |  |  |  |  |  |  | 2-1 | 4 | W2 src/game/w2Stages.ts:236 |
| proto.dress | w1Acorns | 12 |  |  |  |  |  |  |  |  |  | 1-1 | 7 | W1 src/game/artDress.ts:301 |
| proto.dress | w1Beetle | 6 |  |  |  |  |  |  |  |  |  | 1-2 | 6 | W1 src/game/artDress.ts:360 |
| proto.dress | w1BerryHang | 1 |  |  |  |  |  |  |  |  |  | 1-5 | 2 | W1 src/game/artDress.ts:340 |
| proto.dress | w1Bromeliad | 8 |  |  |  |  |  |  |  |  |  | 1-1 | 6 | W1 src/game/artDress.ts:301 |
| proto.dress | w1Coati | 9 |  |  |  |  |  |  |  |  |  | 1-1 | 7 | W1 src/game/artDress.ts:301 |
| proto.dress | w1FallenLog | 18 |  |  |  |  |  |  |  |  |  | 1-1 | 7 | W1 src/game/artDress.ts:301 |
| proto.dress | w1Fern | 9 |  |  |  |  |  |  |  |  |  | 1-1 | 7 | W1 src/game/artDress.ts:301 |
| proto.dress | w1FernHang | 6 |  |  |  |  |  |  |  |  |  | 1-2 | 5 | W1 src/game/artDress.ts:340 |
| proto.dress | w1Fiddle | 5 |  |  |  |  |  |  |  |  |  | 1-1 | 5 | W1 src/game/artDress.ts:360 |
| proto.dress | w1FlowerBush | 15 |  |  |  |  |  |  |  |  |  | 1-1 | 6 | W1 src/game/artDress.ts:301 |
| proto.dress | w1Hang1 | 4 |  |  |  |  |  |  |  |  |  | 1-2 | 4 | W1 src/game/artDress.ts:340 |
| proto.dress | w1Hang2 | 4 |  |  |  |  |  |  |  |  |  | 1-2 | 4 | W1 src/game/artDress.ts:340 |
| proto.dress | w1Heliconia | 13 |  |  |  |  |  |  |  |  |  | 1-1 | 7 | W1 src/game/artDress.ts:301 |
| proto.dress | w1LeafLitter | 20 |  |  |  |  |  |  |  |  |  | 1-1 | 7 | W1 src/game/artDress.ts:360 |
| proto.dress | w1Morpho | 12 |  |  |  |  |  |  |  |  |  | 1-1 | 7 | W1 src/game/artDress.ts:360 |
| proto.dress | w1MossBoulder | 13 |  |  |  |  |  |  |  |  |  | 1-1 | 6 | W1 src/game/artDress.ts:301 |
| proto.dress | w1Mushroom | 10 |  |  |  |  |  |  |  |  |  | 1-1 | 7 | W1 src/game/artDress.ts:301 |
| proto.dress | w1MushroomDim | 4 |  |  |  |  |  |  |  |  |  | 1-1 | 5 | W1 src/game/artDress.ts:360 |
| proto.dress | w1MushroomTall | 9 |  |  |  |  |  |  |  |  |  | 1-1 | 7 | W1 src/game/artDress.ts:301 |
| proto.dress | w1NestHang | 5 |  |  |  |  |  |  |  |  |  | 1-2 | 4 | W1 src/game/artDress.ts:340 |
| proto.dress | w1NutPod | 13 |  |  |  |  |  |  |  |  |  | 1-1 | 7 | W1 src/game/artDress.ts:360 |
| proto.dress | w1OrchidHang | 2 |  |  |  |  |  |  |  |  |  | 1-4 | 3 | W1 src/game/artDress.ts:340 |
| proto.dress | w1Pebble | 15 |  |  |  |  |  |  |  |  |  | 1-1 | 8 | W1 src/game/artDress.ts:301 |
| proto.dress | w1Pinecone | 4 |  |  |  |  |  |  |  |  |  | 1-1 | 5 | W1 src/game/artDress.ts:360 |
| proto.dress | w1SeedPods | 15 |  |  |  |  |  |  |  |  |  | 1-1 | 6 | W1 src/game/artDress.ts:360 |
| proto.dress | w1Snail | 12 |  |  |  |  |  |  |  |  |  | 1-1 | 6 | W1 src/game/artDress.ts:360 |
| proto.dress | w1Sprig | 10 |  |  |  |  |  |  |  |  |  | 1-1 | 7 | W1 src/game/artDress.ts:301 |
| proto.dress | w1Stones | 3 |  |  |  |  |  |  |  |  |  | 1-1 | 4 | W1 src/game/artDress.ts:360 |
| proto.dress | w1Stump | 8 |  |  |  |  |  |  |  |  |  | 1-1 | 7 | W1 src/game/artDress.ts:301 |
| proto.dress | w1Termites | 16 |  |  |  |  |  |  |  |  |  | 1-1 | 7 | W1 src/game/artDress.ts:301 |
| proto.dress | w1Toucan | 12 |  |  |  |  |  |  |  |  |  | 1-1 | 6 | W1 src/game/artDress.ts:301 |
| proto.dress | w1TrailPost | 15 |  |  |  |  |  |  |  |  |  | 1-1 | 7 | W1 src/game/artDress.ts:301 |
| proto.dress | w1TreeFrog | 14 |  |  |  |  |  |  |  |  |  | 1-1 | 7 | W1 src/game/artDress.ts:301 |
| proto.dress | w1WoodStump | 17 |  |  |  |  |  |  |  |  |  | 1-1 | 7 | W1 src/game/artDress.ts:301 |
| proto.dress | w2BasketHang |  | 1 |  |  |  |  |  |  |  |  | 2-6 | 1 | W2 src/game/artDress.ts:340 |
| proto.dress | w2Canoe |  | 4 |  |  |  |  |  |  |  |  | 2-1 | 6 | W2 src/game/artDress.ts:301 |
| proto.dress | w2CattailFly |  | 11 |  |  |  |  |  |  |  |  | 2-1 | 8 | W2 src/game/artDress.ts:301 |
| proto.dress | w2Crab |  | 4 |  |  |  |  |  |  |  |  | 2-3 | 5 | W2 src/game/artDress.ts:360 |
| proto.dress | w2Driftwood |  | 8 |  |  |  |  |  |  |  |  | 2-1 | 8 | W2 src/game/artDress.ts:301 |
| proto.dress | w2Fern |  | 1 |  |  |  |  |  |  |  |  | 2-2 | 2 | W2 src/game/artDress.ts:360 |
| proto.dress | w2FishTrap |  | 11 |  |  |  |  |  |  |  |  | 2-1 | 7 | W2 src/game/artDress.ts:301 |
| proto.dress | w2Frog |  | 3 |  |  |  |  |  |  |  |  | 2-4 | 4 | W2 src/game/artDress.ts:360 |
| proto.dress | w2GourdHang |  | 1 |  |  |  |  |  |  |  |  | 2-6 | 1 | W2 src/game/artDress.ts:340 |
| proto.dress | w2Hang1 |  |  |  |  |  |  |  |  |  |  | 2-6 | 1 | W2 src/game/artDress.ts:340 |
| proto.dress | w2Hang2 |  |  |  |  |  |  |  |  |  |  | 2-6 | 1 | W2 src/game/artDress.ts:340 |
| proto.dress | w2Heron |  | 4 |  |  |  |  |  |  |  |  | 2-1 | 6 | W2 src/game/artDress.ts:301 |
| proto.dress | w2KingfisherPost |  | 12 |  |  |  |  |  |  |  |  | 2-1 | 8 | W2 src/game/artDress.ts:301 |
| proto.dress | w2LilyBucket |  | 12 |  |  |  |  |  |  |  |  | 2-1 | 8 | W2 src/game/artDress.ts:301 |
| proto.dress | w2Log |  | 5 |  |  |  |  |  |  |  |  | 2-1 | 6 | W2 src/game/artDress.ts:301 |
| proto.dress | w2MossDrip |  | 2 |  |  |  |  |  |  |  |  | 2-6 | 1 | W2 src/game/artDress.ts:340 |
| proto.dress | w2NetHang |  | 1 |  |  |  |  |  |  |  |  | 2-6 | 1 | W2 src/game/artDress.ts:340 |
| proto.dress | w2Otter |  | 11 |  |  |  |  |  |  |  |  | 2-1 | 8 | W2 src/game/artDress.ts:301 |
| proto.dress | w2Raft |  | 8 |  |  |  |  |  |  |  |  | 2-1 | 7 | W2 src/game/artDress.ts:301 |
| proto.dress | w2ReedBundle |  | 9 |  |  |  |  |  |  |  |  | 2-1 | 8 | W2 src/game/artDress.ts:301 |
| proto.dress | w2ReedLean |  | 4 |  |  |  |  |  |  |  |  | 2-2 | 6 | W2 src/game/artDress.ts:301 |
| proto.dress | w2ReedShort |  | 11 |  |  |  |  |  |  |  |  | 2-1 | 7 | W2 src/game/artDress.ts:301 |
| proto.dress | w2ReedTall |  | 5 |  |  |  |  |  |  |  |  | 2-2 | 6 | W2 src/game/artDress.ts:301 |
| proto.dress | w2RiverStone |  |  |  |  |  |  |  |  |  |  | 2-4 | 2 | W2 src/game/artDress.ts:360 |
| proto.dress | w2SignPost |  | 11 |  |  |  |  |  |  |  |  | 2-1 | 7 | W2 src/game/artDress.ts:301 |
| proto.dress | w2Stone |  | 8 |  |  |  |  |  |  |  |  | 2-1 | 7 | W2 src/game/artDress.ts:301 |
| proto.dress | w2Stones |  | 1 |  |  |  |  |  |  |  |  | 2-2 | 2 | W2 src/game/artDress.ts:360 |
| proto.dress | w2Turtle |  | 5 |  |  |  |  |  |  |  |  | 2-1 | 7 | W2 src/game/artDress.ts:301 |
| proto.dress | w2WaterJar |  | 2 |  |  |  |  |  |  |  |  | 2-3 | 3 | W2 src/game/artDress.ts:360 |
| proto.dress | w3BeadMoss |  |  | 2 |  |  |  |  |  |  |  | 3-4 | 1 | W3 src/game/artDress.ts:340 |
| proto.dress | w3Cricket |  |  | 42 |  |  |  |  |  |  |  | 3-1 | 8 | W3 src/game/artDress.ts:301 |
| proto.dress | w3CrystalDrip |  |  | 1 |  |  |  |  |  |  |  | 3-4 | 1 | W3 src/game/artDress.ts:340 |
| proto.dress | w3Crystals |  |  | 42 |  |  |  |  |  |  |  | 3-1 | 8 | W3 src/game/artDress.ts:301 |
| proto.dress | w3Fossil |  |  | 32 |  |  |  |  |  |  |  | 3-1 | 8 | W3 src/game/artDress.ts:360 |
| proto.dress | w3Geode |  |  | 22 |  |  |  |  |  |  |  | 3-1 | 8 | W3 src/game/artDress.ts:301 |
| proto.dress | w3GlowMoss |  |  | 20 |  |  |  |  |  |  |  | 3-1 | 8 | W3 src/game/artDress.ts:360 |
| proto.dress | w3GlowShrooms |  |  | 22 |  |  |  |  |  |  |  | 3-1 | 8 | W3 src/game/artDress.ts:360 |
| proto.dress | w3GlowStalks |  |  | 25 |  |  |  |  |  |  |  | 3-1 | 8 | W3 src/game/artDress.ts:301 |
| proto.dress | w3GlowStone |  |  | 42 |  |  |  |  |  |  |  | 3-1 | 8 | W3 src/game/artDress.ts:301 |
| proto.dress | w3GlowWorms |  |  | 9 |  |  |  |  |  |  |  | 3-1 | 8 | W3 src/game/artDress.ts:360 |
| proto.dress | w3OldNest |  |  | 47 |  |  |  |  |  |  |  | 3-1 | 9 | W3 src/game/artDress.ts:301 |
| proto.dress | w3Pebbles |  |  | 16 |  |  |  |  |  |  |  | 3-1 | 6 | W3 src/game/artDress.ts:360 |
| proto.dress | w3RootBoulder |  |  | 62 |  |  |  |  |  |  |  | 3-1 | 9 | W3 src/game/artDress.ts:301 |
| proto.dress | w3RootGlow |  |  | 3 |  |  |  |  |  |  |  | 3-3 | 2 | W3 src/game/artDress.ts:340 |
| proto.dress | w3ShardsGlow |  |  | 19 |  |  |  |  |  |  |  | 3-1 | 7 | W3 src/game/artDress.ts:360 |
| proto.dress | w3Stalagmites |  |  | 46 |  |  |  |  |  |  |  | 3-1 | 9 | W3 src/game/artDress.ts:301 |
| proto.dress | w4BellHang |  |  |  | 5 |  |  |  |  |  |  | 4-1 | 5 | W4 src/game/artDress.ts:340 |
| proto.dress | w4BellOne |  |  |  | 10 |  |  |  |  |  |  | 4-1 | 8 | W4 src/game/artDress.ts:340 |
| proto.dress | w4BoulderMoss |  |  |  | 26 |  |  |  |  |  |  | 4-2 | 6 | W4 src/game/artDress.ts:301 |
| proto.dress | w4Cairn |  |  |  | 32 |  |  |  |  |  |  | 4-1 | 7 | W4 src/game/artDress.ts:301 |
| proto.dress | w4Feather |  |  |  | 43 |  |  |  |  |  |  | 4-1 | 7 | W4 src/game/artDress.ts:301 |
| proto.dress | w4FernTuft |  |  |  | 11 |  |  |  |  |  |  | 4-2 | 6 | W4 src/game/artDress.ts:360 |
| proto.dress | w4LeafHang |  |  |  | 6 |  |  |  |  |  |  | 4-1 | 5 | W4 src/game/artDress.ts:340 |
| proto.dress | w4Lizard |  |  |  | 17 |  |  |  |  |  |  | 4-2 | 6 | W4 src/game/artDress.ts:301 |
| proto.dress | w4Marmot |  |  |  | 28 |  |  |  |  |  |  | 4-2 | 6 | W4 src/game/artDress.ts:301 |
| proto.dress | w4MossStones |  |  |  | 25 |  |  |  |  |  |  | 4-2 | 6 | W4 src/game/artDress.ts:360 |
| proto.dress | w4RopePost |  |  |  | 25 |  |  |  |  |  |  | 4-2 | 6 | W4 src/game/artDress.ts:301 |
| proto.dress | w4SeedGrass |  |  |  | 20 |  |  |  |  |  |  | 4-2 | 6 | W4 src/game/artDress.ts:360 |
| proto.dress | w4SlateChips |  |  |  | 32 |  |  |  |  |  |  | 4-2 | 6 | W4 src/game/artDress.ts:360 |
| proto.dress | w4Thistle |  |  |  | 12 |  |  |  |  |  |  | 4-2 | 6 | W4 src/game/artDress.ts:301 |
| proto.dress | w4Totem |  |  |  | 23 |  |  |  |  |  |  | 4-2 | 6 | W4 src/game/artDress.ts:301 |
| proto.dress | w4VineHang |  |  |  | 6 |  |  |  |  |  |  | 4-1 | 5 | W4 src/game/artDress.ts:340 |
| proto.dress | w4WindShrub |  |  |  | 27 |  |  |  |  |  |  | 4-2 | 6 | W4 src/game/artDress.ts:301 |
| proto.dress | w5BankA1 |  |  |  |  | 10 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:301 |
| proto.dress | w5BankA2 |  |  |  |  | 11 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:301 |
| proto.dress | w5BankA3 |  |  |  |  | 10 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:301 |
| proto.dress | w5BankB1 |  |  |  |  | 9 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:301 |
| proto.dress | w5BankB2 |  |  |  |  | 7 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:301 |
| proto.dress | w5BankB3 |  |  |  |  | 10 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:301 |
| proto.dress | w5Bench |  |  |  |  | 19 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:301 |
| proto.dress | w5Birdbath |  |  |  |  | 20 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:301 |
| proto.dress | w5BookStack |  |  |  |  | 20 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:301 |
| proto.dress | w5ButterflyBush |  |  |  |  | 20 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:301 |
| proto.dress | w5Buttons |  |  |  |  | 14 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:360 |
| proto.dress | w5ClutA1 |  |  |  |  | 9 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:360 |
| proto.dress | w5ClutA2 |  |  |  |  | 6 |  |  |  |  |  | 5-2 | 6 | W5 src/game/artDress.ts:360 |
| proto.dress | w5ClutA3 |  |  |  |  | 8 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:360 |
| proto.dress | w5ClutB1 |  |  |  |  | 9 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:360 |
| proto.dress | w5ClutB2 |  |  |  |  | 10 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:360 |
| proto.dress | w5ClutB3 |  |  |  |  | 9 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:360 |
| proto.dress | w5FernPot |  |  |  |  | 22 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:301 |
| proto.dress | w5Ladybug |  |  |  |  | 24 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:301 |
| proto.dress | w5Petals |  |  |  |  | 14 |  |  |  |  |  | 5-2 | 6 | W5 src/game/artDress.ts:360 |
| proto.dress | w5Pots |  |  |  |  | 40 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:301 |
| proto.dress | w5Ribbon |  |  |  |  | 15 |  |  |  |  |  | 5-2 | 6 | W5 src/game/artDress.ts:360 |
| proto.dress | w5Spool |  |  |  |  | 20 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:301 |
| proto.dress | w5Sugar |  |  |  |  | 12 |  |  |  |  |  | 5-2 | 5 | W5 src/game/artDress.ts:360 |
| proto.dress | w5Teacups |  |  |  |  | 16 |  |  |  |  |  | 5-2 | 6 | W5 src/game/artDress.ts:360 |
| proto.dress | w5TeaTin |  |  |  |  | 14 |  |  |  |  |  | 5-2 | 6 | W5 src/game/artDress.ts:360 |
| proto.dress | w5Thimbles |  |  |  |  | 26 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:360 |
| proto.dress | w5WateringCan |  |  |  |  | 20 |  |  |  |  |  | 5-1 | 7 | W5 src/game/artDress.ts:301 |
| proto.dress | w5Wheelbarrow |  |  |  |  | 8 |  |  |  |  |  | 5-2 | 5 | W5 src/game/artDress.ts:301 |
| proto.dress | w6AirPlants |  |  |  |  |  |  |  |  |  |  | 6-8 | 1 | W6 src/game/artDress.ts:340 |
| proto.dress | w6BromeliadRoot |  |  |  |  |  | 31 |  |  |  |  | 6-1 | 8 | W6 src/game/artDress.ts:301 |
| proto.dress | w6DriftRoot |  |  |  |  |  | 9 |  |  |  |  | 6-1 | 8 | W6 src/game/artDress.ts:360 |
| proto.dress | w6MudLilies |  |  |  |  |  | 2 |  |  |  |  | 6-2 | 4 | W6 src/game/artDress.ts:360 |
| proto.dress | w6Mudskipper |  |  |  |  |  | 23 |  |  |  |  | 6-1 | 8 | W6 src/game/artDress.ts:301 |
| proto.dress | w6NestBasket |  |  |  |  |  | 1 |  |  |  |  | 6-8 | 1 | W6 src/game/artDress.ts:340 |
| proto.dress | w6OrchidSpray |  |  |  |  |  |  |  |  |  |  | 6-8 | 1 | W6 src/game/artDress.ts:340 |
| proto.dress | w6OysterRoot |  |  |  |  |  | 22 |  |  |  |  | 6-1 | 8 | W6 src/game/artDress.ts:301 |
| proto.dress | w6Pitchers |  |  |  |  |  | 61 |  |  |  |  | 6-1 | 8 | W6 src/game/artDress.ts:301 |
| proto.dress | w6Pods |  |  |  |  |  | 7 |  |  |  |  | 6-1 | 7 | W6 src/game/artDress.ts:360 |
| proto.dress | w6SnailRock |  |  |  |  |  | 5 |  |  |  |  | 6-1 | 7 | W6 src/game/artDress.ts:360 |
| proto.dress | w6StakeLantern |  |  |  |  |  | 60 |  |  |  |  | 6-1 | 8 | W6 src/game/artDress.ts:301 |
| proto.dress | w6SwampFerns |  |  |  |  |  | 57 |  |  |  |  | 6-1 | 8 | W6 src/game/artDress.ts:301 |
| proto.dress | w6WeaverNest |  |  |  |  |  | 1 |  |  |  |  | 6-8 | 1 | W6 src/game/artDress.ts:340 |
| proto.dress | w6WetLeaves |  |  |  |  |  | 9 |  |  |  |  | 6-1 | 8 | W6 src/game/artDress.ts:360 |
| proto.dress | w7Altar |  |  |  |  |  |  | 10 |  |  |  | 7-1 | 7 | W7 src/game/artDress.ts:301 |
| proto.dress | w7Capuchin |  |  |  |  |  |  | 19 |  |  |  | 7-1 | 7 | W7 src/game/artDress.ts:301 |
| proto.dress | w7Coins |  |  |  |  |  |  | 7 |  |  |  | 7-1 | 7 | W7 src/game/artDress.ts:360 |
| proto.dress | w7FrogIdol |  |  |  |  |  |  | 16 |  |  |  | 7-1 | 7 | W7 src/game/artDress.ts:301 |
| proto.dress | w7IdolHead |  |  |  |  |  |  | 8 |  |  |  | 7-1 | 7 | W7 src/game/artDress.ts:360 |
| proto.dress | w7JaguarHead |  |  |  |  |  |  | 18 |  |  |  | 7-1 | 7 | W7 src/game/artDress.ts:301 |
| proto.dress | w7LizardBlock |  |  |  |  |  |  | 17 |  |  |  | 7-1 | 7 | W7 src/game/artDress.ts:301 |
| proto.dress | w7Macaw |  |  |  |  |  |  | 17 |  |  |  | 7-1 | 7 | W7 src/game/artDress.ts:301 |
| proto.dress | w7MonkeyStatue |  |  |  |  |  |  | 20 |  |  |  | 7-1 | 7 | W7 src/game/artDress.ts:301 |
| proto.dress | w7Offering |  |  |  |  |  |  | 13 |  |  |  | 7-1 | 7 | W7 src/game/artDress.ts:360 |
| proto.dress | w7PillarStub |  |  |  |  |  |  | 31 |  |  |  | 7-1 | 7 | W7 src/game/artDress.ts:301 |
| proto.dress | w7Shards |  |  |  |  |  |  | 10 |  |  |  | 7-1 | 6 | W7 src/game/artDress.ts:360 |
| proto.dress | w7StoneBall |  |  |  |  |  |  | 7 |  |  |  | 7-1 | 6 | W7 src/game/artDress.ts:360 |
| proto.dress | w7StoneLantern |  |  |  |  |  |  | 16 |  |  |  | 7-1 | 7 | W7 src/game/artDress.ts:301 |
| proto.dress | w7Tablet |  |  |  |  |  |  | 22 |  |  |  | 7-1 | 6 | W7 src/game/artDress.ts:301 |
| proto.dress | w7UrnTall |  |  |  |  |  |  | 10 |  |  |  | 7-1 | 7 | W7 src/game/artDress.ts:301 |
| proto.dress | w8Firefly |  |  |  |  |  |  |  | 22 |  |  | 8-2 | 4 | W8 src/game/artDress.ts:301 |
| proto.dress | w8FireflyB |  |  |  |  |  |  |  | 29 |  |  | 8-1 | 8 | W8 src/game/artDress.ts:301 |
| proto.dress | w8Flowers |  |  |  |  |  |  |  | 26 |  |  | 8-1 | 8 | W8 src/game/artDress.ts:360 |
| proto.dress | w8FlowersB |  |  |  |  |  |  |  | 24 |  |  | 8-1 | 4 | W8 src/game/artDress.ts:301 |
| proto.dress | w8Fungus |  |  |  |  |  |  |  | 4 |  |  | 8-1 | 4 | W8 src/game/artDress.ts:360 |
| proto.dress | w8Hollow |  |  |  |  |  |  |  | 4 |  |  | 8-1 | 4 | W8 src/game/artDress.ts:360 |
| proto.dress | w8HollowB |  |  |  |  |  |  |  | 5 |  |  | 8-2 | 4 | W8 src/game/artDress.ts:360 |
| proto.dress | w8Nest |  |  |  |  |  |  |  | 22 |  |  | 8-2 | 4 | W8 src/game/artDress.ts:301 |
| proto.dress | w8NestB |  |  |  |  |  |  |  | 29 |  |  | 8-1 | 8 | W8 src/game/artDress.ts:301 |
| proto.kitDecor | basin |  |  | 2 |  |  |  |  |  |  |  | 3-1 | 2 | W3 src/game/artDress.ts:122 |
| proto.kitDecor | branchGate | 2 |  |  |  |  |  |  |  |  |  | 1-6 | 1 | W1 src/game/artDress.ts:82 |
| proto.kitDecor | bridge |  |  |  | 8 |  |  |  |  |  |  | 4-2 | 4 | W4 src/game/artDress.ts:166 |
| proto.kitDecor | bridgeBroken |  |  |  | 16 |  |  |  |  |  |  | 4-1 | 5 | W4 src/game/artDress.ts:166 |
| proto.kitDecor | fern2 |  |  | 6 |  |  |  |  |  |  |  | 3-2 | 3 | W3 src/game/artDress.ts:122 |
| proto.kitDecor | fern4 |  |  | 5 |  |  |  |  |  |  |  | 3-1 | 5 | W3 src/game/artDress.ts:122 |
| proto.kitDecor | fernDoorShut |  |  | 2 |  |  |  |  |  |  |  | 3-7 | 1 | W3 src/game/artDress.ts:101 |
| proto.kitDecor | nestDoorShut | 2 |  |  |  |  |  |  |  |  |  | 1-4 | 1 | W1 src/game/artDress.ts:81 |
| proto.kitDecor | petalBundle | 6 |  |  |  |  |  |  |  |  |  | 1-4 | 3 | W1 src/game/artDress.ts:84 |
| proto.kitDecor | pool |  |  | 9 |  |  |  |  |  |  |  | 3-2 | 5 | W3 src/game/artDress.ts:122 |
| proto.kitDecor | slab |  |  |  |  |  |  |  |  |  |  | 3-2 | 2 | W3 src/game/artDress.ts:122 |
| proto.kitDecor | slabStones |  |  | 2 |  |  |  |  |  |  |  | 3-1 | 4 | W3 src/game/artDress.ts:122 |
| proto.kitDecor | steppingStones |  |  | 9 |  |  |  |  |  |  |  | 3-2 | 5 | W3 src/game/artDress.ts:122 |
| proto.mixDress | bootprint | 1 |  |  |  |  |  |  |  |  |  | 1-1 | 1 |  |
| proto.mixDress | squirrel-sit | 1 |  |  |  |  |  |  |  |  |  | 1-1 | 1 |  |
| proto.mixDress | squirrel-tip | 1 |  |  |  |  |  |  |  |  |  | 1-1 | 1 |  |
| proto.mixDress | squirrel-wave | 1 |  |  |  |  |  |  |  |  |  | 1-1 | 1 |  |
| proto.w3decor | bones |  |  | 15 |  |  |  |  |  |  |  | 3-7 | 2 | W3 src/game/protoStage.ts:5585 |
| proto.w3decor | clawRock |  |  | 39 |  |  |  |  |  |  |  | 3-2 | 6 | W3 src/game/protoStage.ts:5585 |
| proto.w3decor | fern |  |  | 97 |  |  |  |  |  |  |  | 3-1 | 7 | W3 src/game/protoStage.ts:5585 |
| proto.w3decor | glowLit |  |  | 77 |  |  |  |  |  |  |  | 3-1 | 8 | W3 src/game/protoStage.ts:5591 |
| proto.w3decor | grottoMouth |  |  | 1 |  |  |  |  |  |  |  | 3-1 | 1 | W3 src/game/protoStage.ts:3375 |
| proto.w3decor | mossCurtain |  |  | 59 |  |  |  |  |  |  |  | 3-2 | 6 | W3 src/game/protoStage.ts:5591 |
| proto.w3decor | mushrooms |  |  | 54 |  |  |  |  |  |  |  | 3-2 | 6 | W3 src/game/protoStage.ts:5585 |
| proto.w3decor | pawprint |  |  | 91 |  |  |  |  |  |  |  | 3-1 | 4 | W3 src/game/protoStage.ts:5585 |
| proto.w3decor | pillar |  |  | 1 |  |  |  |  |  |  |  | 3-9 | 1 | W3 src/game/protoStage.ts:4143 |
| proto.w3decor | pillarBroken |  |  | 1 |  |  |  |  |  |  |  | 3-9 | 1 | W3 src/game/protoStage.ts:4147 |
| proto.w3decor | pillarCracked |  |  | 1 |  |  |  |  |  |  |  | 3-9 | 1 | W3 src/game/protoStage.ts:4146 |
| proto.w3decor | ringWall |  |  | 1 |  |  |  |  |  |  |  | 3-9 | 1 | W3 src/game/protoStage.ts:4144 |
| proto.w3decor | stalactite |  |  | 112 |  |  |  |  |  |  |  | 3-1 | 6 | W3 src/game/protoStage.ts:5591 |
| proto.w3decor | stalagmites |  |  | 113 |  |  |  |  |  |  |  | 3-1 | 8 | W3 src/game/protoStage.ts:5585 |
| proto.w3decor | trickle |  |  | 2 |  |  |  |  |  |  |  | 3-4 | 1 | W3 src/game/w3Sections.ts:425 |
| proto.w3decor | wallTile |  |  | 28 |  |  |  |  |  |  |  | 3-4 | 1 |  |
| waterSigns | (none) | 3 | 8 | 8 | 1 | 1 |  |  |  |  |  | 1-3 | 22 | W1 src/game/mixer/w1mix.ts:878, W2 src/game/w2Stages.ts:224, W3 src/game/protoStage.ts:646, W4 src/game/protoStage.ts:5762, W5 src/game/meecaStage.ts:202 |

## water

| array | kind | W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8 | W9 | W10 | first | stages | laid at |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| tides43 | (none) |  |  |  | 1 |  |  |  |  |  |  | 4-3 | 1 | W4 src/game/protoStage.ts:5762 |

## zone

| array | kind | W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8 | W9 | W10 | first | stages | laid at |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| zones | bolt |  |  |  |  |  |  |  |  |  | 27 | 10-1 | 5 |  |
| zones | crumble |  |  |  |  |  |  | 28 |  |  |  | 7-1 | 3 |  |
| zones | dark |  |  | 20 |  | 1 | 4 |  | 15 |  |  | 3-1 | 17 |  |
| zones | geyser |  |  |  |  |  |  |  |  | 37 |  | 9-1 | 7 |  |
| zones | spore |  |  | 8 |  |  |  |  |  |  |  | 3-1 | 5 |  |
| zones | tide |  |  |  |  |  | 32 |  |  |  |  | 6-4 | 3 |  |
| zones | web |  |  |  |  | 3 |  |  |  |  |  | 5-6 | 1 |  |
| zones | wind |  |  |  | 50 |  |  |  |  |  |  | 4-2 | 6 |  |
