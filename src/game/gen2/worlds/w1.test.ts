import test from 'node:test';
import assert from 'node:assert/strict';
import { NOT_ELSEWHERE, W1_SECTIONS } from './w1.ts';

// World 1's harvested kit (CHUNK-POOL-BRIEF step 2) holds to gen2's own section rules (types.ts SectionTemplate, SubBlock) before the
// pipeline reads it: every reference resolves, every version gives the keys the rest refers to, World 1 art only, each section tagged.
test('every W1 section: references resolve in each version, keys unique, the exit in every version, World 1 art only, tags present', () => {
  for (const s of W1_SECTIONS) {
    assert.ok((s.feel.length || s.parked) && s.not.length && s.rating >= 1 && s.rating <= 10 && s.source, `${s.id}: tags`);
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

test("every W1 section has its content type (NODES.md §7.7), and every challenge section's every version runs at least 10 s (the designer's ruling, 08c5a2944)", async () => {
  const { layLocal, planBudget, rngFor } = await import('../pipeline.ts');
  const { cfg, manifest } = await import('../toyWorld.ts');
  const nb = planBudget(cfg('1-1', 'stealth'), manifest, 'normal');
  (nb as { moves: string[] }).moves = ['walk', 'jump', 'double'];
  const CHALLENGE = ['ki', 'sho', 'ten', 'ketsu'];
  for (const s of W1_SECTIONS) {
    assert.ok(s.content && s.terrain, `${s.id}: no content type or terrain`);
    if (s.content === 'structural' || s.needs?.includes('rope') || !s.phases.some((p) => CHALLENGE.includes(p))) continue;
    // (the porter's measure: width at 285 px/s, plus 0.3 s a landing; three seeds, the shortest judged)
    for (const v of s.subBlocks![0].versions) {
      const secs = Math.min(...[1, 2, 3].map((seed) => { const L = layLocal(s, nb, rngFor(seed), false, { versions: { body: v.id } }); return L.width / 285 + 0.3 * L.pieces.filter((p) => p.landing).length; }));
      assert.ok(secs >= 10, `${s.id}/${v.id}: ${secs.toFixed(1)} s`);
    }
  }
});

test("W1_KIT's graph and tempo rows fit the planner's manifest types, and every section's jobs are gen2's NodeJob", async () => {
  const { W1_KIT } = await import('./w1.ts');
  const M: Pick<import('../types.ts').WorldManifest, 'graphs' | 'rollRanges' | 'floorRoll'> = { graphs: W1_KIT.graphs, rollRanges: W1_KIT.rollRanges, floorRoll: W1_KIT.floorRoll };
  assert.ok(M.graphs!.list.length === 4 && M.graphs!.briefs['1-1'].teaches!.join() === 'jump,double,bounce');
  const jobs: import('../types.ts').NodeJob[] = W1_SECTIONS.flatMap((s) => s.jobs ?? []);
  assert.ok(jobs.length > 0);
});

test("every W1 section's every version lays its exit where its exitDy says (within 25 px: the corridor clamp steers by it, the planner's CHECK 3b finding 5)", async () => {
  const { layLocal, planBudget, rngFor } = await import('../pipeline.ts');
  const { cfg, manifest } = await import('../toyWorld.ts');
  const nb = planBudget(cfg('1-1', 'stealth'), manifest, 'normal');
  (nb as { moves: string[] }).moves = ['walk', 'jump', 'double'];
  const off: string[] = [];
  for (const s of W1_SECTIONS) {
    if (s.needs?.includes('rope')) continue;
    for (const v of s.subBlocks![0].versions) for (const seed of [1, 2, 3]) {
      const y = layLocal(s, nb, rngFor(seed), false, { versions: { body: v.id } }).exit.y;
      if (Math.abs(y - s.exitDy) > 25) { off.push(`${s.id}/${v.id}: exitDy ${s.exitDy}, laid ${Math.round(y)}`); break; }
    }
  }
  // (the bounce lips lay on the planner's bounce place, their rise from the mushroom's cap: engine-chunks 3919248e)
  assert.deepEqual(off, []);
});

test("every Dot line a W1 section can say has words (W1_TIPS): no raw text id reaches the screen (the red team's RT-ENGINE #1)", async () => {
  const { W1_TIPS } = await import('./w1.ts');
  const missing = new Set<string>();
  for (const s of W1_SECTIONS) for (const v of s.subBlocks![0].versions) for (const k of v.sockets ?? []) if (k.role === 'tip') for (const id of k.allow ?? []) if (!W1_TIPS[id]) missing.add(`${s.id}/${v.id}: ${id}`);
  assert.deepEqual([...missing], []);
});

test('C1 (R-165.108): every off-path piece of every 1-1 section version holds a petal or a find; none is empty', () => {
  const empty: string[] = [];
  for (const q of W1_SECTIONS.filter((s) => s.feel.includes('1-1'))) for (const v of q.subBlocks![0].versions) {
    for (const p of v.pieces) if (p.main === false && p.landing && !(v.sockets ?? []).some((so) => so.on === p.key && (so.role === 'pickup' || so.role === 'find'))) empty.push(`${q.id}/${v.id} ${p.key}`);
  }
  assert.deepEqual(empty, []);
});
