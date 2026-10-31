# hf-cutscenes: where it stands (2026-10-31)

Branch `hf-cutscenes`. Audit: `AUDIT.md`. Every Hugging Face job and its verdict: `tools/art/hfstory/jobs.txt`.

## Done (wired, checked in the game upright and sideways)

**World plates** (`src/assets/story/plates/w<world>-<mood>.webp`, `plateData.ts` `WORLD_PLATES`, `withWorldPlate` in `StoryPlayer.tsx`).
A story panel on a world's scenery, with no plate of its own, no following camera, no castle and no line-up, now stands in that
world's painted plate. Its cast stays on the same ground line (0.8). No story text changed.

| Plate | Panels | Before/after |
|---|---|---|
| w1-day | 81 | `after/compare-w1-w3.jpg` |
| w1-storm | 30 | `show-first-2.jpg` |
| w1-dusk | 8 | `after/compare-w4-w1dusk-w9.jpg` |
| w2-day | 41 | `after/compare-w8-w2.jpg` |
| w3-night | 28 | `after/compare-w1-w3.jpg`, `after/compare-w10-w3.jpg` |
| w3-storm | 8 | `after/compare-w3storm.jpg` |
| w4-day | 42 | `after/compare-w4-w1dusk-w9.jpg` |
| w5-day | 22 | `after/compare-w3glow-w5-w10.jpg` |
| w5-dusk | 13 | `after/compare-w10-w5dusk.jpg` |
| w6-dusk | 47 | `after/compare-w5dusk-w6-w7.jpg` |
| w7-day | 11 | `after/compare-w5dusk-w6-w7.jpg` |
| w8-night | 81 | `after/compare-w8-w2.jpg` |
| w10-storm | 55 | `after/compare-w10-w5dusk.jpg` |

About 470 of the 580 scenery panels now stand in a painted plate.

**The raft plate** is repainted (the old one was flat and pale and unused) and wired to W2 mid's two raft lines (`after/compare-raft.jpg`).

**The gorge plate** is wired to W4's six "the vine held" panels, which had shown no Pokey at all.

**Moving plates** (`src/assets/story/live/`, `livePlateData.ts`, cut by `tools/art/hfstory/livecut.py`):
- which: courtyard (56 panels), nest-night, gates, steps;
- loop: 12 frames, 8 a second, a crossfade loop with no jump;
- colour: held to the still painting, so only the motion shows;
- memory: at most 8 MB decoded each, with two sheets held at once;
- off when the frame governor has stepped down (`learned.quality > 0`) or with `?clips=0`; the still plate is the fallback.

Videos: `after/live-*-up.mp4`, `after/live-*-side.mp4`.

**Performance:**
- The story's vignette gradient is baked once per size (PERF §2.3).
- Measured in headless Chromium:
  - a plate panel makes 54-68 canvas calls a frame;
  - the scenery panels it replaces make 124-224 (W9, W10).
- A moving plate adds 2 calls.

## Dropped (failed the polish bar; not shipped)

- **Plates:**
  - W3 glow, W9 night: muddy.
  - W9 dusk (three tries): the floor came out as lava, or the volcano was lost sideways
    (`after/compare-w4-w1dusk-w9.jpg`; the third try is in the bucket as `wp-9-dusk-x62-full.png`).
  - W6 day (twice): the floor is water.
- **Clips:**
  - gorge, tea, village, drake-cave, cookhouse, grandma-door: the motion falls on fine detail, which a soft overlay blurs.
  - W4 day, W1 storm, W6 dusk: barely moved.
  - W3 storm: the rain moved only in blotches.
- **Lesson:** a whole-plate Wan clip only works for skies, weather, mist and water.

## Left, and the plan for the rest of the $28

- **Spend:** about $7.5 of the $28, 16 GPU jobs, about 160 minutes on rtx-pro-6000 (`jobs.txt`). About $20 left.
- **W9 dusk and W9 night (48 panels):** paint the volcano as a cut-out over a plate whose floor is said outright, instead of hoping one
  img2img keeps both. About $1.
- **W8 night (81 panels):** wired, but soft sideways. A crisper repaint is worth about $0.40.
- **Fine motion** (lanterns, fire, steam, webs) needs small painted flicker sprites or clips of cropped regions at full resolution,
  not whole-plate clips. About $3 for cookhouse, grandma-door, cell, door, warroom and tea.
- **Sky and water motion for the new world plates:** clips of cropped regions (W10 storm clouds, W2 river), about $2. Whole-plate
  clips of them barely moved.
- **Boss arena plates:** one per world for the boss intros and defeats, about $0.40 each.
- **Council:** `council.webp` (plate and live clip) is still drawn by no story. It needs a beat set at the council; that is story
  text, so it is a call for the lead and Matt.
