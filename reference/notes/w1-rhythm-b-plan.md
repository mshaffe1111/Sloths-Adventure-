# 1-1 and 1-4 stage plans, v2 (w1-rhythm-b; redone after the lead's 1:58 PM review)

Beat: the music's, read by `stageBpm` (1-1: 129.7 BPM, 1-4: 125.1 BPM). Layout stills:
- `reference/qa-reports/w1-rhythm-b/plan-1-1-layout.png`: 1-1's REAL geometry, built by `src/game/w1Rise.ts` on beatTrace, layout 1,
  Normal, with the validator's quick route drawn on it.
- `plan-1-4-layout.png`: a schematic, not yet built.

## 1-1 Into the Canopy: half notes (0.92 s), a march; the twist is the off-beat catch

Map: a wave that rises. It goes up the earth bank, onto the kapok boughs, up into the canopy, along a high road or a low road, and
across the high branches to the shrine, with dips and drops to lower boughs all the way. About 1300 px of rise overall, and the
backdrop turns from forest floor to canopy as he climbs.
Pair, in one move: the jump and the second jump (jump on the beat, second flick on the off-beat).
Measured now:
- A quick player takes 140 s on layouts 1-3 (floor 125).
- The validator's clock reads 158-160 s.

| # | Node | Notes / feel | Moves (examples, traced) | Pieces | Under a miss |
|---|---|---|---|---|---|
| 1 | Intro: the forest floor | whole notes, about 0.5 a second (the stumps are bumps) | gap, stump up 40, hop down, gap, stump up 30, hop down | floor banks, soft pits, stumps | moss |
| 2 | Ramp: up the bank | half and whole notes, up/level/down | gap, step up 40-60, across, hop down 30, step up | earth steps; the mushroom (taught) mid-ramp, 205 px up, higher than a double jump | moss |
| 3 | Rest: the terrace | no move | root knots, petals | the bank's broad shelf | - |
| 4 | Ramp: the last steps | longer gaps, down and up | across, up, down 40, up 60 | earth steps; the second mushroom to the bank top | moss |
| 5 | Rest: the bank top | no move; the second jump named | the practice shelf over the path | | - |
| 6 | TWIST: the off-beat catch | the note value changes: jump on the beat, second jump on the off-beat | up 40, catch 110 up, down 40, catch 130 up, down 30 | first kapok boughs | a bough below |
| 7 | Rest: the fork | no move | | | - |
| 8 | SPIKE: up into the canopy | half and whole notes, doubles up to 150 | double up 140, down 50, a slope of twigs down, double up 150, up 20, down 30, double 150 | boughs | a bough below |
| 9 | Rest: the high bough | no move; Dot's line; the seed seen ahead | | | - |
| 10 | Choice: high road or low road | low road = the counter-melody (bounce + hop); high road = off-beat catches over open air, the golden seed at its end | | mushrooms, boughs | low: boughs below; high: OPEN AIR |
| 11 | Rest: before the high branches | Dot's warning | | | - |
| 12 | FINALE: the high branches | densest, ~18 s, half notes and off-beat catches, a mushroom in the middle, ends AT the shrine | up 20, down 30, catch 120, mushroom 190 over air, catch 130 | thin boughs | OPEN AIR (fallZones: Normal a life; Easy soft) |
| - | The top branch | the shrine 260 px past the last landing; the view | | | |

Variety:
- No gap repeats 4 times (beatTrace refuses it).
- Platform sizes come from the note values: whole notes give 500-600 px pads, half notes 240-300.
- Heights go up, level and down in every node.

Top-branch camera move (its own, not 6-8's): standing on the top branch, the view eases up so the canopy's crowns and the sky fill
the screen (part of the small canopy-rise engine commit).

Validator, layouts 1-4 Normal:
- Strip: I F R F R F R F R F R F.
- Flags gone: "nothing bites", "padding", "repeat".
- Flags left:
  - dead walks of 2.5-2.9 s at rest edges, to tune;
  - one run of soft hops ("jjj" x3), to tune;
  - one or two groups 3-5 s over 20;
  - "never tight";
  - "one tempo".
- "Never tight" is the validator's clock, not the stage. It adds 0.5 s to every jump, so one jump per half note reads as about 1 move a second. Quarter-note hops can't keep a real gap once beatTrace widens the pads for a clumsy thumb.
- The rests are ~5 s quiet walks because the validator finds rests only as empty 5-second windows on a fixed grid. If fix-petals measured "a gap of 5 s or more", the rests could be shorter.

## 1-4 Up the Kapok: whole notes and whole-bar waits (1.92 s); the slowest stage

Pair, in one move: climb a trunk and leap off it onto a creaking limb (0.6 s before it drops).

| # | Node | Feel | What changes from the last |
|---|---|---|---|
| 1-3 | Kept as built: up the trunk; zigzag with the rope and the hollow seed; the squirrels' low lift | | |
| 4 | Creaking limbs, taught (going LEFT) | whole notes | a 190 px plank, one limb over a one-hop drop onto a wide bough (safe), then two limbs 110 and 150 apart, a 180 px bough |
| 5 | SPIKE: climb and leap | the pair, one move | a 350 px trunk; leap onto a limb, then three more, widths 90-160, gaps 90-150, uneven heights. A miss lands on a bough below, and the long way back is a rope and a short trunk: it costs time and never strands him, since a broken limb takes 30 s to regrow |
| 6 | Rest: the fork | whole-bar wait | a 600 px fork ledge, root knots; the crown in view (sideways look-up) |
| 7 | Counter-melody: the high lift, then back down | wait-and-go | the squirrels' high basket (throw), up 260, then DOWN and sideways: a drop to a lower bough and the long rope back across the tree |
| 8 | CLIMAX | densest for 1-4 | a 180 px trunk, two limbs, a 420 px plank, a 360 px trunk, two limbs, a rope, a 200 px trunk |
| 9 | The crown (cool-down) | | the wide crown branch, the view, the shrine |

Replaced: the fill loop and w1Kapok's rhythm table. 2-6, 3-4, 4-1 and 4-6 stay byte-identical (checked by hash). Target: 125 s+ for a quick player.
Sideways camera: approved hook #2 (feet lower on a wide view while climbing, eased), every sideways climb.

## Dot's lines (exact words; 8 words or fewer; touch words only)
Kept (already approved):
- "Jump the little gaps" (1-1).
- "Land on the mushroom to bounce up high" (1-1).
- "Flick up again in the air to jump twice" (1-1). This one is 9 words; a shorter option is "Flick up again in the air!".
- "Slide up on the trunk to climb" (1-4).
New, need Matt's approval:
- 1-1 ramp: "Up the bank! Step to step"
- 1-1 high bough: "Look how high we are!"
- 1-1 before the finale: "No soft moss up here!"
- 1-4 first creaking limb: "This limb creaks. Keep moving!"
- 1-4 the fork: "The crown! Up there, see?"
