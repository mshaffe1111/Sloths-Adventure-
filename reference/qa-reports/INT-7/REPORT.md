# INT-7 REPORT (t-int-7 from origin/main@73e7bed0; lead session_01FhBbYNzGRJBDMzn6XbtQK2). Opus 5.5 xhigh. 5:24 AM ET to 5:32 AM ET 11-14: PAUSED by the lead (Matt paused the team) at 5:32 AM. Context ~12% of 1M.
## EXACT NEXT STEP (a fresh INT-7 resumes here, on t-int-7; code head 4fc09159, later commits are this report and its tools)
1. `bash reference/qa-reports/INT-7/gates/run.sh` on the head (INT-6's runner, every CLAUDE.md Check + every CI step, buildcheck LAST and ALONE;
   ~25-30 min, results line by line in gates/RESULTS.txt). Wait for it to finish (D59). GREEN, or name what is red and stop.
2. Then `bash reference/qa-reports/INT-7/tools/stills.sh <gated sha> reference/qa-reports/INT-7/stills` (frozen worktree, port 3217):
   1-1 first-run layout (list index 17 = seed 9800) + layout 1's hole, Normal + Easy, both orientations (stills-at-setting.mjs prints BUILT);
   1-4 clips gate|vines|pods|fork x Normal/Easy x up/side (tools/clip.mjs, prints BUILT; mp4 made per clip). Judge every frame, then REPORT.
   tools/clip.mjs is UNPROVEN: the fork mode's finder was fixed (three creak boughs 130 px apart stepping down 50 px: on 1-4 layout 0 they
   are x 354/484/614, y 6181/6231/6281) but never run after the fix; the sideways engine wait is also unrun. Run one clip first.
## Done (evidence)
- **Merge 1, origin/t-polish-5@471bd000** (4be13fac). Precondition: its REPORT GREEN on e1bb16b. t-polish-5 does NOT contain main: two merge
  bases (f9671e3b INT-6 and d8d6a973 0.9.7), and the default merge read a virtual base and conflicted in 10 files where only ONE side had
  changed (pipeline.ts 19 hunks, engine.ts, types.ts, provenIndex.ts, castPlay.ts, playRecorder.ts, App.tsx, ctestSurvey.test.ts, 2 handoffs).
  Checked: main = f9671e3b + 8 files (package.json 0.9.8, #ctest 1-5 in playRecorder/App/ControlTestGate, ctest tests, whatsNew, ctest-1-5.webp)
  and t-polish-5 changed none of those 8. So the true 3-way result is t-polish-5's tree + main's own delta since f9671e3b, built that way
  (read-tree + apply, all 8 applied clean; `git diff --cached origin/t-polish-5` = exactly those 8 + PLAN.md). Nothing taken wholesale blind.
- **tsc RED on t-polish-5's own head (found, fixed, 4d2fd0fd-style docs commit):** reference/qa-reports/POLISH-5/item2/mainscan.mts imports a
  scratchpad worktree that no longer exists; tsc reads reference/ and failed 6 errors. POLISH-5's gates ran on e1bb16b, BEFORE its report
  commit added the file (D53 again). Renamed to mainscan.mts.txt (POLISH-5 kept its other evidence script the same way, w1Overhang.test.ts.txt).
  tsc 0 after.
- **Merge 2, origin/t-fix-14b@d3501970** (4fc09159). Precondition: its REPORT GREEN on adae2f3d. One conflict, provenIndex.ts: POLISH-5 relisted
  1-1/1-2/1-3/1-5, FIX-14b relisted 1-4; each side's own version line kept (1-1 6518cfac, 1-2 07470274, 1-3 d1375548, 1-4 6b772e6e,
  1-5 957ac56d). engine.ts auto-merged: FIX-14b's lines (side push while climbing ~2102, head stop under a shut gate ~2136/2153, the unlit
  flag's aura ~5987) sit apart from t-eng-base/feel-cam's hunks (read both diffs). castBots.ts/castBots.test.ts identical on both (LEN-14).
  tsc 0.
- **Step 2, every seed list --check on 4fc09159: all PASS, no relist needed** (gates/check-1-*.log, gates/checks.txt): 1-1 257/257 (its
  --check also rebuilds the first-run lock FIRST_RUN_11 on both settings and fails first-run.drift by name: so the lock is consistent),
  1-2 100, 1-3 100, 1-4 100, 1-5 150; "the verdicts refuse 0" on each.
## UNRUN (named plainly, D59): nothing is left running.
- The full Checks: unit suite, build (BASE_PATH), chunkcheck, artcheck, knowncheck*, generality*, roadmap*, kbdcheck, registrycheck, the
  9 engine-tool tests, tierBots, drawcheck, clipcheck, buildcheck. (*the seconds-long fast gates ran on the report commit only, below.)
- Every still and clip (step 4 of the packet). The lead has nothing to judge yet: NO test link from this head.
## Fast gates on the report commit (docs + tools only since 4fc09159): FASTGATES_LINE
## Polish check: none possible yet (no stills shot).
## Pushback
- The packet's "Resolve every conflict by reading BOTH sides' intent" was right and needed more: 9 of the 10 conflicts were not real (only one
  side changed); the cause is t-polish-5 branching from t-int-6 while main took t-int-6 through a release merge. Next integration packet:
  base the work branches on main after each release, or tell the integrator to diff main against the shared base first.
## Method update (proposed, gates.md / release.md)
- Before an integration merge: `git merge-base --all`; with two bases, diff main against the member's base and merge as member tree +
  main's own delta when the sets are disjoint (proved by `git diff --cached <member>` listing only main's files).
- A member's GREEN is for the commit it names: tsc reads reference/, so a report commit that adds a .ts/.mts evidence script must re-run tsc
  (POLISH-5's mainscan.mts); evidence scripts that import scratch paths are saved as .txt.
**Lessons applied:** D29 (every seed list checked before any link), D36 (frozen worktree for stills), D53 (fast gates before the docs push),
D57 (queue read at start; the pause read when it came), D59 (no gate left running; UNRUN named), D62 (shooters print BUILT), D64 (context
against 1M), LAWS 3, 5, 22. **Method used:** gates.md, INT-6's runner and stills layout.
