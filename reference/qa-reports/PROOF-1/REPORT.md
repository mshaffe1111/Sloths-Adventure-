# PROOF-1: does the merged engine (t-int-engine @d0276817) work? Verdict: **REJECT** (3 live defects, 2 gate gaps)
Auditor, 2026-11-12 ET (10:53), base origin/main 585ef376 (0.9.6). Every number was run here; INT-E's REPORT.md was not trusted. Evidence: this folder.
## Gate table (head d0276817, each its own process, logs/<name>.log, build with BASE_PATH=/Sloths-Adventure-/)
| gate | exit | s | result |
|---|---|---|---|
| tsc / vite build | 0 / 0 | 6 / 23 | clean; largest file 2.81 MB (queen-anim.webp), none over 4 MiB |
| chunkcheck | 0 | 0 | PASS, main 662,632 B; 37 scripts, all in sw.js's precache; 22 at the start |
| artcheck / knowncheck / generality / roadmapcheck | 0 | 1-2 | PASS each (roadmapcheck needs full history: FAILs in a shallow clone) |
| core suite (CLAUDE.md glob, 455 files) | 0 | 3600+1283 | part 1 (files 1-323): 2,613 pass, 0 fail, then stopped by the 60-min background limit; part 2 (files 323-455): 897 tests, 895 pass, **0 fail**, 2 todo (known 4-3) |
| out-of-glob tests (23 files CI never runs) | 1 | 338 | 151: 142 pass, 8 fail = **the same 8 fail on main** (diffed), 1 skip |
| seedlist 1-1 --check / tierBots / drawcheck / kbdcheck | 0/0/0/0 | 764/50/521/116 | PASS 355 seeds, 0 refused / 7 of 7 / PASS / PASS |
| clipcheck run 1 (load ~20) / run 2 | 2 / 0 | 676 / 431 | run 1: 2 screens timed out + 1 page error; run 2: PASS (83 known), 0 page errors |
| buildcheck: alone / after kbdcheck / after draw+clip+kbd (INT-E's order) / at load 34 | 0/0/0/1 | 6/5/6/15 | PASS p95 95, 92, 129 ms; at load 34 starts in 15 s, FAILs the budget only (387 ms): INT-E's "could not start" not reproduced |
| start-up, CPU x4 (EN-S startuptime, n 3) | 0 | - | head reaches the title 565 ms (cold) / 670 ms (warm) sooner than 0.9.6: no start-up regression |

## Proven
- **2. Nothing the player plays changed but intended fixes.** Stage lock head vs 0.9.6: 102 stages x 16 layouts x 2 settings = 3,264 builds,
  **0 differ** (logs/lock-compare.txt; INT-E's committed 0.9.6 lock = my own record of main, 3,264/3,264). funcheck output identical to
  main line for line (both FAIL: old World 1 debt). First-timer bot, real engine at the 30 fps step, 1-1, 1-3, 2-1..10-1, Easy+Normal:
  20/22 runs byte-identical; 4-1 and 9-1 Normal both traced to one intended fix, inputEngine.ts dropPresses() (a jump pressed during the
  life-lost hold is dropped; bots/tr91-*.txt:5652, tr41-*.txt:8018). Also intended: old flag resume starts fresh (f9ed70446); sound 0.9/0.8.
- **3. No fairness rule loosened on a shipped stage** (fairness/FAIRNESS.md: 26 changes, 9 stricter, 7 new and inert, 6 same, 2 more
  forgiving by Matt's/the audit's rule, 2 looser: nodeCode V3, unreachable (only W1 has graphs, W1 has no lessons), and the save entry size,
  not fairness). STAGE-RULES.md, physics.ts, difficulty.ts, tools/validate, every known list unchanged. No test weakened or skipped.
- **4. Runtime.** Game time = real time: the shipped loop on synthetic vsync (48-144 Hz, jitter, drops, 40-95 ms gaps) 0.998-1.001 (0.9.6
  up to 1.80x fast); live 1.0005 at 30.0 fps drawn, 1.0002 with dropped frames. Saves: 0.9.5 fixtures (regenerated from v0.9.5-37,
  byte-equal), 0.9.6 finished, 34 finds: load, save, reload, nothing lost. Clock: 102/102 stages, 600 steps, 3,762 engine fields
  bit-identical to main. Offline: a stage in every world, 0 failed requests. Sound: 4 dB a tenth; limiter -0.19 dBFS at +18 dB in.
  Android Back (Capacitor's real bridge): title, settings, save/load, how-to, satchel, worlds pop-up, map, story, stage, pause, game over.
- **5. Played** (play/summary.md): 16 runs, 390x844 and 844x390, fresh and finished saves, 1-1 to its end 8 times, 12 stages incl. boss 1-10
  and 5-M, pause, satchel, journal: **0 page errors, 0 console errors**; matched main by eye except violation 2.
- **6. Gates fail when they should.** Generality 7/7 plants FAIL. chunkcheck 4/4 FAIL (no deploy base; a start file importing main; a
  start-file loop; a file over budget). A source plant (physics.ts imports App) is re-planned into main (662 -> 1,771 KB): chunkcheck
  PASSes, chunkGate.test.ts FAILs, so the pair catches it.

## Violations (REPORT.json)
1. src/game/audioFocus.ts:12: the plugin is returned from a .then(); Capacitor 8.6's proxy answers `then`, so the promise never settles and
   want() never reaches Android (page error '"AudioFocus.then()" is not implemented on android'). EN-F audio #1 ships "fixed" and can't
   work. runtime/capThen.test.ts fails 2, its control passes. Same pattern, already on 0.9.6: appShell.ts:34 (KeepAwake).
2. src/index.css:510 (f59e72e0c, .clr-btn2 32 -> 44 px under max-height 400): sideways 844x390 with a 21 px home bar, the Stage Cleared card
   grows 368 -> 384 px and its Previous / Play again / World map row is cut off, 15 px into the home-bar inset (play/sheets/
   cmp-cleared-side-insets.jpg; main fits). clipcheck opens this card only at 915x412, so it can't see it.
3. src/components/SaveLoadDialog.tsx:157 tells the player the file saves "your sound settings"; saveFile.ts:55 no longer writes them
   (EN-F saves#8). Untrue player text; runtime/saveCopy.test.ts fails.
4. tools/engine/generalitycheck.ts:28: blind to this merge's new engine modules: a stage id planted in clock.ts, stageModes.ts, ride.ts,
   stillness.ts, noise.ts, heroNoise.ts or saveFile.ts PASSES (plant/plant-generality.log). None holds one today.
5. .github/workflows/deploy.yml:35: 4 test files this merge added (tools/engine/library, seedlist, yield; tools/inspect/travelBots) are
   outside the suite glob, so CI never runs them. They pass here (17 tests).

## Not proven, and why
- 30 fps drawn at CPU x4: head 26.9 fps (game/real 0.959, stalls dropped by design), main 27.9 (but 1.18x fast), at load 5.5 with the
  suite running; the container never went quiet. Needs a quiet run or a real phone.
- Android Back on a guardian card and the victory card (the driver never reached them); a boss fight to its end; stages past their first
  ~10 s other than 1-1; Easy in the browser. Out of time.
- clipcheck run 1's page error "Cannot read properties of null (reading 'classList')" (load ~20): gone in run 2, source not found.
- The core suite in one sitting: it ran in two parts (the first hit the background time limit at load ~20); every file ran, none failed.

## Also seen (not this merge's)
- w4Grit.ts:285 throws in a falling rock's first cycle (piece -1), losing that frame's draw; same 9 drops on 0.9.6 (runtime/w4RockBurst.test.ts).
- package-lock.json now committed (11c15e17): `npm ci` fails ERESOLVE, CI's npm install follows it, build-apk.yml:31 says there is none. reach.ts:73 cites chain.md §3, not in the tree.
