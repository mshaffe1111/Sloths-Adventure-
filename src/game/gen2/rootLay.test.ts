// gen2's roof-root place (ENG-ROOT item 2; 3-2.md NEW 2, R-165.452): the piece IS the root, laid over the walkable piece it names (its whole
// length over it), up 190 on Normal / 170 on Easy (data), its glowworm patches by setting (Easy leaves `normalOnly` out), turned with a
// mirrored section; never main, never a landing. Toys on a REAL World 3 row are item 4's (rootRow.test.ts, next).
import test from 'node:test';
import assert from 'node:assert/strict';

test('a root lays over its floor, never past it, at its setting\'s height with its setting\'s patches, and turns with its section', async () => {
  await import('../headlessDom.ts');
  const { layLocal, planBudget, rngFor } = await import('./pipeline.ts');
  const { cfg, manifest } = await import('./toyWorld.ts');
  type T = import('./types.ts').SectionTemplate;
  const tpl: T = {
    id: 'toy-root', name: 'a root over the floor', archetypes: 'any', phases: ['ki'], difficulty: 2,
    pieces: [
      { key: 'floor', shape: 'bank', w: [900, 900], place: { kind: 'start' } },
      { key: 'root', shape: 'vine', w: [0, 0], place: { kind: 'root', on: 'floor', at: [0.5, 0.5], len: [600, 600], up: { normal: 190, easy: 170 },
        patches: [{ at: 0.25, r: { normal: 90, easy: 60 } }, { at: 0.75, r: { normal: 90, easy: 60 }, normalOnly: true }] } },
    ],
    entry: { piece: 'floor', kind: 'ground' }, exit: { piece: 'floor', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: true,
  };
  for (const setting of ['normal', 'easy'] as const) {
    const budget = planBudget(cfg('5-7', 'sprint'), manifest, setting);
    for (const mirrored of [false, true]) {
      const L = layLocal(tpl, budget, rngFor(31, 0), mirrored);
      const floor = L.pieces.find((p) => p.key === 'floor')!, root = L.pieces.find((p) => p.key === 'root')!;
      const at = `${setting}${mirrored ? ' mirrored' : ''}`;
      assert.ok(root.root, `${at}: the piece is a root`);
      assert.equal(root.w, 600, `${at}: its length`);
      assert.ok(root.x >= floor.x && root.x + root.w <= floor.x + floor.w, `${at}: its whole length over its floor`);
      assert.equal(root.y, floor.y, `${at}: y is the floor under it`);
      assert.equal(root.root!.up, setting === 'easy' ? 170 : 190, `${at}: its height`);
      assert.ok(!root.main && !root.landing, `${at}: never main, never a landing`);
      const ts = root.root!.patches.map((q) => q.t), rs = root.root!.patches.map((q) => q.r);
      if (setting === 'easy') assert.deepEqual({ ts, rs }, { ts: [mirrored ? 0.75 : 0.25], rs: [60] }, `${at}: one patch, r 60`);
      else assert.deepEqual({ ts, rs }, { ts: mirrored ? [0.25, 0.75] : [0.25, 0.75], rs: [90, 90] }, `${at}: two patches, r 90`);
    }
  }
});

test('rootPatches: each patch a fixed light of the dark zone over it, with its own glow id; a patch under no dark zone fails by name', async () => {
  const { rootPatches, ROOT_PATCH_DROP } = await import('./dark.ts');
  const zone = { kind: 'dark', x0: 0, x1: 3000, top: 0, bottom: 1000, lights: [{ x: 50, y: 400, r: 190, sleep: true, id: 1 }] };
  const sink = { zones: [zone], extras: { darkGlowId: 2 } } as unknown as Parameters<typeof rootPatches>[0];
  rootPatches(sink, [{ rope: { x0: 1000, x1: 1600, y: 410 }, patches: [{ t: 0.25, r: 90 }] }]);
  assert.deepEqual(zone.lights[1], { x: 1150, y: 410 + ROOT_PATCH_DROP, r: 90, id: 2 });
  assert.equal((sink.extras as Record<string, number>).darkGlowId, 3);
  assert.throws(() => rootPatches(sink, [{ rope: { x0: 4000, x1: 4600, y: 410 }, patches: [{ t: 0.5, r: 90 }] }]), /under no dark zone/);
});
