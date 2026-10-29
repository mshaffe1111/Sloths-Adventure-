# Sound effects v1: real sounds instead of synth pings (for Matt)

> **On hold (5:50 PM ET):** some sources turned out not to be what their archive captions said (a synth drum, a pint glass, plastic bags). Every effect is being rebuilt from sources checked by their real Freesound titles and tags; these files will be replaced. Don't send them to Matt yet.

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
| `mix-4-4` | 30 s of 4-4, everything at once | The same 30 seconds of play (a bot's run of 4-4, plus the rocks the stage really drops where you pass them), old and new. Biggest change besides the rocks: 4-4's wind chimes used to borrow the vine-grab sound (the loudest effect in the game) and rang up to every 0.6 s. Now they're a soft hollow wooden clatter on a breath of wind, at most every 1.4 s. The new side also has World 4's new recorded background (batch 2); the old side has the old synthesized one. |

## Batch 2

| Pair | What you hear | What changed |
|---|---|---|
| `landing` | a small hop, a jump, a long drop | Old: one landing sound turned up or down. New: three real ones (a soft pad, a thump with leaves, a heavy thump with grit), picked by how far he fell. |
| `vine-grab` | four grabs along a liana chain | Old: a ringing note, the loudest effect in the game. New: a palm slapping bark-wrapped rope, its leaves, and the vine creaking under his weight. |
| `steps-water` | ten steps in shallow water | New: small sloshes, six takes. |
| `creature-hits` | four fights: an ocelot, a snake, a spider, an eagle; two light hits, a heavy one, the knock-out | Old: one shared hit with a bell on top, and synthesized calls. New: every body has its own hit (fur, scales, shell, feathers; stone for the stone and iron bosses), and every creature its own real voice when it's knocked out (a cat's yowl, a snake's hiss, an insect's scurry, a bird's squawk), then a soft fall onto the ground. 12 creatures in all; the preview has four. |
| `boss-slam` | the boss card's name landing (SN-10) | Old: polish-audio's boss arrival (a roar and a brass sting). New: a huge low impact, the card's wood slapping down, and a far roll of thunder. No ring. |
| `bed-w1` ... `bed-w10` | 20 s of each world's background | Old: filtered noise. New: real recordings, one per world: 1 canopy birds over a soft wind, 2 a stream, 3 a cave with drips, 4 a distant waterfall, 5 tropical birds, 6 frogs and a swamp, 7 wind over stone, 8 crickets at dusk, 9 boiling lava and a low rumble, 10 rain, wind and far thunder. Each is a 20 s loop with real one-shots (bird calls, drips, croaks, thunder) scattered at random so it never sounds like a loop. Same loudness as the old ones. |
| `mix-1-2` | 30 s of 1-2, everything at once | The same 30 s of play, old and new, the new side with World 1's new background. |

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
| mix-4-4, effects only | 0.83 → 0.21 | 0.34 → 0.72 | 916 → 1206 | -6.7 → -14.9 | -0.0 → -0.0 |

| landing | 0.08 → 0.05 | 0.15 → 0.04 | 231 → 363 | −22.5 → −25.0 | −0.1 → −7.9 |
| vine-grab | 0.94 → 0.00 | 0.09 → 0.19 | 1084 → 689 | −5.6 → −16.9 | 0.0 → −0.2 |
| steps-water | 0.00 → 0.00 | 2.37 → 0.03 | 913 → 675 | −17.8 → −18.7 | 0.0 → 0.0 |
| creature-hits | 0.49 → 0.14 | 0.75 → 0.20 | 705 → 611 | −11.0 → −12.4 | 0.0 → 0.0 |
| boss-slam | 0.29 → 0.01 | 3.95 → 0.07 | 640 → 596 | −11.3 → −12.1 | −0.3 → −1.4 |
| mix-1-2, effects only | 0.44 → 0.09 | 1.39 → 0.50 | 818 → 1050 | −13.7 → −16.4 | 0.0 → 0.0 |

The beds are matched in loudness to the old ones (within 0.3 LU). Their numbers are in numbers.json; the old beds are mostly low
rumble (centroids 73–435 Hz in five worlds) or bright hiss (Worlds 2, 4 and 10: 24–27% of their energy above 6 kHz). The new ones sit
between. World 5's birds keep 5% above 6 kHz because birdsong lives there.

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
- **Creature voices are real animals from the free archive**, not made for a cartoon: a house cat's yowl stands in for the ocelot, a
  big cat's growl for the jaguar, a pig-like grunt for the caiman's back-up take. If any one doesn't fit, I can make a replacement with
  Stable Audio Open once Matt presses "Agree" on its Hugging Face page (it's gated). One ocelot take is a real meow, so it measures as
  a note; it's a voice, not a ping.
- **Effects still to build** (they don't change the picture, so they come after your OK, before anything's wired in): the pickups
  other than petals (leaf, fruit, heart, super heart, power-ups, relic, 1-up), Pokey's hurt, the tree climb, the menu taps, the
  predator warnings, the 12 puzzle sounds, the mushroom bounce, logs, crumbling stone, thorns and gates. EFFECTS.md lists every
  effect, how often it plays, and what replaces it.
- **Levels**: each new sound is set to where the loudness plan (SN-2) put the old one it replaces. Three exceptions: the rock is
  3 dB under the old hit, the petals 3 dB under the old flower, and the vine grab doesn't copy the old one, which plays at −7 LUFS
  (the loudest effect in the game, louder than the checkpoint).
