# EN-S: the code split, so the main file stops being a wall
Engine, branch `t-engine-split`, base origin/main @585ef376 (the live 0.9.6), with origin/t-engine-seedchunks @88930216 merged. Written 2026-11-11, ET. **Method used:** methods/gates.md, methods/seed-list.md (R-165.112). No gameplay code changed; `engine.ts` not touched.

## 1. Before and after (the build that ships: `BASE_PATH=/Sloths-Adventure-/ npx vite build`)
| | main script | spare under the 3,994,304 B budget | files at the start | bytes at the start |
|---|---:|---:|---:|---:|
| main @585ef376 (0.9.6) | 3,994,560 B | **-256 (OVER)** | 3 | 4,213,908 |
| + seed chunks merged | 3,968,909 B | 25,395 | 3 | |
| **this branch** | **654,549 B** | **3,339,755** | 22 | 4,207,972 |
The biggest file is now `stagekit` 716,861 B (3,277,443 spare). Full lists: `bundle-before.md`, `bundle-after.md` (module by module).

## 2. What was done
1. **Merged t-engine-seedchunks.** Its roadmapcheck failure was this container's shallow clone ("proofs cannot be checked"): with full history, roadmapcheck PASSES on the merged head, nothing to fix in the files.
2. **D45: the gate measures the file that ships.** gates.yml builds with deploy.yml's `BASE_PATH` before chunkcheck; chunkcheck itself reads the build's base off index.html and FAILS any base but the deploy's (so a plain local build cannot pass by mistake). Proof: `src/game/chunkGate.test.ts` (planted: a plain build fails with the build command in the message; gates.yml and deploy.yml held to the same base; the old gates.yml step is seen as a mismatch). Real-world plant: the new gate on main's deploy build prints `OVER 3,994,560 B -256 spare`, FAIL.
3. **Measured:** `tools/perf/bundlereport.mjs` (new; every file, module by module). Biggest: gen2/seeds.ts 195 KB, engine.ts 170 KB, protoStage.ts 147 KB, w1.ts 79 KB; 519 modules of src/game = 2.8 MB.
4. **Split: layered STATIC files** (`tools/perf/chunkplan.mjs`, read by vite.config.ts): art-urls, rolls (the curated seed table), lines, sheets, audio, stagekit, world-1/2-4/5/6/7/8-parts, oldgen (protoStage + stageGenerator), gen2, world-8, runs (Dot's flight, Meeca, chase, tide), bosses, puzzle, story; React stays `vendor`. Each layer holds what its roots import that no layer under it took, so a file imports only files under it: no import loop, and every module still runs after the modules it imports, as in one file. chunkcheck proves that on the built files (a start file importing the main script, or a loop, fails; it caught a real one on my first build, vite's preload helper). Only modules the page already loaded at the start are placed: the music, voice and sample loaders are still late files, byte for byte the sizes on main.

## 3. What is NOT done (plainly)
- **Nothing is loaded when a stage starts.** Every file here loads with the page (index.html preloads all 21, the service worker precaches them). The task asked for each world's code to load at its stage's start through one loading seam with a retry. I did not build that: the generators import every world directly (stageGenerator/protoStage/gen2 are hubs: `world-8` is 7 KB because the rest of World 8 is reached from the hub), and every Node tool (lockall, seedlist, the bots, 2,300 tests) reads them at once. Turning those imports into waits is engine work in files two other builders hold tonight, and it changes when code runs; I would not do it in an hour without the lock, the bots and a stage-start proof for all 102 stages. What this branch gives instead: the 4 MiB wall is gone (3.3 MB spare on every file) and each world's parts already sit in their own file, so a later late-load only has to change WHEN `world-N-parts` is asked for, behind the seam the seed lists use (App.tsx launchEngine).
- **Start-up cost is unchanged, not better:** the same bytes are parsed at the start (4.21 MB before and after).
- The test link (tools/testlink) has its own config and is not split (no 4 MiB limit there, and an artifact's 511-file limit); not rebuilt (the lead's step).
- No LESSONS/defect-log line written for D45 (not on this base); proposed in §6.

## 4. Checks (all on the final head unless said)
