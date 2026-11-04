# Method: building (or rebuilding) a stage on the beat
First written: 2026-11-04, w1-rhythm-b (1-1 Into the Canopy, 1-4 Up the Kapok). stage-fix.md pointed here and the file did not exist.

## When to use it
A stage is built from nodes on the research's tension curve (intro, ramp, spike, rest, counter-melody, climax, cool-down), with
moves on the music's beat (beatTrace.ts). For fixing one unfair spot in an existing stage, use stage-fix.md instead.

## Steps (in this order; each one caught something on 1-1 or 1-4)
1. **Plan the nodes before wiring**, and draw the plan from the real builder's geometry as early as you can. A schematic hides
   staircases; the lead rejected the first plan for exactly that.
   - Per node: pacing tag, the pair, the note value, pieces, what's under a miss.
   - Vary gaps, heights (up, level and DOWN) and piece sizes; never the same unit stacked.
2. **Measure first**, the base and every change, on the validator's own clock. Use a peek script calling
   `tools/validate/evaluate.ts world(layout, setting)`; print the move string, the pacing strip and each flag. Also print the route's
   segments by node (which platform each jump starts and lands on) to find the shortcuts.
3. **Trace every flow node with beatTrace** (`stageBpm(config)`, never a typed BPM). Learned limits at ~130 BPM:
   - a quarter-note hop can't keep a real gap once the clumsy-thumb pads are added (it merges into a slope);
   - a creaking limb (0.6 s) must be left on the next half note at the latest;
   - an off-beat double up more than ~100 px can trace wider than levelCheck's reach, so the check can't confirm it. Check that every
     move is confirmed: no `Q`/`U` in the move string.
4. **Shortcuts are design holes.** Since 1-1 teaches it, the double jump counts on 1-1 to 1-5. Rules:
   - Keep every piece more than ~230 px vertically from earlier nodes' pieces it overlaps horizontally.
   - Catch boughs under gaps go only where a miss is meant to be safe (the teaching node). Between node levels they become steps that
     skip whole nodes.
   - A stretch that goes back down must not end near a lower node.
   - Prove it: the route's string must contain every node's key moves on all 16 layouts (lift rides, swings, ropes, creaking limbs).
5. **Room in a 3200 px chimney**: plan directions so every node fits.
   - Lift rooms are built going right (come into at their left end).
   - Pre-trace a run's span (`runSpan`) and choose a variant that fits with room left for the next piece (`fitRun` with `after`).
6. **Bumps are platforms of their own**: a root knot or rock on a bough must break the bough round it, or the level check's route walks
   through it. And a knot must not land under a petal (lift the petal).
7. **Flags on a climb** only where higher than the last: the engine takes a flag on an ascent only further up.
8. **Easy**:
   - `easyNode` lowers rises but not drops, so scale drops too, or Easy's climb loses its shape.
   - Creaking limbs hold longer on Easy (1.2 s).
   - The finale's open air is Easy's soft fall (fallZones go through softFall).
9. **Length**: the floor is 2:00 at Matt's pace (the validator's quick clock AND the adult bot), with 2:30 the target. Also keep the
   stage test's `layoutSeconds >= 125`.
   - Count real time honestly: the crown's walk to the shrine counts.
   - Add a node of a new kind, never repeats.
10. **Other stages byte-identical**: hash every stage's build (RealPlay, layouts 1-16, Normal and Easy) on the base worktree and on
    the branch, and diff. Engine changes go behind a flag (BEAT_STAGES) and come with a test that other stages are unchanged.

## Pitfalls we paid for (1-1, 1-4, 2026-11-04)
- A continuous catch bough under a run of hops is a walkway that skips the hops.
- A mushroom step lower than the double jump's 185 px is skipped by the double jump: mushroom steps are 205 px.
- A drop back down after a lift put its far end next to the previous node: one hop skipped the lift and the long rope.
- `crumbleAfter` draws World 7's crumble tiles once that sheet is loaded. World 1 creaking limbs use `Platform.creak`.
- A `walkOff` test must hold the way on: the engine's edge help stops a slow walk at the lip.
- The validator reads rests as empty 5-second windows on a fixed grid (being changed by fix-petals to "1.0 s of no hard input").
  Its quick clock adds 0.5 s to every jump, so "tight" is out of reach at one jump per half note.
- Five rests of 5 s read slow (the lead): 2-3 rests of 3-4 s, each with something to look at.

## Pitfalls we paid for (1-2, 1-5, w1-rhythm, 2026-11-04)
- The tracer lands where the engine does, give or take 9.3 px at 30 fps (SLOP 10). The level check's reach is shorter still. Cap
  every gap at `reachJump(dy, dbl) × 0.97 − 70`, or the shrine check fails while the engine run passes.
- A branch over the take-off ledge's end blocks the jump in the level check: `noOverhang` on the node.
- A first-timer's thumb flicks short: test jumps with a short hold too (SHORT_HOLD 0.8 Normal, 0.6 Easy), jumps only.
- A level check that only knows ledge→liana→ledge can't confirm vine-to-vine chains: a single swing with a pad between each.
- Checkpoints only take further right: a leftward leg needs `flagsInOrder` (engine), and easyMode's flag pass must skip it.
- World 1's pit painter (w1Pits.ts) paints an unmarked floorless gap as WATER: mark floor pieces `pit: 'drop'`, and close slits under
  40 px (he is 38 wide; it only paints a sliver).
- A fall from an upper leg onto a lower leg skips the way: fallZones over the upper leg (a heart and back on Normal, free on Easy).
  A safe teach can't sit there: teach the hazard over a solid base instead.
- Lianas grab on touch: no hazard or open fall over a liana of a lower leg.
- The same node template with the same bars twice is a §0c.3 flag (variety.ts): roll a second half until its bars differ.
- Any fragile piece that looks wrong for its world: trace it to the draw path before naming it "the existing art".

## Pitfalls we paid for (1-1, 1-4, afternoon 2026-11-04)
- **Easy must reach the builder through the game's own door.** generateStage did not pass Easy to buildProtoStage, so a builder's Easy
  path ran in its tests and never in the game (and the fun gate measured Normal geometry as Easy). Add the stage to the generator's
  set (EASY_BUILT / RHYTHM_STAGES), and measure Easy through RealPlay or the validator, never only by calling the builder.
- **A liana needs its own air.** A later bough laid back across a swing hung the liana through it. A bough over a liana sits at its top,
  so the liana hangs from it. Test: no bough crosses a liana's line, and each liana hangs from one.
- **A bounce reads as no input** (1.5-2 s on Easy): start the next node's apron just past the landing, or it is a dead walk.
- **Count a knot's width in a rest's length**, or adding knots stretches the rest past 4 s.
- **Quarter-note hops down merge on Easy** (wider pads, lower drops): play them at half the pace on Easy.
- **Stage 1's climax**: real pits there cost a first-timer adult 7-9 lives, with two game overs a run. Falls that cost a heart and set
  him back at the gap (heartFalls) still bite, at 2-3 lives. Run the adult bot before calling a climax fair.
- **Gate entries flip on borderline shares** (80% vs 80.4%): judge the 16-layout count, not one layout.
