// VAR-19 probe: a stage's flags (checkpoints) and its sections' spans. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { build } from '../../../../tools/validate/core.ts';
const [id, v, s] = [process.argv[2] ?? '1-9', Number(process.argv[3] ?? 1), (process.argv[4] ?? 'easy') as 'normal' | 'easy'];
const b = build(id, v, s); const st: any = b.stage;
console.log('spawn', st.spawnX, 'flags', (st.checkpoints ?? []).map((c: any) => Math.round(c.x)).join(' '));
for (const q of st.gen2?.sections ?? []) console.log(q.template, Math.round(q.x0), Math.round(q.x1));
