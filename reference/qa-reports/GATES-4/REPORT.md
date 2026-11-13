# GATES-4 report: gates on t-int-4 68ac6074 (game code = 2bb29f8d: `git diff --stat 2bb29f8d HEAD -- src/` empty), 11/13 4:11-5:10 PM ET
Run in one live session, one gate at a time (gates-int4/run.sh); logs in gates-int4/, results in RESULTS.txt here. Not fixed: runner only.
| Gate | Result | Time |
|---|---|---|
| unit suite (CLAUDE.md tsx --test line) | **FAIL** 3 of 3266: stageQuality.test.ts:50 ('World 1 median 180 s'), vineFollowUps.test.ts:163 ('found 0 control-test lianas'), w1CutArt.test.ts:60 (TypeError reading 'filter') | 1620 s |
| tool tests (the 9 files gates.yml runs) | PASS | 80 s |
| seedlist --check 1-1 / 1-2 / 1-3 / 1-4 / 1-5 (registrycheck --lists) | PASS x5 | 207 / 66 / 30 / 75 / 141 s |
| registrycheck | PASS | 7 s |
| tierBots.test | PASS | 25 s |
| kbdcheck | PASS | 153 s |
| clipcheck | PASS | 345 s |
| buildcheck, last and alone, 3 runs (budget and N untouched) | **FAIL 2 of 3**: 1-1 Normal p95 193 / 154 / 146 ms vs 150 (Easy 90 / 102 / 94) | ~10 s each |
Already PASS on 2bb29f8d by INT-3, not re-run (packet): tsc, build, chunkcheck, artcheck, knowncheck, generality, roadmap, drawcheck.
## Stills (stills/, shooter shoot.mjs from INT-3's shoot-14.mjs; seed 1, fresh save, 412x915 and 915x412 at 2x, 0 page errors)
1-4 and 1-5 x Normal and Easy x port and land x start / mid (1-4 s9 under-fire, 1-5 s8 rest-roots) / finale (1-4 s16 view-north, 1-5 s14 freshest-mark): 24 jpgs.
Seen (named, not fixed): (a) 1-5 sideways finale, both settings: the purple pool at the left ends in a hard square edge with a flat
purple block under it; (b) 1-5 upright: the ground fills about the lower 55% of the screen at every beat; (c) 1-4 Easy only, mid and
finale, both orientations: Dot's "One of these plants isn't like the others" card covers the middle of the screen (probably fired by
the shooter's jump past its trigger); (d) Pokey looks faded at most mid/finale beats: the shooter sets invincibleTimer (hurt blink), a shooter artifact, not game.
Lessons applied: D59 (no gate left running: every gate ran in this live session, buildcheck re-runs in the foreground); law 5 (none skipped).
