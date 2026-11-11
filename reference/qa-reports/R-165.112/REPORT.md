# R-165.112: each stage's proven seed list in its own lazy chunk; 1-1's full list restored
Engine, branch `t-engine-seedchunks`, built on t-int-1-1@5dafe73b (NOT yet rebased: see Unresolved). Written 2026-11-11 17:17 ET. Gates ran on d61fb86f8 (the last code commit; later commits are this report, the proof scripts, the method and stills).
**Method used:** none existed for a list build or a chunk move; written: reference/methods/seed-list.md (every command run as written). Gates: methods/gates.md.

## 1. Done-items
1. **Main no longer depends on list length.** Same code, same build stamp, only the list differs: main **3,956,167 B with 200 seeds and with 355** (`chunkproof.mjs`: PASS, 0 packed plans in main). The list chunk: 28,958 B (200), 50,517 B (355), about 140 B a seed, so thousands fit. Before (5dafe73b, the 200 inside main): 3,981,833 B, 12,471 spare. Now at head: 3,956,183 B, **38,121 spare**. `chunkcheck`: PASS.
2. **How:** `gen2/proven/seeds-1-1.ts` (the list) + `gen2/provenIndex.ts` (count, version, `() => import()`: all main holds), both written by `tools/engine/seedlist.ts`; old `provenSeeds.ts` deleted. `seedList.ts loadSeedList` fetches it at the card (buildAhead), at startLevel, and `App.tsx launchEngine` waits for it beside the sheets (cap 3 s, once).
3. **Full list restored: 355 seeds** (C1's was 327). Seeds 1-90000 re-swept on this code: 381 pass both settings (0.42%), 26 fail the relay test's (b)/(c) and are left out, as C1 left out 25 (`list-build.json` has all three sets). **The 200 are in place** (first 200 seeds and packed plans byte-identical; the tool re-wrote the old 200 to the same version 2e98cdac), the 155 new ones after them. `seedlist 1-1 --check`: **PASS (355, 0 refused, first-run lock held)**.
4. **First run unchanged:** seed 4106 is still variant 11 (`seeds[10]`); Rolls A/B/C listed; tierBots.test PASS; the calibration was not re-run: variants 1-40 build the same stages (entries 1-200 identical).
5. **Cold offline Play loads the list** (`offlineproof.mjs` on the built game, upright and sideways, PASS 24/24 each, run as CI does): service worker precaches `assets/seeds-1-1-*.js`; offline, a new page, Play: the chunk is answered by the service worker, the order is shuffled over n = 355, the stage draws.
6. **Tests for the loader, a failed load included:** `seedListLoad.test.ts` (8: one fetch, the index names the file, failed / cut-off / stalled loads, the owed draw, build-ahead) and `seedListChunk.test.ts` (2: walks static imports from src/main.tsx; a list file reachable from it fails; planted).
7. **Gates, all PASS:** tsc; suite 2,569 tests, 2,567 pass, 0 fail, 2 old TODOs; vite build; chunkcheck; artcheck; drawcheck (310 s); clipcheck (83 known); knowncheck; roadmapcheck (after `git fetch --unshallow`); kbdcheck; buildcheck (p95 107 / 89 ms); seedlist --check; tierBots.test. Lock vs 5dafe73b: **102/102 stages unchanged**. Test-link and Play Store builds build with the chunk.

## 2. Polish / Proof (stills looked at, upright and sideways: reference/qa-reports/R-165.112/stills/)
- offline-*-2-stage.png: a drawn seed's stage, HUD and Dot's first line in place, both ways.
- failed-* and stalled-*-2-stage.png: the same stand-in layout both times (seed 4106), drawn clean. stalled-*-1b-waiting.png: during the wait the player sees the stage's own title card, not a blank or a frozen map.
- Play to first drawn frame: 5.0 s offline, 5.0 s failed, 6.6 s stalled upright (4.6 / 6.0 / 7.8 s sideways): over 4 runs a stall added 0.5 to 2.7 s; the cap is 3 s.
- Fixed on the way: my proof first read the story card as "the stage" (looked at the still, caught it); it failed under CI's colour codes (D31) and left its server on the port; the size proof failed by 1 byte when the short commit id grew from 8 to 9 characters.

## 3. Pushback (the lead's rulings wanted)
1. **A failed load does not block Play.** The packet says the list "must be precached or loaded before the stage needs it". It is, but a first visit on a bad network can lose the chunk before the service worker has it. Then 1-1 plays its **stand-in: the fixed first run (4106), by its proven plan, now in main (about 3 KB with the loader)**. Still only a proven layout, no search, no network wait, the shuffled order untouched. The alternative is a blocked Play and new player words. Rule if you want the block instead.
2. **"327" is 355**: w1.ts changed after C1's sweep. And the 26 relay drop-outs are still dropped by hand, because relay (b)/(c) live in a test file, not in the list builder (engine-core trap 4a).
3. **Out of my walls, touched because the old file is gone:** tools/perf/buildtime.ts (buildcheck's page: waits for the list), src/App.tsx (7 lines), src/game/testRound.ts, tools/inspect/helpSweep.ts, and the import line of 5 tests that read provenSeeds.ts. No test was weakened; none needed a new import (Node reads the list file on the spot: `loadNow`).

## 4. Suggestions (ready packets)
- **S1 Engine + Content:** relay (b)/(c) as filters in the list builder and `--check`. Files: seedList.ts, seedlist.ts, w1.relay.test.ts. Done: a sweep needs no hand drop; the 26 fail `--check` by name.
- **S2 Critic:** chunkproof's "no packed plan in main" into chunkcheck; offlineproof into gates.yml (90 s).
- **S3 Engine:** gen2/seeds.ts (244 KB, the curated rolls) out of main the same way: about 220 KB more room.
- **S4 Engine, low effort:** sweep 90001-340000 (about 2 h, 4 workers) for about 1,000 more seeds, added `--in-order`; then the Designer's SEED_LIST_MIN back to 300.
- **S5 Critic:** helpLadderSweep and w1.relay run the whole list: sample them before it reaches thousands (the suite took 29 min here, with the lock and --check beside it).
- **S6 owners, text only:** tools/playtesters/LOG_EVENTS.md:198, reference/roles/README.md:86, methods/gates.md row 8 and reference/qa-reports/0.9.5/lazy-seeds.py (stale) still name provenSeeds.ts; methods/README.md needs a line for seed-list.md.

## 5. Unresolved
- **Not rebased.** t-int-1-1 moved to 874f11f6a while I worked (Dot and camera). A trial merge is clean in code; the one conflict is reference/handoffs/engine-core.md (both rewrote it). I rebase and re-run the gates when the lead says t-int-1-1 passed.
- **No in-session retry in Chromium:** it keeps a failed module for the page's life (measured: 1 request for 3 asks). After a failed load the session plays the stand-in until the app is reopened. A real retry needs the list as fetched JSON with its own precache glob.
- The test link was not rebuilt (the lead's step). A stand-in play is not marked in the recorder (it shows as seed 4106).

## 6. Lessons applied
D7/D24 (read the code: the draw, launchEngine, the service worker glob, before designing), D19 (the proof runs the built game; `--check` uses the game's loader), D15 (looked at my own proof's stills; it was wrong twice), D29 (full suite and every pin after the list rebuild), D31 (ran my scripts with CI=1 FORCE_COLOR=1: one failed), D30 (times and ids pasted), D23 (base stamped; not rebased, by the packet), D2 (upright and sideways).

## 7. Method update
New: reference/methods/seed-list.md. Propose for methods/gates.md row 8: "a list is rebuilt with `--merge <file> --in-order`, old seeds first; the list is gen2/proven/seeds-<stage>.ts + provenIndex.ts". Propose a LESSONS line: "a proof that waits for a screen names the element that only that screen has, and its still is looked at before its PASS is believed."

## 8. Turnover note
reference/handoffs/engine-core.md rewritten (section 0d, the file map, traps 4, 4a, 7, the open rows) in d61fb86f8.
