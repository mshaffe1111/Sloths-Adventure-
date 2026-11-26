# ENG-SIM: the bots ask the GAME how a press flies (R-165.470; packet reference/packets/2026-11-26/ENG-SIM.md on the lead's branch)
Branch t-eng-sim from origin/release-0.10.3 c73cb9766. Nothing here lands on release-0.10.3, main or a release 5 branch.

## EXACT NEXT STEP (box 2 hand-over, written 2:43 PM ET): step 1 GREEN and step 2's core in; run step 2's candidate checks, then step 3's plan
Head: see the hand-over message (pushed to t-eng-sim, ls-remote confirmed). Box 2's logs were in its scratchpad; the counts are below.
1. On a frozen worktree of the pushed head (`git worktree add --detach`, symlink node_modules, `chattr -R +i src tools`,
   run_in_background + timeout 7200000): the CI tool line (gates.yml line 157, about 10 min; it runs the probe-equality gate, about
   5 min of it), the suite in 3 shards (CLAUDE.md's src globs), tsc, generalitycheck, timecheck `--range c73cb9766..HEAD`. Record each
   under "Step 2" below with the hash. Box 2 ran on step 2 (ee33a442b): tsc PASS, the invariant test 1/1 PASS and its plant RED.
2. Step 1's CI tool line PASSED on f3acbc87d (recorded under Step 1); step 2 adds only src/game/pressPlan.ts, its test and the bot's
   planNext/setPlan (nothing calls them until a judge sets a plan), so item 1 is the step 2 candidate's full set.
3. Then packet step 3 (READY only, do NOT start it): the one-page plan, in this REPORT (packet items: the judges as ONE family with their
   toy rows; the press-timing calibration and its honest limit; the re-baseline list). The lead GOs step 3 after ENG-THUMB lands.

## Step 1: THE SEAM (box 1 from 2:07 PM ET)
- **The probe moved to src/game as a tested tool:** src/game/engineProbe.ts (the spike's snapshot / fly / restore in place; it now flies
  the harness's OWN frame, RealPlay.frame, instead of the spike's stepFork copy of it; the bot's hooks swapped: loseLife / softFall /
  damagePlayer end the flight, every e.callbacks function hears nothing; Math.random on the probe's stream; module play stores and
  localStorage saved and put back). THE SHARE from a DECLARED list (NEVER_CHANGES: 8 paths, each with why; deep-frozen at the first
  probe, a write throws) plus the cue memo (engine.cueTables, shared not frozen). Unit tests: src/game/engineProbe.test.ts, 6/6 pass.
- **The seam:** src/game/playStores.ts (playStore(name, {save, load}); the probe saves and loads every registered store). Registered:
  tipMemory (sent, pending, byText: the spike's leak), guideShown (shown), helpLadder (onScreenText, current, grownNow, stairsLeftOut).
- **How the leaks are FOUND, not listed:** tools/engine/moduleStores.ts bundles the harness, the probe and the bots with esbuild into one
  file and appends a getter for every top-level binding of every src/ module (5,809 bindings; each module keeps its own import.meta, as
  gen2/seedList.ts loads seed lists by a require from its own folder). Audit on 2-4 seed 35 Easy, 300 probes, every probe checked:
  CHANGED tipMemory sent + byText (the leak), controlPrefs style and haptics on (read-through caches of the phone setting: MEMOS),
  headlessDom g (globalThis: Node's undici dispatcher appears; MEMOS), the probe's own counters. Nothing else.
- **THE PROBE-EQUALITY GATE:** tools/engine/probeEqual.test.ts, in the CI tool line (gates.yml). Two module worlds (the bundle imported
  twice): world A plays a run probed every 3rd frame (45-frame candidate press, answer thrown away), world B the same run never probed.
  (1) graph print equal after a probe (every 10th probe; the module stores every 200th); (2) checkpoints every 900 frames per harness
  and the end: graph + every module store equal; (3) the kid's whole FTRun (wall ms aside) equal. One seed of every world (1-1 s3, 2-4
  s35, 3-1 .. 10-1 s1) and the planted case (the spike's B3: 2-4 s35 Easy, 900 frames of a fixed pad).
- **Gate:** box 1: RED on 90f57a345 (no seam): 0/11, tipMemory sent/byText 6+6, clock WALK/QW 32/4, graph print 26, sceneSeed. RED on
  74ba58873 (seam): 0/11, the same minus tipMemory. **Box 2: GREEN 11/11 on f3acbc87d** (4 min 41 s, a frozen worktree). The plant on
  f3acbc87d with the seam off (savePlayStores returns []): RED, the B3 end checkpoint: the probed run's Dot `said [0 ]`, the plain run's
  `said [1 { text ...`: the spike's leak, still caught.
- **The three causes, each traced to the line and sealed (box 2):**
  (1) the gate's own artifact, NOT at import (both worlds' stores print equal right after import and after a first harness): firstTimer's
  hold check `holdOn` (tools/inspect/firsttimer.ts holdOnHere, `new RealPlay`) plays a harness BEFORE firstTimer seeds Math.random, and
  that stage load rolls the scene seed (engine.ts `setSceneSeed(rollSceneSeed())`, sceneSeed.ts:32 Math.random), so each world rolled its
  own look (1-1 s3 checkpoint 0: seed 891717489 vs 435573514). Fix in the gate: each world's run under the same seeded stream
  (`Math.random = w.rng(7)`, put back after). What the gate compares is unchanged. (holdOn's unseeded harness is the bot tool's own:
  the scene seed is looks only, the 10 rows equal base; named here, not changed by this lane.)
  (2) clock.ts WALK / QW are scratch, proven: cycleRead only WRITES its out (clock.test.ts: a Proxy out that throws on any read), cycle3
  writes both QW entries before cycleRead reads them, and all seven cycle3 callers (eaglet, thornVine, w5Kit x2, zones, rockfall,
  waterfalls) read the returned WALK at once, before any other read; beatAt copies it into a fresh object. clock.test.ts: a read after
  any other read answers the same (200 reads). MEMOS in the gate, each with that why.
  (3) the graph print change is engine.cueTables (the let-go cue memo): a probe built a table ahead of the live run, and the memo is
  CAPPED (at 8 it is cleared, engine.ts), so WHICH tables it holds is play state (the B3 end: the probed run held one table fewer).
  Sealed at the source: the probe puts the Map's entries back as it found them, in order (engineProbe.ts cueFly); the tables a probe
  built go to a probe-only side memo per stage (a WeakMap the live run never reads) and are lent to the next flight up to the cap, so a
  probe never builds a table twice. Not widened, not skipped: the graph print still prints the whole Map.
- **Declared memos (the gate's MEMOS, each with its why in tools/engine/probeEqual.test.ts):** the probe's own counters (PROBE_STATS,
  SHARE_STATS); physics reachTables, dropReachCache, chainCache and **framesFlown** (the reach memo's own cost counter, the lead's ruling:
  a MEMO with its tables); controlPrefs style and haptics on (read-through caches of the phone setting); headlessDom g (globalThis);
  **clock WALK and QW** (scratch, proven above). The probe-only side memo (engineProbe.ts probeCue) is a WeakMap: its print is empty, so
  the gate cannot see it; named here so it is declared, not hidden.
- **NO row moved:** the kid on Easy, one seed of every world (1-1 s3, 2-4 s35, 3-1..10-1 s1), base c73cb9766 vs f3acbc87d: the 10 rows
  identical (firstTimer's whole FTRun, wall ms aside).
- **Checks on f3acbc87d:** tsc PASS; the gate 11/11; generalitycheck PASS (26 literals, 26 known); timecheck c73cb9766..HEAD PASS;
  probe unit tests 6/6; clock.test.ts 10/10. The CI tool line (gates.yml line 157, frozen worktree): PASS, 432 tests, 431 pass, 0 fail, 1 todo (chaseBots'
  CHILD-on-Normal fork, OPEN todo, ENG-B4), 598 s.

## Step 2: THE PLAN-AND-PLAY CORE (box 2, ee33a442b)
- src/game/pressPlan.ts: PressPlan (the pads, frame 1 = next), pressPlan(spec) (a press on frame m, the hold, the steer from its frame,
  the thumb's tail before the press), planFlies(sim, plan, goal) on probe() (the frame the goal is met; -(frame) on a fail, a death or the
  plan's end; a death ends the plan on its frame), PlanPlayer (the pads one a frame, verbatim; a life lost since it was set drops the rest).
- The bot (tools/inspect/firsttimer.ts): `planner`, setPlan(plan, end, dir) (keeps the travel its steer waits for, drops a queued press),
  planNext() (the thumb left as thumbify leaves it: a steer ends any late lift-off and its arming; a frame with none is a thumb let go;
  the spike's fix b); play() plays `planNext() ?? pad()`. No judge sets a plan yet, so no row moves.
- THE invariant (src/game/pressPlan.test.ts): a press drawn anywhere in a spread (press frames 2..7, holds 0.12 and 0.3 s; 12 draws, each
  in its own run from the same moment, 1-1 kid Easy) played by the bot ends exactly as planFlies said: the same frame, the same x / y / vx
  to 4 places. PASS 1/1. Plant (the bot lets the jump go after the press frame, i.e. not verbatim): RED at press 2 hold 0.12, the frame.
- **NO row moved:** the same 10 rows (kid Easy, one seed of every world), base c73cb9766 vs ee33a442b: byte-identical.
- **Step 2's checks (box 3, ONE run each, a chattr-frozen worktree of a82a602c = ee33a442b's code + REPORT only; src and tools frozen except
  src/game/gen2/proven):** the CI tool line (gates.yml line 157) PASS: 432 tests, 431 pass, 0 fail, 1 todo (chaseBots' CHILD-on-Normal
  fork, OPEN, ENG-B4), 1,045 s (sharing 4 cores with the suite); tsc PASS; generalitycheck PASS (70 engine files, 26 literals, 26 known);
  timecheck c73cb9766..a82a602c PASS (9 commits, 1 stamp). The suite in 3 shards (651 files, CLAUDE.md's src globs, 217 each): SUITE_PENDING

## Step 3: THE ONE-PAGE PLAN (box 3; READY only, NOT started: the lead GOs it after ENG-THUMB lands)
**Order of work, each a candidate with its own checks (D141: the CI tool line on every one):**
0. **Base, 0.5 h.** Merge ENG-THUMB's landed head (the lead names it) into t-eng-sim, so the judges move from the code release 5 ships.
   Re-run the probe-equality gate and pressPlan.test on the merge (the gate's MEMOS list re-read: ENG-THUMB adds rng().fork()).
1. **THE JUDGES AS ONE FAMILY, 8-10 h** (the spike sized 11-12 h; the core is in, so each judge is a plan builder + planFlies, not new
   machinery). Every judge has the same shape after the move: it builds candidate PressPlans (pressPlan spec: press frame, hold, steer),
   planFlies each at every lag of the thumb's spread (thumbLags, as decide draws it), takes the first plan whose spread all meets the goal,
   setPlan()s it; the bot plays it verbatim (planNext). The ONE invariant (pressPlan.test.ts) then covers rule 28 for all of them; each
   judge's "judged == flown" toy retires ONLY after the invariant row for that judge is in and planted RED. The toys, per judge:
   a. **vineFromLog standing + run-up, 2 h.** Prototype exists (proto-ci10-s2.patch). Toys: hopJudged.test :291 (standing = the catch
      flown), :327 (judged at every lag), :364 (a stand on a log is a stop he means: KEPT, a stop is bot logic); lianaRide.test :104 (a vine
      from a log), :125 (over the tail, rule 21), :178 (the aims name the engine's take-off and catch: RETIRES, the probe is the engine);
      firsttimer.test's runUp rows. Retires runUpCatches / runPress' model flight.
   b. **hopFlight + the gate family + the landing stop, 3.5-4 h** (the biggest: 14 / 6 mentions + hopLandsOn 2 / 7, floatSure 0 / 7).
      hopLandsOn, floatSure, gateLands, gateAirtime, the race gate: each candidate hop x 3 lags on the probe, early exit on the first miss
      (the spike: about 30 ms a candidate). Toys: hopJudged.test :37 (2-7 every judged hop is flown: becomes an invariant row), :63 (no
      foresight: KEPT, the gate decides on the hop as aimed), :77 (a wait holds its aim: KEPT), :97 / :124 (the race gate's choice: KEPT,
      re-pinned on the probe's answers), :152 (2-7 race float wait), :218 (ledge forgiveness CI-8) and :272 (take-off carry CI-10): RETIRE
      (the engine's physics by construction); :457 (a pause on a small log: KEPT); riverRide.test's floatSure / gateAirtime rows (18 tests,
      the gate ones re-pinned). Retires the model block (hopFrame .. gateAirtime, about 320 lines) and physics.ts takeOffStep / groundStep
      once no caller is left (ENG-THUMB's C6 peek is a groundStep caller: see the fault list).
   c. **lianaWait + dropWaits, 1.5-2 h.** The let-go flown by the engine (the logs' clock is in the probe) instead of the model's
      timedLaunch. Toys: lianaRide.test :67 (drop on a log, planted), :151 (aims at the frame they reach the engine: RETIRES into the
      invariant); chaseBots / coveragecheck rows that name lianaWait re-read (they test the wait, not the flight: expected KEPT).
   d. **padRead's flights, 1.5-2 h.** The flight part only (the hop off a pad, the snap-stone tap, the shiver hop); the latch (CI-14
      padSeen) and the beat-row read stay bot logic. Toys: hopJudged.test :392 (a beat row from a floor that stays), padRide.test (5: the
      fixture rows, the waitRise plant, OUT-AND-BACK's pin, the breath toy): KEPT as outcome rows, re-measured.
   e. **hopCatches family, 1 h** (pitClimb, lianaWait's catch). Toys: pitClimb.test (16), lianaRide.test's catch rows: outcome rows KEPT.
   f. **Cost check, in the family's last candidate:** the x40 of one World 2 stage kid + adult timed against today (the spike: 1.4x on
      2-4); a gate over 3x is a finding before step 3 closes, not after.
2. **THE PRESS-TIMING CALIBRATION, 4-5 h.** WHERE inside a catch window a planned press aims (first frame, middle, or a band of width w)
   is FITTED, never hand-set: the spike's kid Normal moved 61 -> 88 water lives with one judge on an exact answer, because an exact
   answer presses on a moving window's FIRST frame and a drawn lag then falls outside it. Data: the testers' press fields
   (tools/playtesters/profiles players/ + tiers/: secondPressDelayMs, latePressAfterLeavingLedgeMs, latePressPastLipPx,
   latePressShareOfLipJumps, groundPressToLipPx, groundPressFromStandstillShare, airPressWithoutFirstJump; 42 profiles) and R-165.59's
   outcome targets (tierBots calibrate(): finishSeconds p50 12%, livesPerRun / putbacksPerRun max(30%, 0.3), secondPressDelayMs p50
   25%, the top hurting pieces). Tool: `tierBots --stage 1-1 --tiers child,middle,expert --seeds 1-40 --setting both --calibrate` per
   candidate band; kid / adult checked on the 2-4 x40 against the old judge's pinned rows (kid Normal 61 lives, Easy 33/40).
   **THE HONEST LIMIT:** no tester data measures a press INSIDE A MOVING WINDOW (a drifting log under a swinging liana, a sinking pad), and
   1-1 has few moving windows, so the fit there is indirect. **How it is measured, not assumed:** (i) a sensitivity sweep on 2-4 and 2-2
   (band = first frame, middle, w = 1/4, 1/2, full) printed per tier: how far the rows move across the sweep IS the size of the unknown,
   shown to the lead with the chosen band; (ii) the one direct measure is a person's press against a window's open and close: the play
   recorder (playRecorder) on Matt's test link already records presses with the frame; a 2-4 river run by Matt or a tester, read for
   press-minus-window-open, replaces the assumption the day it exists. Until (ii), the report names the band as FITTED ON 1-1 OUTCOMES +
   THE SWEEP, never as measured.
3. **THE RE-BASELINE, 9-13 h, paid ONCE (the spike's size kept: it is compute-bound and the spike's own 4-6 h under-size is D-logged).**
   a. every shipped stage's proven seed list: `seedlist.ts <stage> --check` (1-1 is in the CI line); each lost seed traced to a judge
      (rule 28 trace) or re-proven, never dropped silently;
   b. `lockall --layouts 16 --check`: expect 102/102 UNCHANGED (layouts do not use the bots); any change is a finding, not a re-baseline;
   c. the calibration re-run and `reference/qa-reports/R-165.59/calibration-main.jsonl` recommitted with tierBots.test (R-165.317: the 200
      runs replay exactly; BOTS.md);
   d. rule 28 rows vs main at the next release, Worlds 1-2 and 3-1 / 3-2: castBots x40 per stage both settings, each PASS -> FAIL traced
      to a judge (law 22) or accepted under a lead's ruling; each fail -> pass listed (ENG-THUMB's one fix moved 203);
   e. the known lists (knowncheck) and the CI tool line's pinned rows (riverRide, padRide, lianaRide, chaseBots, pitClimb, hopJudged) re-pinned
      in the same change, each with the old and new value;
   f. lands as ONE change after release 5 merges, at the time the lead names (between World 3's proof builds).
**Hours, checked against real time:** steps 1-2 were sized 7 h and took about 1.5 h of member time (boxes 1-2 + box 3's checks), because
they moved the spike's working code. Step 3 is new code against about 60 toy and outcome rows (above), so I cut the spike's 11-12 h only to 8-10 h,
keep the calibration (4-5 h: each band is a 200-run tierBots pass, about 4 min, plus the 2-4 / 2-2 sweep) and the re-baseline (9-13 h,
compute-bound); with the merge, **22-29 h left** (spike: 24-30 h for the same steps). The judges' hours are the risk; the gate's cost
check (1f) is where an over-run shows first.
**Today's bot faults: what the switch REPLACES (patch now only if a traced row needs it; D40) and what it does NOT (fix now, it stays):**
- REPLACED: **ENG-THUMB's C6 padRead peek** (rng().fork() to read the next lag, then the hop flown by physics groundStep from where that
  lag takes him off): step 1d flies every lag of the spread on the probe, so the groundStep flight retires; the peek itself (reading his
  own next draw) is replaced by flying the spread (no foresight, ENG-27r). That moves 2-2's rows again: re-baselined in 3d, not patched.
- REPLACED: **padRead's two other fixed-lag spots** (the snap-stone tap, the shiver hop): 1d (the lead's D40 ruling stands: leave them).
- NOT REPLACED: **2-8's child 'PRESS off bank' / 'PRESS off W' water look**: the bot's 'water ahead' read (riverAt 120 px ahead) and the
  fork's road choice (W2-LANE-h's fork-jump patch, never landed) are a ROUTE decision: which press to make, not how it flies. The
  switch would fly the wrong press exactly. Fix now; it stays.
- NOT REPLACED (as sized): **2-6's rideWheel boarding** (wheelRide): not in the spike's family. The boarding hop onto a moving bucket is
  a moving-window flight and COULD join the family (about +1.5 h, item 1g), but the stance, the walk-up and the 'not yet... NOW' window
  read stay bot logic. Today's fix stays; I recommend adding 1g only if a wheel row is red at step 3's base.
- NOT REPLACED: **CI-14's padSeen latch** (memory), the stops CI-13 / CI-15 except where the stop is part of a plan.

## Pushback
- physics `framesFlown` (on the packet's list) is the reach MEMO's own cost counter (read only by reachFill.test.ts R-165.207); a probe
  that builds a reach table leaves the table built (a pure function of the jump numbers), so saving the counter alone would make it lie.
  It is a MEMO in the gate with the tables (reachTables, dropReachCache, chainCache), not a save/load.
- playRecorder and localStorage: the audit saw neither written by a probe on 2-4 (the recorder is off in the harness; Node has no
  localStorage unless a test installs one). localStorage is saved and put back by the probe whenever it exists; the gate watches the
  recorder's bindings like every other store.

## Hours (LEVEL-LOG style; the spike sized step 1 at 4 h)
- Box 1 from 2:07 PM ET (28 min): the tool, the seam (3 stores), the store finder, the gate (planted RED proven), unit tests 6/6.
  Left for step 1: the 3 causes above and the candidate's checks (about 1.5 h more, against the spike's 4 h).
- Box 2 from 2:31 PM ET (about 28 min): the three causes traced and sealed, the gate GREEN 11/11, the plant RED, the rows equal base;
  step 2's core and its invariant (plant RED), rows equal base. Step 1 took about 1 h of work (box 1 + most of box 2) against the
  spike's 4 h; step 2's core about 10 min of code against 3 h (its candidate checks are box 3's first job).

## Lessons applied (box 2)
- D115 frozen worktrees for every gate, plant and rows run; D141 the CI tool line on the step 1 candidate; D134 pushed and ls-remote
  confirmed before the hand-over; D128 stamps from `date`; D113 runs in the background, never a foreground wait; D139 the causes were
  measured (a diagnostic), not taken from the note: cause 1 was not where the note put it (at import) but in holdOn's unseeded harness.
