# DRESS-27b: land DRESS-27's dress fixes, then 2-7's own per-frame draw breaches fixed at their cause (PERFORMANCE-RULES §1) - TONIGHT
Engine (draw code), Opus 5.5 xhigh. A SUCCESSOR of DRESS-27 (stopped 11-23 about 3:42 PM ET at 370k real context). **BUDGET 45 minutes;
REPORT BY 4:30 PM ET; HARD STOP 5:00 PM ET.** Hand over at 320k REAL context or 28 minutes with an EXACT NEXT STEP (no exception: LANES
3b). Long runs with run_in_background (drawcheck: timeout 7200000), NEVER a shell '&', never a foreground wait; at most TWO heavy runs;
every run on a chattr-frozen worktree (D115; keep src/game/gen2/proven writable); no heredoc in a commit chain (D119). No stage id, seed
or x in engine code (generalitycheck).
READ LEAN: the top of `git show origin/t-eng-27-wip-dress:reference/qa-reports/DRESS-27/REPORT.md` (its EXACT NEXT STEP, its Gates
section, the two drawcheck-2-7-16spots files it names); PERFORMANCE-RULES §1 and §8; tools/perf/limits.json; LAWS headlines.
BASE: t-eng-27-wip-dress (newest head; items 1-3 done, judged by the lead: PASS). t-eng-27 is 09c23c1b0 or newer (ENG-BOT27b may land).
1. **Land items 1-3 (the lead's ruling: drawing only):** merge t-eng-27 (no force), tsc, the planted tests, lockall on the merged head
   (no listed stage moves), push to t-eng-27, send the lead the hash. FIRST, before item 2: BUILD-27e is waiting on it.
2. **2-7's own draw breaches (found by DRESS-27 on PRISTINE 2-7, so not its dress):** at 16 spots, 6 breaches: gradients 4.13/5.00
   at x13298 or x9061; drawImageScreens 7.61/7.90; clips 21/24 at x9061 (limits in tools/perf/limits.json). 2-7 becomes a listed stage
   tonight, so drawcheck fails on it until these are gone. Find what draws them at those spots (the stilt village, the river, the race
   piece, the column dress, the HUD's new route bar?) and fix each at its CAUSE in the shared draw code (general: fewer clips, a baked
   gradient, a cached layer), never by raising a limit (law 22) and never by moving 2-7's pieces. The look must not change: a
   before/after still at each breach spot, upright and sideways, judged by you at phone size.
3. drawcheck on 2-7 at the 16 spots PASS (0 breaches), plus drawcheck on the listed stages PASS (the change is shared), clipcheck PASS,
   tsc, generalitycheck, the planted/draw tests; land on t-eng-27 (merge, no force); send the lead the hash, the before/after drawcheck
   numbers and the stills. BUILD-27e (session_01FhBbYMxM4hHNksTiTyp7Lj) merges it before its final stills, clip and gates.
REPORT: a new top section of reference/qa-reports/DRESS-27/REPORT.md, "Polish check" first. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.
Messages carry no clock times.
