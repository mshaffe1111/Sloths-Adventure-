# 1-2 packet: the Designer's notes (proof runs, what was checked, open calls)   2026-11-11 3:49 PM ET, on t-int-1-1@5dafe73b
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
flight.ts is t-designer-reach's file with two additions: `FLIGHT_STAGE` (the stage flown; default 1-1, so every old figure
reproduces) and the `chain` mode.

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
  work: §E-c. The typed drops (verdicts.types.ts:43-58) know a soft end and a lethal end; a heart is a third.
- Harvest: the quota is set after the build as 87.5% (Normal) or 65% (Easy) of the petals laid (goals.ts:21, :28, :106-130); gen2
  tops the petals up to 1.5 x the goal (pipeline.ts:292). `config.targetCount` for 1-2 is 33 before that.
- gen2 aims 1-2 at 135 s typical, 98 s fast floor (`targetSeconds(1, 2, 'harvest')`, `fastFloor`); 1-1 is 139 / 98. 1-1's expert
  minimum measured 162.6 s (C1 REPORT). The packet's 140 s is a design floor above the rule's 120 s; if the builder's rolls fall
  under it the cause is the target (Engine's stageTime.ts), a PUSHBACK.
- Tools, as their arg parsing reads: seedlist takes only '1-1' today (`KITS`, tools/engine/seedlist.ts:23; any other id exits 2);
  lockall.ts `--layouts`, `--stages`, `--out`, `--check`, `--intended` (:14-44); tierBots.ts `--stage`, `--tiers`, `--seeds`,
  `--setting` (:168-171); era.ts `--worlds`, `--stages`, `--rolls` (:76-86; not run on a gen2 World 1 stage by me: the builder proves it).

## 3. Calls for the lead (the packet builds either way; each has my pick)
1. **Who does §E.** RULED 11-11 (the lead): a separate Engine packet, ENGINE-1-2-routing.md, with the 1-1 fix as its item 0; calls 2,
   3 and 5 accepted as written; call 4: Matt ships tonight's link with it named, fixed right after. What I had put: My pick: an Engine packet in parallel, on its own branch, while Content lays sections against raw builds
   (probe12 shows that works today). Routing lives in the files INT-1-1 is finishing (stageGenerator.ts, testlink1_1.ts): one owner
   there, not two (D40). The other way (one builder with those lines in its WRITE) is faster to dispatch and breaks the walls.
2. **Easy and thorns.** My pick, written into the packet: Easy sets him back with the blink and sound and takes no heart (Easy's
   standing rule since LV-4). The other way: a heart on Easy too, with heart pickups after each chain.
3. **The thorn line.** A new Dot line for the first thorn hollow goes to the story keeper and Matt (STAGE-RULES §1 "Story"). The
   packet lays its socket and no words. Without a line Dot can still fly to the thorns (she points by going there).
4. **The empty fork ends on 1-1** (§4): a 1-1 defect in review now. My pick: fix `offPathFilled` to treat a `find` socket outside
   the required section as empty (it then gets a petal), before 1-1's final pass; it moves 1-1's builds, so its list is re-proven.
5. **The look of the thorn floor** goes to Matt as the builder's first still (the packet's hold point). The clumps are the
   inventory's `w1-thorn-*` pieces, whose best world is listed as 3; using them in 1-2 is an art call.
6. **The help ladder** stays off in 1-2 (engine.ts:843). A child stuck on a chain has no help until help.md §5 (counting failures
   through a lost life) is written and passed: the Designer's next packet, already named in ONE-ONE-FIX-PLAN.

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
| the gap list (arrive 0, goal 0, rest 0, test 0 ...) | confirmed by probe12 (dies at the first rest); filled by the packet's 44 |
| "1-2 probably wants to run longer than 1-1" | kept as a floor of 140 s for the expert; the engine's own target for 1-2 is 4 s under 1-1's, named in §2 |

## 7. Risks the builder should know before starting
- Two of the reused tests (w1-stair-test-back, w1-bank-stair-test-back) are on no listed 1-1 seed today (C1 REPORT §3): they may
  not survive 1-2's verdicts either. Done-item 5 makes the builder name any section that never lays.
- The kit's `windows`, `rollRanges`, `pitDepth` and `corridor` are World 1's, tuned on 1-1 (a 900 px corridor for a rising stage).
  1-2 is level and may want its own; that is a kit row per stage, Engine's types: a PUSHBACK with the failing rolls, not an edit.
- The tier bots were calibrated on 1-1's testers and have never flown a chain.
- The flown chain figures are for a thumb held right and for a pilot that steers at each cap; no child tester has played one.
  The first play window on 1-2 is the judge: chain.md §3's bands move on that data, never on taste.
