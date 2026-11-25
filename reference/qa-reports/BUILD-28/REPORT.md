# BUILD-28 REPORT (W2-LANE: 2-8 "Before the Water Rises"; R-165.430 (2), READY-28, BUILD-28). Session 1 (W2-LANE a), started 9:44 AM ET (from date)

## EXACT NEXT STEP (session 1)
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
