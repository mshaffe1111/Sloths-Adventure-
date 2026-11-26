# LAND-26: 2-6 back on release 4's line (release 5), beat A's soil block (R-165.451)

## EXACT NEXT STEP (session 5 LAND-26-e; branch t-land-26)
**STOPPED ON A RED (the lead's order: any other red, stop and hand over): the paint sweep part 1/3 FAILS on 2-7, 108 DEPTH STEP lines
(see the table). Needs the lead's ruling before any fix; head 1caf50a93 is NOT landed as passing.** Then: the gates still running in
"Session 5 gates" below, finished and recorded by box 5 (D138). Box 5 started them on frozen f738cc21d before its hand-over and
finishes and records only those (D138). If box 5's container is gone: frozen tree at f738cc21d (worktree --detach; link node_modules;
chattr -R +i src tools .github; chattr -i src/game/gen2/proven), each run_in_background with timeout 7200000, no shell '&':
(a) the CI tool line = gates.yml line 157 verbatim; (b) the suite with `--test-shard=i/3`, i = 1..3 (CLAUDE.md's file list);
(c) lockall: on a frozen c73cb9766 tree `lockall.ts --layouts 16 --out <scratch>/lock-base.json`, then on f738cc21d `lockall.ts --layouts
16 --check <scratch>/lock-base.json --intended 2-6` (2-7 must show no move); (d) `paintcheck.ts --stages 2-6`, then `--part 0/3`, `1/3`,
`2/3`; (e) `seedlist.ts 2-6 --check`, `registrycheck.ts`, `node tools/timecheck.mjs`, `teachFirstScan.ts --check`, `npx tsx --test
tools/inspect/tierBots.test.ts` (9/9), `node tools/perf/drawcheck.mjs`, `node tools/perf/clipcheck.mjs`. castBots is DONE (no re-run:
code unchanged). Then land on t-land-26 (no force) and send the lead the hash and one line per gate.
Final head = **f738cc21d** (code = cb69a104e + tools/inspect/wheelStepOff.test.ts + its CI line entry; every gate below runs on a
chattr-frozen tree at f738cc21d; lockall's base is a frozen tree at release 4's final head c73cb9766). Done in session 5:
- **(1) The 14 untraced kid rows: ALL TRACED, one cause.** tools/divTrace.mts.txt runs each row with boardWatch+stepOff OFF and ON and
  finds the FIRST frame whose pad differs (exact: before it the runs are frame for frame equal). All 14 (kid N 3 12 13 16 21 22 24 30 40,
  kid E 8 23 30 32 33): **the stepOff settle press** (wheelRide's `off * w.way < -16` term) at a frame where he is in a bucket, behind its
  middle by 16-52 px, inside his stand distance, and STILL SLIDING (|vx| 73-285 px/s): with it off wheelRide brakes (a press against his
  motion), with it on it presses toward the middle. Session 4's tracer only counted a settle with |vx| < 5, so it missed these. Both runs
  of all 14 equal their recorded rows (cast-7f9abaa55 and cast-stepOff-x3: end, time, rescues; 14/14). data/rule28/firstCause-14-div-cb69a104e.txt.
  **Rule 28 on stepOff: 258/258 moved rows traced** (183 boardWatch wait, 45 stepOff refuse, 16+14 = 30 stepOff settle).
- **(2) The stepOff toy: tools/inspect/wheelStepOff.test.ts, 2/2 GREEN on frozen f738cc21d, on the CI tool line (gates.yml:157).**
  Way +1 = 2-6 adult Easy 12 (the top wheel): stepOff off: rescued at t 127.3 (last bucket #49 b1, way +1); on: 4 refusals (way +1),
  the shrine, no rescue (PLANTED off = RED). **Way -1: no real case exists, so none is planted** (as box 3 said for boardWatch):
  (a) on 2-6, the rescues with stepOff off (boardWatch on) are adult E 12, 33, 39 and middle E 37 on way +1 wheels, and adult E 13
  on way -1 (#32 b2), where stepOff makes 0 refusals: it goes by a timing shift, not the skill (data/stepOff-rescueWhere-cb69a104e.txt);
  (b) the toys (every toy wheel turns left; 7 tier/settings x 2 variants x 5 rows = 70 runs, stepOff on vs off): 65 equal, 5 differ in
  time only (at most 0.3 s), no scramble or pond moved (data/stepOff-toySearch-cb69a104e.txt).
- **(3) Gates ONCE on f738cc21d: see the table "Session 5 gates" below.**
- **R-165.480 (the lead's number): KNOWN bounce-bot hole.** middle Easy 37's World 2 bounce flail (rescued at t 145.0, x 609 y 1013, with
  stepOff off; gone with it on) is a timing shift into a bounce-bot hole, not a wheel (data/stepOff-me37-*.txt). Any timing change can
  bring it back; it is a bounce-bot gap, owner the lead's list.
- **KID_RUNS_59** (src/game/firstTimerBot.test.ts:177): inherited and held for Matt (R-165.473/.477), not ours.
- **(4) For Friday's integration: the 2-6 rows that stop at a stand by water** (castBots 'water ahead' stuck lines on f738cc21d):
  234/360 rows, 384 lines; by x (100 px bins): x~1200 105, ~300 45, ~1300 41, ~1100 40, ~1000 37, ~400 35, ~700 29, ~900 20, ~800 12,
  ~1400 11, ~600 8, ~200 1; each bin's rows by name in data/stand-rows-f738cc21d.txt. (castBots' stuck lines carry x only, not the
  piece, so a pad wait is not told apart from a stand wait there: ENG-THUMB's reader takes the rows from that file.)

### Session 5 gates (frozen f738cc21d; one run each)
| gate | result |
|---|---|
| tsc | PASS (0) |
| wheelStepOff.test.ts | 2/2 PASS (ON clean, PLANTED off RED) |
| castBots --proven 2-6 (seeds 1-40, both, every bot) | PASS: 360/360 the shrine; proven 39 (= the 7f9abaa55 set; 36 out, kid Easy 36 rescued, R-165.479 KNOWN); none under the floor (min 105.7 s); **equal to box 4's stepOff rows on all 360** (cast-stepOff-x3); vs 7f9abaa55: 257 rows moved in end/time/rescues + kid Easy 1 in stuck lines only = box 4's 258, all traced above. data/rule28/cast-final-f738cc21d.jsonl |
| the CI tool line (gates.yml:157) | f738cc21d PASS 432/433, 0 fail, 1 todo (chase bots, known); re-run on 1caf50a93: see below |
| the suite, 3 shards | f738cc21d shard 1 PASS 1418/1420 (2 todo); shards 2-3 stopped there and run on 1caf50a93 (the list changed) |
| lockall --layouts 16, base c73cb9766, --intended 2-6 | f738cc21d PASS: 101/102 stages unchanged, only 2-6 (intended); **2-7 untouched**; 1caf50a93: PASS (exit 0) |
| seedlist 2-6 --check | **f738cc21d FAIL**: seeds 70 77 78 (both settings) replay off their search; ALSO FAILS on 175ebe726 (before the W fix) and on t-build-26's 40a9c4bd2: inherited from t-build-26 (the list last written at BUILD-26 step 1, fab3a8a20). Rebuilt (the lead's bounded exception) = **1caf50a93**: PASS (100 seeds, both settings). Entries 1-40 same seeds and plans (castBots unaffected); plans re-packed 51 70 77 78; 97 in, 101 out; the reported quiet numbers moved up to 0.3 s; provenIndex.ts's version with it (52496f5f -> 1ed9df17, the check demands it). data/seedlist-*.txt |
| registrycheck | f738cc21d PASS |
| timecheck | f738cc21d PASS |
| paintcheck --stages 2-6 | f738cc21d PASS; 1caf50a93: running |
| **paintcheck sweep (depthSteps)** | part 0/3 PASS (34 stages, 2050 builds); **part 1/3 FAIL: 108 NEW lines, ALL 2-7, ALL 'DEPTH STEP'** (71 Normal, 37 Easy, 61 seed-settings; the soil's darkening starts 49-61 px apart either side of an x under a bank, bar 48; the banks near x 3400-4100 and 15964-17640). 2-7's layout is unchanged vs release 4 (lockall), so this is the soil paint on 2-7's banks against the depth-step gate this branch added (session 2, R-165.451), not a lay move: whether it is the gate's reach or a real straight-sided block on 2-7 is NOT diagnosed (the lead's order: any other red, stop). data/paintcheck-part1of3-f738cc21d.txt. Part 2/3: running at this hand-over |
| teachFirstScan, tierBots, drawcheck, clipcheck | moved to 1caf50a93 (they read the lists); running at this hand-over |
| CI tool line + suite 3 shards on 1caf50a93 | running at this hand-over |

## EXACT NEXT STEP (session 4 LAND-26-d hand-over, 4:35 PM ET Thu 11-26; branch t-land-26)
Code head = **cb69a104e** (R-165.478 SKILLS.stepOff; the commit before this REPORT commit). The lead's numbers: R-165.478 the rideWheel
board judge (boardWatch) AND its step-off (stepOff); R-165.479 the W residual (KNOWN, a lay packet after release 5). Done in session 4:
- **boardWatch planted each way: tools/inspect/wheelBoard.test.ts, 4/4 GREEN on frozen 8cdd02803, on the CI tool line (gates.yml:157).**
  Way -1 = the 'great' toy child Normal v1 (off: slides to 9 px of the left lip, blind hop, pond; on: waits, in b1, pd0;
  data/boardWatch-great-*.txt); way +1 = 2-6 seed 1 child Normal v2 top wheel (off 2 scrambles, on 0). Toy search rows:
  data/boardWatch-search-toys-362301c83.txt; the 2-6 row seed 1 on/off: data/boardWatch-search-row26-seed1-362301c83.txt.
- **Rule 28 on boardWatch alone (8cdd02803) FAILED: 190/360 castBots rows moved vs 7f9abaa55, 5 NEW RESCUES (adult E 12 13 33 39,
  middle E 37), proven 39 -> 34** (data/rule28/diff-7f9abaa55-vs-8cdd02803.txt). Isolation: 8cdd02803 with boardWatch OFF = 7f9abaa55
  on all 360 rows (data/rule28/cast-8cdd02803-boardWatchOff.jsonl). Cause (traced): boardWatch boards at new moments, some at a
  bucket's trailing end; the step-off window was flown from the bucket's middle and from there falls short (adult E 12 top wheel: off -37
  at past -0.62 where the off run made street #47 from off +36: data/stepOff-ae12-*.txt).
- **The lead ruled A** (fix the step-off where the cause is; the 5 rescues must GO; proven back to 39+; a toy each way; every moved row
  traced; if rows cannot be traced by the 7:30 word, bring the list, do not widen). Built as **SKILLS.stepOff** (firsttimer.ts
  stepOffLands: in the open window he goes only when his OWN hop from where he stands, every thumb lag and hold, the bucket's carry kept
  (RIDE.keep x 1), lands on the street (hopLandsOn, margin 0); else he waits in the window or rides on; a no-let-go thumb behind the
  middle by > 16 px walks up to it while settling). The plain |off| <= 16 band was tried first and fixed only 1/5 (the adult has no
  holdQ, its band is 22 + edgeAim); a directional band fixed 2/5 (data in this session's messages to the lead).
- **castBots --proven 2-6 on the stepOff code (scratch tree x3 = cb69a104e with the switch named boardWatch; same behaviour with both
  on): all 360 rows reach the shrine, proven = 39 (the pre head's exact set, 36 out as before), NO new failure; 258 rows moved in time
  only (median +3.6 s, p10 -3.8, p90 +14, min -25.8, max +31.2; none under the floor).** data/rule28/cast-stepOff-x3.jsonl,
  diff-7f9abaa55-vs-stepOff.txt, moved-stepOff.txt. wheelBoard + wheelRide + rowWheels tests 11/11 on x3.
The next session, in this order:
1. ReadNotifications. `git fetch origin t-land-26 && git checkout -B t-land-26 origin/t-land-26`; npm ci --legacy-peer-deps
   (run_in_background); frozen tree at the head (worktree --detach; link node_modules; chattr -R +i src tools; chattr -i
   src/game/gen2/proven).
2. **Trace every moved row (rule 28, the lead's order):** tools/firstCause.mts.txt (REPO=<frozen> FILE=data/rule28/moved-stepOff.txt
   LO= HI= npx tsx it; 3 shards of 86, run_in_background each, ~30 min) prints per row the FIRST frame where boardWatch or stepOff acts
   (before it the run IS the run with both off). Every row must name one; a 'NONE' row is untraced: bring it to the lead. **Session 4's
   run finished right after the hand-over push (frozen cb69a104e; data/rule28/firstCause-cb69a104e.txt): 244/258 traced (183 boardWatch
   wait, 45 stepOff refuse, 16 stepOff settle); all 258 runs equal their castBots rows (end, time, rescues). 14 'NONE' rows remain
   (grep NONE): likely a settle press or brake the tracer's tight test (|vx| < 5, toward the way) misses; trace those 14 only.**
3. **The stepOff toy each way:** tools/wheelStepOff.test.ts.DRAFT.txt is a draft. Way +1 = castRun adult Easy 2-6 seed 12 (stepOff off:
   rescued, on: none; measured on c1/x3). **Its way -1 case (seed 13) is WRONG**: in seed 13 the step-off makes street #29 (with a
   double) and he bounces back into the wheel (data/stepOff-ae13-c1-*.txt), not a short step-off. Find a real way -1 case:
   tools/toysStep.mts.txt (stepOff on/off over the toys, every toy wheel turns left; boardWatch on) and, if none, the adult/kid rows on
   2-6's left wheels (teach, the left edge). If no left case exists, say so with the rows (as box 3 said for boardWatch). Then put the
   test at tools/inspect/wheelStepOff.test.ts and ADD it to the CI tool line (gates.yml:157).
4. middle Easy 37 (gone on stepOff) was a World 2 bounce flail, not a wheel (data/stepOff-me37-*.txt): a timing shift into a bounce-bot
   hole. Name it to the lead for the list (it can come back on any timing change).
5. The gates ONCE on the final head (the brief's list): the CI tool line; the suite in 3 shards (run_in_background, timeout 7200000);
   paintcheck 2-6 + the sweep (depthSteps); lockall (2-6's named moves only; 2-7 untouched: show it); castBots --proven 2-6 (seeds 1-40,
   both; rediff vs data/rule28/cast-7f9abaa55.jsonl); seedlist 2-6 --check (seed 36: still kid Easy rescued, out on both heads);
   registrycheck; drawcheck (after the stalk); clipcheck; tierBots 9/9; timecheck; teachFirstScan. KID_RUNS_59 inherited (R-165.473/.477,
   held for Matt). Then the 2-6 rows near a pad or a stand for Friday's integration; land on t-land-26 (no force); hash + one line a
   gate to the lead. Lead's times: landed by 8:00 PM ET, word at 7:30 if it slips, HARD STOP 9:00 PM ET.
Lessons this session: D115 (frozen trees for every run), D141 (the CI line on every candidate), D138 (hand-over ends new work). Own miss:
one shell '&' in a background command (the brief forbids it); caught, stopped and re-run as two background runs before any result.

## Session 3's EXACT NEXT STEP (kept for history; session 3 LAND-26-c hand-over, 4:12 PM ET Thu 11-26; branch t-land-26)
The lead's rulings (session 3's brief): W stands (R-165.471; the residual, a thin-piece pocket with no walls, kid Easy 36 walks off the floor's far
end: **R-165.479 (the lead's number) KNOWN, owner a lay packet after release 5** (pitSteps assumes earth walls under thin pieces;
every world)). Code head = the commit before this REPORT commit. Done in session 3 (all pushed):
- **R-165.478 (the lead's number) rideWheel board judge** (tools/inspect/firsttimer.ts wheelRide jetty branch + hopBoards; src/game/gen2/wheelFlights.ts
  `BOARD_BACK = 30`, board() uses it, data unchanged; switch SKILLS.boardWatch). Trace: data/rideWheel-top-child-normal-v2-7f9abaa55.txt (child
  stops 17 px short of the lip at t 130.10, hops at 130.17 without looking, in b0 at off +67 at vx 285 at 130.70, off its end; 2 scrambles).
  Only when stopped nearer the lip than BOARD_BACK he hops when his own hop lands inside a bucket (every lag/hold; engine.ts onFloor's catch);
  waits up to one bucket period. Frozen tree 27196d517: rowWheels.test + wheelRide.test + wheelFlights.test 7/7 GREEN; 2-6 child N v2 top sc 2->0.
- **R-165.474 stalk** (src/game/terrain.ts stalkFoot + renderWorldObjects' allPlatforms; engine.ts passes this.platforms): data/stalkfix/ 2x
  upright before|after, 2-6 (beat 10's cap x741), 9-2 (x3506, x1804), 10-4 (x2313, x2017): the line is gone in every after frame. Sent to the lead.
The next session, in this order:
1. ReadNotifications (the lead's word on R-165.478/479 and the stills). `git fetch origin t-land-26 && git checkout -B t-land-26 origin/t-land-26`;
   npm ci --legacy-peer-deps (run_in_background). Frozen tree per run (worktree --detach; link node_modules; chattr -R +i src tools; chattr -i
   src/game/gen2/proven).
2. The planted toy EACH WAY for boardWatch (the lead's ask): tools/boardWatchSearch.mts.txt (REPO=<frozen tree> npx tsx it; ~10 min,
   run_in_background) lists toy runs (every toy wheel turns LEFT) where boardWatch on/off differ; partial list in data/boardWatch-search-partial-b1aa9639a.txt
   (teach middle N v2, middle E v2 differ only in seconds). Need: a way -1 case with off = a scramble, on = none, and way +1 = 2-6's row child N v2
   seed 1 top wheel (off 2 scrambles, on 0). Write tools/inspect/wheelBoard.test.ts (GREEN on, PLANTED off RED, both ways) and ADD it to the CI
   tool line (.github/workflows/gates.yml line 157; ciTests.test.ts fails otherwise). If no way -1 case exists on the toys, a toy row turning
   right is not available: say so to the lead with the search rows, do not invent one.
3. Rule 28: castBots --proven 2-6 (seeds 1-40, both settings) on the final head vs data/cast-*.txt (session 2's W rows): every moved row traced
   (boardWatch moves only runs that stop < 30 px from a jetty lip) or the change narrowed.
4. Packet step 3 gates ONCE on the final head (session 3's brief): the CI tool line (EVERY candidate, D141) and the suite in 3 shards
   (run_in_background, timeout 7200000); paintcheck 2-6 + the sweep (depthSteps); lockall (2-6's named moves only; 2-7 untouched: show it);
   castBots --proven 2-6; seedlist 2-6 --check (decides seed 36); registrycheck; drawcheck (after the stalk); clipcheck; tierBots 9/9;
   timecheck; teachFirstScan. Inherited red, not ours: firstTimerBot.test.ts:177 KID_RUNS_59 (R-165.473). Then the 2-6 rows near a pad or a
   stand (ENG-THUMB's family) for Friday's integration.
5. Land on t-land-26 (no force); hash + one line per gate to the lead. Never merge to main or a release branch. Lead's times: landed by 8:00 PM
   ET, word at 7:30 if it slips, HARD STOP 9:00 PM ET.

## Session 2's EXACT NEXT STEP (kept for history; session 2 hand-over, 3:15 PM ET Thu 11-26; branch t-land-26, head 7f9abaa55)
Code head **7f9abaa55** (pushed; session 1's 42e3b30fc plus session 2's candidate). **The lead's W/P ruling on 2-6's porch gaps is OPEN**
(R-165.471; my messages to the lead carry the data). Under W (the head as pushed): 2-6's own tests 159/160 expected, ONE red =
rowWheels 'rideWheel ON' child Normal v2 2 scrambles on the top wheel (the bot's boarding judge after a timing shift; traced below;
for the lead to rule, never the test bar). The next session, in this order:
1. ReadNotifications; read the lead's ruling. `git fetch origin t-land-26 && git checkout -B t-land-26 origin/t-land-26`; npm ci
   --legacy-peer-deps (run_in_background). Frozen tree per run (git worktree add --detach; link node_modules; chattr -R +i src tools;
   chattr -i src/game/gen2/proven).
2. If P: revert the w2.ts hunks of 4066c0e37 + 430b53d73 with a new commit (keep w2DryGap.test.ts out too), then the trunkCatch plant
   moves back to seed 17 (live on the pools tree: data/trunk-1-40.txt) and w2Arc26 'one millrace' needs the lead's ruling. If W: nothing
   to change unless the lead rules on the rideWheel red.
3. Packet step 3 on the final head, each ONCE: the suite in 3 shards (`npx tsx --test --test-shard=i/3 <deploy.yml's globs>`,
   run_in_background, timeout 7200000) + the CI tool line (gates.yml line 157); paintcheck --stages 2-6 then the sweep (now with the
   depth-step check); lockall (2-6's named moves only; 2-7 FIRST, a still of each moved 2-7 gap to the lead); castBots --proven 2-6
   (seeds 1-40, both settings; compare with data/cast-*.txt); seedlist 2-6 --check; registrycheck; drawcheck; clipcheck; tierBots 9/9;
   timecheck; teachFirstScan. Then the ENG-THUMB list (2-6 rows waiting at a stand: castBots 'water ahead' stuck lines, 103 on W).
4. Land on t-land-26 (no force); hash + one line per gate to the lead. Never merge to main or a release branch.

## Session 1's EXACT NEXT STEP (kept for history)
Code head **42e3b30fc** (pushed). Step 1 is DONE except two reds in 2-6's own tests (below, both need the lead's R-number and owner, D135).
**Running at hand-over (session 1 appends each verdict here when it finishes):** the unit suite in 3 shards and the CI tool line (gates.yml
line 157), both on frozen 42e3b30fc (run_in_background, timeout 7200000; CI #85, D141). If 42e3b30fc stays the code head, those count.
The next session, in this order:
1. ReadNotifications. `git fetch origin t-land-26 && git checkout -B t-land-26 origin/t-land-26`. npm ci --legacy-peer-deps
   (run_in_background). Frozen tree per run: `git worktree add --detach <scratch>/wt/m1 42e3b30fc`, link node_modules,
   `chattr -R +i src tools && chattr -i src/game/gen2/proven`.
2. **R-165.451, what session 1 found (data/A-floor790-upright-normal-b26-vs-42e3b30fc.jpg, left t-build-26 40a9c4bd2, right 42e3b30fc,
   Normal, upright 412 x 915, seed 1):** FIX-SOIL-b's 'porch 5' is the START FLOOR's turf at world x 790, y 6716 (on FIX-SOIL's tree id 5
   was that floor piece; on 42e3b30fc id 5 is a plank at y 6161, so never select it by id). The start area is the same on layouts 0-11
   (data/start-area-layouts0-11-42e3b30fc.jpg). Shot with tools/shootA.mjs.txt (FIX-SOIL's shoot26 with the spot 'the lowest platform under
   x 790'). Measured, column brightness under the turf (screen y 775-905, the mean of 6 columns right minus 6 left): **t-build-26 +12.2 at
   screen x 393 (the block's straight left edge); 42e3b30fc at most 1.6 anywhere: NO block in this frame.** Release 4's soil work (FIX-SOIL-b
   539885c37 merged by INT-R5d-c, groundBanks/groundCeilings) appears to have removed it. NOT yet proven: (a) which draw made the edge on
   t-build-26 (trace it there to the line: tools/trace26.mjs.txt wraps drawImage/fillRect only, ADD fill; best probe: after every draw
   call read 1x1 pixels at the edge's x-2 and x+2, several y, and log the call whose change differs, with its stack), so the REPORT can
   say which release 4 change removed it and that it is gone IN GENERAL; (b) Easy and sideways on 42e3b30fc; (c) the rest of 2-6 (the same
   measure over a grid of frames: tools/grid26.mjs.txt, PTS="x,y;..."); (d) a paint gate that reads the DRAWN output (D136, CI #87): a
   planted case RED on t-build-26's draw (the straight edge) and GREEN on 42e3b30fc. If a block remains anywhere, fix it in general (no
   stage id or x); a fix in protoArt.ts drawGround goes in its own hunk (FIX-SOIL-c's dip-pocket pass, a9c0170c on t-fix-soil-c, edits it).
3. Stills of beat A at 2x (deviceScaleFactor 2), upright AND sideways, both settings, on the final head: send the lead the UPRIGHT pair
   before going on. Playwright: `/opt/node-tools/node_modules/playwright/index.js`. Kill the vite port after each tree (no `ss` here: use
   `curl` on the port) and check the served tree (CI #78).
4. Packet step 3 (every gate once on the final head; the suite and the CI line again only if the code head moved off 42e3b30fc) and
   step 4 (land on t-land-26, no force).

## Step 1: the reverts and the merge (done, 42e3b30fc)
- Base: c73cb9766 (origin/release-0.10.3, confirmed by ls-remote). Branch t-land-26 cut from it.
- `git revert 41cb842a1` -> 132425a43. ONE conflict: .github/workflows/gates.yml line 157 (the CI tool line): release 4 had added
  tools/engine/teachFirstScan.test.ts and tools/engine/sideWall.test.ts, the revert put back tools/inspect/rowWheels.test.ts; resolved
  token by token: release 4's line + rowWheels.test.ts at its old place (after snapperTaught.test.ts).
- `git revert 4816edd31` -> e26a73fb7. No conflict.
- `git revert 8d094787c` -> 42e3b30fc. ELEVEN conflicts, each keeping release 4's 2-7 AND 2-6's gen2 listing:
  - src/components/stageClue.ts: 2-6 = the keeper's 'A Welcome Sign' (= w2Arc26.ts CLUE_26, its comment back), 2-7 = release 4's 'Written Back'.
  - src/game/pokeyJournal.ts: 2-6 = JOURNAL_26 (with its comment), 2-7 = release 4's line.
  - src/game/stagePlan.ts: 2-6 = MISSION_26 (with its comment), 2-7 = release 4's.
  - src/game/gen2/judgedTable.test.ts (2 hunks): the JUDGED table holds '2-6': 'normal-2-6' beside '2-7': 'normal-2-7'.
  - src/game/gen2/listed.ts (3 hunks): both imports; KITS and WORLD hold 'w2-26' and 'w2-27' (FINISH's 'w2-26': finish26 merged clean).
  - src/game/gen2/provenIndex.ts: 2-6's row (n 100, version 52496f5f = t-build-26's) beside 2-7's.
  - src/game/gen2/worlds/flownArcs.ts (2 hunks): n26 and n27; 2-6's eight flown rows (ENG-26s) before 2-7's.
  - src/game/gen2/worlds/stageTable.ts (2 hunks): kit type holds 'w2-26' | 'w2-27'; 2-6's row (kit w2-26, judged normal-2-6) before 2-7's.
  - src/game/stageSheets.ts: NEITHER hand-built gold-snake line (2-6 and 2-7 are both gen2; 2-7's line went with BUILD-27's deletion).
  - src/game/w2Sections.ts (3 hunks): W2Plan = '2-8' | '2-9'; W2_FLAVOURS Record<W2Plan> without the old 2-7; the header names 2-6 and 2-7 as gen2.
  - src/game/w2Stages.ts: W2_STAGES holds 2-8 and 2-9 only (both hand-built plans gone).
- `git merge 40a9c4bd2` (t-build-26): **Already up to date**: release 4's line already holds t-build-26 @ 40a9c4bd2 (86aad83a7, FILL-14b's
  1-4 fill); the reverts were what kept 2-6 out. t-build-26 after e8e99d167 (INT-R5's merge point) touched only 1-4's seed fill and the seed
  tools, so nothing of 2-6 was lost in that merge. 2-6's own files (w2Arc26.ts, w2Arc26.test.ts, proven/seeds-2-6.ts, rowWheels.ts) are
  byte-identical to t-build-26's.
- **tsc: clean** on 42e3b30fc.
- **The ten known flips** (ENG-PLANT's set1, reference/qa-reports/ENG-PLANT/ci-tools/set1-m.sh.txt, on frozen 42e3b30fc): **23/23 rows equal
  to CI-15's committed set1** (ENG-PLANT/data/ci/s12/fin15/set1-ci15), 0 moved, all PASS (data/set1-42e3b30fc-cmp.txt; cmp3.py's column
  labels are its own: all three columns are CI-15, CI-15, this tree).
- **2-6's own tests** (18 files: w2Arc26, w2Stages, judgedTable, listedWheelSheet, tower*, towerWater, towerBots, wheel, w2, riverLay,
  nodeClock, dotBox, qaW123, edgeFooting, w1NewArt, rowWheels, sideWall): **128 tests, 126 pass, 2 FAIL** (data/t26-42e3b30fc.txt):
  1. **w2Arc26.test.ts:69 'one millrace': 5 !== 1** (normal 1). Cause, traced (tools/riv26.ts.txt): release 4's World 2 finish rule (w2.ts
     ~326, ENG-GROUND-b: 'a fall has its river when one spans it AT ITS HEIGHT') now lays a still pool in four of 2-6's water/soft falls
     that had NO water on t-build-26 because the millrace spanned them in x at another height: normal 1's rivers = the millrace (x 479-1277,
     surface 4970, speed 70, way -1), three wheel ponds, and four NEW still pools 80-90 px wide (x 674-753, 953-1042, 1242-1332 at surface
     3782; 714-799 at 5588). The test counts every non-wheel-pond river as the millrace. So 2-6 now SHOWS water in four falls it never drew
     water in (a look change and possibly a play change: lockall and castBots will say). Not fixed: the lead's call whether the test counts
     the log river only (speed > 0) and adds the pools as expected, or the pools are wrong for 2-6 (law 22: not changed to get green).
  2. **rowWheels.test.ts:96 PLANTED 'trunkCatch OFF ... rescues come back (RED)'**: with the plant on, 0 rescues in all six runs (middle N/E,
     expert N, v1 and v2): the plant no longer bites on release 4's bots (CI-15 changed the bot; the same shape as ENG-PLANT-CI's waitRise
     re-plant, R-165.432). Not fixed: a bot-owner re-plant (a live case on CI-15's bots), never a removal.
- Not yet run on 42e3b30fc: the suite, the CI tool line, and every step 3 gate.

## Step 2: R-165.451 (see EXACT NEXT STEP 2: gone in beat A's frame on 42e3b30fc by measure; cause and generality not yet proven)
- Session 1's first trace ran on the wrong frame (platform id 5 = a plank on this tree); it only showed wall chunks (protoArt.ts
  drawWallChunks :1554 via drawEarthWall :1460), the wheel, branch art, ladders and dress near that frame's screen x 300-420.
- Seed-1 camera grids of the whole stage (sideways, Normal) on both trees: the same plank porches and pieces; t-build-26's tall lighter
  soil COLUMN (beside the wheels, storeys y ~900-5700) is gone on 42e3b30fc (release 4's soil fix).

## Session 2 (LAND-26-b): R-165.471, R-165.451, R-165.472, the stalk
### R-165.471 the four new pools (ruled DRY by the lead)
- What: release 4's ENG-GROUND-b rule laid a SAFE still pool in four soft gaps between thin porch planks (beat 7 'hanging porches'
  y 3740 x 674-753/953-1042/1242-1332; beat 2 'first street' y 5546 x 714-799, Normal seed 1) and DROPPED each gap's own floor plank
  (ids 18, 41, 42, 43). On t-build-26 they were dry only because the old rule took the millrace (another storey) as covering them in x.
  Stills: data/pools/*.jpg: the pools draw as NO water (soil, reeds on the lips). 2-6.md names water only under the wheels and the millrace.
- Bots (castBots 2-6, seeds 1-40, every bot, both settings, 360 runs, frozen trees; lives 0 hits 0 in all): pools 357 pass / 3 rescued
  (none at a pool); dry as t-build-26 (overLowFloor dropped, floor as laid) 333 / 27 rescued (kid E 14, adult E 13); dry widened 359 / 1;
  dry with walls 356 / 4 (and a grass strip over the hole: fails polish, data/drygap/); bridged 359 / 1 but that one is a BROKEN ROUTE
  (expert N seed 15: the gap is the way down). Withdrawn: walls, bridge.
- Cause of the dry rescues (traced; tools/tr12, on.mts): the pocket under thin planks has NO WALLS. He lands on its floor (kid E seed 12,
  frame 1443, middle 838 on floor 762-828) and walks on off its far end under the jump-through plank and down the storey (430 px), three
  times, to a rescue; adult E seed 4 the same (x 718 -> 983, frames 841/1105/1398); kid E seed 36 the same after widening (the 1 left).
  The root is pipeline.ts pitSteps (a single-jump pit's floor one hop under the far lip, walls assumed from earth banks): an engine packet.
- Candidate W (w2.ts dryGap, 4066c0e37 + 430b53d73): ruling (B) first and unchanged (over a lower leg's floor, open); elsewhere a thin-piece
  soft gap with its own floor stays dry, the floor widened so a walk-off at a run (tower.ts walkOff/runX) comes down half his body inside
  its ends; idempotent. Toys w2DryGap.test.ts 3/3; plants RED: 42e3b30fc's gate 'gap 66: no pool over a porch gap'; floor left the
  gap's width 'gap 66: off the near lip, 700..766'. w2.test/w2StackedFall green; w2Arc26 'one millrace' GREEN (test unchanged).
- Under W, rowWheels 'rideWheel ON' RED: child Normal v2 topR 2 scrambles (edgeR crossing 13.3 s vs 8.5 s with pools: the pocket now
  holds him; he meets the top wheel at another phase). Widened floors are 257+ px clear of every sweep. The bot's boarding judge (b).
### R-165.451 beat A's soil block (traced, gone in general, gated)
- t-build-26, to the line (tools/probe451tile.mjs.txt): groundPaint.ts shadeSoil -> depthBand fillRect in the cached ground square
  (protoArt.ts drawGroundChunks -> paintTile -> drawGround -> drawBankArt -> drawSoil): bands x 1040-1056 then 1056-1201, the
  darkening's start 192-224 px apart (step 1.9 -> 25.1 -> 14.4). groundLine counted the HUNG storeys. The live draw had none (1.5).
  FIX-SOIL-b c22702edc (release 4, R-165.441) leaves hung banks out of groundLine: general (1-4's start step was the same).
- Gate: groundPaint.ts depthRuns (the one function shadeSoil draws its bands with); tools/engine/paintFall.ts depthSteps reads them with
  the same line, banks and ceilings as paintTile (stacks set as the engine sets them, D136); > 48 px fails; in paintcheck, no known list.
  Planted on 2-6 seed 1 (paintFall.test.ts): RED on t-build-26's line (jumps over 150 at x 1024-1072), GREEN as drawn; 17/17.
  Sweep (all stages, N+E, layouts 1-4): max 25 px. My first sweep flagged 2-7 E seed 2 (96 px): MY probe had no ground stacks set.
- Stills 2x (data/beatA/): upright Normal step +13.5 (t-build-26, screen x 784) vs <= 2.3 (candidate); Easy no block either tree;
  sideways Normal: t-build-26's lighter straight-sided rectangle gone.
### R-165.472 trunkCatch
- Re-planted on live cases: seed 17 (pools tree), then seed 20 under W (3 rescues off at the crest x 88 / x 437 and the millpond x 1612,
  'a trunk beside him, the way on is 138 px up'; 0 on); 31 of seeds 1-40 cost a rescue off: trunkCatch stays (7f9abaa55).
### The dark-green vertical line (the release line's, not 2-6's)
- bounceArt.ts drawBounce 'plant' stalk to bottomY = terrain.ts bounceBottom (the view's foot) for every bounce plant; t-build-26's soil
  column hid 2-6's. Also on c73cb9766: 9-2, 10-4 (data/stalk/); not 1-1, 5-8, 7-8. Proposed: the stalk ends on the piece it grows from.
  The lead's call (an R-number); not touched.

## Gate table (42e3b30fc)
| Gate | Result |
|---|---|
| tsc | clean |
| 2-6's own tests (18 files) | 126/128: 2 FAIL (w2Arc26 'one millrace'; rowWheels trunkCatch plant), both named above |
| known flips (set1, 23 rows) | 23/23 = CI-15, 0 moved |
| suite (3 shards) | RUNNING at hand-over (frozen 42e3b30fc) |
| CI tool line | 426 tests: 424 pass, 1 todo (chase bots, ENG-B4's open todo), 1 FAIL = rowWheels.test.ts PLANTED trunkCatch (red 2 above, no new red); data/ciline-42e3b30fc.txt |
| paintcheck, lockall, castBots --proven 2-6, seedlist 2-6 --check, registrycheck, drawcheck, clipcheck, tierBots, timecheck, teachFirstScan | NOT RUN |

## Polish check
- Beat A upright Normal, t-build-26 vs 42e3b30fc (data/A-floor790-upright-normal-b26-vs-42e3b30fc.jpg): the block is visible on
  t-build-26 (right of screen x ~393 under the turf) and not on 42e3b30fc; at 1x only (an analysis still, not the 2x set for the lead).

## Learned
- A 'merge t-build-26' step can be a no-op when the branch already sits inside the release line: check `git merge-base --is-ancestor`
  first; then the reverts ARE the landing, and their conflicts are where 2-6 meets release 4's later work.
- A look defect is judged by a NUMBER read from the drawn frame (a brightness step across the edge), on both trees at one camera,
  never by eye alone; that number is also the seed of the paint gate D136 asks for.
- A packet's 'porch 5' is an id on another tree: a spot is named by its picture or its built geometry, never an id (rule 27's shape).

- (session 3) A bot judge that leans on a flown table holds only where the table was flown: name the flight's start (BOARD_BACK) and judge
  the bot's own hop everywhere else. A predictor of a landing uses the engine's own catch (onFloor: 14 px), never a strict crossing.
- (session 3) A draw fix is checked on the screen before and after: the first stalk cut changed nothing because the painted-ground path
  hands the draw only the unpainted pieces.

## Lessons applied
D115 (frozen, chattr'd worktree for every run), D119 (no heredoc in a commit chain), D128 (stamps from `date`), D134 (pushed and
ls-remote-confirmed before the hand-over), D135 (both reds named for an R-number), D138 (a hand-over ends new work), D140 (notifications
read at each step), D141 (the CI line named as not yet run on this candidate). Session 3: D115, D119, D128, D134, D138, D140, D141.
