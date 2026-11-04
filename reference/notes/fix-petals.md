# fix-petals: helper notes

## Now (2026-11-04 3:53 AM ET): stopped for the night (the lead: team stops at 5:00 AM ET, restarts when Matt wakes)
fun-validator (PLAN-TO-80 A.1; R-150.1 grown into the validator, R-150.4). Last commit bd33d386 on fun-validator, base contains origin/main
1dc39cd7 + ccr-0d59a91c 2c1f6b46. The lead OK'd at 2:34 AM ET.
Done, pushed: tools/validate/ (core, play, mechanics, evaluate, world1, mechtable, stills.mjs, chaseshot.mjs; validate.test.ts 13 fixtures
+ world1.test.ts 6 calibration checks, 19/19 pass); reference/qa-reports/validator/ (9 stage pages, index.html, mechanics-world1.md =
R-150.4, world1.json, 236 stills); reference/methods/validator.md (new method).
The quality supervisor (session_01FhBbYNn4i5tFfFZiFroKoi): plan PASS with additions (all in); 1-1 page: 5 required fixes (all in);
accepted my correction (1-1's unconfirmed jumps are double jumps, U, not mushroom walls). Asked, and done: 1-8's chase on screen (0-5%
of its frames: "hazard unseen"; no hand-placed still, it can't show a moving collapse), the "structure, not delight" line on the overview.
NEXT at restart: (1) ReadNotifications; re-merge origin/main + ccr before anything (D23); (2) the supervisor's full review of 1-2..1-9 and
the overview, fix what it finds; (3) the bot's mushroom-wall / double-jump move is bot-fix's (raised by the supervisor): when it lands,
re-run so 1-1/1-4/1-5/1-7's play checks can be judged; (4) the final report (Method used / Lessons applied / Method update / Polish check,
ids pasted after the push); (5) later: the validator as a gate (flags may only shrink).
Known limits (named on the pages): bot rescues on 1-1/1-4/1-5/1-7; stills placed on the ledge under the flag's x nearest the floor (Pokey
can sit inside a bush in 1-7, Dot's story line sometimes stays up); finish piece kinds are the builder's coarse kinds.

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
