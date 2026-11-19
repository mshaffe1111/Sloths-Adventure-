# How to plan a world ahead (first written by PLAN-W3, 5:55 PM 11-19 ET, R-165.313)
Matt 11-19: plan one to two worlds ahead so engine pieces are merged before the levels that need them. Output: reference/plans/WORLD-<n>-PLAN.md.

## Steps
1. Read the world's GAME-MAP §4 page, §3 (the ladder), §5, §10 B; the picks for any stage already picked; BUILD-ROADMAP's day table.
2. **Grep before you size.** For every piece the map calls new, grep in this order: the creature kit (src/game/predators/, castPlay.ts),
   gen2 (src/game/gen2/pipeline.ts and worlds/), zones.ts, the old makers (w<n>Sections.ts, protoStage.ts, w<n>*.ts), the bots
   (tools/inspect/), the meter (reference/design/meter-coverage.json). Mark EXISTS (proven on stage X), UNWIRED (in code, no gen2 lay or
   no real stageTable row), NEW (S/M/L with its planted toy on a REAL row). Cite file:line on the base you name.
3. **Count art from the inventory, not memory:** load src/game/art/inventory/w<n>.json (`cols` + `rows`), count best-fit by `layer` and
   `scale_ok`; then count what the stages need to stand on, climb and hang from, and price batches from HF-SPEND's last real job.
4. Order the engine list by dependency (D40): kit + travel first, shared bricks next, kit-animal rules, meter last; mark which start NOW
   (no design numbers needed: numbers as data) and which wait for a pick or a final design.
5. Slot plan: the current world's releases keep first call; put each piece's merge at least the agreed lead time before its build.
6. Questions for Matt: one at a time, recommendation first; only what is his (a feel, a look, scope).
7. Gates (docs branch): roadmapcheck (full history), knowncheck, timecheck. Re-grep every cite LAST (D52).

## Traps
- The map (11-11) and the picks can point at the old path (enemyBrain.ts) when the kit path (predators/core.ts) is where a world's new
  stages run; fixing the old path moves other worlds that still use it (W6 casts the ocelot through enemyBrain).
- "Proven" means on a stage; a mechanic seen only in puzzle rooms or a hand-built stage is UNWIRED for gen2.
