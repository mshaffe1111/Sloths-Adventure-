# VAR-19: 1-9's variety pass (R-165.291). Engine member (level half), 2026-11-19

Branch `t-var-19` from t-int-12 ce4ad461; ENG-285b's final model merged (t-eng-285 @ ba6b225b, 6ff32bb7d) before any relist (D40).
Method: reference/methods/level.md (rules 1-29); STEP 0 sent 1:54 PM ET, the lead's GO 1:55 PM ET (D1-D3; R1 YES, R2 YES).
Lessons applied: D40 (model merged before the relist), D59 (no gate left running at report), D79 (whole-screen stills), D86 (the full
CLAUDE.md list), D87 (long commands in the background), VAR-1b (suite after the first data change).

## 1. What was wrong (measured on ce4ad461 vs origin/main 6e7b85f8; probes in probes/ and VAR-1's runs/steps/adds9)
1. The arrival and the ONE rest (`w1-19-rest`, maxPerStage 6, laid 5x a roll) were all root hops: "JJJJ" every rest. Easy's "jJJJ x4"
   was stair>rest, miss>rest, roost>rest, hunters>rest; it carried the likeness to 1-8 (N 54%, E 60%) and 1-2 (N 65%).
2. "Nothing new" N16/E16: 1-9's letters were B E F J j on every layout. The posted boa read as F, 1-2's snake fight (beats.ts).
3. "Enemy by a landing" E16 (N16 known): every boa read 24-89 px from a landing, measured from its patrol span, though a boa never
   walks (predators/core.ts `immobile`). From its body the stair's boa is 210 px past its landing.
4. Normal's dead walk 3.1 s at x 140: the arrival walked 800 px to its first jump.

## 2. Reader fixes (own commits, the lead's rulings R1/R2 1:55 PM ET; planted tests in tools/inspect/posted.test.ts, in gates.yml)
| Fix | Commit | Planted | funcheck, every stage, before -> after |
|---|---|---|---|
| R1: a posted animal stillness beats (kit row immobile + beatenBy.still) reads as the freeze, letter L, not F; meter family kept creature:<kind> | be0306859 | fix off: "a posted animal ... reads as the freeze" N+E RED (2 fail); on: 5/5 | only 1-9 "nothing new" moves: N 16 -> 0, E 16 -> 0 |
| R2: enemyJobs measures a posted animal from its body, a walking one from its patrol span; LANDING_CLEAR 150 unchanged | 79c9be2af | fix off: "enemy by a landing" RED; on: green | only 1-9 "enemy by a landing" moves: N 16 -> 0, E 16 -> 0 |
Immobile kit rows today: W1 boa, W6 frog (beatenBy.still: reads L too), W7 sentry (not still-beaten: reads as before).
tools/validate/validate.test.ts (not in CI, ciTests.known.json debt) has 5 reds, the same 5 on ce4ad461 (chase outrun, 3 route, 1 beats).

## 3. Level data
(to fill)
