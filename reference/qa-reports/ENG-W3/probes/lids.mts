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
let rolls = 0, hit = 0, lids = 0, nLip = 0, nTop = 0; const eg: string[] = [], egL: string[] = [], egT: string[] = []; const rollsShape = new Set<string>();
for (const set of ['normal', 'easy']) for (let seed = 1; seed <= 24; seed++) {
  (globalThis as any).__puts = [];
  const st: any = buildGen2Stage({ config: cfg, kit: LISTED['3-1'].kit(), seed, difficulty: set });
  rolls++;
  const plats = st.platforms.filter((q: any) => q.type === 'solid');
  const seen = new Set<string>();
  const placed = plats.filter((q: any) => { const k = `${q.x},${q.y},${q.width}`; if (seen.has(k)) return false; seen.add(k); return true; }).filter((q: any) => ((globalThis as any).__puts as any[]).some((c) => c.x0 === q.x && c.y === q.y && c.x1 === q.x + q.width));
  let n = 0;
  for (const b of placed) {
    const under = plats.filter((q: any) => q !== b && q.y > b.y + 40 && q.y <= b.y + LEAP.up && q.x < b.x + b.width + 60 && q.x + q.width > b.x - 60);
    if (under.length) { n++; if (eg.length < 6) eg.push(`${set[0]}${seed}: ${b.x}-${b.x + b.width}@${b.y} over ${under.map((q: any) => `${q.x}-${q.x + q.width}@${q.y}`).join(',')}`); }
  }
  lids += n; if (n) hit++;
  // (i) a bough end within 30 px of a dip's lip (two pieces level, 20-200 px apart, wood 20-150 px lower across the gap), the bough
  //  40 px to LEAP.up over the lip; (ii) a bough over a climb vine's top, 40 px to LEAP.up over it
  for (const b of placed) {
    const ends = [b.x, b.x + b.width];
    const lip = plats.some((A: any) => plats.some((B: any) => Math.abs(B.y - A.y) < 4 && B.x - (A.x + A.width) > 20 && B.x - (A.x + A.width) < 200
      && plats.some((D: any) => D.y > A.y + 20 && D.y < A.y + 150 && D.x <= A.x + A.width + 4 && D.x + D.width >= B.x - 4)
      && b.y < A.y - 40 && b.y > A.y - LEAP.up && ends.some((e: number) => Math.abs(e - (A.x + A.width)) <= 30 || Math.abs(e - B.x) <= 30)));
    const vt = st.vines.some((v: any) => v.vineType === 'tree_climb' && v.x > b.x && v.x < b.x + b.width && b.y < v.topY - 40 && b.y > v.topY - LEAP.up);
    if (lip) { nLip++; if (egL.length < 4) egL.push(`${set[0]}${seed} ${b.x}-${b.x + b.width}@${b.y}`); }
    if (vt) { nTop++; if (egT.length < 4) egT.push(`${set[0]}${seed} ${b.x}-${b.x + b.width}@${b.y}`); }
    if (lip || vt) rollsShape.add(`${set}${seed}`);
  }
}
console.log(`LEAP.up ${LEAP.up}: ${hit} of ${rolls} rolls carry ${lids} going-down catch boughs within a jump's rise over wood under them`);
console.log(`(i) over a dip lip: ${nLip} (${egL.join(', ')}); (ii) over a climb vine's top: ${nTop} (${egT.join(', ')}); rolls with either: ${rollsShape.size} of ${rolls}`);
