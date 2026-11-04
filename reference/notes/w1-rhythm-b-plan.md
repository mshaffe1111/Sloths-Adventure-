# 1-1 and 1-4 stage plans (w1-rhythm-b, for the lead before wiring)

Heights are px above the forest floor. Times are a quick, sure player's (the validator's clock); a first-timer takes about 1.6-2x.
Every node starts on a flat 200 px apron with a checkpoint. "Soft" means a miss lands on ground or the branch below (a retry or a
setback); "pit" means nothing below (Normal: a life, back to the node's flag; Easy: the soft fall that puts him back).

## 1-1 Into the Canopy: 88 BPM (a beat 0.68 s, a bar 2.73 s), steady on-beat hops, a march. Rises 0 -> about 1600 px.

| # | Node (tag) | Pair | Beat pattern | Pieces and art | Height | Quick s |
|---|---|---|---|---|---|---|
| 1 | Forest floor (intro) | run + jump | one hop every bar (4 beats, 2.7 s) | floor banks, 3 soft moss pits, low stumps; w1sunrise backdrop; tip "Jump the little gaps" (kept) | 0 | 12 |
| 2 | Up the bank (ramp) | run + jump | a jump every 2 beats (1.36 s), climbing | 8 stepping stones (moss stone) rising 40-60 each over a raised soft floor, stumps; World 1 bank dress | 0 -> 320 | 16 |
| 3 | The second jump (ramp, teach) | jump + double jump | jump-jump on beats 1-2, land on 3, walk on 4 | the practice shelf over the path (a miss lands on the path), then 3 ledges 130-150 up onto the first kapok's low bough; tip "Flick up again in the air" (kept wording) | 320 -> 720 | 14 |
| 4 | Up into the canopy (spike, THE MOMENT) | double jump + hop | per bar: hop, hop, hop, DOUBLE up (1.47 moves/s: tight) | branches out from two kapok trunks, stepping up 150 a bar for 4 bars; the branch below runs under each step (a miss is a setback, never a life); the backdrop crossfades floor -> canopy crowns from 700 to 1300 up | 720 -> 1320 | 12 |
| 5 | High bough (rest) | none | no move: a walk with root steps | a wide mossy bough in the canopy, Dot's line (new, needs Matt's approval: "Look how high we are! Almost the top."), the golden seed glinting on a shelf above, seen from here | 1320 | 7 |
| 6 | Mushroom boughs (counter-melody) | mushroom bounce + double jump | bounce on 1, land on 3, hop on 4 (long-short, a different feel from the march) | bracket mushrooms on the boughs launching to higher boughs, a bounce + double detour to the seed shelf (the secret); soft | 1320 -> 1500 | 20 |
| 7 | The high branches (climax) | run + jump + double jump | on every beat: hop, hop, jump, DOUBLE, densest | thin high branches between crowns over open air (real pits on Normal, Easy soft), gaps single <= 0.6 of reach, double <= 0.72 | 1500 -> 1600 | 22 |
| 8 | The top branch (cool-down) | none | a stroll | the widest top bough: the view (the reveal's pull-back and chime when he stands on it), a gentle walk with small steps to the shrine | 1600 | 8 |

Total quick about 111-130 s (tuned to at least 125 s once built; if short, node 6 and 7 get another bar each, never a repeat).
Validator aims: strip I F F T R F T R; 4+ groups; tight in 4 and 7; something bites in 7 (Normal: 20%+ of beats after 30 s cost a
life); no "Finish" fill. Expected to stay: "one tempo" (1-1 is the march; no hurry or patience mechanic is taught by stage 1, by the
plan's own table). If the lead wants it gone, a creaking-limb tease belongs in 1-4, not here.

## 1-4 Up the Kapok: 84 BPM (a beat 0.71 s, a half-note 1.43 s), half-note wait-and-go. The chimney kept (KAPOK_W 3200, floor full width).

| # | Node (tag) | Pair | Beat pattern | Pieces and art | Quick s |
|---|---|---|---|---|---|
| 1 | Up the trunk (intro, kept) | climb | a grab every 2 half-notes | the floor, two trunks; tip "Slide up on the trunk to climb" (kept) | 12 |
| 2 | Zigzag (ramp, kept, trimmed) | climb + rope | grab, shimmy, grab on half-notes | rope, trunk, rope with the hollow side trunk and the golden seed (kept), trunk | 22 |
| 3 | The squirrels' lift (puzzle, kept) | puzzle + climb | wait-and-go: stand, set the acorn, ride | low basket, tap (kept, its validator and tests) | 12 |
| 4 | Creaking limbs (teach, NEW) | climb + creaking limbs | land and go on the half-note (0.6 s to leave before it drops) | fragile branches, crumbleAfter 0.6, the shared notch + shake look; the first over a short drop onto a wide branch one hop below (safe); Dot: "This limb creaks! Don't stop on it." (new, needs Matt's approval) | 10 |
| 5 | Creak and rope (spike, NEW) | creaking limbs + rope | limb, limb, catch the rope, shimmy, limb, grab, at the half-note | the climb's densest run; a miss drops to the branch below and its trunk back up (a setback, the limbs never the only way back) | 14 |
| 6 | The fork (rest, NEW) | none | no move | a wide fork ledge with root steps, petals, Dot's line (new: "The crown! Up there, see?"), the crown in view above (sideways look-up) | 6 |
| 7 | The high lift and the long rope (counter-melody, kept pieces, new place) | puzzle + rope | wait for the lift, then one long slow shimmy | the squirrels' high basket (flick up to throw, kept), then the long rope across the widest gap (kept twist) | 26 |
| 8 | Up through the crown (climax, NEW) | creaking limbs + climb + hops | half-note: limb-go, limb-go, grab, hop | creak limbs and short hops round the trunk, two short trunks | 14 |
| 9 | The crown (cool-down) | none | a stroll | the wide crown branch, the view: the reveal pull-back and chime on the crown, the shrine | 6 |

Replaced: the `while (expert < EXPERT_SECONDS - 32)` fill loop for 1-4 and w1Kapok's rhythm table (2-6, 3-4, 4-1, 4-6 keep theirs:
byte-identical builds, checked by hash). Total quick about 120-125 s.
Honest note: 1-4's falls cost height (a setback), but the validator prices a fall onto a lower branch as "nothing", so "nothing bites"
may not fall for 1-4 without a validator change (pricing a drop of 250 px or more on a climb as a setback). "One tempo" falls
(creaking limbs are hurry) only if the lift ride counts as patience (asked of the lead at 12:55).
Sideways camera: asked of the lead (engine.ts hook: feet lower on a wide view while climbing).
