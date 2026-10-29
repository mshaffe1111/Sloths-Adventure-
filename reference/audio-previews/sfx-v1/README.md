# Sound effects v1: real sounds instead of synth pings (for Matt)

**What this is.** You said the effects are "pings everywhere... like pinball", the falling rocks worst of all. This folder has the
first old-versus-new pairs of a whole new effect set. Every new sound is a real recording (people recorded footsteps, stones, water,
wood and wings and gave the recordings away free, no strings: the CC0 licence), cut up, layered and tuned for the game. Nothing is
wired into the game yet. You listen first; only after your OK does it go in, and then the old synth effects are deleted.

**How to listen.** Each pair is two files: `-old` is what the game plays now, `-new` is the replacement. Both are played through the
game's own sound chain, the way a phone plays them. Headphones or the phone speaker both work; try the phone speaker too, since that's
where the pings were worst.

## Batch 1 (sent first)

| Pair | What you hear | What changed |
|---|---|---|
| `rock-single` | one rock landing | Old: a ringing "ping" thud with a bell on top. New: a low stone thud, a dry crunch, and a little grit trickling after. No ring at all. The new one also has a quiet trickle of grit 0.3 s before it lands (a warning you can hear, not only see). |
| `rock-burst` | four rocks inside 0.7 s | Old: the pings pile up into a chord. New: four different stone takes, never the same twice, and if more than three land at once the extras are dropped. |
| `petal-trail` | twelve petals picked up at a run | Old: bright bell notes climbing a ladder, ringing up to 10 kHz (the pinball). New: a soft, warm note (a wooden marimba tap over a muted bell tone, its bright top cut away) on eight different notes that wander instead of climbing, a little quieter, with a breath of leaves under each. |
| `steps-moss` / `steps-wood` / `steps-stone` | ten steps at a walk | Old: one footstep for every surface. New: real footsteps, a soft pad on moss, a hollow knock on wood, a dry tap on stone, eight takes each so a walk never repeats. (Water steps are built too and come in the next batch.) |
| `mix-4-4` | 30 s of 4-4, everything at once | The same 30 seconds of play (a bot's run of 4-4, plus the rocks the stage really drops where you pass them), old and new. Biggest change besides the rocks: 4-4's wind chimes used to borrow the vine-grab sound (the loudest effect in the game) and rang up to every 0.6 s. Now they're a soft hollow wooden clatter on a breath of wind, at most every 1.4 s. The world's background sound is still the old one in both, so only the effects differ; the new real-recording backgrounds come in batch 2. |

## The numbers (for the lead, who can't listen)

All measured on the files here (tools/audio/sfxv1/measure.py):

- **pitched**: how much of the sound is ringing notes (0 = none, 1 = all). Pings are 0.7 and up.
- **hf6k**: share of the energy above 6 kHz, in %. That top end is the glitter that reads as a ping on a phone.
- **flatness**: noise-like (high) vs tone-like (near 0).
- **peak**: dBFS. **lufs**: loudness.

| Pair | pitched old → new | hf6k % old → new | centroid Hz old → new | LUFS old → new | peak old → new |
|---|---|---|---|---|---|
| rock-single | 0.81 → 0.00 | 3.45 → 0.28 | 573 → 780 | −16.1 → −20.7 | 0.0 → −8.1 |
| rock-burst | 0.32 → 0.07 | 0.67 → 0.28 | 479 → 649 | −11.5 → −17.4 | 0.0 → −4.6 |
| petal-trail | 0.89 → 0.77 | 5.11 → 0.00 | 2188 → 693 | −9.0 → −13.4 | −0.2 → −4.3 |
| steps-moss | 0.00 → 0.00 | 1.75 → 0.31 | 760 → 861 | −18.5 → −17.4 | 0.0 → 0.0 |
| steps-wood | 0.01 → 0.02 | 2.04 → 0.30 | 845 → 838 | −18.1 → −18.1 | 0.0 → 0.0 |
| steps-stone | 0.00 → 0.03 | 1.71 → 0.50 | 756 → 1389 | −18.4 → −19.0 | 0.0 → −0.1 |
| mix-4-4, effects only | 0.83 → 0.17 | 0.34 → 0.55 | 913 → 1008 | −6.7 → −14.3 | 0.0 → 0.0 |

The petals stay "pitched" on purpose: they're a reward, so they're the one thing allowed to be a note. They're now warm (centroid
~690 Hz instead of ~2200) with nothing above 6 kHz. Plays per minute in the 4-4 mix: old 272, new 256. The wind chime alone went from
48 a minute in this run to 22, and it's no longer a bell.

numbers.json has every figure for every file, including the 4-4 mix with its background sound.

## What's honest to know

- **The game's own sound chain pushes peaks to 0 dBFS**, old and new alike: every footstep pair peaks at 0.0 after the chain's
  compressor and soft clipper. The new files themselves peak at −1 dBFS or under. The chain is shared with the music, so that's for
  the music helper (polish-audio) and the lead, not changed here.
- **Most source recordings stop at about 8 kHz** (they come from a 16 kHz archive). That suits a dull, non-pinging top, but rustles
  and splashes have a little less air than a full-band recording would.
- **The 4-4 mix comes from a bot's run.** It jumps and swings more than a person; a third of its punches were kept.
- **Levels**: each new sound is set to where the loudness plan (SN-2) put the old one it replaces. Three exceptions: the rock is
  3 dB under the old hit, the petals 3 dB under the old flower, and the vine grab doesn't copy the old one, which plays at −7 LUFS
  (the loudest effect in the game, louder than the checkpoint).
