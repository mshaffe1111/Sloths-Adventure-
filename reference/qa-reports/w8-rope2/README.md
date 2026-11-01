# w8-rope2: 8-2's rope blooms, fair on Normal (2026-11-01)

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

## First-timer bot (8-2, after)

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
