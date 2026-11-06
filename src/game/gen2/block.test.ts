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
    if (st.gen2.repairs.some((r) => /toy-step-up-stair swapped out: the block is walked round/.test(r.note))) swapped++;
  }
  assert.ok(kept >= 10, `the holding teach laid on ${kept} of 12`);
  assert.ok(swapped > 0, 'the walkable teach was never drawn, so the test did not see the rule');
});
