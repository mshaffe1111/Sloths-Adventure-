# ENG-SIM: the bots ask the GAME how a press flies (R-165.470; packet reference/packets/2026-11-26/ENG-SIM.md on the lead's branch)
Branch t-eng-sim from origin/release-0.10.3 c73cb9766. Nothing here lands on release-0.10.3, main or a release 5 branch.

## EXACT NEXT STEP (box 1 hand-over, written 2:25 PM ET)
1. Read the two gate runs box 1 started (frozen worktrees under /home/user/wt; if the container was replaced, re-run them: they are
   `git worktree add --detach <dir> <hash>`, symlink node_modules, `chattr -R +i <dir>/src <dir>/tools`, then
   `npx tsx --test tools/engine/probeEqual.test.ts` with run_in_background and timeout 7200000):
   - RED run on 90f57a345 (gate planted, no seam): expected RED on the planted B3 case (tipMemory's leak). Record the failing line here.
   - seam run on 74ba58873 (tipMemory, guideShown, helpLadder registered): every world's test. Any `module store X changed` or
     checkpoint diff names a store the seam still misses: register it in its module with `playStore(...)` (src/game/playStores.ts),
     or, ONLY if it is a memo of pure inputs or a read-through cache of the phone, add it to MEMOS in tools/engine/probeEqual.test.ts
     with why. A diff in the graph (not a store) is a closure or an accessor the snapshot misses: trace it, do not allow-list it.
   - The box-1 result is below under "Gate"; box 1's run of the result may have finished: check `Gate` first.
2. When the gate is GREEN on a frozen tree of HEAD: the CI tool line (gates.yml's `npx tsx --test tools/...` line, about 10 min) and
   the suite in 3 shards (`--test-shard=i/3`, CLAUDE.md Checks glob), tsc, generalitycheck: the step 1 candidate. Put the times here.
3. Step 2 (the core): PressPlan + planFlies on probe() + the plan queue in FirstTimerRun (the prototype's playPlan: thumb hand-back,
   a death or a life lost drops the plan; spike patch proto-ci10-s2.patch lines 43-126) with NO judge using it, and ONE invariant test.

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
- **Gate:** RED on 90f57a345: (pending, see step 1). GREEN on 74ba58873: (pending).

## Pushback
- physics `framesFlown` (on the packet's list) is the reach MEMO's own cost counter (read only by reachFill.test.ts R-165.207); a probe
  that builds a reach table leaves the table built (a pure function of the jump numbers), so saving the counter alone would make it lie.
  It is a MEMO in the gate with the tables (reachTables, dropReachCache, chainCache), not a save/load.
- playRecorder and localStorage: the audit saw neither written by a probe on 2-4 (the recorder is off in the harness; Node has no
  localStorage unless a test installs one). localStorage is saved and put back by the probe whenever it exists; the gate watches the
  recorder's bindings like every other store.

## Hours (LEVEL-LOG style; the spike sized step 1 at 4 h)
- Box 1 from 2:07 PM ET (28 min), step 1 about 70% (tool, seam, gate, unit tests; the gate's verdict and any further store pending).
