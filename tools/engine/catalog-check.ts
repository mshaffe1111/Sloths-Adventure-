// The catalogue check: every kind the measured inventory holds (tools/engine/inventory.json) maps to exactly one labelled entry in the
// engine's library (src/game/mixer/catalog.ts), so no piece the game lays is unlabelled and none has two labels. Fails on any gap.
//   npx tsx tools/engine/catalog-check.ts
import fs from 'node:fs';
import { CLIMBS, LANDINGS, PROP_FAMILIES, ZONES, propFamily } from '../../src/game/mixer/catalog.ts';
const inv = JSON.parse(fs.readFileSync(new URL('./inventory.json', import.meta.url), 'utf8')) as { rows: Array<{ cat: string; arr: string; key: string; perWorld: number[] }> };
const err: string[] = [];
const open: string[] = [];
const tally: Record<string, number> = {};
for (const r of inv.rows) {
  let names: string[] = [];
  if (r.arr === 'platforms') {
    const [type, style, ...rest] = r.key.split(' ');
    const p: Record<string, unknown> = { type, style: style === '-' ? undefined : style };
    for (const t of rest) { if (t.startsWith('art=')) p.art = t.slice(4); else if (t.startsWith('pit=')) p.pit = t.slice(4); else p[t] = true; }
    names = LANDINGS.filter((k) => k.match(p as never)).map((k) => k.name);
    for (const k of LANDINGS.filter((q) => q.match(p as never) && q.open)) open.push(`${r.key} (${k.name})`);
  } else if (r.arr === 'vines' || r.arr === 'ropes') {
    const [vt, ...fl] = r.key.split(' ');
    const v: Record<string, unknown> = r.arr === 'vines' ? { vineType: vt } : { required: fl.includes('required') };
    for (const f of fl) v[f] = true;
    names = CLIMBS.filter((k) => k.match(r.arr as never, v)).map((k) => k.name);
  } else if (r.cat === 'prop') {
    // (a prop list whose entries carry no name is named by its list: waterSigns, the water warning sign)
    const f = propFamily(r.key || r.arr); names = f ? [f.family] : [];
  } else if (r.cat === 'pickup' || r.cat === 'animal') {
    names = [r.cat];
  } else {
    names = ZONES.filter((z) => z.arr === r.arr && (!z.kinds || z.kinds.includes(r.key))).map((z) => z.name);
  }
  if (names.length !== 1) err.push(`${r.arr} "${r.key}" (${r.cat}) maps to ${names.length ? names.join(' + ') : 'no entry'}`);
  else tally[r.cat] = (tally[r.cat] ?? 0) + 1;
}
// (a taught hazard or zone keeps returning to World 10 (the designer, 11-05 1:14): its worlds run from its teach world through W10; a
// one-stage set piece (4-3's) is named and excepted; a world it may go in but has no art for is an art gap, listed, never drawn in another
// world's art)
const HAZARDS = ['wind', 'dark', 'spore', 'web', 'tide', 'crumbling floor zone', 'geyser', 'bolt', 'thorn vine'];
for (const z of ZONES.filter((q) => HAZARDS.includes(q.name))) {
  if (z.setPiece) continue;
  const first = Math.min(...z.worlds);
  for (let w = first; w <= 10; w++) if (!z.worlds.includes(w)) err.push(`hazard "${z.name}" (taught in W${first}) stops short of W10: no W${w}`);
  if (!z.artIn?.length) err.push(`hazard "${z.name}" names no worlds with its art (artIn)`);
}
const artGaps = ZONES.filter((q) => HAZARDS.includes(q.name) && !q.setPiece).map((q) => `${q.name}: ${q.worlds.filter((w) => !(q.artIn ?? []).includes(w)).map((w) => 'W' + w).join(' ') || 'none'}`);
console.log(err.length ? err.join('\n') : `catalogue check: all ${inv.rows.length} measured kinds map to exactly one entry (${Object.entries(tally).map(([c, n]) => `${c} ${n}`).join(', ')}); ${LANDINGS.length} landing kinds, ${CLIMBS.length} climbables, ${ZONES.length} zones and helpers, ${PROP_FAMILIES.length} prop families`);
console.log(`art gaps (worlds a taught hazard may go in with no art there yet; shrink-only): ${artGaps.join('; ')}`);
if (open.length) console.log(`open (not laid in a new stage until ruled): ${open.join('; ')}`);
process.exit(err.length ? 1 : 0);
