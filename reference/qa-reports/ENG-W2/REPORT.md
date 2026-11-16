# ENG-W2 REPORT: World 2's gen2 kit, and the river's one lay (R-165.254). Opus 5.5 xhigh (engine). 8:11 PM to ~10:10 PM ET 11-14
Branch t-eng-w2 from t-tools-2@19b45a06. The final full suite ran on f39e818b7 (3544 tests, 4 red, 2 fixed after it); the GATES section gives the head for each number.
Lessons applied: D36 (the gates ran on frozen worktrees), D40 (the foundation went first: the kit before any level), D51 (2-1 and 2-2 joined
drawcheck the day they were built), D53 (I ran the fast gates before every push), D55 (my context % is in every message), D57 (I read my
queue at each push), D67 (no shell wait loops), D19 (the look test calls footingsFor, the engine's own call), level.md rules 12, 16, 17, 21 and 22.

## EXACT NEXT STEP
0. **Done on the lead's ruling (8:50 PM): artUse is green with no allow-list.** 6-7's water-room lever is drawn as Matt's painted
   root wheel (step 0a below). **One ruling is still open: 2-1 and 2-2 cannot be judged yet** (ENGINE-WORTHY 1). Their flown rows are
   in flownArcs.ts (`n21`, `n22`), so adding `judged: 'normal-2-1'` / `'normal-2-2'` in stageTable.ts is all that is left once two
   World 1 verdicts read World 2's water. Until then registrycheck FAILs on "2-1 flown" and "2-2 flown", and on nothing else.
   **Two unit reds stay until World 2's real levels land** (GATES (c) and (d)): river.test.ts:62 "2-1: 0 logs" (fixed by step 1) and
   stageQuality.test.ts:79 "World 2 is shorter than World 1" (fixed by the designed 2-1/2-2, or by longer placeholder bricks plus
   `addlevel 2-1 --relist` / `2-2 --relist`). This branch must not merge to main before both are green.
   0a. (done) src/game/w6WheelArt.ts; the lever's `looks` field (puzzleKit.ts lever spec); the draw (puzzlePlay.ts, the levers loop);
   the room data (w6Rooms.ts:104-106); the preload ('w6-wheels', stageSheets.ts and stagePreload.ts, 6-7 alone); w6WheelArt.test.ts.
   Stills: `stills/w67-before-*` (the kit's wooden lever) and `stills/w67-after-*` (the root wheel at the well's lip, about 1.5x
   Pokey). The wheel picked by place for layout 1 is `sluice-wheel-b`. While the water is up, the wheel is drawn mirrored.
1. **The river as a gen2 section (the next World 2 engine job, xhigh, about 3-4 h; a fresh member can start here).**
   - **a. The place rule** (types.ts:279-303, the PlaceRule union; the Architect signs off). Add
     `| { kind: 'river'; after: string; row: string }`. `row` names a row of the world's river table (WorldManifest gets
     `rivers?: Readonly<Record<string, RiverRow>>`; World 2's is w2.ts W2_RIVERS).
   - **b. The gap** (pipeline.ts:1296, beside `rope`):
     `const a = ref(pl.after), r = M.rivers![pl.row]; x = a.x + a.w + riverWidth(r); y = a.y;`
     Push the gap `{ x0: a.x + a.w, x1: x, y: a.y, lo: a.y, pit: true, ...(r.safe ? { soft: true } : { water: true }) }`.
     Carry `riverRow: pl.row` on the local piece, as `ropeFrom` is carried (pipeline.ts:1469).
   - **c. The logs**, in layStage where the ropes are hung (pipeline.ts:2486-2492): for each piece with `riverRow`, call
     `layRiver(row, near.x + near.width, near.y, () => sink.nextPlatformId())`. Push its logs onto the platforms, and its zone onto a new
     `Laid.rivers` (Laid at pipeline.ts:1533, beside `ropes` :1563). The stage takes `rivers: laid.rivers` where it takes
     `ropes: laid.ropes` (pipeline.ts:3700). All of this happens BEFORE checkAndRepair (:3841), so levelCheck judges the logs: it already
     spans a log over its river (levelCheck.ts:100) and checks the spacing (:1040).
   - **d. The fairness**: `riverFaults(stage)` (riverLay.ts:87) joins checkStage's errors (pipeline.ts:3776). Plant one river breaking
     each rule (riverLay.test.ts "planted" has them).
   - **e. The drops**: dropsOf (pipeline.ts:4064) reads a fall inside a RiverZone as `life` (deep) or `putback` (safe).
     w2Finish (w2.ts:266) skips a fall that already has its river.
   - **f. The reach**: the asks (`asks.push`) record a river crossing as the bot's ride, not a jump. Otherwise verdicts.ts judges a
     600-800 px "jump".
   - **g. The bot toy (level.md rule 21)**, before any level lays a river. The skill exists: firsttimer.ts:2021-2040 waits at the edge
     for a log, rides it, and steps off when the next log or the bank is near. Build a fixture stage with one river section
     (listed.ts `withTestStage` and a toy kit). The middle and child bots must cross it on both settings. Plant: switch that block off
     and they drown.
   - **h.** Prove it on World 2's kit AND one other world's (rule 21). The lay is world-neutral: riverLay.test.ts already lays
     W2_RIVERS under World 6's ground.
2. **The 2-1 builder, after 1, is data only:**
   - w2Arc21.ts holds the node string from 2-1.md and bricks made from w2.ts's pieces (`bank`, `creek`, `deep`, `stone`, `rock` and
     the socket helpers, which are module-local today: export them, or give the arc file its own copies as w1Arc17.ts does).
   - Rivers go in as `{ kind: 'river', after, row: 'ride' | 'deep' | 'back' | 'twin' | 'long' }`.
   - The keeper's lines go in verbatim (reference/story/lines-2-1.md on t-story@50da9e58), held by a test. W2_TIPS.water already holds `deep`.
   - Replace `W2_ARCS['2-1']` and `w2Bricks('2-1')` in w2Manifest, then run `addlevel 2-1 --relist`, then add `judged` once
     ENGINE-WORTHY 1 is fixed.
   - Still needs art or engine: World 2's liana row (the w1Swing.ts pattern), the bounce as a bent Guadua bamboo or palm frond (the
     keeper's ruling: no mushroom), the village dug into the bank at the gate, and the arrival scene moved there (the keeper's ruling 4).

## What was built
- **src/game/gen2/worlds/w2.ts**, World 2's kit:
  - `w2World` (:242) and `w2Manifest`: world 2, Sunlit Riverbank, ground 580, banks 90 deep, style 'log' (World 2's painted earth bank).
  - W2_ART (:45): the inventory rows the kit is drawn as (the w2.webp banks, boulder and stump; the w2-props water and reeds; the water sign).
  - W2_TIPS (:65): the keeper's `deep` line, verbatim, as Dot's water warning.
  - W2_RIVERS (:77): the ride, deep, back, twin and long rows.
  - Pieces: `creek` (:92) is a splash-back gap, `deep` (:94) is a deep river, a stone is a 136 px bank standing in the water, a rock is
    the painted boulder (a moss stone exactly 50 px).
  - W2_ARCS / w2Bricks (:132, :147): each stage's PLACEHOLDER arc `A T R P R X R M R S R L E`, one brick a job, its own ids.
  - w2Finish (:266): every built fall becomes its river. A soft fall is a splash-back river; a water fall is a deep river. The pit bed
    under a splash-back river is taken out, and reeds stand behind him on banks.
- **src/game/gen2/listed.ts:42**, `worldFinish`: each kit names its world's finish, so World 2 never runs w1Finish. stageGenerator.ts:2924 calls it.
- **src/game/gen2/worlds/stageTable.ts**: rows `'2-1': { kit: 'w2' }` and `'2-2': { kit: 'w2' }`.
- **New replaces old.** I deleted the hand-built 2-1 and 2-2: their W2_STAGES rows, their w2Sections builders and flavour rows, the
  ferry room (only 2-2 used it), FLOWER_GOAL_22, and the 2-2 puzzle mark. Their 5 tests went with them: w2Stages.test 2-1/2-2,
  qaW123 2-2 x2, and the w2Puzzles ferry test.
- **src/game/gen2/riverLay.ts**: `layRiver` (:60) and `riverFaults` (:87), with RIVER_LAY (:34):
  - the minimum gap is 60 px, and the maximum is a hop (river.ts hopLimit);
  - the river runs at 143 px/s at most;
  - a log reaches the bank at least every 4 s;
  - he gets at least 120 px of bank to board from (the hand-built world's least lead);
  - the next log's slide-out stays in an upright screen.
  The hand-built 2-3..2-9 rivers now lay through it (w2Stages.ts:327).
- **Seed lists:** src/game/gen2/proven/seeds-2-1.ts and seeds-2-2.ts, 100 proven seeds each (provenIndex.ts).
- **drawcheck:** tools/perf/limits.json scenarios now include "2-1" and "2-2".
- **Flown rows:** flownArcs.ts n21/n22, flown on 2-1/2-2 (fly-2-1.txt, fly-2-2.txt).
- **Turnover note:** reference/handoffs/engine-core.md §0zc.
- **The lead's ruling (b): src/game/w6WheelArt.ts.**
  - It draws W6's two painted root wheels: the water-room sheet's `sluice-wheel` and w6balt's `sluice-wheel-b`.
  - The wheel is picked by the lever's place, drawn 140 px tall (the catalog's 1.57 x Pokey), and mirrored while on.
  - Wiring: puzzleKit.ts:70 (the lever's `looks`), puzzlePlay.ts:1894 (the levers loop) and w6Rooms.ts:105 (6-7's sluice lever).
  - Preload: stageSheets 'w6-wheels' (6-7 alone) and stagePreload.
  - w6WheelArt.test.ts has 4 tests. artUse.test is green again, with no allow-list.
- **Tests:**
  - src/game/gen2/worlds/w2.test.ts has 7 tests: the inventory, the rows, the arc, the look, the rivers, the first deep river, the
    finish. planted-faults.py has 8 plants, all CAUGHT.
  - src/game/gen2/riverLay.test.ts has 4 tests. One of them plants a broken river for each fairness rule, and each is named.

## GATES
**Two heads.** The final head is f39e818b7. From 9091b375a to f39e818b7 the only change is the `source` strings of the 2-1/2-2 flown
rows (flownArcs.ts) and their figures entered in chain.md §1, made because the suite's verdicts.test caught them. Nothing that runs in
the game changed, so the browser and perf gates were not run again on f39e818b7 (said plainly).

**On f39e818b7:**
| Gate | Result |
|---|---|
| unit suite | **3544 tests: 3538 pass, 4 fail** (plus 4-3's TODO, which is older than this branch). All 4 come from the hand-built 2-1/2-2 going: |
| | (a) puzzleCamera.test:101 "2-2 has puzzle rooms" and (b) stageSheets.test:63 "2-2: STAGE_DRAWS lists more than it draws (foe:goldsnake)". Both are stale data describing the deleted 2-2: its ferry room and its snakes. **Fixed in the follow-up commit** (puzzleCamera.test STAGES, stageSheets.ts STAGE_DRAWS), and both files re-run there: 12/12 |
| | (c) **river.test.ts:62 "2-1: 0 logs" is RED and stays RED**: the placeholder 2-1 lays no logs. It turns green when the river section lays 2-1's logs (EXACT NEXT STEP 1). I did not weaken it (law 5) |
| | (d) **stageQuality.test.ts:79 "World 2 is shorter than World 1" is RED**: the placeholder 2-1 and 2-2 (about 183 s typical) are shorter than the hand-built stages they replaced, so World 2's median fell more than 6 s under World 1's. It turns green with the designed 2-1/2-2 (2-1.md about 180 s designed, plus the rivers' waits) or longer placeholder bricks plus a relist. Not done tonight: it needs a relist and a new gate run |
| tsc, build, chunkcheck, artcheck, knowncheck, generality, roadmap | all 0 / PASS |
| seedlist --check 1-4, 1-5, 1-7, 2-1, 2-2 | PASS each (100, 150, 100, 100, 100) |
| registrycheck | FAIL, as expected: only "2-1 flown" and "2-2 flown" (not judged: step 0) |
| tool tests (CI's list) | 108/109. The 1 red is registrycheck.test "the shipped table passes the gate": the same two not-judged misses (step 0) |
| tierBots | 7/7 |
| verdicts.test + judgedTable + flown12 + doubleTaught | 48/48 |
| w2.test | 7/7; planted 8/8 CAUGHT (planted.out.txt) |
| riverLay.test | 4/4 |
| w6WheelArt.test | 4/4 |

**On 9091b375a** (the wheel's head):
| Gate | Result |
|---|---|
| drawcheck | **PASS** (701 s), 2-1 and 2-2 among its 14 scenarios |
| drawcheck on 6-7 alone (a scratch scenario list) | **PASS** (80 s) |
| clipcheck | **PASS** (83 known) |
| kbdcheck | **PASS** |
| buildcheck | first run **FAIL under load** (1-1 Normal p95 168 ms against the 150 ms budget, run beside the full suite, the lock, the seed lists and two drawchecks). **Re-run on f39e818b7 with only the suite beside it: PASS**, Normal p95 130 ms, Easy 61 ms |
| lockall --check against the base lock from 19b45a06 | **99/102 unchanged**; 2-1 and 2-2 moved (intended); **6-7 moved in `kit` only** (the lever's `looks`, as ruled) |
| seedlist 1-1, 1-2, 1-3 --check | PASS (162, 100, 100) |
| artUse.test | **green** (the wheel draws the 3 sluice-wheel pieces) |

**Earlier head** aca656aa2 (before the wheel): lock 100/102 unchanged, only 2-1 and 2-2 moved. So the hand-built 2-3..2-9, now laid
through riverLay, are byte for byte the same.

**addlevel 2-1** (final bricks): the bots ran on 40 seeds per setting. A run counts as a pass only when the bot reaches the shrine with
no rescue.

| Step | 2-1 |
|---|---|
| rolls | 24/24 clean on both settings |
| seed list | 100 of 100 tried; the quiet line's longest stretch is 4 s, median 3.7 s |

| Bot | Normal | Easy |
|---|---|---|
| kid | 39/40 | 40/40 |
| adult | 39/40 | 40/40 |
| child | 22/40 | 17/40 |
| middle | 31/40 | 28/40 |
| expert | 39/40 | (not run on Easy) |

The child loses about 4.6 lives a run on Normal, all to water: the placeholder's deep water is plain hops. The flight is in, but the
stage is not judged.

**addlevel 2-2:** 24/24 clean on both settings, 100 proven seeds. Bots: expert Normal 18/40. The expert fails on the harvest goal, not on
falls: "sealed door goal 84/85". The game's petal arcs set a goal of 85 or more, and they sit over the water.

## Polish check (stills of the real game)
These are of a rolled 2-1, Normal, layout 1 (proven seed 2), 412x915 and 915x412, at 2x: reference/qa-reports/ENG-W2/stills/.

| Still | Verdict |
|---|---|
| `w21-2-1-L1-x700-upright/-sideways` (the start) | World 2's sky, palms and painted earth bank; a clear flat start. PASS |
| `x3540` (the first splash-back creek) | the painted river water between two World 2 banks, reeds behind him. He reads clearly. Rough: the water is a narrow slot down between earth pillars, a well rather than a river (see rough spot 1) |
| `x14250` (the first deep river) | the flag and the water sign at the edge, Dot's warning set up ahead. Same slot look |
| `x24950` (the signature's stepping stones) | sideways shows the whole run of stones and rivers. Fixed this session: in my first shot a reed was drawn IN FRONT of him on the bank's edge, hiding him. The fix: reeds stand behind him, and none on stones (w2.test "the look" holds it, planted) |
| `x33700` (the exit bank) | flag, heart, World 2's frog and pot dressing. Rough: no village and no gate (the placeholder has no arrival scene) |

| `w67-before-6-7-L1-x6600-upright/-sideways` (6-7's water room, the kit's wooden lever) and `w67-after-*` (the same spot: Matt's root wheel at the well's lip) | after: the wheel reads as World 6's sluice, in scale beside him (about 1.5x his height). It stands on the floor at the lever's foot and clears the raft's rope. PASS |

## ENGINE-WORTHY (level.md rule 22; for the lead and the engine, not worked around in level data)
1. **The judged verdicts read World 1's pits, not World 2's water** (step 0b):
   - promises11.ts:57 `floorlessGaps` (findW1Pits) counts a `water: true` gap as an unmarked floorless gap.
   - verdicts.ts:136 `drop.unwarned` wants Dot's line AND the sign at EVERY lethal drop. pipeline.ts:3374 warns at the FIRST water only
     on Normal (Easy every 12 s).
   - Every World 2 roll fails both. The first is a fix (a water fall is marked by its water). The second is a rule conflict: is every
     deep river warned, or the first? It needs the lead's ruling, then the pipeline or the verdict, for EVERY world. Worlds 6-8 lay water
     too; they are only unjudged today.
2. **One carry rule.** These carry him three ways:
   - a drift log moves him by position (engine.ts:1850), so a jump off it keeps none of its speed;
   - a sway platform does the same (engine.ts:1837), and a lift carries him by y (engine.ts:1831);
   - a ride (ride.ts:19, RIDE.keep {x: 1}) keeps all of its speed.
   2-1's twist ("hop forward from the front end" of a log flowing back) plays differently under each rule. This is the Designer's
   rule; then one engine change, applied to every carrier, planted. I did not decide it.
3. flowerReach.ts:140 `standSpot` never re-seats a petal onto a 'drift' or 'moving' platform, so petals on logs and pads need a case
   (as DESIGN-FINAL says).
4. **The game's finishStage lays petal arcs over every route gap whatever `GraphBrief.petals: 'low'` says** (stageGenerator.ts finishStage,
   jumpTrails.ts addJumpTrails). The numbers: 1-7 builds 61 petals and plays 105; 2-1's placeholder builds 13 and plays about 97,
   against the keeper's ruling 2 ("few").
5. **artuse.mjs counts a template literal as a dynamic name.** That is how `sluice${ri}` hid unused W6 art (step 0a). The same false
   match may hide other names, for example W6's raft, stone and seesaw, which no code draws but generic words match.
6. **Easy water is a rule conflict.** Matt's rule (types.ts WATER_WARN) is that water costs a life on Easy too. 2-1.md says "Easy: every
   river the splash-back kind". Today Easy keeps the deep rivers deep. This needs a ruling.

## Rough spots, named plainly
1. **The rivers do not look like 2-1's rivers yet.** They are 90-120 px hop gaps that read as water slots between earth pillars. There
   are no logs on the gen2 2-1 until the river section lands (step 1). Dot's warning says "Stay on the logs!" (the keeper's words for
   this river) on a stage with no logs yet.
2. **The placeholder is not the level.**
   - No lianas down from the canopy, no bounce, no village, no arrival scene at the gate.
   - The bricks of 2-1 and 2-2 have the same shape (each stage's own ids).
   - 2-1 has about 97 petals (ENGINE-WORTHY 4).
   - **Do not put this head on Matt's test link as "2-1"** until w2Arc21 lands: it replaces the hand-built 2-1 he knows.
3. The child bots pass 22/40 and 17/40, and the middle bots 31/40 and 28/40, on the placeholder.
4. There is no bot toy for the log ride yet (step 2), and riverLay is not yet called by gen2 (step 1).

## Learned (what I would tell the next builder)
- **Before giving a row `judged`, build one seed with the scope on.** I judged 2-1 and 2-2 and re-listed, and every seed failed two
  World 1 verdicts. That cost one wasted relist.
- **A pool with one arrival plus the search's quiet judge makes a stage throw "no section fits node n1 (start)".** The judge bans a quiet
  slot's section and re-rolls. 2-1 went from 4 of 24 seeds to 24 of 24 once a hop sat within about 450 px of each brick's ends.
- **The game's length repair adds a second copy of the finale when the modelled clock is short.** Read the sections list, not only CLEAN.
- **In World 2, a moss stone draws as the painted boulder only at exactly 50 px.** 51-56 draws a stone pillar (terrain.ts footingOf).

## Method used / Method update
- Method used: level.md steps 2, 3, 4, 5, 7 and roles/ENGINE.md day one (the lock saved first, a planted failure first).
- Proposed method update (level.md step 3, for the lead):
  - "Before `judged`, run `npx tsx tools/engine/libstage.ts --stage <id> --seeds 1-3` with the row judged, and read the verdicts."
  - World 2 notes: "a moss stone is 50 px exactly"; "every gap in World 2 is a river (w2Finish): soft = splash-back, water = deep".

## My mistakes (and the standard each changed)
- **The flown rows' sources.** I entered the 2-1/2-2 rows in flownArcs.ts with `fly-2-x.txt` sources, without reading the test that
  holds every flown row's source to reach.md or chain.md (verdicts.test.ts:196). The full suite caught it. I fixed it by entering the
  figures in chain.md §1 and citing them, which moved the head from 9091b375a to f39e818b7. Standard: before adding rows to a data
  table, `grep -rn <TABLE_NAME> src --include=*.test.ts` and read what each test holds the rows to.
- **The 9:15 message.** It said "the only red is the old artUse result". At that count no red had shown at all; the verdicts.test red
  came later. Corrected in the final message.
- **Background runs and their limit.** Two long gate runs were killed at the background job's default 30-minute limit, because I had
  set only the shell's `timeout`. Standard: long gate runs are started with the tool's own timeout set (up to 2 h).
- I widened the deep gaps to look more like rivers before running the bots, and the child bots drowned. I narrowed them back.
  Standard: castBots in the same step as any gap change.
- The first base lock ran before npm install had finished. That cost one minute, and nothing was lost.
