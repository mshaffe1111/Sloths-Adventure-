// R-165.520 (ENG-CUT-b): a section piece lays its painted cut piece. SectionPiece.cut (a catalog id) is carried to Platform.cut by the
// lay's mk, the width the section gives is kept, and the piece is drawn by its stand span (art/invCut.ts invCutBox). A cut the world's
// inventory refuses fails the section at the lay, BY NAME. Planted: RED before the lay carried it (no platform wore the cut: the only
// Platform.cut a lay set was World 1's finish), and an unknown id was laid quietly (never drawn, never named).
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import type { Platform } from '../types.ts';
import { generateAllLevels } from '../worldsData.ts';
import { loadInventory } from '../art/inventory.ts';
import { drawPlatformCut, invCutBox, invCutPiece, readyInvCuts, resetInvCut } from '../art/invCut.ts';
import { buildGen2Stage } from './pipeline.ts';
import { LISTED, worldFinish } from './listed.ts';
import type { SectionPiece, WorldKit } from './types.ts';

const REED = 'w2-reed28#reed-isle-28';
const STAGE = '2-1';
const cfg = generateAllLevels().find((l) => l.id === STAGE)!;
const row = LISTED[STAGE];
/** a piece he stands on (never a hanging piece, a crumbling tile or a bouncy cap) */
const stands = (pc: SectionPiece) => !pc.crumble && pc.shape !== 'liana' && pc.shape !== 'vine' && pc.shape !== 'bouncy';
/** the listed kit with every standing BLOCK of every section (and its sub-blocks' versions) naming `cut` */
function kitWith(cut: string, pick: (pc: SectionPiece) => boolean = (pc) => stands(pc) && pc.shape === 'block'): WorldKit {
  const k = row.kit();
  const put = (pc: SectionPiece): SectionPiece => (pick(pc) ? { ...pc, cut } : pc);
  const sections = k.manifest.sections.map((s) => ({ ...s, pieces: s.pieces.map(put), ...(s.subBlocks ? { subBlocks: s.subBlocks.map((b) => ({ ...b, versions: b.versions.map((v) => ({ ...v, pieces: v.pieces.map(put) })) })) } : {}) }));
  return { ...k, manifest: { ...k.manifest, sections } };
}
/** the first seeds that build (a seed may fail for its own reasons; the test needs laid stages, not a particular roll) */
function built(kit: WorldKit, difficulty: 'normal' | 'easy', want = 3) {
  const out: Array<ReturnType<typeof buildGen2Stage>> = [];
  for (let seed = 1; seed <= 40 && out.length < want; seed++) {
    try { out.push(buildGen2Stage({ config: cfg, kit, seed, difficulty })); } catch { /* the next seed */ }
  }
  return out;
}

test('a section piece that names a cut lays it: Platform.cut is set, the width the section gave is kept, and the cut draws by its stand span', async () => {
  await loadInventory(2);
  const kit = kitWith(REED);
  const blocks = kit.manifest.sections.flatMap((s) => [...s.pieces, ...(s.subBlocks ?? []).flatMap((b) => b.versions.flatMap((v) => v.pieces))]).filter((pc) => pc.cut === REED).length;
  assert.ok(blocks > 0, `${STAGE}'s kit has standing blocks to name the cut on`);
  let worn = 0;
  for (const d of ['normal', 'easy'] as const) {
    const stages = built(kit, d);
    assert.ok(stages.length, `${STAGE} ${d}: some seed builds with the cut named`);
    for (const st of stages) {
      const laid = st.platforms.filter((p) => p.cut === REED);
      assert.ok(laid.length > 0, `${STAGE} ${d} seed ${st.gen2.seed}: no platform wears the cut its section piece names`);
      // (the world's finish keeps it, at the width the lay gave)
      const widths = new Map(laid.map((p) => [p.id, p.width]));
      const fin = worldFinish(row)(st, false, d);
      for (const p of fin.platforms.filter((q) => widths.has(q.id))) {
        assert.equal(p.cut, REED, `platform ${p.id}: its finish dropped the cut`);
        assert.equal(p.width, widths.get(p.id), `platform ${p.id}: its finish changed the width the section gave`);
      }
      worn += laid.length;
    }
  }
  // (drawn: one blit of its own picture, the walk line on the platform's top, the stand span its width)
  resetInvCut();
  const st = built(kit, 'normal', 1)[0];
  const p = st.platforms.find((q) => q.cut === REED) as Platform;
  await readyInvCuts([p], 2);
  const c = invCutPiece(REED);
  assert.ok(c, 'resolved against World 2\'s inventory');
  c.img = { src: c.url } as unknown as HTMLImageElement;
  c.ready = true;
  const calls: unknown[][] = [];
  const ctx = { drawImage: (...a: unknown[]) => { calls.push(a); } } as unknown as CanvasRenderingContext2D;
  assert.equal(drawPlatformCut(ctx, p), true, 'drawn');
  assert.equal(calls.length, 1, 'one blit');
  const b = invCutBox(p, c);
  assert.deepEqual(calls[0].slice(5), [b.x, b.y, b.w, b.h], 'drawn by its stand span on the laid platform');
  assert.ok(Math.abs((c.fx1 - c.fx0) * b.k - p.width) < 1e-6, 'its stand span is the platform\'s width');
  console.log(`  ${worn} laid platforms wear ${REED} on ${STAGE} (both settings); drawn ${b.w.toFixed(1)}x${b.h.toFixed(1)} on a ${p.width} px piece`);
});

test('a cut the world\'s inventory refuses fails the section at the lay, by name', async () => {
  await loadInventory(2);
  for (const [id, why] of [
    ['fx/no-such-piece', /cut 'fx\/no-such-piece' is neither a World 1 cut .* nor in any row of World 2's inventory/],
  ] as const) {
    const kit = kitWith(id);
    for (const seed of [1, 2, 3]) {
      assert.throws(() => buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' }), (e: Error) => {
        assert.match(e.message, /^gen2 section \S+: piece \S+: /, `seed ${seed}: ${e.message}`);
        assert.match(e.message, why, `seed ${seed}: ${e.message}`);
        return true;
      }, `seed ${seed}: laid a cut its world's inventory does not have`);
    }
  }
});

test('a cut on a piece that cannot wear one (a hanging piece) fails the section by name, never dropped quietly', async () => {
  await loadInventory(2);
  const kit = kitWith(REED, (pc) => pc.shape === 'liana' || pc.shape === 'vine');
  if (!kit.manifest.sections.some((s) => [...s.pieces, ...(s.subBlocks ?? []).flatMap((b) => b.versions.flatMap((v) => v.pieces))].some((pc) => pc.cut))) return; // (a kit with no hanging piece: nothing to judge)
  assert.throws(() => { for (let seed = 1; seed <= 6; seed++) buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' }); }, /piece \S+ names cut 'w2-reed28#reed-isle-28' but is a hanging piece/);
});
