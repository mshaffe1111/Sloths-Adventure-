# TASK 1-2 (R-165.11: build stage 1-2, The Petal Trail, on gen2, the way 1-1 was re-laid)   to: Content
# model: the content tier (tools/team/models.json on the lead's branch)   effort: high   due: see "Time"; a safe-keeping push at least hourly
Written by the Designer, 2026-11-11 4:46 PM ET; attempt 2 after the packet Critic's 14 lines (t-critic-1-2-packet@51fe547a) and the lead's nine
rulings of 11-11. Cites read at t-int-1-1@53bd446a. Proofs and every run: `reference/packets/2026-11-11/DESIGN-1-2-notes.md`.

## First, before any tool call
`git fetch origin ccr-ca657d3c-n09zty t-design-1-2 t-designer-reach t-engine-inventory art-director` and the head the lead names.
Read, in this order: reference/roles/README.md, roles/CONTENT.md, LAWS.md, LESSONS.md (D34-D41 on the lead's branch), STAGE-RULES.md
(§0, §0b, §1, §2, §4, §5b), reference/qa-reports/C1/TURNOVER.md and REPORT.md (the 1-1 builder's traps: they are yours too),
`git show origin/t-designer-reach:reference/specs/bands.md` (§2 the bands), reference/specs/chain.md (the bounce chain, flown for 1-2),
reference/engine/NODES.md §8.0-§8.3 (the node code and rules V1-V21), reference/engine/BRIEF-1-2.md (the story's fields; where it
and this packet differ, this packet wins), reference/packets/2026-11-11/ENGINE-1-2-routing.md (what Engine lands, and when).

## Objective
Stage 1-2 builds from World 1's kit on gen2 (src/game/gen2/worlds/w1.ts), on the flown reach, as a gather-the-petals stage whose
signature is a mushroom bounce chain over a thorny floor. It teaches no new move. The old 1-2 is replaced outright (Engine's item).

## Why it matters
Matt, 11-11: World 1 is "more classic with some new twists"; 1-2's twist is the bounce chain over thorns (W1-PLAN-DRAFT). It is also
the benchmark: "how well a new helper could make a level, the quality, and time it takes". Normal's bite starts here: 1-1 costs no
lives (R-165.53); in 1-2 thorns cost a heart.

## The stage brief (frozen)
| Field | 1-2 |
|---|---|
| beat | He knows where she is. Her note says "Follow the petals." He sets off with purpose, and the rain begins. |
| teaches | No new move. One new HAZARD, thorns: seen first where he cannot touch them, then the mildest thorn hollow, then the chains. |
| feel | Following HER: each petal is one she chose to drop. Choosing a road again and again; looking off the path always pays. Against 1-1's "I can do this": 1-2 is "I know how; which way?" |
| identity | High road and low road (roots and the underside lead; logs and boughs are the high road). The signature: the bounce chain over the thorn hollow. The secret: the quiet low road and her note at the Keeper's Bell. |
| trend / ends | level, swinging high and low (never a steady rise; no `endHigh`). Ends quiet: a petal low on the bark; no bootprint. |
| length | The expert tier's minimum over 40 variants on Normal: 140 s or more; on Easy the MIDDLE tier's minimum: 150 s or more (the expert has no Easy bot, tierBots.ts:18-22). The rule's floor is 120 s (STAGE-RULES.md:68); gen2 aims 135 s typical (`targetSeconds(1, 2, 'harvest')`). |
| tempo | Hurry on the chains and flows (a cap every 0.75 s), patience at the forks and the note. 1-1 is calm and rising; 1-2 differs on direction (level) and thinking load (choosing), NODES §5. |
| deal | ground 35, bounce 35, climb 30. NO floating: World 1's window puts floating in a stage's last third (w1.ts:49), where 1-2's graphs hold F, C, X and W; rolled on the first deal, most builds ran out of floating sections (the Critic's supply-rolls.txt). 1-2's high roads are logs and boughs INSIDE its fork sections. |
| branching | lots: 3-4 forks a roll. |
| goal | harvest: gather the petals; the exit stays sealed until the quota is met, and Dot explains it (`lock.sealed`, dotLinesData.ts:71-72). |
| look | Rain starting, a darker north (backdrop `w1rain`, already 1-2's: stageBackdrops.ts:22), dim and close; roots, mossy banks, fallen logs. No squirrels, no bootprint (1-1's); no snakes as enemies, punch or rope (1-3's); no kapok climb (1-4's); no crumbling (1-5's); no lianas, bush or water. No made things: natural pieces only (ONE-ONE-FIX-PLAN, Matt 11-11). |

## The kit rows and the graphs (`archetype: 'harvest'`, added to `W1_KIT.graphs.list` AFTER the sprint graphs)
| id | code |
|---|---|
| harvest-12-A | `A T P F R M X R F C R S E` |
| harvest-12-B | `A T F P R U D_ F R X R W R S E` |
| harvest-12-C | `A T M F R C X R D_ F P S E` |
- `W1_KIT.graphs.briefs['1-2'] = { ends: 'quiet', trend: 'level', branching: 'lots', teaches: ['thorns'], deal: { ground: 35, bounce: 35,
  climb: 30 } }` (no `softFalls`, no `endHigh`). The one `T` takes the section whose `teaches` is 'thorns'.
- `required: { '1-2': [{ section: 'w1-note-hollow' }] }`: the note's hollow (H) right before the signature (pipeline.ts:460). A required
  section is fitted BY ITS PHASES (pipeline.ts:1348): the hollow carries `phases: ['sho', 'ten']`, as the seed perch does.
- The manifest gains `lessons: { jump: '1-1', double: '1-1', bounce: '1-1' }`, so 1-2 may deal bounce nodes and lay sections that
  `uses` the double with no teach of them in the stage (pipeline.ts:589-591, :1254).
- PROVED on this brief in the real pipeline, both settings, 120 seeds a graph, stand-ins for the unbuilt sections
  (`FLOWN=1 npx tsx reference/specs/sims/supply12.ts 120`; out/supply12-flown.txt): every roll builds (0 throws of 720), no section is
  never laid, and the pool runs short on 2, 6 and 3 rolls of 120 (graphs A, B, C). What it does NOT prove: heights and reach.
  Today, before Engine's push 2, the same run throws on most seeds (out/supply12-today.txt): see "Phases".

## The sections (51 serve 1-2: 13 reused, 13 own versions, 25 new)
Rules: (1) A section 1-1 lays is REUSED only as it is: its `feel` gains or loses a stage name and nothing else changes. (2) Anything
that needs another number, a thorn hollow or other words is 1-2's OWN section (id ending `-12`, `feel: ['1-2']`), the original left
byte for byte. (3) Every own and new section ends within 110 px of its start height unless its job is U or D: 1-2 is level, so a
lift is paid back inside the section (the `n` steps in the rhythms below). (4) No own or new section carries a `hint.1-1.*`,
`coach.*`, squirrel or bootprint socket. (5) Petals sit LOW and on the main road. (6) Every own and new id is added to `JOBS`,
`CONTENT` and `TERRAIN` (w1.ts:1415-1462). Supply by job and type, as rolled: notes §8.

**Tag edits on existing sections (the only edits to them):** `'1-2'` comes OFF w1-meadow (it is also an arrival, w1.ts:1418: it
opened 23 of 63 rolls with no `hint.1-2.follow`), OFF w1-knot-bank (it carries `hint.1-1.bank`) and OFF w1-log-road (floating).
`'1-2'` goes ON (7): w1-stair-run #53 (M/U c), w1-bank-run #54 (M/U c), w1-zigzag-run #55 (M/U c), w1-stump-descent #24 (D/P g),
w1-stair-test-back (X c), w1-bank-stair-test-back (X c), w1-stair-gap-twist #57 (W c).
**Reused with `'1-2'` already on (6):** w1-stump-stile (P g), w1-stone-zigzag (P g), w1-hollow-twoway (F g), w1-dropdown-stair (D c),
w1-floor-dash (F/M g), w1-bank-stair-fork (F c).

**1-2's own versions (13).** Rhythms are `BEATS` letters (w1.ts:971-1033); `n` is a step down.
| New id | From | Job, type | Rhythms (each version) and what differs |
|---|---|---|---|
| w1-knot-bank-12 | #13 | P g | #13's two versions; no `hint.1-1.bank`; petals on the mound's top |
| w1-mushroom-fork-12 | #36 | F b | `gFork` as #36 a and b; the high road's last piece holds a 3-bloom cache (a `pickup` socket), no `find` |
| w1-root-stair-fork-12 | #48 (parked) | F c | low road a stair of stumps; high road logs, its first 106-115 px over the low stump (one jump climbs it); a 3-bloom cache at its end |
| w1-two-lifts-12 | #66 | X b | `w H B n n n B n n n`, `w B n n n H B n n n`: lift, down, lift, down |
| w1-bounce-wall-12 | #67 | C b | `w H B D n n n n n`, `w B w D n n n n n` |
| w1-mushroom-log-12 | #64 | C g | `w H V n n n`, `w V n n n H` |
| w1-drop-bounce-12 | #58 | W b | `w h L m D n n`: off a log down onto a floor mushroom, up, and back down |
| w1-dip-bounce-12 | #60 | W b | `w h n m D n`, `w j n m D n`: down into a root dip, bounce out |
| w1-two-answers-12 | #28 | W g | #28's soft dip (NO thorns), its second answer a cap pillar standing in the dip in place of the perched mushroom; Normal 253-256 with a practice gap first, Easy's twin a single hop |
| w1-log-walk-12 | #26 | R | the mossy seat in the rain: ferns, leaf litter |
| w1-root-meadow-12 | w1-meadow | R only | the meadow's two versions as a rest (jobs `['rest']`), a flag, no arrival |
| w1-fern-bank-12 | #17 | R | a long wet bank, one 50 px stump, ferns |
| w1-clearing-12 | #18 | R | two banks joined by a one-step dip, a Dot spot |

**New (25).** `ch(n)` is a chain of n cap pillars after a floor mushroom, built by ONE new group, `gThornChain` (worked example that
lays in band today: reference/specs/sims/chainlay12.ts). Each section has 2-3 versions that differ in kind or order, never only in size.
| # | id | Job, type | What it is (versions) |
|---|---|---|---|
| N1 | w1-rain-path | A | flat banks, very low roots (`w w r w`, `w r w r`); no ground end and no thorn in the first 1,300 px; `hint.1-2.follow` on `in` at t 0.1; the snake cameo's decor socket, out of reach |
| N2 | w1-root-walk | A | over two wide roots and a fallen log (`w r l w`, `w l r r`); the same tip |
| N3 | w1-rain-banks | A | long banks with one 50 px stump (`w w H w`, `w H w w`); the same tip |
| N4 | w1-thorn-hollow-teach | T (`teaches: 'thorns'`), b | a rest with a flag; then a fallen log lying over a thorn hollow edge to edge, its piece keyed `show` (he walks over; cannot fall in); then the FIRST chain: floor mushroom + 2 pillars 150-170 wide on both settings; then a rest with a flag, `hint.1-2.highlow` on it at t 0.3 (the first fork follows within two nodes on every graph). Never mirrored. Versions: one long log / two logs end to end with a stump between |
| N5 | w1-cap-hop | P b | one floor mushroom (edge 20-30 px before the lip) over a thorn dip 110-135 px wide on Normal, 90-110 on Easy, three times, hops between; the bounce alone crosses 148-158 from there (sims/out/normal-1-2-bdist.txt); a plain jump also clears it (practice, not a block) |
| N6 | w1-cap-run | M and P, b | `ch(3)`, two hops, `ch(3)` at a run; Easy the same on wider pillars |
| N7 | w1-root-hops | P g | big roots as hop walls (`r H r H`, `H r j H`) |
| N8 | w1-root-steps | P c | a stair of root steps up and back (`w h c c c n n n`, `w c h c n c n n`) |
| N9 | w1-root-run | M g | `w r H r j H r`, `w H j r H j`: no dead time over 2.5 s |
| N10 | w1-thorn-leap | X g (the jump) | three thorn dips of rising width, each from a landing 154 px or wider: Normal 100, 115, 130 px lip to lip; Easy 80, 90, 100. A no-jump bot fails it. NO double gap over thorns anywhere (a double flick lands 253-256 px on about 70% of tries, bands.md §2: too low to cost a heart) |
| N11 | w1-stair-lift | C c | `w H c c B n n n n n`, `w H c B c n n n n n`: steps, a lift, back down |
| N12 | w1-cap-lift | C b | `ch(2)`, then `w B n n n`: off the chain and straight into a lift |
| N13 | w1-cap-steps-down | D b | `ch(3)` stepping DOWN (each cap 24-30 px lower, S 216-224), out onto a bank one step lower; Easy the same on wider pillars |
| N14 | w1-under-roots-fork | F g | LOW: down two steps and under the high road's long fallen log, petals low on the bank's face, quiet. HIGH: the log, reached by a stump stair, a 3-bloom cache at its far end |
| N15 | w1-thorn-fork | F b | HIGH: `ch(3)` over a thorn hollow, a 3-bloom cache on its exit ledge; LOW: steps down and a walk round through a root dip, slower and safe |
| N16 | w1-root-ledge-fork | F c | LOW: a stair of root steps up and down. HIGH: three logs over it, the first 106-115 px over a low step, a 3-bloom cache at the end |
| N17 | w1-log-shelter | R | a dry bank under a wide fallen log lying across two banks overhead; a flag, a Dot spot |
| N18 | w1-petal-bank | R | a long mossy bank, petals low on its face, one 50 px stump |
| N19 | w1-hollow-log-rest | R | a walk through a hollow log lying on the floor (`hollow`, the art's own height: w1NewArt.ts `hollowLogSize`), dry inside |
| N20 | w1-note-hollow | H (required; `phases: ['sho', 'ten']`) | the quiet low road: two steps down (`n n`), a long floor with the `find` socket at its middle (Meeca's note, the Keeper's Bell) and a decor socket for the hibiscus beside it, two steps up (`c c`); no hard input |
| N21 | w1-thorn-chain | S b | the signature, level: `ch(4)` / `ch(5)`, a petal over every cap; Easy `ch(3)` |
| N22 | w1-thorn-chain-rise | S b | `ch(4)`: up, up, level, level (steps written 24-30), out onto a bank up to 60 px over the last pillar, then two steps down; Easy `ch(3)` |
| N23 | w1-thorn-chain-isles | S b | `ch(3)`, a mossy stump island 300 px wide (a breath; 3 petals on it, it is on the road), `ch(3)`; Easy `ch(2)`, island, `ch(2)` |
| N24 | w1-low-bark-arrival | E | a calm walk of a rest's length (520 px or more) on a root bank to the exit totem; the clue's decor socket low on the bank before the door (versions short / long) |
| N25 | w1-root-bridge-out | E | a calm walk of a rest's length along a fallen log to the totem |
S is `maxPerStage: 1` and unique in the game: 1-1's log chain and mushroom chain stay 1-1's and parked; these three are 1-2's alone.
Both exits are walk-ons of a rest's length, so either may follow S (V5); no other rule binds them.

## The thorny floor
| | Rule |
|---|---|
| Where | Only under N4's first chain, N5, N6, N10, N12's chain, N13, N15's high road and N21-N23. Never under a double gap, in the first 1,300 px, under a fork's low road, under a rest or within 300 px before a flag. |
| Shape | A hollow: its floor 150-170 px under the lower lip; the bed's top 90 px or more under the lip (a fall hurts, a walk past never does). Pillars are `bank` pieces standing on the hollow's floor; nothing floats. |
| What hurts | Touching the bed. NORMAL: one heart, the hurt blink and sound, set back on the last ledge he stood on that is not a pillar, short of its mushroom; his last heart is a life lost (the engine's `heartFall`, engine.ts:7462). EASY: the same set-back and blink, no heart lost. |
| Hearts | You lay none. The engine puts a heart by every second flag on a stage where a fall costs a heart (stageGenerator.ts:2896-2904): Normal gets them, Easy does not (V21). Your part: a flag on the rest before and the rest after every thorn section. Print the hearts and their x for the report seed. |
| Drawn by | ENGINE, not you (its item 2): the thorn bed is painted from the inventory's `w1-thorn-*` clumps, chosen by the hollow's width. Until its push 2 your hollows are `soft` pits and draw World 1's leaf bed. You change no draw code. |
| Pillars | A pillar is a `bank` piece and draws as World 1's stepping stones draw today (`w1Finish`, w1.ts:1517-1527: a stump or stone cut up to 140 px wide, the bank art beyond). A painted tall stump for it is the art pass's (C2). Name it in the report with a still. |
| Hugging Face | NONE is needed to build. For the lead's list, only if Engine's still fails the bar: P1 a thorn-bed strip that tiles. Story props with no painted piece (their sockets stay empty and are NAMED, never stood in for): P2 the iron-collared snake cameo, P3 a hibiscus bloom, P4 a root arch to walk under. Prompts: notes §5. Do not launch jobs. |

## Petals, bonus blooms and the find (real numbers)
- The quota: 87.5% of the PETALS laid on Normal, 65% on Easy, set after the build (goals.ts:21, :28, :51, :106-130); gen2 lays
  1.5 times the goal at least and trims to 2.2 times (72 for 1-2's goal of 33; pipeline.ts:292, stageGenerator.ts capHarvest). So a
  player may miss only 12.5% of them: 6 of 50, 9 of 72. With a spare of 2, petals off the natural road could number 4 to 7 a roll.
  Three forks with a 3-petal cache each are already 9: caches CANNOT be petals.
- So off the road pays in BONUS BLOOMS (RULED by the lead, 11-11 4:47 PM ET: "exploring always pays"): a `fruit` pickup counts toward the goal when gathered and is never counted in the quota
  (engine.ts:3002-3003, :3073; goals.ts:51 counts flowers and leaves only). Engine's item 6 makes the pipeline lay a `fruit` for a
  pickup socket on a piece that is NOT `main`, on a harvest stage. You lay ordinary `pickup` sockets and keep high roads and
  off-path pieces `main: false`; there is nothing to flip later.
- Numbers, each roll: PETALS only on the main road: one over every cap, one over every thorn dip, 1-2 on each low-road beat, 3 on
  N23's island; 50 to 72 in all after the engine's trim. BLOOMS: 3 at the end of every fork's high road (5 forks of yours, plus
  the reused ones once Engine's item 0 lands); 1 on every other off-path landing (`offPathFilled`, w1.ts:1500); 4 on one bough over
  a cap in N21 (one extra bounce reaches it). About 15 to 25 blooms a roll.
- RULE, on every listed seed and both settings, read on the BUILT stage: a run that takes every LOW road and no off-path piece
  gathers the quota with 2 or more to spare; print the smallest spare. And every off-path landing of an own or new section has a
  pickup over it (a w1.stage12.test check that reads `collectibles` against `platforms`; D19: w1.test.ts:117 counts sockets).
- Until item 6 lands those pickups are petals and the rule will fail: that failure is expected in phases 1 and 2 and is named, not fixed.
- The find: World 1's NOTE is 1-2's (`findForStage(1, 2)` is `w1_note`, finds.ts:356). It stands on N20's `find` socket on every listed
  seed (Engine's item 4; today the socket would get a golden seed, pipeline.ts:2129, and the note a hashed spot elsewhere).
- The report's table: for the report seed, every off-path spot, its x and what it holds.

## Words (Dot)
- Laid as `tip` sockets, because their rows exist: `hint.1-2.follow` (dotLinesData.ts:120) on each arrival; `hint.1-2.highlow` (:121) on
  N4's last rest. `way.1-2` (:148) is the wayside system's, not a socket.
- NOT laid (a `tip` whose id has no row fails the roll, pipeline.ts:2684-2685): the thorn line (the story keeper's, no id yet), and
  `hint.1-2.roots` and `hint.1-2.under` (R-165.45). Keep them in one constant, `TIPS_PENDING_12`, each with section, piece and t:
  the thorn line on N4's `show` at t 0.1; the other two left without a place until their rows and words exist. List it in the report.

## Easy
Gentler, never empty. No double gap anywhere (every version with `d` or `X` names an `easy` twin of single hops). Chains: 3 caps (2
in N4, N12 and either side of N23's island), pillars 150-170 wide against Normal's 110-130, the same S (a pillar carries no `landing`
flag: Easy widens a landing on its near side, which would move S). Thorns cost no heart. D rises at Easy's 128-132.

## Help (the lead's ruling, 11-11)
The help ladder runs in 1-2 at N4's first chain only, on R-165.119's fixed ladder (it counts tries, not only falls); Engine turns it
on (its item 7). Its line for a bounce piece already has words (helpLadder.ts:31). What it grows there (RULED, 11-11 4:47 PM ET):
the lesson's own fallen log laid across the hollow, natural and to Pokey's scale; if Engine cannot build that piece, the line
alone. So N4's first hollow is laid with clear air at lip height from lip to lip (no bough or decor across it). Your test: the child bot on Easy never stalls
more than 20 s at N4 on any listed seed. Testers do not get 1-2 until the thorn line has words (the lead's hold).

## Phases (what you can do when; Engine's packet has the same order)
1. **Now, on today's engine.** Lay sections and prove each alone with `layLocal` (as chainlay12.ts does) and with raw builds
   (`buildGen2Stage`, as supply12.ts does with your real sections in place of its stand-ins). Known and expected today: 1-2 is not on
   the flown reach, so a 253-256 px gap throws ("past the double's reach 230 px") and the level check counts no double on 1-2
   (levelCheck.ts:132-134), so every section with a D, B, V, d or X beat is swapped out as unreachable. Build and judge those
   sections with `FLOWN=1` in your own copy of the probe; they roll for real after Engine's push 2. Deliver: the first still.
2. **After Engine's push 2** (the reach scope, the double counted, the node code reading `lessons`, the thorn hollow, the note, the
   blooms, `KITS['1-2']`): rebase; turn `THORN_12`'s hollows from `soft` to `thorn`; raw builds clean; then the seed list, built by
   the tool on raw builds (it calls `buildGen2Stage`, not the game's routing), on R-165.112's head.
3. **After Engine's push 3** (routing, the old 1-2 deleted, help on N4): the tier bots, stills, clips, every gate, the report.

## Show first (yours is for the lead; Matt's hold point is Engine's still)
As soon as one 3-cap chain over a hollow builds: one still upright (390x844) and one sideways (844x390), Normal, to the lead in
one message, to judge the chain's LAYOUT (spacing, the pillars, what is on screen). It will show a leaf bed, not thorns: say so.
The thorn floor's look goes to Matt on Engine's still. Keep building while they answer.

## Frozen inputs
- Base: the passed t-int-1-1 head the lead names. Numbers: bands.md §2 at t-designer-reach (flown on 1-2: chain.md §1) and
  chain.md §3. A band you can't meet is a PUSHBACK, never a new number.
- Engine's work is not yours: reference/packets/2026-11-11/ENGINE-1-2-routing.md.
- Made things: every thin log on a World 1 gen2 stage draws as a plank and a tall narrow stone as the sawn `w1-stump-wide`
  (w1CutArt.ts:69-84, :105; w1.ts:1522). That belongs to the planned art pass (C2), on 1-1 and 1-2 alike (the lead, 11-11): not
  fixed here. Your part: none of your sections ADDS a made thing (no rope, plank, sign, post or crate, as piece, socket or decor),
  and the report counts the plank and `w1-stump-wide` cuts on the report seed so the art pass has its list.

## Files
- READ: the pack under "First"; DESIGN-1-2-notes.md; reference/specs/ (chain.md, sims/); src/game/ and tools/ (read only outside WRITE).
- WRITE: src/game/gen2/worlds/w1.ts, w1.test.ts, NEW src/game/gen2/worlds/w1.stage12.test.ts, src/game/gen2/provenSeeds.ts (through
  the tool), the lock record, reference/qa-reports/1-2/ (REPORT.md, TIMELINE.md, TURNOVER.md, sections/, clips/). Nothing else.
- In w1.ts you may ADD: sections, groups, new `BEATS` letters, the tag edits listed above, and the kit rows above. You may NOT change:
  any constant or helper a 1-1 section reads (`DOUBLE_TEST`, `D_RISE`, `THIN_RISE`, `BOUNCE_LIP`, `HOP_UP`, `faceAt`, `riseFace`, `gFork`,
  an existing `BEATS` letter), any existing section's body, `rollRanges`, `windows`, `typeNeeds`, `pit`, `pitDepth`, `floorRoll`,
  `corridor`, `briefs['1-1']`, `required['1-1']`, `w1Finish`, `w1Squirrels`, `offPathFilled`.

## What is shared, and how the other stages' locks stay unchanged
- w1.ts is 1-1's file too. Proof 1-1 did not move: `npx tsx tools/engine/lockall.ts --layouts 16 --out <base.json>` on the base
  BEFORE your first edit, then `npx tsx tools/engine/lockall.ts --layouts 16 --check <base.json> --intended 1-2` on your head: only
  1-2 may differ. `npx tsx tools/engine/seedlist.ts 1-1 --check` passes with `provenSeeds['1-1']` and firstRun11.ts byte-identical,
  and `npx tsx --test tools/inspect/tierBots.test.ts` passes with NO recalibration. (The Critic built 1-1 28 times with these kit
  rows and 28 extra sections in the kit: identical, its out/iso.txt.)
- 1-3 and 1-5 choose from this pool later: no section tagged for them changes except by the tag edits above. Every existing
  section whose line you touched is listed in the report with its diff.
- The testers' old control course still builds on 1-2's id with `#ctest` (`CTEST_STAGE_ID`, stageGenerator.ts:23, :2862): unchanged.
- No atlas is re-packed.

## Definition of done (the Critic checks each; the phase each can first be met in is in brackets)
1. [1] The kit rows, the three graphs, the tag edits and all 38 own and new sections entered; the report lists the 51 as reused /
   own / new with w1.ts lines. A w1.stage12.test check: no section in 1-2's pool holds a `hint.1-1.*`, `coach.*`, squirrel or
   bootprint socket, or a `tip` whose id has no row; none of yours adds a made thing.
2. [1 alone, 2 on rolls] Bands: every laid jump inside bands.md §2; every chain inside chain.md §3, measured cap centre to cap
   centre on the LAID pieces and printed (the tempo stretches a written step). The proofs of chain.md §4. No double gap on Easy.
3. [2] Thorns: every hollow per the table on every listed seed; the thorn lesson's `show` piece comes before the first hollow that
   can hurt; a put-back lands on a ledge that is not a pillar, short of its mushroom (RealPlay falls from the entry ledge, from each
   pillar and past the last cap, the put-back x printed); Normal loses exactly one heart a fall and Easy none, with the REAL
   `loseLife` and `heartFall` (RealPlay stubs loseLife, realPlay.ts:144: say how, one run pasted, D37).
4. [2, the blooms after item 6] Petals, blooms and the find, per that section: the low-road rule's smallest spare; no bare
   off-path landing on the built stage; the note on N20's socket on every listed seed; the sealed exit on a short run with Dot's
   line (a still each way).
5. [2] Variety, comfortably past the bars, by a check YOU write in w1.stage12.test.ts on `stageVariety` (src/game/stageVariety.ts;
   tools/engine/stage.ts rolls raw seeds for 1-1 only, :326-333): over the listed seeds, pieces distinctness 0.45 or more (the bar
   is 0.237, `VARIETY_BARS` :125; gen2 1-1 measured 0.524), every roll's inner variety 0.50 or more (bar 0.36), code distinctness
   0.80 or more, no 9-piece stretch more than twice. Each graph and each signature on 15% or more of the list; every one of the
   51 sections on 3 listed seeds or more (name any that is not, and why).
6. [2] The seed list, with its yield (the lead's ruling on audit B-02; CLAUDE.md "Variety": never a list dug out by rerolling).
   Before the list: over fresh seeds 1-300 on each setting, print for each graph how many roll clean and, for the rest, how many
   each refusing rule refused. FLOOR: 1 clean in 10 on each graph, both settings clean. Under the floor: fix the section the top
   rule names and measure again; a graph that cannot reach the floor is dropped and named in the report (two graphs at least must
   remain). Then `npx tsx tools/engine/seedlist.ts 1-2 --count 120 --from 1 --to 3000` (4 workers: `--worker i/4 --part F`, then
   `--merge`), its tries and its time printed; `npx tsx tools/engine/seedlist.ts 1-2 --check` PASS, 100 seeds or more, 0 refused.
7. [3] The tier bots, 40 variants a tier a setting (`npx tsx tools/inspect/tierBots.ts --stage 1-2 --tiers child,middle,expert
   --seeds 1-40 --setting both`; calibrated on 1-1's testers only: say so; the expert plays Normal only). Must show: 0 rescues for
   middle and expert; the length floors of the brief; the quota met on a plain run by middle on Normal (38 of 40 or more) and by
   child on Easy (40 of 40); hearts lost at thorns per run and per piece by tier (the Critic adds that field before this item; if
   it is missing, count the recorder's `hurt` events): Normal expert median 0, middle mean 2 or fewer (more means a chain is too
   hard: fix the chain); lives lost on Normal (expert 0); nobody over 2 minutes in one piece on Easy; the help test at N4; the
   per-piece table. A bot that cannot fly a chain is a PUSHBACK with its trace; chain.md §4's thumb-held proof is required either way.
8. [3] Polish (STAGE-RULES §5b), looked at the way Matt will on a phone: stills upright AND sideways, Easy AND Normal, of every own
   and new section, one per version, on contact sheets; clips of the first two minutes on Easy and on Normal, both orientations;
   one clip of each signature with a fall onto the thorns on Normal and on Easy; on a fresh save and on an old save that cleared
   the old 1-2 (`node tools/art/kitaudit/shoot.mjs <outDir> 1-2`). By name: nothing floats but logs and boughs; every prop stands
   on something; every piece to scale with Pokey (89.1 units); the next cap is on screen before he leaves the last, upright; Dot's
   lines never cover a jump; the rain backdrop's mid layer has a hard vertical cut (inventory "needs fix"): name it if it shows.
9. [3] Gates: tsc; the full suite in 3 shards (each failure classified); `npx vite build` and chunkcheck; artcheck; drawcheck;
   clipcheck; knowncheck; roadmapcheck; kbdcheck; buildcheck (alone); `seedlist 1-1 --check`; tierBots.test; the lock. Main chunk size.
10. [each phase] REPORT.md (60 lines or fewer: the 7 sections, "Method used", "Lessons applied", "Polish check", "Benchmark"),
   TIMELINE.md (ET times from `date`: each phase's start and end, every wait on Engine or the lead timed apart, every PUSHBACK),
   TURNOVER.md rewritten. "The report seed" everywhere above is the list's first seed (`provenSeeds('1-2')[0]`); the fixed
   first-run layout is 1-1's alone.

## Time (from measured history, D25)
C1, the 1-1 re-lay: 3 h 49 m to its first report and 6 h 04 m to pass, re-laying about 40 existing sections and authoring none
(read-in 10 min, layout 2 h, three list builds of 35-40 min, bots 30 min, stills and clips 1.5 h, report 20 min; C1 REPORT). This
build AUTHORS 38 sections and waits twice on Engine. No history exists for authoring: the estimate is a range. Phase 1: 4 to 6 h
(38 sections at 6-10 min each, the probe, the first still). Phase 2: 2 to 3 h (the yield, list builds, fixes). Phase 3: 2.5 to
3.5 h (bots, stills and clips, gates, report). Working time 8.5 to 12.5 h to the first report, waits not counted; a second round
about 2 h more, as C1's was.

## Return
Branch t-content-1-2 from the named head, pushed (`git ls-remote` equals HEAD) at the end of each phase. ONE send_message to the
lead (the session id on line 1 of reference/handoffs/lead.md) at the end of each phase, 8 lines or fewer. A blocker or a wrong
frozen input: PUSHBACK.md on the branch and one message, then stop.
## Attempt
2 (attempt 1 REJECTED by the packet Critic at f60e6503, 14 lines; each is answered in DESIGN-1-2-notes.md §9)
