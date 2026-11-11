/**
 * The art inventory the engine reads (src/game/art/inventory.json, from `python3 tools/art/catalog_master.py --emit`): every row's
 * image is real, every footing lies inside its image, no made thing is World 1's best fit, and the queries agree with counts taken
 * straight from reference/art/CATALOG-MASTER.csv (parsed here on its own, not through the emitted file).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Inventory, loadInventory, type InventoryFile } from './inventory.ts';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const inv = new Inventory(JSON.parse(readFileSync(new URL('./inventory.json', import.meta.url), 'utf8')) as InventoryFile);

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

test('the inventory has one row per catalog row, same ids in the same order', () => {
  assert.equal(inv.rows.length, CSV.length);
  assert.deepEqual(inv.rows.map((r) => r.id), CSV.map((r) => r.id));
  assert.equal(new Set(inv.rows.map((r) => r.id)).size, inv.rows.length, 'ids are unique');
});

test("every row's image exists (src/ on disk; a cut piece on its branch)", () => {
  const missing: string[] = [];
  const onBranch = new Map<string, string[]>();
  for (const r of inv.rows) {
    const m = /^(origin\/[^:]+):(.+)$/.exec(r.file);
    if (m) {
      const l = onBranch.get(m[1]) ?? [];
      l.push(m[2]);
      onBranch.set(m[1], l);
    } else if (!r.file.startsWith('src/') || !existsSync(ROOT + r.file)) missing.push(`${r.id}: ${r.file}`);
  }
  for (const [ref, paths] of onBranch) {
    // one git call a branch: the paths that branch holds (CI fetches these branches before the tests: deploy.yml)
    const held = new Set(execFileSync('git', ['ls-tree', '-r', '--name-only', ref], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n'));
    for (const p of paths) if (!held.has(p)) missing.push(`${ref}:${p}`);
  }
  assert.deepEqual(missing, []);
  assert.ok(onBranch.size > 0 && [...onBranch.values()].flat().length === 194, 'the 194 cut pieces not packed yet are checked on their branches');
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
  assert.equal(inv.byWorld(1).filter((r) => r.made_thing).length, 0);
  // the made things the game shows in World 1 today (the catalog's table for Matt's ruling) come back only when asked for
  const made1 = inv.byWorld(1, { includeMade: true }).filter((r) => r.made_thing);
  assert.ok(made1.some((r) => r.id === 'w1-plank-ledge-a'), 'the 1-1 plank (SWAP) is found with includeMade');
  assert.equal(made1.length, CSV.filter((r) => r.made_thing === 'y' && worldsOf(r.worlds).includes(1)).length);
  // other worlds keep their made things
  assert.ok(inv.byWorld(2).some((r) => r.made_thing));
});

test('three queries agree with counts taken straight from the csv', () => {
  const plat1 = CSV.filter((r) => worldsOf(r.worlds).includes(1) && r.made_thing !== 'y' && r.layer === 'platform'
    && isNum(r.walk_y) && isNum(r.walk_x0) && isNum(r.walk_x1));
  const q1 = inv.byWorld(1, { layer: 'platform', standable: true });
  assert.equal(q1.length, plat1.length);
  assert.deepEqual(q1.map((r) => r.id), plat1.map((r) => r.id));

  const step5 = CSV.filter((r) => worldsOf(r.worlds).includes(5) && r.layer === 'step' && Number(r.w) >= 100 && Number(r.w) <= 300);
  assert.equal(inv.byWorld(5, { layer: 'step', minW: 100, maxW: 300 }).length, step5.length);

  const climb = CSV.filter((r) => r.engine_slot.startsWith('climbable/vines tree_climb') && /^climbable\/vines tree_climb\b/.test(r.engine_slot.replace('climbable vines', 'climbable/vines')));
  const slot = inv.bySlot('climbable/vines tree_climb');
  assert.ok(slot.length > 0 && slot.length >= climb.length, `bySlot tree_climb ${slot.length}, csv wording ${climb.length}`);
  assert.ok(slot.every((r) => r.engine_slot === 'climbable/vines tree_climb'));

  const r0 = CSV[0];
  const b = inv.byId(r0.id);
  assert.ok(b && b.w === Number(r0.w) && b.h === Number(r0.h) && b.layer === r0.layer);
  assert.equal(inv.byId('no-such-piece'), undefined);
  console.log(`  byWorld(1,{platform,standable}) ${q1.length}; byWorld(5,{step,100-300}) ${step5.length}; bySlot(tree_climb) ${slot.length}`);
});

test('gaps(1): the World 1 play slots with fewer than 3 usable pieces', () => {
  const g1 = inv.gaps(1);
  console.log(`  gaps(1) [${g1.length}]: ${g1.join(' | ')}`);
  for (const k of g1) {
    const n = inv.byWorld(1, { slot: k }).filter((r) => !r.status.startsWith('needs fix')).length;
    assert.ok(n < 3, `${k}: ${n} usable`);
  }
  assert.ok(!g1.some((k) => k.startsWith('new slot: lava')), 'lava is World 9 only');
  assert.ok(inv.gaps(9).some((k) => k.startsWith('new slot: lava')) || inv.byWorld(9).filter((r) => r.engine_slot.startsWith('new slot: lava')).length >= 3);
});

test('loadInventory loads once and gives the same rows', async () => {
  const a = await loadInventory();
  assert.equal(a, await loadInventory());
  assert.equal(a.rows.length, inv.rows.length);
});
