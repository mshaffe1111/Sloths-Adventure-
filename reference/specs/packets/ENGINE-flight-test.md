# TASK R-165.60-E   to: Engine   effort: medium   due: <ET time from date at dispatch>
(Written by the Designer, 2026-11-09, ready for the PM to send; shape: reference/methods/dispatch-packet.md.)
## First, before any tool call
Read reference/roles/README.md, then your card reference/roles/ENGINE.md, then its knowledge pack in the card's order (your turnover
note is in it). You are on the team: push back, suggest, go beyond inside your WRITE files (README rules 3-4).
## Objective
A permanent test in src/ that flies the real engine at 30 fps and holds Pokey's reach to the flown numbers, and a ruler (the
builder's reach constants) that agrees with them, so no "double" gap or rise can be laid that one jump clears.
## Why it matters
reference/specs/reach.md (flown 11-09 in the real engine): the builder rates the single jump's apex 10.0 px too high and the
bounce's 13.7 px, and its level reach 33-69 px too short. One jump crosses 244 px; the double bands were 195-228 px. On Easy every
double rise is laid at 113.9 px and one jump climbs 123. A child tester sat 37 minutes at one spot.
## Frozen inputs (do not change)
- The engine's movement (src/game/physics.ts `PHYS`, `FORGIVE`, `ASSIST`; engine.ts) does not change. Only the ruler and the test.
- The flown numbers, stage 1-1 seed 1, bare world, the game's `InputEngine` on the controls, `update(1/30)` (reach.md §2), each ±2 px
  (double gaps ±3):
  - apex: single hold 97.8, flick 97.2, Pad tap 61.7; double hold 189.0, flick 187.0; bounce 167.6 over the cap; bounce + air jump 259.1 over the cap.
  - highest top climbed, block / thin: single 123 / 117; double flick 212 / 206; bounce 223 / 217 over the floor; bounce + air jump 317 / 309.
  - widest level gap, any timing: single hold 244-246 (the widest flown single is 246, both settings); double hold 409 Normal, 411 Easy; double flick 396 Normal, 400 Easy.
  - from 70 px before the lip: single flick 128 Normal, 132 Easy; double flick 283 Normal, 287 Easy; double hold 292 Normal, 296 Easy.
- The method to copy: reference/specs/sims/flight.ts (the Rig class, `fly`, `most`). Set the setting with `setDifficulty` before
  `new RealPlay`; put a real `InputEngine` on `r.e.input` (as touchRig.ts does); a flick is `triggerTouchUp(0, 220)` then
  `releaseTouchUp()`; a Pad tap is `triggerTouchUp(0, PAD_HOP_MS)`, released 2 frames later.
- The bands the ruler must be able to lay (reference/specs/bands.md §2, §5): Easy double rise 128-132 px; Normal double gap test
  252-262 px; bounce lip 232-246 px over the floor. Single-jump limits (`maxGap` single, `riseLimit` single) stay as they are.
## Files
- READ: reference/specs/reach.md, bands.md, sims/flight.ts, sims/out/*.txt (until that branch merges they exist only on
  t-designer-reach: read with `git show origin/t-designer-reach:<path>` after `git fetch origin t-designer-reach`);
  src/game/realPlay.ts, touchRig.ts, inputEngine.ts.
- WRITE: src/game/reachFlight.test.ts (new); src/game/physics.ts (the reach constants and their comments only);
  src/game/gen2/pipeline.ts (`BOUNCE_REACH`, `maxGap`, `riseLimit` and its two clamps at 832 and 840);
  src/game/realPlay.ts (FakeInput's comment, and an optional `setting` argument); reference/handoffs/engine-core.md, planner.md.
  w1.ts is NOT yours here: Content enters the bands after this lands (roles/README.md "Shared files": Designer spec, Content data, Engine code).
## Definition of done (the Critic checks each)
1. `src/game/reachFlight.test.ts` flies every number in "Frozen inputs" on Normal and on Easy and fails when any is off by more than
   its tolerance. Time budget: the whole test file runs in 90 s or less on both settings together (the Designer's full sim takes
   about 2 minutes a setting: fly only the listed numbers, at the take-off spots that give them, not the whole grid). Planted failure: with `PHYS.jumpV` set to 600 in a scratch copy the test goes red (say which asserts).
2. The ruler agrees with the flight, in the test: for Normal and Easy, the lowest double rise the builder lays is over the flown single climb
   (123 block) by 5 px or more, and the narrowest double gap it lays is over the widest flown single (246) by 5 or more.
   Today both fail (Easy rise 113.9; `maxGap` double 229.8): show them red first, then green.
3. `JUMP_RISE`, `DOUBLE_RISE` and `BOUNCE_REACH` either become the flown figures or carry a comment giving the flown figure and the
   test that holds it; no caller's result moves by more than the bands need (list every caller and its before / after value).
4. FakeInput's comment says what it lacks (no minimum hold: a one-frame press rises 29.6 px, a real flick 97.2, a real Pad tap 61.7).
5. tsc clean; `npx tsx --test src/game/reachFlight.test.ts` passes; `npx tsx tools/engine/seedlist.ts 1-1 --check` is run and its
   result reported (a ruler change can move proven seeds: if it does, stop and report, never re-record); the gates that apply pass.
## Return (lean: reference/roles/README.md "Lean output")
- Your last message: 10 lines or fewer. REPORT.md: 60 lines or fewer.
- A commit on branch t-r165-60e-flight-test, pushed (confirm with `git ls-remote`).
- REPORT.md in the 7 sections of reference/roles/README.md. The turnover notes your card names, rewritten.
- Can't wait for the report? PUSHBACK.md on the branch and stop (roles/README.md rule 1).
## Attempt
1
