// VAR-1b probe: hearts (and other pickups) per section, layouts from..to. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { build } from '../../../../tools/validate/core.ts';
const [id, from, to, s] = [process.argv[2] ?? '1-7', Number(process.argv[3] ?? 1), Number(process.argv[4] ?? 16), (process.argv[5] ?? 'normal') as 'normal' | 'easy'];
const tally = new Map<string, number>();
for (let v = from; v <= to; v++) {
  const st = build(id, v, s).stage as any;
  const g = st.gen2 ?? st.proto?.gen2;
  const secs: { template: string; x0: number; x1: number }[] = g?.sections ?? [];
  const items = [...(st.collectibles ?? [])];
  for (const it of items) {
    const kind = it.type ?? it.kind ?? '?';
    if (!/heart/i.test(String(kind))) continue;
    const q = secs.find((q) => it.x >= q.x0 && it.x < q.x1);
    const k = `${q?.template ?? '-'} ${kind}`;
    tally.set(k, (tally.get(k) ?? 0) + 1);
  }
  if (v === from) console.log('keys', Object.keys(st).join(','));
}
for (const [k, n] of [...tally].sort()) console.log(n, k);
