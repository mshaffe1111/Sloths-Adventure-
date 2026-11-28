// read-only scratch (not candidate code): one castBots row on the tree at ROOT, each rescue's frame: when, from where, put back where,
// the piece he last stood on; then the stage's solid wood within 400 px of each rescue spot.
// ROOT=<tree> npx tsx rescuetrace.mts <stage> <bot> <setting> <seed>
const ROOT = process.env.ROOT!;
const [stage, botName, setting, seedS] = process.argv.slice(2);
await import(ROOT + '/src/game/headlessDom.ts');
const { firstTimer } = await import(ROOT + '/tools/inspect/firsttimer.ts');
const { CAST_BOTS } = await import(ROOT + '/tools/inspect/castBots.ts');
const who = (CAST_BOTS as any)[botName][setting];
let last = { x: 0, y: 0, t: 0, on: -1 }, prevR = 0, lastOn = -1;
const out: string[] = [];
let plats: any[] = [];
const spots: Array<{ x: number; y: number }> = [];
const r = firstTimer(stage, Number(seedS), who, { onFrame(sim: any, b: any) {
  if (!plats.length && process.env.BOX) {
    const [x0, x1, y0, y1] = process.env.BOX.split(',').map(Number);
    const P = (sim.platforms as any[]).filter((q) => q.type !== 'drift' && q.y >= y0 && q.y <= y1 && q.x < x1 && q.x + q.width > x0).sort((a, b) => a.y - b.y || a.x - b.x);
    console.log(`wood in x ${x0}-${x1}, y ${y0}-${y1} (${P.length}): ` + P.map((q) => `${Math.round(q.x)}-${Math.round(q.x + q.width)}@${Math.round(q.y)}${q.type === 'solid' ? '' : ' ' + q.type}${q.style ? ' ' + q.style : ''}`).join(' | '));
  }
  plats = sim.platforms;
  const p = sim.p;
  if (process.env.PATHF) ((globalThis as any).__path ??= []).push(`${b.t.toFixed(3)} ${p.x.toFixed(1)} ${p.y.toFixed(1)} ${p.grounded ? 1 : 0} ${sim.standingOn}`);
  if (p.grounded && sim.standingOn >= 0) lastOn = sim.standingOn;
  if (process.env.STOOD && p.grounded && sim.standingOn >= 0) {
    const q = sim.platforms.find((k: any) => k.id === sim.standingOn), Y = Number(process.env.STOOD);
    if (q && Math.abs(q.y - Y) <= 4) { const key = `${Math.round(q.x)}-${Math.round(q.x + q.width)}@${Math.round(q.y)}`; const seen = (globalThis as any).__seen ??= new Map(); const v = seen.get(key); if (!v) seen.set(key, { t0: b.t, t1: b.t, x0: p.x, x1: p.x }); else { v.t1 = b.t; v.x0 = Math.min(v.x0, p.x); v.x1 = Math.max(v.x1, p.x); } }
  }
  if (b.rescues !== prevR) {
    prevR = b.rescues;
    const piece = plats.find((q) => q.id === last.on);
    out.push(`rescue ${prevR} at ${b.t.toFixed(2)} s: from x ${Math.round(last.x)}, y ${Math.round(last.y)} (last on ${piece ? `${Math.round(piece.x)}-${Math.round(piece.x + piece.width)}@${Math.round(piece.y)}` : last.on}) -> put at x ${Math.round(p.x)}, y ${Math.round(p.y)}`);
    spots.push({ x: last.x, y: last.y });
  }
  last = { x: p.x, y: p.y, t: b.t, on: lastOn };
} } as any);
console.log(`${stage} ${botName} ${setting} ${seedS} on ${ROOT.split('/').pop()}: end ${r.end} time ${r.time ?? ''} rescues ${(r as any).rescues ?? prevR}`);
for (const l of out) console.log('  ' + l);
for (const s of spots) {
  const near = plats.filter((q) => q.type === 'solid' && Math.abs(q.y - s.y) < 400 && q.x < s.x + 400 && q.x + q.width > s.x - 400).sort((a, b) => a.y - b.y || a.x - b.x);
  console.log(`  wood near x ${Math.round(s.x)}, y ${Math.round(s.y)}: ` + near.map((q) => `${Math.round(q.x)}-${Math.round(q.x + q.width)}@${Math.round(q.y)}`).join(' '));
}
if ((globalThis as any).__seen) for (const [k, v] of (globalThis as any).__seen) console.log(`  stood on ${k}: ${v.t0.toFixed(2)}-${v.t1.toFixed(2)} s, his x ${Math.round(v.x0)}-${Math.round(v.x1)}`);
if (process.env.PATHF) (await import('node:fs')).writeFileSync(process.env.PATHF, (globalThis as any).__path.join('\n'));
