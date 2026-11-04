# The lead's engine sketch (2026-11-04 evening) — ONE input, not the answer

Matt: "We're fucking guessing... we have tunnel vision... maybe you're biased at this point." This sketch is the lead's first idea;
the designer must not start from it, the critic must attack it.

Problem: stages are built by eye and then checked ("roll, check, reroll, curate"); the research's numbers live in docs and the
checker, never in the builder. Five hand-built stages cost about 8-10% of Matt's week (~1.5-2% each); 85 to go.

Sketch (constructive, data-driven):
1. One formula file: length, pace per curve part, gap vs reach, enemy spacing, 70/15/15 pickups and goal math, repeat limits, fall
   damage, Easy scaling. Builder and checker both read it.
2. A world profile (data): beat feel, owned mechanics, art kit, world-wide rule (mutator), difficulty level, signature.
3. A stage spec (~20 lines): slot job, map shape, beat feel, pair, curve placement, goal, signature moment.
4. A template library of parameterized sections (vine chain, split road, climb with waits...).
5. The generator: spec + profile + formulas -> templates -> beat-traced placement (beatTrace.ts) -> art dressing -> pickups and
   enemies by formula; deterministic by seed.
6. The checker reads the same formulas, plus cross-world fingerprints.
Claimed buy: ~0.2-0.4% of a week per stage after a 3-5% build (estimate, unmeasured).
