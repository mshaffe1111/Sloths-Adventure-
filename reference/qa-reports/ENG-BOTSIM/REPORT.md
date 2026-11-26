# ENG-BOTSIM: can the bots ask the GAME how a press flies? (R-165.462, spike; branch t-eng-botsim from c73cb9766)

## THE ANSWER (FINAL, session 3, written 1:55 PM ET): YES-LATER. Decide yes now; start after release 5; land after 3-1 / 3-2's proof
**In plain words.** Asking the GAME how a press flies works and is safe: the answer is exact, it never leaks into the run, and it now costs
3.5 ms. But the test kid did not get better by moving one judge onto it; kid Normal on 2-4 got WORSE (water lives 61 -> 88). That is not the
game's answer being wrong: an exact answer lets the bot press on the very FIRST frame a jump would work, the edge of a moving window, and a
kid's thumb is a little early or late, so presses drawn early come down short (all 25 planned-press deaths at band 1 were drawn OUTSIDE the
judged band; none inside). The old copy's own errors happened to leave a margin. WHEN a kid presses inside a window is a number to fit to
the testers, not physics. And the judges still on the old copy (hop flight, the landing stop, lianaWait) cost 63 lives on their own:
moving one judge only moves where the others fail. So it is all the judges at once, plus the press-timing fit, plus one re-baseline of
every stage's bot rows: about 31-37 hours of one engine lane, too big for this week and wrong to start before release 5.

**(a) The numbers, three sessions (2-4, seeds 1-40, both settings, --par 4 on 4 cores):**
| run | kid Normal | kid Easy | adult N / E | wall / CPU (160 runs) | a probe |
|---|---|---|---|---|---|
| old judge (model physics) | 40/40, 61 lives | 33/40 (7 rescued) | 40/40 38 lives / 40/40 | 62.3 s / 230 s | - |
| s1: one judge on the probe | 40/40, 78 | 39/40 | 40/40 37 / 40/40 | 117.6 s / 447 s (1.9x) | 9.6 ms (45 fr) |
| s1: probes, answers thrown away | 0 of 160 rows moved: the probe is invisible | | | 227 s / 863 s | |
| s2: + run-up press, thumb, death fixes, band +- sd/2 | 37/40, 105 | 39/40 | - | 80 kid runs 70-72 s / 258-264 s | 7.6 ms (17 fr) |
| s2: band +- 1 sd | 38/40, 88 (25 planned-press, 63 other judges) | 38/40 | - | | |
| **s3: band 1 + the share** | 38/40, 88 (80/80 kid rows IDENTICAL to s2) | 38/40 | 40/40 34 / 40/40 (no s2 adult rows to compare) | **86.9 s / 324 s (1.4x old)** | **3.5 ms** |
Session 3's share (step 2(c)): the cue memo (engine.cueTables, its tables never written after made) and the never-changing stage objects
(gen2, rivers, meta.pieces, config, proto dress / decor / beats / gen2: about 350 a run) deep-frozen at the first probe, so a wrong share
throws: zero TypeErrors in 160 runs. Objects copied a probe 3,115 -> 396; snapshot 2.86 -> 0.95 ms, restore 2.79 -> 0.81 ms; the flight
itself (1.80 ms, 17 frames) is now half the probe. 33,130 probes = about 117 s of the 324 s CPU. Cost of the WHOLE family is unmeasured:
expect 1.5-2.5x the old CPU on probe-heavy stages (the race gate flies each candidate hop x 3 lags), unless the early exits cut more.

**(b) The full plan, in order, one engine lane (hours of member work):**
1. **The seam, 4 h.** Every module-level store the engine writes in play (tipMemory, guideShown, helpLadder, physics framesFlown,
   playRecorder, localStorage) gets save / load or moves onto the engine; engineFork + the share move to src/game as a tested tool, the
   frozen set from a DECLARED list (not one run's sample); THE PROBE-EQUALITY GATE in the CI tool line: the graph prints equal after a
   probe, a run probed every 3rd frame ends equal to the unprobed run, and "answers thrown away" rows equal the old rows, one seed of
   every world; planted RED first with tipMemory's known leak. Moves no row.
2. **The plan-and-play core, 3 h.** PressPlan + planFlies on probe(); the bot plays the judged pads verbatim (the prototype's
   playPlan, its thumb hand-back and death-ends-plan); ONE invariant test (a planned press drawn inside the judged spread ends as the probe
   said) replaces the per-judge "judged == flown" toys. Moves no row until a judge uses it.
3. **The judges as ONE family move, 11-12 h:** vineFromLog standing + run-up (prototype, 1.5 h left); hopFlight with the gate family
   (hopLandsOn, floatSure, gateLands, gateAirtime, the race gate) and the landing stop, 5 h; lianaWait + dropWaits (the let-go flown by
   the engine), 2 h; padRead's flights (the latch stays), 2 h; hopCatches family (pitClimb), 1 h. Retires about 320 lines of model in
   firsttimer.ts, physics.ts's bot-only takeOffStep / groundStep, and the model toys (CI-8 ledge, CI-9 lip, CI-10 carry, CI-11 standing).
4. **The press-timing calibration, 4-5 h.** Where inside a catch window the bot aims (first frame, middle, or a band width) is fitted,
   never hand-set. Data: the testers' profiles (tools/playtesters/profiles: pressDelayMs, latePressAfterLeavingLedgeMs,
   earlyPressToLipPx, latePressShareOfLipJumps) and R-165.59's outcome targets; tool: `tierBots --calibrate` on 1-1
   (calibration-main.jsonl, the tolerances in R-165.59/BOTS.md) for child / middle / expert; kid / adult checked on the 2-4 x40 against
   the old judge's pinned rows (kid Normal 61 lives, Easy 33/40). HONEST LIMIT: no tester data measures a press inside a MOVING window
   (a drifting log under a swinging liana), and 1-1 has few; the fit is indirect until a play window on a World 2 stage measures it.
5. **THE RE-BASELINE, 9-13 h, paid ONCE.** Every bot row on every shipped stage moves: each stage's proven seed lists re-checked
   (seedlist.ts --check per stage) and any lost seed traced or re-proven; lockall --layouts 16 --check (expect 102/102 unchanged: layouts
   do not use the bots; any change is a finding); the tierBots calibration re-run and calibration-main.jsonl recommitted (BOTS.md);
   rule 28 rows vs main at the next release for Worlds 1-2 and 3-1 / 3-2, each PASS->FAIL traced to a judge or accepted under a ruling.
   This is the cost session 1 under-sized (4-6 h): ENG-THUMB's one input fix alone moved 203 rows fail->pass on 5 stages.
**Total about 31-37 h** (5-6 working days of one lane). After it, World 3+ judges are written as plans from day one.
Sizing source (D25): steps 1-3 from this spike's own time (the seam's leak list and the share, the core and vineFromLog's judge built
and re-measured in three sessions); the re-baseline from release 4's bot fix (12 sessions, CI-1..CI-15), 3-1's 13 + 14 bot boxes, and
ENG-THUMB's 203 moved rows. None of steps 3-5 is measured for the whole family: the range is the honest error bar.

**(c) The smaller first step: seam + core + vineFromLog + the hop family + the calibration, about 18 h, + the same re-baseline (9-13 h)
= 27-31 h.** It is not much smaller, because the re-baseline is paid whenever any judge moves; doing it in two halves pays it twice.
Risk: lianaWait / dropWaits / padRead stay on the model, so on vine stages the "other judges" lives stay (2-4: 63 of kid Normal's 88 are
from judges still on the model, part of them in this step). What it would have prevented this week: CI-8, CI-9, CI-10 (physics, all
hop judges), CI-11 (proven on the old code with no hand fix), CI-12 in part (the spread is flown; the band is the calibration);
CI-13 / CI-15 and ENG-THUMB's stop lines only inside a planned press (thumbify's arming at an unplanned stand is input logic the probe
does not touch: ENG-THUMB's root fix is still needed); 3-1's 27 bot boxes: the packet counts them "the same way", NOT traced box by box
here, so likely most, not all. It does NOT cover CI-14's class (padSeen's latch: what he remembers, bot logic, not physics).

**(d) When: after release 5, in a lane beside World 3's proof; the judges land after 3-1 / 3-2's proof builds.** Not this week before
release 5: the re-baseline moves every World 2 stage's seed lists and rule 28 rows the day before the release, the one thing release 5
cannot absorb, and nothing from the spike lands on release branches. Steps 1-2 (seam + core, 7 h) move no row, so they start right
after release 5 without touching the proof. Steps 3-5 land as ONE change after 3-1 / 3-2's proof builds, so the proof's 2-hour
measurement is not mixed with a bot shift mid-build; then World 4 is built on plans. The cost of waiting: 3-1 / 3-2 still pay the old
class (the packet's 27-box history on 3-1); ENG-THUMB's input fix lands first either way and is needed by both paths.

## EXACT NEXT STEP (session 3 hand-over, written 1:55 PM ET): the order is DONE (step 2(c) measured, THE ANSWER final above); nothing open
Only if the lead wants more before Matt (each one box): (i) the same share x40 on one more stage (2-1) for the whole-family cost; (ii) the
old run's lives split by judge (a plan counter on vineFromLog's pressJudged presses); (iii) the band-1 rescues traced (Normal 4, 14; Easy 7, 27).
Tree as session 2's step below, then `cp tools/inspect/engineFork.ts tools/inspect/botsim/stable.ts` from this branch (session 3's share).

## Session 3, step 2(c): the share (`BOTSIM_SHARE=1` in tools/inspect/engineFork.ts; stageWalk exported from botsim/stable.ts)
- What is shared: engine.cueTables and its tables (letGoCue.ts letGoTable builds them from the vine and the river path, letGoLands only
  reads them: a probe adding or clearing an entry is harmless, the live run builds the same table), added at every probe; and at the
  first probe, every object first met under currentStage.gen2.*, rivers.[], meta.pieces, config, proto.dress / decor / beats / gen2,
  deep-frozen (Maps, Sets and typed arrays skipped: freeze does not guard them). The engine is an ES module (strict), so a write THROWS.
- One seed (2-4 kid Easy 35, band 1, 285 probes): snapshot 2.86 -> 0.93 ms, restore 2.79 -> 0.83 ms, fly 1.77 ms; objects 3,115 -> 424;
  frozen 346; the row identical. x40 (`BOTSIM=1 BOTSIM_BAND=1 BOTSIM_SHARE=1 BOTSIM_STATS=1 castBots --stage 2-4 --seeds 1-40 --bots
  kid,adult --setting both --par 4`): 86.9 s wall, 324 s CPU; 33,130 probes at 3.5 ms; no TypeError; the 80 kid rows identical to
  session 2's x40-band1-kid.jsonl in every field (botsim plans and deaths included). Evidence: x40/x40-share.txt, x40-share.jsonl,
  share-stats.txt.
- Method used: no method file covers a bot-physics spike; the packet (packets/2026-11-26/ENG-BOTSIM.md) and this REPORT's hand-over steps
  were the method. Gates (law 5, scoped: reference/ docs + read-only tools/inspect only): tsc, knowncheck, generality GREEN; roadmapcheck
  and timecheck after the unshallow fetch (results in the hand-over message).
- Lessons applied: test the measuring tool before trusting its numbers (D15: the share's time is trusted only after 80/80 rows matched
  session 2's); estimates from measured history, source named (D25); times from `date` (D30, D128); git status before the commit and
  ls-remote after the push (D36); the fast gates before a docs push (D53); the queue read at every step (D57, D140); no stop with a run in
  the background (D59).
- Method update (proposed): a bot-judge change is measured with the share ON and its rows compared field for field against the same run
  with the share OFF (or a committed run of it) before any timing is quoted; and any future bot spike gets a methods/bot-judge.md built from
  this REPORT's item 1-3 commands (the lead decides).

## Session 2 hand-over (DONE in session 3; kept for its commands), written 1:45 PM ET; order step 1 DONE with a NO-BACK result below; step 2 (a)-(b) DONE, (c) open; step 3 open)
Tree: `git worktree add --detach ../bs-ci10 8134a9a56`; `npm ci --no-audit --no-fund --legacy-peer-deps` in the main tree (plain npm ci
fails ERESOLVE), `ln -s <main>/node_modules ../bs-ci10/node_modules`; `git -C ../bs-ci10 apply <main>/reference/qa-reports/ENG-BOTSIM/
proto-ci10-s2.patch` (REPLACES proto-ci10.patch: session 1's judge + session 2's fixes a-c, the band switch, the plan counters, the trace);
`cp tools/inspect/engineFork.ts ../bs-ci10/tools/inspect/; mkdir -p ../bs-ci10/tools/inspect/botsim; cp tools/inspect/botsim/stable.ts
../bs-ci10/tools/inspect/botsim/`. Switches: `BOTSIM=1` probe judge, `BOTSIM_BAND=1` judged lags mid +- 1 sd (default +- sd/2),
`BOTSIM_STATS=1` a probe's time split at exit, `BOTSIM_STABLE=1` the never-changing stage objects at exit (stderr). Rows carry
`botsim: {plans, deaths}` (lives lost inside a played plan or 0.5 s after it).
1. **Step 2 (a)-(b) DONE (2-4 kid Easy 35, band 1, 285 probes):** a probe copies 3,115 objects on average in play (not session 1's 754 at
   8 s): snapshot 2.84-2.97 ms + restore 3.43-3.54 ms = 6.3 ms of each 8 ms probe; the flight only 1.75 ms (17.2 frames, 0.10 ms a frame:
   the early exit already works). The last probe's graph is 5,760 objects, 4,590 first met through engine.cueTables (engine.ts:1019,
   7012: a memo of letGoTable(vine, len, dir, first log), keyed `id:dir:len`, cleared at 8 entries: pure derived data) and 346 through
   chaseSpanFor (only [stage, chase, rolling]: key-order attribution). Under currentStage / drawPlats / proto, 516 of 633 objects never
   changed in 5,059 frames (gen2 graph / drops / plan / barren / fills / falls / nodes / sections, proto dress / decor / beats, rivers,
   meta.pieces, config); changed: platforms 40 of 168, collectibles 42 of 67, checkpoints 19, vines 13, proto.hints 3.
   **Step 2 (c), NEXT:** in engineFork SHARE: (i) the cueTables Map and its tables (confirm letGoTable's result is never written after
   it is made: grep its users; a probe adding or clearing an entry is then harmless, the live run recomputes the same table); (ii) the
   516 never-changed stage objects, deep-frozen at the first probe (frozen = shared already; a write THROWS, so a wrong share is loud).
   Expected: about 650 objects copied instead of 3,100-5,800, so snapshot + restore near 1.3 ms and a probe near 3 ms (MEASURE it with
   BOTSIM_STATS; the last-graph line prints too). Then ONE x40 kid + adult, both settings, --par 4, timed, vs 62.3 s / 230 s (old) and
   117.6 s / 447 s (session 1); a TypeError = a shared object that changes: take it out.
   (The earlier plan for step 2, kept for its commands:) (a) `BOTSIM=1 BOTSIM_BAND=1 BOTSIM_STATS=1 npx tsx tools/inspect/castBots.ts --stage 2-4 --seeds 35
   --bots kid --setting easy` (one run, par 1): snapshot / fly / restore ms and frames a probe. (b) the same with `BOTSIM_STABLE=1`: how
   many of the ~620 objects under currentStage / drawPlats / proto never change (NOTE engine.platforms IS currentStage.platforms,
   engine.ts:1069: currentStage holds the moving logs, vines, foes; it cannot be shared whole). (c) share the never-changed set: deep-freeze
   it at the first probe (Object.freeze: a write to it THROWS in the strict-mode engine, so a wrong share is loud, not a silent leak) and add
   it to engineFork's SHARE (frozen objects are shared already); re-run (a) for the new ms; then ONE x40 kid + adult (`--setting both
   --par 4`, time it) vs the old judge's 62.3 s / 230 s CPU (x40/off.txt) and session 1's 117.6 s / 447 s; any TypeError = an object that
   changes: take it out of the set. Also count the frames flown a probe: the early exit (stop at the catch / the set-down) is the other cut.
2. **Step 3, THE ANSWER (final):** rewrite the section below with step 1's numbers (below) and step 2's; the ordered plan as drafted, sized;
   say plainly that the probe alone did NOT bring kid Normal back (the band is a calibration of its own, item c below) and what the
   SMALLER first step (seam + core + vineFromLog + the hopFlight/gate family) buys. Then message the lead (no clock times).

## Session 2, order step 1: kid Normal seed 2 and kid Easy seed 8 traced; three faults fixed in the prototype; kid Normal NOT back
**Seed 2 (kid Normal), four lives on the probe judge vs two on the old:** 105.30 a RUN-UP press (the run-up's press still on the old model,
runPress: suspect a, CONFIRMED); 107.53 a planned standing press whose drawn lag (0.026 s, about 1 sd early) fell outside the judged band
(mid +- sd/2) and came down in the water, AND the plan then played on through the death and the respawn (holding right on log #91 for
1.4 s after he was put back: a third fault, c); 123.73 and 136.20 the OLD hop chain landing on a log's front lip and running off (the old
run loses the same life at 24319, 156.07). Suspect b (stale thumb after a plan) is real (playPlan skipped thumbify, so releaseArmed kept
its pre-plan value and the first stop after a plan was a perfect one; and the plan's pre-press frames let go of a held steer at once,
which KID / ADULT never do, R-165.59) but it cost no life on seed 2.
**Seed 8 (kid Easy), the one new rescue:** the planned catch at 73.30 is right (caught on frame 16); the rescue (82.80) is three splash-backs
off logs #77, #78, #74 after the liana let-go (the old hop-and-stop code running off log ends), reached 9.8 s sooner than the old run
got there. Not the probe judge's flight.
**Fixes in the prototype (proto-ci10-s2.patch):** (a) the run-up's press asks the probe (run held from now, three lags) and the plan at his
drawn lag is played; (b) the plan's pre-press frames carry the steer his thumb still holds (standTail: none while travelling / slipping, an
armed lift-off's frames, else KID / ADULT held to the press), and each planned pad leaves the thumb as thumbify would (a steer clears the
lift-off and its arming; travelUntil kept to the steer's start); (c) a death ends the plan on its frame and a life lost drops the plan.
Seed 2 after a-c: 1 life (old 2), 163.3 s, every run-up press planned and caught.
**But the x40 (kid, 2-4, seeds 1-40, both settings) got WORSE, and the cause is the band, not the physics:**

| kid, 2-4 x40 | Normal pass | Normal lives | of which planned presses (of plans) | other judges' lives | Easy pass |
|---|---|---|---|---|---|
| old judge (session 1) | 40/40 | 61 | - | - | 33/40 |
| probe judge, session 1 | 40/40 | 78 | - | - | 39/40 |
| + fixes a-c, band +- sd/2 | 37/40 (rescued 4, 29, 36) | 105 | 39 (of 355) | 66 | 39/40 (13) |
| + fixes a-c, band +- 1 sd | 38/40 (rescued 4, 14) | 88 | 25 (of 340) | 63 | 38/40 (7, 27) |

Why: the probe is exact, so the judge presses on the FIRST frame every judged lag catches: the far edge of a moving catch window (the
log drifts, the liana swings, he runs). With lags mid +- sd/2 only 38% of his draws are inside; the 31% earlier come down short (seed 30:
run-up presses drawn at 0.007, -0.041, -0.001 s, each in the water). The old model's own errors happened to give margin. Widening the
judged band to +- 1 sd cuts the planned-press lives 39 -> 25 and seed 30 8 -> 4, seed 29 7 + a rescue -> 2 and a pass. So: (1) the
physics half holds: at band +- 1 sd, all 25 planned-press deaths were drawn OUTSIDE the band, none inside (340 plans, kid Normal x40,
FT_TRACE 'DIED' lines; the traced re-run reproduced 88 lives and 38/40 exactly); (2) WHEN a kid presses inside a window is a calibration
of its own (the band, or aiming for the window's middle rather than its first frame), to fit to the testers as R-165.317 did, NOT a
physics number; (3) the "other" lives (63-66) are the still-model judges (hopFlight, the landing stop, lianaWait) on the paths the new
judge sends him on, already above the old run's 61 in total: the old judges fail at their own rate wherever he arrives; moving one judge
alone moves where the rest fail. Untraced: the band-1 rescues (Normal 4, 14; Easy 7, 27), and the old run's lives split by judge (the old
path has no plan counter: add one on vineFromLog's pressJudged presses to compare like for like).
Evidence: x40/fix-kid.txt, band1-kid.txt, x40-fix-kid.jsonl, x40-band1-kid.jsonl (`botsim` per row); time: 70-72 s wall, 258-264 s CPU
for the 80 kid runs (the old judge's 160 kid + adult runs: 62.3 s / 230 s).

## THE ANSWER draft (session 1; SUPERSEDED by the FINAL answer at the top; kept for the CI table and the retire list): YES, with two halves and one engine seam
**The judges ask the engine, and the bot plays what was judged.** The probe removes the PHYSICS half of the class by construction (the
judge's flight IS the engine's: CI-8 the ledge forgiveness, CI-9 the lip hoist, CI-10 the take-off carry, CI-11's hold count). The other
half of CI-8..CI-15 was the INPUT stream (CI-11's free frames and startJump's own hold draw, CI-12's lag spread, CI-13 / CI-15's stops the
thumb never lets go): the probe alone does not fix those, "play the plan" does: the judge builds the exact pads (wait, press, hold,
steer), the engine flies them, and the bot plays those pads verbatim. Rule 28 ("the judged hop is the hop flown") then holds by
construction instead of by a toy per judge. Human noise is kept honestly: the judge flies the thumb's spread (thumbLags), the bot draws
its lag as today, and a draw outside the spread is a real miss, as for a person (no foresight, ENG-27r). NOT covered: what he remembers
or sees (CI-14 padSeen's latch), which is bot logic, not physics.

| CI | judge | fault | probe + plan fixes it? |
|---|---|---|---|
| CI-8 | hopFlight (others loop) | the engine's ledge forgiveness | yes (physics) |
| CI-9 | hopFlight | the engine's lip hoist | yes (physics) |
| CI-10 | takeOffStep (all hop judges) | the take-off carry on a drifting log | yes (physics) |
| CI-11 | vineFromLog standing | hold count (physics); free frames, startJump's own hold (input) | yes: PROVEN on the old code (item 2) |
| CI-12 | thumb lag spread | input (the press lands off the judged lag) | yes in part: the plan flies every lag of the spread |
| CI-13, CI-15 | stops (padPause, the let-go re-arm) | input (thumbify re-arms) | yes for a planned press/stop; else no |
| CI-14 | padRead's latch (padSeen) | memory | no (bot logic) |

**The plan, ordered by how often each judge broke** (mentions in CI-REDS / commits since 11-10), sized for one engine member:
0. **The seam (engine, 3 h, first):** the module stores the engine writes in play (tipMemory, guideShown, helpLadder, physics
   framesFlown, playRecorder; localStorage) each get save/load (or move onto the engine); engineFork.ts moves to src/game as a tested
   tool; the proof gate in the CI tool line: the graph prints the same after a probe, and a run probed every 3rd frame ends equal to the
   unprobed run, one seed per world (seconds each), planted first with the tipMemory leak (RED today: B3's guideN).
1. **Plan-and-play core (3 h):** PressPlan (pads) + planFlies(plan, goal) on probe(); the bot's plan queue (played verbatim, thumbify
   off on planned frames, the lag drawn as decide draws it); ONE invariant test replaces the per-judge "judged == flown" toys: every
   planned press whose drawn lag is inside the judged spread ends as the probe said.
2. **vineFromLog (19 / 13; 2 h):** the standing branch is the prototype; the run-up (runUpCatches, runPress) as plans with run frames.
3. **hopFlight and the gate family (14 / 6, + hopLandsOn 2 / 7, floatSure 0 / 7, gateLands, gateAirtime, the race gate; 4 h):** the race
   gate flies each candidate hop x 3 lags: about 30 ms a candidate, early exit on the first miss.
4. **padRead's flights (8 / 11; 2 h):** the flight part only; the latch stays bot logic.
5. **lianaWait and dropWaits (4 / 8, 3 / 0; 2 h):** the let-go flown by the engine (timedLaunch, the logs' clock) instead of the model.
6. **hopCatches family (3 / 5; pitClimb, lianaWait's catch; 1 h).**
7. **Re-measure (the hidden cost, 4-6 h):** the bots' play moves; every stage's x40 rows move (rule 28 traces), the tierBots
   calibration re-runs and recommits (R-165.317), the proven seed lists re-check. Budget it as one release's bot fix, ONCE, instead of
   one per stage.
**Total about 21-23 h of member time** (about 4 working days for one engine lane), then World 3's judges are written as plans from day one.
**Retires:** in firsttimer.ts the model block (hopFrame, hopCatches, hopCatchAt, hopLandsOn, hopFlies, hopFlight, gateLands,
gateAirtime: lines 999-1315 on c73cb9766, about 320 lines) and physics.ts's bot-only mirrors takeOffStep and groundStep (the engine
calls neither; airStep stays, levelCheck uses it); tests: judgeFliesEngine.test.ts, lianaRide.test.ts's model pins, hopJudged.test.ts's
model toys (CI-8 ledge, CI-9 lip, CI-10 carry, CI-11 standing: they become the one plan invariant), pitClimb's hopCatches pins,
riverRide's gateAirtime pins.
**Risks:** (a) a leak not on the list: the proof gate catches it on the stages it runs, so it runs one seed of every world; (b) cost
(item 3); (c) the probe flies the engine as it is NOW: a moving piece's future that depends on him (a crumble he triggers, a foe that
reacts) is flown for real, which is right, but a judge that probes many frames ahead pays for it.

## Item 3: cost and effect, 2-4, kid + adult, seeds 1-40, both settings (160 runs, --par 4 on 4 cores, old code 8134a9a56)
| run | wall | CPU (user) | kid N | kid E | adult N | adult E |
|---|---|---|---|---|---|---|
| old judge | 62.3 s | 230 s | 40/40, 61 lives | 33/40 (7 rescued) | 40/40, 38 lives | 40/40 |
| probe judge (BOTSIM=1) | 117.6 s (1.9x) | 447 s (1.9x) | 40/40, 78 lives | 39/40 (1 rescued: seed 8) | 40/40, 37 lives | 40/40 |
| probes, answers thrown away (BOTSIM=2) | 227.0 s | 863 s | 0 of 160 rows moved vs the old judge | | | |
- **No leak reached a row:** with every probe flown and its answer thrown away, all 160 rows are identical to the old judge's (pass,
  lives, time): the snapshot/restore is invisible to the bots on 2-4 (tipMemory's leak did not reach a row here; the seam still has to
  land before any other stage counts on it). So every moved row below is the judge's own change.
- **The judge's effect:** 149 of 160 rows moved (time or lives). Kid Easy: all 7 old rescues (2, 18, 1, 13, 27, 35, 20: the vineFromLog
  standing miss, CI-11's class) now PASS; 1 new rescue (seed 8, untraced); runs 9.8 s quicker (median). Kid Normal: 17 rows lost MORE
  lives, 10 fewer (net +17 water lives, no pass/fail change, untraced: next step 1). Adult: Normal 10 up / 12 down (net -1), Easy quicker
  3.3 s (median), no pass/fail change.
- **Cost:** one judge on probes = 1.9x wall and CPU on this stage (a probe-heavy one: the judge runs every frame he stands on a log under
  a liana). The leak check (all 3 lags every frame, no early exit) is 3.7x: the snapshot (about 5 ms of each 8-10 ms probe) is the cost
  to cut before more judges move (next step 2). CI today runs castBots and tierBots in the CI tool line; at 1.9x per judge moved they
  stay usable only with the cheaper snapshot and early exits; measured, not assumed, per judge as it moves.
- Evidence: x40/off.txt, on.txt, leak.txt, the rows (*.jsonl), `python3 x40/cmp.py x40/x40-off.jsonl x40/x40-on.jsonl`.

## Item 1: YES, by snapshot + fly the LIVE engine + restore in place (a separate copy does NOT work)
Tool: `tools/inspect/engineFork.ts` (`probe(e, pads, read)`); proof: `npx tsx tools/inspect/botsim/forkProbe.ts 2-4 35 easy 30`.
- **A copy (deep clone, prototypes kept, stepped on its own) fails:** it matches the live flight, but it SHARES state held in closures:
  the stage clock keeps its time inside a closure (clock.ts stageClock: `let t`), so flying the copy moved the LIVE game time 1.5 s; the
  piece and field hosts (engine.ts pieceHost, fieldHost) read the LIVE engine through closures. 7 closure-bearing objects in the graph.
- **Snapshot, fly the live engine, restore in place works:** every object the engine reaches (754 on 2-4 at 8 s) is saved; the live
  engine flies the candidate pads (its hooks loseLife / softFall / damagePlayer / guide swapped for the probe's, Math.random on the probe's
  own stream); then every saved object is written back IN PLACE (identity kept, so every reference and closure into it stays right) and
  the clock is put back. Checks on 2-4 kid Easy 35: (B1) the whole reachable graph prints identical after a probe; (B2) the probe's 45
  frames equal the live run's 45 frames exactly (x, y, vx, vy to 4 places, every frame); (B3) 900 frames probed 45 frames ahead every
  3rd frame (300 probes) end at the identical player state as the same run never probed.
- **Cost:** a 45-frame probe = 9.6 ms mean (snapshot + restore about 5 ms, a frame about 0.1 ms). A judge asking 3 lags is about 30 ms
  per decision.
- **One leak, outside the engine:** B3's full graph differs in ONE field (guideN 0 vs 1): a probe flew past a Dot tip and the tip's
  module (src/game/tipMemory.ts: `sent`, `pending`, `byText`) marked it sent, so the live run never said it. Module-level stores the
  engine writes during play: tipMemory, guideShown (`shown`), helpLadder (`onScreenText`, `current`, `grownNow`, `stairsLeftOut`),
  physics (`framesFlown`, a counter), playRecorder, localStorage. The fix is an engine seam (each store exports save/load, or moves onto
  the engine), and B3 over every stage as the gate that proves none is left.

## Item 2: the prototype on ONE judge (vineFromLog's standing catch), on the OLD code: CI-11's row judged right with NO hand fix
Patch: `proto-ci10.patch` (on 8134a9a56 = CI-10, behind `BOTSIM=1`; 103 lines); toy: `botsimToy.test.ts.txt` (CI-11's own toy from
4cccba33e, plus the same recorder on the plan's press); evidence `toy-ci10.txt`.
- **The judge asks the engine:** for each of the three lags (mid, mid - sd/2, mid + sd/2) it builds the press PLAN (stand until the
  press frame pressIn(lag), the press, the jump held while the engine counts it held, the steer from the press frame or when his thumb
  gets there, steerFrom) and `probe()` flies it on the real engine: caught = swinging on that liana before he is grounded or dies.
- **The bot plays what was judged:** the lag drawn as decide draws it; the plan at that lag is the pad stream, frame for frame, to its
  probed end (no thumbify, no startJump draw in between: rule 28 "the judged hop is the hop flown" holds by construction).
- **Result:** without the probe (old judge): RED, "the standing press at t 47.600 from x 10545.1 on #48 was judged to catch; the engine:
  grounded on #-1 at x 10190.0 y 947.0, frame 14" (CI-11's miss). With the probe: GREEN, pressed at t 47.067 from x 10502.2 on #48,
  caught liana #4 on frame 10: the SAME press and catch CI-11's hand fix reached (CI-REDS session 8: "pressed 47.067 from x 10502.2 on
  #48 ... caught swing #4 at 47.400 (frame 10)"). CI-11's three hand fixes (every free count, the engine's hold count, startJump flying
  the judged hold) are not needed: the first two are physics the engine does itself; the third is "play the plan".
- **Cost on the toy:** 114 probes, about 1.0 s of probing in a 49 s run (8.5 ms a probe); test wall 3.5 s vs 5.1 s (noise: one run each).
