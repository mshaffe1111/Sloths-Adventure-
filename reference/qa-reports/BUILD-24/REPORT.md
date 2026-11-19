# BUILD-24 REPORT: 2-4 "Never Touch the Bank", laid and listed; STOPPED at the 50% box (real 502,086 tokens, get_session 3:38 PM ET)
Branch t-build-24 from origin/t-meter-3@42459a5c. Started 3:00 PM ET 11-18 (by `date`). GO 3:12 PM ET (len 340, beats 4/9 soft, s->r, raft as a log).
## EXACT NEXT STEP (a fresh builder at high, on t-build-24's head)
1. Trace and fix the 8 calibrated-tier rescues (table below): rule 28, two runs per cause (`npx tsx reference/qa-reports/BUILD-24/trace24.ts
   middle:normal:31,...`). Three places: (a) beat 6's near-bank edge "water ahead" (no-land, x~15790): is the bot's dropOnLog waiting at
   the bank for L1 (reach 165) or for the log-caught L2 (765)?; (b) the rest after beat 6 "a drop of 50 px ahead"/"nothing the bot can see"
   (x~17400-19140, after a drowning + respawn at its flag: suspect the bot's way-finding after a respawn on a rest whose steps go up/down);
   (c) once each: fig-roots plank hop (expert s31 x13376), relay "the way on is 90 px up" (middle s33 x21200). Fix where the cause is
   (bot = ENGINE-WORTHY to the lead; data = w2Arc24.ts), then relist (`seedlist.ts 2-4 --relist`) and castBots 1-40 again.
2. Then: the full CLAUDE.md check list on the final head (UNRUN here: see the gate table), lockall vs main `--intended 2-4`
   (main's lock: regenerate on origin/main, `--layouts 16 --out`), coveragecheck, drawcheck 2-4 both ways (aim <= 7.0 screens), stills
   (upright + sideways, Normal + Easy, Dot's cards tapped through; layout 1 Normal: teach 2108/2940, catch 10028, no-land 15447, relay
   20746, swing 26376, exit 28502) and the clips: `clipRecord24.ts normal 1 0,3 rec.json` then `clip24.mjs 5199 rec.json <out> drop`.
## Done-items (packet) and evidence
1. **Laid by its design** (w2Arc24.ts, kit 'w2-24', graph `A Tr Pg Pr Xw R Pf Wr R Pb Cw R S E`, checkCode no errors): libstage 24 seeds
   CLEAN 24/24 both settings, ONE beat order, modelled 205-211 s, 28.2-29.5k px (25a73b10). Proven list 100/100 (seeds-2-4.ts, 0a6f2992;
   quiet line <= 4 s on all 100, median 4 s). Hand build deleted (w2Stages/w2Sections + its kinds swing4, island); tests re-pointed:
   w2Stages.test PLANS (its 2-4 test moved into w2Arc24.test), vineSnake.test 4 loops -> 1-6 (15/15), stageBackdrops unchanged (by id, 3/3).
   Judged on its own flown rows (fly-2-4.txt, flownArcs normal-2-4, chain.md §1, judgedTable.test 6/6). Lines verbatim (KEEPER-24
   fa3b0930 + 18e452c3: drop, catch, view, mission, journal page, clue; water line world-wide in one commit 988bbae2); hint.2-4.* removed.
   w2Arc24.test.ts 6/6; planted-faults.py 10/10 CAUGHT (11th plant, the journal page, added after: unrun). drawcheck scenario added.
2. **Gates:** see table. tierBots calibration recommitted (18ae6ce8): 210/210 lines identical except ontoLog/fromLog = 0. No run moved.
3. **Polish: NOT DONE** (stills and clips): stopped at the box; rule 29 also holds them until the bots are green. Tools ready.
## Gate table
| Gate | Result | Head |
|---|---|---|
| tsc | PASS | 0aa411a3 |
| w2Arc24 / w2Stages / vineSnake / stageBackdrops / w2 / w2Arc21 / judgedTable / dotLines / tips / pokeyJournal | all pass | as committed |
| libstage 2-4 24 seeds | CLEAN 24/24 both | 25a73b10 |
| seedlist 2-4 (write) | 100/100 | 0a6f2992 |
| castBots 2-4 1-40, 5 bots x 2 | adult 40/40 both; child N 40/40, E 38/40; middle N 37/40, E 40/40; expert N 37/40; kid N 29/40, E 39/40 | 0a6f2992 |
| meter (score.ts seeds 1-4) | 2-4 Normal 4.0 (3.9-4.2) vs target 13.5 (DIFFICULTY.md:63; band 9-21): UNDER; Easy 3.0 vs <= 8.1: OK; anchors 2-1 2.7, 2-2 6.4, 1-1 4.0 | 0a6f2992 |
| seedlist 2-4 --check | PASS (100 seeds, each clean on both settings; the verdicts refuse 0), finished 3:40 PM ET after the stop | 0a6f2992 |
| seedlist 1-1 --check, lockall vs main | RUNNING at the stop: UNRUN (D59) | - |
| full suite, vite build, chunkcheck, artcheck, drawcheck, clipcheck, knowncheck, generality, roadmapcheck, kbdcheck, buildcheck, tool tests, tierBots.test, coveragecheck | UNRUN (box) | - |
## Bots: the misses traced (one line each: seed, x, t, what; rescues are the bot's way-finding, no life lost to them)
middle N s12 rest x17987 t207 "a drop of 50 px ahead" (after drowning in no-land t138); s31 no-land x15802 t109 "water ahead"; s33 relay
x21200 t173 "water ahead, the way on is 90 px up". expert N s29 no-land x17365 t192 "nothing the bot can see"; s30 rest x18022 t148 (after
drowning in the relay); s31 fig-roots x13376 t111 "an open drop ahead, water ahead". child E s6 rest x18474 t213; s39 rest x19141 t213 "a drop
of 51 px". fromLog > 0 on every traced run (2-8): the log is the way to the log-caught lianas. Easy lives 0 (Normal 74-210: water).
## Pushback
1. The design's Easy `lashed` row cannot be laid (300 px logs at 60 px/s: a log every 6.2 s, over riverFaults' 4 s); Easy beat 1 rides `long`.
2. Beats 6/8 at ENG-24's reach ~600 put the second liana inside the engine's chain distance (CHAIN.dx 560): liana-to-liana, log skipped.
3. The meter reads 2-4 at 4.0 against 13.5 (and 2-1 2.7 vs 9.5, 2-2 6.4 vs 13): World 2 sits far under its band on this meter. Not tuned.
## Suggestions (outside my walls)
A. route.ts: the lianaDrop is no beat, so a let-go reads as quiet: price the press as an action (the quiet line then reads rides fairly).
B. The camera pull-out at the great swing (engine); R-165.288 raft look, R-165.289 glow-with-the-log (the lead's rulings, before 2-4 ships).
C. The keeper: w2Sections.ts:181 hand stages still say 'Deep water now. Stay on the logs!'.
## Unresolved (named)
Stills, clips, polish check; the full gate list; the 8 rescues; the raft is a log; Pokey's `view` is said in Dot's box (no speaker field,
as 2-2's `lily`); the kapok page lives only in lines-2-4.md (as 2-1's river, 2-2's lily); the kapok backdrop (the lead's HF call).
## Learned / proposed level.md rules
- A second liana over the same river hangs past physics CHAIN.dx from the first, or the route and a player skip the log (test it).
- Fly the quiet line before shaping beats: each let-go over a river needs an action within ~0.5 s of the landing (a boulder at 0.15).
- A design with no finale node takes `ends: 'quiet'`; check the graph's job list before laying (pool short "n15 finale").
## Method used / Lessons applied / Method update
methods/level.md rules 2, 6, 9, 12, 16, 22-29; D19 (tests read the game's own build), D30 (times from `date`), D36, D51 (drawcheck scenario
the same packet), D59 (running gates named UNRUN), D64/D76 (real context read: 50.2%, stopped), D83 (relative imports in report tools).
Method update: level.md step 3 add "read the quiet line's position after every change (libstage --json) and fix by data before relisting".
## Turnover note
reference/handoffs/engine-core.md §0zm (0aa411a3).

# BUILD-24b (packet reference/packets/2026-11-18/BUILD-24b.md): the 8 rescues fixed at the root, the suite's 2-4 misses, beat 8's third leg, every gate, stills, clips
Started 3:42 PM ET 11-18 on t-build-24 @ 872c8693 (by `date`). Gate head **557c363b**. The lead's rulings this task: 4:43 PM ET (no longer
rests; one more log-to-liana catch; flagSpan derived), 4:45 PM ET ((B): a third relay leg).
## Done-items and evidence
1. **The 8 calibrated-tier rescues: ONE root, in the bot** (traced two runs per cause, rule 28; `reference/qa-reports/BUILD-24/geom24.ts`,
   `trace24.ts`, FT_FRAMES). After the GAME set Pokey down, the bot's place along the way was stale: (a) Normal drowning: `respawned()`
   (called from the loseLife hook) relocated him at the spot he DROWNED, a frame before the engine moved him to the flag (middle N s12:
   "relocate at 21557,936", flag 20660); (b) Easy splash-back: the river put him back with no bot respawn at all (child E s6 t192.60:
   21897 -> 21041). 900 px off the way under a liana's catch, `pitWayBack` set a 20 s climb back the WRONG way (left): he walked back
   2-4k px until the stuck clock rescued him. The same stale place set his progress mark ahead, so on middle N s31 his 14 s waits on
   beat 6's liana were never reset. Fix (general, no stage id, nothing loosened): firsttimer.ts `after()`: a 100+ px jump in his place
   in one frame that the bot did not make itself (`placed`: placeAt, a rescue, a put past a puzzle room) = set down by the game: relocate
   where he stands, drop the climb back. Planted test `pitClimb.test.ts` "set down by the game": GREEN with, RED with the fix off (both
   versions proved). Bots before -> after (2-4 as laid by BUILD-24): child E 38 -> 40, middle N 37 -> 40, expert N 37 -> 40; all 8 jobs 0
   rescues. 1-1 calibration re-run (BOTS.md): 209/210 lines identical; child easy v25 303.6 -> 303.5 s + one more second press (the same
   defect on 1-1: a stale climb back after a put-back at t286.87); recommitted (1b746f0f), the table lines unchanged.
2. **The full suite (first full run 2-4 had): 5 misses, all fixed at the root.** firstTimerBot 6-3 seesaw (MINE: the set-down undid
   pastRoom's placement; now `placed`); artUse (2-4's brick id 'fig-roots' read as a draw site of World 7's fig-roots prop -> 'root-planks');
   petals 'spread out' (beat 3's petal sat in the stump at 0.2 and was removed: 2,438 px -> moved to 0.5); flagSpan floor (now DERIVED:
   `owedWalk()` from HAND_STAGES + W2_STAGES, stale ids named, never empty, planted; the lead's ruling); stageQuality 'stages grow' (World
   2's gen2 median 224.1 < World 1's 240.5 - 6) -> the lead's (B): **beat 8's third relay leg** (a bank liana's drop + a liana caught off a
   log over one more gap-280 river, Easy its gap280Easy twin, a petal on the stump bank between): 2-4 models 240.1 s.
3. **Bots on the gate head's data** (castbots-2-4-b.txt): child N 40/40 E 40/40; middle N 40/40 E 40/40; expert N 40/40; adult 40/40 both;
   kid E 40/40; kid N 36/40 (seeds 17, 30, 31, 37: put past after drowning 4x at no-land x~16331 / the relay's gap-280 legs x~22900-24600:
   Normal not softened for the kid, level.md rule 4). Easy lives 0 vs Normal 100-139 (water). fromLog 5 / ontoLog 6 on the clip run.
4. **Stills** (557c363b, layout 1 = seed 65370, Normal + Easy, upright 412x915 + sideways 915x412, 2x, touch-phone context, the start card
   shot then tapped away; `stills24.mjs`): contact sheets `stills-b/up-normal.jpg`, `up-easy.jpg`, `side-normal.jpg`, `side-easy.jpg`.
   **Clips** (`clipRecord24.ts normal 1 0,4,7` + `clip24.mjs`, the middle bot's real run, 30 fps and half speed): `stills-b/drop-r0-up.mp4`
   (the first drop), `drop-r4-side.mp4` (no-land: liana, log, liana, a drowning and the retry), `drop-r7-up.mp4` + `-half` (the NEW third
   leg: bank liana, let go onto a log, ride, jump up to the log-caught liana, far bank); frame sheets `sheet-drop-r4-side.jpg`, `-r7-up.jpg`.
## Polish check (each looked at as a player on a phone)
- The teach (x2108, both settings): Dot's "Knock? Log coming! Let go when it's under you." on screen, 800+ px before the first liana. OK.
- The start card ("2-4 · Over the Water · This stage: swing to the end"), both orientations, tapped away. ROUGH: it says "swing to the end",
  not the keeper's mission line "Vines to logs, logs to vines..." (the card's objective wording is the vine_runner kind's; name for the lead).
- Each beat's bank before its river (drop, board, no-land, relay, leg 3, swing, exit): the liana, the logs and the water read; Easy's rivers
  are the shallow splash-back look, Normal's no-land and relay deep. The exit door "Touch the door!" shows on Easy sideways.
- ROUGH (not 2-4's data; art/engine): (a) under each high bank's cliff face beside DEEP water, a grey rounded shape and a pale shallow-water
  patch show at the screen's bottom (relay x20690 upright, leg 3); (b) upright, the deep river is half the screen of flat dark teal; (c) a
  heart pickup sits on the flag at the relay's first bank; (d) standing still, Dot's move coaching ("Flick up to hop up or over.", counters
  +1..+4) takes her bubble on every bank, and my stills could not catch the `catch` and `view` lines on screen for it (tipwalk is the proof
  they are said: see the gate table); (e) the raft is a long log (R-165.288, named); the glow (R-165.289) is tomorrow's engine job.
- The swing-to-log feel (R-165.271), from the clips: the let-go drops him straight onto a log under the swing, the log carries him, the jump
  up meets the second liana at the top of its swing; nothing snaps or jitters in the frames. ROUGH: on a missed phase the bot (and a player
  who lets go only on the forward swing) waits up to ~14 s on beat 6's first liana: noLand24's log clock (222 px at 80 px/s = 2.78 s)
  nearly locks with the liana's 2.85 s swing (a missed phase repeats for many swings). Not a rescue cause after the fix; proposed below.
## Pushback
- The packet's "fix in 2-4's data, never the bot": the root of all 8 was the bot's bookkeeping (not a skill loosened), fixed generally with a
  plant; told to the lead at 3:47 / 4:08 PM ET.
## Suggestions (ready packets)
- RIVER-CLOCK (engine, riverLay judge): judge a liana river's FORWARD-swing let-go wait as well as any-moment (lianaDrops), so two clocks
  that nearly lock (beat 6: 2.78 s logs vs 2.85 s swing) are caught; then retune noLand24's gap by the judge, flown. Done-items: the judge's
  planted case (noLand24 today RED), 2-4 relisted, bots' longest liana wait <= 2 swings.
- ART-USE gate (tools/art/artuse.mjs owner): a gen2 brick/section id is not a draw site (2-4's 'fig-roots' hid World 7's unused prop).
- STAGE-CARD wording (keeper + engine): the start card's "swing to the end" vs the stage's mission line.
- riverRide.test's two 2-1 skill plants RESTATED (the lead's ruling (a) 5:31 PM ET): they read "rescued" with the skill off, and those
  rescues were the stale-relocate root; now, on the same cases: upstream off -> 2+ more drownings than on (measured 0 -> 5, 2 -> 5);
  bankUp off -> 12+ s longer (measured +33, +24). GREEN with the skill off vs on; equal runs would be RED. Comment in the test says why.
## Gate table (head 557c363b unless named; the head moved after: 693a2b69 first-frame guard, then the plants, so ALL must run again)
| Gate | Result |
|---|---|
| tsc | PASS (557c363b; a0fdeaab's changes are tests/report) |
| knowncheck, generalitycheck, roadmapcheck | PASS |
| seedlist 1-1 --check / 2-4 --check | PASS / PASS (100/100) |
| tool tests (CI list) | FAIL 3 on 557c363b, all mine: pitClimb shallow pit (FIXED 693a2b69, pitClimb 16/16), riverRide plants 209/210 (RESTATED, 2/2) |
| tierBots.test / calibration replay | 7/7 / 200 of 200 lines identical (the `placed` version) |
| coveragecheck | PASS |
| tipwalk --layouts 4 | PASS |
| funcheck | FAIL 34 worse/53 to lower: World 1 (1-9 etc.), IDENTICAL on BUILD-24's 872c8693: not 2-4's, pre-existing on the base |
| meter (score.ts 1-4) | 2-4 Normal 4.0 (3.8-4.5) vs DIFFICULTY.md 13.5 (band 9-21): UNDER, named not tuned (World 2 reads low: 2-1 2.7, 2-2 6.4); Easy 3.1 <= 8.1 |
| suite, vite build, chunkcheck, artcheck, drawcheck (2-4 both ways in its list), clipcheck, kbdcheck, buildcheck, registry, every list --check, lockall vs main --intended 2-4 | RUNNING at the stop on 557c363b (results in the session's scratch only): UNRUN on the final head (D59) |
## Unresolved (named): the lead's 3:51-5:24 PM messages reached this session only at 5:28 PM ET (queued); NOT done:
1. Two more bot defects for the SAME bot commit (the lead 4:00/4:03/4:10): (a) `Progress.relocate(p, level=true)` has no distance limit
   (1-6 kid N layout 13: picked a point 35,000 px ahead) -> keep `level` points within ~600 px in x, else the plain nearest; (b)
   `pitWayBack` returns early on `prog.off(p) < 120` (1-6 middle N layout 34: 8 double jumps at the liana foot for 150 s, never the stair).
   Each with a planted test; then ONE recalibration (tierBots must match the testers, else stop) and the castBots rows that move named on
   1-6/1-7/1-8 and 2-4.
2. ROOT B (the lead 3:51: do it): noLand24's log gap so its clock sits about half a log off the liana's 2.85 s swing (today 2.78 s: locked),
   flown and judged; relist.
3. PINK PETALS drawn in the soil band under 2-4's rivers (ENG-24c on a scratch merge; the lead 5:13/5:24). My stills show petal-coloured
   specks below the ground line (e.g. stills-b/up-normal.jpg x23700, x27800, side sheets): NOT YET told apart from the falling-petal
   ambience. Find the source (a pickup's y on a river piece?), fix, plant, and check every layout's petals sit on ground or an arc.
4. The stills/clips are on 557c363b; reshoot on the final head if 1-3 move 2-4 (2 and 3 will). The turnover note engine-core.md is NOT
   rewritten this task.
## EXACT NEXT STEP (a fresh engine member, high, on t-build-24's head)
1. Unresolved 1 (both bot defects, planted, one commit), then `npx tsx reference/qa-reports/BUILD-24/recal.ts` + tierBots.test (stop if a
   tier moves off the testers) and recommit calibration-main.jsonl per BOTS.md; castBots 1-6, 1-7, 1-8, 2-4 1-40 rows named.
2. Unresolved 2 and 3 (2-4 data / petals), relist 2-4 (`seedlist.ts 2-4`), castBots 2-4 1-40 x5 bots x both.
3. The FULL CLAUDE.md list + funcheck + tipwalk + registry + every list --check + lockall vs main (`--layouts 16 --intended 2-4 --check`;
   main's lock: regenerate on origin/main with `--out`), ONCE on the final head; scripts used here: laneA/laneB (the commands are the
   CLAUDE.md list verbatim plus gates.yml's).
4. Stills (`stills24.mjs`, spots in this section) and clips (`clipRecord24.ts normal 1 0,4,7` + `clip24.mjs`) on that head.
## Learned / proposed level.md rules
- Run the FULL suite before calling a level laid: 2-4's four suite misses (a draw-site name clash, a petal inside a stump, a hard-coded
  stage count, World 2 shorter than World 1) were all invisible to libstage + seedlist + castBots.
- A bot rescue is traced before the level is touched: all 8 "level" rescues were one bot bookkeeping defect.
- Two clocks over one river (log spacing vs swing period) must not nearly lock: check |T_swing mod T_log| per liana river.
## Method used / Lessons applied / Method update
level.md rules 13, 14, 19, 20, 26, 28, 29; D19, D30, D59 (running gates named UNRUN), D76 (context), D86 (the full list on the final head:
not reached; named). Method update: castBots/tierBots plants that expect "rescued" should name the skill's own effect (lives, time),
never a rescue, which a bot defect can supply.

# BUILD-24c (packet reference/packets/2026-11-19/BUILD-24c.md): finish 2-4 on the real raft and glow; IN PROGRESS (section written 2:29 PM ET 11-19, updated at each step)
## EXACT NEXT STEP for BUILD-24d (BUILD-24c STOPPED at 3:23 PM ET 11-19 on the lead's D76 STOP: real context 491k of 1M, past the 400k box)
Head: t-build-24c, the commit that adds this note (code unchanged since 8a78d0ec: src/ and tools/ identical; later commits are report,
stills, clips, gate logs). Box: final hash by 9:30 PM ET. Nothing of mine is left running: lockall vs main was RUNNING at the stop and dies
with this session = UNRUN (D59).
1. GATES, state by head (logs in reference/qa-reports/BUILD-24c/gates/):
   - PASS on the code of 8a78d0ec or earlier, src unchanged since: tsc, knowncheck, generalitycheck, roadmapcheck (unshallowed),
     BASE_PATH vite build, chunkcheck, artcheck, tipwalk --layouts 4, registrycheck, coveragecheck, seedlist --check 1-1..1-9, 2-2, 2-4,
     tierBots.test 7/7, letGoCue.test 4/4, weatherDrift.test 4/4, riverRaft.test 6/6, w2Arc24.test 6/6, seeds.test (after e236233c),
     pitPocket.test (floor 29), score.test PREDATOR READ (restated, 8a78d0ec), drawcheck PASS on dbee343a (src then = 9fdea9da; the
     ENG-285 merge changed engine.ts since: RE-RUN drawcheck).
   - Full suite on efa2c736: 3859/3863 pass, 2 fail = seeds.test (fixed by merging e236233c) + pitPocket (fixed d4b81001): RE-RUN once on
     the final head (expected green; nothing else changed in src after except score.test, a tool test).
   - CI tool line on 2d39888a: 230 pass, 2 fail = score.test:304 (fixed 8a78d0ec) + riverRide.test:182 (2-1's bankUp plant, child Easy
     seed 20: OWNED BY ENG-285b, the lead's ruling 3:13 PM ET; merge its fix when it lands).
   - seedlist 2-1 --check FAIL: 'replay differs' + 'quiet 4.1 s' = the known METER-3 route red (LESSONS D86 addendum): INT-13 relists.
   - funcheck FAIL 30 worse / 41 to lower: no flag names 2-4 (grep 0); all World 1 (1-9 etc.): not 2-4's.
   - UNRUN: lockall --layouts 16 --intended 2-4 --check vs main (regenerate main's lock on origin/main 6e7b85f8 with --out first, ~20 min;
     expect stages from the merged lines (1-9, ENG-285's model) to move: list them for the lead before judging), clipcheck, kbdcheck,
     buildcheck (ALONE: it times), drawcheck again (above), the meter (tools/difficulty score 2-4 N + E vs DIFFICULTY.md: name, don't tune).
2. POLISH, the lead's 3:19 PM ET check (sent then; its text said 3:25), three items:
   (1) NORMAL's 'Flick up to hop up or over.' card on 6 of 7 frames: SOURCE FOUND, not fixed. The engine picks the 'gap' lesson once per
       run (engine.ts lessonTick: seen.add on pick; lessons.ts pickLesson 'gap' fires at a BOULDER on a bank: rock() is a platform, its
       edge to the bank ahead > 60 px). The card then stays because on Normal (Tips) DotGuide reads it on the page's REAL clock, and the
       still tools step frames with no real time and never tap it, so the one unread card sits over every spot with its +N queue badge.
       With HOP=1 (shoot.mjs: one real jump first) it still shows at x27760, so it is not only 'he never hopped'. NEXT: shoot Normal with
       stills24.mjs ALL spots ':dot' (walk in, then 9 s real time so each line is read and gone) to show what a player sees per beat;
       if a hop card still covers every bank in that, it is rough: the boulder-as-gap pick (lessons.ts pickLesson: skip a gap whose next
       platform is the SAME floor the boulder stands on) is engine/UI work: ask the lead who owns it.
   (2) EASY SIDEWAYS deep teal slab (no bed band, final-2-4-easy-up-and-side-sheet.jpg row 2): NOT investigated. Easy's no-land/relay rows
       are 'safe' (drawRiverWater's safe band: shallow strip + soil) but row 2's river is drawn as the deep sheet: check which river it is
       (x20690 Easy = relay gap200Easy, safe) and whether painted safe-river art (safeRiverArtReady) had loaded at the shot; compare live
       2-1 sideways; if the safe band is missing by code, fix at the source (riverArt drawRiverWater / engine drawRivers) with before/after.
   (3) Full-size stills per beat, upright + sideways (teach, let-go onto a log with the glow lit, log-to-liana catch, relay, raft, exit):
       full-size frames exist for teach/drop/catch/relay/swing(raft bank)/exit, both settings, both ways, but only in this session's scratch
       (lost). RE-SHOOT with stills24.mjs (spots: 2108:teach:dot 2880:drop 9400:catch 15380:noland 20690:relay 27760:swing 29500:exit) and
       commit them full-size under reference/qa-reports/BUILD-24c/stills/final/; the glow-lit let-go needs ENG-24c's stills method
       (reference/qa-reports/ENG-24c/stills/*glow-lit*).
   CLIPS (R-165.271, swing-to-log feel): pushed, reference/qa-reports/BUILD-24c/clips/c24-r{0,3,4}-{up,side}.mp4 (Normal L1, the middle
   tier's run through the game's InputEngine: river 0 = beat 1's first drop, 3 = beat 4's log-to-liana catch, 4 = beat 6 no-land). NOT
   yet looked at frame by frame (D69): judge them, name the frame of each let-go and catch.
3. Then: append the gate table (each gate, head, result), the Polish check (each item with its still), Learned + proposed level.md rules
   (below), lessons applied; send the final hash to the lead.
Learned (proposed level.md rules): (a) every stage-count floor in a test is derived from the tables, never a literal (flagSpan, pitPocket:
twice now); (b) a liana beat that must FORCE its skill is proven by a ride-across probe (rideAcross.ts) on every listed seed, both settings;
(c) two clocks over one river (log spacing vs swing) are kept a third to a half of a log apart, measured by the bots' holds (lianaWait.ts);
(d) a still tool must let the page's real clock run (or tap the cards) or it shows one unread card over every spot.
Lessons applied: D19, D30 (one miss: a typed '2:41 PM' corrected to the lead), D36, D57, D59, D62, D69 (clips not yet judged: named),
D76 (context: stopped at 491k on the lead's read; my mid-turn estimates were guesses), D79, D81, D86, D87.

Branch t-build-24c: base t-build-24 38f9b929 + ENG-24c 1f5c4008 (merged 50ce4eca: engine-core.md both sections, ENG-24c's as §0zn;
calibration-main.jsonl took ENG-24c's rows, recalibrated on the final head) + ENG-285 final model t-eng-285 ba6b225b (merged 2a3e061a:
8 conflicts: listed/stageTable/gates.yml/judgedTable unions of 1-9 and 2-4; flagSpan keeps owedWalk; physics.ts ENG-285's pressClimb +
ENG-24c's `call` field; riverLay ENG-285's split (no `, true`); letGoCue CUE.climbFrames 0 per the MERGE NOTE; engine-core.md both).

## Done (each planted; stills in reference/qa-reports/BUILD-24c/stills/)
1. Raft wired (slow24 look 'raft'). FOUND: ENG-24c's raft-sheet preload asked GEN2_STAGES only; 2-4 is a LISTED stage, so 2-4 never loaded
   'kit-pieces' (the raft would have shown as a log). Fixed in stageSheets.ts (listed stages ask their kit); riverRaft.test planted (RED on
   the old stageSheets). Stills: raft-ride-2-4-N-E-up-side.jpg (Pokey on the painted raft, deck under his feet).
2. flagSpan tsc: already fixed by BUILD-24b 557c363b.
3. Pink specks in the soil = World 2's falling-petal WEATHER drawn over the whole screen (scenery renderWeather), not a pickup (1,808 pickups,
   L1-16 both settings, 0 inside a floor: BUILD-24c/soilprobe.ts). Petals and leaves now drift BEHIND the stage (renderDrift after the
   backdrop); World 5's own petals (w5Play) the same (drawDrift). weatherDrift.test 4/4 (planted).
4. Grey wall / dark strip / pale patch under every river bank (LIVE 2-1, 2-2 too) = the backdrop through the gap where the bank's painted
   cliff tapers in and the river stopped at the bank's edge: the river's water, bed and soil run RIVER_UNDER_BANK 140 px under a bank that
   meets it (engine riverUnderBanks, behind pass only). Stills before/after (7 banks).
5. Grass underground = the frame's code-drawn foot clumps (envKit reeds/rocks, flora fernFrond, artKit drawBananaLeaf). Upright: none on a
   stage. SIDEWAYS: off on this branch too, WAITING ON MATT (the lead asks him; pair at stills/frame-plants-sideways/, same frame: shoot.mjs
   FREEZE). The first pair's faded Pokey was an idle-pose cross-fade on the real clock, not an alpha leak (instrumented). Planted.
6. letGoCue.test 4 re-pinned to ba6b225b (the lead's ruling 2:23 PM ET; old/new numbers in its comment).
7. ROOT B (the lead's ruling 2:27 PM ET): noLand24 speed 100 gap 64 (log clock 2.14 s vs swing 2.85 s; was 2.78 s), noLand24Easy speed 80
   logW 150 gap 60 (2.63 s vs 3.3 s; was 3.09 s). Judge waits 0.20 / 0.13 swings. Bots (lianaWait.ts) before: beat 6 at the 14 s cap.
8. drawcheck PASS (dbee343a, 17 scenarios both ways, 694 s): 2-4 side 5.75 screens / 1.00 gradients / 1057 fill; 2-2 side gradients 2.00 (at
   the limit; not compared to base).

9. letGoCue.test 4/4 again (17e38bda): test 1's red was the HARNESS, not the model (ENG-285b's diagnosis, 2:28 PM ET): since R-165.295 the
   vine clock is gameTime + vineShift, and start() set the swing before the game clock; now the clock first, guarded.
10. Relist 2-4 on the final model + Root B rows: 100 kept of 100 tried; the list is the same 100 seeds (seeds-2-4.ts byte-identical, 08c32188).

## castBots 2-4 1-40 (reference/qa-reports/BUILD-24c/castbots-2-4-c.txt, the final model + Root B), before -> after (BUILD-24b's head)
child/middle/expert 40/40 both settings (as before); adult 40/40 both; Easy 0 water lives on every bot vs Normal 106-161 (fewer hits on
Easy). kid Easy 40 -> 39/40 (one rescue at x28803, the raft/jetty). KID NORMAL 36 -> 29/40: traced (tracekid.ts), 10 of 11 rescues at the
relay's FIRST river (x~21,500: deep gap200, the design's hardest row; 5 drownings at one flag, then help moves him on), 1 at its third
(x24869). Attribution: the kid on be615d5e (ENG-285 merged, before Root B) 28/40, 342 water lives
(castbots-kid-normal-preRootB-be615d5e.txt); after Root B 29/40, 295: the drop came with ENG-285's model (the kid's aim), not 2-4's rows.
Named for the lead (the relay rows are the design's knob; the kid is traced, not held to 40/40 by the packet).

## 2c: a beat skipped by riding a log bank to bank (the lead's ruling 2:33 PM ET: (iii) today, (ii) tomorrow, never a 240 px wall)
Probe reference/qa-reports/BUILD-24c/rideAcross.ts (RealPlay, the game's own update; Pokey boards the first log at the near bank's lip,
stands, hops onto the far bank, the best of 6 hop timings; never touches a vine). Seeds 1-3, both settings:
- beat 4 (up-from-log, the log-to-vine catch): CROSSED 6/6 (its far bank z is level with the near bank: upFromLog bank('z','c',300)).
- beat 6 (no-land, the vine-to-log drops): CROSSED 6/6 (Normal at 100 px/s too).
- beats 1, 3, 8, 9 (bank-boarding is the design, 2-4.md:48 'the knock'; RIDE-OTHERS, seeds 1-3): beat 1 (teach) Normal CROSSED 3/3, Easy
  the probe never boarded (timeout: NOT shown either way); beat 3 (drop-ride-drop) its second river CROSSED 6/6, its first never boarded;
  beat 8 (relay) its third river CROSSED 4 of 4 runs that boarded (first two never boarded); beat 9 (great swing, the raft to the jetty)
  CROSSED 6/6 (the raft is ridden by design). A 'timeout' is the probe's boarding rule (a log reaching back under the lip) never firing,
  not a proof that the river cannot be ridden.
Neither forced skill is forced today. Why: riverLay lays a +1 river's logs out from under the near bank's lip and carries them to the far
bank's lip, 28 px under bank level; a rider steps or hops off. A far bank out of a rider's reach is about 215 px over the log top (a double
jump rises 184.5 px, physics DOUBLE_RISE): a wall, which the lead ruled out.
### ENG-24e (packet text for Friday's fresh engine member, the lead's (ii))
ENG-24e: river logs end short of the far bank, a 'tail' (they sink under an overhang or a fall), out of hop reach, any world; planted;
2-4's beats 4 and 6 relisted on it. Done-items: (1) RiverRow gains a tail field (data; riverLay layRiver: the carriers' window ends that
far before x1, the water beyond it log-free; riverFaults judges the rest); (2) the drawn end: World 2's painted overhang or fall where the
logs go under (art first; Hugging Face if none fits; no code-drawn primitive); (3) the judge and the bots read it (lianaDrops' 'far' still
lands the far bank from the liana; route.ts boards and rides as before); (4) a planted test: rideAcross.ts's ride-across RED on a tailed row
(beats 4 and 6 of 2-4) and GREEN on 2-1's plain rows; works for any stage, proven on 2-4 and a toy; no stage id in engine code;
(5) 2-4's beats 4 and 6 rows gain the tail; relist 2-4; castBots; lockall vs main (only 2-4 moves). 2-4 ships in release 1 ONLY with it.

## The bots' longest liana holds on the final rows (lianaWait.ts, seeds 1-4, every bot; the bar moves to the judge: RIVER-CLOCK, the lead's (b))
- Normal: relay lianas x20992 13.3 s (child s1), x21592 11.0 s (adult s1), x22582 10.0 s (expert s4), x24062 11.1 s (expert s4),
  x24662 14.1 s (middle s2); beat 1 x3105 7.6 s (kid s3); beat 6's two lianas under 7.6 s on every run (were 14.0-14.1 s, the cap).
- Easy: x23522 14.2 s and x28602 14.1 s (kid s4), beat 3 x8213 9.0 s (child s1), relay x21352 8.7 s (child s1), beat 6 x16180 8.3 s
  (kid s1), x22922 5.9 s (kid s3). The judge (any glow-lit moment) reads every 2-4 liana under one swing on Easy: the lead's guard holds.

## Open (named)
- 2c: beats 4 and 6 skippable on a log alone, until ENG-24e (above).
- The bots' liana holds above (named, not tuned; RIVER-CLOCK).

## EXACT NEXT STEP (if this session stops)
1. Relist 2-4 (`npx tsx tools/engine/seedlist.ts 2-4 --count 100`) on t-build-24c's head; commit seeds-2-4.ts + provenIndex.
2. `ROWS= npx tsx reference/qa-reports/BUILD-24c/lianaWait.ts normal 1-4` and `easy 1-4`: paste per-liana worst holds here.
3. Apply ENG-285b's glow fix; letGoCue.test green.
4. castBots 2-4 1-40 x5 bots x both; tierBots recal (reference/qa-reports/BUILD-24/recal.ts) + recommit calibration-main.jsonl.
5. The CLAUDE.md list once on the final head + funcheck, tipwalk, registrycheck, coveragecheck, every list --check, lockall vs main
   (main's lock: regenerate on origin/main with --out; --intended 2-4), meter 2-4 N/E.
6. Stills/clips on the final head (stills24.mjs / clip24.mjs; shoot.mjs FREEZE for pairs).

# BUILD-24d (packet reference/packets/2026-11-19/BUILD-24d.md): finish 2-4 from BUILD-24c's EXACT NEXT STEP; section written 3:52 PM ET 11-19
Branch t-build-24c (from 249f6da4). Final hash: see EXACT NEXT STEP (gates unrun) (code: src/ changed only in d8d70797, every gate below on that src).
Method used: reference/methods/level.md (rules 6, 8, 11-15, 18, 22), stage-fix.md, gates.md; the stills tools of BUILD-24/24c/ENG-24c.

## EXACT NEXT STEP for BUILD-24e (BUILD-24d STOPPED at 3:52 PM ET 11-19 on the lead's context plan: real ~350k+, box 400k)
Head: t-build-24c, the commit that adds this note. src/ changed ONLY in d8d70797 (stagePreload.ts + safeRiverPreload.test.ts); later commits
are stills, logs, the handoff and this report. Items 1, 2, 3 DONE and pushed (below). Nothing of mine is left running: the full suite
(started 3:43 PM) and lockall --check (started 3:50 PM) were RUNNING at the stop and die with this session = UNRUN (D59).
1. GATES on the final head (logs to reference/qa-reports/BUILD-24d/gates/; the CLAUDE.md list, every item, once):
   - PASS already on src d8d70797: tsc (gates/tsc.txt), knowncheck, generalitycheck, roadmapcheck (unshallowed), artcheck (gates/quick.txt),
     BASE_PATH vite build + chunkcheck (gates/build.txt), safeRiverPreload.test 2/2 + stageSheets.test (10/10 together).
   - UNRUN: the full suite (the CLAUDE.md line); lockall: main's lock is NOT committed (it was in this session's scratch): regenerate on
     origin/main 6e7b85f8 (`git worktree add`, symlink node_modules, `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-main.json`,
     ~10 min), then `--layouts 16 --intended 2-4 --check lock-main.json` here (expect 2-4 only, or stages the merged lines moved: list them
     for the lead before judging; my change is preload only and moves no layout). Then gates/chain.sh (one script, in the BACKGROUND):
     the engine tool tests, tierBots.test, castBots 2-4 1-40 x5 bots x both (--par 3), kbdcheck, seedlist 1-1 and 2-4 --check,
     registrycheck --lists, tipwalk --layouts 4, coveragecheck, funcheck (name every 2-4 flag; BUILD-24c had none), the meter (score.ts
     --stages 2-4 --seeds 1-4 --settings normal,easy: name vs DIFFICULTY.md, don't tune), clipcheck, drawcheck. buildcheck LAST and ALONE.
   - No relist needed: no layout moved (lockall confirms). castBots should match BUILD-24c's castbots-2-4-c.txt (no sim change).
2. Then append the gate table (gate, head, result) and the castBots rows to this section; send the final hash to the lead.

## The lead's quality items, before -> after
1. **Normal's 'Flick up to hop up or over.' on 6 of 7 frames: a STILL-TOOL fault, not the game's** (lead accepted 3:39 PM ET).
   - Source: stills24.mjs tapped the screen's MIDDLE to clear "cards", which clears only the stage-start goal card (dataset.hudCard),
     never Dot's line (DotGuide.tsx: a tap must land ON the card, .dg-bub, onCard -> dotGuide.ts tap); and it never hopped. The hop line is
     a move tip: it stays until he hops, then its phone reading time (5 s, readMs; R-165.175), or until tapped. So the one unread move tip
     sat over every spot it teleported to.
   - The engine's pick is right: lessonProbe.ts (the real engine, lessonTick and camera put back) picks 'gap' ONCE, at x880-1060, before a
     50 px boulder (x1182, on the bank) he must hop. BUILD-24c's proposed lessons.ts change ("skip a gap whose next platform is the same
     floor") would have taken the hop lesson off a real hop: NOT made. (Its pick reads the boulder's edge to the next ground, x1298->1400,
     as a "gap": right moment, odd reason; it touches every stage's first boulder the same way; not changed, named.)
   - On the real page (window.__dotGuide): the hop counts (jumps 1->2), the card yields while he is in the air and comes back for the rest
     of its reading time, then goes (x~2156 walking); the stage's teach line then comes. It does NOT sit over the stage.
   - After: stills24d.mjs (walks the start in real time, hops when stopped against a step or rock, taps Dot's card ON the card): sheet
     stills/item1-normal-up-hop-card-sequence.jpg (card up at the boulder; gone after the hop; the teach; 'Flick up when a log drifts
     close.' (+1); 'Flick up into the vine to grab it.'). Per-beat cards, both settings, both ways: stills/beats2/cards-*-run.log.
2. **Easy SIDEWAYS dark-teal slab: the safe river's shallow strip was never preloaded; its first frame drew the DEEP sheet.** Fixed at the
   source. riverArt drawRiverWater draws a safe river as ART-W2's shallow strip only once that strip has loaded (safeRiverArtReady), and
   the strip was asked for only on a safe river's first draw: that frame fell back to the deep sheet (flat dark teal to the screen's foot,
   the look of a river that costs a life). stagePreload.ts 'w2-props' loaded the river sheet but not the strip. Now it loads both with
   the stage. Planted: src/game/safeRiverPreload.test.ts (RED without the fix: 'the shallow safe-river strip is asked for with the stage').
   - Before/after (firstFrame.mjs: the first frame after he is placed by a river, sideways, Easy): item2-2-4-easy-side-x20900-first-frame-
     before-after.jpg (before: slab; after: bed and stones), item2-2-4-easy-side-before-frames-1-2-4-30.jpg (frame 1 slab, frame 2 bed).
   - LIVE (main 6e7b85f8, a second dev server): 2-1 and 2-2 show the same slab on their first safe river's first frame:
     item2-LIVE-main-2-1-2-2-top-vs-branch-bottom-first-frame-side-easy.jpg (top main, bottom this branch). Stages touched: every stage
     whose sheets include 'w2-props' = every stage that draws a river (stageManifest: st.rivers -> w2-props): World 2's river stages and
     any other stage with a river; Easy everywhere, Normal at its safe (teaching) rivers. No layout moves (preload only).
   - Not a sideways rule: BUILD-24c's sheet caught the first frame after a teleport. On the walked stills every Easy river shows its bed
     upright and sideways (beats2/*easy*-sideways.jpg).
3. **Full-size stills and the clip** (all on the real page, layout 1; judged as a player, whole screen):
   - Per beat at each river's own edge, N and E, upright and sideways, Dot's cards shot then tapped: stills/beats2/ (65 files): start hop
     card, teach ('Knock? Log coming! Let go when it's under you.'), drop x2880, catch (N x9970 / E x10110), no-land (N x15390 / E x15750),
     relay (N x20640 / E x21020), raft (N x27750 / E x28370), exit x29500.
   - Glow lit at the press, then the let-go landing on a log (ENG-24c's recGlow + shoot on this tree): stills/full/2-4-{N,E}-{up,side}-1-
     glow-lit-at-press.jpg, -2-letgo-landing-on-log.jpg, N -3-on-log.jpg; clips stills/full/2-4-N-{up,side}-glow-clip.mp4.
   - The raft, painted, Pokey on its deck (the middle bot's real run, recRaft): stills/full/2-4-N-{up,side}-6-on-the-painted-raft.jpg,
     -6-landing-on-raft.jpg, clip 2-4-N-up-raft-clip.mp4.
   - BUILD-24c's swing-to-log clips judged frame by frame (R-165.271): c24-r0 (beat 1): on the liana src frames 180-190, let-go ~192, a
     clean arc, down on the log at the far bank ~216, hop up the bank 220-235: no snap, no hitch. c24-r3 (beat 4, log-to-liana): rides the
     log from ~50, the log half sunk in the light water (full-size frame 90: his feet on it), the catch ~130, swing, let-go ~190, bank
     ~220. c24-r4 (beat 6 + relay): liana, let-go, the rest bank, the logs (frames ~280-400: the bank-to-log stretch ENG-24e takes),
     lianas, bank. Nothing wonky seen at 1-in-4 frames; the arcs are smooth both ways.
## Polish check (the whole screen, D79; each with its still)
- Hop card (item1-normal-up-hop-card-sequence.jpg): card at the boulder, gone after the hop, then each beat's own card. Pass.
- Safe rivers, both settings, both ways (beats2/*easy*-sideways.jpg, item2-*): bed, stones and soil on every river from frame 1. Pass.
- Deep rivers on Normal (beats2 x15390, x20640): the deep sheet, as the lead's ruling 1 wants (a river that costs a life). Pass.
- Glow (full/2-4-N-up-1-glow-lit-at-press.jpg, crop checked): the warm disc on his grip, the landing on a log. Pass.
- Raft (full/2-4-N-{up,side}-6-on-the-painted-raft.jpg): World 2's painted lashed raft, his feet on the deck. Pass.
- ROUGH, named (not mine to change): on a SAFE river the log sits half sunk under drawSafeRiverOver's light band and reads faint on a
  phone, close to "standing on pale water" (c24-r3 frame 90, beats2 catch). A look call for Content/the lead (touches 2-1, 2-2 too).
- Named: on Easy no bot boards the raft (recRaft: middle and child 0 frames; the rafts are laid, x28230-28774): the Easy raft is
  skippable; no Easy raft-ride still from a run (BUILD-24c's placed raft-ride-2-4-N-E-up-side.jpg shows it drawn).
- Named: the catch beat's liana is off an upright screen from the bank (x9970/x10110); its line comes 800 px before (rule 6) and the
  question is decided on the log, where it is in view (c24-r3). Judge for rule 8.
- Tool artifact, not the game: "This way, Pokey! Try over here." on Easy at x27760 (beats run 1) = the stuck watch reading the tool's
  teleports as turns back; gone when spots are at the river's edge.

4. Gates: see EXACT NEXT STEP (partly run). Commits: ddc44b2d (item 1 tool + sheet), d8d70797 (item 2 fix + test), 640a34b0 (live 2-1/2-2), f15b6111 (stills), 108a9039 (handoff).
5. ENG-24e (the bank-to-log skip on beats 4 and 6): NOT fixed here (the packet). BUILD-24c's packet text, carried verbatim:
   (verbatim in the BUILD-24c section above, "### ENG-24e (packet text for Friday's fresh engine member)"; unchanged.)
## Learned (proposed level.md rules)
(a) A still tool clears Dot's line by a tap ON her card (.dg-bub) and does the move a move tip asks for; tapping the screen's middle
    clears only the goal card, and a teleport-only tool shows one unread tip over every spot (stills24d.mjs). Check: the cards log per spot.
(b) Every picture a stage draws is loaded with the stage (stagePreload), never only on first draw: a first-draw fallback can show the
    WRONG thing (a safe river drawn deep). Check: a first-frame still after a place (firstFrame.mjs) and a preload test per new look.
(c) Shoot each beat at its own river's edge for EACH setting (Easy's rivers sit further right than Normal's): spots from the built
    stage's rivers, not one list for both.
Lessons applied: D19 (the still tool's tap did not call what a thumb calls), D30 (times from `date`), D57/D87 (notifications at every push;
long runs in the background), D59 (unrun gates named), D64/D76 (stopped on the lead's real figure), D69 (clips judged frame by frame),
D79 (whole-screen pass), D81/D86 (the full list named; drawcheck in the chain).
Miss to log: d8d70797's Claude-Session line carries the lead's session link, not mine (pushed; not rewritten).

# BUILD-24e (packet reference/packets/2026-11-19/BUILD-24e.md): 2-4's gates on t-build-24c's final head, the rule-8 still; section written 6:03 PM ET 11-19 (by date in the same command)
No src/, tools/ or stage data changed (git diff c2f7a34a..HEAD -- src tools .github package.json: empty; src last changed d8d70797). Every
head named below carries d8d70797's code; later commits are reference/ only. Logs: reference/qa-reports/BUILD-24e/gates/.
## Rule 8 (level.md): 2-4 L1 Normal, the catch beat, UPRIGHT 412x915, real page (rule8still.mjs; stills/, rule8-measures.json)
- FROM THE LOG (where he decides): YES, the whole liana (pivot and tip) is on screen. Press window, one fresh page per frame (catchsearch.mjs,
  flick leaning right): opens at ride frame 68 (Pokey x10279), still open at 74. k60 (x10258, the liana swinging back to him): tip 58 px from
  his head, 260 px head to the right edge; k69 (the press): tip 40 px, pivot at css x296 of 412.
- FROM THE BANK (x9985, as the log slides out): NO, the liana is off the right edge (pivot css x567, tip x514 of 412); tip 370 px from his head,
  268 px head to the edge. The lead's ruling (4:32 PM ET): rule 8 PASSES; from the bank the question is the log, which is in view.
- Sheet: stills/rule8-sheet-bank-k60-k69.jpg. Dot's lines were marked shown and cleared for the shots. The faint "glass" logs in these
  frames are ENG-24e's item 2b (lead), not this job.
## Gate table (all on d8d70797's code; head = the commit the log names at its start)
| Gate | Head | Result | Log |
|---|---|---|---|
| tsc | 42aef3d9 | PASS | tsc.txt |
| full suite, 3 shards (CLAUDE.md glob) | 98261a27..57358137 | PASS 3863 pass, 0 fail, 2 TODO (w4 boulder fixer, on main 6e7b85f8 unchanged) | suite-1/2/3.txt |
| BASE_PATH vite build + chunkcheck | 42aef3d9 | PASS | build.txt |
| artcheck / knowncheck / generalitycheck / roadmapcheck (unshallowed) | 42aef3d9 | PASS x4 | artcheck, knowncheck, generality, roadmapcheck.txt |
| lockall --intended 2-4 vs main 6e7b85f8 (lock regenerated 4:23-4:32 PM) | 8c80eab3 | exit 1: 85/102; 2-4 + 16 others, ATTRIBUTED below | lockall.txt |
| lockall vs t-int-12 ce4ad461 / vs ENG-285b c255ae4d | 90e12728 | 87/102 / 99/102 | lockall-vs-int12, lockall-vs-eng285b.txt |
| engine tool tests (CLAUDE.md's 4 files) | 42aef3d9 | PASS | toolTests.txt |
| gates.yml rolled job's 25 tool-test files | 69341ec2 | 231/233 pass, 1 FAIL riverRide.test bankUp plant, 1 TODO (chaseBots child; on main 6e7b85f8): INHERITED, not 2-4 | toolTestsCI.txt |
| tierBots.test | 42aef3d9 | PASS | tierBots.txt |
| castBots 2-4 1-40 x5 bots x both, --par 3 | 42aef3d9 | PASS, row for row = BUILD-24c's castbots-2-4-c.txt (below) | castBots.txt |
| kbdcheck | 42aef3d9 | PASS (183 s) | kbdcheck.txt |
| seedlist 1-1 / 2-4 --check | 42aef3d9 | PASS 161/161 / 100/100 | seedlist11, seedlist24.txt |
| seedlist --check, every other list (1-2..1-9, 2-1, 2-2) | 69341ec2 | 9 PASS; 2-1 FAIL seeds 86, 100 quiet 4.1 s > 4 s: INHERITED, not 2-4 | seedlistsAll.txt |
| registrycheck (plain; --lists only prints the 12 ids) | 69341ec2 | PASS, 12 stages | registryPlain, registry.txt |
| tipwalk --layouts 4 | 69341ec2 | PASS | tipwalk.txt |
| coveragecheck | 69341ec2 | PASS (13 stages incl. 2-4, 5 known gaps) | coverage.txt |
| funcheck (advisory, not CI) | 69341ec2 | exit 1: 30 worse/new, ALL World 1; 2-4 flags: none (funcheck judges World 1 only, funcheck.ts:4) | funcheck-full.txt |
| meter score.ts --stages 1-1,2-4 --seeds 1-4 | 53870a69 | 2-4 Normal 4 (3.9-4.4), Easy 3 (2.9-3.1); vs DIFFICULTY.md §4 below | meter-with-anchor.txt |
| clipcheck | 69341ec2 | PASS (83 known, 340 s) | clipcheck.txt |
| drawcheck | 69341ec2 | PASS (667 s) | drawcheck.txt |
| paintcheck (t-gate-292's tool, scratch merge of this head; src diff empty) | 69341ec2 | PASS, 5,502 builds, 0 new; 2-4 breaches none | paintcheck.txt |
| timecheck (t-time-168b's tool) | 69341ec2 | FAIL 1: VAR-1/REPORT.md:4 "3:50 PM ET" vs its commit 7a8bc47d 3:45 PM: INHERITED (INT-12), not 2-4; BUILD-24e's own commits: see timecheck-own.txt (range c2f7a34a..the report commit) | timecheck.txt |
| buildcheck, LAST and ALONE | 207cf3d4 | PASS: 1-1 Normal p95 90 ms, Easy p95 52 ms (budget 150 at CPU x4) | buildcheck.txt |
- lockall attribution (lead accepted 5:04 PM ET): vs ENG-285b only 2-4 + 2-1/2-2 proto.hints move: KEEPER-24's world-wide World 2 water line
  (BUILD-24 988bbae2, w2.ts W2_TIPS.water; text only, the story keeper's call). The other 12 vs t-int-12 are ENG-285's judge model (1-6, 1-8,
  3-8, 4-4, 6-1, 6-3, 6-6, 6-7, 7-5, 7-9, 8-3, 8-5); vs main add INT-12's 1-7, 1-9. BUILD-24d's preload moves no stage.
- INHERITED reds (the lead, 5:59 PM ET): cleared on t-int-13 by INT-13b (the 2-1 relist) and by ENG-285c's restatement of riverRide.test's
  bankUp plant (b2df1a47, final b84163d6); t-build-24c carries ENG-285b's c255ae4d. timecheck's VAR-1 stamp: for INT-13 to clear.
- Meter vs DIFFICULTY.md §4 (named, not tuned): 2-4's Normal target is 10(2-1) + T[3] = 13.5, World 2's band 9..21: it reads 4, 9.5 under
  and below the band (§4 already: World 2's median stage 9.8 short). Easy/Normal 3/4 = 0.75, over the 0.6 cap. The 2-4-only command in
  BUILD-24d's step printed NaN: SCALE is set from 1-1 Normal (score.ts:1126), so the meter needs 1-1 in --stages.
## castBots rows vs BUILD-24c (castbots-2-4-c.txt): identical on every row
kid N 29/40 (11 shrine rescues, the same 11 seeds), kid E 39/40 (seed 4), adult N/E 40/40, child N/E 40/40, middle N/E 40/40, expert N 40/40;
medians 194.7/172.3, 171.9/149.2, 350.7/260.6, 214.8/187, 206.5 s; lives (water) 295, 121, 161, 114, 106: all equal to BUILD-24c's.
## Pushback / Unresolved
- BUILD-24d's step named `registrycheck --lists` as the list check: it only prints the ids; I ran every list's --check (D86).
- Unresolved: the 2-1 list, riverRide.test and the VAR-1 stamp are red on THIS head (inherited; owned by INT-13b/ENG-285c per the lead).
  The first suite run hit my 30-min background limit (0 not ok) and was re-run whole with a 2 h limit.
## Method update (gates.md / methods)
- The meter command in a packet carries 1-1 (`--stages 1-1,<stage>`), or score.ts fails loudly on a NaN SCALE (proposed: exit 2).
- Long background runs set timeout 7200000; a member's own 30-min default stops the suite (it did here).
- The rule-8 frame is found by search, not by eye: one fresh page per candidate press (engine restore leaks after a catch, catchsearch.mjs).
Lessons applied: D30, D57/D87, D59, D86 (every list, the full CI tool-test line), D88-style attribution before judging, D90 (EXACT NEXT
STEP only; logs to files; one cropped sheet), D91 (pipefail on every commit). Turnover note: no engine-core.md change (gates only).
