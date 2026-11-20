// VAR-1b probe: what each moss_stone block / bank in a stage's rests draws as (terrain.ts footingsFor), by section. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { build } from '../../../../tools/validate/core.ts';
import { footingsFor } from '../../../../src/game/terrain.ts';
const [id, from, to, s, pat] = [process.argv[2] ?? '1-7', Number(process.argv[3] ?? 1), Number(process.argv[4] ?? 16), (process.argv[5] ?? 'normal') as 'normal' | 'easy', process.argv[6] ?? 'rest'];
const tally = new Map<string, number>();
for (let v = from; v <= to; v++) {
  const b = build(id, v, s);
  const st = b.stage as any;
  const g = st.gen2 ?? st.proto?.gen2;
  const secs: { template: string; x0: number; x1: number }[] = g?.sections ?? [];
  const f = footingsFor(st, Number(id.split('-')[0]));
  for (const p of st.platforms) {
    const q = secs.find((q) => p.x + p.width / 2 >= q.x0 && p.x + p.width / 2 < q.x1);
    if (!q || !q.template.includes(pat)) continue;
    const k = `${q.template} ${p.style} h=${p.height} w=${p.width} -> ${f.get(p.id)?.drawn}`;
    if (v === from) console.log(`L${v} x=${p.x} y=${p.y} ${k}`);
    const kk = `${q.template} ${p.style} ${p.height <= 60 ? 'h' + p.height : 'tall'} -> ${f.get(p.id)?.drawn}`;
    tally.set(kk, (tally.get(kk) ?? 0) + 1);
  }
}
for (const [k, n] of [...tally].sort()) console.log(n, k);
