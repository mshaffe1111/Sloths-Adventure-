// VAR-1 probe: a stage's route steps (move letter, x, y, what) with the section each falls in. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { build } from '../../../../tools/validate/core.ts';
const [id, v, s] = [process.argv[2] ?? '1-7', Number(process.argv[3] ?? 1), (process.argv[4] ?? 'normal') as 'normal' | 'easy'];
const b = build(id, v, s);
const g = (b.stage as any).gen2 ?? (b.stage as any).proto?.gen2;
const secs: { template: string; node: string; x0: number; x1: number }[] = g?.sections ?? [];
const sec = (x: number) => { const q = secs.find((q) => x >= q.x0 && x < q.x1); return q ? `${q.template}@${q.node}` : '-'; };
let last = '';
for (const st of b.steps) {
  if (st.m === 'h') continue;
  const q = sec(st.x);
  if (q !== last) { console.log(`== ${q}`); last = q; }
  console.log(`  ${st.m} t=${st.t.toFixed(1)} x=${st.x} y=${st.y} ${st.what}`);
}
console.log('str', b.steps.filter((x) => x.m !== 'h').map((x) => x.m).join(''), 'total', Math.round(b.total));
