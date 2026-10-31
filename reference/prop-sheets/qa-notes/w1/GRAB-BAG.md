# World 1 grab bag: The Trail (2026-10-31, w1-4-sheets helper, for the lead's review before any art job)

The gen2 rebuild of World 1 (`origin/plan-gen2-w1-4:reference/GEN2-W1-4-PLAN.md` §4) follows STAGE-RULES §1c. Every piece and its art
is made up front, and curation runs once. Matt's World 1-4 calls:
- fix first, rest later;
- **climbs B**: 1-4 becomes a generated climb, so its shape changes too;
- the next roll is at least half different;
- variety comes from more pieces, never rerolls.

World 1 is the first impression and the gentlest world (band D_base 10). Every new beat here is soft: nothing new hurts on first sight,
the timing windows are the widest in the game, and Easy widens them again.

## 0. Unused art placed first

Lead review 2026-10-31 ~1:45 PM ET: **approved**. Matt (1:40 PM ET): "We need to use all the art we create. Its a waste otherwise. I want a fun unique game." So this world's unused art (from `tools/art/artuse.mjs`, `reference/prop-sheets/qa-notes/art-use/UNUSED.md`) is placed FIRST, below, before any new art.

| Unused piece | File | Where it goes in this bag |
|---|---|---|
| `stump` (Matt's painted stump, drawn only in the journal) | `protoAtlasData.ts` | #1 stepping stumps, at three widths. **Replaces the new stump-top art** (the HF stumps were softer than Matt's: thrown) |
| `branch` (drawn today) | `protoAtlasData.ts` | #6 the bobbing bough is Matt's branch tilted and bobbed in code (a small code touch). **Replaces the new bough art** (thrown, same reason) |
| `trunkPlain` | `proto2AtlasData.ts` | #13 the knot-step trunk |
| `buttress` | `protoAtlasData.ts` | #10 the foot of a 1-4 trunk, on the climbs theme |
| `bankEnd` | `protoAtlasData.ts` | the bank end where a 1-4 climb ledge stops (the painted ground has no end piece on climbs) |
| `chaseDebris` | `proto3AtlasData.ts` | 1-8's acorn pattern, the debris falling after the crack |
| 3 hollow-log variants (never packed) | `w1-props-1-puzzle-and-secrets.jpg` | #19 eagle hides (cut and packed with the batch) |
| story squirrels `shocked`, `laughing`, `hammering` (never drawn) | `w6to10/gemini/story18-squirrels.webp` | the squirrels' design: the lift crew (#12) is drawn ON this model; `hammering` dresses 1-4's lift room (they built it), `laughing` at the top of a lift, `shocked` beside the first rolling acorn |

## 1. Beat letters (`tools/inspect/beats.ts:20-21`)

| Letter | Weight | What makes it |
|---|---|---|
| W | 0.2 | a plain walk |
| h | 0.5 | a small hop, a step up a knot, a pickup arc |
| J | 1 | a jump, double jump, mushroom bounce, a hop onto a moving platform (timedHop), a glide |
| V | 2 | a climb, liana swing, rope shimmy, lift, warm air |
| C | 2.2 | an animal |
| Z | 2 | a timed or zone hazard: crumbling branch, eagle sweep, chase collapse, dark, gust |
| P | 2.8 | a puzzle-room step, a push log or boulder |

Today 1-1 and 1-2 are h and J almost only (era 0.36-0.37, built from the same shared `stones`/`bounces`/`hopDip` pool), and only 1-4,
1-6 and 1-7 have a P. The bag below gives every stage at least one V, Z or P section in its own themes, so its letter mix can move.

## 2. Section types (22; 5 timing beats)

"Existing" means World 1 has it today (`protoStage.ts` / `w1Sections.ts`), to be rebuilt as a gen2 `SectionTemplate` with sockets.
"NEW" pieces need the art listed in §4. A section's mechanic is never used before the stage that teaches it (`dotTips.ts` FIRST_OF;
the plan's §5).

| # | Section | Beats | Plays like | Art (existing / NEW) | First taught | Dot line (proposed, Matt approves) |
|---|---|---|---|---|---|---|
| 1 | Stepping stumps | J h | Hop a row of painted stumps over soft moss, heights mixed | existing `stump` (packed, never drawn), `boulder`; NEW stump-top set ×3 | 1-1 | (existing tip) |
| 2 | Soft gaps | J | Gaps over soft moss, a second-jump gap in the middle | existing ground + `snapL/R` lips | 1-1 (double jump, `dotTips:26`) | (existing) |
| 3 | Bounce wall | J | Mushroom bounce up to a high branch road, drop back | existing `bounce.webp` cap-w1/stalk-w1 | 1-1 | (existing) |
| 4 | Petal stairs | h J | Petals lead up a stair of perches and back down | existing `perch`, `branch` | 1-2 | (existing) |
| 5 | High/low split | J h | Two roads: high branches or the low path, both pay | existing `branch`, `canopy` | 1-2 | - |
| 6 | **Bobbing bough** (timing) | J (timedHop) | A springy bough dips under Pokey's weight and rises on a 2.4 s rhythm. Hop on when it's up; a dip only means a lower landing, never a fall. | NEW bobbing bough (up, down) | 1-2, soft (moss below) | "Wait till the branch comes back up." |
| 7 | Snake branches | C | Sleeping snake first, then an awake one on a wide branch | existing `snake-atlas`, `snake2-atlas` | 1-3 (`dotTips` snake) | (existing) |
| 8 | Rope guard | C V | A snake on the far end of a rope run | existing rope-kit ends; NEW vine-rope span tile | 1-3 | (existing) |
| 9 | **Rolling acorns** (timing) | Z | Acorns roll down a sloping branch in a rhythm; the squirrel tipping each one at the top is the tell. A **setback only** (lead, 2026-10-31): bumped = nudged back to the branch foot, never a life. Go between them. | existing puzzle-kit `acorn`, `acornPile`; NEW squirrel (tipping pose), sloping acorn branch | 1-3 (taught with a slow single acorn first) | "Acorns roll. Go between them." |
| 10 | Trunk climb | V | Grab a trunk, climb, step off onto a perch | existing `trunk`, `wall` | 1-4 | (existing) |
| 11 | Rope shimmy | V | Hand over hand under a vine rope between two trunks | existing `hero-rope` frames; NEW vine-rope span tile | 1-4 (shimmy required from 1-4, `skills.ts:38`) | (existing) |
| 12 | **Squirrel basket lift** (timing) | V P | Ride the squirrels' basket; they haul on a rhythm, so step on when it's down | existing `pulley`, `basket`, `liftPlank`; NEW squirrels (hauling, waving) | 1-4 | "The squirrels will pull you up." |
| 13 | Knot steps | h | Knots on a trunk as small steps, a breather between climbs | existing `trunk`; NEW knot-step pieces ×2 | 1-4 | - |
| 14 | **Creaky branch run** (timing) | Z J | Branches crack 0.8 s after Pokey steps on; a safe low road always stays (never required, STAGE-RULES §1) | existing `branchCreak`, `snapL/R` | 1-5 (`dotTips:139`) | (existing) |
| 15 | Fern-tree keepsake | V | Off-route climb to a hidden keepsake fern | existing `fernClump`, `trunk` | 1-5 | (existing) |
| 16 | Liana chain | V | 2-4 lianas over a soft dip | existing `liana` | 1-6 | (existing) |
| 17 | Log push nook | P | Push the log to a ledge, climb to the nook behind the leaf curtain | existing `logPush`, `curtain`/`curtainOpen` | 1-6 | (existing) |
| 18 | Seesaw room | P | Weigh the seesaw down to lift the branch gate | existing puzzle-kit seesaw ×3, `branchGate` | 1-6 | (existing) |
| 19 | **Eagle bush row** (timing) | Z | The eagle's sweep comes on a rhythm; hide in a bush, hollow log or fern as its shadow passes | existing `curtain`, `bushTall`, `bushWide`, eagle-anim; NEW hollow-log hides (Matt's 3 painted, unpacked variants, from `w1-props-1-puzzle-and-secrets.jpg`) and a fallen-log hide | 1-7 (`dotTips:29-31`) | (existing) |
| 20 | Acorn lure | P Z | Throw an acorn to pull the eagle's look away | existing acorn set, `acornTree` | 1-7 | (existing) |
| 21 | Stone and plate gate | P | Carry a stone onto the plate; the root gate lifts | existing puzzle-kit `stone`, `plate`, `platePressed`; NEW root gate (shut, open) | 1-5 (taught in its own room, no danger) | "A stone on the plate holds the gate." |
| 22 | Snake ring lock | C P | Two waves of snakes; then the root gate opens. Dot explains the lock. | existing snake/boa; NEW root gate (shared with #21) | 1-9 (`dotTips:32`) | "Clear the snakes. The roots will open." |

Also kept as set pieces with their own pools (not counted above): 1-8's chase (gap, leap, swing, snake and updown pieces, and today's
3 patterns grown to 6+, plan SP) and 1-10, Venom Fang.

**Timing beats (5):** bobbing bough (#6), rolling acorns (#9), squirrel lift (#12), creaky branch (#14), eagle sweep (#19). All of them
are soft. A mistake costs a step back, never a life, until 1-7's eagle, which is taught with a hide in reach.

## 3. Themes per stage (at least 5 each; a roll picks one, and the next roll is a different one)

A theme is a weighted subset of the sections plus a dressing set (`artRoll.rollLook`). Its Ki slot always holds the stage's lesson
(`required`).

| Stage | Lesson (Ki, required) | Themes (main sections) |
|---|---|---|
| 1-1 Into the Canopy | gaps, stones, double jump, bounce | **stumps** (1, 2); **bounce road** (3, 5); **high leaps** (2, 5); **stone dips** (1, 13 knots as ground steps); **mossy run** (2, 4) |
| 1-2 The Petal Trail | follow the petals | **petal stairs** (4, 1); **bobbing boughs** (6, 2); **split road** (5, 4); **bounce petals** (3, 4); **perch hop** (1, 6) |
| 1-3 Branch Snakes | snake punch, rope guard | **snake walk** (7, 2); **acorn slope** (9, 7); **rope guards** (8, 7); **high branches** (7, 5); **bobbing snakes** (6, 7) |
| 1-4 Up the Kapok (climb, gen2 ascent) | trunk climb, rope, squirrel lift | **trunks** (10, 13); **ropes** (11, 10); **squirrel lifts** (12, 10); **snake shelves** (7, 10); **acorn chute** (9, 13) |
| 1-5 Where She Walked | crumbling; keepsake fern | **creak road** (14, 2); **stone gate** (21, 1); **climbs** (10, 15); **bounces** (3, 14); **everything** (7, 6, 14) |
| 1-6 First Lianas | liana swing, log push, seesaw (rooms required) | **vines** (16, 2); **gorge** (16, 3); **kapoks** (10, 16); **snake vines** (16, 7); **acorn vines** (16, 9) |
| 1-7 A Very Good Bush | eagle, bush hiding, acorn lure | **bushes** (19); **hollow logs** (19 log hides, 13); **rope bushes** (19, 11); **open meadow** (19, 20); **creak hides** (19, 14) |
| 1-8 The Long Branch (set piece) | the chase | 6 chase patterns: **leaps**, **swings**, **climbs**, **bobbing** (6 in the chase), **snakes**, **acorns** (9 as debris rolling) |
| 1-9 The Boa's Branches | boa guard, snake ring (required, Dot explains) | **branches** (7, 2); **trunks** (10, 7); **ropes** (8, 11); **walls** (7, 21); **acorn guards** (9, 7) |

## 4. NEW art for World 1 (one Hugging Face batch, with the W1 style sheet; §5 has the cost)

All of it is painted to `reference/prop-sheets/w1-style-sheet.png`: warm sun from the upper left, thin dark-brown ink line, mossy tops
on anything Pokey stands on, and flat magenta (the squirrels too; none of these is pink).

| # | Piece | Frames | Size (atlas px) | For |
|---|---|---|---|---|
| 2 | Squirrels (the 1-4 lift crew), as edits of the story squirrel (`story18-squirrels`, on model) | sit, wave, haul rope, tip acorn, run | 256 x 256 each | #9, #12, 1-4's story |
| 3 | Sloping acorn branch: a branch angled about 15 degrees with an acorn stash at its high end | 1 | 700 x 260 | #9 |
| 4 | Vine-rope span: a twisted green vine rope, tiling left to right | 1 tile | 256 x 48 | #8, #11 (now code) |
| 5 | Root gate: a lattice of living roots in a mossy frame | shut, open | 320 x 420 each | #21, #22 (now an earth block) |
| 7 | Knot steps: two bark knots / shelf fungi that stick out of a trunk | 2 | 140 x 90 each | #13 |
| 8 | Fallen-log hide: a big fallen log with a leafy gap under it to crouch in | 1 | 520 x 240 | #19 |

From Matt's sheets without HF: the 3 hollow-log variants on `w1-props-1-puzzle-and-secrets.jpg` (bottom row), cut with
`tools/art/w5puzzle/cut.py w1to4`-style cutting and packed with the batch. Packed but still undrawn after this bag:
- `buttress`: a 1-4 climb base in the trunks theme;
- `trunkPlain`: the knot-step trunk;
- `chaseDebris`: 1-8's acorn pattern.

So nothing stays unused.

## 5. Cost (estimate for the lead; HF only)

One GPU job on rtx-pro-6000 (~$2.75/h). The squirrels are 5 poses as Qwen-Image-Edit from the first approved squirrel (2 seeds), then 0.3
on the style model. The props are 3 canvases, each with the W1 approved pieces painted alongside, at 2 strengths x 2 seeds. About
30 takes plus ~4 min of model load, so ~15-18 min: **~$0.8, cap $2** with a second round.

## 6. Gaps this bag still leaves (named, not hidden)

- No wind, mist, water or patience spot in World 1, on purpose: those lessons belong to Worlds 2-4 (plan §5).
- The bobbing bough and rolling acorns need two small engine pieces in gen2: a timed platform (`timedHop` exists on W2's logs) and a
  rolling hazard with a setback, the way World 8's sleeping bats push back. The World 1 builder owns them; the art is ready first.
- 1-8 stays a set piece. Its 6 patterns come from the same pieces, so it varies by pattern, not by curation.

## 7. Dot lines for Matt (one review, via the lead)

| Section | Line (under 10 words) | When |
|---|---|---|
| #6 Bobbing bough | "Wait till the branch comes back up." | first bough, 1-2 |
| #9 Rolling acorns | "Acorns roll. Go between them." | first acorn, 1-3 (the squirrel tips one slowly first) |
| #12 Squirrel lift | "The squirrels will pull you up." | first lift, 1-4 |
| #21 Stone and plate gate | "A stone on the plate holds the gate." | first plate, 1-5 |
| #22 Snake ring lock | "Clear the snakes. The roots will open." | 1-9's ring (Dot explains the locked exit) |

