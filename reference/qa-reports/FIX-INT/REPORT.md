# FIX-INT report: tonight's 3 unit reds at their roots (t-int-5 from t-int-4; src was 2bb29f8d)
Method used: reference/methods/gates.md (read a breach), audit-fix.md (root, planted red then green). Lessons applied: D7/D24 (fact in code,
grep the tree), D52 (cites re-checked last: two were off and fixed), D57 (queue read at each push), D59 (no gate left running), LAWS 22.

## Done-items (each: root, fix, red before / green after)
1. **w1CutArt.test.ts:60** TypeError 'filter'. Root: c31ece1b (B15) added `dressMarks` to `w1Finish` (w1.ts:1543) through `as never`; w1Finish
   takes a toy stage of bare platforms (w1.ts:1539), dressMarks read `st.collectibles.filter` unguarded. Fix 33584f4d: collectibles optional,
   read `?? []` (w1Marks.ts). Red: TypeError at w1Marks.ts:35; green: w1CutArt 4/4. The planted stone-over-air case unchanged.
2. **vineFollowUps.test.ts:163** "found 0 control-test lianas". Root (not #ctest moving to 1-3): R-165.151, FIX-B 03c3a59a / f173d0c3 deleted
   the control course whose 'Swing' stretch (chain(1) then chain(2) over a soft hollow) this test read via #ctest 1-2; FIX-B's trim missed it.
   Fix b6a5b9d8: re-pointed at 1-6's 'Learn: swing over soft moss' beat (protoStage.ts plan 'proto', the same chains, live). Assertion and the
   >= 2 floor unchanged; 6 lianas x 4 modes x 8 s, all stay on the vine (probed: the swing is real, swingFor -> r.swing + r.frame).
3. **stageQuality.test.ts:58** "World 1 median 180 s". PUSHBACK.md (numbers per stage, base vs now). Lead ruled 4:49 PM; applied 37133345.
   STILL RED one line down (:64 "World 2 is shorter than World 1"): see PUSHBACK.md second section; waiting on the second ruling.

## Gates on the head (my one game-code file: w1Marks.ts)
tsc PASS; knowncheck PASS; generality PASS; roadmapcheck PASS (after unshallow); vite build (BASE_PATH) PASS; chunkcheck PASS; artcheck PASS;
kbdcheck PASS; seedlist 1-1 --check PASS (257); engine tool tests 33/33; tierBots 7/7. buildcheck FAIL p95 155 ms (budget 150) run while
the unit suite loaded the CPU: re-run on a quiet machine below. Unit suite: (filled at the end). drawcheck / clipcheck: (filled at the end).

## Polish check
No screen changed: a null guard (no real stage lacks collectibles) and two test files. No stills owed.

## Pushback
The packet's root for red 2 (#ctest plays 1-3) was not the cause: the control course was deleted (FIX-B). 1-5's "designed 206 s": no source found.

## Learned / Method update
- A `st as never` call hides a type the callee needs; a cast at a call site gets a null-safe callee or a test with the thinnest caller.
- A deletion packet greps every reader of what it deletes (here `beats ... 'Swing'` and `#ctest` in tests), not only the builders.
- A test band copied from a generator's own target (stageTime.ts) is not a rule; check STAGE-RULES before treating it as one.

## Unresolved
(filled at the end)

## Turnover note
(filled at the end)
