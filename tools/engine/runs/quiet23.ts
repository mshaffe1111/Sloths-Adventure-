import { rollStage, buildStage } from '../libstage.ts';
const [a, b] = (process.argv[2] ?? '1-6').split('-').map(Number);
for (let s = a; s <= b; s++) {
  const r = rollStage('2-3', s, 'normal');
  const m = r.errors.join(' ').match(/at x (\d+)/);
  let where = '';
  if (m) { const st: any = buildStage('2-3', s, 'normal'); const x = +m[1]; const q = st.gen2.sections.find((z: any) => x >= z.x0 && x <= z.x1); where = q ? `${q.template.replace('w2-23-', '')} +${Math.round(x - q.x0)}` : '?'; }
  console.log(s, r.clean ? 'CLEAN' : r.errors.map((e) => e.slice(0, 110)).join(' ; '), where);
}
