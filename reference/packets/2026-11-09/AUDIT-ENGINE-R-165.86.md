# AUDIT of R-165.86 (the Engine's 1-1 put-back)   to: Critic   effort: high
Assume it is wrong; prove where. Read packets/2026-11-09/ENGINE-R-165.86.md, roles/CRITIC.md, roles/README.md.
- Run each done-item's own check yourself on the builder's branch; build the failing case for any you doubt.
- Fly it: with realPlay, fall into at least one gap in each of w1-log-chain, w1-mushroom-chain-back and w1-log-chain-rise, on Normal
  and on Easy, 3 seeds each: lives never change, he is set back behind the gap on standable ground, never into a hazard, never ahead.
- Try to break it: a fall while climbing, a fall off the last piece before the exit, a fall into water (must stay water), two falls
  in a row from the same ledge, a fall right after a checkpoint.
- Outside 1-1 nothing moved: 1-2, 1-5 and one World 8 Normal stage lay identical gaps and heartFalls to origin/main.
- Gates: tsc, the gen2 tests, seedlist 1-1 --check, then the full suite in 3 shards and `node tools/perf/knowncheck.mjs`.
- Also: the turnover note rewritten; Pushback and Suggestions judged; no tester name, code or survey sentence in the diff
  (the two greps of ANALYST.md done-item 5); `git status -sb` names the branch (D36).
Return ONE send_message to the lead, 30 lines or fewer, opening "R-165.86: PASS or REJECT"; each violation as
file:line | rule | evidence | exact fix.
