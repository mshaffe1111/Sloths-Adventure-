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
- `story/` the eighteen story sheets (2026-10-21) the cutscenes are built from; the game's `src/assets/characters/cels-*.webp` atlases are cut from them (cell by cell, keyed from the grey), see below.
- `jennifur/` her emotion sheets.
- `pokey-swim/` Pokey's World 6 swimming (2026-10-27, generated with the HF pipeline, not yet in the game): cut-out frames of the surface crawl, underwater glide, tread-water idle and first-swim moment, with `meta.json` (frames, size, waterline anchor, fps). Made by `tools/art/w6/swim/`.
  The first-swim moment was redone on 2026-10-28 (strict side view, one face style, on Matt's say-so to replace it if clearly better).
- `flicker/`, `meeca/`, `beetle/`, `butler/`, `runners/`, `caiman/` (2026-10-28, not yet in the game): Matt's Gemini characters animated with
  the HF pipeline from his own cells (motion model clips), plus `crab/` and `piranha/` cut from older clips. Each holds one folder of
  cut-out frames per move and `meta.json` (frames, size, anchor: ground line, a flier's middle or the waterline, fps, loop or one-shot).
  Made by `tools/art/anim/`.
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


## The story sheets (2026-10-21)

Eighteen 4x4 sheets on flat grey, each a different cast member or mood; the originals are in `story/` (byte for byte, never renamed). The game uses 278 of the 288 cells, cut and keyed by script into three atlases (`src/assets/characters/cels-pokey.webp`, `cels-pair.webp`, `cels-folk.webp`; frame table in `src/game/storyCelData.ts`, runtime and the cast codes in `src/game/storyCels.ts`).

**Who is who (Matt, 2026-10-21): the pink headband and #07 vest is MEECA, the satchel and wrist wraps are POKEY.** Six sheet files are named the other way round: `01`-`04`, `13`, `14` say "pokey" but are Meeca, and `10`-`12` say "meeca" but are Pokey. The files keep their names; the cast codes follow the truth: `MS` Meeca's story poses (faces sheet excluded), `MF` Meeca's face busts (`MF:grin`, `MF:fret+weary` to change expression), `PN` Pokey (satchel), `PV` the cub (pink bow, satchel strap; the story sheet 11 is a cub sheet, not a grown Pokey), `PX` Pokey with his wrist wraps and the petal; `GR` Grandma, `LP` Lieutenant Pell, `TC` the town crier, `PO` the mail carrier, `GN` the General (armor cracking to a grey tunic), `GV` the General in a paler grey tunic, `GY` the General younger, `PA`/`PB` the two together (two passes), `PH` the two hugging.

| Sheet | What it is | Code | Used for |
|---|---|---|---|
| 1 | sixteen face busts (pink headband: Meeca) | `MF:` | the tower singing (World 10 midpoint) |
| 2, 3, 4 | emotion, action and music-box/lullaby poses (Meeca) | `MS:` | the tower and the letter's window and chair (World 1 midpoint) |
| 13, 14 | shut in a room: chair, window, pacing, keyhole, carving the wall, writing (Meeca, in the tower) | `MS:` | not all staged yet |
| 10, 11, 12 | the satchel sloth: plain, with the bow, wrist-wrapped with the petal (Pokey) | `PN:` `PV:` `PX:` | reading Meeca's note, the photograph, the petal's glow |
| 7, 8, 9 | the two together (two passes), and hugging | `PA:` `PB:` `PH:` | the promise, the end |
| 6 | the General, armor cracking, off, to a tunic | `GN:` | the mercy, the blessing |
| 5 | the General in a paler tunic, grief, the letter | `GV:` | the letter |
| 16 | the General younger, in a tan shirt | `GY:` | the blessing flashback |
| 15 | Grandma | `GR:` | the garden, the blessing, the music box |
| 17 | Lieutenant Pell | `LP:` | both lieutenant scenes, the epilogue |
| 18 | the town crier, the mail carrier | `TC:` `PO:` | the Riverbank, the epilogue |

Known mismatches (Matt: fine for flashbacks and "not all the same day"): the General is a mandrill here, but a sloth warlord in the in-game boss art and in some of the story text; sheet 5's General is paler than 6 and 16; sheets 13 and 14 overlap, the best of each is kept.
