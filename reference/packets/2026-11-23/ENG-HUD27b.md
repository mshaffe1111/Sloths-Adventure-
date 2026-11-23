# ENG-HUD27b: continue ENG-HUD27 - one route-order helper for 'first/last met', easyMode + verdicts.ts:142, land (2-7 TONIGHT)
Engine, Opus 5.5 xhigh. A SUCCESSOR session of ENG-HUD27 (its first session handed over at its 300k line, 2:18 PM ET). **The job's budget
spans sessions (LANES rule 3b). REPORT BY 3:20 PM ET; HARD STOP 4:00 PM ET.** Hand over at 320k REAL context or 28 minutes with an EXACT
NEXT STEP (D111, D129). Long runs with run_in_background (a suite: timeout 7200000), NEVER a shell '&' (your predecessor's own miss), never
a foreground wait; at most TWO heavy runs; every run on a chattr-frozen worktree (D115); no heredoc in a commit chain (D119); a landing
runs the suite AND the CI tool line (D126; inherited reds named with base evidence). No stage id, seed or x in engine code (generalitycheck).
READ LEAN: `git show origin/t-eng-27-wip-hud:reference/qa-reports/ENG-HUD27/REPORT.md` (its EXACT NEXT STEP, steps 1-5, and items 1-3);
LAWS headlines; LESSONS D123-D130 (D130 is this job's trap).
BASE: t-eng-27-wip-hud e4568241f (items 1-2 fix 2ca3de9b5; item 3's easyMode half: plant c06f051d7 RED, fix 90b9fbccc GREEN). NOT landed yet.
WHY (R-165.414, CONTINUOUS-IMPROVEMENT #73): three engine rules took a stage's first/last thing by x order and broke on stacked 2-7
(w2.ts:372, fixed; easyMode.ts:518-536, fixed by 90b9fbccc with its own route measure; verdicts.ts:142 'first water' =
`.sort((a,b)=>a.x0-b.x0)[0]` reads the home leg's last river, so w2Arc27's arc test goes RED 'drop.unwarned (normal): the first water at
x 1766..2462 has no Dot line' when BUILD-27c flips 2-7 to judged).
1. **ONE helper** (gen2/tower.ts beside routeOf/routeAt; name it, e.g. alongOf / firstMet): the order things are MET along the laid route
   on a routed stage, x order on a stage without a route, so every stage without a route reads exactly as today. easyMode's fill uses it
   (replace its local measure with the helper; its plant stays RED on the old fill, GREEN now).
2. **verdicts.ts:142 uses it.** dropVerdicts takes only Pick<'setting'|'policy'|'drops'> and a Drop has no y: widen what it is given (the
   route or the helper's answer) - that is YOUR technical fork, inside scope: decide, one line why, no Architect wait. A toy: first water on
   a stacked out-and-back (HOME_CODE) is the out leg's water; RED on today's x pick, GREEN after. Then w2Arc27 with judged:'normal-2-7'
   (BUILD-27c's 3 lines, or your own copy in the toy) no longer reports drop.unwarned for that water.
3. **The sweep, list only:** every place in engine rule code that picks first/last by x (a sort on x0/x then [0] or the end; a min/max of
   x used as 'first'): file:line, what it picks, whether a stacked stage can reach it. In your REPORT; it becomes the Lane 2 job.
4. lockall unchanged (no listed stage moves); the unit suite + the CI tool line on the frozen candidate; land on t-eng-27 (merge, no
   force; ENG-BOT27's R1 may have landed there first: merge it, do not drop it); send the lead the hash and the gate lines.
REPORT: a new top section of reference/qa-reports/ENG-HUD27/REPORT.md on t-eng-27-wip-hud (EXACT NEXT STEP first if you hand over).
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. BUILD-27c (session_01FhBbYLUUyHGiRtqqJtApfm) merges your landing, flips judged and re-runs 2-7's yield.
Messages carry no clock times.
