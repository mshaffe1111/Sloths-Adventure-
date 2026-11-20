# BUILD-25 REPORT: 2-5 "River Snappers: Count to Four", laid; STOPPED at the lead's context plan (section written 12:07 PM ET Fri 11-20, by `date`)

Branch t-build-25 from t-int-14 6ab312e4 (ENG-25c already in, not re-merged). Head: the commit carrying this report.
Packet reference/packets/2026-11-20/BUILD-25.md (on ccr-ea739a2f-dfcee4). STEP 0 plan sent 11:49 AM ET; the lead's GO 11:50 AM ET.


## BUILD-25d (Opus 5.5 high; section started 2:47 PM ET Fri 11-20 by `date`; kept current)

### EXACT NEXT STEP (kept current; written 2:47 PM ET Fri 11-20)
1. DONE (this push): the lay fixed in the pieces (w2Arc25.ts), never relisted around. Next: the full relist
   `npx tsx tools/engine/seedlist.ts 2-5` (writes src/game/gen2/proven/seeds-2-5.ts + provenIndex.ts), then `seedlist 2-5 --check` PASS.
2. Trace ONE run of the water jump at x ~21000 (the quickening's log river, `deep` on Normal): rule numbers or bot miss. Facts to the lead.
3. Snapper toys (13/13, 24/24), tierBots (1-1 must not move), childtrace25 at the first awake snapper, castBots 2-5 again (before/after).
4. THE FULL SET (gates.md "THE FULL SET, named") on the final head; gate log committed; stills of the new rest + hop; REPORT; hash to the lead.

### Item 1: the lay (what was wrong, what changed, the proof)
- **Flags (6 seeds)**: a rolled stage lays no flag from a socket (pipeline.ts rolledFlags: `checkpoints.length = 0`, then the hard nodes'
  flags, then each span past its cap split at the furthest spot <= min(prev + cap - 20, next - 900)). The big snap's hard flag stands on the
  bank between the quickening's snappers (m), 670 px past the end of the log river's far bank; at 300 px that bank's only flag spot
  (FLAG_SPAN.pad/2 = 80 in from each end) starts 10 px past `next - 900` (seed 1: spot 21684, limit 21674), so no spot split the 2518 px
  over the water. FIX: that bank is the quickening's rest, `QUICK_REST` 420 (a spot fits whenever it is over 310).
- **Quiet line (3 seeds)**: 4.4-4.6 s from the last stone of the awake beat's pond to the rest's boulder. FIX: a boulder on the awake
  beat's far bank, LISTED BEFORE that bank. Found on the way: a boulder listed last was the brick's EXIT (brick(): out = the last piece),
  so the next section hung off the boulder's top 75 px over the bank under it, and the route walked UNDER the boulder (no beat): the
  reach's and the teaching stone's far-bank boulders (25b) had the same fault; all three now listed before their bank (route trace, seed
  232: `hop 10177,535 -> 10177,485` where it walked through before).
- **Yield** (`yield.ts 2-5 --from 1 --count 1000 --list --par 4`, LISTABLE: the search with the list's judge), Normal / Easy clean:
  base f2b32b27 **217 / 217** (quiet 754, flags 460) -> rest 420 + awake boulder last 990 -> **final 1000 / 1000**. Plants on the final
  pieces: rest 300 -> 996 (flags 4: seeds 426, 429, 564, 658); awake boulder off -> 212 (quiet 788).
- **Tests** (w2Arc25.test.ts, 9/9): NEW "the lay keeps the seed list's own rules as its search builds it" (seeds 1-12 + 426/429/564/658,
  both settings, `listJudge`: no gen2 error) and NEW "no 2-5 brick ends on a boulder". Plants, each RED: rest 300 -> test 8; teaching
  stone's boulder last -> test 9; awake boulder off -> tests 7 and 8. Restored file byte-identical (diff -q).
- 6 fresh builds: `libstage.ts --stage 2-5 --seeds 6`: CLEAN 6/6 Normal, 6/6 Easy, turtles 9, 208-212 s.
- The list's judge: both rules ARE in the search seedlist runs (flags: pipeline gen2.errors; quiet: listRules.ts listJudge), so nothing to
  move (level.md rule 19). The 9 failed because the list was searched before 2-5 was judged on its flown rows (the roll moved under it).
- **For the lead (rule 22, not built: other stages' locks)**: the same exit-on-a-boulder pattern lives in w1-17-rest-hollow, w1-17-rest-moss
  (1-7) and w2-21-down/lianas (+easy) (2-1) (tools/engine/runs/exiton.ts lists every kit's). Proposed: a kit-wide test that a section's exit
  piece is never placed `on` another, with those four fixed under their stages' own lock change.

## BUILD-25c (Opus 5.5 high; section started 2:15 PM ET Fri 11-20 by `date`; kept current)

### EXACT NEXT STEP (BUILD-25d, a fresh member at high, on t-build-25 at the head carrying this line; BUILD-25c stopped ~2:30 PM ET at its context limit)
1. FIRST, the lead's call on the seedlist red (to the lead before changing anything): on 4eeedef5, judging 2-5 on its own flown rows
   (normal-2-5) makes `npx tsx tools/engine/seedlist.ts 2-5 --check` FAIL (PASS on 34c001b3 without them): the verdicts refuse 0 of 100,
   but seedlist's own checks fail 9 seeds: flags 2518-2600 px apart at x ~20000-20400 where a life can be lost (6 seeds, both settings:
   the quickening and the water jump ENG-SNAP named at x ~21000, where expert/middle/child lose water lives 9/10/12 on Normal) and the
   quiet line 4.4-4.6 s at x ~10200-10345 (3 seeds). Files: seedlist-2-5-judged-full.txt. Either relist 2-5 (seedlist.ts, the proven
   list) or fix the lay (a flag at the quickening's rest / a beat in the quiet stretch: level.md rule 19 says a refused layout's rule
   moves into the list's judge). Then trace ONE run of the water jump at x ~21000 (is it within the rule numbers, or a bot miss).
2. Then the snapper toys (`npx tsx --test tools/inspect/snapperTaught.test.ts tools/inspect/snapperBonk.test.ts tools/inspect/snapRide.test.ts`;
   ENG-SNAP expects 13/13 and 24/24; they passed inside the CI tool line on d0bc8695) and tierBots (1-1 must not move); the child's trace at
   the first awake snapper (tools/engine/runs/childtrace25.ts child normal <seed> <x0> <x1>): does it go near, back off on the creak, kick
   after the miss (the line Dot now says).
3. Item 5: the whole CLAUDE.md list on the final head (frozen worktree, suite in shards: count, tests/pass/fail/todo), plus seedlist 2-5
   --check, lockall vs 6a61c36c --intended 2-5, funcheck (World 1's lines are the base's), coveragecheck (PASS on 34c001b3), registrycheck
   (its test PASS on 4eeedef5), tipwalk, buildcheck ALONE, roadmapcheck/timecheck after `git fetch --unshallow`. Then the REPORT's gate table,
   Polish check, Learned, and the final hash to the lead.

### Item 4 so far (on the t-eng-snap merge d0bc8695 + 34c001b3)
- CI tool line (gates.yml:154) on d0bc8695: tests 319 / pass 317 / fail 1 / todo 1: the fail was registrycheck.test "2-5 flown: its row is
  not judged" (fixed in 4eeedef5: 16/16); the todo is chase bots ENG-B4 (open, not 2-5's). tsc PASS.
- castBots 2-5 1-40 (castbots-2-5-25c.txt, 2:23-2:25 PM ET): | bot | Normal (25b -> 25c) | Easy (25b -> 25c) |: kid 0 -> 0, 0 -> 4;
  adult 40 -> 40, 40 -> 40; child 7 -> 40, 16 -> 40; middle 39 -> 40, 40 -> 40; expert 40 -> 40 (Normal only). The bar (child/middle/expert
  40/40) is MET; no miss to trace. Water lives on Normal: child 12, middle 10, expert 9 (the jump at x ~21000, step 1 above).
- coveragecheck (34c001b3): creature:turtle wired: bot firsttimer.ts#FirstTimerRun.snapperPlan, channel score.ts#creatureBits (its tell,
  Easy x1.3), as every cast creature's 'C' beat is priced: PASS. Not tuned (Matt 11-18); a rhythm channel is the meter's call.

### Learned (proposed for level.md, the lead decides)
- A hand-pinned count in a test ("28 stages") breaks at every level that moves a stage; walk the set the rule is about instead (pitPocket).
- Judging a stage on its own flown rows is part of laying it (registrycheck), and it can expose layout faults the unflown scope hid: fly
  it BEFORE listing the seeds, not after (2-5: 9 seeds fail seedlist once judged).
- Pinned stills cannot show timing: three pins 2.5 s apart sit inside one 22.5 s card; prove timing from the rule (readMs x FADE_K) or a
  played run, never from pins.

### Done
- Item 1 (87b90eb5): goalLine.test ('chase' a verb goalLine speaks; planted 'Chase off free' CAUGHT) and pitPocket.test (walks every
  World 2-4 stage whoever builds it; floor 32 = stages walked) — the lead's OK before the commit, lines in the message.
- Item 2 (6104648f): Dot's `snap` teach = the lead's pick B "Go near till it creaks. Back off. Missed? Kick!" (9 words, 47 chars);
  lines-2-5.md row 3 + why (R-165.341); LINES_25.snap; w2Arc25.test 7/7. Accepted by the lead.
- Item 3b (89953516, stills bf22b1e7): the rope's anchor trees were w1-traps#trunk (catalog worlds 1, could 5/6; not 2); 2-5's rope is
  now World 2's own painted rope between posts (rope-kit, world_best 2): `look: 'vine'` dropped. Drawing only. ACCEPTED by the lead
  (stills/s25c-rope-x11500-{before,after}-{upright,sideways}.jpg).
- Item 3a: no change, ACCEPTED by the lead as designed: the wayside line is a 12-word story card (readMs 7.5 s) that the phone keeps
  FADE_K = 3 reading times untapped (dotGuide.ts:281, R-165.175: 22.5 s of play), and a story aside that yields to a waiting teach comes
  back in full; that spans ~11,000 px at a run, and BUILD-25b's pins were 2.5 s apart. The global rule, not 2-5's.

## BUILD-25b (Opus 5.5 high; written 12:38 PM ET Fri 11-20 by `date`; stopped at the lead's context plan, ~360k real)

### EXACT NEXT STEP (BUILD-25c, a fresh builder at high, on t-build-25 at this report's commit)
1. `npm install --no-audit --no-fund --legacy-peer-deps`, then `git checkout package-lock.json`.
2. The gate list on 9b645fbf is IN (below, "THE CHECK LIST"). The 3 FAILs are not 2-5's (each is red on the base 6a61c36c too);
   two of them (goalLine "Chase off 1 snapper", pitPocket "28 stages") were born on this branch in BUILD-25 and go to the lead.
3. WAIT for R-165.339 (bots: the bonk's steer-back at the child's thumb, and the taught "wait for the snap, then kick" for child/kid,
   proven on a toy) to land, merge it, then castBots 2-5 1-40 x kid,adult,child,middle,expert x both again; every child/middle/expert miss
   traced (two runs per cause). If the child misses on the count of 8: to the lead before changing anything.
4. WAIT for R-165.338 (drawRockArt picks among the kit's rock frames + mirror by platform id), merge it, re-shoot the rock stills
   (x 821/1495/1832/3082/3420 on L1 sideways) and judge them for repeats.
5. The lead judges the stills below; fix what he sends back; then the REPORT's final polish check.

### THE CHECK LIST (CLAUDE.md, once, on 9b645fbf, frozen worktree; started 12:37 PM ET, ended 1:48 PM ET)
- PASS tsc (4 s)
- FAIL suite: 4 shards, 607 files; tests 3978 / pass 3974 / fail 2 / todo 2 (1835 s). The 2 fails, BOTH red on the base 6a61c36c too
  (run there by hand: pass 1 / fail 2): goalLine.test.ts:7 "one verb: Chase off 1 snapper to open the sanctuary" (2-5's goal verb,
  BUILD-25 7de7bdf4, not in the test's verb list); pitPocket.test.ts:36 "28 stages" (Worlds 1-4 pockets). Not fixed by 25b: to the lead.
- PASS vite build (4 s); PASS chunkcheck; PASS artcheck; PASS drawcheck (664 s, "2-5" in its scenarios); PASS clipcheck (275 s)
- PASS knowncheck; PASS generalitycheck
- FAIL roadmapcheck: "shallow clone, proofs cannot be checked (fetch-depth 0)": the container's clone is shallow
  (`git rev-parse --is-shallow-repository` = true); not a 2-5 finding, CI runs it on a full clone.
- PASS kbdcheck (112 s); PASS buildcheck; PASS seedlist 1-1 --check (166 s); PASS engine tools' tests (17 s); PASS tierBots (179 s)
- PASS seedlist 2-5 --check (11 s, the 100 seeds)
- FAIL funcheck (30 worse or new, 41 to lower or delete): the SAME ✗ lines on the base 6a61c36c (diff empty); none names 2-5
  (World 1 lines only). Not 2-5's.
- PASS lockall --check vs 6a61c36c --intended 2-5 (453 s): 101/102 stages unchanged; only 2-5 moved (intended). goals.ts moved no other stage.
- FAIL timecheck: "couldn't run (a shallow clone: blame needs the full history)": the same shallow-clone cause as roadmapcheck; CI runs it
  with fetch-depth 0. (The runner had left timecheck and paintcheck out; 25b ran them after, 1:49-1:59 PM ET, same head.)
- PASS paintcheck, all 3 parts (0/3: 1714 builds, 1/3: 2028 builds incl. 2-5, 2/3: 1928 builds; 102 stages, both settings): no new painted
  style falls through to code terrain. (25b first ran parts 1-3: parts are 0-based, 3/3 is empty; part 0/3 then run.)

### What 25b did (each on t-build-25; heads named)
- **The quiet line** (e4da942b): traced (quietOf, seeds 1-20): the same joins ran 4.2-7.0 s with nothing to do (reach->teach stone 4.2,
  teach stone->sleeper 4.5-7.0, three->awake 5.2, rope->wave 5.3, sandbars->quickening 4.7-5.0); petals on flat ground are not a beat, a hop
  is. A 50 px moss_stone rock (the rest's stump) on reach z 0.3, one-stone z 0.6, sleeper a 0.6, awake a 0.5, wave a 0.6, quickening a 0.6
  (each 290+ px from a snapper patch, nothing that hurts between a tip and its thing); the rest's end banks 300 -> 240. The lead accepted
  it 12:14 PM. 6-seed pre-check 6 of 6 (was 5 of 1,199).
- **R-165.336 finished** (6ba1a4b7, the lead's ruling): Play asked 2-5 for 7 / Easy 6 (withGoals ignored countSet, a share of the 9 laid).
  goals.ts: a countSet stage's goal IS its targetCount, Easy `heldEasyGoal` (round x 0.6), the ONE helper pipeline.ts's Easy check calls
  too. Play now asks 8 / 5 (RealPlay('2-5', 1), both settings).
- **Tests and plants**: w2Arc25.test.ts (8 tests: lines verbatim + where said; the arc beat for beat; snap rows by beat, the two bars,
  free teach bite; nine snappers by beat and bar, the first asleep, Play's goal 8 / 5; teach distances, quiet past the Big Snap, the water
  warning; the quiet line <= 4 s on seeds 1-6; the find on the first rest); goalsEasy.test.ts (every countSet stage asks its designed goal
  in Play); snapRow.test.ts (PadRow.clock: one bar, two bars under one name throw, unnamed each its own; snapFaults by setting);
  snapperCount.test.ts re-pointed to the kit's snappers (the sleeper kicked, an awake one bonked then kicked, each counts 1).
  planted-faults.py: 20 plants, 19 run CAUGHT at 877d3505 (planted.out.txt); plant 20 (the find) proven red by hand at 9b645fbf
  ("the find at 2401, in one-stone"); re-run the file once on the final head.
- **The list** (seedlist-100.txt): 100 kept of 104 (4 refused on flag spacing), quiet line longest 3.8 s, median 3.7 s; `--check` PASS.
  The R-165.327 seat rule (t-int-14's seatBreaches, run here by scratch copy): 0 breaches in 200 builds, a planted 300 px re-seat caught
  (seat-rule-2-5.txt). The rule itself is not on this branch; it arrives with t-int-14.
- **The find** (9b645fbf): the stage's find stood at x 2401 beside the teaching stone on every layout; its HOLD DOWN sign read as the
  stone's answer (my still at x 2440). A findSpot socket on the first rest (1-8's rule); tested and planted.
- **drawcheck**: 2-5 added to tools/perf/limits.json scenarios.
- **castBots** (castbots-2-5.txt, castrows-2-5.jsonl, head 6ba1a4b7): adult 40/40 N, 40/40 E; middle 39/40 N, 40/40 E; expert 40/40 N;
  child 7/40 N, 16/40 E; kid 0/40 N, 0/40 E. **PENDING R-165.339** (the lead, 12:35 PM): the child's misses are help-ladder rescues at
  every awake snapper ground (stuck 'a turtle near': sandbars 66 N / 45 E, rope 43/39, quickening 28/28, awake 26/22), not the count
  (only L6, L8, L29 on Normal). Traces trace-child-N-L4.txt, trace-child-E-L10.txt: the bot's bonkAfterSnap bonk dazes it, the bounce
  steers to the far side at full run and lands him 100-145 px past; he gets back as the daze ends (or stands still at dx -72, L4), it
  wakes, he bonks from the far side and loops. And no tier plays the taught way ("stand back, let it snap, then kick"). Nothing in the
  level changed for it (the lead's ruling).
- **The meter** (meter-2-5.txt, scale anchored on 1-1 N = 4): 2-5 Normal 3.7 (3.3-3.7), Easy 2.4 (2.1-2.4); 2-4 Normal 4, Easy 3.
  2-5.md's target is Normal 16.0 (World 2 band 9-21), Easy at most 9.6: **Normal is far UNDER its band** (as 2-4 is; DIFFICULTY.md:76
  already says nothing past World 2 is in its band). Easy is under Normal. **Not tuned** (Matt 11-18: no tuning from the meter's low World 2 reads; the same as 2-4).
- **Rock variety**: R-165.338 (engine, draw only): every 50 px moss_stone is painted by drawRockArt with the one 'boulder' frame; the
  World 2 atlas has a 'stump' frame nothing draws. The kit cannot vary it (a wider rock rescales the picture off its collider).

### Stills (pushed UNREAD for the lead; layout 1, Normal, 412x915 and 915x412 at 2x)
reference/qa-reports/BUILD-25/stills/s25-2-5-L1-x<X>-{upright,sideways}.jpg: x1560 the count tip and reach rock; x2440 the teaching
stone (the find sign gone?); x4180 the sleeper; x5550 three in step (deep); x11500 the rope over the channel; x14800 the wave; x20050 the
quickening; x25650 the Big Snap; x25990 the mossy stone. What I saw myself on the first beat 1-3 set (before the find fix): the five
rocks identical (R-165.338); the HOLD DOWN sign by the teaching stone (fixed); Normal's deep pond at beat 3 drawn as one flat teal slab to
the screen's bottom (World 2's shared deep-water painter, as 2-4's; named, not changed); two flags on one sideways screen around the
sleeper (3847 / 4747 on L1: the shared flag rules, within them); petals 3-4 a screen at beats 3 and 5 for a brief of 'few'.

### Polish check: NOT done (the lead judges the stills; castBots pending; rock art pending). Rough spots named above.

### Learned (for the next builder)
- Trace the quiet line before relisting: `quietOf` on 20 seeds with each stretch's section names the joins in minutes; petals on flat
  ground never count, a hop does. A 6-seed pre-check is the right gate before any relist.
- Read the goal AS PLAY BUILDS IT (RealPlay / withGoals), never `config.targetCount`: 2-5's designed goal never reached Play.
- A plant on kit data does not reach a test that replays the committed list (RealPlay): aim such a test's plant at the engine path it
  holds. And a sleeper is the arc's node ask, not the socket's allow.
- Look at the beat stills BEFORE the gates: the HOLD DOWN sign by the teach cost a relist and a gate restart.
### Proposed rule changes (level.md; the lead decides)
- Rule 6 add: "nothing to READ between a teach and its thing either: a find's HOLD DOWN sign by a hazard reads as its answer; a stage
  with a find gives it a findSpot on a rest" (check: the stage's arc test seats the find; 1-8 and 2-5 both hit it).
- New: "a stage whose design sets its goal is tested on the goal Play asks (withGoals on both settings)" (check: goalsEasy.test.ts).
- New: "a long plain bank before a teach gets a hop, not a petal" with the quiet trace as its check (seedlist's quiet line).
### Lessons applied
Judge the real screen (the stills found the find sign); check the fact in code before acting (the goal read on RealPlay, not data);
an engine gap is reported at once (rock art, bots), never coded around; every gate on the final head (restarted after the find fix).

## EXACT NEXT STEP (BUILD-25b, a fresh builder at high, on this head)
1. `npm install --no-audit --no-fund --legacy-peer-deps` (npm ci fails ERESOLVE; then `git checkout package-lock.json`).
2. Write src/game/gen2/worlds/w2Arc25.test.ts (2-4's w2Arc24.test.ts is the pattern; build through listedStage + worldFinish), each with
   a plant in reference/qa-reports/BUILD-25/planted-faults.py:
   - the keeper's lines verbatim from reference/story/lines-2-5.md (LINES_25, MISSION_25 = stagePlan's 2-5 desc, SEALED_25 =
     SEALED_LINES['2:purge'], TURTLE_TIP_25 = journal.ts turtle tip); goalLine('late', 2, 'purge', 2) = "Still 2 snappers to chase off
     before the sanctuary opens"; countWord(2,'purge') = 'snappers'; goalInfo's purge card says "snappers" (purgeNoun);
   - the arc beat for beat (sections: reach one-stone sleeper three awake rest rope wave rest sandbars quickening rest big-snap far-bank);
   - the snap rows by beat (teach freeBite + safe; Normal deep from beat 3 except beat 4; Easy every pond safe; wave 5 Normal / 3 Easy;
     every 0.75 row on clock snap-river, the quickening on snap-quick);
   - 9 snappers, each at its designed socket (no fill with socket 'topup'), the first asleep, clocks snap-river / snap-quick; goal 8
     (config.targetCount, countSet), Easy held to 5; gen2.errors empty;
   - each teach tip (count, snapper, snap, follow) 800+ px before its thing, no snap stone or snapper between; `quiet` past the Big Snap.
   - snapperCount.test.ts (RealPlay('2-5'): the OLD turtle's shell/punch ways) must be re-pointed with its assertion kept ("a snapper
     beaten counts toward the goal"): on the kit 2-5, the sleeper kicked and an awake one stomped-then-kicked each count 1
     (ENG-25's w2Cast.test.ts shows how). skills.test.ts:11 and w1NewArt.test.ts:92 are id-only (check they pass).
   - Plants still owed for accepted engine bits: PadRow.clock (two bars under one name throws; an Easy twin keeps its Normal clock) and
     snapFaults(st, 'normal') skipping the Easy comparison while the Easy build still judges it (snapRow.test.ts).
3. Seed list: **the 6-seed try FAILED the packet's pre-check** (`npx tsx tools/engine/seedlist.ts 2-5 --count 6`, 73 s,
   reference/qa-reports/BUILD-25/seedlist-6.txt): 5 kept of 1,199 fresh seeds (0%), 1,194 refused by THE QUIET LINE (over 4 s with
   nothing to do). Its 5-seed list was NOT committed. Fix the lay first: the long plain banks before each teach (Dot's 800 px: a 700 px
   bank in beat 4, 480+400 in beats 1/2/6), the snapper grounds' 3x150 + 300 banks between snappers, the rests. Trace which x the quiet
   stretches sit at (the tool's refusal names `# s ... at x #`: run one seed with the stage's own quiet report), then give those stretches
   something to do (petals, a rock, a log) without breaking the teach rule (nothing that HURTS between a teach and its thing) or the
   snapper ground rule (no higher floor within 176 px of a patch: a rock must keep away). Only when 6 fresh builds pass, the full relist.
   Then flown rows if the judge asks (2-4: FLIGHT_STAGE=2-4 flight.ts normal all -> flownArcs normal-2-5, stageTable `judged`).
   Run the list judge's R-165.327 seat rule on 2-5's list (the lead, 12:05 PM).
4. Early stills (beats 1-3, upright + sideways) to the lead; then castBots 2-5 1-40 x 5 bots x both settings, meter N+E, the full
   CLAUDE.md gate list on the final head, the packet's polish stills and clips. If the child misses on the count: back to the lead
   before changing anything (the lead, 12:05 PM).
5. drawcheck: add 2-5 to tools/perf/limits.json scenarios (2-4's commit 81b152fa did it).

## Done (commits on t-build-25)
- 726c0071 two engine pieces, each PLANTED (green after, RED planted in the same test): **R-165.336** StageSpec.count -> targetCount +
  LevelConfig.countSet, no top-up (src/game/gen2/countSet.test.ts); **R-165.337** PadRow.freeBite -> Pad.freeBite: a teaching row's
  bite jolts and holds, no heart (snapRow.test.ts last test). Both rulings the lead's 11:50 AM ET.
- 7de7bdf4 2-5 laid (src/game/gen2/worlds/w2Arc25.ts, kit 'w2-25', stageTable + listed.ts): seeds 1-6 Normal and 1-2 Easy build with
  gen2.errors empty, the beats in order, 9 snappers, width ~28.6-29.2k px. Also PadRow.clock (named shared bars) and snapFaults judging
  Easy on the row Easy plays (accepted 12:05 PM; plants owed, step 2).
- 11410e1a the hand-built 2-5 deleted, tests re-pointed, the old turtle's Dot rows retired, lines-2-5.md copied.

## The lead's rulings (this session)
- 11:50 AM: GO on arc, rows, beats; Easy splash-back everywhere; goal by data (b); teach bite no heart; beat 5 fallback OK.
- 11:53 AM: R-165.336 / R-165.337; freeBite on the teach stone only, never keyed off `safe`.
- 12:05 PM: goal 8 of 9 accepted; PadRow.clock + snapFaults change accepted (plant both); short level snapper banks accepted as data:
  NAME in the final REPORT as the same placer root as R-165.312 (the flag placer moving predators).

## Named rough spots / open
- Beat 5's snappers are on the far bank past the rope's landing (the rope's pit has no ground), so 9 laid, not the design's 7.
- The Big Snap's "last snappers dive away" is not built (no animal is laid there); the stage is ~29k px wide (stage time unmeasured).
- Easy keeps all 9 snappers softened (easy 'stay'): the node asks would re-lay any the count cut took, anywhere on the node.
- No gate run yet beyond tsc and generalitycheck PASS (on 726c0071); NOTHING else is green yet: the suite has not run.

## Learned (proposed level.md rules)
- A designed animal needs ground no rolled flag can take: ROLLED flags are laid before sockets and a flag's 200 px approach drops the
  socket; the node ask then re-lays the animal anywhere on the node's banks (once 224 px past Dot's line). Lay it on ground under
  FLAG_SPAN.pad (160 px) or prove its seat on every listed seed.
- Two Pg (same letter, job, content) beats roll in either order: give each a `window` (share of the stage).
Lessons applied: D30 (times from date), D40 (engine pieces first, then the stage), D57 (notifications at push), D87 (seed run backgrounded).
