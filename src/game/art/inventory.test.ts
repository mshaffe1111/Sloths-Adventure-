/**
 * The art inventory the engine reads (src/game/art/inventory/w1..w10.json and cast.json, from `python3 tools/art/catalog_master.py
 * --emit`): the files split the catalog with nothing lost, every row's image is real, every footing lies inside its image, no made thing
 * is World 1's best fit, and the queries agree with counts taken straight from reference/art/CATALOG-MASTER.csv (parsed here on its
 * own, not through the emitted files).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Inventory, LEVEL_LAYERS, loadInventory, type ArtRow, type InventoryFile } from './inventory.ts';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const NAMES = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'w10', 'cast'];
const FILE = Object.fromEntries(NAMES.map((n) => [n,
  new Inventory(JSON.parse(readFileSync(new URL(`./inventory/${n}.json`, import.meta.url), 'utf8')) as InventoryFile)]));
const W = (n: number) => FILE[`w${n}`];
/** every row once (a level piece sits in each world file it fits) */
const ALL: ArtRow[] = [...new Map(NAMES.flatMap((n) => FILE[n].rows.map((r) => [r.id, r] as const))).values()];
const inv = { rows: ALL, byId: (id: string) => ALL.find((r) => r.id === id) };

/** RFC 4180: quoted fields with commas, doubled quotes and newlines */
function parseCsv(txt: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], f = '', q = false;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i];
    if (q) {
      if (ch === '"') { if (txt[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(f); f = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && txt[i + 1] === '\n') i++;
      row.push(f); rows.push(row); row = []; f = '';
    } else f += ch;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const head = rows[0];
  return rows.slice(1).filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}
const CSV = parseCsv(readFileSync(`${ROOT}reference/art/CATALOG-MASTER.csv`, 'utf8'));
/** catalog_master.py parse_worlds: 'N reason; N reason' or 'USED N | COULD N' */
const worldsOf = (s: string): number[] => {
  const out: number[] = [];
  for (const part of s.split(/[;|]\s*/)) {
    const m = /^\s*(?:(?:USED|COULD|used|could)\b:?\s*)?W?(\d+)\b/.exec(part);
    const n = m ? Number(m[1]) : 0;
    if (n >= 1 && n <= 10 && !out.includes(n)) out.push(n);
  }
  return out;
};
const isNum = (s: string) => /^-?\d+(\.\d+)?$/.test(s.trim());

test('the files split the catalog: every row once, each world file holds exactly the level art that fits it', () => {
  assert.equal(ALL.length, CSV.length);
  assert.deepEqual(new Set(ALL.map((r) => r.id)), new Set(CSV.map((r) => r.id)));
  for (let n = 1; n <= 10; n++) {
    const want = CSV.filter((r) => LEVEL_LAYERS.has(r.layer) && worldsOf(r.worlds).includes(n)).map((r) => r.id);
    assert.deepEqual(W(n).rows.map((r) => r.id), want, `w${n}.json`);
    assert.equal(W(n).file, `w${n}`);
  }
  const cast = FILE.cast.rows;
  assert.ok(cast.every((r) => !LEVEL_LAYERS.has(r.layer) || r.worlds.length === 0));
  assert.equal(cast.length, CSV.filter((r) => !LEVEL_LAYERS.has(r.layer) || worldsOf(r.worlds).length === 0).length);
  // a stage build loads one world file: each stays small (the whole catalog was one 2.1 MB chunk)
  for (let n = 1; n <= 10; n++) {
    const kb = readFileSync(new URL(`./inventory/w${n}.json`, import.meta.url)).length / 1024;
    assert.ok(kb < 300, `w${n}.json is ${kb.toFixed(0)} KB`);
  }
});

test("every row's image exists: src/ on disk; a cut piece on its branch where fetched, else never in game and not placed", () => {
  const missing: string[] = [];
  const onBranch = new Map<string, ArtRow[]>();
  for (const r of inv.rows) {
    const m = /^(origin\/[^:]+):(.+)$/.exec(r.file);
    if (m) onBranch.set(m[1], [...(onBranch.get(m[1]) ?? []), r]);
    else if (!r.file.startsWith('src/') || !existsSync(ROOT + r.file)) missing.push(`${r.id}: ${r.file}`);
  }
  const csvById = new Map(CSV.map((r) => [r.id, r]));
  const notHere: string[] = [];
  for (const [ref, rows] of onBranch) {
    let held: Set<string> | null = null;
    try {
      held = new Set(execFileSync('git', ['ls-tree', '-r', '--name-only', ref], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }).split('\n'));
    } catch { held = null; }
    for (const r of rows) {
      // a cut piece is never in the game: whatever the checkout holds, it must say so
      assert.ok(!r.status.startsWith('in game'), `${r.id} is on a branch only but marked in game`);
      assert.equal(csvById.get(r.id)?.used_in, 'none (not placed)', `${r.id}: a branch-only piece is not placed`);
      if (held && !held.has(r.file.slice(ref.length + 1))) missing.push(r.file);
    }
    if (!held) notHere.push(`${ref} (${rows.length})`);
  }
  assert.deepEqual(missing, []);
  assert.equal([...onBranch.values()].flat().length, 194, 'the 194 cut pieces not packed yet');
  console.log(`  cut pieces not packed yet: 194; branches not in this checkout (files unchecked, rows checked not placed): ${notHere.join(', ') || 'none'}`);
});

test('every footing lies inside its image', () => {
  const bad: string[] = [];
  let n = 0;
  for (const r of inv.rows) {
    assert.ok(r.w > 0 && r.h > 0, `${r.id} has a size`);
    if (r.walk_y === null) continue;
    n++;
    const ok = r.walk_y >= 0 && r.walk_y <= r.h && r.walk_x0 !== null && r.walk_x1 !== null
      && r.walk_x0 >= 0 && r.walk_x1 <= r.w && r.walk_x0 < r.walk_x1;
    if (!ok) bad.push(`${r.id} ${r.w}x${r.h} footing y ${r.walk_y} x ${r.walk_x0}-${r.walk_x1}`);
  }
  assert.deepEqual(bad, []);
  assert.ok(n > 500, `${n} footings checked`);
});

test('no made thing has World 1 as its best fit, and World 1 queries leave made things out', () => {
  // the one exception: the six keepsakes, drawn on every stage by their own code (Matt 11-11, the catalog's made-things table: "the
  // gate, puzzle doors and keepsakes stay"); nothing else made may be World 1's best fit
  const KEEPSAKES = ['bell', 'locket', 'rattle', 'ribbon', 'scroll', 'teddy'].map((k) => `B4:pickups/${k}`);
  assert.deepEqual(inv.rows.filter((r) => r.made_thing && r.world_best === 1).map((r) => r.id), KEEPSAKES);
  assert.ok(KEEPSAKES.every((id) => inv.byId(id)?.layer === 'pickup'));
  assert.equal(W(1).byWorld(1).filter((r) => r.made_thing).length, 0);
  // the made things the game shows in World 1 today (the catalog's table for Matt's ruling) come back only when asked for
  const made1 = [...W(1).byWorld(1, { includeMade: true }), ...FILE.cast.byWorld(1, { includeMade: true })].filter((r) => r.made_thing);
  assert.ok(made1.some((r) => r.id === 'w1-plank-ledge-a'), 'the 1-1 plank (SWAP) is found with includeMade');
  assert.equal(made1.length, CSV.filter((r) => r.made_thing === 'y' && worldsOf(r.worlds).includes(1)).length);
  // other worlds keep their made things
  assert.ok(W(2).byWorld(2).some((r) => r.made_thing));
});

test('three queries agree with counts taken straight from the csv', () => {
  const plat1 = CSV.filter((r) => worldsOf(r.worlds).includes(1) && r.made_thing !== 'y' && r.layer === 'platform'
    && isNum(r.walk_y) && isNum(r.walk_x0) && isNum(r.walk_x1));
  const q1 = W(1).byWorld(1, { layer: 'platform', standable: true });
  assert.equal(q1.length, plat1.length);
  assert.deepEqual(q1.map((r) => r.id), plat1.map((r) => r.id));

  const step5 = CSV.filter((r) => worldsOf(r.worlds).includes(5) && r.layer === 'step' && Number(r.w) >= 100 && Number(r.w) <= 300);
  assert.equal(W(5).byWorld(5, { layer: 'step', minW: 100, maxW: 300 }).length, step5.length);

  const climb1 = CSV.filter((r) => worldsOf(r.worlds).includes(1) && LEVEL_LAYERS.has(r.layer) && /^climbable\/vines tree_climb\b/.test(r.engine_slot));
  const slot = W(1).bySlot('climbable/vines tree_climb');
  assert.ok(slot.length > 0 && slot.every((r) => r.engine_slot === 'climbable/vines tree_climb' && r.worlds.includes(1)));
  const ids = new Set(slot.map((r) => r.id));
  assert.ok(climb1.every((r) => ids.has(r.id)), 'every csv row worded tree_climb in W1 is found under the key');

  const r0 = CSV[0];
  const b = FILE.w1.byId(r0.id);
  assert.ok(b && b.w === Number(r0.w) && b.h === Number(r0.h) && b.layer === r0.layer);
  assert.equal(FILE.w1.byId('no-such-piece'), undefined);
  console.log(`  byWorld(1,{platform,standable}) ${q1.length}; byWorld(5,{step,100-300}) ${step5.length}; W1 bySlot(tree_climb) ${slot.length}`);
});

test('gaps(1): the World 1 play slots with fewer than 3 usable pieces', () => {
  const g1 = W(1).gaps(1);
  console.log(`  gaps(1) [${g1.length}]: ${g1.join(' | ')}`);
  for (const k of g1) {
    const n = W(1).byWorld(1, { slot: k }).filter((r) => !r.status.startsWith('needs fix')).length;
    assert.ok(n < 3, `${k}: ${n} usable`);
  }
  assert.ok(!g1.some((k) => k.startsWith('new slot: lava')), 'lava is World 9 only');
  assert.ok(W(9).gaps(9).some((k) => k.startsWith('new slot: lava')) || W(9).byWorld(9).filter((r) => r.engine_slot.startsWith('new slot: lava')).length >= 3);
  assert.throws(() => W(2).gaps(1), /load world 1/);
  // the same gaps as the catalog's World 1 line, plus pickCut kind log (under 3 once made logs leave World 1)
  const md = readFileSync(`${ROOT}reference/art/CATALOG-MASTER.md`, 'utf8');
  const line = /## World 1:[\s\S]*?\*\*Gaps\*\*[^:]*: ([^\n]*)\./.exec(md)?.[1].split(', ') ?? [];
  assert.deepEqual(g1, [...line, 'pickCut kind log'].sort());
});

test('loadInventory loads one file once and gives its rows', async () => {
  const a = await loadInventory(1);
  assert.equal(a, await loadInventory(1));
  assert.equal(a.rows.length, W(1).rows.length);
  assert.equal((await loadInventory('cast')).rows.length, FILE.cast.rows.length);
  await assert.rejects(loadInventory(11), /no inventory file/);
});
