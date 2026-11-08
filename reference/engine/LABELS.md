# Labels for every piece kind, every world (designer, 11-05 ~10:43 AM ET)

These labels are keyed exactly to the planner's measured inventory: `reference/engine/INVENTORY.md`, engine-mixer da11cc4e (426 kinds,
102 stages). A landing's key is type + style + art. Its flags (pit=drop, catch, creak, crumbleAfter, lip, pillar, push, soil, chase,
moveRange, lift) are **uses**, not kinds. Every label cites its source: MATT (MATT-DIRECTION.md on ccr-0d59a91c-oy3imz), a spec
ruling (ENGINE-SPEC), INV (the inventory row), or SHIPPED (a commit).

## 0. Rules every label follows

1. **Rocks never float.** This covers every rock, stone, boulder, slab, ruin block, mound, bank and earth piece, in every world. Each
   sits on the ground, a bank, a drawn water bed, a drawn column or its own base down to something solid. (MATT 11-05; ENGINE-SPEC
   10:39 AM.)
2. **Platform pieces may float, in every world, with NO support needed** (MATT 11-06 via the lead, 11:29 AM: "if we have branches and other things that he walks on, I'm okay if they float. I actually think it looks cleaner"; supports optional, none added; a drawn trunk, stump or post reaches the ground; earth chunks wait on Matt's A/B answer) (re-set 5:31 PM to MATT 11-05, via the lead: "if they're part of the platforms, they can float... I just don't want secondary objects like rocks and other things, lily pads, to be floating"; matches engine-core's catalog.ts 8cb80cf25). Every platform he stands on (a bough, limb, shelf, log or plank) may float. A secondary object (a stone, a mushroom, a pad, a prop, dressing) still stands on something. 1-1's 25.3% float line is 1-1's own line, not a cap on other stages (NODES §7.3). Was: **Platform pieces may float, under the stage's float cap:** logs, planks, boughs, bridges' planks and their kin. (MATT 11-05: "I
   understand the floating logs... A platform needs platforms.")
3. **Water pieces only on a drawn water zone:** lily, reed, drift logs and pool logs. (MATT: "lily pads only on water"; engine-render's
   padsOffWater test.)
4. **Theme lock** (widened by MATT, 11-05 ~5:40 PM ET: a piece stays in the world it was designed for, unless it adds something there): a `wN…` dressing prop is World N's own art and is used only in World N. A kind with no world prefix may go in the
   worlds it ships in today (the INV column), plus any world the element table allows. (MATT 11-05: "It can't just be using any piece
   from any world"; "no lava in the forest".)
5. **Hanging is core** (a sloth game): vines, lianas and ropes are pieces of their own. A trunk is an anchor, never a landing.
6. **Dressing is never a landing**, and never sits in the hero's lane or on a landing's top (P-6, S-1).

## 1. Landings (60 inventory keys → 17 base kinds; flags are uses)

| Base kind (type + style/art) | Inventory keys it covers | Element / footing | May float | Uses (from its flags) | Worlds (INV, plus what the element allows) | Notes and rulings |
|---|---|---|---|---|---|---|
| solid log | solid log, log pit=drop, log push | ground / floor, stump-post, bank; or floating | **yes** (platform) | landing, rest, ground-fork high road, pit edge (pit=drop), push block (push, from 1-6) | all W1-W10 (INV: 90 stages) | the commonest landing in the game. Push logs: echo rule (ladder) |
| solid log art=stilt / branch art=stilt | log art=stilt, branch art=stilt | built / stands on drawn stilts to the water | no | the 6-8 Stilt Climb's landings | W6 (6-8, hand-built special) | kept as built |
| solid log art=steps | log art=steps | built / bank village | no | stairs up the bank houses | W2 | kept |
| solid log art=poolLog | log art=poolLog | water / a drawn pool | no (on water) | pool crossing | W4 (4-3) | water rule 3 |
| drift log | drift log drift | water / a river surface | no (on water) | the river crossing that moves | W2 now; the ladder returns it in W6 and W8 ponds | needs a drawn river (rivers row) |
| solid branch (bough) [re-set 5:31 PM: may float in every world (rule 2); the stone-thin-world 'no' is gone; see §8's open point] | branch, branch pit=drop, branch catch (pit=drop), branch lip | tree / a trunk within 220 px, or a post; or floating where it reads cleaner | **yes** (platform) | landing, stair, canopy road, catch under a teach gap (catch), ledge lip (lip) | all W1-W10 (INV: 58 stages) | trunk rule (≤ 3 full trunks per 1,400 px) |
| branch art=frond / art=orchid / art=post lip | | tree / frond and orchid on a trunk; post lip on a porch post | **yes** for frond and orchid (platforms; re-set 5:31 PM, rule 2); the post lip stands on its post | W4 frond ledge; W5 orchid shelves; W2 porch posts | W4, W5, W2 respectively (each its own art) | theme-locked |
| solid branch pillar / moss_stone pillar | | ground / stands on its drawn pillar | no | the 4-10 lair's pillars | W4 | stone on a pillar is supported |
| canopy_bridge | canopy_bridge (+ catch, pit=drop, hidden) | tree / plank span; ends on posts or boughs where drawn | **yes, as planks** | span, canopy road | W1, W5, W8, W9, W10 | a rope or post end drawn dangling in air is a P-2 fault: draw posts, or plank only |
| fragile branch creak (creaky) | fragile branch, creak, crumbleAfter, pit=drop creak | tree / trunk or bough | **yes** (platform; re-set 5:31 PM, rule 2) | a landing that gives way; the canopy breakable | W1 (taught 1-2; SHIPPED 6dae405d), W7, W8, W10 | W1's breakable art is W1 branch art (SHIPPED acf6e1e8) |
| bouncy (mushroom) | bouncy - | ground / the floor, a bank, stump or log | no | bounce up (taught 1-1 n4) | W1, W3, W4, W7 | |
| bouncy branch / log / canopy_bridge | | tree or plank, as its style | yes, as its style | bounce off a springy limb | W5, W7-W10 | |
| solid moss_stone | moss_stone, moss_stone pit=drop, soil, art=rock | **ground (stone) / the floor, a bank or its own base** | **NO** | step, rise, landing; `soil` = earth under it | all W1-W10 (INV: 76 stages, about 2,800 placed) | **The largest no-float kind in the game.** Any one with nothing solid under it breaks rule 1, so E3 must count them (section 4) |
| moss_stone art=boulder push / moss_stone push | | ground / the floor | no | push puzzle | W4 | push echo rule |
| solid ruin | ruin, ruin art=hidden | ground (stone) / the floor, a column or its own base | **NO** | landing, temple floor | W5 (3), W7-W10 | needs a drawn column or base where it bridges a gap |
| fragile ruin crumbleAfter (crumbling floor) | fragile ruin, crumbleAfter, pit=drop crumbleAfter | ground (stone) / a floor or column | **NO** | crumbling floor (W7's teach, 7-1) | W7 home; W8-W10 return (ruins). **Never W1** (SHIPPED acf6e1e8; ENGINE-SPEC 10:09 AM) | 1-5's 4 `fragile ruin` are a breach: replace them with W1 creaky |
| fragile moss_stone / bouncy moss_stone / bouncy ruin | | ground (stone) / as above | **NO** | a breaking or bouncing stone | W5, W7-W10 | a bouncing stone: "a rock bounces you" reads oddly. **RULED by MATT, 11-05 ~5:40 PM ET:** "unless it adds something, then that should stay with the world that it was designed for." So it stays in W5 and W7-W10 only; never in W1 |
| moving log / canopy_bridge (moveRange), moving art=lift | | built or plank / a track or rope | yes, as a platform that moves | moving platform (planned teach 2-7, R-164.9); the lift (2-7) | W2, W5, W6, W8, W9 | |
| moving moss_stone / moving ruin | | stone that moves through the air | **NO: breaks rule 1** | — | W7, W9, W10 today (INV) | **Not used in new stages.** Today's 5 placements go on the known list; their moving-platform job goes to a log, plank or lift kin |
| solid - art=kit / porch / lily / hidden / chase / crown | kit (puzzle-kit pieces), porch (W2 houses), lily (water), hidden (secret), chase (1-8), crown (1-8) | as their art: kit = built ground, porch = built, lily = water | no | puzzle rooms; the bank village; lily pads; secrets; the 1-8 chase set piece | as INV | kept as built; lily on water only |
| fungus_shelf / roost_branch | | tree / a trunk (a bracket shelf, a roost limb) | **yes** (platforms; re-set 5:31 PM, rule 2) | W8 night-forest landings | W8 | theme-locked |

## 2. Climb, hang and swing

| Kind (INV key) | Element / footing | May float | Uses / teaches | Worlds | Fit rule |
|---|---|---|---|---|---|
| vine tree_climb (and `kit`, `kit off`) | tree / hangs from a bough or the trunk top; its foot reaches a landing | no | climb (taught 1-4) | all W1-W10 (INV: 71 stages) | top never in open sky; no climbing vine in 1-1 (ENGINE-SPEC 10:09 AM) |
| vine tree_climb rope | built or tree / a rope down a cliff or tower | no | climb | W4, W8 | anchored at the top |
| vine swing_liana | tree / anchored to a bough or the canopy | no | swing (taught 1-2; SHIPPED d272601f) | all W1-W10 (INV: 56 stages) | a landing past its arc |
| vine swing_liana silk | W5 silk / anchored to a web or a branch | no | silk line (taught 5-4) | W5 only | World 5's own kit |
| rope, rope required | tree or built / two anchors at the same height (± 40 px) | no | shimmy (taught on clearing 1-3; required from 1-4) | W1-W4, W8-W10 (INV) | the ladder returns it in W5-W7 |
| trunk (proto.trunks, trees) | tree / the floor | — (an anchor) | holds boughs, vines and lianas | all worlds | never a landing; ≤ 3 full trunks per 1,400 px |
| hollow log (proto.hollows; w1-new atlas) | ground / seated on the floor | no | a two-road split: walk inside, run on top | W1, W3, W4 (INV), plus W6 and W8 where the art fits | needs two open ends, or it is a hide spot only; no trunk within its width + 40 px |

## 3. Air, zones, water and set pieces

| Kind (INV) | Element | Footing / rule | Worlds | Teaches |
|---|---|---|---|---|
| updrafts, drafts47 (across, bonus, rock, up) | air | open drop space under it; needs the glide | W4 now; the ladder adds W8 and W9 vents | warm air (4-7) |
| zones: wind | air | cliffs and tops | W4; returns W8 tops and W10 steps — **[revised 1:14 PM ET, ruling 3] teach world, then every later world as a twist, in that world's own art (an art gap is listed, never filled with another world's art)** | wind (4-2) |
| zones: dark, spore | cave | caves and the dark forest | dark: W3, W5 (1), W6, W8; spore: W3 — **[revised 1:14 PM ET, ruling 3] teach world, then every later world as a twist, in that world's own art (an art gap is listed, never filled with another world's art)** | 3-1 |
| zones: web | W5 | between trunks | W5 only — **[revised 1:14 PM ET, ruling 3] teach world, then every later world as a twist, in that world's own art (an art gap is listed, never filled with another world's art)** | 5-6 |
| zones: tide; water tides43; falls43 (plug, pool, surge, tide) | water | a drawn water body | W6 (tide); W4 (4-3 falls) — **[revised 1:14 PM ET, ruling 3] teach world, then every later world as a twist, in that world's own art (an art gap is listed, never filled with another world's art)** | 6-4; 4-3 |
| zones: crumble | stone | temple floors | W7; returns W10 fortress — **[revised 1:14 PM ET, ruling 3] teach world, then every later world as a twist, in that world's own art (an art gap is listed, never filled with another world's art)** | 7-1 |
| zones: geyser | heat | heat rock | W9 only — **[revised 1:14 PM ET, ruling 3] teach world, then every later world as a twist, in that world's own art (an art gap is listed, never filled with another world's art)** | 9-1 |
| zones: bolt | storm | open sky | W10 only — **[revised 1:14 PM ET, ruling 3] teach world, then every later world as a twist, in that world's own art (an art gap is listed, never filled with another world's art)** | 10-1 |
| rivers | water | a drawn river; its banks at both ends | W2 now; W6 and W8 | river logs 2-1 |
| proto.thorns | tree (thorn vine) | hangs or swings from trunks | W3 now; returns W6 roots, W10 wire — **[revised 1:14 PM ET, ruling 3] teach world, then every later world as a twist, in that world's own art (an art gap is listed, never filled with another world's art)** | 3-4 |
| fallZones, proto.catches, proto.covers, glints, leaves, lanes, links, bowlGates, stilt (6-8 dressing set), stiltLedges | engine helpers or set dressing | kept as built | as INV | — |
| pickups (collectibles: flower, heart, find, relic, seed, cage, exit_totem, thorn_gate, power-ups) | — | over a standable piece or on a path's arc, never inside a piece; hearts only after risk; the exit totem on a long ground piece | as INV | as their lessons |
| animals (enemies) | as the animal | on their element: snakes, boas and tayras on boughs or ground; caimans, turtles and frogs at water; harpies and eagles in open sky; jaguars and ocelots on ground; spiders on webs (W5) | anywhere taught, where the element fits | as the ladder |

## 4. Float caps per world: OPEN until a good reference sets them (revised 11:40 AM ET, the lead's challenge)

**The earlier rule ("the cap is today's share, rounded up") is withdrawn.** engine-runs topic 4 (5051f41a) measured today's floating
share per world: W1 37%, W2 10, W3 5, W4 19, W5 29, W6 2, W7 22, W8 10, W9 55 and W10 62. W9 and W10 float the most **and** score the
lowest on variety (0.27 and 0.17). Writing today's share into the cap would shape the rule to fit the defect, which is law 22 in reverse.

**How each world's cap is set (OPEN until one of these answers it, never by judgment):**
1. **A good reference, measured:** the old 1-1 (Matt's bar; its floating share is measured by engine-runs with the same tool), and each
   world's best-rated stages (Matt's and the quality supervisor's ratings, where they exist).
2. **Shipped games:** research-pacing and research-moves report the floating-platform share of comparable courses (Mario, DKC, Rayman).
3. **Until set, the interim line is the old 1-1's measured share.** No new stage may exceed it, and today's stages over it go on the
   known list. A world may go below it with its element's reason (W6 swamp, W3 caves).

**Rules that hold in any case:**
- Stones never count toward the cap and never float (rule 1).
- The mixer's 1-5 lays about 40 never-float pieces floating per build (creaky, bridges, the W7 slab). That is an E3 **fail now**, not a
  cap question.
- **E3 reads the real art bounds**, not only the platform list. A support drawn only in the art (a painted root, post or trunk under a
  piece) counts, and a piece whose art shows nothing under it is floating whatever the data says. The tool's present blind spot is named,
  and the planner fixes it before E3's numbers are trusted (D15).

## 5. Dressing props (286 rows, every one): labelled by family, theme-locked by prefix

Every row: dressing, never a landing, never in the hero's lane. A row's family sets its element and footing. Stones never float; hangers
never hang from open sky; fliers are the only dressing that may sit in open air.

| array | key | element | footing | floats | use | worlds allowed | ships in (INV) | first |
|---|---|---|---|---|---|---|---|---|
| dress | w10Banner | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W10 only (its own art) | W10 | 10-2 |
| dress | w10Brazier | ground (metal) | on the ground; never floats | no | dressing (never a landing) | W10 only (its own art) | W10 | 10-1 |
| dress | w10Cage | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W10 only (its own art) | W10 | 10-1 |
| dress | w10Crate | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W10 only (its own art) | W10 | 10-1 |
| dress | w10Crates | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W10 only (its own art) | W10 | 10-2 |
| dress | w10Rack | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W10 only (its own art) | W10 | 10-1 |
| dress | w5BankA1 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) |  | 5-6 |
| dress | w5BankA2 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) |  | 5-6 |
| dress | w5BankB1 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-6 |
| dress | w5BankB2 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) |  | 5-6 |
| dress | w5BankB3 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-6 |
| dress | w5Bench | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-6 |
| dress | w5Birdbath | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) |  | 5-6 |
| dress | w5BookStack | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-6 |
| dress | w5ButterflyBush | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W5 only (its own art) |  | 5-6 |
| dress | w5ClutA1 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) |  | 5-6 |
| dress | w5ClutA2 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) |  | 5-6 |
| dress | w5ClutB1 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) |  | 5-6 |
| dress | w5ClutB2 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) |  | 5-6 |
| dress | w5ClutB3 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) |  | 5-6 |
| dress | w5CupChime | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-6 |
| dress | w5FernPot | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-6 |
| dress | w5Hang1 | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-8 |
| dress | w5Hang2 | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-8 |
| dress | w5Ladybug | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W5 only (its own art) |  | 5-6 |
| dress | w5Lanterns | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-6 |
| dress | w5Petals | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W5 only (its own art) |  | 5-6 |
| dress | w5Pots | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-6 |
| dress | w5Spool | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-6 |
| dress | w5Teacups | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-6 |
| dress | w5TeaTin | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-6 |
| dress | w5Thimbles | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-6 |
| dress | w5WateringCan | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-6 |
| dress | w7Banner | tree (hanging) | hangs from a bough, the canopy, a roof, a hook or a cave ceiling; never open sky | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-2 |
| dress | w7BellVine | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-2 |
| dress | w7Capuchin | ground or tree (creature) | stands on the ground or a bough; perches never in open air | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-2 |
| dress | w7Censer | tree (hanging) | hangs from a bough, the canopy, a roof, a hook or a cave ceiling; never open sky | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-2 |
| dress | w7FrogIdol | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) |  | 7-2 |
| dress | w7LizardBlock | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) |  | 7-2 |
| dress | w7MonkeyStatue | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-2 |
| dress | w7StoneLantern | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) |  | 7-2 |
| dress | w7Tablet | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-2 |
| dress | w8Curtain | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W8 only (its own art) | W8 | 8-7 |
| dress | w8FireflyB | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W8 only (its own art) | W8 | 8-7 |
| dress | w8FlowersB | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W8 only (its own art) | W8 | 8-7 |
| dress | w8NestB | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W8 only (its own art) | W8 | 8-7 |
| dress | w9Fern | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W9 only (its own art) | W9 | 9-1 |
| dress | w9FernB | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W9 only (its own art) | W9 | 9-2 |
| dress | w9Log | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W9 only (its own art) | W9 | 9-3 |
| dress | w9LogB | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W9 only (its own art) | W9 | 9-4 |
| dress | w9Obsidian | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W9 only (its own art) | W9 | 9-1 |
| dress | w9ObsidianB | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W9 only (its own art) | W9 | 9-2 |
| dress | w9Smoke | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W9 only (its own art) | W9 | 9-3 |
| dress | w9SmokeB | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W9 only (its own art) | W9 | 9-4 |
| dress | w9Tree | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W9 only (its own art) | W9 | 9-1 |
| dress | w9TreeB | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W9 only (its own art) | W9 | 9-2 |
| proto.bushes | fern | ground (plant) | grows from the ground, a bank or a trunk | no | hide cover (taught 1-7; a hide bush, never a landing) | where shipped: W1,W4 | W1,W4 | 1-7 |
| proto.bushes | grotto | ground (plant) | grows from the ground, a bank or a trunk | no | hide cover (taught 1-7; a hide bush, never a landing) | where shipped: W3 | W3 | 3-2 |
| proto.bushes | tall | ground (plant) | grows from the ground, a bank or a trunk | no | hide cover (taught 1-7; a hide bush, never a landing) | where shipped: W1,W4,W6,W8 | W1,W4,W6,W8 | 1-7 |
| proto.bushes | wide | ground (plant) | grows from the ground, a bank or a trunk | no | hide cover (taught 1-7; a hide bush, never a landing) | where shipped: W1,W4,W6,W8 | W1,W4,W6,W8 | 1-7 |
| proto.decor | archway | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-9 |
| proto.decor | banner | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-9 |
| proto.decor | bell | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-6 |
| proto.decor | canopy | tree (hanging) | hangs from a bough, the canopy, a roof, a hook or a cave ceiling; never open sky | no | dressing (never a landing) | where shipped: W2 | W2 | 2-4 |
| proto.decor | chimney | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-1 |
| proto.decor | dais | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-9 |
| proto.decor | door | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-1 |
| proto.decor | doorRoof | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-6 |
| proto.decor | gong | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | where shipped: W2 | W2 | 2-9 |
| proto.decor | lantern | tree (hanging) | hangs from a bough, the canopy, a roof, a hook or a cave ceiling; never open sky | no | dressing (never a landing) | where shipped: W2 | W2 | 2-6 |
| proto.decor | laundry | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | where shipped: W2 | W2 | 2-1 |
| proto.decor | lilyCarpet | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-9 |
| proto.decor | limbShort | tree (on a trunk or bough) | fixed to a trunk or bough | no | dressing (never a landing) | where shipped: W2 | W2 | 2-4 |
| proto.decor | logShort | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-1 |
| proto.decor | mailbox | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-1 |
| proto.decor | pole | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-1 |
| proto.decor | porch | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-7 |
| proto.decor | reedLean | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-1 |
| proto.decor | reedShort | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-1 |
| proto.decor | reedTall | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-1 |
| proto.decor | rooftop | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-6 |
| proto.decor | sign | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-1 |
| proto.decor | steps | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-1 |
| proto.decor | swingFrame | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-7 |
| proto.decor | throne | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | where shipped: W2 | W2 | 2-9 |
| proto.decor | window | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W2 | W2 | 2-1 |
| proto.dress | w1Acorns | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1Beetle | ground or tree (creature) | stands on the ground or a bough; perches never in open air | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-2 |
| proto.dress | w1BerryHang | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-5 |
| proto.dress | w1Bromeliad | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1Coati | ground or tree (creature) | stands on the ground or a bough; perches never in open air | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1FallenLog | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1Fern | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1FernHang | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-2 |
| proto.dress | w1Fiddle | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1FlowerBush | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1Hang1 | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-2 |
| proto.dress | w1Hang2 | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-2 |
| proto.dress | w1Heliconia | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1LeafLitter | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1Morpho | ground or tree (creature) | stands on its own drawn base on the ground or a bough | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1MossBoulder | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1Mushroom | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1MushroomDim | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1MushroomTall | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1NestHang | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-2 |
| proto.dress | w1NutPod | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1OrchidHang | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-4 |
| proto.dress | w1Pebble | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1Pinecone | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1SeedPods | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1Snail | ground or tree (creature) | stands on its own drawn base on the ground or a bough | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1Sprig | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1Stones | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1Stump | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1Termites | ground (earth mound) | on the ground; never floats | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1Toucan | ground or tree (creature) | stands on the ground or a bough; perches never in open air | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1TrailPost | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1TreeFrog | ground or tree (creature) | stands on the ground or a bough; perches never in open air | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w1WoodStump | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W1 only (its own art) | W1 | 1-1 |
| proto.dress | w2BasketHang | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-6 |
| proto.dress | w2Canoe | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-1 |
| proto.dress | w2CattailFly | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-1 |
| proto.dress | w2Crab | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-3 |
| proto.dress | w2Driftwood | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-1 |
| proto.dress | w2Fern | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-2 |
| proto.dress | w2FishTrap | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-1 |
| proto.dress | w2Frog | ground or tree (creature) | stands on the ground or a bough; perches never in open air | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-4 |
| proto.dress | w2GourdHang | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-6 |
| proto.dress | w2Hang1 | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W2 only (its own art) |  | 2-6 |
| proto.dress | w2Hang2 | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W2 only (its own art) |  | 2-6 |
| proto.dress | w2Heron | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-1 |
| proto.dress | w2KingfisherPost | ground or tree (creature) | stands on the ground or a bough; perches never in open air | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-1 |
| proto.dress | w2LilyBucket | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-1 |
| proto.dress | w2Log | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-1 |
| proto.dress | w2MossDrip | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-6 |
| proto.dress | w2NetHang | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-6 |
| proto.dress | w2Otter | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-1 |
| proto.dress | w2Raft | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-1 |
| proto.dress | w2ReedBundle | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-1 |
| proto.dress | w2ReedLean | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-2 |
| proto.dress | w2ReedShort | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-1 |
| proto.dress | w2ReedTall | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-2 |
| proto.dress | w2RiverStone | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W2 only (its own art) |  | 2-4 |
| proto.dress | w2SignPost | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-1 |
| proto.dress | w2Stone | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-1 |
| proto.dress | w2Stones | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-2 |
| proto.dress | w2Turtle | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-1 |
| proto.dress | w2WaterJar | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W2 only (its own art) | W2 | 2-3 |
| proto.dress | w3BeadMoss | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W3 only (its own art) | W3 | 3-4 |
| proto.dress | w3Cricket | ground or tree (creature) | stands on the ground or a bough; perches never in open air | no | dressing (never a landing) | W3 only (its own art) | W3 | 3-1 |
| proto.dress | w3CrystalDrip | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W3 only (its own art) | W3 | 3-4 |
| proto.dress | w3Crystals | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W3 only (its own art) | W3 | 3-1 |
| proto.dress | w3Fossil | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W3 only (its own art) | W3 | 3-1 |
| proto.dress | w3Geode | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W3 only (its own art) | W3 | 3-1 |
| proto.dress | w3GlowMoss | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W3 only (its own art) | W3 | 3-1 |
| proto.dress | w3GlowShrooms | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W3 only (its own art) | W3 | 3-1 |
| proto.dress | w3GlowStalks | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W3 only (its own art) | W3 | 3-1 |
| proto.dress | w3GlowStone | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W3 only (its own art) | W3 | 3-1 |
| proto.dress | w3GlowWorms | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W3 only (its own art) | W3 | 3-1 |
| proto.dress | w3OldNest | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W3 only (its own art) | W3 | 3-1 |
| proto.dress | w3Pebbles | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W3 only (its own art) | W3 | 3-1 |
| proto.dress | w3RootBoulder | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W3 only (its own art) | W3 | 3-1 |
| proto.dress | w3RootGlow | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W3 only (its own art) | W3 | 3-3 |
| proto.dress | w3ShardsGlow | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W3 only (its own art) | W3 | 3-1 |
| proto.dress | w3Stalagmites | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W3 only (its own art) | W3 | 3-1 |
| proto.dress | w4BellHang | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W4 only (its own art) | W4 | 4-1 |
| proto.dress | w4BellOne | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W4 only (its own art) | W4 | 4-1 |
| proto.dress | w4BoulderMoss | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W4 only (its own art) | W4 | 4-2 |
| proto.dress | w4Cairn | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W4 only (its own art) | W4 | 4-1 |
| proto.dress | w4Feather | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W4 only (its own art) | W4 | 4-1 |
| proto.dress | w4FernTuft | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W4 only (its own art) | W4 | 4-2 |
| proto.dress | w4LeafHang | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W4 only (its own art) | W4 | 4-1 |
| proto.dress | w4Lizard | ground or tree (creature) | stands on the ground or a bough; perches never in open air | no | dressing (never a landing) | W4 only (its own art) | W4 | 4-2 |
| proto.dress | w4Marmot | ground or tree (creature) | stands on the ground or a bough; perches never in open air | no | dressing (never a landing) | W4 only (its own art) | W4 | 4-2 |
| proto.dress | w4MossStones | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W4 only (its own art) | W4 | 4-2 |
| proto.dress | w4RopePost | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W4 only (its own art) | W4 | 4-2 |
| proto.dress | w4SeedGrass | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W4 only (its own art) | W4 | 4-2 |
| proto.dress | w4SlateChips | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W4 only (its own art) | W4 | 4-2 |
| proto.dress | w4Thistle | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W4 only (its own art) | W4 | 4-2 |
| proto.dress | w4Totem | ground (wood post, eagle carving) | on the ground | no | dressing (never a landing) | W4 only (its own art) | W4 | 4-2 |
| proto.dress | w4VineHang | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W4 only (its own art) | W4 | 4-1 |
| proto.dress | w4WindShrub | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W4 only (its own art) | W4 | 4-2 |
| proto.dress | w5BankA1 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5BankA2 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5BankA3 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5BankB1 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5BankB2 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5BankB3 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5Bench | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5Birdbath | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5BookStack | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5ButterflyBush | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5Buttons | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5ClutA1 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5ClutA2 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-2 |
| proto.dress | w5ClutA3 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5ClutB1 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5ClutB2 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5ClutB3 | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5FernPot | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5Ladybug | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5Petals | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-2 |
| proto.dress | w5Pots | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5Ribbon | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-2 |
| proto.dress | w5Spool | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5Sugar | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-2 |
| proto.dress | w5Teacups | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-2 |
| proto.dress | w5TeaTin | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-2 |
| proto.dress | w5Thimbles | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5WateringCan | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-1 |
| proto.dress | w5Wheelbarrow | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W5 only (its own art) | W5 | 5-2 |
| proto.dress | w6AirPlants | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W6 only (its own art) |  | 6-8 |
| proto.dress | w6BromeliadRoot | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W6 only (its own art) | W6 | 6-1 |
| proto.dress | w6DriftRoot | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W6 only (its own art) | W6 | 6-1 |
| proto.dress | w6MudLilies | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W6 only (its own art) | W6 | 6-2 |
| proto.dress | w6Mudskipper | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W6 only (its own art) | W6 | 6-1 |
| proto.dress | w6NestBasket | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W6 only (its own art) | W6 | 6-8 |
| proto.dress | w6OrchidSpray | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W6 only (its own art) |  | 6-8 |
| proto.dress | w6OysterRoot | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | W6 only (its own art) | W6 | 6-1 |
| proto.dress | w6Pitchers | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W6 only (its own art) | W6 | 6-1 |
| proto.dress | w6Pods | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W6 only (its own art) | W6 | 6-1 |
| proto.dress | w6SnailRock | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W6 only (its own art) | W6 | 6-1 |
| proto.dress | w6StakeLantern | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W6 only (its own art) | W6 | 6-1 |
| proto.dress | w6SwampFerns | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W6 only (its own art) | W6 | 6-1 |
| proto.dress | w6WeaverNest | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | W6 only (its own art) | W6 | 6-8 |
| proto.dress | w6WetLeaves | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W6 only (its own art) | W6 | 6-1 |
| proto.dress | w7Altar | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-1 |
| proto.dress | w7Capuchin | ground or tree (creature) | stands on the ground or a bough; perches never in open air | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-1 |
| proto.dress | w7Coins | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-1 |
| proto.dress | w7FrogIdol | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-1 |
| proto.dress | w7IdolHead | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-1 |
| proto.dress | w7JaguarHead | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-1 |
| proto.dress | w7LizardBlock | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-1 |
| proto.dress | w7Macaw | ground or tree (creature) | stands on the ground or a bough; perches never in open air | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-1 |
| proto.dress | w7MonkeyStatue | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-1 |
| proto.dress | w7Offering | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-1 |
| proto.dress | w7PillarStub | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-1 |
| proto.dress | w7Shards | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-1 |
| proto.dress | w7StoneBall | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-1 |
| proto.dress | w7StoneLantern | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-1 |
| proto.dress | w7Tablet | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-1 |
| proto.dress | w7UrnTall | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | W7 only (its own art) | W7 | 7-1 |
| proto.dress | w8Firefly | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W8 only (its own art) | W8 | 8-2 |
| proto.dress | w8FireflyB | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W8 only (its own art) | W8 | 8-1 |
| proto.dress | w8Flowers | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W8 only (its own art) | W8 | 8-1 |
| proto.dress | w8FlowersB | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | W8 only (its own art) | W8 | 8-1 |
| proto.dress | w8Fungus | tree (on a trunk or bough) | fixed to a trunk or bough | no | dressing (never a landing) | W8 only (its own art) | W8 | 8-1 |
| proto.dress | w8Hollow | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W8 only (its own art) | W8 | 8-1 |
| proto.dress | w8HollowB | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W8 only (its own art) | W8 | 8-2 |
| proto.dress | w8Nest | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W8 only (its own art) | W8 | 8-2 |
| proto.dress | w8NestB | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | W8 only (its own art) | W8 | 8-1 |
| proto.kitDecor | basin | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | where shipped: W3 | W3 | 3-1 |
| proto.kitDecor | branchGate | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W1 | W1 | 1-6 |
| proto.kitDecor | bridge | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W4 | W4 | 4-2 |
| proto.kitDecor | bridgeBroken | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W4 | W4 | 4-1 |
| proto.kitDecor | fern2 | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | where shipped: W3 | W3 | 3-2 |
| proto.kitDecor | fern4 | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | where shipped: W3 | W3 | 3-1 |
| proto.kitDecor | fernDoorShut | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | where shipped: W3 | W3 | 3-7 |
| proto.kitDecor | nestDoorShut | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W1 | W1 | 1-4 |
| proto.kitDecor | petalBundle | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W1 | W1 | 1-4 |
| proto.kitDecor | pool | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | where shipped: W3 | W3 | 3-2 |
| proto.kitDecor | slab | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | where shipped:  |  | 3-2 |
| proto.kitDecor | slabStones | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | where shipped: W3 | W3 | 3-1 |
| proto.kitDecor | steppingStones | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | where shipped: W3 | W3 | 3-2 |
| proto.mixDress | bootprint | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W1 | W1 | 1-1 |
| proto.mixDress | squirrel-sit | ground or tree (creature) | stands on the ground or a bough; perches never in open air | no | dressing (never a landing) | where shipped: W1 | W1 | 1-1 |
| proto.mixDress | squirrel-tip | ground or tree (creature) | stands on the ground or a bough; perches never in open air | no | dressing (never a landing) | where shipped: W1 | W1 | 1-1 |
| proto.mixDress | squirrel-wave | ground or tree (creature) | stands on the ground or a bough; perches never in open air | no | dressing (never a landing) | where shipped: W1 | W1 | 1-1 |
| proto.w3decor | bones | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | where shipped: W3 | W3 | 3-7 |
| proto.w3decor | clawRock | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | where shipped: W3 | W3 | 3-2 |
| proto.w3decor | fern | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | where shipped: W3 | W3 | 3-1 |
| proto.w3decor | glowLit | tree (hanging) | hangs from a bough, the canopy, a roof, a hook or a cave ceiling; never open sky | no | dressing (never a landing) | where shipped: W3 | W3 | 3-1 |
| proto.w3decor | grottoMouth | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | where shipped: W3 | W3 | 3-1 |
| proto.w3decor | mossCurtain | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | where shipped: W3 | W3 | 3-2 |
| proto.w3decor | mushrooms | ground (plant) | grows from the ground, a bank or a trunk | no | dressing (never a landing) | where shipped: W3 | W3 | 3-2 |
| proto.w3decor | pawprint | ground (built or wood) | on the ground, a porch, a bank or a ledge | no | dressing (never a landing) | where shipped: W3 | W3 | 3-1 |
| proto.w3decor | pillar | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | where shipped: W3 | W3 | 3-9 |
| proto.w3decor | pillarBroken | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | where shipped: W3 | W3 | 3-9 |
| proto.w3decor | pillarCracked | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | where shipped: W3 | W3 | 3-9 |
| proto.w3decor | ringWall | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | where shipped: W3 | W3 | 3-9 |
| proto.w3decor | stalactite | tree (hanging) | hangs from a bough, the canopy, a roof or a line; never open sky | no | dressing (never a landing) | where shipped: W3 | W3 | 3-1 |
| proto.w3decor | stalagmites | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | where shipped: W3 | W3 | 3-1 |
| proto.w3decor | trickle | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | where shipped: W3 | W3 | 3-4 |
| proto.w3decor | wallTile | ground (stone) | on the ground, a ledge or its own drawn base; never floats (Matt) | no | dressing (never a landing) | where shipped: W3 | W3 | 3-4 |
| waterSigns | waterSigns | water (edge or surface) | on a drawn water surface or its bank edge | no | dressing (never a landing) | where shipped: W1,W2,W3,W4,W5 | W1,W2,W3,W4,W5 | 1-3 |
| proto.decor | (none) | — | an unnamed decor entry in W2 | — | dressing | W2 | W2 | — |

**How §5 was checked (designer, 11-05 ~10:47 AM ET, after Matt's "not half-ass anything").** The first cut sorted by key-name families,
and only a sample was read. Every row has now been checked against its real art:
- contact sheets of every frame, with key names and the atlas's own `hang` flag, in `reference/engine/labels/sheets/`;
- the sources were dressNewData (W1-W7), dressAtlasData (W1, W2, W5, W8-W10), w2PropsData, w3PropsData and puzzleAtlasData;
- the 4 hide bushes were checked from engine.ts drawBushArt and drawW3Fern.

**27 rows were corrected from the art**, plus the 4 bushes' use. The overrides are in `reference/engine/labels/props.py` (OV).
- Drawn on a base, not flying: w1Morpho, w4Feather, w5Petals, w5Ladybug, w8Firefly, w8FireflyB.
- Creature on its own base: w1Snail.
- Earth or stone, not creature or plant: w1Termites, w3OldNest, w3GlowWorms, grottoMouth, basin.
- Water edge: w2CattailFly, dais, trickle.
- Hanging: w7Banner, w7Censer, lantern, canopy, glowLit.
- Fixed to a trunk or bough: w8Fungus, limbShort.
- On the ground: w4Totem (a wood post with an eagle), w9Smoke and w9SmokeB (vents on the ground), w10Banner (on a pole), w10Brazier
  (metal).
- The 4 proto.bushes are marked as hide cover.

**One art defect found:** w6WetLeaves has a pink smear in its top-left corner, on the sheet. It is named for an art fix, and it is not
laid until then.

## 6. Rulings on the planner's coverage check (designer, 11-05 ~10:57 AM ET; 428 kinds, 4 unmapped)

1. **fragile log, fragile canopy_bridge** (12 and 4 placed, first at 5-8; W5, W7-W10):
   - **Element:** platform (log or plank). **May float:** yes, under the cap (Matt: "floating logs... a platform needs platforms").
   - **Use:** a landing that gives way, the creak mechanic taught in 1-2. Creak timing follows C3: Normal 0.67 s, Easy 1.2 s.
   - **Worlds:** as shipped (W5, W7-W10).
   - **Laid in new stages only if its art shows the creak tell** (a crack or sag, read by shape: SR §0b.3 and acf6e1e8's W1 rule that
     a creaking limb shows its crack). If it draws as a plain log or plank, it is unreadable. Then it is OPEN for art, and not laid.
     Engine-render checks which.
2. **W2 villagers in proto.decor** (po.carry_stand, tc.hat_shout, tc.scroll): a family of their own, **villager**.
   - Ground; stands on a porch or the ground, never in open air. World 2's bank village only.
   - Dressing, never a landing, and never in the hero's lane.
3. **waterSigns** is the warning sign post at a stage's first water (waterTeach.ts:103, engine.ts:5187-5196), **not a water-surface
   piece**. It is built ground, on the bank about 40 px before the water: a water teach marker. My first family (water) was wrong, and
   it is corrected in props.py OV.

## 7. Rulings on engine-pieces' new labels (designer, 11-05 12:39 PM ET; engine-pieces 3da8d8945, its stills and clips opened frame by frame)

1. **bobbing crate** (catalog.ts, open until this ruling): **approved, with these changes.**
   - **Worlds: W2 only for now.** Its art is World 2's own painted crate-up and crate-down (rule 4, theme lock).
     - W10 may have it once a W10 crate exists in its own art (w10Crate) **with a tipping frame for the tell**. That's an art gap for
       the lead's picture list.
     - W6 has no crate art of its own, so it has no crate until it does.
   - **Element:** water; it floats only on a drawn still water surface. May float: on water only.
   - **The water under it is named, and its art tells its rule** (D38; water rule W3):
     - The first row a player meets sits over a **teaching river** (river.ts `safe`): going under puts him back on the bank with no
       life lost, and a line names the tell.
     - After that, the crates sit over the stage's own drawn water, whose art reads as its kind.
     - Before 6-7 (the swim teach) no crate water is swim water: water rules W7 and W10.
   - **Tell:** the tip lasts 0.67 s on Normal. It is never shorter than the crumble's 0.5 s (P7), so a breaking thing always shows
     itself first. It reads at phone size in the stills (crate-normal-side-t1).
   - **Fix before it ships:** at the start bank, a reed clump draws in front of him (crate-normal-side-t0). Dressing stays out of the
     hero's lane and never covers him (rule 6 of §0; P-6).
2. **counterweight seesaw** (catalog.ts, open until this ruling): **approved, with these conditions.**
   - **Element:** ground; its painted round pivot stands on the floor. May float: no.
   - **Use:** the step up a bank too high to jump; the log's weight holds the near end down. Taught by 1-6's rooms, and on the route
     only after 1-6.
   - **Worlds:** W1, W2, W3, W4, W6 and W8. The planks are wood, and wood landings are in every world (§1 solid log). The weight is
     that world's own push log.
   - **Nothing stands in the push log's path:** no trunk, post or prop within the log's width + 40 px of its run. That's the hollow-log
     rule (§2). In seesaw-normal-side the push log passes through a scenery trunk at the start, which reads as a log stuck in a tree.
   - **Nothing stands on the plank:** no checkpoint, sign or prop on a piece that tilts (D16, every prop stands on something solid).
     In the clip (2.5-5.7 s) the checkpoint post rides the tilting plank.
   - **The stills must show the piece doing its job:**
     - the log on the near end, the far end up, and him on it;
     - upright as well as sideways. seesaw-*-up-* do not show the seesaw at all.
3. **The HUD reads "11/10"** in seesaw-normal-side.mp4 from 2.5 s. A count past its total is a defect. If it comes from the scratch
   hooks (scratch-hooks.diff), the shots are re-taken without it. If not, it goes to the lead as a defect with an R-number.
4. **breaking log or plank** (catalog.ts "no label yet"): it was ruled in §6.1 above (the fragile log and plank: a platform; taught
   by the creak; laid only where the art shows the creak tell). The catalog row takes that ruling.

## 8. A thin piece's element follows the art it is drawn with (designer, 11-05 12:43 PM ET; render-stone's finding, checked against the kits)

In W2-W10, every thin piece (height < 50) is drawn with its world kit's `branch` frame, whatever its data style
(protoArt.ts :821, :1330 on render-stone; frames in kitAtlasData.ts). So the label follows the frame, not the data word. I cropped each
kit's frame from src/assets/kits/w<N>.webp: `labels/sheets/kit-branch-frames.jpg`.

| World | Its `branch` frame (looked at) | Element | May float |
|---|---|---|---|
| W1 | W1's own wood bough (protoAtlas) | tree | yes, under the cap |
| W2 | wooden planks lashed with rope | built (wood) | yes, as planks |
| W3 | a mossy stone slab | **stone** | yes, as a platform (re-set 5:31 PM, rule 2). **OPEN for Matt:** this frame is drawn as stone, so a floating one shows a floating slab |
| W4 | a slate slab with grass | **stone** | yes, as a platform (re-set 5:31 PM, rule 2). **OPEN for Matt:** this frame is drawn as stone, so a floating one shows a floating slab |
| W5 | no `branch` frame: falls back to W1's wood bough | tree | yes. W5's own thin art is an art gap (ENGINE-SPEC floating-stone ruling) |
| W6 | a grey root stump, roots splayed down | wood (root) | yes, as wood. **Open:** a rooted stump hovering in the air reads as roots reaching for nothing (D37). Named for the lead's art list, not ruled away here |
| W7 | a carved ruin slab | **stone** | yes, as a platform (re-set 5:31 PM, rule 2). **OPEN for Matt:** this frame is drawn as stone, so a floating one shows a floating slab |
| W8 | a purple log with leaves | tree (log) | yes |
| W9 | a cracked basalt slab | **stone** | yes, as a platform (re-set 5:31 PM, rule 2). **OPEN for Matt:** this frame is drawn as stone, so a floating one shows a floating slab |
| W10 | a black metal grate | built (metal) | yes, as a built platform under the cap (Matt: "floating logs and platforms" are fine) |

- **The kin for a stone piece over a deep drop** is its world's own platform art, never W1's log (12:30 ruling). W3, W4 and W7 keep the
  column until that art exists.
- E3 and the catalog read the element from this table, by world, for thin pieces. The planner's catalog row "solid branch (bough)"
  takes the per-world element from here.
