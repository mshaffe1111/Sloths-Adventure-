// VAR-1 probe: one roll of a stage as the list search builds it: its errors and the sections laid (x). Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { rollStage, buildStage } from '../../../../tools/engine/libstage.ts';
const [id, seed, d] = [process.argv[2], Number(process.argv[3] ?? 1), (process.argv[4] ?? 'normal') as 'normal' | 'easy'];
const r = rollStage(id, seed, d);
console.log('clean', r.clean, r.thrown ?? '', 'secs', r.seconds, 'width', r.width);
for (const e of r.errors) console.log('  ERR', e.slice(0, 260));
if (!r.thrown) { const st: any = buildStage(id, seed, d); for (const s of st.gen2.sections ?? []) console.log('  ', s.node, s.template, Math.round(s.x0), Math.round(s.x1)); }
