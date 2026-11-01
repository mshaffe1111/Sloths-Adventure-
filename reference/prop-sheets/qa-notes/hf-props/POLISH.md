# HF props for Worlds 1-7: polish check (2026-10-31, hf-props helper)

What shipped on the branch:
- 130 new painted dressing pieces, one small sheet per world (`src/assets/props/dressnew-w1..w7.webp`, under 2200 px).
  - Per world: W1 22, W2 19, W3 17, W4 17, W5 21, W6 15, W7 19.
- All of them are wired through `artDress.ts dressSets` (the one dressing pass, pictures only).
- Review sheets: `w<N>-pieces.jpg`. In-play stills: `before/` and `after/`.

## The checks, against STAGE-RULES §5b

| # | Item | Verdict | Still |
|---|---|---|---|
| 1 | Painted, not drawn | **Pass.** Every piece is painted on HF (Qwen-Image + the game's style model). There is no code drawing. | `w1-pieces.jpg` ... `w7-pieces.jpg` |
| 2 | Nothing looks copy-pasted | **Fixed.** See the details below. | `after/all-sideways.jpg` vs `before/w6-sideways.jpg` |
| 3 | Art matches what it is | **Pass.** See the details below. | `after/4-5-sideways.jpg`, `after/2-2-sideways.jpg` |
| 4 | Light fits the place | **Pass.** World 3's pieces carry their own teal and purple glow (crystals, glowworm stone, geode), so the grotto floor has light sources. | `after/3-5-sideways.jpg` |
| 5 | Pokey and cast on model | **Pass.** See the details below. | `after/1-6-sideways.jpg` |
| 6 | Framing both ways | **Pass.** Pieces sit on the bank lip and floor in both orientations. | `after/all-upright.jpg` |
| 7-10 | Text, teaching, moments, motion | **Not affected.** The dressing is still and pictures only. | |

Details for item 2:
- Before: one 3-piece set per job per stage, so the same 2-3 pieces came back at every bank (W6 had the same two bushes 3x in one screen).
- Now each world has 3-7 looks per job, and a stage steps through them bank by bank.
- No piece shows more than 8 times in a stage, and no creature more than 3 times.
- W1-7 dressing is denser: sets of 2 are allowed, gaps are shorter and there are more sets.

Details for item 3:
- Pieces on the bank lip stand on the ground line, with their painted puddles and slabs cropped off.
- Hanging pieces hang under thin ledges only.
- No piece is placed on a platform's walking face, in a puzzle room, by a pickup or by a checkpoint (the existing `clear`/`free` checks).

Details for item 5:
- Every take that painted a sloth (or a sloth face) was thrown, so nothing reads as a second Pokey.
- The new creatures (toucan, heron, otter, macaw, monkey, lizard, frog...) are background dressing, about 0.7-0.9x Pokey's height.

## Rough spots, named

- A few pieces still have a sliver of painted ground under them where the model painted a slab: W4 seed grass, W5 thimbles. They read as ground, not as boxes.
- 5-6 and other narrow-ledge stages get little dressing. Their banks are short; the dressing pass skips banks under 180 units.
- 7-2, 7-8, 5-6 and 5-8 (old-generator stages in W1-7) are now dressed for the first time. I only shot 5-6 in play.
- The new pieces are drawn 1.3x their listed width. At 1.0x they read too small beside Pokey (first after shots).
