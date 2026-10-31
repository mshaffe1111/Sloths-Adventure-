# World 10 pieces: where it stands and what is next (branch w10-pieces)

Written by the W10 pieces helper, 2026-10-31. STAGE-RULES §1c order: merge up (done), grab bag (approved), build every piece (most done,
below), then curate once (not started: no World 10 seeds yet, so every test that builds 10-x through the game fails "ships no curated
rolls" until curation; that is expected).

## Done (each checked alone: `npx tsx tools/gen2/pieceCheck.ts --stage 10-N --sections <ids> --rolls 8`)

See GRAB-BAG.md §8 for the table. In short: D drop gates, E gutter spouts, F trapdoor grates, G/H towers, I perch posts, J chain
bridges, K rolling barrels, L lantern sweeps, the Winch House (10-7's second room, `required.oneOf`), 10-6's gates; one HF batch
($0.17, src/assets/w10/bag.webp). Stills: qa-notes/w10/pieces/.

## Not done

1. **A chain lifts, B counterweight planks, C gear lifts** (Matt's moving platforms): wait on World 9's riser (origin/w9-pieces b598ce85
   'raft' place on the engine's lift, pistons; refined in 0e911330, cbb40516). Asked the lead whether to merge w9-pieces or wait for ccr.
   Once in: A = the 'raft' place with the plank-ring look (gemini w9w10-bridges + the hanging-iron chain + bag 'pulley'), taught 10-1
   over a soft pit; B = two rafts a half cycle apart with bag 'pulley' + 'weight'; C = a piston column with bag 'rack' + 'cog'
   (10-9 taught; 10-6 if C proves out there). Then 10-6 reaches 5 themes (chains, spouts, lifts, counterweights, gear lifts).
2. **The first-timer bot and World 10's timed hazards**: it runs through drop gates, barrels, gushes and grates without waiting (World
   9's helper taught it to wait for World 9's flares and lavafalls, "World 9 only"). Extend that to World 10's 'bolt' looks
   (portcullis, gush, barrel) and trap platforms after the W9 merge, before curation, or the bands will read 10-7/10-9 as harder than
   they are.
3. **Curate once** (neighbour order 10-1, 10-3, 10-6, 10-7, 10-9; W10-NEXT.md's command with --apart-near --apart-cap 0.2; the full
   CLAUDE.md suite green after each stage's seeds).
4. Lines for Matt (the lead has them): drop gate, trapdoors, spouts, barrels, lantern, the Winch House's three and its two hints.

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
