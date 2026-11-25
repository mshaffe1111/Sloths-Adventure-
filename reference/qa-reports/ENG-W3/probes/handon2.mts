// probe (ENG-DOWNBOT): tower.ts towerHandOns ('a catch hands on to its storey') on the raw draft rolls. TREE= [N=24] GEN2_DRAFT=3-1 npx tsx <this>
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { generateAllLevels } = await import(`${T}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${T}/src/game/gen2/pipeline.ts`);
const { LISTED } = await import(`${T}/src/game/gen2/listed.ts`);
const { towerHandOns } = await import(`${T}/src/game/gen2/tower.ts`);
readyDraft('3-1');
const cfg = generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!;
let n = 0, walls = 0; const rolls: string[] = [];
for (const d of ['normal', 'easy']) for (let seed = 1; seed <= Number(process.env.N ?? 24); seed++) {
  const st: any = buildGen2Stage({ config: cfg, kit: LISTED['3-1'].kit(), seed, difficulty: d });
  const m = towerHandOns(st.gen2.tower.turns, st.platforms, st.gen2.tower.width);
  if (m.length) { rolls.push(`${d[0]}${seed}`); n += m.length; walls += m.filter((x: string) => x.includes('no way off')).length; }
}
console.log(`HANDON MISSES ${n} (wall to wall ${walls}) on ${rolls.length} rolls: ${rolls.join(' ')}`);
