# fix-petals: helper notes

## Now (2026-11-04 9:18 AM ET): fun-validator ACCEPTED by the quality supervisor (7909cf11, PASS)
She will use its flags as the checklist for every World 1 rebuild ("looks like"/"moves like", "nothing bites", padding, "one tempo").
Done and pushed: the bot's bounce fix (World 1 rescues 418 -> 194), all REDOs, variety = the more alike of moves and look, 1-8's chase
art measured. Open with the lead: KID_RUNS_59 (re-measured, goal unchanged at 5); the 1-2 sunk-step pale edge (defect log, via the QS).
NEXT, unless the lead says otherwise: the validator as a gate (a world's flags may only shrink). Named limits: the bot's step-down miss
rule (1-1 x1380, 1-2 x15435); 1-1 kid seed 1 can't go back to the mushroom after a missed double.

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
