# Sound effects v1: real sounds instead of synth pings (for Matt)

> **Now in the game (lead, 7:51 PM ET: "don't wait for his listen... he'll hear them in context on tonight's test link and veto any he
> doesn't like").** The recorded set replaces the old effects outright, no switch. `in-game/` has two clips recorded off the game itself
> while it plays: 30 s of 4-4 with the rocks falling, and 30 s of 1-2 with World 1's new background. A veto is a one-line swap: the
> commit message lists every effect with the real recordings it is made from.

**What this is.** You said the effects are "pings everywhere... like pinball", the falling rocks worst of all, and that the classic set
is crap too. This folder has old-versus-new pairs of a whole new effect set. Every new sound is cut from real recordings that people
made and gave away free with no strings (the CC0 licence; LICENCES.md lists all 147). Each one was picked by what its recordist called
it: "stonehit1", "RockFall1b", "Walk Stone", "Wood Steps", a marimba recorded note by note, "Tiger Growl", "Río Cadí" (a waterfall).
Nothing is wired into the game yet. You listen first; only after your OK does it go in, and then the old synth effects are deleted.

**How to listen.** Each pair is two files: `-old` is what the game plays now, `-new` is the replacement. Both are played through the
game's own sound chain, the way a phone plays them. Try the phone speaker, since that's where the pings were worst.

## The pairs

| Pair | What you hear | What changed |
|---|---|---|
| `rock-single` | one rock landing | Old: a ringing "ping" with a bell on top. New: stone striking stone, a thud, and a little rubble settling after. No ring at all. Just before it lands, a quiet trickle of grit (a warning you can hear, not only see). |
| `rock-burst` | four rocks inside 0.7 s | Old: the pings pile up into a chord. New: four different stone takes, never the same twice; if more than three land at once the extras are dropped. |
| `petal-trail` | twelve petals at a run | Old: bright bells climbing a ladder, ringing up to 10 kHz (the pinball). New: one soft marimba note each (real wood, its bright top cut away), on eight notes that wander instead of climbing, a little quieter, with a breath of leaves. |
| `steps-moss`, `-wood`, `-stone`, `-water` | ten steps at a walk | Old: one footstep for every surface. New: real footsteps for each (forest floor, wooden boards, stone and gravel, shallow water), 6 to 8 takes each so a walk never repeats. |
| `landing` | a small hop, a jump, a long drop | New: a soft pad, a thump with leaves, and a heavy thump with grit, picked by how far he fell. |
| `vine-grab` | four grabs along a liana chain | Old: a ringing note, the loudest effect in the game. New: a hand on rope, its leaves, and the rope creaking under his weight. |
| `creature-hits` | four fights (ocelot, snake, spider, eagle): two light hits, a heavy one, the knock-out | Old: one shared hit with a bell on top. New: every body has its own hit (fur, scales, shell, feathers; stone for the stone and iron bosses), and every creature its own real voice when it's knocked out (a cat's cry, a snake's hiss, a scamper and a twig snap, an eagle's scream), then a soft fall. 12 creatures in all; the preview has four. |
| `boss-slam` | the boss card's name landing | Old: a roar and a brass sting. New: a huge low impact, an axe biting wood, and a far roll of real thunder. No ring. |
| `pickups` | leaf, fruit, heart, super heart, the three power-ups, relic, 1-up, the three stars | Rewards are allowed to be notes, so they are: warm marimba notes, never bells or glass. The big ones (super heart, power-ups, relic, 1-up) get a short rising figure. |
| `menus` | tap, tap, confirm, back, pause, unpause | Wooden knocks and leaf rustles, to match the wooden HUD. |
| `world-things` | what the game plays now for 13 things, then the new sound for each | Today these borrow other effects: a log landing plays Pokey's landing, crumbling stone plays a punch's hit, a gate plays the shrine, a vine wrapping a log plays Pokey getting hurt. New: a mushroom bounce (a soft squash that springs back up, no metal spring), a log, crumbling stone, a thorn bush, a wooden gate, and the puzzle sounds (pick up, drop, wrap, reset, press, lever, throw, stone sliding, solved). |
| `bed-w1` ... `bed-w10` | 20 s of each world's background | Old: filtered noise. New: real places: 1 calm forest birds, 2 a brook, 3 a stone cave with drips, 4 a river and waterfall, 5 parrots in the jungle, 6 a marsh full of frogs, 7 wind in the trees, 8 a jungle at night with crickets, 9 a slow deep boil and a crackle, 10 rain and wind with far thunder. Each is a seamless 20 s loop with real one-shots (bird calls, drips, croaks, thunder) scattered at random so it never sounds like a loop. Same loudness as the old ones. |
| `mix-4-4`, `mix-1-2` | 30 s of each stage, everything at once | The same 30 seconds of play, old and new; the new side with the world's new background. In 4-4, the wind chimes used to borrow the vine-grab sound and rang up to every 0.6 s; now they're hollow sticks knocking on a breath of wind, at most every 1.4 s. |

## The numbers (for the lead, who can't listen)

Measured on the files here (tools/audio/sfxv1/measure.py): **pitched** is the share of the sound that is ringing notes (0 = none, 1 =
all; pings are 0.7 and up); **hf6k** the share of energy above 6 kHz in % (the glitter that reads as a ping on a phone); **centroid**
the brightness; **peak** in dBFS and **LUFS** the loudness. The mixes are measured on the effects alone.

| Pair | pitched old → new | hf6k % old → new | centroid Hz old → new | LUFS old → new | peak old → new |
|---|---|---|---|---|---|
| rock-single | 0.76 → 0.01 | 3.24 → 0.19 | 598 → 2044 | −16.5 → −20.9 | 0.0 → −10.6 |
| rock-burst | 0.32 → 0.01 | 0.81 → 0.27 | 493 → 1229 | −11.5 → −18.3 | 0.0 → −3.7 |
| petal-trail | 0.89 → 0.95 | 5.28 → 0.00 | 2199 → 519 | −9.0 → −13.8 | −0.2 → −4.8 |
| steps-moss | 0.00 → 0.02 | 2.26 → 0.33 | 900 → 610 | −17.7 → −18.0 | 0.0 → −1.0 |
| steps-wood | 0.00 → 0.03 | 1.78 → 0.24 | 758 → 313 | −18.5 → −19.3 | 0.0 → −1.0 |
| steps-stone | 0.00 → 0.00 | 2.25 → 0.48 | 877 → 1729 | −17.9 → −18.3 | 0.0 → −1.0 |
| steps-water | 0.00 → 0.00 | 1.76 → 1.80 | 772 → 2518 | −18.5 → −18.8 | 0.0 → −1.0 |
| landing | 0.00 → 0.00 | 0.14 → 0.06 | 196 → 393 | −23.6 → −22.7 | −0.1 → −4.1 |
| vine-grab | 0.94 → 0.05 | 0.09 → 0.38 | 1082 → 654 | −5.6 → −17.3 | 0.0 → −3.0 |
| creature-hits | 0.48 → 0.06 | 0.72 → 0.28 | 749 → 970 | −11.1 → −13.1 | 0.0 → −1.0 |
| boss-slam | 0.34 → 0.00 | 4.46 → 0.00 | 702 → 70 | −11.4 → −12.4 | −0.4 → −2.3 |
| pickups | 0.95 → 0.93 | 2.67 → 0.12 | 1705 → 539 | −9.9 → −11.6 | 0.0 → −1.0 |
| menus | 0.67 → 0.01 | 8.58 → 2.83 | 2177 → 2378 | −11.7 → −12.0 | 0.0 → −1.0 |
| world-things | 0.77 → 0.10 | 1.25 → 0.30 | 814 → 756 | −10.8 → −19.0 | 0.0 → −1.7 |
| mix-4-4, effects only | 0.83 → 0.17 | 0.37 → 0.24 | 819 → 932 | −7.1 → −15.3 | 0.0 → −1.0 |
| mix-1-2, effects only | 0.43 → 0.10 | 1.31 → 0.19 | 774 → 713 | −13.6 → −16.7 | 0.0 → −1.0 |

- The **petals and pickups stay "pitched" on purpose**: they're rewards, the one place a note belongs. They are now warm wood (centroid
  ~520–540 Hz instead of 1700–2200) with nothing above 6 kHz.
- **Plays per minute** in the mixes: 4-4 old 276, new 260; 1-2 old 238, new 236. The 4-4 wind chime alone went from 48 a minute to
  about 22, and it's no longer the vine-grab note.
- **The beds** match the old loudness within 0.3 LU. The old beds are mostly a low rumble (centroids 61–414 Hz in six worlds) or
  bright hiss (Worlds 2, 4 and 10: 24–26% of their energy above 6 kHz). The new ones are real places in between (2–6% above 6 kHz
  where birds, rain or water live there).
- **Peaks**: the new side now passes through polish-audio's −1 dBFS master ceiling (merged in), so new mixes peak at −1.0; the old
  side was rendered on the branch before that ceiling.
- **Loudness**: each new sound is set to where the loudness plan (SN-2) put the old one it replaces, by rendering both through the
  game's chain (tools/audio/sfxv1/calib.py). Three deliberate exceptions: the rock 3 dB under the old hit, the petals 3 dB under the old
  flower, and the vine grab well under the old one, which plays at −6 LUFS (the loudest thing in the game).

numbers.json has every figure for every file, including the mixes with their backgrounds. EFFECTS.md lists every effect in the game,
how often it plays per minute in ten stages and a boss, and what replaces it.

## What's honest to know

- **Full bandwidth now (2026-10-30).** The first set came from an archive whose copies stop at 8 kHz; every effect is now rebuilt from
  its recording's 48 kHz original. So nothing hisses on a phone speaker, any take with more than 6% of its energy above 6 kHz has
  that top turned down (backgrounds may keep 10%: crickets, birds and rain live up there). The `-new` files here are still the 8 kHz
  set from 2026-10-29, except the ten `bed-w*` pairs.
- **Creature voices are real animals**, not made for a cartoon: a house cat's cry stands in for the ocelot, a tiger's growl for the
  jaguar, a lion for the bosses, a real alligator's growl for the caiman ("Alligator Growls 02"), a rat's squeak
  for the tayra. If one doesn't fit, I can replace it with Stable Audio Open once you press "Agree" on its Hugging Face page (it's gated).
- **Pokey's footsteps (2026-10-30)** are Matt's pick F from the footstep page (../footsteps-v2/): a creature's paws on earth with a
  muffled real footstep on top, and a padded step on wood. They sound on every other footfall of his run frames.
- **Against the new recorded music** (PERF-D) the effects sit about 6 LU under it in 30 s of 1-2 (4 LU at their loudest moments);
  against the old synth music they were level with it.
- **The mixes come from a bot's run.** It jumps and swings more than a person; a third of its punches were kept.
- **Not built yet**: the predator warnings (ocelot, jaguar, boa, caiman and tayra calls before they pounce) and each boss's own roar,
  which Build 1 owns (SN-4). They'll use the same animal recordings as the knock-outs.
