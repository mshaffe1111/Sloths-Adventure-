# FIX-14d PLAN (R-165.206, take two). t-fix-14d from origin/t-fix-14c@e5e69979. Started 5:15 AM ET 11-14; box to ~6:45 AM ET or 400k tokens.
Read: LAWS, LESSONS (lead's branch: D57, D59, D61-D64), roles/README + CONTENT card, level.md, the packet, FIX-14c PLAN, FIX-14b/FIX-14
REPORTs (FIX-14c REPORT not landed at start: read when it does). Built on: t-fix-14c's tower turn (pipeline.ts towerJoin) and vineTop.ts.
No planned job this sprint replaces them (D40): this IS the fork job.
1. Reproduce the kid's fall at a turn-back (x 1036) with castBots on this head; planted test from it FIRST (red here).
2. Fix at the builder: at a turn back up, the upper storey runs on TOP_ROOM past the turn's vine toward the side he arrives from (into
   the wall where it is short). vineTop.ts topRoomShort drops the near-side exemption (a vine in front of a face counts that open end too);
   the lay test over every 1-4 roll then holds it. Check World 1 1-1..1-5 rolls / seedlist --check for side effects (towerJoin is shared).
3. castBots LIKE-FOR-LIKE: one fixed seed list built on t-fix-14b (frozen worktree) and on my head, every tier, Normal + Easy. Head no
   worse than t-fix-14b on any tier, better on the kid. Then the Easy tier stucks (FIX-14c REPORT step 1).
4. ONE relist at the end (addlevel 1-4 --relist); fork clips both ways (clip.mjs fork); full CLAUDE.md Checks on the final code head.
5. REPORT (EXACT NEXT STEP, heads, polish check, Learned). Box out: push, REPORT, stop; no gate left running (D59). Queue read at every push (D57).
