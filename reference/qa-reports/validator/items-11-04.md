# The validator items, 2026-11-04 afternoon (fix-petals, fun-validator)

The lead asked for these by 6:30 PM ET, each with tests. They are the validator's **truer rules**. Under the lead's ruling, a stage
rebuilt from today on is gated on them, and a stage not yet rebuilt is gated on the old rules at its listed counts, with the truer count
printed beside it.
- In funcheck.ts, a stage counts as rebuilt when it is built on the music's beat (w1Rhythm.ts's `proto.rhythm`) or listed in `REBUILT`.
- `REBUILT` is empty today, because nothing on this branch is rebuilt yet.
- An earlier push (a90c542f) listed 1-1 to 1-5 ahead of their rebuilds. That stopped working once the template check came in: every
  fillTo finish repeats its pieces, so the stages are marked when they really are rebuilt instead.

| item | where | rule | test (tools/validate/validate.test.ts) |
|---|---|---|---|
| pickups give no variety credit | evaluate.ts movesAlike, movesFlags | the more alike of the goal route's and the terrain's moves; "nothing new" is read from the terrain | moves alike; gated flags; truer beside |
| §0c rules 2-3, templates | variety.ts unitsOf, templateFlags (rule "template repeat") | the same template twice in a row, more than twice in a stage, or repeated with the same numbers. A beat-built stage's templates are its nodes (tag and pair; numbers: bars, direction, tier). An old stage's are its pieces (numbers: length to 10 px). Rests don't count | templates |
| BPM and beat feel | variety.ts rhythmOf, tempoAlike (rule "tempo like the stage before") | from `proto.rhythm`: within 4 BPM of the stage before, with a beat feel (shares of on-beat, off-beat and half-note take-offs) at least 90% alike | tempo and map shape |
| map shape | variety.ts shapeOf, shapeAlike (rule "map like the stage before") | the route's height in 12 parts; over 85% alike to the stage before (mean difference under 45 px) | tempo and map shape |
| a 15-20 s dense finale | core.ts FINALE_TIGHT_MAX, paceFlags | the last group of moves may run tight for up to 20 s; mid-stage it is still 15 s | pacing |
| pairs | mechanics.ts thingsOf, pairsMet | a pair counts only when both things are in one move. A plain jump is not run+jump, a trunk climb is not vines, and World 7's crumbling floor counts as breaking (branches), never slow | pairs |
| tempo: rides and moving hops | mechanics.ts waitAt, tempoOf(s, wait) | patience only when the average wait is over 1 s. A lift: (T - wait)^2 / 2T. A swaying platform: (1 - f)^2 P / 2, where f is the share of its sway in reach | tempo (includes a hop he never waits for, and a lift that is always ready) |
| nothing bites | mechanics.ts fallBites | a miss that drops him over 200 px is a setback. So is a fall into a pit (a higher bank at each end) whose way out (the nearer bank, or a step) is over 4 s off. A missed hop back onto the ground he left is not, and nor is a drop onto open ground | nothing bites |

## What the truer rules say about today's World 1
`npx tsx tools/validate/funcheck.ts` PASSES (152 known), because the gate still holds today's stages to the old rules. The truer counts,
as it prints them (layouts of 16):
- **nothing bites** falls almost everywhere: the long falls were real bites that the old rule priced as free. 1-4 goes from 16 to 0, 1-3
  from 13 to 4 and 1-1 from 12 to 4.
- **template repeat**: every stage except 1-4 and 1-8, on all 16 layouts. This is the fillTo finish, D26's cause.
- **map like the stage before**: 1-2 (6 layouts) and 1-3 (7-8).
- 1-9: the four rises hidden by pickups (funknown.json about).
- Pairs, the finale and ride waits change no World 1 count. World 1 has no lifts or swaying platforms, and no pair it counted is lost.
- Tempo: no World 1 stage on this branch is beat-built yet, so its rules show only in the fixtures.

**For the w1-rhythm merge.** Its 1-2 and 1-5 carry `proto.rhythm`, so they will be gated on the truer rules the moment the branches
meet. A truer flag of theirs that funknown.json lacks fails the gate, for example a map shape like the stage before, or a node template
used three times. That is the point of the rule, but it lands on their merge.

## Bot numbers
None. Every item reads the stage data and the inspector's route, not the first-timer bot.
