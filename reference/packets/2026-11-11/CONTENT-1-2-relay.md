# TASK 1-2 (R-165.11: build stage 1-2, The Petal Trail, on gen2, the way 1-1 was re-laid)   to: Content
# model: the content tier in tools/team/models.json   effort: high   due: dispatch + about 8 h; a safe-keeping push at least hourly
Written by the Designer, 2026-11-11 3:49 PM ET, on t-int-1-1@5dafe73b. Design notes and every proof run: `reference/packets/2026-11-11/DESIGN-1-2-notes.md`.

## First, before any tool call
`git fetch origin ccr-ca657d3c-n09zty t-design-1-2 t-designer-reach t-engine-inventory art-director` and the head the lead names.
Read, in this order: reference/roles/README.md, roles/CONTENT.md, LAWS.md, LESSONS.md (D34-D41 on the lead's branch), STAGE-RULES.md
(§0, §0b, §1, §2, §4, §5b), reference/qa-reports/C1/TURNOVER.md and REPORT.md (the 1-1 builder's traps: they are yours too),
`git show origin/t-designer-reach:reference/specs/bands.md` (§2 the bands), reference/specs/chain.md (the bounce chain, flown for 1-2),
reference/engine/NODES.md §8.0-§8.3 (the node code and rules V1-V21), reference/engine/BRIEF-1-2.md (the story's fields; where it
and this packet differ, this packet wins: §"What changed since the 11-05 brief").

## Objective
Stage 1-2 builds from World 1's kit on gen2 (src/game/gen2/worlds/w1.ts), on the flown reach, as a gather-the-petals stage whose
signature is a mushroom bounce chain over a thorny floor. It teaches no new move. The old 1-2 is replaced outright.

## Why it matters
Matt, 11-11: World 1 is "more classic with some new twists"; 1-2's twist is the bounce chain over thorns (W1-PLAN-DRAFT). It is also
the benchmark: "how well a new helper could make a level, the quality, and time it takes" (1-1's re-lay took 6 h 04 m and 2 review
rounds). Normal's bite starts here: 1-1 costs no lives (R-165.53); in 1-2 thorns cost a heart.

## The stage brief (frozen)
| Field | 1-2 |
|---|---|
| beat | He knows where she is. Her note says "Follow the petals." He sets off with purpose, and the rain begins. |
| teaches | No new move. One new HAZARD, thorns: seen first where he cannot touch them, then the mildest thorn hollow, then the chains. |
| feel | Following HER: each petal is one she chose to drop. Choosing a road again and again; looking off the path always pays. Against 1-1's "I can do this": 1-2 is "I know how; which way?" |
| identity | High road and low road (roots and the underside lead; boughs are the high road). The signature: the bounce chain over the thorn hollow. The secret: the quiet low road under the roots, and her note at the Keeper's Bell. |
| trend / ends | level, swinging high and low (never a steady rise; `endHigh` off). Ends quiet: a petal low on the bark; no bootprint. |
| length | The expert tier's minimum over 40 variants: 140 s or more on each setting (the rule's floor is 120 s, STAGE-RULES.md:68; gen2 aims 135 s typical for 1-2, `targetSeconds(1, 2, 'harvest')`). Middle tier 170-250 s. |
| tempo | Hurry on the chains and flows (a cap every 0.75 s), patience at the forks and the note. 1-1 is calm and rising; 1-2 differs from it on direction (level) and thinking load (choosing), NODES §5. |
| deal | ground 30, bounce 35, climb 25, floating 10 (floating only late: the kit's window is World 1's, do not change it). No type over 40%, none on two neighbouring content nodes (V11). |
| branching | lots: 3-4 forks a roll. |
| goal | harvest: gather the petals; the exit stays sealed until the quota is met, and Dot explains it (`lock.sealed`, dotLinesData.ts:71-72). |
| look | Rain starting, a darker north (backdrop `w1rain`, already 1-2's: stageBackdrops.ts:22), dim and close; roots, mossy banks, fallen logs. No squirrels, no bootprint (1-1's); no snakes as enemies, punch or rope (1-3's); no kapok climb (1-4's); no crumbling (1-5's); no lianas, bush or water. No made things: natural pieces only (ONE-ONE-FIX-PLAN, Matt 11-11). |

## The graphs (node code; `archetype: 'harvest'`, added to `W1_KIT.graphs.list` AFTER the sprint graphs)
| id | code |
|---|---|
| harvest-12-A | `A T P F R M X R F C R S E` |
| harvest-12-B | `A T F P R U D_ F R X R W R S E` |
| harvest-12-C | `A T M F R C X R D_ F P S E` |

All three pass the engine's own parser and checker (`npx tsx reference/specs/sims/probe12.ts`, pasted in the notes). The one `T` is
the thorn lesson (`teaches: ['thorns']` in the brief; a section with `teaches: 'thorns'`). `required: { '1-2': [{ section:
'w1-note-hollow' }] }` puts the note's hollow (H) right before the signature, as the seed perch is in 1-1 (pipeline.ts:460).
`W1_KIT.graphs.briefs['1-2'] = { ends: 'quiet', trend: 'level', branching: 'lots', teaches: ['thorns'], deal: { ground: 30, bounce: 35,
climb: 25, floating: 10 } }` (no `softFalls`, no `endHigh`). The manifest gains `lessons: { jump: '1-1', double: '1-1', bounce: '1-1' }`
so 1-2 may deal bounce nodes without a bounce teach (pipeline.ts:589-591).

## The sections (44 serve 1-2: 16 reused, 10 own versions, 18 new)
Rule for which is which: a section 1-1 lays is REUSED only as it is, by adding `'1-2'` to its `feel` and touching nothing else. Anything
that needs another number, a thorn hollow or other words is 1-2's OWN section (new id ending `-12`, `feel: ['1-2']`), the original
left byte for byte. Every own and new section ends within 110 px of its start height unless its job is U or D (1-2 is level).
No own or new section carries a `hint.1-1.*` or `coach.*` line. Petals sit LOW (on bark, banks, low logs, over the caps), never as
a road in the boughs. Every own and new id is added to `JOBS`, `CONTENT` and `TERRAIN` (w1.ts:1415-1462).

**Reused as they are (8, `'1-2'` already in `feel`):** w1-meadow (R), w1-stump-stile (P g), w1-stone-zigzag (P g), w1-log-road (P f),
w1-hollow-twoway (F g), w1-dropdown-stair (D c), w1-floor-dash (F/M g), w1-bank-stair-fork (F c).
**Reused as they are (8, add `'1-2'` to `feel`):** w1-stair-run #53 (M/U c), w1-bank-run #54 (M/U c), w1-zigzag-run #55 (M/U c),
w1-stump-descent #24 (D g), w1-log-steps-descent #51 (D f), w1-stair-test-back (X c), w1-bank-stair-test-back (X c),
w1-stair-gap-twist #57 (W c). None lays a double gap, a mushroom or a Dot line.

**1-2's own versions (10):**
| New id | From | Job, type | What differs |
|---|---|---|---|
| w1-knot-bank-12 | #13 | P g | no `hint.1-1.bank`; petals on the mound's face |
| w1-mushroom-fork-12 | #36 | F b | high road by mushroom to a 4-petal cache (a `pickup` socket, not a `find`); low road hops; petals low |
| w1-root-stair-fork-12 | #48 (parked) | F c | its high road's first log 106-115 px over the low stump (one jump climbs it, as `gFork` does since C1) |
| w1-two-lifts-12 | #66 | X b | two bounce lips 237-245, each mushroom 25-45 px from its face (`B w B`, `H B B`) |
| w1-bounce-wall-12 | #67 | C b | `B D` and `B w D` |
| w1-mushroom-log-12 | #64 | C g | `V n w`: mushroom at the fallen log's foot |
| w1-drop-bounce-12 | #58 | W b | off a log down onto a floor mushroom (`L m D`) |
| w1-dip-bounce-12 | #60 | W b | down into a root dip, bounce out (`n m D`): the low road as a twist |
| w1-two-answers-12 | #28 | W g | #28's soft dip (no thorns: see N8), its second answer a cap pillar standing in the dip in place of the perched mushroom; Easy's twin a single hop |
| w1-log-walk-12 | #26 | R | the mossy seat in the rain: ferns, leaf litter, no squirrels |

**New (18).** Rhythms use `BEATS` letters; `ch(n)` is a chain of n cap pillars built by ONE new group, `gThornChain` (worked example
that lays in band today: reference/specs/sims/chainlay12.ts). Each has 2-3 versions that differ in kind or order, never only in size.
| # | id | Job, type | What it is (versions) |
|---|---|---|---|
| N1 | w1-rain-path | A | flat banks, very low roots (`w w r w`, `w r w r`); no ground end and no thorn in the first 1,300 px; `hint.1-2.follow` at its start; the snake cameo's decor socket, out of reach |
| N2 | w1-root-walk | A | over two wide roots and a fallen log (`w r l w`, `w l r r`) |
| N3 | w1-thorn-hollow-teach | T (`teaches: 'thorns'`), b | a flag; a fallen log bridging a thorn hollow edge to edge (he walks over, cannot fall in); Dot's thorn line at the bridge; then the FIRST chain: floor mushroom + 2 pillars 150-170 wide on both settings; a rest with a flag. Never mirrored. Versions: bridge first / a root arch first |
| N4 | w1-cap-hop | P b | one floor mushroom (edge 20-30 px before the lip) over a thorn dip 110-135 px wide on Normal, 90-110 on Easy, three times, hops between (`h` beats); the bounce alone crosses 148-158 from there (sims/out/normal-1-2-bdist.txt) and a plain jump also clears it (practice, not a block) |
| N5 | w1-cap-run | M b | `ch(3)`, two hops, `ch(3)` at a run; Easy the same with wider pillars |
| N6 | w1-root-hops | P g | big roots as hop walls and low arches (`r H r H`, `H r j H`) |
| N7 | w1-root-run | M g | `w r H r j H r`, `w H j r H j`: no dead time over 2.5 s |
| N8 | w1-thorn-leap | X g (the jump) | three thorn dips of rising width, each from a landing 154 px or wider: Normal 100, 115, 130 px lip to lip; Easy 80, 90, 100 (inside the single bands, 143 and 114). A no-jump bot fails it. A rest follows. NO double gap over thorns anywhere: a double flick lands 253-256 px on about 70% of tries (bands.md §2), too low to cost a heart |
| N9 | w1-under-roots-fork | F g | LOW: down two steps, under a root arch, petals low on the bark, quiet. HIGH: boughs over the arch, harder, a cache of 4 petals at its end |
| N10 | w1-thorn-fork | F b | HIGH: `ch(3)` over a thorn hollow to a cache; LOW: steps down and a walk round through a root dip, slower and safe |
| N11 | w1-root-overhang | R | a dry bank under an overhang, a flag, a Dot spot |
| N12 | w1-petal-bank | R | a long mossy bank, petals low on a trunk's bark beside it, one 50 px stump |
| N13 | w1-note-hollow | H (required) | the quiet low road: two steps down (`n n`), the Keeper's Bell with Meeca's note in plain sight, the hibiscus beside the petals (decor socket), two steps up (`c c`); no hard input |
| N14 | w1-thorn-chain | S b | the signature, level: `ch(4)` / `ch(5)`, a petal over every cap; Easy `ch(3)` |
| N15 | w1-thorn-chain-rise | S b | `ch(4)`: up, up, level, level (steps written 24-30), out onto a bank up to 60 px over the last pillar; Easy `ch(3)` |
| N16 | w1-thorn-chain-isles | S b | `ch(3)`, a mossy stump island 300 px wide (a breath, a 3-petal cache behind a fern), `ch(3)`; Easy `ch(2)`, island, `ch(2)` |
| N17 | w1-low-bark-arrival | E | a calm walk of a rest's length on a root bank to the exit totem; the clue's socket low on the bark before the door (versions short / long) |
| N18 | w1-root-bridge-out | E | a walk along a fallen log to the totem; only after an R |
S is `maxPerStage: 1` and unique in the game: 1-1's log chain and mushroom chain stay 1-1's and parked; these three are 1-2's alone.

## The thorny floor
| | Rule |
|---|---|
| Where | Only under N3's first chain, N4, N5, N8, N10's high road and N14-N16. Never under a double gap, in the first 1,300 px, under a fork's low road, under a rest or within 300 px before a flag. |
| Shape | A hollow: its floor 150-170 px under the lower lip; a bed of thorns 50-60 px tall on it, so thorn tips stay 90 px or more under the lip (a fall hurts, a walk past never does). Pillars are tall stumps standing on the hollow's floor, up through the thorns; nothing floats. |
| What hurts | Touching the bed. NORMAL: one heart, the hurt blink and sound, set back on the ledge he left, before the floor mushroom (never past it); his last heart is a life lost (the engine's `heartFall`, engine.ts:7438-7460). EASY: the same set-back and blink, no heart lost (Easy's standing rule: a fall off land keeps hearts and lives, engine.ts:720-726). |
| Hearts | You lay none. The engine already puts a heart by every second flag on a stage where a fall costs a heart (stageGenerator.ts:2896-2904), so Normal gets them and Easy, where thorns cost none, does not (V21: hearts follow risk). Your part: a flag on the rest before and the rest after every thorn section, so a heart is never far from a hollow. Print the hearts and their x for the first-run seed. |
| How it is shown | Painted art only, from the inventory (origin/t-engine-inventory: src/game/art/inventory/w1.json, layer `danger look`; files on origin/art-director reference/art/cut/): w1-thorn-row 379x235, w1-thorn-bramble-long 522x203, w1-thorn-pile 448x207, w1-thorn-bramble-a 391x194, w1-thorn-bramble-b 325x162, w1-thorn-mound 375x219, w1-thorn-tangle-flat 316x158 (all "ready", none placed yet). Drawn 56 px tall (`pokey_scale` 0.63 x Pokey's drawn 89.1 units, D41). Three or more different clumps in every hollow, no clump twice in a row, each overlapping the next by 15-25% so no bare floor shows, some flipped. The hollow's walls are the bank art. Pillars: the stump art (inventory `step` layer; props-atlas#stump is in game, HF1-stump-tall is ready and unused); caps: bounce#cap-w1. |
| Typed and judged | Every hollow is a typed drop that ends in a heart and a set-back and looks like thorns; it must never be drawn as moss floor or as water (`drop.look-lies`). This type and its drawing are Engine's (§E). |
| Hugging Face | NONE is needed to build: the seven thorn clumps above are painted and unused (two more, w1-thorn-ball and w1-thorn-tangle-big, are taller: for a hollow's ends). Named for the lead to take to Matt, one list, only if the first hollow's still fails the bar (§Show first): P1 a thorn-bed strip that tiles, 2048x384. Story props with no painted piece today (their sockets stay empty and are NAMED in the report, never stood in for): P2 the iron-collared snake cameo, P3 a hibiscus bloom, P4 a World 1 root arch big enough to walk under (the inventory's w1-hide-root-arch is 345x180, decor size). Prompts: notes §5. Do not launch jobs. |

## Petals, rewards and hidden finds
- The quota is set by the engine after the build: 87.5% of the petals laid on Normal, 65% on Easy (goals.ts:21, :28, :106-130). So
  petals off the natural road are a cost to a player who never leaves it. RULE: on every listed seed and both settings, a run that
  takes every LOW road and no off-path piece gathers the quota with 2 or more to spare. Print the smallest spare.
- Every cap in a chain has a petal over it at the bounce's height (the arc gathers it). Every thorn dip has one over its middle.
- Off the path always pays (R-165.108): every off-path landing holds a petal at least (`offPathFilled` does it; w1.test holds it at
  zero empty). Beyond that, each roll has 3 or more caches (3-4 petals together) a look off the line finds: N9's high end, N10's
  high end, N16's island, a bough over a cap reached by one extra bounce.
- The find: World 1's NOTE is 1-2's (finds.ts:2-4: a Keeper's Bell flower he touches). It stands in w1-note-hollow on every listed
  seed, in plain sight, reached by a walk. gen2 lays a stage's one find only in its required section, and lays a golden seed
  (pipeline.ts:2120-2129): if 1-2 gets a seed or no note, that is a PUSHBACK naming that line (§E-d), not a work-around.
- So a fork's high road never ends on a `find` socket in an own or new section: it ends on a cache (a `pickup` socket of 3-4).
  FOUND while writing this packet, on 1-1 as built (notes §4): a `find` socket outside the required section is never filled, and
  `offPathFilled` (w1.ts:1504) skips its piece, so the END of each fork's high road holds nothing (seeds 4106, 1025, 1136, both
  settings; every fork built by `gFork`). Of the reused forks, w1-bank-stair-fork carries it into 1-2 (w1-hollow-twoway's and
  w1-floor-dash's find pieces also hold petals). Your own `gFork`-built forks (w1-mushroom-fork-12, w1-root-stair-fork-12) need a
  cache on that last piece. The fix for the shared one is in a line 1-1 reads, so it is the lead's to rule, not yours; until it
  lands, name each empty end in REPORT.md.
- The table in REPORT.md: for the first-run seed, every off-path spot, its x and what it holds (as C1's §7).

## Easy
Gentler, never empty. No double gap anywhere (every version with `d` or `X` names an `easy` twin of single hops). Chains: 3 caps (2
in N3 and N16), pillars 150-170 wide against Normal's 110-130, the same S (a pillar carries no `landing` flag: Easy widens a
landing on its near side, which would move S). Thorns cost no heart. No hearts laid. D rises at Easy's
128-132 (the pipeline's cap). Old 1-2's Easy equals its Normal: it is not a reference.

## Frozen inputs
- Base: the passed t-int-1-1 head the lead names (camera and Dot timing may still move; neither touches layout). Rebase when named.
- Numbers: bands.md §2 at t-designer-reach (flown on 1-2: singles the same, doubles 1 px lower than on 1-1; no lesser move gained a pixel, so every block keeps its 5 px: chain.md §1)
  and chain.md §3. A band you can't meet is a PUSHBACK, never a new number.
- Engine work this build stands on is NOT yours: reference/packets/2026-11-11/ENGINE-1-2-routing.md (§E below is its outline).
  The order: Engine lands the thorn hollow, the verdict scope and the note first, and the lead names that head; you rebase and
  turn your hollows from soft to thorn; when your raw builds are clean the lead names YOUR head to Engine, who routes 1-2 and
  deletes the old one; then the seed list is built. Until the first head: lay every thorn hollow as a `soft` pit, keep the list
  of them in one constant (`THORN_12`), and prove layout with raw builds (`buildGen2Stage`, as probe12.ts does). The seed list
  also waits for R-165.112's head (the lists leave the main chunk; it had 14 KB of room at C1's head).
- Words: only rows that exist in dotLinesData.ts (`hint.1-2.follow` :120, `hint.1-2.highlow` :121, `way.1-2` :148, `lock.sealed`).
  `hint.1-2.roots` and `hint.1-2.under` come with R-165.45; the thorn line is new and the story keeper's. Lay a `tip` socket for
  each with its id and leave the words to them. Never type a new line.
- Help: the help ladder is 1-1 only (engine.ts:843) and stays off here.

## Files
- READ: the pack under "First"; reference/packets/2026-11-11/DESIGN-1-2-notes.md; reference/specs/ (chain.md, sims/); src/game/gen2/
  and src/game/ (read, never edit, outside WRITE); tools/engine/, tools/inspect/, tools/art/kitaudit/.
- WRITE: src/game/gen2/worlds/w1.ts, w1.test.ts, NEW src/game/gen2/worlds/w1.stage12.test.ts, src/game/gen2/provenSeeds.ts (through
  the tool), the lock record, reference/qa-reports/1-2/ (REPORT.md, TIMELINE.md, TURNOVER.md, sections/, clips/). Nothing else.
- In w1.ts you may ADD: sections, groups, new `BEATS` letters, `'1-2'` in a `feel`, and the four kit rows above. You may NOT change:
  any constant or helper a 1-1 section reads (`DOUBLE_TEST`, `D_RISE`, `THIN_RISE`, `BOUNCE_LIP`, `HOP_UP`, `faceAt`, `riseFace`,
  `gFork`, an existing `BEATS` letter), any existing section's body, `rollRanges`, `windows`, `typeNeeds`, `pit`, `pitDepth`,
  `floorRoll`, `corridor`, `briefs['1-1']`, `required['1-1']`, `w1Finish`, `w1Squirrels`.

## What is shared, and how the other stages' locks stay unchanged
- w1.ts is 1-1's file too (only 1-1 and, after this, 1-2 build from `w1World`; stageGenerator.ts:2893). Proof 1-1 did not move:
  `npx tsx tools/engine/lockall.ts --layouts 16 --out <base.json>` on the base BEFORE your first edit, then
  `npx tsx tools/engine/lockall.ts --layouts 16 --check <base.json> --intended 1-2` on your head: only 1-2 may differ.
  `npx tsx tools/engine/seedlist.ts 1-1 --check` passes with `provenSeeds['1-1']` and firstRun11.ts byte-identical (git diff), and
  `npx tsx --test tools/inspect/tierBots.test.ts` passes with NO recalibration (1-1 did not change).
- 1-3 and 1-5 will choose from this pool later: you change no section tagged for them (`feel` holding '1-3' or '1-5') except to
  add '1-2' where this packet lists it. List every existing section whose line you touched, with the diff, in REPORT.md.
- The testers' course lives on 1-2's id (`CTEST_STAGE_ID = '1-2'`, stageGenerator.ts:23, :2862): `#ctest` must still build it,
  byte-identical (a lock row or a test).
- Art: no atlas is re-packed (frames keep their places); the thorn clumps are also World 3's, 6's and 10's (`worlds [3,6,10,1]`).

## Show first (a hold point, about 2 hours in)
As soon as one thorn hollow with a 3-cap chain builds and draws: one still upright (390x844) and one sideways (844x390), on Normal,
to the lead in one message, and go on with layout while he answers. A thorn floor is a new major look (CLAUDE.md "Show first"); Matt
sees it before every hollow is dressed. If the answer is "not yet", the HF strip P1 is the lead's to raise; you keep building.

## Definition of done (the Critic checks each)
1. The kit rows, the three graphs and all 44 sections entered as above; REPORT.md lists them reused / own / new with w1.ts lines. A
   w1.stage12.test check: no 1-2 section holds a `hint.1-1.*`, `coach.*`, squirrel or bootprint socket, and none lays a made thing.
2. Bands: every laid jump on every listed seed, both settings, inside bands.md §2; every chain inside chain.md §3, measured cap
   centre to cap centre and printed (laid figures, not written ones: the tempo stretches a written step). The proofs of
   chain.md §4. No double gap on Easy.
3. Thorns: every hollow per the table (depth, bed, where it may not be), on every listed seed; the thorn lesson comes before the
   first hollow that can hurt, with a flag before it; a put-back never lands past the mushroom (RealPlay falls into each hollow,
   the put-back x printed, as C1's done-item 5); Normal loses exactly one heart a fall and Easy none, shown with the REAL
   `loseLife` and `heartFall` (RealPlay stubs loseLife, realPlay.ts:144: say how, with one pasted run, D37).
4. Petals: the low-road rule above on every listed seed; the sealed exit met on a short run with Dot's line (a still, both ways);
   the note in its hollow on every listed seed; 3 or more caches a roll; and off-path spots judged on the BUILT stage, not on
   sockets: every off-path landing of an own or new section has a pickup over it on every listed seed (a w1.stage12.test check
   that reads `collectibles` against `platforms`), with each empty end of a reused fork named.
5. Variety, comfortably past the bars (`VARIETY_BARS`, src/game/stageVariety.ts:125: pieces distinctness 0.237, each roll's inner
   variety 0.36, a 9-piece stretch at most twice, code distinctness 0.237; gen2 1-1 measured 0.524, 0.64-0.75 and 0.937,
   stageVariety.ts:115): over the listed seeds, distinctness 0.45 or more, every roll's inner variety 0.50 or more, code
   distinctness 0.80 or more, no 9-piece stretch more than twice. All three graphs and all three signatures each on 15% or more
   of the list; every one of the 44 sections on at least 3 listed seeds (name any that is not, and why). Against 1-1, its only
   gen2 neighbour: no 20-second stretch alike on more than 1 roll in 5 (STAGE-RULES §2 "Sameness, for now"). The tool is
   tools/engine/stage.ts (the stage id is its first argument); prove every flag against its arg parsing before trusting a run (D32).
6. Verdicts and seeds (after §E's head): `npx tsx tools/engine/seedlist.ts 1-2 --check` PASS on both settings, 100 seeds or more,
   0 refusals by name; the lock per "What is shared"; `#ctest` unchanged. (Deleting the old 1-2 path is Engine's, in its item 4:
   those files are not in your WRITE.)
7. Played by the tier bots, 40 variants a tier a setting (`npx tsx tools/inspect/tierBots.ts --stage 1-2 --tiers child,middle,expert
   --seeds 1-40 --setting both`; they are calibrated on 1-1's testers only: say so). Must show: 0 rescues for middle and expert;
   expert minimum 140 s or more on each setting; the quota met on a plain run by middle on Normal (38 of 40 or more) and by child
   on Easy (40 of 40); hearts lost at thorns per run by tier (Normal: expert median 0, middle mean 2 or fewer; more means a chain
   is too hard: fix the chain); lives lost on Normal (expert 0); nobody over 2 minutes in one piece on Easy; the per-piece table.
   If a bot cannot fly a chain, PUSHBACK with its trace; chain.md §4's thumb-held proof is required either way.
8. Polish (STAGE-RULES §5b), looked at the way Matt will on a phone: stills upright AND sideways, Easy AND Normal, of every own and
   new section, one per version, on contact sheets; clips of the first two minutes on Easy and on Normal, both orientations; one
   clip of each signature with a fall onto the thorns (the hurt beat and the set-back) on Normal and on Easy; on a fresh save and
   on an old save that has cleared the old 1-2 (`node tools/art/kitaudit/shoot.mjs <outDir> 1-2`). Check by name: thorns read as
   danger and never repeat as a pattern; nothing floats but logs and boughs; every prop stands on something; every piece to scale
   with Pokey (89.1 units); the next cap is on screen before he leaves the last, upright; Dot's lines never cover a jump; the rain
   backdrop's mid layer has a hard vertical cut (inventory "needs fix"): name it if it shows.
9. Gates: tsc; the full suite in 3 shards (each failure classified: yours, or expected with the test named); `npx vite build` and
   chunkcheck; artcheck; drawcheck; clipcheck; knowncheck; roadmapcheck; kbdcheck; buildcheck (alone); `seedlist 1-1 --check`;
   tierBots.test. Main chunk size stated.
10. REPORT.md (60 lines or fewer: the 7 sections, "Method used", "Lessons applied", "Polish check", "Benchmark"), TIMELINE.md
   (ET times from `date`: start, read-in, first build, show-first sent, layout done, verdicts green, bots, stills, report, every
   PUSHBACK), TURNOVER.md rewritten.

## §E What Engine must land (an outline; the packet is ENGINE-1-2-routing.md, which wins where they differ; not in your WRITE)
- E-a Route 1-2 to gen2: stageGenerator.ts:2871 (`gen2Roll11`), :2873, :2889-2893, :3099-3101 (`builtOnGen2`); testlink1_1.ts:62, :72,
  :76 (the seed pick takes a stage); buildAhead.ts:14; WorldMap.tsx:350; App.tsx:761; tools/engine/seedlist.ts:23 (`KITS`), :35, :38.
- E-b Judge 1-2 on the flown arcs: reach.ts:83-97 (`judgedOnArcs`, `scopeOf`; Normal 1-2 reads the Normal 1-1 rows: chain.md §1),
  verdicts.ts:87, verdicts.types.ts:18, promises11.ts:93-110 (1-2 has no double-teach promise; its promise is the thorn lesson first).
- E-c The thorn hollow: a third drop end (a heart, then a set-back to the take-off) with its own look (verdicts.types.ts:43-58),
  never mixed with the soft or lethal looks; a place flag that lays the hollow floor at 150-170 px and its hurt zone
  (pipeline.ts:1550-1557; `M.heartFalls` is world-wide and gated off for soft pits today); hurt on touching the bed, Easy's no-heart
  rule; the clump drawing (culled off screen, inside drawcheck's limits); a bounce-chain kind for the verdicts with chain.md §3.
- E-d gen2's find on 1-2 is finds.ts's note, not the seed (pipeline.ts:1894, :2120-2129); the tier bots' seed for a stage other
  than 1-1 (tierBots.ts:6).

## What changed since the 11-05 brief (reference/engine/BRIEF-1-2.md), and why
Kept: the beat, level trend, quiet end, roots and rain, petals low, the note low in plain sight, the hibiscus, the snake cameo,
the not-list, branching lots. Changed: "the cold helper builds from the story alone" (this packet replaces it: Matt's 11-11
benchmark is a full packet); the signature (was "a choice found", now the bounce chain, Matt's W1 plan 11-11; the choice stays as
3-4 forks and the note's low road); "no S" (one S, V6, no exception needed); the pink bell is finds.ts's Keeper's Bell (the
note's own flower; show it in a still); `d 0.1` is replaced by the flown bands; the 8-section pool is now 44.

## Return
Branch t-content-1-2 from the named head, pushed (`git ls-remote` equals HEAD). Then ONE send_message to the lead
(session id on line 1 of reference/handoffs/lead.md), 8 lines or fewer. A blocker or a wrong frozen input: PUSHBACK.md on the
branch and one message, then stop.
## Attempt
1 (not yet through its packet Critic)
