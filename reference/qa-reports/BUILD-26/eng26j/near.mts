// what lies within 120 px under / beside each gate (its section, key), on a built roll
const [tree, id, seedS, d] = process.argv.slice(2);
await import(`${tree}/src/game/headlessDom.ts`);
const { generateAllLevels } = await import(`${tree}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${tree}/src/game/gen2/pipeline.ts`);
const { listedStage } = await import(`${tree}/src/game/gen2/listed.ts`);
const cfg = generateAllLevels().find((l: any) => l.id === id)!;
const st: any = buildGen2Stage({ config: { ...cfg, unlocked: true }, kit: listedStage(id)!.kit(), seed: Number(seedS), difficulty: d });
const P = st.platforms;
console.log('tower keys', Object.keys(st.gen2.tower ?? {}), 'gen2 keys', Object.keys(st.gen2).slice(0, 30).join(','));
for (const gid of st.gen2.tower?.sealed ?? []) {
  const g = P.find((p: any) => p.id === gid);
  console.log(`gate ${g.x}-${g.x + g.width}@${g.y}`);
  for (const q of P) if (q !== g && q.y >= g.y - 200 && q.y <= g.y + 120 && Math.max(q.x - (g.x + g.width), g.x - (q.x + q.width)) < 250)
    console.log('   ', `${q.x}-${q.x + q.width}@${q.y}`, JSON.stringify(Object.fromEntries(Object.entries(q).filter(([k]) => !['x', 'y', 'width'].includes(k)))).slice(0, 260));
}
