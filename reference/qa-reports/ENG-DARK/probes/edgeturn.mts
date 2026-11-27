// hand-built turn-room toy probe: stand him 2 px in from each sleeping rim on roll <seed>, facing away, at t>0.5 s; record presses
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const ft = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const { darkRims } = await import(path.join(root, 'src/game/gen2/dark.ts'));
const [seed, plant, k0, k1] = process.argv.slice(2);
for (let k = Number(k0 ?? 0); k <= Number(k1 ?? k0 ?? 0); k++) {
  let rim: any, done = false;
  const trace: string[] = [];
  const r = ft.firstTimer('3-1', Number(seed), { ...ft.FT_MIDDLE, setting: 'normal', noTurnRoom: plant === '1' }, { cap: 12, onFrame(sim: any) {
    if (!done && sim.e.gameTime > 0.5) {
      rim = darkRims(sim.stage).filter((q: any) => q.light?.sleep)[k];
      if (!rim) { done = true; return; }
      sim.stand(rim.x - rim.dir * 2, rim.y); sim.p.facing = -rim.dir; sim.p.vx = 0; done = true; return;
    }
    if (rim && trace.length < 12) trace.push(`${sim.e.gameTime.toFixed(2)} in ${((rim.x - sim.p.x) * rim.dir).toFixed(0)} f ${sim.p.facing} g ${sim.p.grounded ? 1 : 0}`);
  } });
  console.log(k, rim ? `rim ${rim.x},${Math.round(rim.y)} dir ${rim.dir} w ${rim.piece.width}` : 'none', 'edge', JSON.stringify(r.dark?.edgeTurns), 'unlit', r.dark?.unlit.length, trace.filter((_, i) => i % 3 === 0).join(' | '));
}
