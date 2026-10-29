# Music and sound previews, v1 (2026-10-29)

These are rendered straight from the game's own music engine (the same composer, orchestra recordings and effects the game plays), the way a
phone plays them (the lighter arrangement and the small room). Nothing here is in the game yet: they're for you to listen to and say yes, no,
or change this. Headphones or a phone speaker both work; the phone speaker is the real test.

Each `before/` file is today's game. Each `after/` file is the same stage, same seed, with the new music and sounds.

## 1. One piece per world (`world1.mp3` ... `world10.mp3`, 90 s each)

What changed: a stage used to play one 16-bar tune (about 35 seconds) round and round. Now the tune is built out into a whole piece:
the tune (A), its answer (B), the tune varied (A2, A3: new notes filling the long ones, a new rhythm, a new second half), a new C section
with its own chords on another instrument, a bridge that climbs, and a quiet passage where the drums and bass drop out and the tune is
only hinted at, before it comes back. A full piece runs 2 to 3 minutes before anything repeats, and every stage gets its own order. Each
world keeps its key, its mode and its instruments, so World 3 still sounds like World 3 in every stage.

The music also follows the game now. In every `after` file at the same moments:

| when | what the game is doing | what to listen for |
|---|---|---|
| start | exploring | the tune, calm |
| about 0:30 for 13 s | an animal close (danger) | a string ostinato, timpani pulse and snare come in on the bar line, then fade out when it's gone |
| about 0:45 to 1:16 | a dark stretch / underground | thinner and lower: the high figures leave, the chords drop, the top end closes |
| 1:16 to the end | near the exit | lifted: the top opens, a glockenspiel and harp figure, violins on the tune an octave up |

Sections in each `after` file (minutes:seconds; the instrument is who takes the tune there):

| file | key | sections |
|---|---|---|
| world1 | F major, clarinet | A 0:00, B 0:16, A3 0:32, quiet passage 0:48, C (oboe) 1:05, bridge 1:21 |
| world2 | D major, flute (stage 2-5: 2-4 plays World 2's written tune, which is laid out as a form too) | A 0:00, A2 (oboe) 0:16, B 0:31, C (clarinet) 0:47, quiet passage 1:03, A3 1:19 |
| world3 | D minor, clarinet | A 0:00, A2 (oboe) 0:16, B 0:33, C (oboe) 0:49, quiet passage 1:06, A3 1:22 |
| world4 | A dorian, cello | A 0:00, B 0:16, A3 0:33, quiet passage 0:49, C 1:06, bridge 1:22 |
| world5 | G minor, clarinet | A 0:00, C (oboe) 0:16, A2 (oboe) 0:33, B 0:49, quiet passage 1:05, bridge 1:22 |
| world6 | G dorian, clarinet | A 0:00, A2 (oboe) 0:17, B 0:34, C (oboe) 0:51, quiet passage 1:08, A3 1:25 |
| world7 | D phrygian, clarinet | A 0:00, A2 0:16, B 0:33, C (oboe) 0:50, quiet passage 1:07, A3 1:24 |
| world8 | A lydian, violins | A 0:00, B 0:16, A2 0:32, C 0:48, bridge 1:04, A3 1:20 |
| world9 | G harmonic minor, oboe (the Iron March) | A 0:00, C (clarinet) 0:14, A2 (clarinet) 0:29, B 0:43, quiet passage 0:57, bridge 1:12, A3 1:26 |
| world10 | C harmonic minor, horn (the Iron March) | A 0:00, B 0:15, C (cello) 0:29, A2 (cello) 0:44, bridge 0:59, quiet passage 1:14, A3 1:29 |

The `before` files show the old loop: by 0:35 you're hearing the same 16 bars again.

## 2. A boss fight that builds (`boss.mp3`, 80 s, World 5's boss)

Phase 1 from the start; phase 2 at 0:26 (a cymbal and taiko hit marks it, the drive layer joins, a touch faster); phase 3 at 0:52 (another
hit, taiko drums and brass on top, faster again). Before: the same piece just got a little faster, and at 0:52 it happened to drop into its
quiet breakdown right as the last phase began (listen at 0:53 in `before/boss.mp3`). A fight past its first phase now never breaks down.

## 3. The new sounds (`effects.mp3`, 64 s, over quiet World 1 music)

| time | before | after |
|---|---|---|
| 0:02, 0:03, 0:04 | a small hop (silent), a medium and a big landing | every landing has a sound, soft for a hop, heavier for a long drop |
| 0:07 to 0:12 | falling in water: a whoosh and a punch | three splashes: a full plunge, a body-sized one, a small dip |
| 0:14 | coming back after losing a life: silent | a soft pop and two notes in the music's key |
| 0:17 | checkpoint: bells, a marimba and a high hiss | a checkpoint stinger: a second long, bright, on the kalimba and soft bells in the music's key, on its beat |
| 0:21, 0:24, 0:28 | (none) | stingers for a first discovery, a secret found, and a last heart |
| 0:32 | boss appears: a sting in its own key | the boss's roar, then a low marimba and drum sting in the music's key (this is also the boss intro card's sound) |
| 0:36 to 0:55 | puzzle actions: the whoosh six times, the hurt sound, the checkpoint sound | the music drops to its quiet puzzle bed; then the twelve puzzle sounds: pick up, set down, a vine wrapping, reset, press, lift, gate, lever, throw, chime, shift, solved |
| 0:57, 0:59, 1:00 | extra life, menu confirm, menu back | the same sounds: they exist but nothing in the game plays them yet; they get wired in with the rest |

## 4. Each effect over its own stage's music, old then new (`after/effects-w1.mp3`, `effects-w4.mp3`, `effects-w9.mp3`, 70 s each)

You turned the orchestral effects off for good, so every new sound and stinger here is in the classic family you play with: kalimba,
marimba, soft bells and wood, tuned to the key of the music under it and softened so nothing pings. The checkpoint's 6.5 kHz hiss is gone.
Each pair plays the old classic sound, then 2 seconds later the new one, over World 1 (F major), World 4 (A dorian) and World 9 (the Iron
March), so you can hear how each one sits in that world's music. Where the old game had nothing (a small hop, coming back after a life,
a first discovery), you'll hear silence and then the new sound.

| old | moment | new |
|---|---|---|
| 0:03 | checkpoint | 0:05 |
| 0:08 | falling in water | 0:10 |
| 0:13 | a small hop landing | 0:15 |
| 0:18 | respawn | 0:20 |
| 0:23 | first discovery | 0:25 |
| 0:28 | secret found | 0:30 |
| 0:33 | last heart | 0:35 |
| 0:38 | boss appears | 0:40 |
| 0:43 | puzzle: a vine wraps | 0:45 |
| 0:48 | puzzle: reset | 0:50 |
| 0:53 | puzzle: lever | 0:55 |
| 0:58 | puzzle: press | 1:00 |
| 1:03 | puzzle: solved | 1:05 |

## Also changed, heard everywhere

- **Held notes no longer pump.** Many of the orchestra's held notes jumped up to 7 dB in level every 1.8 seconds where their recording
  loops. Every one was re-cut from the original recordings so the loop is a whole number of the note's own vibrations long and level at both
  ends: all 115 now match within about 1 dB (the worst is 1.16 dB), and the loop point is no different from the middle of the note.
- **The world sounds sit at one level.** The background sound of each world (river, birds, crickets, storm) ran from -32 to -21 LUFS, so
  the waterfall and the storm drowned the music and the crickets vanished; all ten now sit at about -28. Each now loops over 8 seconds
  instead of 2.5, so a rush of water doesn't repeat audibly.
- I couldn't reach any recorded nature sounds from here (Kenney, Freesound and Sonniss are all blocked on this network), so the world
  sounds are still made by the game itself, now levelled and longer. Recorded beds can be dropped in later.

## For the lead: what it costs a phone

Measured in Chromium with a phone's user agent (so the game takes its phone path: lighter arrangement, light room) and the CPU slowed 4x,
before (this branch's base, ea26d07) against after, on the same pieces (stage 2-4 with `?music=1111/2222/3333` pinning the tune), runs
alternated, 60 s each (`tools/audio/perf.mjs`). CPU is the renderer's CPU-seconds per second (game and sound together).

| | before | after |
|---|---|---|
| in the stage, calm (no state changes) | 1.335 CPU, 768 MB peak | 1.340 CPU, 773 MB peak |
| in the stage, danger / dark / exit cycling every 10 s, plus a stinger | 1.337 CPU, 774 MB peak | 1.382 CPU, 785 MB peak |
| the music engine alone (5-4), layers cycling | 1.022 CPU, 215 MB | 1.013 CPU, 220 MB |
| sound lost (the game's own report, every run) | silent 0% | silent 0% |

Run-to-run noise is about ±3% on CPU and ±20 MB on peak memory. Calm play costs the same as today. While a layer is up, the in-game CPU
reads about 3% higher (the engine-alone runs don't show it). Memory is level within the noise; about 1.4 MB of it is the longer
world-sound noise. To get there: a layer replaces what it answers (the drive's ostinato stands in for the piece's own figures, the exit's
high doubling for the countermelody), and the form, the layers, the stingers and the new effects only ever play instruments the piece has
already loaded. The first version fetched up to ten extra instruments (about 28 MB on a phone) and was cut back before these numbers.
