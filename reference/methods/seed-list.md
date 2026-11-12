# Method: building, extending and shipping a stage's proven seed list

Last proven: 2026-11-11, R-165.112 (Engine), on t-engine-seedchunks: every command below was run as written. Owner of the last update:
the Engine member of R-165.112.

Use it when: a rolled stage's list must be rebuilt (the kit, the pipeline, a verdict or a promise changed) or grown. Read first:
`src/game/gen2/seedList.ts` (its head comment says where a list lives and who loads it) and reference/handoffs/engine-core.md §0d.

## What a list is
- `src/game/gen2/proven/seeds-<stage>.ts`: the list (GENERATED). Its own lazy chunk in the build, precached by the service worker.
- `src/game/gen2/provenIndex.ts`: a stage's count, version and loader (GENERATED). All the main script holds of a list.
- Both are written together by `tools/engine/seedlist.ts`. Never edit either by hand, never import a list file by name
  (`seedListChunk.test.ts` fails), and in a merge conflict take both files from the same side.
- **Order is identity.** Layout variant N is the list's N-th seed: the first run (variant 11 = seed 4106), Rolls A/B/C
  (testlink1_1.json) and the tier bots' calibration (variants 1-40) all read it. Seeds are ADDED after the ones already there.

## Steps
1. **Before:** `npx tsx tools/engine/seedlist.ts 1-1 --check` and note the count, `seeds[10]` and the version (provenIndex.ts).
2. **Sweep, 4 workers** (seeds 1-90000 took 45 min here with the suite running beside it; about 0.4% pass). For i = 0..3, each in the
   background, each to its own file:
   `npx tsx tools/engine/seedlist.ts 1-1 --count 100000 --from 1 --to 90001 --worker i/4 --part parts/p<i>.json`
   A worker prints one line when it ends (`kept of tried`) and writes no list file.
3. **Order the candidates:** the seeds already listed that the sweep still passes, in their old order, then the new ones, lowest
   first, as one JSON array (`cand.json`). A listed seed the sweep no longer passes is a finding: say so, and re-pick whatever pinned it.
4. **Write the candidate list:** `npx tsx tools/engine/seedlist.ts 1-1 --merge cand.json --in-order --count 100000`
   (re-lays every seed with the builder's filters; without `--in-order` the list is sorted lowest first, which moves every variant).
5. **The relay filter (not in the builder yet):** run `src/game/gen2/worlds/w1.relay.test.ts` on the candidate list with every bad
   line printed (a scratch copy with `bad.slice(0, 10)` changed to `bad`; delete the copy after). Drop each seed that (b) or (c)
   names, then repeat step 4 on what is left. On 11-11: 381 swept, 26 dropped, 355 listed.
6. **Prove nothing moved:** the first N seeds and their packed plans equal the old list's (compare the files), `seeds[10]` is the
   first run's seed, every roll in testlink1_1.json is listed.
7. **Gates:** `seedlist 1-1 --check`, then the FULL suite (every test that pins a roll or a seed; LESSONS D29), the lock
   (`npx tsx tools/engine/lockall.ts --layouts 16 --check <base lock>`: 102/102 unchanged unless the task changes a stage), the
   build, `node tools/perf/chunkcheck.mjs`, `node tools/perf/buildcheck.mjs`, `npx tsx --test tools/inspect/tierBots.test.ts`.
8. **The chunk and offline proof**, when the loader, the build config or the service worker changed:
   `node reference/qa-reports/R-165.112/chunkproof.mjs <dist with the old list> <dist with the new>` (same code, same
   `GAME_GIT_COMMIT` and `GAME_BUILD_TIME` for both builds) and `node reference/qa-reports/R-165.112/offlineproof.mjs --dist dist`.

## Traps
- The suite's whole-list tests (helpLadderSweep, w1.relay) take longer as the list grows.
- A worker started before a code change keeps the old code: restart the sweep after any change to the kit or the pipeline.
- `git rev-parse --short` grows from 8 to 9 characters when a shallow clone is deepened: two builds compared byte for byte need
  the same `GAME_GIT_COMMIT`.
