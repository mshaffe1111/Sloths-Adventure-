# ENG-B4: 1-8 "The Long Branch" chase engine, finished so the next lead's first level builds on a ready engine (R-165.206 chase; Matt 11-14: engine global, pieces before levels). Opus 5.5 xhigh (engine). Written 1:53 PM ET 11-14 by the lead.
Branch t-eng-b4 from origin/t-eng-b3@71da15cd (CHASE-LAY in, GREEN but buildcheck R-165.207). READ FIRST: reference/qa-reports/B3/REPORT.md
(Suggestions 0, a, b, c; Unresolved) and B2's REPORT on t-b2-chase@42d2d7a6 (EXACT NEXT STEP 1: the tint baked once per screen size,
lead approved C4 = glow at the break), the design reference/design/1-8.md on origin/t-1718-design, level.md rules 21-22, D40, D63, D69.
Build in order (D40), every piece for ANY stage that lays K, no stage id/world/x (generalitycheck):
1. Split stretches by the realised run-up (B3 suggestion 0), with a floor for a short last stretch (a); CHASE-FINISH marks the finale.
2. The lay check that no section dressing or creature patch spans a chase section (b); the pit floors under a stretch (B3 Unresolved).
3. The tint: C4 glow at the break, baked to a cached canvas once per screen size (drawcheck limits hold; PERFORMANCE-RULES §1).
4. Whatever 1-8.md needs that the engine lacks (the rolling nut, the bouncing fruit, the chase camera lead): grep what exists first (D66);
   build only what is missing, each a piece with a planted test.
5. BOTS FIRST (level.md rule 21): the first-timer and tier bots run a chase stretch (keep running, hop the nut, pass under the fruit) in a
   planted toy test in CI, BEFORE any level lays it.
6. A fixture stage that lays K for clips (until w1Arc08 exists): CLIPS both ways, both settings, of a chase stretch, the tint at the
   break, a caught run (heart, last flag, branch whole); name the frame where each happens (D69). Add the fixture to drawcheck (c).
7. Gates scoped by what you touched (LAWS 5, Matt 11-14): tsc, full unit, every seed list/bot/lock your change moves, perf gates only if drawing or build changed (buildcheck ALONE); the integrator runs the full set.
REPORT: what a 1-8 builder can lay now, beat by beat against 1-8.md, and EXACT NEXT STEP. No until/sleep wait loops (D67); read the
queue at every push (D57). BOX: 2 hours or 40% context (400k of 1M by the real figure). Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
