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
