// Each shut gate's two exits on a built roll: the step off and the run off each end, where they land (ENG-26j, ruling (a))
// usage: npx tsx eng26j/gates.mts <tree> <stage> <seed,seed,...> [normal,easy]
const [tree, id, seedsS, dS] = process.argv.slice(2);
await import(`${tree}/src/game/headlessDom.ts`);
const { generateAllLevels } = await import(`${tree}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${tree}/src/game/gen2/pipeline.ts`);
const { listedStage } = await import(`${tree}/src/game/gen2/listed.ts`);
const T = await import(`${tree}/src/game/gen2/tower.ts`);
const cfg = generateAllLevels().find((l: any) => l.id === id)!;
for (const seed of seedsS.split(',').map(Number)) for (const d of (dS ?? 'normal,easy').split(',')) {
  const t0 = Date.now();
  const st: any = buildGen2Stage({ config: { ...cfg, unlocked: true }, kit: listedStage(id)!.kit(), seed, difficulty: d });
  const errs = st.gen2.errors ?? [];
  const W = st.config.levelWidth, P = st.platforms;
  const gates = (st.gen2.tower?.sealed ?? []).map((g: number) => P.find((p: any) => p.id === g));
  console.log(`${id} seed ${seed} ${d}: errors ${errs.length} ${errs.length ? JSON.stringify(errs).slice(0, 300) : ''} gates ${gates.length} (${Date.now() - t0} ms)`);
  for (const g of gates) for (const side of [-1, 1] as const) {
    const w = T.walkOff(P, g, side, W);
    const on = w && P.find((q: any) => q.type !== 'fragile' && Math.abs(q.y - w.y) < 1 && w.x + 12 > q.x && w.x - 12 < q.x + q.width);
    const own = on && on.x <= g.x && on.x + on.width >= g.x + g.width && on.y > g.y;
    console.log(`  gate ${g.x}-${g.x + g.width}@${g.y} side ${side}: run lands ${w ? `x ${Math.round(w.x)} drop ${w.y - g.y} on ${on ? `${on.x}-${on.x + on.width}@${on.y}` : '?'} ${own ? 'OWN FOOT' : 'NOT ITS FOOT'} (foot tip ${on ? (side > 0 ? on.x + on.width - Math.round(w.x) : Math.round(w.x) - on.x) : '-'} px past him)` : 'nowhere'}`);
  }
}
