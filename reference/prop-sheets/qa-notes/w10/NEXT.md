# World 10 pieces: where it stands and what is next (branch w10-pieces)

Written by the W10 pieces helper, 2026-10-31. STAGE-RULES §1c order: merge up (done), grab bag (approved), build every piece (most done,
below), then curate once (not started: no World 10 seeds yet, so every test that builds 10-x through the game fails "ships no curated
rolls" until curation; that is expected).

## PAUSED 2026-10-31 ~5:50 PM ET (the lead: World 10 is not in tonight's release; resume from here)

### Done today (branch w10-pieces)
- A chain lifts, B counterweights, C gear lifts on World 9's riser (one physics path; World 10's look only in w10 files). Lifts 6/6 on
  10-1 (kid 0.91+). Counterweights on 10-3: cw-first 5/6, cw-storm 3/6; cw-row is now 10-6 only (on 10-3 its Easy way was a quiet walk on
  the pit floor). Gear lifts faster than World 9's pistons (W10_GEAR_SPEED), fixed 210 px rise, short ledges (kid 0.95+).
- K barrel true roll (HF r2), unused art placed (GRAB-BAG §9), brazier glow cached, Winch House, D-L as before.
- **w9-pieces re-merged** (the lead: merge, not the patch); conflicts in engine/zones/firsttimer resolved keeping 9-5's vent.
- **The lead's ruling on Easy pit floors:** World 9's knobs stay; under World 10's chain lifts and counterweights they are drawn as World
  10 pieces (style 'w10_rubble', w10Game decorate on the knobs: w10var rubble, or the gear sheet's half-sunk cog, fallen gear, chain
  heap). **The beats.ts pit-floor credit is dropped**: the moving-plank beat counts only standing on or waiting at a plank.
- **10-9 gear theme, more beats (in progress):** the gear grinder (look 'grinder', GRIND: a low column in the walk, wait or hop) and the
  rolling spiked cog (look 'cog', the barrel lane's mechanics); sections w10-gear-grind-first, -grind, -cog-first, -cog-run (10-9),
  lessons grinder/cogroll, Dot's lines "The gears bite. Wait till they stop." / "A cog's broken loose! Jump it!". w10GearArt.ts.
- HF: r1 $0.17, r2 ~$0.15, r3 ~$0.25, r3b ~$0.25 (r3b was launched 5:14 PM, before I read the pause; it finishes on its own). About
  $0.82 of the $12 cap.

### Left, in order
1. **Gear art recut:** r3's takes are too flat (close to the sketch). r3b's (strength 0.72/0.82) are in the bucket
   hfbatch/w10bag3b/props (carrier-w10bag3b-0.png: hf_fs attach, then tools/art/w5/unpack_carrier.py). Pick the best per cell and recut:
   `python3 -I tools/art/w10/gearcut.py <takes> '{"*":"3b-s72-23", ...}'`. The current gear.webp is the provisional r3 cut.
2. **The four new gear sections:** last check (stopped part-way): grind-first 2/6 (kid 0.98; Easy/Normal quiet over 4 s), grind "fits no
   node" in 4 of 6 (it needs the GRINDER lesson: pieceCheck forces only the theme's gate, so run it with grind-first forced too, or let
   pieceCheck add lesson sections as w10Game devForced now does). cog-first, cog-run not yet run. Then stills (grinder: cogs now 0.6 of
   the trough, hubs over the rim; cog roll: 58 px with sparks), upright and sideways.
3. The gate on the final state (tsc, full suite, vite build, artcheck, drawcheck). Last full run: w10 tests 33/33 and W9+W10 57/59 (the
   two: World 9's "ships 16 rolls", expected; 10-3's quiet walk, fixed since). The full CLAUDE.md suite was not re-run after the re-merge.
4. Curate once (not started, by the brief).

### Shared-file hunks since a0897f1e (for the lead's review)
engine.ts (bob draw hook for w10_*; grinder/cog in the column-hit branches; vent kept in the zone-hint skip), zones.ts (look adds 'vent',
'grinder', 'cog'; cog in the lane branch), gen2/types.ts (GRIND; bolt looks), gen2/pipeline.ts (lane = barrel|cog; grinder uses GRIND),
types.ts (styles w10_lift, w10_cw, w10_gear, w10_rubble), tools/inspect/beats.ts (moving-plank beat, plank only; grinder/cog names),
route.ts (a bob piston's ride at its own speed), firsttimer.ts (waits at drop gates, gushes, grinders, trapdoor grates).

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
