// VAR-19b probe: one layout's moves in order: the gap since the move before (minus busy, as deadWalks counts it), x, the move, and the
// section/piece it starts on. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { build, deadWalks } from '../../../../tools/validate/core.ts';
const [id, v, s] = [process.argv[2] ?? '1-9', Number(process.argv[3] ?? 1), (process.argv[4] ?? 'normal') as 'normal' | 'easy'];
const b = build(id, v, s);
const st: any = b.stage;
const nodes: any[] = (st.gen2?.nodes ?? []).slice().sort((p: any, q: any) => p.x0 - q.x0);
const node = (x: number) => { let k = '-'; for (const n of nodes) if (n.x0 <= x) k = n.token; return k; };
const plat = (x: number, y: number) => {
  const ps = st.platforms.filter((p: any) => x >= p.x - 2 && x <= p.x + p.width + 2).sort((p: any, q: any) => Math.abs(p.y - y) - Math.abs(q.y - y));
  return ps[0] ? `${String(ps[0].tag ?? '').split(':').slice(-1)[0]}@${ps[0].x}w${ps[0].width}y${ps[0].y}` : '?';
};
const dead = new Set(deadWalks(b.steps, b.total, b.samples).map((d) => d.t1));
let prev = 0;
for (const q of b.steps) {
  console.log(`${(q.t - prev).toFixed(1).padStart(5)} ${dead.has(q.t) ? 'DEAD' : '    '} x${q.x} y${q.y} ${q.m} ${node(q.x)} ${plat(q.x, q.y)} ${q.what}${(q as any).fight ? ' fight' + (q as any).fight : ''}`);
  prev = q.t;
}
console.log(`end ${(b.total - prev).toFixed(1)} ${dead.has(b.total) ? 'DEAD' : ''}`);
console.log(nodes.map((n) => `${n.token}@${n.x0}-${n.x1}`).join(' '));
