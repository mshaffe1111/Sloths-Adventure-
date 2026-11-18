# FIX-INT report: tonight's 3 unit reds at their roots (t-int-5 from t-int-4, src 2bb29f8d). Head: see the last commit.
Method: gates.md (read a breach), audit-fix.md (root; red then green). Lessons applied: D7/D24/D54 (facts in code, tree grepped), D52 (cites
re-checked last; 3 were off and fixed), D40 (no old stage lengthened), D57 (queue read at each push), D59 (no gate left running), LAWS 22.

## Done-items
1. **w1CutArt.test.ts:60** TypeError. Root: B15 c31ece1b called dressMarks from w1Finish via `as never`; w1Finish takes a toy stage of bare
   platforms (w1.ts:1539). Fix 33584f4d (w1Marks.ts: collectibles optional, `?? []`). Red: TypeError at t-int-4 w1Marks.ts:35; green: 4/4, plant kept.
2. **vineFollowUps.test.ts:163** 0 lianas. Root: R-165.151 (FIX-B 03c3a59a) deleted the control course whose Swing stretch it read; FIX-B's
   trim missed it (not #ctest -> 1-3). Fix b6a5b9d8: reads 1-6's 'Learn: swing over soft moss' (same chains, live); assertion and floor kept;
   24 real-engine runs, all stay on the vine.
3. **stageQuality.test.ts:58, then :60** (t-int-4 lines) World 1 180 s. PUSHBACK.md; lead rulings 4:49 PM (37133345: W1 cap = W10 median) and 5:03 PM (49fed4ab:
   growth step like with like, planted). Fact corrected in the ruling: World 1 is a mix (1-1..1-5 gen2, 1-6..1-9 old), and W5-W8 too.

## Gates on the head
Unit: full run 3263 pass / 1 fail (stageQuality's old body) / 2 TODO of 3266 on 30139209; only stageQuality.test.ts changed after, re-run
whole on 49fed4ab 22/22 -> 3265/3265 + 2 TODO. tsc, knowncheck, generality, roadmapcheck (unshallowed), vite build (BASE_PATH), chunkcheck,
artcheck, kbdcheck, seedlist 1-1 --check (257), engine-tool tests 33/33, tierBots 7/7: PASS. buildcheck: PASS alone (p95 147 / 150 ms;
FAIL 155 ms when run beside the suite). drawcheck PASS (599 s) and clipcheck PASS (83 known, none added; 467 s), run together after the suite.

## Polish check
No screen changed (a null guard no real stage reaches; three test files). No stills owed.

## Pushback
Red 2's packet cause was wrong (the control course was deleted, not #ctest moved). 1-5's "designed 206 s": no source found in code or B15's
reports. Both rulings assumed World 1 is all gen2: it is not.

## Unresolved
W9 after W8 is the one growth step unread (W8 holds 2 old stages, W9 no gen2). buildcheck has 3 ms spare on 1-1 Normal.

## Learned / Method update (proposed)
- gates.md: run buildcheck alone; a timing gate beside the 27-minute unit suite reads ~8 ms high.
- dispatch-packet.md, deletions: grep every READER of what is deleted (tests by beat name, #ctest), not only its builders.
- A test band copied from a generator's own target (stageTime.ts) is not a rule: check STAGE-RULES first, then ask the lead.

## Turnover note
reference/handoffs/engine-core.md section 0n (this branch).

## EXACT NEXT STEP
1. Lead: merge or carry t-int-5 into the test-link head (src changes vs t-int-4: w1Marks.ts only; tests: vineFollowUps, stageQuality).
2. Lead: confirm the like-with-like reading of the 5:03 ruling (World 1 is a mix; W9 after W8 unread), or rule otherwise.
3. Whoever lengthens 1-4 (R-165.206): re-run stageQuality.test.ts and buildcheck alone (1-1 p95 has 3 ms spare).
