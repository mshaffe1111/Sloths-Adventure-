# ENG-26d: 2-6 "Up the Bank Houses: The Water Wheels" READY for its builder: finish ENG-26c's hand-over (tests, one RiverZone.way, G6, bots, the look, gates)
Engine, Opus 5.5 xhigh. Written 11:55 AM ET 11-21 (by `date` in the same command). A FRESH member. Release 3 (2-3 + 2-6, about Mon 11-23) waits on 2-6.
BOX: hand over at 320k REAL context (the lead reads it at 20 minutes and every 15 minutes after 250k) with the EXACT NEXT STEP; stop by 10:45 PM ET.
READ LEAN (D102): this packet; `git show origin/t-eng-26c:reference/qa-reports/ENG-26c/REPORT.md` IN FULL (your EXACT NEXT STEP is its steps 0-4;
the readiness list, fixes table and "What the 2-6 builder needs" stand); level.md rules 21, 23, 24, 26; LAWS headlines; LESSONS D57/D87, D75,
D76, D101, D102, D103, D105, D107. Code by grep and line ranges only.
**Run ReadNotifications at EVERY step boundary and at every push (D57/D87, D105).**
BASE: branch t-eng-26c at 47227d01b (ENG-26c's hand-over; code f79e86f2a). Push there.
0. ENG-26c's step 0: the two neighbouring tests that pin the old 'p' (nodeAsks.test.ts:38, nodeLetters.test.ts:51/:55) to the lead's ruling G1 = A.
1. RiverZone.way, THE LEAD'S RULING (ONE implementation, not two): t-eng-27 (origin/t-eng-27, code ad23f8b0a) and t-eng-26c gave the field the
   SAME meaning (`dir` the world's/screen's current, -1 flows left, WITH him on a way -1 river; faults judged in its own frame, the stage
   turned about the river's middle). The lead checked both comments and both riverFaults (t-eng-27 riverLay.ts:119-135 `rightwards`;
   t-eng-26c riverLay.ts:128-161 `mirroredRiver`). So: ADOPT t-eng-27's code byte for byte where the two cover the same thing (river.ts's
   `way?: -1` declaration with its comment and its place after `wheelPond`; riverLay.ts `rightwards` and its riverFaults line; levelCheck's
   hop; any riverAt/engine water reader it touched), delete your duplicate (`mirroredRiver` and its riverFaults line), and keep only what is
   yours alone (layRiver's way -1 tower laying, layRiverLeft, the pipeline's tower path). Add one test: a left leg's river and a leftward
   storey's river with the same row judge the same (same fault words). The goal: when t-eng-27 later merges onto 2-6, those hunks are identical
   (no conflict, no second meaning). If the two disagree on any real point (a frame, a sign, a backX), STOP and send me both lines.
2. G6 (ENG-26c step 2, OPEN): a stage taller than config.levelHeight is shifted, but each wheel's axle (Wheel.cx/cy, its buckets, its pond)
   is not: find the shift, move the axle with the platforms as a general piece, plant it (a tall tower with a wheel: buckets at their rim from
   the shifted axle; RED on f79e86f2a). Then the bots table on the draft row with ENG-26c's runner (reference/qa-reports/ENG-26c/wheel26Run.ts.txt;
   it hides W2_STAGES['2-6'] during the run and restores it): child E/N, middle N/E, expert N, variants 1-2, ON and OFF (SKILLS.rideWheel = false
   is the plant); every wheel both ways round (per-wheel tally, tools/inspect/wheelCrossings.ts). A test in tools/inspect in gates.yml's tool line;
   the meter's wheel channel priced on the draft row.
3. The look (ENG-26c step 3): ART-W2B's painted wheel (inventory) drawn instead of ENG-26's placeholder (wheelDraw.ts); no code-drawn stand-in may
   reach a shipped stage. Stills at 2x, both ways: a board, a ride, a step-off, a rightward wheel, the great wheel. Look at each before you send it.
4. Gates on your head: tsc, the planted tests, the CI tool line, tierBots, generality, coverage, lockall vs 0eefc707e (nothing shipped moves);
   name the rest UNRUN for BUILD-26.
REPORT reference/qa-reports/ENG-26d/REPORT.md: each step's result, the plant for each fix, bots table, stills, gates, "What the 2-6 builder needs"
(carry ENG-26c's, updated: G3/G4 are the builder's), EXACT NEXT STEP, lessons applied. BUILD-26 starts from your hash.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Rulings arrive with priority 'next'.
