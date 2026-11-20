// VAR-19 probe: each boa's x, width, patrol span and the nearest route landing on its surface. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { build } from '../../../../tools/validate/core.ts';
const [id, v, s] = [process.argv[2] ?? '1-9', Number(process.argv[3] ?? 1), (process.argv[4] ?? 'easy') as 'normal' | 'easy'];
const b = build(id, v, s);
const lands = b.route.segs.filter((g: any) => ['jump', 'hop', 'bounce', 'swing', 'glide'].includes(g.kind)).map((g: any) => ({ x0: g.x0, x: g.x1, y: g.y1, k: g.kind }));
for (const m of (b.stage as any).enemies) if (m.type === 'boa') {
  const surf = m.y + m.height; const L = lands.filter((l: any) => Math.abs(l.y - surf) < 40).sort((p: any, q: any) => Math.abs(p.x - m.x) - Math.abs(q.x - m.x))[0];
  console.log(`boa x=${Math.round(m.x)} w=${m.width} patrol=${Math.round(m.patrolMinX)}..${Math.round(m.patrolMaxX)} tag=${m.tag} | nearest landing ${L ? `${L.k} ${Math.round(L.x0)}->${Math.round(L.x)}` : '-'}`);
}
