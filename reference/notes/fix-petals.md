# fix-petals: helper notes

## Now (2026-11-04 9:02 AM ET): round 2 done, pushed (6103af1b = work addfefff + ccr 0f1b6c0c), reported to the lead
Bot bounce fix (firsttimer.ts bounceJump/aim, bounceUp miss, DOUBLE_TAUGHT; route.ts double), fixtures fail-before/pass-after;
World 1 rescues 418 -> 194; KID_RUNS_59 re-measured (goal unchanged, 5), flagged to the lead. All 5 supervisor REDOs + overview back to
her (9:02 AM ET). WAITING: her verdict; the lead's word on KID_RUNS_59. NEXT: the validator as a gate (flags may only shrink).
Named limits: the bot's step-down miss rule (1-1 x1380, 1-2 x15435 clumsy flags); 1-1 kid seed 1 misses a double and can't go back to
the mushroom; 1-2 sunk step shows a pale rectangle edge (game art). My miss this round: 70 min unpushed; push as soon as fixtures pass.

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
