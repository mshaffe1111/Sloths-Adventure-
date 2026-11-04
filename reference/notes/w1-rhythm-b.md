# w1-rhythm-b notes (1-1 Into the Canopy, 1-4 Up the Kapok), 2026-11-04

Started 12:47 PM ET on branch w1-rhythm-b (merged origin/ccr-0d59a91c-oy3imz first).

## The contract (from the lead's brief)
- 1-1: a linear wave that RISES from the forest floor to the high kapok branches, 88 BPM, steady on-beat hops (a march); run + jump,
  then the double jump. Moment: the double-jump chain up into the canopy, then the view from the top branch.
- 1-4: the vertical chimney kept, its repeated top half rebuilt; 84 BPM, half-note wait-and-go; climb + creaking limbs (taught here,
  0.6 s to recover). Moment: the squirrel lift, then the crown with the view. Sideways, the camera looks up on the climb.
- Both: the research's tension curve (intro, ramp, spike, rest, counter-melody, climax, cool-down), a checkpoint on a 200 px apron at
  every node's entrance. No fillTo. 2-5 min first-timer Normal, never under 2 min skilled. Easy gentler. Something bites in 1-1's
  climax (pits on Normal, soft on Easy). Fun-gate counts fall for 1-1 and 1-4 (funknown.json lowered). Old-bot first-timer runs.
  Stills upright and sideways. Full CLAUDE.md checks. Polish check item by item. Existing World 1 art only, no HF spend.
- Plan to the lead about 3:00 PM ET; built and proven about 6:30 PM ET. beatTrace.ts from w1-rhythm about 2:15 PM ET.

## What is wrong today (measured on the base, layout 1, Normal, the fun validator)
- 1-1: 155 s quick route; move string `jjjjjjjjjQjjjUjjMUUMUUUMUUUUMJJJQQUUUUUQUUUUMUUUUUQJJJMjMJJJJJ`; strip IIIFFFFFRRFFFF...FR (one group of
  100 s); 10 flags: dead walk, repeat jjj, pacing x4 (no rest, 3 groups, never tight), nothing bites (100% free), padding x2 (finish
  52%, "highrun" 9 times), one tempo. The whole stage is at ground level (the name is false).
- 1-4: 110 s; `CCRCRCQCQPJJCJQCJJCRCRCJJQCJCQQPJJJC`; 7 flags: dead walk x2, pacing x2, nothing bites, padding (87%), one tempo. After
  ~2:00 one unit (trunk, plank, trunk, rope) repeats to the top (buildKapok's `while (expert < ...)` loop, w1Kapok rhythm).

## Facts checked in code (for the plan)
- Jump: rise 108 px single, 185 double; flat reach 175 single, 313 double; +60 rise: 138 / 276; airtime 0.63 s; run 285 px/s.
  At 88 BPM a beat is 0.682 s (194 px of running); at 84 BPM 0.714 s, a half-note 1.43 s.
- 1-1's height change: `proto.reveal` (engine.ts updateReveal, built for 6-8) cross-fades the backdrop by height to a strip set and
  pulls the view back with a chime when he stands on the crown. 1-1 uses it with {far: w1sunrise-far, mid: w1c-mid (tree crowns),
  near: w1c-near (canopy leaf tops)}: existing World 1 art, no engine change.
- Creaking limb: Platform type 'fragile' with crumbleAfter 0.6 (engine.ts 2436: the timer starts on landing). A broken one regrows
  after 30-35 s off screen (regrow.ts), and is whole again on respawn (engine.ts 5039).
- The validator: B (crumbling) is hurry; patience is only E/W/Z or words like "wait". Pacing tags 5 s windows: R = a window with no
  move; small steps up (h) break a dead walk but are not moves, so a quiet walk with root steps is a real rest that reads as R.

## Method used
No stage-build method file exists (stage-fix.md points to a `stage-build.md` that is missing): I write one from this job.

## Afternoon (2:30-3:10 PM ET): gate, Easy, bots
- Took beatTrace.ts (+ test) from origin/w1-rhythm (the gap cap at levelCheck's reach). Did not merge all of w1-rhythm: it carries their
  unreviewed 1-2/1-5 and conflicts in w1Sections.ts and validate.test.ts.
- FOUND: the game never passed Easy to the 1-1/1-4 builders (stageGenerator generateStage called buildProtoStage without it), so my Easy
  build (creak 1.2 s, soft-fall finale, lower rises) was never what Easy players got, and the gate measured Normal geometry on Easy.
  Fixed: EASY_BUILT {1-1, 1-4} (w1-rhythm did the same for 1-2/1-5 with RHYTHM_STAGES; join the two at merge).
  Lesson: a builder's `easy` flag proves nothing until the game's own entry point passes it; test through RealPlay/generateStage.
- FOUND: on every 1-4 layout a liana hung THROUGH a bough built above it (the fork and the climax's third trunk ran back over the swing).
  Fixed: the boughs over a liana sit at its top (overSwing), so it hangs from them. Test: no bough crosses a liana, each hangs from one.
  Found by chasing one moved petal (seed 452): a petal row over the swing's gap ended under that bough.
- Fun gate (truer rules, 1-1 and 1-4 in REBUILT): 1-1 and 1-4 have nothing worse; 193 fewer known flags than the base.
  - 1-1 Normal dead walks: 14 layouts to 0. Rest strolls knot every ~330 px from 50 px in (the nodes' aprons already give run-up);
    the intro's exit apron shortened; after a bounce the next apron starts 30 px past the landing; the high road starts by the fork.
  - The two bank ramps were one ramp with no rest between: one piece, not "the bank template twice in a row".
  - Easy: quarter-note hop rows play at half the pace (they merged into walk-offs); every third low-road gap and every fourth spike
    gap is open air (Easy's soft fall). Easy "nothing bites" 16 -> 8 layouts.
  - 14 flags worse on OTHER stages (1-2, 1-3, 1-5, 1-6, 1-7 now look like the new 1-1/1-4): sent to the lead for a ruling.
- Bots (fixed bot, botBaseline --seeds 1-3):
  - 1-4: kid 161-184 s, 0 lives; adult 169-266 s, 0-1 lives.
  - 1-1 with real pits in the finale: adult 7-9 lives, 2 game overs every run (the mushroom and the finale's first gaps). Now the
    finale falls cost a heart and set him back at the gap (heartFalls; the last heart costs a life): adult 2-3 lives, a game over
    on 1 of 3 seeds; kid 184-202 s, 0-1 lives.

## Late afternoon (3:20-5:00 PM ET)
- Matt's approved Dot lines wired exactly (dotLinesData rows; the double-jump tip shows "Flick up again in the air!", the engine text
  kept as the journal's key). Checked through engineGuideLine: all six come out word for word.
- 1-4's creaking limbs are the climbing variant now (1-2 teaches crumbling): the beat is "Ramp: creaking limbs"; the first limb stays
  over a bough one hop down; the lesson card is the global one-time crumble card, so 1-4 shows none once 1-2 has.
- 1-1's petals split 70/15/15 (Matt): splitPetals runs after the petal pass, classifies by the nearer road ledge, tops each road up
  on its own ledges inside the petal rules (reach, tucked, arc, clumps, rows, 6 a screen) and trims the shared path to match. Both
  roads run side by side, so a road holds 6-14 petals without crowding: 1-1 now has 53-80 petals on Normal (was ~80), 73-107 on Easy.
- FOUND: the high road's mushroom sat on the walking line, so every player bounced up and the low road was only a drop through a
  bough (the bots' "the way on is 205 px down" stalls). Now on a perch one jump up; walking on takes the low road. Real-engine test.
- The low road bites every third gap on Normal too (guarded: a heart and back); a bough under the finale's mushroom on Normal.
- Hash (3,264 builds, layouts 1-16, both settings): only 1-1 and 1-4 differ from the lead branch.
- Bots (fixed bot): 1-1 kid 174-184 s, 0-1 lives; adult 208-239 s, 2 lives, 0 game overs. 1-4 kid 161-184 s, 0 lives; adult
  169-266 s, 0-1 lives.

## Evening (5:20-6:00 PM ET): the lead's canopy look review, and the move ruler
- ART DEFECT (for the repaint, the lead via Hugging Face): w1sunrise-far.webp has white orchids painted in its lower corners (see
  reference/qa-reports/w1-rhythm-b/canopy/w1sunrise-far-orchids.jpg). Up a climb the camera shows that strip's lower part, so they read as
  huge pale flowers behind the play line. Found by hooking the canvas in the real build and source-mapping the draw (they are not
  dressing, plant sprites, biome shrubs or the canopy strips). Tonight's fix: 1-1's canopy cross-fades the far strip to w1-far.
- 1-1's canopy: kapoks few and huge (one to 2-5 boughs, 1.6-2.6x wide, opaque, uneven), each bough grows out of one at an end and tucks
  into World 1's painted bush at the other; two thirds of the boughs bare bark; thickness varied 0.82-1.27x. Draw only (Platform.bare,
  Platform.thick, proto.trunks, proto.leaves via protoArt setDecoTrunks). drawcheck on 1-1, both orientations: PASS.
- The validator's grams() kept a hop, a jump and a double jump as one move, so every jumping stage read as alike to every other (old 1-7
  read 93-96% like the new 1-1). Now three moves (the lead's ruling): 18 fun-gate entries lower or gone, none rose; 1-7 vs 1-1 max 50%.
  Next (not done): label a confirmed double jump U in the move string.
