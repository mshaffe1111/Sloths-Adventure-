// PAINT-292b scratch: 1-1's fixed first run built as seedlist.ts firstRunBreaches builds it, in the tree argv[2]: the lock hash per setting,
// the same hash with every platform's 'cut' taken out, and per part hashes (to name which part moved).
import { createHash } from 'node:crypto';
const root = process.argv[2];
await import(`${root}/src/game/headlessDom.ts`);
const { generateAllLevels } = await import(`${root}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${root}/src/game/gen2/pipeline.ts`);
const { listedStage } = await import(`${root}/src/game/gen2/listed.ts`);
const { stageParts } = await import(`${root}/src/game/gen2/seedList.ts`);
const { FIRST_RUN_11: L } = await import(`${root}/src/game/gen2/firstRun11.ts`);
const id = '1-1';
const kit = listedStage(id).kit;
const cfg = generateAllLevels().find((l: { id: string }) => l.id === id)!;
const h = (x: unknown) => createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
const out: Record<string, unknown> = {};
for (const difficulty of ['normal', 'easy'] as const) {
  const st = buildGen2Stage({ config: cfg, kit: kit(), seed: L.seed, difficulty, replay: { seed: L.seed, plan: L.plan, rerolls: L.rerolls, foes: L.foes } });
  const parts = stageParts(st) as Record<string, string>;
  const noCut = { ...parts, platforms: JSON.stringify((st.platforms as any[]).map(({ cut: _c, ...p }) => p)) };
  const per: Record<string, string> = {};
  for (const [k, v] of Object.entries(parts)) per[k] = h(v);
  out[difficulty] = { lock: h(parts), lockNoCut: h(noCut), cuts: (st.platforms as any[]).filter((p) => p.cut !== undefined).map((p) => `${p.id}@${Math.round(p.x)} ${p.style} ${p.width}x${p.height} -> '${p.cut}'`), per };
}
console.log(JSON.stringify(out));
