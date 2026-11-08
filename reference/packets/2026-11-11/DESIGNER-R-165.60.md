# TASK R-165.60   to: Designer   effort: high   due: <from date at dispatch, about 4 h>
## First, before any tool call
Read reference/roles/README.md, then reference/roles/DESIGNER.md, then its knowledge pack in the card's order (your turnover note,
reference/handoffs/designer.md, is in it). Push back, suggest, go beyond inside your WRITE files.
## Objective
The real reach of Pokey at 30 fps, measured by flying the real engine, and the gap, rise and help numbers that follow from it, so the
1-1 lessons can be re-laid on true numbers.
## Why it matters
The 11-07 outside review (reference/consultant/2026-11-07-scripts/sim.py, a simulation of FEEL.md, not the engine) says the builder
rates the single jump about +10 px and the bounce about +14 px too high and the distance 20-50 px short, so double-jump lessons can be
crossed with one jump and bounce walls sit beyond a bounce. A child on Easy was stuck 37 minutes with no help stepping in (finding 1).
Nobody has yet measured the engine itself (handoffs/planner.md §2).
## Frozen inputs (do not change)
- The engine (src/game/physics.ts PHYS, the 30 fps loop) is the truth; the pipeline's constants are what's under test.
- Decisions made by the lead 11-07: no lethal drops in 1-1 (R-165.53); a player's first 1-1 run is one fixed, hand-checked layout,
  replays roll (R-165.52). The bounce lesson is taught by the `lesson.bounce` card at the first mushroom (story keeper, 11-07).
## Files
- READ: the card's knowledge pack; src/game/realPlay.ts; src/components/CoachOverlay.tsx (COACH_TEXT.pad).
- WRITE: reference/specs/reach.md, bands.md, help.md, touch.md; reference/specs/sims/ (your flight scripts, tsx importing the real
  engine); reference/handoffs/designer.md.
## Definition of done (the Critic checks each)
1. reach.md: single, double, bounce and bounce+double rise and level distance, flown in the real engine at 30 fps, under the strict,
   middle and generous take-off readings, each with tolerance and the one command that reproduces it. Side by side with JUMP_RISE,
   DOUBLE_RISE, BOUNCE_REACH, reachJump and maxGap, and a verdict per constant: confirmed or wrong by how much.
2. bands.md: gap and rise bands per setting (Easy, Normal) for a single-jump section, a double-teach section (a single running jump must
   fail it under every reading) and a bounce teach (a bounce alone must clear it), and a table of which w1 sections, gaps and Easy twins
   move.
3. help.md: when help steps in (failures and seconds), what each step does, for Easy and Normal, with the benchmark sources.
4. touch.md: does a pad player TAPPING Jump twice clear the double-teach band? (Decides the coach line, R-165.57.) Same for a touch tap.
5. The Engine packet for the permanent flight test in src/, ready for the PM (README "suggestions as ready packets").
## Return
Branch t-r165-60-reach from origin/main, pushed (git ls-remote). REPORT.md in the 7 sections. Last message 10 lines.
## Attempt
1
