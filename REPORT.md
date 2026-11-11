# E1 (R-165.58): the recorder counts uses — REPORT (Engine, attempt 1)
## 1. Done-items
1. PASS. `src/game/playRecorder.test.ts` "three double jumps and two bounces in one stage...": RealPlay, 3 doubles + 2 bounces ->
   1 `move double`, 2 `use double`, 1 `move bounce`, 1 `use bounce`; a restart makes the next one `move` again. Red on origin/main:
   `[["move","double 600"],["move","bounce 2635"]]` (2 events for 5 uses), `0 !== 2`. A second test: recorder off logs nothing.
2. PASS. `python3 -I tools/playtesters/report.py --self-test` prints exactly:
   `report.py self-test: ok (old-format row: double runs 1 uses 1, as before; new-format row: double runs 1 uses 3, bounce runs 1 uses 2)`
   Fixture rows (invented, player `fixture-A`, seed 12345): OLD = gen2, section w1-fixture-a, `move double 600`, `move bounce 2635`,
   softFall, section w1-fixture-b, finish 120; NEW = OLD plus `use double 1000`, `use double 1400`, `use bounce 2635`. The self-test
   pins the 8 lines above MOVES to what origin/main's report.py prints for OLD (diffed: identical; the only change is the new MOVES
   block). Planted: dropping 'use' from the reader turns it FAIL, exit 1. On main `--self-test` crashed (FileNotFoundError), confirmed.
3. tsc clean. playRecorder + recorderMoments: 9/9. Full suite: see Unresolved/last line (3 shards).
Also: lockall 16 layouts vs main: 102/102 stages unchanged; seedlist 1-1 --check PASS (138); knowncheck, artcheck, roadmapcheck
PASS; vite build OK.
## 2. Polish check
No screen changed (log rows and an offline report only). Nothing drawn, so no stills.
## 3. Pushback
None on the packet. Note: origin/t-w11-analyst carries a much larger report.py (+608/-56) not on main; this change is on main's
88-line file and is small (one reader branch, one print block, self_test) so it rebases onto the analyst's version by hand in minutes.
## 4. Suggestions
- (Critic/Content, LOG_EVENTS.md after A2 merges) add the row: `use <kind> <x>` — a later use of the double jump or bounce in the same
  stage (the first is `move`); R-165.58.
- (Engine) rename `moveOnce` -> `moveUsed` in a packet that may touch engine.ts:2211/4897 (the name now says less than it does).
- (CI) add `python3 -I tools/playtesters/report.py --self-test` to .github/workflows/gates.yml (outside my WRITE list).
## 5. Unresolved
- buildcheck FAILED in this container while 3 test shards + lockall ran at once (p95 212/160 ms vs 150); it times stage builds and
  my diff touches no generator code (lock unchanged). Rerun alone: see last line.
- drawcheck / clipcheck / kbdcheck: see last line.
## 6. Method update
gates.md: a timing gate (buildcheck, stageQuality "generating a stage is quick") is only read with nothing else running.
## 7. Turnover note
Here, per packet (E0a writes engine-core.md). playRecorder.moveOnce: first use per stage `move`, later `use`; stageStart() resets.
## Method used
Packet -> planted red test in RealPlay -> fix -> recorderMoments updated -> report.py reader + self-test pinned against main's output.
## Lessons applied
D37: the claim "2 events for 5 uses" proved by one pasted run on main, not taken from the packet.
