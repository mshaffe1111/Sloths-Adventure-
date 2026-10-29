# The look-alike measure: calibration pairs (2026-10-29)

STAGE-RULES §2 "Sameness": no two stages of a world share a 20 s stretch that plays alike. Matt chose "build a better measure"
(2026-10-29) after World 6 could not meet it. This folder holds the judgement the new threshold rests on.

- `pairs.json`: the 20 window pairs below, each window as the new measure sees it (its beat kinds in order, `W` for 1.5 s of walking),
  the old measure's letters for the same windows, both distances, and for World 6's raw rolls the gen2 sections each window covers.
  `tools/inspect/lookalike.test.ts` reads it: every pair judged alike must measure under `LOOK.alike`, every pair judged different
  over it by 0.05, and every "different" pair must be one the old letters matched under 0.28 (the false alarms this fixes).
- The measure: `tools/inspect/lookalike.ts` (one function, imported by `era.ts`, `eraRoll.ts` and `tools/gen2/curate.ts --apart`).

## What the measure sees

A kind per beat: its letter, then what it is. `J|second|up|w` is a jump up that needs the second press, over water; `J|short|level|p`
a short level jump over a pit; `J|glide|level|s` a glide with a floor under it; `V|liana|level|w` a liana over water; `V|climb`,
`V|rope`; `C|caiman`, `C|frog`; `Z|tide zone`, `Z|darkness`, `Z|eagle sweep`; `P|room seesaw`, `P|jump the cake`. Two beats of one
letter cost a share of a full swap by how much they differ (a jump's size 0.35, its height 0.25, what is under it 0.4; two animals
0.6, two hazards 0.8, two world moves 0.7, two puzzles 0.8). Swapping letters costs Gemini's matrix (the weight difference, +1.5
between categories). The distance is the weighted edit distance over the heavier window's weight, as before.

## The threshold: 0.30

Every pair judged alike measures 0.30 or under (the highest, 2-7/2-8, 0.28); every pair judged different measures 0.41 or over.
Across all of Worlds 1-6 the closest stretches between stages that are 0.28-0.32 apart are mostly ones a player would call alike
(3-7/3-9, 3-7/3-8, 2-3/2-8, 5-2/5-9 at 0.28-0.30), with a few that are not (2-1/2-2's stones against its moving logs at 0.31,
1-6/1-7 at 0.30): that is the grey band, and 0.30 sits at its middle.

On World 6's raw rolls (curate's builds, 12 rolls of each of the 8 stages, every roll against the same roll of every other stage),
labelling each window by the gen2 sections it covers:

| | old measure, 0.28 | new measure, 0.30 |
|---|---|---|
| roll pairs whose closest stretch made of **entirely different sections** matched (false alarms) | 37% | 4% |
| roll pairs with a stretch made of **the same sections** that matched | 68% | 54% |

(The same sections do not always play alike: a socket can fill with another animal, a piece can be mirrored.)

## Judged alike (should match)

| Pair | Old | New | Why it is the same to a player |
|---|---|---|---|
| 3-5 / 3-8, roll 1 | 0.00 | 0.02 | The same thorn-vine stretch: hop, two sleeping vines, a short jump over water, a vine, hops, three vines. One shared section. |
| 3-1 / 3-3, roll 2 | 0.00 | 0.00 | Climb, hop up, jump down over water, three times over in both: the same climbing piece. |
| 2-5 / 2-9, roll 2 | 0.04 | 0.11 | Three snappers, then hops onto moving logs across the river: the same crossing. |
| 2-7 / 2-8, roll 1 | 0.16 | 0.28 | Short jumps over water between river crossings in both (one moving log more in 2-7): the same stepping-stone river. |
| 1-5 / 1-9, roll 2 | 0.28 | 0.27 | Hops up and down, a climb, a short jump, a snake (a boa in 1-9): the same bank. |
| 4-1 / 4-6, roll 1 | 0.27 | 0.24 | A falling rock, then climb, rope, climb: the same cliff piece. |
| 4-2 / 4-4, roll 2 | 0.24 | 0.21 | A chain of lianas over water; 4-4 adds wind gusts between them. Still a liana chain. |
| 5-2 / 5-5, roll 2 | 0.12 | 0.18 | Four chair pulls, a humming thread, a spider, second jumps (a cocoon in 5-5): the same tea-room stretch. |
| 6-5 / 6-9, raw roll 1 | 0.05 | 0.05 | Tayra, hops, ocelot, the tide, a glide up over a pit: the same two sections (w6-cat-banks, w6-prowl-knees) in both stages. |
| 6-1 / 6-7, raw roll 12 | 0.05 | 0.13 | Two liana chains over water with glides between, from **different** sections (6-1: first-swing, perch-steps, swing-pair; 6-7: swing-chain, hump-run). A liana chain is a liana chain: this match is real, and it is why World 6's swing stages still meet each other (see below). |

## Judged different (should not match; the old measure matched every one)

| Pair | Old | New | Why it is different to a player |
|---|---|---|---|
| 4-1 / 4-4, roll 1 | 0.20 | 0.76 | Climbing a trunk past falling rocks, against a liana chain over water in wind gusts. The old letters read both as V and Z. |
| 4-1 / 4-2, roll 2 | 0.13 | 0.76 | Climb, rope, climb, rope, climb, against hops then a liana chain over water. To the old letters a climb and a liana were both V. |
| 1-4 / 1-6, roll 2 | 0.19 | 0.75 | Climbs and ropes, against hops then lianas over water. |
| 3-1 / 3-5, roll 2 | 0.19 | 0.68 | Spore clouds and the dark, against sleeping thorn vines. Both are Z to the old letters. |
| 5-2 / 5-3, roll 1 | 0.19 | 0.77 | Cakes, a butler, chair pulls, against a run of closing orchids. All P to the old letters. |
| 6-2 / 6-4, roll 1 | 0.10 | 0.74 | Glides over water under an eagle's sweep, against glides up over pits in the tide. |
| 6-2 / 6-4, roll 2 | 0.17 | 0.55 | Short jumps over water past frogs and an eagle sweep, against hops with the tide and a caiman. |
| 2-2 / 2-5, roll 1 | 0.09 | 0.59 | A jump over water then snakes on the bank, against moving logs then snappers in the river. |
| 5-5 / 5-6, roll 1 | 0.10 | 0.79 | Spiders, a humming thread, a liana and a cocoon, against a snake, a sticky web, an eagle, a climb and a fern search. |
| 2-1 / 2-2, roll 2 | 0.17 | 0.41 | Stepping stones over water (short jumps between river crossings), against moving logs. The World 2 lesson: the old measure read every water crossing the same. |

(Rolls are numbered from 1 here; `pairs.json`'s `roll` counts from 0. "Era roll": the game's layout number, era.ts's `rollVariants`;
"raw roll": curate's build of seed `rollVariants(12, 777)[roll]`, World 6's swing and ground kits as `w6GameKit` gives them.)

## What a player sees (the screenshots, 2026-10-29)

`sheets/<pair>.jpg`: each era-roll pair in the game (dev build, `__play(id, layout)`), three frames of each window (its first, middle
and last beats), landscape. The 6-1/6-7 and 6-5/6-9 pairs are curate's raw seeds, which the game cannot replay, so they have no sheet.

- **Alike, and it looks it**: 3-1/3-3 (the same stone blocks and gaps), 3-5/3-8 (the same thorn-vine ledge over the same pool),
  2-7/2-8 (the same river banks and channels), 4-2/4-4 (the same gorge, the same wind rock, the same vine), 5-2/5-5 (the same orchid
  floor with chairs). A player would say "I've done this bit".
- **Different, and it plays it**: 4-1/4-4 (a cliff climb against a flat gorge), 4-1/4-2, 1-4/1-6, 5-2/5-3 (chairs on a flat floor
  against closing orchids on steps), 2-1/2-2 (stepping stones across channels against a log bank upstream), 2-2/2-5, 5-5/5-6, 3-1/3-5
  (spore mushrooms and the dark against waking thorn vines).
- **Plays different, looks close: 6-2/6-4.** One art kit per world: both are the same mangrove root banks under the same canopy.
  What tells them apart is on the screen but small: 6-2's hiding bushes and narrow water slots (the eagle), 6-4's mud flats, tide
  warning and caiman. 3-1/3-5 is the same in World 3's cave. The measure is right that they play differently; whether they *look*
  copy-pasted is the art's job (decor sets per stage, STAGE-RULES §4 and §5b), not this measure's, and World 6's ground stages are
  the place to look first.

## What the measure still cannot see

- Timing inside a move: two liana chains with different vine spacing or periods read the same (the swing's own window is not a kind).
- Art: a creek in the mangroves and a creek in the canopy are the same beats. Set dressing is left out on purpose: a world's stages
  share one art kit, so it would only add noise.
- The route's own blind spots (STAGE-RULES §6 "What the 200-roll tool can't see"): a rock lying on a floor the route walks past.

`strips.svg` draws six of the pairs as beat strips (one chip per beat kind, grey for walking): the old letters alone made 4-1/4-4,
6-2/6-4 and 5-2/5-3 look as close as the real copies above them.
