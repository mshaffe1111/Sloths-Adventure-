# Sébastien Bénard, "Building the Level Design of a procedurally generated Metroidvania: a hybrid approach" (Game Developer blog, 2017-03-29)

URL: https://www.gamedeveloper.com/design/building-the-level-design-of-a-procedurally-generated-metroidvania-a-hybrid-approach-
Mirror (author's own site, same text): https://deepnight.net/tutorial/the-level-design-of-dead-cells-a-hybrid-approach/
Read: 2026-11-05 ~11:22 AM ET, TinyFish fetch_content, whole article read (both copies, identical text). Verbatim excerpts that bear on the triage rows:

L1 > At first, about two years ago when we began to design and build a prototype for Dead Cells, we went for the traditional, handmade way of doing things. Unfortunately, we quickly realised that we wouldn't have the time to do it properly, considering the modest size of our team.
L2 > There was of course a catch. While the core gameplay feeling was improved by the freshness of new enemy placement, the level design took a great big hit. In short it was illogical, chaotic and left you with no feeling of consistency or immersion in the world.
L3 > we kept the underlying philosophy: building the level's generation system around dramatic peaks and relaxing "breaks" to ensure an interesting game pacing and keep the player enthralled.
L4 > Learning from previous games, and after many trials, errors, adjustments and a stack of tweaking, we've got six steps that we hope will help you approach procedural generation with quality level design as the underpinning rule.
L5 > This graph acts like a set of instruction to the procedural generation algorithm describing the: length of the level, number of specials tiles, how much of the biome will be a labyrinthine, how many tiles separate the entrance from the nearest exit, etc.
L6 > For each node, the algorithm tries a random room, among the ones dedicated for this particular biome, and tests to see if it complies with the instructions given by the graph (location and number of entrances, type, etc). If it doesn't match, the algorithm tries another room until it finds one.
L7 > The number of monsters in one level is defined by the total length of the combat based tiles in the level. ... say for example it's 1 monster for every 5 tiles ... some monsters being more dangerous than the others will count for 10 tiles
L8 > Each room also pertains to a specific biome: for instance rooms used in the prison aren't reused in the sewers. This allows us to give each level its own strongly defined identity.

What it does NOT give: any count of fix rounds per generated level. "Many trials, errors, adjustments and a stack of tweaking" is about the method (the generator), not per-level.
