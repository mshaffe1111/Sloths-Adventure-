// behind-edge toy finder: per roll, each sleeping rim light moved 5000 px up (out of any reach): darkLandings' messages
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const { generateAllLevels } = await import(path.join(root, 'src/game/worldsData.ts'));
const { generateStage, setLayoutVariant } = await import(path.join(root, 'src/game/stageGenerator.ts'));
const { darkLandings, darkRims } = await import(path.join(root, 'src/game/gen2/dark.ts'));
const [a, b, d] = process.argv.slice(2);
for (let seed = Number(a); seed <= Number(b); seed++) {
  setLayoutVariant(seed);
  let st: any;
  try { st = generateStage({ ...generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!, unlocked: true }, d); } finally { setLayoutVariant(null); }
  for (const r of darkRims(st)) {
    if (!r.light?.sleep) continue;
    const L = r.light;
    const zones = st.zones.map((z: any) => (z.kind !== 'dark' || !z.lights?.includes(L) ? z : { ...z, lights: z.lights.map((l: any) => (l === L ? { ...l, y: l.y - 5000 } : l)) }));
    const m = darkLandings({ ...st, zones }, d);
    console.log(seed, `${r.x},${Math.round(r.y)},${r.dir}`, m.length, m.map((s: string) => s.replace(/^.*the rim at /, '').slice(0, 40)).join(' | '));
  }
}
