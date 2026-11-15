# POLISH-11: background strips cut at their wrap, and the flag's gold ring (R-165.237b/c). Opus 5.5 xhigh (art pipeline + drawing). Written 4:15 PM ET 11-14.
Branch t-polish-11 from origin/t-int-9@fb409960 (it has tools/art/stripjoin.py from INT-9 and POLISH-10's re-join). READ ONLY:
reference/qa-reports/INT-9/haze/strip-joins.txt (61 of 150 strips with cut rows, ranked) and POLISH-10's REPORT "STRIP-JOINS" and
"FLAG-RING" packets (reference/qa-reports/POLISH-10/REPORT.md).
1. Strips: start with the shipped worlds' strips that are on screen today (w1sunrise-mid 1-3, w1rain-mid 1-2/1-5/1-8, w1-mid, then w2mist,
   w3sinkhole, w6dawn, w8sunset). For each: a still on the real stage where the wrap shows, fix with stripjoin.py (feather cut rows) or a
   re-join, before/after still. A cut row that never shows on screen is named, not changed. Art files only; no engine change.
2. FLAG-RING: the unlit flag's gold rim reads as a hollow halo ring; try a soft filled glow (engine.ts drawWaterAndFlags / drawAura
   'take'); stills both ways on 1-1, 1-4, 3-1; pick the one that reads best and say why.
Gates scoped (LAWS 5): artcheck, drawcheck, tsc + the whole suite if src/ changed. BOX: 90 minutes or 40% context (real figure: last
result's input + cache_creation + cache_read). No wait loops; queue read at every push. Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
