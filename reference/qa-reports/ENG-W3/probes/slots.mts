// going down: 'slots' on every drafted 3-1 roll, seeds 1-24 x both settings: two solid pieces side by side within a step of each other
// in height (1-8 px apart), the gap between them 1-60 px (his body is 42 px: he can neither fall through it nor read it as an end).
// TREE= the tree to read (ENG-DOWNBOT box 9; the shape of the top stuck cause on the new lay, kid easy 5 and adult easy 28)
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { generateAllLevels } = await import(`${T}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${T}/src/game/gen2/pipeline.ts`);
const { LISTED } = await import(`${T}/src/game/gen2/listed.ts`);
readyDraft('3-1');
const cfg = generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!;
let n = 0, rolls = 0; const gaps = new Map<number, number>(); const eg: string[] = [];
for (const set of ['normal', 'easy']) for (let seed = 1; seed <= 24; seed++) {
  const st: any = buildGen2Stage({ config: cfg, kit: LISTED['3-1'].kit(), seed, difficulty: set });
  const ps = st.platforms.filter((q: any) => q.type === 'solid' && !q.broken);
  let here = 0;
  for (const a of ps) for (const b of ps) {
    const dy = Math.abs(a.y - b.y), gap = b.x - (a.x + a.width);
    if (dy < 1 || dy > 8 || gap < 1 || gap > 60) continue;
    here++; const g = Math.round(gap / 10) * 10; gaps.set(g, (gaps.get(g) ?? 0) + 1);
    if (eg.length < 6) eg.push(`${set[0]}${seed}: ${a.x}-${a.x + a.width}@${a.y} | ${b.x}-${b.x + b.width}@${b.y} gap ${gap}`);
  }
  n += here; if (here) rolls++;
}
console.log(`slots ${n} on ${rolls} of 48 rolls; by gap (10 px bins): ${[...gaps].sort((x, y) => x[0] - y[0]).map(([g, k]) => `${g}:${k}`).join(' ')}`);
console.log(eg.join('\n'));
