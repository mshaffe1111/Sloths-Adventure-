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

## 2c: a beat skipped by riding a log bank to bank (the lead's ruling 2:33 PM ET: (iii) today, (ii) tomorrow, never a 240 px wall)
Probe reference/qa-reports/BUILD-24c/rideAcross.ts (RealPlay, the game's own update; Pokey boards the first log at the near bank's lip,
stands, hops onto the far bank, the best of 6 hop timings; never touches a vine). Seeds 1-3, both settings:
- beat 4 (up-from-log, the log-to-vine catch): CROSSED 6/6 (its far bank z is level with the near bank: upFromLog bank('z','c',300)).
- beat 6 (no-land, the vine-to-log drops): CROSSED 6/6 (Normal at 100 px/s too).
- beats 1, 3, 8, 9 (bank-boarding is the design, 2-4.md:48 'the knock'): see the lines pasted below (RIDE-OTHERS).
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
