# fix-petals: helper notes

## Now (2026-11-04 3:35 AM ET)
fun-validator (PLAN-TO-80 A.1; R-150.1 grown into the validator, R-150.4). The lead OK'd at 2:34 AM ET ("stay on fun-validator").
The quality supervisor (session_01FhBbYNn4i5tFfFZiFroKoi) passed the plan with additions, then reviewed 1-1's page: approach PASS,
5 required fixes, all done (no free points, inside-variety for a world's first stage, M/U from the stage data instead of Q, the
clumsy thumb named when it can't run, base stamp "contains origin/main + ccr"; plus the hold-right line at the top).
Done (pushed on fun-validator): tools/validate/ (core, play, mechanics, evaluate, world1, mechtable, stills.mjs, validate.test.ts: 13
fixtures pass); reference/qa-reports/validator/ (9 stage pages, index.html, mechanics-world1.md = R-150.4, world1.json, 236 stills);
reference/methods/validator.md (new method file).
Stop rule (the lead, 11-04): team stops at 5:00 AM ET; no new step after 4:40; by 5 push, notes, one state message, idle.
Next when the team restarts: the supervisor's review of pages 1-2..1-9 and the overview; the bot's mushroom-wall move (bot-fix's
area, raised by the supervisor) so 1-1/1-3's play checks can be judged; then the validator as a gate (flags may only shrink).
Known limits (named on the pages): bot rescues on 1-1/1-4/1-5/1-7 (play numbers not judged there); stills are placed on the ledge under the
flag's x nearest the floor (Pokey can sit inside a bush in 1-7); finish piece kinds are the builder's coarse kinds.

## The job, as briefed
1. R-150.4 mechanics-in-use table, 1-1..1-9 and the boss: what the player meets (stage data + a bot run) against what the engine has.
2. Validator: move string (J V B W S C P + tags), pacing tags per stretch (I/F/P/T/R), repeated 3-4 move runs, similarity to earlier
   stages, dead walks over 2.5 s, landing out of view at take-off, branches outrun by holding right, eagles outrun without hiding,
   clumsy-thumb bot (taps +-100 ms, 15% less air control).
3. Prove it scores today's World 1 badly where Matt felt it (rated the game 55; World 1 the best; branches and eagles outrun). Calls the
   real stage builders (D19). One page per stage for the quality supervisor and Matt.
Report: Method used / Lessons applied / Method update / Polish check; ids pasted from command output after the push.

## Past job (done)
fix-petals, 2026-11-01: 1-2's sealed door fixed (catch mushrooms, split trail, sunk steps), accepted at 7095d3fa and merged. Found the
first-timer bot's lastX bug (D15).

## My pitfalls
- Trusting a tool's numbers before testing the tool (D15: I caught it in the bot; the validator I build must be tested the same way).
- Shell wait loops that pgrep their own command line (deadlocked a recorder once). Use explicit PIDs.
- Times and ids pasted from command output, never typed.
