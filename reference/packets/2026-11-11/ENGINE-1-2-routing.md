# TASK E12 (R-165.11, the engine half: what 1-2 on gen2 stands on; item 0 first, the 1-1 high-road ends)   to: Engine
# model: the engine tier in tools/team/models.json   effort: high   due: dispatch + about 8 h; a safe-keeping push at least hourly
Written by the Designer, 2026-11-11 3:59 PM ET. Every file:line below was read at t-int-1-1@fa5ad9d1 (D37). The lead's rulings of 11-11 are in:
a separate Engine packet for the routing, the verdict scope, a floor that costs a heart, and the note as the find; the 1-1 fix first.

## First, before any tool call
`git fetch origin ccr-ca657d3c-n09zty t-design-1-2 t-designer-reach` and the passed t-int-1-1 head the lead names. Read
reference/roles/README.md, roles/ENGINE.md and its pack, LAWS.md, LESSONS.md (D19, D34-D41), then on t-design-1-2:
reference/packets/2026-11-11/CONTENT-1-2-relay.md (what Content builds on your work: "The thorny floor", "Petals", §E),
DESIGN-1-2-notes.md (§2 the code facts, §4 the find), reference/specs/chain.md (§1 the rows, §3 the bands).

## Objective
A fall onto thorns in 1-2 costs a heart and sets Pokey back; 1-2 is judged on the flown reach and plays from gen2 with Meeca's note
in its hollow; and, first, the end of every fork's high road in 1-1 holds something.

## Why it matters
- Item 0: on all 200 listed 1-1 seeds, both settings, 540 high-road end pieces in 610 fork sections hold nothing
  (`npx tsx reference/specs/sims/finds11.ts --all`, exit 1 today). Matt, 11-11 (R-165.108): "things that are worth value all over
  the place". Matt shipped tonight's link with it named; this is the fix right after.
- Items 1-4: Matt chose to start 1-2 tonight as the benchmark of a new helper building a level. Its Content builder is laying
  sections now against raw builds; nothing it lays can hurt, be judged or be played until these land.

## Order (it decides who waits on whom)
Item 0, then items 1, 2 and 3 on your branch: none needs 1-2 routed, each is proved with raw builds (`buildGen2Stage`) and
RealPlay. Push; the lead names that head to Content. Item 4 (routing, and deleting the old 1-2) comes LAST, on Content's head once
its raw builds are clean, because `lockall` and the game build 1-2 through `generateStage` and a routed 1-2 with no seed list throws
(`provenSeedFor`, seedList.ts:67). Nothing reaches main with 1-2 half-routed.

## Frozen inputs
- The numbers: reference/specs/chain.md §1 (the Normal 1-2 rows) and §3 (the chain bands and the rule for a stepped cap);
  bands.md §2 at t-designer-reach. A number you can't enter as written is a PUSHBACK.
- The player-facing rules (the lead, 11-11): Normal: touching the thorn bed costs ONE heart, the hurt sound, blink and haptic, and
  sets him back on the ledge he left; the last heart is a life (the engine's `heartFall` as it is, engine.ts:7460-7490). Easy: the
  same set-back, hurt sound and blink, NO heart. Dot's thorn line is a socket only; no words are added here.
- 1-1 after item 0 keeps every platform where it is: item 0 adds pickups only.
- src/game/gen2/worlds/w1.ts is Content's tonight (one packet at a time, roles/README "Shared files"): you edit it only in item 4.

## Files
- WRITE: src/game/gen2/pipeline.ts, reach.ts, verdicts.ts, verdicts.types.ts, promises11.ts, types.ts (the place flag only);
  src/game/engine.ts, types.ts (`Platform.pit`), w1Pits.ts, stageGenerator.ts, testlink1_1.ts, buildAhead.ts; src/components/WorldMap.tsx;
  tools/engine/seedlist.ts; the tests beside each; src/assets/props/pits/ (the thorn bed's pieces); in item 4 only: protoStage.ts,
  w1Sections.ts, and `w1Finish` in w1.ts (w1.ts:1517-1527). REPORT.md under reference/qa-reports/E12/, your turnover note.
  For item 0's own gates: src/game/gen2/firstRun11.ts (the first run's lock, re-recorded only if `first-run.drift` fires),
  reference/qa-reports/R-165.59/calibration-main.jsonl (the tier bots' calibration, re-run because 1-1 changed), and, only if
  the list must be rebuilt, src/game/gen2/provenSeeds.ts through the tool (on R-165.112's head, the lead's word first).
- A type or interface change is the Architect's by the roster (verdicts.types.ts, gen2/types.ts): the lead has put them in this
  packet; say in REPORT.md exactly what you added.
- Nothing else. A needed change elsewhere is a PUSHBACK naming file and line.

## Definition of done (the Critic checks each; every item names its test and its gate)
**0. 1-1: the end of a fork's high road holds a cache.**
- Cause: `gFork` lays the fork's `find` socket on its last high piece (w1.ts:1118); the pipeline fills a `find` only in the stage's
  required section (pipeline.ts:2126, the 11-06 fix that pinned the seed to its perch); `offPathFilled` skips a piece that has a find
  socket (w1.ts:1504). So that piece is bare.
- Fix where the fill is decided, in pipeline.ts (:2120-2129), not in w1.ts: a `find` socket that is not the stage's find home lays
  a cache of 3 petals over its piece (an arc, 30 px apart, at the socket's height). The seed stays alone on its perch.
- Done-test: `npx tsx reference/specs/sims/finds11.ts --all` prints 0 for w1-mushroom-fork, w1-mushroom-fork-dip and
  w1-bank-stair-fork (180, 164 and 196 today) and exits 0, or you say why not: its 14 hits in w1-hollow-twoway may be the engine's
  own catch pieces; read each kind and say which they are. A suite test of your own that reads `collectibles` on built listed
  seeds, both settings, with a planted failure (D19: the old test counts sockets, w1.test.ts:117). The seed on its perch on every
  listed seed (the existing promise test stays green).
- Gates: `npx tsx tools/engine/lockall.ts --layouts 16 --check <base.json> --intended 1-1` (record `<base.json>` on your base first):
  only 1-1 differs, and in its pickups only (print the parts that changed); `npx tsx tools/engine/seedlist.ts 1-1 --check` PASS, 200
  seeds, 0 refused; the first run's lock (src/game/gen2/firstRun11.ts) re-recorded on purpose if `first-run.drift` fires, said in
  REPORT.md; `npx tsx --test tools/inspect/tierBots.test.ts` and, since 1-1 changed, the calibration re-run and
  reference/qa-reports/R-165.59/calibration-main.jsonl recommitted (CLAUDE.md "Checks"); the test link's pins A, B, C still listed.
- The seed list file is moving (R-165.112, t-engine-seedchunks): if this item makes you rebuild the list, do it on that head, the
  lead's word first.

**1. The thorn hollow: a fall that costs a heart, typed, laid, hurt and drawn.**
- Type (verdicts.types.ts:43-58): a third end beside soft and lethal, `{ kind: 'heart'; to: 'take-off' }`, with its own look,
  `'thorn-art'`. A soft look, a lethal look and the thorn look never stand in for one another: `drop.look-lies` covers all three
  ways (verdicts.ts:120). `dropsOf` (pipeline.ts:2706-2730) writes one such Drop per hollow.
- Data (gen2/types.ts:250-251): a flag `thorn?: boolean` on a `jump`, `double` and `pit` place. Laid (pipeline.ts:1210 `pitUnder`,
  :1550-1557): the hollow's floor 150-170 px under the lower lip, one piece, marked (`Platform.pit`, src/game/types.ts:335, gains
  `'thorn'`); NO climb-out steps (`pitSteps`); a `bank` piece of the section standing in the gap reaches down to that floor as
  the stepping stones do today. A zone in `heartFalls` (stageGenerator.ts:94-96) over the hollow, lip to lip, with the bed's top
  as its hurt line: not soft on Normal, soft on Easy. World 1's other pits stay exactly as they are (`pit: 'soft'`, w1.ts:64-65).
- Engine (engine.ts:2569, :7460-7490): his feet reaching the hurt line inside the zone is the fall: Normal runs `heartFall`
  (one heart, `recorder.event('hurt')`, the last heart `loseLife`); Easy runs the soft set-back with the hurt sound and blink,
  `hp` unchanged. The put-back spot (`softAt`, engine.ts:2510-2517) is never a piece with a mushroom on it: from a pillar's 30 px
  clamp he would be set down inside the cap and thrown at once. So he is set back on the entry ledge, short of its mushroom.
- Hearts need no new code: a stage with a heart fall that is not soft is already `risky` and gets a heart by every second flag
  (stageGenerator.ts:2896-2904); Easy's zones are soft, so Easy gets none. Prove both.
- Drawn (w1Pits.ts: a floor 100-200 px down is found as a soft pit and painted with the leaf bed, :52-56, :148-155): a `'thorn'`
  floor is painted with the THORN bed in the leaf bed's place, never both. The bed: the seven painted clumps named in Content's
  packet (origin/art-director reference/art/cut/, `w1-thorn-*`), 56 px tall in the world (0.63 of Pokey's drawn 89.1 units, D41),
  three or more different ones a hollow, none twice in a row, each over the next by 15-25%, some flipped, picked by the roll's
  seed. Baked once per hollow, re-baked when the canvas is restored (D6), drawn only in view, behind the platforms as the pit art
  is (protoArt.ts:1217). No code-drawn stand-in ships (STAGE-RULES §4); the files join the preload (stagePreload.ts:70, :198).
- Promises (promises11.ts:93-110): `floor.unmarked` judges 1-2 too; a new one, `thorn.untaught`: no thorn drop before the end of the
  stage's thorn teach node, none within 1,300 px of the spawn. The double-teach promises stay 1-1's.
- Done-tests: a RealPlay test on a built stage with one hollow, both settings, with the REAL `heartFall` and `loseLife` (RealPlay
  stubs loseLife, realPlay.ts:144: restore it; one run pasted): Normal 3 falls = 3 hearts then a life; Easy 3 falls = 0 hearts;
  the put-back x printed for a fall from the entry ledge, from each pillar and from mid-air past the last cap, each on the entry
  ledge and short of the mushroom. A verdicts test with planted lies: a thorn drop painted as leaf bed, as water, and a soft pit
  painted as thorns, each refused by name. A draw test: no clump twice in a row, the bed's top 90 px or more under the lip.
  Use Content's worked chain as the fixture (reference/specs/sims/chainlay12.ts).
- Gates: lockall against your base: nothing differs (no shipped stage lays a thorn place yet); drawcheck (limits unchanged,
  tools/perf/limits.json), artcheck, `npx vite build` (no asset over 4 MiB) and chunkcheck; stills of one hollow upright (390x844)
  and sideways (844x390), Normal, sent to the lead as soon as it draws: it is Matt's hold point for the look (CLAUDE.md "Show first").

**2. 1-2 is judged on the flown reach.**
- reach.ts:83 `judgedOnArcs` and :86-89 `scopeOf` take 1-2; a scope for Normal 1-2 with its own rows, entered from chain.md §1
  ("Rows for src/game/gen2/reach.ts": the gaps equal Normal 1-1's, the double climbs 1 px lower), each with its `source`;
  verdicts.types.ts:18 `ReachScope`; reach.ts:97 `scopeFor` and verdicts.ts:87 (`scopeOf('1-1', setting)`, hard-coded) read the
  judged stage's own id. Easy stays `easy-any`.
- A section kind for a chain hop (verdicts.types.ts:34), judged cap centre to cap centre against chain.md §3's rule by the step
  between the two caps; `band.out` names it.
- Every other stage still reports `notJudged`, by the same definition (pipeline.ts:2753).
- Done-tests: the Critic's diff of reach.ts against chain.md §1 is empty; a planted chain at S 240 level and at S 215 with a
  60 px step is refused `band.out` on both settings, and chainlay12's six lays pass; 1-1's verdicts on its 200 listed seeds are
  unchanged (the refusal line of `seedlist 1-1 --check` reads as before).
- Gates: tsc; the gen2 suite; lockall: nothing differs.

**3. 1-2's find is Meeca's note, in its hollow.**
- Today a required section's `find` socket takes a golden seed (pipeline.ts:2129, `type: 'seed'`), and `finishStage` then puts
  the stage's own find, 1-2's note (`findForStage(1, 2)`, finds.ts:356), on a hashed platform somewhere (stageGenerator.ts:2960,
  :3031-3085). On 1-2 that is a seed that is not its story and a note away from its hollow.
- Rule: where finds.ts gives the stage a find, the required section's `find` socket takes THAT find (a `type: 'find'` collectible,
  as `addFinds` makes it) and `addFinds` lays no second one; a stage finds.ts gives none keeps the seed (1-1: `findForStage(1, 1)`
  is null today; check it).
- Done-test: a raw 1-2 build with a required section holding a `find` socket (probe12.ts's in-memory brief, plus a one-piece
  required section): exactly one find, the note, at the socket, no seed, both settings, 6 seeds; 1-1's seed promise green.
- Gates: lockall: nothing differs.

**4. Route 1-2 to gen2 and delete the old 1-2 (LAST, on Content's head, the lead's word first).**
- One definition of "a World 1 stage rolled from the proven list" (today the literal '1-1' in about ten places), read by:
  stageGenerator.ts:2851 (the build-ahead take), :2871 (`gen2Roll11`), :2873, :2889-2893, :3099-3101 (`builtOnGen2`);
  testlink1_1.ts:62-76 (`drawNext`, `newPlay11`, `play11Seed`: the seed pick and its stored order take a stage; 1-1's stored
  order key keeps working on an old save); buildAhead.ts:14; WorldMap.tsx:350; tools/engine/seedlist.ts:23 (`KITS`).
- The test link's A, B, C picker stays 1-1's (`pick11`); 1-2 always plays from its list.
- `w1Finish` (w1.ts:1517-1527) dresses squirrels only on 1-1: on 1-2 `w1Squirrels` would add 1-1's squirrels, or throw when
  fewer than 3 find a spot (:1583). 1-2 has none (its brief's not-list).
- seedlist.ts: the squirrel check stays 1-1's (:35); the verdicts' refusal count runs for every judged stage (:38-48); the
  first-run lock stays 1-1's.
- `#ctest` on 1-2's id still builds the testers' old control course (stageGenerator.ts:23, :2862): unchanged, with a test.
- The help ladder stays 1-1 only (engine.ts:849): a test that 1-2 has none.
- The old 1-2 is deleted, no switch: `HAND_STAGES['1-2']` (protoStage.ts:70), w1Sections.ts's '1-2' rows (:334 on), 1-2's
  `CATCH_UPS` (protoStage.ts:506), and anything only they read; a grep in REPORT.md shows nothing else read them. The `ctest`
  plan keeps what it needs.
- Every test that pins '1-1' as "the gen2 World 1 stage" listed in REPORT.md with one of: now covers 1-2 too / 1-1 only, and why.
- Done-tests: `generateStage` for 1-2 returns a stage built by `buildPlayStage` from `w1World()` on a listed seed, both settings;
  `builtOnGen2` true; Easy has soft falls and Normal does not (engine.ts:844 as it reads today: say what it gives 1-2 and prove
  it); a tier-bot run starts on 1-2 (`npx tsx tools/inspect/tierBots.ts --stage 1-2 --tiers middle --seeds 1-2 --setting both`;
  tierBots.ts:6 maps a seed through the 1-1 pick today: if that file must change, name the line for the Critic, who owns the bots).
- Gates: `npx tsx tools/engine/seedlist.ts 1-2 --check` runs (exit 2 "no rolled kit" today) and passes once Content's list is
  built; lockall `--intended 1-2`: only 1-2 differs; `seedlist 1-1 --check` PASS; tsc; the full suite in 3 shards (each failure
  classified); `npx vite build`, chunkcheck, buildcheck (alone), drawcheck, clipcheck, knowncheck, roadmapcheck; a fresh save and
  an old save that cleared the old 1-2 both open the new one (a still each way).

## What must not move
1-1's platforms, seeds, first-run layout and pins (item 0 changes its pickups only); every stage but 1-1 in item 0 and but 1-2
in item 4; World 8's heart falls (w8.ts:183; the same engine path: its tests stay green); the soft and lethal drop looks.

## Return
Branch t-engine-1-2 from the named head, pushed (`git ls-remote` equals HEAD) after item 0, after items 1-3, and after item 4.
REPORT.md (60 lines or fewer, the 7 sections, "Method used", "Lessons applied"), your turnover note rewritten. ONE send_message to
the lead (the session id on line 1 of reference/handoffs/lead.md) after each of those three pushes, 8 lines or fewer. A blocker or
a wrong frozen input: PUSHBACK.md and one message, then stop.
## Attempt
1 (not yet through its packet Critic)
