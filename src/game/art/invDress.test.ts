// The inventory-dressing piece (ENG-DR, the lead's packet 8:03 PM 11-14): a stage's data places ANY inventory piece as dressing by its
// catalog id, hung by its top or standing, behind the play layer, at the inventory's own scale against Pokey (R-165.104, R-165.107).
//   npx tsx --test src/game/art/invDress.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import '../headlessDom.ts';
import { HERO_SPRITE_SCALE, HERO_UNITS } from '../heroSprite.ts';
import { Inventory, loadInventory, usable, type InventoryFile } from './inventory.ts';
import { frameRect, invDressBreaches, invDressResolves, invDressSize, readyInvDress, resetInvDress, type InvDress } from './invDress.ts';
import { invDressUrl } from './invDressArt.ts';

const COLS = ['id', 'file', 'frame', 'world_best', 'worlds', 'kind', 'layer', 'engine_slot', 'w', 'h', 'walk_y', 'walk_x0', 'walk_x1', 'float_class', 'made_thing', 'status', 'pokey_scale', 'scale_ok'];
const row = (id: string, o: Partial<Record<string, unknown>> = {}): unknown[] => {
  const base: Record<string, unknown> = { id, file: 'src/assets/w1-18/hf18-palm-a.webp', frame: null, world_best: 1, worlds: [1], kind: 'prop', layer: 'decor mid', engine_slot: 'inventory dressing', w: 1000, h: 800, walk_y: null, walk_x0: null, walk_x1: null, float_class: 'hung', made_thing: false, status: 'ready', pokey_scale: 2, scale_ok: null, ...o };
  return COLS.map((c) => base[c]);
};
/** a planted World 1 file: one good piece, and one of each kind the gate refuses */
const planted = new Inventory({ note: '', file: 'w1', cols: COLS, pokey_units: 89.1, rows: [
  row('fx/good'),
  row('fx/out-of-scale', { layer: 'step', pokey_scale: 1.8, scale_ok: false }),
  row('fx/no-size', { pokey_scale: null }),
  row('fx/made', { made_thing: true }),
  row('fx/needs-fix', { status: 'needs fix: torn edge' }),
  row('fx/not-built', { file: 'origin/art-raw:cut/fx.png' }),
  row('fx/framed', { frame: 'fx-sheet-piece (120,40 300x200)', w: 300, h: 200 }),
  row('fx/frame-no-rect', { frame: 'fx-sheet-piece' }),
] } satisfies InventoryFile);
const at = (inv: string, o: Partial<InvDress> = {}): InvDress => ({ inv, x: 1000, y: 400, hang: true, layer: 'behind', ...o });

test('planted: a row with an id the inventory lacks fails by name; an out-of-scale row fails the scale gate; so does each other refusal', () => {
  assert.deepEqual(invDressBreaches([at('fx/good'), at('fx/framed', { hang: false })], planted, 1), [], 'the good pieces pass, hung and standing');
  const one = (inv: string, o?: Partial<InvDress>) => invDressBreaches([at(inv, o)], planted, 1);
  assert.deepEqual(one('fx/missing'), ["dressing at x 1000: 'fx/missing' is in no row of World 1's inventory (src/game/art/inventory/w1.json): name it by its catalog id, in a world it fits"]);
  assert.deepEqual(one('fx/out-of-scale'), ["dressing at x 1000: 'fx/out-of-scale' is out of scale with Pokey: drawn 1.8 of his height, outside its layer 'step' range (R-165.107)"]);
  assert.match(one('fx/no-size')[0] ?? '', /'fx\/no-size' has no fixed size against Pokey/);
  assert.match(one('fx/made')[0] ?? '', /'fx\/made' is a made thing: never World 1 art/);
  assert.match(one('fx/needs-fix')[0] ?? '', /'fx\/needs-fix' is waiting on a fix \(needs fix: torn edge\)/);
  assert.match(one('fx/not-built')[0] ?? '', /'fx\/not-built': its picture origin\/art-raw:cut\/fx.png is not in the build \(src\/game\/art\/invDressArt.ts ships src\/assets\/w1-18\/\)/);
  assert.match(one('fx/frame-no-rect')[0] ?? '', /a frame with no rect on its sheet/);
  assert.match(one('fx/good', { layer: 'front' as never })[0] ?? '', /asks for layer 'front' \(offered: behind\)/);
  assert.match(one('fx/good', { y: Number.NaN })[0] ?? '', /has no place/);
  // (a made thing is only refused in World 1: Matt 11-11)
  assert.deepEqual(invDressBreaches([at('fx/made')], new Inventory({ note: '', file: 'w2', cols: COLS, pokey_units: 89.1, rows: [row('fx/made', { made_thing: true, worlds: [2] })] }), 2), []);
});

test('the size is the inventory\'s own: pokey_scale x Pokey\'s drawn height (heroSprite.ts), its width by its picture\'s shape; a frame by its rect', async () => {
  const w1 = await loadInventory(1);
  assert.ok(Math.abs(w1.pokeyUnits - HERO_UNITS * HERO_SPRITE_SCALE) < 1e-9, `the inventory's Pokey (${w1.pokeyUnits}) is the drawn hero (D41)`);
  assert.deepEqual(invDressSize({ pokey_scale: 2, w: 1000, h: 800 }, 89.1), { w: 222.75, h: 178.2 });
  assert.equal(invDressSize({ pokey_scale: null, w: 10, h: 10 }, 89.1), null);
  assert.deepEqual(frameRect({ frame: 'w1-boulder-grey-moss (956,362 237x155)', w: 237, h: 155 }), { x: 956, y: 362, w: 237, h: 155 });
  assert.equal(frameRect({ frame: null, w: 1, h: 1 }), null);
  // (1-8's pieces (five painted palms, ART-18, and the trunk), as the catalog has them: drawn at their scale, their pictures in the build)
  for (const id of ['hf18/hf18-palm-a', 'hf18/hf18-palm-b', 'hf18/hf18-palm-c', 'hf18/hf18-palm-back-a', 'hf18/hf18-palm-back-b', 'hf18/hf18-cannon-trunk']) {
    const r = w1.byId(id)!;
    assert.ok(r, id);
    const s = invDressSize(r, w1.pokeyUnits)!;
    assert.ok(Math.abs(s.h - r.pokey_scale! * 89.1) < 1e-9 && Math.abs(s.w / s.h - r.w / r.h) < 1e-9, `${id}: ${s.w} x ${s.h}`);
    const u = invDressUrl(r.file);
    assert.ok(u && fs.existsSync(fileURLToPath(u)), `${id}: ${r.file} ships (${u})`);
  }
});

test('the real World 1 inventory: an out-of-scale piece the catalog has is refused by the scale gate, never drawn', async () => {
  const w1 = await loadInventory(1);
  const bad = w1.rows.find((r) => r.scale_ok === false && usable(r) && !r.made_thing);
  assert.ok(bad, 'World 1 has an out-of-scale piece to plant');
  assert.match(invDressBreaches([at(bad.id)], w1, 1)[0] ?? '', /is out of scale with Pokey/);
});

test('every listed stage, as Play builds it on both settings: each dressing row its data lays passes the gate; 1-8 lays both its pieces', async () => {
  const { generateAllLevels } = await import('../worldsData.ts');
  const { generateStage, setLayoutVariant } = await import('../stageGenerator.ts');
  const { LISTED } = await import('../gen2/listed.ts');
  const { hasSeedList, loadSeedList } = await import('../gen2/seedList.ts');
  let laid = 0;
  const seen = new Set<string>();
  const threw: string[] = [];
  for (const id of Object.keys(LISTED)) {
    if (hasSeedList(id)) assert.ok(await loadSeedList(id), `${id}: its list loads`);
    const cfg = generateAllLevels().find((l) => l.id === id)!;
    const inv = await loadInventory(cfg.worldIndex);
    for (const d of ['normal', 'easy'] as const) for (const v of [1, 2]) {
      setLayoutVariant(v);
      let st: { proto?: { invDress?: InvDress[] } };
      // (a build that THROWS is not this gate's to judge: the seed list refuses it by name, seedlist.ts --check, ENG-DR (1); printed, never hidden)
      try { st = generateStage({ ...cfg, unlocked: true }, d) as typeof st; } catch (e) { threw.push(`${id} ${d} layout ${v}: ${(e as Error).message.slice(0, 90)}`); continue; } finally { setLayoutVariant(null); }
      const rows = st.proto?.invDress ?? [];
      assert.deepEqual(invDressBreaches(rows, inv, cfg.worldIndex), [], `${id} ${d} layout ${v}`);
      laid += rows.length;
      for (const r of rows) seen.add(`${id} ${r.inv}`);
    }
  }
  assert.ok(['a', 'b', 'c', 'back-a', 'back-b'].every((v) => seen.has(`1-8 hf18/hf18-palm-${v}`)) && seen.has('1-8 hf18/hf18-cannon-trunk'), `1-8's five palms and its trunk are laid (${[...seen].join(', ')})`);
  console.log(`  ${laid} dressing rows on ${Object.keys(LISTED).length} listed stages x 2 layouts x 2 settings, each through the gate`);
  if (threw.length) console.log(`  NOT JUDGED here, the build threw (${threw.length}):\n    ${threw.join('\n    ')}`);
});

test('no code lays dressing rows on a stage this gate does not build: every writer of proto.invDress is a listed stage\'s world file', () => {
  // (the gate above builds the listed stages; a hand-built stage that lays rows must join it: name its file here with its stage)
  const files = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(`${dir}/${e.name}`) : e.name.endsWith('.ts') && !e.name.endsWith('.test.ts') ? [`${dir}/${e.name}`] : []));
  const writers = files('src').filter((f) => /invDress\s*(\?\?=|=[^=]|:\s*\[)/.test(fs.readFileSync(f, 'utf8').split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n')));
  assert.deepEqual(writers.sort(), ['src/game/gen2/worlds/w1Arc18.ts'], 'the files that lay rows');
});

test('readyInvDress resolves each piece ONCE (the counter counts pieces, not rows or calls); a refused or unknown id is never resolved', async () => {
  resetInvDress();
  const rows = [at('hf18/hf18-palm-a'), at('hf18/hf18-palm-a', { x: 3000 }), at('hf18/hf18-cannon-trunk', { hang: false }), at('fx/missing')];
  await readyInvDress(rows, 1);
  assert.equal(invDressResolves(), 2, 'two pieces, four rows');
  await readyInvDress(rows, 1);
  await readyInvDress([at('hf18/hf18-cannon-trunk')], 1);
  assert.equal(invDressResolves(), 2, 'asked again: nothing resolved twice');
  await readyInvDress(undefined, 1);
  await readyInvDress([at('fx/in-no-world')], 99);
  assert.equal(invDressResolves(), 2, 'no rows, or a world with no file: nothing, and no throw');
  resetInvDress();
  assert.equal(invDressResolves(), 0);
});
