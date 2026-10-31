# Pokey's moves, smoother (AN-13 and the double jump), 2026-10-30 night

Branch `pokey-anim`. Hero files only; **engine.ts is untouched, and no engine patch is needed**: every new move is read from the
player's state inside the hero's drawing (`heroEvents.ts`), so the physics never waits on the animation.

## What changed

| Move | Before | After | Art |
|---|---|---|---|
| Turn on the ground | instant flip | 90 ms: his front view, squeezed to 55% across and opening out, then his new side view settling (88% to 100%) | Matt's turnaround sheet (first round, frame 1) |
| Skid (reversing from 160 px/s or more) | none: the run frames just flip | his braced lean-back pose for at least 100 ms facing the way he slides, two small dust puffs drifting off his feet, then the turn | Matt's slide sheet (first round, frame 1); the game's painted dust |
| Run start | none | a 0.16 rad forward lean for 60 ms, easing out by 100 ms (rides on the video run too) | code |
| Landing | one crouch frame; the hardest drop popped into the rolled-up somersault ball | land then recover; the hardest drop squashes deep, lands, recovers (3 frames) | his painted `spring_squash`, `land`, `recover` |
| Duck | instant pop | two frames of his half crouch going down and coming back up | his painted `recover` |
| Jump | 6 painted frames (launch, rise, apex, fall a/b) | his painted take-off stretch while rising faster than 580 px/s, then 10 frames from a Wan clip of his standard pose, picked by his vertical speed (the game's existing `move-jump` slot, which had never been filled; the clip's take-off frames 9-11 turned him to the camera, so they are out) | `src/assets/hero/clips/move-jump.webp` |
| Climb (trunk) | 8 painted frames, one per 12 px climbed | 21 frames from a Wan clip: one full hand-over-hand cycle, hugging the trunk (the `move-climb` slot, never filled). Climbing down plays it backward (the climb-down clip hardly moved) | `src/assets/hero/clips/move-climb.webp` |
| Walk (only while speeding up or slowing down, and in the sleepy fog) | 8 painted | 17 frames from a Wan clip, a seamless loop (the `move-walk` slot, never filled) | `src/assets/hero/clips/move-walk.webp`, `walk-sheet.jpg` |
| Jab | wind-up, full reach (3), then a pose twisted toward the camera, then idle | the way back passes through its own wind-up pose (arm drawn in, the same stance) | the jab's own sheet, reordered (heroClips MOVE_ORDER) |
| Double jump | one tucked frame spun 360 degrees by code | his painted roll: curled, his forward somersault, upside down, curled, opening out; code only turns the leftover (at most ~80 degrees) | Matt's v14 tuck and somersault, first-round slide sheet frame 6 |

The run was already a 15-frame video cycle (`move-run`), so it is unchanged and the footsteps keep their keys (RUN_FOOTFALLS 4, 9, 13).

## Steering unchanged (the proof)

`tools/art/pokeyanim/rec.mjs` drives the same key presses (turn, run, reverse at a run, a 560 px drop, a held jump and its flip) on
the base build (1841b38) and on this branch, one engine step of 1/30 s per frame, and logs x, y, vx, vy, facing and grounded every
frame. `trace-before-*.json` and `trace-after-*.json` are **byte-identical**, sideways and upright. `SCENE=climb STAGE=1-5 LAYOUT=1`
(up the trunk and back down) and `SCENE=punch` (the three-punch combo, then a jab on the run) give identical traces too.

## Media

- `moves-side-before-after.mp4` (stacked), `moves-up-before-after.mp4` (side by side): the whole run at 30 fps; `moves-climb-*-before-after.mp4` the climb.
- `<move>-side.jpg`, `<move>-up.jpg`: every frame of the turn, the run start, the skid, the hard landing and the double jump, before above, after below.
- `climb-side.jpg`, `climb-up.jpg`: the climb on 1-5, up and back down, before above, after below.
- `jab-side.jpg`: the jab before and after; `punch-way-back.jpg`: the jab and hook sheets in their old and new order.
- `flip-before-after.jpg`: the flip on a plain ground, old and new.
- `new-painted-frames.png`, `jump-sheet.jpg`: the new frames at game scale.

## Polish check

- Turn: the first try squeezed to 15% across; at 30 fps that frame is held whole and showed as a sliver of him (broken-looking).
  Now 55%: `turn-side.jpg`, `turn-up.jpg`.
- Skid dust: the first try read as tan stones lying on the path. Now small, soft and lifting as it fades: `skid-side.jpg`.
- Jump sheet: clip frame 8 smeared his face and 22 blurred his paws; both left out: `jump-sheet.jpg`.
- The skid frame holds 3 frames; the engine's own reversal is only 2 (it takes 160 px/s off in one frame), so the skid keys off the speed of the frame before.

## Hugging Face (log: `tools/art/pokeyanim/jobs.txt`)

One job, `pokey-anim1` (6ae5407cc78863f9c62ee1cf), 35 min of rtx-pro-6000, about **$1.61**. Eight Wan clips from his standard frames
(`starts/`). Used: the jump (seed 11). Thrown: the jump seed 3 (turns to face the camera), both flips (Wan cannot roll him: a faceless
ball, or a tilt and a T-pose). Not needed: the runs (the game already has a 15-frame video run), the skid (Matt's painted pose is better).
On file for later: a clean belly-dive slide (`pa-slide-s3`), nothing uses it yet.

## Tried and thrown tonight (round 2, the lead's 9:30 list)

- Climb down: the Wan climb-down clip hardly moved; climbing down plays the new climb backward.
- Rope: both Wan clips with no rope in the picture lost what his paws hold (waving, turning his back). The rope keeps Matt's 7 cells.
  Next: a start with the game's rope drawn in and cut back out (tools/art/rope/cutclip.py does that), or Qwen-Edit in-betweens.
- Punch: four Wan punches; s3 striped his wraps red, s5 and s11 lost his face, s7 turned his back (the cross and hook face us). Kept
  the punch sheets; only the jab's way back changed (above). Kicks were already clean (10 + 10 video frames).

## Not done

- The 7-4 slide pose: 7-4's slide is other helpers' files tonight.
- A turn in the air stays instant (a front view mid-jump would fight the jump frames).
