# 0.9.7 gate table, release-0.9.7 @f66f32ec (detached worktree, CI=1 FORCE_COLOR=1, 4 CPUs; 11-12 11:13 PM to 11-13 12:05 AM ET)
Logs: `gates/`. Candidate = origin/main@585ef376 + origin/t-int-2@f01c76f7 + origin/t-bc-fix@5fa60568 (merged, no conflicts) + version/What's New.

| # | Gate | Exit | Result |
|---|---|---|---|
| 1 | tsc --noEmit -p . | 0 | PASS |
| 2 | full suite (deploy.yml's file list incl. src/game/art), 3 shards | 0,0,0 | PASS: 3,122 tests, 3,120 pass, 0 fail, 2 todo; `todo:` markers 3 = main's 3 |
| 3 | BASE_PATH=/Sloths-Adventure-/ vite build, no asset over 4 MiB | 0 | PASS: 0 files over 4 MiB; largest JS stagekit 756,466 B, index 667,329 B (the first run built without BASE_PATH: the clerk's slip, re-run) |
| 3b | chunkcheck (CHUNKCHECK_BASE=/Sloths-Adventure-/) | 0 | PASS: 41 JS files, every chunk ≥3,237,838 B spare under 3,994,304 |
| 4 | npm run build:store | 0 | PASS |
| 5 | artcheck | 0 | PASS |
| 6 | knowncheck | 0 | PASS (limits 14, artUse.allow 210) |
| 7 | roadmapcheck (unshallowed, every branch fetched) | 0 | PASS (391 open, 48 done) |
| 8 | clipcheck | 0 | PASS (83 known), 271 s |
| 9 | drawcheck | 0 | PASS, 409 s |
| 10 | funcheck (not in CI) | 1 | **FAIL, named**: candidate 17 worse/new vs main's own 12 (main FAILs too: `gates/10-funcheck-main.txt`). New vs main: 1-3 "looks like the stage before" 16/16 both settings; 1-2 easy "like the stage before" 10 (known 3), 1-2 easy/normal "looks like the stage before" 16 (known 15), 1-2 easy "nothing new" 16 (main 14); 1-1 normal "pacing" 15 (main 13); 1-9 normal "nothing new" 16 (known 15). Gone vs main: 1-3 normal "repeat". Needs the lead's/Matt's acceptance; no known list touched (Law 5) |
| 11 | lockall --layouts 16 --intended 1-1,1-2,1-3 --check lockall-main-0.9.6.json (main @585ef376, recorded by EN-S) | 0 | PASS: 99/102 unchanged; only 1-1, 1-2, 1-3 |
| 12 | kbdcheck | 0 | PASS |
| 13 | buildcheck | 0 | PASS: 1-1 p95 120 ms normal, 75 ms easy (budget 150) |
| 14 | seedlist 1-1 --check | 0 | PASS: 257 seeds |
| 14b | seedlist 1-3 --check | 0 | PASS: 100 seeds |
| 15 | tierBots.test | 0 | PASS 7/7 |
| 16 | seed-pin tests (release.md step 6) | 0 | PASS 31/31 |
| 17 | generalitycheck (CI) | 0 | PASS (27 known) |
| 18 | CI tools tests (library, seedlist, yield, travelBots, library13, castBots) | 0 | PASS 56/56 |
