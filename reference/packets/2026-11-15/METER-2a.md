# METER-2a: the meter refuses what it can't price, and prices World 2's rides. Engine (tools + bots), Opus 5.5 xhigh. Written 11:09 AM ET
11-15. BOX 2.5 h or 40% real context.
Role card ENGINE.md. Read level.md Building rules (21-29), then reference/design/METER-COVERAGE.md (origin/t-meter-2 b832e240; the lead
APPROVED it 11:09 AM, pushback included: the gate fails on EITHER a missing bot or a missing channel), §0, §1, §3, §4 in full, the rest as
needed; tools/difficulty/score.ts + DIFFICULTY.md on origin/t-meter-1 (cfa9019a); BOTS.md and tools/inspect/tierBots.test.ts.
Branch t-meter-2a from origin/t-meter-1, then merge origin/t-meter-2 (its doc) and this branch's head if needed (say what you merged).
Do §4 steps 1, 2 and 4 (everything tagged [2-1] plus the gate), in order, each with a planted test red first:
1. The gate (§3): coveragecheck.ts + its test + meter-coverage.json + coverage.known.json (shrink-only, in knowncheck LISTS, each entry
   with R-165.272 and an owner), the score.ts defaults (flat 2 at :638, the 0.25 'V', timedHop with no timing) turned into a thrown
   "unpriced piece <family>" on built stages; wired into gates.yml, src/game/ciTests and reference/methods/gates.md.
2. The ride channel (#20): a hop onto a moving log priced as a MOVING jump from ride.ts's board window, plus the step-off deadline (FB).
3. Bot SKILL "read a stage clock", board + step-off half (generalise firsttimer.ts:1679-1688), any world, by the tier's tester numbers.
   This changes the tier bots: re-run tierBots on 1-1 and, if anything moved, the calibration recommit (calibration-main.jsonl, BOTS.md).
   Prove nothing else moved: castBots on 1-1..1-8 before/after, list every change.
COORDINATE: ENG-W2b (session_01FhBbYKMJ748qP7xJu1dHsz, t-eng-w2b) is building the river as a gen2 section right now and adds 'ride' to
verdicts' RouteAsk; build the channel and skill on ride.ts/riverLay's existing contracts and a fixture, and message ENG-W2b the one
interface you need from it. Never edit its files; the lead integrates.
Gates: tsc, the full unit suite ALONE (timeout = its length), the tool tests CI runs, tierBots, seedlist --check on every list that moved,
knowncheck, roadmapcheck, generality. Not in this box (name them in EXACT NEXT STEP for METER-2b): steps 3, 5, 6 ([2-2] dwell + the
misread tier incl. 1-2's mid-air steering, R-165.269), step 7 (re-score W1), the hold term lambda, T50 fitted to Matt's ranking (gaps
"a little", not 8x), the tie band from the seed spread, and reproducing 1-1's per-piece r=0.94 (R-165.268).
REPORT reference/qa-reports/METER-2a/REPORT.md: gates table, what moved, Learned, proposed level.md/gates.md changes, EXACT NEXT STEP.
Progress every 30 min with real context %. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.
