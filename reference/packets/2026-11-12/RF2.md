# RF2: World 1's ground seams before Matt's 1-3 tonight (the lead, 2026-11-12 12:05 PM ET). Opus 5.5 high. Branch t-render-2.

Why: Matt sees 1-3 on his test link tonight (about 9 PM ET). Two ground faults in shared World 1 render code would be on his screen:
1. R-165.146: a straight horizontal seam across the soil at World 1's floor line (y 580) under banks that stand above it (W1C's still
   reference/qa-reports/W1C/stills/roll-seed1-1-3-L1-trap1-1-before-upright.jpg on origin/t-w1-creatures; W1C traced it to the ground
   art drawing the floor line under raised banks, not the lay).
2. R-165.129's still-open part: earth pillars with hard seams and mismatched tones, the dark jagged pit-wall band under 1-1's low log
   upright (P11's stills, reference/qa-reports/P11/stills/ L18-*, seed 9800). t-pit-polish (now on t-int-2) may already fix some of
   it: check first, on t-int-2's real page.
Built on: t-int-2@168b9309 (render fixes and pit polish merged). Replaced this sprint by: nothing (the WebGL layer work is later and
draws the same art).

First: `git fetch origin ccr-702d3c49-i33jeq t-int-2 t-w1-creatures`; read from the lead's branch reference/roles/README.md ("Lean
output"), reference/roles/ENGINE.md, reference/LAWS.md, reference/LESSONS.md, reference/methods/render-fix.md (the method: follow it),
reference/STAGE-RULES.md §4 and §5b ("as good or better", never pixel-identical), reference/PERFORMANCE-RULES.md §1.

## Done
1. Each fault reproduced on the real page first (before stills), then fixed in the shared code, general for every World 1 stage (no
   stage id, seed or x in engine code). A planted test for each, red then green.
2. After stills, upright and sideways: 1-1 seed 9800 at the low log, 1-2 (seed 2 Normal) on a raised bank, 1-3 (merge
   origin/t-w1-creatures at the end and take trap1's frame). The lead judges them before anyone else.
3. drawcheck within limits; the stage lock unchanged (drawing only); tsc, touched tests, artcheck, knowncheck.
Rules: drawing only, no gameplay change, no new painted art (code-drawn touches only, STAGE-RULES §4); if a fault needs painted art, name
it and stop that part. Safe-keeping push every 45 min. Stop line 3:30 PM ET or 40% context. Return: reference/qa-reports/RF2/REPORT.md
(60 lines or fewer, Polish check section with stills) and a send_message to the lead (session_01FhBbYP63h7cCX8DyW69stq), 10 lines or
fewer. No PR.
