import test from 'node:test';
import assert from 'node:assert/strict';
import { NOT_ELSEWHERE, W1_SECTIONS } from './w1.ts';

// World 1's harvested kit (CHUNK-POOL-BRIEF step 2) holds to gen2's own section rules (types.ts SectionTemplate, SubBlock) before the
// pipeline reads it: every reference resolves, every version gives the keys the rest refers to, World 1 art only, each section tagged.
test('every W1 section: references resolve in each version, keys unique, the exit in every version, World 1 art only, tags present', () => {
  for (const s of W1_SECTIONS) {
    assert.ok(s.feel.length && s.not.length && s.rating >= 1 && s.rating <= 10 && s.source, `${s.id}: tags`);
    for (const v of s.subBlocks?.length ? s.subBlocks[0].versions : [{ id: 'only', pieces: [], sockets: [] }]) {
      const pieces = [...s.pieces, ...v.pieces];
      const keys = pieces.map((p) => p.key);
      assert.equal(new Set(keys).size, keys.length, `${s.id}/${v.id}: duplicate keys`);
      for (const p of pieces) {
        const pl = p.place as { after?: string; on?: string };
        for (const ref of [pl.after, pl.on]) if (ref) assert.ok(keys.includes(ref), `${s.id}/${v.id}: ${p.key} refers to ${ref}`);
        assert.ok(['bank', 'block', 'branch', 'bouncy', 'hollow'].includes(p.shape), `${s.id}/${v.id}: ${p.key} is a ${p.shape}, not World 1's kit`);
        assert.ok(p.style === undefined || p.style === 'moss_stone' || p.style === 'branch' || p.style === 'log', `${s.id}/${v.id}: ${p.key} style ${p.style}`);
      }
      for (const so of [...s.sockets, ...(v.sockets ?? [])]) assert.ok(keys.includes(so.on), `${s.id}/${v.id}: socket ${so.id} on ${so.on}`);
      assert.ok(keys.includes(s.entry.piece) && keys.includes(s.exit.piece), `${s.id}/${v.id}: entry or exit missing`);
    }
  }
});

test("no harvested section is combat (every one says so), and one that serves 1-1 needs nothing 1-1 doesn't teach (no rope)", () => {
  for (const s of W1_SECTIONS) assert.ok(s.not.includes('punch') && s.not.includes('combat'), `${s.id}: not-list`);
  for (const s of W1_SECTIONS.filter((q) => q.feel.includes('1-1'))) assert.ok(!(s.needs ?? []).some((m) => m === 'rope' || m === 'punch'), `${s.id} needs ${s.needs}`);
  assert.ok(NOT_ELSEWHERE.includes('lianas') && NOT_ELSEWHERE.includes('bush'));
});

test("the move table holds for the kit: every move a 1-1 section needs or uses is taught at 1-1 or before on main (moveLadder.ts)", async () => {
  const { TAUGHT_AT } = await import('../../moveLadder.ts');
  // (gen2's move names to the table's: 'walk' is the table's 'run'; a section's `uses` names a mechanic, the table covers bounce and double)
  const asTable = (m: string) => (m === 'walk' ? 'run' : m);
  const order = (id: string) => { const [w, s] = id.split('-').map(Number); return (w - 1) * 10 + s; };
  for (const s of W1_SECTIONS.filter((q) => q.feel.includes('1-1'))) {
    for (const m of [...(s.needs ?? []), ...(s.uses ?? []).filter((u) => u === 'bounce' || u === 'double')].map(asTable)) {
      const at = (TAUGHT_AT as Record<string, string>)[m];
      assert.ok(at && order(at) <= order('1-1'), `${s.id}: ${m} is ${at ? `taught at ${at}` : 'not in the move table'}`);
    }
  }
});

test("every W1 section's every version lays with gen2's own placer (pipeline.ts layLocal), and every mushroom stands on what it is placed on", async () => {
  const { layLocal, planBudget, rngFor } = await import('../pipeline.ts');
  const { cfg, manifest } = await import('../toyWorld.ts');
  const nb = planBudget(cfg('1-1', 'stealth'), manifest, 'normal');
  (nb as { moves: string[] }).moves = ['walk', 'jump', 'double'];
  for (const s of W1_SECTIONS) {
    if (s.needs?.includes('rope')) continue; // (1-3's rope gaps lay with the shimmy kit, not this toy budget's moves)
    for (const v of s.subBlocks![0].versions) for (const seed of [1, 2, 3]) {
      const L = layLocal(s, nb, rngFor(seed), false, { versions: { body: v.id } });
      for (const p of L.pieces.filter((q) => q.shape === 'bouncy')) {
        assert.ok(L.pieces.some((q) => q !== p && Math.abs(q.y - (p.y + p.h)) < 2 && q.x <= p.x && q.x + q.w >= p.x + p.w), `${s.id}/${v.id} seed ${seed}: mushroom ${p.key} stands on nothing`);
      }
    }
  }
});

test('every W1 section carries its node jobs (NODES.md §1), and a teach section teaches', () => {
  for (const s of W1_SECTIONS) {
    assert.ok(s.jobs?.length, `${s.id}: no jobs`);
    if (s.jobs!.includes('teach')) assert.ok(s.teaches, `${s.id}: a teach job with nothing taught`);
  }
});
