# Y2: the generator's yield after the new landing verdicts (the lead, 2026-11-12 12:05 PM ET). Opus 5.5 high (engine). Branch t-yield-2.

Why: P11 added two verdicts Matt asked for (landing.dead-zone R-165.124, bounce.no-purpose R-165.126); F12 added chain.mount
(R-165.138). They refuse rolls AFTER laying, so 1-1's fresh-seed yield fell under its floor: src/game/gen2/yield.test.ts:62 "the
yield floor" is RED on t-int-2 (11 of 30 fresh 1-1 seeds clean on both settings; needs 12; d0276817 passed). Every generated stage
inherits the generator, so a lower yield means more seed hunting on every stage (R-165.120). The verdicts are right; the generator
must stop laying what they refuse.
Built on: t-int-2 (INT-2's head after it merges t-12-fly; the lead names the commit). Replaced this sprint by: nothing.

First: `git fetch origin ccr-702d3c49-i33jeq t-int-2` and read from the lead's branch: reference/roles/README.md ("Lean output"),
reference/roles/ENGINE.md, reference/LAWS.md, reference/LESSONS.md (D43, D46), reference/TEAM.md "Cost rules", reference/STAGE-RULES.md
§1 ("No dead-zone landings", "Every piece has a purpose"). From t-int-2: src/game/gen2/landings.ts, yield.test.ts, pipeline.ts,
tools/engine/yield.ts, reference/qa-reports/P11/REPORT.md, reference/qa-reports/F12/REPORT.md.

## Do
1. Measure (about 30 min): `npx tsx tools/engine/yield.ts 1-1 --par 4` (200 seeds a setting) on the base: the clean rate and the rolls
   each rule stops, the new three by name. Message the lead the table, then go on.
2. Fix the biggest causes IN THE GENERATOR, in general ways: placement that knows the rules (do not place a pickup or landing where
   only an air-steer back reaches it; do not lay a bounce mushroom with no higher road, find or gap to serve; a chain's first cap within
   a plain hop), or repair inside a roll. Never by loosening a verdict, threshold, STAGE-RULES number or the test's floor.
Done:
1. yield.test.ts green (at least 12 of 30), and the 200-seed probe's clean rate on both settings at or above d0276817's, with a
   before/after table. If a rule makes that impossible without loosening it, report the ceiling and exactly what blocks it.
2. No verdict threshold or STAGE-RULES number changed (show the diff of the verdict and reach files).
3. `npx tsx tools/engine/seedlist.ts 1-1 --check` passes (258). If your change moves a stage a proven seed lays, STOP before
   re-recording anything and report the trade to the lead (never re-record a list to pass). The lock: only what the lead approves moves.
4. tsc, the gen2 + worlds suite, the fast gates, the generality gate (no stage id, seed or x literal in engine code).
5. 1-3 (World 1's new stage, W1C's branch t-w1-creatures) also rolls on this generator: if t-w1-creatures is on your base by then,
   report its clean rate before/after too; never regress it.

## Rules
Safe-keeping push every 45 min. Stop line 3:30 PM ET or 40% context: push and report. Return: reference/qa-reports/Y2/REPORT.md
(60 lines or fewer) and a send_message to the lead (session_01FhBbYP63h7cCX8DyW69stq), 10 lines or fewer. No PR.
