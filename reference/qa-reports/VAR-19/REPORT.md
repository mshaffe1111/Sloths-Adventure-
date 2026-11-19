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
Every piece is World 1's inventory (moss_stone banks and roots, Matt's painted 50 px boulder, the W1 climb vine, the mushroom): no new
art, no Hugging Face. Commits d0b421832, 47adbbbb2, cfcadf997 and the dips commit (section 5).
| Piece | What | Why |
|---|---|---|
| w1-19-arrival (reworked) | an 80 px foot, a narrow root dip (first move ~2.0 s from spawn, runway-bound, R-165.308), up onto the old bough over its own dip (the teach's flag stands on it), a boulder, a dip, a root dip at its end | dead walk 3.1 s at x 140; a rolled stage's flag 1,500-2,400 px before the teach |
| w1-19-rest | the roots, now laid ONCE a roll | it was laid 5x: "jJJJ" |
| w1-19-rest-crook (new) | over a root dip, a step up onto the high crook (boulder), over the dip off its end, root up/down home | 1-9's own rest |
| w1-19-rest-stair (new) | root up/down, a boulder on the floor, a root up, a boulder on the bough, root down/up/down | 1-9's own rest |
| w1-19-rest-wall (new) | root up, down to the wall's foot, its vine (212 px) onto the high bough, root up, two drops, root up/down | 1-9's own rest |
| w1-19-rest-bounce (new) | root up/down, a mushroom bounces him 150 px onto the old bough, root up, two drops, root up/down | 1-9's own rest |
| rests' join | entry.join 'walk' (ENG-LOOK2); beats keep their rolled join (walked in, the seam ran past the quiet line) | the rolled jump read "J" at every rest |
| stair beat / miss beat (the lead's ruling (a) 3:33 PM) | a narrow root dip in the opening bank (stair 'ad','ae'; miss 'ad','w1' same length); each boa on its own root, same place | dead walk on the approaches |
Refusals met on the way, each fixed at its cause: a boulder stacked on a boulder overhangs its base (gen2: a stone drawn past its lip); a
walked rise is capped under a single's reach (pipeline riseCap: a 150 px crook is never a double); the arrival's flag socket is ignored on a
rolled stage (ROLLED_FLAGS places the teach's flag on a clear wide piece); the quiet line (4 s) reads only a narrow dip between roots as a
jump (steps up are bumps, walked drops nothing).

## 4. funcheck (relisted head cfcadf997; files funcheck-*.txt here). 1-9 vs base ce4ad461
CLEARED: like the stage before N (12 -> 0) and E (15 -> 0), like an earlier stage N (6 -> 0), nothing new N/E (R1), repeat E (11 -> 0),
enemy by a landing N/E (R2); also gone: nothing bites, padding, one tempo, looks like an earlier stage (N and E). No other stage moved
(every non-1-9 line identical to the R2 run). funknown NOT yet lowered (do it in the final commit: only 1-9's entries, only down).
LEFT: Normal "dead walk" 16 layouts (known 15; main's old 1-9: 12). After the dips (dead-N-after-dips.txt, buckets of 500 px:
layouts, longest s): teach approach x~2500 13 lay. 4.0 s; stair 10 lay. 3.1 s (was 15, 3.7); miss approach 8500-9000 8+6 lay. 3.7 s;
and walks over 2.5 s at many rest-to-beat seams (x 10000-20500, 1-9 lay. each, up to 4.7 s at 11500). No layout is clean yet.

## 5. EXACT NEXT STEP (VAR-19 stopped at ~350k context, the lead's box; VAR-19b finishes)
1. Head: 68df60759 on t-var-19. 1-9's list in it was relisted on that exact data (100 proven of 100, quiet line under 4 s on 100).
2. Dead walk N to under 15 layouts: run `reference/qa-reports/VAR-19/probes/dead.ts 1-9 1 16 normal`; for each bucket name the seam
   (section before / after). The seam walks are rest end (root down) + rolled join + a beat's walk-in bank: try ending each rest on a
   root DOWN of 200 px (shorter flat), and each beat's first bank (320) cut to ~200. Re-measure; 6 fresh seeds (seedlist --worker 0/1
   --count 6 --part), relist, funcheck.
3. Then: the suite (3 background shards; it has NOT run on any data head yet: the run on cfcadf997 was stopped when the data moved),
   castBots 1-9 1-40 x tiers x both, the full CLAUDE.md list, coveragecheck, registrycheck, every list --check, lockall --intended 1-9,
   funknown lowered for 1-9 only, stills (whole screen, upright + sideways, N + E, every changed beat; the opening's first 3 s clip).
4. Not yet run anywhere: castBots, tierBots (no 1-1 change: should be untouched), gates, stills. Nothing here is GREEN.

## 6. Learned (proposed level.md rules)
- **Probe fresh seeds before a relist** (cost: 58 min of a relist that kept 0 of thousands; the lead's countermeasure: seedlist fails fast,
  roadmapped). Check: `seedlist <stage> --worker 0/1 --count 6 --part x.json` keeps 6 of 6 before the real relist.
- **`build()` rolls from the proven list**: a probe on unlisted data measures the OLD plans. Relist (or part-check) before measuring.
- **On the route only a narrow dip between two roots is a move**: straight steps up are bumps, walked drops nothing, a 50 px boulder a
  bump. The quiet line (4 s) and dead walk (2.5 s) both need a dip every ~600 px. A walked rise is capped under a single's reach.
- **The suite must not run while data changes**: test files load the working tree per file.
- Reader (for the lead's roadmap, my view): the dead walk counts the walk up to a posted boa (which the player must do slowly, to time the
  freeze) as dead; the beat's own L carries a fight time but the approach before it does not. If the walk inside a posted boa's engage
  (150 px, Easy 195) is part of the freeze, the reader is wrong there; if not, the beats need dips. Not decided by me.
