# BUILD-28 REPORT (W2-LANE: 2-8 "Before the Water Rises"; R-165.430 (2), READY-28, BUILD-28). Session 1 (W2-LANE a), started 9:44 AM ET (from date). Session 2 (W2-LANE b), started 10:07 AM ET (from date). Session 3 (W2-LANE c), started 10:30 AM ET (from date)

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
   checked (running at hand-over); (b) at 1b, lockall vs main on the merged head, every move traced (rule 28).
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
