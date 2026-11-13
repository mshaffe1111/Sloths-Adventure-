# ENG-ASCENT: gen2 lays a stage UP (1-4's foundation; R-165.170) (the lead, 2026-11-12 7:42 PM ET). Fable 5.2 high (role engine-fable,
Matt 11-12 6:50 PM: "Maybe get a Fable model to run it"). Branch t-eng-ascent from the FINAL integration head (the lead names the sha).

Why: 1-4 "Up the Kapok" (reference/design/1-4.md on origin/t-14-design, passed the lead's look) is the first stage that travels UP.
Today gen2 cannot lay one: pipeline.ts missionGraph throws "gen2: ascent stages run up (flow "up"): phase 2" (the TODO above it). D14
sized 8 engine pieces; this packet is the FOUNDATION, in D40 order (build what the rest stands on first; nothing here is replaced by
a later packet). First, before any tool call: read reference/roles/README.md, reference/roles/ENGINE.md, reference/LAWS.md,
reference/LESSONS.md, reference/methods/level.md and gates.md, STAGE-RULES.md, and 1-4.md sections "Engine pieces needed first",
"Rules" and "On a phone". Then write your plan (10 lines) into reference/qa-reports/ENG-ASCENT/PLAN.md and push it BEFORE coding.

## Pieces, in this order (stop at a clean boundary; each lands whole with its tests)
1. **The ascent lay (L).** missionGraph/the pipeline lay a graph upward for archetype 'ascent' (flow 'up'): a beat per storey, height
   and the time model per beat, levelCheck and the bots able to fly/play it, the stage lock and seed lists unchanged for every
   existing stage (lock: nothing else moves). Prove it on a TEST graph (a fixture), not by re-laying the live 1-4 (the hand-built 1-4
   and its rooms stay until 1-4's build packet deletes them: no patching what is being replaced, D40).
2. **Along the route (M).** Flags, hearts, quiet time and the 2:00 clock measured ALONG the climb (ROLLED_FLAGS counts x today):
   Matt's flag rule measured on the path, never a table (D49).
3. **The climb camera (S).** While climbing up, his feet sit lower in the view so the column above shows (55% always today,
   cameraFollow.ts:96); both ways on a phone (sideways is the SHORT view, engine.ts:1170). Perf budget holds (PERFORMANCE-RULES §1).
Not yours: pods, hollows/rot, the pair (separate packets), any art.

## Rules
- Never loosen a fairness rule, threshold or STAGE-RULES number; never re-record a seed list; no stage id/seed/x literal in engine
  code (the generality gate); every new test joins CI (NOT_IN_CI shrink-only).
- Done = the CLAUDE.md "Checks" all green on your head, plus a still of a test ascent both ways (the lead judges it). D51: when 1-4
  becomes a real stage it joins every stage-walking gate; for now the fixture joins the gen2 suite.
- Safe-keeping push every 45 min. Lean output (README "Lean output"). Stop line: the lead sets it in the start message, or 40% context.
- Return: reference/qa-reports/ENG-ASCENT/REPORT.md (60 lines or fewer: what landed, tests, gates, what is left, "Learned") and a
  send_message to the lead (session_01FhBbYP63h7cCX8DyW69stq), 10 lines or fewer. No PR.
