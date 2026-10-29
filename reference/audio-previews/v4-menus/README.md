# Title and menu music, v4 (2026-10-29)

You asked for start-screen and menu music that is "bold and unique". This is the game's own signature, not any world's style: Pokey's
tune is the big hook, with a strutting groove under it (the Donkey Kong Country side) and a singing string section (the Ori side).

## The files

- **`title.mp3`** (90 s): the start screen, the full statement. The whole piece runs about 70 s at 140 bpm (no world plays that fast),
  then starts again, and the file plays into the second time round.
  - **0:00** a strutting intro: kick, snare, congas, a bass that swaggers, brass punches.
  - **0:07** the hook: Pokey's tune on horns, with the violins two octaves above them.
  - **0:21** the warm part: the drums step back, the cellos sing a new melody with the violins over them.
  - **0:34** the hook again, bigger: choir, flute on top, a glockenspiel glint.
  - **0:48** the breakdown: the marimba plays the motif over the drums alone.
  - **0:55** the hook to close, fullest of all, then round again.
- **`menu-loop.mp3`** (2 min): the journal, badges and library. The same tune and key, lighter: the marimba has the tune, the flute sings
  the warm melody, a harp, soft hand drums. It's cut into chunks the game strings together in a new order each time, so it doesn't tire
  however long you sit there. In this file: the hook, the hook varied, a quiet countermelody section, the warm melody, the warm melody
  varied, a near-silent passage.
- **`map-walk.mp3`** (80 s): the World Map, moving across four worlds. The same light music, with the tune handed to each world's own
  lead as you go: World 1's flute (0:00), World 3's harp (0:20), World 7's cello (0:40), World 9's trombone (1:00).
- **`old-title.mp3`** (40 s): today's title music (World 1's tune), for comparison.

The pause menu keeps the stage's own music, quieter and muffled (that was fixed in the other branch, SN-6).

## The numbers

Measured the same way as the v3 worlds (tempo, brightness, rhythm density, low end, percussion), on one scale with all ten worlds:

| | nearest world | its distance | median distance to the ten worlds |
|---|---|---|---|
| new title | 9 Volcano | 1.98 | 3.52 |
| old title (World 1's tune) | 9 Volcano | 1.46 | 2.72 |
| menu loop | 6 Mangrove | 1.56 | 2.41 |

Two worlds sit 3.03 apart on average, so the new title is further from every world than the worlds are from each other. The menu loop is
3.93 from the title: related (same tune, same key) but a different, quieter thing.

My first version of the title sat at 112 bpm and measured only 0.71 from World 5. It moved to 140 bpm with heavier drums and a brighter top
until it stood apart.

Loudness: title -10.5 LUFS (bold on purpose: about 2 dB over a stage), menu loop -15.3, map -13.3. Peaks: -2.3 dBFS and lower.
