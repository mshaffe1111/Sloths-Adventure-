# World 1 drop traps: the picture list (W1C, 2026-11-12). FOR MATT'S APPROVAL, nothing made yet

**What it is for.** 1-3 Branch Snakes: Pokey shakes a vine (or cuts a tendril) and a hive (or a stone) drops beside a snake, which
glides away. **Since 11-12 afternoon every snake is on a painted fallen LOG** (World 1's block log, 24-26 px thick, 170 px long under
a trap) lying on level ground: the load lands on the log's top, 24-26 px above the ground the handle stands on. A SLEEPING snake
lies at the end of the log nearest the vine, the load coming down a coil's width beyond it. The traps run in the engine today with **code-drawn stand-ins** (`src/game/castArt.ts`): they read, they are not painted.
Stills of the stand-ins in the real game (1-3, layout 1): `reference/qa-reports/W1C/stills/game-1-3-L1-trap0-*.jpg` (the lesson: before,
the trap, the glide, after) and `trap3`, `trap5`, `trap8` the same; `trap1/2/4/6/7-1-before`.

**How they would be made.** Hugging Face only (`reference/methods/hf-art.md`), never a Gemini prompt. **Matt approves every picture
before any spend.** Budget: $72 left in total, no top-ups, about $15 kept in reserve (`reference/art/HF-SPEND.md` holds the log). No
cost is estimated here: the art director prices the batch and asks the lead first.

**Sizes are against Pokey, who stands 89.1 px tall on screen.** Every picture: World 1's painted look (the mossy, warm-lit forest of
1-1), a clean cut-out on a clear background, lit from the upper left, no words, nothing frightening (story keeper: no stings, no
swarm chasing anyone).

| # | Picture | Size on screen (px) | Against Pokey | Pose and frames | Notes for whoever paints it |
|---|---|---|---|---|---|
| 1 | **The hive** (the load) | 46 wide x 50 tall | a little over half his height | (a) hanging, upright, seen from the side, a short stem at its top; (b) lying where it fell, tipped about 20 degrees, WHOLE (story keeper, 11-12: it lands whole and just buzzes; no bee harmed) | A wild bees' nest: papery, honey and amber bands, one dark doorway. Friendly, not a wasp nest. A few bees may sit ON it; none flying (the buzz is 5 code-drawn specks for 4 s). It must read against both green forest and pink sky |
| 2 | **The stone** (the other load) | 48 wide x 38 tall | under half his height | (a) hanging in a loop of vine; (b) lying where it fell | A round river stone, grey with a cap of moss. Heavy-looking, no sharp edges |
| 3 | **The vine handle** (he shakes it) | 26 wide x 200 tall, its end at his raised hand (about 42 px over the ground) | over twice his height | (a) at rest; (b) pulled, 2 frames of sway | A thick green liana with a leafy tuft at its end, plainly something to grab. It must look different from the lianas he CLIMBS and SWINGS on (thinner, with the tuft), or a player will try to climb it |
| 4 | **The tendril handle** (he cuts it) | 22 wide x 200 tall, tied to a peg at his feet | over twice his height | (a) taut, tied to a short wooden peg in the ground; (b) cut: a short curl by the peg | A thin taut creeper under tension, the peg and its knot clear at foot height: the knot is where he hits |
| 5 | **The link** (the vine from the handle over to the load) | about 190 wide x 40 tall, tiled or stretched | twice his height across | (a) holding the load: a sagging vine with two or three leaves; (b) let go: two short curls | It runs from a clump of leaves over the handle to a clump over the load. Today's clumps read a little like green umbrellas: the painted ones should look like the underside of a bough's foliage |
| 6 | **The leaf clump** (what the vine hangs from, x2) | about 70 wide x 30 tall | under his width | one frame | See 5. Nothing may run off the top of the screen (the lead's ruling, 11-12): the clump is the top of the trap |

## Where each piece is drawn today, its layer, its footing and its states (for the painted piece to drop in)
All in `src/game/castArt.ts` (castArt.ts itself unchanged since 0baa8fcf; ART-W1 is told before any of these boxes or lines move). The engine calls
`drawTraps` from `src/game/engine.ts:6931`, in the stage's own space, **behind the animals and in front of the ground and its
dressing** (pickups, the animals and Pokey draw over it). A trap's numbers come from its `TrapPost` (`src/game/castPlay.types.ts`):
`x, y` = the handle's foot on the ground he stands on; `loadX` = the load's line; `landY` = the ground it comes down on;
`loadY` = `landY - 100` (`gen2/worlds/w1Cast.ts:22` TRAP_HANG), the load's BOTTOM while it hangs. `top` = `loadY - 68`: the line the
link runs along and the clumps sit on. The trap's states (`dropTrap.ts` TrapPhase): `set`, `loose` (0.3 s: it shakes), `falling`, `down`.

| Piece | Drawn at | Footing (the point the engine places it by) | States it needs |
|---|---|---|---|
| Hive | `castArt.ts:15` `hive()`, called `:162-165` | bottom centre at (`loadX`, the load's y: `loadY` hanging, moving while it falls, `landY` down) | hanging (it sways +/-3 degrees; shakes +/-9 in `loose`), falling (same picture), down (tipped 20 degrees, WHOLE: story keeper) |
| Stone | `castArt.ts:34` `stone()`, called `:162-165` | the same | the same three |
| Vine handle | `castArt.ts:125-144` | hangs from (`x`, `top`) down to its tuft at (`x`, `y - 42`): the tuft is where he hits | set (sways 3 px, its tuft ringed by the pulse), loose (shakes), after (hangs still, no ring) |
| Tendril handle | `castArt.ts:146-158` | from (`x`, `top`) straight down to the peg at (`x`, `y`); the knot at `y - 50` is where he hits | set (taut), after (cut: a short curl on the peg, `:152-153`) |
| The pulse ("hit me") | `castArt.ts:178` `glow()` | a ring of radius 17-21 px on the tuft or the knot | only while set. **The lead's note (11:45): the handle itself must say "punch me", not only this ring** |
| Link (handle to load) | `castArt.ts:96-103`, its two leaves `:113-119` | from (`x`, `top`) sagging 30 px to (`loadX`, `top`); 140-190 px long | holding (set, loose), let go (two short curls, `:99-103`) |
| The cord the load hangs by | `castArt.ts:109-112` | (`loadX`, `top`) to the load's crown, 22 px | only while holding |
| Leaf clump / anchor, x2 | `castArt.ts:54` `clump()`, called `:160-161` | centre at (`loadX`, `top - 4`) and (`x`, `top - 4`); about 70 x 30 and 60 x 26 | one. **The lead's note: today they read as lamp posts or umbrellas, not rainforest** |
| The buzz | `castArt.ts:167-173` | 5 specks circling the fallen hive for 4 s | stays code-drawn (a small touch); no swarm, no stings |

**What he hits (do not paint outside it):** the handle's box is 44 px wide, from 8 to 120 px over his ground, centred on `x`
(`dropTrap.ts:14`). **What the load reaches:** 170 px either side of `loadX` on its ground (`dropTrap.ts:26`): nothing to paint.

**Six pictures, eleven frames.** The snake needs none: it uses today's Golden Tree Snake clips (its glide away is the prowl clip,
lifted, stretched and faded: a painted "flattened glide" frame would be a seventh picture if Matt wants it).

**Rules the pictures must keep (measured on phone stills, W1C):** the load hangs 100 px over its log and no higher, or a sideways
phone hides it behind the goal sign; the trap's TOP (the leaf clumps and the link) is today 68 px over the hung load's foot and
brushes the sign's lower rim sideways: the painted trap's highest point should be about 170 px over the handle's ground or less; from the handle the load is 140-190 px along, so both are on an upright phone's screen; no
pickup is laid on the handle's ledge or under the load (the trap is in plain view before it can be used).
