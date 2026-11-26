# BUILD-28 REPORT (W2-LANE: 2-8 "Before the Water Rises"; R-165.430 (2), READY-28, BUILD-28). Session 1 (W2-LANE a), started 9:44 AM ET (from date). Session 2 (W2-LANE b), started 10:07 AM ET (from date). Session 3 (W2-LANE c), started 10:30 AM ET (from date). Session 4 (W2-LANE d), started 10:52 AM ET (from date). Session 5 (W2-LANE e), started 11:19 AM ET (from the session hook date) Session 6 (W2-LANE f), started 11:41 AM ET (from the session hook date) Session 7 (W2-LANE g), started 12:05 PM ET (from the session hook date) Session 8 (W2-LANE h), started 12:49 PM ET (from the session hook date) Session 9 (W2-LANE i), started 1:15 PM ET (from the session hook date) Session 10 (W2-LANE j), started 1:05 PM ET (from the session hook date) Session 12 (W2-LANE l), started 2:20 PM ET (from the session hook date)


## EXACT NEXT STEP (BUILD-28 box 1, session 14, started 5:19 PM ET (from the session hook date); head = this commit on t-build-28-wip; code 4d8450bcc)
STEP 0 DONE; THE PLAN IS APPROVED BY THE LEAD (verbatim: "the plan is APPROVED as written ... Item 7: YES, yours, as a PURE deletion with
the hand build, on two conditions written in the commit: (a) a grep shows nothing but floodBasin sets r.flood ..., and (b) lockall shows no
listed stage moves"). NEXT (box 2): STEP 1, in this order:
1. The hand build's deletion, ONE commit (new replaces old): w2Stages.ts '2-8' (W2_STAGES :34, CAGES_28 :39 -> w2Arc28.ts, W2_PUZZLES :51,
   floodBasin :638-674, cageRoom :805, targetCount :990), w2Sections.ts '2-8' (:21, :90, :109, :285-354), engine.ts :1990-2014 (the
   rise-and-drain on RiverZone.flood.trigger + its guide line), :597-598 floodAt/floodTold, :3030, :6218; and the same dead path's two
   readers: river.ts:74 (RiverZone.flood's type) and gen2/legs.ts:184 (mirrors an r.flood only floodBasin set). Condition (a) PROVEN this
   box: `grep -rn "flood: {\|\.flood\s*=" src` -> only w2Stages.ts:663 sets it (legs.ts:184 copies an existing one; pipeline.ts:4303 is
   the STAGE's flood, P1's). Put that grep in the commit body; condition (b): lockall on the frozen deletion tree, its result in the body.
   Re-pin the tests that pin the hand build (READY-28's list: w2Puzzles.test :34-88 :91 :171 :198/:204 -> the pulley-cage cases move to 2-9;
   w2Stages.test PLANS :21 :68; puzzleCamera.test:20; w1NewArt.test:92; writtenKeys.test:37); re-read levelSeeds.ts:24, stageSheets.ts:92,
   pokeyJournal.ts:67, finds.ts:416 (w2_book's find re-placed on the high road's +).
   Re-read on 4d8450bcc this box: the line numbers above hold; cageRoom's ONLY caller is floodBasin (w2Stages.ts:651), so both go, with
   their kit signatures (w2Sections.ts:55-56), the export list (w2Stages.ts:956) and W2Plan's '2-8' (w2Sections.ts:21); stageClue.ts:34 and
   pokeyJournal.ts:67 hold 2-8 player words (the keeper's call: keep, or replace from lines-2-8.md).
2. w2Arc28.ts on 2-3's/2-7's brick form (w2Arc23.ts:136-160 brick(), :167-273 lays; w2Arc27.ts:106-125, :129 jetty, :146 porches):
   `A Pg1 Tw1:#soft@flood Pp1 Xf1 R Uc1^ /L Pg1>:#water@flood R F[P+|P] Pg1> R Pf1> R Sg1< E`, cages by socket (cage(), w2Arc23.ts:129)
   on beats 1,3,4,6; F = w2TwoRoad (w2.ts:224); beat 2 a marsh river with flood 'teach' and W2_FLOOD.teach {normal 6, easy 8}
   (floodLay.test.ts:112's numbers; judged on the still); the dyke (beat 8) about 4,000 px, three flood 'rise' dips; then STAGE_TABLE
   '2-8', KITS/WORLD 'w2-28', w2Manifest briefs '2-8' flood W2_FLOOD; `npx tsx tools/engine/addlevel.ts 2-8`.
3. T_CLOSE re-flown: `git show origin/t-design-26:reference/specs/sims/flood28.ts` (its legs are consts at :32-51: the 2,000 px to the fork
   becomes the dyke's laid length); W2_FLOOD.flown.px, .close, .tailOff from its output, pasted.
LINES (step 2): WRITTEN AND APPROVED (the lead's message this box): reference/story/lines-2-8.md on t-keeper-28 (943984c2f, cut from
c0e6034fe): merge it (or cherry-pick its one file) at step 2. Ids: w28.rise, w28.rise2 (the teach, 800 px+ before beat 2's dip), w28.turn,
w28.fork, w28.missingCage / w28.missingBank (locked exit; both true: missingCage), w28.home, w28.mission, w28.goalStart, w28.goalLate,
w28.floodCard (journal), w28.page (Pokey's journal page, replacing pokeyJournal.ts:67's). W2_TIPS.water STANDS for beat 4 ONLY on the
keeper's condition, HELD IN A TEST: WATER_WARN's wet gaps (pipeline.ts:3878) include NO flood water; no W2_TIPS.water hint within
WATER_WARN.lead+40 px before any flood water's near edge, every seed, both settings; Normal's one warning lands before beat 4. Ask the lead
(the keeper writes them) when their spots are laid: w2_book's find words (finds.ts:416) and 2-8's own wayside aside.
STEP 0's CHECKS (frozen trees /home/user/wt28m = f68a7421d, /home/user/wt28b = d4e7677ba; chattr +i on src, tools):
- KID_RUNS_59 alone (firstTimerBot.test.ts + w5RealReach.test.ts): RED on BOTH, identical: actual [8,9,7,7,4,7] vs [3,5,6,7,6,5]
  (firstTimerBot.test.ts:185), 15 pass 1 fail each; w5RealReach green. = the release line's (R-165.473), named, not this build's.
- P1's CI tool line on f68a7421d (gates.yml:157-179): CI_LINE_RESULT

## (superseded by session 14) EXACT NEXT STEP (session 13, W2-LANE m, started 3:49 PM ET (from the session hook date); code head 6c407a578 on t-build-28-wip)
## THE LEAD'S RULINGS ON READY-28 (received in session 13 after READY-28; written here as a doc commit only)
- L1: cages by socket, F[P+|P], no side channel: YES. K written P: YES on the condition the dyke beats' pressure is the flood's water,
  not a chase. 2-8.md (t-design-26) says it is: :36 beat 6 "The dyke path, three dips filling ahead (paddling depth only: never deep)",
  :38 beat 9 "Water lapping the path (paddling depth)", and :78 "ours: the water you SEE rising, never a chase". So K is written P;
  P2 is NOT needed.
- L2: B. The dyke path is about 4,000 px, T_CLOSE is re-flown with reference/specs/sims/flood28.ts, and there is one more home beat.
  The floor must be met on every tier as FLOWN (castBots), not estimated.
- L3: a Hugging Face reed island. An art lane makes it and logs it in HF-SPEND.
- L4: 2-8 FOLLOWS release 5 (the lead's recommendation; Matt has the final word on what Friday carries) and aims for release 6.
- P1 (the teach's rising water) starts now in its own pieces lane on t-eng-flood28. BUILD-28 starts when P1 lands, with the plan below
  as ruled (L1, L2).
READY-28 SENT; RULED (above). BUILD-28 waits for P1 to land; build nothing before it (level.md rule 25). No piece is
built in the level (a pieces lane builds P1). Ruling on B taken as given: fork-jump cc85378b0 + the walked-top reroute 6c407a578 LAND as
they are; 2b stays out (rule 21). The child's 3 late-0 'PRESS off bank' rows (seeds 1-3, the fork probe, both configs) are a named BOT
READ GAP, R-165.475: the FIX-21 water look fires from a bank whose way on steps DOWN onto a floor; owner the bot lane after release 5.
Their frames (rule28-s12/probe-6c407a578-cfg2-8.txt and -cfg2-3.txt; the session 12 trace below): child s1, late 0, t 11-14.5 s: he
walks off W's lip at full run (x 930, vx 285), lands on the bank's very edge (x 1010; the edge 1000); the water look sees the first dip
117 px out and PRESSES at the lip (t 13.9); the jump lands on the porch (x 1078, y 740): the high road. Seeds 2-3 identical rows.
Rule 28 on the head is complete for the fork (51/54 both configs, rescues 0). Next builder: read READY-28 and the lead's rulings, then the kit map (kitmap-28-s12.md).

## READY-28 (session 13; every number from the built stage or a named file:line on bfbfd2a09; estimates are marked ESTIMATE)
### 1. The plan (rule 25 step 0)
Node string as LAID (the design's, 2-8.md:44, with the four notation changes of section 2, each the lead's call, L1):
`A Pg1 Tw1:#soft@flood Pp1 Xf1 R Uc1^ /L Pg1>:#water@flood R F[P+|P] Pg1> R Sg1< E`. Home is LEFT (out right, /L back along the dyke).
| # | Token | Beat | Piece (brick, from) | Data field |
|---|---|---|---|---|
| 0 | A | arrive, the village jetty | 2-3 w2-23-marsh (w2Arc23.ts:264) / 2-7 jetty (w2Arc27.ts:187), as a 2-8 brick | start; W2_FOLLOW families |
| 1 | Pg1 | the first cage, 2 ducklings | 2-3 first-cage (w2Arc23.ts:265, lay :172) | cage socket cage(id,on,t,critter,dn) (w2Arc23.ts:129), role objective |
| 2 | Tw1:#soft@flood | TEACH, the water rises (soft, paddling depth), flag before | NEW P1 (teach rise) on a marsh river | RiverRow.flood 'teach' (P1), marsh (riverLay.ts:124); tip 800 px before (rule 6) |
| 3 | Pp1 | the pad pond, cage 2 (2 otters) | 2-2 pad bricks (w2Arc22.ts:239-247), rows W2_PADS (w2.ts:266) | cage socket on the far bank |
| 4 | Xf1 | the reed island, cage 3 (2 capybaras), flag, then R | 2-7 porches plank hops (w2Arc27.ts:146) over a 'water' gap (W2_TIPS.water, w2.ts:86); the island a solid with the cage socket | the line follows his hops (follow.ts:3-6): no side channel (L1) |
| 5 | R | rest | 2-3 w2-23-rest (w2Arc23.ts:273) | the stage find NOT here (the high road's +) |
| 6 | Uc1^ | the last cage (1 duckling) at the steps' foot, the turn; the flood starts | a data brick: three walks dy -45 (2-6 first-street's walk dy, w2Arc26.ts:104; the fork's own rises W2_FORK.rises, w2.ts:190; 45 = session 11's painter band, a thin piece draws as a step) | cage socket at the foot = the last met (floodLay.ts lastMet) |
| 7 | /L | home is left | legs.ts:20, :162 reflectLeg (proven ARC_27, w2Arc27.ts:34) | ground clear of the out leg |
| 8 | Pg1>:#water@flood | PRESSURE, three dips filling (paddling depth), flag | a data brick: marsh dips from a row with flood 'rise' (riverLay.ts:52) | K written P (L1): pipeline.ts:561 maps pressure to practise; K lays a CHASE (chaseLay.ts:2, :110) |
| 9 | R | rest, Dot's fork line here | rest brick | the fork tip in view of the water (2-8.md:49) |
| 10 | F[P+\|P] | THE FORK THE WATER DECIDES | w2TwoRoad (w2.ts:224), W2_FORK (:190), W2_FORK_RIVERS (:222), W2_FLOOD (:156); the B bots (cc85378b0, 6c407a578) | brief.flood = W2_FLOOD (types.ts:765, pipeline.ts:4301) |
| 11 | Pg1> | the reed bank, flag, heart after | as beat 8 (flood 'rise') | |
| 12 | R | rest | rest brick | |
| 13 | Sg1< | the parade, the water 10 px under the boards | 2-3 w2-23-home boardwalk (w2Arc23.ts:272, :251); FLOOD_PADDLE (floodLay.ts:21) | flood 'rise' under the boards |
| 14 | E | the jetty, each little one home | 2-3 w2-23-gate (w2Arc23.ts:277) / 2-7 home-jetty (w2Arc27.ts:203) | goal rescue: Normal 7 (CAGES_28), Easy 5 |
Kit and row (build work, not pieces): a new w2Arc28.ts (STAGE_28, ARC_28, BEATS_28, own: true as every W2 brick), STAGE_TABLE '2-8'
(stageTable.ts:32-81), KITS/WORLD 'w2-28' (listed.ts:45, :51), w2Manifest briefs '2-8' (w2.ts:342) with flood: W2_FLOOD.

THE 2-MINUTE FLOOR (STAGE-RULES.md:84, a quick player, every roll): AS FLOWN IT FAILS. The design's legs are short: from the turn
2,000 px to the fork + 1,400 low road + 1,000 to the jetty = 4,400 px (2-8.md:9), and on a leg stage the out leg spans the same x
(home is the spawn's jetty), so about 9,000-10,000 px of route. Measured comparison (libstage 4 seeds x 2 settings, this session):
2-3 lays 27,510-28,124 px, model 172-176 s; its quick Easy player measured 144-146 s (BUILD-23 REPORT:384). ESTIMATE for 2-8 as flown:
the quick tier home in 60-75 s (out ~4,400 px at 2-3's ~190 px/s, the home leg bound by the line: 23.1 s Easy / 28.4 s Normal from
the turn, 2-8.md flights). To clear 120 s with 2-3's margin, each leg needs ~13,000-14,000 px (2-3's ~2,000 px a token).
Where the length goes is a DESIGN ruling (L2): (A) all of it after the fork's low road and on beats 0-6: T_CLOSE 26 s stays as flown
(the close measures only the last cage -> off the low road, floodLay.ts px), but the home leg is then ~10,000 px of line-paced reed
bank and parade, thin; (B, my recommendation) split it: the dyke path (beat 8) to ~4,000 px, T_CLOSE re-flown with
reference/specs/sims/flood28.ts (data: W2_FLOOD.close/flown), one more home beat from the World 2 pool (Matt 10-30: more pieces), and
the rest on the out leg. Check: castBots quick tier >= 120 s on all 40 seeds, both settings (rule 28), the model's fast >= 143 s
(2-7's floor, BUILD-27 REPORT:367).

THE HAND BUILD'S DELETION LIST (new replaces old; lines re-read on bfbfd2a09 this session where marked *):
w2Stages.ts: W2_STAGES '2-8' :34*; CAGES_28 :39* (the number moves to w2Arc28.ts); W2_PUZZLES :51* drops '2-8'; floodBasin :638*-674*
(its stop :663*); cageRoom :805*; targetCount :990* ('2-8' branch). engine.ts:1988*-2011* (the hand build's in-basin rise-and-drain
and its hard-coded guide line), :3028 (its respawn reset), floodAt/floodTold fields: REPLACED by P1, deleted with it. w2Sections.ts
'2-8' (:21*, :90, :109, :285*-354). stagePlan.ts:87* stands (the story line). Tests that pin it: w2Puzzles.test :34-88, :91, :171,
:198/:204 (the pulley-cage cases move to 2-9); w2Stages.test PLANS :21, :68; puzzleCamera.test:20, w1NewArt.test:92 (id lists);
finds.ts:416 (w2_book's hint: its find re-placed on the high road's +); also levelSeeds.ts:24, stageSheets.ts:92, pokeyJournal.ts:67,
writtenKeys.test.ts:37 (re-read before each edit).

### 2. The pieces 2-8 lacks (the kit map's 6 + the two parse faults): the smallest honest way for each
1. THE RISING WATER'S TEACH (Tw1): NEW ENGINE PIECE P1. The one flood clock starts at the LAST cage (floodLay.ts:1-6, lastMet), so a dip
   that rises at beat 2, before three cages, has no clock. The only rise-on-approach in the tree is the hand build's (engine.ts:1988-2011:
   x-trigger, drains when he stands on a bank, a hard-coded guide line), deleted with the hand build. P1: a flood mark 'teach'
   (RiverRow.flood, riverLay.ts:52; river.ts:76 floodMark kind) whose water rises to paddling depth (FLOOD_PADDLE) on its OWN start, the
   first frame he stands within its span, and never drains (a respawn keeps it); no stage id or x. Plus nodeAsks.ts:175: `#kind@flood`
   checked (the node laid a flood-marked water) instead of reported 'Later'. Toys (rule 21): the dip rises when he arrives, RED with
   the mark removed; lineBot (lineBot.test.ts floodRun) leads the line through a rising dip, RED with the read removed. ~2.5 h with
   gates (CI line, suite, paintcheck 3/3, lockall 102/102 unchanged: no listed stage marks 'teach').
2. THE CARVED STEPS (Uc1^): DATA, an existing pattern. Three walks dy -45 (2-6 first-street, w2Arc26.ts:104), the shape the fork's high
   road already lays and the bots already climb (W2_FORK.rises, FLOOD_STEP 60, floodLay.ts:23; the line's step, follow.ts Trail.step).
   Content 'climb' is the brick's own declared type (nodeAsks.ts:66). Art: w2-props#steps (w2.json, 2-8.md:61). 0 engine h.
3, 4. BOTH DYKE-PATH BEATS (Kg1>:#water@flood, Kg1>): DATA, if the lead accepts writing them P (L1). In this engine K lays 1-8's
   falling-branch CHASE on every K node (chaseLay.ts:2, :110-113), and 2-8's pressure IS the flood clock, already laid over the whole
   home leg by layFlood; the meter scores K as practise (pipeline.ts:561), so P changes no number. The dips: marsh rivers from a row with
   flood 'rise' (riverLay.ts:52, :124), paddling depth only. 0 engine h. (If K must stay K: P2, K lays the KIT's pressure, chase or
   flood, ~1.5 h with a toy and lockall: 1-8 unchanged.)
5. THE REED-ISLAND CAGE (Xf1): DATA. 2-7's plank hops (w2-27-porches, w2Arc27.ts:146) over a 'water' gap, the island a solid with the
   cage socket. The design's "the line paddles a soft side channel" has no piece: the line walks HIS trail, hops included (follow.ts:3-6,
   record() 'walk' takes his air), so it crosses where he does (L1). Art: no reed-island picture in w2.json (the hand build's islands
   are moss_stone blocks 110 high, w2Stages.ts:649: the soil-bank band); a Hugging Face ask for a reed island is the lead's call. 0 h.
6. ':+cage' (nodeCode.ts:107: '+' is a FIND; nodeAsks.ts:171 wants a find named 'cage'; cages are objective sockets,
   pipeline.ts:3720-3726): DATA. Cages ride their bricks' sockets as 2-3's do (ARC_23 marks none, w2Arc23.ts:46); the tokens lose
   '+' and ':+cage' (a '+' on beats 1, 3, 4 asks a FIND there); the plan test checks a cage in beats 1, 3, 4, 6 (rule 2). 0 h.
7. A FORK ROAD CARRYING A MARK THROWS (pipeline.ts:613-614: any content or move inside a road): DATA. `F[P+|P]`: the high road's '+'
   is the fork's own (stripped, pipeline.ts:612), the roads' content (porches f, marsh w) is fixed by w2TwoRoad and checked by its own
   verdicts on the BUILT stage (floodFaults, highRoadFaults, forkFaults, bankLandFaults). 0 h. (If the roads' asks must be checked:
   P3, asks matched to the two-road section's roads, ~1.5 h.)
TOTAL (if the lead takes the data routes, L1): PIECES ~2.5 h (P1 only, one engine lane at xhigh) from 6:30 PM ET -> ~9:00 PM ET.
BUILD ~7.75 h of work (kit + row + brief 2.5; the hand-build deletion and re-pins 1.0; length to the floor 0.5; rule 28: castBots 40
seeds x 2 settings + traces 1.5; seedlist + tierBots 0.5; stills both ways at beats 2, 5, 8, 11 + the beat-8 dawdle clip 0.75; the
full gates once 1.0), ~9.5-10 h wall with 28-minute box hand-overs. EARLIEST HONEST READY TO LAND: Friday ~7:30 AM ET, with no red at
rule 28 (each red cause on this level has cost 1-3 h, sessions 6-12). With P2 and P3: +3 h, Friday ~10:30 AM ET.
MY RECOMMENDATION (L4): 2-8 FOLLOWS RELEASE 5. It would land on the integrator's day with no slack, the 2-minute floor needs a design
ruling first (L2), and Friday's integrator already carries lockall's 32 moved ids.

### 3. Must-show, look items, Dot, walk vs paddle
- MUST-SHOW: from the bank's edge, upright, the low road reads as WATER: stills-s12-first117/fork-s1-edge-upright.jpg, APPROVED by the lead.
- LOOK (i) top-upright's pocket: both banks of the dip under the log show rooted lips (stills-s12-top/); open: the first landing's
  square seam against the bank (edge/lip-upright), for the build's polish pass. (ii) top-sideways' dark band under the log deck (world
  y ~1499-1536): I COULD NOT NAME ITS DRAWER this session. Ruled out (session 12's frames): the river zones, the stage water plane,
  the live platform list, the soil fix. The candidate stays groundStack.ts's ceiling over a lower leg (the upper leg's earth ends at a
  ceiling and its underside's hang is drawn; groundStack.ts:1-12; ceilingsOverSpan :192 for a river span), unproven: the next frame
  to shoot is the same view with protoArt.ts's two groundStack helpers off (*-noceil).
- DOT'S CARD: CONFIRMED from a run started at the SPAWN (no teleport): stills-s13/spawn-dot-upright.jpg, 2-8's config, seed 1: the
  wayside line (wayside.ts:102, "The river's rising...") is up at game time 2.8 s with Pokey at x 15,043, 2,407 px before the fork's
  wall-step (x 17,450; out of view). It is not at the fork in a real run. Story note (for the story keeper, not mine): the line says
  the river is rising at the jetty, before anything rises; an 'on' moment (the last cage) would fit the flood (wayside.ts WayAt 'on').
- WALK vs PADDLE (2-8.md, t-design-26): Pokey WALKS the marsh floor and hops the dips; the little ones PADDLE splash-back water at his
  pace (2-3's contract, follow.ts:6-7) and WAIT at deep water as at a climb's foot; the low road turns deep at T_CLOSE 26 s after the
  last cage; one in it then sits on its near bank (FLOOD_SIT 40, floodLay.ts), drawn hiding in the reeds (followArt.ts:110).
### The lead's calls (one at a time): L1 the four notation changes (cages by socket, K written P, F[P+|P], no side channel);
L2 where the 2-minute length goes (A or B); L3 a Hugging Face reed island (or the soil-bank block); L4 2-8 in release 5 or after it.
### Method notes this session: the spawn still's port check used `ss`, which is not in this container: the check printed 'free'
without testing (vite --strictPort would have refused a busy port; it served, and I killed it after the one tree). Next time: `curl -s
127.0.0.1:PORT` or `lsof`.

## (superseded by session 13) EXACT NEXT STEP (session 12, W2-LANE l, started 2:20 PM ET (from the session hook date); code head 8bb00acae; bot head 6c407a578)
HAND-OVER AT THE BOX (2:55 PM ET from date; past the 28-minute work box by 7 min: my miss). Heads: t-eng-marsh 8bbb510f8 (the piece,
its gates GREEN, item 6); t-build-28-wip 7ea5d5f3e = code 8bb00acae (2-8 marsh.first 117) + bot 6c407a578 (fork-jump cc85378b0 + the
walked-top reroute). The lead APPROVED the open-140 stills, then RULED the first landing (RULE 1 any walk-off lands on the floor; RULE 2
water in the upright frame from the bank's edge): done (5). B's rows reached the lead before the push (D117); its ruling on what lands
(fork-jump + B, 2b not landed; the child's 3 late-0 rows) is OPEN.
RUNNING AT THE BOX (frozen /tmp/claude-0/wt/6c407a578, logs in the session scratchpad, gone with the container): the src suite in 6
shards (shard 1: 235 ok, 0 not ok); lockall: base recorded on main 4bf2cbaaa, then --check on the head; the CI tool line, then
paintcheck 2/3. RESULTS AFTER THE HAND-OVER (already running, D138): CI tool line on 6c407a578: 434 tests, 433 pass, 0 fail, 1 todo (the OPEN chase-bots child): GREEN; paintcheck 2/3: PASS (0 new, 106 known ids). LOCKALL vs main 4bf2cbaaa (base recorded on main, --check on 6c407a578): 70/102 unchanged, rc 1: 32 MOVED (lockall-s12-main4bf2-vs-6c407a578.txt): 30 by proto.hints only, 1-4 and 2-7 whole builds. NOT this session's: vs the branch's own base 2808df79d the engine piece moved 0/102 (item 6) and B touches tools/ only; t-build-28-wip is 825 commits past its merge base with main (1558489a2; main 20 past it), so these are the branch's carried differences from main: the integrator's to reconcile at the merge, named, not judged here. THE SRC SUITE on 6c407a578 (6 shards, frozen except src/game/gen2/proven): 4,207 pass, 1 FAIL: firstTimerBot.test.ts 'not ok 196 - 5-9's Easy goal rests on the kid's runs: re-measured, they are still the ones recorded (gen2/game.ts KID_RUNS_59)'; the same test FAILS on the branch's base 2808df79d (frozen /tmp/claude-0/wt/2808df79, run alone): INHERITED, not this session's (B acts only at a flood fork; 5-9 has none). To the lead: the owner of KID_RUNS_59 re-measures and re-pins it (rule 20: after the full suite). Two known TODOs also print (4-3 wall check; R-165.312). If they never arrive in this REPORT, re-run each ONCE on 6c407a578's tree (suite frozen except src/game/gen2/proven).
NEXT, in order: (0) ReadNotifications: the lead's ruling on B. (1) record the gates above. (2) READY-28 to the lead, on 2-8's own config
(forkstills-s12.mjs.txt, FORK_AS 2-8, the shots DRIVEN): the must-show = stills-s12-first117/fork-s1-edge-upright.jpg (from the bank's
edge, upright, the first dip's water below-left); the look items: (i) top-upright's pocket: on the new marsh both banks of the dip under
the log now show rooted lips (stills-s12-top/); NEW: the first landing's square seam against the bank (edge/lip-upright); (ii)
top-sideways' dark band under the log deck (world y ~1499-1536): NOT the river zones, NOT the stage water plane (diagnostic frames
stills-s12-top/*-norivers, *-nowater: unchanged), and in FIX-SOIL-c's BEFORE porch-sideways too (so not the soil fix's underside); the
terrain is not drawn from the live platform list (*-noplat unchanged), so its drawer is NOT yet named: find the terrain layer the
porch's span is drawn from (groundStack.ts:190 the stacked leg's ceilings is the candidate, unproven); it reads as a flat dark slab
with a foam line, a hole more than shade. Dot's card over the fork: 2-8's scripted wayside line (wayside.ts:102, the Petal, at
'start', due START_AFTER_MS 2.4 s into play, wayside.ts:335,377): in a real run it shows by the spawn, long before the fork; it shows in
the stills only because the shot starts play at the fork. WALK vs PADDLE (2-8.md, t-design-26): Pokey walks the marsh floor and hops
the dips; the little ones paddle splash-back water at his pace (2-3's contract) and wait at deep water as at a climb's foot; the low
road turns deep at T_CLOSE 26 s after the last cage. THE PLAN (level.md rule 25 step 0): the node string `A Pg1+:+cage Tw1:#soft@flood
Pp1+:+cage Xf1+:+cage R Uc1^ /L Kg1>:#water@flood R F[Pf1+|Pw1] Kg1> R Sg1< E`, one line per beat: piece (section id, file:line), data
field; NOT STARTED; the W2 kit map per token is in kitmap-28-s12.md (arrived after the hand-over: 6 tokens MISSING (T, U, K x2, the island-cage, carved steps), no 2-8 kit or row, `:+cage` parses as a find, and a fork road carrying a mark throws, pipeline.ts:613-614). Then WAIT for GO before BUILD-28.
LEARNED (proposals for level.md, the lead decides): (a) a walk-off a level's data changes is held by a verdict over EVERY walk-off speed,
creep to full run, measured in the real engine before the number is chosen (the open dip broke the run-takes-the-low-road rule; the
first landing's 117 came from 16 measured run-ups); (b) a bot draft is re-proven on the probe WITH every draft it was proven beside
(fork-jump alone 15/54; with the walked-top reroute 51/54); (c) session 11's painter band table (moss_stone 1-49 thin piece, 50 one
boulder, 51-89 code terrain, 90+ soil bank).
DONE (the lead's ruling A): (1) THE PIECE on t-eng-marsh 5f8cb1edb (cut from 2808df79d): riverLay.ts RiverRow.marsh.open (data, unset
   = the old shape): a dip `open` px wide at the near bank's foot, the dips evenly split the rest; an open that leaves no floor throws by
   name. Toy riverLay.test.ts "a marsh's `open`": both ways (unset/0: first piece at the bank's foot, 5 x 200 px pieces; open 220: no
   floor in the dip, the far end unmoved, dips 100) GREEN; PLANTED (the lay change stashed): RED. tsc 0; generalitycheck PASS (26/26
   known). lockall --check vs a base recorded on 2808df79d and the CI tool line on frozen /tmp/claude-0/wt/5f8cb1ed: RUNNING (item 2).
   (2) MERGED (ff) into t-build-28-wip; 2-8's data 3170a73f4: W2_FORK_RIVERS marsh.open 140 (gap1 = physics' sure single-jump gap,
   inside his 205 px full-run reach off the bank's 75 px drop). w2TwoRoad.test's W-flush plant read 135 hard-coded; with the marsh open
   the first ground under a flush W's lip is the water (165 = 60 + 75 + marshWater 30): its depth now reads from the data, still RED by
   name. w2TwoRoad, flood, floodLay, lineBot tests: 42 pass, 0 fail.
   (3) BUILT (2-8's config, seed 1, read off the built stage): W 17450 w330, bank's edge 17369, the open dip 17229..17369 (140), floor
   pieces 172 wide from 17057 down. STILLS stills-s12-lip/ (forkstills-s12.mjs.txt: the lip DRIVEN from the bank right of W: run left,
   jump into W's face (frame 9), on top (23), pad let go at Wx+38 (48), stops at 17480 = Wx+30): upright, teal water fills the frame's
   lower left from the bank's foot to the frame's edge, beside and below him; sideways, the open dip, then the floor pieces with water
   between. Not mine, named: a "HOLD DOWN" label over his head and Dot's rising-water line (the game's tip) cover part of the frame.
   (4) FOUND, SENT TO THE LEAD (a ruling needed before B lands): at open 140 the low road needs a HOP off the bank's edge, under the
   porch's near end (the porch starts at the bank's edge, 60 over the bank, one-way from below): the hop rises through it and lands him
   on the high road, and a full-run walk-off off the bank's edge drops into the water (splash-back): the lead's entry principle (the
   run takes the low road) breaks. Probe (draft-fork-jump-bot applied, late 0, seed 1, floodRun fork): open 140: middle 'PRESS off
   bank' (high, marshT -1), child-easy 'PRESS off bank', adult low but RESCUED 1; open 50 and open 0: middle marshT 6.5, child-easy 7.5,
   adult 4.4 (identical: the walk-off clears a 50 px dip), highs only by a PRESS off the marsh. Stills stills-s12-lip50/ (open 50,
   pieces 190): upright the water shows as a narrow slot between two soil banks at the bank's foot, not the frame's lower part.
   (5) THE LEAD'S RULING on the open width (RULE 1: any walk-off off the near bank's edge lands on the floor, creep to full run; RULE 2:
   from the lip, the bank's edge, upright, water in frame): `open` REPLACED by the FIRST LANDING (t-eng-marsh 8bbb510f8): riverLay
   marsh.first (data, unset = the old lay's own sum: no laid marsh moves), the dips and the other pieces split the rest; flood.ts
   walkOffLand(drop) and bankLandFaults (the first landing reaches past the edge >= walkOffLand + half his width + 15), laid by floodLay.
   MEASURED (the real engine, RealPlay on 2-8's config, a bank 75 over the floor, 16 run-ups from a creep to 600 px): widest landing
   76 Normal, 80 Easy (a creep on Easy lands 39-40; on Normal it stands on the edge); walkOffLand(75) = 79.3. Toys: riverLay.test both
   ways; flood.test RED 1 px short, water at the foot, mirrored; w2TwoRoad.test RED by name at 116, GREEN at 117, both settings, RED with
   floodLay's call removed. tsc 0, generalitycheck PASS. MERGED 8bb00acae: 2-8 marsh.first 117 (79.3 + 22 + 15), the W-flush plant back
   to 135. Fork tests 31/0. BUILT (seed 1): first landing 17252..17369, the first dip 17152..17252, pieces 220.75.
   STILLS stills-s12-first117/ (DRIVEN; edge: on past W's lip, off onto the bank, pad let go 20 px short, stops at 17370, his middle at
   the edge, teetering): edge-upright: the first landing below-left, then the first dip's water in the frame's lower left, beside and
   below him; edge-sideways: two dips of water left of him. lip-upright (Wx+30): only a sliver of water at the frame's left edge.
   ROUGH, named: a straight square seam where the first landing's painted soil meets the bank (a flat cut bottom ~y 1300 at 2x, a
   vertical cut at its right end), in edge- and lip-upright: the soil painter's square seam, not 2-8's lay (look item for READY-28).
   (6) ENGINE PIECE GATES on 8bbb510f8 (frozen /tmp/claude-0/wt/8bbb510f8): lockall --check vs a base recorded on 2808df79d: 102/102
   stages unchanged, rc 0 (the usual 'gen2 gained verdicts and drops (not hashed)' list); CI tool line (gates.yml:157) 431 tests, 430
   pass, 0 fail, 1 todo (the OPEN chase-bots child); tsc 0; generalitycheck PASS. (The first piece 5f8cb1edb: CI line 430/0 too.)
B (the lead's ruling B; firsttimer.ts + lineBot.test.ts only, each its own hunks, NOT pushed until these rows reached the lead, D117):
   (7) draft-fork-jump-bot ALONE (cc85378b0: FORK_JUMP_SKILL, its toy: the ruled fork late 0, child-easy/middle/adult on the marsh
   floor first, home, no rescue: GREEN; plant FORK_JUMP_SKILL off: 'PRESS off W': caught): the probe 15/54 (rule28-s12/
   probe-forkjump-only-cc85378b0.txt): the read turns on the late 15/19 reroute, which walked each high-road piece's whole span in
   chain order (draft B never landed): 36 late-15/19 runs time out on the rises (px ~2680, home 0). The full draft-1b (B + 2b +
   fork-jump; LINE_SKILL conflict resolved keeping both flag sets) on ff50ad65a: 51/54, but its own pop-up toys fail on the new marsh
   (19: the child's 3; 20: with popUp off no pop-up run stalls: 2b unproven on this shape).
   (8) LANDED LOCALLY: fork-jump (cc85378b0) + draft B, the walked top line (6c407a578: REROUTE_SKILL.walkedTop; toy: middle seed 1
   late 19 home round the high road, no rescue; plant off: stalls/rescued: caught). Toys 3/3 on frozen 6c407a578. 2b NOT landed.
   RULE 28 on 6c407a578 (probe-fork-s12.test.ts.txt: 6 tiers x seeds 1-3 x late 0/15/19, the ROAD check; FirstTimerRun config 2-3
   AND 2-8): 51/54 on each (rule28-s12/probe-6c407a578-cfg2-3.txt, -cfg2-8.txt), rescues 0 on all 54. The 3 MISS: the CHILD, late 0,
   seeds 1-3 (identical rows), 'ROAD FAIL highBy PRESS off bank'. TRACE (child s1, late 0, t 11-14.5 s): he walks W, walks off its lip
   at full run (x 930, vx 285) and lands on the bank's very edge (x 1010, the edge at 1000, his box over it); the bot's water look
   (firsttimer FIX-21 wetBetween, his long press distance) sees the first dip 117 px out past the 75 px step down and presses at the
   lip (t 13.9); the jump rises through the porch's near end overhead (one-way) and lands on it (x 1078, y 740): the high road. On
   session 7's 200 px first piece the same child walked down onto the floor first. ENGINE-WORTHY (bot): the water look fires from a
   bank whose way on steps DOWN onto a floor (firsttimer.ts, the edge logic's `past`); named to the lead, not coded around.


## EXACT NEXT STEP (session 11, W2-LANE k, started 1:56 PM ET (from the session hook date); code head 6545a5823; hand-over at the box)
DONE: step 0 ff (t-build-28-wip 0f15f97d3 -> 334d94f64, no force); step 1 fork reshoot (stills-s11/: pillar GONE; the lead judged the
upright set: confirmed); step 2 the rises (6545a5823: W2_FORK.rises h 60 -> 45 in w2.ts; stills-s11-rises45/); the lead's extra order,
the marsh trace (stills-s11-marsh/, forkstills-s11.mjs.txt): cause sent to the lead = the ENGINE's marsh lay shape; STOPPED on it.
1. THE SOIL FIX'S GATES (FIX-SOIL-c, frozen a9c0170c tree, each ONCE): ALL GREEN, finished after the hand-over (D138: already running).
   paintcheck 0/3 PASS (0 new, 170 known ids seen); 1/3 PASS (0 new, 107 known); 2/3 PASS (0 new, 106 known); CI tool line (gates.yml:157)
   431 tests, 430 pass, 0 fail, 1 todo (the OPEN chase-bots child); drawcheck PASS (954 s); lockall --check vs
   reference/qa-reports/FIX-SOIL-c/lock-base-0f15f97d3.json: 102/102 stages unchanged, rc 0 (a draw-only fix moved no build; it also printed
   the usual 'gen2 gained verdicts and drops (not hashed)' list, not a move).
2. THE RISES (step 2): paintFalls on 2-8's own config (the toy planted as 2-8 and built the GAME's way, generateStage + finish, every
   sheet 'loaded' as paintFall.test does; probe: the session's /tmp/claude-0/probe/rises2.mts, logic in this note): seeds 1-8 x
   Normal/Easy: RED on the head 16/16 builds (ids 32/33 moss_stone h 60 drawn 'ground', painter '1-50, 90-420'); GREEN on 6545a5823 16/16 (0).
   Why 45 (named): a moss_stone this wide draws h 1-49 as a PAINTED THIN PIECE, exactly 50 as ONE BOULDER (protoArt drawRockArt: 1.15x
   its width, a 1,610 px rock: not a step; the packet's '50' was the boulder: pushback sent), 90+ as a painted soil BANK (a Pokey-tall
   step). 45 = the nearest a painter draws as a step to 2-8.md's 60, 5 clear of the boulder line. W stays 60: on the game's build it is a
   painted thin piece (FIX-SOIL-c's flag was a build without the finish), so the porch stays 135 over the marsh floor (ruling (c)).
   LOOKED AT (stills-s11-rises45, upright + sideways): the rises draw as World 2's rope-tied board steps on the porch log; nothing
   through the log. Boards, not stone, beside W's mossy cobble: the lead's to judge.
3. THE MARSH TRACE (the lead's order, sent with the lines): water LAID and DRAWN (riverLay.ts:115 surfaceY = floor 1593 + marshWater 30,
   riverLay.ts:85); the line PADDLES on a DRIVEN hop (frame 26, the duck at x 17169 y 1623); the old shots teleported him, so no trail
   over the dip (harness fault, fixed in forkstills-s11). From the lip UPRIGHT no water is in frame: riverLay.ts:112-114 lays a marsh as
   equal floor pieces starting with a PIECE at the bank's end and the water 30 under the floor's top; the nearest water (dip
   17069..17169) is 311 px left of his feet at 17480, the upright view reaches ~17270. ENGINE: STOPPED, the lead routes it (options: a
   marsh that OPENS with a dip at the near bank's foot, or a wet marsh with water at/over the floor). READY-28's must-show waits on it.
4. RULE 28 (the fork probe, probe-fork.test.ts.txt: 6 tiers x seeds 1-3 x late 0/15/19 = 54, the ROAD check; rows in rule28-s11/):
   HEAD 334d94f64 (rises 60, frozen /tmp/claude-0/wt-head): 0/54. Every run rescued once: (a) child-easy s1 late 0 'STUCK 1812/620@12.9R:
   water ahead, the way on is 255 px down'; (b) child s1 late 0 'STUCK 1923/620@27R: water ahead, the way on is 255 px down' (middle-easy
   s1: 195 px down). 6545a5823 (rises 45, frozen /tmp/claude-0/wt-r45): 36/54, rescues 0 on all 54. MOVED 36 rows MISS -> ok: the rescue
   at the high road's step down is gone (cause: the bot's step-down read on the rises' far treads; 255 = 60 + 60 + 135 reads as 'water
   ahead'; at 45 it walks down). The 18 left MISS are ALL late 0, every tier, 'ROAD FAIL highBy PRESS off W' (at late 0 he should walk the
   low road; the bot presses up W): the SAME on the head (head late-0 lines: 'ROAD FAIL highBy PRESS off W'), so not this change: the
   bot's road read (draft-fork-jump-bot.patch.txt never landed; ENG-THUMB's bot fix merges into 2-8 later; judged after it).
   lockall vs main: no listed row lays W2_FORK (w2TwoRoad only on the toy), so zero moves expected: NOT RUN. The src suite
   (w2TwoRoad.test, lineBot.test read W2_FORK): NOT RUN.
5. THE LEAD'S RULINGS (received at the box, after the hand-over was written; NOT started here):
   (i) the rises at 45 APPROVED (top-upright, porch-upright, top-sideways judged at 2x); the pushback accepted: put the painter's band
       table (moss_stone: 1-49 painted thin piece, exactly 50 ONE boulder 1.15x its width, 90+ painted soil bank, 51-89 code terrain
       for a piece this wide) in level.md's proposals in this REPORT's Learned.
   (ii) THE MARSH: option (a), built as a PIECE, not inside the level: a GENERAL marsh lay option to OPEN with a dip at the near bank's
       foot, its width a data field, OFF by default. On its OWN branch t-eng-marsh cut from 0f156ee79, its own commit(s): no stage id,
       seed or x in riverLay.ts (generalitycheck); a toy each way (with the option the marsh opens on water at the bank's foot; without
       it the old shape); lockall --check: NO listed stage moves; tsc + the CI tool line. Then merge t-eng-marsh into t-build-28-wip and
       set 2-8's data: the first dip wide enough that from the lip, UPRIGHT, water fills the frame's lower part beside and below him
       (MEASURED with the still: he stands right of centre, the frame reaches about 210 px left of his feet). Stills lip-upright and
       lip-sideways to the lead BEFORE going on. Option (b) (wet marsh) NOT this week. Pokey passing up into the porch log's picture
       mid-hop: judged acceptable (not a defect).
   (iii) TWO LOOK ITEMS for READY-28, a still each, AFTER the marsh: (1) top-upright (stills-s11-rises45), under the log, the pocket's
       RIGHT bank (~x 330 of 824, y 730 down) starts with a straight vertical side and no rooted lip (porch-upright's pocket has rooted
       lips both sides): is it FIX-SOIL-c's square seam (seamR) meeting a hung bank, and does a lip belong there; (2) top-sideways, a dark
       flat band right under the log deck (~y 365-400 at 1x of the 1830-wide still): what draws it (the ceiling's underside FIX-SOIL-c
       added, or a void), and does it read as shade or as a hole. Fix only if 2-8's lay; if the soil fix's draw, bring the lead the line.
   TIME (the lead): the marsh piece + its stills by 4:30 PM ET; READY-28 by 6:00 PM ET (say at 5:30 if it slips).
6. NEXT SESSION, in order: record item 1 (the gates still running at the box, finished by session 11 if it can: check this REPORT's
   'Session 11 gate results' line and the scratchpad logs are gone with the container, so re-run any not recorded); the marsh piece
   (5 (ii)) and its stills; THEN rule 28 ONCE on the head with the marsh change (not before: it moves the fork's rows again), the src
   suite once, lockall vs main once, paintcheck 2/3 on the head (owed); READY-28 on 2-8's own config with the must-show (from the fork,
   upright, the low road reads as WATER), walk vs paddle named from 2-8.md, the two look items, and the plan (level.md rule 25 step 0).
   Wait for GO before BUILD-28.

## EXACT NEXT STEP (session 10, W2-LANE j, started 1:05 PM ET (from the session hook date); code head cb52396a3)
STOPPED AT STEP 2 BY RULING (ii): THE SOIL COLUMN THROUGH THE PORCH LOG IS STILL THERE ON THE 1b HEAD. A NEW DEFECT, NOT PATCHED.
Waiting for the lead's word. Nothing after step 2 was started (no rule 28, no paintcheck 2/3, no READY-28).
1. 1b DONE: be38dd4eb merges origin/release-0.10.3 c73cb9766 (no force; merge base 90552d3ec, the same as ENG-29's 791735cfa).
   - engine.ts: 791735cfa's file AS IS (ours = fda48b3d8's, theirs = 4c73ac2ae's: ENG-29's exact inputs).
   - firsttimer.ts: 791735cfa's file + 4c73ac2ae..c73cb9766 (CI-15) merged onto it by git merge-file: clean.
   - lineBot.test.ts: 791735cfa's file + this branch's fda48b3d8..a95077e37 (the ruled-fork toys): both test sets, 18 tests; ours'
     wider imports. MY MISS, fixed in cb52396a3: the union merge dropped the `});` between the two sets, so the file did not parse;
     tsc -p . does not cover tools/ and passed; the CI tool line caught it.
   - TWO OTHER CONFLICTS, named: riverLay.ts (layRiver keeps both: `way` 5th, the release's leftward river (ENG-26c); `style` 6th, the
     marsh floor's; a marsh crossed right to left is refused like a tail; layRiverLeft passes `floor` on) and pipeline.ts (the release's
     way/farLip check, with the marsh floor pushed and near.style passed).
   - tsc 0 on be38dd4eb. CI tool line (gates.yml:157) on frozen be38dd4eb: 412 tests, 410 pass, 1 todo (chase bots child, OPEN),
     1 FAIL = lineBot.test.ts (the parse break above). lineBot.test.ts alone on frozen cb52396a3: see item 3.
2. THE FORK RESHOOT (stills-s10/, seed 1 Normal, 412x915 and 915x412 at 2x, forkstills-s10.mjs.txt; vite on frozen /tmp/claude-0/wt1b
   = be38dd4eb, port 5199 --strictPort (started clean), the served tree checked (/proc/<vite>/cwd = the frozen tree, w2.ts serves
   W2_FORK), vite killed after).
   THE TOY COULD NOT BE HOSTED ON 2-3 ANY MORE (found): release 4 made 2-3 a JUDGED gen2 row (stageTable '2-3': kit w2-23, judged
   'normal-2-3'), so the toy under 2-3's id is judged, and 5 verdicts refuse it on every seed (the page: "no seed of 24 from 1 builds
   cleanly"): drop.look-lies x4 (soft drops drawn void-dark at x 14243..14326, 18020..18103, 18264..18333, 18488..18574) and
   floor.unmarked at 14243..14326. The same 4 void-dark soft drops are there BEFORE the merge (a95077e37, headless, same toy, 2-3's
   config: 0 errors, because 2-3 was not judged then). Traced to the sections: home-flow (13921..14771) and
   home-practise-floating / home-test-back (17342..18883): the TOY's home bricks, NONE in the two-road section (home-practise-ride
   14771..17732). So not a 2-8 fault. HOSTED ON 2-8's OWN CONFIG instead (FORK_AS=2-8: unjudged, 0 errors, and __play('2-8') plays now
   with session 9's boot import): '2-8', travel left, gen2, 99 platforms.
   THE FORK READ OFF THE BUILT STAGE: W 330x60 at x 17450 top 1458, GAP 81, porch 2200 wide level with W (x 15169), 2 rises over it
   (1398, 1338; top 15969 x 600), the marsh floor 5 pieces of 200 (x 15969..17169).
   LOOKED AT (as Matt on a phone):
   - lip-sideways, porch-sideways, porch-upright: THE SOIL COLUMN IS STILL THERE: a full-height soil pillar painted from the frame's top
     to its bottom straight through the porch log (lip-sideways x ~165..420; porch-sideways x ~637..893; porch-upright x ~98..412, at
     2x). Ruling (ii): a NEW defect; STOPPED; stills sent to the lead; NOT patched.
   - Candidates over that span (headless, the same build): moss_stone 88x90 at x 16997 y 803; log 334x165 at x 17085 y 728;
     log 287x165 at x 16710 y 728 (narrow high pieces over the lower porch: the 'hung bank' shape FIX-SOIL-b fixed for banks).
   - NOT looked at (stopped first): lip-upright, bank-*, top-*.
   THE MARSH DIP: NOT SHOT, the same as session 9: three little ones freed right of the first dip walked to him without a paddle frame
   in 400 frames (line 16983..17051/1593 'follow'), upright and sideways.
3. lineBot.test.ts on frozen cb52396a3: 18 tests, 18 pass, 0 fail (10 s). With the CI line's other 410 pass on be38dd4eb (the fix touches only
   lineBot.test.ts), the CI tool line is green on cb52396a3 but for the one OPEN todo.

## EXACT NEXT STEP (session 9, W2-LANE i; code head 0cdc35b7f; this session adds only files under reference/)
1. THE STILLS: SHOT ON THE REAL PAGE, 8 of them, reference/qa-reports/BUILD-28/stills-s9/fork-s1-{bank,lip,porch,top}-{upright,sideways}.jpg
   (412 x 915 / 915 x 412 at 2x, seed 1 Normal), script forkstills-s9.mjs.txt (copy to a scratch .mjs; vite on the frozen tree, port 5199
   --strictPort; checked free first, the served tree checked (/proc/<vite>/cwd = the frozen worktree, its w2.ts served with W2_FORK), vite
   killed after the tree).
   WHY SESSION 8's PAGE PLAYED THE REAL 2-3 (found): the hand-built W2 plan W2_STAGES['2-3'] (w2Stages.ts:32) shadows the planted list;
   draftReady.ts (t-eng-w3) lifts it with `delete W2_STAGES[id]`, forkstills did not. With it lifted, the play build then refused the toy
   (2-3's rescue objective: "not enough cages for the quota"), because the app's level list is made at its first render; fixed the
   draftshoot way: the toy's sprint objective readied BEFORE the game's entry (main.tsx served with a boot import first).
   WHAT PLAYED: '2-3' as the toy, travel left, gen2, 99 platforms. THE FORK READ OFF THE BUILT STAGE: W 330 x 60 at x 17383 top 1458, the
   GAP 81, the porch 2200 wide level with W (x 15102), the marsh floor 5 pieces of 200 with 100 px dips (x 15902..17302). (x differs from
   the headless 17570: 2-3's config, not w2TwoRoad.test's towerCfg.)
   NOT ON 2-8's OWN ROW (said plainly): 0cdc35b7f has NO DRAFT_TABLE / draftReady / draftBoot (they are on t-eng-w3 only) and no 2-8 row,
   and window.__play('2-8') finds no level (it stays on the start screen, no console error). So these are the TOY on 2-3's config and
   world art, as session 8 named. The 2-8 draft row needs t-eng-w3's draft machinery in this branch: the lead's call.
   LOOKED AT (as Matt on a phone), and what they show:
   - lip-sideways (the clearest fork read): Pokey on W's mossy stone, the porch log level with him to the left, the 81 px gap a narrow
     slot between them; a sliver of water in a dip below the log. FAULT: a soil column painted from the frame's top to its bottom STRAIGHT
     THROUGH the porch log (x ~165..420 in the still).
   - porch-upright and porch-sideways: the same fault, worse: Pokey stands on the log in front of a full-height soil pillar; the porch log
     runs through the faces of the raised grass banks (the rises over it). Rough: not Matt's bar.
   - lip-upright: a heavy soil ceiling across the top third; below W and the porch the low road reads as SOLID DIRT, no marsh water
     visible from the fork (design (3): "the water's depth on the low road is visible from the fork": NOT MET on this toy).
   - bank-sideways: reads well: the bank, W one step up, the porch beyond; the river and a plank bridge behind him.
   - top-upright: WRONG SPOT: my 'top' takes the highest solid over the porch's span, which is the home jetty (boat, otter), not the third
     rise; Pokey drawn faded there. The three steps up and down are NOT yet shot.
   - NOT looked at: bank-upright, top-sideways.
   THE MARSH DIP: NOT SHOT: three little ones freed right of the first dip (x 17002..17102) walked over it to him without a paddle frame
   in 400 frames (line ended 16916..16984/1593, 'follow'): the 100 px dips may hold no water the line swims (to check: is the dip a river?).
2. THE LEAD'S RULINGS on c063c6f26 (by message): (i) do NOT bring t-eng-w3's draft machinery onto t-build-28-wip (it enters the
   release line once, at INT-W3M); 2-8's own-row look is BUILD-28's first look, AFTER 1b. (ii) FAULT (1), the soil column through the
   porch log, is the soil-pillar defect FIX-SOIL-b fixed (a bank's soil painted to the view bottom over a lower standable piece, the
   'hung bank' rule); 0cdc35b7f lacks that fix, release 4's fixes head has it. AT 1b, FIRST: reshoot lip and porch, upright and
   sideways, on the 1b head with this same toy (forkstills-s9.mjs.txt); if the column is still there it is a NEW defect: STOP and send
   the lead the stills, do not patch it. (iii) FAULT (2): 2-3's config has no marsh, so the toy cannot prove design (3). MUST-SHOW at
   BUILD-28's first look on 2-8's own row: the low road reads as WATER from the fork, UPRIGHT. (iv) at 1b, with the spots fixed, shoot
   'top' (the third rise) and the marsh-dip paddle; if the line walks the 100 px dip without paddling on 2-8's own row too, say whether
   2-8.md means the dip as a walk or a paddle, with the line number. (v) clipcheck and paintcheck on 0cdc35b7f frozen now; the 1b hash
   comes when release 4's merge lands (this evening).
   MY OWN SPOT FAULT, named: the porch still's 'log through the rises' faces' was MY pin: the porch's centre (x 16202) lies under the
   rises (15502..16902 at 1398, 15902..16502 at 1338, headless on the page's config, col.ts), so he was drawn INSIDE them. FIXED in
   forkstills-s9.mjs.txt (not yet re-shot): 'porch' = his first tread going left (between the rises' right end and the porch's right
   end: x ~17102); 'top' = the highest rise within 3 x 60 over the porch (not the home pieces at y 680..850). Candidates for the column
   in the stills: the narrow moss_stone blocks high over the fork (104 x 90 at x 16202 y 755; 88 x 90 at x 16930 y 803).
3. EXACT NEXT STEP (session 10; the lead starts it only once the 1b hash exists):
   (a) 1b at the lead's hash: git fetch origin t-build-28-wip (re-fetch before EVERY commit, D138); merge the hash (no force), keep both
       intents in firsttimer.ts; apply draft-1b-B2b-forkjump-popup.patch.txt as ONE engine-piece commit.
   (b) THE FORK RESHOOT, FIRST (ruling (ii)): forkstills-s9.mjs.txt (copy to a scratch .mjs; FORK_AS=2-3; vite on a FROZEN tree of the 1b
       head, port checked free, --strictPort, the served tree checked, vite killed after) lip and porch, upright and sideways, LOOKED AT.
       Column gone: go on. Column still there: a NEW defect: STOP, send the lead the stills, no patch. Then 'top' (the third rise) and the
       marsh-dip paddle (ruling (iv)).
   (c) rule 28 on the 1b head: ENG-PLANT's 10 known flips; the wide sample (seeds 1-10, every bot, both settings, 2-1/2-2/2-4: 0 BAR
       PASS -> FAIL vs main); lockall vs main; the probe 54/54.
   (d) the gates owed on the 1b head (the 0cdc35b7f runs are in gates-s9.txt; paintcheck 2/3 was NOT run on 0cdc35b7f, the lead's word:
       hand over after clipcheck and 1/3). Parts are 0-BASED (R-165.330): 0/3, 1/3, 2/3.
   (e) READY-28 on 2-8's own config (item 5 of the order); MUST-SHOW (ruling (iii)): the low road reads as WATER from the fork, UPRIGHT.

## EXACT NEXT STEP (session 8, W2-LANE h; code head 0cdc35b7f (= ceab09e20's code); this session adds only files under reference/)
1. THE 2b TOYS, ON THE DRAFT, READY FOR 1b (DONE): draft-1b-B2b-forkjump-popup.patch.txt is ONE patch that applies on 0cdc35b7f (checked
   with git apply --check): B (the walked top line) + 2b (the pop-up re-read) + the fork-jump read in firsttimer.ts, as the three earlier
   drafts, PLUS `LINE_SKILL.popUp` (the skill switch for the 2b line, the way keepRoad/leadLine are switched, level.md rule 21) and
   lineBot.test.ts with the probe's ruled-fork toy (floodRun's `fork`: W2_FORK and W2_FORK_RIVERS.low laid as gen2 lays them) and two toys:
   GREEN 'pop-up: ... he walks on round by it, home, nobody set back, no rescue': the four tiers whose double pops him up at late 0
   (child-easy, child, middle, expert) x seeds 1-3 on the ruled fork (gap 81): 12/12 shrine, home 3, setBack 0, rescues 0, each on the
   marsh floor first, 12/12 up by a PRESS off the marsh. RED 'planted: with the pop-up re-read off': 3 of the 12 stall and are rescued
   (child seeds 1-3: rescues 1, 66.1 s against 57.7 s with the skill). lineBot.test.ts 14/0 on the frozen draft (the 12 old toys and the
   2 new); tsc 0 on the draft.
   NAMED PLAINLY: on the new shape (gap 81) the stall without 2b is the CHILD's only. The other 9 pop-up runs (child-easy, middle, expert)
   do not stall without it: they keep the low road as their way, come back down to it and finish 1-2 s SOONER (child-easy 25.0 vs 27.3 s,
   middle 24.4 vs 26.5 s, expert 21.2 vs 22.1 s). Session 6's 11 stalls were on the old gap 60. So with 2b a popped-up bot goes round by the
   high road even where dropping back was quicker: that is ruling (c)'s model (his own move makes his road), not a speed choice. For the
   lead to judge; it changes no verdict (every run home, nobody set back).
2. THE STILLS: NOT SHOT (said plainly). forkstills.mjs.txt (the in-page toy build, towerstills' way) RUNS but the page does not play
   the toy: with FORK_AS=2-3 the toy builds clean in the page (no errors), yet after window.__play('2-3') the stage is the REAL 2-3 (125
   platforms, no gen2 sections, no 330 x 60 block): the LISTED/plantSeedList override that works for towerstills' 1-4 does not take for
   2-3 (cause not found). FORK_AS=2-4: the toy refuses to build on 2-4's config (verdict drop.look-lies x3: soft drops drawn void-dark).
   THE TOY'S REAL SHAPE, headless (forktoy-headless.ts.txt, w2TwoRoad.test's build, seed 1 Normal): W 330 x 60 at x 17570 (top 1458),
   the marsh (the flood-marked river) 16089..17489, so the gap 17489 -> 17570 = 81 and the fork is on the HOME leg, travel LEFT (dir -1):
   the script's spot logic (porch at q.x > W.x, facing 1) is wrong for it and must read the way left (porch's x + width at W.x - gap).
   The solids there: 1400 x 60 at x 15689 top 1398, 600 x 60 at x 16089 top 1338 (read the porch and rises from these; my F.porch
   width match finds nothing). NEXT: find why __play('2-3') ignores the planted list (try FORK_AS=1-4, which towerstills proves, for
   the geometry stills, then a World 2 stage), fix the spots for travel left, shoot, LOOK at each upright and sideways as Matt would.
3. THE OWED GATES on 0cdc35b7f, in frozen /home/user/wt28s8g (src and tools chattr +i, src/game/gen2/proven LEFT WRITABLE: the frozen-tree
   path D115 names, so seedListChunk.test's mkdtemp under proven/ is not refused), no cap shorter than the gate's own:
   DRAWCHECK: PASS, 956 s, all 19 listed stages (ctest-mix14 .. 2-5), upright and sideways, exit 0 (the run session 7 cut at 900 s).
   THE UNIT SUITE: started 12:55 PM ET, STILL RUNNING at this hand-over (1,283 results, 0 not ok so far); session 8 records its end in ONE
   commit touching only reference/qa-reports/BUILD-28/gates-s8.txt (D138: a running gate is finished and recorded; no other work).
   NOT RUN: clipcheck, paintcheck (3 parts), kbdcheck, buildcheck, seedlist 1-1 --check, tierBots. pacerLay :254/:280 are release 4's
   (D135) and clear at 1b.
   EXACT NEXT STEP for session 9: (a) git fetch origin t-build-28-wip and re-fetch before EVERY commit (session 8's gates-s8.txt commit
   may land after you start). (b) The stills (item 2's NEXT). (c) clipcheck and paintcheck --part 1/3, 2/3, 3/3 on 0cdc35b7f's code,
   frozen, proven/ writable, two at a time, no short caps. (d) The lead's 1b hash (item 4), else tell the lead and wait.
4. THEN: 1b at the lead's hash (release-0.10.3's final head after release 4's bot fix): merge it (no force), keep both intents in
   firsttimer.ts, apply draft-1b-B2b-forkjump-popup.patch.txt as ONE engine-piece commit, rule 28 (ENG-PLANT's 10 known flips, the wide
   sample seeds 1-10 every bot both settings on 2-1/2-2/2-4: 0 BAR PASS -> FAIL vs main), lockall vs main, the probe 54/54. If no hash
   has come, tell the lead and wait. 5. READY-28 on 2-8's own config (the lead's order, item 5).

## EXACT NEXT STEP (session 7, W2-LANE g; heads b433ade6b (engine piece), ceab09e20 (the verdict), + this REPORT commit). THE LEAD'S ENTRY PRINCIPLE: the RUN takes the LOW road,
## a JUMP the HIGH road; running off W never lands him on the high road; reaching it always needs a press
1. THE CARRY, MEASURED (probe-carry.test.ts.txt, copy it to src/game/ to run; output probe-carry-results.txt; RealPlay, the engine's own
   update, on 2-8's and 2-3's configs): W 330 (and W 900) on a bank, a level piece past W's far lip, the bank under the gap and the marsh
   75 under it; he runs W holding right and never presses. The widest gap a FULL-RUN WALK-OFF still lands him across (its near end past
   W's lip): Easy 66 (thin, the built porch) / 60 (block), on BOTH stages; Normal 44 / 52 on 2-8, 64 / 58 on 2-3. A walk-off is the same
   move for every tier (no press; the bot's speed at the lip is the engine's, 268 px/s in the air off a 285 run), so the carry is per
   setting, not per tier: the worst is EASY, 66 px. THE HELP THAT LANDS HIM, NAMED: the landing-from-above catch (engine.ts:2887,
   onFloor: catchDrop = 14 + ASSIST.catchDrop 6 x assistNow(); Easy's assistNow is 1 on every stage, so 20 px; Normal is
   easeAssist(stage): 2-8 0.29 -> 15.75, 2-3 0.5 -> 17): the frame before he is set on the porch his feet are 16.7 px under its top (3
   frames in the air at 66). NOT the lip hoist (forgive.mantle 26): the porch is a thin branch, under WALL_H 50.
   !! A PROBE FIDELITY FAULT: probe-fork runs the fork on 2-3's config (FirstTimerRun('2-3')), whose Normal catch is 17, not 2-8's 15.75:
   the adult's walk-off onto the porch at gap 60 (session 6's trace) does NOT happen on 2-8 Normal (carry 44) but DOES on Easy (66 > 60)
   on every stage. The probe should run on 2-8's config once 2-8 has a row; until then its Normal is 2-3's (more forgiving).
2. THE CHOICE: (y), the porch's near end beyond the carry. In one paragraph: (y) keeps every ruled number but the gap: W 330 (A2), the
   marsh floor 75 and the porch 135 over it (A3), the climb model (A4), the porch LEVEL with W, the three 60 px steps and 400 px treads,
   strandFaults' drops (W's lip 60 onto the bank, the porch's far tread 60). It changes three numbers: the gap 60 -> 81 (the carry 66 +
   the lead's FLOOD_LOW_HOP margin 15: the verdict passes 81, refuses 80), back 60 -> 81 (the gap stays over the bank: a walk-off lands on
   the bank; a short jump at worst in the marsh, the low road), near 420 -> 441 (30 px of bank stays before W's face: the fork's place moves 21 px,
   which floodFaults re-checks on the laid low road). The high road's first link is then a JUMP ACROSS (level, a press): NOT a jump UP,
   because a porch raised over W would make its far tread a 120 px drop onto the far bank, past the line's step 90 (strandFaults). (x)
   (the low road's way down not off W's lip) would re-shape the fork itself: everyone climbs W today and the choice is at its lip; a way
   down elsewhere needs W off the path or a second wall-step, a new look for 2-8.md and A2's W derivation re-done. (y) is the smaller,
   checkable change.
3. LANDED (pushed; each test run on the exact tree committed):
   (a) ENGINE PIECE b433ade6b: highRoad (flood.ts) takes `jump`: the fork's link off the wall-step W to a LEVEL piece may be a jump up to
       `jump` px, and W may stand back on the near bank up to `jump` px before its edge (so the gap stays over the bank); every other
       link stays a hop <= FLOOD_HOP 60. Planted in flood.test ('THE FORK'S JUMP'): the old rule (jump = hop) refuses W 81 back + gap 81
       by name (a bare edge hop), the new accepts; a gap of 97 past the jump 96, W farther back than the jump, a jump UP and a later 81 px
       link stay refused. flood.test 17/0 on b433ade6b ALONE (frozen worktree /home/user/wt28s7e).
   (b) THE VERDICT ceab09e20: forkFaults (3) 'a full-run walk-off from W's lip lands on the low road' with floodLay FLOOD_WALK_OFF
       { carry 66 (measured, above), margin 15 } and FLOOD_FORK_JUMP = 66 + 2 x 15 = 96 (the link a short jump past the rule's edge);
       W2_FORK gap 81, wall.back 81, near 441. Planted (w2TwoRoad.test, both settings, laid by floodLay): RED by name at 6470cc657's gap 60
       and at 80 (the edge), GREEN at 81. WHY back 81 too: with back 60 the porch's near end stood 21 px over the marsh and strandFaults
       refused it by name (a turn-back walk-off off its near end: 135 px down, past the line's step 90). tsc 0; w2TwoRoad + floodLay +
       flood tests 24/0 on ceab09e20's tree.
   (c) DRAFT, NOT LANDED (firsttimer.ts lands at 1b only, rule 28): draft-fork-jump-bot.patch.txt: the bot reads the high road as floodLay
       does (highRoad ... FLOOD_FORK_JUMP, firsttimer.ts:2462). WITHOUT it the bot's road breaks at W on the new shape. It applies on top of
       draft-B2b-reroute-popup.patch.txt (checked).
4. THE PROBE WITH THE ROAD CHECK: 54/54 (shrine, home 3, setBack 0, 0 rescues, AND the road check) on 89a0cf54e + B + 2b +
   draft-fork-jump-bot (frozen /home/user/wt28s7p; probe-fork.test.ts.txt, output probe-fork-results-s7.txt). The check (new in the
   probe): at late 0 he reaches the marsh floor (marshT set), and any high road reached is by a PRESS (a press within 0.1 s before the
   take-off or in the air), with where the flight left from. LATE 0, every tier walks onto the low road: the adult (22.4 s, marshT 4.4)
   and middle-easy (22.0 s) walk it home; child-easy, child, middle and expert reach the marsh floor and then pop up onto the high road
   by a PRESS off the marsh (a double: (c), the player's own move; the bots' calibrated dblShare, 2a dropped). LATE 15 / 19: 30 high
   roads reached by a PRESS off W (a jump across the 81 px gap). NO high road reached without a press in any of the 54 (0 NO-PRESS).
   NAMED PLAINLY: 4 of 6 tiers leave the low road at late 0 by a double off the marsh floor; the low road is walked home by 2 of 6.
   The probe still runs the fork on 2-3's config (Normal catch 17, not 2-8's 15.75): the more forgiving side.
THE LEAD'S WORD (its message, verbatim in substance): (y) ACCEPTED as built (gap 81, back 81, near 441, the first link a jump ACROSS,
   highRoad's `jump` with its toy, forkFaults (3) RED 60/80 GREEN 81, the road-taken probe 54/54). Two notes FOR READY-28: (1) READY-28
   re-flies the carry and the road-taken probe on 2-8's OWN config on the draft row (not 2-3's, catch 17 vs 15.75); (2) the READY report
   names plainly, as a design fact for Matt's playtest: 4 of 6 tiers leave the low road by a double at late 0, so the marsh may see fewer
   kids than the high road. "Carry on: the gates, the 2b toys, the stills, then 1b at my hash."
5. THE GATES ON 89a0cf54e (the code of ceab09e20; each in frozen /home/user/wt28s7s, said plainly):
   PASS: tsc; vite build (BASE_PATH) + chunkcheck; artcheck; knowncheck; generalitycheck; roadmapcheck and timecheck (after git fetch
   --unshallow); the engine tools' tests 50/0.
   NOT COMPLETED (my own timeout caps, two heavy runs side by side): drawcheck hit its 900 s cap (exit 124) after 2-5, no breach printed
   up to there: NOT a pass. The unit suite hit its 1700 s cap (exit 124) at test 2633, not finished, with 3 not ok:
   pacerLay.test.ts:254 and :280 (2-7's race 'RED without the skill': the pair D135 names as red on the base since 11-23; to be PROVEN on
   6470cc657 before it is called inherited, D135) and seedListChunk.test.ts:38 (EPERM: mkdtemp under src/, which the chattr freeze
   refused: a frozen-tree artefact, run it on an unfrozen copy). Not run: clipcheck, paintcheck (3 parts), kbdcheck, buildcheck,
   seedlist 1-1 --check, tierBots.
6. EXACT NEXT STEP (the lead's order, its box check): (1) ReadNotifications. (2) Finish the gates at the head with NO timeout cap
   shorter than the gate's own: the unit suite (the seedListChunk test unfrozen), drawcheck, then clipcheck, paintcheck 3 parts, kbdcheck,
   buildcheck, seedlist 1-1 --check, tierBots; prove pacerLay :254/:280 on 6470cc657 too. At most two at a time. (3) The 2b toys (a
   lineBot toy each way: a pop-up onto the high road; with 2b he walks on, without it he stalls and is rescued). (4) The stills of the
   fork and a marsh dip, upright and sideways (the stills path below). (5) 1b at the lead's hash: B + 2b + draft-fork-jump-bot land
   with firsttimer.ts (rule 28: ENG-PLANT's known flips + the wide sample). (6) READY-28 on 2-8's OWN config: re-fly the carry
   (probe-carry, STAGES=2-8 on the draft row) and the road-taken probe there; name the 4-of-6 double off the marsh as a design fact.
   Older notes, still true:
    (2) The full unit suite on
   89a0cf54e was STARTED at the box in frozen /home/user/wt28s7s (output: the session's scratchpad suite-s7.txt): read it (or re-run:
   the CLAUDE.md tsx --test line in a frozen worktree at the head); then the rest of the CI tool line (CI #79): vite build + chunkcheck,
   artcheck, drawcheck, clipcheck, knowncheck, generalitycheck, roadmapcheck, timecheck, paintcheck (3 parts), kbdcheck, buildcheck,
   seedlist 1-1 --check, the engine tools' tests, tierBots. At most two at a time. (3) 2b toys (a lineBot toy each way), the stills of
   the fork and a marsh dip upright and sideways. THE STILLS PATH (found): tools/engine/towerstills.mjs builds a FIXTURE in the dev page in
   place of a stage (TOWER_AS sets the stage it borrows: config and art), upright 412x915 and sideways 915x412 at 2x; the two-road toy
   (w2TwoRoad.test's build: towerCfg + homeKit with w2TwoRoad and W2_FORK_RIVERS) needs the same in-page build with TOWER_AS=2-3 or a
   World 2 stage, a copy of towerstills that builds that kit (nothing in the repo changes; reload and it is gone). No stage row lays the
   section yet, so these are the toy's stills, said so plainly to the lead,
   (4) 1b at the lead's hash (B + 2b + the fork-jump read land with firsttimer.ts there: rule 28, ENG-PLANT's known flips + the wide
   sample), then READY-28.

## EXACT NEXT STEP (session 6, W2-LANE f, hand-over on the box; head 3e847107a + this REPORT commit). THE LEAD RULED (c) (verbatim in its
## message: a DOUBLE jump up off the low road is his own move onto the high road; his ORDINARY hop must keep the low road)
DONE AND PUSHED (each on a chattr-frozen tree):
 A3 (cdb9e4dea): flood.ts lowHopFaults 'no high-road top within a SINGLE jump's reach of the low road's floor', laid by floodLay with
     FLOOD_LOW_HOP { reach 117.8 DERIVED (reach.ts APEX single-hold 97.8 + engine catch 14 + Easy's ASSIST.catchDrop 6), margin 15 } (flown
     reach, probe-a3reach.test.ts.txt: 115 Normal, 117 Easy, thin or block, standing or running). THE MARGIN: the marsh floor 60 -> 75 under
     the banks (W2_FORK_RIVERS), not the porch higher: one data number (2-8.md names no floor depth) vs W's height, the level hop and the
     design's 60 px steps; 75 is inside the line's drop (W2_FOLLOW.step 90). Planted (w2TwoRoad.test): RED by name at 60 (porch 120 over the
     floor), GREEN at 75 (135), both settings.
 A4 + A2 (0403ad42d, 3e847107a): W2_FLOOD.climb.land.child 62 -> 233 (its FARTHEST measured climb past W's face: the child-easy's double
     climb, session 5's 771 -> 1023 at face 790; session 6's 219; the other tiers' measured landings sit inside their derived ones: child 56,
     middle-easy 84, middle 75, expert 75, adult 56, so they keep them). W 150 -> 330 = 233 + 73 (run-up) + a 24 px MARGIN; near stays 420
     (30 px of bank before W's face; the climbs take off 19 px before it), so the fork's place and the flood's flown leg are unchanged.
     Planted (w2TwoRoad.test): the old model (child 62) passes W 150, the measured one refuses it by name, the ruled W passes; flood.test's
     edge moved to the child's (305 refused by name, 306 passes). w2TwoRoad + floodLay + flood tests: 22 pass, 0 fail (frozen wt28n,
     3e847107a).
 THE BOT (draft, NOT landed: draft-B2b-reroute-popup.patch.txt, firsttimer.ts, B's walked top line + 2b: a stand on a high-road piece
     while he keeps the low road re-reads his road as HIGH, goHigh from where he stands, the other road the low road's pieces). 2a (dip hops
     single) NOT done: PUSHBACK sent (the bots' doubles are the testers' calibrated dblShare, R-165.59); the lead's word pending.
 THE PROBE (probe-fork.test.ts.txt now reads the marsh floor from the data and records each climb): 54/54 (shrine, home 3, setBack 0,
     0 rescues) on 0403ad42d + B+2b (frozen wt28m; probe-fork-results-s6.txt). Also 54/54 on cdb9e4dea (W 150) + B+2b.
 !! READ BEFORE CALLING IT GREEN: the 54 pass, but the LOW ROAD is hardly walked. Late 0 (the line can make the low road): with W 330 ALL 6
     tiers take the HIGH road (adult highT 4.1, marshT -1: off W by a JUMP across the 60 px gap onto the porch, not a walk-off; middle and
     expert reach the marsh, then pop up by a double); with W 150 only the adult walked it (22.3 s), the rest popped up from the marsh by a
     double. The pass criterion does not check the road. The fork's choice point is W's lip (walk off: low; hop the level 60 px gap: high),
     so the bots' road at late 0 is a BOT behaviour to trace: TRACE=10 FROM=2 WHO=adult LATE=0 on wt28m (why the adult hops the gap off W
     330 where it walked off W 150: its lip aim with room to run?). The lead to rule whether a late-0 bot must walk the low road (a road
     check in the probe) and whether 2a comes back for that.
 TRACED (the adult, late 0, W 330, wt28m, EVERY=2): he does NOT hop: he climbs W (lands 684), RUNS W at 285 px/s and WALKS OFF its lip
     (940) at a full run: airborne 960/743, 979/757, then GROUNDED ON THE PORCH at 997/740 (the porch's near end 1000, the gap 60). So a
     full-run walk-off from W's lip carries over the 60 px gap onto the porch (the engine's landing help takes him up from about 17-26 px
     under its top: which help is NOT yet named: onFloor's catch 14 + the ledge forgiveness (landPx 8, physics.ts FORGIVE) or another;
     trace the frames 4.0-4.1 at EVERY=1 first). With W 150 the adult landed 56 px from the face, 94 px from the lip, too short a run to
     carry, and dropped through. A SHAPE FAULT under (c): his ORDINARY move (walking off W at a run) puts him on the high road; the gap
     must also be wider than a full-run walk-off's carry onto a level piece, yet it is the high road's first hop (<= FLOOD_HOP 60). FOR
     THE LEAD (not built): (x) the low road's way down not off W's far lip (e.g. W's near side, or a gap the high road does not hop:
     the porch from a second wall-step), (y) the porch's near end farther (gap > carry) with the high road's first hop made a step up,
     (z) W back to a width a run cannot build speed on (fails A2's child-easy). A verdict for it ('a full-run walk-off from W's lip lands
     on the low road') belongs in forkFaults, planted, once the carry is measured.
NEXT, IN ORDER: (1) ReadNotifications: the lead's word on the walk-off shape fault above (2a is DROPPED: the lead accepted the pushback;
 2b only, a toy each way, plus the toy that a single jump off the floor never reaches the porch). (2) The trace above. (3) The toys: 2b RED/GREEN (a
 lineBot toy: a pop-up onto the high road; with 2b he walks on, without it he stalls and is rescued) and B's (session 5's); commit them with
 the firsttimer.ts change at 1b only (rule 28: ENG-PLANT's 10 known flips + the wide sample, seeds 1-10, every bot, both settings, on
 2-1/2-2/2-4: zero BAR PASS -> FAIL vs main). (4) Stills of the fork and a marsh dip, upright and sideways (no running stage lays the
 section yet: 2-96 is a test toy; find the stills path first). (5) 1b at the lead's hash, then READY-28 with the full gate list.
 NOT RUN on this head: the full suite and the CLAUDE.md gates (tsc only, and the three fork test files). The draft-A1 marsh-from patch is
 DROPPED (not needed under (c); no unused engine code).

## EXACT NEXT STEP (session 6, W2-LANE f): A0 FAILED: A BLOCK DOES NOT STOP A HOP FROM BELOW. STOPPED before (i), as ruled; the lead rules
WAIT for the lead's word on the options below; nothing past A0 is built (the lead's order: "If a block does NOT stop him, STOP and tell
the lead before building (i)"). On the word: (c) -> A2, A3 (single-jump reach), A4, the bot's road re-read, re-probe; (a) -> re-shape first.
A0, PROVEN (probe-a0.test.ts.txt, its output probe-a0-results.txt; frozen /home/user/wt28h at c52f4ed39, RealPlay('2-1') bare, Normal):
 the marsh floor at Y+60 (860); over it at the porch's height the porch ALONE (thin, top 740, h 24), the porch with rise1 ON it (a block,
 top 680, h 60: the (i) shape), or a block ALONE (680-740). He hops straight up from the floor under its middle:
 - a full held SINGLE jump: feet 860 -> 762.2 (rise 97.8); his head (body 48) to 714.2 in ALL THREE, i.e. into the block's span: NO stop;
   he falls back to the floor in all three (a top is caught within 14 px under the apex on Normal, 20 on Easy: physics.ts ASSIST.catchDrop 6)
 - a DOUBLE jump (the second at the first's top): rise 176.9 (feet 683.1). Porch alone: lands ON THE PORCH (740). Block on the porch:
   rises through both, lands ON THE BLOCK'S TOP (680). Block alone: the same (680).
 WHY (engine.ts): no piece has a head stop. The solid-block code (engine.ts:2785) stops him only at a block's FACES (blockBeside, from
 left/right: "nor when he is wholly under it ... he cannot push it from below"); the only underside stop is a shut fig gate's
 (fieldPlay.ts lid). Every piece is landed on from above.
 SO (i) DOES NOT FIX (A): it moves the pop-up from the porch (120 over the marsh floor) to rise1's top (180); both are inside a double
 jump's reach (176.9 + 14 = 190.9 px; 196.9 Easy). Session 5's pop-ups (middle 1156/860 -> 1299/740, 120 up) are double jumps: a single
 jump (held, or a touch flick: realPlay.ts, 97 px up) reaches 111.8 (117.8 Easy).
 THE LEAD'S RE-RULING CROSSED (A1: the porch SOLID FROM BELOW, replacing (i)): A0 above answers it too: a non-thin piece (the 60 px
 block) does not stop him either; the engine has NO solid-from-below piece (only the fig gate's lid). So it needs a new engine head stop.
 A0b, ITS COST MEASURED (probe-a0b.test.ts.txt, output probe-a0b-results.txt; the head stop MODELLED by hand after each frame, not engine
 code): the marsh floor 860, the porch's underside 764 (96 px over it, 48 over his head), a 100 px dip at 1300-1400; he runs at a full
 run and presses a full jump at x. NO lid: across from every press 1200-1350 (1150 too early). WITH the lid: rise 48, across only from a
 press at 1290-1350 (10 px before the edge to the coyote's end, ~60 px, ~0.2 s), INTO the dip from 1150-1285. So a solid porch over the
 marsh cuts each dip hop's take-off window from ~150 px to ~60 px, at all four dips (a fall: a set-back to the near bank).
 OPTIONS (each the lead's; none built):
  (a) the high road over the marsh out of a double jump's reach: every high-road top over the marsh floor at least ~200 px above it
      (>= 140 over the banks), e.g. the three ups on the near bank before the water, the marsh crossed at Y-180 (240 over its floor), the
      three downs over the far bank. A new shape for 2-8.md (60 px steps and 2,200 px of high road can stay; the treads move; the near
      bank grows).
  (b) an engine head stop on the pieces over the marsh (opt-in, as the fig gate's lid): the porch's underside is 96 px over the marsh
      floor, 48 over his head: every dip hop under it would stop after 48 px of rise (~80 px of carry at a full run), short of a 100 px
      dip. Not workable under the ruled porch.
  (c) MY PICK: keep the ruled shape. A DOUBLE jump up off the low road is the player's own move onto the high road (both roads go home;
      the high road is the safe one); the choice stays his while his ordinary hop keeps the low road. A3 reads "no high-road top within a
      SINGLE jump's reach (catch included, Easy's 20) over the low road's floor": the ruled porch passes, 120 > 117.8, by 2 px on Easy
      (tight: the marsh floor or the porch 10-20 px further apart gives a margin; to name). The bot: its dip hop a single jump (it
      double-jumps today), and a pop-up onto the high road re-reads his road as HIGH so it walks on (the 12 late-0 rescues). A2 (W for
      the child-easy's measured climb) and A4 (forkFaults' climb from the measured flights) stand either way.

## EXACT NEXT STEP (session 5, W2-LANE e; hand-over on the 28-minute box; THE LEAD RULED (A) and (B), verbatim in its message)
DO (A) NOW, in this order, on a chattr-frozen tree for every run (D115); the probe is probe-fork.test.ts.txt below (copy to <tree>/probe/):
 A1. ONE ENGINE-PIECE COMMIT (rule 26): riverLay.ts RiverRow.marsh gains `from?: number` (px from the water's near edge in the leg's
     direction where the dips start; unset = today's even spacing, so every shipped row lays the same: prove with lockall, zero moves).
     With `from` the first floor piece runs 0..from and the four dips + floors share the rest: piece p = (width - from - dips*dip)/dips
     after each dip (1,400, from 400: 0-400 floor, dip 400-500, 150 floor, dip 650-750, 150, dip 900-1000, 150, dip 1150-1250, 150 to
     1,400). W2_FORK_RIVERS.low.marsh.from = 400 (W2_FORK: porch-alone stretch = rises[0] centred: (porch - rises[0].w)/2 = 400;
     derive it, never a bare 400). Planted test in riverLay/w2TwoRoad: from unset == today's pieces; from 400 == the layout above.
 A2. W wide enough that child-easy's REAL climb lands ON W: measured flight 252 px from W's face (take-off 771/800, lands 1023/740,
     W's face at 790); W.w >= 252 - (771..790 offset) + margin; name the margin (one body width, 44: W 300 is my first try) and
     re-probe; the gap and the porch move with W (w2TwoRoad's arithmetic), the high-road treads stay 400.
 A3. NEW VERDICT (flood.ts, next to strandFaults), named and planted: 'no low-road dip under a thin piece within his hop's reach' (a hop
     from the low road's floor must never pass up through a high-road piece): for each dip, the take-off span either side within the
     hop's reach (FLOOD_HOP) and his apex (measured: 180 px over take-off, child) against every thin high-road piece (h <= the thin
     limit the engine uses: find it, the porch h 24 passed through) with NO block standing on it over that x. RED on b3747ddcb's shape
     (dip 200-300 under the porch alone), GREEN on (ii). Laid in floodLay with forkFaults/strandFaults.
 A4. forkFaults' climb model is WRONG (135 modelled: W2_FLOOD.climb land 62 + runUp 73; 252 flown by child-easy): correct W2_FLOOD.climb
     from the bots' measured flights (measure every tier's climb flight on the probe: take-off x, landing x); planted: the old model
     FAILS on the measured child-easy climb.
 Then the probe: target 54/54 (shrine, home 3, setBack 0, 0 rescues) WITH the (B) draft applied in the probe tree only (draft-B-reroute.patch.txt).
 A1 STARTED (DRAFT, NOT LANDED: draft-A1-marsh-from.patch.txt here, riverLay.ts `from` + W2_FORK_RIVERS.low.from derived = 400).
     Measured on frozen /home/user/wt28g (930a2dc01 + A1 draft + B draft): the built 2-96 home leg lays the first floor 400 wide at the
     NEAR edge (dx 0, w 400, then 150s from dx 500; the pipeline's mirror is right, seeds 1-2). Probe 45/54: middle and expert late 0
     now PASS; still MISS: child-easy late 0 x3 (A2, the climb onto the porch, as expected), child late 0 x3 and middle-easy late 0 x3
     (NEW: middle-easy takes off at 1354/860, 46 px BEFORE the first dip at W0+400, rises through the porch-alone stretch at x 1377-1381
     and lands on RISE1's top 1406/680, 180 px up). So `from` = 400 is NOT enough: the dips must start at the porch-alone stretch + the
     longest take-off-before-the-dip + the arc's rise to the porch's height, measured per tier (the child's pop is not yet traced:
     TRACE it first, FROM=14.5 TRACE=23.5 WHO=child LATE=0). That number is A3's verdict too (take-off span x apex vs thin pieces
     with no block on them). Also check that a BLOCK stops a hop from below (no run has tested it: every pop so far was at the thin
     porch alone). Do NOT land A1 until the probe is 54/54 with A2 and A3.
 CHILD TRACED (A1 draft, late 0): he misses the first dip's hop (20.8 s in the air at 1474/877, in the dip), is set back on the near
     bank (953/800 at 21.2), comes again, and at 23.2 s JUMPS FROM CONTINUOUS FLOOR at about x 1150 (no dip there under A1) and rises to
     1212/737 through the porch-alone stretch onto the high road. So ANY jump from the marsh floor under the thin porch alone pops him up,
     not only a dip hop: (ii) moves the dips but cannot satisfy the verdict the lead asked for. A3 as it must read: "no thin high-road
     piece ALONE (no block on it) over the low road's floor within his jump height". That needs (i) (rise1, a block, from the water's
     edge, so nothing thin stands alone over the marsh; the treads move) or the porch over the marsh made not thin. THIS IS A
     RE-RULING FOR THE LEAD before A1 is built further (sent with this hand-over).
 (i) TRIED AS A DROP-IN (probe env RISE0=1 on /home/user/wt28g: rise1 1,400 from the water's edge, rise2 centred on it, the marsh evenly
     spaced): the toy refuses it before any run: flood.ts highRoad finds no chain of 3+ ("the high road: the wall-step, its own pieces and
     its last piece"): with rise1 at the edge, W's top (Y-60) faces rise1's 60 px face across the 60 gap, which highRoad's rules
     (FLOOD_STEP 60 up only by a wall-step walked into, FLOOD_HOP level) do not join. So (i) needs the first up-step re-shaped too
     (e.g. W itself 120 tall in two wall-steps, or the gap closed so rise1 is walked into from W's top): not a data swap.
(B) AT 1b, YOURS, its own ENGINE PIECE commit AFTER the merge (firsttimer.ts merged once): apply draft-B-reroute.patch.txt; toy RED on
 the old route, GREEN on the fix (the probe's late-15/19 runs are that toy: commit it as a lineBot test); rule 28: ENG-PLANT's 10 known
 flips AND the wide sample (seeds 1-10, every bot, both settings, on 2-1/2-2/2-4: zero BAR PASS -> FAIL vs main's rows).
1b HASH: ENG-PLANT-s merges about 1:00 PM ET (the lead sends it). Stills wait for (A)'s shape.
THE 2-3 'cage1' CARRY-OVER (the lead asked): it touches NO shipped run (castBots, seedlist and lockall play each stage's own build); only
 lineBot.test.ts builds a toy on '2-3' (lineRun, floodRun). Named, unmeasured: the OLD lineBot toys (start 300, EXIT 3000) run inside
 2-3's rooms cage0 (x 187-648) and cage1 (x 2834-3296); whether that changed any old lineBot verdict is not measured. Not fixed here.

### Session 5's probe and trace (kept for its detail)
Branch t-build-28-wip; CODE head unchanged (b3747ddcb; this commit only adds to reference/qa-reports/BUILD-28/). `git fetch origin
t-build-28-wip && git checkout t-build-28-wip`, `npm ci --no-audit --no-fund --legacy-peer-deps`, ReadNotifications FIRST: the lead's
ruling on (A) and (B) below, and release-0.10.3's hash for 1b. Nothing else moves until the ruling (LANES rule 2: a missing piece STOPS).
THE PROBE (the lead's ORDER step 1), BUILT: probe-fork.test.ts.txt here (lineBot.test.ts's floodRun with a `fork` option laying the RULED
shape exactly as gen2 builds it: W 150 at W0-210..W0-60 top Y-60, the porch W0..W0+2,200 top Y-60 h 24, rise1 1,400 centred top Y-120,
rise2 600 centred top Y-180, the far bank from W1, the marsh by layRiver(W2_FORK_RIVERS.low) = 5 floors of 200 with four 100 px dips, EXIT
W0+2,800; checked against a dump of the built 2-96 two-road section, seeds 1-2: the same dx/w/dy/h). To run it: copy it to <frozen
tree>/probe/fork.test.ts, `npx tsx --test --test-name-pattern=PROBE-ALL probe/fork.test.ts`; TRACE=<s> FROM=<s> EVERY=<frames> WHO=<tier>
LATE=<s> prints one run's path and line. PASS = shrine, home 3, setBack 0 AND rescues 0 (a harness rescue is the bot unable to go on).
RESULT: 6/54 pass (probe-fork-results.txt, section A: only adult and middle-easy late 0). Two causes, each traced to the frame:
 (A) THE SHAPE: the porch's near end is a thin piece 60 px over the bank and 120 px over the marsh floor, and he passes up through a thin
     piece from below. So the low road cannot be kept: (A1) the CLIMB onto W overshoots W and the gap: child-easy late 0 takes off at W's
     face (771/800), apex 620, lands 1023/740 ON THE PORCH (6.6 s) and never reaches the marsh; (A2) the DIP HOP from the marsh floor goes
     up through the porch: middle late 0 on the floor at 1156/860 (9.4-10.0 s) hops the first dip and lands 1299/740 ON THE PORCH (10.6 s).
     Child, middle and expert late 0 all go marsh -> porch this way. Only the adult's low hops stay under it (adult late 0: low, 22.3 s, pass).
     Then the bot (read: LOW, so keep-the-road holds the high road's pieces as "the other road", firsttimer.ts:2472) stands on the other
     road and will not walk it on: stuck on rise1/rise2's top ("water ahead, the way on is 240 px down") and rescued, every late-0 run but
     the adult's (12 runs). A PLAYER is not stuck there (the high road goes home), but a player who chooses the low road is put on the high
     road by his own hop: the choice 2-8 is built on is not his.
 (B) THE BOT: on the high-road reroute (firsttimer.ts:2480-2481) the route is each chain piece's WHOLE span in chain order; the ruled chain
     revisits pieces (4>5>6>7>6>5: three up, three down on the same porch and rise1), so the route runs the porch 1000->3200, then back to
     rise1 at 1400...; his progress stalls at the porch's end (adult late 15 at 3105/740, "nothing in the way the bot can see") and the
     harness rescues him 8 times to 'time'. ALL 36 late-15/19 runs fail this way, every tier. PROVEN: the plant
     TOPLINE=1 (the route as the walked top line, the highest chain top over each x) turns ALL 36 late-15/19 runs to pass (42/54,
     section B); the 12 left are exactly (A)'s late-0 runs.
 TOY NOTE (not the stage): FirstTimerRun('2-3') carries 2-3's kit; its room "cage1" (x 2834-3296) lies over the porch's far end; the fork
     toy drops the kit (e.kit = undefined); A and B are both with it dropped (with it left in, 15/54 passed: its room changed which
     high-road runs stalled, not why).
FOR THE LEAD TO RULE (each is outside a data-only change):
 (A) the shape: a hop from the marsh floor (and the climb onto W) must not reach the porch. WHERE (traced, TOPLINE on): every pop-up
     is at the FIRST dip (W0+200..W0+300), under the porch ALONE (W0..W0+400, before rise1, a block, stands on it): middle floor
     1156/860 -> porch 1299/740; expert 1137/860 -> 1358/740; child 1172/860 -> 1370/740; the line follows him up. Past W0+400 rise1
     sits on the porch and no run popped there. The climb: the child-easy flies 252 px from W's face (over W 150 and the gap 60), against
     forkFaults' model 135 (W2_FLOOD.climb land 62 + runUp 73). Options I see (each changes a ruled number, so the lead's call):
     (i) no thin piece alone over the marsh: the first rise starts at the water's edge (a block over the marsh's first stretch, a head
     stop), which moves the three-up/three-down treads off 400; (ii) the first dip moved out from under the porch-alone stretch (the
     marsh's dips at W0+400 on), keeping every high-road number, with the marsh's dips re-spaced (2-8.md:9 says four 100 px dips in
     1,400, not where; layRiver spaces them evenly today, so it needs a marsh option for where the dips start: riverLay.ts, engine); (iii) the porch high enough that no apex from the floor reaches it (the child's apex is 180 px over take-off),
     against 2-8.md's 60 px steps. And for A1, W wide enough that the child-easy's real climb lands ON W (>= about 260), with forkFaults'
     climb model checked against the bots' measured flights. My pick: (ii) + the W/climb check: the smallest change, every 2-8.md
     number kept; then re-probe. About one box with w2TwoRoad.test and the verdicts.
 (B) the bot fix (firsttimer.ts, the reroute's points = the walked top line over the chain): an ENG/bot change outside my lane (or
     mine at 1b, where I already touch firsttimer.ts for the merge) and it must run castBots' known flips (rule 28).
DRAFT FOR (B), READY, NOT LANDED (draft-B-reroute.patch.txt here, 6+/2-, firsttimer.ts only): the reroute's points = the walked top
     line over the chain (over each x the highest chain top). Measured on frozen /home/user/wt28f (ed70f9481 + the patch): the probe
     42/54 (the same 42 as the TOPLINE plant; the 12 left are (A)'s late-0 runs); lineBot.test.ts 12 pass 0 fail. It cannot move a
     listed stage: the read is a flood's, ROAD_TRIPS 0 on every listed stage (firsttimer.ts:145); castBots' known flips still run with it
     at 1b (rule 28). Land it only on the lead's word (whose lane).
NOT DONE this session: step 2 (stills): no running stage lays the two-road section (2-8 in the game is still the old stage; 2-96 is a
test-only toy), and the shape is about to change under (A): stills now would be stills of what is replaced (D40). Step 3 (1b): no
release-0.10.3 hash in notifications at 11:31 AM ET. Step 4 (READY-28): blocked on (A), (B), 1b.
SESSION 5 NOTES. Lessons applied: D115 (the probe on a chattr-frozen worktree /home/user/wt28e at ed70f9481), D125/D129 shape (the probe
measured before anything is built on the shape), D128 (times from date), D134 (pushed and ls-remote before the hand-over). Learned (for
level.md, proposed): a bot probe must count harness RESCUES as misses: 3 'shrine, home 3' runs per late-0 tier were rescues; and a toy
that runs past its own base stage's rooms must drop that stage's kit.

## EXACT NEXT STEP (session 4, W2-LANE d; superseded by session 5 above)
Branch t-build-28-wip, CODE head b3747ddcb (pushed, ls-remote confirmed at 11:04 AM ET from date; this REPORT's commit only adds to
reference/qa-reports/BUILD-28/). `git fetch origin t-build-28-wip && git checkout t-build-28-wip`, `npm ci --no-audit --no-fund
--legacy-peer-deps`, ReadNotifications FIRST (the lead may send release-0.10.3's hash for 1b). Every run on a chattr-frozen worktree.
DONE, THE LEAD'S ORDER STEP 1 (ONE commit b3747ddcb: strandFaults laid + 1d's shape + the W2_FORK marsh, the whole touched set GREEN on a
   frozen tree of exactly the committed tree: `git stash create` 4b9d19bd2, /home/user/wtw2d-2, its tree == b3747ddcb's tree, checked):
   - flood.ts FloodRow.step (the line's step: a deeper drop off a high-road end is a wait at the lip); W2_FLOOD.step = W2_FOLLOW.step (90).
     floodLay.ts lays strandFaults after forkFaults when the high road walks: tops = every solid top; under(x) = the low road's water at
     its LAID surface (y0; the flood only raises it) over its span, else no ground.
   - w2.ts W2_FORK (1d, as ruled): W 150 set back 60 (`wall.back`: its lip over the bank, so off W is 60 onto the bank, then 60 off the
     bank onto the marsh floor), gap 60 (over the bank), ONE porch 2,200 px from the water's edge (porch2 is gone), `rises` [1,400, 600]
     each a wall-step CENTRED on the piece under it: three up (W, rise1, rise2), three down (rise1's far tread, the porch's far tread, the
     far bank), every tread 400 px; far 1,120 (the porch's 800 px overhang of the 1,400 marsh + today's 320). W2_FORK_RIVERS.low = {dir 1,
     speed 0, logW 0, logs 0, safe, flood 'close', marsh {width 1400, floor 60, dips 4, dip 100}} (2-8.md:9). No shipped kit lays it.
   - ENGINE FIX the shape found (pipeline.ts:3163, 1c's marsh piece missed it): a lowered leg's river shift moved surfaceY, safe, spur and
     floodMark but NOT RiverZone.marsh {floor, lip}: on the toy's home leg (down 120) the zone's floor read 120 px over the laid floor and
     floodWaterOf put paddling depth 50 px OVER the banks (floodFaults RED by name: "the water at x 16089-17489 rises to 1468, 50 px over
     its banks"). Fixed (both move); w2TwoRoad.test now asserts the zone's floor = the laid floor pieces' top (5 pieces), lip = the banks.
     Only marsh zones are touched: no shipped stage has one (zero moves expected; the 1b lock vs main checks it).
   - TESTS: w2TwoRoad.test GREEN rewritten for 1d (8 rolls: chain W, P, rise1, rise2, rise1, P; W 60 back; each rise one step on the piece
     under it, its width; every tread >= 400 both ways; ends over the far bank; strandFaults []; the marsh zone); RED adds W flush on the
     water (back 0: "...the first ground is 120 px down, deeper than the line's 90 px step"). floodLay.test: its toy W set back 60 on a 420
     px near bank (on toyHome's 280, W set back left no flag ground: "flags: none before the hard node n9, 10280 px along the way (within
     2400 px)" RED on its GREEN, traced to this change and fixed, not carried); RED adds W flush on the ride's water (strand, by name); the old
     planted shapes stay flush (back 0).
   - MEASURED (frozen tree): flood + floodLay + w2TwoRoad 20/20; riverLay + riverSection + w2 + follow + followArt 53/53; lineBot 12/12;
     generalitycheck PASS (26/26); tsc 0. LAID (toy 2-96 seed 1 Normal; the home leg runs LEFT): near bank 17489-17909 y 1518; W
     17549-17699 y 1458; porch 15289-17489 y 1458; rise1 15689-17089 y 1398; rise2 16089-16689 y 1338; far bank 14969-16089; marsh
     16089-17489, floor pieces 200 wide at y 1578, four 100 px dips.
NEXT, IN ORDER (the lead's ORDER):
(1) THE SWIM'S LOCK (Q1 (a)): DONE, LANDED AFTER SESSION 4 STARTED (session 3, kept for it; do NOT re-run): `lockall.ts --layouts 16`
   recorded on a frozen tree at 801430f3a, checked on one at e08716828: "lock: 102/102 stages unchanged", exit 0. ZERO MOVES. Its other
   line, "gen2 gained verdicts and drops (not hashed)" for 36 stages, is the tool's note on lists it does not hash, printed by both runs.
(2) THE PROBE (every tier, both settings, late 0/15/19, seeds 1-3: all home, nobody set back) on 1d's shape. No harness plays the gen2
   two-road stage yet. Cheapest true route: lineBot.test.ts floodRun (:167) lays its own toy (W at W0-210..W0-60, already set back 60; a
   400 px marsh W0..W1 via layRiver; a 3-piece high road at :184, solid 4-7). Give it the RULED shape instead: an option that lays W, the
   porch, the rises and the far bank from W2_FORK (the same arithmetic as w2TwoRoad: W at W0 - back - w, porch W0..W0+porch at Y-60, each
   rise centred on the one under it, far bank from W0 + marsh.width) and the marsh from W2_FORK_RIVERS.low (W1 = W0 + 1,400; EXIT and the
   level width grow past the far bank), then the 6 tiers x seeds 1-3 x late 0/15/19, Normal and Easy (who.setting), asserting home 3 and
   setBack 0, and that some tier takes each road. If it costs more than one box, tell the lead.
(3) STILLS (condition 4): the line paddling a marsh dip and the fork, upright AND sideways, judged as Matt sees a phone; paths to the lead.
(4) 1b: no release-0.10.3 hash in notifications at 11:04 AM ET; if none when (1)-(3) are done, tell the lead and wait. (5) READY-28.
OPEN, named (the lead's ruling): the 80 px tread's strand (a jump, not reproduced in the toy): not chased.
SESSION 4 NOTES. Lessons applied: D115 (frozen trees /home/user/wtw2d-1, -2 from `git stash create`; probes in <tree>/probe, never
committed), D119 (no heredoc in the commit chain: message from a file), D128 (times from date), D134 (pushed and ls-remote before the
hand-over), D135 (the toy's flag red traced to this change and fixed, never 'inherited'), D137 (the box), session 2's lesson (the whole
touched set GREEN before the push). Learned (for level.md, proposed): a shape change on a LOWERED leg can expose a zone field the shift
forgets; assert every zone field against the laid pieces in the shape's GREEN test.

## EXACT NEXT STEP (session 3, W2-LANE c; hand-over on the 28-minute box)
Branch t-build-28-wip, CODE head 3bcd0a3bf (pushed, ls-remote confirmed; this REPORT's commit only adds to reference/qa-reports/BUILD-28/):
e08716828 the dip swim (1c part 3), 3bcd0a3bf the strand verdict as a planted function (1e, not yet laid by floodLay).
`git fetch origin t-build-28-wip && git checkout t-build-28-wip`, `npm ci --no-audit --no-fund --legacy-peer-deps`, ReadNotifications
FIRST (the lead may answer Q1 below or send release-0.10.3's hash). Every run on a chattr-frozen worktree (recipe in session 1's section).
1c PART 3, THE DIP SWIM: BUILT (e08716828), the lead's ruling (b) attempt 2. follow.ts `swimY` + stepLine's new last arg `swim`: a little
   one mid-hop on a hop that LANDED at its take-off height (SAME_GROUND 12) over a flood's water a straight line there paddles takes that
   line's y, so surf paddles it at the surface; the trail is untouched (its s, the read, who is late = the hop's); a hop still in the air
   stays his arc. followPlay.ts `swimAcross` (lip water only; 2-3's lip-less rivers never swim), passed to stepLine. lineBot.test.ts:
   floodRun's marsh toy reports `flat` (he hopped a dip floor to floor) and `dry` (a little one over a dip in the AIR); 'the marsh low road
   with a dip': flat -> paddled and never dry, some tier flat; PLANTED: swimOff (instance override of swimAcross) -> adult seed 1 flat AND
   dry (RED off, GREEN on). NEW 'the marsh's dip swim is pace-neutral' (the lead's condition 2): 6 tiers (child-easy, child, middle-easy,
   middle, adult, expert) x seeds 1-3 x late 0/15/19: the swim's run deepEquals the hop's (end, setBack, home, high, t, walked, flat), and
   flat -> paddled and never dry: GREEN. MEASURED late 0, the dip toy: child 36.2 s, middle-easy 19.5, adult 16.7, expert 18.5 all PADDLE the
   dip, shrine, home 3, setBack 0; child-easy takes the high road (19.2); MIDDLE (normal, 18.9) does NOT paddle: he leaps from the floor
   (x 1076, y 860) over the dip straight UP onto the fork's last piece C (x 1330, y 740): not a same-height hop, so his arc stands (the
   narrow rule, condition 1). On the frozen tree at e08716828: lineBot + follow + flood + followArt + floodLay 53/53, generalitycheck PASS
   (26/26), tsc 0.
   CONDITION 3 (lockall): origin/main cdffdc627 is NOT an ancestor of this branch (51 commits on the branch), so a lock against main
   measures other work. Started instead: the pre-swim code 801430f3a recorded vs e08716828 checked, `npx tsx tools/engine/lockall.ts
   --layouts 16 --out <S>/lock-pre.json` (frozen tree at 801430f3a) then `... --check <S>/lock-pre.json` (frozen tree at e08716828); about
   30 s a stage, NOT finished at hand-over: RE-RUN IT (lockall fingerprints the BUILD; the swim touches only play, follow.ts stepLine and
   FollowPlay, so zero moves are expected; any move is a stop). THE LEAD RULED Q1 (verbatim): "Q1 YES. For the swim, the lock
   is pre-swim 801430f3a vs e08716828 (it isolates the change; zero moves expected). The lock vs main runs once at the 1b merge on
   release-0.10.3, so every shipped stage is checked against what ships." So TWO locks: (a) the swim's, 801430f3a recorded vs e08716828
   checked: DONE, 102/102 stages unchanged, exit 0, zero moves (see NEXT (1)); (b) at 1b, lockall vs main on the merged head, every move traced (rule 28).
   CONDITION 4 (stills, upright AND sideways): NOT DONE; needs the marsh on a stage (W2_FORK's low road, built WITH 1d below). Look for:
   the first little one is on his arc when he lands (the hop is open until then) and drops to the surface on the landing frame; `dry`
   false says none was over the dip in the air on a floor-to-floor hop in the toy, but judge the frames.
NEXT, IN ORDER: 1e the strand verdict (session 2's plan below). SESSION 3 FOUND, read from code (flood.ts forkFaults :142, floodLay.ts
   :55-65, w2.ts W2_FORK, lineBot.test.ts floodRun), not yet measured: (i) the 80 px child strand did not reproduce in session 2's toy and
   the toy already plays the Easy child on the Easy setting (lineBot.test.ts:201 who.setting) and already has ENG-28e's respawn fix
   (0908b5c57 is in session 1's e1d8d74c5), so neither explains it; a gen2 trace needs the stage built by w2TwoRoad (w2TwoRoad.test.ts
   `build`, toy home kit, SWAP 'home-practise-ride') played by a first-timer, which no harness does yet: if it costs more than one box, tell
   the lead and build the verdict on the walk-off model alone, as session 2 planned. (ii) THE WALK-OFF VERDICT (carry 0, both ways): for
   every piece of road.chain (W and C included) and each end, the first ground under x just outside the edge (a solid top, else the
   marsh's floor or water) is at most the line's step (W2_FOLLOW.step 90) below the piece's top. It is RED on TODAY's gen2 geometry, not
   only on the planted shapes: W stands flush on the water's edge, so on the marsh his walk off W's lip (the low road's way down, forkFaults'
   gap) drops 120 px (W's top Y-60 to the floor Y+60) and the line WAITS at W's lip: the low road strands the line. GREEN needs W set back
   60 from the water (session 2's note; floodRun's own toy: W off its lip 60 onto the bank, then the bank's edge 60 onto the floor; the
   gap after W, 60 >= his 44 px, then lies over the bank, forkFaults unchanged) and every high-road end over a piece or a bank (porches
   reaching the far bank: 1d). So plant RED: the flush top (220 shape, 120 px off its near edge onto P), W flush on the marsh (120); the
   80 px treads drop 60 per tread, so the walk-off rule does not flag them (say so; their strand stays the unreproduced jump). GREEN: 1d's
   shape.
   BUILT (3bcd0a3bf): flood.ts `strandFaults(chain, tops, under, step)` next to forkFaults; flood.test 'the strand verdict': RED on the
   top flush on its rise (one fault: 120 px off its left end onto the porch) and on W flush on the marsh's edge (120 px off its right end
   onto the floor); GREEN on 400 px treads; GREEN on 80 px treads BY THIS RULE (stated in the test). On the frozen tree at 3bcd0a3bf: flood
   + floodLay + w2TwoRoad + w2 + riverLay 32/32, generalitycheck PASS, tsc 0. LEFT FOR 1e: lay it in floodLay.ts:65 (problems.push, after
   forkFaults) with `under` from the flood's low water (the marsh floor where it stands, else the water's surface; the banks outside) and
   the line's step from the flood's row (add it to W2_FLOOD or FloodClimb, named, not a literal: generalitycheck), IN THE SAME COMMIT as 1d's
   shape: laid on today's W2_FORK it is RED (W flush on the water), so the w2TwoRoad GREEN test goes red until the shape changes. Then 1d + the W2_FORK marsh,
   ONE shape change: W2_FORK_RIVERS.low = {dir 1, speed 0, logW 0, logs 0, safe, flood 'close', marsh {width 1400, floor 60, dips 4, dip
   100}} (2-8.md:9) and three up / three down, treads >= 400 (W stands on the near bank; today's gap 60 + porch 500 + porch2 400 = 960 px over
   the water ends 440 px short of a 1,400 marsh's far bank (it overhangs ride's 798 by 162), so the marsh cannot land alone); w2TwoRoad.test to it; check w2Finish lays no second river over it
   (hasRiver, w2.ts:411). 1d READ (session 3, w2.ts:200-207): W is `on` near at [1, 1] (flush on the bank's end; set it back 60, check
   gen2's 'on' placement for how `at` reads), the porch `over` near at past(gap), the rise `on` porch at [1, 1], porch2 `over` near at
   past(gap + porch). Treads >= 400 with three up (W, rise1, rise2) and three down (rise2, rise1, the porch to the far bank): the porch's
   tread 400 + rise1 1,200 (400 | rise2 400 | 400) + its far tread 400 = 2,000 px of porch from the water's edge, 600 past a 1,400 marsh:
   wider than today's far bank (320), so `far` must grow (strandFaults reads the ground past the porch's end) or the porch end sooner;
   the design's numbers (2-8.md:9) decide. Then the stills (condition 4), the probe (6 tiers x late 0/15/19 x seeds 1-3, both settings), 1b, READY-28.
SESSION 3 NOTES. Lessons applied: D115 (frozen trees /home/user/wtw2c-c1..c3, -pre), D119, D128 (times from date), D134 (pushed and
ls-remote before the hand-over), session 2's lesson (the whole touched set GREEN before the push: two test-design misses in my own new
assertions, caught on the frozen run and fixed before any push: the take-off read from the first air frame, and 'paddled' alone cannot tell
the swim from the hop because the adult's low arc dips under the banks' top, so the claim is 'never in the air over the dip').

## EXACT NEXT STEP (session 2, W2-LANE b; superseded by session 3's above, kept for its detail)
Branch t-build-28-wip, CODE head 801430f3a (this REPORT's commit only adds to reference/qa-reports/BUILD-28/). `git fetch origin
t-build-28-wip && git checkout t-build-28-wip`, `npm ci --no-audit --no-fund --legacy-peer-deps`. Run ReadNotifications FIRST: the lead
may have ruled the dip paddle (below) or sent release-0.10.3's hash. Every run on a chattr-frozen worktree (session 1's recipe below).
1c. THE MARSH LOW ROAD: BUILT except the dip paddle (two commits): dc5987822 "ENGINE PIECE (marsh low road), part 1": RiverRow.marsh
   {width, floor, dips, dip} (riverLay.ts) lays a solid FLOOR `floor` px under the banks in the near bank's style, split by `dips` gaps
   `dip` wide (equal pieces), no logs, speed 0; the zone's surface RIVER_LAY.marshWater (30) under the floor's top; RiverZone.marsh
   {floor, lip} (river.ts); riverWidth = marsh.width; layRiver returns `floor` and pipeline.ts pushes it; floodLay.ts floodWaterOf: the
   flood rises to paddling depth under the FLOOR (layFlood uses it). 9cbb42f27 part 2: lineBot.test.ts floodRun(who, seed, late, marsh?)
   lays its low road from gen2's layRiver(marsh) + floodWaterOf. MEASURED (frozen trees): no dips = the SAME run as the hand walkway (deep
   equal, middle + adult, seeds 1-3); one 100 px dip: shrine, low road, setBack 0, home 3, the line WALKED the floor, RED with the floor
   off (walked false); the close (read removed, late 19) splits the line, RED with the close off (setBack 0 everywhere). lineBot 11/11 on
   9cbb42f27; flood + floodLay + riverLay + riverSection + w2TwoRoad + w2 45/45 and generalitycheck PASS (26/26) on dc5987822; tsc 0.
   THE LEAD RULED (b), verbatim below; BUILD IT FIRST as 1c part 3. THE LINE DOES NOT PADDLE THE DIP (middle seed 1 paddled false): his hop over a dip
   rises over the banks' top and a flood's water paddles only at or under its banks (followPlay.ts:135 surf), so the line hops the dip on
   his arc. (a) accept; (b) follow.ts record: a hop landing at its take-off height over FLOOD (lip) water that a straight line at that
   height paddles becomes that straight swim (2-3's lip-less rivers untouched; points a follower stands on kept), planted RED with it off,
   then restore the `paddled` assertion in lineBot 'the marsh low road with a dip' (the comment there says where).
   THE LEAD'S RULING (verbatim): "(b) APPROVED. The design draws the dips as the line's paddle, and a line hopping on his arc over still
   marsh water reads wrong. Conditions: 1. General and narrow: only for a flood's water with a lip (2-3's rivers untouched), only a hop that
   lands at its take-off height, and points a follower already stands on are kept. Planted RED with it off and GREEN on. 2. Pace: the swim
   must not set anyone back or make them late. Check lineBot floodRun on every tier, seeds 1-3, plus the 100 px dip: all home, read and
   late counts unchanged vs the hop. If the swim is slower and makes anyone late, STOP and tell me. 3. lockall vs main: zero moves on any
   listed stage, or every move traced (rule 28). The CI line is run at the landing. 4. Stills of the line paddling a dip, upright AND
   sideways, with each frame looked at as Matt would see it on a phone (polish check). I judge them before READY-28 counts. Go on with 1e
   (the strand verdict) as planned." Where: follow.ts record (:118; the landing branch :130 knows the take-off point i) takes a predicate
   from FollowPlay.step (followPlay.ts:154) that says a straight line at the take-off height over (x0, x1) is LIP water it paddles (a new
   FollowPlay method next to surf, :132, reading only safeWater entries with `lip`); keep the points up to the farthest follower's s.
   ATTEMPT 1 (session 2, NOT committed; its diff: reference/qa-reports/BUILD-28/swim-attempt-1.diff): record cut the arc to a straight
   swim on landing, keeping points with s <= the farthest 'follow' one's s, FollowPlay.swimAcross the predicate. RESULT on a frozen tree:
   lineBot + follow + flood + followArt + floodLay 53/54, 2-3's follow tests GREEN, but the dip test still paddled false (middle seed 1):
   the first little one, one gap (34 px) behind him, is already ON his arc when he lands, so 'keep the points a follower stands on'
   keeps the arc, and the rest walk it too. NEXT (attempt 2, pace-neutral, nothing in the trail moved): leave the trail as it is; in
   stepLine/FollowPlay, a follower whose trail position lies on an AIR stretch between two ground points at the same height (SAME_GROUND)
   whose straight line is lip water (swimAcross) takes the straight line's y at its x, so surf paddles it at the surface. Its s advances
   exactly as on the hop, so the read and late counts are unchanged vs the hop BY CONSTRUCTION (the lead's condition 2: still measure it:
   lineBot floodRun every tier, seeds 1-3, plus the 100 px dip); the swim-off plant is the same instance override the diff carries.
   Then the lead's 3 (lockall vs main) and 4 (stills upright and sideways of the line paddling a dip, judged as Matt would, paths to the lead).
   Still to do for 1c either way: the W2_FORK low road ON the marsh (W2_FORK_RIVERS.low: {dir 1, speed 0, logW 0, logs 0, safe,
   flood 'close', marsh {width 1400, floor 60, dips 4, dip 100}} per 2-8.md:9; W set back 60 from the water as floodRun's, so every drop
   is <= 90) with w2TwoRoad.test to it (do it WITH 1d, one shape change); check w2Finish lays no second river over it (hasRiver at
   w2.ts:411 should take it: surface lip+90 inside its window, read it on the built stage) and the floor's paint (stills at READY).
1e. THE STRAND VERDICT. TRACED (scratch probe /home/user/wtw2f/tools/inspect/probe28.test.ts, never committed: floodRun with water 798,
   W W0-150 +150 @60 h60, P W0+60 +500 @60 h20, rise W0+160 +400 @120 h60, top W0+160 +140 @180 h60, porch2 W0+560 +400 @60 h20; FT_ADULT
   seed 1 late 0: 'stranded', home 0, high, t 34.7, as session 1's 34.9). THE ADULT DID NOT OVERSHOOT: on the top he ran right to x 1265
   (6.23 s), turned BACK (vx -268; the lead-the-line read sending him to the low road), WALKED OFF THE TOP'S NEAR EDGE (x 1160: the top
   stands flush on the rise's near edge, so the drop is 120 px, two steps, no tread), landed on P (7.03 s, x 1064), walked off P's near
   end into the gap and down to the walkway (7.37 s, x 1019), and ran the low road home alone; the line waited at the top's lip (follow.ts:
   a drop deeper than the step 90 is a WAIT). THE MODEL: carry 0 strands too: any EDGE of a high-road piece he can walk off, EITHER way,
   whose first ground beneath is more than the line's step (W2_FOLLOW.step 90) down strands the line; and a jump off an edge carries him
   past a narrow tread (session 1's child on the 80 px treads). THE '80' SHAPE {rise W0+260 +300, top W0+340} WAS A GATE FALSE REFUSAL:
   highRoad met W, P, the rise, the top, the rise AGAIN (its far tread, past the top) and called the chain longer than its pieces 'the high
   road loops' (flood.ts:225). FIXED in 801430f3a: a loop is no ground gained after the first piece (planted: the new flood.test 'a stair
   up and back down ... never a loop' RED on the old guard at c30d655bd, GREEN now); 1d's three up / three down needs it. On 801430f3a:
   flood + floodLay + riverLay + riverSection + w2TwoRoad + w2 + lineBot 57/57, generalitycheck PASS, tsc 0. THEN TRACED in the toy
   (scratch /home/user/wtw2k/tools/inspect/probe28.test.ts, FT_CHILD_EASY seed 1 late 0): NO strand (shrine, home 3, high, t 36; the
   child too turned back on the top and walked down tread by tread, each 60 px). So session 1's child strand needs the GEN2 section's
   own geometry (the near bank 420, the bunched line on W): trace it on a gen2 build of the 80 shape (w2TwoRoad at 1530aa374's W2_FORK)
   before deriving the jump CARRY; if it will not reproduce, say so and build the verdict on the walk-off model alone (carry 0, both
   ways), planted RED on the flush top (the 220 shape) and on 80 px treads by the walk-off rule only if a walk-off strands there. So the verdict: for each high-road piece and each of its ends, the ground beneath from the edge out to the
   edge + CARRY must lie within the step of its top, CARRY = the tier's measured run-off (0 for a walk-off, the trace's for a jump; derive
   it from the 80 px trace, name it in the comment as W2_FLOOD.climb does). Plant RED on the 80 px shape AND on the flush top (the 220
   shape), GREEN on 1d's 400 px treads. In flood.ts forkFaults or highRoad (floodLay already runs both).
1d. Then THE LONG HIGH ROAD (three up / three down, treads >= 400, ~2,200 px of porches against the marsh's 1,400; the lead's (4)):
   w2TwoRoad + the probe (6 tiers x late 0/15/19 x seeds 1-3), every run shrine, home 3, setBack 0; middle/expert low with time, high late.
1b. The merge when the lead sends the hash (unchanged, below). THEN READY-28 (step 2), unchanged.
REPORT BY 12:30 PM ET; HARD STOP for READY: 2:30 PM ET.
SESSION 2 NOTES. Lessons applied: D115 (every run on a chattr-frozen worktree: /home/user/wtw2c-k, container-local, the probes in them
never committed; rebuild a probe from the shapes above), D119 (no heredoc in a commit chain), D128 (times from date), D120 (the paddle
question sent, the box went on), D134 (pushed and ls-remote before the hand-over message). OWN MISS: the loop-guard fix was committed
(f0808f3b7, never pushed) after its plant ran RED but before its GREEN run, and it turned 15 tests red (the first piece W stands back on
the near bank by design, so no ground is gained there); caught by that run, fixed and amended to 801430f3a before any push. For me: a gate
change runs its whole touched set before the commit, not only the plant. Not run this session (nothing listed uses the marsh yet): the
suite, drawcheck, lockall, castBots, stills.

## EXACT NEXT STEP (session 1; superseded by session 2's above, kept for its detail)
Branch t-build-28-wip, head = this REPORT's commit; CODE head ee048f86c (later commits touch only reference/qa-reports/BUILD-28/).
`git fetch origin t-build-28-wip && git checkout t-build-28-wip`, `npm ci --no-audit --no-fund --legacy-peer-deps`. Run ReadNotifications
first: the lead may have ruled For the lead 2-4 (below) or sent release-0.10.3's hash.
1a. DONE (code b74fadfe8 + ee048f86c; 'Step 1a' at the end): highRoad meets every piece in his way on a porch, planted in flood.test.
THE LEAD'S LATEST RULINGS (received at the end of session 1, verbatim in 'For the lead'): (4) APPROVED three up / three down, every
tread >= 400 px, re-probed; PLUS a new named gate verdict; (3) the marsh low road is MINE, a separate ENGINE PIECE commit. Order now:
1c. THE MARSH LOW ROAD, an ENGINE PIECE commit of its own on t-build-28-wip ("ENGINE PIECE (marsh low road): ..."), before READY-28's
   measure. The SMALLEST general piece: extend an existing place, not a new kind: a river place with a FLOOR 60 px under the banks (a
   walkway the line walks and paddles; 2-8.md:9 'LOW 1,400 px of marsh path with four 100 px dips'), the flood's close fills it (deep: a
   wall the line waits at). Start points: src/game/gen2/riverLay.ts RiverRow (:24-53; a row field, e.g. `floor` px under the banks, laying
   the floor and its dips instead of logs), river.ts RiverZone and floodLevel, gen2/floodLay.ts (the close's deep y = lip covers the
   floor), follow.ts paddle (the line paddles its dips at its paddle pace), w2.ts w2Finish (a fall becomes its river: the floor must not
   be read as a fall). The model in the engine already: tools/inspect/lineBot.test.ts floodRun (:165 solid 2, the walkway 60 under the
   banks; :180 the river zone over it). Plants each way (a toy laid by gen2: the line walks the marsh floor and paddles its dips, RED with
   the floor off; the close turns it deep and the line waits at its near bank, RED with the close off), the bots' road through it (the
   probe below, on gen2's piece), no stage id, generalitycheck PASS. The W2_FORK low road then uses it (W set back so every drop off W
   onto the marsh is <= the line's 90 px step, as floodRun's W stands 60 back from the water).
1e. THE GATE (the lead's ruling with (4)): a named verdict in floodFaults/forkFaults (flood.ts): a step DOWN on the high road his jump can
   overshoot into a drop deeper than the line's step (W2_FOLLOW.step 90) strands the line at the lip. Planted RED on session 1's 80 px
   treads (the first shape: rise 300, top 140 at 0.5, 1530aa374) and GREEN on the 400 px shape. The model must explain BOTH strands the
   probe traced (the Easy child over an 80 px tread; the adult over a 220 px tread, top 140 at the near end of a 400 rise): a rough PHYS
   carry (jumpV 640, gravUp 1900, gravDown 2500, maxRun 285: apex 108 px at 0.34 s; one step down lands ~200 px past the take-off, two
   down ~218) does NOT reach 220 from the lip, so trace the adult's run first (the probe's path print, session 1's /home/user/wtw2a/
   probe28/probe.test.ts) and derive the carry from what he did; name the derivation in the verdict's comment, as W2_FLOOD.climb does.
1d. THE LONG HIGH ROAD on W2_FORK (the lead's (4)): three up / three down, every tread >= 400 px, ~2,200 px of porches against the marsh
   low road's ~1,400 px (2-8.md:9); w2TwoRoad.test to the new shape; then the probe: 6 tiers x late 0/15/19 x seeds 1-3, every run
   shrine, home 3, setBack 0, and the middle/expert going low with time, high when late.
1b. THE MERGE, only when the lead SENDS release-0.10.3's hash (its ruling, For the lead 1; ENG-PLANT's bot fix is still merging into it):
   merge origin/release-0.10.3 AT THAT HASH into t-build-28-wip (no force); name every conflict; in tools/inspect/firsttimer.ts keep BOTH
   intents (ENG-PLANT's c25: the judged run-up with the thumb travel, the sinker-only refusal, the narrow ride, the landing pull-back, the
   padRead stop; AND ENG-28's keep-the-road, step-off, lead-the-line); then tsc, the CI tool line (gates.yml 'rolled'), lineBot 8/8,
   flood + floodLay + w2TwoRoad, ENG-PLANT's 10 known flips (its REPORT) as a spot check. If the hash comes mid-step, finish that step's
   commit first.
THEN READY-28 (step 2) on the merged head: yield FIRST (D125), drawcheck on the draft (D131), stills both ways to the lead, the flood's
verdicts by name, met order (D130), the bots' road at the fork, lead-the-line.
2. A missing piece STOPS the job and goes to the lead (LANES rule 2).
Every run on a chattr-frozen worktree (`git worktree add --detach <dir> <hash>`, `ln -s <repo>/node_modules <dir>/node_modules`,
`chattr -R +i <dir>/src <dir>/tools`, `chattr -R -i <dir>/src/game/gen2/proven`). Session 1's: /home/user/wtw2b at e1d8d74c5 (and
/home/user/wtw2a at 1530aa374, the first shape; its probe28/ folder holds the scratch probes, never committed).
REPORT BY 12:30 PM ET (step 1 done and READY-28's numbers); HARD STOP for steps 1-2: 2:30 PM ET.

## SESSION 1 DONE (code head e1d8d74c5; every check on a chattr-frozen worktree)
- **The TWO-ROAD section, World 2 kit data** (src/game/gen2/worlds/w2.ts): `W2_FORK` (the numbers, type W2ForkShape), `W2_FORK_RIVERS`
  (the low road's row 'low': W2_RIVERS.ride's numbers, safe, marked `flood: 'close'`; 798 px between the banks), `w2TwoRoad(id, job, f?)`
  (the SectionTemplate). The lead's ruled shape, in the order he meets it: `near` bank 420 px (the line bunched, 7 x 34 = 238 px, and W on
  its end); `wall` W 150 x 60, a block standing on the near bank's end, its far side at the water's edge (both roads climb it); the GAP
  60 px over the water's first px (the low road walks off W into it; the high road hops it level); `porch` P 500 px, a branch level with
  W's top over the water; `rise` 400 x 60, ONE block standing on the porch's far end (a wall-step out of the low road's lane);
  `porch2` 400 px, level with P, touching P's end, out 162 px over the far bank; `far` bank 320. Two up (W, the rise), two down (the rise
  to porch2, porch2 to the far bank), each 60 px.
- **Why ONE rise (measured, session 1's bot probe below):** the first shape (1530aa374: rise 300 with a TOP 140 x 60 standing on it, 80 px
  treads; three up, three down as 2-8.md:9 draws) STRANDED the Easy child at late 0 and 15 (end 'stranded', home 0, t 59.3; traced: on
  the top at +180 he jumped off past the 80 px tread and landed two steps down, deeper than the line's 90 px step (W2_FOLLOW.step,
  follow.ts:53), so the line waited at the top's lip and never came). A wider tread (rise 400, top 140 at its near end, a 220 px tread)
  fixed the child and stranded the ADULT at late 0 and 15 (home 0, t 34.9) the same way. One 400 px rise: every run home (table).
- **Built and measured** (the first shape, seed 1, the home leg running left; the final shape differs only past P): Normal lip 1518,
  water 16517-17315 (798); chain W 17315+150 @60, P 16755+500 @60, porch2 16355+400 @60. Easy lip 1503, the same at 16864-17662.
- **Proof** (src/game/gen2/worlds/w2TwoRoad.test.ts, new; in the suite's glob): GREEN on seeds 1-4, Normal and Easy: gen2 errors [],
  layFlood problems [] (floodFaults, highRoad, forkFaults all empty), forkFaults(chain) [], chain length >= 3 (W, P, porch2: what
  lead-the-line reads minus its shared ends), W 150 one step up, P level with W, ONE rise 400 standing on the porch over the water and
  nothing within two steps over it, the high road ending over the far bank. RED by name: W 60 ('the adult lands 86 px past its face ...
  walks off into the 60 px gap'), gap 0 ('no way down onto the low road: the gap after it is 0 px').
- **Checks:** on frozen 1530aa374 (first shape): tsc exit 0; w2TwoRoad + floodLay + flood + w2.test 25/25; generalitycheck PASS (26
  literals, 26 known). On frozen e1d8d74c5 (final shape): see "Checks on e1d8d74c5" at the end. Not run (nothing listed uses the
  section; no stage laid): the suite, drawcheck, castBots, the lock.
- **The bot run** (scratch probe /home/user/wtw2a/probe28/probe.test.ts, never committed: lineBot.test.ts floodRun with its hand high road
  replaced by the section's pieces at their built sizes, relative to the water's edge W0: W W0-150 +150 @60 h60, P W0+60 +500 @60, the
  rise W0+160 +400 @120 h60, porch2 W0+560 +400 @60; the water 798 px; floodRun's WALKWAY low road kept (For the lead 3); the real
  engine, the first-timer bots). FINAL SHAPE, seed 1, late 0 / 15 / 19 (s the clock ran before he sets off):
  | tier (setting) | late 0 | late 15 | late 19 |
  |---|---|---|---|
  | child Easy | shrine, home 3, high, 22.5 s | shrine, home 3, high, 22.5 | shrine, home 3, high, 25.6 |
  | middle Easy | shrine, home 3, high, 16.8 | shrine, home 3, high, 16.8 | shrine, home 3, high, 16.8 |
  | child Normal | shrine, home 3, high, 40.5 | shrine, home 3, high, 40.5 | shrine, home 3, low*, 40.5 |
  | expert Normal | shrine, home 3, LOW, 19.3 | shrine, home 3, LOW, 19.3 | shrine, home 3, HIGH, 17.5 |
  | middle Normal | shrine, home 3, LOW, 20.7 | shrine, home 3, LOW, 20.7 | shrine, home 3, HIGH, 18.5 |
  | adult Normal | shrine, home 3, high, 16.0 | shrine, home 3, high, 16.0 | shrine, home 3, high, 16.4 |
  setBack 0 in all 18; seeds 2 and 3 (36 more runs) identical to seed 1 for every tier: 54 of 54 home. (*'high' is read only before the close: the child reaches the fork after it at late 19.) The middle and the expert
  read the fork as designed (low with time, high when late). On the FIRST shape seeds 1-3 (and 1-2) were identical for every tier.
- **Read from code, not measured (for ruling 3):** follow.ts:53 'he is climbing, riding or grabbing, or dropped further than a step: the
  newest ground point is a WAIT', W2_FOLLOW.step = 90 (w2.ts:57): off W (60 over the bank) into a log river the drop to the water is 60 +
  LOG_DROP 28 + 14 = 102 px and a ride is a WAIT, so on gen2's log-river low road the line may not follow him at all.
- **Not done:** step 2 (no draft head: the lead's base ruling); step 3 (waits for the GO).

## FOR THE LEAD (asked in messages; a question never ends a box)
1. **The base (a missing piece, LANES rule 2): RULED** (step 1b at the hash the lead sends; EXACT NEXT STEP 1).
2. **ENGINE-WORTHY (flood.ts:166-206 highRoad).** The walk takes, from where he stands, the piece reaching FARTHEST among those starting
   within a hop (:196 `beyond(farOf(p), farOf(next)) > 0`) and jumps to its far end, so a block standing ON a porch (the ruled 'every
   further rise a block standing on the porch') is never met: on this section the chain is W, P, porch2, and the rise is unjudged. A rise
   that floated over the porch (a bare edge hop up), or a stack of steps whose treads the bots overshoot (session 1's two strands), would
   pass the verdict. w2TwoRoad.test holds the rise on the porch's top by data. Fix for every stage: the walk meets each piece standing on
   its current piece between here and its far end, and a tread under the line's safe width is refused (a Lane 2 piece, with plants).
3. **The low road's shape: gen2 lays a LOG RIVER, the bot toy measured a WALKWAY.** In gen2 (this section and floodLay.test's brick) the
   low road is a river ('ride': three logs at 70 px/s, safe): walking off W he falls into the water and rides a log, or splashes back to
   the near bank; the line paddles, but a ride is a WAIT for it (follow.ts:53, read, not measured). lineBot.test.ts floodRun (:165, :180)
   measured lead-the-line on a WALKWAY 60 px under the banks with W standing 60 px BACK from the water (the gap over the bank's last 60 px;
   two 60 px drops the line follows). 2-8.md:9: "LOW 1,400 px of marsh path with four 100 px dips". Rule: (a) World 2's log river, as gen2
   lays it (measure the line on it at READY-28), or (b) a marsh walkway the water closes (a new gen2 piece: Lane 2, before BUILD-28).
4. **The fork's choice on this shape (measured):** the high road spans the low road's own x, so it is no longer than the low road (the
   middle's high run 18.5 s against its low run 20.7 s; the adult, the Easy middle and both children go high even with time to spare).
   2-8.md wants the low road the short one (+7.2 s Normal by the high). Rule the dial: (a) a longer high road (porch2 runs on past the far
   bank before its step down: a section number), (b) leave it to READY-28's measure on the draft.

**THE LEAD'S SECOND RULINGS (received after 1a was built, verbatim):** "(4) APPROVED: three up / three down with every tread at least 400 px,
re-probed. CATCH IT IN THE GATE TOO: the stranding you found is a rule floodFaults/forkFaults should name: a step DOWN on the high road
deeper than the line's step (90 px) strands the line at the lip: add it as a named verdict, planted RED on your 80 px treads, GREEN on the
400 px shape. (3) The marsh low road: YOU build it as a separate ENGINE PIECE commit on t-build-28-wip, before READY-28's measure (we are
in READY, not the build). The SMALLEST general piece: prefer extending an existing place (World 2's shallow paddle water / a river place
with a floor 60 under the banks that the flood's close fills) over a new place kind; the line paddles its dips at its paddle pace; the
close turns it to deep water (a wall the line waits at); a planted toy each way, the bots' road through it, no stage id. Then 1a (the
highRoad fix with the floating-rise plant)." (1a was already built: b74fadfe8.)

**THE LEAD'S RULINGS on 2-4 (received at the end of session 1, verbatim):** "(2) the gate hole is real: FIX IT NOW as step 1a (READY is not
the build, and it is 2-8's own just-landed piece): highRoad judges EVERY piece on the chain in order (each rise a wall-step standing on the
porch, out of the low lane; no jump to the farthest-reaching piece), planted RED on a floating rise, GREEN on your section; general, no
stage id; flood + floodLay + w2TwoRoad re-run. (3) the low road is the DESIGN's marsh path (2-8.md: LOW 1,400 px of marsh path with four
100 px dips the line paddles through), i.e. the WALKWAY lineBot measured, NOT a log river: lay the walkway/marsh piece there; a ride is
never the low road. (4) LENGTHEN the high road to the design's long dry way round (2,200 px of porches: three up, the porches, three down),
so the choice is real: low is quicker but the flood closes it, high is longer but always open; READY-28 then measures the dial
(lead-the-line's late, both settings, every tier). Then the probe on child/expert and Easy as you planned."

## Lessons applied (session 1)
D115 (every check on a chattr-frozen worktree of the commit; the probes in a folder outside src/tools, never committed), D119 (no heredoc
in a commit chain), D128 (every stamp from date), D134 (pushed and ls-remote equal before each message), D125/D131 (READY's yield and
drawcheck come first on the draft: named, not started: no draft head), LANES rule 2 (the missing base went to the lead), level.md rule 21
(the bots proven on the piece before a level lays it: the probe found two strands the verdict passed) and 28 (each miss traced: the path).

## Checks on e1d8d74c5
Frozen /home/user/wtw2b at e1d8d74c5: `npx tsc --noEmit -p .` exit 0; w2TwoRoad + floodLay + flood + w2.test 25 tests, 25 pass, 0 fail; generalitycheck PASS.

## Step 1a (session 1, code b74fadfe8; frozen /home/user/wtw2c)
- flood.ts highRoad: after each piece it takes, it walks that piece and meets, in order, every piece IN HIS WAY on it (near side ahead of
  where he stepped on and before its far end; bottom over its top and under his head, HEAD 48 px = the collider, engine.ts:1223):
  standing on it and <= step: a wall-step, it joins the chain; taller: 'meets a wall N px tall'; room under it: 'climbs by a bare edge hop
  up ... (N px of room under it)'. General, no stage id. The section's chain is now W, P, the rise, porch2.
- Plants (src/game/flood.test.ts, new test 'highRoad: every piece IN HIS WAY on a porch is met in order'): GREEN chain [W, P, rise, P2];
  RED the rise lifted 10 px ('... 70 px up off the piece at x 1060, 10 px of room under it': a within-a-step filter would miss it); RED
  a 70 px rise standing on the porch ('meets a wall 70 px tall'); GREEN a thin piece over his head is not in his way.
- Checks on frozen b74fadfe8: flood + floodLay + w2TwoRoad 18/18; generalitycheck PASS; lineBot: 8/8 pass (exit 0); tsc: exit 0.
- Other callers: firsttimer.ts:2462 floodRoad takes the chain as the high road's piece set (otherRoad): the rise now joins it (more
  correct); lineBot.test.ts:214 reads high = chain minus its ends (B joins nothing new on its toy: B starts at P's far end, so it was met
  before too).
- ee048f86c: w2TwoRoad.test now holds the verdict's chain exactly W, P, the rise, porch2 (chain[2] is the rise) and its header no longer
  calls the rise unjudged. Frozen /home/user/wtw2d at ee048f86c: w2TwoRoad 2/2, tsc exit 0.
