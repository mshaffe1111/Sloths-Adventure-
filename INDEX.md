# Sloths Rainforest Adventures: level picture pack

Every stage as it plays today (Normal setting), for the new art style sheets. Built from engine-core at commit 387c54848, 2026-11-06 6:01 PM ET.

**In each world folder (`W01` … `W10`), per stage:**
- `<id>_a-start.jpg`, `<id>_b-mid.jpg`, `<id>_c-end.jpg`: in-play stills, phone sideways (915 x 412 at 2x), HUD on, Pokey placed by the debug hooks at a busy spot near the start, the middle and the end. Dot's speech bubbles are hidden so they do not cover the art.
- `<id>_strip.jpg`: the whole stage drawn end to end with no HUD, 4000 px wide. Long stages are wrapped into rows (read top row first, left to right) so the pieces stay big enough to see; climbs read bottom to top. The faint vertical seams every screen-width are the backdrop's parallax, which moves with the camera; the platforms, props and creatures are exact.
- 1-1 is the new generated 1-1 (gen2) and changes every play: it has three strips from three proven seeds (`_strip-A`, `-B`, `-C`); its stills are from seed A.

Piece kinds are read from the stage data the game builds (platform styles and flags, vines, set pieces, creatures). Counts in brackets. The data does not name every hazard: water, lava, mist and open pits are drawn from the ground and the world's look, so judge those from the strips (river water in World 2, mist drops in World 4, swamp water in World 6, lava in World 9).


## World 1: Emerald Canopy

*Look (the game's own world line):* The sun-dappled upper treetops where the adventure begins

| Stage | Name | Kind | Size (world px) | Pieces it uses |
|---|---|---|---|---|
| 1-1 | Into the Canopy (gen2; strips from seeds 110, 2727, 5858) | sprint | 37872 x 1791 | mossy stones; branches; logs; bounce pads; heart falls |
| 1-2 | The Petal Trail | harvest | 33181 x 900 | mossy stones; logs; branches; earth banks; bounce pads |
| 1-3 | Branch Snakes | purge | 26711 x 900 | mossy stones; logs; branches; earth banks; bounce pads; ropes/lines (3); creatures: snake x21 |
| 1-4 | Up the Kapok | ascent | 3200 x 7252 | branches; logs; puzzle-room pieces; vines (20); ropes/lines (8); climbing trunks; hollows |
| 1-5 | Where She Walked | harvest | 31220 x 900 | mossy stones; branches; logs; earth banks; bounce pads; crumbling platforms; vines (2); ropes/lines (1); climbing trunks; creatures: snake x1 |
| 1-6 | First Lianas | vine runner | 30222 x 900 | mossy stones; logs; branches; earth banks; push logs; crumbling ruin tiles; bounce pads; crumbling platforms; puzzle-room pieces; vines (21, 17 swinging); climbing trunks; water signs; creatures: snake x2 |
| 1-7 | A Very Good Bush | stealth | 39659 x 900 | mossy stones; logs; branches; earth banks; bounce pads; vines (1); ropes/lines (1); climbing trunks; hiding bushes; watchers |
| 1-8 | The Long Branch | sprint | 33425 x 900 | mossy stones; collapsing long branch; tree crowns; vines (7, 5 swinging); climbing trunks; collapse chase; creatures: snake x5 |
| 1-9 | The Boa's Branches | gauntlet | 19632 x 900 | mossy stones; logs; branches; earth banks; bounce pads; ropes/lines (1); stone ring; creatures: snake x12, boa x8 |
| 1-10 | Venom Fang's Lair | boss lair | 2600 x 900 | logs; branches; vines (4); climbing trunks; boss arena |

## World 2: Sunlit Riverbank

*Look (the game's own world line):* Shimmering turquoise streams and slippery river boulders

| Stage | Name | Kind | Size (world px) | Pieces it uses |
|---|---|---|---|---|
| 2-1 | Down to the River | sprint | 24375 x 900 | logs; drifting logs; carved steps; river water; water signs |
| 2-2 | Petals for the Crown | harvest | 22174 x 900 | mossy stones; logs; drifting logs; river water; water signs; creatures: snake x7 |
| 2-3 | Stuck in the Reeds | rescue | 20834 x 900 | logs; branches; drifting logs; puzzle-room pieces; vines (15); climbing trunks; river water; water signs |
| 2-4 | Over the Water | vine runner | 31267 x 900 | logs; drifting logs; vines (59, 59 swinging); river water; water signs |
| 2-5 | River Snappers | purge | 20280 x 900 | logs; drifting logs; river water; water signs; creatures: turtle x42 |
| 2-6 | Up the Bank Houses | ascent | 3200 x 6058 | branches; logs; wood knots; mailbox posts; vines (19); ropes/lines (11); climbing trunks; hollows; bank walls; ladders; creatures: snake x1 |
| 2-7 | The Mailman's Route | sprint | 30326 x 900 | logs; drifting logs; basket lifts; moving platforms; carved steps; porches; basket lift; vines (2, 2 swinging); river water; water signs; creatures: snake x1 |
| 2-8 | Before the Water Rises | rescue | 19659 x 900 | mossy stones; logs; puzzle-room pieces; river water; water signs |
| 2-9 | The River King's Court | gauntlet | 19706 x 900 | logs; drifting logs; porches; carved steps; puzzle-room pieces; river water; water signs; creatures: turtle x30 |
| 2-10 | Crocus Rex's Lair | boss lair | 2600 x 900 | logs; branches; canopy bridges; mossy stones; moving platforms; vines (3); climbing trunks; boss arena |

## World 3: Mossy Grotto

*Look (the game's own world line):* A cavernous emerald forest above a limestone sinkhole, lit by glowworm threads

| Stage | Name | Kind | Size (world px) | Pieces it uses |
|---|---|---|---|---|
| 3-1 | Into the Grotto | sprint | 34573 x 900 | mossy stones; logs; earth banks; water signs |
| 3-2 | Glowworm Path | stealth | 30744 x 900 | mossy stones; logs; earth banks; puzzle-room pieces; vines (17, 2 swinging); climbing trunks; water signs; hiding bushes; watchers |
| 3-3 | Footprints in a Circle | purge | 37945 x 900 | mossy stones; logs; branches; earth banks; water signs; creatures: ocelot x15, jaguar x4 |
| 3-4 | The Sinkhole | ascent | 3200 x 5228 | branches; logs; vines (14); ropes/lines (10); climbing trunks; hollows; thorns |
| 3-5 | Sleeping Vines | stealth | 28865 x 900 | mossy stones; logs; earth banks; water signs; thorns |
| 3-6 | Grandma's Things | relic hunt | 27726 x 1100 | mossy stones; logs; earth banks; vines (11, 2 swinging); climbing trunks; water signs |
| 3-7 | Which Fern? | relic hunt | 36138 x 1100 | mossy stones; logs; earth banks; vines (2); climbing trunks; water signs; thorns; hiding bushes; watchers |
| 3-8 | Thorn Vine Swing | vine runner | 32707 x 900 | mossy stones; logs; earth banks; vines (18, 18 swinging); water signs; thorns |
| 3-9 | The Prowler's Ring | gauntlet | 39422 x 900 | mossy stones; logs; branches; earth banks; vines (25, 2 swinging); climbing trunks; water signs; stone ring; creatures: ocelot x20, jaguar x1 |
| 3-10 | Shadow Prowler's Lair | boss lair | 2600 x 900 | logs; mossy stones; vines (3); climbing trunks; boss arena |

## World 4: Mist Cascades

*Look (the game's own world line):* Roaring waterfalls and high-altitude moisture bridges

| Stage | Name | Kind | Size (world px) | Pieces it uses |
|---|---|---|---|---|
| 4-1 | The Broken Ledge | ascent | 3200 x 7626 | branches; logs; fern bridges; puzzle-room pieces; vines (21); ropes/lines (5); climbing trunks; hollows; catch points |
| 4-2 | First Glide | sprint | 35851 x 900 | mossy stones; logs; branches; earth banks; little mossy rocks; vines (13); climbing trunks |
| 4-3 | Waterfall Steps | ascent | 31680 x 10937 | logs; branches; mossy stones; push logs; push boulders; pool logs; vines (12); climbing trunks; waterfalls; tides |
| 4-4 | Crosswind | vine runner | 34635 x 900 | mossy stones; logs; branches; earth banks; little mossy rocks; vines (51, 51 swinging); water signs |
| 4-5 | The Sovereign's Dive | stealth | 33009 x 900 | mossy stones; logs; branches; earth banks; bounce pads; little mossy rocks; vines (8); climbing trunks; hiding bushes; watchers |
| 4-D | Dot's Netting Flight | Dot flies it (her own flight stage, after 4-5) | 24470 x 1000 | (its own flight pieces, not in the platform data; seen in the stills: iron netting panels, thorny vines, nectar flowers, spider webs) |
| 4-6 | Above the Mist | ascent | 3200 x 10313 | branches; logs; wood knots; puzzle-room pieces; vines (21); ropes/lines (7); climbing trunks; hollows; catch points; creatures: snake x3 |
| 4-7 | The Long Drop | sprint | 19750 x 10869 | branches |
| 4-8 | Nests on the Cliff | rescue | 36037 x 900 | mossy stones; logs; branches; earth banks; push logs; little mossy rocks; puzzle-room pieces; vines (18); climbing trunks |
| 4-9 | The Aerie | gauntlet | 48275 x 4400 | logs; mossy stones; branches; push logs; little mossy rocks; vines (7); climbing trunks |
| 4-10 | Sky Sovereign's Lair | boss lair | 2600 x 900 | mossy stones; logs; branches; rock pillars; vines (3); climbing trunks; boss arena |

## World 5: Orchid Sanctuary

*Look (the game's own world line):* A paradise of giant hibiscus flowers and sweet nectar pods

| Stage | Name | Kind | Size (world px) | Pieces it uses |
|---|---|---|---|---|
| 5-M | On the March North | Meeca's own stage (you play Meeca), first of World 5 | 29968 x 1200 | mossy stones; branches; logs; puzzle-room pieces; vines (12); climbing trunks |
| 5-1 | The Loveliest Place | sprint | 38360 x 900 | mossy stones; logs; branches; earth banks; creatures: spider x14 |
| 5-2 | Don't Sit | stealth | 46779 x 900 | mossy stones; branches; logs; earth banks; creatures: spider x22 |
| 5-3 | Closing Orchids | harvest | 38881 x 900 | mossy stones; branches; logs; earth banks; orchid platforms; creatures: spider x12 |
| 5-4 | Silk Bridges | vine runner | 41440 x 900 | mossy stones; branches; logs; earth banks; vines (43, 43 swinging); creatures: spider x7 |
| 5-5 | Caught in Silk | rescue | 39868 x 900 | mossy stones; logs; branches; earth banks; vines (1, 1 swinging); creatures: spider x12 |
| 5-6 | Where She Ran | relic hunt | 23111 x 1100 | logs; branches; canopy bridges; mossy stones; vines (8, 1 swinging); climbing trunks; water signs; creatures: eagle x10, tayra x3, ocelot x2, boa x2, snake x1 |
| 5-7 | Don't Touch the Silk | stealth | 32189 x 900 | mossy stones; logs; branches; orchid platforms; creatures: spider x6 |
| 5-8 | Up the Bloom Trees | ascent | 3600 x 7040 | branches; canopy bridges; logs; mossy stones; bounce pads; crumbling platforms; vines (14, 6 swinging); climbing trunks; creatures: tayra x4, boa x1, snake x1, eagle x1 |
| 5-9 | The Queen's Garden | gauntlet | 25596 x 900 | logs; mossy stones; branches; orchid platforms; puzzle-room pieces; creatures: spider x28 |
| 5-10 | Tarantula Queen's Lair | boss lair | 2600 x 900 | logs; mossy stones; moving platforms; vines (3); climbing trunks; boss arena |

## World 6: Deep Mangrove

*Look (the game's own world line):* Tangled stilt root mazes rising above brackish swamps

| Stage | Name | Kind | Size (world px) | Pieces it uses |
|---|---|---|---|---|
| 6-1 | The Root Maze | vine runner | 33501 x 900 | logs; mossy stones; vines (22, 16 swinging); creatures: frog x2 |
| 6-2 | Flat Water | stealth | 36711 x 900 | logs; mossy stones; watchers; hiding bushes |
| 6-3 | Root to Root | vine runner | 34430 x 900 | logs; mossy stones; puzzle-room pieces; vines (13, 13 swinging); watchers; hiding bushes; creatures: frog x2, tayra x2 |
| 6-4 | Low Tide | sprint | 28344 x 900 | logs; mossy stones; creatures: frog x9 |
| 6-5 | The Spear | purge | 19640 x 900 | logs; mossy stones; creatures: frog x9, caiman x7, tayra x3, ocelot x3 |
| 6-6 | Lights in the Roots | sprint | 33512 x 900 | logs; mossy stones; puzzle-room pieces; vines (20, 12 swinging); creatures: frog x1 |
| 6-7 | Through the Roots | vine runner | 34575 x 900 | logs; mossy stones; branches; puzzle-room pieces; vines (16, 14 swinging); watchers; hiding bushes; creatures: frog x3, tayra x1 |
| 6-8 | Stilt Climb | ascent | 1720 x 11287 | logs; branches; stilt-root ledges; vines (38, 8 swinging); climbing trunks; rising tide; creatures: frog x3, tayra x2 |
| 6-9 | Blackwater | gauntlet | 21492 x 900 | logs; mossy stones; creatures: frog x9, caiman x9, ocelot x7, tayra x5 |
| 6-10 | Marsh Reaver's Lair | boss lair | 2600 x 900 | logs; branches; moving platforms; vines (3); climbing trunks; boss arena |

## World 7: Ancient Ruins

*Look (the game's own world line):* Forgotten stone temples draped in centuries of strangler figs

| Stage | Name | Kind | Size (world px) | Pieces it uses |
|---|---|---|---|---|
| 7-1 | The Open Door | sprint | 34590 x 900 | mossy stones; ruin tiles; crumbling ruin tiles; crumbling platforms; creatures: frog x9 |
| 7-2 | Brown Vines | ascent | 3800 x 9200 | mossy stones; ruin tiles; logs; branches; bounce pads; crumbling platforms; vines (17, 5 swinging); climbing trunks; creatures: eagle x2, snake x1, tayra x1 |
| 7-3 | Ten Chairs | relic hunt | 34149 x 1100 | mossy stones; puzzle-room pieces; vines (8); creatures: ocelot x3, tayra x2, boa x1 |
| 7-4 | The Way Up | ascent | 8200 x 1100 | ruin tiles |
| 7-5 | Stone Sentries | purge | 25871 x 900 | mossy stones; ruin tiles; crumbling ruin tiles; crumbling platforms; vines (2, 1 swinging); creatures: frog x9, ocelot x8, tayra x5 |
| 7-6 | Falling Floors | sprint | 31800 x 900 | mossy stones; ruin tiles; crumbling ruin tiles; crumbling platforms; creatures: ocelot x6, boa x1, frog x1 |
| 7-7 | The Photograph | relic hunt | 31287 x 1100 | mossy stones; branches; bounce pads; puzzle-room pieces; vines (6); creatures: ocelot x4, frog x2, tayra x1 |
| 7-8 | The Upper Temple | ascent | 3800 x 7900 | mossy stones; ruin tiles; logs; branches; crumbling platforms; bounce pads; vines (13, 6 swinging); climbing trunks; creatures: boa x3, eagle x2, harpy x1, caiman x1, tayra x1 |
| 7-9 | The Golem's Hall | gauntlet | 24078 x 900 | mossy stones; vines (4, 3 swinging); creatures: ocelot x12, frog x10, boa x5, tayra x3 |
| 7-10 | Stone Idol Golem's Lair | boss lair | 2600 x 900 | logs; ruin tiles; moving platforms; vines (3); climbing trunks; boss arena |
| S-1 | Thornbark's Hollow | secret boss stage behind the Thorn Gate in 7-7 | 2600 x 900 | logs; ruin tiles; mossy stones; vines (2); climbing trunks; boss arena |

## World 8: Twilight Treetops

*Look (the game's own world line):* A mystical purple dusk where glowing fireflies illuminate branches

| Stage | Name | Kind | Size (world px) | Pieces it uses |
|---|---|---|---|---|
| 8-1 | As the Light Goes | sprint | 37579 x 900 | logs; roost branches; puzzle-room pieces; vines (7); watchers |
| 8-2 | Night Blooms | harvest | 29337 x 900 | logs; branches; puzzle-room pieces; ropes/lines (16); heart falls; watchers; hiding bushes; creatures: ocelot x1 |
| 8-3 | Long Swings | vine runner | 35579 x 900 | logs; branches; puzzle-room pieces; vines (16, 16 swinging); heart falls; creatures: ocelot x7 |
| 8-4 | Lantern Run | sprint | 35753 x 1800 | logs; vines (15, 10 swinging); climbing trunks |
| 8-5 | Next Branch | vine runner | 30957 x 900 | logs; branches; puzzle-room pieces; vines (32, 9 swinging); heart falls; creatures: tayra x1 |
| 8-6 | Glide by Moonlight | sprint | 35949 x 900 | logs; heart falls; creatures: boa x3 |
| 8-7 | The Tallest Tree | ascent | 3900 x 9060 | branches; ruin tiles; canopy bridges; logs; mossy stones; bounce pads; crumbling platforms; vines (16, 6 swinging); climbing trunks; creatures: snake x5, jaguar x3, eagle x2, harpy x1, tayra x1 |
| 8-8 | Night Hunters | purge | 27535 x 900 | logs; watchers; creatures: ocelot x12, tayra x7, harpy x5 |
| 8-9 | Monarch's Wood | gauntlet | 30655 x 900 | logs; vines (14); creatures: boa x22, jaguar x8 |
| 8-10 | Night-Wing Monarch's Lair | boss lair | 2600 x 900 | logs; branches; canopy bridges; mossy stones; moving platforms; vines (3); climbing trunks; boss arena |

## World 9: Volcanic Jungle

*Look (the game's own world line):* Basalt ledges, thermal vents, and glowing ember canopies

| Stage | Name | Kind | Size (world px) | Pieces it uses |
|---|---|---|---|---|
| 9-1 | Pepper Air | sprint | 26433 x 900 | logs; mossy stones; branches; canopy bridges; ruin tiles; bounce pads; vines (6, 5 swinging); climbing trunks; creatures: eagle x12, snake x3, harpy x2, tayra x2, caiman x2, ocelot x1, jaguar x1 |
| 9-2 | Rising Heat | ascent | 4000 x 9160 | mossy stones; logs; ruin tiles; branches; bounce pads; crumbling platforms; vines (12, 3 swinging); climbing trunks; creatures: snake x3, jaguar x3, eagle x3, tayra x1 |
| 9-3 | Ember Canopy | vine runner | 26287 x 900 | logs; mossy stones; branches; ruin tiles; canopy bridges; crumbling platforms; vines (8, 6 swinging); climbing trunks; creatures: eagle x12, tayra x3, snake x3, boa x2, caiman x1, jaguar x1 |
| 9-4 | The Drake's Doorstep | stealth | 31837 x 900 | logs; mossy stones; branches; ruin tiles; canopy bridges; bounce pads; moving platforms; crumbling platforms; vines (4, 2 swinging); climbing trunks; creatures: eagle x7, snake x6, harpy x1, boa x1, jaguar x1, tayra x1 |
| 9-5 | Vent Riding | sprint | 32434 x 900 | logs; mossy stones; ruin tiles; branches; canopy bridges; moving platforms; bounce pads; vines (8, 3 swinging); ropes/lines (1); climbing trunks; creatures: eagle x12, snake x2, tayra x1, boa x1, caiman x1 |
| 9-6 | Ash Fields | purge | 25606 x 900 | logs; ruin tiles; mossy stones; branches; canopy bridges; vines (4, 2 swinging); climbing trunks; creatures: tayra x8, boa x6, snake x4, ocelot x4, caiman x3, jaguar x3, eagle x3, harpy x1 |
| 9-7 | Lava Steps | ascent | 4000 x 9700 | ruin tiles; mossy stones; logs; branches; bounce pads; crumbling platforms; vines (14, 2 swinging); climbing trunks; creatures: eagle x3, harpy x2, jaguar x1, snake x1, boa x1 |
| 9-8 | Pell's Thread | relic hunt | 25912 x 1100 | logs; branches; mossy stones; ruin tiles; canopy bridges; bounce pads; vines (7, 2 swinging); climbing trunks; creatures: eagle x14, snake x5, ocelot x3, jaguar x2, boa x2, harpy x1, tayra x1 |
| 9-9 | The Drake's Hoard | gauntlet | 23731 x 900 | logs; branches; ruin tiles; mossy stones; canopy bridges; vines (3, 2 swinging); climbing trunks; creatures: snake x12, tayra x7, jaguar x5, boa x4, eagle x4, caiman x2 |
| 9-10 | Magma Drake's Lair | boss lair | 2600 x 900 | logs; mossy stones; moving platforms; vines (2); climbing trunks; boss arena |

## World 10: Stormy Highlands Fortress

*Look (the game's own world line):* The treacherous summit stronghold where Meeca is held captive!

| Stage | Name | Kind | Size (world px) | Pieces it uses |
|---|---|---|---|---|
| 10-1 | The Door Made for Him | sprint | 27770 x 900 | logs; mossy stones; canopy bridges; ruin tiles; branches; bounce pads; vines (3, 2 swinging); ropes/lines (1); climbing trunks; creatures: eagle x13, snake x8, harpy x2, caiman x1, ocelot x1, jaguar x1, tayra x1 |
| 10-2 | The Thousand Steps | ascent | 4100 x 9220 | ruin tiles; mossy stones; canopy bridges; logs; crumbling platforms; bounce pads; vines (16, 4 swinging); climbing trunks; creatures: eagle x3, jaguar x2, harpy x2, snake x2, ocelot x1, tayra x1 |
| 10-3 | Thunder | stealth | 31511 x 900 | logs; ruin tiles; canopy bridges; mossy stones; branches; vines (12, 3 swinging); ropes/lines (1); climbing trunks; creatures: eagle x8, snake x6, ocelot x2, tayra x2, jaguar x1 |
| 10-4 | Holding On | ascent | 4100 x 8680 | ruin tiles; mossy stones; canopy bridges; logs; crumbling platforms; bounce pads; vines (19, 9 swinging); climbing trunks; creatures: jaguar x3, harpy x3, eagle x3, tayra x1 |
| 10-5 | Halfway Up | ascent | 4100 x 8940 | ruin tiles; mossy stones; canopy bridges; logs; crumbling platforms; bounce pads; vines (13, 3 swinging); climbing trunks; creatures: snake x3, eagle x3, harpy x2, boa x1, jaguar x1, caiman x1, tayra x1 |
| 10-6 | The Iron Netting | vine runner | 27335 x 900 | logs; ruin tiles; canopy bridges; branches; mossy stones; vines (11, 8 swinging); climbing trunks; creatures: eagle x12, tayra x3, snake x2, harpy x2, jaguar x2, boa x1, caiman x1 |
| 10-7 | The Walls | purge | 25901 x 900 | logs; ruin tiles; mossy stones; canopy bridges; branches; vines (5, 2 swinging); climbing trunks; creatures: snake x13, tayra x5, ocelot x3, jaguar x3, caiman x3, eagle x3, harpy x1, boa x1 |
| 10-8 | The Last Steps | ascent | 4100 x 10220 | ruin tiles; mossy stones; canopy bridges; logs; crumbling platforms; bounce pads; vines (18, 5 swinging); climbing trunks; creatures: snake x4, harpy x3, eagle x3, tayra x1, ocelot x1, boa x1 |
| 10-9 | The Fortress Gate | gauntlet | 26403 x 900 | logs; canopy bridges; ruin tiles; mossy stones; branches; vines (3, 2 swinging); climbing trunks; creatures: snake x10, tayra x7, eagle x5, harpy x4, jaguar x4, boa x3, ocelot x1 |
| 10-10 | General Iron-Claw's Lair | boss lair | 2600 x 900 | ruin tiles; logs; canopy bridges; mossy stones; moving platforms; vines (3); climbing trunks; boss arena |

## Seen while shooting

Noted, not fixed (the game's code was read-only for this job):

- **A lighter rectangle in the World 1 backdrop.** In some 1-3 and 1-7 stills (`W01/1-3_a-start.jpg`, `W01/1-7_b-mid.jpg`) a hard-edged, lighter box shows in the backdrop around Pokey's spot, as if a layer is drawn into a box rather than blended. It looks like a drawing defect in the game itself, not the screenshot.
- **1-8 has no ordinary still ledges.** Every ledge Pokey stands on is a piece of the collapsing long branch (the chase), so its middle and end stills stand him on chase pieces.
- **4-D and 5-M are not in the usual platform data.** Dot's flight runs on its own flight code, so the pieces list for 4-D is written from what the stills show. 5-M's start and exit sit near the same point, so its stills were placed at set points along the stage.
- **7-4 turns into a slide part way.** After the crumble the stage becomes a dark tunnel slide (`W07/7-4_c-end.jpg`); its strip shows only the side-on part before it.
- **Strips repeat a few screen-fixed things per screen-width**: the backdrop's parallax seams, the foreground ferns, and in 5-M Meeca's thought cloud.
