// VAR-19b probe: funcheck's "repeat" flags (core.ts repeats) on a stage's layouts, each run's places named by section. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { build, moveString, repeats } from '../../../../tools/validate/core.ts';
const [id, a, z, s] = [process.argv[2] ?? '1-9', Number(process.argv[3] ?? 1), Number(process.argv[4] ?? 16), (process.argv[5] ?? 'easy') as 'normal' | 'easy'];
for (let v = a; v <= z; v++) {
  const b = build(id, v, s); const st: any = b.stage;
  const sec = (x: number) => (st.gen2.sections.find((q: any) => x >= q.x0 && x < q.x1)?.template ?? '-').replace('w1-19-', '');
  for (const r of repeats(moveString(b.steps), b.steps, st.proto?.bpm)) console.log(`L${v}\t${r.kind}\t${r.run}\tx${r.n}\t${r.at.map((x) => sec(x)).join(',')}`);
}
