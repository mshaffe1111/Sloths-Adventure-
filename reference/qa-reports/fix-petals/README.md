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
which has a guard goal). Bug 2 was dropped on the lead's call: no float change without real evidence.

## The fix (`src/game/protoStage.ts`, 1-2 only)

- `catchUp`: a mushroom on the floor at each high branch's near end (the stair top and every gap of trailUp, splitTrail's high runs,
  highLeaps' gaps). A miss is one bounce back up. `proto.catchUps` lists them.
- splitTrail: no branch over the low stretch; the two petals that lead down sit 50 px over the floor.
- trailUp: the steps stand down into the ground, the bank broken around them (as lowStumps' do).
- No petal behind the spawn.

## Numbers: first-timer bot, 1-2, goal got / needed

The fixed bot is the one-line fix applied in a local copy only (`_firsttimerFixed.ts`, not committed), as the lead asked.

| | main, current bot | branch, current bot | branch, fixed bot |
|---|---|---|---|
| Normal s1 | 70/95, 77/95 | 92, 92, 93 /98 | 99, 102, 104 /98 |
| Normal s2 | 71/99, 76/99 | 90, 86, 81 /98 | 103, 106, 101 /98 |
| Normal s3 | 70/92, 74/92 | 88, 90, 94 /95 | 102, 98, 101 /95 |
| Easy s1 | 73/72, 72/72 | 93, 100, 90 /72 | 93, 96, 95 /72 |
| Easy s2 | 79/72, 74/72 | 86, 85, 80 /72 | 102, 101, 103 /72 |
| Easy s3 | 69/72, 67/72 (sealed) | 90, 90, 88 /72 | 92, 95, 94 /72 |

Fixed bot: the door opens on all 18 runs (seeds 1-3 x 3 trials x 2 settings). Normal's margin is thin on one run (+1, seed 1 trial 0).
The current, buggy bot still seals Normal on every run: its early hops miss the teaching gaps' arcs and fly over branch petals.

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
