# Chain: the mushroom bounce chain, flown for stage 1-2 (the Designer, 2026-11-11)

**Source of every number:** `reference/specs/sims/flight.ts`, mode `chain`, the real engine at 30 fps with the game's own
`InputEngine`, flown on stage 1-2 (`FLIGHT_STAGE=1-2`; the early-stage help is a ramp by stage number, physics.ts `easeAssist`).
Saved runs: `reference/specs/sims/out/normal-1-2-chain.txt`, `easy-1-2-chain.txt`, `normal-1-2-apex.txt`, `-rise.txt`, `-bdist.txt`.

**One command per setting (about 3 s):** `FLIGHT_STAGE=1-2 npx tsx reference/specs/sims/flight.ts normal chain` (or `easy`).

**Tolerance:** ±5 px (S and E are flown 5 px apart). Every band below is laid at least 10 px inside the flown edge.

**Scope:** stage 1-2 on Normal and Easy, a bare world, mushrooms as the engine has them (70 x 30, `bounceV` 830: the cap throws him the
same whatever height he lands from, engine.ts `bounceOff`). Not flown: moving caps, wind, a cap on a slope.

## 1. 1-2's jumps against 1-1's (so bands.md may be used on 1-2)
Flown on Normal, 1-2 beside 1-1 (`flight.ts normal apex`, `rise`, `bdist`, with and without `FLIGHT_STAGE=1-2`):

| Move | 1-1 | 1-2 | Moves |
|---|---|---|---|
| Single: apex, climbs block / thin | 97.8, 123 / 117 | 97.8, 123 / 117 (116 on a flick) | 0-1 px |
| Double hold: apex, climbs block / thin | 189.0, 214 / 208 | 188.2, 213 / 207 | 1 px lower |
| Double flick: climbs block / thin | 212 / 206 | 211 / 205 | 1 px lower |
| Bounce alone: apex, climbs | 197.6, 223 / 217 | the same | 0 |
| Bounce + air jump: climbs block / thin | 317 / 309 | 316 / 307 | 1-2 px lower |
| Bounce alone, level gap (mushroom at the lip) | 179 | 178 | 1 px |

Cause: the second jump's help is 0.958 of 1-1's on stage 2 (`easeAssist(2)`). No lesser move gained a pixel, so every block keeps its
5 px, and the taught moves lost 1-2 px against margins of 70 px or more. So **bands.md §2 holds on 1-2 as written**, both settings
(Easy's help is full on every stage). It must be flown again from about 1-5 on. One figure does move with it: a double flick lands
a 252-262 px gap on about 70% of tries on 1-1 (bands.md §2) and no better here, so **no double gap is laid over thorns**.

## 2. The chain, flown
The rig: a floor mushroom with its edge 20 px before a lip, then 3 pillars standing in the pit, a cap at the middle of each, then a
bank. **S** is cap centre to cap centre. "Thumb held" keeps the thumb right from start to finish and never presses Jump (a child's
first try). "Steering" aims at each cap every frame.

| What | Normal | Easy | Run, table |
|---|---|---|---|
| Level caps, thumb held: every cap in turn, clean | S 195-230 | S 195-230 | (a), (b) step 0 |
| The same, from 12 different run-ups | 12 of 12 at S 195-225; 10 of 12 at 230; 0 of 12 at 235 | 12 of 12 at 195-230 | (c) |
| Level caps, steering | S 80-230 | S 80-230 | (b) |
| Past the band, thumb held | S 240-270 lands on the next pillar (no fall, pillars 120 wide); S 280 or more falls | the same | (a) |
| Each cap `step` px HIGHER, thumb held | +30: 185-220; +60: 175-210; +90: 165-200; +120: 145-180 | +30: 185-220; +60: 175-215; +90: 165-205 | (b) |
| Each cap `step` px LOWER, thumb held | -30: 205-235; -60: 210-245; -90: 220-255 | -30: 200-240; -60: 210-250 | (b) |
| The floor mushroom's place (edge 0-60 px before the lip) | no change to S | no change | (f) |
| Pillar width 70 / 120 / 160 / 200, thumb held | clean band unchanged (195-230); what changes is a miss: on a 70 px pillar a miss falls, on 120 or wider he stands on the pillar | the same | (d) |
| The exit: the bank lip past the last pillar's edge, its top over the pillar top | level: up to 170 px; +90: up to 140; +150: up to 120; +195: up to 90 | level: up to 175 | (e) |
| One nervous Jump flick in mid-chain, thumb held, S 215 | of 29 moments: 4 clean, 6 skip a cap and land on, 10 stand on a pillar, **9 fall** | 8 fall | (g) |
| The same, steering | 27 clean, 2 skip a cap, 0 fall | the same | (g) |

## 3. The bands a chain section may ask for (laid 10 px inside the flown edge)

| Piece | Easy | Normal |
|---|---|---|
| Cap to cap, level (±6 px) | S 205-220 | S 205-220 |
| Cap to cap, a step up of 24-36 px (lay S 198-206) | S 195-210 | S 195-210 |
| Cap to cap, a step up of 54-66 px | S 185-200 | S 185-200 |
| Cap to cap, a step down of 24-36 px (lay S 216-224) | S 215-225 | S 215-225 |
| A cap higher than 66 px over the last, or lower than 36 px under it | not laid (the band narrows and was flown at 3 heights only) | not laid |
| Pillar under a cap (a stump standing on the pit floor, never floating) | 150-170 wide (35-70 px of pit between pillars) | 110-130 wide (75-110 px between) |
| Caps in one chain (pillars after the floor mushroom) | 2 in the first chain of the stage, else 3 | 2 in the first chain, else 3 to 5 |
| The exit bank: its lip past the last pillar's edge / its top over the pillar top | 40-80 px / 0-60 px | 40-100 px / 0-90 px |
| The entry: the floor mushroom's edge before the lip | 20-60 px | 20-60 px |

**Why these.**
- S 205-220 is the middle of the thumb-held band: a child who only holds right crosses clean, and a player who steers crosses anything
  from 80 px, so nothing here asks for a new skill. The lesson of 1-1 (land on the cap, it throws you) is the whole ask.
- The pillar is wider than the cap on purpose. A miss by up to 20 px (Normal) or 40 px (Easy) lands on wood, not on thorns; from
  there one jump or a walk into the cap goes on. On Easy the pillar is as wide as a landing (3.5 body widths: WORLD-RULEBOOK §7).
  Flown at pillar widths 70, 120, 160 and 200: the clean band does not move with the width; only what a miss costs does.
- A written step may lay taller (the roll's tempo stretches a rise that is not a block, C1's TURNOVER). The stepped rows are set
  so a step written 24-30 stays clean laid anywhere from level to 60 px: S 198-206 is inside every flown band from step 0 to +60,
  and S 216-224 inside every one from 0 to -60.
- The fall is real on Normal: a Jump pressed in mid-chain with the thumb held overshoots into the pit on 9 of 29 moments. That is the
  stage's bite (STATE: "Normal's bite starts at 1-2"), and it is fair: the press is the player's, and steering saves it 29 of 29.
- 5 caps at most: at 0.75 s a bounce, 5 caps is under 4 s over the pit, inside the rule that no beat repeats to fill time.

## 4. What a section built to these bands must show (the builder's proof)
0. The worked example: `npx tsx reference/specs/sims/chainlay12.ts` lays three chain versions and their Easy twins with the engine's
   own placer (`layLocal`, exact pixel gaps by `gapPx`) and prints each S against its row: 36 lays, all in band
   (sims/out/chainlay12.txt). Cap centre to cap centre = the gap + the pillar's width; from the floor mushroom (edge 35 px before
   the lip): the gap + half the pillar + 70.
1. `FLIGHT_STAGE=1-2 npx tsx reference/specs/sims/flight.ts <setting> chain` still prints the §2 figures on the builder's head.
2. On every listed seed and both settings, each laid chain measured cap centre to cap centre and printed beside its band row.
3. Thumb-held RealPlay through each laid chain: every cap in turn, standing on the exit bank.
4. No-move check (the block rule, NODES §8.7): with the mushrooms taken away, a double jump from the entry lip does not reach the
   exit bank (the pit under a chain is 3 pillars or more: 600 px or wider, against a double's 409 at best).
