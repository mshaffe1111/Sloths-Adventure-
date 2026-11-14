# INT-7 PLAN (t-int-7 from origin/main@73e7bed0; lead session_01FhBbYNzGRJBDMzn6XbtQK2). Opus 5.5 xhigh. Started 5:24 AM ET 11-14; plan pushed 5:25 AM.
Box: 90 min (to ~6:54 AM ET) or 400k tokens. Context now ~5%.
Precondition checked: POLISH-5 REPORT GREEN on e1bb16b (t-polish-5@471bd000); FIX-14b REPORT GREEN on adae2f3d (t-fix-14b@d3501970).
1. Merge origin/t-polish-5@471bd000 (it does NOT contain main 73e7bed0: base f9671e3b, 190 ahead), then origin/t-fix-14b@d3501970
   (base 73e7bed0, 30 ahead). Every conflict read both ways; tsc after each merge.
2. Every seed list --check (registrycheck --lists); any list that no longer replays: relist --merge --in-order, named. tierBots PASS;
   first-run lock (1-1) consistent.
3. Full CLAUDE.md Checks + CI steps once on the merged head (gates/run.sh, INT-6's runner); buildcheck LAST and ALONE. GREEN or name red, stop.
4. Stills + clips, built setting printed by the game (POLISH-5's stills-at-setting.mjs / FIX-14b's clip.mjs), upright 412x915 + sideways
   915x412, Normal + Easy: 1-1 first-run layout + a hole climb; 1-4 fig gate push+snap+try over, two vines, a pod tell+fall, the fork.
5. REPORT.md with EXACT NEXT STEP; no gate left running at stop (D59).
