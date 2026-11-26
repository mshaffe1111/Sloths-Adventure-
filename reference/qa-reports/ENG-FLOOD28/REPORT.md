# ENG-FLOOD28 REPORT (P1, READY-28 item 1: the rising water's TEACH; t-eng-flood28 from t-build-28-wip d4e7677ba). Session 1 started 4:14 PM ET (session hook).

## EXACT NEXT STEP (session 1, gates-only extension ruled by the lead; stopped on a RED at 5:16 PM ET by date; code head 4d8450bcc)
RED: suite shard 2/3 on frozen 4d8450bcc, 1 fail: src/game/w4RealReach.test.ts:26 "5-9's Easy goal rests on the kid's runs: re-measured,
they are still the ones recorded (gen2/game.ts KID_RUNS_59)": actual [8, 9, 7, 7, 4, 7], expected [3, 5, 6, 7, 6, 5] (suite-shard2-red.txt).
NOT diagnosed (the lead's ruling: no diagnosis in this extension). Facts only: lockall says 5-9 is unchanged (102/102); the run shared the
machine's 4 CPUs with shard 1, shard 3 and the lockall check. Successor, in order: (1) re-run w4RealReach.test.ts ALONE (roles README: a
timing test is re-run alone before it is called red) in a frozen worktree of 4d8450bcc AND of the base d4e7677ba, each its own
run_in_background call; (2) if it is red on 4d8450bcc only, the cause is this branch's: fix at cause with a planted test (never re-record
KID_RUNS_59 to pass, LAWS 22); if red on both, it is the base's, a named red for the lead (D135: proven on both, never called inherited);
(3) then the CI tool line (gates.yml:157) on the final candidate, which this session STOPPED unrun when the red came; then the GATES below,
push, ls-remote = HEAD, the hash to the lead. Frozen worktree recipe (D115): `git worktree add --detach <dir> <hash>`, symlink
node_modules, `chattr -R +i src tools reference`, then `chattr -R -i src/game/gen2/proven`.

## What was built (no stage id, seed or x in engine code)
- `RiverRow.flood: 'teach'` (gen2/riverLay.ts:54; floodMark kind, river.ts:76). flood.ts: `FloodRow.teach` {normal, easy} s (:37, optional,
  the designer's number), `FloodWater.own` (:79), `FloodClock.over(x, t)` (:334): the first frame he is over its span (x0 < x < x1, ground
  or air) it starts, once, never reset; `sinceOf` (:343): each water its own start, so step() rises it y0 -> paddling depth over its s. It
  never drains, never turns deep (floodFaults :121 refuses one by name), the clock's start never moves it, a respawn keeps it.
- gen2/floodLay.ts: `teachWaterOf` (:59); a 'teach' water laid as its own rise (:76); refused by name with no `teach` in the table (:68).
- engine.ts:1981: `floodClock.over(p.x, gameTime)` each frame he plays, before the clock steps (the one engine line).
- '@flood' (nodeAsks.ts:65 FLOOD_CLOCK, :83 ELEMENTS 'checked', :188 hazardMiss; pipeline.ts:4331-4332): no longer 'Later': the node's fall
  of that kind ENDS IN a flood-marked water (waterUnder under its lip, x AND y; the x-only first draft passed an out-leg node on the home
  leg's water, caught by the toy) on a stage whose brief names a flood. NODE-KEY.html regenerated (tools/engine/nodekey.ts).

## Toys (rule 21; every plant RED; also RED on the base code with the new tests: plant-*.txt)
- flood.test.ts:62/:91 the clock: starts over its span only, once; rises over its s; never drains; no restart. RED: `over` off, never rose.
- floodLay.test.ts:114 the lay (toy 2-96, both settings, seeds 1-4): laid `own`, the table's s, paddling depth. RED: no teach in the table.
- floodLay.test.ts:137 '@flood' through the pipeline: GREEN over the teach twin; RED (by name) with no flood in the brief, and on the out
  leg's unmarked river that shares x with the home leg's marked ones. nodeAsks.test.ts:69-76: no Later; each miss by name.
- lineBot.test.ts:754 the BOTS and the LITTLE ONES, real engine (2-3's row hosting a gen2 marsh marked 'teach', as floodRun): 6 tiers x
  seeds 1-3, home 3, rescue 0, started as he came over the near edge (x 1009-1017), nothing before, paddling depth, a respawn keeps it, the
  line paddled the RISEN water at its live surface. :771 RED: own start off (never rose); the line's live read off (paddles off the surface).
- lineBot.test.ts:780 the hand build reproduced: every frame = the hand build's rule (floodLevel from its start); started no later.
Real row: none marks a flood (no listed stage names one); 2-8's own row is BUILD-28's first. 
## The hand build's block (engine.ts:1990-2013 here = :1988-2011 on d4e7677ba), line by line, and where each part lives now
Probe, the engine's own block vs the piece, every tier (probe-handbuild-results.txt): the same curve to 0 px once started; the piece
starts 3-4 frames sooner (x ~1013 vs ~1044); the hand build drained as he stood back on a bank and on a respawn.
1. `r.flood` (the hand river's own field, w2Stages.ts:663) -> RiverRow.flood 'teach' / floodMark, laid by gen2.
2. `f.y0 ??= r.surfaceY` -> FloodWater.y0 at lay time. 3. `inBasin = x > trigger (x0 + 30) && x < x1 + 10` -> FloodClock.over, x0 < x < x1.
4. the drain (out of the basin, grounded, 2 x dt) -> DELETED by rule (2-8.md: nothing drains). 5. the start when in basin, not game over ->
   FloodClock.over (engine.ts:1981, `!isGameOver`). 7. `surfaceY = floodLevel(...)` -> floodSurface in FloodClock.step (:1983-1987).
6. `floodTold` + a hard-coded `guide('The water is rising! ...')` (+ dotLinesData.ts:151 'eng.flood') -> the level's own tip (2-8.md beat 2,
   "Dot 800 px before", rule 6): BUILD-28 data; delete the 'eng.flood' row with the block.
With it (BUILD-28 deletes): fields :597-598; :3030 and :6218 (a safe splash and a respawn drained it: kept now); :6331 and :7761 (the
over-pass draw over covered islands: a gen2 flood stops UNDER its floor and banks, floodWaterOf, so it never covers a piece).

## GATES (code head 4d8450bcc)
- tsc PASS (frozen worktree). generalitycheck PASS (26 literals, 26 known). knowncheck PASS. New toys 16/16 green, plants red.
- lockall d4e7677ba -> 4d8450bcc: PASS, 102/102 stages unchanged (lockall-d4e7677ba-vs-4d8450bcc.txt).
- Suite: shard 1 PASS 1390/1390; shard 3 PASS 1387 + 2 todo (R-165.312, known); shard 2 RED 1434 pass, 1 FAIL (5-9 KID_RUNS_59, above), 1 todo.
- CI tool line: STOPPED unrun at the red (the lead's ruling). drawcheck: not run (no draw change).

## Choices named (reversible; the lead's call) / Suggestions
- Start = his centre over the span, airborne too (the hand build's; READY-28 said "stands"): a hop over a dip still starts it.
- W2_FLOOD.teach is unset: BUILD-28 or the designer sets 2-8's number (beat 2 is 16 s, "fills as he watches"); BUILD-28 marks beat 2's
  marsh row 'teach', lays the tip, deletes the block, its 'eng.flood' row and the lines above.
- A teach water needs a flood brief (cage, low road) like every flood water; teach-only would need Flood.start optional. ENGINE-WORTHY: the plain hazard ask (`:#soft`) is still x-only: on a leg stage a home-leg fall passes an out-leg node. A small packet.
- Own miss: a shell '&' in the suite's first start (forbidden); stopped in a minute, restarted right, nothing taken from it.
Lessons applied: D115, D119, D128, D134, D139 (the base has no teach mark), D140, D141, D135. Hours: 0.33 h of work at the box + the gates-only extension to 5:16 PM ET (of 2.5).
