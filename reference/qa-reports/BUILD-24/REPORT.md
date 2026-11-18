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
