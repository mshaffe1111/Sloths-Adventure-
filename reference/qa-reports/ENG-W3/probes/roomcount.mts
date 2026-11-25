// going down: towerLids (a lid over a dip's lip, a roof over a vine's top) on every drafted 3-1 roll, seeds 1-24 x both settings;
// also whether each roll is refused (towerMiss) and why. TREE= the tree to read
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { generateAllLevels } = await import(`${T}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${T}/src/game/gen2/pipeline.ts`);
const { LISTED } = await import(`${T}/src/game/gen2/listed.ts`);
const { towerLids } = await import(`${T}/src/game/gen2/tower.ts`);
readyDraft('3-1');
const cfg = generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!;
let lip = 0, roof = 0, rollsHit = 0, refused = 0; const eg: string[] = []; const why = new Map<string, number>();
for (const set of ['normal', 'easy']) for (let seed = 1; seed <= 24; seed++) {
  const st: any = buildGen2Stage({ config: cfg, kit: LISTED['3-1'].kit(), seed, difficulty: set });
  const m = towerLids(st.vines, st.platforms);
  const a = m.filter((x: string) => x.includes('lid over')).length, b = m.length - a;
  lip += a; roof += b; if (m.length) rollsHit++;
  if (eg.length < 4 && m.length) eg.push(`${set[0]}${seed}: ${m[0]}`);
  const miss = [...(st.gen2?.towerMiss ?? []), ...(st.gen2?.flagMiss ?? []), ...(st.gen2?.dialMiss ?? [])];
  if (miss.length) { refused++; for (const x of miss) { const k = String(x).replace(/\d+/g, 'N').slice(0, 60); why.set(k, (why.get(k) ?? 0) + 1); } }
}
console.log(`lids over a dip's lip ${lip}, roofs over a vine's top ${roof}, rolls with either ${rollsHit} of 48; rolls refused ${refused}`);
console.log(eg.join('\n'));
console.log([...why].sort((x, y) => y[1] - x[1]).slice(0, 6).map(([k, n]) => `${n}x ${k}`).join('\n'));
