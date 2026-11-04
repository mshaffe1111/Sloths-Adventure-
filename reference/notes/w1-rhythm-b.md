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
