# ENG-28 REPORT (2-8's pieces ahead, Lane 2): session 1, started 2:04 PM ET, handed over 2:28 PM ET (both from date)
Branch t-eng-28-wip (base t-eng-27 90552d3ec). Commits: 601e37549 pure core + follower toys; 4c53ea427 gen2 lay + toy row; dd4367cd2 engine wiring.

## Done-items (so far)
1. NEW 1 flood clock + floodFaults: src/game/flood.ts (FloodRow, Flood, FloodClock, floodFaults, highRoadFaults, deepAt); W2_FLOOD in
   gen2/worlds/w2.ts (2-8.md:8-16, :58 pasted); gen2/floodLay.ts (GraphBrief.flood; RiverRow.flood 'rise'|'close' marks; the clock at the
   LAST cage MET via tower.ts lastMet, D130; paddling 10 px under the banks, 2-8.md:39; the low road deep at the close; the near bank by met
   order; the high road a chain of <= 60 px steps, 2-8.md:35/58); pipeline hook beside layPacer; the leg's lowering moves the lip
   (pipeline.ts, found by the toy: lip 1398 vs banks 1518). Toys: flood.test.ts (floodFaults GREEN on the flown 3,400 px both settings,
   RED 3 s early by name; the clock starts only at its cage, once, no drain, turns once) and gen2/floodLay.test.ts on the out-and-back toy
   (GREEN 4 rolls x 2 settings; RED by name: 3 s early, no high road, no cage, and through the pipeline). PARTIAL: no engine-level toy yet.
2. NEW 2 followers meet the flood: follow.ts stepLine wall (deep water is a WAIT), setOnBank (on the near bank, sitting; rejoin as a
   spooked one); followPlay.ts floodClosed + FollowStage.deep; engine.ts runs FloodClock (start cage freed; live surfaces for the line; the
   low road lethal after the close, floodDeepRiver; no reset on respawn). Toys: mid-dip at the close set back + rejoined (RED without the
   set-back: in deep water); the wall (RED off: walks in); a 60 px walk-off step is a walk (2-8.md Pushback 5 already holds: W2_FOLLOW.step
   is bankH 90).
3. Bot skill lead-the-line: NOT STARTED.
4. lockall / suite / CI tool line / landing: NOT RUN. Base suite running on frozen /home/user/wtbase28 at hand-over (1,264 results, 0 red).
Toys at hand-over: flood + floodLay + follow + river tests 37/37; tsc PASS; generalitycheck PASS.

## Pushback
1. The base lacks main's DESIGNED cages (main pipeline.ts:3644, sockets allowing 'cage', 2-3's build): on t-eng-27 a rolled graph lays no
   cage (D101), so nothing starts the clock through the pipeline; the toy places its two cages in the test and the pipeline path refuses
   by name ('flood: no cage to start its clock'). 2-8's READY needs t-eng-27 + main (an INT merge: 10 files conflict incl. engine.ts,
   gates.yml, inventory json, per git merge-tree). Not done here (out of lane).
2. World 2 has NO two-road section (shape 'two-road' only in w1.ts:609): 2-8's fork F[Pf1+|Pw1] needs one (Content data: the low road a
   row marked 'close', porches 'over' it); the engine checks any high road over the marked water, fork or not.
3. FLOOD_HOP 60 px (floodLay.ts) is an engine tolerance (the gap between high-road pieces), not in 2-8.md: the Designer confirms or sets it.
4. The hand build's basin flood (engine.ts 'r.flood' loop with its drain; respawnAtCheckpoint floodAt.clear) stays until w2Stages '2-8'
   is replaced; its deletion (about 25 lines) belongs to that replacement commit. Named so the level job does not meet it unplanned.

## The lead's rulings on the pushback (received at hand-over)
(1) INT-R5 (release 4's integration) merges main with t-eng-27: the successor merges THAT candidate in once it exists, not the 10-file merge.
(2) 2-8's two-road section is a Content Lane 2 job before BUILD-28 (filed). (3) FLOOD_HOP 60 accepted for now; 2-8's READY measures it on
the draft. (4) The hand-built basin stays until 2-8's build replaces it. LANDING: on a NEW branch t-eng-28 (release 5), NOT t-eng-27.
Base suite: my run was stopped at the lead's word (1,264 results, 0 red); the base evidence is WARN-412's suite on 90552d3ec.

## EXACT NEXT STEP (session 2)
a. Base suite: cite WARN-412's suite on 90552d3ec (the lead's ruling); no re-run.
b. Engine-level toy (flood.test.ts): FollowPlay + FloodClock on a toy floor (stage.deep = clock.deepAt; safeWater live): the line through
   the low road, the close -> floodClosed sets the paddlers on the near bank; RED without floodClosed (one in deep water).
c. lead-the-line: grep tools/inspect for 2-3's 'wait-for-the-tail'; add 'lead-the-line' (at the low road's near bank: if the clock's time
   left < the line's tail-off of the rest of the low road + spare, take the high road); toy on floodLay.test's toy (its caged()), RED with
   the read removed.
d. On FROZEN trees (D115): lockall --layouts 16 base vs head (expect no listed stage moved: no listed brief names a flood, no world row is
   marked); the full suite + the CI tool line (gates.yml rolled + tierBots); land on a NEW branch t-eng-28 (from t-eng-28-wip; merge
   INT-R5's candidate in once it exists, for main's designed cages), push, message the lead.

## Lessons applied / Method update
D130 (lastMet for the start cage; the toy's last cage met lies at a smaller x), D115 (frozen base tree, chattr), D114 (base suite first),
D75 (proven on a gen2-laid toy row, not a fixture). Method update: never write a REPORT through an unquoted shell heredoc: a backticked
word in it runs as a command (here it ran wall and held the commit about 2 min; the first REPORT commit 6e822e752 lost those words); use
the Write tool (D52's quoting rule, a new form).
