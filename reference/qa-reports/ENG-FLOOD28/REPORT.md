# ENG-FLOOD28 REPORT (P1, READY-28 item 1: the rising water's TEACH; t-eng-flood28 from t-build-28-wip d4e7677ba). Session 1 started 4:14 PM ET (session hook).

## EXACT NEXT STEP (session 1 at its box, 4:34 PM ET by date; code head 4d8450bcc, pushed)
The piece and its toys are DONE. Left: the gates on 4d8450bcc, each ONCE, in frozen worktrees (D115: `git worktree add --detach <dir>
4d8450bcc`, symlink node_modules, `chattr -R +i src tools reference`, then `chattr -R -i src/game/gen2/proven`): (1) the suite in 3 shards,
each its OWN run_in_background call, timeout 7200000 (CLAUDE.md Checks, `--test-shard=i/3`), never a shell '&'; (2) lockall:
`npx tsx tools/engine/lockall.ts --layouts 16 --out lock-base.json` on d4e7677ba, then `--layouts 16 --check lock-base.json` on 4d8450bcc:
NO stage may move; (3) the CI tool line (.github/workflows/gates.yml:157, lineBot.test.ts among its 43 files). Then fill GATES below (one
line each), commit this file only, push, `git ls-remote origin t-eng-flood28` = HEAD, the hash to the lead. Session 1 has (1) and lockall's
base half IN FLIGHT (its scratchpad; lost if it ends). drawcheck: not run, no draw code changed and no listed stage lays a teach water.

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
- Suite 3 shards: RUNNING. lockall base -> head: RUNNING (base half). CI tool line: NOT YET. drawcheck: not run (no draw change).

## Choices named (reversible; the lead's call) / Suggestions
- Start = his centre over the span, airborne too (the hand build's; READY-28 said "stands"): a hop over a dip still starts it.
- W2_FLOOD.teach is unset: BUILD-28 or the designer sets 2-8's number (beat 2 is 16 s, "fills as he watches"); BUILD-28 marks beat 2's
  marsh row 'teach', lays the tip, deletes the block, its 'eng.flood' row and the lines above.
- A teach water needs a flood brief (the clock's cage and low road) like every flood water; teach-only stages would need Flood.start optional.
- ENGINE-WORTHY: the plain hazard ask (`:#soft`) is still x-only: on a leg stage a home-leg fall passes an out-leg node. A small packet.
- Own miss: the suite's first start used a shell '&' with a wait in one background run (the brief forbids it); stopped within a minute,
  restarted as three background runs; nothing taken from it.
Lessons applied: D115, D119, D128, D134, D139 (the base has no teach mark), D140, D141. Hours: 0.33 h at the box (of 2.5).
