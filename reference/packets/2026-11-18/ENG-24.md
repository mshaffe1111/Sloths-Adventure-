# ENG-24: 2-4's two NEW engine pieces, proven on planted toys before the builder (rule 21/23). Engine, Opus 5.5 xhigh.
Written 11:12 AM ET 11-18 (by `date`). BOX: hash to the lead by 4:30 PM ET, or 50% REAL context (stop with the exact next step pushed).
Role card reference/roles/ENGINE.md. Read FIRST reference/methods/level.md (Building rules), reference/design/LEVEL-BAR.md, LESSONS.md once,
then the final design `git show origin/t-design-24:reference/design/2-4.md` (WHOLE: the flights, the fairness numbers, the Engine line 50-56)
and its flight `git show origin/t-design-24:reference/specs/sims/swingLog.ts`, then DESIGN-24-25's REPORT (the lead's four rulings: the
GAP between logs is the knob; the real tap hop is 0.43 s / 106-119 px, never FakeInput's 0.30/83, R-165.284).
Branch t-eng-24 from origin/main (6e7b85f8). Engine work only: you do NOT lay 2-4 (its builder does, tomorrow).
1. NEW 1, the liana over a river (M): a gen2 place kind for a liana whose landing is a river window (today w2Perch place 'land' always lays
   a bank), by data in gen2/riverLay.ts + pipeline.ts + a w2.ts row; general (no stage id or x: generalitycheck). Its fairness check as the
   design says: held to the DROP share, not riverFaults' hop rules: Normal >= 40% of let-go moments land on a log and worst wait <= one swing;
   Easy >= 85% and <= 0.6 s; a log row <= 80 px/s where a catch from the log leads on (Easy). Toy: a liana over a `long` river on a
   stageTable test row; the check REFUSES it with the logs taken out (planted: red).
2. NEW 2, bot skills (S-M) in tools/inspect/firsttimer.ts SKILLS: `drop-on-log` (let go when the landing will be on a log) and
   `vine-from-log` (jump from a moving log to a liana), each on a planted toy that goes RED with the skill removed; driven through the
   real input timing (InputEngine), not FakeInput's press.
3. Nothing shipped may move: lockall vs main (every stage unchanged; any move = stop and tell the lead), tsc, the suite once, generality,
   knowncheck, roadmapcheck, coveragecheck (the meter must price a liana-to-log drop: if it can't, name the missing channel, METER rules).
4. Clips: the toy row both ways, the bot dropping onto a log and catching the next vine from it (so the lead sees the feel, R-165.271).
5. engine-core.md: the two pieces, their data, their fairness rule. Probe scripts relative imports (D83).
REPORT reference/qa-reports/ENG-24/REPORT.md: hash, gate table, the toys (red/green proof), clips, what the 2-4 builder needs, Learned.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM; every message carries your REAL context %. Times from `TZ=America/New_York date`.
