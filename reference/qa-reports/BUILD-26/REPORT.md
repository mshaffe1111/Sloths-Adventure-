# BUILD-26c (on t-build-26 from fd3ce98b1): 2-6's bots on the current engine, every miss traced, the beat table, the hearts question. Started 5:27 PM ET 11-21 (by `date`)
Commits: 06096c3b4 (hearts test counts every cost), 2b123df7c (towerRoute: no entry corner beside a turn's top), b039ee3fb (its planted
test), 4ed9af678 (TRIAL: the bots take a tower's own route on every tower), ca9ba7d38 (that choice as takesTowerRoute, planted
test RED/GREEN), this REPORT. Saved: b26c/ (beats.mts: a bot's run as footing
segments with seconds; hearts.mts: each risk term per stage and setting; corners.mts, rivers.mts, route.mts: the tower route, the rivers
and the inspector's traced route on the PLAYED stage; rows/: castBots rows, base and each fix).

## EXACT NEXT STEP (the next level builder; base t-build-26 at this REPORT's commit). Long runs in the BACKGROUND on frozen worktrees
## BUILD-26d: land the bot fix (4ed9af678), then the 15th beat. The lead's rulings above stand. In this order:
1. **The trial fix, proven (rule 28; the lead's (b)).** 4ed9af678 (tools/inspect/firsttimer.ts:1446): the bots take a tower's own
   route (towerRoutePts) whenever towerCorners is non-null, not only when the inspector's trace fails. 2-6 x40 vs the base, row for
   row: 139 runs gained, 9 lost (b26c/rows/cast-base.jsonl vs cast-fix2.jsonl, compared by `python3` on (bot, setting, seed); the table
   is above). Then:
   a. **Trace the 9 lost runs** (child N 3, 5, 7, 8, 18, 24, 28; child E 11; expert N 12), two runs per cause, one line each.
      `npx tsx tools/inspect/b26/trace.ts child normal 3,5` and `b26/frames.ts` on a frozen worktree of 4ed9af678 (or later).
      Fix each where its cause is; a planted test for each.
   b. **1-4 diff**: castBots 1-4 x40 both settings was running at hand-over, first on frozen 4ed9af678, then on frozen fd3ce98b1
      (scratchpad rows c14-fix2.jsonl / c14-base.jsonl; lost with the container, so RE-RUN them). 1-4's trace fails, so its bots
      already took the tower route: expect it to be identical. Any moved row: explain it.
   c. **2-1..2-5 x40**: no tower there, so towerCorners is null and nothing should move. Prove it (castBots base vs head per stage),
      then tierBots 1-1 (`npx tsx --test tools/inspect/tierBots.test.ts`, 9/9).
   d. DONE at ca9ba7d38: the choice is `takesTowerRoute` (firsttimer.ts), its planted test in castBots.test.ts: GREEN 3/3 (the
      `tower` tests), RED with the base's rule (`traced === 'failed'` alone). Still run the WHOLE castBots.test.ts once.
   e. The hearts test (06096c3b4) is UNRUN: `npx tsx --test --test-name-pattern="bank village" src/game/gen2/worlds/w2Arc26.test.ts`;
      plant it RED (count `v.safe` rivers instead of `!v.safe`), then restore.
   f. Drop the "(trial)" from 4ed9af678's subject in the REPORT. Commit messages stay as they are; no rewriting of history.
2. **Step 0's suite**: frozen fd3ce98b1, still running at hand-over: 1,867 ok, 0 not ok (`scratchpad/suite.log`, lost with the
   container). ENG-26l's 626fac5ac run reached 3,214 ok, 0 failed. Run it WHOLE on the head after step 1, since it then carries code
   (D114).
3. **THE BAR (the lead's correction, after the trial, replaces the 125 s bar and the two-beat plan):** Matt's STAGE-RULES.md:84,
   a climb's floor is 100 s: EVERY bot at or above 100 s on every listed roll (`castBots --proven`, castBots.ts:107, eraRoll.ts:30),
   and as a margin the expert MIN over 80 runs at or above 105 s. On the trial the expert MIN is 103.1 s (seed 32), 2 s short. The
   two new beats are NOT needed for release 3. In this order:
   (1) **The 8 adult Normal runs under 100 s, measured at hand-over (b26c/rows/cast-fix2.jsonl): all REAL runs, none rescued.**
       seed 29: 96.1 s, 14: 96.2, 21: 98.8, 5: 98.9, 10: 99.1, 12: 99.1, 18: 99.1, 23: 99.2. Every one has 0 rescues and 0 turn-backs
       (23 has 1 stuck spot). On the same seeds the expert takes 111.1-133.9 s, so the adult is 12-35 s FASTER than the expert. The
       likely reason: FT_ADULT has no stand time (no standQ; the tier bots stand 0.2-0.8 of the time from the testers' numbers), so it
       boards and walks without a pause. To check: is the adult (not tester-calibrated) a quick player by Matt's rule, or a bot
       quicker than any tester? Bring it to the lead; do not change the stage for it.
   **The lead's ruling on the fast adult (it REPLACES (2) and the 105 s margin):** a route with no standing is one a quick player
   can really play, so the adult is a fair quick-player bound, and the tool's floor applies to it as on every shipped stage (no rule
   change). The expert +5 s margin is retired.
   (2) After the 9 lost runs (step 1a) are fixed: **relist 2-6 under `castBots --proven`** (a roll where ANY bot runs under 100 s is
       refused; methods/seed-list.md, `tools/engine/seedlist.ts 2-6 --merge <proven.json>`) and report the YIELD (rolls kept of
       rolls tried). At about 60% or more, no content is needed for release 3. Below that, bring the lead a plan for the smallest
       honest content (a longer street between two wheels, or one beat) FIRST (rule 25).
   (3) Then the 1-4 base-vs-trial row diff (rule 28; 1b above).
4. **ENGINE-WORTHY (for the lead's roadmap)**: easyMode.ts:431 costsHere counts safe rivers (Easy lays 8 hearts on 2-6 where nothing
   costs one; Normal's stageGenerator.ts:2952 `risky` leaves rivers out); one shared reading of risk, a survey of every stage first.
   And the inspector's route (tools/inspect/route.ts) slants a tower turn's climb through the floors (`traced: extended` on 2-6):
   any tool reading findRoute on a tower reads a wrong way on.

## The lead's rulings (received after the cause table)
(a) castBots beside the suite, two heavy runs only, pause castBots under ~1.5 GB free. (b) Causes 1-3 are BUILD-26c's, on t-build-26:
two runs per cause, the fix where the cause is, general, planted, rule 28's row-for-row diff on 2-1..2-6 x40 and 1-4, tierBots 1-1 9/9.
2-MINUTE: no slowing the wheels, no filler; the lever is CONTENT: a 15th beat that turns the wheel idea a new way (two wheels turning
opposite ways, a hop bucket to bucket), ~12-15 s for the expert, before the crest, taught per rule 2; its plan to the lead FIRST (rule
25) and wait for the GO; the new MIN over 80 runs after causes 1-3. HEARTS: Normal 0 is correct; the test says why; the Easy defect is
ENGINE-WORTHY (roadmap, an engine member, a survey first), not touched here.

## Step 0: the full src suite on frozen fd3ce98b1
Running in the background at hand-over: **1,867 ok, 0 not ok** (not finished; see the EXACT NEXT STEP 2). ENG-26l's REPORT section
was not on fd3ce98b1 (only its stills), so it had no verdict to read.

## Step 1: castBots 2-6, seeds 1-40, both settings (rule 28), frozen fd3ce98b1 (rows: b26c/rows/cast-base.jsonl)
| head | kid N/E | adult N/E | child N/E | middle N/E | expert N | expert MIN |
|---|---|---|---|---|---|---|
| 8f3bcb3b6 (BUILD-26b) | 0/40, 0/40 | 0/40, 0/40 | 28/40, 27/40 | 38/40, 33/40 | 39/40 | 112.3 s |
| fd3ce98b1 (this base) | 0/40, 0/40 | 0/40, 0/40 | 34/40, 28/40 | 35/40, 33/40 | 38/40 (17, 26) | **108.8 s** (seed 10; 30: 110.9; 34: 111.2; median 121.5, seed 1) |
| 2b123df7c (entry corner) | identical, row for row (0 gained, 0 lost, every tier's rescues the same): the bots do not read towerRoute on 2-6 (below) | | | | | |
| **4ed9af678 (TRIAL: the tower's own route)** | **29/40, 24/40** | **33/40, 24/40** | 32/40, **38/40** | **39/40, 40/40** | **39/40** (12) | **103.1 s** (seed 32; median 114.2) |
Trial vs base, row for row: 139 runs gained, 9 lost (child N 3, 5, 7, 8, 18, 24, 28; child E 11; expert N 12); rescues kid 199 -> 34,
adult 202 -> 29, child 21 -> 10, middle 14 -> 1, expert 2 -> 1. Adult N: 8 runs under the 100 s climb floor (median 105.6 s).
Every miss is a rescue (hits 0, lives 0).

## Step 2: the cause table (rule 28; frame = t x 30; single-bot traces on frozen fd3ce98b1)
| # | runs (bot setting seed: t, frame, x, y) | what took him | cause |
|---|---|---|---|
| 1 | adult E 2: 83.2, f 2496, x 1527 y 4315, 20 s; adult E 20: 80.4, f 2412, x 1526 y 4316; the same on more turns (adult E 2/20 x ~1065 y 1799, x ~1059-1073 y 3067; kid N 11: 119.3, x 1087 y 2824) | short of a tower turn's vine (x 1612) he dithers L/R 1512-1535, never presses up | **BOT (the route it follows)**: 2-6's route TRACES (`traced: extended`, tools/inspect/route.ts), so firsttimer.ts:1446 never takes the tower's own route (towerRoutePts, only on `failed`); the trace draws the turn's climb as a SLANT, `climb 1612,4315 -> 1346,4034`, through the floors, and the way on 120 px ahead is on the slant over x ~1530: he stands under it. (1-4's trace fails, so 1-4's bots use the tower route and pass: kid/adult 1-4 seeds 1-2 PASS 7/8.) Not ENG-27m's (no hop) |
| 2 | child E 2: 139.8, f 4194, x 635 y 4315 (8 falls, rescued at 141.1) | up the vine x 573 (4624 -> 4315), off at 635, he turns LEFT and walks into the vine's hole at 553 | **BOT (the same traced route)**: its climb is `573,4624 -> 859,4315`, a slant; first diagnosed as the tower route's entry corner (599, 26 px past the vine): 2b123df7c fixed that corner and moved NOTHING, so it is the trace. Second run: TO DO |
| 3 | expert N 1: 60.4, f 1812, x 1562 -> 1618 y 3741 (twice, ~8 s); expert N 8: 56.8, x 1610 y 3740 (once, ~2.7 s) | up a rest street's turn, off left at 1509, walks right and runs off the ledge's end into the shaft, falls ~360 px, climbs again | **BOT (the same traced route)**, as 2. Costs time, not a miss: fixed, the expert is FASTER |
The vines and the tower's own route are right (b26c/corners.mts on the played Easy 2: `1127,4315 1612,4315 1612,3964 1586,3964 376,3964`,
vine x 1612 3964-4315): not the engine, not the lay.

## Step 3: the 2-minute beat table (expert N; b26c/beats.mts, footing segments; design seconds in [])
| beat | seed 8 (117.7 s) | seed 1 (121.5 s, the median) | design |
|---|---|---|---|
| 0 millpond | 8.3 | 7.9 | 10 |
| 1 the first wheel | 7.5 (ride 6.2) | 10.6 (ride 9.4) | 18 |
| 2 the first street | 5.0 | 4.4 | 10 |
| 3 through a house | 8.3 | 7.7 | 12 |
| 4 the millrace | 14.0 | 12.7 | 12 |
| 5 off at the edge | 9.1 (7.7) | 8.8 (7.3) | 18+6 |
| rest | 7.3 (2.7 of it cause 3) | 13.5 (~8 of it cause 3) | - |
| 7 the hanging porches | 11.0 | 9.1 | 10 |
| 8 jump off the top | 7.3 (5.6) | 8.4 (6.2) | 16+6 |
| rest | 1.9 | 1.9 | - |
| 10 wheel to bounce | 16.5 (9.3) | 13.8 (7.2) | 16+6 |
| rest | 4.9 | 6.2 | - |
| 12 the great wheel | 11.3 (10.2) | 10.4 (9.1) | 20 |
| 13 the crest | 5.3 | 6.1 | 8 |
The walking beats sit near the design; the five wheel beats are ~51 s against the design's 106: he boards at once and rides under half a
turn (the design's seconds are a watcher's). A ride swings ~3 s with the bucket's phase (the teach wheel 6.2 vs 9.4). The MIN seed (10,
108.8 s) is 16.2 s short of 125, more once cause 3 stops costing the expert time. (MIN seed 10's own beat table: TO DO, after the fix.)

## Step 4: the hearts question
- **Normal**: stageGenerator.ts:2952 `risky` (a creature, `waterY`, a heartFall that is not soft, deadly proto water, a gen2 pit that is
  not soft; not rivers); :2955 lays a heart by every second flag when risky or the stage is in GEN2_STAGES. Normal 2-6 (b26c/hearts.mts,
  layout 1): 0 creatures, no waterY, 0 heartFalls, pit soft, 6 rivers ALL `safe` (splash, back to the bank, no life: engine.ts:2965);
  listed, not in GEN2_STAGES: **0 hearts, correct by Matt's 11-05 rule** (2-4's 6 come from waterY 1186; 2-5's 7 from 9 creatures and
  waterY 897).
- **Easy (ENGINE-WORTHY, the lead's ruling: roadmap, an engine member, a survey first; not touched)**: easyMode.ts:431 `costsHere`
  counts `(stage.rivers ?? []).length > 0` with no `safe` test, so flagHeartsOwed (:438) is true and :560 lays a heart at all 8 flags
  where nothing on Easy 2-6 costs one. Two copies of the one H1 reading disagree on rivers.
- The test (06096c3b4, the lead's ruling): w2Arc26.test.ts now counts every way a heart is lost (adds a river without `safe` and a
  non-soft pit), so its 0 is the rule's answer. NOT RUN yet (two heavy runs going).

## Polish check
No stills (rule 29: the bots are red).

## Owned miss
I fixed a route the bots never read (2b123df7c). I diagnosed the overrun from towerCorners' output without first checking which route the bot
FOLLOWS on 2-6 (firsttimer.ts:1446 takes the tower route only when the trace fails). The row-for-row diff caught it: 0 moved.
Countermeasure (for level.md rule 28, the lead decides): a bot trace names the route the bot follows (traced, or the tower's own) before
any route is blamed.

## Learned (proposed, the lead decides)
- A tower whose inspector trace succeeds is still a tower: the bots read its own laid route (the trial fix; a planted test to come).
- Run castBots 1-40 on the fix BEFORE writing its planted test: it took 1.5 min at --par 2 beside the suite and showed the first fix moved nothing.

## Lessons applied
D111 (the box from Sat Nov 21 22:44:57 UTC 2026: started 5:27 PM ET, handed over at the box with the EXACT NEXT STEP), D113 (every long run with
run_in_background), D115 (every run on a frozen worktree: base, fix1, fix2, t3, plant), D114 (the suite as step 0), D57/D87/D105
(ReadNotifications at every step and push; the ruling was read the moment it came), D109 (no clock times to the lead), D102 (read lean),
D40 (the Easy hearts defect left for the engine member who will survey it), law 3 (the route the bot follows measured, after the miss).

# ENG-26l (on t-build-26 from 626fac5ac): step 0 the full suite, step 1 the stills. Started 5:06 PM ET 11-21 (by `date`)
Commits: ea3d7e7a2 (the head stills, stand.mjs, order.mts), fd3ce98b1 (the base stills), this REPORT. No game code changed. Saved: eng26l/
(stand.mjs: the stills tool to use, Pokey set down and left to stand with Dot's cards tapped away; order.mts: a listed stage's order; stills/).

## EXACT NEXT STEP (the next engine member; base t-build-26 at this REPORT's commit). Long runs in the BACKGROUND (D113), never with '&'
## ENG-26m: step 2 of ENG-26l's packet (load speed, bots, lockall, THE FULL SET) on this head; the suite verdict and the stills are below
0. **Step 0 WHOLE (D114): the full src suite on 626fac5ac ended exit 0: 4,035 tests, 4,032 pass, 0 fail, 0 cancelled, 3 TODO (R-165.312's roost boa; 4-3's boulder wall check, two), 32 min on 4 cores beside the stills; src/ and tools/ are unchanged 626fac5ac..71cbb9bda (git diff empty); after it BUILD-26c's 06096c3b4 and 2b123df7c changed only src/game/gen2/worlds/w2Arc26.test.ts (re-run on this head: 5/5, 0 fail) and tools/inspect/towerRoute.ts (no src file imports it), so the verdict carries to this head and the next member skips a second suite (the lead's ruling); no red, no re-pin (rule 20).**
1. **Frozen trees** (D99 needs quiet: nothing else running): `git worktree add --detach <S>/base 4ea253b8c` and `<S>/head <this head>`,
   each with `ln -s <checkout>/node_modules <tree>/node_modules` (`npm ci --legacy-peer-deps` once in the checkout, 5 s; package.json and the
   lock are the same on both). Then ONE heavy run at a time, base first, each with run_in_background:
   `OUT=<f> npx tsx reference/qa-reports/BUILD-26/eng26h/tools/loadtime.mts <tree> 1-4 3`, then `... 2-6 3` (every listed seed, both
   settings; p50/p95/max per setting, "fell to search" must be 0);
   `BUILDCHECK_STAGE=1-4 node tools/perf/buildcheck.mjs` then `=2-6`, base first;
   `time npx tsx tools/engine/seedlist.ts 1-4 --check` ALONE (CI's seedlists job limit 45 min, gates.yml line 113) and the lock timed
   against its own limit (D99). A breach: name it.
2. **castBots, one chain (rule 28):** `npx tsx tools/inspect/castBots.ts --stage 1-4 --seeds 1-40 --setting both --rows <f>` on base,
   then head; row for row: no tier's pass count may drop, every moved row explained (two runs per cause, one line each: seed, x, frame,
   what took him). tierBots 1-1 (`npx tsx --test tools/inspect/tierBots.test.ts`, 9/9). qaW123 ran in the suite (step 0).
3. **THE FULL SET** (gates.md, D96; `git fetch --unshallow` first so roadmapcheck sees proofs), CI's tool line (gates.yml line 157)
   included; lockall `npx tsx tools/engine/lockall.ts --layouts 16 --check reference/qa-reports/BUILD-26/eng26j/lock-8e21145f1.json.gz`:
   only 1-4 and 2-6 may move. engine-core.md's tower lines (ENG-26g's list, ENG-26h's cost findings, ENG-26j's gateRun).
4. Then BUILD-26c runs 2-6's bots.
5. Any later stills: `node reference/qa-reports/BUILD-26/eng26l/stand.mjs <tree> <out> <stage> <layout> normal <port> <name:x:y,...>` (the
   lead's ruling), never eng26h's pin.mjs (it draws Pokey frozen in the air under a paused card). The page's `?layout=N` builds the seed the
   stills tool prints (layout 1 is seed 2 on 1-4): measure spots on THAT seed (eng26k/feet.mts, eng26j/gates.mts).

## Step 0 (D114): the full src suite on 626fac5ac
- **Step 0 WHOLE (D114): the full src suite on 626fac5ac ended exit 0: 4,035 tests, 4,032 pass, 0 fail, 0 cancelled, 3 TODO (R-165.312's roost boa; 4-3's boulder wall check, two), 32 min on 4 cores beside the stills; src/ and tools/ are unchanged 626fac5ac..71cbb9bda (git diff empty); after it BUILD-26c's 06096c3b4 and 2b123df7c changed only src/game/gen2/worlds/w2Arc26.test.ts (re-run on this head: 5/5, 0 fail) and tools/inspect/towerRoute.ts (no src file imports it), so the verdict carries to this head and the next member skips a second suite (the lead's ruling); no red, no re-pin (rule 20).**
- `npx tsx --test src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts
  src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts` on 626fac5ac (frozen: this REPORT changes no game code), started at the step's
  start with run_in_background, beside the stills.
- **At the box (D111) it was still running: 3,214 ok, 0 failed.** The one `not ok` is the R-165.312 TODO ("raw seed 1 keeps the roost boa on
  its roost (flag placer) # TODO", not a failure; the same one ENG-26k saw). The two 2-6 tests ENG-26k re-pointed (listedWheelSheet,
  towerWater) are among the passes; no 1-4 red. Still running at the box: the last src/game files (stageQuality, stageSheets, storyFrame
  and on).
- **NOT a whole run yet, so no re-pin is taken from it (rule 20)** and none was needed (no red). The lead's call: the next member finishes
  step 0 (a whole run on this head, run_in_background, its totals in its REPORT) before anything in step 2, or the lead takes this 3,214/0.

## Step 1: stills, 1-4 layout 1, base 4ea253b8c vs head 626fac5ac, 2x, upright and sideways
- **Layout 1 on the page plays SEED 2, not seed 1** (the engine's own `gen2.seed`, printed by the stills tool on both trees; eng26l/order.mts:
  the list is 1, 2, 3, 4 ... on both). ENG-26k's spots (`gate:1000:8215,land:1238:7293` / `gate:860:8159,land:1094:7293`) were measured on
  seed 1, so on the page they would have put Pokey in the air. Seed 2's gates, measured (eng26k/feet.mts on both trees, eng26j/gates.mts on
  the head):
  - base: the bottom gate 646-1086@8120 over its foot 566-1166@8480 (80 px past each end); the next gate 310-750@7214 over 492-872@7313.
  - head: the bottom gate 540-980@8120 over its foot 354-1166@8480 (186 px past each end); a run off its right end lands at x 1144 on its
    own foot (the foot's tip 22 px past him). The next gate 319-759@7214: a run off its right end lands at x 840 on 501-978@7313.
  - Spots (Pokey set down there and left to land): base `gate:1096:8480,land:831:7313` (the land spot is the head's run distance added to
    the base gate's end; the base has no walkOff to measure it); head `gate:1080:8480,land:840:7313`. Grounded true at every spot, x unchanged.
- **The stills tool was wrong two ways, fixed in eng26l/stand.mjs** (a copy of eng26h/tools/pin.mjs): (1) Dot's "Tap here when you've read it"
  card was up and pauses the game, so Pokey was drawn frozen in his jump pose; (2) the render pin put him about 48 px above the wood. stand.mjs
  taps her cards and Skip tips, sets him down once and lets the game land him. The pin stills are not used.
- Stills (2x, 390x844 and 844x390), in reference/qa-reports/BUILD-26/eng26l/stills/: `head-1-4-normal-L1-{gate,land}-{up,side}.webp`,
  `base-...` the same.
- **Polish check, the way Matt sees it on a phone:**
  - head gate-up: Pokey stands on the long log well past the fig branch's end; the log carries on to its post. It is the same log he walks
    the field on, not a shelf, and it reads as wood he can stand on at his size (the log about a third of his height thick). PASS.
  - head gate-side: the foot is one long log from the left of the trunk to the post, the branch above ending well before it. PASS.
  - head land-up / land-side: he stands on the log just right of the gate's end with about 140 px of wood still ahead of him: a place to land,
    not a tip. PASS.
  - base gate: he stands at the very end of a shorter foot, by the post (80 px past the gate's end): this is what the fix lengthens.
  - The base stills carry Dot's creak tip ("Hear it creak? Scoot a vine over!") in mid-screen: stand.mjs's Skip tips tap took on the head
    but not on the base. It covers neither the foot nor the gate's end; kept as the before.
  - **The lead's ruling: both head upright stills ACCEPTED** (the foot runs on past the gate's end to the post, solid wood to his scale, the
    field's ground; at the landing he stands on a long log with room past him). stand.mjs is the stills tool to use. The nit (the fig branch's
    hanging end drawn over the log 99 px under the 7214 gate, on the base too): the lead reads it as foliage in front of the wood, natural
    layering: no row.

## Lessons applied
D114 (step 0 first: the full suite on the base, in the background, before anything else), D113 (every long run with run_in_background,
no foreground wait: the waits were background until-loops), D111 (the box from `date`: started 5:06 PM ET, handed over inside 28 minutes
with the EXACT NEXT STEP), D102 (read lean), D29 and rule 20 (no re-pin taken from a partial run), D109 (no clock times to the lead),
D105/D57/D87 (ReadNotifications at every step and push), law 2 and law 3 (judged the real screen and checked the fact: the page's layout 1
plays seed 2, not the seed 1 the spots were measured on; the old stills tool drew Pokey frozen in the air under a paused card, so the
stills were re-shot with him standing), law 1 (no still sent with a card over the spot).

# ENG-26k (on t-build-26 from 3310f3ac9): 1-4 relisted ONCE on the gate section's own catch. Started 4:46 PM ET 11-21 (by `date`)
Commits: 5981c26c0 (the relist), c45496570 (the two 2-6 tests), this REPORT. Saved: eng26k/ (cmp.mts: an old and a new list compared seed by seed and plan by
plan; feet.mts: each gate on a built roll and the wood under it, works on trees without walkOff).

## EXACT NEXT STEP (the next engine member; base t-build-26 at this REPORT's commit). Long runs in the BACKGROUND (D113), never with '&'
## ENG-26l: steps 1 (rest) to 4 of ENG-26k's packet, on this head (the relist DONE and checked)
1. **The re-pins.** The full src suite on 5981c26c0 (the relist) was still running at the box (D111): **2,003 ok when the box ended, no 1-4 red**; the only reds
   were the two 2-6 tests below (fixed in c45496570) and one TODO (R-165.312, not a failure). **Step 0 (D114): re-run the FULL suite on
   this head in the background** (`npx tsx --test src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts
   src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts`, about 20+ min on 4 cores; its result is what the re-pins
   are taken on, rule 20).
   **DONE on 5981c26c0: the tools tests that read 1-4 pass 55/55, none needs a re-pin** (`npx tsx --test tools/engine/tipwalk.test.ts
   tools/difficulty/coveragecheck.test.ts tools/difficulty/score.test.ts tools/inspect/bands.test.ts tools/inspect/castBots.test.ts
   tools/inspect/travelBots.test.ts`).
   Then the whole CI tool line (gates.yml line 157) in THE FULL SET. A red that names a 1-4 roll or seed: re-pin it from the new list (eng26k/cmp.mts
   says which seeds' plans moved), never loosen it. **Two reds that are NOT the relist** (the same two fail on 3310f3ac9, measured):
   listedWheelSheet.test.ts and towerWater.test.ts, `withTestStage: 2-6 is already listed` (2-6 is listed, n 100; the tests still lay 2-6
   as a draft). FIXED in c45496570 on the lead's ruling (re-pointed at the listed 2-6); they are not re-pins.
2. **Load speed (quiet: nothing else running).** Frozen trees: `git worktree add --detach <dir> 4ea253b8c` and `... 5981c26c0` (or the
   head with the re-pins: same src/game/gen2), each with a node_modules link (`npm ci --legacy-peer-deps` once in the checkout; plain
   `npm ci` fails ERESOLVE). Then, one at a time:
   `npx tsx reference/qa-reports/BUILD-26/eng26h/tools/loadtime.mts <tree> 1-4 3` and `... 2-6 3`, base then head (OUT=file for rows);
   `BUILDCHECK_STAGE=1-4 node tools/perf/buildcheck.mjs` and `=2-6`, base first. Time `seedlist.ts 1-4 --check` alone: 1 m 44 s here WITH
   the suite beside it (CI's seedlists limit 45 min, gates.yml line 113); the lock timed against its own limit (D99). A breach: name it.
3. **Stills at 2x (eng26h/tools/pin.mjs, 390x844 and 844x390), layout 1 = seed 1 on both** (eng26k/feet.mts found the wood):
   base 4ea253b8c: the gate 534-974@7855 over its foot 454-1054@8215 (80 px past each end); the gate 634-1074@6893 over 554-1154 and
   1154-1280@7293. Head: the gate 300-740@7799 over its foot 114-926@8159 (186 px past each end); the gate 481-921@6893 over 286-1116@7293,
   whose run off the right end lands at x 1094 (eng26j/gates.mts). Spots (Pokey's feet on the wood):
   base `gate:1000:8215,land:1238:7293`; head `gate:860:8159,land:1094:7293`
   `node reference/qa-reports/BUILD-26/eng26h/tools/pin.mjs <tree> <out> 1-4 1 normal 5191 <spots>` (a different port per tree). Judge:
   the longer foot reads as the field's own ground, not a shelf; the landing reads as a place to land.
   castBots, one chain (rule 28): `npx tsx tools/inspect/castBots.ts --stage 1-4 --seeds 1-40 --setting both --rows <f>` base, then head;
   no tier's pass count may drop, every moved row explained. tierBots 1-1 (`npx tsx --test tools/inspect/tierBots.test.ts`, 9/9); qaW123
   is in the src suite (src/game/qaW123.test.ts).
4. **THE FULL SET** (gates.md, D96; `git fetch --unshallow` first so roadmapcheck can see proofs); lockall `--layouts 16 --check` against
   eng26j/lock-8e21145f1.json.gz: only 1-4 and 2-6 may move; engine-core.md's tower lines (ENG-26g's list, ENG-26h's cost findings,
   ENG-26j's gateRun: a sealed piece's own wood catches its full-speed run). Then BUILD-26c runs 2-6's bots.

## Step 1: the relist (methods/seed-list.md)
- Candidates: seeds 1-100 in their old order (all 100 build clean on both settings on 3310f3ac9's code, eng26j/sweep-1-400-8e21145f1.json:
  no new seed needed). `npx tsx tools/engine/seedlist.ts 1-4 --merge cand.json --in-order --count 100`: **100 proven of 100 tried, 43 s**;
  quiet line longest 2.8 s (median 2 s, under 4 s on 100 of 100); outro 420 px.
- Proof nothing moved but what the fix moves (eng26k/cmp.mts, old list vs new): **the seeds are the same 100 in the same order** (layout
  variant N is still seed N); **45 of 100 packed plans changed** (seeds 6, 7, 8, 9, 10, 14, 18, 19, 20, 21, 22, 23, 27, 28, 29, 31, 34, 42,
  46, 48, 50, 52, 54, 59, 60, 62, 63, 64, 66, 67, 69, 72, 75, 76, 79, 81, 83, 84, 86, 89, 91, 94, 95, 97, 100), 55 the same; it includes
  ENG-26j's seven that replayed differently (8, 18, 22, 31, 54, 59, 66). provenIndex 1-4: n 100, version 6b772e6e -> b3feea99.
- `seedlist.ts 1-4 --check`: **PASS** (the verdicts refuse 0 of 100 listed seeds; 100 seeds, each clean on both settings; 1 m 44 s on a
  4-core container with the suite starting beside it).

## The lead's ruling: two 2-6 tests re-pointed at the LISTED 2-6 (c45496570)
- Found in the suite: `listedWheelSheet.test.ts` and `towerWater.test.ts` failed `withTestStage: 2-6 is already listed`. **Measured on
  3310f3ac9 itself: the same 2 fail there** (not the relist; 2-6 is listed, n 100, and the hand-built 2-6 is gone from W2_STAGES).
- listedWheelSheet: asserts no hand-built 2-6 is routed and the listed row asks for 'w2-wheel'. **RED with stageSheets.ts line 235 reading
  GEN2_STAGES alone** (planted, measured: "the listed row asks for the wheel sheet (kit:1, ... gate:2)"), green restored.
- towerWater: the listed 2-6, layouts 1-3 from the real list (`loadSeedList`), both settings: water is stacked over the spawn and the first
  4 frames keep him there, no life lost. **RED with river.ts riverAt reading x alone** (planted, measured: "layout 1 easy: at the spawn
  (140, 7551), not set on a pond's jetty (he is at 234, 2281)"), green restored. Both files 3/3, tsc clean.

## Gates on this head
| Gate | Result | Where |
|---|---|---|
| seedlist 1-4 --check | **PASS** (0 of 100 refused, 100 clean on both settings) | 5981c26c0 |
| full src suite | 2,003 ok at the box, still running; reds only the two 2-6 tests (fixed) | 5981c26c0; RE-RUN as step 0 |
| listedWheelSheet + towerWater | 3/3; each RED on its planted cause | c45496570 |
| tsc | clean | c45496570 |
| tools tests that read 1-4 (tipwalk, coveragecheck, score, bands, castBots, travelBots) | **55/55** | 5981c26c0 |
| load speed, stills, castBots, tierBots, lockall, THE FULL SET | NOT RUN (the box) | the EXACT NEXT STEP |

## Lessons applied
D111 (the box from `date`: started 4:46 PM ET, handed over at 28 minutes with the EXACT NEXT STEP), D113 (every long run with
run_in_background; none waited on in the foreground), D102 (read lean), D29 (the full suite after the relist; the pins it names re-pinned
once, rule 20), D57/D87 (ReadNotifications at every step and push), D109 (no clock times to the lead), law 3 (the two reds measured on
the base before calling them not mine), D114 (the lead's new step 0, named for the next member).

# ENG-26j (on t-build-26 from e420a2794): the lead's ruling (a): a gate section catches its own running exit; the lay adds nothing by a sealed piece. Started 4:23 PM ET 11-21 (by `date`)
Commits: ecb86074e (revert of b73600b56 + 97bb2b73e, one commit), 8e21145f1 (the fix and its plants), this REPORT. Step 1 DONE and
measured (the lead accepted it); **the speed-ups PROVEN EXACT and on the branch** (d12ffcacf, the pick of 91e6c584e); the relist and after NOT started (the
28-minute box, D111). Saved: eng26j/ (gates.mts: each gate's step and run off both ends on a built roll, and whose wood catches it;
near.mts: what lies within a hop of each gate; onto.mts: the lead's question, can wood within a hop of a gate be reached from under it; sweep-1-400-8e21145f1.json).

## EXACT NEXT STEP (the next engine member; base t-build-26 at this REPORT's commit). Long runs in the BACKGROUND on frozen worktrees (D113)
## ENG-26k: step 4 of ENG-26j's packet, on this head (steps 1-3 done: the fix accepted by the lead; (b) NOT needed: the section catches
## every running exit, the yield is 400/400)
1. **The speed-ups are DONE (ENG-26j)**: `git cherry-pick 91e6c584e` onto 8e21145f1, then `lockall.ts --layouts 16 --out` WITHOUT
   (8e21145f1) and WITH (the pick) on frozen worktrees in parallel (~8 min each): **3,264 builds of 102 stages, 66,457 part hashes, 0
   differ** (eng26j/lock-8e21145f1.json.gz, the WITHOUT record). Picked onto the branch as d12ffcacf (its src/tools identical to the tested
   tree; tsc clean). Nothing to do but use them: the relist and CI's check now run with them.
2. **1-4 relisted ONCE** (methods/seed-list.md): the old list is seeds 1-100 and **all 100 build clean on both settings on this head**
   (eng26j/sweep-1-400-8e21145f1.json), so the survivors in their old order are 1-100 and no new seed is needed: `seedlist.ts 1-4
   --merge <the four parts or the saved sweep> --in-order --count 100` (n 100) re-lays them and writes the list with the new plans (each
   gate's foot is 106-134 px longer at each end, so every 1-4 layout moves). `seedlist.ts 1-4 --check` FAILS on this head until then
   (measured on 8e21145f1: the verdicts refuse 0 of 100 listed seeds; 7 seeds' replays differ from their search on both settings,
   seeds 8, 18, 22, 31, 54, 59, 66: "rebuild the list"; the other 93 replay as they search). Then every test pinning a 1-4 roll (D29; `grep -rln "'1-4'" src tools --include=*.test.ts`:
   20 files) and the FULL suite, re-pinned once on the final list (rule 20).
3. **Then as the packet**: the phone's load speed of the listed 1-4 and 2-6 seeds (eng26h/tools/loadtime.mts base e420a2794 vs head;
   `BUILDCHECK_STAGE=1-4` / `2-6` buildcheck), CI's `seedlist.ts 1-4 --check` timed against its 45-minute limit (D99); stills of 1-4
   layout 1 before (e420a2794) and after at a gate, 2x, 390x844 and 844x390 (eng26h/tools/pin.mjs): judge the longer foot under the gate
   reads as the field's own ground, not a shelf; castBots 1-4 seeds 1-40 both settings base vs head (rule 28), tierBots 1-1, qaW123,
   generality, THE FULL SET (gates.md), lockall (only 1-4 and 2-6 may move), engine-core.md's tower lines (a sealed piece's own wood
   catches its full-speed run: gateRun). Then BUILD-26c runs 2-6's bots.

## Step 1: the gate section catches its own running exit (ruling (a))
- **Cause, measured** (landFlights' walk, the flight towerFalls / walkOff fly, frame by frame): a run off a gate's end at full speed is
  **164 px out at the frame he lands 360 px down, 173 px at 400, 191 px at 440** (the same on Normal and Easy; 8e21145f1's commit
  message says 164-183: 183 is the frame BEFORE he reaches 440, the code takes the landing frame). A gate field's foot ran
  out `GATE_RUN = GAP` = 80 px past its gate. So every gate's run came down past its own foot: where other wood was under the arc it was
  caught by that (most gates), where there was none (the foot's tip at the tower's wall, the turn's vine hanging from it) it fell 641-721
  px and the roll was refused. Not the lay: the section's own wood was simply too short for the run.
- **Fix** (w1Arc14.ts `gateRun(H)`, replacing `GATE_RUN`): the foot runs out, at each end, the flown run at the frame he lands H px down
  (the larger of the two settings) plus half his body (22 px), never under one vine spacing: **H 360 -> 186 px, 400 -> 195, 440 -> 214** (computed by gateRun on 8e21145f1).
  So both feet land on the foot, never its lip. The foot is still walked onto, never landed on (`landing: false`: Easy's widening rules
  unchanged, so Easy never pulls its vines out of two hands' reach); its vines stay 80 apart under the gate.
- **The lay adds nothing by a sealed piece** (ecb86074e reverts the lay's gate-run catch, 97bb2b73e, and its proof, b73600b56, together).
  tower.test.ts' 'towerCatches leaves a gate alone' (kept) and the new toy plant both check it.
- **Found on the way and fixed (rule 22's "every place the pattern lives")**: `w1-14-drop-one` hand-sized its foot (520 px) for a
  run-out of 0, and scaled field()'s vines to fit. Since GATE_RUN = 80 that put its four vines **55 px apart** (the design's 70-90) and
  left its gate's run-out at 80 / 80 by coincidence. Rebuilt on field()'s own layout (vines 80 apart, gateRun at both ends), the snake
  150 px past the figs' vine as before (within TRAP.scare 170), the foot run on further only if the snake's spot needs it (it does not).
- **Planted** (w1Arc14.test.ts, three tests): (1) the toy (1-4 seed 2's first refused gate: 646-1086 @1000, the foot 400 px down, a vine
  hanging from its tip to the storey under, out to the wall): the lay lays nothing by the gate with either foot; with the old 80 px foot
  the run is named by towerFalls and comes down past it; with gateRun(400) towerFalls is clean and both runs land on the gate's own foot,
  both feet on it; (2) every gate field's foot runs gateRun(H) past its gate at each end, and gateRun covers the flown run on both
  settings; (3) **1-4 seed 2 builds on both settings, errors []**, and each gate's run, flown against the gate and its foot ALONE, lands on
  its foot (the section's own wood catches it), and on the stage as laid within TOWER.fall. **RED**: with gateRun = GAP the three fail
  (9/12); on e420a2794 seed 2 is refused (4 running walk-offs Normal, 8 Easy; eng26j/gates.mts). **GREEN**: 12/12; seed 2 Normal builds
  in 0.7 s against 3.9 s on e420a2794 (no rerolls).
- **Every tower (rule 22)**: the only other sealed piece in any world is toyTower.ts' gateKit (tests only, not shipped); its built-tower
  test ('a sealed piece (a gate bough) in a built tower') runs its runs through towerFalls in the build (errors [] on every seed; 32/32 on 8e21145f1).
- **Measured harmless (the lead asked: can it be reached without the gate's finish?)**: on seed 2 (head) wood lies within a hop under
  three gates' level: a 180 px bough of the storey above **39 px under one end and 28 px beside it** (gates at y 2300 and 3342) and a row
  99 px under the gate at 7214 (11 pieces Normal, 9 Easy). From each, a hop onto the gate is possible. But **nothing reaches any of them
  from under** (eng26j/onto.mts: no lower wood within tower.ts `leaps`, generous: a double, a fall included, rise to 220 px; no vine top
  within a hop), and each gate's own foot is 360-440 px under it. The only way onto that wood is a drop from the storey above, which is
  past the gate. So no way ON to judge, and towerGates is not changed (the lead: harmless if only from past the gate).

## Measures
| what | result | where |
|---|---|---|
| 1-4 yield, seeds 1-400 | **400 kept of 400 (100%)**, each worker 100 of 100 in 137-139 s (the reverted cure: 400 in ~500 s under load; e420a2794's judge on 95cafaabc: 49, 12%). The old list (seeds 1-100): all 100 kept | eng26j/sweep-1-400-8e21145f1.json |
| 2-6's list | **PASS** (100 seeds, each clean on both settings) | seedlist.ts 2-6 --check on 8e21145f1 |
| tower.test.ts on 8e21145f1 | **32/32** (33 with the cure, less its plant, reverted with it); fieldGate.test.ts + vineFeel.test.ts 26/26 | |
| w1Arc14.test.ts | RED 9/12 (gateRun = GAP), GREEN 12/12 | |
| tsc | clean | |
| generality | PASS (26 literals, 26 known) | |
| knowncheck | PASS | |
| the speed-ups' lock (91e6c584e) | WITH vs WITHOUT: 3,264 builds, 66,457 part hashes, **0 differ**; tsc clean on d12ffcacf | eng26j/lock-8e21145f1.json.gz |
| seedlist 1-4 --check on 8e21145f1 | FAIL as expected: verdicts refuse 0 of 100; seeds 8, 18, 22, 31, 54, 59, 66 replay differently from their search (rebuild the list) | |
| roadmapcheck | FAIL on this shallow clone only ("proofs cannot be checked (fetch-depth 0)"): ROADMAP not touched | |

## Lessons applied
D111 (the box from `date`, handed over with the EXACT NEXT STEP), D113 (no foreground waits: the sweep and suites in the background, the
REPORT written meanwhile), D102 (read lean), D40 (the lay's catch reverted before the fix, nothing patched that is replaced), D57/D87
(ReadNotifications at every step and push), D109 (no clock times to the lead), D112 (the invariant, a sealed piece's ends caught by its
own section's wood, named and tested: plant 3 flies each gate's run against its own wood alone).

## Learned (for level.md, the lead decides)
- A section that owns its own catches must size them from the FLOWN exit at full speed, not a spacing: proposed rule, "a sealed piece's
  own wood under it runs out at least the flown full-speed run off its ends plus half his body", checked by plant 3's flight against the
  section's own wood alone (a check, not a number in a comment).
- A piece that rewrites field()'s output by hand must be rebuilt when field() grows (drop-one sat on GATE_RUN for days with vines 55 px
  apart): world code should extend a builder's numbers, never re-derive them.

# ENG-26i (on t-build-26 from deaaf3a7c): the walk-off judge REPAIRS a gate's run instead of refusing it; the lead's gate proof added. Started 3:55 PM ET 11-21 (by `date`)
Commits: 97bb2b73e (the cure and its plant), b73600b56 (the lead's proof: towerGateCatches), this REPORT. Steps 2-4 NOT started
(the 28-minute box, D111). Saved: eng26i/ (the cure's sweep; why2.mts prints each catch rule's verdict per end, with the
`__tcWhy` lines of 97bb2b73e's debug, re-added by hand; plant.mts lays the plant). **The head refuses 1-4 seed 2 again** (the proof); the lead has the numbers and three options.

## EXACT NEXT STEP (the next engine member; base t-build-26 at this REPORT's commit). Long runs in the background on frozen worktrees.
## ENG-26j: THE LEAD'S RULING IS (a) (it reached ENG-26i's queue during a foreground wait and was read about 5 min late: D87 repeated)
0. **(a), not (c)**: a catch the gate's own foot can jump to is a stepping stone from the foot to the gate that skips the vine climb the
   gate section exists for; a gate must be a gate. types.ts already promises it for a sealed piece: "its open ends are caught by its own
   section's wood under them, or the roll is refused by name". The running walk-off judge showed that the section's own wood does not
   catch a FULL-SPEED exit. So:
   - **The lay adds nothing by a sealed piece again**: revert the lay-catch path for gates with its proof (`git revert --no-edit
     b73600b56 97bb2b73e`, keeping 97bb2b73e's plant re-cast as a test that the lay lays nothing by a sealed piece, its run's fall named).
   - **The fix goes in the gate section** (w1Arc14's field with a gate): GATE_RUN or the foot's reach sized from the flown full-speed
     run-off, or the foot run on to the wall so the 10-46 px gap past the vine is gone, whichever the flights show (seed 2's four gates:
     the foot 400-440 px under the gate, the vine hanging from the foot's tip at the wall side, the run coming down at x 1259 / x 20).
     General (rule 22), planted (RED on this head: seed 2 refused; GREEN: its four gates' runs land on the gate's own wood).
   - **Measure** 1-4's yield on seeds 1-400 with it (before 49, the reverted cure 400) and keep 2-6's list at 100/100.
   - **Only if the section cannot catch a running exit** (no room before the wall): try (b), ways ON judged by real flown jumps from wood
     UNDER the gate only (a drop from the storey above is already past the gate, not a bypass), and send the lead the numbers before any
     relist.
1. **Then** the yield and the 2-6 list on the ruled head, as in step 0.
2. **The three exact speed-ups**: `git cherry-pick 91e6c584e` onto the ruled head; lockall --layouts 16 --out on a frozen copy WITH them and
   one WITHOUT (the ruled head): every part hash of every build identical; any difference, drop the piece that made it.
3. **1-4 relisted ONCE** (methods/seed-list.md: old survivors in their order, then new seeds lowest first, --merge --in-order, n 100),
   every test pinning a 1-4 seed (D29), the full suite; then on a quiet machine: loadtime.mts base vs head for 1-4 and 2-6,
   `BUILDCHECK_STAGE=1-4` / `2-6` buildcheck, CI's `seedlist.ts 1-4 --check` timed against its 45-minute limit, and the lock's time.
4. **Stills** at 2x, upright 390x844 and sideways 844x390 (eng26h/tools/pin.mjs): 1-4 layout 1 before (4ea253b8c, seed 2:
   `storey1:1006:10984,walkoff:1070:8120,walkoff2:220:4208`) and after, pinned at a catch the cure laid (on seed 2, about 100 to 140 px
   under each gate's end, at the wall). Judge each: the catch must read as a bough he was meant to land on, not a shelf stuck to the
   wall. Then castBots 1-4 seeds 1-40 both settings base vs head, tierBots 1-1, qaW123, generality, the CI tool line (gates.md
   "THE FULL SET"), lockall (only 1-4 and 2-6 may move), engine-core.md's tower lines. Then BUILD-26c runs 2-6's bots.

## The cure (step 1)
- **Cause, measured** (a dump of towerCatches' inputs for 1-4 seed 2 Normal, every rule's verdict per end): all four refused ends
  (646-1086 @8120, 194-714 @4208, 670-1030 @3342, 196-716 @2300) are **shut gates** (sealed). The step off each lands on the storey
  400-440 px under it; the RUN off it comes down at the tower's wall (x 1259 / x 20), past that storey's tip. A vine hangs DOWN from
  that tip (its top at the storey's height, bottom 281 px under), so rule 2's bridge must start a hop past the vine, which is past the
  wall (spans 1256-1266, 14-24, 1210-1256, 16-24: under the 60 px floor). Rules 3 and 4 were barred for every sealed piece, so
  nothing was laid and the roll was refused. Not the arc, not the flights: one rule (`if (sealed(e.p)) continue`) shut both fallbacks.
- **Cure** (tower.ts towerCatches, every tower, rule 22): a sealed piece's RUNNING walk-off (its step already caught) may take rule 4,
  a 180 px bough of its own under where the arc comes down. It must pass every rule of a fair lay: not cramped, no storey climbed,
  out of `byGate` and any kept-out box. `towerGates` judges after. The step off a gate is still its own section's; a gate is still
  never run on (rule 3 skips sealed pieces). On seed 2 each gate gets a bough about 100 to 140 px under its end, at the wall; seed 2
  Normal builds with errors [].
- **Plant** (tower.test.ts, 'a gate's RUNNING walk-off that lands by the wall past a vine-topped bough gets a catch under the arc'):
  seed 2's first gate in a toy tower (gate 646-1086 @1000, storey 566-1166 @1400 with a vine hanging from its tip, the vine's storey
  700-1280 @1681). **RED on deaaf3a7c (fail 1), GREEN on 97bb2b73e**; it also checks nothing lies by the gate or over the vine's top,
  towerGates is clean, and a lone gate still gets no catch (its two step falls named, as before). tower.test.ts **33/33**.

- **The lead's proof** (b73600b56, tower.ts `gateCatchReached` / `towerGateCatches`, pipeline `gen2.tower.gateCatches`: each catch with
  its gate's id, so the verdict needs no guess). Planted in the same test: the plant's own catch passes; a toy catch 150 px over the
  storey under the gate is refused by name ('reached by the piece at x 566-1166, y 1400, not only by a fall off the gate').

## Findings (numbers)
| item | result | evidence |
|---|---|---|
| 1-4 seed 2 | before: 4 running walk-offs off gates refused (641-721 px). After: **errors [] on Normal and Easy** (Easy's own build 1,245 ms, under load) | scratch why-dump (debug hook, not committed); eng26h/tools/why.mts |
| generality | **PASS** on 97bb2b73e and b73600b56 (26 literals, 26 known) | |
| plant | RED on deaaf3a7c, GREEN on 97bb2b73e and b73600b56 (with the proof's two checks); tower.test.ts 33/33 | |
| tsc | **PASS** on 97bb2b73e and b73600b56 (after `npm ci --legacy-peer-deps`; this container had no node_modules) | |
| 1-4 yield, seeds 1-400 | before 49 kept (12%, eng26h/sweep-1-400.json). **The cure alone (97bb2b73e): 400 kept (100%)**, none of the 49 lost; each worker 100 of 100. **With the proof (b73600b56): NOT MEASURED**: its sweep was still running when the box closed (slower: refused rolls make every search re-roll); re-run it, step 1 | scratch sweep, `--worker i/4`, under load |
| 1-4 seed 2 with the proof | **refused again, both settings, all four gates** (every fair height reached: the storey under from 180 px under the gate down, a drop from the storey above from 160 px up); the variant counting only wood under the gate's level: still 4 of 4 | why.mts; a scratch log in the lay (not committed) |
| 2-6 list | `seedlist.ts 2-6 --check` on 97bb2b73e: **PASS** (100 seeds, both settings), 43 s. Not re-run on b73600b56 | |

## Lessons applied
D40 (cure the judge before relisting: no relist was started), D57/D87/D105 (ReadNotifications at each step and push; long runs in the
background so the queue is read), D96 (step 4 names the full CI set, gates.md), D102 (read lean: the packet, the REPORT's top, rules
19/20/22/28, the code by line range), D107/D111 (handed over at the 28-minute box with the exact next step), D109 (no clock times in
messages to the lead; this REPORT's start time is from `date`), D30 (times from `date`), law 3 (checked the fact: tsc was not counted
as a pass until it ran with its dependencies), law 22 (the gate rule kept by its own reading, the stricter reading put to the lead
instead of chosen quietly).

# ENG-26h (on t-build-26 from 95cafaabc): the walk-off judge's price. HANDED OVER by D111 (40 min), written 3:52 PM ET 11-21
Commits: 93246fa93 (buildcheck takes BUILDCHECK_STAGE), 91e6c584e (three EXACT speed-ups, proof NOT run) REVERTED off the head by
the lead's ruling (cherry-pick it in step 2), this REPORT. The branch's src is 95cafaabc's, proven.
Saved for the next member: reference/qa-reports/BUILD-26/eng26h/ (both locks gzipped, the 1-400 sweep, the scratch tools in tools/).

## EXACT NEXT STEP (ENG-26i; the lead's ruling by D40: the 401-1000 sweep and the relist STOPPED, never relist against a judge that throws
## 88% of rolls away and then again after the cure). Long runs in the background on frozen worktrees (4 cores). In this order:
1. **towerCatches lays a catch where a refused RUNNING walk-off lands**, so rolls pass instead of being thrown away: general (every tower,
   rule 22), planted first (a toy tower whose run-off end drops past TOWER.fall with a fair catch in reach: RED on 95cafaabc, GREEN after).
   The refused ends to start from, 1-4 seed 2 Normal on 95cafaabc (eng26h/tools/why.mts prints a build's errors; ends.mts judges named
   pieces with the head's walkOff): 646-1086 @8120 (runs off both ends land y 8761, 641 px: left at x 400, right at x 1260), 194-714
   @4208 (left run to x 20 y 4909, 701 px; right to x 979 y 4909), 670-1030 @3342 (right run to x 1260 y 3983, 641 px), 196-716 @2300
   (left run to x 20 y 3021, 721 px). Read why towerCatches' run branch (tower.ts `runs`/`takes`/`exAt`, the bridge, run-on and own-bough
   rules) lays none there: the arc comes down at the tower's side (x 20 / x 1260) or past the lower storey's wood. **Measure 1-4's yield
   before and after** on the same seeds: before, seeds 1-400 kept 49 (12%; eng26h/sweep-1-400.json, `seedlist.ts 1-4 --count 100000
   --from 1 --to 401 --worker i/4 --part p<i>.json`, ~500 s a worker under load); and rerolls per search build (repairs.mts prints
   gen2.rerolls: seed 5 was 0 on base, 7 on the head). 2-6 rides the same judge: its list passed 100/100 on the head; re-check it after.
2. **The three exact speed-ups**: `git cherry-pick 91e6c584e` (fly's piece box; roofedDrop's run once a piece a walk; physics reach
   tables indexed) onto step 1's head; prove them: lockall --layouts 16 --out on a frozen copy WITH them vs one WITHOUT them (step 1's
   head), every part hash of all 3264 builds identical. (Against 95cafaabc's lock only if step 1 is not in yet:
   eng26h/lock-head-95cafaabc.json.gz.) Any difference: drop the piece that made it.
3. **Then relist 1-4 ONCE** (methods/seed-list.md; the survivors of the old list in their old order first, then new seeds lowest
   first, --merge --in-order, n 100), every test that pins a 1-4 roll or seed (D29), then on a QUIET machine: the phone's load
   (eng26h/tools/loadtime.mts <worktree> 1-4 3 and 2-6: every listed seed's replay as stageGenerator builds it, both settings, any seed
   that fell to the search), base 4ea253b8c vs head; buildcheck alone (BUILDCHECK_STAGE=1-4 / 2-6 node tools/perf/buildcheck.mjs, base
   first: 1-4 may be over 150 ms already); CI's seedlist 1-4 job timed (D99, the 45-minute limit: `seedlist.ts 1-4 --check` base vs
   head on one machine) and the lock's time (486 s base vs 1431 s head here, side by side).
4. **Stills** of 1-4 layout 1 before and after (eng26h/tools/pin.mjs <root> <out> 1-4 1 normal <port> name:x:y,...; dsf 2, sideways and
   upright; prints the seed it built): before on 4ea253b8c (listed seed 2): `storey1:1006:10984,walkoff:1070:8120,walkoff2:220:4208`;
   after on the relisted head (layout 1 = the new list's seeds[1]: say which), its spots from its own platforms. Then castBots 1-4 seeds
   1-40 both settings base vs head in one chain (no tier's pass count may drop), tierBots 1-1 9/9, qaW123 (19/19 at 95cafaabc), the
   full suite, tsc, generality, the CI tool line (methods/gates.md "THE FULL SET"), engine-core.md's tower lines (ENG-26g's list plus
   this REPORT's cost findings). Then BUILD-26c runs 2-6's bots.

- **The lead's proof** (b73600b56, tower.ts `gateCatchReached` / `towerGateCatches`, pipeline `gen2.tower.gateCatches`: each catch with
  its gate's id, so the verdict needs no guess). Planted in the same test: the plant's own catch passes; a toy catch 150 px over the
  storey under the gate is refused by name ('reached by the piece at x 566-1166, y 1400, not only by a fall off the gate').

## Findings (numbers)
| item | result | evidence |
|---|---|---|
| step 1: the full lock | lockall --layouts 16, 95cafaabc vs 4ea253b8c, both frozen: **100/102 unchanged; movers 1-4 and 2-6 only (both intended)**. 1-4: 32/32 builds moved; **layout 12 (seed 13) FAILS to build on both settings** ("no seed of 24 from 13 builds cleanly", first: flags none before the hard node n6). 2-6: 32/32 moved (platforms, collectibles, proto.decor). Lock time 486 s base vs 1431 s head (side by side) | eng26h/lock-*.json.gz; sent to the lead, accepted |
| 2-6's list | `seedlist.ts 2-6 --check` on 95cafaabc: **PASS (100 seeds, each clean on both settings)**, 43 s | |
| 1-4's list | seed 2 refused on the head: 4 running walk-offs drop 641-721 px (limit 450). Sweep 1-400 on 95cafaabc: **49 kept (12%)**; old list 1-100: **14 survive, 86 refused** | eng26h/sweep-1-400.json |
| why 1-4 is slow | NOT mainly the flights. The judge refuses most ROLLS: seed 5's search build has rerolls 0 (base) vs **7** (head); each refused roll is a full lay + Normal and Easy checks: the stage check runs 4x a build on base, **32-56x** on head. Warm head search build ~10x base (seed 1 2678 vs 160 ms; seed 5 1535 vs 96 ms; under load). Pieces 97-105 -> 127-142 (the catches). This is paid by every SEARCH: relists, the lock, CI's seedlist job (it re-runs each listed seed's full search), the no-list fallback. The phone replays one plan: not measured yet (step 3) | eng26h/tools/repairs.mts, hot.sh |
| profile of a head build (before 91e6c584e) | physics reachTable's linear scan ~27%, levelCheck roofedDrop ~20% (P^3 in a tower: every pair, each a pass over every piece), tower.ts fly ~13% (every piece every frame) | hot.sh |
| 91e6c584e (exact by construction, PROOF NOT RUN; reverted off the head) | fly reads only pieces in its path's box (x: the way out, a stop steps back <= 2 px a frame; y: its depths); roofedDrop's run and closed ends found once a piece a walk (cleared each walk); reach tables in Map<v0, Map<vx, list>>. Head build ~1.8x faster (seed 1 2678 -> 1469 ms, seed 5 1535 -> 932 ms, warm, under load); fly 1180 -> 114 samples. tsc PASS | lock proof: step 1 |
| buildcheck | takes BUILDCHECK_STAGE=<listed stage> (its own kit, gen2/listed.ts); 1-1 unchanged by default. Not yet run for 1-4/2-6 | 93246fa93 |

## Pushback
- The packet's remedy (cache the flown arcs) aims at the wrong cost: the flights were ~13% of a head build; the price is the refused
  rolls (7 of 8 for seed 5) and the check over the extra wood. Suggest (an engine packet, rule 22, every tower): towerCatches lays a
  catch a refused run's arc lands on (seed 2's four ends, 'drops 641-721 px'), so rolls pass instead of being thrown away: that cures
  the 12% yield, the search cost and the CI time together. A search that refuses a roll before its checks is NOT exact (the checks
  repair the stage first: repairLandings takes caps up, and caps bounce a walk-off), so it is not a free speed-up.
- Note for whoever reads the lock: its 1-4 builds ARE the game's path with the list in (layout 12 asked seed 13, the list's seeds[12];
  with no list it would ask 12); a listed seed whose plan no longer replays falls to the search, as a phone would.

## Lessons applied
D57/D87/D105 (ReadNotifications at every step and push: the lead's D111 hand-over read at the push), D94 (base = 4ea253b8c, the
integration base ENG-26g's lock used), D96 (the full CI set named in step 5), D102 (read lean: code by grep and line ranges; profiled
instead of reading), D107/D109 (no clock times in messages), rule 22 (the cost fix goes in engine code every stage reads, not in 1-4).
Owned miss: I did not time-box the investigation against D111's 28 minutes; the relist and the quiet measures are not done.

# ENG-26g (on t-build-26 from 44dcbb41a): the tower's walk-off judge. HANDED OVER at the context line, STOPPED on step 3 (1-4 moves)
Commits: de009b9f5 (the judge), ac2fd73b6 (water by his middle, a cap bounces him on), this REPORT.

## EXACT NEXT STEP (the next engine member, in this order)
1. **WAIT for the lead's ruling on 1-4** (packet step 3: a shipped stage's lay changes only on the lead's ruling). 1-4 MOVES: Normal
   layout 1 was seed 2 at 44dcbb41a, is seed 7921 at ac2fd73b6 (seed 2 refused by the walk-off judge, so another tower is drawn). The
   lead asked for: which towers move (the full lock), before/after stills of the moved spots (upright and sideways, 2x), 1-4's seed list
   --check. None of the three is finished: they were started in the background on a frozen ac2fd73b6 in MY container and die with it,
   so RE-RUN them on a fresh frozen worktree of ac2fd73b6:
   - `npx tsx tools/engine/lockall.ts --layouts 16 --intended 2-6 --check lock-base.json` where lock-base.json is
     `git worktree add <dir> 4ea253b8c` + `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-base.json` there (7.5 min each).
     Note: on de009b9f5 the lock sat on 1-4 for over 10 min (one 1-4 build is 1.4 s at the head, 5.5 s on ac2fd73b6; the list's
     seeds now fail and a build searches on): expect 1-4 to be slow; time it, it is a perf finding for the judge (towerCatches calls
     walkOff per end per pass and per candidate catch).
   - `npx tsx tools/engine/seedlist.ts 1-4 --check` and `2-6 --check` (how many listed seeds the judge now refuses, by name).
   - stills: which spots moved come from a platform diff of the same build before/after (a script that dumps `generateStage` platforms
     for a stage/layout/setting the lockall way, then a set diff); pin Pokey there with a dsf-2 copy of tools/art/kitaudit/shoot.mjs
     (pin at {x, y}, `localStorage sloth_difficulty` for Easy), upright 390x844 and sideways 844x390, on both worktrees.
   Send the lead: the lock's movers, the seed-list counts, the stills. Then do as ruled (relist 1-4 under the judge, or not).
2. **qaW123 '2-6: a plain walk to a street's dead end'** (TOWER.fall, the lead's ruling): on de009b9f5 it fell from every Normal end
   and 5-6 Easy ends (406-761 px) to 2 ends a Normal roll and 1 an Easy roll, all walking LEFT, ~505 px, at the same two spots on rolls
   1/2/3/7/12: (a) the left end x 114 by the turn vine's top (x 88): the run is held by the wall at x 20 and fell past the wheel pond,
   which starts at x 30 (water takes him by his middle, river.ts riverAt; the judge had given it a foot's 11 px): FIXED in ac2fd73b6;
   (b) the end at x 827, y 1556: the run comes down on a mushroom cap (706-776, y 1704) the judge read as a landing; the engine bounces
   him on (roll 1 lands 150 px down, others 505-510): FIXED in ac2fd73b6 (walkOff flies the flown 'bounce' off a cap). qaW123 on
   ac2fd73b6: **GREEN** (with towerFoot, towerCatchWater, wheel*.test.ts: 19/19 pass, 0 fail, on a frozen ac2fd73b6). Done unless
   the lead's 1-4 ruling changes the judge.
3. Gates (packet step 4), on the head after 1-2: tsc (PASS at ac2fd73b6), generality, the FULL suite and the CI tool line
   (reference/methods/gates.md "THE FULL SET, named"), lockall again.
4. engine-core.md's tower lines: NOT rewritten (no context left). Write: tower.ts walkOff (the flown run; wall faces flown straight down
   and on again, the deeper judged; water by his middle; caps bounce along the flown bounce, BOUNCES 3), openEnds judges step + run,
   towerCatches lays a run's catch where the arc comes down (runX) and only if the flown run lands on it (`takes`), a contiguous bridge
   needs no 60 px; BUILD-26b's clearFoot (TOWER.foot) in pipeline.ts towerJoin.
5. Then BUILD-26c runs the bots (the cause table, the 2-minute beat table) on the ruled head.

## Done
| item | result | evidence |
|---|---|---|
| step 1: turn's-foot piece re-checked | lockall --layouts 16 --intended 2-6, 44dcbb41a vs 4ea253b8c: **102/102 unchanged** (2-6's 32 builds too: clearFoot moves none of them); generality PASS (26 literals, 26 known) | /tmp/claude-0/-home-user-Sloths-Adventure-/65bc8b33-3d54-5e90-8b15-8de7c46842d6/scratchpad/lock-head.log (my container) |
| step 2: the walk-off judge | tower.ts `walkOff` flies the engine's own full-speed walk-off (landFlights.data.ts 'walk', proven the engine's by landFlights.test.ts; the same path both settings, asserted), held at the tower's sides [20, W-20] and at a wall's face; `openEnds` judges the step AND the run; `towerFalls` names "a running walk-off"; `towerCatches` lays each run's catch where the arc comes down to its height (`runX`), only if the flown run lands on it; a bridge that runs its own wood on needs no 60 px (2 gate rolls had a 16 px slot by the wall) | de009b9f5 |
| planted RED/GREEN (toy tower) | new test "a running walk-off off any end of a built tower..." judged by landings.ts `Landings.walk` (an independent flier): **old code 24/24 rolls, 420/4376 ends past 450 px; judge 0/24, 0/5307**; none of the 24 refused (BUILD-26b's draft: 13/24 left open). Unit plants: 200-wide step catches named as runs, 300-wide close them; wall clamp, wall face (down / hoist), pond from x 30 (falls) vs x 10 (caught), cap with nothing past (floor) / wood past (lands there), a cap end named | tower.test.ts 32/32 at ac2fd73b6 |
| #16 filter | 'every piece of a storey, its hops' catch boughs included...' took every seam piece in a y band; a run's catch (a lower-storey bough by `fair`, judged by towerSkips) was filed in the upper section's seam ("hangs under") and read as a storey piece 41 px over the ledge. The filter now takes its hops' catch boughs lip to lip (its own words); the assertion is unchanged | ac2fd73b6 |
| step 3 | **STOPPED: 1-4 moves** (seed 2 -> 7921 on Normal layout 1). Full lock, seed lists, stills: UNFINISHED (see EXACT NEXT STEP 1) | |

## Pushback
- A walk-off at less than full speed (a kid starting to walk near an end) lands between the step and the run; the judge flies only
  those two (the packet's), so a gap between the step's wood and the run's catch could still drop a slow walker. Suggest: judge a
  second flown walk-off from a short run-up (flyLandFlights could fly it) if the bots show it.
- After a wall stops him the engine's air drive (how fast he goes on) is not flown; the judge flies both bounds and takes the deeper.

## Unresolved
1-4's ruling, the full lock, seed-list checks, stills, the full suite and CI line, engine-core.md (all above).

## Learned
- The running walk-off already had an engine-true model in the repo (landings.ts, landFlights 'walk'): reuse a flown path, never a
  second closed form; and an independent flier makes the planted test honest.
- Water, caps and walls are where a walk-off model goes wrong: trace the real engine on every end a model says is caught.

## Lessons applied
D57/D87/D105 (inbox at each step and push), D102 (lean reads: line ranges and greps), D107/D109 (no clock times to the lead), D96
(gates named from gates.md, not run: named UNRUN), rule 26 (engine gap fixed in the engine, every tower), rule 28 (each 2-6 miss traced
in the real engine before its fix), LAWS 3 (the BUILD-26b draft's model checked against the flown table before reuse).

# BUILD-26b (on t-build-26 from 4ea253b8c): HANDED OVER at the context line
Commits: c29b8332d (step 1 deletion), 60234ead0 (6 pins re-pointed), 1be132415 (step 2 ENGINE: turn's foot clear), this REPORT
(+ walkoff-wip.patch, + qaW123 dead-end test on TOWER.fall).

## EXACT NEXT STEP (BUILD-26c, in this order)
1. **The walk-off ENGINE PIECE (lead's ruling; rule 26), NOT LANDED.** Ruling: the tower judges a walk-off where a RUNNING walk-off lands
   (STAGE-RULES :418), one general place, planted RED/GREEN, generality PASS; **if lockall moves a shipped tower (1-4, 2-6, any), STOP and
   send the lead which.** My draft: `git apply reference/qa-reports/BUILD-26/walkoff-wip.patch` (tower.ts: `walkOffLand` arc at
   PHYS.maxRun/gravDown/maxFall inside the walls; openEnds judges the step AND the run; towerCatches lays its catch where the arc crosses
   its height; towerFalls names "a running walk-off"). It is RED: tower.test.ts 5 fail (#2, #5, #10, #16, #28), the toy tower `up`
   13/24 rolls keep an uncaught running walk-off (e.g. normal 1: the piece x 708-888 y 4475 drops 604 px): towerCatches finds no FAIR
   catch on the arc (the arc lands 90-200 px out, by the next turn's vine / under the storey above, where `fair` refuses). #10's planted
   catches (200 wide at x 380/640) are the old model's and must widen to cover the arc (it lands ~182 px out at 400 px down). The 1-4
   seed list check against the draft: UNRUN (stopped). Expect it to move 1-4: ask the lead before landing.
2. **qaW123 '2-6: a plain walk to a street's dead end'** now reads TOWER.fall (lead's ruling) and stays RED until step 1 lands
   (Normal ~505/617 px ends every roll; Easy 5-6 ends, 406-761 px; walked in the real engine).
3. **Step 2 (turn's foot)** landed at 1be132415: clearFoot in pipeline.ts towerJoin slides a block off a turn's foot (TOWER.foot 70 +
   CLIMB_CLEAR) clear of every climb on its ledge, else the roll fails by name. towerFoot.test.ts: RED 530 misses without, GREEN with
   (37/48 toy rolls; 11 Easy refused by towerSkips: a slid boulder can be a step under the next storey; named, never laid). generality
   and lockall --intended 2-6 vs 4ea253b8c: see "Gates" (LOCKALL_RESULT). If lockall shows any other stage moved, STOP and tell the lead.
4. Then the packet's steps 3-5 as written (cause table to the lead BEFORE fixing a bot/engine cause; the expert's beat-by-beat seconds
   on the MIN seed; stills only on a green head). Run castBots 1-40 both settings on the head after steps 1-3 first: the turn's foot
   and the walk-off both change what the kid/adult dither 87-90 px short of a turn's vine may be (not traced: no time).

## Done
| item | result | evidence |
|---|---|---|
| base gates, frozen 8b2438c74 | tsc PASS; shards 1/2 PASS, 3: 1 fail `listed.test.ts` 'nothing in the game calls withTestStage' (w2Arc26.ts header comment, ENG-26f's): GONE on this head (BUILD-26 rewrote the header); CI tools/generality/coverage/knowncheck/roadmap/timecheck/tipwalk/registrycheck/seedlist 1-1: G0_TAIL | scratchpad g0out/ (this container) |
| deletion | buildKapok `village` param and every branch (first post + log, windows, porch dressing, knots' floor/doubt walk-off, doubt-knot judging, bankWall, decor); stageSheets '2-6' goldsnake; levelSeeds '2-6': 0 READ, KEPT (registrycheck needs LEVEL_ATTEMPTS per row stage; 2-5 the same); 2-6.md :47-48 hearts ruling, :59 deletion | c29b8332d |
| pins | qaW123: the first climb (only climb from the bank, tops on the first wheel's jetty, a hopping walk rests by it) + Dot's ride line on the bank before the climb (both settings/views/taught): PASS; dotBox 2-6 'Ride a bucket up!' at 200 (where the boulder stops a plain walk) and the ground pick honours the hint's band (it took the tower's TOP storey): 9/9; towerBots climb framing (4-1 for the old climb, 2-6 held as a tower): PASS; w2Arc26 hearts (nothing costs one on Normal, 0 laid): 5/5; edgeFooting, w1NewArt, wheel.test read: still true | 60234ead0 |

## Pushback
- lines-2-6.md "Why" 5 says the new 2-6 has no post before the first wheel; the BUILT stage has one (the tower's first turn, x 1562
  Normal / 1610 Easy, from the bank to the jetty): so dotBox stands him where the line goes up, not at 'lip' (rule 27).

## Owned miss
Started step 2 before the lead's walk-off ruling was read (it sat 8 min in the queue while I wrote the turn's-foot test). Nothing built
on a stop; the order cost the walk-off piece its box. Countermeasure: ReadNotifications before starting each new piece, not only at pushes.

## Learned
- A turned storey's vine stands TOWER.vineIn (44) in from the ledge end, exactly where an end boulder sits: moving the vine can't keep the
  storey's room, moving the block can (toy: 48/48 refused vs 37/48 built).
- The running walk-off is the tower's real fall: a catch under the end does not catch him at a run.

## Lessons applied
D57/D105 (inbox at each step), D59 (the stopped 1-4 check named UNRUN), D102 (lean reads), D109 (no clock times), D40, rule 27 (built
numbers: spawn 140, jetty 1296-1536 y 6161, vine 1562), rule 26 (engine gaps reported, fixed in the engine).

## Turnover note
engine-core.md NOT rewritten (no context left): BUILD-26c writes clearFoot + walkOffLand there.

# BUILD-26 REPORT: 2-6 "Up the Bank Houses: The Water Wheels", laid by its design on a real row (HANDED OVER at the context line)
Branch t-build-26 from 8b2438c74. Commits: 0c906c4ff (step 0 probe), fab3a8a20 (the lay, the row, the seed list, the hand build's route
deleted), 8f3bcb3b6 (rule 28: the rest lays no boulder), 4a9e38e67 (the words), this REPORT.

## EXACT NEXT STEP (for the next member; in this order)
1. **Finish the deletion (new replaces old)**: protoStage.ts buildKapok's `village` parameter and its branches (grep `village` in
   protoStage.ts: 21 hits; the hint at :4859, the first post :4858/:4867, windows :4900, the dressing block :5317-5345, villageKnots :5551,
   bankWall :5676) and the `village` doc at :4615. KEEP ProtoExtras.ladders/bankWall and drawLadder/drawEarthWall: finish26 USES them
   (w2Arc26.ts finish26), so the lead's condition for keeping them holds. stageSheets.ts:89 `'2-6': ['foe:goldsnake']` (the hand build's
   cast; 2-6 has none) and levelSeeds.ts:22 `'2-6': 0` are UNCHECKED: read what each is for, then delete/move. Update design 2-6.md:59.
2. **Re-point the pinning tests, each assertion kept** (all RED on 4a9e38e67 against the new 2-6, run in this session):
   - qaW123.test.ts :123 (first ladder on screen from the start), :141 (Dot's climb line by the first ladder), :203 (a porch's dead end:
     no fall >= 400 px). The first two were the hand build's posts; KEEPER-26 re-pointed the moment to the ride (lines-2-6.md "Why" 5).
     Suggested: :123/:141 -> the first wheel's jetty is the first thing to use and Dot's `ride` goes up before it; :203 run as written
     on the new streets and READ its failures (they may be real: a plain walk off a street end).
   - dotBox.test.ts:199 -> `{ stage: '2-6', layout: 0, hint: 'Ride a bucket up!', at: 'lip' }` (the keeper's line AND spot; if the
     ground under the hint is the millpond bank and not the jetty, `at: <px to the jetty's end>`; lines-2-6.md "Why" 5).
   - the test "the climb framing is a tower's alone: a shipped climb of the old generator ... keep the framing" (#22 in the pins run;
     towerBots.test.ts:150 lists ['2-6', 'up']): 2-6 is a tower now; re-point.
   - edgeFooting.test.ts:17, w1NewArt.test.ts:92, gen2/wheel.test.ts:57 use RealPlay('2-6'): they PASSED on the new 2-6 in the pins run
     (only the 6 above failed); read each once to check its comment still says true things.
   - w2Arc26.test.ts 'the climb up the bank village' (moved from w2Stages.test.ts): RED on its hearts assertion only, kept as written.
     **For the lead:** the PLAYED 2-6 lays 0 hearts on Normal (2-4: 6, 2-5: 7; 2-6 Easy 8; tools/inspect/b26/played-hearts.ts). The
     design asks a heart after beat 10. Is 0 the live rule (nothing on Normal 2-6 costs a heart: every wheel's pond and the millrace are
     soft), or a gap? Do not loosen the assertion; get the ruling.
3. **Bots (rule 28), RED, traced so far** (castBots 1-40 both settings; rows in rows/):
   | head | kid N/E | adult N/E | child N/E | middle N/E | expert N | expert min |
   |---|---|---|---|---|---|---|
   | fab3a8a20 | 32/40, 0/40 | 35/40, 0/40 | 13/40, 6/40 | 4/40, 9/40 | 11/40 | 123.1 s |
   | 8f3bcb3b6 | 0/40, 0/40 | 0/40, 0/40 | 28/40, 27/40 | 38/40, 33/40 | 39/40 | **112.3 s** |
   Every miss is a rescue (hits 0, lives 0). Traces (tools/inspect/b26/trace.ts, frames.ts, dump.ts, route.ts):
   - FIXED at 8f3bcb3b6: kid N 11 (x 1490 y 4192), middle N 1 (x 1509 y 4192, x 1635 y 4242): the rest street's boulder stood 36 px from
     the tower turn's vine; the bot stood on it under the climb. **ENGINE-WORTHY:** the tower lay keeps no turn's foot clear of a block
     (pipeline tower turn, wheelLay/tower.ts): any stage's brick with a block near its storey end can hit it.
   - OPEN, kid/adult (0/40 after the fix; adult was 35/40 before it): they stop ~87-90 px short of a tower turn's vine and dither for
     20 s: adult E 2 at x 1525 y 4465 (vine x 1612, pad alternates right/left around x 1514-1538, standingOn #39; the route is right:
     route.ts shows the next points ON the vine), adult N 20 at x 1074 y 2825 on the top wheel's street (vine x 1161, a flag at x 1099).
     Not yet found: why the bot will not walk the last 90 px. Next: FT_FRAMES=83.4,85 with the bot's chosen step printed in
     firsttimer.ts, or compare with 1-4's turns. The kid is not the bar (level.md rule 4; 2-5's report); adult passed 40/40 on 2-5.
   - OPEN, child E 2: rides the edge wheel round and falls back 8 times (x 748 y 4435, "fell back down from here").
   - The 2-minute rule: the expert's MIN is 112.3 s (the lead's bar: 125 s over 80 runs). Bring the lead beat-by-beat seconds before
     changing anything (the lead's ruling: no slowing the wheels, no filler).
4. Then step 3 (the FIRST LOOK: upright + sideways at 2x, beats 1, 5, 8, 12 at the top of each ride; the four upright to the lead), only
   on a head whose bots are green (rule 29). Then the full set and the beat-1 clip.
5. engine-core.md: write ENG-26f's 'For engine-core.md' lines (ENG-26f REPORT :28-43), not done here.

## The plan as ruled (STEP 0, the lead's GO with rulings)
Node string verbatim (2-6.md:43). G3: the 1700 px tower. G4: the live flag rule wins, never a flag on a jetty; the millrace near bank
>= 260 px built (laid 300); flagMiss re-read on every roll (empty on every probe). 2-minute: expert MIN >= 125 s over 80 runs. Deletion as
listed; ladders/drawLadder/bankWall/drawEarthWall stay only if finish26 uses them (it does). Clue: a World 2 sign TAKE YOUR TIME on the
top house (laid: SIGN_26). Art: the bucket trough is painted from the w2-wheel sheet (wheelDraw.ts:8-11): not missing. Words: approved.

## Done
| step | result | evidence |
|---|---|---|
| 0 gates (base 8b2438c74) | tsc PASS; ENG-26f's planted tests 27/27 PASS; seedlist 1-1 --check PASS (161). The unit suite, CI tool line, generality, coverage, knowncheck, roadmap, timecheck: RE-RUN on a frozen worktree of 8b2438c74 (my first run read the live tree I was editing: owned miss below); results in the scratchpad g0b/, NOT read before hand-over | this session |
| 1 lay | w2Arc26.ts real bricks (millpond 560+380 with a boulder and Dot's `ride` 800+ px before the jetty; the teach wheel; the first street: step up, boulder, hop; through a house: foot, ladder, roof; the millrace near 300 / far 240; the edge wheel; the hanging porches, 4 spans, Dot's `jump`; the top wheel; wheel to bounce; the great wheel with Pokey's `view`; rest streets; the crest), stageTable '2-6' { kit 'w2-26' }, listed.ts KITS/WORLD/FINISH, finish26 (bank wall, ladders, doors/lanterns/windows/washing clear of every wheel's sweep, the crest's rooftop, bell, Gruntlewick, the sign) | fab3a8a20, 4a9e38e67 |
| 1 addlevel | 24/24 clean both settings, one beat order; seconds (modelled) 172.5-172.9 N, 189.5-189.9 E; seed list 100 of 101; registry: nothing missing; MISSING: bots, and its row is not `judged` (fly: `FLIGHT_STAGE=2-6 npx tsx reference/specs/sims/flight.ts normal all`) | rows/addlevel.txt |
| 1 deletion (part) | w2Stages.ts '2-6' route, clearFlags, its note; W2Plan '2-6' and its Exclude/flavour lines (w2Sections.ts); riverLay.test's '2-6' skip | fab3a8a20 |
| 2 words | LINES_26 ride/jump/view, MISSION_26 (stagePlan), CLUE_26 (stageClue), JOURNAL_26 (pokeyJournal), NORIA_PAGE_26 (held; no journal page surface exists in code, as 2-2's lily page), SIGN_26; hint.2-6.climb deleted, way.2-6 kept; w2Arc26.test.ts holds each equal to lines-2-6.md | 4a9e38e67 |

## Polish check
No stills shot (rule 29: the bots are red). Nothing judged on screen yet.

## Pushback
- The packet's step 0 gates: I ran the long ones against the live working tree, then edited it: owned below.

## Unresolved (named plainly)
buildKapok's village branch not deleted; 6 pinning tests red; hearts on Normal 0 (lead's ruling); bots red (kid/adult turn-vine stall,
child E edge wheel, expert min 112.3 s); no judged row (flight not run); no stills; engine-core.md not written; the frozen-base gates not read.

## Owned miss
Step 0's unit suite ran in the live working tree while I edited it after the GO, so its result would not have been the base head's.
Caught before reading it; killed; re-run on a frozen worktree (git worktree add --detach). Countermeasure (level.md step 7 already says
it for step 7): every background gate runs on a frozen worktree, step 0 included.

## Learned (proposed level.md rules, for the lead)
- A tower storey's last brick decides where the turn's vine stands: no block (boulder) in a brick that can end a storey, until the tower
  lay keeps the turn's foot clear (ENGINE-WORTHY above).
- Run castBots 1-40 the moment the row lists (it took ~3 minutes at --par 3): the draft's 2-seed table hid what 40 seeds showed.

## Lessons applied
D57/D87/D105 (inbox at every step and push), D75/D101 (laid on the real row), D102 (grep and line ranges after the lead's context read),
D109 (no clock times in messages), D40 (nothing patched that is being replaced).

## Turnover note
reference/handoffs/engine-core.md: NOT rewritten (step 5 above).
