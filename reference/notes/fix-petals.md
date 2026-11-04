# fix-petals: helper notes

## Now (2026-11-04 8:16 AM ET): round 2 (the lead's restart list, 7:47 AM ET)
(1) Re-merged ccr into fun-validator (f89b87a5). (2) The bot's mushroom bounce fixed (firsttimer.ts bounceJump + aim steer, bounceUp
miss rule, the double carried from 1-1's hint DOUBLE_TAUGHT; route.ts findRoute double for the bot's guide route); fixtures in
firstTimerBot.test.ts fail on the old bot (0/5 up without a rescue) and pass on the new. 5-9's KID_RUNS_59 re-measured 8,3,3,5,7,5
(median still 5: the Easy goal is unchanged). (3) The supervisor's REDOs: dead walks less climb/rope time; the goal-route line reworded;
K for the chase; branch verdict "not judged"; score.ts (hazards matter by share bitten; new = needed and biting); eagle "warned?";
look.ts "looks the same" grid. NEXT: World 1 before/after bot table (Worlds 1-10 baselines in /tmp/claude-0/all-*.jsonl), re-run
world1.ts + stills, 1-2's 0% clumsy jumps looked at on stills, gates, push, REDOs to the supervisor, final report.

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
