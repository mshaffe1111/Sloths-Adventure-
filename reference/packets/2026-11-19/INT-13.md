# INT-13: Thursday's integration: one World 2 base with 2-4 finished, the judges fixed, 2-2's pads, 1-9's variety; every gate once; test link #2.
Integration, Opus 5.5 xhigh. Written 5:50 PM ET 11-18 (by `date` in the same command) for Thu 11-19. START: in ENG-285's slot when it reports (~3:00 PM
ET): prep merges 1-4 first, the levels as each member's REPORT lands. BOX: green head + REPORT by 8:30 PM ET, or 50% REAL context (past 400k
the lead stops you); then the EXACT NEXT STEP pushed. A FRESH member (not INT-12).
Role card reference/roles/ENGINE.md (integration half) + reference/methods/gates.md + reference/methods/release.md (merge discipline).
Read LESSONS.md once (D57/D87: call ReadNotifications whenever a notice says pending, at every push and before every report; long
commands in the BACKGROUND; D59 no gate left running at report; D79 whole screen; D81; D83; D86 the FULL list). INT-12's REPORT
(origin/t-int-12 reference/qa-reports/INT-12/REPORT.md) is how last night's merge went: read its merge table and rough spots first.
BASE: branch t-int-13 from INT-12's final head (the lead sends it; if Matt merged a release by then, from origin/main and say so).
The branches, in this ORDER (engine-only first, then the model change, then the levels; the lead sends each final hash from its REPORT):
0. t-gate-292 (65a5fc21): the painted-or-code gate (paintcheck, 3 CI parts, shrink-only paintcheck.known.json: 429 ids on 21 stages);
   its ROADMAP R-165.292 row overlaps the lead branch's by one row (keep the lead's text + its Source); CLAUDE.md's check list and
   methods/gates.md get the paintcheck line (the lead reviews the CLAUDE.md wording before merge: Matt's file).
1. t-time-168b (de3539c7; carries t-time-168): the time-stamp gate with the stage-id fix (tools + CI line; no game code). After ALL merges, run
   timecheck on the merged range and correct every breach in reference/ docs to its commit clock (TIME-168b's sweep.tsv lists 3: VAR-1/REPORT.md:4 '3:50 PM ET'
   vs 3:45; ENG-23/REPORT.md:17 and :99 '3:15 PM' vs 3:09, the last carried by t-eng-23, t-meter-4 and t-art-w2a: correct once; the lead
   did the same for 75 on 11-18): never loosen the gate.
2. t-eng-23 (9e306581): 2-3's followers (follow.ts, bring N home, heron reads the line): engine pieces, nothing shipped moves.
3. t-eng-25b (73318234; code fe3faf7e; it carries t-eng-25 21668b61): 2-5's snap stones, snapper rows, stone art, the bonk-after-the-snap
   bot skill, the meter's snap channel, and TURTLE kick only when open (no live stage lays the kit TURTLE). Its suite was NOT re-run after
   fe3faf7e (predatorCasts.test.ts re-pinned): your full suite covers it; name the result for that file.
3c. t-art-w2b (c877623e; the painted water wheel, built on t-eng-26 fa8a92bf): merge it AFTER t-eng-26's final (ENG-26b); its named risk
   (the rotated wheel's draw cost) is BUILD-26's drawcheck to judge.
3b. t-eng-26 ONLY once ENG-26b's section of the ENG-26 REPORT shows generality GREEN (ENG-26 left it red: a stage id in gen2/wheelFlights.ts:90; the water wheel + ride-wheel; the optional type fields it added are named there) and t-meter-4 /
   t-art-w2a (2-3's meter channel and frames) if their REPORTs are green: engine/tools/art only, nothing shipped moves.
4. t-eng-285: the judges and bots fly the engine's Pokey + the two bot defects; its relists and its recalibration.
5. t-fix-284: 2-2's big pads (~2 Pokeys, art = floor) + the real tap hop (2-1/2-2 relisted).
6. t-var-19: 1-9's variety (relisted on ENG-285's model).
7. t-build-24c: 2-4 finished (carries t-build-24, t-eng-24c, t-meter-3, ENG-24, and ENG-285's step-1 model).
MERGE NOTE (ENG-285, 8:12 PM): where t-eng-24c meets it, riverLay letGoFall/fallOnLog are ENG-24c's split word for word: take
ENG-285's (no `, true`); letGoCue's CUE.climbFrames goes to 0 (pressLaunchesFrom now climbs inside: double count otherwise); re-run
letGoCue.test.
Conflicts: name each and how resolved; gates.yml gets every branch's new step; seed lists and locks: the branch that owns the stage wins
(1-9 VAR-19; 2-1/2-2 FIX-284; 2-4 BUILD-24c; every other stage ENG-285's relist). After ALL merges: seedlist --check every listed stage
and RELIST any a later merge invalidated (say which and why); ONE recalibration per BOTS.md (reference/qa-reports/R-165.59/BOTS.md:
tierBots must match the testers, else stop and tell the lead) and recommit calibration-main.jsonl.
GATES ONCE on the final head, CLAUDE.md order and gates.md, EVERY item (D86) + the new timecheck: tsc; the suite (shard it; all green;
any red = fix at the source with the owning branch's evidence, never loosen); BASE_PATH vite build + chunkcheck; artcheck; drawcheck
(every stage both ways); clipcheck; knowncheck; generality; roadmapcheck (unshallow); timecheck; kbdcheck; buildcheck (alone, not beside
the suite: ENG-24c read p95 154 under load, 106 alone); every list --check; the CI tool line exactly as gates.yml has it; tierBots;
coveragecheck; registrycheck; tipwalk; funcheck (none new or worse vs main; 1-9's 9 cleared; name every flag); lockall vs main
--intended <every stage a branch owns or ENG-285 relisted> (any OTHER stage moving = stop and tell the lead); castBots 1-40 x tiers x both
on every stage whose data, list or bots moved: child/middle/expert 40/40 both or each miss traced; Easy fewer hits than Normal.
Stills for the lead's look (upright + sideways, whole screen): 2-4's raft, a let-go with the glow lit, the left river bank join; 2-2's big
pads with Pokey on one; 1-9's opening and changed beats. The meter for 1-9, 2-2, 2-4 (N + E) named vs DIFFICULTY.md.
REPORT reference/qa-reports/INT-13/REPORT.md: final hash, merge table, relists, calibration result, gate table, castBots table, funcheck
before/after, stills, every named rough spot. Then STOP: the lead builds test link #2.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM; every message carries REAL context % and a time from `date` run in the same command.
