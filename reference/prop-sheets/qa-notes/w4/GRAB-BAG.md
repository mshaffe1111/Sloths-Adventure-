# World 4 grab bag: The Falls (2026-10-31, w1-4-sheets helper, for the lead's review before any art job)

The gen2 rebuild (`origin/plan-gen2-w1-4:reference/GEN2-W1-4-PLAN.md` §4) follows STAGE-RULES §1c. **Climbs B**: 4-1, *The Broken
Ledge*, and 4-6, *Above the Mist*, become generated ascents. 4-3 and 4-7 stay set pieces, but their pieces come from this bag too.

Beat letters are as in `tools/inspect/beats.ts`. Today World 4's Z is all wind, rocks, surges, eaglets and watchers. It has no moving
platform, no crumble and no fight on 4-2, 4-3, 4-4 or 4-7, and puzzle rooms only on 4-1, 4-6 and 4-8. **25 painted w4-props pieces
are packed and never drawn**: this bag uses all of them.

## 0. Unused art placed first

Lead review 2026-10-31 ~1:45 PM ET: **approved**. Matt (1:40 PM ET): "We need to use all the art we create. Its a waste otherwise. I want a fun unique game." So this world's unused art (from `tools/art/artuse.mjs`, `reference/prop-sheets/qa-notes/art-use/UNUSED.md`) is placed FIRST, below, before any new art.

All 24 undrawn `w4-props` pieces, plus the kit's two, have a section (the art column below names each one):

| Unused piece(s) | Where |
|---|---|
| `ledgeA`, `ledgeB`, `grassCliff`, `fallLedge` | #1 cliff ledges |
| `floatLedge`, `ledgeTrickle` | #5/#23 glide landings |
| `wetSteps`, `wetSteps2` | #8 wet steps |
| `boulderBig`, `boulderSmall` | #10 plug the fall; #2 the rock that lands |
| `logJam`, `brokenLog` | #11 pool log; #13 swinging log bridge (the anchor end) |
| `capNest` | #12 the thief's nest (where the fruit goes) |
| `coverHollow`, `coverRustle` | #16 cover row (a hollow, and the rustle as the watcher passes) |
| `fruitBare`, `fruitCliff` | #18 lookouts (a picked tree; a tree on a cliff) |
| `nestPillar`, `nestTorn` | #20 eaglet nests |
| `caveFall`, `cave2` | #24 cave drop |
| `fallCliff`, `fallSmall` | #9 fall surge (the small fall is Easy's surge) |
| `ribbonFlag`, `ribbonLog` | the keepsake spots in 4-3 and 4-9 |
| kit `buttress`, `bankEnd` | 4-1 and 4-6 ascents: the wall foot and ledge ends |

## 1. Section types (26; 9 timing beats)

| # | Section | Beats | Plays like | Art (existing / NEW) | First taught | Dot line (proposed, Matt approves) |
|---|---|---|---|---|---|---|
| 1 | Cliff ledges | J h | Ledges up and across the cliff face | existing `ledgeA`, `ledgeB`, `grassCliff`, `fallLedge` (all undrawn till now) | 4-1 | - |
| 2 | **Falling rocks** (timing) | Z | Grit first (1.4 s), then a rock | existing grit and rocks | 4-1 (`:6165`) | (existing) |
| 3 | Patience frond | P | Wait on the frond for it to uncurl into a bridge | existing frond set | 4-1 | (existing) |
| 4 | Knot pulley | P V | Dot's knot lifts Pokey | existing puzzle-kit winch, ropeLift; NEW painted knot (now code) | 4-1 | (existing) |
| 5 | Leaf drop / glide gap | V J | Ride a leaf, then glide | existing leaf | 4-2 (`:4068`) | (existing) |
| 6 | **Gust gap** (timing) | J Z | Chimes ring, then the gust; glide in the lull | existing `chimesStill/Swing` | 4-2 (`:4092`) | (existing) |
| 7 | **Updraft lane** (timing) | V Z | A vertical gust lifts a glide up a chute in pulses; ride up between rock spurs | NEW painted updraft column (3 frames; now code `w4Play.ts:1177`) | 4-2 (after the glide) | "Glide into the wind. It lifts you." |
| 8 | Wet steps | h J | Slick stone stairs beside a fall | existing `wetSteps`, `wetSteps2` (undrawn) | 4-3 | - |
| 9 | **Fall surge** (timing) | Z | A waterfall surges on a rhythm; pass between | existing `w4/falls.webp` set | 4-3 (`:304`) | (existing) |
| 10 | Plug the fall | P | A boulder plugs a fall, the pool drains | existing `boulderBig` (undrawn), `poolEmpty/Full`, `channelFall` | 4-3 (`:262`) | (existing) |
| 11 | Pool log | P J | Float the log in the filled pool | existing `poolLog` art (drawn with the W1 log today: use the W4 one), `logJam` | 4-3 | (existing) |
| 12 | Capuchin thief | P | A capuchin grabs the fruit; trade it back | existing capuchin poses | 4-3 | (existing) |
| 13 | **Swinging log bridge** (timing) | J | A log slung on ropes swings across a gorge in a slow arc; hop on at the near end | existing `brokenLog`, `logJam`; NEW slung-log bridge (rope ends) | 4-3 / 4-4 | "Hop on when the log swings close." |
| 14 | Wind chain | V Z | Lianas in a crosswind | existing kit `liana` | 4-4 (`:4647`) | (existing) |
| 15 | Dot's knot | P V | Dot ties a knot as a handhold | NEW painted knot (shared with #4) | 4-4 (`:4711`) | (existing) |
| 16 | Cover row (watcher) | Z | The Sovereign's watch; hide under cover | existing `coverStump/Wide/Fern/MossRock`, plus `coverHollow`, `coverRustle` (undrawn) | 4-5 (`:4363`) | (existing) |
| 17 | Waterfall veil | Z h | Hide behind a falling veil | existing falls; NEW painted veil curtain (now code `:908`) | 4-5 (`:4371`) | (existing) |
| 18 | Capuchin lookouts | Z P | Lookouts screech; distract them with fruit | existing capuchins, `fruitTree1/4`, `fruitCliff`, `fruitBare` (undrawn) | 4-5 | (existing) |
| 19 | **Mist bank** (timing) | Z | Mist rolls in and out; climb in the clear | NEW painted mist bank (3 frames; now code puffs) | 4-6 (`:5698`) | (existing) |
| 20 | Eaglet nests | Z | Eaglets flap out of nests on a rhythm | existing `nestEaglet`, `nestEmpty`, `eagletFly`, `nestPillar`, `nestTorn` (undrawn) | 4-6 (`:5795`) | (existing) |
| 21 | Pinwheel shutter | P | The wind shutter and pinwheel lift | existing puzzle-kit | 4-6 | (existing) |
| 22 | **Cracked ledge** (timing) | Z | A slate ledge cracks 0.8 s after landing; a safe route always stays (never required) | existing `pillarSnap`, `shardA-D`; NEW cracked slate ledge (whole, cracking, gone) | 4-6 | (1-5's crumble tip) |
| 23 | **Warm air** (timing) | V | Warm-air columns carry a glide up | NEW updraft column (#7 shared) | 4-7 (`dotTips:76`) | (existing) |
| 24 | Cave drop | J h | Drop through a cliff cave mouth | existing `cave`, `cave2`, `caveFall` (cave2/caveFall undrawn) | 4-7 | (existing) |
| 25 | Netting and nests | P V | Climb the netting, carry the eaglet home | existing netting (stage-art), nests | 4-8 (`:5004`) | (existing) |
| 26 | **Capuchin guard pass** (timing) | C Z | Guards on ledges; a gust knocks them off on a rhythm | existing capuchin poses; NEW capuchin walk and fall clips (static poses today) | 4-8 (`:5047`) | (existing) |

**Timing beats (9):** falling rocks, gust gaps, updraft lane, fall surge, swinging log bridge, mist bank, cracked ledge, warm air and
capuchin guards (plus the eaglets).

The keepsake ribbon (`ribbonFlag`, `ribbonLog`, undrawn) dresses 4-3's and 4-9's keepsake spots, and `floatLedge`, `ledgeTrickle` and
`overhang` are glide landings in #5/#23.

## 2. Themes per stage (5+ each)

| Stage | Lesson (Ki, required) | Themes |
|---|---|---|
| 4-1 The Broken Ledge (gen2 ascent) | climb back up, falling rocks, frond; the knot pulley room | **ledges** (1, 2); **ropes** (14 calm, 1); **fronds** (3, 1); **wet steps** (8, 2); **cracks** (22, 1) |
| 4-2 First Glide | glide, wind and chimes | **leaf drops** (5); **gusts** (6, 5); **updrafts** (7, 5); **stones** (1, 6); **landings** (5, floatLedge) |
| 4-3 Waterfall Steps (set piece) | plug, pool log, surge | rolled orders of 8, 9, 10, 11, 12, plus **swinging log** (13) and **wet steps** (8) as new parts |
| 4-4 Crosswind | wind on swings, Dot's knot | **wind chains** (14); **knots** (15, 14); **log bridges** (13, 14); **rocks** (2, 14); **updraft swings** (7, 14) |
| 4-5 The Sovereign's Dive | watcher, veil | **cover rows** (16); **veils** (17, 16); **lookouts** (18); **hollows** (coverHollow, 16); **gorges** (16, 13) |
| 4-6 Above the Mist (gen2 ascent) | mist, eaglets; pinwheel room | **mist** (19, 1); **nests** (20, 1); **cracks** (22, 19); **knots** (15, 20); **ropes** (14 calm, 19) |
| 4-7 The Long Drop (set piece) | warm air, cave drop, grit; glide required | rolled orders of 23, 24, 2, plus **updraft lanes** (7) and **cracked ledges** (22) |
| 4-8 Nests on the Cliff | netting, nests; trade room | **plain nests** (25); **guards** (26, 25); **knots** (15, 25); **glide nests** (5, 25); **falls** (9, 25) |
| 4-9 The Aerie (finale) | the reprise spine | **guards** (26); **over the drop** (5, 23); **mist** (19, 26); **plugs** (10, 26); **bridges** (13, 22) |

## 3. NEW art for World 4 (one HF batch, with `w4-style-sheet.png`: upper-left, slightly warm light, slate blue cliffs, cartoon storybook)

| # | Piece | Frames | Size | For |
|---|---|---|---|---|
| 1 | Updraft / warm-air column: rising pale air with leaves and petals caught in it | 3 (loops vertically) | 256 x 768 | #7, #23 (now code) |
| 2 | Mist bank, soft and opaque at the middle, feathered | 3 | 768 x 384 | #19 (now code) |
| 3 | Dot's knot: a vine tied in a fat knot round a peg, and the peg alone | 2 | 200 x 200 | #4, #15 (now code) |
| 4 | Waterfall veil: a thin falling curtain with a hollow behind | 2 (closed, parting) | 320 x 640 | #17 (now code) |
| 5 | Slung-log bridge: a log with rope ends, and the rope anchor | 2 | 640 x 160 | #13 |
| 6 | Cracked slate ledge | whole, cracking, gone | 520 x 150 | #22 |
| 7 | Capuchin walk and fall (edits of the existing poses, on model) | walk ×4, blown off ×2 | 256 x 256 | #26 |
| 8 | Sovereign overhead shadow (a soft painted silhouette) | 1 | 768 x 256 | #16 (now canvas ellipses) |

**Cost:** one job, about 3 canvases (2 strengths x 2 seeds) plus 6 capuchin edits x 2 seeds. ~20-22 min: **~$1.0, cap $3**.

## 4. Gaps left

- The swinging log bridge and the cracked ledge are new gen2 pieces; the updraft lane is World 4's existing wind zone stood on end
  (World 8's grab bag plans the same `SectionZone 'wind'`, so it's shared work for the lead to order).
- The capuchin clips are the riskiest art in the batch: if the edits drift off model, the static poses with the code bob stay, and I'll
  say so.

## 5. Dot lines for Matt (one review, via the lead)

| Section | Line (under 10 words) | When |
|---|---|---|
| #7 Updraft lane | "Glide into the wind. It lifts you." | first updraft, 4-2 |
| #13 Swinging log bridge | "Hop on when the log swings close." | first bridge, 4-3/4-4 |
| #22 Cracked ledge | (1-5's crumble line, already approved) | 4-6 |

