# INT-E: the 11-11 engine work merged into one branch, full gate. `t-int-engine` from origin/main @585ef376 (0.9.6), 2026-11-12 ET
Final code head **f8f467f5** (this report and the ROADMAP row after it). Each merged branch's report: reference/qa-reports/EN-S, EN-F, EN-W, AS-2.

## Merges (MERGE, never rebase; pushed after each)
1. **t-engine-split @0e45a527** -> e0f0a84a: no conflict.
2. **t-engine-fixes @f85a8729** -> f47b7aeb: CLAUDE.md Checks line; kept both (the split's deploy-base build, the fixes' generality gate).
3. **t-engine-wire @9e3ddc56** -> ab3fbdc0: engine.ts (help ladder: the fixes' `this.easy` + the wire's travel mode), helpLadder.ts (`unshown()`
   + `stood(at: Mark)`), tools/engine/seedlist.ts (the split's lazy list files + the wire's listed row, quiet judge, yield), methods/README.md
   (both rows), REPORT.md (to qa-reports/EN-F, EN-W). Semantic: `withTestStage` wrote into `PROVEN_SEEDS`, which the split removed; it plants
   via seedList.ts `plantSeedList` (test-only). Chunk plan (483f55fb): the wire's one new START module, stageModes.ts, put in `stagekit`
   (main 663,787 -> 662,675 B); its other new modules are not loaded by the game yet; clock.ts was already in stagekit.
4. **t-assets-art82 @144924b7** -> 70a5c8a0: REPORT.md only (to qa-reports/AS-2).
5. **R-165.122 from 2a988785** -> 9d9ebc94, **reverted** (3616dfd9) on the lead's ruling (A), 7:54 AM: see "For the 1-1 track".

## Fixes made here (the lead approved each, 7:40 and 8:41 AM)
- **Generality gate green, nothing loosened** (fd3a2703, e4874223): the seed-list exemption follows the list to proven/ + provenIndex.ts;
  **gen2/worlds/stageTable.ts** (world data): one row a stage (kit by name, flags, judged scope, stand-in), read by LISTED, JUDGED, standIn;
  **WorldManifest.pitPainter** (World 1: 'w1Pits') replaces 4 `world === 1` in dropsOf. Known debt vs the fixes' head **27 -> 21 entries,
  38 -> 29 literals**.
- dcf00d7c: w6to10/manifest.json's 6 size pins follow the approved q82 files (artCutin.test; art82 had not run the unit tests).
- f8f467f5: w1World() carries pitPainter (I had missed it: library.test 0/12; hurtFloor.test now pins it; 1-1's drops and verdicts hash
  the same at merge 4, before and after, 32 builds); seedlist.ts loads a list only where the index names one, so a listed stage with no
  list fails by name with '0 proven seeds' again (seedlist.test).

## The gate, run 2 on the final head f8f467f5 (BASE_PATH=/Sloths-Adventure-/; seconds, ET end)
| gate | exit | s | ET | result |
|---|---|---|---|---|
| tsc | 0 | 2 | 08:37 | clean |
| vite build | 0 | 4 | 08:37 | no asset over 4 MiB |
| chunkcheck | 0 | 0 | 08:37 | **main 662,675 B, 3,331,629 spare**; 40 JS files, 22 at the start, no loop |
| artcheck / knowncheck | 0 / 0 | 0 | 08:37 | PASS / PASS (generality list new on main: 29) |
| roadmapcheck (full history) | 0 | 2 | 08:38 | PASS; again PASS after the R-165.139 row |
| generality | 0 | 0 | 08:38 | PASS, 29 literals, 29 known |
| lockall --check vs 0.9.6 | 0 | 545 | 08:47 | **102/102 unchanged** |
| core suite (CLAUDE.md glob) | 0 | 1531 | 09:03 | 2,965 tests: 2,963 pass, **0 fail**, 2 todo (known) |
| tools + mixer tests | 1 | 41 | 09:04 | 144: 135 pass, 8 fail **same on main** (R-165.139), 1 skipped |
| tierBots | 0 | 16 | 09:04 | 7/7 |
| funcheck | 1 | 39 | 09:04 | FAIL, **identical to main** (every flag and count; 12 worse/new, 26 to lower) |
| seedlist 1-1 --check | 0 | 203 | 09:07 | PASS, 355 seeds |
| drawcheck | 0 | 270 | 09:12 | PASS |
| clipcheck | 0 | 234 | 09:15 | PASS (83 known) |
| kbdcheck | 0 | 109 | 09:17 | PASS (its rewritten stills not committed) |
| buildcheck | 2 | 121 | 09:19 | could not start its page in 120 s right after kbdcheck; **alone at once: PASS** p95 89 / 83 ms |
Run 1 (3616dfd9) found the three defects fixed above. Its drawcheck lost 2-6 to a reload when I edited w1.ts under its dev server.
**Open, next session:** buildcheck fails to start in sequence after kbdcheck (twice, both runs; alone it passes in 5 s, twice): the tool's
cold dev server, not the game, but unproven. **Same on main (R-165.139):** mixer/stumps.test 'a log on a stump is thin...'; validate.test
route x3 and beats; world1.test 'everything feels the same', 'nothing bites, the truer rule', 'padding' (main run: --test-concurrency=1).

## For the 1-1 track: R-165.122 (hop rocks) is commit 9d9ebc94 on this branch (reverted by 3616dfd9)
- `seedlist 1-1 --check`: PASS at merge 4 (70a5c8a0, 355 seeds); FAIL right after 9d9ebc94: 36 of 355 seeds break (22 replays differ from
  their search, 14 over the 4 s quiet line, both settings). seedListLoad.test: green at 70a5c8a0, red after: 4106 (first run, stand-in) no
  longer replays, Play falls back to a fresh search. Lock with it: only 1-1 moved (101/102).
- The code: hopRocks.test 11/11 (892263da's correction; 2a988785's own test fails 4/11 at its own commit), 0/11 with hopLay off.
- Lands with the 1-1 list rebuilt, the first run re-picked, the calibration recommitted, and R-165.124 (one rebuild for both).

## Matt's test link
EnK5 **v249** from f8f467f5 (fresh worktree, bun install --frozen-lockfile): 494 files (cap 511), the published set checked equal to the
build. Smoke on it: 0 page errors; title, 1-1, 4-1, 7-1 drawn upright 390x844 and sideways 844x390 (stills looked at). R-165.125 sound in.
