# 7-4 mock-up, v2 (with the lead's v3 fixes): Matt's flume, every move needed, lit from its own lights

Matt on v1 (2026-10-29): "Everything can be done just by avoiding objects... The floor looks like trash... The actual mechanism of it
going down looks good." Then his concept picture, his six Gemini sheets (`reference/prop-sheets/gemini-batch-2026-10-29/7-4-slide/`),
his lighting note ("If he's underground, it's not going to be bright") and the polish bar (STAGE-RULES §5b). The mechanism stays (the
crumble, the drop, three lanes, steering, a hit costs a heart); the moves, the art and the light are redone.

**Pictures**, upright 390x844 (`up-*`) and sideways 844x390 (`side-*`), one per beat of the colour script:

| Picture | Beat |
|---|---|
| `1-hall` | the temple hall: gold shafts of daylight through the cracked roof; *"No Dot. Just me, then."* |
| `2-crumble`, `2b-fall` | the crumble (the art helper's four painted break frames) and the fall (Matt's falling poses, Sheet 6) |
| `a-drop-dark` | the drop: near-black for a moment, the first torch blooming ahead |
| `b-torch-flume-statues`, `c-torch-flume-planks` | the torch-lit flume: statues to steer round, a plank barrier to jump |
| `d-fungus-gap`, `e-fungus-beam` | the fungus cavern (green and purple): a gap to jump, a low beam to duck |
| `f-narrow-dark` | the narrow dark: the fewest lights, eyes in the rock; crates to jump or go round, still lit |
| `g-the-way-out`, `i-the-end-cheer` | daylight growing at the end, framed by the cave mouth; his cheer as he shoots out |
| `h-lean-left` | the lean left (frame 1 tipped, the lead's call) |

**Clip**: `clip-up.mp4`, `clip-side.mp4` (about 27 s: the crumble and fall, the drop, then a bot slides a stretch of every beat).
`clip-stone-*.mp4` is the stone-chute pass from earlier today (the same every-move gameplay, before Matt's sheets and the lighting), for
comparison. Matt's Gemini prompts for the sheets are in `GEMINI-PROMPTS.md`.

## 1. Every move is needed

Past the opening, every section has things across **all three troughs** that can't be steered round:

| Across the whole flume (Matt's Sheet 1) | Move | Taught by (Pokey; new lines for Matt's approval) |
|---|---|---|
| a plank barrier nailed across | jump (flick up) | *"Planks across! Flick up, jump!"* |
| a gap: the flume broken off | jump | *"No floor! Jump!"* |
| a beam across at head height | duck (thumb down) | *"Low beam! Thumb down, duck!"* |

They come on their own and in **pairs**: a statue (or a tower of crates) in one or two troughs, then 1.05 s later (Easy 1.5 s) a barrier,
a gap or a beam, so a steer is followed straight away by a jump or a duck. Spilled crates over two troughs can be jumped or steered round
(*"Crates! Jump them, or go round."*). Each section asks for its move at least three times, on Easy too.

| Roll 1 | Normal | Easy |
|---|---|---|
| Things on the slide | 47 | 35 |
| Across the whole flume (must jump or duck) | 24 | 19 |
| Speed | 8.5 m/s | 7 m/s |
| Readable ahead | about 2.4 s (rule 1.0 s) | about 2.9 s (rule 1.6 s) |

## 2. The art: Matt's sheets

Cut by `tools/art/slide74/cut.py` (the shared magenta cutter, de-pinked) into `src/assets/w7slide/flume-cave.webp`, `flume-props.webp`,
`flume-pokey.webp` (boxes in `src/game/w7SlideAtlas.ts`):

- **The flume** is three of Matt's troughs side by side, one a lane (plain and mossy mixed), laid in true perspective row by row, on his
  trestles; his barriers, beams, crates and broken ends are the obstacles, a copy in each trough they fill.
- **The cave**: his walls and ceiling layer as ribs every 9 m, his cave mouth where the cave opens into the fungus cavern, closes into
  the narrow dark, and round the way out (the Hugging Face cave rock and roof far behind, in the dark).
- **Props at every depth** (Sheets 2-3): torches on posts and on the walls, lanterns, fungus, glowworms, eyes in holes, roots and
  thorns, the skull sign and TURN BACK at the top of the drop, an arrow and a broken sign, scaffolds, a rope, the rope bridge
  overhead, webs, thorns, hanging roots, stalactites, stalagmites, boulders.
- **Pokey** (Sheet 5, the lead's final set): frames 1 and 2 sliding straight and bumped, 4 the lean right, 1 tipped 12 degrees with his
  weight shifted the lean left (Sheet 5's lean left, and Matt's re-do, have the satchel mirrored), 5 the jump, 6 the duck, 7 flipped the
  hurt (tipped the other way every other hit), 8 flipped the cheer at the way out; Sheet 6 for the fall. Every frame's satchel checked
  on dark before packing (from behind: strap from the screen-left shoulder to a bag at screen-right; facing us: the bag on his right
  hip). The poles he gripped on the sheet are painted out (the flume is three lanes wide), keeping his hands.

## 3. The light

The scene is drawn, then a half-size light map is multiplied over it: the cave's ambient (#142430, near black, cool) plus each light
as a soft sprite made once (torches and lanterns warm with a 7% flicker; fungus and glowworms green and purple; the way out cool
daylight). Matt's light sources are then drawn again on top at their own brightness; the eyes glow as pinpoints that light nothing.
Every obstacle brings its own light (torches either side of a barrier, a lantern over a beam, fungus deep in a gap and a torch at its
far lip, fungus and a torch by every statue and crate pile, a warm rim on each one's face). Pokey is lit where he is (a warm key that
sweeps over him past each torch, green in the fungus), never below 60%, with a faint cool rim and a contact shadow.

Measured (`tools/art/slide74/perf.mjs`, after warm-up): a frame takes 3-4 ms, and 14-18 ms (90%: 18-26 ms) with the CPU slowed 4x, upright and sideways (the budget is 33 ms).

## The lead's v2 review, fixed (v3)

1. **Pixel steps and shimmer** (the walls' ladders, the far planks breaking into pixels): every surface strip now reads from a
   picture in halving sizes (made once, kept as bitmaps), picking the size nearest its own on screen, so far boards and stones stay
   smooth; strips get thinner toward the vanishing point; the rock's edges are laid under the roof's exact edge, so they are lines,
   not steps. (A clip would do it too, but made the browser stall every few frames: measured, so not used.)
2. **The pickups** are the game's painted World 7 flowers (`flowerSprites.ts`), not code-drawn petals.
3. **Torch scale**: a side piece fades out before it reaches half the screen's height, and near the camera every prop fades.
4. **Repeating walls**: the cave ribs come 6-13 m apart, with their sizes, offsets and mirrors rolled, single walls between them, and
   every kind of prop placed by chance a metre rather than on a beat; the far rock is darker, so the ribs and props carry the look.
5. **The lean left** is subtler (10 degrees, a small weight shift); every frame's satchel checked again on dark.

## Polish check (STAGE-RULES §5b)

| # | Item | Result | Shows it |
|---|---|---|---|
| 1 | Painted, not drawn | **Pass**: the flume, trestles, barriers, beams, crates, broken ends, cave ribs and mouths, every prop and light source, the crumble and Pokey are painted (Matt's sheets; the art helper's crumble, cave rock and way out; World 7's statue). Code draws only small touches: the light, the eye pinpoints, the speed streaks, his shadow, the hall's light shafts. The pickups are the game's painted flowers. | `side-c-torch-flume-planks`, `up-d-fungus-gap` |
| 2 | Nothing copy-pasted | **Fixed**: the v1 strips are gone; the troughs mix plain and mossy boards (the right one mirrored); the ribs, single walls and props come at irregular spacing with rolled sizes and mirrors; the cave layers' straight edges are feathered into the dark; no pixel steps or shimmer (v3 fix 1). | `side-b-torch-flume-statues`, `side-f-narrow-dark` |
| 3 | Art matches what it is | **Pass**: the barrier's top is the height a jump must clear, the beam's underside the height he must duck under, the crate piles the jump height; statues and crate towers are drawn 1.85 m tall (he jumps 1.3 m), so they read as steer-round; a gap is the flume broken off with the drop below. | `up-c-torch-flume-planks`, `up-e-fungus-beam` |
| 4 | Light fits the place | **Pass**: dark ambient, light only from sources, depth into darkness; tested: every obstacle at least twice the ambient in every lane it fills (rolls 1-3, both settings). | `up-f-narrow-dark` |
| 5 | Pokey on model | **Pass, rough spots named**: satchel right in every frame used (strap from the screen-left shoulder to a bag at screen-right; the hurt frame flipped to make it right). The lean left is frame 1 tipped 12 degrees with his weight shifted (the lead's call: Sheet 5's lean left and Matt's re-do both have the satchel mirrored). **Rough spot**: where the poles were painted out his hands close on short stubs; and the sheets came 1024 px wide, so he is drawn from about 190 px (soft on a big phone). | `side-h-lean-left`, `side-i-the-end-cheer` |
| 6 | Framing works both ways | **Fixed**: upright showed the flume in a band across the middle with dark above and below; the upright camera is now narrower with a higher horizon, so the flume ahead fills the screen. | `up-*` against `side-*` |
| 7 | Text stays out of the way | **Fixed**: his bubble sat over the flume ahead, where the next obstacle comes up; it now sits on the flume just below him, tail up. All lines under 10 words, Pokey's own (World 7: no Dot). **Still open**: 7-4's wayside story line shows in Dot's banner over the slide (hidden in these pictures); in the full build it belongs in the hall only. | `side-c-torch-flume-planks` |
| 8 | Every move it teaches is needed | **Pass**: tested: a player who only steers is hit by the barriers, gaps and beams (rolls 1-3, both settings); at least 40% of the obstacles are across the whole flume. | the clip |
| 9 | Moments feel like moments | **Pass for the crumble**: a shake, the floor's painted break, his "oh!" pose and his line, the screen going dark, a second of black, then the first torch blooming. The way out grows and flashes white. **Not yet**: sounds (a crack, a whoosh, the torch crackle) are not wired. | `side-2-crumble`, `side-2b-fall`, `side-a-drop-dark` |
| 10 | Motion is smooth | **Mostly**: the slide runs on the engine's 30 fps step (a frame is 14-18 ms at a 4x CPU slow-down); the grip pose alternates two frames; lights flicker slowly. **Rough spot**: his poses are held stills with no in-betweens (the Hugging Face in-between clips all drifted off model), so the switch from grip to jump to duck is a cut. | the clip |

## What's still needed for the full build

- A painted lean left from behind with the satchel right, if Gemini can be made to keep the bag on the far side (two takes so far put it on the lean side).
- A sharper pass of the sheets (they came 1024 px wide): an upscale, or a re-run at a bigger size.
- Sounds for the crumble, the drop, the slide and the torches.
