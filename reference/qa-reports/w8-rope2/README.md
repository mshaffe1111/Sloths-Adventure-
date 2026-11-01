# w8-rope2: 8-2's rope blooms, the sealed door and the fungus steps, fair on Normal (2026-11-01)

Layout 1 (a rope roll), its first rope, in the real game: `node tools/art/rope/rec-82.mjs <port> <dir> 1 0` on a dev-hooks build.
Two flicks each way: `edge` (the flick at the bough's end) and `early` (150 px short of the end, the first-timer's miss before this
branch). Stills: 1 the flick, 2 the grab, 3 the crossing, 4 landed. Clips: the last 8 s of each run (the run-up, the grab, hand over
hand across, the let-go onto the far bough).

## What was wrong, and the fix

- The grab itself was always forgiving: 94 of 96 thumbs catch every rope (`tools/inspect/ropeProbe.ts`).
- Every first-timer heart fall at a rope was one case (`tools/inspect/ropeTrace.ts`): an early flick tops out short of the rope's end,
  and his hands fell back through the rope (the engine caught a falling Pokey only with Up held). A rope over a gap is now caught
  falling too.
- The bloom under each rope could not be picked up while hanging (reach measured from his feet); now from his middle.
- A rope caught past its end slid him 30-40 px in one frame; now 3 frames.

## First-timer bot (8-2, round 1: after the rope fix, before the bloom-height and fungus fixes)

| layout | rope roll | Easy | Normal, trial 0 / 1 / 2 (blooms of 94; lives) |
|---|---|---|---|
| 1 | yes | shrine | shrine 99 (2), shrine 98 (0), shrine 96 (1) |
| 2 | no (fungus steps) | shrine | shrine 95 (5), shrine 96 (15), sealed door 88 (15) |
| 3 | no (high blooms) | shrine | shrine 94 (0), sealed door 92 (0), sealed door 93 (3) |
| 5 | yes | shrine | shrine 103 (2), 98 (2), 94 (3) |
| 6 | yes | shrine | shrine 100 (1), 99 (1), 96 (1) |
| 7 | yes | shrine | shrine 96 (3), 97 (2), 96 (4) |
| 8 | yes | shrine | shrine 104 (0), 97 (0), 104 (1) |
| 9 | yes | shrine | shrine 99 (0), 102 (0), sealed door 93 (1) |
| 10 | yes | shrine | sealed door 89 (1), sealed door 92 (1), shrine 95 (1) |
| 11 | yes | shrine | shrine 94 (1), 96 (1), 98 (0) |

Heart falls at a rope: 0 in every run (was 6 on layout 1 alone: ropes 3 and 14, three each). No timeouts. The blooms still missed on
Normal are on low knots the bot's flick carries him over (43 px over the bloom, reach 34), not at the ropes; the shipped pre-rope 8-2
misses the same way (seeds 1-3: 91, 85, 88 of 94). Layout 2's lives are the fungus steps' 60 px pits, not a rope.

## Round 2 (the lead's 12:15 PM review)

- **The catch, narrowed:** a falling Pokey is caught only by a required rope whose own ledge he last stood on (game-wide it caught him on
  lower ropes in 1-4/2-6/3-4/4-1's climbs). Those stages' first-timer runs are back in release-0.9.2's noise.
- **The grab, frame by frame:** `8-2-grab-slide-{sideways,upright}{,-quarter-speed}.mp4` (engine stepped at 30 fps; the frame logs beside
  them), and `8-2-grab-slide-sideways-frames-11-18.jpg`: he rises hands-up, catches the rope beside its post and slides onto it.
- **The sealed door:** World 8's harvest blooms on a bough float at 52 px (his head), not 34 (his middle): every natural hop passed 16-35
  px over them. A walker still takes them.
- **The fungus steps:** each step stands on a bough trunk (`8-2-fungus-stair-{sideways,upright}.jpg`: the plank lies flush on its trunk's
  moss, nothing floats); a stair's foot is wide enough to land a running jump off the top, with a knot past it
  (`8-2-fungus-foot-{sideways,upright}.jpg`).

### First-timer, final build (`bots-final.txt`: 8-2 layouts 1-16, Normal and Easy; 8-5's fungus layouts)

| 8-2 theme (layouts) | Easy | Normal (lives a run) |
|---|---|---|
| ropes (1, 5-8, 10, 12, 13) | shrine, all | shrine, all; 0-3 |
| fungus steps (2, 11) | shrine | shrine, all 6 runs; 1, 1, 3 / 8, 3, 7 (before the fungus fix: 5, 15, 15) |
| high blooms (3) | shrine | shrine; 0 |
| gap blooms (4, 9) | shrine | 16 (shrine), 15 (sealed door 91/94) |
| roost blooms (14-16) | shrine | 10, 18, 17 (shrine) |

8-5's fungus layouts (2, 6): Easy shrine; Normal 3 and 6 lives (release-0.9.2: 8 and 8), its 18-19 heart falls are its swings and glides.

**Not fixed, named:** 8-2's gap and roost themes on Normal lose 10-18 lives at their wide gaps over deep pits: the first-timer flicks a
single jump first and doubles only after dying there. release-0.9.2's own roost rolls lose 10 each (two tried; no gap roll tried), and 3 of the 4 release-0.9.2
rolls tried end at the sealed door. It is World 8's lit wide gaps, not the rope or the blooms; next: STAGE-RULES §6's water lesson (no second-jump gaps
over a deadly fall) for World 8's lit gaps, or a soft fall there on Normal.

## Polish check (at phone size)

1. **The rope reads clearly** (pass): a thick painted rope between two lashed posts over the drop, upright and sideways
   (`8-2-rope-sideways-early-2-grab.jpg`, `8-2-rope-upright-early-2-grab.jpg`).
2. **The grab looks like a grab** (pass): both hands on the rope, body hanging under it, the rope giving under his weight
   (`8-2-rope-sideways-edge-2-grab.jpg`, `8-2-rope-upright-edge-1-flick.jpg`); the hand-over-hand creep plays across
   (`8-2-rope-sideways-early.mp4`).
3. **No snaps** (fixed): caught past the rope's end he was set onto it 30-40 px in one frame; now he slides on over 3 frames (largest
   one-frame move at the grab, measured in the real engine over 28 flicks: 18 px across, about two frames of his run, and up to 18 px
   down as his hands settle on the rope, under the grab's squash).
4. **Text out of the way** (named, not fixed: game-wide): sideways, Dot's "Careful! It's a long way down." box sits over the left third
   of the screen while he grabs the first rope, covering the take-off post (`8-2-rope-sideways-early-2-grab.jpg`). The rope and Pokey stay
   clear of it. Upright the stage card covers the sky only (`8-2-rope-upright-edge-1-flick.jpg`; the recorder jumps him to the rope
   seconds after the start, so the card is still up; in play it has gone long before the first rope).
5. **Framing upright** (named): the rope (about 600 px) is wider than an upright screen, so mid-rope the far bough is off screen; the
   rope leads the eye to it.
6. **Nothing floats** (fixed): the fungus steps hung over the void; now each stands on its trunk, the plank flush on the moss
   (`8-2-fungus-stair-sideways.jpg`). Named: only the first step of each stair carries the painted fungus bracket (by design, the 40%
   look cap), so a stair reads as stepped mossy columns more than as fungus.
7. **Blooms at his head** (pass): they float at head height over the bough and read as the same glowing blooms
   (`8-2-fungus-foot-sideways.jpg`).
