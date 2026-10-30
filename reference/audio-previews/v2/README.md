# Music previews, v2 (2026-10-29)

Your direction: "write more musics for levels and keep them smaller by looping. Keeping the music constantly changes varies it as needed",
and a different main instrument for each world. Rendered the way a phone plays them, straight from the game's music engine.

## What changed from v1

- **Every stage has 2-3 tunes of its own**, all in its world's key, mode and instruments, so two stages of the same world sound different.
- **Each tune is cut into 8-bar chunks**: the tune (A), its answer (B), a variation, a new section (C), a bridge, a quiet passage.
- **The game strings the chunks together as it goes, never in the same order.** Nothing you heard in the last two minutes comes back.
  A tune's answer usually follows it, and after a quiet passage or a bridge a tune comes home. The danger, dark, exit, puzzle and boss
  layers still switch on the bar line.
- **Each world has its own lead instrument** (the lead's list; swap any you don't like):

| world | lead | colour |
|---|---|---|
| 1 Emerald Canopy | flute | marimba |
| 2 River | clarinet | harp ripples |
| 3 Night grotto | harp | glockenspiel sparkle, low cellos |
| 4 Falls and cliffs | horn | flute on the countermelody |
| 5 Orchid and silk | oboe | pizzicato strings |
| 6 Mangrove | bassoon | plucked double basses |
| 7 Ruins | cello | marimba and a gong every four bars |
| 8 Moonlit treetops | violins | glockenspiel |
| 9 Volcano march | trombone | tuba under it |
| 10 The General's fortress | horn | brass and timpani |

- **Pokey's motif** (the first two bars of his tune) opens one tune in every stage, on that world's lead, in that world's mode.
- The bassoon, cello and trombone are doubled softly an octave up so a phone speaker still carries them. Cut below 300 Hz, as a small
  speaker does, Worlds 6, 7 and 9 lose 2.5-3.1 dB, the same as World 1's flute (2.9 dB).

## The files

**`leads-reel.mp3`** (10 minutes): one minute of each world, 1 to 10, so you can hear the ten leads back to back. World 2 is its 5th stage
(its 4th plays World 2's written tune, which still has its old instruments).

**`two-stages-w5.mp3`** (2 minutes): two stages of World 5 back to back, 5-2 then 5-3. Same world, same oboe, different tunes.
- 5-2: A 0:00, A3 0:17, bridge 0:34, break·3 0:52
- 5-3 (from 1:00): A 1:00, B 1:16, C 1:33, A3 1:50

**`four-minutes-w3.mp3`** (4 minutes): one World 3 stage played for four minutes. It never comes round audibly: the first chunk to come
back is the opening tune, at 2:45, after 10 other chunks. An animal comes near at 1:35-1:52 (the drive
layer) and a dark stretch at 2:50-3:15.
- The order it chose: A 0:00, A·2 0:16, break·2 0:33, A·3 0:49, C 1:05, B2 1:22, break·3 1:38, bridge 1:55, A2·3 2:11, B·3 2:28, A 2:44, A2 3:01, A·3 3:17, A·2 3:34, B·2 3:50

Chunk names: A, B, C are a tune's sections; A2/A3/B2 are variations; "·2" and "·3" are the stage's second and third tunes; "break" is a
quiet passage.

## Size

The new music is written by the game as it plays, so it adds no audio files: the only new download is code, a few KB.

## The Hugging Face pilot (World 3 in 10-second chunks)

It's generated (see `HF-LOG.md`), but this environment can't reach huggingface.co to bring the files back. The side-by-side comes as soon as
that host is allowed.
