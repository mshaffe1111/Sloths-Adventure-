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

## v6: every jump measured against a real thumb (Matt, 2026-10-29: "May need to evaluate the jumps in the slide level. Couldn't make it thru. Should be very tough, let's make sure it's possible.")

**How it is measured** (`tools/art/slide74/jumps.ts`, `npx tsx tools/art/slide74/jumps.ts [seed]`): for every thing across the flume (plank
barrier, gap, low beam) and every crate pile in his lane, the real `SlideSim` is run at the engine's 30 fps with that one obstacle,
pressing on each frame in turn: the frames that clear it are its **window** (in s before he reaches it). Then:

- **read**: how long it has been readable on screen (it fades in 24 m from the camera, readable from 20 m; the camera is 4.2 m behind
  him; the same distance upright and sideways, so upright, the narrower view, is no worse) before the last good press, against the
  house rule's **0.8 s to react + 0.6 s to act = 1.4 s**;
- **after**: the window left once he is down from the jump or duck before (a press up to 0.15 s before landing still jumps);
- **thumb**: the house thumbs (`tools/inspect/firsttimer.ts`: adult N(+30 ms, 30 ms), kid N(+90 ms, 65 ms)) **plus a judgement error
  of 70 ms either way**, since on a slide only the picture says when to jump. With the house thumbs alone, the adult made every jump
  on paper and Matt still couldn't get through. The thumb aims at the middle of the window left. The table gives the share of 4000
  tries that clear it, against the house hotspot bar (adult 70%, kid 85%). **Margin** is how late past its aim the average press can
  come and still be in: half the window less the thumb's mean lateness.

**What failed** (roll 1): on Easy, **9 of 20** jumps were under the kid's 85%: every plank barrier and crate pile (59-67%), with
**3.9 misses expected a run**. The barrier's top was 0.85 m, so a jump cleared it only in a 0.27-0.33 s window. On Normal no jump was
under the bar, but **0.9 misses were expected a run** and only 39% of runs were clean.

**The fixes** (the slide's speed and density are unchanged, so Normal stays very tough):

1. **The plank barrier and the crate piles are lower: 0.65 m** (was 0.85). The jump still has to be made, but its window is
   0.43-0.47 s on Normal (was 0.30-0.33). They are drawn to the new height: the picture's top is still the height a jump must clear.
2. **The gaps are shorter: Normal 2.3 m (was 2.6), Easy 1.6 m (was 1.8).** The window is 0.43-0.47 s on Normal (was 0.40) and
   0.57 s on Easy.
3. **Easy's jump is a little stronger** (7.0 m/s up, airtime 0.86 s, was 0.8 s). Easy is slower, so it spends longer over each thing
   and its windows were the narrower ones. Normal's jump is unchanged.

No earlier tell or slow-down was needed: every jump is readable 1.73-1.86 s ahead on Normal and 2.06-2.22 s on Easy, over the
1.4 s rule.

**After**: none fail, on rolls 1-5 on both settings. Expected misses a run: **Normal 0.2-0.3** (a clean run 78-82%); **Easy 0.6-1.2**,
against 5 hearts, 3 lives and three flags (a clean run 29-54%). A test holds it (`w7Slide.test.ts`, "every jump is makeable by a real
thumb": adult at least 90%, kid at least 85%, read at least 1.4 s).

**Every jump and duck, before and after** (roll 1, the one the stage builds; # is the obstacle's place in the course):

**Normal (8.5 m/s, adult thumb N(+30 ms, 76 ms), bar 70%)**

| # | at (s) | what | after | window before | window after | read (s, need 1.4) | thumb before | thumb after | margin after (s) |
|---|---|---|---|---|---|---|---|---|---|
| 7 | 22.5 | rubble | steer | 0.17-0.47 s (0.33) | 0.10-0.53 s (0.47) | 1.76 | 93% | 99% | 0.20 |
| 8 | 25.3 | rubble | jump | 0.17-0.47 s (0.33) | 0.10-0.53 s (0.47) | 1.76 | 94% | 99% | 0.20 |
| 9 | 27.0 | rubble | jump | 0.17-0.47 s (0.33) | 0.10-0.53 s (0.47) | 1.76 | 94% | 99% | 0.20 |
| 12 | 31.4 | rubble | steer | 0.20-0.47 s (0.30) | 0.13-0.53 s (0.43) | 1.73 | 90% | 99% | 0.18 |
| 13 | 38.5 | gap | jump | 0.03-0.40 s (0.40) | 0.03-0.43 s (0.43) | 1.83 | 97% | 98% | 0.18 |
| 14 | 41.3 | gap | jump | 0.03-0.40 s (0.40) | 0.03-0.43 s (0.43) | 1.83 | 98% | 99% | 0.18 |
| 15 | 43.1 | gap | jump | 0.03-0.40 s (0.40) | 0.03-0.43 s (0.43) | 1.83 | 97% | 99% | 0.18 |
| 17 | 46.5 | gap | steer | 0.03-0.40 s (0.40) | 0.03-0.43 s (0.43) | 1.83 | 97% | 98% | 0.18 |
| 18 | 48.4 | gap | jump | 0.03-0.40 s (0.40) | 0.03-0.43 s (0.43) | 1.83 | 98% | 99% | 0.18 |
| 19 | 54.5 | beam | jump | 0.03-1.60 s (1.60) | 0.03-1.60 s (1.60) | 1.83 | 100% | 100% | 0.77 |
| 20 | 57.1 | beam | duck | 0.03-1.60 s (1.60) | 0.03-1.60 s (1.60) | 1.83 | 100% | 100% | 0.77 |
| 21 | 58.7 | beam | duck | 0.03-1.60 s (1.60) | 0.03-1.60 s (1.60) | 1.83 | 100% | 100% | 0.67 |
| 23 | 61.8 | beam | steer | 0.00-1.60 s (1.63) | 0.00-1.60 s (1.63) | 1.86 | 100% | 100% | 0.77 |
| 25 | 64.7 | beam | steer | 0.00-1.60 s (1.63) | 0.00-1.60 s (1.63) | 1.86 | 100% | 100% | 0.51 |
| 26 | 70.0 | column | duck | 0.17-0.43 s (0.30) | 0.10-0.50 s (0.43) | 1.76 | 90% | 99% | 0.18 |
| 27 | 72.5 | beam | jump | 0.00-1.60 s (1.63) | 0.00-1.60 s (1.63) | 1.86 | 100% | 100% | 0.78 |
| 28 | 74.0 | rubble | duck | 0.17-0.47 s (0.33) | 0.10-0.53 s (0.47) | 1.76 | 94% | 99% | 0.20 |
| 29 | 75.6 | beam | jump | 0.00-1.60 s (1.63) | 0.00-1.60 s (1.63) | 1.86 | 100% | 100% | 0.60 |
| 31 | 78.7 | rubble | steer | 0.17-0.47 s (0.33) | 0.10-0.53 s (0.47) | 1.76 | 94% | 99% | 0.20 |
| 32 | 82.0 | column | jump | 0.17-0.43 s (0.30) | 0.10-0.50 s (0.43) | 1.76 | 91% | 99% | 0.18 |
| 33 | 83.3 | beam | jump | 0.00-1.60 s (1.63) | 0.00-1.60 s (1.63) | 1.86 | 100% | 100% | 0.44 |
| 34 | 84.7 | gap | duck | 0.00-0.40 s (0.43) | 0.00-0.43 s (0.47) | 1.86 | 98% | 99% | 0.20 |
| 37 | 89.0 | gap | steer | 0.00-0.40 s (0.43) | 0.00-0.43 s (0.47) | 1.86 | 99% | 99% | 0.20 |
| 38 | 90.4 | column | jump | 0.17-0.43 s (0.30) | 0.10-0.50 s (0.43) | 1.76 | 90% | 99% | 0.18 |
| 40 | 93.1 | beam | steer | 0.00-1.60 s (1.63) | 0.00-1.60 s (1.63) | 1.86 | 100% | 100% | 0.51 |
| 42 | 95.9 | beam | steer | 0.00-1.60 s (1.63) | 0.00-1.60 s (1.63) | 1.86 | 100% | 100% | 0.70 |
| 45 | 99.8 | rubble | steer | 0.17-0.47 s (0.33) | 0.10-0.53 s (0.47) | 1.76 | 94% | 99% | 0.20 |

**Easy (7 m/s, kid thumb N(+90 ms, 96 ms), bar 85%)**

| # | at (s) | what | after | window before | window after | read (s, need 1.4) | thumb before | thumb after | margin after (s) |
|---|---|---|---|---|---|---|---|---|---|
| 5 | 22.5 | rubble | steer | 0.17-0.43 s (0.30) | 0.10-0.57 s (0.50) | 2.16 | 66% **fail** | 93% | 0.16 |
| 6 | 25.7 | rubble | jump | 0.17-0.43 s (0.30) | 0.10-0.57 s (0.50) | 2.16 | 67% **fail** | 93% | 0.16 |
| 7 | 28.1 | rubble | jump | 0.17-0.43 s (0.30) | 0.10-0.57 s (0.50) | 2.16 | 66% **fail** | 93% | 0.16 |
| 9 | 32.0 | rubble | steer | 0.17-0.43 s (0.30) | 0.10-0.57 s (0.50) | 2.16 | 66% **fail** | 93% | 0.16 |
| 10 | 38.5 | gap | jump | 0.03-0.47 s (0.47) | 0.03-0.57 s (0.57) | 2.22 | 90% | 97% | 0.19 |
| 11 | 41.7 | gap | jump | 0.03-0.47 s (0.47) | 0.03-0.57 s (0.57) | 2.22 | 90% | 97% | 0.19 |
| 12 | 44.2 | gap | jump | 0.03-0.47 s (0.47) | 0.03-0.57 s (0.57) | 2.22 | 90% | 96% | 0.19 |
| 13 | 46.5 | gap | jump | 0.03-0.47 s (0.47) | 0.03-0.57 s (0.57) | 2.22 | 90% | 97% | 0.19 |
| 14 | 54.5 | beam | jump | 0.03-1.60 s (1.60) | 0.03-1.60 s (1.60) | 2.22 | 100% | 100% | 0.71 |
| 15 | 57.5 | beam | duck | 0.03-1.60 s (1.60) | 0.03-1.60 s (1.60) | 2.22 | 100% | 100% | 0.71 |
| 16 | 59.8 | beam | duck | 0.03-1.60 s (1.60) | 0.03-1.60 s (1.60) | 2.22 | 100% | 100% | 0.71 |
| 18 | 63.7 | beam | steer | 0.03-1.60 s (1.60) | 0.03-1.60 s (1.60) | 2.22 | 100% | 100% | 0.66 |
| 19 | 70.0 | column | duck | 0.20-0.43 s (0.27) | 0.13-0.57 s (0.47) | 2.12 | 60% **fail** | 90% | 0.14 |
| 22 | 77.8 | gap | steer | 0.03-0.47 s (0.47) | 0.03-0.57 s (0.57) | 2.22 | 91% | 97% | 0.19 |
| 24 | 83.6 | rubble | steer | 0.20-0.43 s (0.27) | 0.13-0.57 s (0.47) | 2.12 | 59% **fail** | 90% | 0.14 |
| 26 | 87.5 | rubble | steer | 0.20-0.43 s (0.27) | 0.13-0.57 s (0.47) | 2.12 | 60% **fail** | 90% | 0.14 |
| 27 | 89.8 | gap | jump | 0.03-0.47 s (0.47) | 0.03-0.57 s (0.57) | 2.22 | 91% | 97% | 0.19 |
| 29 | 93.5 | rubble | steer | 0.20-0.43 s (0.27) | 0.13-0.57 s (0.47) | 2.12 | 59% **fail** | 90% | 0.14 |
| 31 | 97.3 | beam | steer | 0.03-1.60 s (1.60) | 0.03-1.60 s (1.60) | 2.22 | 100% | 100% | 0.66 |
| 34 | 103.1 | rubble | steer | 0.20-0.43 s (0.27) | 0.13-0.57 s (0.47) | 2.12 | 60% **fail** | 91% | 0.14 |


**In the real engine** (`tools/art/slide74/proof.mjs`): the whole slide, played in the game itself, upright and sideways, Normal and
Easy, by a bot with a real thumb:

- it sees an obstacle only once it is readable;
- it steers 0.35-0.55 s after seeing it;
- it aims each jump at the middle of that jump's window and presses late by the thumb and judgement noise above, a fresh draw each
  time;
- it holds down for a beam from about 0.45 s before (plus or minus 0.1 s).

| | Before (2 runs each) | After (3 runs each) |
|---|---|---|
| Normal, upright | out both times, 0 hits | out every time, 0, 0, 1 hits |
| Normal, sideways | out both times, 1 hit each | out every time, 0, 1, 0 hits |
| Easy, upright | out both times, 1 hit each | out every time, 0, 0, 2 hits |
| Easy, sideways | **one run lost every life** (15 hits); the other out with 2 hits | out every time, 1, 1, 2 hits |

After: 12 of 12 runs out, at most 2 of 5 hearts lost, never a life.

**The hardest stretch**: `clip-hardest-climax.mp4` (30 fps, Normal, sideways, about 11 s). The climax at 80-92 s has a crate pile,
a beam, two gaps and a crate pile, with statues between them, about 1.3 s apart.

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

## Polish check (STAGE-RULES §5b), v6

| # | Item | Result | Shows it |
|---|---|---|---|
| 1 | Painted, not drawn | **Pass**: the flume, trestles, barriers, beams, crates, broken ends, cave ribs and mouths, every prop and light source, Pokey, and the hall's own painted floor that breaks are painted (Matt's sheets; the art helper's cave rock and way out; World 7's statue and hall). Code draws only small touches: the light, the eye pinpoints, the speed streaks, his shadow, the hall's light shafts, the cracks' lines, the dust and the hole's dark. The pickups are the game's painted flowers. | `side-c-torch-flume-planks`, `side-2d-crumble-breaking` |
| 2 | Nothing copy-pasted | **Fixed** (v4 item 3): the straight lines down the far rock and across the roof were gaps from source boxes running past the picture's edge; gone. The rock and roof now repeat mirrored, blend between picture sizes, and the eyes' boxes fade. The troughs mix plain and mossy boards; ribs, walls and props come at irregular spacing with rolled sizes and mirrors. | `side-f-narrow-dark`, `side-a-drop-dark` |
| 3 | Art matches what it is | **Pass** (v6): the barrier's and the crates' pictures are drawn to their new 0.65 m top, the height a jump must clear; the gap is the flume broken off, now 2.3 m (Easy 1.6 m); the beam's underside is the height he must duck under; statues and crate towers are 1.85 m, so they read as steer-round. | `side-c-torch-flume-planks`, `up-c-torch-flume-planks`, `up-f-narrow-dark` |
| 4 | Light fits the place | **Pass**: dark ambient, light only from sources, depth into darkness; tested: every obstacle at least twice the ambient in every lane it fills (rolls 1-3, both settings). | `up-f-narrow-dark` |
| 5 | Pokey on model | **Pass** (v5): the Hugging Face 2x pass, paws empty and open with claws and wraps, no stubs, no pink; twice as sharp; satchel right in all nine frames (checked on dark: from behind the strap from the screen-left shoulder to the bag at screen-right; the hurt and cheer flipped to make it right); both leans tipped from upright frames, steering held; always drawn solid. | `side-b-torch-flume-statues`, `side-h-lean-left`, `side-h2-lean-right`, `up-i-the-end-cheer` |
| 6 | Framing works both ways | **Fixed**: upright showed the flume in a band across the middle with dark above and below; the upright camera is now narrower with a higher horizon, so the flume ahead fills the screen. | `up-*` against `side-*` |
| 7 | Text stays out of the way | **Fixed** (v4 item 4): 7-4's wayside story line now shows at the start in the hall, and no story line comes up during the slide. His bubble sits on the flume just below him, tail up. All lines under 10 words, Pokey's own (World 7: no Dot). | `side-1-hall`, `side-c-torch-flume-planks` |
| 8 | Every move it teaches is needed, and every one is possible | **Pass** (v6): tested, a player who only steers is hit by the barriers, gaps and beams; every jump measured against a real thumb with judgement (the table above): none under the bar on rolls 1-5, readable at least 1.73 s ahead; the real-engine runs, 12 of 12 out upright and sideways on both settings. | the table, `clip-hardest-climax.mp4` |
| 9 | Moments feel like moments | **Pass** (v4 items 1 and 5): the crumble cracks under him, shakes, breaks into chunks of the real floor that drop into a ragged dark hole with dust, with a rumble and cracks, a whoosh on the drop; a second of black, then the first torch blooming; the boards scrape under him, a thump on each landing; the way out grows and flashes white with a fanfare. | `side-2a` to `side-2f`, the clip |
| 10 | Motion is smooth | **Mostly**: the slide runs on the engine's 30 fps step (the draw is 17 ms, 90% 21-24 ms, at a 4x CPU slow-down in the game's own loop; the rare slower frame is the test machine's, the hall shows bigger ones); the grip pose alternates two frames; lights flicker slowly. **Rough spot**: his poses are held stills with no in-betweens (the Hugging Face in-between clips all drifted off model), so the switch from grip to jump to duck is a cut. | the clip |

## What's still needed for the full build

- The torch crackle (no classic effect fits; left silent rather than wrong).
- In-betweens for his poses, if a set can be made on model.
