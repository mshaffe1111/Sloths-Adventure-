# 9-2 The Last Trees: World 9's special stage (mock-up, nothing built)

2026-10-30, design helper for the lead. Matt's brief (3:25 PM ET): one signature stage with the full three-layer canopy, a new
hang-under move taught with a story reason, the harpy's shadow to hide from. **Show first: Matt approves this before anyone builds it.**

## Where it goes: 9-2, and why

- **9-2 is unbuilt.** It's one of World 9's two hand-built ascents (9-2 Rising Heat, 9-7 Lava Steps); gen2-w9 curated the other seven.
  Nothing gets thrown away. (gen2-ascent was going to prove its upward flow on 9-2 and 9-7; it proves on 9-7 instead.)
- **The story's geography.** 9-1 runs through the edge of the volcanic jungle. 9-2 is where the trees run out. From 9-3 Ember Canopy
  on, it's rock, ash and lava. So "the last trees" has to come early, and 9-2 is the last stage where trees still make sense.
- **Taught early, borrowed later.** If hanging plays well, 9-3 Ember Canopy (burnt branches over the glowing rock) and 9-8 Pell's
  Thread are the tree-ish stages that can borrow it. Teaching it in 9-2 lets them.
- **Name and goal (new, needs Matt's approval):** "The Last Trees". Goal: *"Cross the last trees before the ash. Keep out of the
  eagle's sight."* 9-2's approved wayside line stays ("It's hot. I'm a small bird in a large oven...").

## The one new move: hang under a branch

**Story reason (Dot, new line):** *"Too thin to stand on. Hang under it!"* Thin branches sag and won't hold him on top, but he can hang
from them. That's how real sloths travel anyway.

**It's mostly built already.** The shimmy rope (`rope.ts`, `heroRope.ts`, Matt's hand-over-hand sheet from 10-29) is exactly this:
hanging HANG_DROP under a line, creeping at 120 px/s, his paws on the line. A thin branch is a rope that is drawn as a branch and runs
between limbs. New code: the branch's own sag, leaves above it that hide him, and "too thin" (no standing on top).

| Thumb (one-thumb touch) | What he does |
|---|---|
| Walk off the end of a limb onto a thin branch, or flick up under one | He grabs it and hangs (a jump catches it from 40 px past its ends, ROPE_GRAB) |
| Hold left or right | Creeps hand over hand |
| Let go of the screen | Hangs still, swaying (the one-paw pose) |
| Slide down | Lets go and drops (onto a catch limb: every thin branch has one under it) |
| Flick up at a branch's thick end | Pulls up onto the limb |
| Flick up mid-branch | Nothing: a small shake of the head. Too thin. |

**Jump help:** hanging never asks for a jump. With **Off**, **On**, or **On + forward**, getting onto a branch is a walk off the end or
a plain flick up from below, and leaving it is a slide down or reaching the limb at its end. "On + forward" only acts on a second jump
with nothing steering, which can't happen while hanging. The one jump in the stage that matters, from a trunk stub to a limb, is a single
flick sized for Easy's 70% hold.

## Start to finish (about 2:30 for a quick player, 4+ for a careful one)

| Time (quick) | Section | What happens |
|---|---|---|
| 0:00-0:15 | **Start** | A wide limb by the trunk. Nothing moves and nothing can hurt. The wayside line. |
| 0:15-0:45 | **Teach: too thin** (still 1) | A thin branch off the end of the limb, a catch limb under it. Dot flies to the branch and says the line. Two short thin branches, then a longer one. No enemy, no drop deeper than the catch limb. |
| 0:45-1:15 | **The trunk layer** (still 3) | Climb a big trunk (up/down always climbs). The snake (known since World 1) lies on a limb stub: punch it, or wait for it to slide off. **The woodpecker is new:** its first drum is harmless (chips fall, Dot: *"Woodpecker! Climb when it stops."*, new). After that it drums for 0.9 s, then pecks the bark beside its hole for 0.6 s; you climb past between pecks (2.4 s cycle on Normal, 3.2 s on Easy, which is the band's normal window, never under 167/300 ms). |
| 1:15-1:25 | **Rest** | A flag on a wide limb. |
| 1:25-1:55 | **The eagle** (still 2) | A screech is the tell. The first pass is harmless and Dot says *"Under the leaves! Hang!"* (new). Then its shadow sweeps the branch tops every ~6 s. Hanging under a leafy branch, he's hidden. On top in the open, it dives (the 1-7 watcher, `watcher.ts`, plus the harpy's homing dive, `harpyDive.ts`, which locks a beat early so a drop still dodges). |
| 1:55-2:25 | **The branch tops** (still 4) | Back on top for speed. A capuchin lobs fruit (it holds the fruit up 0.8 s first: the tell; the fruit's arc is drawn by its own flight). **Army ants are new:** the first column marches along a limb below him while he watches (Dot: *"Ants. Don't let them reach you."*, new). They hurt on touch and can't be stomped; you jump the column (it's low) or go under by hanging from a thin branch. **Snapping limbs:** a cracked limb creaks and sags for 1 s after he steps on, then drops; it's never needed (a hang route always runs beside it) and it grows back after 30-35 s off screen. |
| 2:25-2:50 | **Climax** | All three layers at once: ants on the tops, the eagle sweeping, thin branches between. Hang on the eagle's beat, climb up when it has passed, jump the ants. Flag in the middle. |
| 2:50-3:00 | **The last tree** (still 5) | The trees end. The camera eases back for a moment to show the ash fields and the volcano. Dot: *"Those were the last trees."* (new). The shrine is on the last limb. |

**Checkpoints:** after the teach (0:45), at the rest (1:15), mid-climax (2:35). No locked exit (an ascent has no count), so Dot has
nothing to explain at the end.

**Scary:** the screech with nowhere to hide in reach; a cracked limb's creak under your feet; the long drop to the lava fields below.
**Fun:** hanging upside down with the eagle's shadow passing over the leaves above you (the stage's signature); swapping layers fast in
the climax; the monkey's fruit.

**Difficulty:** World 9's band. On Easy the woodpecker and the eagle are slower (longer tells), the ant columns are shorter, and there
are more leafy branches to hang under. Nothing is taken out.

## The stills (mock-ups, upright 390x844 and sideways 844x390, saved at 2x)

Made from the game's own painted art: World 9's dawn backdrop with the volcano, World 1's mid trees tinted to ash, Pokey's standard,
climb and rope sheets, the harpy and snake sheets, the capuchin, Dot, and trunk, limb and branch pieces from the prototype and World 2
prop sheets. The stand-ins are tagged on the picture: **the army ants are small code-drawn marks**, and **the woodpecker isn't drawn at
all** (its hole is). Yellow tags and captions are mock-up labels, not game UI.

| Still | Shows |
|---|---|
| `w9-1-too-thin-*.jpg` | The teaching spot; a faded Pokey shows the hang |
| `w9-2-shadow-*.jpg` | Hanging under the leaves while the shadow sweeps the tops (**the best one**) |
| `w9-3-trunk-*.jpg` | The trunk layer: the snake on a limb, the woodpecker's hole |
| `w9-4-tops-*.jpg` | The tops: capuchin and fruit, the cracked limb, the ant column |
| `w9-5-last-tree-*.jpg` | The end: the trees run out, the volcano ahead |

### Polish check (on the stills, at phone size)

- Painted, not drawn: pass, except the ants (stand-ins, tagged) and the eagle's shadow. In the game the shadow is a pre-baked dark
  silhouette sprite, not a blur.
- Nothing copy-pasted: **rough.** The thick limbs are the prototype's log piece, so they end flat and read as logs laid end to end
  (still 4). The real stage needs tapered limbs growing out of the trunk (art 1 below). The trunk is one bark texture mirrored down; the
  real one needs the trunk sheet (art 2).
- Art matches what it is: pass. The thin branches look thin and the limbs look solid, so the "too thin" idea reads.
- Light: pass. Warm dawn and ash, Pokey reads against both.
- Pokey on model and big enough: pass (the standard, climb and rope sheets, about 60 px tall upright).
- Framing: pass both ways. Upright shows the three layers stacked; sideways shows the run ahead.
- Text: Dot's lines are under 10 words, and every one is marked new.

## New art (Gemini prompts, ready to paste; magenta key; attach the named reference)

1. **Living limbs and thin branches** (attach `w9-2-shadow-sideways.jpg`)
   > Side-view 2D game prop sheet, hand-painted storybook style matching the attached picture, solid magenta (#FF00FF) background, no
   > shadows on the background. Rainforest tree limbs in warm brown bark with green moss and a little grey volcanic ash dust. Row 1:
   > three thick walkable limbs, each growing out of a trunk on its left (the trunk edge cut off flat) and tapering to a rounded broken
   > tip on the right, flat enough on top to stand on, about 600 x 110 px. Row 2: three thin branches, about as thick as a wrist, long
   > and slightly sagging, about 560 x 60 px, with a clump of big green leaves sitting on top along most of the length. Row 3: the same
   > thick limb in three states: whole, cracked with splinters showing and sagging, snapped in two with the far half falling. Evenly
   > spaced, nothing touching.
2. **The big trunk, tall and tiling** (attach `w9-3-trunk-sideways.jpg`)
   > Side-view 2D game tile sheet, the same hand-painted storybook style as the attached picture, solid magenta (#FF00FF) background.
   > One tall rainforest tree trunk, warm brown bark with climbing roots and moss, about 260 px wide and 1024 px tall, that tiles
   > seamlessly top to bottom. Next to it: a base piece where the trunk meets roots, and three short limb stubs to fix on its side.
   > Then two small woodpecker holes in the bark (about 60 px), one fresh with pale chips around it. Evenly lit, nothing touching.
3. **Woodpecker** (attach the eagle sheet `src/assets/enemies/eagle-atlas.webp` for style)
   > 2D game character sprite sheet, the same hand-painted cartoon style as the attached sheet, solid magenta (#FF00FF) background. A
   > small red-crested rainforest woodpecker clinging to a vertical trunk, seen from the side, about 120 px tall. Six frames in a row:
   > idle cling, head back (wind-up), drumming fast (two frames with motion lines), a big peck with chips flying, stunned and dizzy
   > after a punch. Same size and position in every frame.
4. **Army ants** (attach `w9-4-tops-sideways.jpg`)
   > 2D game sprite sheet, the same hand-painted cartoon style as the attached picture, solid magenta (#FF00FF) background. A single
   > rainforest army ant seen from the side, dark red-brown with big jaws, about 40 x 24 px, in a four-frame walk cycle in a row. Below
   > it a column of eight ants marching in a line, about 320 x 30 px, in the same four walk frames. Clear dark outline so it reads small.
5. **The harpy's shadow** (attach `src/assets/enemies/eagle-atlas.webp`)
   > Soft dark silhouette of the attached eagle seen from below with wings spread wide, flat dark brown-black, edges slightly soft,
   > about 600 x 260 px, on solid magenta (#FF00FF). Three versions: wings wide, wings tilted, wings half folded.

## Performance (PERFORMANCE-RULES §1: 12 ms per frame at q0, no frame over 50 ms)

The Pixel's stalls already sit on "the snake and eagle sections", so this stage can't add to that.

| Risk | How the design stays under |
|---|---|
| The eagle's shadow (big, soft) | A pre-baked silhouette sprite (art 5) drawn with `drawImage` and `globalAlpha`. No `ctx.filter` blur, no `shadowBlur`, no `multiply` (§2.2, §2.10). |
| Leaves over every thin branch, plus the canopy on top | The leaf clumps are part of the branch sprite (art 1), one draw per branch. The front canopy is only along the top edge, under 0.3 screens of overdraw (§0's overdraw finding). No full-screen leaf overlay. |
| Three layers stacked up a tall stage | Culled per item off screen (§2.5). The trunk is a 1024 px tile, not one 4000 px picture (§2.7). |
| Ant columns | One column sprite with four frames, not per-ant objects. At most two columns on screen. |
| Fruit, chips, falling limb halves | Pooled, no allocations per frame (§3.1). |
| Sheets mid-stage | All five sheets in `stagePreload.ts` before the first frame (§3.3). |
| Check | `drawcheck.mjs` gets a 9-2 run, and the Pixel upright replays the eagle and climax sections against `perf-baseline.md`. |
