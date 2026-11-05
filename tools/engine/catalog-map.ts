// Each measured kind (tools/engine/inventory.json) with its library label (src/game/mixer/catalog.ts): the data the library sheet is
// built from. The matching is catalog-check's.  npx tsx tools/engine/catalog-map.ts  (writes tools/engine/catalog-map.json)
import fs from 'node:fs';
import { CLIMBS, LANDINGS, ZONES, propFamily, propWorld, PICKUP_RULE, ANIMAL_RULE } from '../../src/game/mixer/catalog.ts';
const inv = JSON.parse(fs.readFileSync(new URL('./inventory.json', import.meta.url), 'utf8'));
const strip = (k: any) => { if (!k) return null; const { match: _m, ...rest } = k; return rest; };
const rows = inv.rows.map((r: any) => {
  let label: any = null;
  if (r.arr === 'platforms') {
    const [type, style, ...rest] = r.key.split(' '); const p: any = { type, style: style === '-' ? undefined : style };
    for (const t of rest) { if (t.startsWith('art=')) p.art = t.slice(4); else if (t.startsWith('pit=')) p.pit = t.slice(4); else p[t] = true; }
    label = strip(LANDINGS.find((k) => k.match(p)));
  } else if (r.arr === 'vines' || r.arr === 'ropes') {
    const [vt, ...fl] = r.key.split(' '); const v: any = r.arr === 'vines' ? { vineType: vt } : { required: fl.includes('required') }; for (const f of fl) v[f] = true;
    label = strip(CLIMBS.find((k) => k.match(r.arr, v)));
  } else if (r.cat === 'prop') { const f = propFamily(r.key || r.arr); label = f ? { name: f.family, element: f.element, footing: f.footing, mayFloat: f.mayFloat, worldLock: propWorld(r.key) ?? null } : null; }
  else if (r.cat === 'pickup') label = { name: 'pickup', footing: PICKUP_RULE };
  else if (r.cat === 'animal') label = { name: 'animal', footing: ANIMAL_RULE };
  else label = strip(ZONES.find((z) => z.arr === r.arr && (!z.kinds || z.kinds.includes(r.key))));
  return { ...r, label };
});
fs.writeFileSync(new URL('./catalog-map.json', import.meta.url), JSON.stringify(rows) + '\n');
console.log(`catalog map: ${rows.length} kinds, ${rows.filter((r: any) => !r.label).length} unlabelled`);
