# HF props for Worlds 1-7: phase 1 audit (2026-10-31, hf-props helper)

Why we're doing this: Matt, Oct 31, 5:15 PM ET: "more props... I don't want money left and wasted". And Oct 30: variety comes from more
pieces, never from rerolling. HF cap for this job: **$14**. Spent in phase 1: **$0**.

## How it was shot

- `tools/art/hfprops/shoot.mjs`: the real game (vite dev, `__play`). Pokey is set down at 25%, 50% and 75% of the run.
- Phone size: upright 390x844 and sideways 844x390, at 2x.
- 13 stages: 1-3 (an earlier test run) and 1-6, 2-2, 2-5, 3-2, 3-5, 4-2, 4-5, 5-4, 5-6, 6-2, 6-5, 7-2, 7-5.
- Contact sheets:
  - `before/w<N>-sideways.jpg`: each world, its two stages x 3 points.
  - `before/all-upright.jpg`: every stage at 50% and 75%.

## What the stills show

The far, mid and near backdrops carry every world. The ground at Pokey's feet, which is what a player looks at, is mostly bare.
What dressing there is comes from **one set of 3 pieces per job per stage**:
- `artDress.ts` `DRESS_SETS`: 2 looks per job;
- W3's `W3_DECOR_SETS`: 6 floor pieces in all;
- W6 and W7's `W6_DECOR` / `W7_DECOR`: 3 pieces per set.

So within a stage, the same 2-3 pieces come round bank after bank.

| World | Repeats within a screen or stage | Kinds of piece it lacks |
|---|---|---|
| 1 Rainforest | Fern, mushroom, pebble along every lip; long floors bare between them (1-6 25%, 1-3 75%). Dirt walls plain. | Mid-size bank-end pieces (only small clutter); background creatures sitting in the scene; story signs (Pokey's home forest: claw marks, a dropped basket, a trail marker). |
| 2 River | 2-2: five soil pillars in a row, each crowned with the **same reed clump** (2-2 50%/75%: the worst repeat in W1-4). The 2-5 banks are bare apart from reeds. | River life on the banks (heron, crab, dragonfly reeds); human-free river story (a fishing basket trap, a rope coil, driftwood). The w1-4 sheet's mooring post, barrels and crates are packed but not drawn (art-use allow-list). |
| 3 Grotto | The floor is stalagmites and mushrooms over and over (`W3_DECOR_SETS`: stalagmites x2 in two sets). The floor is bare stone between them. | Light sources on the floor (§4: light from sources: crystal clusters, a glowworm lantern stone); hanging root tangles; the cave's story (fossils in the rock, an old nest). |
| 4 Cliffs | Cliff tops are almost empty: a chime and a bush (4-2), ferns at the ends (4-5). No ground clutter at all. | Ground clutter (cairns, slate chips, mountain flowers); wind-bent shrubs at bank ends; hanging ivy curtains on the cliff faces; the eagle's story (feathers, a nest with eggs, prey bones are too dark: skip). |
| 5 Orchid garden | Bare floors between the bank sets. The silk and webs repeat. (The backdrop orchids are rich, so this is the least urgent.) | Tea-party story pieces on the floor (cups, a watering can, a spool of silk); hanging cocoons and paper lanterns. **The W5 finish helper owns w5-pieces: W5 is last in line.** |
| 6 Mangrove | The **same two bushes** (a tall cone and a wide bush) on every bank, three times in one 6-2 screen. The decor (knee roots, reeds) barely reads against the dark soil. | Bank-end pieces that read on the dark (pale oysters on roots, a heron, a fiddler crab); mid clutter (mangrove pods, shells, a half-sunk canoe); hanging pieces that show (orchid sprays, a dripping vine). |
| 7 Ruins | The **sloth sentry statue** in the same spot in two 7-5 screens; fern and moss-block repeats; 7-2's floating ledges have nothing on them. | Small relic clutter (pottery shards, an offering bowl, a carved tablet, scattered tiles); a lizard or macaw on a column; hanging censer chains or vine bells; bank-end pillar stubs. |

## The plan for the $14 (one HF batch per world, cut and packed, every piece wired)

**Wiring (one path for all seven worlds, no new draw path per world):**
- `artDress.ts` `dressSets` already dresses Worlds 1, 2, 5 and 8-10: bank sets, hanging pieces and floor clutter.
- It is pictures only (no platform, pickup or rule changes) and has its own hash, so no stage roll moves.
- The plan:
  - add Worlds 3, 4, 6 and 7 to `DRESS_WORLDS`;
  - give every world **2 new looks per job** (bank, hang, clutter), so each job has 4 looks instead of 2;
  - pack the new pieces into **one small new atlas**, `props/dress2.webp`, so a stage draws from 2 sheets at most (PERFORMANCE §1);
  - `drawDress` picks the sheet by frame.
- The W1-4 sheets art that is pure scenery also goes into the W2-4 dressing, at no HF cost (art-use gate shrinks):
  - W2: mooring post, barrels, crates;
  - W3: shards;
  - W4: mist.
- Dressing only: no platforms, routes, hazards or generator placement rules touched.

**Art: about 8 new pieces per world, ~56 in all:**
- Each world's style sheet: its kit, 2 approved anchors, shared light, a flat key.
- Made with `tools/art/w1to4` `starts.py` / `cut.py` and the same Qwen-Image job as the w1-4 pass.
- Pale pieces and water are painted on black; the rest on magenta.

| World | Bank-end (2 sets x 3) | Hanging (2) | Ground clutter (2 sets x 3) | Background creature / story |
|---|---|---|---|---|
| 1 | bromeliad clump, mossy boulder, termite mound | orchid spray, bird's nest on a root | leaf litter, seed pods, snail on a twig | toucan on a stump; carved trail marker |
| 2 | heron, driftwood pile, cattails with dragonfly | dripping river moss, a fishing basket on a rope | river crab, rope coil, shells | half-sunk canoe |
| 3 | crystal cluster (lit), root-wrapped boulder, glowworm lantern stone | glowing root tangle, dripping crystals | fossil shell stone, pebbles, small glowing mushrooms | an old nest in a niche |
| 4 | stone cairn, wind-bent shrub, eagle feather in a crack | cliff ivy curtain, mossy drip | slate chips, mountain flowers, moss stones | nest with eggs |
| 5 | watering can, stacked plant pots, silk spool | silk cocoons, paper lantern string | teacups, sugar cubes & spoon, fallen orchid petals | tiny garden bench |
| 6 | oyster-crusted root, fiddler crab, pitcher plants | orchid spray, dripping vine | mangrove pods, shells, broken net float | half-sunk canoe (W6 style) |
| 7 | pillar stub, offering bowl with fruit, macaw on a column | censer chains, vine with stone bells | pottery shards, carved tablet, fallen tiles | lizard on a block |

**Cost estimate (RTX Pro 6000 at ~$2.75/h; the w1-4 batches ran $0.2-0.3 each):**

| Step | Estimate |
|---|---|
| 7 world batches (2 strengths x 2 seeds each) | ~$2.0 |
| Fix round for misses (as w1-4 r2) | ~$1.0-1.5 |
| Second canvases, if a world needs more distinct pieces to clear the bar | ~$1.5 |
| **Planned** | **~$5** (up to $7 with a third round) |

That leaves ~$7 of the $14 unspent unless the lead wants more. Two things it could pay for:
- a third look per job;
- W6/W7 landmark pieces at 2x size.

**Order:** W6, then W7, W2, W1, W3, W4, W5. The worst repeats go first; W5 goes last because the W5 finish helper owns its files. For
W5, the plan is: make the art, and hand the `DRESS_SETS[5]` entry to that helper as a patch if it is still running.

**Risks named:**
- Adding W3/W4/W6/W7 to `DRESS_WORLDS` changes what's drawn (not the rolls). The gen2 seeds tests and drawcheck must stay green. If a
  W6/W7 test pins decor, the new sets go into `W6_DECOR`/`W7_DECOR` instead.
- The W1-4 gen2 rebuild comes later. This dressing lives in `artDress.ts`, which gen2 W1-4 can keep using.
