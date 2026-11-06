# engine-core: the porter's next steps (written 11-05, 10:55 PM ET, at the lead's stop)

## Step 1, first thing, before the tags, the art swap or anything else (the lead, 10:52 PM; red team RT-ENGINE.md #1, branch ccr-23292c36-550qmt)

`stage.ts --roll A|B|C` graded the MIXER's 1-1 in three child processes: the stage-lines dump (stage.ts ~:109 runs 'mix'), the
stage11 tests, and the stills. Make it FAIL-CLOSED:
- every child process gets the pick (A/B/C, the QA switch) and asserts the seed it measured;
- a missing row, NOT RUN or a fallback to the mixer is a FAIL, never a pass;
- add one "what the player sees" check: no raw text ids on screen (the red team saw Dot show `hint.1-1.double` on gen2 rolls);
- planted failures first (a child run without the pick must fail the gate; a raw id on screen must fail).

## Then, in order (each waits on the word named)
1. The `block: 'double'` tags: re-apply `reference/qa-reports/engine-core/held/double-tags.patch` on top of the planner's pit-step fix
   (engine-chunks 31b14a2f: a block's soft pit is a back pit), run 24 seeds x 2 settings before/after (clean, threw, loosened,
   codeErrors), and push only if Rolls A/B/C still build (the lead's word on republishing).
2. Art swap §3.2-3.5 (painted stump, log and boulder frames): WAITS on the lead's word after the red team (sameness risk: every stone
   one boulder). Step 1 (ownLook, e33d65cf9) is accepted.
3. Round 6 leftovers: (d) #20/#27 "exit unreachable" at the test slot. The planner's repro (10:53 PM; w1World on c2710323, Normal,
   buildGen2Stage): seed 55434 slot s10 w1-stump-towers (exit platform 192, checkpoint x 31589); seed 95029 slot s10 w1-stilt-logs
   (exit 168, checkpoint x 28802) and w1-stump-towers (exit 168, checkpoint x 28751). Print the slot's tempo and the last piece's
   laid y against the out floor's (suspect: T.rise scales the rises, not the out floor's drop); (e) the B7 data audit (nothing standable within 175 across / 185 below a block's lip on the approach side).
4. FR9 over the older sections (every floor h a 50 px wall, no plain floor over 4 s): the designer's pass, from the planner's list.

## Open findings handed on (engine: the planner)
- the seed perch's `seed` find socket is never filled (the golden seed lands anywhere: A and C fail the seed promise);
- V19b fails on A/B/C (the end log not higher than where the bough window begins);
- 'on' blocks under 50 px draw as code islands; pitUnder's deepen skips holes of 48 px or less (B Easy's floating stone);
- live defect: 4-9 layout 4's dead log stair (ids 86-89) under its branch-bridge road; 1-3 Easy dressing behind step branches;
  6-1 and 8-1 platforms inside the HUD band.
