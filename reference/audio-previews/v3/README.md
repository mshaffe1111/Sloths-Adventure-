# Music previews, v3 (2026-10-29): a style of its own for every world

You said v1 and v2 sounded "exactly the same... the same loop with a different tempo", and you were right: every world went through one
composer style and one orchestration pass with different settings. v3 gives each world its own style, after your reference (Donkey Kong
Country's genre and groove per world, Ori's emotional orchestra): its own meter and tempo, its own drum and bass patterns, its own
accompaniment, and its own amount of orchestra. The tunes are new and different in every stage, and the music changes outright when
something happens.

| world | style | tempo | lead | what carries it |
|---|---|---|---|---|
| 1 Canopy | bouncy jungle groove | 126-134 | flute | kick, congas, shaker on every sixteenth, plucked bass that skips, marimba ostinato |
| 2 River | lazy calypso lilt (swung) | 94-102 | clarinet | hand-drum 3-3-2, clave, a leaning plucked bass, harp ripples |
| 3 Grotto | cave ambient, 6/8, no drums | 66-74 | harp | slow harp arpeggios, glockenspiel droplets, a low cello drone, lots of room |
| 4 Falls | soaring | 84-92 | horn | strings rolling in sixteenths, held basses, swelling timpani, full orchestra |
| 5 Orchids & silk | sly, creeping, minor | 100-108 | oboe | spidery rim ticks, pizzicato on the off-beats, a tiptoeing bass |
| 6 Mangrove | murky, comic-tense | 86-94 | bassoon | heavy kick and dull off-beat, plucked double bass, grunting horns |
| 7 Ruins | solemn, ancient, free tempo | 64-72 | cello | gong, a slow frame-drum heartbeat, marimba struck low like stone, low winds |
| 8 Treetops | dreamy lullaby, 3/4 | 84-92 | violins | oom-pah-pah harp waltz, a music box turning on top, soft strings |
| 9 Volcano | driving march | 112-120 | trombone | snare, bass drum and timpani on every beat, tuba, brass punches |
| 10 Fortress | grand and dark | 78-84 | horn | taiko and timpani pounding eighths, low brass, cellos hammering |

## The files

- **`leads-reel.mp3`** (10 min): one minute of each world, 1 to 10, back to back.
- **`two-stages-w5.mp3`** (2 min): two World 5 stages back to back: 5-2 (A 0:00, A3 0:18, bridge 0:37, break·3 0:55), then 5-3 from 1:00 (A 1:00, B 1:18, C 1:36, A3 1:54).
- **`three-minutes-w1.mp3`** (3 min): one World 1 stage. **An animal comes near at 0:50-1:10**: about 10% faster, the tune gives way to a
  tense string ostinato, snare, timpani and low brass. **A dark stretch at 1:40-2:05**: the music falls away to a low drone and a lone
  high bell. **The exit from 2:35**: a cymbal and drum hit, then the whole piece swells. The order it chose: A 0:00, B 0:14, B·2 0:28, A2·2 0:43, A3 0:57, A·2 1:12, B2 1:26, C 1:41, bridge 1:55, A2 2:10, break 2:24, A 2:39, B 2:53.
- **`compare-w1.mp3`, `compare-w3.mp3`, `compare-w9.mp3`** (2 min each): **the first minute is the game's own music (v3); after a short
  gap, the second minute is the Hugging Face pilot** (generated recordings in the same style, cut in 10 s chunks and shuffled the same way).
  In both halves an animal comes near at 0:30-0:45 (1:31-1:46 in the second half). Both halves are levelled to the same loudness, so you
  are choosing on sound.

## The numbers (the lead asked me to check by measurement, not just by ear)

**Worlds against each other**: tempo, brightness (spectral centroid), how busy the rhythm is (onsets per second), how much of the sound is
low end and how much is percussion, and the meter, each first minute of the reel, on one scale for all ten:

| | today's game (v1 "before") | v3 |
|---|---|---|
| tempo spread between worlds | 9.6 bpm | 27.5 bpm |
| rhythm-density spread | 0.89 | 1.56 |
| brightness spread | 678 Hz | 414 Hz |
| median distance between two worlds | 2.51 | 3.29 |
| the two closest worlds | 1.15 | 1.44 |

(Brightness spread came out lower: v1 differed mostly in how bright it was, and v3 differs in tempo, meter, groove and texture instead.)
The closest pairs left in v3 are Ruins and Fortress (both slow and dark: cello with gong and frame drum against horns with taiko), Falls and
Treetops, and Grotto and Ruins. If any of those still sound alike to you, they are the first to push apart.

**Two stages of the same world**: they share 45-69% of their short melodic shapes (4-note steps), the same as two different worlds do
(53-60%); a stage against itself is 100%.

**The game's changes, measured in `three-minutes-w1.mp3`**: danger: about 1 dB louder, brighter, the tune gone, tempo up by about 10%. Dark:
brightness halves (1,620 Hz to 860 Hz) and the rhythm thins by a third. Exit: about 2 dB louder.

**Peaks**: nothing goes over -1 dBFS any more (the game's own ceiling); every preview here peaks at -1.2 dBFS or lower.

## Hugging Face pilot: what it would cost

ACE-Step 1.5 (MIT licence, commercial use allowed). Each world: 8 calm and 8 danger chunks of about 10 s, mono, 24 kbps: about 0.4 MB to
download, and about 15 MB of a phone's memory decoded (10 MB at 16 kHz). The game's own music adds no audio files at all. Spent so far:
about $0.19 of the $6 (see `../v1/HF-LOG.md`).

## Not done yet

- World 8's lullaby quote (Meeca's) is written in four and World 8 is in three now: it waits for a version in three.
- The one-in-five early stages that play a world's written tune keep that tune's old instruments.
- The finale ending on World 1's flute is story music: not done.
- Nothing is wired into the game until you've listened.

## Finished for merge (after your OK on v3)

- **`finish-w8-lullaby.mp3`** (45 s): Meeca's lullaby is back in World 8, now sung in 6/8 as she sang it, on the violins over the
  treetops' harp waltz (about two World 8 stages in five open with it).
- **`finish-w1-written.mp3`** (45 s): the one-in-five first-act stages that play their world's written tune now play it in the world's own
  style: here World 1's tune on the flute over the jungle groove. (World 3 is in 6/8 and its written tune in four, so its stages always
  compose their own.)
- **`finish-ending.mp3`** (2.5 min): the ending's last statement of Pokey's tune is now World 1's flute, where it all began.
