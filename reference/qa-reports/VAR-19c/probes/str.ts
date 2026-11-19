// VAR-19c probe: each layout's move string (funcheck's moveString, h dropped) cut by section, and its repeat flags. Relative imports (D83).
// usage: npx tsx str.ts <stage> <from> <to> <normal|easy>
import '../../../../src/game/headlessDom.ts';
import { build, repeats, moveString } from '../../../../tools/validate/core.ts';
const [id, a, z, s] = [process.argv[2] ?? '1-9', Number(process.argv[3] ?? 1), Number(process.argv[4] ?? 16), (process.argv[5] ?? 'easy') as 'normal' | 'easy'];
let flagged = 0;
for (let v = a; v <= z; v++) {
  const b = build(id, v, s); const st: any = b.stage;
  const secs: any[] = st.gen2.sections;
  const parts = secs.map((q) => `${q.template.replace('w1-19-', '')}:${b.steps.filter((p) => p.x >= q.x0 && p.x < q.x1).map((p) => p.m).join('')}`);
  const r = repeats(moveString(b.steps), b.steps, st.proto?.bpm);
  if (r.length) flagged++;
  console.log(`L${v} ${r.map((f) => `${f.kind}:${f.run}x${f.n}`).join(' ') || 'ok'}\n  ${parts.join(' | ')}`);
}
console.log(`${id} ${s}: repeat on ${flagged} of ${z - a + 1}`);
