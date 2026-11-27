// The lead's question (ENG-26j): wood within a hop of a shut gate (under its level, beside an end): can he reach it from wood UNDER the
// gate, by a jump (tower.ts leaps, generous: a double, a fall included) or off a vine's top, without the gate's own finish?
// usage: npx tsx onto.mts <tree> <stage> <seed> <difficulty>
const [tree, id, seedS, d] = process.argv.slice(2);
await import(`${tree}/src/game/headlessDom.ts`);
const { generateAllLevels } = await import(`${tree}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${tree}/src/game/gen2/pipeline.ts`);
const { listedStage } = await import(`${tree}/src/game/gen2/listed.ts`);
const T = await import(`${tree}/src/game/gen2/tower.ts`);
const cfg = generateAllLevels().find((l: any) => l.id === id)!;
const st: any = buildGen2Stage({ config: { ...cfg, unlocked: true }, kit: listedStage(id)!.kit(), seed: Number(seedS), difficulty: d });
const P = st.platforms.filter((p: any) => p.type !== 'fragile'), V = st.vines;
const s = (p: any) => `${p.x}-${p.x + p.width}@${p.y}`;
console.log(`${id} seed ${seedS} ${d}: errors ${(st.gen2.errors ?? []).length}`);
for (const gid of st.gen2.tower?.sealed ?? []) {
  const g = P.find((p: any) => p.id === gid);
  const near = P.filter((q: any) => q !== g && q.y > g.y && q.y <= g.y + T.LEAP.up && Math.max(q.x - (g.x + g.width), g.x - (q.x + q.width)) <= 300);
  for (const b of near) {
    // (does b itself get him onto the gate? a hop from b up to the gate)
    const onto = T.leaps(b, g);
    // (who reaches b from under: wood lower than b (he climbs UP to it), not b, not the gate; and vines whose top is within a hop of b)
    const from = P.filter((a: any) => a !== b && a !== g && a.y > b.y && T.leaps(a, b)).map(s);
    const vines = V.filter((v: any) => v.topY >= b.y - 10 && v.topY <= b.y + T.LEAP.up && Math.max(0, b.x - v.x, v.x - (b.x + b.width)) <= 200 && v.bottomY > b.y).map((v: any) => `vine x ${Math.round(v.x)} ${v.topY}-${v.bottomY}`);
    // (and who reaches it from above: a drop from wood over it)
    const above = P.filter((a: any) => a !== b && a !== g && a.y < b.y && Math.max(b.x - (a.x + a.width), a.x - (b.x + b.width)) <= 200).map(s);
    console.log(`gate ${s(g)} | wood ${s(b)} (${b.y - g.y} px under): hop onto gate ${onto} | from under: ${from.join(' ') || 'none'} | vines: ${vines.join(' ') || 'none'} | over it: ${above.slice(0, 4).join(' ')}`);
  }
}
