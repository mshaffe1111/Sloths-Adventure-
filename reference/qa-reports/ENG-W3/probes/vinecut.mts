// probe (ENG-DOWNBOT): climb vines cut by wood between their top and foot on the drafted way down. TREE=<worktree> [N=24] [V=1] GEN2_DRAFT=3-1 npx tsx <this>
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { generateAllLevels } = await import(`${T}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${T}/src/game/gen2/pipeline.ts`);
const { LISTED } = await import(`${T}/src/game/gen2/listed.ts`);
readyDraft('3-1');
const cfg = generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!;
let crossed = 0, rolls = 0;
for (const d of ['normal', 'easy']) for (let seed = 1; seed <= Number(process.env.N ?? 24); seed++) {
  const st: any = buildGen2Stage({ config: cfg, kit: LISTED['3-1'].kit(), seed, difficulty: d });
  const cuts: string[] = [];
  for (const v of st.vines.filter((v: any) => v.vineType === 'tree_climb')) for (const p of st.platforms) if (p.type === 'solid' && p.x + 6 < v.x && p.x + p.width - 6 > v.x && p.y > v.topY + 10 && p.y < v.bottomY - 10) cuts.push(`vine ${v.x} ${v.topY}-${v.bottomY} cut by ${p.x}-${p.x + p.width}@${p.y}`);
  if (cuts.length) { rolls++; crossed += cuts.length; if (process.env.V) console.log(d, seed, cuts.slice(0, 3).join('; ')); }
}
console.log(`VINES CUT: ${crossed} on ${rolls} rolls`);
