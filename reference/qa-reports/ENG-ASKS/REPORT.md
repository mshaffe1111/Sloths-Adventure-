# ENG-ASKS: a node code can ask any registered hazard and named clock (R-165.501; AUDIT-W3 finding 1)

## EXACT NEXT STEP (box 1, 8:27 PM ET Thu 11-26 by `date`)
1. Toy test `src/game/gen2/hazardAsks.test.ts` was running (80 rolls x 2 codes on the legs fixture); read its pass/fail. If red, the
   failure is in the deal (pipeline.ts askParts / askServes hazard lines) or the check (pipeline.ts dialMisses -> nodeAsks.ts hazardMiss).
2. Planted failure: `git stash push src/game/gen2/nodeAsks.ts src/game/gen2/pipeline.ts src/game/gen2/types.ts`, run the toy test (must be
   RED: '#dark' refused as "Later"), `git stash pop`.
3. Base lock: scratch worktree `<scratchpad>/base` (origin/t-eng-w3 88592a9c4) records `<scratchpad>/lock-base.json`; then on this branch
   `npx tsx tools/engine/lockall.ts --layouts 16 --check <scratchpad>/lock-base.json` (no listed stage may move).
4. When ENG-DARK-z's 93e05e98d (or its landing) is on origin/t-eng-w3: merge it, add World 3's row to w3.ts manifest
   (`hazards: [{ id: 'dark', zone: 'dark', props: ['darkFrom'] }]`), and a toy roll of '#dark' on World 3's kit.
5. Gates once on the final candidate: tsc; CI tool line; lockall --check; the suite in 6 shards; tierBots; generalitycheck. Land on t-eng-w3
   (no force); hash + each shard's totals to the lead.

## What is built (box 1)
- `nodeAsks.ts`: `HazardDef` / `HazardLay` (the registry row: id, the built stage's zone kind, the bricks that lay it by section zone kind
  or prop, its named clocks), `hazardRegistry` (the four falls always, then the world's rows; a fall's row adds only clocks),
  `sectionLays`, `hazardNeeds` (refusals by name: '#x is not a registered hazard in this world', '@c is not a clock #x runs on in this
  world', '#x names no zone it is laid as'), `hazardMiss` (pool check 'no section in the pool lays #x' / '@c'; then the fall, then each
  zone over the span, by name). The four falls with no clock read exactly as before.
- `types.ts`: `WorldManifest.hazards?` (world data fills it).
- `pipeline.ts`: the deal (dealContent askServes) types a node asking a registered hazard by the sections that lay it; the section draw
  (askParts) keeps only sections that lay it; dialMisses reads the registry, st.zones and the pool. A node with no such ask draws the
  same stream as before (askServes returns true; askParts pushes nothing).
- `nodeAsks.test.ts`: the two "Later" lines become the by-name refusals; unit lines for every refusal and lay.
- `NODE-KEY.html` regenerated (tools/engine/nodekey.ts) for the two new ELEMENTS rows.
