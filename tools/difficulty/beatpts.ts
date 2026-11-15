// points a beat (a gen2 section, by its pieces' tags s<N>:), mean of seeds: where a stage's load sits. npx tsx tools/difficulty/beatpts.ts 1-6 normal 1,2,3,4
import { scoreStage } from './score.ts';
import { sampleRoute } from '../inspect/beats.ts';
import { RealPlay } from '../../src/game/realPlay.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
const id = process.argv[2] ?? '1-6', setting = (process.argv[3] ?? 'normal') as any, seeds = (process.argv[4] ?? '1,2,3,4').split(',').map(Number);
const acc = new Map<string, { pts: number; secs: number; n: number; kinds: Record<string, number> }>();
for (const seed of seeds) {
  const r = scoreStage(id, setting, seed, new Map());
  setDifficulty(setting); const st: any = new RealPlay(id, seed).stage;
  const chunks: string[] = st.meta?.chunks ?? [];
  const range = new Map<number, [number, number]>();
  for (const p of [...st.platforms, ...st.vines]) { const m = /^s(\d+):/.exec(p.tag ?? ''); if (!m) continue; const k = Number(m[1]); const x0 = p.x, x1 = p.x + (p.width ?? 0); const g = range.get(k); range.set(k, g ? [Math.min(g[0], x0), Math.max(g[1], x1)] : [x0, x1]); }
  const samples = sampleRoute(r.route);
  const tAt = (x: number) => { let b = samples[0], d = Infinity; for (const q of samples) { const e = Math.abs(q.x - x); if (e < d) { d = e; b = q; } } return b.base; };
  for (const [k, [x0, x1]] of [...range.entries()].sort((a, b) => a[0] - b[0])) {
    const name = chunks[k - 1] ?? `s${k}`;
    const a = acc.get(name) ?? { pts: 0, secs: 0, n: 0, kinds: {} };
    for (const c of r.challenges.filter((q) => q.x >= x0 && q.x < x1)) { a.pts += c.points; a.kinds[c.kind] = (a.kinds[c.kind] ?? 0) + c.points; }
    a.secs += Math.max(0, tAt(x1) - tAt(x0)); a.n++;
    acc.set(name, a);
  }
}
for (const [name, a] of acc) console.log(name.padEnd(26), 'points', (a.pts / a.n).toFixed(1).padStart(5), ' route s', (a.secs / a.n).toFixed(0).padStart(4), ' per min', (a.pts / Math.max(1, a.secs) * 60).toFixed(1).padStart(5), ' ', Object.entries(a.kinds).sort((p, q) => q[1] - p[1]).map(([k, v]) => `${k} ${(v / a.n).toFixed(1)}`).join(', '));
