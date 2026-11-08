# TASK R-165.61   to: Architect   effort: high   due: <from date at dispatch, about 4 h>   (dispatch only after R-165.60 PASS)
## First, before any tool call
Read reference/roles/README.md, then reference/roles/ARCHITECT.md, then its knowledge pack in the card's order. Push back, suggest,
go beyond inside your WRITE files.
## Objective
The verdict schema that makes the builder's judgement of a roll match what a player meets, and the file lists that let Content and
Engine build the 1-1 fixes side by side.
## Why it matters
On 11-07 all 21 lives lost were in 1-1's treetop sections while the builder reported that no fall in 1-1 costs a life, and the deadly
drop is painted like the safe floor (consultant finding 4). The reach numbers were wrong (R-165.60).
## Frozen inputs (do not change)
- reference/specs/reach.md, bands.md, help.md, touch.md at the commit the Critic PASSED (the PM fills it in: <commit>).
- No lethal drops in 1-1 (R-165.53); the first-ever 1-1 run is one fixed layout, replays roll (R-165.52).
- PERFORMANCE-RULES §1 stays the pass/fail budget (12 ms of our work per frame, no frame over 50 ms); 8 ms is the WebGL design target,
  not a gate (R-165.65).
## Files
- READ: the card's knowledge pack; src/game/gen2/pipeline.ts, types.ts, seedList.ts; src/game/levelCheck.ts; tools/engine/rulers.ts.
- WRITE: reference/architecture/ (ADRs, the module map, the file lists), type-only declarations in src/game/gen2/types.ts or a new
  `*.types.ts`, reference/handoffs/architect.md.
## Definition of done (the Critic checks each)
1. An ADR for the verdict schema: setting-aware arcs from reach.md, headroom, floors, and lethal vs soft drops as explicit, testable
   verdicts (a lethal drop in 1-1 fails a roll by name), with what each rules out.
2. An ADR for the fixed first run: where the chosen layout lives and how replays roll, as types only.
3. Allowed-file lists for four packets, with no overlap between any two that run at once: Content (1-1 re-lay and the first-run
   layout), Engine (the recorder fix R-165.58), Engine (escalating help R-165.62), Engine (WebGL stage 0, R-3.1).
4. tsc clean.
## Return
Branch t-r165-61-verdicts from origin/main, pushed (git ls-remote). REPORT.md in the 7 sections. Last message 10 lines.
## Attempt
1
