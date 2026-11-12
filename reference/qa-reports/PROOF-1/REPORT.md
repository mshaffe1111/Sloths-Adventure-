# PROOF-1: does the merged engine (t-int-engine @d0276817) work? Verdict: **REJECT**
Auditor, 2026-11-12 ET. Base origin/main 585ef376 (0.9.6). Every number below was run here; INT-E's REPORT.md was not trusted. Evidence: this folder.

## The gate table (head d0276817; each its own process; logs/<name>.log; build with BASE_PATH=/Sloths-Adventure-/)
| gate | exit | s | result |
|---|---|---|---|
| tsc | 0 | 6 | clean |
| vite build (deploy base) | 0 | 23 | largest file 2.81 MB (queen-anim.webp), none over 4 MiB |
| chunkcheck | 0 | 0 | PASS, main 662,632 B; 37 scripts all precached by sw.js; 22 at the start |
| artcheck / knowncheck / generality | 0/0/0 | 1 | PASS / PASS / PASS 29 known |
| roadmapcheck | 0 | 2 | PASS (full history; FAILs in a shallow clone: the container's, not the code's) |
| core suite (CLAUDE.md glob) | @@CORE@@ |
| out-of-glob tests (23 files, CI never runs them) | 1 | 338 | 151: 142 pass, **8 fail = the same 8 on main** (diffed), 1 skip |
| seedlist 1-1 --check | 0 | 764 | PASS, 355 seeds, 0 refused |
| tierBots | 0 | 50 | 7/7 |
| drawcheck | 0 | 521 | PASS |
| clipcheck | @@CLIP@@ |
| kbdcheck | 0 | 116 | PASS |
| buildcheck alone / right after kbdcheck | 0 / 0 | 6 / 5 | PASS p95 95/82 ms; after kbdcheck PASS 92/80 ms |
| buildcheck at load 34 | 1 | 15 | started in 15 s; FAIL on budget only (p95 387/200 ms): load breaks the budget, not the start |
@@BUILDSEQ@@

## What is proven (item: evidence)
- **2. Nothing the player plays changed, except intended fixes.** Stage lock: head vs 0.9.6, 102 stages x 16 layouts x 2 settings = 3,264
  builds, **0 differ** (logs/lock-compare.txt; both recorded here; INT-E's committed lockall-main-0.9.6.json equals my own main record,
  3,264/3,264). funcheck: head output identical to main line for line (both FAIL: pre-existing World 1 debt). First-timer bot (real
  engine, 30 fps fixed step) on 1-1, 1-3, 2-1..10-1, Easy and Normal: 20/22 runs byte-identical to 0.9.6; 4-1 and 9-1 Normal differ,
  both traced frame by frame to one intended fix: inputEngine.ts dropPresses() drops a jump pressed during the life-lost hold (audit A,
  the ghost press) (bots/tr91-*.txt line 5652, tr41-*.txt line 8018). Also intended: an old mid-stage flag resume starts the stage fresh
  (flagResume.ts, f9ed70446); sound defaults 0.9/0.8.
- **3. No fairness rule loosened on any shipped stage** (fairness/FAIRNESS.md, 26 changes: 9 stricter, 7 new and inert, 6 same, 2 more
  forgiving by Matt's/the audit's rule, 2 looser: nodeCode V3 (unreachable: only W1 has graphs and W1 has no lessons) and the save
  entry size (not fairness)). STAGE-RULES.md, physics.ts, difficulty.ts, tools/validate, every known list: unchanged. No test weakened.
- **4. Runtime.** Game time = real time: the shipped loop fed synthetic vsync (60/59.94/48/75/120/144 Hz, jitter, drops, 40-95 ms gaps)
  0.998-1.001 (main 0.9.6: up to 1.80x fast); live, at load: 1.0003 baseline, 1.0002 dropped frames, 0.982 CPU x4. Saves: 0.9.5 (fixtures
  regenerated from v0.9.5-37, byte-equal), 0.9.6 finished, 34 finds: load, save, reload, 0 lost (g10->t10 and sound keys: intended).
  Clock: 102/102 stages, 600 steps, 3,762 engine fields bit-identical to main (Math.random seeded alike). Offline: a stage of every
  world, 0 failed requests. Sound: 4 dB a tenth, limiter peak -0.19 dBFS at +18 dB in. Android Back via Capacitor's real bridge: title,
  settings, save/load, how-to, satchel, worlds pop-up, map, stage, pause, game over: right, same as main.
- **5. Played as a player** (play/summary.md): 16 runs upright 390x844 and sideways 844x390, fresh and finished saves, 1-1 to its end
  (8 runs), 12 stages incl. boss 1-10 and 5-M, pause, satchel, journal: **0 page errors, 0 console errors**.
- **6. The gates fail when they should.** Generality: 7/7 planted literals FAIL (stage id, world key, seed, x, prefix, new gen2 file,
  template). chunkcheck: 4/4 FAIL (no deploy base; a start file imports main; a start-file loop; a file over budget); a source-level
  plant (physics.ts imports App) is re-planned into main (662 KB -> 1,771 KB), chunkcheck PASSes, chunkGate.test.ts FAILs: caught.

## Violations (REPORT.json)
1. src/game/audioFocus.ts:12: the AudioFocus plugin is returned from a .then(); Capacitor 8.6's proxy answers `then`, the promise never
   settles, want() never reaches Android (page: '"AudioFocus.then()" is not implemented on android'). EN-F audio #1 ships "FIXED" and
   cannot work. runtime/capThen.test.ts fails 2/3 (control passes). Same pattern, pre-existing on 0.9.6: appShell.ts:34 KeepAwake.
2. src/index.css:510 (@media max-height 400px, .clr-btn2 32 -> 44 px, f59e72e0c): sideways (844x390, 21 px home bar) the Stage Cleared
   card grows 368 -> 384 px; its Previous / Play again / World map row is cut off at the bottom and 15 px into the home-bar inset
   (play/sheets/cmp-cleared-side-insets.jpg; main fits). clipcheck opens this card only at 915x412 and cannot see it.
3. src/components/SaveLoadDialog.tsx:157: tells the player the file saves "your sound settings"; saveFile.ts:55 no longer writes them
   (EN-F saves#8). Untrue player text. runtime/saveCopy.test.ts fails.
4. tools/engine/generalitycheck.ts:28 (ENGINE_FILES): blind to the merge's new engine modules: a stage id planted in clock.ts,
   stageModes.ts, ride.ts, stillness.ts, noise.ts, heroNoise.ts or saveFile.ts PASSES (plant/plant-generality.log). None holds one today.
5. .github/workflows/deploy.yml:35 / CLAUDE.md Checks: 4 test files this merge added (tools/engine/library, seedlist, yield,
   tools/inspect/travelBots) are outside the suite glob: CI never runs them. They pass here (17 tests).
@@MORE@@

## Not proven, and why
@@NOTPROVEN@@

## Also seen (not this merge's)
- w4Grit.ts:285: a falling rock's first cycle reads piece -1 and throws; that frame's draw is lost (runtime/w4RockBurst.test.ts: same 9 drops
  on 0.9.6). funcheck FAILs on main too (12 worse/new, 26 to lower). package-lock.json now committed (11c15e17): `npm ci` fails ERESOLVE;
  CI's `npm install` follows it (versions = a fresh resolve but 4 build-tool patches); build-apk.yml:31 still says there is none.
