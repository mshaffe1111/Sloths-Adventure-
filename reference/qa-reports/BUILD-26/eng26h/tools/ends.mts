// The old roll's running walk-offs: build <stage> <seed> on the BASE worktree (its own build), judge its platforms with the HEAD's walkOff
// usage: npx tsx ends.mts <base> <head> <stage> <seed> <difficulty> <y,y,...>
const [base, head, id, seedS, d, ysS] = process.argv.slice(2);
await import(`${base}/src/game/headlessDom.ts`);
const { generateAllLevels } = await import(`${base}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${base}/src/game/gen2/pipeline.ts`);
const { listedStage } = await import(`${base}/src/game/gen2/listed.ts`);
const T = await import(`${head}/src/game/gen2/tower.ts`);
const cfg = generateAllLevels().find((l: any) => l.id === id)!;
const st: any = buildGen2Stage({ config: { ...cfg, unlocked: true }, kit: listedStage(id)!.kit(), seed: Number(seedS), difficulty: d });
console.log('base errors', JSON.stringify(st.gen2.errors ?? []));
const W = st.config.levelWidth;
const ys = ysS.split(',').map(Number);
for (const p of st.platforms.filter((q: any) => ys.includes(q.y) && q.type === 'solid')) for (const side of [-1, 1] as const) {
  const w = T.walkOff(st.platforms, p, side, W);
  console.log(`piece x ${p.x}-${p.x + p.width} y ${p.y} side ${side}: walk-off lands ${w ? `x ${Math.round(w.x)} y ${w.y} (drop ${w.y - p.y})` : 'nowhere'}`);
}
const first = [...st.platforms].filter((q: any) => q.type === 'solid' && q.width >= 60).sort((a: any, b: any) => b.y - a.y).slice(0, 6).map((q: any) => `${q.x}-${q.x + q.width}@${q.y}`);
console.log('lowest solids', first.join(' '), 'H', st.config.levelHeight, 'spawn', st.spawnX, st.spawnY);
