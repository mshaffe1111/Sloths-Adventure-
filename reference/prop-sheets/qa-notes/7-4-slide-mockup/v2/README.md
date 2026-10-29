# 7-4 mock-up, v2 (with the lead's v3, v4 and v5 fixes): Matt's flume, every move needed, lit from its own lights

Matt on v1 (2026-10-29): "Everything can be done just by avoiding objects... The floor looks like trash... The actual mechanism of it
going down looks good." Then his concept picture, his six Gemini sheets (`reference/prop-sheets/gemini-batch-2026-10-29/7-4-slide/`),
his lighting note ("If he's underground, it's not going to be bright") and the polish bar (STAGE-RULES §5b). The mechanism stays (the
crumble, the drop, three lanes, steering, a hit costs a heart); the moves, the art and the light are redone.

**Pictures**, upright 390x844 (`up-*`) and sideways 844x390 (`side-*`), one per beat of the colour script:

| Picture | Beat |
|---|---|
| `1-hall` | the temple hall: gold shafts of daylight through the cracked roof; *"No Dot. Just me, then."* |
| `2a-crumble-crack` ... `2f-crumble-dark` | the crumble across its frames: cracks start under him, spread, run along the floor's face; the top face breaks into chunks that tip and drop into a dark hole with dust (his "oh!" pose, Sheet 6); he curls and falls; dark |
| `a-drop-dark` | the drop: near-black for a moment, the first torch blooming ahead |
| `b-torch-flume-statues`, `c-torch-flume-planks` | the torch-lit flume: statues to steer round, a plank barrier to jump |
| `d-fungus-gap`, `e-fungus-beam` | the fungus cavern (green and purple): a gap to jump, a low beam to duck |
| `f-narrow-dark` | the narrow dark: the fewest lights, eyes in the rock; crates to jump or go round, still lit |
| `g-the-way-out`, `i-the-end-cheer` | daylight growing at the end, framed by the cave mouth; his cheer as he shoots out |
| `h-lean-left`, `h2-lean-right` | the leans, steering held: frames 1 and 4 (both drawn upright) tipped about 10 degrees, his weight shifted |

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

Measured in the game's own loop (`tools/art/slide74/live.mjs`, 180 frames of sliding, v4): the slide's draw takes 3.2-3.3 ms (90%: 4.2 ms, worst 7-17 ms); with the CPU slowed 4x, 16.6-17.4 ms (90%: 22-23.5 ms), upright and sideways (the budget is 33 ms). Worst frames at 4x: 84-119 ms, about one in 180, both ways. They are not pictures being made on first sight: the slide is now drawn offscreen at eight points down the flume during the hall, the crack and the fall, and the spikes stayed. On the same machine the ordinary side-on hall takes 22 ms a frame at 1x and 60 ms at 4x, with worst frames of 100-250 ms, so these spikes are this machine's headless software drawing, not the slide. `perf.mjs`, which steps frames by hand in one long call, shows stalls the game's loop doesn't (v3 the same), so it is no longer the measure.

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

## The lead's v3 review, fixed (v4)

(The lead, 2026-10-29, after v4: Matt has stopped making Gemini sheets; all art now comes from Hugging Face. Items 2 and 6, the pole stubs
and the upscale, go to the art helper on `hf-art-pokey`, whose frames drop in through `tools/art/slide74/cut.py`; Sheet 5b in
`GEMINI-PROMPTS.md` is kept only as a description of the frames wanted.)

1. **The crumble** no longer uses the rubble panel (its straight edges, the root-wall column and the standing tiles are gone). While he
   stands there the floor is the hall's own: jagged cracks run across it from under him, middle first, then along the foot of its top
   face, faster as it shakes, with grit trickling. When it goes, the very floor he stood on (copied from the screen the frame before)
   breaks along those cracks into five chunks of its top face, each with clean edges and a darker broken underside; they tip and drop
   a moment apart into a hole whose sides are ragged and soft, black below, with small pieces and a puff of dust. See `2a` to `2f`.
2. **The pole stubs**: the poles are cleared from their inner edge outward in every row of the grip, bump and lean-right frames, and
   the arm ends fade over 14 px into the dark, so his paws hold nothing. **Rough spot**: his paws themselves went with the poles (the
   paws were wrapped round them), so his arms end in a soft fade at his sides, not in paws. On a phone at game size this reads as his
   arms held out to the sides; up close it is not a hand. A Gemini prompt for a clean redo is in `GEMINI-PROMPTS.md` (Sheet 5b).
3. **The side wall edges**: the straight vertical lines in the dark were thin gaps, not art. The far rock's strips read a box from
   the rock picture that, at each panel's end, ran past the picture's edge, and the browser cut the strip short, so the dark showed
   through down the whole wall; the roof did the same across its rows. Fixed by keeping every source box inside its picture. Also:
   the rock and roof repeat mirrored back and forth, so panels always meet on matching edges; the change from one picture size to the
   next is a blend, not a step; the eyes' rock and roots fade at their edges. Checked at 3x brightness: no straight edge left.
4. **7-4's wayside line** is shown at the start, in the hall; while sliding, no story line comes up in Dot's banner.
5. **Sounds** (the game's classic effects, `src/audio`, not the orchestral set), see the table below.
6. **Softness**: Pokey is not regenerated; the frames to upscale are listed below.
7. **Checks**: typecheck, the full suite and the build re-run after the renderer changes (below).

### Sounds used

| Moment | Effect (classic set) |
|---|---|
| the floor starts to crack | `playLand(1)` (a heavy thud as the rumble) + `playHitImpact(true, 'chitin')` (the crack) |
| two more cracks as it shakes | `playHitImpact(false, 'chitin')` |
| it gives way | `playLand(1)` + `playHitImpact(true, 'chitin')` + `playWhoosh()` (the drop) |
| sliding | `playTreeClimb()` repeated every 0.42-0.5 s while he is on the boards (a soft wooden scrape) |
| a jump / landing back on the boards | `playJump()` / `playLand(0.5)` (the thump) |
| a flower | `playFlowerPickup()` |
| a flag | `playCheckpoint()` |
| a hit | `playHitImpact(true, 'generic')` + `playPlayerHurt()`; the first of each kind is a harmless stumble: `playHitImpact(false, 'generic')` alone |
| falling into a gap | `playPlayerHurt()` |
| shooting out at the way out | `playLevelStart()` |

### Frames to upscale (2x, Real-ESRGAN anime, on Hugging Face)

From `reference/prop-sheets/gemini-batch-2026-10-29/7-4-slide/`, whole sheets in (the cutter reads the grid, so the same layout comes
back at twice the size, and `cut.py` cuts them as before):

| Sheet | Frames used in the game | Why |
|---|---|---|
| `sheet5-pokey-behind.jpg` | 1 (grip), 2 (bump), 4 (lean right), 5 (jump), 6 (duck), 7 (hurt), 8 (cheer); 3 is not used | he was drawn from about 190 px, the softest thing on a big phone (done in v5) |
| `sheet6-pokey-falling.jpg` | both (oh!, curled) | the fall, side-on, drawn larger than the sheet |
| `sheet1-flume.jpg` (if time) | all eight | the near boards and barriers are magnified most |
| `sheet2`-`sheet4` (optional) | all | they are seen smaller; an upscale helps only the near ribs and torches |

## v5: Pokey's new frames (the Hugging Face pass)

The art helper's 2x pass (branch `hf-art-pokey`, fa64770, passed the lead's review) replaces Sheets 1, 5 and 6, same grids, same
magenta, copied over the originals in `reference/prop-sheets/gemini-batch-2026-10-29/7-4-slide/`:

- **Empty paws**: grip, bump and lean right are repainted with no poles, paws open with claws and wraps, arms at his sides. The pole
  removal is gone from `cut.py`; a small key clears the magenta left in the pockets between his bag and his paws (it showed as pink
  and grey speckle), keyed on colour (his fur, claws, wraps and bag are all warm; the leftovers are pink or neutral grey).
- **Sharper**: every frame is twice the size (grip 279x371 px, was about 190 px tall), and the flume's boards and barriers too.
- **The lean right** is drawn upright now, so it is tipped like the lean left (about 10 degrees, his weight shifted), steering held.
- **Satchel** checked on dark in all nine frames: from behind, the strap from the screen-left shoulder to the bag at screen-right
  (grip, bump, lean right, jump, duck, hurt flipped); facing us (the cheer, flipped), the bag on his right hip; side-on (the fall) as
  drawn.

Three things the re-shoot showed, fixed:

1. **Pokey see-through**: right after a near prop faded out, he was drawn at its fade. He is now always drawn solid.
2. **A statue filling the screen**: obstacles he had passed were drawn whole as they went by the camera; a statue in the next lane
   swept past as a huge soft face. Once he is past one, it fades over a metre.
3. **The way out's edge**: shooting out in an outer lane, the camera followed him and the end picture's edge showed (upright, he
   went off screen as it centred). As he shoots out, he and the camera now come back to the middle in a quarter second.

## Polish check (STAGE-RULES §5b), v5

| # | Item | Result | Shows it |
|---|---|---|---|
| 1 | Painted, not drawn | **Pass**: the flume, trestles, barriers, beams, crates, broken ends, cave ribs and mouths, every prop and light source, Pokey, and the hall's own painted floor that breaks are painted (Matt's sheets; the art helper's cave rock and way out; World 7's statue and hall). Code draws only small touches: the light, the eye pinpoints, the speed streaks, his shadow, the hall's light shafts, the cracks' lines, the dust and the hole's dark. The pickups are the game's painted flowers. | `side-c-torch-flume-planks`, `side-2d-crumble-breaking` |
| 2 | Nothing copy-pasted | **Fixed** (v4 item 3): the straight lines down the far rock and across the roof were gaps from source boxes running past the picture's edge; gone. The rock and roof now repeat mirrored, blend between picture sizes, and the eyes' boxes fade. The troughs mix plain and mossy boards; ribs, walls and props come at irregular spacing with rolled sizes and mirrors. | `side-f-narrow-dark`, `side-a-drop-dark` |
| 3 | Art matches what it is | **Pass**: the barrier's top is the height a jump must clear, the beam's underside the height he must duck under, the crate piles the jump height; statues and crate towers are drawn 1.85 m tall (he jumps 1.3 m), so they read as steer-round; a gap is the flume broken off with the drop below. | `up-c-torch-flume-planks`, `up-e-fungus-beam` |
| 4 | Light fits the place | **Pass**: dark ambient, light only from sources, depth into darkness; tested: every obstacle at least twice the ambient in every lane it fills (rolls 1-3, both settings). | `up-f-narrow-dark` |
| 5 | Pokey on model | **Pass** (v5): the Hugging Face 2x pass, paws empty and open with claws and wraps, no stubs, no pink; twice as sharp; satchel right in all nine frames (checked on dark: from behind the strap from the screen-left shoulder to the bag at screen-right; the hurt and cheer flipped to make it right); both leans tipped from upright frames, steering held; always drawn solid. | `side-b-torch-flume-statues`, `side-h-lean-left`, `side-h2-lean-right`, `up-i-the-end-cheer` |
| 6 | Framing works both ways | **Fixed**: upright showed the flume in a band across the middle with dark above and below; the upright camera is now narrower with a higher horizon, so the flume ahead fills the screen. | `up-*` against `side-*` |
| 7 | Text stays out of the way | **Fixed** (v4 item 4): 7-4's wayside story line now shows at the start in the hall, and no story line comes up during the slide. His bubble sits on the flume just below him, tail up. All lines under 10 words, Pokey's own (World 7: no Dot). | `side-1-hall`, `side-c-torch-flume-planks` |
| 8 | Every move it teaches is needed | **Pass**: tested: a player who only steers is hit by the barriers, gaps and beams (rolls 1-3, both settings); at least 40% of the obstacles are across the whole flume. | the clip |
| 9 | Moments feel like moments | **Pass** (v4 items 1 and 5): the crumble cracks under him, shakes, breaks into chunks of the real floor that drop into a ragged dark hole with dust, with a rumble and cracks, a whoosh on the drop; a second of black, then the first torch blooming; the boards scrape under him, a thump on each landing; the way out grows and flashes white with a fanfare. | `side-2a` to `side-2f`, the clip |
| 10 | Motion is smooth | **Mostly**: the slide runs on the engine's 30 fps step (the draw is 17 ms, 90% 21-24 ms, at a 4x CPU slow-down in the game's own loop; the rare slower frame is the test machine's, the hall shows bigger ones); the grip pose alternates two frames; lights flicker slowly. **Rough spot**: his poses are held stills with no in-betweens (the Hugging Face in-between clips all drifted off model), so the switch from grip to jump to duck is a cut. | the clip |

## What's still needed for the full build

- The torch crackle (no classic effect fits; left silent rather than wrong).
- In-betweens for his poses, if a set can be made on model.
