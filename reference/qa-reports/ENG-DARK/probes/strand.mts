// a strand trace (ENG-DARK-e): his track from t0 on every 1 s, then the exit, the zones at his end point and the platforms near it. NOWAIT=1 removes the dark stop (noGlowWait)
// run from the tree under test: GEN2_DRAFT=3-1 npx tsx <this> <bot> <setting> <seed> <t0>
import path from 'node:path';
const root = process.cwd();
const [bot, setting, seedArg, t0Arg] = process.argv.slice(2);
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const cb = await import(path.join(root, 'tools/inspect/castBots.ts'));
const { firstTimer } = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const who = process.env.NOWAIT ? { ...cb.CAST_BOTS[bot][setting], noGlowWait: true } : cb.CAST_BOTS[bot][setting];
const t0 = Number(t0Arg);
let next = t0, last: any = null, stageRef: any = null;
const r = firstTimer('3-1', Number(seedArg), who, {
  onFrame: (sim: any) => {
    stageRef = sim.stage; last = sim;
    if (sim.t >= next) {
      next += 1;
      const p = sim.p;
      console.log('t', sim.t.toFixed(1), 'x', Math.round(p.x), 'y', Math.round(p.y), 'vx', Math.round(p.vx), 'vy', Math.round(p.vy), 'gr', p.grounded ? 1 : 0, 'on', sim.standingOn, 'face', p.facing);
    }
  },
});
console.log('end', r.end, 't', r.time?.toFixed?.(1), 'rescues', r.rescues);
const st: any = stageRef;
const p = last.p;
console.log('exit', st.exitTotemX, st.exitTotemY, 'p', Math.round(p.x), Math.round(p.y));
for (const z of (st.zones ?? [])) { const zx = z.x, zy = z.y, zw = z.w ?? z.width, zh = z.h ?? z.height; if (p.x >= zx && p.x <= zx + zw && p.y >= zy - 50 && p.y <= zy + zh) console.log('  zone at p', z.kind, Math.round(zx), Math.round(zy), Math.round(zw), Math.round(zh), 'lights', (z.lights ?? []).length, (z.lights ?? []).filter((l) => Math.abs(l.y - p.y) < 700 && Math.abs(l.x - p.x) < 900).map((l) => `${Math.round(l.x)},${Math.round(l.y)}${l.sleep ? 's' : ''}#${l.id}`).join(' ')); }
for (const z of (st.zones ?? [])) if (z.kind === 'dark' && Math.abs(z.y - p.y) < 900) console.log('  dark', Math.round(z.x), Math.round(z.y), Math.round(z.w ?? z.width), Math.round(z.h ?? z.height), 'lights', (z.lights ?? []).filter((l) => Math.abs(l.y - p.y) < 600).map((l) => `${Math.round(l.x)},${Math.round(l.y)}${l.sleep ? 's' : ''}`).join(' '));
const near = last.platforms.filter((q: any) => Math.abs(q.y - p.y) < 500 && q.x < p.x + 700 && q.x + q.width > p.x - 700);
for (const q of near.sort((a: any, b: any) => a.y - b.y)) console.log('  plat', q.id, q.type, 'x', Math.round(q.x), '-', Math.round(q.x + q.width), 'y', Math.round(q.y));
