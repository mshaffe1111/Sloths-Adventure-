# 1-6 Normal, the expert's sealed doors: every petal he left, 2 seeds (ENG-16I, 8:55 PM ET, t-build-16@a75ce97d)
Tools: petals.ts (the run, each missed petal's piece, walkedSpan() on it, where he stood), petalsource.mts (lay vs played petals),
spans.mts (the span at lay = the span at play: identical on 7 pieces checked). Raw: expert-normal-{5,17}-petals.txt.

| castBots seed | laid (lay + after) | door (goals.ts:22, 87.5%) | got | left | left by the walked-span lay | left by petalPass fillGaps |
|---|---|---|---|---|---|---|
| 17 | 109 (lay 60 kept 58, +51 after) | 95 | 80 | 29 | 14 | 15 |
| 5 | 105 (lay 61 kept 60, +45 after) | 92 | 83 | 22 | 12 | 10 |

## The petals he left, by why (ids from the raw files)
| class | what the raw lines show | s17 | s5 |
|---|---|---|---|
| A. whole-piece span, a piece he never stands on | walkedSpan() returns the whole piece (no liana or ask beside it: 4-6 asks a stage); he clears hop-ups, rests and chain links in the air, 35-67 px from the petal | 13,19,20,21,22,23,26,43 (+89,90,91,107 fill) | 6,11,25,53 (+77,78,94,95 fill) |
| B. stood on it, not where the span says | he sets down past the span's hi or takes off past it: creaky-landing:in span 27017..27082, he stood 27267..27286 | 33,39 (+85 fill) | 20,28,33,43,54 (+108 fill) |
| C. on a soft-pit floor | the untagged floor under a perch (ENG-16H's pit floors); its span is 2-11 px wide, so a petal sits in the pit, where he only goes by falling | 34,53 | 34,56 |
| D. narrow span, a piece he clears in the air | snakes-met:b2 span 21069..21079, petal 21059 outside it; gorge:b1, chain:db inside it, never stood on | 25,54 | 15 |
| E. the fill re-fills what the span emptied | the span leaves a piece empty or narrow ("next piece": hang-low:qe, s1-2, snake-on-vine:qe, gorge:d2, s1-1; narrow: snakes-met:b1/qe, risers:b2, gorge:b2, first-liana:a2) and fillGaps then sees a petal-free stretch and lays a trail across that same piece | 72,74,76,81,82,101,103,105,120,122 | 76,85,87,104,118 |

## Verdict: engine, not data
- The count is Matt's rule (Normal collect 0.875 of what the stage holds, "the middle of 85-90%", goals.ts:20-22); it is not changed (LAWS 22).
- The walked span is wrong in three ways: it models only lianas and asks (A, B), its next-piece fallback reaches a soft-pit floor (C),
  and it governs only gen2 fillSockets: petalPass.ts:93 fillGaps (petals.ts:378) adds 45-51 more petals per roll after it with no walked
  span, and re-fills the very pieces the span emptied (E). Half the misses are the fill's.
- The fix (engine tier, every stage): one walked-path model that both fillSockets and fillGaps read (the run's own flights: where a run
  stands, not the piece), petals on the arc over a piece he clears, and never a pit floor or stair (petals.ts's own offPath rule).
