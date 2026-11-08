# Brief: World 1 on gen2, as a chunk pool. Proved on 1-1 only (lead, 2026-11-05, v2, supervisor-reviewed)

## Why (read this first)
gen2 (src/game/gen2/, on main since 10-28) already IS the chunk engine every shipped hybrid uses. Its hand-made sections
(types.ts:325-362) have ports, difficulty, teaches/uses, maxPerStage, mirroring and Spelunky sub-blocks, and a small generator
picks and orders them. We never moved World 1 onto it. Instead we built new World 1 machinery three times (beat tracer, mixer,
generatePlan). gen2's own measured faults (R1 §3.0) are what make its stages repeat:
- a pool too small for the slots (8-18 usable, 1-4 per phase);
- each node filled until its share of the clock is met (pipeline.ts:702);
- the no-repeat cap not enforced (STAGE-RULES §0c.2; 355/368 shipped rolls break it);
- flat difficulty after slot 3;
- sub-blocks in the type, used by no world.
We fix those faults inside World 1's kit and prove the result on 1-1. We build on what works; we don't write a fourth engine.

## Matt's bar (MATT-DIRECTION.md): check every choice against it
"The engine does the work": a short brief in, the engine assembles; people design the chunks ONCE, reused across stages and rolls.
Variety first ("I just like variety"); old 1-1's look and flow are the feel to keep, not a template. Nothing costs a life in 1-1.
Rocks never float. Test it works first: every other stage must build identically to main (the lock).

## The job, in order. Stop and report at each line marked CHECK
1. **Floor port.** Add World 1's floor edge to gen2: a section may enter and leave on 'floor' (the continuous moss floor at the
   kit's floor line), so any floor chunk sits next to any other. Carry over the planner's floor road (engine-floorroad 4fd9e992,
   w1mix.ts:317-345 the road, :983-984 the per-roll floor depth) as the floor chunk's ground. Add stairs out of the deep floors
   (the red stumps.test cond. 4) as floor-chunk pieces, not as a patch.
2. **Harvest, then count.** Cut old 1-1 (live on main) and the non-combat parts of old 1-3 into gen2 sections in a new
   src/game/gen2/worlds/w1.ts kit, World 1 art only (LABELS rule 4). Each section is 10-20 s, rated 1-10, phase-tagged, and tagged
   with the stage feel it serves (`feel: ['1-1', ...]`) and what it must never be used for (`not`: Meeca's note or hibiscus (1-2),
   punch or combat (1-3), kapok climb or the view north (1-4), folded petals or the chase (1-5), lianas (1-6), the bush (1-7)).
   Use sub-blocks for variety inside a section. Old 1-1 is a SOURCE, not the content: the designer adds new W1 sections from the
   rulebook kit so 1-1 isn't old 1-1 reshuffled. CHECK: a table of pool vs slots per phase for 1-1. The floor is 1:1 with no repeats;
   the aim is 3:1. If it falls short, say by how many, and list the new sections needed (design from the rulebook kit; no new art
   tonight).
3. **Pipeline fixes, World 1 kit only** (every other world's build stays byte-identical to main):
   - length from the chunk count (the brief's length band sets how many chunks), never clock-filling;
   - a hard no-repeat (maxPerStage 1 by default for World 1), as a construction rule;
   - difficulty cadence: ramp up and cool down per node and across the stage (SMBF, Shovel Knight);
   - (WorldOnce game-wide memory waits until a second W1 stage exists: D44.)
   CHECK 3b (proof the fixes work): a scratch run of World 10 with the fixes switched on, era before vs after, 16 rolls. W10's
   shipped output stays byte-identical. gen2 is today's least-varied engine (critic: W9 median 0.27, W10 0.17), so the fixes must
   show they lift variety before 1-1 rests on them.
4. **1-1 as a 7-field brief only** (the designer's WORLD-RULEBOOK §4), built by stage.ts. The arc: calm start chunks (squirrels as
   dressing), one "first lift", a double-chain strong enough to be the moment, a quiet high-branch end pointed north, the bootprint
   place reported (art held, R-165.31, no stand-in). Petals low at marching height. Golden seed >200 px up past a double, with a
   mushroom within 260 px, clear of the HUD. Dot only at rest points with hint.1-1.bank / high / noMoss.
5. **Gates** (the list in .github/workflows/gates.yml plus stage.ts): level check 32/32, nothing costs a life, support check, rocks
   never float, length 120-150 s, quiet <= 4 s, and the variety lines: era diversity >= 0.35, splits >= 34, two-road >= 0.61. Add
   three gates: new 1-1 against old 1-1 must pass the neighbour rule (cosine < 0.78, not looksAlike), with the share of
   each roll's chunks that came from old 1-1 reported; a kinds count (distinct section kinds and surface kinds per stage, from R2 lesson 1), and the lock showing every stage
   but 1-1 identical to main. CHECK: 16-roll numbers, gate by gate PASS / FAIL / NOT RUN.
6. **Show Matt, in World 1's EXISTING art** (no new HF art; not literal grey boxes, since Matt judges look and flow). Three rolls of 1-1 plus old 1-1, on the test link (python3 tools/testlink/build.py), plus stills of
   each roll both ways. Rebuild the test link in place (same URL). The supervisor checks the arc against story-briefs/1-1.md:19-23,
   and the lead checks object by object, before Matt sees it.

## Rules
- Start from engine-core. Never from the lead branch (D40). Push to a new branch engine-chunks after every CHECK.
- Fix the engine or the kit, never a stage by hand (Law 22). No stage id in the pipeline code.
- Read your messages between every job; confirm a change of plan within 10 min (D39).
- Effort: high. In your FIRST reply (within 10 min), give a time and meter estimate per step from measured history. Report time and meter cost at each CHECK. Estimates come from measured history, with the source named (D25).
- Polish check on every still you report, upright and sideways (STAGE-RULES §5b).

## Who
- Planner: steps 1 and 3, plus CHECK 3b (the bottleneck).
- engine-core: step 5 (gates, plus stage.ts learning to build a gen2 stage from a brief), step 2's harvest of old 1-1 into
  sections, and step 6's stills and test link. Engine needs go to the planner.
- Designer: rules on step 2's table (ratings, phases, feel tags, the missing sections) and signs off 1-1's brief. Does not build.
- Supervisor (the previous lead): reviews this brief, step 2's tags against the story, and step 6 before Matt.
- The cold-helper test waits until Matt has played the grey-box and liked it.
