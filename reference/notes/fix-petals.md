# fix-petals: helper notes

## Now (2026-11-04 11:46 AM ET): R-150.8 ACCEPTED; R-155 1-5 decided, waiting on w8-rope2's kick-teach piece
fun-validator c03160b8: origin/main 68b31e66 (release 0.9.4) and the lead branch merged in (D23). Conflicts in gates.yml, CLAUDE.md and
gates.md were both sides adding a gate (my funcheck, main's roadmapcheck): kept both, the lead branch's wording. tsc, artcheck,
knowncheck, roadmapcheck, funcheck (152 known) PASS; bot and validator tests 44/44.
- R-150.8: accepted by the lead (11:35 AM ET, bot-fix's time), QS PASS. Report reference/qa-reports/validator/R-150.8.md with the gate
  lines. stage-fix.md opens with it as the best measured result: about 32 min running time to the report, 1.2 h start to accept against
  1.5 h planned.
- R-155 1-5 (reference/plans/R-155-1-5.md, QS PASS on rev 2): Matt chose goal (a), follow Meeca's trail markers to the shrine with the
  petals as a bonus; both Dot lines approved ("These ones snap! Keep moving", "That boa's in the way... or is it?"); backdrop w1kapok
  (the lead's call; the QS's watch-out: if 1-5 and 1-7 read alike, use w1sunrise).
NEXT: when w8-rope2 pushes kick-teach (an exported piece in w1Sections.ts), merge it and build: fixtures first (creakDrop, snapRun, the
snake patrol), then the stage, the goal, the backdrop, then reference/methods/stage-shape.md, the gates, funcheck with 1-5 lowered.
MY MISS (twice today): times typed, not read. Countermeasure: no time goes in a message unless `TZ=America/New_York date` printed it
in the same step.

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
