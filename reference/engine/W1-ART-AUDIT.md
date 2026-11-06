# World 1 art audit: every piece a 1-1 roll can place (designer, 11-05 9:25 PM ET; for Matt to approve before any HF spend)

**What Matt said** (via the lead, 9:12 PM): Rolls A/B/C are "a real win", B > C > A; "some of the pieces need removed from the game and
redone". The clashing pieces are flat code-drawn ones beside the painted art.

**How this was measured.**
- Rolls A (seed 79191), B (110867) and C (118786) were built on engine-core c2710323b.
- Every platform was classed by what the engine actually draws it as: terrain.ts `footingsFor`, `paintedPlatforms` (protoArt.ts:815), and the thin-piece plan (platformPlan.ts `planStage`). Each was then matched to the gen2 section it sits in.
- The stills come from the real game on those seeds: the dev server, the engine paused, Pokey placed just left of the piece, 2x, sideways 915 x 412.
- Files: `reference/engine/art-audit/<roll>-<kind>.jpg`, plus `contact-sheet.jpg`. Each still shows the piece to Pokey's right, among its neighbours.
- The script is engine-core's stills-at.mjs with the roll pick set.

## 1. What World 1 has PAINTED today (protoAtlasData.ts, proto2AtlasData.ts; the swap targets)

`log`, `logPush`, `boulder`, `branch` (bough), `branchCreak`, `perch`, `trunk`, `bank`, `bankEnd`, `mossStrip`, `wall`, `buttress`,
**`stump`**, `hollow`, `trunkPlain`, `bushTall`, `fernClump`, `bushWide`, plus the painted mushroom (bounceAtlasData) and the ground
(groundAtlasData). The engine paints only these platforms with them (`paintedPlatforms`):
- a thin piece of style `branch`;
- a moss_stone exactly 50 px tall (the boulder);
- a rock art piece;
- the hollow log;
- the push log.

Everything else falls through to code.

## 2. Every piece kind in the three rolls

| What it's drawn as | Painted? | Rolls A/B/C | Sections that place it | Still | Matt's item | Verdict |
|---|---|---|---|---|---|---|
| ground (the moss floor road) | painted ground tiles | 89/109/96 | nearly all | (every still) | none | **KEEP** |
| mushroom (bounce) | painted | 4/7/4 | bounce teaches, twists, forks, seed perch, mushroom chain | (in A-island-slab) | none | **KEEP** |
| bough (branch, thin) | painted | 29/20/20 | boughs, canopy rungs, log chain, exits | (in B-log-thin-v0) | none | **KEEP** |
| hollow log | painted | 2/0/2 | hollow-twoway | | none | **KEEP** |
| **leaf ledge** (shelf look v0: flat green blade, veins, pointed tips) | **CODE** (shelfArt.ts drawLeafLedge) | 1/1/1 | mushroom-bank-teach, twin-mushroom-fork, hollow-twoway | A-shelf-v0, A-stone-thin-v3 | **(a)** | **RETIRE** |
| **palm-frond strip** (shelf look v1: thin green rib, leaflets hanging as stripes) | **CODE** (shelfArt.ts) | 1/1/0 | hollow-twoway, bank-double-teach | A-stone-thin-v1, B-shelf-v1 | **(d)** | **RETIRE** |
| **grass-topped earth block** (a tall moss_stone stump, post or bank block drawn as ground, step, pillar or earth: flat grass top, brown face) | **CODE** (terrain.ts drawGroundBody, drawStep, drawPillar, earthBody) | in the 'ground' count; steps 0/6/0, pillars 1/2/1 | every `stump()`, `post()`, K/L block face and bank block on the floor (w1.ts: stile, stump-stones, towers, forks, teaches) | A-island-slab, B-step, B-pillar, B-branch-look-v3 | **(b)** | **RETIRE** |
| **floating earth or slab island** (island look: earth, log or slab faces) | **CODE** (terrain.ts islandLook) | 1-2 per roll | ledges, long-bounce-twist, seed-perch, meadow | A-island-earth, B-island-log | (b) kin | **RETIRE** |
| **flat cartoon log** (log look v0-v3 on a thin `log` piece: cut ends, a moss stripe, small mushrooms on v1) | **CODE** (thinArt.ts drawLog) | 6/7/10 | log-chain, canopy-rungs, high-walk, quiet-arrival, last-step-up, log-walk, root-stair-fork, bough-descent | A-log-thin-v3, B-log-thin-v0, B-branch-look-v3 | **(c)**, and the earlier grass log on a post | **RETIRE** |
| **a moss_stone given a log, leaf or branch look** (the plan's variety swap: a stone drawn as a log, a leaf or a limb) | **CODE** | 3-5 per roll | meadow, teaches, forks, stair-test, twists | A-stone-as-log-v2, B-stone-as-log-v1, B-stone-as-log-v3, C-branch-look-v4 | (a) and (c) | **RETIRE** (the root, §3.1) |
| thin grey stone (stone look v0-v3: slab, balanced rocks, cairn, split block) | **CODE** (thinArt.ts drawStone) | 17/22/18 (old 1-1: 17, all v0) | stepping stones nearly everywhere | A-stone-thin-v0, A-stone-thin-v2 | not named, but the same flat-code family | **RETIRE** to the painted boulder (§3.4) |

## 3. The swaps (RETIRE), each to a piece World 1 already has painted. No HF spend

1. **The root: platformPlan.ts's look reassignment.** To spread looks, it re-labels a stone as a log, leaf, frond, limb or island
   (the "give it the missing look" loop, platformPlan.ts:240). That is where the leaf (a), the frond strip (d) and the stone-drawn
   logs come from: none of them is in w1.ts. **Turn the reassignment off wherever a world's painted kit draws its pieces** (W1 now),
   so every piece keeps its own kind. In 1-1, variety comes from sections and beats (Round 4-5, FR7-FR8), not from repainting
   stones as leaves.
2. **Stumps, posts and block faces → the painted `stump` frame.** It's in protoAtlasData, used today only as dressing. Each
   `stump()`/`post()` on the floor, and each K/L block face, draws as the painted stump, cut to its height. This replaces (b).
   A tall bank block (a K face over 80 px) draws as the painted `bank`/`bankEnd`.
3. **Thin logs → the painted `log` frame** (the push log's art, protoAtlasData `log`). Every thin `log` piece (log chain, rungs,
   exits, low logs) draws painted. This replaces (c) and the grass log on a post. The end log of #15, #23 and #30 is in this
   family too. Not checked yet: main's own 1-1 end log is a tall `log` piece drawn as ground, so it's code-drawn there as well.
4. **Thin stones → the painted `boulder`** (moss_stone at 50 px), on the floor only. Rocks never float (LABELS rule 1), so a
   stepping stone that would sit lower than 50 px stands on the floor at 50, its top where the section put it. That re-sits the
   stone road under the beats' heights (h ≤ 80 rule), which the porter lays.
5. **Floating islands → the painted bough or the painted log.** A floating moss_stone is a floating rock, against LABELS rule 1
   anyway. Engine-core's "no floating stones" fix a683e67fd should already stop most of these; the 1-2 left per roll go to the
   bough (in the window) or the log (outside it).

## 4. REPAINT on HF: only if a swap fails Matt's look (none asked for yet)

| Piece | Why it might be needed | What the picture must be (to match the W1 kit: painted, soft moss, warm brown wood, dark outline, morning light) |
|---|---|---|
| a low flat stepping stone (about 2:1, 30-45 px tall) | the boulder is round and 50 px; a low hop stone may read too tall | "a low, flat, mossy river stone, wider than tall, moss on top, seated in the forest floor, same painted style as the W1 boulder" |
| a short log on a stump post (one piece) | only if the painted log over the painted stump looks pasted | "a short mossy log resting across a cut tree stump, painted, W1 kit style" |

Spend: none until Matt sees the swaps. If both are needed, it's 2 pictures, within the HF reserve rules (CLAUDE.md: 2 total, keep
about 5).

## 5. What Matt approves
1. RETIRE all six code-drawn kinds (§2) to the painted pieces in §3. No HF.
2. Turn off the look reassignment in painted-kit worlds (§3.1).
3. HF repaints (§4) only after he sees the swaps on a test link.
