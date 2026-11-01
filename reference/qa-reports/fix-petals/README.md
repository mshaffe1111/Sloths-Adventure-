# fix-petals: 1-2 The Petal Trail's sealed door (2026-11-01)

Branch `fix-petals`, from main (release 0.9.2). 1-2 only: every other stage builds byte-identical (below).

## What was wrong (checked in the engine, law 3)

On Normal the first-timer bot ended at 1-2's sealed door on seeds 1, 2 and 3 (70-77 of 92-99 petals). Two causes:

1. **The bot never goes up for petals on purpose.** It follows the level check's quickest route, which walks the floor under the
   branches. A person following "Follow the petals" / "The petals go up" would climb. That part is the bot.
2. **The stage gave no way back up.** One walk off the top stair, or one short hop between branches, dropped Pokey to the floor with
   3-4 branches of petals (6-11) overhead and nothing that climbs back. With an 87.5% goal, one miss per high run sealed the door. That
   part is the stage, and it is what a real first-timer hits.

Also found and fixed:
- the split trail's low stretch had an empty branch overhead, a hop away from the high road: the natural hop landed on it and walked
  him over the low petals;
- the petals leading down off the high road hung 95-115 px over the floor, where neither a drop nor a floor walk passes;
- the first stair step (40 px) was a thin ledge that Pokey walks straight through;
- a petal lay 60 px behind the spawn (every hand stage's `rest()` lays one at x 80, spawn 140; fixed for 1-2 only).

**And a bot bug** (handed to the bot-fix job, not changed here): `tools/inspect/firsttimer.ts:1259` measures movement as
`p.x - this.lastX`, but lastX is already p.x, so the "stopped dead" rule fires after every 0.3 s of walking. The bot hops about every
0.35 s on flat ground and takes off about 110 px before an edge (its edgeAim is 22). That is where the "bough petals flown over" in
Worlds 1/3/5 came from: with the one-line fix (`Math.abs(this.moveX)`) the flown-over bough petals fall to 0-2 a run on main (1-9 aside,
which has a guard goal). With origin/bot-fix 877a819b, bough petals flown over (passed above, or within 34-70 px above) per run, seeds
1-3: 3-2 Normal 0 0 0 / Easy 0 0 0; 5-2 Normal 0 0 0 / Easy 0 0 0; 1-2 on main Normal 0-1 / Easy 0-2 (9 runs each). Bug 2 was dropped on
the lead's call: no float change without real evidence, and there is none. Nothing in petals.ts changed.

## The fix (`src/game/protoStage.ts`, 1-2 only)

- `catchUp`: a mushroom on the floor at each high branch's near end (the stair top and every gap of trailUp, splitTrail's high runs,
  highLeaps' gaps). A miss is one bounce back up. `proto.catchUps` lists them.
- splitTrail: no branch over the low stretch; the two petals that lead down sit 50 px over the floor; three dips where there were two.
- trailUp: the steps stand down into the ground, the bank broken around them (as lowStumps' do).
- No petal behind the spawn.

## Numbers: first-timer bot, 1-2, goal got / needed

The bot is origin/bot-fix 877a819b (merged into this branch on the lead's word: the stuck-rule fix plus its puzzle-room, fall-loop and
rescue fixes). Seeds 1-3 x 3 trials. Main measured with the same bot (its firsttimer.ts checked out over main).

| | main | fix-petals |
|---|---|---|
| Normal s1 | 74, 76, 76 /95 (sealed x3) | 102, 101, 101 /98 |
| Normal s2 | 76, 77, 81 /99 (sealed x3) | 107, 108, 107 /102 |
| Normal s3 | 71, 66, 70 /92 (sealed x3) | 96, 95, 99 /95 |
| Easy s1 | 70 (sealed), 74, 65 (sealed) /72 | 95, 97, 99 /72 |
| Easy s2 | 71 (sealed), 74, 71 (sealed) /72 | 100, 105, 100 /72 |
| Easy s3 | 65, 63, 67 /72 (sealed x3) | 92, 92, 92 /72 |

Main: the door opens on 2 of 18 runs. Branch: 18 of 18. **Normal's margin is thin: 0 to +6** (seed 3 trial 1 is exactly 95/95). What
the branch's Normal runs still leave, 13-ish a run: the arcs over the teaching gaps (the bot drops into the moss on the first gaps) and
the arc at the end of each stair run, shaped for a hop off the end, which a walk off passes under (1 a run each). That bot follows the
level check's route and never goes for a petal on purpose, so a person following the petals should do better. A wider margin would be
a design call (reshape the descent arcs for a walk off, at the cost of a hop off, or count the goal from an adult first-timer the way
Easy's gen2 goal counts the kid: the method's "To try").

(The first measurements, with only the one-line stuck-rule fix applied in a scratch copy, gave the same picture: 18 of 18, Normal 1-8
over.)

Other numbers, branch against main:
- 200-roll tool (era.ts, 1-2): 0 rolls break the §2 numbers (main: 0 dead-time, 1 kid hot spot; branch: none). Dead time median 13.1 s
  (main 17.4), worst 29.4 s (35.6). Quick route median 158 s (158). Variety 0.357 (0.366), still over 0.35. A first version without the
  third low dip put 6 of 200 split-trail rolls over a fifth dead; the third dip fixed it.
- Inspector seed 1/2/3: length 154/156/158 s (main 155/157/158), dead 15/27/16 s at the time of the first run (main 18/24/18).

## Proof

- `src/game/stage12Catch.test.ts` (real engine, layouts 1-16): a walk off every gap and every stair top bounces back up onto the
  branch, every step is a face, the catches stand on the floor, no branch over the low trail, no petal behind the start. **All 5 fail
  on main, all pass here.**
- `tools/inspect/stageHash.mts`: 3,264 builds hashed (every stage, Normal and Easy, layouts 1-16) on main and on the branch. Only
  1-2's 32 differ.
- `tools/inspect/petalLeft.ts`: every petal a first-timer run leaves, classified (floor / bough / air; passed over / under / near /
  never near).

## Stills and clips (412x915 upright, 915x412 sideways)

- `*-1-stairs.png`: the petal stairs, petals leading up.
- `*-2-branch-run.png`: on the high run; a catch mushroom under each gap below.
- `*-3-missed-floor.png`: after a miss, on the floor: the next mushroom is right ahead.
- `*-4-split-low.png`: the high road ends, the petals arc down to the floor trail.
- `*-5-sealed-door.png`: at the shrine 28 short: the sign on the shrine and Dot's line.
- `*-miss-caught.mp4` (+ `-quarter.mp4`): walking off branch after branch, each catch bounces him back up (engine stepped frame by
  frame at 30 fps). `*-hop.mp4`: the route as meant, a hop near the edge.
- Recorder: `tools/art/petals/rec-12.mjs`.

## Polish check (judged at phone size, upright and sideways)

- **Is it obvious where to go?** Sideways, yes: the stairs carry a petal on each step up to the branches (`sideways-1-stairs.jpg`),
  the high run's petals sit one or two to a branch (`sideways-2-branch-run.jpg`), and the split trail's petals step down off the high
  road to the floor and across the dips (`sideways-4-split-low.jpg`). Upright shows less of the route at once (the camera's narrow view;
  `upright-1-stairs.jpg` shows only the first step and its petal), which is the game's upright camera, not this change.
- **Do the petals read as a trail?** Yes on the branch runs and the low stretch. The teaching gaps' arcs are unchanged.
- **The catch mushrooms:** they read at once as "bounce back up" (`*-3-missed-floor.jpg`, the clip). But under a high run there are now
  3-4 glowing mushrooms in a row on the floor (`sideways-2-branch-run.jpg`), busier than before. They are World 1's own painted
  mushroom with its existing glow; no new art. Named, not hidden: if Matt finds the row busy, the next step is fewer, bigger catches.
- **The sealed door:** the shrine's own sign says "28 more" and the counter "70/98" (`*-5-sealed-door.jpg`); in play Dot says "It's
  sealed. Collect N more petals first." (first-timer log) and, earlier, "Still 40 petals to collect!".
- **Capture artifact, not the game:** Dot's opening story line ("She said don't stop to smell the flowers...") shows in several stills
  and the clip because the recorder pauses and steps the engine by hand. She says it once at the stage start.
- **The clip** (`*-miss-caught.mp4`): walking off branch after branch, each mushroom springs him back up level with the branches; no
  jitter or popping seen frame by frame (quarter speed).

## Method update (for reference/methods/stage-fix.md on w8-rope2)

- **Worked better, with proof:** classify every leftover pickup before blaming the stage or the bot (`tools/inspect/petalLeft.ts`:
  floor / bough / air x passed over / under / near / never). It split 1-2's leftovers into "never went up" (bot) and "fell off with no way
  back" (stage) in one run. Hash every stage's build before and after (`tools/inspect/stageHash.mts`, 8 min, 3,264 builds): proved 1-2
  was the only stage touched.
- **Failed, and why:** "bough petals flown over" (a float raise) was measured with a bot whose stuck rule fired every 0.3 s
  (firsttimer.ts:1259), so its hops were not a person's. A float lift written and measured against it looked like a fix; with the bot
  fixed the problem was gone (0-2 a run). Lesson: before changing the stage for a bot behaviour, trace one frame log and check the bot
  does what its own parameters say (edgeAim 22 px, observed 110 px).
- **Pitfall:** a real-engine test that holds right through a mushroom bounce and its second flick overshoots short branches; a thumb
  steers to land. Steer toward the target in the test, or the test fails a fair spot.
- **Pitfall:** removing a piece the quick route walked on (the empty overhead branch) can push rolls over the dead-time limit: run
  era.ts --rolls 200 on the stage after any layout change, not only the bot.
- **Exact edit:** add to Steps after step 2: "2b. Classify what the run leaves (petalLeft.ts) and read one frame log against the bot's own
  parameters before deciding it is the stage." Add to step 6: "`npx tsx tools/inspect/stageHash.mts > out.txt` on base and branch, then
  diff the sorted files."

## Checks (on the final commit, after merging origin/bot-fix 877a819b)

- `npx tsc --noEmit -p .`: clean.
- The full test globs, 3 shards: 735/735, 770/771 (1 todo), 651/652 (1 todo); 0 failures. Plus `src/game/firstTimerBot.test.ts` (from the
  merge) 8/8.
- `npx vite build`: clean, no asset over 4 MiB. `node tools/perf/artcheck.mjs`: PASS.
- `node tools/perf/drawcheck.mjs`: PASS (407 s). A first run beside the 3 test shards failed to load 1-4 ("__play is not a function", a
  page-load timeout under load; 1-4 is untouched); re-run on an idle machine, every scenario passed.
- `era.ts --worlds 1 --stages 1-2 --rolls 200`, the stage inspector seeds 1-3, the first-timer bot seeds 1-3 x 3 trials both settings,
  stageHash on every stage: above.
