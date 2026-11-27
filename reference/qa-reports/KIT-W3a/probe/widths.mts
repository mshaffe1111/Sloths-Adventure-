// KIT-W3a box 5: each tower brick's LAID width (section x1 - x0) over 3-1's rolls, and every throw; KEEP=ids (default all five), SEEDS=n
import '/home/user/Sloths-Adventure-/src/game/headlessDom.ts';
import '/home/user/Sloths-Adventure-/tools/engine/draft.ts';
import { W3_DOWN_TOWER } from '/home/user/Sloths-Adventure-/src/game/gen2/worlds/w3.ts';
import { buildStage, SETTINGS } from '/home/user/Sloths-Adventure-/tools/engine/libstage.ts';
const arr = W3_DOWN_TOWER as any[];
const keep = (process.env.KEEP ?? arr.map((q) => q.id).join(',')).split(',');
const kept = arr.filter((q) => keep.includes(q.id)); arr.splice(0, arr.length, ...kept);
const ids = new Set(kept.map((q) => q.id));
const widest = new Map<string, number>(); const pcs = new Map<string, number>();
let ok = 0; const bad: string[] = []; const throws: string[] = [];
for (const d of SETTINGS) for (let s = 1; s <= Number(process.env.SEEDS ?? 40); s++) {
  try {
    const st: any = buildStage('3-1', s, d);
    for (const q of st.gen2.sections) if (ids.has(q.template)) { const w = Math.round(q.x1 - q.x0); if (w > (widest.get(q.template) ?? 0)) { widest.set(q.template, w); } pcs.set(q.template, (pcs.get(q.template) ?? 0) + 1); }
    const e = st.gen2.errors ?? []; if (!e.length) ok++; else { bad.push(d[0] + s); if (process.env.VERBOSE) for (const x of e) console.log('  ', d, s, String(x).slice(0, 230)); }
  } catch (e) { throws.push(d[0] + s + ' ' + (e as Error).message.slice(0, 160)); }
}
console.log('KEEP', keep.join(','), 'ok', ok, 'of', 2 * Number(process.env.SEEDS ?? 40), 'reds', bad.join(' ') || '-', 'throws', throws.length);
for (const t of throws) console.log('  THROW', t);
for (const id of ids) console.log('  laid widest', id, widest.get(id) ?? '-', 'laid', pcs.get(id) ?? 0, 'times');
