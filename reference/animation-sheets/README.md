# Animation sheets (reference library)

Every pose and animation sheet Matt supplies lives here, so nothing he draws is ever lost and any cutscene or game state can be built from it later.

**Rules**
- Never delete, overwrite or "clean up" a sheet. New sheets are added, never swapped in.
- Originals stay as supplied: JPG files are byte for byte copies; PNG files are stored as lossless WebP (same pixels, smaller file).
- This folder is outside `src/` and `public/`, so it is not part of the game build and adds nothing to the download.
- `slomatt/frames.json` lists every frame of the six action-study sheets with its label and a note on what it is for.

**Folders**
- `slomatt/` the six action-study sheets (rope, sliding, squat/flip/fall/kick, punch/climb/kick, run/jump/punch, slow movement) and `early-hero-sheets/`, the sheets the in-game hero atlas was cut from.
- `slomatt/standard-set-v2/` the second round of standard-set sheets (2026-10-20 evening): walk and run (two takes), jump, vine, attacks, hit, plus swim/dive/glide, aim/items/wall/air moves and air attacks/stomp/bounce/spring. See `standard-set/NOTES.md`.
- `slomatt/standard-set/` the nine-sheet standard set (4x4 on flat grey, 144 frames at ~240 px, one category per sheet), the format new sheets follow.
- `jennifur/` her emotion sheets.
- `slomatt-and-jennifur/` the shared sheets, including one with walk, jump, punch, kick, hurt and defeat drawn for both.

## What the six action-study sheets add to the game

| Sheet | Fills | In the game today |
|---|---|---|
| 1 Rope | frames 5-8 vine swing, 9-16 release and leap | vine swinging has no painted pose, so the old code-drawn hero appears |
| 1 Rope | frames 1-4 balancing on a rope | no such mechanic: the game's rope is hung from, not walked on |
| 2 Sliding | whole sheet | no sliding stage exists yet |
| 3 | 1-4 duck, 5-8 flip, 9-12 knocked down, 13-16 mega kick | one frame each; the double jump spins the single jump pose |
| 4 | 1-4 mega punch, 5-10 climb and hang, 11-16 kick | one mega frame, four climb frames; hanging on a rope reuses the jump pose |
| 5 | 1-8 run, 9-12 punch, 13-16 jump | ten run frames, five punch frames, one rise, one fall, one landing |
| 6 | 12 wave, 13 crouch, 14 staff, 16 fall | none of these exist (cutscene material) |

## Before using these in the game

- **Size.** Each sheet is about 1024 px wide, so Slomatt is roughly 100-150 px tall in a panel. The in-game atlas frames are 270-320 px tall. At that size these would look soft next to the existing hero. They work as pose references and for small cutscene uses; for the game itself they should be redrawn larger (same layout, magenta background, larger sheet).
- **Look.** The sheets show the satchel and wrist wraps but no green backpack and bedroll, which the in-game run frames have. Mixing them would make the hero change outfit mid-jump.
- **Background.** They are drawn on parchment, not a keyed colour, so cutting frames out needs a careful outline-based cut.

## The standard set (what every character gets going forward)

Each character is drawn as the same twelve 4x4 sheets: 1024x1024, flat grey, no borders or numbers, one subject per sheet. The cutter (`scripts/cutStandard.py`) expects 16 figures per sheet in reading order.

| Sheet | Subject |
|---|---|
| 1 | Turnaround, idle breathing, eye blinks, head tilts |
| 2 | Walk cycle, run cycle |
| 3 | Jump, fall, ground landing, vertical climb |
| 4 | Horizontal vine crossing, inverted branch crawl, vine swing arc |
| 5 | Light attack, heavy finisher, kick/throw, object interactions (pickup, carry, pull, push) |
| 6 | Hit recoil, knockback, ground tumble, defeat collapse |
| 7 | Ground slide, dodge roll, ledge hang, ledge pull-up |
| 8 | Victory celebration, anger tantrum, happiness/relief, stun/dizzy |
| 9 | Behind-the-back: rear walk/run, directional banking/leans, hill butt-slide, rear jump/vault |
| 10 | Cutscene acting: sneaking/discovery, urgency/warning, sadness/exhaustion, determination/resolve |
| 11 | Dialogue faces: mouth talking visemes, reactions, intense emotions, comedic emotes |
| 12 | Cinematic vignettes: level entry drop, level exit wave, menu/title idle, cutscene trap transitions |

Slomatt has all twelve (`slomatt/standard-set/`). Two extras: `09_back-views.jpg` is the first draft of the behind-the-back sheet (kept; its strap is mostly right, see NOTES.md) and `12b_gestures-and-reactions.jpg` is a sheet of standing gestures (wave, points, hands on hips, shock, scratching his head) that fits none of the twelve subjects. The in-game "New hero set (test)" is built from sheets 1-8; sheet 9 is kept for a downhill-slide stage and 10-12 for cutscenes and dialogue.
