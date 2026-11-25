# BUILD-28 REPORT (W2-LANE: 2-8 "Before the Water Rises"; R-165.430 (2), READY-28, BUILD-28). Session 1 (W2-LANE a), started 9:44 AM ET (from date)

## EXACT NEXT STEP (session 1)
Branch t-build-28-wip, head = this REPORT's commit; CODE head 1530aa374 (later commits touch only reference/qa-reports/BUILD-28/).
`git fetch origin t-build-28-wip && git checkout t-build-28-wip`, `npm ci --no-audit --no-fund --legacy-peer-deps`. Read the lead's
answers first (ReadNotifications): two rulings were asked (below, "For the lead" 1 and 3).
STEP 1 IS DONE BUT ITS BOT RUN (the section data and its verdict proof are green; the bot run on it is not done). Next, in order:
1. THE BOT RUN ON THE SECTION (step 1's last part). No bot drives a gen2-laid toy (castBots and FirstTimerRun take a stage id; floodLay.test's
   brick has no bot, ENG-28 REPORT "R-165.424's bot list" 3). Do it as a scratch probe first (never commit a probe), then as a test if the
   lead wants it kept: copy tools/inspect/lineBot.test.ts floodRun (:151-227) and feed `run.sim.bare([...])` (:165) the BUILT section's
   high road instead of the hand toy's solids 4-7: build the toy with w2TwoRoad as w2TwoRoad.test.ts does (seed 1, both settings), take
   W, porch, rise, top, porch2 from `roads(st).tops` (positions relative to the near bank's water edge; the home leg runs LEFT, so mirror:
   d = from.x - x), and lay them right of the toy's W0 the same way (W's far side at W0, the gap over the water, then porch/rise/top/porch2).
   Keep floodRun's low road (its walkway, solid 2) unless the lead rules 3 otherwise. Run the 4 tiers x seeds 1-3 at late 0 (low road)
   and late 19 (high road): every run end 'shrine', home 3; at late 19 high = true and setBack 0. Read the real landings on W 150 against
   W2_FLOOD.climb.land (86) and the climb onto `rise` and `top` (each a 60 px wall-step standing on the porch). Report each tier's line.
2. Then READY-28 (step 2) ONLY on the base the lead rules (For the lead 1): until a head holds BOTH 2-3's cages/followers and the flood,
   there is no 2-8 draft to measure, and the draft is not built inside this job (LANES rule 2).
Every run on a chattr-frozen worktree (`git worktree add --detach <dir> <hash>`, `ln -s <repo>/node_modules <dir>/node_modules`,
`chattr -R +i <dir>/src <dir>/tools`, `chattr -R -i <dir>/src/game/gen2/proven`). Session 1's frozen tree: /home/user/wtw2a at 1530aa374.
REPORT BY 12:30 PM ET (step 1 done and READY-28's numbers); HARD STOP for steps 1-2: 2:30 PM ET.

## SESSION 1 DONE (code head 1530aa374; every check on frozen /home/user/wtw2a at 1530aa374)
- **The TWO-ROAD section, World 2 kit data** (src/game/gen2/worlds/w2.ts): `W2_FORK` (the numbers), `W2_FORK_RIVERS` (the low road's
  row 'low': W2_RIVERS.ride's numbers, safe, marked `flood: 'close'`), `w2TwoRoad(id, job, f?)` (the SectionTemplate). The lead's
  ruled shape, in the order he meets it: `near` bank 420 px (the line bunched, 7 x 34 = 238 px, and W on its end); `wall` W 150 x 60, a
  block standing on the near bank's end, its far side at the water's edge (both roads climb it); the GAP 60 px over the water's first
  px (the low road walks off W into it; the high road hops it level); `porch` P 500 px, a branch level with W's top over the water;
  `rise` 300 x 60, a block standing on the porch at its far end; `top` 140 x 60, a block standing on the rise (at 0.5); `porch2` 400 px,
  level with P, touching P's end, out 162 px over the far bank; `far` bank 320. Three up (W, rise, top) and three down (top to rise,
  rise to porch2, porch2 to the far bank), each 60 px: the design's "three carved steps up ... three down" (2-8.md:9).
- **Built and measured** (scratch probe on seed 1, home leg running left; px above the lip): Normal lip 1518, water 16517-17315 (798);
  chain W 17315+150 @60, P 16755+500 @60, porch2 16355+400 @60; rise 16755+300 @120, top 16835+140 @180 (both standing on the porch,
  inside the water's span). Easy lip 1503, the same shape at 16864-17662.
- **Proof** (src/game/gen2/worlds/w2TwoRoad.test.ts, new; in the suite's glob): GREEN on seeds 1-4, Normal and Easy: gen2 errors [],
  layFlood problems [] (floodFaults, highRoad, forkFaults all empty), forkFaults(chain) [], chain length >= 3 (W, P, porch2: what
  lead-the-line reads minus its shared ends), W 150 one step up, P level with W, one rise and one top standing on the porch over the
  water, the high road ending over the far bank. RED by name: W 60 ('the adult lands 86 px past its face ... walks off into the 60 px
  gap'), gap 0 ('no way down onto the low road: the gap after it is 0 px').
- **Checks on frozen 1530aa374:** `npx tsc --noEmit -p .` exit 0; `npx tsx --test w2TwoRoad.test.ts floodLay.test.ts flood.test.ts
  w2.test.ts` 25 tests, 25 pass, 0 fail; `npx tsx tools/engine/generalitycheck.ts` PASS (26 literals, 26 known). Not run (no reason to
  yet: nothing listed moved, no stage laid): the suite, drawcheck, castBots. No listed stage uses the section, so the lock cannot move.
- **Not done:** step 1's bot run (EXACT NEXT STEP 1); step 2 (no draft head: For the lead 1); step 3 (waits for the GO).

## FOR THE LEAD (asked in a message; a question never ends a box)
1. **The base (a missing piece, LANES rule 2).** t-eng-28 fda48b3d8 has the flood (flood.ts, floodLay.ts) and no 2-3 or 2-7 (stageTable
   World 2 rows 2-1, 2-2, 2-4, 2-5; no w2Arc23.ts / w2Arc27.ts). origin/release-0.10.3 dfe631913 (INT-R5's merge) has 2-3, 2-6's arc and
   2-7, and no flood.ts / floodLay.ts. ENG-28 REPORT:461 'this job merges THAT candidate in once its hash comes': never done. 2-8's draft
   needs one head with both (2-3's designed cages and followers, the flood). Who merges release-0.10.3 into t-eng-28?
2. **ENGINE-WORTHY (flood.ts:166-206 highRoad).** The walk takes, from where he stands, the piece reaching FARTHEST among those starting
   within a hop (:196 `beyond(farOf(p), farOf(next)) > 0`) and jumps to its far end, so a block standing ON a porch (the ruled 'every
   further rise a block standing on the porch') is never met: on this section the chain is W, P, porch2, and rise/top are unjudged.
   A rise that floated over the porch (a bare edge hop up) would pass the verdict. w2TwoRoad.test holds the built rises on the porch's
   top by data, not by the verdict. Fix for every stage: the walk meets any piece standing on its current piece's top between here and
   its far end (a Lane 2 piece, with a plant: a floating rise RED by name).
3. **The low road's shape: gen2 lays a LOG RIVER, the bot toy measured a WALKWAY.** In gen2 (this section and floodLay.test's brick) the
   low road is a river ('ride': three logs at 70 px/s, safe): walking off W he falls into the water and rides a log, or splashes back to
   the near bank; the line paddles. lineBot.test.ts floodRun (:165, :180) measured lead-the-line, its late-19 margin and the trip count on a
   WALKWAY 60 px under the banks (solid 2) with W standing 60 px BACK from the water (the gap over the bank's last 60 px). 2-8.md:9 says
   "LOW 1,400 px of marsh path with four 100 px dips". Rule which low road 2-8 lays: (a) World 2's log river, as gen2 lays it today (the
   bot's read is then re-measured on logs at READY-28), or (b) a marsh walkway the water closes (a new gen2 piece: Lane 2, before BUILD-28).

## Lessons applied (session 1)
D115 (every check on a chattr-frozen worktree of the commit), D119 (no heredoc in a commit chain: commits are single -m lines), D128
(every stamp from date), D134 (pushed and ls-remote equal before the hand-over message), D125/D131 (READY's yield and drawcheck come first
on the draft: named, not started, the draft has no head), LANES rule 2 (the missing base came to the lead, not built inside the job).
