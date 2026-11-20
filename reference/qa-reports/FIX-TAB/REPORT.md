# FIX-TAB REPORT (R-165.344): the grass tab under World 1's painted stones, fixed at the root in the draw
Engine (draw). Branch t-fix-tab (base 453b69c2, merged t-int-14 ca74f4fa: no code). Updated 2:54 PM ET.

## EXACT NEXT STEP
Stills before/after per world running (tools: /tmp scratch, servers 3103 = 453b69c2, 3101 = this branch); lockall base recording on
453b69c2. Next: judge stills, commit them under stills/after-fix/, then gates in order (see table), then this report final.

## Done-items
| # | Item | Evidence | Status |
|---|---|---|---|
| 1 | Fact + on main | FACTS.md §1 | done (2:38 PM) |
| 2 | Count | FACTS.md §2: 100 tabs, 16/72 builds, 1-6 + 1-7 | done |
| 3a | Root fix in the draw | protoArt.ts stepDownTo + faceCut; drawGround lower() and drawBankArt side() call them | done 8d0ecd05 |
| 3b | Planted RED | groundSeams.test.ts 'R-165.344': planted (first lower bank) = 21 visible lip rows, FAIL; fix = 0, PASS (probe/planted-red.txt) | done |
| 3c | Reach in every world | probe/endsteps.ts: 425 open bank ends change step: W1 100 (1-6, 1-7), W5 8 (5-M), W7 53 (7-5, 7-9 Easy), W8 264 (8-2/3/5/6/9); W2-4, 6, 9, 10: 0 | done |
| 3d | Before/after stills | pending | |
| 3e | Gates | pending | |
