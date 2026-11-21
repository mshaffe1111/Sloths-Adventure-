// BUILD-26c: the bot's run on 2-6 as segments: on a wheel (its row), on a street storey (y), on a climb, in the air; with seconds
// usage: npx tsx beats.mts <root> <bot> <setting> <seed>
const [root, bot, setting, seedS] = process.argv.slice(2);
await import(root + '/src/game/headlessDom.ts');
const { CAST_BOTS } = await import(root + '/tools/inspect/castBots.ts');
const { firstTimer } = await import(root + '/tools/inspect/firsttimer.ts');
const { setDifficulty } = await import(root + '/src/game/difficulty.ts');
setDifficulty(setting as never);
let f = 0; const segs: Array<{ k: string; t0: number; t1: number; x0: number; x1: number }> = [];
let wheelName: Map<number, string> | null = null;
const r: any = firstTimer('2-6', Number(seedS), CAST_BOTS[bot][setting]!, { cap: 1200, dotSetting: true, onFrame: (sim: any) => {
  f++; const t = f / 30; const p = sim.p;
  if (!wheelName) { wheelName = new Map(); for (const q of sim.stage.platforms) if (q.wheel) wheelName.set(q.id, `${q.wheel.w.lay?.row ?? 'wheel'}@${Math.round(q.wheel.w.cx)},${Math.round(q.wheel.w.cy)}`); }
  const on = sim.platforms?.find?.((q: any) => q.id === sim.standingOn);
  let k: string;
  if (p.climbing) k = 'climb';
  else if (wheelName.has(sim.standingOn) && p.grounded) k = 'WHEEL ' + wheelName.get(sim.standingOn);
  else if (p.grounded && on) k = `street y${Math.round(on.y / 20) * 20}`;
  else k = 'air';
  const s = segs[segs.length - 1];
  if (s && (s.k === k || (k === 'air' && t - s.t1 < 1.0))) { s.t1 = t; s.x1 = Math.round(p.x); } else segs.push({ k, t0: t, t1: t, x0: Math.round(p.x), x1: Math.round(p.x) });
} });
console.log(`${bot} ${setting} seed ${seedS}: ${r.end} ${r.time} s rescues ${r.rescues}`);
// merge air blips into their neighbours, then print
const out: typeof segs = [];
for (const s of segs) { const o = out[out.length - 1]; if (o && (o.k === s.k || s.k === 'air' && s.t1 - s.t0 < 0.8)) { o.t1 = s.t1; o.x1 = s.x1; } else out.push({ ...s }); }
for (const s of out) if (s.t1 - s.t0 >= 0.3) console.log(`  ${s.t0.toFixed(1).padStart(6)}  ${(s.t1 - s.t0).toFixed(1).padStart(5)} s  ${s.k.padEnd(34)} x ${s.x0}->${s.x1}`);
