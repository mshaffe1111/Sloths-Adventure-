# B15 PLAN (1-5 "Where She Walked"; branch t-b15 from origin/ccr-ea739a2f-dfcee4). Order = the packet's: bough, limb + marks, feel room, level, art, stills+gates.
WRITE (new): src/game/gen2/creak.ts(+test: the creaky bough piece, look + hold by world data, required once taught, whole on set-back), src/game/gen2/worlds/w1Arc15.ts,
  src/game/gen2/proven/seeds-1-5.ts, tools/engine/library15.ts(+test), src/game/feel15Stage.ts(+test: the crude feel room), reference/qa-reports/B15/*.
WRITE (edit, small): src/game/gen2/types.ts (SectionPiece.creak, manifest creak row, marks goal), src/game/engine.ts (honour Platform.creak's hold; a limb
  trap lets go when its limb breaks), src/game/dropTrap.ts + castPlay.ts + castPlay.types.ts (TrapPost kind 'limb'), src/game/gen2/worlds/w1Cast.ts (World 1's
  limb pair), w1.ts (1-5 hook lines only), stageTable.ts (1-5 row), provenIndex.ts (1-5 line), stagePlan.ts (1-5 mission/type), goals.ts (marks share),
  App.tsx (feel room entry, a few lines; or kitStage.ts if the lead prefers), reference/design/LEVEL-LOG.md (1-5 row).
DELETE (new replaces old): hand/mixer 1-5 (protoStage.ts HAND_STAGES '1-5' + plan, mixer/stages.ts SPEC_15, w1Sections.ts '1-5', stageSheets.ts/stageGenerator.ts 1-5 special cases).
ASK the lead: src/game/gen2/pipeline.ts (FA's today): ~6 lines (a creak piece becomes a fragile Platform with its world's hold; a marks objective is her mark).
  tools/perf/drawcheck.mjs stage list (1-5 joins, D51); seed list tooling as-is. Never limits.json, gates.yml, other stages' seed lists.
Risks: the art lands late (stand-ins named); score.ts lives on t-diff-algo/t-s1 (I read it there, never merge it unless told).
