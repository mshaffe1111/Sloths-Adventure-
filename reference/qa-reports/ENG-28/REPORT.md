# ENG-28 REPORT (2-8's pieces ahead, Lane 2): session 1, started 2:04 PM ET (date), handed over 2:25 PM ET
Branch t-eng-28-wip (base t-eng-27 90552d3ec). Commits: 601e37549 pure core + follower toys; 4c53ea427 gen2 lay + toy row; dd4367cd2 engine wiring.

## Done-items (so far)
1. NEW 1 flood clock + floodFaults: src/game/flood.ts (FloodRow, Flood, FloodClock, floodFaults, highRoadFaults, deepAt), W2_FLOOD in
   gen2/worlds/w2.ts (2-8.md:8-16, :58 pasted), gen2/floodLay.ts (GraphBrief.flood; RiverRow.flood 'rise'|'close' marks; the clock at the
   LAST cage MET via tower.ts lastMet, D130; paddling 10 px under the banks, 2-8.md:39; the low road deep at the close; near bank by met
   order; high road a chain of <= 60 px steps, 2-8.md:35/58). Pipeline hook beside layPacer. Toys: flood.test.ts (floodFaults GREEN on the
   flown 3,400 px both settings, RED 3 s early by name; the clock starts only at its cage, once, no drain, turns once) and
   gen2/floodLay.test.ts on the out-and-back toy (GREEN 4 rolls x 2 settings; RED by name: 3 s early, no high road, no cage, and through
   the pipeline). PARTIAL: lay + engine proven on toys; no engine-level (FollowPlay + clock) toy yet.
2. NEW 2 followers meet the flood: follow.ts stepLine  (deep water is a WAIT), setOnBank (set on the near bank, sitting, rejoin as
   a spooked one), followPlay.ts floodClosed + FollowStage.deep; engine.ts runs FloodClock (start cage -> freed; live surfaces; low road
   lethal after the close, floodDeepRiver; no reset on respawn). Toys: mid-dip at the close set back + rejoined (RED without the set-back:
   in deep water), the wall (RED off: walks in), a 60 px walk-off step is a walk (Pushback 5 already holds: W2_FOLLOW.step = bankH 90).
3. Bot skill lead-the-line: NOT STARTED.
4. lockall / suite / CI tool line / landing: NOT RUN (base suite running on frozen /home/user/wtbase28 at hand-over, 1,264 results, 0 red).

## Pushback
1. The base lacks main's DESIGNED cages (main pipeline.ts:3644, sockets allowing 'cage', 2-3's build): on t-eng-27 a rolled graph lays
   no cage (D101), so the clock has nothing to start it through the pipeline; the toy places its two cages in the test, and the pipeline
   path refuses by name ('flood: no cage to start its clock'). 2-8's READY needs t-eng-27 + main (an INT merge: 10 files conflict,
   engine.ts, gates.yml, inventory json; git merge-tree). Not done here (out of lane, not a piece).
2. World 2 has NO two-road section (shape 'two-road' only in w1.ts:609): 2-8's fork F[Pf1+|Pw1] needs one (Content data: the low road a
   row marked 'close', the porches 'over' it); the engine checks any high road over the marked water, fork or not.
3. FLOOD_HOP 60 px (floodLay.ts) is an engine tolerance (the gap between high-road pieces), not in 2-8.md: the Designer confirms or sets it.
4. The hand build's basin flood (engine.ts 'r.flood' loop with its drain, respawnAtCheckpoint floodAt.clear) stays until w2Stages '2-8'
   is replaced; its deletion (about 25 lines) belongs to the replacement commit. Named so the level job does not meet it unplanned.

## EXACT NEXT STEP (session 2)
a. Base suite verdict: tail /tmp/claude-0/-home-user-Sloths-Adventure-/eb4a8039-9fd8-5fc7-a724-0301fa499550/scratchpad/base-suite.log
   (EXIT line); if the container is gone, cite WARN-412's suite on 90552d3ec (its REPORT) and say so.
b. Engine-level toy (flood.test.ts): FollowPlay + FloodClock on a toy floor (stage.deep = clock.deepAt; safeWater live): line through
   the low road, close -> floodClosed sets the paddlers on the near bank; RED without floodClosed (one in deep water).
c. lead-the-line: grep tools/inspect for 2-3's 'wait-for-the-tail' skill; add 'lead-the-line' (at the low road's near bank: if the
   clock's time left < the line's tail-off of the rest of the low road + spare, take the high road); toy on floodLay.test's toy (caged()),
   RED with the read removed.
d. On FROZEN trees (D115): lockall --layouts 16 base vs head (expect no listed stage moved: no listed brief names a flood, no world row
   is marked); the full suite + the CI tool line (gates.yml rolled + tierBots); then merge into t-eng-27 (no force), push, message lead.
