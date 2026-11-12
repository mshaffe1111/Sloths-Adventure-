# Bands: the gaps and rises a section may ask for (R-165.60, from reach.md, flown 2026-11-09)

Every figure is flown (`npx tsx reference/specs/sims/flight.ts <normal|easy> <rshare|touch|dist|ddist>`; saved in
`reference/specs/sims/out/`). Tolerance ±2 px (double gaps ±3). Gaps are lip to lip; rises are the far top over the take-off floor.
A "share" is the share of the tries in the table (take-off spots x second-press moments), not of players. 1-1 has no lethal drops
(R-165.53), so a miss costs a retry.

## 1. The rule each band keeps
- **A single-jump section:** one flick crosses or climbs it from 70 px before the lip (Easy) or 55 px (Normal).
- **A block (a teach's check, a test):** the lesser move fails on EVERY try, with at least 5 px to spare; the taught move passes.
- Margins sit on the flown figure. A slow phone (25 fps) loses about 3 px of apex, so no band leans on less than 5 px.

## 2. The bands

| Section kind | Easy | Normal | Flown evidence |
|---|---|---|---|
| Single jump, gap | up to 114 px | up to 143 px | Flick from 70 px before the lip: 132 (E), 128 (N); from the lip 217 / 213. A Pad tap: 77 from 70 px before, 147 from the lip |
| Single jump, rise | up to 63 px | up to 80 px | Single climbs 123 (block), 117 (thin). A Pad tap climbs 87 at best, and 64% of spots at 84 |
| **Double teach, rise form** (block face) | **128-132 px** | **136-140 px** (as laid today) | One jump: 0% from 124 px up (it climbs 123). Double flick: 100% up to 150. Pad tap,tap: 53% at 128-132, 45-37% at 136-140 |
| Double teach, rise form, thin lip (log, bough) | 122-128 px | 128-134 px | One jump climbs 117; double flick 206. Shares not flown for thin |
| Double gap (Normal only; Easy has none) | none | **TEST 252-262 px**. No gap TEACH (see §3) | One jump crosses 246 at best (the Critic's finer flight, 2 of 1000 tries; mine 244), so 252 is 6 px over. Double flick: 72% at 250, 67% at 256, 61% at 262; Pad tap,tap 18-9% |
| Bounce teach, floor mushroom | **lip 232-246 px over the floor, the mushroom's edge 20-60 px from the face; the check is the bounce plus one air jump** (see §4) | the same | Bounce alone climbs 223; a plain double 214; bounce + air jump 317. At 232-246: bounce alone 0%, plain double 0%, bounce + flick 61-55% |
| Bounce + air jump test (U, V) | 236-250 px | 236-250 px | 58-55% at 240-250, 49% at 260 |

## 3. Why the double gap is no longer a teach (handoffs/designer.md §3.2, changed)
The old bands were TEACH 195-205 px and TEST 205-228 px, on "a single reaches 175 + 21". Flown, one jump crosses **198-208 px with his
centre at the lip, 213-223 from the last ground frame, 239-244 with coyote** (Easy 243-246). So neither band blocks one jump. A gap
that does must be 252 px or more (the widest flown single, 246, plus the 5 px of §1), and there a double flick lands on about 70% of tries (72% flown at 250, 67% at 256) and falling: too low for a first lesson, fair for a
test on Normal. The rise form is the clean lesson: one jump never climbs it, a double always does, on both settings.
Normal's double TEACH therefore uses the rise block (136-140, the D block already in w1.ts); the gap is a Normal TEST at 252-262.

## 4. The bounce teach: the packet's "a bounce alone clears it" cannot be met with a margin (pushback, REPORT.md)
On a floor mushroom a bounce alone climbs 223 px and a plain double jump 214 px. A lip that blocks the double and that the bounce
alone clears lives in **216-221 px: 2 px spare on each side, gone at 25 fps (the bounce drops to 220.8)**. Today's 200-220 lip is
climbed by a plain double on 71% (hold) or 51% (flick) of tries at 205, and still 36% / 18% at 212: the mushroom is optional there.
- **Ruled here (data only):** lip 232-246 px, mushroom 20-60 px from the face, the check is bounce + one air jump. With the mushroom
  40 px from the face, the press may come any time from 6 to 22 frames (0.2 to 0.73 s) after the cap throws him. The `lesson.bounce`
  card must then say to jump again in the air (the story keeper's words).
- **The other way, if the lead wants a bounce alone to be the whole lesson:** lip 190-205 px (bounce alone 100% at 190, 80% to 216
  with the mushroom within 80 px), accepting that a double also climbs it. It teaches, it does not block.
- A raised mushroom that a double cannot stand beside would give both, but needs a new piece: not flown, a suggestion only.

## 5. What moves in World 1 (src/game/gen2/worlds/w1.ts on main; Content enters it, Engine lifts the clamps)

| Where | Today | Flown fact | Becomes |
|---|---|---|---|
| `DOUBLE_TEACH` [195, 203] (w1.ts:127): w1-second-jump (347), w1-leap-stones (353-354), w1-double-teach gaps4 / gaps5 (581), keys `d`, `t` (907, 909) | a "double" gap | one jump crosses it (213-223 from the last ground frame) | The teach uses the D rise block on both settings. Where a gap stays as a Normal test: [252, 262] |
| `DOUBLE_TEST` [205, 228] (w1.ts:127) | a "double" test gap | one jump crosses up to 246 | [252, 262], Normal only |
| Every double rise block `dy [-140, -136]` (D, E at 921 and 925; rungs 616-617; 725, 752, 827, 853, 1113-1291) on **Easy** | laid at Easy's 113.9 clamp (pipeline.ts:840) | one jump climbs 113.9 on 100% of spots | Easy 128-132 |
| The same blocks on Normal | 136-140 | one jump 0%, double flick 100% | no change |
| Easy rise twins 110-114 px (designer.md §3.2 as it stood; not found entered on main: the only [110, 114] there is a log road's post height, w1.ts:519, which Content should check is not meant as a double block) | "a double rise" | one jump climbs 123 (block), 117 (thin) | block 128-132, thin 122-128 |
| Bounce lips `[-220, -200]`: mushroom-lift mound and log-road (544, 545), block `B` (950), #35, #66, #67 | "the bounce" | a plain double climbs up to 214 | [-246, -232], mushroom's edge 20-60 px from the face |
| U, V `[-260, -240]` (946, 948) | bounce + air jump | 49% at 260 | [-250, -236] |
| `maxGap(0, double)` Normal 229.8 (pipeline.ts:114) | the widest double gap the builder lays | below the single's 244 | must allow 262 (ENGINE packet) |
| `riseLimit(double)` Easy x0.95 = 113.9 (pipeline.ts:840) | Easy's double rise clamp | below the single's 123 | must allow 132 (ENGINE packet) |

Single-jump gaps and rises do not move: the builder's single limits are confirmed (reach.md §4).
