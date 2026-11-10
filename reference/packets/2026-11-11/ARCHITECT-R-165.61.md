# TASK R-165.61   to: Architect   effort: high   due: <date at dispatch + about 4 h>   (dispatch only after R-165.60's Critic PASS)
## First, before any tool call
Read ALL of these with `git show origin/ccr-ca657d3c-n09zty:<path>` (after the fetch in the packets README): reference/roles/README.md, then reference/roles/ARCHITECT.md, then its
knowledge pack in the card's order. Push back, suggest, go beyond inside your WRITE files.
## Objective
The verdict schema that makes the builder's judgement of a roll match what a player meets, and the file lists that let Content and
Engine build the 1-1 fixes side by side.
## Why it matters
On 11-07 all 21 lives lost were in 1-1's treetop sections while the builder reported that no fall in 1-1 costs a life, and the deadly
drop is painted like the safe floor (responses.md, our finding 4). The Designer's reach spec (R-165.60) says how far the builder's
numbers are off.
## Frozen inputs (do not change)
- reference/specs/reach.md, bands.md, help.md, touch.md at the commit the Critic PASSED: <commit, filled in by the PM>.
- No lethal drops in 1-1 on Easy or Normal (R-165.53); the first-ever 1-1 run is one fixed layout, replays roll (R-165.52).
- The frame budget is 8 ms of our own work per frame on a mid-range phone at q0 (the previous lead's number from Matt's 11-06 "build for 60", GPU-RENDERER-PLAN.md:52-59). §1's text
  still reads 12 ms, no frame over 50 ms, until R-165.65 changes it; no gate measures frame time today.
- Who plays (Matt 11-07, R-165.71): Easy is for children, Normal for players of 12 and up. No lethal drops in 1-1 on either setting.
## Files
- READ: the card's pack; src/game/gen2/pipeline.ts, types.ts, seedList.ts; src/game/levelCheck.ts; tools/engine/rulers.ts.
- WRITE: reference/architecture/ (ADRs, the module map, the file lists); type-only declarations in src/game/gen2/types.ts and
  src/game/gen2/verdicts.types.ts (new); reference/handoffs/architect.md.
## Definition of done (the Critic checks each)
1. An ADR for the verdict schema: setting-aware arcs from reach.md, headroom, floors, and lethal vs soft drops as explicit, testable
   verdicts (a lethal drop in 1-1 fails a roll by name), with what each rules out.
2. An ADR for the fixed first run: where the chosen layout lives and how replays roll, as types only.
3. Allowed-file lists for four packets: Content (1-1 re-lay and the first-run layout), Engine (the recorder fix R-165.58), Engine
   (escalating help R-165.62), Engine (WebGL stage 0, R-3.1); and Content's list covers the whole re-lay (R-165.72). Lists don't overlap, or name which packet goes first on a shared file.
4. In reference/architecture/, the budget sheet: 8 ms per frame, and the spec of the frame-time gate with its planted slow frame
   (R-165.65), ready as an Engine packet.
5. tsc clean.
## Return
Branch t-r165-61-verdicts from origin/main, pushed (git ls-remote). REPORT.md in the 7 sections, 60 lines or fewer. Last message 10 lines.
## Attempt
1
