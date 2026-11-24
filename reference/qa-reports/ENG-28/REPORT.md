# ENG-28 REPORT (2-8's pieces ahead, Lane 2): session 8 (ENG-28h), started 6:07 PM ET, handed over (in progress) (both from date)
(Session 2 ENG-28b 2:29-2:50 PM ET; session 3 left no commit; session 4 ENG-28d 4:21-4:42 PM ET; session 5 ENG-28e 4:46-5:03 PM ET;
session 6 ENG-28f 5:35-5:47 PM ET; session 7 ENG-28g 5:54-6:05 PM ET. Sessions newest first.)

## EXACT NEXT STEP (session 9)
(PROVISIONAL, written mid-session) Branch t-eng-28-wip, code head 94cf0d86 (`git fetch origin t-eng-28-wip`, confirm). Rulings A, B, C
are BUILT and lineBot is 8/8 on frozen 94cf0d86. Running when this was written: tierBots and lockall --check on frozen 94cf0d86; the
trip count (ROAD_TRIPS) and the suite shards not yet started. If no later hand-over replaced this: run them on a frozen tree of the
code head (recipes in session 6's steps below; the suite in 6 shards of the CLAUDE.md glob, at most two at a time), the CI tool line
(gates.yml rolled, the `npx tsx --test tools/engine/library.test.ts ...` line), then land on a NEW branch t-eng-28 (no force).

## SESSION 8 DONE (frozen trees /home/user/wt28h1 for the probe, /home/user/wt28h2 at 94cf0d86 for every run)
- The lead's ruling A BUILT (tools/inspect/lineBot.test.ts floodRun): `high` = a grounded stand before the first close on a piece of the
  HIGH ROAD ONLY: highRoad's chain minus the fork's shared ends, W (chain[0], both roads climb it) and C (the chain's last piece: the low
  road climbs out of the walkway onto it, both roads end there), named 'the fork's shared ends' in the doc comment. The toy's chain is
  W, P, B, C, so `high` reads P and B (asserted: chain length >= 3).
- The lead's ruling B MEASURED and BUILT. Scratch probe (lineBot.diag.test.ts on frozen wt28h1, never committed: P's first grounded stand
  and the first close, by e.gameTime). The middle hops onto P at 6.933 s at EVERY late (18 aside, below); the close at 9.03 - (late - 18):
  | late | middle: close - first stand on P | the close | adult: close - on P (4.567 s) |
  | 19   | +1.100 s (high, setBack 0)       | 8.033 s   | +3.467 s                       |
  | 20   | +0.100 s (high, setBack 0)       | 7.033 s   | +2.467 s                       |
  | 21   | -0.900 s (on P after the close)  | 6.033 s   | +1.467 s                       |
  | 22   | -1.900 s                         | 5.033 s   | +0.467 s                       |
  Seeds 1/2/3 identical at every late, both tiers; every run ends shrine, home 3, setBack 0. The widest is late 19, +1.10 s (over the
  0.25 s floor, so no stop): 'too late' re-planted at late 19 at the same bar (6 runs: shrine, high, setBack 0, home 3), the derivation
  and the margins in its comment. The read-removed plant already runs at late 19, so the two now differ only by the read: GREEN with the
  read on (test 7), RED with it off (test 8, split >= 1). (Session 7's '0.07 s at late 19' was the late-20 reading: close 7.03.)
- The lead's ruling C WRITTEN in W2_FLOOD's comment (src/game/gen2/worlds/w2.ts): the model, not a measure (the middle lands 136 past
  W 150's face against the approved 86), the verdict and the bots agree on W 60 (all walk off) and W 150 (all board P), the verdict
  refuses 146 so it errs on the safe side; calibrating `land` against the tier bots is a later job (R-165.424). No number changed.
- lineBot 8/8 on frozen 94cf0d86 (every test re-ran; the four heron tests and the read-removed plant unmoved, GREEN as before).
  flood.test + floodLay.test 15/15 on the same tree.
- RUNS on frozen /home/user/wt28h2 at 94cf0d86 (the code head; every later commit touches only this folder):
  - tierBots 9/9 (6:10-6:15 PM ET), `git status` clean in the tree (no calibration file changed; firsttimer.ts unchanged anyway).
  - keep-the-road's trip count (scratch <scratchpad>/rt/roadtrips.ts, never committed: firstTimer seed 1, every tier child/middle/
    expert/adult, ROAD_TRIPS.n per stage; 6:15-6:16 PM ET): 2-1 0, 2-2 0, 2-3 0, 2-4 0, 2-5 0, 2-6 0, 2-7 0, 1-2 0; TOTAL 0. (Those
    runs' ends, named and not read further: 2-3 'sealed door' for all four tiers on seed 1, the child 'time' on 2-4/2-6/2-7, every other
    run 'shrine'; a fresh phone, seed 1, not the proven-seed runs.)
  - lockall `--layouts 16 --check reference/qa-reports/ENG-28/lock-base-90552d3ec.json` (6:10-6:22 PM ET): PASS, exit 0, 'lock: 102/102
    stages unchanged'; its unhashed note names the same 36 stages as session 5's ('gen2 gained verdicts and drops' against the base
    file: 1-1..1-9, 2-1, 2-2, 2-4, 2-5, 5-7, 5-9, 6-1..6-7, 6-9, 7-1, 7-3, 7-5, 7-6, 7-7, 7-9, 8-1, 8-2, 8-3, 8-5, 8-6, 8-8, 8-9).
  - The suite (the CLAUDE.md glob, 631 files) in 6 shards (`split -n l/6` of the sorted list): shard 0 589 pass, 0 fail (63 s).
  - Suite shards 1-5 and the CI tool line: running (see the hand-over).

## FOR THE LEAD: R-165.424's bot list (no bot change in this job)
1. The late-18 read at the boundary (re-measured this session on the passing shape, frozen wt28h1, seeds 1/2/3 identical): the MIDDLE
   reads LOW at late 18 and the close (9.03 s) splits the line: high false, setBack 3, first stand on P only at 18.53 s (after the
   close, the high road the only way on), end shrine, home 3. The adult also goes low and beats the close (setBack 0). At late 19 both
   read high. A bot-read fault at the boundary (the read sends him low about 1 s too late), not a toy or verdict fault.
2. Calibrating W2_FLOOD.climb.land against the tier bots (the middle's real landing 136 px past W 150's face, the adult's 66 on W 60,
   against the model's 86): the verdict's model is the stricter stand-in today; measure each tier's landing and pause on real wall-steps.
3. The brick's bot run: no bot drives floodLay.test's brick (lineBot drives only the toy); READY-28 runs the bots on 2-8's real draft
   (the lead accepted this).

## EXACT NEXT STEP (session 8, superseded by session 9's above)
Branch t-eng-28-wip, head 91c2ee16 + this hand-over commit (`git fetch origin t-eng-28-wip`, confirm). `npm ci --no-audit --no-fund --legacy-peer-deps`.
STOPPED on the lead's stop condition (a moved verdict): lineBot went 7/8 -> 5/8 on the new toy shape. Read your queue for the lead's
ruling on (A) and (B) below BEFORE changing any test. Then: lineBot 8/8 on a frozen tree; ROAD_TRIPS over 2-1..2-7 and 1-2 (scratch
recipe in session 6's step 2 below; must print 0 outside the flood toys, else STOP and tell the lead); tierBots 9/9 ONLY if firsttimer.ts
changed (it has not); lockall on a frozen tree (flood.ts, gen2/floodLay.ts and gen2/worlds/w2.ts are under src: RE-RUN, base lock per
session 6's step a); the suite in SHARDS (timeouts up to 7,200,000 ms); the CI tool line found by its content; land on a NEW branch
t-eng-28 (no force). The brick's bot run (the lead asked for one on each shape) is NOT done: name it to the lead if no bot drives the
brick's stage (floodLay.test lays it; lineBot drives only the toy).
(A) 'time enough' and the keep-the-road plant RED: a MEASURE artifact, not a road change. On W 150 + gap 60 the middle (seed 1, late 0)
    takes the LOW road as he should: lands on W at x 926 (W 790-940), the small-ledge pause, walks off its lip at x 955 into the gap,
    the bank strip (1006), the walkway (1070). His climb out of the walkway at its far wall (x 1381, t 11.07) lands on C (x 1566 y 740,
    t 11.87): C, the high road's LAST piece (solid 7, x 1340-1560), overhangs the walkway's exit by 60 px, and `high` counts any stand on
    the chain past W before the close. Options: (i) `high` skips the chain's last piece as it skips W (both roads end there: the far
    bank's rejoin); (ii) the toy's C starts at the walkway's end (W1). My advice: (i), the same reasoning the lead ruled for W.
(B) 'too late' at late 22 RED as before, now for the MIDDLE only: he DOES go high (hops from x 930, 10 px before W's lip, onto P at
    t 6.93, B at 7.93), but the close fires at 4.0 s, before his first stand on P, so his choice is unread (high false, setBack 0,
    home 3). The adult goes high in time (6/6). MEASURED on the new shape (scratch copies of lineBot.test.ts, frozen tree 91c2ee16; each
    line 3 seeds, identical): late 22: middle high false setBack 0, adult high true setBack 0. late 19: ALL 6 GREEN (high true, setBack
    0, home 3), but the middle's margin is 0.07 s (first stand on P at 6.93 s, the close at 7.0 s). late 18: middle reads LOW and the
    close splits the line (setBack 3, t 30.7); adult low, beats the close (setBack 0). So a re-plant at 19 passes on a 0.07 s margin and
    18 shows the read sending the middle low about 1 s too late. The lead's call: re-plant 'too late' at 19 (derivation in the comment)
    and put the late-18 read on R-165.424's bot list (no bot change in this job), or another late.
(C) The verdict's LAND number (86, physics, approved) is not the bots' real landing: the middle lands 136 px past W 150's face (a 0.94 s
    climb, landing steered back at vx -162), the adult 66 on W 60. The verdict and the bots AGREE on both shapes all the same: on W 60
    every bot walks off W (RED), on W 150 the middle stops at x 915 (25 px before the lip), and at late 22 hops onto P from 930 (GREEN).
    Named so the lead knows the model's landing is the stricter stand-in, not a measured landing.

## SESSION 7 DONE (frozen trees /home/user/wt28s7a-d, one per commit)
- The lead APPROVED (as Designer and Architect stand-in) the W2_FLOOD `climb` entry: land child 62, middle 86, expert 86, adult 86; pause
  0.25-0.5 s; runUp child 73, middle 61, expert 61, adult 22; width 44. Each source by file:line in w2.ts's comment (PHYS, the tier holds,
  the edgeAim medians; the traced adult 66 named as the nearer reading not taken, and why).
- src/game/flood.ts: FloodRow.climb (FloodClimb, FloodTier) and forkFaults(chain, span, climb), beside highRoadFaults: (1) a way down from
  W onto the low road (the gap after W at least his width), (2) each tier crosses that gap from its landing (room = W's width - land;
  short of its run-up he walks off and crosses no gap; else a full jump at the speed a stand start reaches, the air pushing him on to
  maxRun over JUMP_AIRTIME, must carry run-up + gap). gen2/floodLay.ts layFlood calls it on highRoad's chain (floodFaults has no tops,
  so the call sits where the chain is; the problems list carries both).
- Plants: flood.test.ts 'forkFaults: ...' RED on W 60 + gap 60 (all four tiers by name, walks off), RED on W 60 + gap 0 (no way down),
  GREEN on W 150 + gap 60, the edge (146 refuses the middle and the expert by name, 147 passes), a 120 px gap refused (reach). floodLay.test
  lays the brick to W 150 + gap 60 (the porch 'over' past the 280 px near bank by 60/280) and plants the old flush brick and the W 60 +
  gap 60 shape RED by name through layFlood. flood.test + floodLay.test 15/15 and tsc clean on frozen 91c2ee16.
- lineBot.test.ts' toy: W = FORK_W 150 (x 790-940), gap 60 to P unchanged. lineBot 5/8 on frozen 91c2ee16 (3.8 s): RED 'time enough',
  the keep-the-road plant, 'too late' (see (A), (B)). GREEN: the four heron tests and the read-removed plant.
- NOT DONE: lineBot 8/8, ROAD_TRIPS, lockall, the suite, the CI line, the landing on t-eng-28, the brick's bot run.
- Lessons applied: D115 (every run on a chattr-frozen worktree, src/game/gen2/proven writable; probes in the scratchpad, never committed),
  D119 (commit -m, no heredoc in a commit chain), D128 (times from date), D134 (pushed and ls-remote checked before the hand-over
  message), the lead's stop condition. LESSONS.md on this branch ends before D111 (D111-D134 known only as the brief restates them).

## EXACT NEXT STEP (session 7, superseded by session 8's above)
Branch t-eng-28-wip, head bb04993f3 or later (`git fetch origin t-eng-28-wip`, confirm). `npm ci --no-audit --no-fund --legacy-peer-deps`.
STATE: lineBot 7/8 on frozen bb04993f3. RED: 'too late' (late 22). The lead's narrow-A ruling is BUILT: `high` = a grounded stand
before the first close on a piece of the flood's own high-road chain past the wall-step W (flood.ts highRoad, no y threshold). Under
it, 'time enough' (low), the keep-the-road plant (off high / on low), the heron tests and the read-removed plant at late 19 are all GREEN.
tierBots 9/9 on frozen 6556b42ca, no calibration file changed. firsttimer.ts is unchanged since, so that result stands for bb04993f3.
THE LEAD'S FINAL RULING (word for word; this one governs, and (a) below is RETRACTED): "you are right, and I RETRACT (a). The
reference is the DESIGN (R-165.430: a wall-step W on the bank that both roads climb; the low road walks off W down into the gap; the high
road hops the level gap onto the porch P), not floodLay.test's brick, which has no low road. RULING: keep the toy's fork shape.
floodFaults' new verdict covers both halves, by name: (1) a fork must have a way down from W onto the low road (a gap he falls through:
at least his width); (2) the gap after W must be crossable by each tier's own modelled play from its landing on W (its small-ledge pause
included). Planted: RED on the current toy numbers (W 60 + gap 60: the first-timer adult falls short) and RED on the brick (no way
down); GREEN on a shape that passes both, whose numbers the verdict itself finds (e.g. a wider W). Then the toy and the brick both lay
that passing shape, proven by a bot run on each, and 'too late' and the plant are re-read on it (a re-plant at the same bar if a late
moves, derivation in the comment). No bot change."
SESSION 7 DOES, in order: (i) the verdict in src/game/flood.ts beside highRoadFaults (floodFaults calls it), each tier's modelled play
read from the bots' own models (the way pacerFaults judges the race: find how pacerFaults reads a tier's model, and use the same
source). Planted toys in src/game/flood.test.ts / gen2/floodLay.test.ts: RED on W 60 + gap 60 (the adult falls short), RED on the
brick (no way down), GREEN on the passing shape the verdict finds. (ii) lineBot's toy and floodLay.test's brick lay that shape. A bot
run on each: lineBot 8/8, and 'too late' and the plant re-read (a re-plant at the same bar if a late moves). (iii) ROAD_TRIPS, the suite
in shards, the CI line, lockall (flood.ts is under src: RE-RUN it on a frozen tree), land on t-eng-28 by the 8:00 PM hard stop.
tierBots re-runs only if firsttimer.ts changes, and it must not ('No bot change').
POINTER for (i), read this session: pacerFaults (src/game/pacer.ts:119) judges only numbers that gen2/pacerLay.ts computes, and pacerLay
reads each tier's play from the DESIGN TABLE (the PacerRow in gen2/worlds/w2.ts: `rate.middle`, crossingBank, margin), not from the bots
(src/ cannot import tools/inspect). The flood verdict has no such tier numbers yet: a landing offset on a wall-step's top, the small-ledge
pause, the restart speed off it, the run-up. Those are DESIGNER numbers in W2_FLOOD, and Engine never changes a game number (ENGINE.md
'You never'). So ask the lead FIRST where they come from: a Designer entry in W2_FLOOD (cited), or derived from the engine's own physics
(Pokey's run from a stand over a W's width) plus the traced landing (6 px past the lip) and pause (0.25-0.5 s, firsttimer.ts:3083).
Do not invent them.

THE LEAD'S EARLIER RULING (retracted in its part (a); kept for the record; sent BEFORE it read my no-low-road finding below): "BOTH, as you advise. (a) The toy matches
the brick: W at the water's edge, P touching W (gap 0), as floodLay.test's brick lays on all 8 rolls; then re-read 'too late' and the
plant at the brick's shape (a re-plant at the same bar if its late moves, derivation in the comment). (b) floodFaults gains a named
verdict: after a wall-step, a gap to the next high-road piece is refused unless each tier's own modelled play (its landing on the step,
its small-ledge pause, its run-up) carries the hop across it; planted RED on the old toy shape (W 60 + gap 60, the first-timer adult
falls short), GREEN on the brick. NO bot change in this job: the pause-then-walk-off at a small ledge before a level gap goes on
R-165.424's bot-tuning list (I am noting it there). Then lineBot 8/8, ROAD_TRIPS, the suite in shards, the CI line, land on t-eng-28 by
the 8:00 PM hard stop."
SESSION 7, FIRST: (a) conflicts with my last finding (the brick's porch is flush against W, so the brick has NO way down onto the low road;
the toy's gap IS its low road's entry). Read your queue for the lead's answer to that before building (a). Do NOT build (a) as worded
without that answer, because a gap-0 toy has no low road, and 'time enough', the keep-the-road plant and the read-removed plant all
need one. (b) and 'no bot change' stand as ruled.
The lead's earlier order (1)(2), answered read-only this session: (1) floodLay lays no W or P itself. The brick: W 60 wide, flush at
the water's edge, gap 0. The rule: FLOOD_STEP 60, FLOOD_HOP 60 the widest gap; NO rule ties W's width to the gap. (2) Why no
edge-press probe ran on W after the pause: the pause ends at firsttimer.ts:3093, and its own flick-on hops only when NO floor stands 80
px ahead (`!this.floorAt(p.x + dir * 80, p.y, 40)`). P stands 47-80 px ahead, so no hop. Then neither the edge press's floor-ahead read
(a probe right after `const ahead`) nor its `!ahead` branch ran for that run on W: an earlier branch of the frame's decision moves him
off the lip at 87 px/s. That branch is NOT yet named (next probe: log each `return` of the decision between :3100 and the edge press for
__TR runs). That is a bot read for R-165.424's list, per the lead; no bot change in this job.

THE LEAD'S ORDER (word for word): "finish the adult late-19 read-on trace (jump or walk at W's lip, vx at the lip, where he leaves).
Then (2) FIRST, as you advise: compare the toy's W and the P gap with what floodLay actually lays (W's width, the run-up to the P gap, the
gap). If the toy is narrower than the lay, the toy is wrong: make it match the lay (that is no loosening; the toy must be the real shape).
If the lay's W is the same 60 px, do NOT fix the bot to cover it: bring me the trace. My leaning then is the LAY: a high road the adult
cannot board from a standing climb is a stage shape fault, and floodFaults should refuse a W whose run-up is too short for the slowest
tier to clear the gap to P (named verdict, planted RED/GREEN), unless the trace shows a bot fault a player would not make."
DONE: the trace (below: he WALKS off W's lip at 87 px/s after the small-ledge pause, from x 955; he lands on W at x 946, 6 px past its
lip). COMPARED (session 6): gen2/floodLay.ts lays NO high road itself: the stage data lays the pieces, and it only judges them
(highRoadFaults, FLOOD_STEP 60 up, FLOOD_HOP 60 the widest gap, gap 'a step's tread at most'). The toy's shape (W 60 px wide, set
back 60 px from the edge, a 60 px gap, P level) PASSES that rule: every floodRun asserts highRoad's faults empty (bb04993f3) and none
failed. floodLay.test.ts' brick lays a different legal shape: 'stand' w 60, h FLOOD_STEP, its far side at the water's edge, the porch
'over' the near bank at dy -FLOOD_STEP. MEASURED (a scratch copy of floodLay.test.ts' build() on the frozen scratch tree, 4 rolls x 2
settings; the home leg runs right to left, near bank on the right): W is 60 px wide, 60 up, h 60, its water side AT the water's edge
(normal 1: W 17315-17375, the low road x0 16517 x1 17315); the porch is 880 px, 60 up, from 16435 to 17315: it TOUCHES W (gap 0) on all 8
rolls. THE TOY DIFFERS: its W is set back 60 px from the edge with a 60 px gap to P, which the brick never lays. Both shapes pass the rule
(FLOOD_HOP 60). So both branches of the lead's order apply, and it is the lead's call. (a) Make the toy match the brick: W at the
water's edge, P touching it. The toy then tests the shape the lay makes, and the adult walks straight on, with no pause problem. (b) The
lead's leaning, a LAY verdict: floodFaults refuses a wall-step whose run-up cannot carry the slowest tier across the gap to the next
piece (named, planted RED/GREEN). The number comes from the trace (the adult lands 6 px past a 60 px W's lip, then the small-ledge pause),
for example 'no gap after a wall-step under N px wide'. Or (a) and (b) together. Take the ruling before building.
BUT (a reading, not run by any bot): a 'branch' piece is a SOLID platform 24 px thick (gen2 w6Harness/brickSlots: type 'solid'), not a
drop-through. On the brick, W fills the near bank's end and the porch is flush against W at the same height, so from the near side there
is NO way down into the river: climbing W puts him on the porch. The brick's 'fork' has no low road. The toy's 60 px gap is exactly the
low road's way down (off W, 60 down to the bank strip, then onto the walkway), so (a) as worded would delete the toy's low road and
every low-road test with it. My advice to the lead: keep the toy's shape (the true fork shape). Make it (b): one lay verdict that a
fork needs both a way down onto the low road AND, after the wall-step, a gap the slowest tier can cross from a standing climb. The
brick then lays it (W wide enough for the run-up, or the gap where W's top is long). Prove it with a bot run on the brick before ruling.
'too late' cannot go GREEN at 22 (nobody has taken a road by the close) and the ruling's option B (an earlier late) is blocked at 19 by
the ADULT's miss of P. The options as I first put them (superseded by the lead's order above):
  (1) TOY: widen W in floodRun (and the plant) so his climb jump lands with run-up before W's lip. FIRST, check the real lay's W width
      (gen2/floodLay.ts and floodLay.test.ts' brick; flood.ts:101 'its FIRST piece is a WALL-STEP'). The toy must match the lay. If the
      lay can also give a W under 220 px with a 60 px gap to P, it is a 2-8 READY finding: the first-timer adult misses P there too.
  (2) BOT: the small-ledge pause (firsttimer.ts:3083, a ledge under 220 px gets 0.25-0.5 s of stop) not on a wall-step whose next piece
      is level across a gap. Then tierBots 9/9 and ROAD_TRIPS re-run on the new head, and the calibration check per BOTS.md.
  Then 'too late' at the late the lead rules (a re-plant at the same bar, derivation in the comment), all 8 lineBot tests re-run, and no
  other verdict may move.
1. On the lead's ruling, do it, then re-run lineBot on a frozen tree: 8/8. Prove the plant both ways at its late: RED with the read
   removed (as written) and GREEN with the read on (setBack 0 for all 6 runs). Use a scratch copy in a separate frozen worktree, never
   committed, the way session 6 did (/home/user/wt28r, lineBot.diag.test.ts).
2. ROAD_TRIPS over the World 2 river stages: NOT RUN (held to save usage until firsttimer.ts is final). Scratch script:
   <scratchpad>/roadtrips.ts (stages 2-1,2-2,2-4,2-5 are listed; it builds each and skips stages without rivers). Copy it, point its
   imports at the frozen tree, run `npx tsx roadtrips.ts 2-1,2-2,2-3,2-4,2-5,2-6,2-7 1-2` with run_in_background and a fitting timeout.
   Must print 0. Not 0: STOP and tell the lead the stage and count.
3. tierBots: re-run only if firsttimer.ts changes.
4. lockall: every commit after 8cd71852d touches only tools/inspect/firsttimer.ts, tools/inspect/lineBot.test.ts and this folder
   (`git diff --stat 8cd71852d..HEAD`), so session 5's PASS stands. If the fix touches src/ (a lay change), re-run it on a frozen tree.
5. The SUITE in SHARDS on a frozen tree of the final head, each shard with run_in_background and timeout 7200000, at most two heavy
   runs at a time. Then the CI tool line (gates.yml 'rolled', found by its content).
6. Land: `git branch t-eng-28 <head>`, push (no force), `git ls-remote` equal; message the lead (no clock times) as the brief says.

## Session 6 (ENG-28f): the re-plant built; 'too late' moved; stopped and told the lead (twice)
- 6556b42ca: FloodRun.high set only before the first close (a `shut` flag in the floodClosed wrapper, the meaning in its doc comment);
  the read-removed plant at late 19 with its derivation. lineBot 7/8 frozen: the plant GREEN, but 'too late' RED: middle seed 1
  {end shrine, setBack 0, home 3, high false, t 19.5}. That is another verdict moving, so I STOPPED and told the lead.
- The lead ruled narrow A: high-road-only pieces from the flood's chain, W excluded, no y threshold. If any late-22 run is not on P by the
  close, option B (an earlier late, a re-plant at the same bar). BUILT in bb04993f3. lineBot 7/8 frozen: 'too late' still RED.
- MEASURED (scratch copy, frozen /home/user/wt28r; p.y is his feet: bank 800, P/W tops 740, walkway 860). The close fires at t 5.03 at
  late 22 and t 8.03 at late 19. Seeds 1/2/3 are IDENTICAL in this toy (each line below = 3 runs).
  The six late-22 positions at the close (read on):
    middle x 836 y 800: on the near bank, 44 px short of W; setBack 0, home 3; first stand on B at t 9.57.
    adult x 1098 y 860: on the low road's walkway; setBack 0 (the line is still on the bank); drowned and respawned; first B at 8.83.
  Late 19, read ON: middle on P (x 1081 y 740), setBack 0 (GREEN under narrow A). Adult on the walkway (x 1122 y 860), setBack 3: the
    line followed him out. So the plant's 'GREEN with the read on' FAILS for the adult at 19.
  Late 19, read OFF: middle on the walkway (x 1301), setBack 3. Adult already on the far bank (x 1990), setBack 2. The plant: split.
  Late 0, read on: no close inside the run; high false; setBack 0 (as 'time enough').
- THE ADULT'S MISS, traced frame by frame (late 19, read on, seed 1). He stops at W's face (x 861, 0.4 s) and jumps up it (vy -577).
  He lands on W's top at x 946, t 3.93, by his trailing edge: W is x 880-940 and Pokey is 44 px wide. firsttimer.ts:3083's small-ledge
  pause (a ledge under 220 px: stop a beat) drops him from 268 to 41 px/s. Walking on at 87 px/s he topples off W's lip into the 60 px
  gap (x 955, t 4.07). He lands on the bank strip (x 1003, y 800) and runs off onto the walkway (x 1077, t 4.53). Under P (120 px up,
  out of reach) he paces x 1098-1122 until the close drowns him (t 8.03). NOT keep-the-road: on the round road `otherRoad` is the
  walkway only (firsttimer.ts:2484), and an edge-press probe after `drops` printed nothing for this run, so that branch never ran on W.
- tierBots 9/9 on frozen 6556b42ca (226.7 s); `git status` in the frozen tree empty: no calibration change.
- NOT DONE: ROAD_TRIPS count (held, item 2), the suite, the CI tool line, the landing (t-eng-28 not created: the head is not final).
- Lessons applied: D115 (every run on a chattr-frozen worktree: wt28f, wt28r and wt28g; edits only in the main tree; the scratch probes
  never committed), D119 (commit -m, no heredoc in a commit chain), D128 (times from `date`), D59 (no run left going at the hand-over),
  the lead's stop condition (a moved verdict stopped the work). LESSONS.md on this branch ends before D111: D111-D132 are known only as
  the brief restates them.

## EXACT NEXT STEP (session 6, superseded by session 7's above)
Branch t-eng-28-wip, head b0bc6d79e or later (`git fetch origin t-eng-28-wip`, confirm). `npm ci --no-audit --no-fund --legacy-peer-deps`.
1. lineBot 7/8 GREEN; RED: 'planted: with the read removed ... the close splits the line'. Every read-removed late-22 run now goes round
   high with setBack 0 (middle t 23.6, adult t 26): with LINE_SKILL.leadLine off he keeps the way's own road (the low road), so the new
   STEP-OFF stops him at W's lip first, and the close (2.93 s left at the fork read, x 581-585) falls while the line is still on the bank
   and W: nobody is out on the low road to be cut off. MEASURED this session (frame trace, middle seed 1, leadLine off, late 22): he is
   at x 836 on the near bank at the close (5.03 s), the three behind him at x 745/711/677: all on the bank, before W. At late 19 (the read
   would still send him round: about 5.9 s left at the read against 6.44 s needed) the close DOES split the line in all 6 runs (setBack 3
   middle, 2 adult) but every run still reads `high: true`, because floodRun's `high` is set by ANY grounded stand on the high road,
   including after the close, when the high road is the only way on. So the plant fails on its criterion, not its event.
   THE LEAD'S RULING, word for word: "both APPROVED as a re-plant at the SAME bar (R-165.432), not a loosening: the bar stays 'with the
   read removed, the close splits the line'. (i) late 22 -> 19, with the derivation in the comment (the step-off moved when he reaches the
   bank; 5.9 s left vs 6.44 s needed). (ii) `high` = the road taken AT THE FORK (set only before the first close), because a stand on the
   high road after the close is the only way on and says nothing about his choice; write that meaning in the field's doc comment.
   Conditions: every test that reads `high` re-runs, and NO other verdict changes (if one does, stop and tell me); the plant RED with the
   read removed and GREEN with it at late 19."
   DO: in lineBot.test.ts floodRun set `high` only while no close has fired (a `closed` flag set in the floodClosed wrapper) and give the
   FloodRun interface's `high` that doc comment; the plant's late 22 -> 19 with the derivation. Re-run ALL of lineBot (every test reading
   `high`: 'time enough', the keep-the-road plant, 'too late', the read-removed plant): 8/8, and no other verdict moved (compare with
   session 5's: 'time enough' 6/6 low, keep-the-road off high / on low, 'too late' 6/6 high, setBack 0, home 3). Then prove the plant both
   ways at late 19: RED with the read removed (the test as written: split >= 1) and GREEN with the read on (the same 6 runs with
   leadLine true: setBack 0; run it once by hand, a scratch copy or an env switch removed after, and give the numbers in the report).
2. Condition 2 (the lead): ROAD_TRIPS 0 on every listed stage. The rule can only trip after a fork read, and the only read is the flood's
   (needs engine floodClock, set only on a stage with a flood; no listed stage has one). Count it, do not argue it: run the bots over the
   World 2 river stages (tools/inspect/castBots.ts, read its usage line) with ROAD_TRIPS.n printed at the end; must be 0. Not 0 anywhere:
   STOP and tell the lead the stage and count.
3. Condition 3: `npx tsx --test tools/inspect/tierBots.test.ts` (about 4 min): 9/9, and `git status` shows no calibration file changed.
4. lockall PASSED this session on a frozen worktree at 8cd71852d. Every commit after it touches only tools/inspect/firsttimer.ts,
   tools/inspect/lineBot.test.ts and this folder (`git diff --stat 8cd71852d..HEAD` proves it), which lockall does not read, so it stands
   for the final head unless that diff grows past those files (then re-run it on a frozen tree). The SUITE did NOT finish (UNRUN, below):
   run it once on a frozen tree of the final head, run_in_background, timeout 7200000.
5. The CI tool line on the final head (gates.yml 'rolled', the `npx tsx --test tools/engine/library.test.ts ...` line, 39 files,
   lineBot among them) once lineBot is 8/8; tsc; knowncheck/roadmapcheck if any list moved.
6. Land: `git branch t-eng-28 <head>`, push (no force), `git ls-remote` equal. Message the lead (no clock times): the hash, and what 2-8's
   READY can measure: yield, drawcheck on the draft, stills both ways, the flood's verdicts by name (floodFaults; highRoadFaults incl. the
   two bare-edge-hop refusals), met order (lastMet), the cast bots' road at the fork (keep-the-road: low with time, round when late).

## Session 5 (ENG-28e): (a) and (c) GREEN, (b) pushed back and re-ruled, keep-the-road built
- (a) FIXED, 'too late' 6/6 GREEN. Read from a frame trace: the adult missed the porch on his first try, drowned on the walkway at the
  close and respawned at the REAL 2-3's spawn (the toy never set its own), 217 px over the toy's floor; the line was regrouped in the air
  there and its trail held at "a drop they do not take" (follow.ts record) for good: 'stranded' at the sealed exit, home 0, run.stuck
  naming the sealed shrine. The engine's regroup is right for every real stage (spawns and flags stand on their floor). The toy now sets
  spawnX/Y, checkpoints [] and the engine checkpoint on its own floor (lineBot.test.ts floodRun).
- (b) PUSHBACK (PUSHBACK.md, with the proof): no toy shape met 'walk off the wall-step is the low road' with no bot change. THE LEAD
  ACCEPTED and ruled option A as a general rule (recorded in PUSHBACK.md): once the bot has read its road at a fork, the edge press does
  not take a piece of the OTHER road; no read, no change. BUILT (firsttimer.ts LINE_SKILL.keepRoad, ROAD_TRIPS): at the read the other
  road's pieces are set aside (the high road's chain when he keeps the low road, the walkway pieces when the read sends him round); the
  edge press neither reads one as his floor ahead nor jumps onto one across; never the piece he stands on (without that the adult, fallen
  onto the walkway after a reroute, read his own floor as gone: stranded; fixed). FINDING: no jump was involved at all: Pokey is 44 px
  wide, so a 60 px level gap is about 16 px of air at a run and he walked onto the porch (y 740 from x 934 to 1007). Hence the STEP-OFF:
  dropping with the other road's ledge in reach, he slows under 30 px/s first, then walks off and falls short of it. Toys: 'time enough'
  6/6 LOW GREEN; planted keep-the-road off: middle seed 1 goes HIGH and ROAD_TRIPS does not move, on: LOW and it trips (GREEN/RED).
- (c) FIXED, floodLay.test.ts 2/2 GREEN: the toy brick lays a WALL-STEP (a block FLOOD_STEP tall on the near bank's end, its far side at
  the water) and the porch level off its top; the rule unchanged (law 22).
- Every FLOODDBG trace removed (firsttimer.ts floodRoad, lineBot.test.ts floodRun); `grep -rn FLOODDBG src tools` empty. tsc clean.
- lockall vs lock-base-90552d3ec.json on frozen /home/user/wt28 at 8cd71852d: PASSED, exit 0, 'lock: 102/102 stages unchanged' (its note,
  not hashed: 36 stages' gen2 'gained verdicts and drops' against the base file; reported as lockall prints it, not read further). Started 4:54, finished 5:04 PM ET. Every later commit touches only firsttimer.ts, lineBot.test.ts
  and this folder (`git diff --stat 8cd71852d..HEAD`), which lockall does not read: it stands for the final head.
- Suite (the CLAUDE.md unit line) on the same frozen tree: UNRUN. It hit my own 2300 s timeout and was killed (exit 124, 5:33 PM ET), 0
  failures in the part that ran. My timeout was too short for this suite run whole (CI shards it). Session 6: run it once on a frozen
  tree of the final head with run_in_background and a timeout of 7200000 and no inner `timeout` under 6000 s.
- CI tool line, tierBots, ROAD_TRIPS count: NOT RUN (next step).
- Lessons applied: D75 (proved in the real engine: the toy showed the walk-across no pure reading could), D59 (both gates waited for, not
  left running), D115 (frozen worktree, proven writable), D119 (commit -m, no heredoc), D120 (pushback sent, the work went on; the
  reply came mid-task and was built), D128 (times from date), law 22 (the lay toy fixed, not the rule; the plant's timing goes to the lead).
  Method: check a rule's EFFECT, not its firing: ROAD_TRIPS counted trips while the bot still went high; the trace showed why.

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
