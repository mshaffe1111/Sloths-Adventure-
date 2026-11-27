// A cut piece from ANY world drawn as a platform (ENG-CUT): Platform.cut names an inventory piece by its catalog id; its picture, rect and
// footing are the inventory's; its stand span is the platform's width and its walk line the platform's top (World 1's cutBox rule).
// World 1's own cut atlas keeps its path (w1CutArt.ts), byte for byte.
//   npx tsx --test src/game/art/invCut.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import '../headlessDom.ts';
import type { Platform } from '../types.ts';
import { W1_CUT } from '../w1CutArt.ts';
import { Inventory, loadInventory, type InventoryFile } from './inventory.ts';
import { drawPlatformCut, invCutBox, invCutBreaches, invCutPiece, invCutResolves, isW1Cut, readyInvCuts, resetInvCut } from './invCut.ts';
import { invDressUrl } from './invDressArt.ts';

const REED = 'w2-reed28#reed-isle-28';
const plat = (o: Partial<Platform> = {}): Platform => ({ id: 7, x: 1000, y: 400, width: 340, height: 120, type: 'solid', style: 'log', ...o } as Platform);

/** a canvas that only records what it is asked to draw */
function recorder(): { ctx: CanvasRenderingContext2D; calls: unknown[][] } {
  const calls: unknown[][] = [];
  const ctx = { drawImage: (...a: unknown[]) => { calls.push(a); } } as unknown as CanvasRenderingContext2D;
  return { ctx, calls };
}
/** the resolved piece's picture marked in (headless: nothing decodes, so the test says it has; not an HTMLImageElement, drawn as given) */
function markIn(id: string): void {
  const c = invCutPiece(id);
  assert.ok(c, `${id} resolved`);
  c.img = { src: c.url } as unknown as HTMLImageElement;
  c.ready = true;
}

const COLS = ['id', 'file', 'frame', 'world_best', 'worlds', 'kind', 'layer', 'engine_slot', 'w', 'h', 'walk_y', 'walk_x0', 'walk_x1', 'float_class', 'made_thing', 'status', 'pokey_scale', 'scale_ok'];
const row = (id: string, o: Partial<Record<string, unknown>> = {}): unknown[] => {
  const base: Record<string, unknown> = { id, file: 'src/assets/w2-cut/reed-isle-28.webp', frame: null, world_best: 2, worlds: [2], kind: 'island', layer: 'platform', engine_slot: 'new slot: World 2 reed island', w: 720, h: 385, walk_y: 215, walk_x0: 19, walk_x1: 699, float_class: 'grounded', made_thing: false, status: 'cut', pokey_scale: 3.82, scale_ok: true, ...o };
  return COLS.map((c) => base[c]);
};
const planted = new Inventory({ note: '', file: 'w2', cols: COLS, pokey_units: 89.1, rows: [
  row('fx/good'),
  row('fx/no-sheet', { file: 'origin/t-art-28:reference/art/hfreed28/cut/reed-isle-28.webp' }),
  row('fx/no-footing', { walk_y: null }),
  row('fx/decor', { layer: 'decor mid' }),
  row('fx/out-of-scale', { scale_ok: false }),
  row('fx/needs-fix', { status: 'needs fix: torn edge' }),
  row('fx/frame-no-rect', { frame: 'fx-sheet-piece' }),
] } satisfies InventoryFile);

test('a World 2 cut piece on Platform.cut draws: one drawImage of its own picture, stand span = the platform, walk line on its top', async () => {
  resetInvCut();
  const p = plat({ cut: REED });
  await readyInvCuts([p], 2);
  markIn(REED);
  const { ctx, calls } = recorder();
  assert.equal(drawPlatformCut(ctx, p), true, 'drawn');
  assert.equal(calls.length, 1, 'one blit');
  const [im, sx, sy, sw, sh, dx, dy, dw, dh] = calls[0] as [HTMLImageElement, number, number, number, number, number, number, number, number];
  assert.equal(im.src, invDressUrl('src/assets/w2-cut/reed-isle-28.webp'), 'its own picture, shipped by the build');
  assert.deepEqual([sx, sy, sw, sh], [0, 0, 720, 385], 'the whole picture');
  // (the row: walk line y 215, x 19-699 at 2 cut px a world px: on a 340-wide solid it is drawn at solid.x - 9.5, solid.y - 107.5)
  assert.deepEqual([dx, dy, dw, dh], [1000 - 9.5, 400 - 107.5, 360, 192.5], 'the reed island at its cut scale on a 340 px solid');
  // (any width: the stand span is the platform's, one even scale)
  const b = invCutBox({ x: 0, y: 0, width: 680 }, { sw: 720, sh: 385, fy: 215, fx0: 19, fx1: 699 });
  assert.deepEqual(b, { x: -19, y: -215, w: 720, h: 385, k: 1 });
});

test('a missing sheet is refused BY NAME, never drawn blank; each other refusal names its piece too', () => {
  const ids = ['fx/good', 'fx/no-sheet', 'fx/no-footing', 'fx/decor', 'fx/out-of-scale', 'fx/needs-fix', 'fx/frame-no-rect', 'fx/not-in-inventory'];
  const out = invCutBreaches(ids.map((cut, i) => plat({ id: i, x: 100 * i, cut })), planted, 2);
  assert.equal(out.length, ids.length - 1, out.join('\n'));
  const why = (id: string) => out.find((s) => s.includes(`'${id}'`)) ?? '';
  assert.match(why('fx/no-sheet'), /its picture origin\/t-art-28:\S+ is not in the build/);
  assert.match(why('fx/no-footing'), /no footing/);
  assert.match(why('fx/decor'), /no footing/);
  assert.match(why('fx/out-of-scale'), /out of scale with Pokey/);
  assert.match(why('fx/needs-fix'), /waiting on a fix/);
  assert.match(why('fx/frame-no-rect'), /no rect/);
  assert.match(why('fx/not-in-inventory'), /neither a World 1 cut .* nor in any row of World 2's inventory/);
  assert.equal(why('fx/good'), '');
});

test('a refused or unknown cut is never resolved and never drawn; each piece resolves ONCE (the counter counts pieces, not platforms or calls)', async () => {
  resetInvCut();
  const ps = [plat({ id: 1, cut: REED }), plat({ id: 2, cut: REED }), plat({ id: 3, cut: 'w2-no-such-piece' })];
  await readyInvCuts(ps, 2);
  await readyInvCuts(ps, 2);
  assert.equal(invCutResolves(), 1);
  assert.equal(invCutPiece('w2-no-such-piece'), undefined);
  const { ctx, calls } = recorder();
  assert.equal(drawPlatformCut(ctx, ps[2]), false);
  assert.equal(calls.length, 0, 'nothing drawn in its place');
});

test('World 1 cuts stay World 1\'s: never resolved here, drawn by w1CutArt alone (its sheet not in: nothing drawn, as before)', async () => {
  resetInvCut();
  const names = Object.keys(W1_CUT);
  assert.ok(names.length > 0 && names.every(isW1Cut));
  const p = plat({ cut: names[0] });
  await readyInvCuts([p], 1);
  assert.equal(invCutResolves(), 0);
  assert.equal(invCutPiece(names[0]), undefined);
  assert.deepEqual(invCutBreaches([p], await loadInventory(1), 1), [], 'not this gate\'s');
});

test('the real World 2 inventory: the reed island resolves (its picture in the build, its footing measured), no breach', async () => {
  const inv = await loadInventory(2);
  assert.deepEqual(invCutBreaches([plat({ cut: REED })], inv, 2), []);
});

test('every listed stage, as Play builds it on both settings: each cut piece that is not World 1\'s passes the gate', async () => {
  const { generateAllLevels } = await import('../worldsData.ts');
  const { generateStage, setLayoutVariant } = await import('../stageGenerator.ts');
  const { LISTED } = await import('../gen2/listed.ts');
  const { hasSeedList, loadSeedList } = await import('../gen2/seedList.ts');
  let laid = 0;
  const threw: string[] = [];
  for (const id of Object.keys(LISTED)) {
    if (hasSeedList(id)) assert.ok(await loadSeedList(id), `${id}: its list loads`);
    const cfg = generateAllLevels().find((l) => l.id === id)!;
    const inv = await loadInventory(cfg.worldIndex);
    for (const d of ['normal', 'easy'] as const) for (const v of [1, 2]) {
      setLayoutVariant(v);
      let st: { platforms: Platform[] };
      // (a build that THROWS is not this gate's to judge: the seed list refuses it by name; printed, never hidden)
      try { st = generateStage({ ...cfg, unlocked: true }, d) as unknown as typeof st; } catch (e) { threw.push(`${id} ${d} layout ${v}: ${(e as Error).message.slice(0, 90)}`); continue; } finally { setLayoutVariant(null); }
      assert.deepEqual(invCutBreaches(st.platforms, inv, cfg.worldIndex), [], `${id} ${d} layout ${v}`);
      laid += st.platforms.filter((p) => p.cut && !isW1Cut(p.cut)).length;
    }
  }
  console.log(`  ${laid} cut pieces (not World 1's) on ${Object.keys(LISTED).length} listed stages x 2 layouts x 2 settings, each through the gate`);
  if (threw.length) console.log(`  NOT JUDGED here, the build threw (${threw.length}):\n    ${threw.join('\n    ')}`);
});

test('the real draw site: protoArt draws every platform\'s cut through drawPlatformCut, and stageReady readies the cuts before the first frame', () => {
  const src = (f: string) => fs.readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8');
  assert.match(src('../protoArt.ts'), /if \(p\.cut\) drawPlatformCut\(ctx, p\);/);
  assert.match(src('../stageReady.ts'), /readyInvCuts\(stage\.platforms/);
});
