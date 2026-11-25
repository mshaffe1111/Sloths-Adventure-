# BUILD-28 REPORT (W2-LANE: 2-8 "Before the Water Rises"; R-165.430 (2), READY-28, BUILD-28). Session 1 (W2-LANE a), started 9:44 AM ET (from date)

## EXACT NEXT STEP (session 1)
Branch t-build-28-wip, head = this REPORT's commit; CODE head e1d8d74c5 (later commits touch only reference/qa-reports/BUILD-28/).
`git fetch origin t-build-28-wip && git checkout t-build-28-wip`, `npm ci --no-audit --no-fund --legacy-peer-deps`. Run ReadNotifications
first: the lead may have ruled For the lead 2-4 (below) or sent release-0.10.3's hash.
STEP 1 IS DONE (the section, its verdict proof and its bot run on every tier and both settings). Next, in order:
1. IF the lead sent release-0.10.3's hash (its ruling, received in session 1): step 1b, merge origin/release-0.10.3 AT THAT HASH into
   t-build-28-wip (no force); name every conflict; in tools/inspect/firsttimer.ts keep BOTH intents (ENG-PLANT's c25: the judged run-up
   with the thumb travel, the sinker-only refusal, the narrow ride, the landing pull-back, the padRead stop; AND ENG-28's keep-the-road,
   step-off, lead-the-line); then tsc, the CI tool line (gates.yml 'rolled'), lineBot 8/8, flood + floodLay + w2TwoRoad, ENG-PLANT's 10
   known flips (its REPORT) as a spot check. Then READY-28 (step 2) on that head: the 2-8 DRAFT is a stage row + arc kit that lays this
   section at the fork (that draft is the build's first lay, not a missing piece: confirm with the lead before laying it).
   IF NOT YET: do not merge (ENG-PLANT's fix is still merging into release). Use the time on what needs no base: (a) the bot probe on
   seeds 2-3 for every tier (session 1 ran seed 1 on the final shape: the bots were seed-identical on every earlier shape), (b) the
   probe with the LOW road as gen2 lays it (a log river, not floodRun's walkway: For the lead 3), if the lead has not ruled it.
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
  setBack 0 in all 18. (*'high' is read only before the close: the child reaches the fork after it at late 19.) The middle and the expert
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

## Lessons applied (session 1)
D115 (every check on a chattr-frozen worktree of the commit; the probes in a folder outside src/tools, never committed), D119 (no heredoc
in a commit chain), D128 (every stamp from date), D134 (pushed and ls-remote equal before each message), D125/D131 (READY's yield and
drawcheck come first on the draft: named, not started: no draft head), LANES rule 2 (the missing base went to the lead), level.md rule 21
(the bots proven on the piece before a level lays it: the probe found two strands the verdict passed) and 28 (each miss traced: the path).

## Checks on e1d8d74c5
Frozen /home/user/wtw2b at e1d8d74c5: `npx tsc --noEmit -p .` exit 0; w2TwoRoad + floodLay + flood + w2.test 25 tests, 25 pass, 0 fail; generalitycheck PASS.
