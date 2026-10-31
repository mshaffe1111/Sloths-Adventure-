# 8-4 Lantern Run: the mock-up (step 1, for the lead, then Matt)

Matt's pick (2026-10-29 4:58 PM ET): the Firefly Lantern Run. Pokey hurries **sideways** through the night canopy with a jar of
fireflies. Its light shrinks as he goes; every glowing flower fills it again. Refill timing is the tension. Not a climb.

The pictures are the real engine, a blockout on World 8's own kit (the boughs, backdrops and glow mushrooms the rest of World 8 uses, and
World 8's painted night bloom as the glowing flower). **Stand-ins, not the real art:** the jar (a code-drawn glass at his chest), the moth
(a code-drawn pair of wings) and the jar gauge (the yellow box under the lives). Those are the Hugging Face jobs below.

| File | What it shows |
|---|---|
| `0-mockup-sheet.jpg` | The three moments, sideways and upright, side by side |
| `opening-*.jpg` | The start: the jar half full, the first glowing flower just ahead. Nothing can hurt here |
| `refill-*.jpg` | Walking into a flower's light with the jar low: it fills (fireflies stream in), Dot's first line |
| `low-*.jpg` | The longest dark stretch, the jar nearly out: the light ring is small, the next bough can't be seen |
| `moth-*.jpg`, `swarm-*.jpg` | Extra: a moth coming at the jar in the moon glade; the firefly tree at the end lifting the dark |

## The stage, left to right (about 2:20 for a quick player, 36,000 px)

1. **Start: the moonlit bough.** Jar half full, the first flower about 500 px ahead (on screen both ways), filled before anything else.
2. **Learn: flower to flower.** Hops between boughs (150-195 px gaps, small rises and drops), flowers about 8 s apart for a quick player,
   one trunk to climb. The jar runs low between flowers the first time: Dot says it once.
3. **Develop: lianas and a trunk.** Four self-swinging lianas (perches sized by the engine's release window, 167 ms Normal / 300 ms
   Easy, past every jump and glide), a flower past each.
4. **Rest: the moon glade.** A wide bough, the great flower, a flag.
5. **Twist: moths.** The first moth waits in the glade's light (Dot's line), then moths in the dark stretches.
6. **Twist: the long dark.** Flowers 12-18 s apart (quick), lianas, a trunk, moths: hurry.
7. **Finish: the firefly tree.** He opens the jar; the fireflies rise into the tree and the whole canopy lights up; the shrine.

Flags at about every second flower. Nothing crumbles. Straight up a trunk always climbs. No locked exit.

## How the jar works (`src/game/lantern.ts`, pure, tested on its own)

| | Normal | Easy |
|---|---|---|
| Full to empty | 22 s | 34 s |
| Light ring | 290 px full, 70 px empty (an ember: Pokey never vanishes) | 310 / 80 |
| Refill | walk within 80 px of a flower: full in 0.6 s, as often as you like | 100 px |
| Running low (35%) | the ring flickers, Dot's line the first time | the same |
| Empty | he walks at 55% speed; after 3.5 s in the dark it closes in: **back to the last flower, jar full, nothing lost** | 65%, after 6 s |
| Moths | come at the jar from 380 px while it glows; a touch steals 30% of the light, then it flutters off; a punch scatters them | 20%, slower |

**Falls (World 8's rule, the jar deciding what is lit).** Under every gap is the long drop. On Normal a fall costs a life only when the
far side of the gap was lit as he left the bough (inside the jar's ring or a flower's light). If the jar was too dim to show the far side,
the fall is soft: back on the bough he left. Easy: every fall is soft. So no jump is ever blind, and a bright jar makes the jumps real.

## New lines (for the lead to approve; all under 10 words)

- Dot, at the start: "Your jar is fading. That flower glows!"
- Dot, the first time it runs low: "The jar's nearly out. Find a flower!"
- Dot, after the dark first closes in: "Too dark. Back to the last flower."
- Dot, the first moth: "Moths! They want your light."
- Dot, before the first lit drop on Normal: "Careful! It's a long way down." (World 8's line from gen2-w8)
- Dot, at the firefly tree: "Let them go, Pokey. Look up!"
- **8-4's wayside line needs replacing**: today's "Sneaking's the one thing I've always done at full speed." was written for Bat Roosts.
  Proposal (Pokey): "Turns out I'm brave exactly as far as the jar reaches." / short: "Brave as far as the jar reaches."
- **The stage's name and goal** (stagePlan.ts has 8-4 as "Bat Roosts", stealth): proposal "Lantern Run", "Carry the firefly jar
  through the dark treetops." (new, needs Matt's approval). gen2-w8 builds 8-4 as a gen2 roost stage today (`W8_GEN2_STAGES`): when both
  merge, 8-4 comes off that list (the hand-built stage wins in `protoStage.ts` HAND_STAGES).

## Art (all painted: Hugging Face, budget $8, logged in tools/art/hfbatch/jobs.txt)

From World 8's kit first: the boughs, trunks, backdrops, glow mushrooms and the night bloom (the glowing flower) are already painted.
New from Hugging Face (img2img from the game's own painted pieces, `slothadv-style-lora`; Pokey with `pokey-qwen-lora`):
1. **Pokey with the jar**: idle, run cycle, jump, fall, land, from his existing frames, the jar held in both arms at his chest, satchel
   strap over his left shoulder and bag on his right hip, empty paws except the jar. For swinging and climbing (paws on the vine), the jar
   hangs at his hip on a cord over his existing frames.
2. **The jar** on its own (lit and dim, for the hip and the HUD gauge).
3. **The moth**: a pale night moth, 4 flap frames.
4. **The firefly tree** for the finale (a tall World 8 trunk with a hollow crown the swarm rises into).
The light ring itself and the fireflies' glow are code light (STAGE-RULES §4: pre-rendered light sprites are a small touch).
