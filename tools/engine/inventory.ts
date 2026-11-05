// The piece inventory, measured: every landing, climbable, zone, prop, animal and pickup kind each world's builder lays today, read off
// the built stages (every stage of all ten worlds, as the engine builds it, through tools/validate's sim), with counts per world and the
// code that sets it. The library is extended from this table, never from a list typed by hand.
//   npx tsx tools/engine/inventory.ts [--layouts 2]   (writes tools/engine/inventory.json and reference/engine/INVENTORY.md)
import fs from 'node:fs';
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { sim } from '../validate/play.ts';
const L = Number(process.argv[process.argv.indexOf('--layouts') + 1] || 2) || 2;
const stages = generateAllLevels().filter((c) => !c.secret).map((c) => c.id);
/** a stage's arrays that are not pieces (markers, text, the beat log) */
const SKIP = new Set(['checkpoints', 'proto.hints', 'proto.beats', 'heartFalls', 'proto.watch']);
const FLAGS = ['lily', 'lift', 'drift', 'push', 'chase', 'chaseTip', 'crown', 'pillar', 'catch', 'lip', 'soil', 'pit', 'hollow', 'bare', 'creak', 'crumbleAfter', 'moveRange', 'regrowAt'];
const CAT: Record<string, string> = { platforms: 'landing', vines: 'climbable', ropes: 'climbable', lianas: 'climbable', updrafts: 'air', zones: 'zone', enemies: 'animal', collectibles: 'pickup' };
const catOf = (arr: string) => CAT[arr] ?? (/dress|decor|bush|sign|prop/i.test(arr) ? 'prop' : /draft|wind|geyser|spore/i.test(arr) ? 'air' : /water|pool|swim|tide/i.test(arr) ? 'water' : 'other');
function keyOf(arr: string, el: any): string {
  if (arr === 'platforms') {
    const fl = FLAGS.filter((f) => el[f] !== undefined && el[f] !== false && el[f] !== 0).map((f) => (f === 'pit' ? `pit=${el.pit}` : f));
    return [el.type, el.style ?? '-', el.art ? `art=${el.art}` : '', ...fl].filter(Boolean).join(' ');
  }
  // (a vine is a climbing vine, a swinging liana, a rope, silk or a kit vine: its own flags say which)
  if (arr === 'vines') return [el.vineType ?? (el.isSwingingVine ? 'swing_liana' : 'tree_climb'), ...['rope', 'silk', 'kit', 'off'].filter((f) => el[f])].join(' ');
  if (arr === 'ropes') return el.required ? 'rope required' : 'rope';
  // (a walking villager is named by its animation cel, W2's bank village)
  const k = el.kind ?? el.type ?? el.n ?? el.style ?? el.cel ?? '';
  return typeof k === 'string' || typeof k === 'number' ? String(k) : '';
}
/** where the code lays a kind: while a stage builds, the first lines that push an object of each base kind (a landing's type, style and
 *  art; anything else its kind) onto any array. Pieces made another way (a literal list, a map) show no line */
const laidAt = new Map<string, Map<number, string>>();
const born = new WeakSet<object>();
let curW = 0;
const baseOf = (arr: string, key: string) => (arr === 'platforms' ? 'P ' + key.split(' ').filter((t, i) => i < 2 || t.startsWith('art=')).join(' ') : 'K ' + key);
const push0 = Array.prototype.push;
function tracePush(this: unknown[], ...items: unknown[]) {
  for (const it of items as any[]) {
    if (!it || typeof it !== 'object' || typeof it.x !== 'number') continue;
    const isP = typeof it.width === 'number' && typeof it.height === 'number' && typeof it.type === 'string' && 'id' in it && !('hp' in it);
    const k = isP ? `P ${it.type} ${it.style ?? '-'}${it.art ? ' art=' + it.art : ''}` : 'topY' in it ? `K ${[it.vineType ?? (it.isSwingingVine ? 'swing_liana' : 'tree_climb'), ...['rope', 'silk', 'kit', 'off'].filter((f) => it[f])].join(' ')}` : 'x0' in it && 'g0' in it ? `K ${it.required ? 'rope required' : 'rope'}` : `K ${it.kind ?? it.type ?? it.n ?? it.style ?? it.cel ?? ''}`;
    // (only an object's first push is where it is made: later pushes are copies, the level check's or the pickups' passes)
    if (born.has(it)) continue;
    born.add(it);
    const byW = laidAt.get(k) ?? new Map<number, string>();
    if (byW.has(curW)) continue;
    const line = (new Error().stack ?? '').split('\n').slice(2).map((l) => l.match(/(src\/[^:()]+):(\d+)/)).find(Boolean);
    if (line) { byW.set(curW, `${line[1]}:${line[2]}`); laidAt.set(k, byW); }
  }
  return push0.apply(this, items);
}
type Row = { cat: string; arr: string; key: string; perWorld: number[]; stages: Set<string> };
const rows = new Map<string, Row>();
const fail: string[] = [];
for (const id of stages) {
  const w = Number(id.split('-')[0]);
  curW = w;
  for (let v = 1; v <= L; v++) {
    let s; try { Array.prototype.push = tracePush as never; s = sim(id, v, 'normal'); Array.prototype.push = push0; } catch (e) { Array.prototype.push = push0; fail.push(`${id} v${v}: ${String((e as Error).message).slice(0, 80)}`); continue; }
    const st: any = s.stage;
    const visit = (o: any, pre: string) => { for (const [k, val] of Object.entries(o ?? {})) {
      const arr = pre + k; if (SKIP.has(arr) || !Array.isArray(val) || !val.length || typeof val[0] !== 'object' || Array.isArray(val[0])) continue;
      for (const el of val) { const key = keyOf(k, el); const rk = `${arr}|${key}`;
        const r = rows.get(rk) ?? { cat: catOf(k), arr, key, perWorld: Array(11).fill(0), stages: new Set<string>() }; rows.set(rk, r);
        r.perWorld[w] += v === 1 ? 1 : 0; r.stages.add(id); } } };
    visit(st, ''); visit(st.proto, 'proto.');
  }
  process.stderr.write(`${id} `);
}
const list = [...rows.values()].sort((a, b) => a.cat.localeCompare(b.cat) || a.arr.localeCompare(b.arr) || a.key.localeCompare(b.key));
const json = list.map((r) => ({ cat: r.cat, arr: r.arr, key: r.key, perWorld: r.perWorld.slice(1), first: stages.find((s) => r.stages.has(s)), stageCount: r.stages.size, stageList: stages.filter((s) => r.stages.has(s)), at: [...(laidAt.get(baseOf(r.arr, r.key)) ?? new Map<number, string>())].filter(([w]) => r.perWorld[w] || r.stages.size).filter(([w]) => [...r.stages].some((st) => st.startsWith(w + '-'))).map(([w, l]) => `W${w} ${l}`).join(', ') }));
fs.writeFileSync(new URL('./inventory.json', import.meta.url), JSON.stringify({ layouts: L, stages: stages.length, rows: json, fail }, null, 1) + '\n');
const md = [`# The piece inventory, measured (${new Date().toISOString().slice(0, 10)})`, '',
  `Every kind each world's builder lays today, read off the built stages: ${stages.length} stages, layouts 1-${L} on Normal, through`,
  "`tools/validate`'s sim (`npx tsx tools/engine/inventory.ts`). Counts per world are layout 1's total over the world's stages. \"Stages\" is",
  `how many stages lay it on any layout. "Laid at" is the first lines in \`src/\` that pushed one while the stage built (traced; a kind made another way shows none). A landing's key is`,
  'its type, style, art and flags. Nothing here is typed by hand. Built on branch engine-mixer: its 1-1 and 1-5 are the mixer\'s, every other stage is the shipped builder\'s.', '',
  `${json.length} kinds; ${fail.length} builds failed${fail.length ? ': ' + fail.join('; ') : ''}.`, ''];
for (const cat of [...new Set(json.map((r) => r.cat))]) {
  md.push(`## ${cat}`, '', '| array | kind | W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8 | W9 | W10 | first | stages | laid at |', '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of json.filter((q) => q.cat === cat)) md.push(`| ${r.arr} | ${r.key || '(none)'} | ${r.perWorld.map((n) => n || '').join(' | ')} | ${r.first} | ${r.stageCount} | ${r.at.replace(/\|/g, '/')} |`);
  md.push('');
}
fs.writeFileSync(new URL('../../reference/engine/INVENTORY.md', import.meta.url), md.join('\n'));
console.log(`\ninventory: ${stages.length} stages x ${L} layouts; ${json.length} kinds; ${fail.length} failed`);
