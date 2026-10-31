# World 2 grab bag: The River (2026-10-31, w1-4-sheets helper, for the lead's review before any art job)

The gen2 rebuild (`origin/plan-gen2-w1-4:reference/GEN2-W1-4-PLAN.md` §4) follows STAGE-RULES §1c. Every piece and its art is made
up front, and curation runs once. Matt's calls:
- **climbs B**: 2-6 becomes a generated climb;
- the next roll is at least half different;
- variety comes from more pieces.

Beat letters are as in `tools/inspect/beats.ts` (W 0.2, h 0.5, J 1, V 2, C 2.2, Z 2, P 2.8). In World 2 any hop over water with no floor
reads J (`route.ts:244`), so the pond, stone and channel hops all read alike. Their only Z is "river". The look-alike risk today is J+Z
everywhere, so the new pieces add V, Z and P beats that are NOT a river crossing (current, rising water, bobbing, bask).

## 1. Section types (22; 8 timing beats)

| # | Section | Beats | Plays like | Art (existing / NEW) | First taught | Dot line (proposed, Matt approves) |
|---|---|---|---|---|---|---|
| 1 | Drifting log crossing (timing) | J Z | Hop onto logs drifting across the river, with or against the current | existing `logShort`/`logLong`, `water` | 2-1 (`w2S:341`) | (existing) |
| 2 | Stepping stones | J Z | Painted river stones over deep water, heights mixed | NEW river-stone set ×3 (now generic moss_stone) | 2-1 | (existing) |
| 3 | Lily pond | J Z | Still pond, a lily pad chain | existing `lily`, `lilyCarpet` | 2-2 (`w2S:579`) | (existing) |
| 4 | **Sinking lily pads** (timing) | J Z | Big pads sink 1.2 s after Pokey lands and come back up; keep moving. A sunk pad drops him in shallow water (a splash, a step back), never deep. | existing `lily`; NEW pad sinking frames (half-under, under-ripple) | 2-2, after the plain pads | "Big pads sink. Keep hopping." |
| 5 | Reed channels | J Z | Reed islands, each with its own little stream | NEW reed-island tops ×2 (now moss_stone) | 2-1 | - |
| 6 | Sandbar | J Z h | Two rivers either side of a sandbar, with a rest in the middle | NEW sandbar bank piece | 2-1 | - |
| 7 | Mooring post climb | V | Climb a roped post, drop off its shelf onto the next bank | existing `pole` (now decor only); NEW climbable mooring post with rope wraps and a shelf | 2-1 (upstream, `w2S:381`) | (existing) |
| 8 | Swing over water | V Z | A liana swing (or 2-7's swing frames) over open water | existing `liana`, `swingFrame` | 2-4 (`w2S:764`) | (existing) |
| 9 | **Pushing current** (timing) | Z J | A fast stretch pushes Pokey downstream while he wades the shallows; stones break it up. Pulses on a rhythm (foam surge first, 1 s warning). | NEW current foam streak (3 frames, loops) and shallows strip | 2-4 (gentle; the strongest pulse only from 2-8) | "The water pushes. Wait for the calm." |
| 10 | Snake bank | C | Snakes on the reed bank | existing snake atlases | (1-3) | (existing) |
| 11 | Snapper bank | C | Snappers in rows of 2-4; stomp, or kick a shell to bowl a row | existing turtle atlas and anim | 2-5 (`w2S:873`) | (existing) |
| 12 | **Basking caiman** (timing) | C Z | A caiman sunbathes across the path. Its eyes open on a rhythm; cross its back while they're shut, or wait. It lunges only when awake. | existing `caiman-atlas` (bask, stalk, lunge; never placed in W2) | 2-5 (after the snappers) | "Cross while his eyes are shut." |
| 13 | **Frog hops** (timing) | C J | Frogs hop between lily pads on a rhythm; land between their hops | existing `frog-atlas` (idle, hop, tongue; never placed in W2) | 2-3 | "Frogs bump. Land between their hops." |
| 14 | Porch run | J h | Village porches and stairs along the bank | existing `porch`, `steps`, `door`, `window`, `jetty` | 2-6 / 2-7 | - |
| 15 | **Basket lift** (timing) | V | The village basket lift runs on a rhythm | existing `lift`, puzzle-kit `basket2` | 2-7 (`dotTips:38`) | (existing) |
| 16 | **Rising water** (timing) | Z J V | The river rises in 3 steps; climb the posts and porches ahead of it | existing flood, `w2-props` posts; NEW painted waterline foam strip | 2-8 (`w2S:1017`) | (existing) |
| 17 | **Bobbing barrels** (timing) | J | Floating barrels and crates bob on the swell; hop when they're up | NEW barrel and crate (bob up, bob down) | 2-7 (they're the mailman's cargo) | "Hop when the barrel bobs up." |
| 18 | Spear guard pass | C | Royal guards march; jab tell, then the gap | existing `guard-atlas`/`guard-anim` | 2-9 (`dotTips:39`) | (existing) |
| 19 | Cage lift room | P | Stone into the basket lifts the cage | existing puzzle-kit cages, pulley; existing `cageB/C`; `cageA` redrawn (NEW: whole, cracked) | 2-3 | (existing) |
| 20 | Ferry room | P J Z | Lever opens the sluice; the raft crosses | existing raft, sluice, lever | 2-2 | (existing) |
| 21 | **Net puzzle** (new room) | P | Fishermen's net blocks the creek; pull the rope to lift it and let the drifting logs through, then ride one | existing puzzle-kit `net`/`netFull` (needs the green repaint: NEW) | 2-7 | "Pull the net up. Let the logs through." |
| 22 | Bell gate and gallery | P C | Ring the bell to open the court gate (Dot explains); pebbles in the gallery | existing bell set; NEW painted reed gate (shut, open; now code `drawReedWall`) | 2-9 | (existing gate tip) |

Climbs B for 2-6, *Up the Bank Houses*, the generated ascent: 7, 14, 15 and 17 plus **ladder** (existing `ladder`), **rooftop hops**
(existing `rooftop`, `doorRoof`, `chimney`) and **laundry line shimmy** (existing `laundry` as a rope run: V).

**Timing beats (8):** drifting logs, sinking pads, current, basking caiman, frog hops, basket lift, rising water, bobbing barrels.

## 2. Themes per stage (5+ each)

| Stage | Lesson (Ki, required) | Themes |
|---|---|---|
| 2-1 Down to the River | drifting logs, deep water, upstream | **deep river** (1, 6); **creek** (5, 3); **stones** (2, 7); **reeds** (5, 10); **sandbars** (6, 1) |
| 2-2 Petals for the Crown | lily pads; the ferry room (required) | **ponds** (3, 4); **high logs** (1, 7); **stones** (2, 3); **snake banks** (10, 5); **sinking pads** (4, 1) |
| 2-3 Stuck in the Reeds | cages (rooms required) | **posts** (7, 19); **ponds** (3, 13); **frogs** (13, 4); **vines** (8, 5); **reeds** (5, 10) |
| 2-4 Over the Water | vine swing over water | **chains** (8); **islands** (8, 1); **current** (9, 2); **reeds** (5, 8); **frog pads** (13, 8) |
| 2-5 River Snappers | snappers, shell kick | **banks** (11); **sandbars** (6, 11); **caiman** (12, 11); **ponds** (3, 11); **current fights** (9, 11) |
| 2-6 Up the Bank Houses (gen2 ascent) | post climb | **posts** (7, ladder); **porches** (14, rooftops); **lift** (15, 7); **laundry** (laundry line, 14); **barrels** (17, ladder) |
| 2-7 The Mailman's Route | basket lift (required) | **porches** (14, 15); **swing frames** (8, 14); **barrels** (17, 1); **net** (21, 1); **logs** (1, 14) |
| 2-8 Before the Water Rises | rising water; cage islands (rooms required) | **islands** (16, 5); **channels** (16, 9); **posts** (16, 7); **barrels** (16, 17); **caiman reeds** (16, 12) |
| 2-9 The River King's Court | spear guards; bell gate (required, Dot explains) | **lilies** (18, 3); **porches** (18, 14); **sandbars** (18, 6); **caiman moat** (12, 18); **sinking court** (4, 18) |

## 3. NEW art for World 2 (one HF batch, with `w2-style-sheet.png`: upper-left light, weathered grey-brown wood, teal water)

| # | Piece | Frames | Size | For |
|---|---|---|---|---|
| 1 | River stones: three flat-topped wet stones, moss on top | 3 | ~300 x 160 | #2 |
| 2 | Reed islands: a tuft of reeds on a muddy island top, standable | 2 | ~420 x 200 | #5 |
| 3 | Sandbar: a pale sand bank with pebbles, both ends tapered | 1 | 640 x 160 | #6 |
| 4 | Mooring post: a tall roped post with a plank shelf, climbable | 1 | 220 x 640 | #7, 2-6 |
| 5 | Lily pad sinking: half-under, ripple only | 2 | 300 x 120 | #4 |
| 6 | Current foam streak, loops left to right | 3 | 512 x 96 | #9 |
| 7 | Rising waterline foam strip, tiling | 1 tile | 512 x 64 | #16 |
| 8 | Barrel and crate floating, with a waterline | 2 + 2 | 220 x 200 | #17 |
| 9 | Reed gate: lashed reed wall in a frame | shut, open | 320 x 460 | #22 (now code) |
| 10 | Fishing net, repainted on GREEN (it's pinkish; magenta ate it) | empty, full | as `net` | #21 |
| 11 | cageA redraw: the whole round reed cage | whole, cracked | as `cageB` | #19 (ART-TO-GET.md:12) |
| 12 | W2 pit water strip (teal-brown) | 1 | 1024 x 516 | the stage pits |

From what exists without HF: `river-king-peek.webp` (packed, never drawn) is drawn at 2-2's end (ART-TO-GET.md:13), and
`caiman-atlas` and `frog-atlas` get placed in W2.

**Cost:** one job, about 4 canvases (2 strengths x 2 seeds) and the net on its own green canvas. Roughly 18-20 min: **~$0.9, cap $2.5**.

## 4. Gaps left

- Current, sinking pads, barrels and the caiman's bask are new gen2 engine pieces (the plan's "river pieces in the pipeline"). They
  belong to the W2 builder; the art comes first.
- Every W2 Z is still water-shaped. That's the world, and the caiman, the frogs and the net add C and P beats so the rolls part.
