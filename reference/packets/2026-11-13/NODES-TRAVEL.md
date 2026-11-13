# NODES-TRAVEL: any node can travel any direction; one stage mixes legs and branches (R-165.196, R-165.197). Fable 5.2 high (engine-fable).
Written 12:11 PM ET by the lead. Replaces DESCENT.md (folded in). Branch t-nodes from FA's final head (the lead sends it); you take FA's tokens:
src/game/gen2/pipeline.ts, gen2/types.ts, tower.ts, cameraFollow.ts, levelCheck.ts, stageTime.ts.
Why (Matt, 12:10 PM ET): "These would all be different nodes... you could have a small descent and a level, and then an ascent and a level
that then branches off... so that we can piece everything together, create nodes, and make it so that just plug and play with levels...
The key here is being able to create nodes and add variety throughout the whole game." Today a stage graph has ONE flow (MissionGraph.flow
'right' | 'up', gen2/types.ts:628); FA's tower lay (t-fa) lays a whole stage up; the descent is unbuilt; left is runtime-only
(ENGINE-NEEDS.md truth table). Read: reference/engine/NODES.md, reference/plans/ENGINE-NEEDS.md, FA's REPORT.md + handoffs/engine-core.md,
reference/design/1-5.md (the two-road and card-road design: 1-5.md:21-28).
Built on: FA's tower lay; replaced this sprint by: none.
## Done (general for any stage and world; no stage id/seed/x in engine code; every shipped stage's lock + seed lists unchanged)
1. TRAVEL PER NODE: a node (or a run of nodes, a "leg") carries its travel: right, left, up, down. The graph is a sequence of legs; the lay
   joins legs with turns (a column up, a drop shaft down, a switchback) whose landings are in view before any drop (D46) and never blind.
2. DESCENT is a leg like any other (3-1, 4-7, 6-7, 8-6 on the map): drops onto boughs, vines climbed down, the leaf's glide down a drop.
3. BRANCHES across legs: a fork whose roads may travel differently (over / under / up a column) and rejoin; and the CARD ROAD: a pick node
   whose walked choice lays the next stretch (1-5.md:21-28: two whole plans from one seed, both judged/flown/locked, pick held through
   set-backs, no pop-in: the first differing piece a full sideways screen away). The card road is optional per stage (data).
4. Along the route everywhere: flags, hearts, the 2:00 clock, quiet time, the camera framing per leg (feet low going up, high going down,
   lead ahead going left/right), levelCheck and the bots (child, middle, expert) across mixed legs.
5. A brief/arc says it in DATA (a graph code with leg letters, e.g. R U R D R with a fork), so a designer writes a level by listing nodes.
   Write reference/engine/NODES.md's new section (how to write a mixed graph, with 3 examples) in 30 lines.
6. Proof: 3 fixture stages (level->descent->level->ascent->branch; a left switchback; a card road) on 24 seeds both settings clean; a
   plain-inputs flyer reaches the end in the real engine 24/24; stills both ways of each turn. Full CLAUDE.md Checks on your head.
Milestones (push each, one line to the lead): (1) legs + up/down joins, (2) descent + left, (3) branches across legs, (4) card road.
Stop line 9 PM ET or 40% context: then REPORT.md (30 lines + "Learned") and turnover note; the lead starts a fresh Fable from them.
Lean (TODAY.md). Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
