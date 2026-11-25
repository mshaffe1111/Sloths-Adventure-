# ENG-DARK REPORT (the dark + light ring as one gen2 brick; WORLD-3-PLAN F2; R-165.449)
**EXACT NEXT STEP (ENG-DARK-p box 16 HAND-OVER on the lead's order (Matt off for Thanksgiving Eve), 5:57 PM ET by `date`; head on
t-eng-dark-wip = this commit; CODE CANDIDATE 119680d33 (c7). The lane resumes when Matt starts the next day. Re-fetch before every
commit (D138).)** Box 16 read the lead's hand-over order about 30 minutes late (no ReadNotifications at the step boundaries: D113/D140
again, mine) and in that time built c5-c7 and started c7's x40. That x40 was finished and recorded only.
**WHERE IT STANDS: c7's x40 = (frozen worktree, both lanes, cast-3-1-x40-119680d3-lane1/-lane2.jsonl, x40-verdict-119680d3.txt) shrine 360/360; unlit 3 (child E 8:
x 515, y 4375; kid N 29: x 582, y 3380; child E 34: x 1210, y 6186), <= 5; max loop 7 (middle N 26), no 10+; gaveUp 3; edgeTurns 0;
rescue CLAUSES the base lacks: none; rescue KINDS (whole combinations) the base lacks: 4, all 'a trunk beside him' + a drop + the
way down (on every x40 since ef811c2a; the lead's ruling, item 4); rescues 620. Medians vs base: kid N -25.1, kid E +9.3, child N
-80.9, child E -39.0, middle N -42.1, middle E -33.3, adult N -12.6, adult E +4.6, expert N -48.1. c5 (89ef9a985, before landedAhead):
shrine 360/360, unlit 3, loop 6, 'on a trunk' the one clause the base lacked. NOT YET PROVEN (box 17): toys for 89ef9a985,
dark.test/darkBots.test WHOLE, plants, gates, the CI line.**
**DONE IN BOX 16 (each traced to the line, rule 28; a toy each way + a plant for each bot change):**
1. **a5e15a74d's x40 (both lanes) FAILED:** shrine 355/360, unlit 8, 4 rescue kinds the base lacks (table further down).
2. **Roll 15 '347 px down' strand (5 rows: Normal 15 child/middle/expert, Easy 27 child/middle):** the expert ran off 10758 at full
   speed, carried past the piece the way drops onto (842-1080, y 11039) and landed on 826-1280 (y 11320), wood that runs on to the
   right side wall, the shrine 347 px straight under it. Progress snapped to the route's last point (the exit, under his wood), and
   downEnd found no way-on point off the wood, so it returned 0 and he hovered over the shrine until stranded. A/B on a177fde99: expert N 15 and
   middle E 27 reach the shrine there, child N 15, middle N 15 and child E 27 strand there too. **So box 15's seam change only moved
   which rows meet it (timing); the fault is older and lives in downEnd.** FIX e0f880835: with the way on straight under his run, he
   steps off the run's OPEN end (one his middle passes before the side wall, engine `walls`), the nearer one. Toys (darkBots.test, real
   row expert N 15): GREEN shrine / planted `noOpenEnd` stranded; plant in planted-faults.py. All 5 rows reach the shrine.
   **Box 15's seam change is NOT narrowed:** it did not cause the strand (above), and its own roll-11 toys stand.
3. **The unlit events (8 -> 3):** all one family, a run off an edge touching down at the next sleeping rim at 154-285 px/s. Trace (child N 22): rim 699
   (106's left end) has its own stop; he waits until ITS landing light wakes (that light also shows the edge at 590, so the step-off
   check passes), runs off from 63 px back at 268 px/s and touches down on 590-811 29 px from its sleeping left rim. runOffs skipped
   every edge with its own stop. FIX 89ef9a985 (dark.ts runOffs: an edge with its own stop is judged as a run off too; firsttimer.ts
   glowRimsOf keeps the run-off rim on such an edge, glowWait stops at the first rim there whose light is not yet lit, not the first
   rim). Also 3ac460474: runOffs judges every run speed from half to full run (RUN_FRACS); a tenth to full lit 30 of 970 darks whole
   (1604 lights woken), half to full keeps 0 whole. Lay on 89ef9a985 (probes/runoff.mts, now counting darks fully lit): verdicts 0 on 80
   rolls; darks 968, FULLY LIT 0; lights laid awake 2044 of 6152 (a5e15a74d 2005); median awake share 0.33 (same).
   **NO TOY YET for 89ef9a985's two changes (the lay's edge-with-own-stop run off, glowWait's second rim): box 17 writes them**
   (dark.test: Normal 22's run off 106's left end (699, 5658) judged RED with the change's line reverted; darkBots.test: child N 22 unlit
   [] GREEN / with glowWait's `find` taking the first rim, RED) + plants.
4. **'on a trunk' (the one rescue clause the base lacks; 6 rows: child E 18, middle E 12, expert N 14, middle N 26, middle N 32,
   middle E 22):** run off 5 (y 1188) past 6 (224-460, y 1469) onto 0-703 (y 1599), the floor the way reaches 15 points on; Progress
   kept him at the point over his head (on 6), he climbed the trunk at x 244 back up and fell again until rescued. FIX ca6133968 +
   119680d33 (landedAhead: landed AHEAD on the way's own floor in a down tower, he is put at that point, never followed back before
   it, and walking that floor to it is not off the way). Toys (real row middle N 26, 30 s): GREEN no rescue / planted `noLandAhead`
   fell back down; plant added. The 6 rows: 'on a trunk' gone, rescues 19 -> 11.
   The other 4 'kinds the base lacks' are new COMBINATIONS of clauses the base has ('a trunk beside him' + a drop + the way down), on
   every x40 since ef811c2a: **the lead rules whether the bar reads kinds as clause sets** (clause level: c5 lacked only 'on a trunk').
**BOX 17 DOES, in order:** (a) the toys + plants for 89ef9a985 (item 3). (b) the MISSED glowJump plant (box 15: 32/33): re-anchor
darkBots' 'holds a running JUMP' toy on a real row: scan FT_EXPERT with plant 13 on a copy of the head (box 12's candidates, earliest
first: Normal 4 at 41.57 s, 27 at 51.87 s, 17 at 47.23 s, 16 at 70.67 s, 10 at 97.00 s; scan-box12-jump.txt), pick one RED planted
and GREEN unplanted, cap just past the event; else a shape toy. (c) dark.test + darkBots.test WHOLE and plants (all CAUGHT) on the
frozen head. (d) the x40 on the frozen head (2 lanes) vs THE BAR (c7's line above is the reference). (e) gates ONCE (castBots.test,
tierBots 9/9, the CI tool line on a FULL tree, the suite shards), then LAND on t-eng-w3 (88592a9c4) as box 15's order step 4.
Still open, under the bar (unlit 3 <= 5): kid N 29 (582, 3380) and middle E 15 (1005, 8877; landed 1230 at -113 px/s and ran
225 px left over the rim, no stop) and expert N 6 (592, 6620): trace if the lead asks.
Worktrees (container-local, frozen): wt-x40b a5e15a74d, wt-a177 a177fde99, wt-c1..c7. Probes used: probes/runoff.mts (fully-lit
count added); scratchpad wayon.mts / track2.mts / rorims.mts (box 17 can rebuild: route points from run.prog at t; the pad per frame
on CAST_BOTS; runOffRims + darkRims in a y band).
Lessons applied: D113/D140 (missed: read the hand-over late, named above), D115 (every run on a frozen tree; one race named in item 4's rows,
re-run on frozen c7 by the x40), D119, D128, D134, D138, D141 (the CI line on every candidate: NOT run, the hand-over came first).

**EXACT NEXT STEP (ENG-DARK-p box 16, 5:14 PM ET by `date`; head on t-eng-dark-wip = this commit; CODE a5e15a74d). THE x40 ON a5e15a74d
FAILS THE BAR: NOT LANDED, no gates run (the order: "if the bar is NOT met, stop with the table"). Waiting on the lead's ruling.**
**THE x40 ON FROZEN a5e15a74d (lane 1 box 15, lane 2 box 16; cast-3-1-x40-a5e15a74-lane1/-lane2.jsonl; x40-verdict-a5e15a74.txt;
x40verdict.py vs cast-3-1-x40-base-c1008d8e.jsonl). Draft checked: castone.mts on the frozen tree = the row, expert N 15 (lane 1) and
adult E 30 (lane 2).**
| bar | result | met |
|---|---|---|
| shrine 360/360 | 355/360: STRANDED child N 15, middle N 15, expert N 15, child E 27, middle E 27 | NO |
| unlit <= 5 events | 8 (child N 1; middle E 15; kid N 29; child N 22; child E 22 x2; middle N 22; middle E 22) | NO |
| no loop (10+ crossings of one rim) | max loop 6 (middle N 26) | yes |
| no rescue kind the base lacks | 4 lacked: 'a drop of # px ahead, a trunk beside him, the way on is # px down' (+2 longer forms with a waist-high step / a dip); 'a trunk beside him, on a trunk' | NO |
| gaveUp / edgeTurns | 1 (child N 21, rim x 215, y 11280, reached the shrine) / 0 | - |
- Medians vs base (new / base, delta, rescues new/base): kid N 149.7/174.7 -25.0 48/156; kid E 206.3/197.0 +9.3 106/186; child N
  242.4/320.1 -77.7 49/138; child E 271.5/306.4 -34.8 95/178; middle N 171.5/207.7 -36.2 51/126; middle E 231.0/261.5 -30.5 122/186;
  adult N 151.7/164.4 -12.7 48/119; adult E 204.9/200.3 +4.6 109/180; expert N 166.4/202.4 -36.0 49/124 (expert plays Normal only).
- **The 5 strands are ONE signature:** 'the way on is 347 px down' then 'fell back down from here 8 times' (Normal 15 and Easy 27).
  **A/B on frozen a177fde99 (box 14's head, before box 15's seam-run end in downEnd; castone.mts, one run each):** expert N 15 SHRINE
  127.2 s (a5e15a74d: stranded), middle E 27 SHRINE 184.4 s (a5e15a74d: stranded); child N 15, middle N 15, child E 27 STRAND on
  a177fde99 too. So box 15's seam change (firsttimer.ts downEnd, the only non-test change a177fde99..a5e15a74d) newly strands 2, and
  3 strand without it: the 347 px way down on rolls 15/27 is an older fault (the lay or the down route), not the seam rule alone.
- ENG-DOWNBOT's open items, judged on these rows: rest/vine kinds are inside the base's kinds except the 4 above; fix A's toy, adult
  E's row and the vine spots were NOT traced (the bar failed first).
- Plants: box 15's plants run on a5e15a74d did NOT land on this branch (only lane 1 did); not re-run (the bar failed; no gate on a
  failed head, D140).
**Next (the lead's call):** trace roll 15 Normal / 27 Easy at the 347 px way down (probes/trace9.mts or corners on a5e15a74d and
a177fde99) and fix the owner; then a new x40 on the new head.

**EXACT NEXT STEP (ENG-DARK-o box 15 hand-over, 5:03 PM ET by `date`; head on t-eng-dark-wip = this commit; CODE a5e15a74d. Box 16 OWNS
every step below. Re-fetch before every commit (D138).)**
**STEP 1 (box 14's A-C) on a5e15a74d's code, frozen worktrees:** dark.test 17/17 and darkBots.test 14/14 WHOLE green; tsc clean.
- Two SHAPE toys were red on a177fde99 (their builders found no shape), both rebuilt (dark.test):
  - hop rim (`hopStep`): a hand floor HOP_FLOOR 540 px under the step-off piece's back end, the wood between taken out: that edge's own
    light hangs past a hop stop's reach (GLOW_REACH.down), so only the second light lights it (before: all 61 shapes of rolls 1-10 lit
    that edge with its own light woken by the stop, so no lay went RED without the second lights).
  - behind edge (`deepDrop(608, ..., behind, 10 rolls, clear)`): the edge now 60 px behind the touchdown (BEHIND; asserted under
    darkStop), the wood between rim and landing cleared. Why: at 608 px the capped light hangs 188 px over the landing, and a 190 px
    light there reaches an edge 13 px aside; past 608 px no drop lands on that piece; and on roll 1 a piece 346 px down dropped onto
    the same landing, its own light 90 px over it was the landing's (darkRims' nearest).
- runoff probe (scratchpad copy + a fully-lit count), rolls 1-40 x both settings on the frozen code: verdicts 0 on all 80; the run-off
  rule wakes 83 of 6152 lights (box 14 saw 978 before `stops`); darks fully lit: 0 of 968.
**STEP 2 DONE (roll 11, same seam family, fixed general):** the route drops through a 13 px seam from 355-591 (y 11405) to 604-784
(13 px UP, a step) and comes out past 784 on 604-817 (y 11552). By facing, a turn on 355-591 flipped him and he went over the rim at 604
eleven times. downEnd now: under a seam run, he steps off the run's END (both ways over every seam, ledgeEnds) that the way on comes out
past (its first later point outside the run); his facing only when it never comes out in reach. Frozen probe: roll 11 adult N loop 1,
shrine 169.5 s, unlit 0 (was loop 11, shrine 151.1 s: say it at the x40 medians); rolls 6 and 35 loop 1, shrine. Toys (darkBots.test):
roll 11 GREEN (shrine, loop < 6, unlit []) / seamByFacing RED (loop >= 8; probe: 11). Plant added to planted-faults.py.
**RUNNING AT HAND-OVER (box 15 finishes and records only these two on this branch, D138; if they are not here, box 16 re-runs them):** planted-faults.py on frozen a5e15a74d (33
plants; 2 CAUGHT so far); x40 lane 1 (seeds 1-20, both settings, --par 2) on frozen a5e15a74d -> x40-a5e15a74-1.jsonl. Lane 2 (21-40)
NOT started (two heavy runs at a time).
**x40 LANE 1 RECORDED (seeds 1-20, both settings, frozen a5e15a74d; rows cast-3-1-x40-a5e15a74-lane1.jsonl; x40verdict.py vs the base's
seeds 1-20): FAILS THE BAR ALREADY.** shrine 177/180: Normal roll 15 child, middle and expert STRANDED ('the way on is 347 px down',
'fell back down from here 8 times'; kid and adult N 15 reached it). Unlit 2 (child N 1: x 648, y 9051, 0.49 s after waking; middle E 15:
x 1005, y 8877, landing dark). Max loop 4. Rescue kinds the base lacks 3 ('a drop of # px ahead, a trunk beside him, the way on is # px
down'; 'a trunk beside him, on a trunk'; 'in a dip # px deep, the way on is # px up'). Medians vs base: kid N -30.0, kid E +8.1, child N
-80.4, child E -25.0, middle N -44.8, middle E -33.0, adult N -5.8, adult E +4.7, expert N -41.6 (expert E not in this lane's print).
NOT yet known: whether roll 15 strands on a177fde99 (before box 15's seam change) too: box 16's FIRST check is that one-run A/B
(expert Normal 15, castBots, a177fde99 vs a5e15a74d). Lane 2 not run.
**PLANTS RECORDED (frozen a5e15a74d, plants-box15.txt): 32 of 33 CAUGHT, 1 MISSED:** "the bots' dark stop skips a jump (glowJump not
read)" leaves darkBots' "holds a running JUMP" toy GREEN (it was CAUGHT in box 13 on a3117f7c0; the downbot merge and box 14-15's
changes came after). Not diagnosed (D138): box 16 traces whether the toy's real row still holds a jump into the dark, and re-anchors it.
The new roll-11 seam plant, the 3 run-off plants, the behind-edge plant and plant 28 are CAUGHT.
**BOX 16 DOES:** (1) plants on a5e15a74d: every one CAUGHT (none NO TEST / BASE RED / MISSED). (2) the x40 on a5e15a74d (both lanes;
commit cast-3-1-x40-a5e15a74.jsonl) vs THE BAR with x40verdict.py against cast-3-1-x40-base-c1008d8e.jsonl: shrine 360/360; unlit <= 5
events, no loop; no rescue kind the base lacks; medians vs base; ENG-DOWNBOT's open items. One line to the lead. (3) box 15's order
step 4: gates ONCE, then LAND on t-eng-w3 (88592a9c4).
Lessons applied: D115 (every probe/test on a frozen worktree; plants and x40 in separate worktrees), D119, D128, D134/D138.

**EXACT NEXT STEP (ENG-DARK-n box 14 hand-over, 4:44 PM ET by `date`; head on t-eng-dark-wip = this commit; CODE 548057919. Box 15 OWNS
every step below. Re-fetch before every commit (D138). Run NO gate and NO x40 until steps A and B below are green.)**
**STEP 1 DONE:** origin/t-eng-w3-wip-downbot f1d519f25 MERGED for real: 6255af91c (pushed), one conflict, downEnd, resolved as box 13's trial
(blob 6c2e2a785, identical: ENG-DOWNBOT's wood-run body + the seam rule on the point it picks; ledgeEnds and downPt kept). tsc clean.
On 6255af91c: castBots.test 16/16; dark.test + darkBots.test 20/26 (red: 2 real-row bot runs with unlit crossings = the running step
off; 4 toys whose real rows the downbot lay moved: roll 33 hop rim, roll 21 wall rim, roll 1 mid-way trunk, roll 32 seam).
**STEP 2 (code done, being proven):**
- (a) darkLandings (iii) + the lay: `runOffs` (dark.ts): a RUN off an edge with no stop of its own (outside every dark, or in the dark with
  its landing's light awake) touches down at full-run flight (`runOnto`: PHYS.maxRun, gravDown to maxFall, the first piece the arc meets)
  and must be his stopping distance from each sleeping rim the way he runs on that piece. NO pass for an awake light that merely SHOWS
  the edge (roll 1 adult N touched down 10 px from x 673, y 3850 under a lit landing and went over it dark). `stops`: the edge is in the
  dark and a stop on its piece wakes that rim's light (litAfter) = the bot's stop (b); the rest the lay lights: `awakeLights` (exported;
  glowZone uses it; the cave mouth + those run-off landings, iterated). Verdict proof on 59869f963's lay (before `stops`): darkLandings/
  darkGaps/darkFlags [] on all 80 rolls (probes/runoff.mts); that lay woke 978 of 6152 lights and left one dark fully lit (roll 1 N) ->
  `stops` added (7585a6251) so a stop that can wake it is used first. RE-RUN probes/runoff.mts 1 40 on the head (frozen worktree) and
  record the woken count; dark.test's every-roll test checks every light sleeps but awakeLights' and some light sleeps in each dark.
- (b) the bot: `runOffRims` (dark.ts, the `stops` entries) join glowWait's rims (firsttimer.ts glowRimsOf, marked runOff, never glowJump's):
  he stands at that edge until the met rim's light is lit DARK_AHEAD, then runs. (A creep-off was tried and dropped: the thumb's lag ran
  him off at 285 px/s.) Toy on the REAL row: adult Normal roll 1, edge x 556, y 3672 -> rim x 673, y 3850 (darkBots "a RUN off a lit edge").
- toys (a): dark.test "a RUN off a rim with no stop is judged where it lands" (Normal roll 3: x 442, y 5351 -> x 214, y 5811; GREEN laid,
  RED with the run-off lights asleep).
- ENG-DOWNBOT open items seen on the way (adult Normal firstTimer, probes/seamscan.mts): loops 30/30/17 on rolls 6/11/35 UNPLANTED.
  Roll 6: a 22 px gap to a piece 15 px lower: ledgeEnds' next piece now within STEP_UP.min (the engine's walk-over step), not 8 px ->
  loop 1 (4da934e4f). Rolls 11/35: the way on under an 18 px seam; downEnd returned 0 and the route's x flipped him -> now returns his
  facing (548057919). The seam toys are re-anchored on roll 6 (planted 30, unplanted 1).
**RUNNING AT HAND-OVER (box 15 reads or re-runs):** on 548057919 in /tmp/claude-0/wt-h: probes/seamscan.mts 6, 11, 35 (at hand-over: roll 6 unplanted loop 1 KEPT, roll 11 STILL 11 (facing fix does not cure it), roll 35 pending) and dark.test alone (the shape toys after the retune).
**STEP 3 (written, not yet green):** the behind-edge exemption's SHAPE toy (dark.test "an edge BEHIND a dark-rim drop's landing", `deepDrop`:
roll 1 N's first sleeping drop rim, its landing piece moved to 608 px under it and 13 px behind the touchdown, a hand floor 400 px under
that piece, the dark laid again by DARK_EMIT (`relay`)); the plant now targets it (planted-faults.py). Same builder: the wall-rim toy
(560 px, no floor). The hop-rim toy is a shape toy too (`hopStep`, rolls 1-10). On e1fa96c63 (before the retune) the deep-drop toys were
RED for the builder's sake (700 px was past any light's reach; the floor's light became the nearest): retuned in 548057919, unproven.
**BOX 15 DOES:** A) dark.test + darkBots.test whole on the head (frozen worktree): every toy GREEN; fix any shape toy that is not.
B) planted-faults.py on the head: every plant CAUGHT (3 new: (iii) off, awakeLights' run-offs off, runOffRims not read; the behind-edge
plant now on its shape toy; the seam plant 28 on roll 6). C) runoff.mts 1 40: verdicts 0. THEN step 4 (the ONE x40 vs THE BAR) and step 5.
**Pushback / for the lead:** (1) I fixed two ENG-DOWNBOT loop causes before the x40 (they showed unplanted on the frozen candidate in 3 of
40 adult rolls and would fail the bar's 'no loop'); the x40 still judges all of ENG-DOWNBOT's items. (2) the lit-light count the lay
adds is a design number (box 14 saw 978 of 6152 = 16% before `stops`); box 15 records it on the head.
**My miss (box 14):** I started `npm ci` with a shell '&' (the brief says never); it finished (exit 0) and nothing else ran that way.
Lessons applied: D115 (every probe/test on a frozen worktree), D119 (no heredoc in a commit chain), D128 (`date`), D134/D138 (this hand-over).

**EXACT NEXT STEP (ENG-DARK-m box 13 hand-over, 4:13 PM ET by `date`; head on t-eng-dark-wip = this commit; CODE a3117f7c0 (toys +
the onFrame bot argument; move code unchanged since f69e18fb0). Box 14 OWNS every step below. Re-fetch before every commit (D138).)**
**WAITING ON THE LEAD (asked at hand-over, one choice):** the trial merge of ENG-DOWNBOT (f1d519f25) into a3117f7c0 cures the loop
but makes 74 unlit crossings in 44 of 76 runs. (A) fix in my lane on a merged head (bot stop + darkLandings for a RUNNING step-off);
(B, recommended) ENG-DOWNBOT lands on t-eng-w3 first, box 14 lands on top, fixes and runs the x40 there; (C) land a3117f7c0 now, the
74 unlit named as a defect. Run NO gates on a3117f7c0 until the lead rules (D140).
**STEP 1 DONE (a3117f7c0, plants-box13.txt):** every darkBots plant CAUGHT (12-16, 19, 20, 28, 29), darkBots.test whole 11/11.
- Toy 3 is on a REAL row again (lead, box 12's scan-box12-jump.txt): expert Easy roll 2, cap 26: unplanted crossed 4, unlit [];
  plant 13: the rim at the right end of 225-484 gone over dark at 22.97 s. NOT a shape toy.
- SHAPE TOYS (the lead's ruling A; on the final lay no run of rolls 1-40 decides them): toy 4 and test 5 (box 12), tests 10/11
  (box 12), and box 13's toy 6 and test 7:
  - toy 6 (the KID's held thumb): roll 1, the draft's first sleeping rim (its light held asleep until 0.5 s); stood 200 px in,
    steering at it; at 130 px out his plan means to stand (intended {}, glowWait read first) until 4 s; the KID's late lift-off
    re-arms and carries him. GREEN crossed 4, unlit []; plant 16: over at 1.57 s with its landing dark. Needs the bot: onFrame now
    gets (sim, bot) (firsttimer.ts, no move change) and the toy swaps bot.intend on that run only.
  - test 7 (the trunk MID-WAY): the child Easy on roll 1 placed (bot.placeAt: route progress + checkpoint follow) at 0.5 s 10 px
    beside the deepest trunk that runs past a ledge (top 277 px above his feet, the way on down it to the shrine). GREEN: takes it,
    shrine 9.9 s, no rescue (cap 20); plant 19: rescued, shrine 26 s; plant 20: rescued, shrine 24.6-29.6 s.
- The 4 dark.ts plants that printed NO ANCHOR (anchors from before box 11's rewrite; hidden until now) are re-anchored: 3 CAUGHT
  (hung 500 px; RimWatch hides a climb; the depth bound off). The behind-edge exemption plant is MISSED: no real row decides it
  (probes/behind.mts: rolls 1-12 Normal, each sleeping rim light moved out of reach in turn: darkLandings [] planted and not). It
  needs a shape toy on a hand-built stage, or the exemption removed as dead code (an engine change: a new x40). The lead decides.
  planted-faults.py takes ONLY='name|name' to run a subset.
**THE x40 ON FROZEN a3117f7c0 (cast-3-1-x40-a3117f7c.jsonl, x40-verdict-a3117f7c.txt, x40verdict.py; 6 min a lane, two lanes):**
shrine 360/360; unlit 0; gaveUp 0; edgeTurns 0. FAILS AS WORDED: loop >= 10 on 72/360 (max 34), every crossing lit; 2 combined
rescue kinds the base lacks (5 rescues; box 9's same two). Medians vs base +20 to +39 s on 8 of 9 rows (child N +0.6): box 11's
+30-40 s IS general; clean runs +25.7 s (the dark's stops, accepted by the lead), looping runs +36.2 s.
- The loop, traced (probes/loopwho.mts): always pieces 260-509 (y 4298) and 266-505 (y 8635), each followed by a 48 px gap to a
  piece 6 px lower (553-733, y 8641). The route's way on goes DOWN that gap; at walking speed he carries over it onto the lower piece,
  the ROUTE's way flips, he walks back, every 0.65-0.8 s for 20-25 s. No dark stop involved (glowStop null). The seam rule counts a
  gap as walk-over only under 2 x LAND_HALF (42 px), so this 48 px slot with a 6 px drop is not a seam to it.
**THE TRIAL (the lead's check; trial-downbot-a3117f7c-f1d519f2.jsonl; probes/trial-downEnd-resolution.diff.txt, probes/rerun.mts):**
merge of origin/t-eng-w3-wip-downbot f1d519f25 into a3117f7c0, NOT pushed as code. One conflict: downEnd (firsttimer.ts): resolved
as ENG-DOWNBOT's wood-run body (the branch version, newer than its saved downEnd-resolution.ts.txt) with the box 12 seam rule
applied to the point it picks; ledgeEnds and downPt kept (test 7's mid-trunk grab calls downPt). tsc clean. The 76 looping/rescued
runs: shrine 76/76; loops >= 10 72 -> 3 (kid N 35: 15, adult N 35: 17, child N 6: 12); combined kinds 5 -> 1; rescues 330 -> 10;
median -81 s. NEW: 74 unlit crossings in 44 runs. Traced adult N 12 at 4.73 s: the new route goes LEFT, he runs off an edge with no
dark stop (y 753) at 268 px/s, flies 92 px, lands 7 px from the sleeping rim at the left end of 809-1036 and goes over it dark.
darkLandings models only a slow step-off (STEP_OFF 24 px after the stop), so no lay check covers a RUNNING step-off from an edge
where no stop applies. Not traced: the other 43 runs (grouped: 2 each at many rims, no single spot).
**THEN, after the ruling:** the x40 on the head that will land (bar: shrine 360/360; unlit <= 5, no loop (>= 10); no rescue kind
the base lacks); tierBots 9/9, the suite shards + the CI line ONCE on it (timeout 7200000); LAND on t-eng-w3 (merge, no force,
conflicts named; dark.test, darkBots.test, lockall on the merged head; push; the hash to the lead).
**Changes ENG-DOWNBOT's merge must keep (downEnd/glowWait/RimWatch):** downEnd's seam rule (box 12: `if (d === 0 ||
this.who.noSeamWalk) return d;` then ledgeEnds' own/run test) on the point downEnd picks; ledgeEnds; downPt (test 7); glowWait's turn
room (`if (!this.who.noTurnRoom && stop.turn !== 1) {`), glowEdgeTurns; RimWatch's over/climbed/grace rules (dark.ts 398-436).

**EXACT NEXT STEP (ENG-DARK-l box 12 hand-over, 3:22 PM ET by `date`; head on t-eng-dark-wip = this commit; CODE f69e18fb0 (move code
unchanged since box 11's 0ef63c154: e0db872f4 adds RECORDS only). Box 13 OWNS every step below. Re-fetch before every commit (D138).)**
**THE LEAD RULED (A):** hand-built toys on roll 1's REAL first sleeping rim in the real engine; no rolls 41-80 (cost); the REPORT says
the final lay no longer deals those faults on rolls 1-40, so each guard is a SHAPE toy; tests 8/9 on FTRun.dark.loop accepted.
**THE PLANTS on c5e25be9d (box 12, clean worktree, BASE RED / NO TEST guards on; plants-box12.txt):** CAUGHT 12, 15, 28, 29; **MISSED
13 (toy 3, the expert's jump), 14 (toy 4, facing: FIXED after, in f69e18fb0, hand-built; plant 14 probed RED), 16 (toy 6, the KID's
thumb), 19 and 20 (test 7, the trunk MID-WAY: castRun child Easy 25 reaches the shrine with either plant)**. darkBots.test whole on
c5e25be9d was running at hand-over (box 12 records it in plants-box12.txt).
**BOX 13 DOES FIRST (step 1 is NOT done):** re-anchor toy 3, toy 6 and test 7 so plants 13, 16, 19, 20 are CAUGHT, each like toys 4/5/
10/11 (hand-built on roll 1's real rims: onFrame + RealPlay.stand; the toy's name and asserts kept) unless a real roll is found: a scan
of the expert Normal/Easy 1-40 cap 600 with plant 13 applied was RUNNING in box 12's container (box 12 commits it as
scan-box12-jump.txt if it finishes). Shapes: toy 3, the expert running at a dark rim, its light asleep, the route's jump over it (plant
13: he jumps into the dark); toy 6, the KID landing near a rim with a held steer toward it (plant 16: he runs off); test 7, the child
stood beside a trunk mid-way, its top above him, the way on down it. Then plants 12-16, 19, 20, 28, 29 all CAUGHT and darkBots.test
whole GREEN; THEN the steps below.
**THEN, in order:** (b) FREEZE the head (a worktree, `chattr -R +i src tools reference` except src/game/gen2/proven, ruling 6) and run
ONE x40 vs THE BAR (shrine 360/360; unlit at or below 5 events, NO loop: FTRun.dark.loop / the rows; no rescue kind the base lacks):
`GEN2_DRAFT=3-1 npx tsx tools/inspect/castBots.ts --stage 3-1 --seeds 1-20 | 21-40 --setting both --par 2 --rows ...` (box 8's line), two
lanes; commit cast-3-1-x40-<head>.jsonl; median shrine time per tier x setting vs cast-3-1-x40-base-c1008d8e.jsonl (box 11 saw middle
N 16 +40 s, middle E 1 +30 s: say if general); one line to the lead. (c) ONCE on that head: tierBots 9/9, the suite shards + the CI
tool line (timeout 7200000). (d) LAND on t-eng-w3 as box 11's note says (merge, no force, conflicts named; dark.test, darkBots.test,
lockall on the merged head; push; the hash to the lead). Kid N 12 planted noTurnRoom showed loop 13: watch the x40's loop column.
**DONE in box 12:**
- Plants 28 (seam check off: downEnd `if (d === 0 || this.who.noSeamWalk) return d;` -> `|| true`; test 'a seam he walks over is no way
  down') and 29 (turn room off: glowWait `if (!this.who.noTurnRoom && stop.turn !== 1) {` -> `if (false) {`; test 'the dark stop's turn
  is never pressed at the rim's very edge'), both darkBots.test.ts (7bd941ab0; 29 plants).
- FTRun.dark gains RECORDS (e0db872f4, tsc clean, no move change): `edgeTurns` (each dark stop's turn press nearer the rim than
  min(GLOW_TURN_ROOM, piece.width/2): rim, px in, time; pushed at `stop.turn = 1`) and `loop` (rimLoop: most times one rim gone over,
  climbs not counted). toyscan.mts takes any plant field, a setting, 'both'.
- darkBots.test on 0ef63c154 (once): 8 pass, 3 fail (test 5, the seam RED 9, the turn-room RED 11). Toys 3, 4, 6 PASS unplanted.
- MEASURED on the final lay (scan-box12-rolls.txt, -turnall.txt, -giveall.txt): middle Normal 1-40 noTurnRoom: 0 unlit and 0 edge turns
  planted or not; child noGlowTurn cap 50 / 300: 0 give-ups on any roll; all bots x settings (stopped after kid easy): give-ups none;
  edge turns planted on child N 19 (13 px in, no fall), kid N 12 (7, and loop 13) and kid N 38 (7), none falling. Why no give-up: a stop
  is within GLOW_NEAR (90 px) of its rim and every landing's light is within GLOW_REACH.back (260) of it, so facing away still wakes it.
- Seam toys (tests 8, 9; 46f6e6a42): the plant's loop is now LIT (the second lights). Roll 32 adult N cap 200: planted crossed 76, loop
  31; unplanted 25, loop 3. Test 8 adds `loop < 10`; test 9 asks `max(loop, worstRim(unlit)) >= 10` (old threshold). PASS both ways.
- Turn-room toys (tests 10, 11; d4570feee) HAND-BUILT (probes/edgeturn.mts): the middle Normal roll 1 stood (RealPlay.stand at 0.5 s) 2
  px in from the draft's first sleeping rim (x 846, y 927, dir -1) facing away; GREEN: he steps back to 44 px in, edgeTurns [] and
  unlit []; noTurnRoom: the turn pressed 2 px in and that rim gone over dark (asserts both). Renamed (no 'roll 16 / x 920'). PASS both.
- Test 5 (c5e25be9d) HAND-BUILT (probes/giveup.mts): the child noGlowTurn roll 1 stood 40 px in from the same rim facing away at 0.5 s
  and 12 s, that rim's light held asleep (its glowWake entry cleared every frame): two give-ups at one rim (4.57 s, 16.07 s); plant 15
  applied (probed): one. Name and asserts kept. PASS.
- Toys 3, 4, 6 unchanged (pass unplanted); their plants 13, 14, 16 are in the running proof.
- Told the lead (a ruling asked, before building): A hand-built toys / B widen rolls / C other. Built A (cheap, reversible); if the lead
  rules otherwise, revert d4570feee and c5e25be9d's test edits.
**EXACT NEXT STEP (ENG-DARK-k box 11 hand-over, 2:57 PM ET by `date`; head on t-eng-dark-wip = this commit; CODE = this commit (rulings
1-4 built). Box 12 OWNS every step below. Re-fetch before every commit (D138).)**
**THE LEAD'S RULINGS ON BOX 10 (received by box 11, word for word in substance):** (1) 33 N: (A): the lay hangs the second light over
the step-off landing when a rim's own landing is a hop, and darkLandings DROPS the behind-edge exemption (i) for a step-off from a hop
rim; the x40 bar stays 'unlit at or below 5, no loop'; a toy each way; darkLandings/darkGaps [] over all 80 rolls. (2) child E 21 x 191
(a 2 px grounded slide on the edge grace, then back): NOT going over; RimWatch counts going over only when he leaves the ground past the
rim; a toy each way. (3) middle E 1 x 517 (a jump UP 161 px above the rim onto higher ground): NOT a crossing; same judge fix; a toy.
(4) middle N 16 x 920, a REAL fall (glowWait's turn press at the very edge): fix in the bot, general (no turn press within his slide of
the edge; turn on the spot or step back first), a toy each way on its shape. (5) darkBots test 5 + toys 3, 4, 6: RE-ANCHOR on the FINAL
lay at rolls where each planted bot crosses a SLEEPING rim unlit and the unplanted one does not; names and asserts kept; the harness's
NO TEST / BASE RED guards on. (6) src/game/gen2/proven stays WRITABLE after chattr (D115 practice; seedListChunk.test writes there); no
engine change. THEN one x40 on the frozen final head vs THE BAR (shrine 360/360; unlit at or below 5 events, no loop; no rescue kind the
base lacks), one line to the lead; then ONCE: plants (all CAUGHT, none NO TEST / BASE RED), darkBots.test green, tierBots 9/9, the suite
shards + the CI tool line; LAND on t-eng-w3 (merge what it holds: FIX-CARD-DOWN, ENG-NOISE; no force; conflicts named), then dark.test,
darkBots.test and lockall on the merged head. TIME (lead): rulings 1-4 with toys by 4:30 PM ET; the x40 line by 6:00 PM ET; LANDED by
8:00 PM ET, or at 6:00 PM tell the lead what is left. HARD STOP 8:30 PM ET.
**DONE in box 11 (commits 3b619fd57 + this one):**
- Ruling 1 (gen2/dark.ts): `dropLanding(platforms, from, dir, box, ahead)` split out of landingOf (landingOf calls it with ahead 30,
  unchanged). glowZone: a HOP rim (r.drop false) also gets a light over its step-off TOUCHDOWN (dropLanding ahead 0: rim + dir*STEP_OFF,
  kept 20 px inside the piece), same height rule, same 70 px skip. NOT at landingOf's +30 point (box 10's 'about x 897'): measured,
  there roll 32 N's hop rim 764,5649 hung nothing (within 70 px of light 41 at 880,5758, which misses the edge 712,5848 by 0.6 px), RED.
  At the touchdown: 33 N's second light is id 45 at (920, 7738), 92 px from the edge 940,7828. darkLandings: `stepLight(platforms, rim,
  zone)` (the light nearest a hop rim's touchdown reaching it); a step off a hop rim takes NO (i) exemption; lit if its own landing light
  covers the edge, or stepLight covers the edge and a stop at the rim facing over it wakes it (litAfter finite), or the old timing loop.
  probes/verdicts.mts 1 40: **darkLandings/darkGaps/darkFlags [] over all 80 rolls**, 776 awake, 4,679 asleep (+9 lights).
  Toy (dark.test): 'a hop rim's step-off landing is lit': roll 33 N GREEN; the lay without second lights (only rims' own landing lights
  kept): RED naming the rim at x 951, y 7644. PASS.
- Rulings 2+3 (RimWatch.step): a grounded step past the piece's end at its height stays ON the piece (no count). Leaving the ground past
  the rim counts at once if he is below the rim's height (+4), or on a vine (climbed); a pass ABOVE it is held (`over`) and counted (at the
  pass's time) once he sinks below the rim or grabs a vine; dropped when he lands back on the piece or on higher ground past the rim.
  Toys (dark.test, hand-fed frames on roll 1's first sleeping rim): 'a grounded slide on the edge grace ... no going over; a real step
  off still is' PASS both ways; 'a jump UP over a rim onto higher ground is no crossing; the same jump coming down below the rim is' PASS
  both ways. The old climb toy ('climbed' vs 'went over') still PASS.
- Ruling 4 (firsttimer.ts glowWait): new `GLOW_TURN_ROOM` = the slide of a TURN_FRAMES (3) frame turn press from a standstill + its
  slide after (from PHYS: 28 px). In the stop, facing away, before the turn press (stop.turn !== 1): nearer the rim than
  min(GLOW_TURN_ROOM, piece.width/2) he presses AWAY (steps back; he faces away, so no turn); then stands until |vx| <= 5; then the turn
  press as before. Plant field `noTurnRoom`. castone on this code: **middle N 16 shrine 322.1 s, 5 rescues, crossed 21, unlit []**
  (box 10 on 404d9420: 282.6/5, 1 unlit at 920); **child E 21 358.9/7 unlit []** (358.9/7); **middle E 1 288/5 unlit []** (258.2/4).
  NOTE for the x40: middle N 16 +40 s and middle E 1 +30 s and +1 rescue vs box 10; not traced (the second lights add stops).
- darkBots.test: 2 toys appended ('the dark stop's turn is never pressed at the rim's very edge' GREEN PASS; its plant 'noTurnRoom' RED
  FAILS: on the FINAL lay roll 16 no longer reaches the edge turn even planted (probes/turnroom.mts middle normal 16 1: shrine, 5, unlit
  []). It needs RE-ANCHORING with toys 3, 4, 6 and test 5 (ruling 5).
- dark.test whole on this code (run once, unfrozen tree, no edits during it): **15/15 pass**. darkBots.test whole NOT run in box 11.
**BOX 12 DOES, in order:** (a) RE-ANCHOR (ruling 5) on this lay with toyscan.mts (extend it with a 'noturnroom' flag for the new plant):
test 5 + toys 3, 4, 6 + the turn-room RED, each at a roll where the planted bot crosses a SLEEPING rim unlit and the unplanted one
does not; names and asserts kept. (b) planted-faults.py: plant 28 (the seam check, box 10's step 4) and plant 29 (the turn room:
glowWait's `if (!this.who.noTurnRoom && stop.turn !== 1) {...}` block removed -> the turn-room RED goes GREEN-fails). (c) freeze; ONE
x40 vs THE BAR; one line to the lead. (d) the gates once; LAND on t-eng-w3; dark.test, darkBots.test, lockall on the merged head.
**FOR ENG-DOWNBOT's merge, the exact downEnd/glowWait changes:** downEnd as box 10 wrote below (the d / noSeamWalk / ledgeEnds check
before its return; ledgeEnds; LAND_HALF import; FirstTimer `noSeamWalk`). glowWait (box 11): consts `TURN_FRAMES = 3` and
`GLOW_TURN_ROOM` after GLOW_GIVEUP; FirstTimer `noTurnRoom` after noGlowTurn; in the stop's turn branch, before `stop.turn = 1;`:
`if (!this.who.noTurnRoom && stop.turn !== 1) { if ((rim.x - p.x) * rim.dir < Math.min(GLOW_TURN_ROOM, rim.piece.width / 2)) return
rim.dir > 0 ? { left: true } : { right: true }; if (Math.abs(p.vx) > 5) return {}; }` (+ its comment).
**EXACT NEXT STEP (ENG-DARK-j box 10 hand-over, 2:13 PM ET by `date`; head on t-eng-dark-wip = this commit; CODE 404d9420 (the bot fix);
no lay change yet. Box 11 OWNS every step below. Re-fetch before every commit (D138).)**
**DONE in box 10, the lead's ruling 1, fix (a) (commit 404d9420), measured by castone on the new head:**
- 32 N adult: unlit 31 -> **0** (shrine 245.8 s, 6 rescues; 0dadb295 243.2/6; base c1008d8e 233.9/5). 32 N kid: 26 -> **0** (285.6 s, 8;
  0dadb295 299.4/9; base 235.7/7). Fix (b) (the lay's seam) NOT needed for the loop; not built.
- Cause, measured (probes/downend.mts, which wraps downEnd from outside): the route's way-on point under him was x 337-343 (y 9719-9741),
  INSIDE the 35 px seam between 79-332@9676 and 367-547@9682 (the route drops through it to 341-574@9806, sealed under 367-547 and
  547-721: probes/seam.mts). downEnd pointed him at it from both pieces; he walked over the seam each way.
- **THE downEnd CHANGE, exactly (for ENG-DOWNBOT's saved resolution, t-eng-w3-wip-downbot probes/downEnd-resolution.ts.txt):** in
  downEnd, after `const dx = at.x - p.x;` the return became: `const d = dx > 8 ? 1 : dx < -8 ? -1 : 0; if (d === 0 ||
  this.who.noSeamWalk) return d; const end = this.ledgeEnds(p, d); return end && (at.x - end.own) * d > 0 && (at.x - end.run) * d <= 0
  ? 0 : d;` (+ its comment). NEW private `ledgeEnds(p, d): {own, run} | null` right after downEnd: own = the end going d of the piece
  at his feet (top within 8 px, p.x within LAND_HALF of it); run = the end after joining every next piece at that height (top within
  8 px) whose near end is less than 2*LAND_HALF out. downPt UNCHANGED. `LAND_HALF` added to the physics.ts import. NEW FirstTimer field
  `noSeamWalk` (the plant). DOWNBOT re-applies by keeping its own body and adding the d / noSeamWalk / ledgeEnds check before its own
  `return`, against its own `at` (its wood run joins gaps of 2 px and tops within 4 px, so it does NOT join this seam: 35 px, 6 px).
- Variants measured and NOT kept (unlit [] too, but slower): a wood run joined over seams + the first way-on point off it ("broad"):
  adult 282.9 s/8, kid 271.5/7; the same only when a seam joins ("scoped"): 288/8, 272.7/7.
- darkBots.test: 2 new toys on roll 32 (GREEN 'a seam he walks over is no way down'; RED with noSeamWalk: one rim dark 10+ times): 2/2
  pass (12 s). The WHOLE darkBots.test on 404d9420 (unfrozen, 36 s): **8/9, test 5 red** ('a dark give-up ends with the visit'; the
  known stale toy, re-anchored on the final lay), every other test green.
- **kid Normal 27 (ruling 3's first item), measured (probes/plantone.mts):** with noSeamWalk (0dadb295's downEnd exactly) it STRANDS at
  195.4 s as box 8's row did ('fell back down from here 3 times' at x 1155, y 10670; crossed 70); with the fix: **shrine 202.4 s, 4
  rescues, crossed 19, unlit []** (base 158.1/3). One field turns the strand on and off: the seam rule. Not traced frame by frame.
- adult 33 N on the new head: shrine 255 s, 6 rescues, unlit [] (0dadb295: 276/7, 1 unlit at the behind edge x 940, y 7828). The path
  moved; the LAY FIX is still owed by the ruling (the behind edge is not lit by design yet).
**THE LEAD'S RULINGS ON BOX 10 (message read in box 10):** (a) ACCEPTED; (b) stays UNBUILT. Kid N 27 RULED FIXED by (a); do NOT trace
the 1155,10670 fall (the fresh x40 judges it; a rescue kind the base lacks there gets traced then). 33 N: KEEP the lay fix ('a player
can turn back exactly as box 8's adult did'): the second light over the step-off landing when the rim's own landing is a hop, a toy each
way, darkLandings/darkGaps [] over all 80 rolls. (That ruling was sent BEFORE box 10's A/B/C question on the behind-edge exemption,
below: read the lead's answer to it before changing darkLandings' meaning.)
**BOX 11 DOES, in order (the lead's ruling 3-5):**
(1) DONE by the lead's ruling: kid 27 fixed by (a).
(2) The 33 N LAY FIX (gen2/dark.ts lay): a second light over the step-off landing when the rim's own landing is a hop (landingOf gives
the hop; stepOnto gives the step-off piece). A toy each way in dark.test; darkLandings/darkGaps [] over all 80 rolls (probes/verdicts.mts).
Check roll 32's seam toys still RED/GREEN after it (the lay fix may light rim 367's step-off landing; the planted RED reads unlit).
POINTERS (box 10 read, not built): the lay is glowZone (dark.ts :186): one sleeping light per darkRims(probe) landing, at
{land.x, min(land.y - lightUp, r.y + GLOW_REACH.down)}, skipped within 70 px of another. A rim with `drop: false` is a hop (landingOf
:120); its step-off piece is stepOnto(platforms, r.piece, r.dir) (:109); the drop landing x is landingOf's own formula (clamp
rim + dir*(STEP_OFF+30) into the piece 20 px in). The x40's crossing judge (RimWatch.step :375) reads ONLY r.light (the light nearest
the HOP landing), and darkLandings (:269) passes an edge BEHIND the landing by (i) (`n.dir !== u.dir`). So for '33 N's behind edge lit'
to read lit, check on probes/rim.mts 33 normal 940 7828 which light the crossing of rim 940 reads and whether the stop that wakes it
happens: the second light only helps if a stop wakes it or it becomes that rim's r.light. If it needs a verdict/judge change (the
crossing judged by the landing he actually comes down on), that is a meaning change: say so to the lead before building it.
33 N's SHAPE, read (probes/rim.mts 33 normal 940 7828; layout only): rim 940 (right end of 704-940@7828) is itself a DROP onto
691-1054@7996, its light id 43 (1018, 8079) asleep. THE HOP RIM is rim 951, the LEFT end of 951-1199@7644: its own landing is a hop onto
632-812@7650 (139 px across, 6 px down), but a step off it (x 927) lands on 704-940@7828, 13 px from rim 940 BEHIND him (n.dir +1,
u.dir -1: (i)'s exemption passes it). The lay fix's second light goes over that step-off landing (landingOf's drop formula from rim
951 going -1: about x 897, y 7738); it is about 276 px from rim 940's own landing (994, 7996), so it lights the EDGE he lands by, not
rim 940's landing: whether the verdict then drops the behind-edge exemption is the lead's reading of 'behind edge lit'. Ask before
changing darkLandings' meaning.
(3) The 7 single crossings, RE-MEASURED by box 10 on 404d9420 (castone): STILL THERE, 3: child E 21 x 191, y 1562 (left end of
191-433) at 24.27 s (shrine 358.9 s, 7 rescues); middle E 1 x 517, y 2867 (right end of 268-517) at 38.27 s (258.2/4); middle N 16 x 920,
y 7104 (right end of 760-920) at 167.23 s (282.6/5). GONE on the new head (the path moved; not traced, so not 'fixed' by design): adult
33 N (255/6), expert 31 N (266.7/5), middle E 32 (289.2/5), middle N 31 (258.8/4). Trace the 3 (probes/loop.mts at each rim/time) and fix
or take to the lead; re-check all 7 after the lay fix.
CHILD E 21, TRACED by box 10 (probes/loop.mts child easy 21 191 1562 21 24.6; rim.mts 21 easy 191 1562): rim 191's own landing is a drop
onto 77-443@1725, light 6 (137, 1635) asleep. He walked right on 77-443, jumped UP at x ~231, came back left in the air and landed on
191-433 at x 211 (24.10 s) moving left at about 173 px/s, slid to x 189 (2 px past the rim, STILL GROUNDED at y 1562, the engine's grace)
and turned right (24.30 s). He never went over: RimWatch.step counts any grounded step past the piece's end as a crossing. Not a step
off, so darkLandings (drops only) does not cover the arrival. Two readings for the lead, neither built: (a) the judge: a grace overshoot he
comes back from grounded, never leaving the piece's height, is no crossing (a meaning change of the x40's count); (b) the bot: a jump
onto a dark rim's piece lands at least his stopping distance from its rim (glowWait has 20 px at 173 px/s). MIDDLE E 1, read (loop.mts middle easy 1 517 2867 36.8 38.8): a
JUMP UP, not a way down: in the air from 268-517@2867 going right at 285 px/s, he passed x 517 at y 2706 (161 px ABOVE the rim) at 38.27 s
and landed on a higher piece at (562, 2759). RimWatch counts any pass of the end x after leaving the piece; the lead rules whether a jump
up off a rim's piece to higher ground is a crossing (a judge reading, not built). MIDDLE N 16, read (loop.mts middle normal 16 920 7104
165.8 167.8): A REAL FALL: walking left at 268 px/s from a piece at about y 7098 he crossed a small gap at x ~943 (one frame of air) onto
760-920@7104 (y 7104, 6 px lower), stopped at x 918 (167.13 s), turned right at 167.27 s with NO light woken (45, 42, 43 asleep, 41
awake) and fell through that gap to y 7244 (140 px). The seam is walked over going left (downhill 6 px) but not going right from a
standstill (uphill 6 px). WHY, measured (downend.mts middle normal 16 920 7104 166.5 167.5; seam.mts ... 167.1): the gap is
920 -> 970 (760-920@7104 and 970-1212@7098), 50 px, WIDER than his body (2*LAND_HALF 42), so the seam rule rightly leaves it: the
route drops through it (978,7098 -> 945,7223 -> 820,7244 onto 716-962@7244). At 267 px/s he crossed it leftward, landed at x 924 (ON
THE ENGINE'S GRACE, 4 px past 920), and downEnd turned him back right toward the way on (pick 1 from 167.07 s): the RIGHT way. The fault:
glowWait never stopped him at rim 920 because he stood at x 919-924, at or past the piece's end (floor '-' at 924 and 920): THE SAME
1-PX MISS box 9 found at rim 367 (glowWait's on(r) reads p.x against the piece; the engine has him standing on it). NEXT FIX (general,
a toy each way): glowWait's 'on the rim's piece' reads the engine's standing piece (e.standingOnId) or allows LAND_HALF past its end;
then re-measure middle N 16, and check rim 367 on 32 N stays clean. THE LINE: firsttimer.ts glowWait
`const on = (r: DarkRim) => p.grounded && p.x >= r.piece.x && p.x <= r.piece.x + r.piece.width && ...` (about :3385 on 404d9420). TRACED
by box 10 at 30 fps (probes/glowwait.mts middle normal 16 920 7104 166.95 167.3, wraps glowWait from outside): glowWait DID start the
stop at rim 920 (167.10 s, x 919.0, facing -1, sliding left), then pressed RIGHT to face the rim (turn 1, 167.13-167.20; he had slid to
917.6, 2.4 px from the edge). The press turned him AND moved him: at 167.23 x 920.5 facing +1, vx 87 (standingOnId still 105: the
engine's grace). on(rim) went false (p.x > 920), the stop was dropped (ret null), and he walked off (air at 167.30). RimWatch counted the
crossing at 920.5 (a grounded step past the end). So the FAULT IS THE TURN PRESS AT THE RIM'S VERY EDGE, not downEnd. A general fix
(a toy each way, roll 16 middle Normal): a stop whose turn would carry him past the rim (he stands within a turn's slide of it, about
3-6 px) first steps him back from it, or turns without the press moving him; reading on(r) from standingOnId alone is NOT enough
(RimWatch already counts 920.5 as over). Box 9 found the turn not the cause at 367; here it IS the cause.
The lead was ASKED (box 10, with this evidence) which bar '33 N's behind edge lit' means: (A) the second light + darkLandings drops the
behind-edge exemption for a step-off from a hop rim; (B) A + the x40 crossing over 940 reads lit (a judge change); (C) other. Box 10
said it would build A unless the lead says otherwise: read the lead's answer first.
(4) Add plant 28 to planted-faults.py: the seam check removed (downEnd's `if (d === 0 || this.who.noSeamWalk)` line onward) -> the seam
GREEN toy goes RED. (5) Re-anchor toys 3, 4, 6 and darkBots test 5 on the FINAL lay (toyscan.mts). (6) ONE fresh x40 vs the bar; (7)
the gates once; LAND on t-eng-w3 (the lead's ruling 5).
**EXACT NEXT STEP (ENG-DARK-i box 9 hand-over, 1:58 PM ET by `date`; head on t-eng-dark-wip = this commit; CODE still 0dadb295's: box 9
changed no src or tools file. Box 10 OWNS every step below. Re-fetch before every commit (D138).)**
**THE LEAD'S REDIRECTED ORDER (two messages, word for word in substance; 0dadb295 will NOT land, box 8's x40 failed the bar):**
(1) trace + fix the 32 N loop (general, a toy each way); (2) kid N 27's strand (195.4 s, 4 rescues; base shrine 158.1 s, 3); (3) the 33 N
LAY FIX (a second light over the step-off landing when the rim's own landing is a hop; a toy each way; darkLandings/darkGaps [] over all
80 rolls); (4) the 7 single crossings, each fixed or ruled by the lead with evidence; THEN re-anchor darkBots toys 3, 4, 5, 6 on the
FINAL lay (below); then ONE fresh x40 vs the bar (shrine 360/360; unlit at or below 5 events with NO loop; no rescue kind the base
lacks; 33 N's behind edge lit; one line to the lead with the table); then the gates ONCE on that frozen head (plants: all 27 CAUGHT, no
NO TEST, no BASE RED; tierBots 9/9; the suite 3 shards; the CI line), the every-landing-awake count again, and LAND on t-eng-w3.
TIME: steps 1-3 with their toys by 4:00 PM ET; the fresh x40's line by 5:00 PM ET; if it cannot land by 7:30 PM ET, tell the lead
at 5:00 with what is left; HARD STOP 8:00 PM ET.
**Step 1, the 32 N loop, TRACED (probes/rim.mts, probes/loop.mts; adult Normal 32 on 0dadb295's code), NOT fixed:**
- The rim x 367, y 9682 is the LEFT end of 367-547@9682; its "landing" is a HOP across a 35 px SEAM onto 79-332@9676 (6 px higher),
  landing (302, 9676), its light id 54 at (302, 9586) ASLEEP, never woken in the loop. Neither the cave mouth nor the depth cap moved
  or slept light 54 (it sits 90 above its landing, as the lay always hung it). Light 51 (427, 9592) is AWAKE (cave mouth): it is the light
  of rim 332, the right end of 79-332, whose hop lands on 367-547.
- The bot PING-PONGS over the seam: from the vine at x 99 he walks right, over the seam (one frame of air at x 351), stops at x 368,
  turns, walks left over the seam (the crossing, at x 365: the engine's grace past the edge), stops at x 315, turns right... every 0.67 s
  (183.30, 183.97, 184.63 ...). He walks the seam without falling: for Pokey it is floor, for isRim (12 px) it is two rims.
- Why it went dark on 0dadb295: before ruling (ii), rim 332's light 51 slept, so glowWait stopped him at x 315 (17 px from rim 332,
  facing it) and that stop also woke 54 (13 px behind him, inside GLOW_REACH.back 260): every later pass over 367 was lit. With 51 laid
  awake, no stop at 315, so 54 never wakes. Experiment (mouth put back to sleep, third worktree): no frame near the rim 182-190 s and
  unlit [] through 191 s (the path differs).
- Why glowWait does not stop him at 368: the turn left is decided while his x is 366 (1 px OUTSIDE 367-547 by p.x, though the engine
  has him standing on it), so glowWait's on(r) is false and no stop starts; the press lands 3 frames later (SNAP_THUMB) and he is over.
  Experiment: the stop's turn made conditional (turn only when the light is out of reach facing his way): the SAME loop (the turn is
  not the cause; reverted).
- MY READING (box 10 checks it first, one experiment): the ping-pong is downEnd() (firsttimer.ts, 'a way DOWN: the end of his ledge to
  step off ... nearest the way on'): on 79-332 it picks the right end, on 367-547 the left end, because each end's step-off lands on the
  OTHER piece at his height. A hop across a seam is not a way down. Candidate general fixes, each needs a toy each way: (a) BOT: downEnd
  never picks an end whose step-off lands at his height (a hop across); (b) LAY/VERDICT: a gap he walks over (narrower than his body,
  within a step of his height) is not a rim (isRim): this moves lights on every roll, so the 80-roll loop and the x40 judge it; (a) is
  the smaller change; the lead rules if (a) does not clear the kid's 26 too. First experiment: log downEnd(p)'s return per frame
  183.0-184.0 in probes/loop.mts (a debug field, never committed in firsttimer).
**DONE in box 9 (all on 0dadb295's code; commit 51e74b46 + this one):**
- The plant harness (approved by the lead): the filter is ESCAPED (node reads --test-name-pattern as a regex; "own kind ('climbed')"
  matched no test, so plants 17/18 read MISSED and had never run from the script since box 5); a plant whose filter runs no test prints
  NO TEST and fails; a plant whose toy is RED unplanted prints BASE RED and fails (plant 15 read CAUGHT only because its toy was already
  red); a second argument runs a subset (`planted-faults.py <wt> 17,18`). The countermeasure for 'a check that runs nothing reads as a
  pass' (two holes, both in this harness).
- Plants on 0dadb295, unfrozen worktree, the committed script: 27 run in 8 min 39 s, 22 CAUGHT, 5 MISSED (13, 14, 16, 17, 18). With the
  fixed harness: 17 and 18 CAUGHT; 15 BASE RED.
- **darkBots.test 6/7 on frozen 0dadb295: test 5 'a dark give-up ends with the visit' FAILS ("two waited-out stops: []").** Box 8 ran
  dark.test only.
- The stale toys, measured (plant + the cave mouth put back to sleep, third worktree): toy 4 (plant 14, child roll 19) RED again at its
  own rim x 974, y 3098 at 42.07 s; toy 6 (plant 16, kid Normal roll 16) RED again at its own rim x 956, y 5113 at 73.90 s; toy 5 (test
  5) waits at that same rim 974. Those rims are now cave-mouth rims laid awake, so the bots never stop there. Toy 3 (plant 13, expert
  roll 12) stays green with the mouth asleep too: another cause, not traced. RE-ANCHOR toys 3-6 AFTER steps 1-4 (the lead), by a search
  over rolls 1-40 (about 10 s a run): a roll and cap where the planted bot crosses a SLEEPING rim unlit and the unplanted bot does not;
  each toy keeps its name and asserts.
- tierBots 9/9 on frozen 0dadb295 (3 min 23 s). Holds for the new head only if firsttimer.ts and 1-1 do not move (a bot fix moves it).
- **The lead's ruling 1, the every-landing-awake count** (probes/awake.mts 1 40, frozen 0dadb295): **0 of 912 glowworm zones over 80
  rolls** have every landing awake (zones by the share of their rims lit awake: none 372, under half 501, half or more 39, all 0); no
  zone without a rim; no rim without a light. The probe's own plant (PLANT_AWAKE=1: every glowworm awake) counts 48/48 on rolls 1-2.
  The lead: "0 of 912 zones all awake, good." Re-count on the final lay.
- **RUNNING in box 9's container (box 9 finishes and records ONLY this, D138):** the suite on frozen 0dadb295, 3 shards one after another
  (to surface other reds; the lead: "let it finish, record it, start nothing else on 0dadb295"); the CI line was CUT from the chain.
  Box 9 commits the result as ENG-DARK/suite-0dadb295.txt (re-fetch, merge, never force).
**EXACT NEXT STEP (ENG-DARK-h box 8 hand-over, 1:37 PM ET by `date`; FINAL CODE HEAD 0dadb295 on t-eng-dark-wip, FROZEN in box 8's
container (wt-h, `chattr -R +i src tools reference`). Box 9 OWNS every step below. Re-fetch before every commit (D138).)**
**RUNNING in box 8's container (box 8 finishes and records ONLY these, D138):** the x40 on frozen 0dadb295, two lanes:
`GEN2_DRAFT=3-1 npx tsx tools/inspect/castBots.ts --stage 3-1 --seeds 1-20 | 21-40 --setting both --par 2 --rows ...`. Box 8 commits
the rows as cast-3-1-x40-0dadb295.jsonl and the verdict (unlit 0 or each traced; shrine 360/360; no rescue kind the base lacks).
**Box 9 does, on 0dadb295 (2 heavy runs at most):** (1) plants: a worktree of 0dadb295 NOT chattr'd (planted-faults.py writes and
restores), `python3 reference/qa-reports/ENG-DARK/planted-faults.py <wt>`: 27 plants, all CAUGHT (7 new: cave mouth asleep, every light
awake, no room asked of an outside drop, (i) off, a behind edge judged, the depth bound off, an awake light lit from anywhere; plant 4's
anchor moved with the depth bound). The 80-roll loop makes each 'the brick on a real World 3 row' plant about 2.5 min. (2) tierBots
9/9 (`npx tsx --test tools/inspect/tierBots.test.ts`), (3) the suite (3 shards) and the CI line (gates.yml, read from the tree), all on a
frozen 0dadb295. (4) LAND (order item 7): t-eng-w3 is still c1008d8e, already in this branch (merge is a fast-forward or no-op; no
force); ENG-DOWNBOT-i lands after and removes its fix B; lockall on the frozen final merged head (`lockall --layouts 16 --out
lock-base.json` on frozen c1008d8e, `--check` on the merged head: no listed stage moves). Send the lead the hash, what 3-1/3-2's READY
can measure, the light API line for ENG-SPORE (ADR-004).
**BOX 8'S x40 ON FROZEN 0dadb295 (recorded after the hand-over, 1:44 PM ET by `date`; rows cast-3-1-x40-0dadb295.jsonl, 360): IT FAILS THE BAR.**
- shrine **359/360**: kid Normal 27 STRANDED at 195.4 s, 4 rescues (base c1008d8e: shrine 158.1 s, 3). A new strand; box 4's child Easy 25
  strand is gone (box 6's (a)).
- unlit **66 lines = 9 events in 9 runs** (box 4's f68c5ca1: 5; base 0):
  - LOOPS, both on 32 N, the rim x 367, y 9682 (left end of 367-547), crossed with its landing dark every 0.67-0.8 s: adult 31 times
    (from 183.3 s), kid 26 times (from 239.2 s). Expert 32 N crossed it once.
  - Once each: adult 33 N x 940, y 7828 (THE BEHIND EDGE, below); child Easy 21 x 191, y 1562; expert 31 N x 929, y 10127; middle Easy 1
    x 517, y 2867; middle Easy 32 x 561, y 10406; middle 16 N x 920, y 7104; middle 31 N x 965, y 6563 (twice).
- gaveUp 0. Rescues 1,368 (base 1,393). Rescue kinds the base lacks: 2 ('a drop of N px ahead, a trunk beside him, the way on is N px
  down', and the same 'in a dip'). Box 4's f68c5ca1 had these and more, so they are not new to this head, but they still fail the bar.
- **The lead's condition on 32 N / 33 N (no rescue from turning back at those landings): NOT MET at 33 N.** Adult 33 N went over the
  behind edge x 940, y 7828 (right end of 704-940) with its landing dark at 184.47 s. The rows carry no rescue height, so whether a
  rescue followed cannot be read from them. 33 N's rescues near x 931-981 were already there on f68c5ca1 (x 935-972).
  32 N: no crossing of the behind edge x 712; rescues near it (x 650-732) were also there on f68c5ca1.
  Per the lead's own rule, the lay fix comes in before the landing: a second light over the step-off landing when the rim's own
  landing is a hop.
- **Not traced (box 8 stopped at the hand-over): the 32 N loop over x 367, the 7 single crossings, and the kid 27 N strand.** First
  look for box 9: the loop rim's light (awake? at the depth bound? did the mouth or depth change move it?) with `castone` on adult 32 N.
  Then the lay fix, then a fresh x40 on the new final head. The plants, tierBots, the suite and the CI line all follow the new head.

**DONE in box 8 (0dadb295), dark.test 12/12 (2 min 13 s), tsc clean:**
- (i) darkLandings: a drop off a DARK rim passes when the edge he lands toward lies inside the drop rim's own landing light (or, as
  before, the stop wakes that edge's own light in time). An edge BEHIND the landing (n.dir against u.dir) is not one he lands toward:
  the slow step carries him away; he reaches it only by turning back by choice. **This last line is MY reading of 'the edge he lands
  toward'; it is what clears 32 N and 33 N (below). The lead may overrule: then those two need a lay fix (a second light over the
  step-off landing of a rim whose own landing is a hop).**
- (ii) glowZone: entryPieces(platforms, box) = every piece a step off a rim OUTSIDE the box comes down on; the light the verdicts read
  over the landing of each rim of such a piece is laid awake (sleep false, id kept). **My reading of 'a light over a piece that an
  outside rim steps onto': the lights of that piece's rims (what lights its edges); that is what makes box 7's B column pass.**
  Count, rolls 1-40 both: **776 lights awake, 3,811 asleep (17%, about 10 a roll)**: more than one mouth per stretch, because the
  tower's side rims outside the box step onto many pieces. The lead should hear this number.
- The engine draws an awake glowworm (id, sleep false) as one awake GLOW_AWAKE_AGE 60 s (hanging lit); before, only sleeping ones were
  drawn, so the mouth's light had no source. Firefly lights (no id) are untouched.
- litAfter: an awake light counts only within the stop's reach (found when darkFlags' plant went GREEN: an awake light anywhere in the
  zone made every flag lit). Same reach as a sleeping one.
- Item 3: a light hangs no deeper than GLOW_REACH.down under its rim (`Math.min(land.y - lightUp, rim.y + GLOW_REACH.down)`).
  21 N, 21 E, 40 E darkGaps: 0. Planted RED on roll 21 N (its light at the old spot: named).
- Item 4: dark.test's loop is all 80 rolls: per stretch the pin 'every light inside the dark sleeps, EXCEPT the landings you reach
  from outside it: the cave mouth is lit' (awake == the mouth's set exactly; some light still sleeps), ids unique, darkGaps,
  darkFlags, darkLandings all []. Planted: roll 30 Easy, the mouth's lights put back to sleep: darkLandings names u 175,2190 (RED).
- **Item 2, the 9 traced** (probes/trace9.mts; every one: the drop rim's own landing is a HOP across, so its light lights the hop):

| roll | drop rim u -> edge n | room | n is | passes by |
|---|---|---|---|---|
| 9 E | 895,2000 right -> 1022,2266 | 103 | ahead | (ii): n's piece is a cave-mouth piece, its light awake |
| 13 N, 13 E | 976,1620 left -> 1035,1714 | 83 | behind | (ii) cave mouth (and behind) |
| 19 N | 456,6042 right -> 432,6261 | 48 | behind | (ii): n's light is shared with a cave-mouth rim's (and behind) |
| 22 N | 987,1681 left -> 1040,1802 | 77 | behind | (ii) cave mouth (and behind) |
| 26 E | 389,1475 left -> 258,1740 | 107 | ahead | (ii) cave mouth |
| 27 E | 291,2146 right -> 219,2242 | 96 | behind | (ii) cave mouth (and behind) |
| 32 N | 764,5649 right -> 712,5848 | 76 | behind | the behind reading only |
| 33 N | 951,7644 left -> 940,7828 | 13 | behind | the behind reading only |

- probes/verdicts.mts 1-40 on 0dadb295's code before the behind line: LAND 2 (32 N, 33 N), GAPS 0, FLAGS 0; with it: all 0 (dark.test).
- **The light API line for ENG-SPORE (ADR-004; ADR-004 is not on this branch, so check it against the Architect's text):** a brick
  lights the dark by pushing `{ x, y, r, sleep?, id? }` into a `dark` Zone's `lights` (zones.ts). `sleep: true` + a stage-unique `id`
  (gen2/dark.ts GLOW_ID counter in sink.extras, as glowFlags does) = a glowworm a stop wakes (glowReaches, GLOW_REACH); `sleep: false`
  + `id` = one laid awake, drawn lit (the cave mouth); no `id` = a plain light (World 6's fireflies). The verdicts read every light in
  the zone: darkRims takes the nearest light that reaches a landing; litAfter counts an awake one only within GLOW_REACH; darkGaps,
  darkFlags, darkLandings on the laid stage, RimWatch + litAhead on a run. A carried kit light (kit.lights(), the mushroom) is drawn
  by the engine but read by NO verdict: if a spore's light must count for 'lit 1 s ahead', it goes into the zone's lights (or the
  verdicts learn kit lights: an Engine packet).
- **Item 5 stills** (seed 1, Pokey on the mouth piece, stillness held at 0): stills/3-1-land-mouth.jpg reads as the cave mouth (the awake
  glowworm lights the two steps by him; two sleeping ones below with their z's). stills/3-1-port-mouth.jpg: the same pair, but Dot's
  real first-time line ('Too dark to see. Stand still and listen...') covers the middle; the awake one and a sleeping one show above
  and below it.

**EXACT NEXT STEP (ENG-DARK-g box 7 hand-over, 1:19 PM ET by `date`; head on t-eng-dark-wip = be91c547 (a) + darkLandings RESTATED, not
wired; glowZone UNCHANGED from base (the growth is out). Box 8 OWNS EVERY CODE CHANGE. Re-fetch before every commit (D138).)**
**WAITING ON THE LEAD'S RULING (sent with the numbers): (i)+(ii), (i) alone, or (iii) below. Do not build past it.**
- darkLandings (gen2/dark.ts) is now box 6's restated model. Helpers: rimEnds, stepOnto, isRim, STEP_OFF 24 (landingOf uses it too).
  The model: a step off ANY rim (dark or not) onto a dark rim n's piece must land darkStop(setting) from n along n.dir, OR the drop's
  rim is a dark rim whose stop wakes n's light within its own wait + DARK_AHEAD. A rim outside the dark passes on room only.
  NOT in any test yet. dark.test 10/10 on this head.
- **RED as planted:** roll 30 Easy names u 175,2190 onto n 241,2477, room 90 < 149 (the real event).
- **Measured, rolls 1-40 both settings** (probes/landvar.mts: A = the rule as ruled; B = A's hits whose drop rim is outside every dark
  box; C = B + dark-rim hits whose target edge lies OUTSIDE the drop rim's own landing light; gaps = darkGaps; flags = darkFlags):

| glowZone | A | B (outside) | C | darkGaps | rolls named A/B/C |
|---|---|---|---|---|---|
| base (no growth) | 669 | 581 | 590 | 3 | 80/80/80 |
| widen x only, height kept (b43526c5) | 1328 | 953 | 1001 | not run | 80/80/80 |
| widen x + top while the landing light stays within GLOW_REACH.down | 1076 | 2 | 146 | **237 (63 rolls)** | 80/2/56 |
| widen x + top, unbounded | 1140 | 2 | not run | breaks seed 1 N (dark.test) | 80/2/- |

- **Why growth fails:** widening the box takes in EVERY rim now inside it, not just the one we grew for. The new wall-side rims
  (x 34-40) and long drops get lights 500-700 px below, which no stop wakes (GLOW_REACH.down 420).
- **Why A cannot reach 0 without the tower:** a dark rim's step off on the 114 px shelf step lands 90 px from the next rim. That
  rim's light is about 480 px below the drop rim, out of a stop's reach. This is the tower's ordinary stair. tower.ts is NOT touched.
**The options put to the lead:**
- (i) A dark-rim drop passes when n's edge lies inside the drop rim's own landing light: the face-the-rim stop lights the edge he
  lands toward. Base: 9 dark-rim hits are left; list them with landvar's 'C' lines.
- (ii) Outside drops: in glowZone, a light over a piece that an outside rim steps onto is laid AWAKE (sleep false). darkLandings and
  darkGaps already pass awake lights. No cascade, no tower change. It breaks dark.test's pin "every light is a sleeping glowworm",
  which is a design rule.
- (iii) Drop the lay rule; the x40's unlit count is the measure.
**On the ruling:**
1. Change darkLandings to the ruled model.
2. Wire darkLandings == [] into dark.test's seeds 1-4 loop. Add a roll-30-Easy test, RED without the fix.
3. Run landvar 1 40: every column 0, darkGaps 3 or fewer and each one traced.
4. lockall (only the 3-1 draft may move).
5. Then box 5's freeze, x40, plants 20+, tierBots, suite and CI line, and the landing.
**EXACT NEXT STEP (ENG-DARK-f box 6 hand-over, 1:00 PM ET by `date`; code head be91c547 on t-eng-dark-wip = 4527e73f + (a); the
(b) WIP 84d3bcdb on top: darkLandings written, not wired, the wrong model, below). Box 7 OWNS EVERY CODE CHANGE. Re-fetch before every commit (D138).**
(a) **DONE, GREEN (be91c547).** The one condition alone was NOT enough (measured): with the top asked both ways he no longer holds down,
but the route's next point lies straight down trunk 26 through his piece, so downEnd() turned him left and right at x 1069-1130 to the
same strand at 295.9 s. From the ground mid-trunk the engine takes a trunk only with UP (engine.ts wantGrab; downAtTop is the top only).
So the way-down plan (firsttimer.ts, the `this.onTower && e.nearTreeVine ...` block) now: (1) presses DOWN only with the top AT his feet,
`Math.abs(topY - p.y) <= 14` (the engine's), and (2) with the top above him and the route's next point under him ON the trunk
(downPt(p), |x - trunk x| <= 16), presses UP to catch it with `grabDown` set, so that climb's way is down (climbDown = grabDown || ...).
downEnd() now reads the new downPt() (same rule, one place). **child Easy 25: stranded 295.9 s -> shrine 276.7 s, 4 rescues** (base row
with noGlowWait: shrine 278.8 s, 6). Toy: darkBots.test 'the way down a trunk he stands beside MID-WAY' (castRun child Easy 25 reaches
the shrine; 8 s): GREEN on be91c547, RED on 4527e73f (castone: stranded 295.9). Plants 19 (the top test one-sided again) and 20 (no
mid-trunk up grab): both CAUGHT (stranded 295.9 each, scratch copy; the frozen-tree run of all 20 is owed on the final head).
**Tell ENG-DOWNBOT-g (the lead relays): the change is that whole block plus `grabDown`, `downPt()` and downEnd's body, not one line;
their lane must not edit them; their tests (w3.test, tower.test, castBots.test down toys) run on the merged head.** Still open from
box 5: why the goal reads 0 of 1 on that roll (the base 1 of 1); now it reaches the shrine, read castRun's goal once.
(b) **THE VERDICT AS BOX 5 DESIGNED IT IS THE WRONG MODEL (measured; the lead must hear this before more is built on it).** darkLandings
is written in gen2/dark.ts (DARK_LAND_REACT = PAD_FAIR.react 0.3 s, Easy x DARK_AHEAD.easy/normal = 1.6 (PAD_FAIR has no Easy scale; the
dark family's own Easy factor), darkStop = maxRun * react + maxRun^2 / (2 groundDec): **97 px Normal, 149 px Easy**; DarkRim now carries
`onto` and `drop` from landingOf). It is NOT wired into any test or check yet. probes/landings.mts over rolls 1-40 both settings: **52 of
80 rolls named, nearly all with NEGATIVE room (-23 / -89 px)**: a full-run drop off a dark rim overshoots the whole shelf below (the
tower's shelves are narrower than a run's throw), but a dark rim with a sleeping light is one he STOPS at, so he steps off slow: those
hits are the model's, not the lay's. **And it MISSES the real event** (probes/rim30.mts 30 easy 241 2477): adult Easy 30 dropped off the
LEFT end of 175-575 (y 2190) and steered right in the air onto 61-241, landing at x 236 running, 5 px from rim 241 (its light id 17 at
295,2485 asleep). **The rim he dropped from, x 175, is OUTSIDE the dark zone's box (198-1024, y 1864-2835): no dark rim, no stop, no
light.** A stop at 175 facing left WOULD wake light 17 (120 px behind him, 295 px down: inside GLOW_REACH back 260 / down 420), so the
owner is **the dark brick's EXTENT** (glowZone: x0 = a.x, x1 = b.x, the two socket ends), not the tower's spacing.
**Next, in order:** (1) restate the verdict on the right model: for every dark rim n with a sleeping light, every drop that lands on n's
piece from ANY rim u (dark or not, either way), landing at u.x + du * 24 (a step off; landingOf's drop spot), must be at least
darkStop(setting) from n along n.dir, or n's light is woken by a stop at u's piece facing du (litAfter within u's own wait + DARK_AHEAD);
plant RED on roll 30 Easy (u 175, n 241: room about 90 px < 149). (2) Fix in glowZone's extent: the stretch's box takes in every rim
whose drop lands inside it (a drop INTO the dark is a drop in the dark), so 175 gets its own glowworm and its stop wakes 17; GREEN on
roll 30 Easy, then the 80 rolls at 0 named; dark.test's seeds 1-4 loop asserts darkLandings == [] beside darkGaps. (3) lockall: only the
3-1 draft may move ('the lay leaves every other stage'). If (2) cannot clear all 80, tell the lead before touching tower.ts. Then box 5's
step 3 (freeze, x40 first, plants 20+, tierBots, suite, CI line) and step 4 (land). **The landing will miss 3:30 PM ET unless (1)-(2) take
under an hour: the lead is told now.**
**EXACT NEXT STEP (ENG-DARK-e box 5 hand-over, 12:41 PM ET by `date`; code head 4aebc171 on t-eng-dark-wip = f68c5ca1 + (c) the
'climbed' kind). Box 4 has STOPPED (its x40 on f68c5ca1 recorded, box 4 item 7: unlit 5, all Easy; shrine 359/360; rescues 1,395 vs base
1,393). Box 6 OWNS EVERY CODE CHANGE (the lead: "YOU own every code change from here"). Re-fetch before every commit (D138).**
**THE LEAD'S RULINGS to box 5, word for word:**
- "(b): (A). The stopping distance is the brake PLUS a person's reaction at run speed, because a kid landing in the dark needs a beat to
  see he is down. Use the game's existing fairness reaction constant if one exists (name it). If none exists, use 0.25 s, named as one
  constant with a one-line reason. Easy uses Easy's own reaction scale, as the other fairness verdicts do. So about 83 px on Normal. Plant
  it RED on adult Easy 30's landing, then fix it in the owning lay; if the tower's spacing owns it, tell ENG-DOWNBOT-g and me."
- "YES: a fresh x40 is owed on the FINAL head (rule 28: the lay changes)."
- "(a) child Easy 25: keep tracing to the line. A rescue that puts him on the piece over the exit, where he then stands 20 s with no way
  on, is a strand whoever causes it. If it is the rescue's placement (the game), that is player-facing and comes first."
- "3. Then NAME the final code head, and freeze it. On it: one x40 (both settings, every bot: unlit 0 or each traced; shrine 360/360; no
  rescue kind the base lacks), plants 16+, tierBots, the suite (3 shards) and the CI line. Run at most two heavy runs at a time in your
  container: the x40 lanes first, then the rest. 4. LAND as your packet says (the toy-B re-pick on the merged head with ENG-DOWNBOT's
  lay). If the landing will miss 2:30 PM, tell me by 1:45 PM with what is left. A late landing is better than a fault in 3-1."
**WHERE EACH STANDS AND THE NEXT ACTION:**
(c) **DONE and proved on the live row** (box 5 item 5: middle Easy 4, 18 went over + 2 climbed, unlit 1 -> 0, the run unchanged).
(a) **ROOT CAUSE FOUND (box 5 item 6): NOT the rescue's placement as a game fault (firsttimer's rescue() is the harness's stand-in, not
the game's) and NOT the dark stop: a BOT fault in the tower's way-down plan**, firsttimer.ts:2859: it presses DOWN beside a vine whose top
is at or ABOVE his feet (`nearTreeVine.topY <= p.y + 14`, one-sided), while the engine climbs down from the ground only at the vine's top
(engine.ts:2204 downAtTop: `p.y <= nearTreeVine.topY + 14`). Mid-trunk (vine 26: top 11453, his feet 11734) the press never starts a
climb and nothing lets it go. **Next:** make the plan's test the engine's (`Math.abs(nearTreeVine.topY - p.y) <= 14`) in the edit tree;
prove on a frozen copy with `GEN2_DRAFT=3-1 npx tsx reference/qa-reports/ENG-DARK/probes/castone.mts child easy 25` (shrine expected;
on 4aebc171: stranded 295.9 s); then the toy (darkBots.test or castBots.test: castRun child Easy roll 25 reaches the shrine; RED on
4aebc171) and a plant (the one-sided test back). It is the tower's code: **tell ENG-DOWNBOT-g (through the lead) in the same message as
the fix**, so their lane takes the same line. Also name why its goal read 0 of 1 (the base 1 of 1) once it reaches the shrine.
(b) **the verdict `darkLandings` (gen2/dark.ts, beside darkGaps; box 5 item 7 has the numbers):** for every dark rim r whose landing is a
DROP (landingOf's drop branch) onto a piece q whose end on r's side `dir` is itself a dark rim n: the far landing xf = r.x + dir *
PHYS.maxRun * sqrt(2 h / PHYS.gravDown) (h = q.y - r.y); RED when (n.x - xf) * dir < STOP and n's light sleeps, is not r's own light, and
no stand spot on r's piece facing r.dir wakes both. STOP = PHYS.maxRun^2 / (2 PHYS.groundDec) (12 px) + PHYS.maxRun * reaction. **No
single game-wide fairness reaction constant exists** (searched src/game: w7Slide.ts:323 a local `react = c.easy ? 0.6 : 0.35`; rideLay.ts
PAD_FAIR.react 0.3; sovereignReach.ts OPENING_RULE.react 0.8; bossBot.ts HUMAN.react 0.4 is a bot's): per the ruling, a new named
constant 0.25 s with a one-line reason, and Easy's own scale (read how the other fairness verdicts scale Easy first, e.g. w7Slide's 0.6 /
0.35, and name the one you follow). Plant RED on the 3-1 draft's roll 30 Easy (the rim at the right end of 61-241, y 2477); read the other
4 unlit (child Easy 1, 20, 23, middle Easy 12) against it; fix in the owning lay (the dark brick's glowZone: hang n's glowworm where the
stop at r wakes it too; or the tower's spacing: tell ENG-DOWNBOT-g and the lead at once). Wire it where darkGaps is read (levelCheck /
pipeline), so a roll that fails it is refused or re-laid like darkGaps.
Then: NAME and freeze the final head; the x40 there FIRST (2 lanes: `GEN2_DRAFT=3-1 castBots --stage 3-1 --setting both --par 2 --rows`,
seeds 1-20 and 21-40, as box 4 ran it), then plants (18), tierBots, the suite (3 shards), the CI line (gates.yml line 157, read from
the tree: box 5's runner reads it so nothing is dropped); then LAND (box 4's step (4) below: merge origin/t-eng-w3, the toy A/B/C
re-pick, ENG-DOWNBOT's tests, lockall). LANDED by 2:30 PM ET (tell the lead by 1:45 PM ET if not); HARD STOP 4:00 PM ET.

**(superseded by box 5's step above; kept for its landing procedure) EXACT NEXT STEP (ENG-DARK-d, 12:27 PM ET by `date`; code head f68c5ca1 on t-eng-dark-wip = b71163ea + the cause-2 fix + the cause-3 fix):**
(1) **Box 4 fixed unlit causes 2 and 3, both BOT faults (box 4 items 1 and 4).** ef811c2a's x40 is recorded (item 2: unlit 58 -> 13,
rescues 1,391 vs base 1,393, gaveUp 0, shrine 359/360). **The x40 on a frozen f68c5ca1 is RUNNING in box 4's container (item 7); box 4
records it; do not re-run it.**
(2) **OPEN, for the lead (box 4 items 5-6):** cause 4, a landing AT the next dark rim (adult Easy 30: lands running 5 px from it; the stop
cannot hold him): bot (the air steer into the dark) or lay (darkGaps does not ask the landing's distance to the next dark rim)? And: does a
trunk grab past a rim count as going over for 'lit 1 s ahead'? Then two traces per remaining kind (child Easy 1/20/23, middle Easy 12 on
f68c5ca1 if they persist), and the dark-only strand (child Easy 25, 295.9 s, on 653bb970, ef811c2a, not in the base).
(3) **Gates on the FINAL head (in its own container if box 4's x40 still runs; 2 heavy at most):** a frozen worktree (node_modules linked,
`chattr -R +i src tools reference`): plants (`python3 reference/qa-reports/ENG-DARK/planted-faults.py <wt>`, now **16**: box 4 added 14
'the dark stop never turns him to face the rim', 15 'a dark give-up kept for the whole run', 16 'the dark stop never reads the pressed
steer'; PASS 16/16 CAUGHT), tierBots (`npx tsx --test tools/inspect/tierBots.test.ts`, 9/9; firsttimer.ts changed, 1-1 has no dark so
glowWait/glowSteer return before any random draw), the suite (3 shards) + the CI tool line.
(4) LAND on t-eng-w3 (still c1008d8e at 12:27 PM ET; ENG-DOWNBOT-f not landed): merge origin/t-eng-w3 first, no force; if ENG-DOWNBOT-f
landed first, run its tests (w3.test, tower.test, castBots.test down toys) and ours (dark.test, darkBots.test) on the merged head, name
every conflict here, never drop the other lane's lines; lockall once on the frozen final merged head (`lockall --layouts 16 --out
lock-base.json` on frozen t-eng-w3, then `--check` on the frozen merged head: no listed stage moves). **KNOWN LANDING RISK (item 3):**
ENG-DOWNBOT's lay moves the 3-1 rolls; on a merge with its WIP (7b1aa3ba) toy B went RED (roll 19 holds no give-up; the rest GREEN). On
the merged head re-pick the rolls of toys A/B/C where they no longer hold with `npx tsx reference/qa-reports/ENG-DARK/toyscan.mts FT_CHILD
1-40 50 noturn` (B: 'SAME RIM TWICE'; A and C: a seed whose old code (plant 14 / 16 applied) is unlit), change only the seed and its
comment, re-run darkBots.test and plants 14-16 there. Send the lead the hash, the READY measures and the ENG-SPORE light API line
(sections below). LANDED by 2:30 PM ET; HARD STOP 4:00 PM ET.
**THE LEAD'S RULINGS on box 4's open questions (word for word; box 5 carries them):**
- (3) adult Easy 30 (a drop lands him running 5 px from the NEXT dark rim at full speed): treat it as LAY FAIRNESS first, because a player
  who drops onto a ledge cannot stop 5 px short of a dark edge either. A NEW named verdict in the darkGaps family: 'a drop's landing is at
  least his stopping distance from the next dark rim, or that rim is already lit when he lands'. Plant it RED on that roll. Fix it in the
  lay that owns it (the dark brick's extent or glow, or the tower's spacing; if it is the tower's, tell ENG-DOWNBOT-g and me). Only if the
  verdict passes and he still runs over does the bot's air steer get fixed.
- (4) A CLIMB down a trunk past a rim is not a blind drop, so it does not count against 'lit 1 s ahead'. But RimWatch must record it as its
  own kind ('climbed'), never hidden inside 'went over'.
- (5) child Easy 25's strand (added by the dark, absent from the base) MUST be traced before landing: every bot reaches the shrine on every
  roll.
- Box 5 (ENG-DARK-e) is running from 92f2d827 with gates on a frozen ef811c2a; box 4 finishes ONLY the x40 on a frozen f68c5ca1, records
  it, and stops. Box 5 takes everything after that (the head is f68c5ca1: its gates belong on the final head).
(5) **STILLS APPROVED by the lead.** Dot's card upright under Pokey is **R-165.456** (FIX-CARD-DOWN, its own job), not this lane's.
**The lead's landing rule (ENG-DOWNBOT-f lands on t-eng-w3 today too; both lanes touch tools/inspect/firsttimer.ts and the gen2 lay):**
whoever lands SECOND merges origin/t-eng-w3 first and runs the OTHER lane's tests on the merged head before pushing: dark.test,
darkBots.test, w3.test, tower.test, castBots.test (the down toys) and lockall. Name every conflict here; never resolve one by dropping
the other lane's lines.
Box 4 start 12:08 PM ET, box 3 11:50 AM ET, box 2 11:31 AM ET, box 1 11:03 AM ET (by `date`).

## Box 5 (ENG-DARK-e, the landing box) (start 12:21 PM ET by `date`)
Trees (this container): `wt-ef` = ef811c2a frozen (`chattr -R +i src tools reference`) for tierBots, the suite and the CI line;
`wt-plant` = ef811c2a, touched only by planted-faults.py (it writes and restores its own files, so it cannot be chattr'd; nothing
else reads it); `wt-mrg` = a THROWAWAY merge of ef811c2a + ENG-DOWNBOT's newest WIP (t-eng-w3-wip-downbot d4e1688e; d4e1688e differs
from box 4's 7b1aa3ba only in ENG-W3/REPORT.md), frozen, never pushed: the landing preview.
1. **Plants 15/15 CAUGHT on ef811c2a** (`planted-faults.py`, exit 0; the plant tree restored clean): box 1's 10, box 2's 2, box 3's
   glowJump, box 4's 14 (the turn removed -> 'stop FACES the rim' RED) and 15 (the give-up kept for the run -> 'give-up ends with the
   visit' RED).
2. **t-eng-w3 is still c1008d8e** (ENG-DOWNBOT not landed); `git merge-tree` of t-eng-dark-wip with d4e1688e: **no conflict**
   (pipeline.ts and firsttimer.ts auto-merge).
3. **tierBots 9/9 on ef811c2a** (exit 0). Suite shard 1 on ef811c2a STOPPED (exit 143) unread: the head moved (item 4; D118).
4. **STOPPED BEFORE LANDING (order item 3: the x40 shows a new fault).** Box 4's x40 on ef811c2a left **13 unlit** (its commit
   f68c5ca1: 'unlit 58 -> 13'); box 4 named cause 3 (the kid's held steer runs him over a dark rim the route never faced) and pushed a
   CODE fix (f68c5ca1: firsttimer.ts glowSteer, darkBots toy C on roll 16, plant 16) while its session reads 'causes 3-4'. The lead is
   told; every heavy run here waits for ONE named frozen code head. Plants 15/15 and tierBots 9/9 above do NOT carry to it (they re-run
   once there, with plant 16).
5. **(c) the 'climbed' kind: DONE (d191cb2b).** gen2/dark.ts: RimCrossing gains `climbed?: true`; RimWatch.step reads the player's
   `climbing` the frame he passes the rim's end (a trunk grab past it) and records the crossing as kind `climbed`; litAhead skips it.
   FTRun.dark gains `climbed` (count); `crossed` now counts only the rims he went over. Toy (dark.test): a real 3-1 draft rim, the same
   pass climbing -> kind 'climbed', litAhead []; as a drop -> 'went over', litAhead RED (GREEN in the edit tree; RimWatch tests 2/2).
   Plants 17 (RimWatch hides the climb) and 18 (litAhead counts it) added to planted-faults.py, not yet run (with the 18 on the final
   head). tsc clean. **PROVED on the live row:** ef811c2a + this change only (frozen), castBots' own runner (`probes/castone.mts`,
   castRun: cap 1200, Dot's setting) on middle Easy roll 4: shrine 370.5 s, rescues 8 (the x40 row exactly: the run is unchanged), dark
   crossed 18 + **climbed 2** = the row's 20, **unlit []** (was 1: the trunk grab at 112.80 s). The engine's `climbing` is set on the
   snap's frame.
6. **(a) child Easy 25's strand, traced so far (frozen f68c5ca1, probes/strand.mts):** reproduces: stranded 295.9 s, rescues 4, goal 0 of
   1. **With the dark stop removed (NOWAIT=1: noGlowWait) he reaches the shrine at 278.8 s with 6 rescues: the base row exactly**, so
   the dark's stops are what changed the run. The end: a rescue at 275.9 s (the stuck clock from 255.9 s at (1110, 11345) 'the way on is
   131 px down') puts him on 1020-1200 at y 11734; the exit totem is at (1225, 11804) on the floor 0-1280 70 px below; he stands still
   facing right at x 1107 (93 px from that piece's right end) for 20 s, vx 0, gaveUp [] (so not a waited-out dark stop: glowWait gives
   up at 4 s and names it); the next rescue finds no route point past him -> 'stranded'. **What holds him (probes/strand2.mts, the bot's
   own calls patched to log): NOT the dark stop** (glowWait called 597 times from 276 s, dir 1, returned null every time; no glowStop).
   He holds **DOWN** for the whole 20 s (the pad: down true, nothing else). The plan that presses it: firsttimer.ts:2859 'a way DOWN
   turns on a vine whose top stands at his ledge's end' (onTower, e.nearTreeVine, grounded, the target over 60 px down, the vine's top
   within 14 px of his feet, its foot over 60 px below): the engine never starts the climb from where he stands and nothing lets the
   press go (the trunk-UP plan beside it has trunkUpT / trunkIgnoreUntil; the way-down press has none). That plan is the tower's
   going-down bot code (on t-eng-w3 since 6341043b; ENG-DOWNBOT's WIP d4e1688e does not change it). **ROOT CAUSE (a BOT fault, the
   tower's):** the near vine is 26 (tree_climb, x 1112, top 11453, foot 11804): its top is 281 px ABOVE his feet (11734), its foot at the
   floor. The bot's plan asks only `nearTreeVine.topY <= p.y + 14` (a top at or above his feet: one-sided) and `bottomY > p.y + 60`
   (11804 > 11794, by 10 px); the engine climbs down from the ground only at the vine's very top (engine.ts:2204 downAtTop:
   `p.y <= nearTreeVine.topY + 14`), so from mid-trunk his down press can never start the climb, and he holds it until the rescue clock
   runs out. The fix (not made: the tower's code; the lead and ENG-DOWNBOT-g are told first): the plan's test is the engine's,
   two-sided (`Math.abs(nearTreeVine.topY - p.y) <= 14`), so mid-trunk he takes the way on (walk off 1020-1200's right end, 70 px down,
   to the exit at 1225). Open: why the goal is 0 of 1 (the base 1 of 1).
7. **(b) numbers for the verdict:** PHYS (physics.ts): maxRun 285, groundDec 3400, gravDown 2500: the brake from full run is 12 px; a
   287 px drop takes 0.48 s, 137 px of air at full run. Adult Easy 30 (box 4 item 5): dropped from the storey at 2190 steering right,
   landed at x 236 running vx 268, 5 px from the rim at the right end of 61-241 (y 2477). The 5 unlit on f68c5ca1 are all Easy (needs
   1.6 s) and all at rims of short pieces: 709-798 (89 px), 821-898 (77), 268-517 (249), 61-241 (180), 772-845 (73).

## Box 4 (ENG-DARK-d) (start 12:08 PM ET by `date`)
1. **UNLIT CAUSE 2: the BOT (b), not the wake. FIXED (98992ca5, merged at ef811c2a).** Traced on the real row (child Normal, 3-1 draft
   roll 19, frame trace with his facing and the engine's stillness clock): he lands 2 px in from the rim at the left end of 974-1154 and
   the route sends him RIGHT (pressing right, vx 260-285, 37.50-37.57 s); at 37.60 s the route turns LEFT toward the rim, 39 px from it,
   and glowWait's stop is taken THAT frame, thumb off, so he slides to x 1014 and stands **facing right, AWAY from the rim** (`face 1`).
   The engine's stillness clock runs (0.70 s reached at 38.37 s), but the landing's light (657, 3232) is 357 px BEHIND him, past
   GLOW_REACH.back 260: it never wakes. **(a) ruled out:** a stand at the same x 1014 FACING the rim reaches it (ahead 357 <= 1050, the
   light 134 px below his feet <= 420), so a kid who stops facing the gap lights the landing; the wake and the verdict hold (darkGaps scans
   the piece facing the rim). No kid stops facing away from the gap he means to drop into; the bot did because its stop beat its turn.
   **Fix (firsttimer.ts glowWait, bots only):** (i) at the stop, if he is not facing the rim, he presses toward it until he does (his
   thumb's own travel lag applies: the child turned at 38.47 s, 3 px), then a clean let-go (tapped(): no late lift-off walks him on to
   the rim); (ii) a give-up ends with the visit: grounded off that rim's piece (a rescue, a fall, the game's grace past its end), the rim
   re-arms. New counter **FTRun.dark.gaveUp** (each waited-out stop: rim and time; one per visit), proved by toy B.
   **Toys (src/game/gen2/darkBots.test.ts, the 3-1 draft's roll 19, child Normal, first 50 s):**
   - A 'the dark's stop FACES the rim': old code **RED** (2 unlit: 42.07 s landing dark, 48.53 s 0.34 s after its light woke); fix
     **GREEN** (6 crossings, unlit [], gaveUp []).
   - B 'a dark give-up ends with the visit' (the turn removed by the test knob noGlowTurn): **GREEN** = gaveUp names the same rim twice
     (41.60 s and 47.07 s, one per visit); with the give-up kept for the run it is named once (plant 15).
   - Plants 14 (the turn removed in the code -> A RED) and 15 (the give-up kept for the run -> B RED) added to planted-faults.py; the
     15-plant run is owed on the frozen final head (next step (2)).
   - darkBots.test **5/5 GREEN** in the edit tree before the commit (the 3 old toys unchanged: adult roll 1, its plant, the expert's jump).
   - Note (no change): RimWatch counts 'went over' when he passes the rim on the game's grace past an edge (box 1's rule); at 42.07 s
     the no-turn child stood at x 969 grounded, 5 px past the rim, and stepped back. Kept as ruled; the light still has to be on.
2. **THE x40 ON ef811c2a (frozen worktree, 3 lanes, 360 rows, 0 errors: `cast-3-1-x40-ef811c2a.jsonl`)** vs box 2's dark x40 on
   653bb970 and box 3's base on c1008d8e:
   | bot | setting | shrine base / 653bb970 / ef811c2a | clean | rescues | unlit 653bb970 / ef811c2a | gaveUp | time median (s) |
   |---|---|---|---|---|---|---|---|
   | kid | normal | 40 / 40 / 40 | 1/0/0 | 156/151/154 | 3 / 2 | 0 | 174.7/202.8/205.4 |
   | kid | easy | 40 / 40 / 40 | 0/0/0 | 186/192/192 | 1 / 1 | 0 | 197.0/239.2/239.2 |
   | adult | normal | 40 / 40 / 40 | 2/1/2 | 119/120/120 | 0 / 0 | 0 | 164.4/193.4/193.4 |
   | adult | easy | 40 / 40 / 40 | 0/0/0 | 180/202/200 | 2 / 2 | 0 | 200.3/239.8/239.8 |
   | child | normal | 40 / 40 / 40 | 2/1/1 | 138/135/136 | 5 / 0 | 0 | 320.1/303.6/303.6 |
   | child | easy | 40 / 39 / 39 | 0/0/0 | 178/179/179 | 4 / 4 | 0 | 306.4/313.6/315.0 |
   | middle | normal | 40 / 40 / 40 | 0/3/3 | 126/115/114 | 6 / 0 | 0 | 207.7/230.7/229.5 |
   | middle | easy | 40 / 40 / 40 | 1/1/1 | 186/184/184 | 11 / 4 | 0 | 261.5/279.3/285.7 |
   | expert | normal | 40 / 40 / 40 | 1/0/0 | 124/115/112 | 26 / 0 | 0 | 202.4/212.9/225.6 |
   **Unlit 58 -> 13** (all 'landing dark'; the expert 26 -> 0: glowJump; the child Normal 5 -> 0: the turn). **gaveUp 0** in all 360.
   **Rescues 1,391** (base 1,393). **Shrine 359/360: child Easy 25 stranded at 295.9 s, IDENTICAL on 653bb970 and absent from the base:
   a dark-only miss, NOT yet traced.** Kinds only here: the same rare 'a trunk beside him' variants box 3 named (7 notes); none new.
   9 of the 13 unlit were the same crossings on 653bb970 (neither fix touched them): a third cause.
3. **Landing preview (caught before it happens):** `git merge-tree` of ef811c2a with ENG-DOWNBOT's WIP (t-eng-w3-wip-downbot 7b1aa3ba):
   **no conflict** (firsttimer.ts auto-merges; it changes 38 files, towerRoute.ts and the going-down lay among them). On a throwaway merge
   of the two (not pushed), darkBots.test **4/5**: toy B RED (its roll's give-up is gone on the new lay), the rest GREEN. Procedure for the
   landing: next step (3); the scan tool `reference/qa-reports/ENG-DARK/toyscan.mts` (tsc clean; not yet run: the x40 holds the two heavy
   slots).
4. **UNLIT CAUSE 3: the BOT. FIXED (f68c5ca1).** Traced, kid Normal roll 16 (rim at the left end of 956-1136, 73.90 s): he drops onto the
   piece steering LEFT in the air, his plan says stand (intended {} every frame), but his thumb's late lift-off re-arms every frame (the
   KID's thumb, thumbify R-165.59), so the left press is never let go: he runs 90 px over the rim at full speed, `stop -` on every frame.
   glowWait never looked: the route said RIGHT (dir 1), and the stop only guards rims in the route's way. **Fix (firsttimer.ts glowSteer,
   read in pad() on the pad the thumb actually presses):** a press toward a dark rim on his piece within GLOW_NEAR, its landing not lit
   DARK_AHEAD, starts the stop (this frame's press stands; from the next frame glowWait holds him and the thumb comes off with its own lag,
   armed once). **Toy C** (darkBots.test 'the dark's stop reads the THUMB', kid Normal roll 16, first 80 s, as castBots plays it):
   **RED on ef811c2a** (the x40's row), **GREEN on f68c5ca1**; **plant 16** (glowSteer not called). darkBots.test **6/6 GREEN**.
5. **The 13 ef811c2a unlit re-run one by one on the fix (frozen tree, each to its crossing + 15 s): 8 LIT, 5 remain, ALL Easy** (needs
   1.6 s): adult Easy 30 (241, 2477 at 31.00 s), child Easy 1 (517, 2867), child Easy 20 (798, 8084), child Easy 23 (772, 10112), middle
   Easy 12 (821, 4074). **Traced once, adult Easy 30: cause 4, a landing AT the next dark rim:** he drops from the storey above (2190)
   steering right in the air, lands at x 236 running (vx 268) 5 px from the rim at the right end of 61-241; the stop starts that frame
   (stop 241) but he slides past the end on the game's grace and the stop ends (off the piece). No stop can hold a run in 5 px. **Bot or
   lay is the lead's question:** the bot's air steer runs him toward the dark (a kid falling in the dark with nothing lit ahead would not
   push on), or the lay drops him within a stop's distance of the next dark rim (darkGaps does not ask how far the landing is from the
   next rim). The other 4 are untraced (two traces per kind owed).
6. **Named, not changed (the lead's ruling): a trunk grab counts as going over.** Middle Easy 4 on ef811c2a, 112.80 s: standing 27 px in
   from the rim at the left end of 70-480, pad down, he snaps 53 px onto a trunk at x 44 past the rim and climbs; RimWatch counts it 'went
   over' (it counts any pass of the rim's end not grounded on its piece). A climb down is not a drop; whether 'lit 1 s ahead' should
   count it is a ruling, not a bot fix (law 22). On f68c5ca1 that crossing is lit (the run moved).
7. **THE x40 ON f68c5ca1 (frozen worktree, 2 lanes, 360 rows, exit 0: `cast-3-1-x40-f68c5ca1.jsonl`)**, vs box 2's 653bb970 and box 3's base:
   | bot | setting | shrine base / 653bb970 / f68c5ca1 | clean | rescues | unlit 653bb970 / f68c5ca1 | gaveUp | time median (s) |
   |---|---|---|---|---|---|---|---|
   | kid | normal | 40 / 40 / 40 | 1/0/0 | 156/151/158 | 3 / 0 | 0 | 174.7/202.8/209.1 |
   | kid | easy | 40 / 40 / 40 | 0/0/0 | 186/192/192 | 1 / 0 | 0 | 197.0/239.2/239.2 |
   | adult | normal | 40 / 40 / 40 | 2/1/2 | 119/120/120 | 0 / 0 | 0 | 164.4/193.4/193.4 |
   | adult | easy | 40 / 40 / 40 | 0/0/0 | 180/202/200 | 2 / 1 | 0 | 200.3/239.8/239.8 |
   | child | normal | 40 / 40 / 40 | 2/1/1 | 138/135/136 | 5 / 0 | 0 | 320.1/303.6/303.6 |
   | child | easy | 40 / 39 / 39 | 0/0/0 | 178/179/179 | 4 / 3 | 0 | 306.4/313.6/315.0 |
   | middle | normal | 40 / 40 / 40 | 0/3/3 | 126/115/114 | 6 / 0 | 0 | 207.7/230.7/229.5 |
   | middle | easy | 40 / 40 / 40 | 1/1/1 | 186/184/184 | 11 / 1 | 0 | 261.5/279.3/280.8 |
   | expert | normal | 40 / 40 / 40 | 1/0/0 | 124/115/112 | 26 / 0 | 0 | 202.4/212.9/225.9 |
   **Unlit 58 (653bb970) -> 13 (ef811c2a) -> 5 (f68c5ca1)**, exactly item 5's five, all Easy, all 'landing dark': adult Easy 30 (241, 2477
   at 31.00 s: cause 4, traced; the lead's ruling (3) above), child Easy 1 (517, 2867 at 47.53 s), child Easy 20 (798, 8084 at 164.50 s),
   child Easy 23 (772, 10112 at 321.67 s), middle Easy 12 (821, 4074 at 72.00 s): those four untraced. **gaveUp 0** in all 360.
   **Rescues 1,395** (base 1,393, 653bb970 1,393; per bot -12 to +20, both ways). **Shrine 359/360: child Easy 25 stranded at 295.9 s,
   the same as 653bb970 and ef811c2a, absent from the base (the lead's ruling (5): traced before landing).** Stuck notes 1,686 (base
   1,709); kinds only here: the same rare 'a trunk beside him' variants (7 notes); only in the base: 3 notes; no new kind.
   Box 4 stops here (the lead's word); box 5 (ENG-DARK-e) takes the gates on f68c5ca1, the rulings and the landing.

## Box 3 (ENG-DARK-c) so far (start 11:50 AM ET by `date`)
1. **Plants 12/12 CAUGHT** on a frozen 653bb970 (worktree, `planted-faults.py`, exit 0): box 1's 10 + the glow counter on every stage
   ('the lay leaves every other stage') + the bots' stop removed ('the dark's skill: he stands').
2. **STILLS of a dark shaft, asleep and lit (for the lead to judge): `reference/qa-reports/ENG-DARK/stills/`** (2x, JPEG q85), shot on a
   frozen 653bb970 by `reference/qa-reports/ENG-DARK/darkshoot.mjs` (draftshoot.mjs's harness: vite on a refused-if-busy port, the
   served tree checked as the worktree by the listener's cwd, the port killed after). 3-1 draft roll 1 (flow down, 42 drop rims with a
   light). Pokey pinned 30 px inside a real dark rim, facing it. ASLEEP: every wake cleared, his stillness held at 0. LIT: the stop let
   run; the landing's light woke at +0.76 s / +0.79 s of game time (GLOW_STILL 0.7 + the wake's travel), shot 1.5 s after it woke
   (DARK_AHEAD Normal 1 + 0.5).
   - `3-1-port-rim0-asleep.jpg`, `3-1-port-rim0-lit.jpg`, `3-1-land-rim0-asleep.jpg`, `3-1-land-rim0-lit.jpg`: rim (1031, 1944), going
     right, its landing 281 px below.
   - `3-1-port-rim1-asleep.jpg`, `3-1-port-rim1-lit.jpg`, `3-1-land-rim1-asleep.jpg`, `3-1-land-rim1-lit.jpg`: rim (385, 6346), going
     left, its landing 164 px below.
   **My polish check (as Matt on a phone):** (a) the dark is dark enough to matter and never black: rock and ledges faintly there, the
   sleeping glowworms read as dim blue worms with a small glow. (b) Lit, the landing under the rim reads in all 4 lit stills; the pool
   reaches that landing, the shaft below stays dark (the bound shows). (c) Nothing under the HUD (hearts, lives, the log bar, the menu
   leaf) in either orientation; Pokey and the landings are clear of the phone's edges. (d) **ROUGH, named, not fixed here:** upright, Dot's
   card sits just UNDER Pokey: in `3-1-port-rim1-lit` ('Too dark to see. Stand still and listen...') it covers the glowworm that just
   woke (only its head shows over the card), so the cause and effect (he stopped, the worm woke, the way lit) is hidden while the card is
   up; in `3-1-port-rim0-asleep` it covers the ledge under him. In a stage that goes DOWN the way on is below him: the card belongs above
   him. Here the cards fire because the pin moves him into the zone (the zone's line on entry); in play the same line fires on his first
   dark entry, i.e. at his first stop. The card's placement is not this lane's file (the lead's call: an R-number and a lane).
3. **THE RESCUES, base vs the dark, seeds 1-3 (27 runs each; castBots on a frozen c1008d8e vs box 2's x40 rows on 653bb970; base rows: seeds 1-3 of cast-3-1-x40-base-c1008d8e.jsonl):** the
   layout is the SAME (platforms and flags hashed equal on seeds 1-3, both trees), so every difference is the bots' play in the dark.
   Rescues 90 base -> 102 dark (+12; child Easy +7, middle Easy +4, adult Normal +2, expert/kid/middle Normal about even). The KINDS
   are the same (numbers stripped, base -> dark): 'in a dip N px deep, the way on is N px down' 56 -> 69; 'the way on is N px down'
   20 -> 29; 'a trunk beside him...' 9 -> 8; 'fell back down from here N times' 5 -> 5; no kind the base lacks. Traced: adult Normal
   seed 2 (base clean, 129.5 s; dark 173.4 s, 1 rescue at (784, 6177) at 81.2 s): a clean 2 s dark stop at (698, 5554), then he
   dithers between two storeys (piece 34 and 157: back up a jump, down again) where the base also logged 'the way on is 85 px down'
   at (514, 5699) and recovered without a rescue. Reading so far: the dark adds no rescue kind of its own; it moves when he reaches
   the down shaft's storeys, whose dips are ENG-DOWNBOT's lane. The base x40 (item (1) above) settles the per-bot numbers.
3b. **THE RESCUES, base vs the dark, ALL 40 seeds (castBots on a frozen c1008d8e, no dark, 360 rows, 0 errors:
   `cast-3-1-x40-base-c1008d8e.jsonl`; vs box 2's `cast-3-1-x40-653bb970.jsonl`):**
   | bot | setting | shrine base / dark | clean base / dark | rescues base / dark | time median base / dark (s) |
   |---|---|---|---|---|---|
   | kid | normal | 40/40 / 40/40 | 1 / 0 | 156 / 151 | 174.9 / 203.7 |
   | kid | easy | 40/40 / 40/40 | 0 / 0 | 186 / 192 | 197.3 / 239.5 |
   | adult | normal | 40/40 / 40/40 | 2 / 1 | 119 / 120 | 164.4 / 193.5 |
   | adult | easy | 40/40 / 40/40 | 0 / 0 | 180 / 202 | 201.1 / 241.0 |
   | child | normal | 40/40 / 40/40 | 2 / 1 | 138 / 135 | 320.1 / 306.6 |
   | child | easy | 40/40 / 39/40 | 0 / 0 | 178 / 179 | 307.7 / 313.7 |
   | middle | normal | 40/40 / 40/40 | 0 / 3 | 126 / 115 | 207.8 / 230.8 |
   | middle | easy | 40/40 / 40/40 | 1 / 1 | 186 / 184 | 263.2 / 283.2 |
   | expert | normal | 40/40 / 40/40 | 1 / 0 | 124 / 115 | 204.3 / 213.6 |
   **Rescues 1,393 base, 1,393 dark** (per bot -11 to +22, both ways: noise of a moved trajectory); stuck notes 1,709 / 1,680; by cause
   (numbers stripped) the top six match within a few each ('in a dip N px deep, the way on is N px down' 1,006 / 1,009; 'the way on is N
   px down' 260 / 256; 'fell back down from here N times' 99 / 99). Kinds only in the dark: 7 notes, only in the base: 4 (rare variants
   of the same dips). **Verdict: the dark adds no rescues; every one is the down shaft's storeys (ENG-DOWNBOT's lane, as on the base).**
   What the dark DOES cost is time: the stops add about 20-40 s to the median for kid, adult and middle (Easy most: the 1.6 s ahead).
   The one strand: child Easy seed 25 stranded at 295.9 s after 4 rescues in the same dips (base: shrine at 278.8 s after 6 rescues):
   a dip strand on the dark's trajectory, ENG-DOWNBOT's to read with its fix.
4. **The unlit crossings, cause 1 of 2 FIXED (box 2's x40: 58 unlit, 55 'landing dark'; the expert 26):** traced twice, the expert Normal:
   seed 12, the jump pressed at x 509 for the rim at 594 (94 px out) at 81.27 s; seed 10, pressed at about x 160 for the rim at 70 at
   122.93 s, after a stand broken by small steps every 0.65 s (his stillness never reached GLOW_STILL 0.7 s). A running jump over a dark
   rim is pressed before he is within GLOW_NEAR 90, so glowWait never stopped him. **Fix (firsttimer.ts glowJump, read at the top of
   startJump before any jump state moves):** a jump toward a dark rim on his piece within GLOW_JUMP 200 px whose landing is not yet lit
   DARK_AHEAD starts the dark stop instead (glowWait then holds him until lit + stopReact). Not by widening GLOW_NEAR (a press from further
   out would escape the same way). **Toy (darkBots.test 'holds a running JUMP'), the expert on the draft's roll 12, first 85 s:** RED on
   653bb970 (the rim at 594, 4355 gone over with its landing dark at 81.60 s), GREEN on b71163ea; **plant 13** (glowJump not read):
   CAUGHT (RED). dark.test + darkBots.test **12/12 GREEN on a frozen b71163ea**. **The lead's question (bot or lay?): a BOT fault** for
   both expert traces: no stop was ever started (the press came first), so the light was never asked; the lay's own verdict holds there. The x40 that proves it on every bot: item (2) above.
5. Owned: for about 4 minutes three runs went at once (the two base lanes + the targeted dark tests), past 'at most two heavy runs'.

## Box 2 (ENG-DARK-b) done (all on the real 3-1 draft row)
1. **The lock's cause fixed first (box 1's RED: 37 gen2 stages moved in proto.gen2 only):** dark.ts glowFlags writes its glowworm
   counter into `extras` only when it hung a glowworm. Planted: dark.test.ts 'the lay leaves every other stage as it was' (1-1 and 6-1,
   seeds 1-2: no glow key in proto.gen2): RED with the counter written everywhere, GREEN with the fix; and in planted-faults.py.
   The lockall re-run to zero moves is item (1) above (running). The lesson: anything a lay writes into extras reaches every stage's
   proto (the lead's note).
2. **The bots' skill for the dark (firsttimer.ts glowWait; level.md rule 21):** grounded on a piece with a rim in the glowworms' dark
   he is heading over (darkRims, read once), within GLOW_NEAR 90 px, its landing's light asleep or lit under DARK_AHEAD[setting] s: the
   thumb comes off and he stands, facing the rim, until the light has been lit DARK_AHEAD + his stopReact; a light that has not woken
   in GLOW_GIVEUP 4 s he gives up on (litAhead names that crossing). Read before any other plan steers him (read after the freeze, a
   landing's own steer walked the KID over the next rim). The late lift-off arms ONCE at that stop for every bot (KID and ADULT
   re-arm it every frame, R-165.59's documented quirk, so a stop never stopped them: the KID's first run walked off 12 of 57 dark rims
   unlit); elsewhere KID/ADULT play exactly as before. `noGlowWait` removes it (the plant).
3. **Every bot run watches the dark:** FTRun.dark / the castBots row's `dark: {crossed, unlit}` (RimWatch each frame on the engine's own
   glowWake; unlit = litAhead's names). RimWatch fixed: a rim's piece he left some other way (a vine, its other end, a rescue) is no
   crossing when he later walks past its end on ground below (the ADULT Easy run counted a rim 281 px over his head). Toy: RED before,
   GREEN after.
4. **Toys each way (src/game/gen2/darkBots.test.ts, the whole ADULT run's first minute on the draft's roll 1 in the real engine):**
   with the skill every rim he went over was lit 1 s ahead (GREEN); noGlowWait: he walks off into the dark (RED). dark.test.ts +
   darkBots.test.ts: 11/11 GREEN on 653bb970.
5. **Seed 1, one run each (before the x40):** first version (the stop read after the freeze), all 9 rows: dark rims crossed 24-78 per
   run, unlit 0-2 per run. After the read moved: KID and ADULT both settings only: unlit 0, 0, 0, 1 (the 1 was RimWatch's false
   crossing, fixed in item 3, NOT re-run since: the x40 on 653bb970 measures every bot). Every run reached the shrine with 3-5 rescues,
   all in the down shaft's storeys (next step (2b)).

## Box 2's runs (recorded by box 2 after its hand-over; nothing new started)
**lockall: PASS.** Base lock recorded on a frozen t-eng-w3 c1008d8e (102 stages, 3,264 builds); `lockall --layouts 16 --check` on a
frozen 653bb970: **102/102 stages unchanged, exit 0** (Worlds 6 and 8 included: box 1's 37-stage move is gone). Its info line, not
hashed: 'gen2 gained verdicts and drops' on the same 37 gen2 stages (the new darkGaps/darkFlags verdicts listed on every gen2 stage;
no build moved). Re-run it after the merge with t-eng-w3 at landing (the lead's landing rule).

**castBots x40 on the 3-1 draft, both settings, every bot, frozen 653bb970 (rows: reference/qa-reports/ENG-DARK/
cast-3-1-x40-653bb970.jsonl, 360 rows, 0 errors):**
| bot | setting | shrine | clean (0 rescues) | rescues (runs) | dark rims crossed | unlit (runs) |
|---|---|---|---|---|---|---|
| kid | normal | 40/40 | 0 | 151 (40) | 1954 | 3 (2) |
| kid | easy | 40/40 | 0 | 192 (40) | 2854 | 1 (1) |
| adult | normal | 40/40 | 1 | 120 (39) | 2052 | 0 |
| adult | easy | 40/40 | 0 | 202 (40) | 3547 | 2 (2) |
| child | normal | 40/40 | 1 | 135 (39) | 1094 | 5 (4) |
| child | easy | 39/40 | 0 | 179 (40) | 1424 | 4 (4) |
| middle | normal | 40/40 | 3 | 115 (37) | 1034 | 6 (5) |
| middle | easy | 40/40 | 1 | 184 (39) | 1463 | 11 (9) |
| expert | normal | 40/40 | 0 | 115 (40) | 1028 | 26 (10) |

- **Shrine 359/360**; the one miss: child Easy seed 25 'stranded' at 295.9 s after 4 rescues (last stuck: 'the way on is 131 px
  down' at x 1110; 'in a dip 281 px deep, a trunk beside him, the way on is 70 px down' at x 1107).
- **'Every gap lit 1 s ahead' (litAhead): 58 of 16,450 dark crossings unlit (0.35%), in 37 of 360 runs**: 55 'landing dark', 3 'woke
  too late'. The expert is the worst (26 in 10 runs): e.g. seed 10 rim 70,6672 at 123.27 s; seed 12 rims 594,4355 and 644,6744. NOT
  yet traced (box 3: two traces per kind; likely a press from beyond GLOW_NEAR (a running jump over the gap) or a landing past the rim's
  90 px with speed).
- **RESCUES ARE THE BIG RED: 1,393 in 357 of 360 runs; only 6 runs clean** (adult N 6, middle N 2/26/28, child N 26, middle E 37).
  Causes (stuck[].what, numbers stripped): 'in a dip N px deep, the way on is N px down' 1009; 'the way on is N px down' 256; 'fell
  back down from here N times' 99; 'a trunk beside him, the way on is N px down' 93; 'in a dip, a drop of N px ahead, the way on is N
  px down' 75; the rest under 60. Every top cause is the down shaft's storeys. NOT shown yet whether the dark adds any: box 3's (2b)
  (the same castBots on a frozen c1008d8e, no dark, seeds 1-3, by cause) answers it; ENG-DOWNBOT's landing on t-eng-w3 is what these
  wait on if the base has them too.

## Box 1 END results (kept)
Plants 10/10 CAUGHT on frozen 6ba641166. lockall --check on frozen 6ba641166 vs c1008d8e's lock: 65/102 unchanged, exit 1 (37 gen2
stages in proto.gen2 only: the glowFlags counter; fixed in box 2 item 1).

## Done so far (box 1; all on the real 3-1 draft row, GEN2_DRAFT readied)
1. **gen2/dark.ts, the one brick:** World 6's darkZone LIFTED (fireflyZone, unchanged code); w6Swing.ts re-exports W6S_PROP/W6S_PROPS/
   DARK_ZONE/darkEnds/W6S_EMIT from it (World 8 imports unchanged). New end prop `darkToGlow` (DARK_GLOW_PROPS) and `darkEnds(a, b,
   'glow')`: a box over both ends' ground (320 above the higher, 260 below the lower) and one SLEEPING glowworm (id from
   sink.extras) over the landing of every rim in it (darkRims: a hop's far piece, else the first piece under the rim).
2. **The wake reaches below, bounded:** zones.ts GLOW_REACH gains up 240 / down 420 (3-1.md's proposed data) and `glowReaches(light,
   x, feet, facing)`: ahead is the way he FACES (a way down runs both ways). engine.ts stepGlowworms reads it; the dark's presence
   (darkShow) and the glowworm filter read the zone's box in y too, so a dark stretch in a shaft darkens its own storeys only.
3. **World 3 lays it:** w3.ts w3Drops carries darkEnds('a', 'c', 'glow'); the kit lists DARK_GLOW_PROPS and emits DARK_EMIT.
   Probe (probes/zones.mts): seeds 1-6 both settings: 12 dark stretches, 59-67 glowworms, 61-70 rims, darkGaps 0 on 12/12.
4. **The verdict 'every gap lit 1 s ahead' (GAME-MAP B9), two named halves:** `darkGaps(stage)` (laid: every rim in the dark has a
   light over its landing; a sleeping one is woken by a stop on the rim's piece facing it) and `litAhead(crossings, setting)` (a run:
   each rim he went over, its landing lit DARK_AHEAD = Normal 1 s / Easy 1.6 s before; RimWatch records the crossings per frame).
5. **dark.test.ts 5/5 GREEN** (the real engine, RealPlay on the draft): the lift is the same object; darkGaps clean seeds 1-4 both
   settings; a stop 30 px from a real rim wakes the landing 194 px under it and NOT a light 600+ px under him; walked off at once:
   litAhead RED ('landing dark'); stood 2 s then walked: GREEN Normal, RED Easy. planted-faults.py: 6 plants (running at hand-over).

## Ruling A (APPROVED by the lead, with a flag verdict): flags and animals in the dark
'Nothing stands in a zone' (pipeline flagInZone/foeInZone, levelCheck.ts:1145-1149) took every flag out of the glowworm dark: the
draft failed to build (flags 5,000-9,000 px apart). Built as **A**: zones.ts `keepsClear(z)`: every zone but a dark whose lights
sleep keeps the rule; the firefly dark (Worlds 6/8) keeps it unchanged. The lead's added verdict: `darkFlags` names a flag in the
glowworm dark where standing still lights no glow within DARK_FLAG_LIT = 1 s (GLOW_STILL 0.7 + the wake's travel); the lay's half,
`glowFlags` (pipeline, any world), hangs such a flag its own glowworm. On seeds 1-6 both settings 3 of 12 rolls had one before
glowFlags, 0 after. Toys: 'ruling A' (3-1's first roll builds with flags in the dark; 3-10 of 15-18 flags stand there) and 'darkFlags'
(RED with the glowworms near a flag hung out of reach; GREEN as laid). dark.test.ts 7/7 GREEN.

## The light API for ENG-SPORE (APPROVED by the lead as the architect's call, recorded in reference/architecture on the lead's branch)
darkRims/darkGaps read `zone.lights` of every `dark` zone; RimWatch asks the harness `lit(light)` for when a light woke. A puff's
light enters as a dark-zone light with a clock (proposed optional field `clock` on Zone.lights: the spore zone's period/warn/active/
offset; the Architect's OK, it is a type): the engine's darkness draw lights it while zoneState is warn or active, lit() returns the
start of its current window, and darkGaps counts a rim lit by it when its window >= DARK_AHEAD + the drop's air time.

## What 3-1 / 3-2's READY can measure (once the bot skill lands)
darkGaps(stage) == [] on every roll both settings; litAhead == [] on every castBots run of every bot (a per-row field); the wake
toy (a stop wakes the landing under the rim, not the shaft); plants RED.

## Polish check
Not yet: stills owed (step 5). Seen in numbers only: glowworms hang 90 px over each landing's near end, r 190.
