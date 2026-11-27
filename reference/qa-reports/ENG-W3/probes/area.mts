const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { generateAllLevels } = await import(`${T}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${T}/src/game/gen2/pipeline.ts`);
const { LISTED } = await import(`${T}/src/game/gen2/listed.ts`);
const { hopRooms } = await import(`${T}/src/game/gen2/tower.ts`);
readyDraft('3-1');
const cfg = generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!;
for (const [set, seed, x0, x1, y0, y1] of JSON.parse(process.env.Q!)) {
  const st: any = buildGen2Stage({ config: cfg, kit: LISTED['3-1'].kit(), seed, difficulty: set });
  const vs = st.vines.filter((v: any) => v.x > x0 && v.x < x1 && v.bottomY > y0 && v.topY < y1).map((v: any) => `vine x${v.x} ${v.topY}->${v.bottomY}`);
  const ps = st.platforms.filter((q: any) => q.x < x1 && q.x + q.width > x0 && q.y > y0 && q.y < y1).sort((a: any, b: any) => a.y - b.y).map((q: any) => `${q.x}-${q.x + q.width}@${q.y} ${q.type}`);
  const rs = hopRooms(st.platforms, st.vines).filter((r: any) => r.x0 < x1 && r.x1 > x0 && r.y > y0 && r.y < y1).map((r: any) => `${r.what} ${r.x0}-${r.x1}@${r.y}`);
  console.log(`${set}${seed}: ${vs.join('; ')}\n  rooms: ${rs.join('; ')}\n  ${ps.join('\n  ')}`);
}
