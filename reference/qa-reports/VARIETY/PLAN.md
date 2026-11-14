# VARIETY PLAN (R-165.197/.198/.200). Engine, Opus 5.5 max. Branch t-nodes (NODES-2 head 562cbbd6 + lead docs). Written 2:04 PM ET 11-13.
**Item 0 root (proved on 1-4, real engine):** clearClimbs stands every climbing vine 26 px off its bough (game-wide, W5-8 included); the
engine's vault finder (engine.ts vaultSide) samples from 10 px and stops at the first miss, so it never sees that bough and straight UP
vaults the way he faces. On a tower turn-back he faces away: 1-4 seed 1, 13/13 vines land only when facing the bough (B14c's bots, Matt's
"straight up always climbs"). Fix: one vault finder that steps over the clear gap, used by the engine AND a new lay verdict (D19).
**WRITE (item 0):** NEW src/game/vineTop.ts + vineTop.test.ts (planted: 1-4's turn geometry, real engine); gen2/tower.ts (verdict
towerVaults); gen2/pipeline.ts (applyVerdicts calls it; CLIMB_CLEAR from vineTop); engine.ts ONE hunk (vaultSide calls vineTop) as
reference/qa-reports/VARIETY/engine-vault.patch for B14c (token), committed here only if the lead gives the token for that hunk.
**WRITE (items 1-2):** gen2/pipeline.ts, gen2/types.ts, tower.ts, nodeCode.ts, legs.ts, nodeAsks.ts, nodeMix.test.ts, toyLegs.ts, w1Pits.ts
(the pit painter the report names); any other kit file: ask first. Reports: reference/qa-reports/VARIETY/; turnover engine-core.md, planner.md.
**Proof:** lockall vs main (only intended stages), seedlist 1-1 --check, every shipped vine's vault before/after (none worse), full Checks.
