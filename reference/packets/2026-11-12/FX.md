# FX: flags off mushrooms + a find spot (the lead, 2026-11-12, after P12S stopped at its context line). Opus 5.5 high (engine). Branch t-fx.

Why: two engine placement faults would be on Matt's test link and in 0.9.7. Built on: origin/t-int-2 (newest; INT-2's head holds the
yield fix and P11's 258-seed 1-1 list). Replaced this sprint by: nothing.
First: `git fetch origin ccr-702d3c49-i33jeq t-int-2 t-12-design t-13-finish`; read from the lead's branch reference/roles/README.md
("Lean output"), reference/roles/ENGINE.md, reference/LAWS.md, reference/LESSONS.md (D43, D48-D50), reference/STAGE-RULES.md §1 (Matt's
flag rule: a flag before every hard beat, no span over 4,000 px; "every piece has a purpose").

## Done
1. R-165.156 FLAGS ON MUSHROOMS AND ROOTS: the rolled-flag pass (pipeline.ts, ROLLED_FLAGS) takes the furthest spot on a wide bank, often
   the floor mushroom at a chain's lip: 72 of 205 flags on 1-2 and 47 of 196 on SHIPPED 1-1 (seeds 1-8) stand on a mushroom or root
   (D12's count). Fix at the root: slide each flag spot off anything standing on its ground, keeping Matt's flag rule; a planted test.
   1-1 MAY move for flag positions only: the lock must show flags only; `seedlist.ts 1-1 --check` must still pass 258 (report the diff).
   Same for 1-3 (its 100-seed list must still pass: `seedlist.ts 1-3 --check` once t-13-finish is merged by INT-2; if flags are part of
   the replayed plan and the check fails, STOP and report: the lead decides a re-record).
2. A FIND SPOT: the stage's find (the Keeper's Bell, finds.ts; Meeca's note in World 1's 2nd stage) is placed by addFinds on any low ledge
   by a hash (1-2 seed 1: the lesson's lip, where its card interrupts the first chain). Add a general "find spot" mark a brick can carry,
   so addFinds puts the stage's find there when a brick marks one (else today's behaviour); no stage id in engine code; a test. D12
   (session_01FhBbYL2J8WMSCxDNyH7jt7) marks 1-2's twist hollow: tell it the data shape. Also the story keeper's hint text change:
   finds.ts:409 becomes "Down in the hollow, low against a root."
Gates: tsc, the gen2 + worlds suite, touched tests, seedlist 1-1 --check, the lock, generality, knowncheck, roadmapcheck.
Rules: never loosen Matt's flag rule or any verdict; never re-record a seed list without the lead. Push every 30 min. Stop line 6:30 PM
ET or 40% context. Return: reference/qa-reports/FX/REPORT.md (40 lines or fewer) + send_message to the lead
(session_01FhBbYP63h7cCX8DyW69stq), 8 lines or fewer. No PR. Check your message queue between long runs.
