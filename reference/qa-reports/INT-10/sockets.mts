// INT-10: per section of a stage, its pickup sockets (petals asked) against the petals the build laid (gen2.fills), Normal layouts 1-5
const root = process.argv[2]; const id = process.argv[3] ?? '1-6'; const diff = (process.argv[4] ?? 'normal') as any;
await import(`${root}/src/game/headlessDom.ts`);
const { generateStage, setLayoutVariant } = await import(`${root}/src/game/stageGenerator.ts`);
const { generateAllLevels } = await import(`${root}/src/game/worldsData.ts`);
const { isPetal } = await import(`${root}/src/game/petals.ts`);
const by = new Map<string, { asked: number; laid: number; secs: number; w: number }>();
let tot = 0, totW = 0;
for (let v = 1; v <= 5; v++) {
  setLayoutVariant(v);
  const st: any = generateStage({ ...generateAllLevels().find((l: any) => l.id === id)!, unlocked: true }, diff);
  setLayoutVariant(null);
  const pet = st.collectibles.filter((c: any) => isPetal(c, st));
  tot += pet.length; totW += (st.exitTotemX - st.spawnX);
  for (const p of st.meta.pieces) {
    const e = by.get(p.k) ?? { asked: 0, laid: 0, secs: 0, w: 0 };
    e.secs++; e.w += p.x1 - p.x0;
    e.laid += pet.filter((c: any) => c.x >= p.x0 && c.x < p.x1).length;
    by.set(p.k, e);
  }
}
console.log(`${id} ${diff}: ${tot} petals over ${(totW / 440).toFixed(0)} upright screens (5 layouts)`);
for (const [k, e] of [...by].sort((a, b) => b[1].w - a[1].w)) console.log(`${k.padEnd(34)} x${e.secs}  ${(e.w / 440 / e.secs).toFixed(1)} scr each  petals ${(e.laid / e.secs).toFixed(1)} each  ${(e.laid / (e.w / 440)).toFixed(2)}/scr`);
