# TASK E12 (R-165.115 first: the 1-1 high-road ends; then R-165.11's engine half: what 1-2 on gen2 stands on)   to: Engine
# model: the engine tier (tools/team/models.json on the lead's branch)   effort: high   due: see "Time"; a safe-keeping push at least hourly
Written by the Designer, 2026-11-11 4:46 PM ET; attempt 2 after the packet Critic's 6 lines (t-critic-1-2-packet@51fe547a; item 0 passed on its
own once its WRITE was fixed) and the lead's rulings of 11-11. Every file:line was read at t-int-1-1@53bd446a (D37).

## First, before any tool call
`git fetch origin ccr-ca657d3c-n09zty t-design-1-2 t-designer-reach` and the passed t-int-1-1 head the lead names. Read
reference/roles/README.md, roles/ENGINE.md and its pack, LAWS.md, LESSONS.md (D19, D34-D41), then on t-design-1-2:
reference/packets/2026-11-11/CONTENT-1-2-relay.md (what Content builds on your work), DESIGN-1-2-notes.md (§2 the code facts, §4 the
find, §8 the supply run), reference/specs/chain.md (§1 the rows, §3 the bands).

## Objective
First, the end of every fork's high road in 1-1 holds something. Then: 1-2 can be rolled, judged on the flown reach, and played
from gen2, a fall onto its thorns costs a heart and sets Pokey back, Meeca's note stands in its hollow, and looking off the road
pays in blooms that never raise the quota.

## Why it matters
- Item 0: on all 200 listed 1-1 seeds, both settings, 540 high-road end pieces in 610 fork sections hold nothing
  (`npx tsx reference/specs/sims/finds11.ts --all`, exit 1 today). Matt, 11-11 (R-165.108): "things that are worth value all over
  the place". Matt shipped tonight's link with it named; this is the fix right after (R-165.115).
- Items 1-7: Matt chose to start 1-2 tonight as the benchmark of a new helper building a level. Rolled on today's engine, 1-2
  throws or swaps out every section that needs a double (`npx tsx reference/specs/sims/supply12.ts 60`, out/supply12-today.txt);
  with items 3 and 5 stood in, every one of 720 rolls builds (`FLOWN=1`, out/supply12-flown.txt).

## Three pushes (the order decides who waits on whom)
- **Push 1: item 0, alone.** It starts as soon as 1-1 passes; nothing else rides on it.
- **Push 2: items 1-6, what a RAW build needs.** None needs 1-2 routed: each is proved with `buildGen2Stage` and RealPlay. Item 1
  (`KITS['1-2']`) is in this push so the seed list can be built on raw builds (the tool calls `buildGen2Stage`,
  tools/engine/seedlist.ts:11, :34) BEFORE routing. The lead names this head to Content.
- **Push 3: item 7, routing, last,** on Content's head once its list passes `--check`: a routed 1-2 with no list throws
  (`provenSeedFor`, seedList.ts:67), and `lockall` and the game build 1-2 through `generateStage`. Nothing reaches main half-routed.

## Frozen inputs
- The numbers: reference/specs/chain.md §1 (the Normal 1-2 rows) and §3 (the chain bands and the rule for a stepped cap);
  bands.md §2 at t-designer-reach. A number you can't enter as written is a PUSHBACK.
- The player-facing rules (the lead, 11-11): Normal: touching the thorn bed costs ONE heart, the hurt sound, blink and haptic, and
  sets him back; the last heart is a life (the engine's `heartFall` as it is, engine.ts:7462-7492). Easy: the same set-back, hurt
  sound and blink, NO heart. Dot's thorn line has no row yet: no `tip` socket is laid for it, and a `tip` whose id has no row
  keeps failing the roll as it does today (pipeline.ts:2684-2685): that rule does not change.
- 1-1 after item 0 keeps every platform where it is: item 0 adds pickups only.
- src/game/gen2/worlds/w1.ts is Content's (one packet at a time, roles/README "Shared files"): you edit it only in item 7.
- Made things: thin logs draw as planks and tall narrow stones as the sawn `w1-stump-wide` on every World 1 gen2 stage
  (w1CutArt.ts:69-84, :105; w1.ts:1522). That is the planned art pass's (C2), on 1-1 and 1-2 alike (the lead, 11-11): not
  touched here, and named in your report as seen.

## Files
- WRITE: src/game/gen2/pipeline.ts, reach.ts, verdicts.ts, verdicts.types.ts, promises11.ts, nodeCode.ts, types.ts (the place flag
  only); src/game/engine.ts, types.ts (`Platform.pit`), levelCheck.ts (`EARLY_DOUBLE` only), w1Pits.ts, stagePreload.ts (the bed's
  files), helpLadder.ts (item 7 only), stageGenerator.ts, testlink1_1.ts, buildAhead.ts; src/components/WorldMap.tsx;
  tools/engine/seedlist.ts; the tests beside each; src/assets/props/pits/ (the thorn bed's pieces); in item 7 only: protoStage.ts,
  w1Sections.ts, and `w1Finish` in w1.ts (w1.ts:1517-1527). REPORT.md under reference/qa-reports/E12/, your turnover note.
  For item 0's own gates: src/game/gen2/firstRun11.ts (the first run's lock, re-recorded only if `first-run.drift` fires),
  reference/qa-reports/R-165.59/calibration-main.jsonl (the tier bots' calibration, re-run because 1-1 changed), and, only if
  the list must be rebuilt, src/game/gen2/provenSeeds.ts through the tool (on R-165.112's head, the lead's word first).
- A type or interface change is the Architect's by the roster (verdicts.types.ts, gen2/types.ts): the lead has put them in this
  packet; say in REPORT.md exactly what you added.
- Nothing else. A needed change elsewhere is a PUSHBACK naming file and line.

## Definition of done (the Critic checks each; every item names its test and its gate)
**0. 1-1: the end of a fork's high road holds a cache. (Push 1)**
- Cause: `gFork` lays the fork's `find` socket on its last high piece (w1.ts:1118); the pipeline fills a `find` only in the stage's
  required section (pipeline.ts:2126, the 11-06 fix that pinned the seed to its perch); `offPathFilled` skips a piece that has a find
  socket (w1.ts:1504). So that piece is bare.
- Fix where the fill is decided, in pipeline.ts (:2120-2129), not in w1.ts: a `find` socket that is not the stage's find home lays
  a cache of 3 pickups over its piece (an arc, 30 px apart, at the socket's height). The seed stays alone on its perch.
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

**1. The seed list tool takes 1-2. (Push 2)**
- tools/engine/seedlist.ts:23 `KITS` gains '1-2' (`w1World`); the squirrel check stays 1-1's (:35); the verdicts' refusal count
  runs for every judged stage (:38-48); the first-run lock stays 1-1's. The search prints, per graph, how many fresh seeds it tried
  and kept, and how many each refusing rule refused (the lead's ruling on audit B-02: the yield is seen, never hidden by the list).
- Done-test: `npx tsx tools/engine/seedlist.ts 1-2 --check` runs (exit 2 "no rolled kit" today); with no list yet it fails by name,
  not by a throw. `seedlist 1-1 --check` PASS, its output unchanged but for the new yield lines.

**2. The thorn hollow: a fall that costs a heart, typed, laid, hurt and drawn. (Push 2)**
- Type (verdicts.types.ts:43-58): a third end beside soft and lethal, `{ kind: 'heart'; to: 'take-off' }`, with its own look,
  `'thorn-art'`. A soft look, a lethal look and the thorn look never stand in for one another: `drop.look-lies` covers all three
  ways (verdicts.ts:120). `dropsOf` (pipeline.ts:2706-2730) writes one such Drop per hollow.
- Data (gen2/types.ts:250-251): a flag `thorn?: boolean` on a `jump`, `double` and `pit` place. Laid (pipeline.ts:1210 `pitUnder`,
  :1550-1557): the hollow's floor 150-170 px under the lower lip, one piece, marked (`Platform.pit`, src/game/types.ts:335, gains
  `'thorn'`); NO climb-out steps (`pitSteps`); a `bank` piece of the section standing in the gap reaches down to that floor as
  the stepping stones do today. A zone in `heartFalls` (stageGenerator.ts:94-96) over the hollow, lip to lip, with the bed's top
  as its hurt line: not soft on Normal, soft on Easy. World 1's other pits stay exactly as they are (`pit: 'soft'`, w1.ts:64-65).
- Engine (engine.ts:2570, :7462-7492): his feet reaching the hurt line inside the zone is the fall: Normal runs `heartFall` (one
  heart, `recorder.event('hurt')`, the last heart `loseLife`); Easy runs the soft set-back with the hurt sound and blink, `hp`
  unchanged.
- The put-back (`softAt`, engine.ts:2511-2518): the last ledge he stood on that is NOT a pillar (a pillar: a piece with a mushroom
  standing on it and thorns on both sides), and short of that ledge's mushroom when it has one (from a pillar's 30 px clamp he
  would be set down inside the cap and thrown at once). So a stump island with no cap, and a hop ledge between two chains, are
  put-back spots; a pillar never is.
- Hearts need no new code: a stage with a heart fall that is not soft is already `risky` and gets a heart by every second flag
  (stageGenerator.ts:2896-2904); Easy's zones are soft, so Easy gets none. Prove both.
- Drawn (w1Pits.ts: a floor 100-200 px down is found as a soft pit and painted with the leaf bed, :52-56, :148-155): a `'thorn'`
  floor is painted with the THORN bed in the leaf bed's place, never both. The bed is the inventory's painted `w1-thorn-*` clumps
  (origin/art-director reference/art/cut/; origin/t-engine-inventory src/game/art/inventory/w1.json, layer `danger look`), drawn
  56 px tall (0.63 of Pokey's drawn 89.1 units, D41), where they are 90 to 144 px wide. Chosen by the hollow's width between its
  walls and pillars: under 150 px, ONE clump, the widest that fits; 150-300 px, two different ones; wider, one per 100 px, none
  twice in a row; each over the next by 15-25%, some flipped, picked by the roll's seed; drawn behind the banks, so a wall crops
  what runs past it. Baked once per hollow, re-baked when the canvas is restored (D6), drawn only in view, behind the platforms as
  the pit art is (protoArt.ts:1217). No code-drawn stand-in ships (STAGE-RULES §4); the files join the preload (stagePreload.ts:70, :198).
- Promises (promises11.ts:93-110): `floor.unmarked` judges 1-2 too. A new one, `thorn.untaught`: on the route, no thorn drop
  starts before the END of the thorn lesson's showing piece (the piece keyed `show` in the section whose `teaches` is 'thorns':
  the log he walks over the first hollow, where the thorn line's socket will stand), and none within 1,300 px of the spawn. The
  lesson's own first chain comes after `show` and is allowed. The double-teach promises stay 1-1's.
- Done-tests: a RealPlay test on a built stage with one hollow, both settings, with the REAL `heartFall` and `loseLife` (RealPlay
  stubs loseLife, realPlay.ts:144: restore it; one run pasted): Normal 3 falls = 3 hearts then a life; Easy 3 falls = 0 hearts;
  the put-back x printed for a fall from the entry ledge, from each pillar, from an island between two chains and from mid-air
  past the last cap. A verdicts test with planted lies: a thorn drop painted as leaf bed, as water, and a soft pit painted as
  thorns, each refused by name; a planted hollow before `show` refused `thorn.untaught`, the lesson's own chain passed. A draw
  test: hollows 100, 220 and 700 px wide get one, two and seven clumps, none twice in a row, the bed's top 90 px or more under
  the lip. Use Content's worked chain as the fixture (reference/specs/sims/chainlay12.ts).
- Gates: lockall against your base: nothing differs (no shipped stage lays a thorn place yet); drawcheck (limits unchanged,
  tools/perf/limits.json), artcheck, `npx vite build` (no asset over 4 MiB) and chunkcheck.
- **The still is yours and it is Matt's hold point** (CLAUDE.md "Show first"; the lead, 11-11): one hollow with a 3-cap chain,
  upright (390x844) and sideways (844x390), Normal, sent to the lead as soon as it draws. Content's first still shows layout only.

**3. 1-2 is judged on the flown reach. (Push 2)**
- reach.ts:83 `judgedOnArcs` and :86-89 `scopeOf` take 1-2; a scope for Normal 1-2 with its own rows, entered from chain.md §1
  ("Rows for src/game/gen2/reach.ts": the gaps equal Normal 1-1's, the double climbs 1 px lower), each with its `source`;
  verdicts.types.ts:18 `ReachScope`; reach.ts:97 `scopeFor` and verdicts.ts:87 (`scopeOf('1-1', setting)`, hard-coded) read the
  judged stage's own id. Easy stays `easy-any`.
- A section kind for a chain hop (verdicts.types.ts:34), judged cap centre to cap centre against chain.md §3's rule by the step
  between the two caps; `band.out` names it.
- Every other stage still reports `notJudged`, by the same definition (pipeline.ts:2753).
- Done-tests: the Critic's diff of reach.ts against chain.md §1 is empty; a raw 1-2 build lays a 253-256 px double gap (today it
  throws "past the double's reach 230 px"); a planted chain at S 240 level and at S 215 with a 60 px step is refused `band.out`
  on both settings, and chainlay12's six lays pass; 1-1's verdicts on its 200 listed seeds are unchanged.
- Gates: tsc; the gen2 suite; lockall: nothing differs.

**4. 1-2's find is Meeca's note, in its hollow. (Push 2)**
- Today a required section's `find` socket takes a golden seed (pipeline.ts:2129, `type: 'seed'`), and `finishStage` then puts
  the stage's own find, 1-2's note (`findForStage(1, 2)` is `w1_note`, finds.ts:356), on a hashed platform somewhere
  (stageGenerator.ts:2960, :3031-3085). On 1-2 that is a seed that is not its story and a note away from its hollow.
- Rule: where finds.ts gives the stage a find, the required section's `find` socket takes THAT find (a `type: 'find'` collectible,
  as `addFinds` makes it) and `addFinds` lays no second one; a stage finds.ts gives none keeps the seed (`findForStage(1, 1)` is
  null: checked).
- Done-test: a raw 1-2 build with a required section holding a `find` socket (supply12.ts's kit: its stand-in hollow has one):
  exactly one find, the note, at the socket, no seed, both settings, 6 seeds; 1-1's seed promise green.
- Gates: lockall: nothing differs.

**5. The double jump counts on 1-2. (Push 2; found by the Critic and by the supply run; RULED by the lead, 11-11 4:47 PM ET)**
- The level check counts a double only on 1-1 and from 1-6 (levelCheck.ts:132-134: `EARLY_DOUBLE` holds '1-1'; its own comment
  says the double is "in the player's kit from then on"). On 1-2 every piece that needs a double or a bounce plus an air jump
  reads as unreachable ("exit platform is not reachable"), and its section is swapped out: 11 of 1-2's sections never lay.
  `EARLY_DOUBLE` gains '1-2' (easyMode.ts:107 reads the same rule).
- The node code's V3 counts a double or a bounce as taught only by a T token IN the stage (nodeCode.ts:138-141; called at
  pipeline.ts:654-661), so every 1-2 roll with a D rise or a bounce node fails "uses the double before its teach". V3 reads the
  world's `lessons` for the stage: a move an earlier stage taught is taught.
- Done-tests: a raw 1-2 build lays w1-stair-test-back and keeps it (it is swapped out on every roll today); `checkCode` passes
  `A Tb Pg1 R Xc2 R Sb E` when `lessons` says 1-1 taught the double and still refuses it when it does not; on 1-1 nothing moves.
  `FLOWN` is no longer needed: `npx tsx reference/specs/sims/supply12.ts 120` gives what `FLOWN=1` gives today (720 of 720 built,
  V3 lines gone).
- Gates: lockall `--intended 1-2`: the OLD 1-2 may move here (its validator now counts the double); the lead's ruling: the old
  1-2 is being replaced and nothing ships between pushes 2 and 3 (D40), so that is accepted; say what moved, and that the old 1-2
  is deleted in item 7; nothing else differs. The full suite (`doubleAllowed` is also read by easyMode.ts, mixer/w1mix.ts
  and gen2/pipeline.ts).

**6. Off the road pays in bonus blooms on a harvest stage. (Push 2; RULED by the lead, 11-11 4:47 PM ET: "exploring always pays")**
- A harvest's quota is 87.5% of the PETALS laid (goals.ts:21, :51: flowers and leaves), so a petal off the natural road costs a
  player who stays on it; with 3-4 forks a roll there is room for 4 to 7 (CONTENT packet "Petals"). A `fruit` pickup already
  counts toward the goal when gathered and is never in the quota (engine.ts:3002-3003, :3073).
- Rule: on a stage whose objective is `harvest`, a `pickup` socket on a piece that is not `main` lays `fruit`, not `flower`
  (pipeline.ts:2097-2106), and item 0's cache does the same there. On every other stage, as today (1-1's caches are petals).
  The engine's harvest top-up and trim (pipeline.ts:292, :2187-2196; stageGenerator.ts capHarvest) count and move petals only.
- Done-tests: a raw 1-2 build: every pickup over a non-main piece is a `fruit`; the quota (`withGoals`) equals 87.5% of the
  flowers on main pieces; a RealPlay run that gathers a bloom sees the goal count rise by one. 1-1 unchanged.
- Gates: lockall: nothing differs. A still of a bloom beside a petal in 1-2, both ways: they must not look alike (the `fruit`
  draws as a classic bloom, the petal as Meeca's painted petal, vectorArt.ts:1087-1092); if they do, name it for the art pass.

**7. Route 1-2 to gen2, delete the old 1-2, help at its first chain. (Push 3, on Content's head, the lead's word first)**
- One definition of "a World 1 stage rolled from the proven list" (today the literal '1-1' in about ten places), read by:
  stageGenerator.ts:2851 (the build-ahead take), :2871 (`gen2Roll11`), :2873, :2889-2893, :3099-3101 (`builtOnGen2`);
  testlink1_1.ts:62-76 (`drawNext`, `newPlay11`, `play11Seed`: the seed pick and its stored order take a stage; 1-1's stored
  order key keeps working on an old save); buildAhead.ts:14; WorldMap.tsx:350.
- The test link's A, B, C picker stays 1-1's (`pick11`); 1-2 always plays from its list.
- `w1Finish` (w1.ts:1517-1527) dresses squirrels only on 1-1: on 1-2 `w1Squirrels` would add 1-1's squirrels, or throw when
  fewer than 3 find a spot (:1583). 1-2 has none (its brief's not-list).
- `#ctest` on 1-2's id still builds the testers' old control course (stageGenerator.ts:23, :2862): unchanged, with a test.
- Help (the lead's ruling on audit B-01): the ladder runs in 1-2 at ONE piece, the first chain of the section whose `teaches` is
  'thorns', on R-165.119's fixed ladder (it counts tries, not only falls); everywhere else in 1-2 it stays off (engine.ts:849 is
  1-1 only today). Its line there is the ladder's own bounce line (helpLadder.ts:31). What it grows is NOT the boulder stair
  (`STEP_CUT`, helpLadder.ts:35): at a chain there is no rise. RULED by the lead, 11-11 4:47 PM ET: it lays the lesson's own
  fallen log across that hollow at lip height (the natural piece the lesson showed him, drawn to Pokey's scale: 89.1 units, D41),
  on Easy by itself and on Normal on a yes, at the ladder's counts; gone when the stage ends. Else the line alone: if the grown
  log cannot be built inside this item, ship the line, say so in REPORT.md, and name what the log needs.
- The old 1-2 is deleted, no switch: `HAND_STAGES['1-2']` (protoStage.ts:70), w1Sections.ts's '1-2' rows (:334 on), 1-2's
  `CATCH_UPS` (protoStage.ts:506), and anything only they read; a grep in REPORT.md shows nothing else read them. The `ctest`
  plan keeps what it needs.
- Every test that pins '1-1' as "the gen2 World 1 stage" listed in REPORT.md with one of: now covers 1-2 too / 1-1 only, and why.
- Done-tests: `generateStage` for 1-2 returns a stage built by `buildPlayStage` from `w1World()` on a listed seed, both settings;
  `builtOnGen2` true; Easy has soft falls and Normal does not (engine.ts:844 as it reads today: say what it gives 1-2 and prove
  it); the child bot on Easy never stalls over 20 s at the first chain on a listed seed, and 15 failed tries there bring the
  line; a tier-bot run starts on 1-2 (`npx tsx tools/inspect/tierBots.ts --stage 1-2 --tiers middle --seeds 1-2 --setting both`;
  tierBots.ts:6 maps a seed through the 1-1 pick today: if that file must change, name the line for the Critic, who owns the bots).
- Gates: `seedlist 1-2 --check` PASS on Content's list; lockall `--intended 1-2`: only 1-2 differs; `seedlist 1-1 --check` PASS;
  tsc; the full suite in 3 shards (each failure classified); `npx vite build`, chunkcheck, buildcheck (alone), drawcheck,
  clipcheck, knowncheck, roadmapcheck; a fresh save and an old save that cleared the old 1-2 both open the new one (a still each way).

## What must not move
1-1's platforms, seeds, first-run layout and pins (item 0 changes its pickups only); every stage but 1-1 in item 0 and but 1-2
in items 5 and 7; World 8's heart falls (w8.ts:183; the same engine path: its tests stay green); the soft and lethal drop looks.

## Time (D25: from history where there is any)
Item 0: 1.5 to 2 h (the roadmap's range for R-165.115; no history). Items 1-6: no history for any of them; a range of 8 to 12 h,
the thorn hollow (item 2) about half of it. Item 7: 3 to 5 h. Waits on Content and the lead are timed apart in your TIMELINE.

## Return
Branch t-engine-1-2 from the named head, pushed (`git ls-remote` equals HEAD) after each of the three pushes. REPORT.md (60 lines
or fewer, the 7 sections, "Method used", "Lessons applied"), your turnover note rewritten. ONE send_message to the lead (the
session id on line 1 of reference/handoffs/lead.md) after each push, 8 lines or fewer. A blocker or a wrong frozen input:
PUSHBACK.md and one message, then stop.
## Attempt
2 (attempt 1: item 0 PASSED on its own; items 1-4 REJECTED by the packet Critic at f60e6503, 6 lines; each is answered in
DESIGN-1-2-notes.md §9)
