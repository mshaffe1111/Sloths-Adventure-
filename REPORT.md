# REPORT: R-165.103 main JS chunk headroom (Engine, branch t-engine-chunks, 11-11)

## 1. Done-items
1. MET. `vite build`: index-*.js 4,164,567 -> **3,944,491 B**; vendor-*.js 218,749 B; rolldown-runtime 599 B; largest file under 4 MiB. chunkcheck PASS (49,813 B spare); `CHUNKCHECK_BUDGET=3944490` -> FAIL exit 1; missing dist -> FAIL exit 1.
2. MET for the web build. Offline (scratch): vite preview, SW activated and controlling, setOffline, reload, START ADVENTURE -> how-to-play -> Normal -> Skip intro -> 1-1: **0 failed requests, 101 stage frames**; vendor + runtime came from the SW. Store: `npm run build:store` exit 0 ("Store build check passed"), its dist served 1-1: 0 failed, 102 frames. Not done: an APK build (no Android toolchain here); the chunks are plain files in dist, which the APK copies.
3. **NOT MET.** Prod dist, CPU x4, fresh browser per run, builds interleaved, ports swapped once (6 batches, n 2-12 a side). Title: even (last batch 4,954 vs 5,070 ms; earlier batches -12 to +16). Stage (Skip-intro tap -> first stage-canvas draw): after slower in every batch: +448, +302, +822, about +500, and +298 ms (n 10 a side, with the tap held until the network is idle). Bar: +50 ms. No cause found: same React interop in both bundles, both production React; profiles of the window are canvas clearRect/drawImage (8 s), with no JS difference. drawcheck PASS (372 s).
4. tsc EXIT 0. Suite in 3 shards: 774 + 864 + 827 pass, 2 todo, 1 fail ("generating a stage is quick", p90 969 ms under 3-shard load) -> re-run alone: PASS. lockall --check vs main: **102/102 unchanged**. seedlist 1-1 --check PASS (138). knowncheck PASS. roadmapcheck PASS. buildcheck alone: this branch FAIL 166 / FAIL 154 / PASS 129 / FAIL 151 ms p95 Normal; main PASS 144 / 146 / 123 (main's max 159). Borderline both; counted as a FAIL here.
5. Merge note (not pushed): same vite.config.ts change on t-engine-help: 4,172,665 -> 3,952,658 B; on t-engine-e0a: 4,179,880 -> 3,959,793 B; chunkcheck PASS on both.

## 2. Polish check
Stills of 1-1 at 915x412 from the offline run and the store build: HUD, Dot's first line, Pokey and the ground all drawn; no missing art.

## 3. Pushback
- ROADMAP: R-165.103's row lives only on ccr-ca657d3c-n09zty; adding it on a main-based branch fails roadmapcheck (BUILD-PLAN's Day 1 sum, outside my walls) and conflicts with the lead's table. Not edited. State text for the lead: "in progress (t-engine-chunks: main 3,944,491 B, vendor 218,749 B; chunkcheck in gates; offline and store 1-1 pass; help/e0a fit. Open: cold stage start +298 ms at CPU x4, buildcheck borderline)".
- Done-item 3's +50 ms bar is below this harness's noise (2 s spread a side); a 50 ms call needs the in-app 'launch' split (sheets/timer/build/ready, App.tsx:986), not an outside stopwatch.

## 4. Suggestions
- Packet (Engine, medium): read the recorder's 'launch' phases for main vs this branch on a tester-link build, 20 runs each, to find or rule out the +300 ms. Files: scratch only. Done: per-phase medians, the phase that moved.

## 5. Unresolved
Done-item 3 (stage start +298 ms) and buildcheck (3 of 4 alone runs over 150 ms here). Don't merge on this report alone; the Critic should re-measure.

## 6. Method update
gates.md row 3b added (chunkcheck). Timing a stage start: hold the tap until the resource list stops growing, interleave the builds, swap ports (engine-core.md §3 trap 0).

## 7. Turnover note
reference/handoffs/engine-core.md: §1 row for R-165.103, §3 trap 0; in this commit.

Method used: static manualChunks (react, react-dom, scheduler -> vendor), nothing else. Lessons applied: D37 (claims proved on the real built game, not dev hooks), LAWS 3 (main's lock recorded first).
