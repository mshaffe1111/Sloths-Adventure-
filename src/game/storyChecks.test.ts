// V19b and the seed promise (storyChecks.ts): planted failures fail; gen2 1-1's rolls and the seed perch's low version keep them.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { generateAllLevels } from './worldsData.ts';
import { buildGen2Stage, layLocal, planBudget, rngFor } from './gen2/pipeline.ts';
import { w1World, W1_SECTIONS } from './gen2/worlds/w1.ts';
import { cfg as toyCfg, manifest } from './gen2/toyWorld.ts';
import { endAboveWindow, seedPromise } from './storyChecks.ts';

const config = generateAllLevels().find((l) => l.id === '1-1')!;

test('V19b: an end higher than the route where the bough window begins passes; level or lower FAILS (planted)', () => {
  const floor = (x: number, y: number, w: number) => ({ id: x, x, y, width: w, height: 300, type: 'solid' as const, style: 'moss_stone' as const });
  const st: any = { spawnX: 0, exitTotemX: 9000, exitTotemY: 600, collectibles: [], platforms: [floor(0, 900, 5000), floor(5000, 800, 2000), floor(7000, 600, 2500)] };
  const v = endAboveWindow(st);
  assert.equal(v.windowX, 6030);
  assert.ok(v.pass, JSON.stringify(v));
  assert.equal(endAboveWindow({ ...st, exitTotemY: 800 }).pass, false, 'level');
  assert.equal(endAboveWindow({ ...st, exitTotemY: 840 }).pass, false, 'lower');
});

test('the seed promise: Roll B keeps it; a seed 150 px over its ground, or with no mushroom under it, FAILS (planted)', () => {
  const st: any = buildGen2Stage({ config, kit: w1World(), seed: 110867, difficulty: 'normal' });
  assert.deepEqual(seedPromise(st), []);
  const seed = st.collectibles.find((c: any) => c.type === 'seed');
  const low = { ...st, collectibles: st.collectibles.map((c: any) => (c === seed ? { ...c, y: c.y + 400 } : c)) };
  assert.ok(seedPromise(low).length > 0);
  const bare = { ...st, platforms: st.platforms.filter((p: any) => p.type !== 'bouncy') };
  assert.match(seedPromise(bare).join(';'), /no mushroom/);
});

test("the seed perch's low version keeps the seed's promise (the seed over the perch's top bank, past a double, its mushroom below)", () => {
  const nb = planBudget(toyCfg('1-1', 'stealth'), manifest, 'normal');
  (nb as { moves: string[] }).moves = ['walk', 'jump', 'double', 'bounce'];
  const perch = W1_SECTIONS.find((s) => s.id === 'w1-seed-perch')!;
  for (const seed of [1, 2, 3]) {
    const L: any = layLocal(perch, nb, rngFor(seed), false, { versions: { body: 'low' } });
    const sock = L.sockets.find((s: any) => s.id === 'seed' || s.socket === 'seed' || s.role === 'find');
    assert.ok(sock, 'the seed socket');
    const platforms = L.pieces.map((p: any, i: number) => ({ id: i, x: p.x, y: p.y, width: p.w, height: p.shape === 'bank' ? Math.max(p.h, 120) : p.h, type: p.shape === 'bouncy' ? 'bouncy' : 'solid' }));
    // (a find on its piece at t, at pickup height over its top: placed as the pipeline fills a find socket)
    const on = L.pieces.find((p: any) => p.key === sock.on);
    const st = { platforms, collectibles: [{ type: 'seed', x: on.x + sock.t * on.w, y: on.y - 34 }], exitTotemX: 0, exitTotemY: 0 };
    assert.deepEqual(seedPromise(st as never), [], `seed ${seed}: ${JSON.stringify(sock)}`);
  }
});
