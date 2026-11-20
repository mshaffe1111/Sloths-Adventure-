// VAR-19e probe: each section's own moves (funcheck's move string, validate/core.ts) by template and setting over layouts 1..16, counted;
// and the order of sections per layout. usage: npx tsx secstr.ts <stage>
import '../../../../src/game/headlessDom.ts';
import { build, moveString } from '../../../../tools/validate/core.ts';
const id = process.argv[2];
const tab = new Map<string, Map<string, number>>();
for (const d of ['normal', 'easy'] as const) for (let v = 1; v <= 16; v++) {
  const b: any = build(id, v, d);
  const str = moveString(b.quick);
  const moves = b.quick.filter((s: any) => s.m !== 'h');
  const secs = (b.stage.gen2?.sections ?? []) as Array<{ template: string; x0: number; x1: number }>;
  const order: string[] = [];
  for (const q of secs) {
    const s = moves.map((m: any, i: number) => [m, i]).filter(([m]: any) => m.x >= q.x0 && m.x < q.x1).map(([, i]: any) => str[i]).join('');
    const k = `${d} ${q.template.replace('w1-19-', '')}`;
    const t = tab.get(k) ?? new Map(); t.set(s, (t.get(s) ?? 0) + 1); tab.set(k, t);
    order.push(`${q.template.replace('w1-19-', '')}:${s}`);
  }
  console.log(`${d} L${v}: ${order.join(' ')}`);
}
for (const [k, t] of [...tab].sort()) console.log(`${k}: ${[...t].map(([s, n]) => `${s || '-'}x${n}`).join(' ')}`);
