# fix-petals: helper notes

## Now (2026-11-04 10:58 AM ET): R-150.8 done (QS PASS), R-155 1-5 plan rev 2 sent; full gates running on 93450fb2
fun-validator 2e61ffd8. R-150.8 (firsttimer.ts ledge-end steer, fixture in firstTimerBot.test.ts): 1-4 rescues 58 -> 19, Worlds 1-10
2006 -> 1915; report reference/qa-reports/validator/R-150.8.md (append the gate lines when the run ends). KID_RUNS_59 unchanged.
R-155 plan reference/plans/R-155-1-5.md rev 2 (QS changes folded): WAITING on the lead/Matt (goal a/b, backdrop w1kapok/w1sunrise, two
Dot lines) and on w8-rope2's kick-teach piece (he adds only an exported piece to w1Sections.ts). Then build: creakDrop, snapRun, the
snake patrol, fixtures first, and write reference/methods/stage-shape.md as I go.
MY MISS (twice today): times typed, not read. My message to w8-rope2 said "10:58 AM ET" and my correction said "10:28": both guesses.
Countermeasure: no time goes in a message unless it was printed by `TZ=America/New_York date` in the same step.

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
