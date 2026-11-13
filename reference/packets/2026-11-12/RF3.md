# RF3: World 1's hollow painter, two limits (the lead, 2026-11-12 4:05 PM ET). Opus 5.5 high (engine/render). Branch t-render-3.

Why: D12's designed 1-2 (and any World 1 stage with thorn hollows) shows two painter faults; bending an approved level design around a
painter limit is the wrong fix (the lead's ruling). Built on: origin/t-int-2 newest (RF2's ground fixes are in it). Replaced: nothing.
First: `git fetch origin ccr-702d3c49-i33jeq t-int-2 t-12-design`; read from the lead's branch reference/roles/README.md ("Lean output"),
reference/roles/ENGINE.md, reference/LAWS.md, reference/LESSONS.md, reference/methods/render-fix.md (follow it), reference/STAGE-RULES.md
§4 and §5b ("as good or better"), reference/PERFORMANCE-RULES.md §1.
## Done (src/game/w1Pits.ts hollowWalls; general for every World 1 hollow; no stage id, seed or x in engine code)
1. (a) A tall right wall in a NARROW hollow is clamped to a straight cut, drawing square dark blocks (1-2's stair: first hollow 63 px wide,
   stump 80 px above the floor bank; D12's polish item g). Paint the wall properly at any height a lay allows.
2. (b) A step down equal to HOLLOW_FACE_LIFT (38 px) makes the two walls one mirrored picture (1-2 beat X's 27 px dip stretched to ~38).
   The walls must read as two walls at every step height.
3. Planted tests for both; before/after stills (real page) of 1-2's stair hollow and beat X, upright and sideways, plus one 1-1 and one
   1-3 hollow to prove nothing else got worse; drawcheck within limits; the stage lock unchanged (drawing only).
Rules: drawing only, no lay change; code-drawn touches only (no new painted art); if a case needs painted art, name it and stop that part.
Push every 30 min. Stop line 7 PM ET or 40% context. Return: reference/qa-reports/RF3/REPORT.md (40 lines or fewer, Polish check with
stills) + send_message to the lead (session_01FhBbYP63h7cCX8DyW69stq), 8 lines or fewer. Check your message queue between long runs.
