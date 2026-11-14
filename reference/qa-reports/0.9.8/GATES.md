# 0.9.8 gate table, release-0.9.8 @585f2211 (detached worktree, CI=1 FORCE_COLOR=1, 4 CPUs; 11-13 9:10 to 9:51 PM ET)
Logs: `gates/`. Candidate = origin/main@d8d6a973 + origin/t-int-6@f9671e3b (merged, no conflicts) + #ctest 1-5 / version / What's New
(aa4d04b0, 585f2211). Runner: `gates/run.sh`. An earlier run on aa4d04b0 was stopped at 9:10 PM when the keeper's words changed the head.

| # | Gate | Exit | Result |
|---|---|---|---|
| 1 | tsc --noEmit -p . | 0 | PASS |
| 2 | full suite (deploy.yml's file list), 3 shards | 0,0,0 | PASS: 3,288 tests, 3,286 pass, 0 fail, 2 todo; `todo:` markers 3 = main's 3 |
| 3 | BASE_PATH=/Sloths-Adventure-/ vite build; no asset over 4 MiB | 0,0 | PASS: 0 files over 4 MiB |
| 3b | chunkcheck (base /Sloths-Adventure-/) | 0 | PASS: least headroom stagekit 787,265 B, 3,207,039 B spare |
| 4 | npm run build:store | 0 | PASS: "dist has no tracking, ads, collector, service worker or outside addresses" |
| 5 | artcheck | 0 | PASS |
| 6 | knowncheck | 0 | PASS |
| 7 | roadmapcheck (unshallowed, every branch fetched) | 0 | PASS |
| 8 | clipcheck | 0 | PASS (83 known, as main), 269 s |
| 9 | drawcheck | 0 | PASS, 440 s |
| 10 | funcheck (not in CI) | 1 | **FAIL, WORSE than main**: candidate 25 worse/new, 46 to lower/delete; main d8d6a973 17 / 28. New vs main: 1-4 normal+easy "nothing bites" 16/16, "nothing new" 16/16, easy "pacing" 16/16, normal "pacing" 16 (known 14); 1-3 normal "nothing bites" 5/16, easy 8 (known 1); 1-5 normal "dead walk" 16 (known 15). Gone vs main: 1-2 easy "like the stage before". Lead 9:57 PM: asking Matt to accept it as named; R-165.222 tests the tool on 1-4/1-3 after the release. MATT_FUNCHECK |
| 11 | lockall --layouts 16 --intended 1-4,1-5 --check lockall-main-0.9.7.json (main d8d6a973, recorded 9:09 PM, self-check 102/102) | 1 | 99/102 unchanged; changed: 1-4, 1-5 (intended) and **1-2** (FIX-B d3c63212 R-165.174 chain cap + ADD-LEVEL 678219f4 1-2 seed list, both in t-int-6). The lead ruled 1-2 intended (9:57 PM). |
| 11b | lockall --layouts 16 --intended 1-2,1-4,1-5 --check lockall-main-0.9.7.json, same head | 0 | PASS: 99/102 unchanged; only 1-2, 1-4, 1-5 (9:59 PM) |
| 12 | kbdcheck | 0 | PASS, 161 s |
| 13 | buildcheck | 0 | PASS: 1-1 p95 108 ms normal, 68 ms easy (budget 150) |
| 14 | every seed list --check (registrycheck --lists) | 0 | PASS: 1-1 257, 1-2 100, 1-3 100, 1-4 100, 1-5 150 |
| 15 | registrycheck | 0 | PASS: 5 stages registered everywhere |
| 16 | tierBots.test | 0 | PASS 7/7 |
| 17 | seed-pin tests (release.md step 6) | 0 | PASS 31/31 |
| 18 | generalitycheck | 0 | PASS |
| 19 | CI tool tests (library, seedlist, yield, travelBots, library13, castBots, routeHumps, libstage, registrycheck) | 0 | PASS 73/73 |
| 20 | #ctest page on 585f2211 (vite, Playwright, script.google.com blocked) | - | alt "Pokey crossing a row of creaky limbs above the roots", ctest-1-5.webp, Start opens 1-5, upright 412x915 and sideways 915x412, 0 page errors, 0 posts |
