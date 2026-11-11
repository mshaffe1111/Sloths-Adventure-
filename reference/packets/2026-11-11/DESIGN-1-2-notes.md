# 1-2 packets: the Designer's notes (proof runs, what was checked, rulings, the Critic's lines answered)   2026-11-11 4:46 PM ET, cites at t-int-1-1@53bd446a
Companion to CONTENT-1-2-relay.md. Every fact below was read in the code or run at this head (D37); each run is one command.

## 1. Proof runs (all saved under reference/specs/sims/out/)
| Claim in the packet | Command | Result |
|---|---|---|
| The three harvest graphs are valid node code | `npx tsx reference/specs/sims/probe12.ts 6` | all three "valid"; probe12.txt |
| gen2 takes 1-2's brief and graphs from data alone, and its first wall is the pool | the same | every seed, both settings: "no section fits node n5 (rest): the pool is spent" (1 rest serves 1-2 today). No routing or engine change is needed to probe layout |
| 1-2's jumps are 1-1's within 1 px | `FLIGHT_STAGE=1-2 npx tsx reference/specs/sims/flight.ts normal apex` (and `rise`, `bdist`) | chain.md §1 |
| A thumb held right crosses a chain clean at S 195-230 | `FLIGHT_STAGE=1-2 npx tsx reference/specs/sims/flight.ts normal chain` (and `easy`) | chain.md §2; normal-1-2-chain.txt, easy-1-2-chain.txt |
| gen2 lays a chain to those bands from section data today (`gapPx`), both settings | `npx tsx reference/specs/sims/chainlay12.ts` | 36 lays in band; chainlay12.txt |
| On built 1-1 rolls the end of a `gFork` high road holds nothing | `npx tsx reference/specs/sims/finds11.ts` | §4; finds11.txt |
| 1-2 rolled on the packet's OWN brief, today's engine | `npx tsx reference/specs/sims/supply12.ts 60` | most seeds throw: a 253-256 px gap is "past the double's reach 230 px" (1-2 is not on the flown reach), and every section with a double or bounce-plus-jump block is swapped out as unreachable (the level check counts no double on 1-2, levelCheck.ts:132-134); out/supply12-today.txt |
| The same, as it will roll after Engine items 3 and 5 | `FLOWN=1 npx tsx reference/specs/sims/supply12.ts 120` | 720 of 720 rolls build, 0 throws; the pool runs short on 2, 6 and 3 rolls of 120 (graphs A, B, C); no section never laid; every other line is V3 (item 5); out/supply12-flown.txt |
flight.ts is t-designer-reach's file with two additions: `FLIGHT_STAGE` (the stage flown; default 1-1, so every old figure
reproduces) and the `chain` mode. supply12.ts is built on the Critic's probe12b.ts (t-critic-1-2-packet); probe12.ts is kept as the
first run it was (a different brief: teaches none, deal 40/30/30), not as proof of the packet's brief.

## 2. What the code says, that the packet stands on
- 1-2 today: `S('harvest', 'The Petal Trail', ...)` (stagePlan.ts:35); built by the old generator through `HAND_STAGES['1-2']`
  (protoStage.ts:70) and w1Sections.ts:334; in no gen2 list. Only 1-1 builds from `w1World()` (stageGenerator.ts:2871-2893).
- A graph is rolled only when the brief exists AND the list has the stage's archetype (pipeline.ts:414-419): 1-2 is `harvest`,
  World 1's list is sprint only, so 1-2 needs its own harvest graphs. The list is filtered by archetype before the pick, so adding
  harvest graphs cannot change a 1-1 roll; the lock check in the packet proves it.
- `brief.teaches` forces the teach nodes (:432-436); with `['thorns']` the graph keeps exactly one `T` and it takes a section whose
  `teaches` is 'thorns'. `teachLines` (w1.ts:1481) leaves such a section's sockets alone and stops it being mirrored.
- A bounce node needs the bounce taught in this stage OR in an earlier one through `manifest.lessons` (:589-591). World 1's
  manifest has no `lessons` today; 1-1 names its own `teaches`, so adding `lessons` does not change what 1-1 teaches.
- The engine already has "a fall costs a heart and sets him back on the ledge he left; the last heart is a life" (`heartFall`,
  engine.ts:7438-7460; World 8). It is world-wide (`M.heartFalls`), only for gaps under a swing or glide, and off where the pit is
  soft (pipeline.ts:1550-1557). World 1's pits are soft with a floor and steps out (w1.ts:64-65). So a thorn hollow is new engine
  work: Engine item 2. The typed drops (verdicts.types.ts:43-58) know a soft end and a lethal end; a heart is a third.
- Harvest: the quota is set after the build as 87.5% (Normal) or 65% (Easy) of the petals laid (goals.ts:21, :28, :106-130); gen2
  tops the petals up to 1.5 x the goal (pipeline.ts:292). `config.targetCount` for 1-2 is 33 before that.
- A `fruit` pickup counts toward a harvest's goal when gathered (engine.ts:3002-3003, :3073) and is not in the quota's count
  (goals.ts:51: flowers and leaves). gen2's pickup sockets lay flowers only (pipeline.ts:2097-2106).
- The level check counts the double jump only on 1-1 and from 1-6 (levelCheck.ts:132-134 `EARLY_DOUBLE`, `doubleAllowed`). The
  node code's V3 knows a move as taught only from a T token in the stage (nodeCode.ts:138-141).
- A required section is fitted to its reward node by its PHASES (pipeline.ts:1348, `fits(t, n, i, 2)`); a teach node takes the
  type of the first section that teaches its move (:549); a reward node carries a dealt type the required section need not match.
- The stage's find is placed after the build on a hashed platform (stageGenerator.ts:2960, :3031-3085); gen2's own `find` socket
  lays a golden seed, and only in the required section (pipeline.ts:2126-2129).
- Hearts: a stage with a heart fall that is not soft gets a heart by every second flag (stageGenerator.ts:2896-2904).
- The help ladder has its own line for a bounce piece (helpLadder.ts:31) and grows one sprite, a boulder (:35).
- gen2 aims 1-2 at 135 s typical, 98 s fast floor (`targetSeconds(1, 2, 'harvest')`, `fastFloor`); 1-1 is 139 / 98. 1-1's expert
  minimum measured 162.6 s (C1 REPORT). The packet's 140 s is a design floor above the rule's 120 s; if the builder's rolls fall
  under it the cause is the target (Engine's stageTime.ts), a PUSHBACK.
- Tools, as their arg parsing reads: seedlist takes only '1-1' today (`KITS`, tools/engine/seedlist.ts:23; any other id exits 2);
  lockall.ts `--layouts`, `--stages`, `--out`, `--check`, `--intended` (:14-44); tierBots.ts `--stage`, `--tiers`, `--seeds`,
  `--setting` (:168-171); era.ts `--worlds`, `--stages`, `--rolls` (:76-86; not run on a gen2 World 1 stage by me: the builder proves it).

## 3. Rulings (the lead, 11-11) and what is still open
| Call | Ruled |
|---|---|
| Who does the engine work | A separate Engine packet (ENGINE-1-2-routing.md), the 1-1 fix as its item 0, in three pushes |
| Easy and thorns | Normal a heart and a set-back; Easy the set-back only |
| The thorn line | No `tip` socket until its row exists; kept in `TIPS_PENDING_12` |
| The 1-1 fork ends | Matt shipped the link with it named; fixed right after (R-165.115, Engine item 0) |
| The thorn floor's look | Engine draws the bed; ITS still is Matt's hold point; clumps chosen by the hollow's width |
| Planks and the sawn stump on W1 gen2 stages | The planned art pass (C2), named in both packets, not fixed in 1-2 |
| The deal | Re-probed on the packet's own brief; no floating; climb P, bounce D, more C added |
| Rests | 7; '1-2' off w1-meadow and w1-knot-bank |
| The double with no teach in the stage | An Engine item (5): the node code reads `lessons`, and the level check counts the double on 1-2 |
| Order | `KITS['1-2']` first, the list on raw builds, then routing |
| Seed yield (audit B-02) | A yield floor per graph (1 clean in 10), refusing rules counted, a budget (`--to 3000`); a graph under the floor is dropped and named |
| Help (audit B-01) | The ladder runs at 1-2's first chain on R-165.119's fixed ladder; its test stays |
| Petals | Real numbers per cache; the time from C1's benchmark |

**Ruled 11-11 4:47 PM ET (the lead), the three calls attempt 2 left open:**
| Call | Ruled |
|---|---|
| Caches as bonus blooms | ACCEPTED: off-road pickups on a harvest stage are `fruit` (counts toward the goal, outside the quota), Engine item 6; exploring always pays |
| What the ladder grows at a chain | ACCEPTED: the lesson's own fallen log across the first hollow (natural, to Pokey's scale), else the line alone; Engine item 7 |
| `EARLY_DOUBLE` gains '1-2' | ACCEPTED: Engine item 5; the old 1-2 is being replaced and nothing ships between pushes 2 and 3 (D40) |
Nothing is open with the lead. Open with the packet Critic: attempt 2's audit.

## 4. Found on 1-1 while writing: the end of each fork's high road holds nothing
`find` sockets are filled only in the stage's required section (pipeline.ts:2126, the 11-06 fix that pinned the seed to its
perch), and `offPathFilled` skips any piece that has a pickup OR a find socket (w1.ts:1504). `gFork` puts the fork's `find` on the
last high piece (w1.ts:1118). So that piece, the reward at the end of the harder road, is bare on every built roll:
```
normal seed 4106 w1-mushroom-fork-dip: thin piece x 15043-15277 y 579 holds nothing
normal seed 4106 w1-bank-stair-fork: thin piece x 23145-23379 y 549 holds nothing
normal seed 1025 w1-bank-stair-fork: thin piece x 11562-11795 y 662 holds nothing
normal seed 1025 w1-mushroom-fork: thin piece x 17435-17635 y 564 holds nothing
normal seed 1136 w1-bank-stair-fork: thin piece x 13629-13846 y 786 holds nothing
```
(the same five on Easy). Over all 200 listed seeds and both settings (`finds11.ts --all`, sims/out/finds11-all.txt): 610 fork
sections laid, 540 bare end pieces on the three `gFork` forks (w1-mushroom-fork 180, w1-bank-stair-fork 196, w1-mushroom-fork-dip
164), plus 14 thin pieces in w1-hollow-twoway not yet told apart from the engine's catch pieces. 4106, 1025 and 1136 are Matt's
test-link seeds A, B and C. C1's REPORT §7 lists "a find" at those spots
and w1.test counts sockets, not what the roll lays (LESSONS D19: a gate must call the same code the screen calls). R-165.108,
Matt 11-11: "things that are worth value all over the place". Rule kept for 1-2: off-path spots are judged on the built stage.

## 5. Hugging Face: nothing launched. Prompts for the lead's list, if Matt says yes (cost from reference/art/HF-SPEND.md rates)
Style line for all: "hand-painted 2D game art, soft storybook rainforest, warm rim light, clean silhouette, no outline, no text,
no cast shadow, evenly lit, side view, on a flat magenta background" (green for P3, whose subject is pink).
- **P1 thorn-bed strip** (only if the clump mix fails the bar): "a long low bed of dark green bramble and red-brown thorns growing
  out of mossy earth, dense, sharp curved thorns catching the light, a few dead leaves caught in it, even height, the left and
  right edges matching so it tiles, 2048x384".
- **P2 the snake cameo:** "a small green tree snake coiled on a high mossy bough, a dull iron collar round its neck, head raised,
  more bluster than bite, comic not scary, about one sloth tall".
- **P3 hibiscus:** "one pink hibiscus bloom with two buds and three leaves on a short stem, growing from moss, half a sloth tall".
- **P4 root arch:** "a great buttress root arching over a forest path, mossy, wet with rain, tall enough for a sloth to walk
  under with room to spare, about four sloths wide, no trunk above it".
Sizes are judged against Pokey's drawn 89.1 units (D41), in the stage, both orientations.

## 6. The 11-05 / 11-08 brief and notes, line by line (reference/engine/BRIEF-1-2.md, 1-2-DESIGNER-NOTES.md)
| Line | Holds? |
|---|---|
| beat, look, must (petals low, snake cameo, bell and note low, hibiscus), not-list | holds; in the packet |
| teaches none; pair high and low | holds, plus one hazard lesson (thorns): a first hazard is taught (STAGE-RULES §1) |
| trend level; ends quiet; branching lots | holds |
| "the secret is a fork, not an S; a V6 exception for 1-2" | changed: Matt's 11-11 plan gives 1-2 a signature (the bounce chain); the secret stays as the required note hollow (H) and 3-4 forks; no exception needed |
| "the cold helper builds from story-briefs/1-2.md alone; keep these files sealed" | changed: Matt's 11-11 benchmark is a full packet. story-briefs/1-2.md is on none of the branches read (the lead's, t-int-1-1, engine-spec, engine-core; only 1-1.md is there): the brief's line cites could not be re-read, and the packet takes the story fields from BRIEF-1-2.md and the code (stageClue.ts:17, finds.ts, dotLinesData.ts) |
| knobs `d 0.1` | replaced by the flown bands |
| Dot rows roots / under | not in dotLinesData.ts at this head (R-165.45 holds them): sockets only |
| art gaps: root arch, root bridge, pink bell, hibiscus, snake | bell: the Keeper's Bell find already exists (finds.ts); root bridge: a fallen log does it (natural pieces); arch, hibiscus, snake: §5 |
| the gap list (arrive 0, goal 0, rest 0, test 0 ...) | confirmed by probe12 (dies at the first rest); filled by the packet's 51 |
| "1-2 probably wants to run longer than 1-1" | kept as a floor of 140 s for the expert; the engine's own target for 1-2 is 4 s under 1-1's, named in §2 |

## 7. Risks the builder should know before starting
- Two of the reused tests (w1-stair-test-back, w1-bank-stair-test-back) are on no listed 1-1 seed today (C1 REPORT §3): they may
  not survive 1-2's verdicts either. Done-item 5 makes the builder name any section that never lays.
- The kit's `windows`, `rollRanges`, `pitDepth` and `corridor` are World 1's, tuned on 1-1 (a 900 px corridor for a rising stage).
  1-2 is level and may want its own; that is a kit row per stage, Engine's types: a PUSHBACK with the failing rolls, not an edit.
- The tier bots were calibrated on 1-1's testers and have never flown a chain.
- The flown chain figures are for a thumb held right and for a pilot that steers at each cap; no child tester has played one.
  The first play window on 1-2 is the judge: chain.md §3's bands move on that data, never on taste.

## 8. Supply by job and type, as rolled (`FLOWN=1 npx tsx reference/specs/sims/supply12.ts 120`; the last table of out/supply12-flown.txt)
| Job | ground | bounce | climb |
|---|---|---|---|
| practise | stump-stile, stone-zigzag, stump-descent, knot-bank-12, root-hops | cap-hop, cap-run | root-steps |
| flow | floor-dash, root-run | cap-run | stair-run, bank-run, zigzag-run |
| fork | hollow-twoway, floor-dash, under-roots-fork | mushroom-fork-12, thorn-fork | bank-stair-fork, root-stair-fork-12, root-ledge-fork |
| test | thorn-leap | two-lifts-12 | stair-test-back, bank-stair-test-back |
| combine | mushroom-log-12 | bounce-wall-12, cap-lift | stair-lift |
| twist | two-answers-12 | drop-bounce-12, dip-bounce-12 | stair-gap-twist |
| descent | stump-descent | cap-steps-down | dropdown-stair |
| climb | (V8: a climb is climb) | | stair-run, bank-run, zigzag-run |
| teach (thorns) | | thorn-hollow-teach | |
Structural: arrive 3 (rain-path, root-walk, rain-banks); rest 7; reward 1 (note-hollow); signature 3; exit 2.
Thin cells, named: practise/climb, test/ground, test/bounce, combine/ground, combine/climb, twist/ground, twist/climb and every
descent have ONE section. The run still built 720 of 720 with the pool short on 11 rolls, because a node whose type has no section
left is refilled by its job. If the builder's real sections lose one of these to the verdicts, that cell is the first to go
short: the yield count of done-item 6 will name it, and the cure is a second section for the cell, never a reroll.
Also seen in the run: V11 ("'g' on two neighbouring content nodes") on about 1 roll in 8 of graph B. It is the deal's own cap
failing on some seeds, as it does on 1-1; those rolls are refused, not listed, and are part of the yield.

## 9. The packet Critic's lines (t-critic-1-2-packet@51fe547a), each answered
| Line | Answer |
|---|---|
| C1 deal | No floating; deal 35 / 35 / 30; proved on the packet's own brief (§1, §8) |
| C2 rests | 7 rests; '1-2' off w1-meadow; w1-root-meadow-12 in its place, rest only |
| C3 holes | root-steps (P c), cap-steps-down (D b), stair-lift (C c), cap-lift (C b), root-ledge-fork (F c); §8 |
| C4 tips | Only the two tips with rows are laid; the rest in `TIPS_PENDING_12` (packet "Words") |
| C5 knot-bank | The tag edit is allowed and listed: '1-2' off w1-knot-bank (and off w1-log-road, floating) |
| C6 made things | The art pass's (C2), by the lead's ruling; named in both packets; the builder adds none and counts the cuts |
| C7 petals | The numbers, and why caches must be bonus blooms (packet "Petals"; Engine item 6); open call 1 |
| C8 show first | Engine's still is Matt's hold point; Content's first still is the chain's layout, for the lead |
| C9 bots | Easy's floor on the middle tier; hearts per run and piece from the Critic's field or the recorder's `hurt` events |
| C10 variety tool | The builder writes the check in w1.stage12.test.ts on `stageVariety` |
| C11 order and time | Three phases against Engine's three pushes; `KITS` in push 2; the time from C1's benchmark, as a range, waits apart |
| C12 left to guess | The report seed is the list's first; N18's "only after an R" is gone (both exits are a rest's length); `hint.1-2.highlow` on the lesson's last rest; no root arch is needed (the low road runs under the high road's log; the shelter is a log overhead); pillars draw as stepping stones do, a painted stump is C2's; clumps by hollow width (Engine item 2); chain.md §3 now reads Easy 2 or 3 caps |
| C13 seed yield | Done-item 6: yield per graph and per refusing rule on fresh seeds 1-300, a floor of 1 in 10, `--to 3000`, a graph under the floor dropped and named |
| C14 help | The lead's ruling: the ladder at the first chain (Engine item 7), its bounce line has words; the child-bot test stays; testers held until the thorn line has words |
| E1 missing item | Engine item 5: V3 reads `lessons` (nodeCode.ts in WRITE); and, found in the supply run, the level check's `EARLY_DOUBLE` |
| E2 promise | `thorn.untaught` reads the lesson's `show` piece, not the end of the teach node; the lesson's own chain is allowed |
| E3 order | Three pushes; `KITS` in push 2; the list on raw builds; routing last |
| E4 put-back | "The last ledge he stood on that is not a pillar, short of its mushroom"; islands and hop ledges named |
| E5 also | A wordless tip stays forbidden (no change); clumps by width; the still is Engine's; made things are C2's; the time is sourced |
| E6 WRITE, item 0 | The two files added (pushed at ee75a0a3) |
| Beside the task | 1-1's sprint-B never rolls clean: the lead's to number; not touched here |
