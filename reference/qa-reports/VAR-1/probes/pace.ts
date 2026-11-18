// VAR-1b probe: the gated (old-rule) pacing of a stage's layouts: the 5 s strip, and each flag with its time. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { build, pacing, pacingStrip, paceFlags } from '../../../../tools/validate/core.ts';
const [id, from, to, s] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4]), (process.argv[5] ?? 'normal') as 'normal' | 'easy'];
for (let v = from; v <= to; v++) {
  const b = build(id, v, s);
  const pc = pacing(b.steps, b.total);
  const f = paceFlags(pc, false).filter((x) => /no rest/.test(x.what));
  const g = (b.stage as any).gen2 ?? (b.stage as any).proto?.gen2;
  const at = (t: number) => { const st = b.steps.find((q) => q.t >= t); const q = st && g?.sections.find((q: any) => st.x >= q.x0 && st.x < q.x1); return q?.template ?? '-'; };
  console.log(`L${v}`, pacingStrip(pc), f.map((x) => `${x.what.split(' (')[0]} @${Math.round(x.t ?? 0)}s ${at(x.t ?? 0)}`).join('; ') || 'ok');
}
