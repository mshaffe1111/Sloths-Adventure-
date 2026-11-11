# TASK E12 (R-165.11's engine half: what 1-2 on gen2 stands on)   to: Engine
# model: the engine tier (tools/team/models.json on the lead's branch)   effort: high   due: see "Time"; a safe-keeping push at least hourly
Written by the Designer, 2026-11-11 5:03 PM ET; attempt 3: after the packet Critic's 6 lines (t-critic-1-2-packet@51fe547a), the lead's
rulings of 11-11, and the Critic's three attempt-2 lines (@79f8e8b0: the testers' course, one owner, the blooms' reach). Attempt 4, 5:05 PM ET:
the lead's rulings of 4:58 PM ET applied exactly (item 0 struck). PASSED by the Critic at 7ed328b6; its two notes written in 2026-11-11 5:24 PM ET
(item 5: the fifth reader, and the control-course tool's `--record` / `--check`). Attempt 5, 2026-11-11 5:30 PM ET: the lead's standing rule
D43 (5:24 PM ET): every item written for ANY stage and proven on 1-2; nothing in engine code names '1-2'. Every file:line was read at t-int-1-1@53bd446a (D37).

## First, before any tool call
`git fetch origin ccr-ca657d3c-n09zty t-design-1-2 t-designer-reach` and the passed t-int-1-1 head the lead names. Read
reference/roles/README.md, roles/ENGINE.md and its pack, LAWS.md, LESSONS.md (D19, D34-D41), then on t-design-1-2:
reference/packets/2026-11-11/CONTENT-1-2-relay.md (what Content builds on your work), DESIGN-1-2-notes.md (§2 the code facts, §4 the
find, §8 the supply run), reference/specs/chain.md (§1 the rows, §3 the bands).

## Objective
Any World stage can be moved onto gen2 by DATA alone (a table row, its world's rows, its seed list), and 1-2 is the first one
moved that way: it is rolled, judged on its own flown reach and played from gen2; a fall onto a hurt floor (1-2's thorns) costs
a heart and sets Pokey back; the stage's own find stands in its required section; and looking off the road pays in blooms that
never raise the quota.

## The standing rule (D43: Matt through the lead, 11-11 5:24 PM ET. "The engine was built one level at a time")
- Every item is written for ANY stage and proven on 1-2. Engine code reads world data, kit data, a brief or the built stage. It
  never names '1-2', and no item adds a new `'1-1'` branch: each `'1-1'` branch an item touches becomes a read of data.
- What is 1-2's alone is a ROW: in World 1's data (w1.ts), in the listed-stage table (item 1), in the reach table (item 3).
- Each item ends with **Any stage** (what the next stage needs: rows only) and how that is proven. The fixture for those proofs
  is test-only: stage 1-3's config given World 1's kit, a 3-seed stub list and stub rows INSIDE the test (nothing shipped names it).
  HOW a test adds its rows: the three tables are read through one small function each (the listed-stage table, the reach
  table, `provenSeedFor`'s lists) that takes an optional extra-rows argument or a test-only `with...Rows(rows, fn)` wrapper that
  restores the table when `fn` returns; no test writes a shipped file. The fixture's 3 seeds need only BUILD on both settings:
  they are not held to the seed list's clean bar (that bar is 1-2's list's, Content's).
- The check, printed in REPORT.md after each push: `grep -rn "'1-2'" src/game src/components tools/engine --include=*.ts
  --include=*.tsx`. Every hit is a data row (worlds/, the two tables, provenSeeds.ts, finds, story and Dot data), the testers'
  course (`CTEST_STAGE_ID`), or a test. Allowed BY NAME until item 7 deletes the old 1-2: the old builder's four
  `plan === '1-2'` branches (protoStage.ts:1496, :1514, :1664, :5330). Any other hit that is a branch in engine code fails the item. Beside it, every `'1-1'` branch you
  touched, as before and after.

## Why it matters
- D43: 1-1 went onto gen2 through about ten `'1-1'` literals (item 7 lists them). A second set for 1-2 would make 1-3 a third.
  This round pays that once.
- Items 1-7: Matt chose to start 1-2 tonight as the benchmark of a new helper building a level. Rolled on today's engine, 1-2
  throws or swaps out every section that needs a double (`npx tsx reference/specs/sims/supply12.ts 60`, out/supply12-today.txt);
  with items 3 and 5 stood in, every one of 720 rolls builds (`FLOWN=1`, out/supply12-flown.txt).

## Three pushes (the order decides who waits on whom)
- **Push 1 is not this packet's:** the t-engine-11-followup round (R-165.115 and R-165.119). You start from its PASSED head.
- **Push 2: items 1-6, what a RAW build needs.** None needs 1-2 routed: each is proved with `buildGen2Stage` and RealPlay. Item 1
  (the listed-stage table and 1-2's row) is in this push so the seed list can be built on raw builds (the tool calls `buildGen2Stage`,
  tools/engine/seedlist.ts:11, :34) BEFORE routing. The lead names this head to Content.
- **Push 3: item 7, routing, last,** on Content's head once its list passes `--check`: a routed 1-2 with no list throws
  (`provenSeedFor`, seedList.ts:67), and `lockall` and the game build 1-2 through `generateStage`. Nothing reaches main half-routed.

## Frozen inputs
- Base, FROZEN: the PASSED head of t-engine-11-followup (it holds the 1-1 fork-end fix and R-165.119's ladder, which item 7 turns
  on at one piece of 1-2), named by the lead. One owner per file (D40): you do not re-fix either.
- The numbers: reference/specs/chain.md §1 (the Normal 1-2 rows) and §3 (the chain bands and the rule for a stepped cap);
  bands.md §2 at t-designer-reach. A number you can't enter as written is a PUSHBACK.
- The player-facing rules (the lead, 11-11): Normal: touching the thorn bed costs ONE heart, the hurt sound, blink and haptic, and
  sets him back; the last heart is a life (the engine's `heartFall` as it is, engine.ts:7462-7492). Easy: the same set-back, hurt
  sound and blink, NO heart. Dot's thorn line has no row yet: no `tip` socket is laid for it, and a `tip` whose id has no row
  keeps failing the roll as it does today (pipeline.ts:2684-2685): that rule does not change.
- src/game/gen2/worlds/w1.ts is Content's (one packet at a time, roles/README "Shared files"): you edit it only in item 7.
- Made things: thin logs draw as planks and tall narrow stones as the sawn `w1-stump-wide` on every World 1 gen2 stage
  (w1CutArt.ts:69-84, :105; w1.ts:1522). That is the planned art pass's (C2), on 1-1 and 1-2 alike (the lead, 11-11): not
  touched here, and named in your report as seen.

## Files
- WRITE: src/game/gen2/listed.ts (NEW: the listed-stage table, item 1), pipeline.ts, reach.ts, verdicts.ts, verdicts.types.ts,
  promises11.ts, nodeCode.ts, types.ts (the `hurt` place flag, the manifest's `hurtFloor` row, the brief's `offRoad`, `petals` and `help`
  fields, a piece's `help` mark and the built stage's taught-before field, nothing else); src/game/engine.ts, types.ts
  (`Platform.pit` gains `'hurt'`), levelCheck.ts and easyMode.ts (how `doubleAllowed` is asked, item 5; `EARLY_DOUBLE` itself is NOT widened), w1Pits.ts, stagePreload.ts (the bed's
  files), helpLadder.ts (item 7 only), stageGenerator.ts, testlink1_1.ts, buildAhead.ts; src/components/WorldMap.tsx;
  tools/engine/seedlist.ts; the tests beside each; src/assets/props/pits/ (the thorn bed's pieces); in item 7 only: protoStage.ts,
  w1Sections.ts, and in w1.ts `w1Finish` (w1.ts:1517-1527) and 1-1's own brief row (`help`). 1-2's rows in w1.ts are Content's. REPORT.md under reference/qa-reports/E12/, your turnover note.
- A type or interface change is the Architect's by the roster (verdicts.types.ts, gen2/types.ts): the lead has put them in this
  packet; say in REPORT.md exactly what you added.
- Nothing else. A needed change elsewhere is a PUSHBACK naming file and line.

## Definition of done (the Critic checks each; every item names its test and its gate)
**0. STRUCK (the lead, 11-11 4:58 PM ET).** The 1-1 high-road ends (R-165.115) belong to the t-engine-11-followup round
(session_01FhBbYLVQnNER5KWRX5LQrf), with R-165.119's help ladder. Its text is in this file's history at 89005905; its red check is
`npx tsx reference/specs/sims/finds11.ts --all`. Nothing of it is built here.

**1. One table of listed stages; the seed list tool takes any of them. (Push 2)**
- A new data file, src/game/gen2/listed.ts: the ONE definition of "a stage rolled from a proven seed list". A row per stage: its
  kit, and what is that stage's alone as fields (`squirrels: true` and `firstRun: true` on 1-1's row; `pick: true` for the test
  link's A, B, C picker, 1-1's). Rows today: '1-1' and '1-2', both `w1World`. Item 7 makes the game read this same table.
- tools/engine/seedlist.ts:23 `KITS` is deleted: the tool reads the table. Its three `id === '1-1'` branches become reads: the
  squirrel check (:35) runs where the row says `squirrels`; the first-run lock (`firstRunBreaches`) where it says `firstRun`; the
  verdicts' refusal count (:38-48) for every stage the reach table judges (item 3). The search prints, per graph, how many fresh
  seeds it tried and kept, and how many each refusing rule refused (the lead's ruling on audit B-02: the yield is seen).
- Done-test, proven on 1-2: `npx tsx tools/engine/seedlist.ts 1-2 --check` runs (exit 2 "no rolled kit" today); with no list yet
  it fails by name, not by a throw. `seedlist 1-1 --check` PASS, its output unchanged but for the new yield lines.
- **Any stage:** the next stage is one row and its list. Proof: 1-1 and 1-2 run through the same lines of the tool, the grep shows
  no stage id left in it, and an id with no row still exits 2 by name.

**2. A hurt floor any world can lay (1-2's thorn hollow is the first): a fall that costs a heart, typed, laid, hurt and drawn. (Push 2)**
- General by data: a place is marked `hurt`; WHAT the floor is comes from the world's manifest, a new optional row `hurtFloor`
  (gen2/types.ts:104 `WorldManifest`): `{ lesson, art, depth, clearStart }`. World 1's row, entered by Content in its phase 2:
  `{ lesson: 'thorns', art: 'w1-thorn', depth: [150, 170], clearStart: 1300 }`. A roll that lays a `hurt` place in a world with
  no `hurtFloor` row fails by name. No engine line says "thorn" outside World 1's painter and World 1's data.
- Type (verdicts.types.ts:43-58): a third end beside soft and lethal, `{ kind: 'heart'; to: 'take-off' }`, with its own look,
  `'hurt-art'` (which painted family it is, the manifest's `art` says). It is the end World 8's heart falls already have in
  play (w8.ts:183); they are not judged yet and do not move. A soft look, a lethal look and the hurt look never stand in for one another: `drop.look-lies` covers all three
  ways (verdicts.ts:120). `dropsOf` (pipeline.ts:2706-2730) writes one such Drop per hollow.
- Data (gen2/types.ts:250-251): a flag `hurt?: boolean` on a `jump`, `double` and `pit` place. Laid (pipeline.ts:1210 `pitUnder`,
  :1550-1557): the hollow's floor at the manifest's `depth` (World 1: 150-170 px) under the lower lip, one piece, marked
  (`Platform.pit`, src/game/types.ts:335, gains `'hurt'`); NO climb-out steps (`pitSteps`); a `bank` piece of the section standing in the gap reaches down to that floor as
  the stepping stones do today. A zone in `heartFalls` (stageGenerator.ts:94-96) over the hollow, lip to lip, with the bed's top
  as its hurt line: not soft on Normal, soft on Easy. World 1's other pits stay exactly as they are (`pit: 'soft'`, w1.ts:64-65).
- Engine (engine.ts:2570, :7462-7492): his feet reaching the hurt line inside the zone is the fall: Normal runs `heartFall` (one
  heart, `recorder.event('hurt')`, the last heart `loseLife`); Easy runs the soft set-back with the hurt sound and blink, `hp`
  unchanged.
- The put-back (`softAt`, engine.ts:2511-2518): the last ledge he stood on that is NOT a pillar (a pillar: a piece with a mushroom
  standing on it and hurt floor on both sides), and short of that ledge's mushroom when it has one (from a pillar's 30 px clamp he
  would be set down inside the cap and thrown at once). So a stump island with no cap, and a hop ledge between two chains, are
  put-back spots; a pillar never is.
- Hearts need no new code: a stage with a heart fall that is not soft is already `risky` and gets a heart by every second flag
  (stageGenerator.ts:2896-2904); Easy's zones are soft, so Easy gets none. Prove both.
- Drawn, by the WORLD's painter (World 1's is w1Pits.ts: a floor 100-200 px down is found as a soft pit and painted with the leaf
  bed, :52-56, :148-155): a `'hurt'` floor is painted with the manifest's `art` family, World 1's THORN bed, in the leaf bed's
  place, never both. A world whose painter draws no hurt floor fails `drop.look-lies` on its first hurt drop, by name.
  World 1's rule (its numbers live in w1Pits.ts or World 1's data, nowhere general): The bed is the inventory's painted `w1-thorn-*` clumps
  (origin/art-director reference/art/cut/; origin/t-engine-inventory src/game/art/inventory/w1.json, layer `danger look`), drawn
  56 px tall (0.63 of Pokey's drawn 89.1 units, D41), where they are 90 to 144 px wide. Chosen by the hollow's width between its
  walls and pillars: under 150 px, ONE clump, the widest that fits; 150-300 px, two different ones; wider, one per 100 px, none
  twice in a row; each over the next by 15-25%, some flipped, picked by the roll's seed; drawn behind the banks, so a wall crops
  what runs past it. Baked once per hollow, re-baked when the canvas is restored (D6), drawn only in view, behind the platforms as
  the pit art is (protoArt.ts:1217). No code-drawn stand-in ships (STAGE-RULES §4); the files join the preload (stagePreload.ts:70, :198).
- Promises (promises11.ts:93-110): `floor.unmarked` judges every judged stage (item 3's table). A new one, `hazard.untaught`:
  on the route, no hurt drop starts before the END of the hazard lesson's showing piece (the piece keyed `show` in the section
  whose `teaches` equals the manifest's `hurtFloor.lesson`; on 1-2, 'thorns': the log he walks over the first hollow, where the
  thorn line's socket will stand), and none within the manifest's `clearStart` (World 1: 1,300 px) of the spawn. The lesson's own
  first chain comes after `show` and is allowed. The double-teach promises run where the stage's brief teaches the double (1-1).
- Done-tests: a RealPlay test on a built stage with one hollow, both settings, with the REAL `heartFall` and `loseLife` (RealPlay
  stubs loseLife, realPlay.ts:144: restore it; one run pasted): Normal 3 falls = 3 hearts then a life; Easy 3 falls = 0 hearts;
  the put-back x printed for a fall from the entry ledge, from each pillar, from an island between two chains and from mid-air
  past the last cap. A verdicts test with planted lies: a thorn drop painted as leaf bed, as water, and a soft pit painted as
  thorns, each refused by name; a planted hollow before `show` refused `hazard.untaught`, the lesson's own chain passed. A draw
  test: hollows 100, 220 and 700 px wide get one, two and seven clumps, none twice in a row, the bed's top 90 px or more under
  the lip. Use Content's worked chain as the fixture (reference/specs/sims/chainlay12.ts).
- **Any stage:** a world lays a hurt floor with a manifest row, `hurt` on its places and a painter. Proof: a test with a STUB kit
  that is not World 1's (its own `hurtFloor` row with another lesson name and depth, one section with a `hurt` gap): the roll
  lays the floor at that depth, RealPlay loses a heart on Normal and none on Easy, `hazard.untaught` reads that lesson name, and
  the same kit with the row removed fails by name. The grep shows no NEW "thorn" in pipeline.ts, verdicts.ts, promises11.ts or
  engine.ts (engine.ts holds 23 today, World 3's vines: the count before and after, printed).
- Gates: lockall against your base: nothing differs (no shipped stage lays a hurt place yet); drawcheck (limits unchanged,
  tools/perf/limits.json), artcheck, `npx vite build` (no asset over 4 MiB) and chunkcheck.
- **The still is yours and it is Matt's hold point** (CLAUDE.md "Show first"; the lead, 11-11): one hollow with a 3-cap chain,
  upright (390x844) and sideways (844x390), Normal, sent to the lead as soon as it draws. Content's first still shows layout only.

**3. Which stages are judged, and on which flown rows, is a table; 1-2 is its second row. (Push 2)**
- Today the scope is code: reach.ts:83 `judgedOnArcs` and :86-89 `scopeOf` compare with '1-1', reach.ts:97 `scopeFor` and
  verdicts.ts:87 (`scopeOf('1-1', setting)`) are hard-coded. They become reads of ONE data table beside the flown rows in reach.ts:
  stage id → its Normal scope. A stage is judged where it has a row; Easy stays `easy-any`; `scopeFor` and verdicts.ts:87 take
  the judged stage's own id. Rows: '1-1' → `normal-1-1`, '1-2' → `normal-1-2`.
- 1-2's rows are entered from chain.md §1 ("Rows for src/game/gen2/reach.ts": the gaps equal Normal 1-1's, the double climbs 1 px
  lower), each with its `source`; verdicts.types.ts:18 `ReachScope` gains the scope.
- A section kind for a chain hop (verdicts.types.ts:34), judged cap centre to cap centre against chain.md §3's rule by the step
  between the two caps; `band.out` names it.
- Every stage with no row still reports `notJudged`, by the same definition (pipeline.ts:2753). The chain-hop kind is judged on
  any judged stage that lays a chain.
- Done-tests: the Critic's diff of reach.ts against chain.md §1 is empty; a raw 1-2 build lays a 253-256 px double gap (today it
  throws "past the double's reach 230 px"); a planted chain at S 240 level and at S 215 with a 60 px step is refused `band.out`
  on both settings, and chainlay12's six lays pass; 1-1's verdicts on its 200 listed seeds are unchanged.
- **Any stage:** a stage is judged by flying it (`FLIGHT_STAGE=<id>`), entering its rows and adding one table line. Proof: a test
  gives the fixture stage a table line and copied rows, and it is judged (`notJudged` gone, a planted 300 px gap refused
  `band.out`) with no other change; the grep shows no stage id in reach.ts or verdicts.ts outside the table and the rows.
- Gates: tsc; the gen2 suite; lockall: nothing differs.

**4. A stage's own find stands in its required section (1-2's is Meeca's note, in its hollow). (Push 2)**
- Today a required section's `find` socket takes a golden seed (pipeline.ts:2129, `type: 'seed'`), and `finishStage` then puts
  the stage's own find, 1-2's note (`findForStage(1, 2)` is `w1_note`, finds.ts:356), on a hashed platform somewhere
  (stageGenerator.ts:2960, :3031-3085). On 1-2 that is a seed that is not its story and a note away from its hollow.
- Rule: where finds.ts gives the stage a find, the required section's `find` socket takes THAT find (a `type: 'find'` collectible,
  as `addFinds` makes it) and `addFinds` lays no second one; a stage finds.ts gives none keeps the seed (`findForStage(1, 1)` is
  null: checked).
- Done-test: a raw 1-2 build with a required section holding a `find` socket (supply12.ts's kit: its stand-in hollow has one):
  exactly one find, the note, at the socket, no seed, both settings, 6 seeds; 1-1's seed promise green.
- **Any stage:** the rule reads finds.ts and the stage's required section, no id. Proof: the two cases above (1-2 has a find,
  1-1 has none) and the fixture stage with a stub find row: one find, at the socket.
- Gates: lockall: nothing differs.

**5. A move an earlier stage taught counts on any gen2-built stage whose kit's `lessons` say so (today that changes 1-2 ONLY). (Push 2; the lead's rulings 11-11 4:47 and 4:58 PM ET: `#ctest` must not move)**
- The level check counts a double only on 1-1 and from 1-6 (levelCheck.ts:132-134: `EARLY_DOUBLE` holds '1-1'; its own comment
  says the double is "in the player's kit from then on"). On 1-2 every piece that needs a double or a bounce plus an air jump
  reads as unreachable ("exit platform is not reachable"), and its section is swapped out: 11 of the first pool never laid.
- HOW, narrowed after the Critic's attempt-2 line: `EARLY_DOUBLE` is NOT widened. Widening it by id also moves the testers'
  control course, which the old builder lays on 1-2's id (6 of 16 builds differ: the Critic's ctest12.ts), and the old 1-2.
  The double counts on a stage BUILT BY gen2 whose kit's `lessons` say an earlier stage taught it: the built stage carries
  that (a field on its gen2 meta, set in the pipeline), and every reader of `doubleAllowed` asks it of the stage, not only of the
  id: the gen2 level check (pipeline.ts:2531-2540), the pickups' reach (stageGenerator.ts:2949-2951 `finishReach`), Easy's hold
  softening (easyMode.ts:107), levelCheck.ts:498, and the fifth reader, the gen2 link reach `jumpLinkGap` (pipeline.ts:193: it
  is handed a world and a stage number, so it is handed the kit's answer too). A stage gen2 did not build answers exactly as today.
- The node code's V3 counts a double or a bounce as taught only by a T token IN the stage (nodeCode.ts:138-141; called at
  pipeline.ts:654-661), so every 1-2 roll with a D rise or a bounce node fails "uses the double before its teach". V3 reads the
  world's `lessons` for the stage: a move an earlier stage taught is taught.
- Done-tests: a raw 1-2 build lays w1-stair-test-back and keeps it (it is swapped out on every roll today); `checkCode` passes
  `A Tb Pg1 R Xc2 R Sb E` when `lessons` says 1-1 taught the double and still refuses it when it does not; on 1-1 nothing moves.
  `FLOWN` is no longer needed: `npx tsx reference/specs/sims/supply12.ts 120` gives what `FLOWN=1` gives today (720 of 720 built,
  V3 lines gone). An Easy raw 1-2 build keeps its D rises at 128-132 with no step or catch added by the softening.
- **Any stage:** the answer comes from the kit's `lessons` and the built stage, no id. From 1-6 the double already counts by
  the stage number (levelCheck.ts:132-134) and 1-1 is in `EARLY_DOUBLE`, so no other shipped stage moves: lockall proves it.
  Proof: the fixture stage with `lessons` naming the double lays a D rise and keeps it; with `lessons` empty the same roll
  swaps it out as today.
- Gates: the control course does not move. The tool is the Critic's, on t-critic-1-2-packet@5d73c0da (`git checkout
  origin/t-critic-1-2-packet -- reference/qa-reports/CRITIC-1-2-packet/ctest12.ts`; do not commit it). On your BASE, before the
  change: `npx tsx reference/qa-reports/CRITIC-1-2-packet/ctest12.ts --record <file.json>`. On your head: `... ctest12.ts --check
  <file.json>` prints "0 of 16 builds differ" and exits 0 (exit 1 on any difference). lockall: NOTHING differs (the old 1-2
  included); the full suite.

**6. Off the road pays in bonus blooms, and petals stay low, on any stage whose brief asks (1-2's does). (Push 2; RULED by the lead, 11-11 4:47 PM ET: "exploring always pays")**
- A harvest's quota is 87.5% of the PETALS laid (goals.ts:21, :57: flowers and leaves), so a petal off the natural road costs a
  player who stays on it; with 3-4 forks a roll there is room for 4 to 7 (CONTENT packet "Petals"). A `fruit` pickup already
  counts toward the goal when gathered and is never in the quota (engine.ts:3009-3010, :3080).
- Rule, keyed on the stage's BRIEF, never on its objective (8-2 is a gen2 harvest too, gen2/game.ts `GEN2_STAGES`, and must not
  move): a new field on `GraphBrief` (gen2/types.ts:534-550), `offRoad?: 'fruit'`. Where a stage's brief sets it, a `pickup`
  socket on a piece that is not `main` lays `fruit`, not `flower` (pipeline.ts:2097-2106), and the fork-end cache the follow-up round's
  fix lays does the same there. Content sets it on `briefs['1-2']` only. On every other stage, as today (1-1's caches are petals; 8-2 untouched).
  The engine's harvest top-up and trim (pipeline.ts:292, :2187-2196; stageGenerator.ts capHarvest) count and move petals only.
- Done-tests: a raw 1-2 build: every pickup over a non-main piece is a `fruit`; the quota (`withGoals`) equals 87.5% of the
  flowers on main pieces; a RealPlay run that gathers a bloom sees the goal count rise by one. 1-1 unchanged.
- PETALS LOW (reference/engine/BRIEF-1-2.md:21, a "must"; the story keeper through the lead, 11-11 5:33 PM ET): the pipeline lays
  an arc of 3 petals 70-120 px up over about 7 gaps in 10 that are 90 px or wider (pipeline.ts:2178-2185), so on a chain or a
  thorn dip petals would hang in the bounce. A second brief field, `petals?: 'low'`: where a brief sets it, no arc is laid over
  any gap; pickups come only from `pickup` sockets (at their `dn`) and the harvest top-up, which is low already (:2193, 34 px
  over a main piece 200 px or wider). Content sets it on `briefs['1-2']`. Done-test: a raw 1-2 build, 6 seeds, both settings: no
  `flower` is over a gap or more than 50 px over the piece under it; the laid count still reaches the harvest's (`quota.lay`).
- **Any stage:** two brief fields, no id and no objective. Proof: the fixture stage with `offRoad: 'fruit'` and `petals: 'low'`
  on its stub brief lays fruit off the road and no arc, and without the fields lays what it lays today.
- Gates: lockall: nothing differs, 8-2 named in the output as unchanged. A still of a bloom beside a petal in 1-2, both ways: they must not look alike (the `fruit`
  draws as a classic bloom, the petal as Meeca's painted petal, vectorArt.ts:1087-1092); if they do, name it for the art pass.

**7. Routing reads the listed-stage table, so any listed stage plays from gen2; 1-2 is the first moved by a row. Delete the old 1-2; help where data marks it. (Push 3, on Content's head, the lead's word first)**
- The game reads item 1's table wherever it says '1-1' today for "a stage rolled from the proven list" (about ten places):
  stageGenerator.ts:2851 (the build-ahead take), :2871 (`gen2Roll11`), :2873, :2889-2893, :3099-3101 (`builtOnGen2`);
  testlink1_1.ts:62-76 (`drawNext`, `newPlay11`, `play11Seed`: the seed pick and its stored order take a stage; 1-1's stored
  order key keeps working on an old save); buildAhead.ts:14; WorldMap.tsx:350. After this item none of them names a stage.
- What is one stage's alone is read from its row or its world's data, never from its id:
  - the test link's A, B, C picker runs where the row says `pick` (1-1); a listed stage without it always plays from its list;
  - `w1Finish` (w1.ts:1517-1527) dresses squirrels where the row says `squirrels` (1-1): on 1-2 `w1Squirrels` would add 1-1's
    squirrels, or throw when fewer than 3 find a spot (:1583). 1-2 has none (its brief's not-list);
  - the help ladder (engine.ts:849, `config.id === '1-1'` today) reads the stage's brief: a new field `help`, `'every-piece'`
    (1-1's row, entered by you: the ladder as it runs today) or `'marked'` (only at a piece its section marks
    `help: { grows?: <piece key> }`); absent, no ladder, as on every other stage today.
- `#ctest` on 1-2's id still builds the testers' old control course (stageGenerator.ts:23, :2862): unchanged, with a test.
- Help on 1-2 (the lead's ruling on audit B-01), all of it data: 1-2's brief says `help: 'marked'` and ONE piece is marked, the
  first chain of the section whose `teaches` is 'thorns', `help: { grows: 'show' }` (Content enters both). The ladder there is
  R-165.119's fixed ladder as it stands on your base (it counts tries, not only falls; you do not re-fix it). Its line is the
  ladder's own bounce line (helpLadder.ts:31). What it grows at a marked piece is the piece its mark NAMES, laid again across the
  gap at lip height: on 1-2 the lesson's own fallen log (RULED by the lead, 11-11 4:47 PM ET: the natural piece the lesson
  showed him, drawn to Pokey's scale: 89.1 units, D41), on Easy by itself and on Normal on a yes, at the ladder's counts; gone
  when the stage ends. A mark that names no piece gets the line alone. At a rise the boulder stair stays (`STEP_CUT`,
  helpLadder.ts:35). If the grown piece cannot be built inside this item, ship the line, say so in REPORT.md, and name what it needs.
- The old 1-2 is deleted, no switch: `HAND_STAGES['1-2']` (protoStage.ts:70), w1Sections.ts's '1-2' rows (:334 on), 1-2's
  `CATCH_UPS` (protoStage.ts:506), and anything only they read; a grep in REPORT.md shows nothing else read them. The `ctest`
  plan keeps what it needs.
- Every test that pins '1-1' as "the gen2 World 1 stage" listed in REPORT.md with one of: now covers 1-2 too / 1-1 only, and why.
- Done-tests: `generateStage` for 1-2 returns a stage built by `buildPlayStage` from `w1World()` on a listed seed, both settings;
  `builtOnGen2` true; Easy has soft falls and Normal does not (engine.ts:844 as it reads today: say what it gives 1-2 and prove
  it); the child bot on Easy never stalls over 20 s at the first chain on a listed seed, and 15 failed tries there bring the
  line; a tier-bot run starts on 1-2 (`npx tsx tools/inspect/tierBots.ts --stage 1-2 --tiers middle --seeds 1-2 --setting both`;
  tierBots.ts:6 maps a seed through the 1-1 pick today: if that file must change, name the line for the Critic, who owns the bots).
- **Any stage:** moving the next stage onto gen2 is a table row, its world's rows and its list. Proof: a test registers the
  fixture stage in the table (test-only) and `generateStage` returns it built by `buildPlayStage` on a stub-listed seed, both
  settings, `builtOnGen2` true, no squirrels, no ladder; with `help: 'marked'` and one marked piece the ladder runs at that
  piece only. The grep: no stage id in stageGenerator.ts's routing lines, testlink1_1.ts, buildAhead.ts, WorldMap.tsx:350 or
  engine.ts:849.
- Gates: `seedlist 1-2 --check` PASS on Content's list; lockall `--intended 1-2`: only 1-2 differs; `seedlist 1-1 --check` PASS;
  tsc; the full suite in 3 shards (each failure classified); `npx vite build`, chunkcheck, buildcheck (alone), drawcheck,
  clipcheck, knowncheck, roadmapcheck; a fresh save and an old save that cleared the old 1-2 both open the new one (a still each way).

## What must not move
D43 changes HOW 1-1 is found (a row, not a literal), never WHAT it builds: 1-1's platforms, seeds, first-run layout and pins; every stage but 1-2, and 1-2 only in item 7 (push 2 moves NO shipped stage:
not the old 1-2, not the control course on its id, not 8-2); World 8's heart falls (w8.ts:183; the same engine path: its tests
stay green); the soft and lethal drop looks.

## Time (D25: from history where there is any)
Items 1-6: no history for any of them; a range of 9 to 13.5 h (D43's tables, stub-kit and fixture proofs add about 1 to 1.5 h to
attempt 4's 8 to 12), the hurt floor (item 2) about half of it. Item 7: 3.5 to 6 h (the same, about 0.5 to 1 h). Waits on Content and the lead are timed apart in your TIMELINE.

## Return
Branch t-engine-1-2 from the named head, pushed (`git ls-remote` equals HEAD) after push 2 and after push 3. REPORT.md (60 lines
or fewer, the 7 sections, "Method used", "Lessons applied"), your turnover note rewritten. ONE send_message to the lead (the
session id on line 1 of reference/handoffs/lead.md) after each push, 8 lines or fewer. A blocker or a wrong frozen input:
PUSHBACK.md and one message, then stop.
## Attempt
5 (attempt 1 REJECTED at f60e6503, 6 lines; attempt 2 at 35364c97: all 6 closed, 3 new lines; attempt 3 at 89005905 met them;
attempt 4 at 7ed328b6 applied the lead's rulings of 4:58 PM ET, item 0 struck, and PASSED with two notes, written in at 3864e805;
attempt 5 at 65d31898 applied the lead's standing rule D43: each item for any stage from data, proven on 1-2, with its "Any stage"
proof; the Critic: sound, three wording fixes, written in 2026-11-11 5:35 PM ET with the story keeper's must (item 6: petals low by a brief field).
Each line is answered in DESIGN-1-2-notes.md §9)
