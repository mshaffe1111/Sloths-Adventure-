# Node content types and per-world mixes (lead's research job, 2026-11-05 ~5:10 PM ET)

Sources are named inline: Smith et al. 2009 (Launchpad), Dahlskog & Togelius 2012, the PCG book ch. 5, Hayashida (Nintendo Life and
Kotaku, 17 March 2015), Mario Wiki (Wonder, SMB3, Tropical Freeze), and tetris.wiki's Random Generator. Celeste wasn't checkable
(its wikis block bots). The full report is in the lead's session; the key findings follow.

## A. A node = job x content type x shape x dials
- JOB is the node's role in a mechanic's arc: teach, practise, test, twist, finale (Hayashida's four steps).
- CONTENT TYPE is a family with a difficulty ladder inside it (Dahlskog: 23 patterns in 5 families; a level is about 15 beats).
- STRUCTURAL nodes (arrive, rest, story, exit) sit OUTSIDE the percentages (Smith 2009's rest areas).

The content families:
- ground jump run;
- floating pieces (boughs, logs, drifting logs; moving lifts from W2);
- water crossing (lily pads, stones, drifting logs, rafts, rising water);
- ropes and vines (shimmy, swing, liana, ladder, sinking, thorn);
- climb (stair, shaft);
- bounce;
- crumble (snap twig, creaky limb, tipping root);
- creatures by behaviour (patrol, stomp, timed, watcher, swarm);
- hazards;
- puzzle room;
- chase / pressure;
- fork / risk-reward;
- secret alcove;
- set piece.

## B. How the weights work
1. Roll the TYPE first, then the chunk inside it. Otherwise the type with the most chunks wins (the Tanagra and Launchpad biases).
2. DEAL the counts per stage (largest remainder, then jitter by ±1 on the seed). Don't roll each node on its own: small samples
   drift (Smith 2009, chi-square critic).
3. A BAG across the world's stages (Tetris 7-bag droughts), so the world's total stays on its mix while each stage swings.
4. Caps:
   - no type takes more than about 40% of a stage's content nodes;
   - the same type never sits in two neighbouring content nodes, except practise right after its teach;
   - no "pick it again" bonus (Launchpad's linearity bias).
5. Rarity tiers: common / uncommon / rare (about 5%) / unique (the set piece, once a game), plus a `hard` flag for a world's second
   half (Spelunky 2's !rare and !hard).
6. Each mechanic's arc across a world: weight 0 until its teach stage, a peak over the next 2-3 stages, then a floor (Wonder W1:
   the Hoppos and Bulrush courses return harder).
7. A world's identity: its signature type is its largest share. From W2 on, earlier worlds' types get a floor (STAGE-RULES rule 1).
   Wonder keeps the same kinds and tilts the mix (W1: 55% regular courses; W4: 29% Break Time; W6: 35% badge challenges).
8. Measure each world's real mix over many seeds against its target.

## C. Example mixes (EXAMPLES for the designer to set; percentages of content nodes only)
- W1 (learn jump and climb):
  ground jumps 25, boughs and floating logs 15, climbs 15, ropes and lianas once taught 12, bounce 10, crumble from 1-5 6,
  gentle creatures 5, puzzle rooms (1-4, 1-6) 5, forks and secrets 5, chase 2 (1-8 only).
- W2 (lighter, more puzzles):
  puzzle rooms 18, drifting logs 15, lily pads and stones 12, vine swings 10, moving lifts 10, bank jumps 8, climbs 8, crumble 5,
  creatures 5, forks and secrets 5, bounce 4.
  "Lighter" comes mostly from the dials (tempo toward patience, low density); that's the researcher's own call, not sourced.

## D. What NODES.md is missing
1. Jobs and activities are mixed in one list; split them into job x content type.
2. There's no content type or weight; graphs should hold content slots that the world's mix fills.
3. No per-stage cap per type, no neighbour cooldown by type, no rarity or hard gate.
4. Pool size silently becomes weight.
5. Small samples aren't handled (deal counts).
6. No floor for older mechanics.
7. The world's signature mechanic and the stage's signature set piece are conflated.
8. Structural nodes must sit outside the percentages.
