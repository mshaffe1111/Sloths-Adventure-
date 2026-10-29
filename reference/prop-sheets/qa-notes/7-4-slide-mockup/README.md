# 7-4 mock-up: the floor gives way, and Pokey slides

Matt's idea (2026-10-29): no climb for World 7's special stage. Pokey runs through the temple side-on, the floor crumbles under him, and
the view goes **behind his back** for a slide down a stone chute: steer left and right, jump things, duck things. Pokey is Matt's own
sliding-from-behind sheet and the obstacles are World 7's painted props; the chute itself (floor, ceiling, the way the walls are laid
in) is still a code-drawn stand-in until the art helper's textures land (the art list is below).

Pictures (all upright 390x844 and sideways 844x390): `up-*.jpg`, `side-*.jpg`; preview videos `preview-up.mp4`, `preview-side.mp4`.

## The plan

**Stage name.** 7-4 is "The Way Up" today, an ascent. The slide needs a new name: **"The Way Down"** (new, needs Matt's approval), card
line: *"The floor is older than it looks."* (new, needs Matt's approval).

| Part | What happens | Time (quick player) |
|---|---|---|
| 1. The hall (side-on) | A normal World 7 run through the temple hall: three fallen blocks to hop, petals. Pokey: *"No Dot. Just me, then."* | ~15 s |
| 2. The crumble (scripted) | At the end of the hall the floor cracks under him (camera shake, he stops, *"Uh oh. This floor..."*), it drops away, he falls, the screen goes dark. The controls are not his for 1.9 s. It is a story beat, not a platform: nothing to time, it can't be skipped or failed, and it plays once (a life lost later never brings it back). A back wall stops him walking past it, and a catch floor sits far below, so nothing can strand him. | ~3 s |
| 3. The slide (behind his back) | He slides down the chute by himself. Thumb left/right steers (the game's normal left/right), a flick up jumps (the normal jump), a held thumb down ducks. Sections below. | ~110 s |
| 4. Out into the chamber (side-on) | The light at the end grows, fills the screen, and he shoots out of the chute's mouth into a chamber, side-on again: a short walk with two steps, then the shrine. Pokey: *"Out! I did that. Me."* (new) | ~12 s |

Total about **2:20** for a quick player on both settings (the slide is timed in seconds, so Easy is slower *and* the same length); a
first-timer is longer (flags send him back).

**The slide's sections** (sawtooth: learn, build, a breather at each flag, the climax near the end, an easy run out):

| s | Section | Taught by (Pokey, his own voice, under 10 words; all new, need Matt's approval) |
|---|---|---|
| 0-6 | The drop in: petals only, to steer for | *"Whoa! Lean left, lean right!"* |
| 6-22 | **Fallen statues and urns** in one lane (Normal: two lanes later) | *"Statues! Steer round them."* |
| 22-36 | **Rubble** across the chute, mixed with heads. **Flag 1** | *"Rubble. Flick up, jump it!"* |
| 38-52 | **Fallen columns** across two lanes: jump or go round | *"Fallen column. Jump it, or go round."* |
| 52-66 | **Gaps** in the floor, heads between. **Flag 2** | *"No floor! Jump!"* |
| 68-82 | **Low beams** at head height. **Flag 3** | *"Low beam! Thumb down, duck!"* |
| 84-104 | The climax: all five mixed, tighter on Normal | |
| 104-110 | The light at the end, petals | *"Light! There is an end!"* |

First hit that costs a heart: *"Ow. Eyes ahead, Pokey."*

**How each kind is taught (STAGE-RULES §1, "taught in a safe spot").** His line comes 2.2 s before the first of each kind, while it is
already in view, and the first of each kind is harmless: running into it is a stumble (a bump and a shake), never a heart. From the
second on, a hit costs a heart.

**Fair, by numbers** (`w7Slide.ts`, checked by `checkSlide` on 200 rolls of each setting: no failures):

| | Normal | Easy |
|---|---|---|
| Slide speed | 8.5 m/s | 7 m/s |
| Obstacles in view before they reach him | 2.4 s (readable), 2.8 s (first drawn) | 2.9 s / 3.4 s (rule: 1.0 s Normal, 1.6 s Easy) |
| Obstacles on the slide (roll 1) | 47 | 35 |
| Time between obstacles | about 1.3-1.6 s | about 2.0-2.3 s |
| Two lanes of heads at once | yes, later on | never |
| Gap length | 2.6 m | 1.8 m |
| Jump window over a gap / a column | 0.27 s / 0.36 s (rule: 0.167 s) | 0.49 s / 0.36 s (rule: 0.3 s) |

- **Always a clear lane**: every row of heads leaves a lane open, and that lane is always one he can reach in time from where the last
  row left him (a lane change takes 0.19 s, plus 0.35 s to react on Normal, 0.6 s on Easy). Rubble, gaps and beams span the chute but
  are jumped or ducked; a column leaves a lane open *and* can be jumped.
- **A hit costs a heart, not a life**: then he flickers for 1.4 s and nothing hurts. A gap drops him onto the far side (a heart). Losing
  the last heart takes a life as anywhere else and sends him back to the last flag on the chute. Lives and Continue as elsewhere.
- **Controls a kid already knows**: the same left/right, jump and down the side-on game uses (touch: thumb slide; keys: arrows and space).
  Let go and he drifts into the nearest lane by himself.
- **Upright and sideways**: the same chute, framed for each (upright shows more of the chute ahead and the ceiling; Pokey is about a
  seventh of the screen tall upright, a fifth sideways). The 30 fps loop is untouched: the slide steps in the engine's own fixed step.

**World 7, "Alone"**: no Dot anywhere in the stage, no perch, no Dot banner; his lines are his own speech bubble.

## What the pictures use

- **Pokey**: Matt's sliding-from-behind sheet, `reference/animation-sheets/slomatt/02_sliding-from-behind-seated-jump.jpg`
  (its cut-outs `slomatt/cutouts/s2_*.png`), packed as `src/assets/w6to10/slide/pokey-slide-back.webp`. Sliding: poses 1 and 3;
  leaning: pose 10 (left) and pose 10 flipped (right); jumping: 13 (launch), 14 (in the air), 15 (coming down), 16 (landing).
- **Obstacles**: World 7's painted props: the sloth statue and the urn (`props-made/w7c`), the fallen column in drums (`w7c`), the low
  beam as the carved span (`props-made/w7b`) on the kit's vine column, rubble as the kit's moss strip with two blocks (`w7b`).
- **Chute walls**: the kit's carved wall (`kits/w7.webp`), laid flat into each wall piece (not in true perspective yet).
- **Code-drawn (stand-ins)**: the floor tiles, the ceiling, the gaps, the light at the end, the crumble's cracks, the flags.

## Pokey's satchel in the sliding sheet (Matt's check)

In the game (`hero-standard.webp`, `hero-story.webp`) the strap goes over his **left** shoulder and the bag sits on his **right** hip. Seen
from behind, that is: strap from the **screen-left** shoulder down to the bag at the **screen-right** hip.

| Pose (slomatt/02) | Satchel from behind | Use |
|---|---|---|
| 1 Start descent | wrong (mirrored) | flipped: right, used as a slide frame |
| 2 Sliding speed | wrong (mirrored) | flipped: right (his face turns the other way, still reads) |
| 3 Bumpy slide | wrong (mirrored) | flipped: right, used as a slide frame |
| 4 Full slide | wrong (mirrored) | flipped: right |
| 5 Prepare right turn | wrong (mirrored) | not needed: 9 flipped is a correct "prepare right" |
| 6 Lean & dig right | wrong (mirrored) | not needed: 10 flipped is a correct right lean (used) |
| 7 Slideout right | wrong (mirrored) | not needed: 11 flipped |
| 8 Exit right turn | wrong (mirrored) | not needed: 12 flipped |
| 9-12 Left turn | **right** | as drawn for left; flipped for right |
| 13 Seated launch | **right** | as drawn (used) |
| 14 Mid-air seated jump | **right** | as drawn (used) |
| 15 Preparing landing | **right** | as drawn (used) |
| 16 Seated impact | wrong (mirrored) | flipped: right (used) |

Every pose can be made right by flipping, so no new slide sheet is needed. What the sheet doesn't have is a **hurt** pose and a
**duck** from behind. `standard-set/09_back-views.jpg` row 3, pose 1 (knocked sideways) has the satchel right and can be the hurt pose
(it needs cutting from its grey background); the duck is the slide pose squashed in the mock-up. If Matt wants a real duck and hurt,
Prompt A below asks for both. (Also noted: `pokey-climb-back` and most of `09_behind-the-back.jpg` have the satchel mirrored.)

The cut-outs keep a strip of the slope and dust they were drawn on (seen under him in the pictures); the real build cleans those.

## Found while building (for step 2)

- 7-4's wayside story line ("Every statue faces the temple...") pops up in Dot's banner over the slide. In the real build it belongs in
  the hall only (hidden in these pictures).
- The level validator (`levelCheck.ts`) walks a stage by jumps and climbs, so it can't see that the crumble leads to the chamber; the
  prototype adds a one-way link for it (`links` on the stage).

## The art list (what is still missing)

The lead's art helper is making the chute art on Hugging Face (branch `w7-slide-art`). The drawing is built around **tiling textures**
for the floor, walls and ceiling (drawn in perspective in strips along the chute) plus **front-view sprites** for the obstacles, so
those are the shapes to make. Already in hand and used above: Pokey sliding (slomatt/02), the fallen column, the statue, the urn, the
carved span, the kit's wall.

| # | Piece | Way | Notes |
|---|---|---|---|
| 1 | Chute floor: worn carved slabs, two grooves, moss in the cracks; tiles top to bottom, seen straight down | (a) Hugging Face | from the kit's `bank`/`fill` |
| 2 | Chute wall: the carved key-pattern wall with roots, tiles left to right, seen straight on; 2-3 variants | (a) | from the kit's `wall` |
| 3 | Ceiling: dark slabs with roots hanging; tiles | (a) | |
| 4 | The chute's mouth: the bright way out (daylight, leaves) seen from inside | (a) | |
| 5 | A gap's near lip: the floor broken off into the dark, seen from the front | (a) | |
| 6 | Rubble across the chute, front view, low and wide | (a) | the kit's `boulder`, `mossStrip` |
| 7 | A low beam made for it (a lintel on two posts, front view) | (a) | the carved span works for now |
| 8 | A statue head on its side, front view (the far strip's faces) | (a) | optional: the sloth statue works |
| 9 | Side-on: the floor cracking and falling in, 4 frames | (a) | the kit's `bank` and `branchCreak` |
| 10 | Side-on: the chamber, with the chute's mouth in its wall | (a) | |
| 11 | Pokey ducking and hurt, from behind | (b) Gemini | only if Matt wants them; Prompt A |
| 12 | Pokey falling as the floor goes, side-on | (b) Gemini | Prompt B; the existing fall poses may do |

### Prompt A: Pokey ducking and hurt, seen from behind (attach: `reference/animation-sheets/slomatt/02_sliding-from-behind-seated-jump.jpg`, `src/assets/hero/hero-standard.webp`)

> In exactly the same style as the attached sliding sheet, the same little brown three-toed sloth, seen **from directly behind**, sitting
> and sliding down a slope. His brown satchel strap goes over his **left** shoulder (on the left of the picture, since we see his back)
> and down across his back to the bag, which sits on his **right** hip (on the right of the picture). Bandages on both forearms. Four
> poses side by side with lots of space between, the same size, on a plain flat magenta (#FF00FF) background, no ground, no dust, no
> frames and no captions: (1) ducking flat, body pressed low, arms over his head; (2) the same, a moment later; (3) hurt, knocked
> sideways to the left, arms flung up; (4) hurt, knocked sideways to the right, arms flung up. We see only his back and the back of his
> head.

### Prompt B: Pokey falling as the floor gives way, side-on (attach: `src/assets/hero/hero-standard.webp`)

> In exactly the same style as the attached picture, the same little brown three-toed sloth with his satchel (strap over his left
> shoulder, bag on his right hip), seen side-on facing right, on a plain flat magenta (#FF00FF) background, two poses side by side with
> space between: (1) the floor has just gone, he is dropping, arms and legs up, eyes wide, mouth open in an "oh!"; (2) falling a moment
> later, curled up tight, eyes shut. No scenery.

## The prototype in the code

- `src/game/w7Slide.ts`: the slide's numbers, the course (built from a seed per setting), `checkSlide` (the proof), the run (`SlideSim`,
  pure), and 7-4's side-on hall and chamber as a hand-built stage. Tests: `src/game/w7Slide.test.ts`.
- `src/game/w7SlideRun.ts`: the crumble beat and the hand-over to the engine (like Dot's flight); `src/game/w7SlideArt.ts`: the drawing.
- `engine.ts`: a small, separate block (start, step, draw, respawn), as Dot's flight has.
- Try it: `npx vite --port 4301`, then `http://127.0.0.1:4301/?autostart=1&level=7-4`.
- Pictures and video: `tools/art/slide74/shot.mjs`, `tools/art/slide74/video.mjs`.
