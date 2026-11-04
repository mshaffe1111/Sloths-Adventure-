# fix-petals: helper notes

## Now (2026-11-04 3:06 AM ET)
fun-validator: the lead OK'd at 2:34 AM ET; the quality supervisor (session_01FhBbYNn4i5tFfFZiFroKoi) passed the plan with additions
(neighbour 0.45, rest pads, miss cost, padding, escalation, tempo, enemy jobs, bot rescues beside play numbers, per-layout counts) and
wants the FIRST page (1-1) before the other eight. Built in tools/validate/: core.ts, play.ts, mechanics.ts, evaluate.ts, world1.ts,
validate.test.ts (13 fixtures, all pass). 1-1 page: reference/qa-reports/validator/1-1.html. Next: supervisor's review, then 1-2..1-9 +
overview + stills, then reference/methods/validator.md.
Known limits (named on the pages): the bot needs 10+ rescues on 1-1 (mushroom highLeaps), so its play numbers there are not judged;
35 of 1-1's jumps are Q (the level check can't confirm them); piece kinds in the finish are the builder's coarse kinds.

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
