# ENG-26: 2-6's engine pieces: the water wheel (NEW 1) and the bot skill ride-wheel (NEW 2), each proven on a planted toy on a real row.
Engine, Opus 5.5 xhigh. Written 6:03 PM ET 11-18 (by `date` in the same command); pulled forward from Fri to tonight. BOX: hash by 11:15 PM
ET (cutoff 11:30), or 50% REAL context (past 400k the lead stops you); then the EXACT NEXT STEP pushed. A FRESH member; you do not build 2-6.
Role card reference/roles/ENGINE.md. Read FIRST: reference/methods/level.md (Building rules, esp. 21 and 23), LESSONS.md once (D40, D57/D87:
call ReadNotifications whenever a notice says pending, at every push and before every report; long commands in the BACKGROUND; D59, D81,
D83, D86: the FULL CLAUDE.md check list), 2-6's final design (origin/t-design-26 reference/design/2-6.md: lines 1-30 the flights and
numbers, 51-60 the engine list) and its flight (reference/specs/sims/wheel26.ts + out/wheel26-normal.txt, -easy.txt on that branch),
PICKS-26-28.md (lead branch) for why the wheel.
WHY: 2-6 "Up the Bank Houses" is World 2's river turned upward: the river's own water wheels lift Pokey bucket by bucket up to the next
street. Nothing in the engine carries a rider on a circle today.
BASE: branch t-eng-26 from origin/t-meter-3 (42459a5c: main + ENG-24 + METER-3; ENG-24c's base too), so ENG-24's bot skills are under
yours and nothing shipped differs from main (tonight's integration head is still moving). Engine only: no shipped stage's data changes (lockall: no layout may move).
1. NEW 1 the water wheel (M, 3-4 h): src/game/wheel.ts pure (bucket i's floor at time t from {cx, cy, R, N, W, V}, as wheel26.ts's
   bucketAt); pieces/wheelPiece.ts moving each bucket and its rider by (dx AND dy) the way ridePiece.ts does (the engine's carry rule,
   engine.ts:1887/:7075); a gen2 place kind laying a wheel as a TOWER TURN with its jetty and street; its fairness check from the design's
   flights (board share 100%; step-off window >= 1.5 s a turn Normal / 2.5 s Easy; a jump-off street <= 80 px above the top floor, Easy 60;
   the pond under the sweep; no other solid in the sweep), each fault in words; a w2.ts row per wheel (R, V, N; the design's numbers:
   Normal R180 V70 N6, teach R160 V60, Easy V x 0.85, buckets 120 px, DROP 28 px). Toy: a teach wheel on a stageTable row (rule 23), its
   check RED with the street moved out of the window; GREEN as designed.
2. NEW 2 the bot skill ride-wheel (S-M, 1-2 h; tools/inspect/firsttimer.ts SKILLS): board, wait in the bucket, step off (or jump at the
   top) inside the flown window; planted toy RED without the skill, GREEN with it; tierBots must still match the testers (BOTS.md:
   reference/qa-reports/R-165.59/BOTS.md; recommit calibration only if the run row changes, and say so).
3. The look: the wheel draws with placeholder code shapes ONLY on the toy (named in the REPORT); the painted wheel, buckets and millrace lip
   come from ART-W2B before 2-6 is built (STAGE-RULES §4). Leave a clean hook (one draw function the art replaces).
4. THE CLAUDE.md CHECK LIST, EVERY ITEM, ONCE on your final head (D86): tsc, the suite (background), BASE_PATH build + chunkcheck, artcheck,
   drawcheck (every stage both ways), clipcheck, knowncheck, generality, roadmapcheck (unshallow), kbdcheck, buildcheck (alone), seedlist
   1-1 --check, the CI tool line exactly as gates.yml has it (add your tests to it), tierBots, coveragecheck, registrycheck, lockall vs
   main (no layout may move). A gate still running at your report is UNRUN (D59).
5. Note for INT-13: tomorrow ENG-285 changes the judges' air model (the in-air turn push); your toy's flights are re-run on it after merge.
6. Stills/clip on the toy: Pokey riding a bucket up, stepping off at the street, both ways; perf numbers (wheel draw cost).
REPORT reference/qa-reports/ENG-26/REPORT.md: hash, toys red/green, the fairness numbers flown, gate table, what the 2-6 builder wires and
what ART-W2B must paint (sizes in px and in Pokeys), Polish check, Learned.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM; every message carries REAL context % and a time from `date` run in the same command.
