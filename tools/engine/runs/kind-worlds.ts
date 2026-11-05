// RUNS #134-#141: which worlds lay each labelled landing kind (src/game/mixer/catalog.ts LANDINGS, matched the way
// tools/engine/catalog-check.ts matches), read off a measured inventory (tools/engine/inventory.ts output).
//   npx tsx tools/engine/runs/kind-worlds.ts <inventory.json>
import fs from 'node:fs';
import { LANDINGS } from '../../../src/game/mixer/catalog.ts';
const inv = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) as { layouts: number; rows: Array<{ cat: string; arr: string; key: string; perWorld: number[] }> };
const by = new Map<string, number[]>();
for (const r of inv.rows) {
  if (r.arr !== 'platforms') continue;
  const [type, style, ...rest] = r.key.split(' ');
  const p: Record<string, unknown> = { type, style: style === '-' ? undefined : style };
  for (const t of rest) { if (t.startsWith('art=')) p.art = t.slice(4); else if (t.startsWith('pit=')) p.pit = t.slice(4); else p[t] = true; }
  for (const k of LANDINGS.filter((q) => q.match(p as never))) {
    const a = by.get(k.name) ?? Array(10).fill(0);
    r.perWorld.forEach((n, i) => (a[i] += n)); by.set(k.name, a);
  }
}
console.log(`inventory at ${inv.layouts} layouts; landing kind: worlds laid (count per world) | catalog.ts worlds`);
for (const k of LANDINGS) {
  const a = by.get(k.name) ?? Array(10).fill(0);
  console.log(`  ${k.name.padEnd(28)} W${a.map((n, i) => (n ? i + 1 : 0)).filter(Boolean).join(',W') || '-'}  (${a.join(' ')}) | catalog ${JSON.stringify((k as any).worlds)}`);
}
