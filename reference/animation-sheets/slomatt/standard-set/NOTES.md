# Standard set: drawing notes

## The satchel strap (checked on 2026-10-20)

The master is the turnaround on sheet 1. It fixes where the strap goes:

- **From the front** it runs from his left shoulder (screen right) down to the bag on his right hip (screen left): `/`
- **From behind** it is the same strap seen the other way round: from his left shoulder (screen left) down to the bag on his right hip (screen right): `\`

So in any back view the strap must run `\` with the bag on the right of the picture. Checked by eye, frame by frame, at 3x:

| Sheet | Back-view frames with the strap on the wrong diagonal (`/`, bag on the left) |
|---|---|
| `09_behind-the-back.jpg` | 15 of 16: every frame except 9 (the hill butt-slide, which is right) |
| `09_back-views.jpg` (first draft) | 15 and 16 (row 4, last two: the hop with arms out and the arms-wide stand). The other 14 are right, including all four butt-slide frames (9-12) |

How to use a wrong frame without redrawing it: **mirror it**. A back view is nearly symmetrical, so the mirrored picture has the strap on the right diagonal and just leans the other way, which the game wants anyway for steering left and right. The cutter (`scripts/cutStandard.py`) carries this as its `MIRROR` table, and every frame it packs goes through it, so a back view that is added to the atlas later comes out with the strap on the right diagonal. Decided 2026-10-20: mirror, do not redraw. No back view is packed yet.

For the next sheets: ask for the strap to follow this rule on every back view and every seated or sliding frame.

Front, side and three-quarter frames on sheets 1-8 and 10-12 were looked at on the thumbnails only, not frame by frame.

## Walk and run cycles need both legs (found 2026-10-20)

On `02_walk-and-run.jpg`, frames 5-8 repeat frames 1-4 (silhouette overlap 88-96% on the walk and run pairs), so the same leg leads every time and the other never steps: in the game he looks one-legged. A cycle sheet has to show the **opposite leg** in its second half: frames 1-4 right leg forward (contact, down, passing, up), frames 5-8 the same four with the left leg forward. Same rule for any character's walk or run. Neighbouring frames should also be close in pose (the run's neighbours overlapped only 22-60%, which reads as choppy). A new sheet 2 is on the way from Matt.

## Second round (standard-set-v2, 2026-10-20 evening)

Nine sheets drawn after a fix to the sheet generation: 01, 02a and 02b (two takes of walk and run), 03, 04, 05, 06, 13 (swim, dive, glide: the sheet has no title, the name is a reading of it) and 14 (aim, items, wall, air moves: the only captioned sheet). Build the test hero from them with `python3 scripts/cutStandard.py --set v2`; `--set old` rebuilds the first-round atlas.

What was found (full frame-by-frame reference and the redraw requests are in the "Slomatt Animation Sheets: Reference and Audit" doc):

- Better than the first round: heads are in profile on side-on frames (the first round's walk faced the camera).
- Walk and run still repeat: frames 5-8 are the same four poses as 1-4, and 13-16 repeat 9-12, in both takes. The same leg leads every step.
- Standing height differs between sheets (173-202 px, a 17% spread), so the cutter scales each sheet to 200 px (`STAND_REF` in `cutStandard.py`). Draw the next sheets at one standing height.
- The figures are 173-202 px tall against 239 px in the first round, so a little softer in the game.
- White background: the cutter makes enclosed gaps transparent. Sheet 4 draws the rope into the picture; the cutter cuts the long thin lines away. Ask for no rope or vine in the picture.
- The new sheet 3 climb (frames 9-16) stands with arms down every other frame, so the climb still comes from first-round sheet 3.
- Sheet 5 frame 12 is a wide-armed stance, not a kick. Sheet 6 frames 3, 4, 5, 8 are neutral standing poses, so only frames 1 and 2 are real recoils.

### Sheet 15: air attacks, stomp, bounce, mushroom spring (2026-10-20, 18:22)

`15_air-attacks-stomp-bounce-spring.jpg` is the answer to the "AIR MOVES" request. 1024x1024, white background, 16 figures that the cutter finds (the printed captions under each frame are too small to count as figures, so they do not get in the way, but the next request should say "no captions" again). Frames: 1-3 air punch, 4-6 air kick, 7-10 stomp, 11-13 bounce off an enemy, 14-16 mushroom spring. Strap on the right diagonal (`/`, bag at screen left) in all 16. Not yet in the atlas: the game has no frames for these states, so `heroStandard.ts` still shows the ground punch and kick in the air and nothing for the stomp or the spring.

Near-duplicates (silhouette overlap): frames 9 and 11 are 84% the same squat; 1 and 3, and 8 and 10, about 70%. Frames 15 and 16 face the camera rather than showing a profile. Character height is not measurable from a plain standing frame (none on this sheet); head size matches sheet 14, so the cutter should reuse sheet 14's scale (1.159) when this sheet is wired in.

Wired in (2026-10-20, 18:50, test hero only, uncommitted): `cutStandard.py --set v2` now packs 16 frames from sheet 15 (`air_punch_0-2`, `air_kick_0-2`, `stomp_start`, `stomp_plunge`, `stomp_impact`, `stomp_rebound`, `bounce_squash`, `bounce_rise`, `bounce_top`, `spring_squash`, `spring_launch`, `spring_rise`), at sheet 14's scale. The player has two display-only fields, `diving` (down held while falling) and `bounce` (kind and seconds since), set by the engine and read only by `heroStandard.ts`. Atlas 1536x1831, 503 KB (was 409 KB); the playable page builds to 15,927,587 bytes.

## In production (2026-10-20, 19:50)

The standard hero is no longer a test: it is Pokey in the game, the menu switch is gone, and `cutStandard.py` now builds the second-round set (`--set v2`) by default (`--set old` still rebuilds the first-round atlas). `?std=0` turns it off for a debugging session. The older hero (heroSprite.ts) still draws while the atlas loads and for any pose with no standard frame. The orchestra sound effects (`sfxOrch.ts`) stay opt-in, off by default, in the menu.
