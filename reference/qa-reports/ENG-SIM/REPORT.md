# ENG-SIM: the bots ask the GAME how a press flies (R-165.470; packet reference/packets/2026-11-26/ENG-SIM.md on the lead's branch)
Branch t-eng-sim from origin/release-0.10.3 c73cb9766. Nothing here lands on release-0.10.3, main or a release 5 branch.

## EXACT NEXT STEP (box 2 hand-over, written 2:43 PM ET): step 1 GREEN and step 2's core in; run step 2's candidate checks, then step 3's plan
Head: see the hand-over message (pushed to t-eng-sim, ls-remote confirmed). Box 2's logs were in its scratchpad; the counts are below.
1. On a frozen worktree of the pushed head (`git worktree add --detach`, symlink node_modules, `chattr -R +i src tools`,
   run_in_background + timeout 7200000): the CI tool line (gates.yml line 157, about 10 min; it runs the probe-equality gate, about
   5 min of it), the suite in 3 shards (CLAUDE.md's src globs), tsc, generalitycheck, timecheck `--range c73cb9766..HEAD`. Record each
   under "Step 2" below with the hash. Box 2 ran on step 2 (ee33a442b): tsc PASS, the invariant test 1/1 PASS and its plant RED.
2. If the CI line's step 1 run (f3acbc87d) was not recorded as PASS below, that run is the one that counts for step 1 too (the step 2
   commit only adds src/game/pressPlan.ts, its test, and the bot's planNext/setPlan, which nothing calls until a judge sets a plan).
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
  probe unit tests 6/6; clock.test.ts 10/10. The CI tool line: CI_LINE_S1.

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

## Pushback## Pushback
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
