// The list order of a listed stage and provenSeedFor(n) (ENG-26l). The real page with ?layout=1 built SEED 2 on both trees (the engine's own gen2.seed,
// printed by stand.mjs), not seed 1: spots for layout 1 come from seed 2. usage: npx tsx order.mts <tree> <stage>
const [root, id] = process.argv.slice(2);
await import(`${root}/src/game/headlessDom.ts`);
const SL = await import(`${root}/src/game/gen2/seedList.ts`);
await SL.loadSeedList(id);
const s = [...SL.provenSeeds(id)];
console.log(root.split('/').pop(), id, 'n', s.length, 'first', s.slice(0, 4).join(','), 'provenSeedFor(1)', SL.provenSeedFor(id, 1), 'provenSeedFor(100)', SL.provenSeedFor(id, 100));
