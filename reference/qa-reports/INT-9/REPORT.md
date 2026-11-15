# INT-9 REPORT (t-int-9 from t-int-8@0a9be28c; link #3). Integrator, Opus 5.5 xhigh. 3:03 PM to 4:14 PM ET 11-14. Lead session_01FhBbYNzGRJBDMzn6XbtQK2.
## STATUS: NOT GREEN YET, by design: stopped at the lead's word (4:13 PM) before item 6. Head 0c1d3cab: items 1-5, 7, POLISH-10, the journal.
## EXACT NEXT STEP (a fresh integrator, from origin/t-int-9@0c1d3cab; read handoffs/integrator.md first)
1. When the lead says ENG-16F is GREEN: merge origin/t-build-16 (the new 1-6). Keep both firsttimer.ts behaviours (BUILD-16's and 1-7's,
   already merged here); tierBots 1-1 must not move. Then R-165.238: delete the old proto 1-6 whole (protoStage.ts plan, its dotLinesData
   lines, dotTips.ts refs); re-point requiredMove.test's old-1-6 pin to the new 1-6 (it is RED today: 'shrine' wanted, 'time' got).
2. D70 line review, PASS/FAIL per line: BUILD-16b's goals.ts seal; BUILD-16c/16d's bot code (firsttimer.ts, castBots).
3. Right after the merge: libstage --seeds 8 on EVERY listed stage and every `seedlist --check` (a clean merge left 1-7 unrollable here).
4. The full gate run ONCE on the final head: gates/run.sh (copy it into a frozen worktree; buildcheck alone, last). Then castBots 1-4,
   1-6, 1-7 both settings; tierBots 7/7; lockall --layouts 16 vs link #2 (record t-int-8 in a worktree with `lockall --out`).
5. Stills + clips of 1-6 (both ways, N + E), as stills/1-7. The lead judges, then builds EnK5.
## Merges (every REPORT read; each GREEN on its own head): commit messages name every conflict and the side kept
clip 315548d1, fix-15 8afe53a9, tips a054e8e7 (6fda20c0), eng-s5 a2743943 (7f97d5fb, 23 conflicts, 4 bases), build-17 e6e64141 (030045cd, 20),
fix-15b 2ed6a692 (7df7b8e3), polish-10 e4d5abe3 (c38db32b; its root REPORT.md moved to qa-reports/POLISH-10/). Generated files re-made.
## Fixed here (each planted)
- 1-7 did not roll on the merge (3/8 clean; seedlist threw "pool is spent"): POLISH-6's settle vs 1-7's liana pits. Root: pipeline.ts
  deepen() filled a bank to a pit's floor only past a 48 px hole. Now every bank beside a pit reaches past its floor (World 9's rule), never a
  hollow log (0c1d3cab). Not the gate's reading (LAWS 22). gen2Pits.test 'any slot': red with the 48 px rule (1-7 seed 1 does not build).
- 1-7's pale haze block (the lead: not accepted): the painted mid strip w1kapok-mid (1-7, 1-9) cut its canopy at its right border.
  tools/art/stripjoin.py feathers cut rows (18.4% -> 0%); haze/before-after-1-7-beat3-normal-side.jpg.
- Journal 'hide' page: KEEPER-17b's lines verbatim, Duck intro, pose 'stand', the demo still in 1-7's tall bush with the moss
  (journal/hide-demo-before/after.png); its tip test planted red. modelgate self-test 24/24 (Matt 11-14 1:51 PM).
- 1-7 flown and judged (normal-1-7 rows, chain.md §1 + flownArcs.ts); Easy flies as easy-any.
## Evidence
- Lists --check: 1-1 162, 1-2/1-3/1-4 100, 1-5 150, 1-7 100 (judged): all PASS, no relist (before the hollow-log line; re-run in step 3).
- castBots 1-7: 108/108 hold (BUILD-17b 107/108). castBots 1-4: every pass count = FIX-15b's. tierBots: UNRUN here (step 4).
- Lock (16 layouts) vs link #2: 73/102 unchanged; the merges alone moved only TIPS' tip lines (22 stages) + 1-7; every platform change
  is the bank fix (1-3 + 17 older-world stages, bank heights only): gates/lock16-check, -merge-only, -fixonly .log.
- Partial gate run on 5593361e (stopped): tsc, build, chunk, art, known, generality, roadmap 0; shards found 3 reds: floorRoll + verdicts
  (fixed, 0c1d3cab), requiredMove (step 1). drawcheck, clipcheck, kbd, buildcheck, tooltests, tipwalk, registry, tierBots: UNRUN.
- BUILD-17 ENGINE LINES: sweepPose.ts SNAG_PERCH 56 PASS (= (880-712)/3, eaglePerch.test pins it); w17Art.ts snagB.perch PASS; engine.ts
  hero holding/hanging/rope PASS; stillness.ts hanging + rope cover PASS; castPlay.ts CastHero fields PASS.
## Polish check (stills/, clips/; built setting printed on each)
- 1-7 every beat + exit, N + E, both ways; 18 clips name the frame of the eagle's look. Eagle under the lives badge: ACCEPTED by the lead.
- 1-4: tips in real time (nothing on the floor; figs line at the gate's foot); gate + gateover with real presses: head stops, wall.
  KNOWN RED carried: from the far ledge he lands ON the shut top (R-165.212, FIX-15b's lay). 1-1 double as link #2 (Easy fills the gap).
## Pushback: none on the packet. Suggestions (ready packets)
1. STRIP-JOINS (R-165.237c, with POLISH-10's): haze/strip-joins.txt, 61 of 150 strips cut at the wrap; each strip: stripjoin.py feather or
   strip-seamless.py, a real-screen still at the join, then a gate (stripjoin measure, shrink-only known list with an R-id).
2. Integrator role card (roles/INTEGRATOR.md) from handoffs/integrator.md.
## Unresolved: item 6 and its steps; the full gate run on the final head; requiredMove.test RED (old 1-6). Lessons: D19, D29, D30
   (REPEAT x2: I typed 3:19 PM at 3:17, and 4:17 PM at 4:14 in this REPORT's first push; both corrected from date), D36, D40, D57, D59 (no run left running), D61, D62, D67, D69, LAWS 22.
## Method update: gates.md/integrator.md: roll every listed stage right after the merges, before the long gates. Turnover: handoffs/integrator.md (new), engine-core.md 0z.
