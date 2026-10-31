# World 10 pieces: where it stands and what is next (branch w10-pieces)

Written by the W10 pieces helper, 2026-10-31. STAGE-RULES §1c order: merge up (done), grab bag (approved), build every piece (most done,
below), then curate once (not started: no World 10 seeds yet, so every test that builds 10-x through the game fails "ships no curated
rolls" until curation; that is expected).

## Done (each checked alone: `npx tsx tools/gen2/pieceCheck.ts --stage 10-N --sections <ids> --rolls 6`)

See GRAB-BAG.md §8 for the table, §9 for the art placed from unused, §10 for the lead's curation notes. In short: A chain lifts, B
counterweight planks, C gear lifts (World 9's riser merged in from origin/w9-pieces; World 10's look in w10 files only: w10PieceArt
drawW10Bob), D drop gates, E gutter spouts (on a wall stub now), F trapdoor grates, G/H towers (stair stub fixed), I perch posts, J chain
bridges, K rolling barrels (a true roll: the HF barrel end turning), L lantern sweeps, the Winch House (10-7's second room,
`required.oneOf`), 10-6's gates (now 5 themes). Two HF batches: $0.17 + about $0.15. Stills: qa-notes/w10/pieces/ and pieces/riser/.

## Not done

1. **Curate once** (neighbour order 10-1, 10-3, 10-6, 10-7, 10-9; W10-NEXT.md's command with --apart-near --apart-cap 0.2; the full
   CLAUDE.md suite green after each stage's seeds). Not started, by the brief.
2. **10-9 needs more gear-theme pieces** (the lead, 5:02 PM: "don't force it"): with gear lifts filling 10-9, 1-2 rolls of 6 pass (each is
   wait, ride, step off, again). World 10's gear lifts already run faster than World 9's pistons (w10Game W10_GEAR_SPEED) with a fixed
   210 px rise; the fix is more pieces with other beats around the theme (GRAB-BAG §10), built before curation.
3. **For the World 9 helper (one line, the lead's ask):** tools/inspect/route.ts now times a bob piston's ride at its own lift.speed (World
   9's Easy pistons, 95 px/s, measure slower than the old fixed 120), and firsttimer.ts waits at World 10's drop gates, gushes and grates
   (World 9's flares, lavafalls and surges unchanged; never 9-5's vent).
3b. **First-timer bot**: it now waits for drop gates, gutter gushes and trapdoor grates (tools/inspect/firsttimer.ts, shared). Rolling
   barrels are left out on purpose (the lane is longer than one quiet window: he would stand forever); he jumps them or takes the hit.
4. **Unused art with a place but not yet placed** (GRAB-BAG §9): w10var fill-b, buttress-b; bridges plank-hanging (stump-b is placed: rubble on the walks and the lift pits' floor). (bag winch-jam is a duplicate of 'winch': GRAB-BAG §9.)

## Checks on the final state

- tsc clean; w10.test, w10Rooms.test (19/19) green; vite build OK (nothing over 4 MiB); artcheck PASS; drawcheck PASS (399 s).
- The full suite: the only reds are the "10-x ships no curated rolls" family (expected until curation) and platformPlan's
  "8-2: shelf is 97%" (red on the ccr base too: World 8).

## Tools added

- `tools/gen2/pieceCheck.ts`: one section (and its theme's gate) forced into a stage's rolls, measured as curation does; quiet stretches
  named by section.
- `tools/art/w10/pieceShots.mjs <out> '10-7:w10-drop-row,...' [port]`: stills of one piece in the real game (dev build; needs a scratch
  roll per W10 stage in seeds.ts, never committed; `window.__w10force` / node `W10_FORCE`, w10Game.ts devForced).
- `tools/art/w10/bagstarts.py`, `make_bag_spec.py`, `bagcut.py`: the grab bag's one HF batch (jobs.txt).
