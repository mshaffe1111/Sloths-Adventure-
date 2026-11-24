# ENG-28 REPORT (2-8's pieces ahead, Lane 2): session 2 (ENG-28b), started 2:29 PM ET, handed over 2:45 PM ET (both from date)
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

## EXACT NEXT STEP (session 3)
a. `git fetch origin t-eng-28-wip && git checkout -b t-eng-28-wip origin/t-eng-28-wip` (head 2a4edf8db or this REPORT's commit);
   `npm ci --no-audit --no-fund --legacy-peer-deps` (plain npm ci fails on a peer conflict; CI uses --legacy-peer-deps).
b. Fix the adult's 'too late' RED: `FLOODDBG=1 npx tsx --test --test-name-pattern="too late" tools/inspect/lineBot.test.ts` prints READ
   and PATH. In firsttimer.ts, find the edge press (the `if (!ahead) { const on = this.prog.target(p, 160); ...` branch near line 3200 and
   tierEdge/jumpFor) and make it aim at the route's target when it lies ABOVE the edge (a piece he must land on, not the gap's far side):
   the held jump (a full hold) toward it. Prove it on all 6 late runs (GREEN), then rerun ALL of lineBot.test.ts (wait-for-the-tail and
   fetch must stay GREEN) and tools/inspect/tierBots.test.ts (any bot change re-runs calibration; if tierBots moves, STOP and tell the
   lead: the calibration file is recommitted only with a 1-1 change, BOTS.md). Do NOT loosen the toy (no thinner A, no skipping the
   adult). Then remove the FLOODDBG lines and commit.
c. On FROZEN trees (D115, chattr; never a shell '&', run_in_background): lockall --layouts 16 base (90552d3ec) vs head (expect no listed
   stage moved: no listed brief names a flood); the full suite (CLAUDE.md "Checks") + the CI tool line (gates.yml: the engine tools'
   tests incl. lineBot, tierBots, seedlist 1-1 --check); the base suite is WARN-412's on 90552d3ec (4096 pass, inherited reds only).
d. Land: `git branch t-eng-28` from the frozen candidate, push it (NOT t-eng-27); merge INT-R5's candidate in when the lead sends its
   hash; message the lead (session_01FhBbYN2CVHnFXg7XzqKXpM, no clock times) the hash and what 2-8's READY can now measure: yield,
   drawcheck, stills both ways, the flood's verdicts (floodFaults, highRoadFaults by name), met order (lastMet), and the cast bots' road
   at the fork (lead-the-line).

## Lessons applied / Method update
D130 (lastMet for the start cage), D115 (frozen base tree), D114 (base suite first: WARN-412's, the lead's ruling), D75 (a gen2-laid toy
row and a real-engine toy, not a fixture). Session 2: a bot toy in the REAL engine found two engine defects the pure toys could not
(floodClosed's span, the wall's air points): build the bot toy before calling the engine piece done. Method update: a REPORT goes through
the Write tool, never a shell heredoc (session 1's rule, kept).
