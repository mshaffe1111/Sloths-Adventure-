// The block rule's place check (NODES.md §8.7 B1-B4, as amended 5:44 PM): a teach's check or a test can't be walked round. On hand-laid
// platforms: a rise block of 140 px holds and a stone that stairs past it breaks it; a gap block past a single's reach holds over a pit
// floor 140 px down and breaks over one 70 px down; a bounce block 210 px over the floor holds from the floor and breaks from a 46 px
// perch stump (B3: lip >= stump top + 200); the mushroom itself is never a take-off; a platform past the landing never counts.
import test from 'node:test';
import assert from 'node:assert/strict';
import { blockBreaches, type Laid } from './pipeline.ts';
import type { Platform } from '../types.ts';

let id = 1;
const P = (x: number, y: number, width: number, type: Platform['type'] = 'solid', height = 40): Platform => ({ id: id++, x, y, width, height, type });
const laid = (kind: 'double' | 'bounce', landing: Platform) => ({ blocks: [{ uid: 's3', key: 'top', kind, landing }] }) as unknown as Laid;

test('a rise block of 140 px holds; a stone that stairs past it breaks it', () => {
  const take = P(0, 580, 300), top = P(400, 440, 300);
  assert.deepEqual(blockBreaches(laid('double', top), [take, top]), []);
  const stone = P(320, 520, 40);
  const b = blockBreaches(laid('double', top), [take, stone, top]);
  assert.equal(b.length, 1);
  assert.equal(b[0].uid, 's3');
  assert.match(b[0].why, /from the platform at x 320/);
});

test('a gap block past a single jump\'s reach holds over a deep pit, and breaks over a shallow one', () => {
  const take = P(0, 580, 300), far = P(530, 580, 300);
  assert.deepEqual(blockBreaches(laid('double', far), [take, P(300, 720, 230), far]), [], '230 px across, the pit floor 140 px down');
  assert.equal(blockBreaches(laid('double', far), [take, P(300, 650, 230), far]).length, 1, 'a pit floor 70 px down stairs past it');
  assert.equal(blockBreaches(laid('double', P(420, 580, 300)), [take, P(420, 580, 300)]).length, 1, 'a 120 px gap is a single jump');
});

test('a bounce block 210 px up holds from the floor, breaks from a 46 px perch, and the mushroom is no take-off', () => {
  const floor = P(0, 580, 400, 'solid', 120), lip = P(240, 370, 300);
  const mush = P(120, 550, 70, 'bouncy', 30);
  assert.deepEqual(blockBreaches(laid('bounce', lip), [floor, mush, lip]), []);
  const stump = P(120, 534, 70, 'solid', 46);
  assert.equal(blockBreaches(laid('bounce', lip), [floor, stump, P(120, 504, 70, 'bouncy', 30), lip]).length, 1, 'B3: 164 px over the stump is within a double');
});

test('a platform past the landing never counts', () => {
  const take = P(0, 580, 300), top = P(400, 440, 300);
  assert.deepEqual(blockBreaches(laid('double', top), [take, top, P(700, 500, 200)]), []);
});

test('on a rolled graph, a teach whose block is walked round is swapped out of its teach, never laid there; one that holds is kept', async () => {
  await import('../headlessDom.ts');
  const { buildGen2Stage } = await import('./pipeline.ts');
  const { SPRINT_GRAPHS } = await import('./graphs.ts');
  const { cfg, kit, manifest } = await import('./toyWorld.ts');
  type T = import('./types.ts').SectionTemplate;
  const holds: T = {
    id: 'toy-step-up', name: 'a bank a double up', archetypes: 'any', phases: ['ki', 'sho'], difficulty: 3, teaches: 'step-up',
    pieces: [
      { key: 'low', shape: 'bank', w: [360, 360], place: { kind: 'start' } },
      { key: 'top', shape: 'bank', w: [400, 400], place: { kind: 'double', after: 'low', dy: [-140, -140], share: [0.3, 0.3] }, block: 'double' },
    ],
    entry: { piece: 'low', kind: 'ground' }, exit: { piece: 'top', kind: 'ground' }, exitDy: -140, sockets: [], mirrorable: false,
  };
  const walked: T = {
    ...holds, id: 'toy-step-up-stair', weight: 8,
    pieces: [...holds.pieces.slice(0, 1), { key: 'stone', shape: 'block', w: [60, 60], h: 70, place: { kind: 'on', on: 'low', at: [0.85, 0.85], h: [70, 70] }, main: false }, holds.pieces[1]],
  };
  const k = { ...kit, manifest: { ...manifest, sections: [...manifest.sections, holds, walked], graphs: { list: [...SPRINT_GRAPHS], briefs: { '5-7': { ends: 'quiet', trend: 'up', branching: 'none', teaches: ['step-up'] } } } } } as typeof kit;
  let kept = 0, swapped = 0;
  for (const seed of Array.from({ length: 12 }, (_, i) => 9 + i * 61)) {
    const st = buildGen2Stage({ config: cfg('5-7', 'sprint'), kit: k, seed, difficulty: 'normal' });
    // (in a teach or a test node: once the move is taught, the walkable one may still be laid as a practise, where no block binds)
    const job = new Map(st.gen2.graph.nodes.map((n) => [n.id, n.job]));
    assert.ok(!st.gen2.plan.some((p) => p.template === 'toy-step-up-stair' && (job.get(p.node) === 'teach' || job.get(p.node) === 'test')), `seed ${seed}: the walkable teach was laid as a teach or test`);
    if (st.gen2.plan.some((p) => p.template === 'toy-step-up')) kept++;
    // (the holding teach may be swapped for another reason, a climb out of the toy's corridor, never for its block)
    assert.ok(!st.gen2.repairs.some((r) => /toy-step-up swapped out: the block is walked round/.test(r.note)), `seed ${seed}: the holding block was called walked round`);
    if (st.gen2.repairs.some((r) => /toy-step-up-stair swapped out: the block is walked round/.test(r.note))) swapped++;
  }
  assert.ok(kept >= 6, `the holding teach laid on ${kept} of 12`);
  assert.ok(swapped > 0, 'the walkable teach was never drawn, so the test did not see the rule');
});

test('a bounce block\'s lip lays 200-220 px up, clamped to the bounce\'s reach from its mushroom, and no double reaches it; without `from` it is a walk\'s step', async () => {
  await import('../headlessDom.ts');
  const { layLocal, planBudget, rngFor, BOUNCE_REACH } = await import('./pipeline.ts');
  const { cfg, manifest } = await import('./toyWorld.ts');
  type T = import('./types.ts').SectionTemplate;
  const lift: T = {
    id: 'toy-lift', name: 'first lift', archetypes: 'any', phases: ['ki'], difficulty: 2, teaches: 'bounce',
    pieces: [
      { key: 'floor', shape: 'bank', w: [420, 420], place: { kind: 'start' } },
      { key: 'mush', shape: 'bouncy', w: [70, 70], h: 30, place: { kind: 'on', on: 'floor', at: [0.7, 0.7], h: [30, 30] }, main: false },
      { key: 'lip', shape: 'bank', w: [400, 400], place: { kind: 'walk', after: 'floor', dy: [-220, -200] }, block: 'bounce', from: 'mush' },
    ],
    entry: { piece: 'floor', kind: 'ground' }, exit: { piece: 'lip', kind: 'ground' }, exitDy: -210, sockets: [], mirrorable: false,
  };
  const budget = planBudget(cfg('5-7', 'sprint'), manifest, 'normal');
  assert.ok(BOUNCE_REACH > 240 && BOUNCE_REACH < 270, `the bounce's reach ${BOUNCE_REACH}`);
  for (let k = 0; k < 8; k++) {
    const L = layLocal(lift, budget, rngFor(31, k));
    const floor = L.pieces.find((p) => p.key === 'floor')!, lip = L.pieces.find((p) => p.key === 'lip')!, mush = L.pieces.find((p) => p.key === 'mush')!;
    const rise = floor.y - lip.y;
    assert.ok(rise >= 200 && rise <= 220, `stream ${k}: the lip ${rise} px over the floor`);
    // (and the place rule holds it: from the floor no double reaches the lip; the mushroom is never a take-off)
    const P = (q: typeof floor, type: 'solid' | 'bouncy' = 'solid') => ({ id: 1, x: q.x, y: q.y, width: q.w, height: q.h, type });
    const b = blockBreaches(({ blocks: [{ uid: 's1', key: 'lip', kind: 'bounce', landing: P(lip) }] }) as unknown as Laid, [P(floor), P(mush, 'bouncy'), P(lip)]);
    assert.deepEqual(b, [], `stream ${k}`);
  }
  // (without `from` the walk's clamp lays it about 80 px up: a single jump's step, which the place rule calls walked round)
  const bare: T = { ...lift, pieces: lift.pieces.map((p) => (p.key === 'lip' ? { ...p, from: undefined } : p)) };
  const L = layLocal(bare, budget, rngFor(31, 0));
  const floor = L.pieces.find((p) => p.key === 'floor')!, lip = L.pieces.find((p) => p.key === 'lip')!;
  assert.ok(floor.y - lip.y < 100, `the walk's clamp: ${floor.y - lip.y} px`);
  const P = (q: typeof floor) => ({ id: 1, x: q.x, y: q.y, width: q.w, height: q.h, type: 'solid' as const });
  assert.equal(blockBreaches(({ blocks: [{ uid: 's1', key: 'lip', kind: 'bounce', landing: P(lip) }] }) as unknown as Laid, [P(floor), P(lip)]).length, 1);
});
