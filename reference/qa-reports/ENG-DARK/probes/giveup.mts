// hand-built give-up toy probe: the child, noGlowTurn, stood 40 px in from sleeping rim k facing away at 0.5 s and again at T2 s
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const ft = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const { darkRims } = await import(path.join(root, 'src/game/gen2/dark.ts'));
const [seed, k0, k1, t2] = process.argv.slice(2);
for (let k = Number(k0); k <= Number(k1); k++) {
  let rim: any, n = 0;
  const r = ft.firstTimer('3-1', Number(seed), { ...ft.FT_CHILD, noGlowTurn: true }, { cap: Number(t2) + 8, onFrame(sim: any) {
    if (rim?.light && process.env.DARK) (sim.e as any).glowWake.delete(rim.light.id);
    const at = n === 0 ? 0.5 : Number(t2);
    if (n < 2 && sim.e.gameTime > at) {
      rim ??= darkRims(sim.stage).filter((q: any) => q.light?.sleep)[k];
      if (!rim) { n = 2; return; }
      sim.stand(rim.x - rim.dir * Number(process.env.IN ?? 40), rim.y); sim.p.facing = -rim.dir; sim.p.vx = 0; n++;
    }
  } });
  console.log(k, rim ? `rim ${rim.x},${Math.round(rim.y)} dir ${rim.dir}` : 'none', 'gaveUp', JSON.stringify(r.dark?.gaveUp), 'unlit', r.dark?.unlit.length);
}
