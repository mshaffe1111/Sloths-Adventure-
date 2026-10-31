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
  - W9 dusk: the floor came out as lava, and sideways the volcano was lost.
  - W6 day: the floor is water.
- **Clips:**
  - gorge, tea, village, drake-cave, cookhouse, grandma-door: the motion falls on fine detail, which a soft overlay blurs.
  - W4 day, W1 storm: barely moved.
  - W3 storm: the rain moved only in blotches.
- **Lesson:** a whole-plate Wan clip only works for skies, weather, mist and water.

## Left, and the plan for the rest of the $28

- Spend so far about $6.5 (see `jobs.txt`). About $21 left.
- **Tier 3, running at the stop:** raft repaint (the W2 mid raft beat; the old raft plate is flat and pale), W9 dusk and night with a
  basalt floor, W6 day with a mud bank. Review each in the game the same way; wire what passes (raft: `plate: 'raft'` on W2 mid beats 1
  and 13 goes to the lead, since it changes the scene's place).
- **W8 night:** sideways it is soft. A redo at a crisper strength is worth about $0.30.
- **Fine motion** (lanterns, fire, steam, webs): not a whole-plate clip. Use small painted flicker sprites over the plate, or
  clips of cropped regions at full resolution. About $3 for cookhouse, grandma-door, cell, door and warroom.
- **Boss-scene backgrounds:** the 10 boss intro and defeat stories mostly stand in the world plates now. A boss arena plate per world
  (about $0.40 each) would set them apart.
- **Moving clips for the new world plates' skies and water:** use region crops (W2 river, W6 mist, W10 clouds), about $2.
- **Art-use:** `council.webp` (plate and live) is still drawn by no story. It needs a beat that is the council (a lead and Matt call:
  story text).
