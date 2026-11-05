// RUNS #39 #50: the fun gate's own dead-walk measure (tools/validate/core.ts deadWalks on core.ts build, the real engine's route), with the
// limit set to 0 so every walk between moves is listed, placed in the mixer's nodes (meta.mix.explain). GP:291's lines: the longest
// eventless walk <= 2.0 s Normal, <= 3.0 s Easy. 16 layouts x 2 settings.   SID=1-5 npx tsx tools/engine/runs/deadwalk.ts
import '../../../src/game/headlessDom.ts';
import { build, deadWalks } from '../../validate/core.ts';
const id = process.env.SID ?? '1-5';
const per = new Map<string, number[]>();
for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= 16; v++) {
  const b: any = build(id, v, setting);
  const mix = (b.stage.meta?.mix?.explain ?? []) as Array<{ node: number; nid?: string; job: string; x0: number; x1: number }>;
  const nodeAt = (x: number) => { const e = mix.find((q) => q.node > 0 && x >= q.x0 - 1 && x <= q.x1 + 1); return e ? `n${e.nid} ${e.job}` : 'joins/start/end'; };
  const best = new Map<string, number>();
  for (const d of deadWalks(b.steps, b.total, b.samples, 0)) { const k = nodeAt(d.x0); best.set(k, Math.max(best.get(k) ?? 0, d.secs)); }
  for (const [k, s] of best) { const key = `${setting}|${k}`; per.set(key, [...(per.get(key) ?? []), s]); }
}
console.log(`${id}: the longest walk with nothing to do in each node (s), over 16 layouts: median (max); GP:291 line 2.0 s Normal, 3.0 s Easy`);
for (const [k, v] of [...per].sort()) { const a = [...v].sort((x, y) => x - y); const [s, n] = k.split('|'); const line = s === 'normal' ? 2.0 : 3.0; console.log(`  ${s.padEnd(6)} ${n.padEnd(26)} ${a[a.length >> 1].toFixed(1)} (max ${a[a.length - 1].toFixed(1)})  ${a[a.length - 1] <= line ? 'PASS' : 'MISS'} on ${a.length} layouts`); }
