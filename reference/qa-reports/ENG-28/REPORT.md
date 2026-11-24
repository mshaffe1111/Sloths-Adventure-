# ENG-28 REPORT (2-8's pieces ahead, Lane 2): session 4 (ENG-28d), started 4:21 PM ET, handed over 4:42 PM ET (both from date)
(Session 2 ENG-28b 2:29-2:50 PM ET; session 3 left no commit on this branch; session 4 below, its section first.)

## Session 4 (ENG-28d): the lead's DESIGN-route ruling, built and half-proven
The ruling (replaces the old next step b): the fork's first high-road piece is a WALL-STEP he bumps into and climbs; the flood check
refuses a fork whose high road starts with a bare edge hop (planted RED/GREEN); NO change to the tier bots' edge press.
- DONE, GREEN: flood.ts highRoad (and so highRoadFaults, which the lay runs beside floodFaults: one verdict list, layFlood's problems):
  every step UP on the high road is a wall-step (its face where he stands, reaching down to his feet: `h`, the piece's height, now passed
  by floodLay.ts and firsttimer.ts floodRoad); the first piece may stand back on the near bank (its far side at most a hop before the
  edge); level and down hops stay legal. Refused by name: 'starts with a bare edge hop at x N' (first piece) and 'climbs by a bare edge
  hop up at x N' (any later up). Toys in flood.test.ts (11/11 GREEN): GREEN block on the bank / face at the edge / the stand-back shape;
  RED thin piece at the edge, block out over the water, no height, a thin porch-top step one piece in.
  WIDENED from 'the first piece' to 'every step up' on evidence (below); sent to the lead, box not ended on it. THE LEAD AGREED (its
  reply, read at hand-over): the flood check refuses a bare edge hop UP anywhere on the high road; level and down hops stay legal; every
  rise is a wall-step out of the low road's lane; it is what 2-8's Content job will lay. 'Carry on: the toy, then the gates, then t-eng-28.'
- FINDING 1 (real engine, lineBot toy v1: block W 60 px on the bank set back 60 px, then the old porch B 60 up off W's far edge): the
  adult BUMPS W and climbs it (the wall-step works with no bot change) but at W's far edge walks off forward: W->B is a bare edge hop up
  again, the same RED one piece later. In 2D a wall in the low road's lane blocks the low road, so after the first wall-step the high road
  rises only by hops; hence 'every step up is a wall-step' and the porch-top blocks (out of the low road's lane, 120 px over the walkway).
- FINDING 2 (toy v2, NOW IN lineBot.test.ts: W 880-940 h60 on the bank; P thin 1000-1100 at Y-60 (a LEVEL 60 px gap hop off W); B a
  block 1100-1340 Y-120 h60 standing on P's level; C thin 1340-1560 at Y-60): lineBot 4 of 7 GREEN (wait-for-the-tail, fetch, both
  planted). RED: (a) 'time enough' middle seed 1 goes HIGH (the bot's edge press at W's far edge hops the level gap onto P even on the
  low route, so the low road is no longer the default and the planted-RED test loses its split); (b) 'too late' adult seed 1: climbs W,
  hops onto P, bumps B and climbs it (all good), but the LINE drops off P to y 800 at x 1081 (the deep surface) when he climbs B and the
  run ends stranded, home 0 (trace: late2.log lines PATH 7.0-9.5 in the next step's command).
- FIXED with a planted toy (2b's cause): followPlay.ts surf snapped his hop's ARC over a flood water (P up onto B, y 680-740) down to the
  deep surface. Now a flood's water (safeWater `lip`, set by engine.ts from the river's floodMark) paddles only at or under its banks; a
  point above them is the high road. Toy in flood.test.ts (12/12 GREEN): the arc over the porch's end stays his hop; under the banks the
  line still paddles; RED with no lip (the arc snapped to the water). Teaching rivers carry no lip: unchanged by construction (follow
  toys 39/40 GREEN; the one RED is the lay toy below). In the real engine the line now follows him over W, P, B, C to the far bank.
- NEW RED (adult seed 1, 'too late', after the fix): he reaches the exit (x 2965 at 18.0 s) with the line about 400 px behind, and the run
  ends 'stranded', home 0 (t 36.8). The middle bots bring all three home. Not yet read why the run ends (FirstTimerRun's end condition,
  or the adult not waiting for the tail before the exit).
- NOT YET: floodLay.test.ts's GREEN lay toy is RED under the rule (its brick's porch is a thin branch 60 px over the bank: a bare edge
  hop, by name at x 17315): the toy brick must lay the stand-back shape. FLOODDBG traces still in. Base lock: running at hand-over on
  /home/user/wtbase28 (frozen): FINISHED 4:40 PM ET (started 4:28, 12 min): 3264 builds of 102 stages, committed as
  reference/qa-reports/ENG-28/lock-base-90552d3ec.json (the precedent: VAR-19e's base lock).
Branch t-eng-28-wip (base t-eng-27 90552d3ec). Session 1: 601e37549 pure core + follower toys; 4c53ea427 gen2 lay + toy row; dd4367cd2
engine wiring. Session 2: 016b5b45b engine-level toy; e76a2886d flood.ts highRoad (the chain); 0aab83a4e two flood defects fixed, each
with a planted toy; 2a4edf8db WIP lead-the-line (one toy case still RED, below).

## Done-items (so far)
1. NEW 1 flood clock + floodFaults: src/game/flood.ts (FloodRow, Flood, FloodClock, floodFaults, highRoadFaults, deepAt); W2_FLOOD in
   gen2/worlds/w2.ts (2-8.md:8-16, :58 pasted); gen2/floodLay.ts (GraphBrief.flood; RiverRow.flood 'rise'|'close' marks; the clock at the
   LAST cage MET via tower.ts lastMet, D130; the high road a chain of <= 60 px steps); pipeline hook beside layPacer. Toys: flood.test.ts,
   gen2/floodLay.test.ts (GREEN 4 rolls x 2 settings; RED by name: 3 s early, no high road, no cage, through the pipeline).
   **Engine-level toy DONE (016b5b45b)**: FollowPlay + FloodClock on a toy floor, stepped in the engine's order (engine.ts:1974 the clock,
   each closed water to floodClosed, then the line at :3363; stage.deep = clock.deepAt; the flood's water read LIVE): five freed at the
   start cage, he stands just past the low road. GREEN: half way to the close 4 paddle, off the live surface by 0 px; at the close 4 set
   on the near bank (990, 500), 0 in deep water, 1 still with him. RED without floodClosed: 4 left in deep water.
2. NEW 2 followers meet the flood (session 1): follow.ts wall + setOnBank; followPlay.ts floodClosed + FollowStage.deep; engine.ts runs
   FloodClock. **Two defects found by session 2's bot toy, fixed with planted toys (0aab83a4e):**
   a. followPlay.ts floodClosed set back EVERY little one over the low road's span, including ones up on the high road's porch over the
      water. Now only those in the water (deepAt's own height rule, y > lip - 2). Toy: the porch one stays, the wet one is set back; RED:
      the span alone takes both.
   b. follow.ts wallCap read his hop's AIR points as the wall: his hop up off the near bank onto the high road starts at the banks' top,
      over the water's span, so after the close the line never followed him up (stranded on the near bank). Now only ground points are the
      wall and the line waits at the last ground point. Toy: the line follows the hop; RED: the same trail with the air flags stripped stops
      on the bank.
   (Both are toy-proven only; no listed stage has a flood, so lockall must show no stage moved.)
3. Bot skill lead-the-line: BUILT, ONE TOY CASE RED (2a4edf8db, WIP).
   - flood.ts highRoad(tops, span, step, hop) returns highRoadFaults' walk as its chain (pieces in met order); highRoadFaults wraps it.
   - firsttimer.ts: LINE_SKILL.leadLine; FORK_READ = 300 px; floodRoad(p) runs at the top of intend() (before the way on is read: called
      lower down, the adult had passed the fork before it ran). Once a run, once the clock runs, on the near bank within FORK_READ of the
      high road's first piece: time left = close - since; need = the rear-most follower's px to off the low road / (Flood.px / tailOff);
      left < need: Progress.reroute (new) splices the high road's tops (every 24 px) into the route ahead, moving cur/hi/best/floors/pins.
   - lineBot.test.ts floodRun (real engine, toy fork: near bank, walkway 60 px down over 400 px of water marked 'close', high road
      A 60 up / B 120 up / C 60 up and 220 wide so a hop off B lands on it): 'time enough' GREEN (middle + adult x 3 seeds: low road,
      none set back, all home); planted (read off, 22 s late) GREEN as a RED (the close splits the line).
   - **'too late' (22 s): middle x 3 GREEN; ADULT SEED 1 RED**: he reads (left 2.50 s < need 5.91 s, reroute made) but his edge press at
      x 981 is a low hop (peak y 764, A's top is 740): he misses A, lands on the walkway (y 860) and drowns at the close (x 1381); the
      respawn regroups the line at the start and the run ends stranded. The bot does not aim its edge hop at a piece ABOVE the edge.
   - FLOODDBG console traces are still in firsttimer.ts floodRoad and lineBot.test.ts floodRun: REMOVE before landing.
4. lockall / suite / CI tool line / landing: NOT RUN.

## Pushback (session 1's, with the lead's rulings)
(1) INT-R5 merges main with t-eng-27; this job merges THAT candidate in once its hash comes. (2) 2-8's two-road section is a Content job.
(3) FLOOD_HOP 60 accepted for now. (4) The hand-built basin stays until 2-8's build replaces it. Land on a NEW branch t-eng-28.
New from session 2 (for the lead): the bot's edge hop never aims UP at a piece over the edge, so on 2-8's real fork every tier bot needs
that move or the high road must start with a piece he walks or bumps onto (a step he meets as a wall). Which one is the fork's shape is
the Designer's/Content's; the bot fix is mine (next step c).

## EXACT NEXT STEP (session 5)
a. `git fetch origin t-eng-28-wip t-eng-27` (about 3 min, in the background), `git checkout -b t-eng-28-wip origin/t-eng-28-wip`,
   `npm ci --no-audit --no-fund --legacy-peer-deps`. Base lock: if `reference/qa-reports/ENG-28/lock-base-90552d3ec.json` is on the
   branch, use it; else START IT FIRST (it took about 12 min here): `git worktree add --detach /home/user/wtbase28 90552d3ec`,
   `ln -s <repo>/node_modules /home/user/wtbase28/node_modules`, `chattr -R +i /home/user/wtbase28/src /home/user/wtbase28/tools`,
   in it `npx tsx tools/engine/lockall.ts --layouts 16 --out <scratchpad>/lock-base-90552d3ec.json` (run_in_background, timeout 2400000).
b. (2b's paddle snap is FIXED, see above.) The adult's new RED: `FLOODDBG=1 npx tsx --test --test-name-pattern="too late"
   tools/inspect/lineBot.test.ts`, the 4th READ's run: he reaches x 2965 (EXIT 3000) at 18.0 s with the line ~400 px behind and the run
   ends 'stranded', home 0. 'stranded' is set at firsttimer.ts:1678/1695 (the same death 3 times), :2119 (the same pit 3 times), :4636
   (fell back 3 times) or :4667 (no progress for rescueAfter, 20 s), each only when rescue() fails; the PATH trace stops at gameTime 18.0
   with the line at x 2528-2600 still moving (r.t 36.8 is the bot's clock). Find which fired (add a one-line FLOODDBG print at each, or
   TRACE), and the adult's wait-for-the-tail before the
   exit; the middle tier passes the same fork. Fix the cause (the bot's lead-the-line or wait for the tail after a reroute, never the
   toy), then 'too late' all 6 GREEN.
c. The low road as the default (FINDING 2a, NO change to the bot's edge press, the ruling): reshape the toy so walking off W is the low
   road and the gap onto P is not the edge press's far side on the low route. First READ firsttimer.ts's edge press (`if (!ahead)`, near
   line 3200; prog.target(p, 160); tierEdge/jumpFor) to learn which far side it aims at, then pick the shape from it, e.g. P's near end
   more than the bot's gap reach off W, or P higher than W by a wall (a block P standing on... only if it stays out of the low road's
   lane). Every step up stays a wall-step (flood.ts rule); level/down hops <= FLOOD_HOP. 'time enough' 6 GREEN on the LOW road, the
   planted RED splits again. Do NOT loosen the toy (no skipping the adult, no thinner pieces to dodge a bump).
d. floodLay.test.ts GREEN: its brick's porch (withPorch: a 'branch' 'over' 'near' at 1, dy -60, 880 wide) lays a bare edge hop; add the
   stand-back shape in the toy brick (a 'block' 'on' the bank he meets first, h 60, then the porch) so the lay toy is GREEN on all rolls,
   both settings, and its 'no high road' RED stays; add a lay-level RED: the porch alone is refused 'starts with a bare edge hop'.
e. Remove every FLOODDBG line (firsttimer.ts floodRoad, lineBot.test.ts floodRun); commit; run all of lineBot.test.ts and
   tools/inspect/tierBots.test.ts (any bot-file change re-runs calibration: if tierBots moves, STOP and tell the lead).
f. Freeze a candidate tree (a worktree at the commit, chattr as in a), `lockall.ts --layouts 16 --check <base json>` (expect no listed
   stage moved), the full suite (CLAUDE.md "Checks"; base: WARN-412's on t-eng-27 90552d3ec, 4096 pass, inherited reds only) and the CI
   tool line (gates.yml rolled list incl. lineBot, tierBots, seedlist 1-1 --check). At most TWO heavy runs at once; never a shell '&'.
   D132 (read it): the lock vs 90552d3ec isolates THIS job's moves; shipped stages' baseline is MAIN. This job's diff touches only the
   flood paths (flood.ts, floodLay.ts, follow.ts/followPlay.ts flood code, firsttimer.ts floodRoad, which returns at once with no flood
   clock), so also run castBots on the shipped stages this diff can touch vs main if the lead's packet asks; say plainly which you ran.
g. Land: `git branch t-eng-28` from the frozen candidate and push it (NOT t-eng-27); message the lead (session_01FhBbYN2CVHnFXg7XzqKXpM,
   no clock times) the hash and what 2-8's READY can measure: yield, drawcheck on the draft, stills both ways, the flood's verdicts by
   name (floodFaults; highRoadFaults incl. the two bare-edge-hop refusals), met order (lastMet), the cast bots' road at the fork.

## Lessons applied / Method update
Session 4: D115 (frozen base tree, chattr), D119 (no heredoc in a commit chain: commit -m), D122 (every background run's timeout set to
fit), D120 (the widening question sent to the lead; the box went on), D129/LANES 3b (handed over at the 28-minute line), D75 (proved in
the REAL engine: the toy found that one wall-step is not enough and the line's paddle snap; pure toys could not). Method: a bot rule
read from one RED case (the first piece) was checked one piece further before calling it the rule: the same RED moved one piece on.
D130 (lastMet for the start cage), D115 (frozen base tree), D114 (base suite first: WARN-412's, the lead's ruling), D75 (a gen2-laid toy
row and a real-engine toy, not a fixture). Session 2: a bot toy in the REAL engine found two engine defects the pure toys could not
(floodClosed's span, the wall's air points): build the bot toy before calling the engine piece done. Method update: a REPORT goes through
the Write tool, never a shell heredoc (session 1's rule, kept).
