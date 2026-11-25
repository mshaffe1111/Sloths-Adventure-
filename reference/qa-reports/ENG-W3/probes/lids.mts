// going down: catch boughs (towerCatches puts) within a jump's rise (LEAP.up) over wood laid under them, beside or across (60 px);
// per roll of draft 3-1, seeds 1-24 x both settings. TREE= must log puts (PUTALL)
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { generateAllLevels } = await import(`${T}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${T}/src/game/gen2/pipeline.ts`);
const { LISTED } = await import(`${T}/src/game/gen2/listed.ts`);
const { LEAP } = await import(`${T}/src/game/gen2/tower.ts`);
readyDraft('3-1');
const cfg = generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!;
let rolls = 0, hit = 0, lids = 0; const eg: string[] = [];
for (const set of ['normal', 'easy']) for (let seed = 1; seed <= 24; seed++) {
  (globalThis as any).__puts = [];
  const st: any = buildGen2Stage({ config: cfg, kit: LISTED['3-1'].kit(), seed, difficulty: set });
  rolls++;
  const plats = st.platforms.filter((q: any) => q.type === 'solid');
  const placed = plats.filter((q: any) => ((globalThis as any).__puts as any[]).some((c) => c.x0 === q.x && c.y === q.y && c.x1 === q.x + q.width));
  let n = 0;
  for (const b of placed) {
    const under = plats.filter((q: any) => q !== b && q.y > b.y + 40 && q.y <= b.y + LEAP.up && q.x < b.x + b.width + 60 && q.x + q.width > b.x - 60);
    if (under.length) { n++; if (eg.length < 6) eg.push(`${set[0]}${seed}: ${b.x}-${b.x + b.width}@${b.y} over ${under.map((q: any) => `${q.x}-${q.x + q.width}@${q.y}`).join(',')}`); }
  }
  lids += n; if (n) hit++;
}
console.log(`LEAP.up ${LEAP.up}: ${hit} of ${rolls} rolls carry ${lids} going-down catch boughs within a jump's rise over wood under them`);
console.log(eg.join(' | '));
