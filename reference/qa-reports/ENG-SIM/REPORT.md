# ENG-SIM: the bots ask the GAME how a press flies (R-165.470; packet reference/packets/2026-11-26/ENG-SIM.md on the lead's branch)
Branch t-eng-sim from origin/release-0.10.3 c73cb9766. Nothing here lands on release-0.10.3, main or a release 5 branch.

## EXACT NEXT STEP (box 1 hand-over, written 2:27 PM ET): make the gate GREEN; three causes are named, fix them in this order
Box 1's two gate runs both finished RED, 0/11 (4 min 15 s each; logs were in box 1's scratchpad, the counts below). The planted leak is
PROVEN: tipMemory `sent` and `byText` changed in a probe 6 times each on 90f57a345 (no seam) and 0 times on 74ba58873 (the seam).
1. THE GATE'S OWN ARTIFACT (every world's checkpoint 0): src/game/sceneSeed.ts `seed` (line 8, drawn with Math.random, line 32) and
   `listeners3` differ between the two module worlds at import. Fix in tools/engine/probeEqual.test.ts `before`: import BOTH worlds
   under one seeded stream (`Math.random = rng(7)` before each `import(file + ...)`, put back after), so the worlds start equal.
2. src/game/clock.ts `WALK` (line 85, `{ i: 0, s: 0, c: 0 }`) and `QW` (line 86, `[0, 0]`) changed in 32 / 4 probes: read them. If each
   is a scratch buffer written before every read (no value survives a call), add it to MEMOS with that proof (a unit test that a call
   never reads them before it writes them); if any value survives a call, register it with playStore in clock.ts.
3. "the graph print changed" after 26 probes (e.g. B3 probe 150, harness 0 frame 450; 1-1 probe 170, harness 1 frame 360): a real
   leak in the harness graph. Trace it: in the watch, on a changed print, split both prints on ' ' and print the 30 tokens around the
   first difference (as firstDiff does); the likely kinds are a closure the snapshot cannot reach, an own accessor property (restore
   skips accessors), or a non-writable field. Fix at the source (save/load, or move the state onto the engine); never allow-list it.
4. Re-run the gate on a frozen worktree of the new HEAD (`git worktree add --detach`, symlink node_modules, `chattr -R +i src tools`,
   run_in_background + timeout 7200000; about 4 min). GREEN: record it under "Gate" below with the hash.
5. Then the step 1 candidate: the CI tool line (gates.yml `npx tsx --test tools/...`, about 10 min), the suite in 3 shards, tsc,
   generalitycheck, timecheck (`--range c73cb9766..HEAD`). Then step 2 (the core; packet step 2; prototype: proto-ci10-s2.patch 43-126).

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
  74ba58873 (seam): 0/11, the same minus tipMemory. GREEN: not yet (next step items 1-3).

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
