import test from 'node:test';
import assert from 'node:assert/strict';
import { stream } from '../protoStage.ts';
import { CooldownQueue, ShuffleBag, WorldOnce, pickWeighted, poissonPlace, type RoutePiece } from './variety.ts';

const ITEMS = ['seesaw', 'pulley', 'vine', 'mushroom', 'lever', 'acorn', 'bramble'];

const draws = (seed: number, n: number) => {
  const bag = new ShuffleBag(stream(seed).f, ITEMS);
  return Array.from({ length: n }, () => bag.draw());
};

test('the same seed gives the same draws, a different seed a different order', () => {
  assert.deepEqual(draws(7, 50), draws(7, 50));
  assert.notDeepEqual(draws(7, 50), draws(8, 50));
  const run = (seed: number) => {
    const rng = stream(seed).f;
    const pieces = Array.from({ length: 40 }, (_, i) => ({ x: Math.floor(rng() * 4000), kind: ITEMS[i % 3] }));
    return poissonPlace(pieces, { rng, minGap: { seesaw: 300 }, maxGap: 400, fillers: [{ x: 0, kind: 'acorn' }], start: 0, end: 4000 });
  };
  assert.deepEqual(run(3), run(3));
});

test('a bag draws every item once per cycle and never repeats across a refill', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const d = draws(seed, ITEMS.length * 6);
    for (let c = 0; c < 6; c++) {
      const cycle = d.slice(c * ITEMS.length, (c + 1) * ITEMS.length);
      assert.deepEqual([...cycle].sort(), [...ITEMS].sort(), `seed ${seed} cycle ${c}`);
    }
    for (let i = 1; i < d.length; i++) assert.notEqual(d[i], d[i - 1], `seed ${seed} draw ${i}`);
  }
});

test('peek shows the next draw, size counts down, and weighted counts go in the bag', () => {
  const bag = new ShuffleBag(stream(5).f, ['a', 'b', 'c'], (it) => (it === 'a' ? 3 : 1));
  assert.equal(bag.capacity, 5);
  const seen: string[] = [];
  for (let i = 0; i < 5; i++) {
    const next = bag.peek();
    assert.equal(bag.size, 5 - i);
    const got = bag.draw()!;
    assert.equal(got, next);
    seen.push(got);
  }
  assert.equal(bag.size, 0);
  assert.deepEqual(seen.sort(), ['a', 'a', 'a', 'b', 'c']);
  assert.equal(new ShuffleBag<string>(stream(1).f).draw(), undefined);
});

test('over 1,000 draws nothing gets more than ~1.3x its fair share (bag and pickWeighted)', () => {
  const fair = 1000 / ITEMS.length;
  const bagCount = new Map<string, number>();
  const pickCount = new Map<string, number>();
  const bag = new ShuffleBag(stream(42).f, ITEMS);
  const rng = stream(43).f;
  for (let i = 0; i < 1000; i++) {
    const b = bag.draw()!;
    bagCount.set(b, (bagCount.get(b) ?? 0) + 1);
    const p = pickWeighted(rng, ITEMS, () => 1)!;
    pickCount.set(p, (pickCount.get(p) ?? 0) + 1);
  }
  for (const it of ITEMS) {
    assert.ok((bagCount.get(it) ?? 0) <= fair * 1.3, `bag ${it}`);
    assert.ok((pickCount.get(it) ?? 0) <= fair * 1.3, `pick ${it} ${pickCount.get(it)}`);
    assert.ok((pickCount.get(it) ?? 0) >= fair * 0.7, `pick ${it} ${pickCount.get(it)}`);
  }
});

test('pickWeighted follows the weights, skips zero weights, and copes with empty or all-zero lists', () => {
  const rng = stream(9).f;
  const count = { a: 0, b: 0, c: 0 };
  for (let i = 0; i < 3000; i++) count[pickWeighted(rng, ['a', 'b', 'c'] as const, (it) => (it === 'a' ? 2 : it === 'b' ? 1 : 0))!]++;
  assert.equal(count.c, 0);
  assert.ok(count.a > count.b * 1.6 && count.a < count.b * 2.4, JSON.stringify(count));
  assert.equal(pickWeighted(rng, [], () => 1), undefined);
  assert.ok(['x', 'y'].includes(pickWeighted(rng, ['x', 'y'], () => 0)!));
});

test('the cooldown never reuses an id within N and falls back to the oldest when all are blocked', () => {
  const n = 14;
  const q = new CooldownQueue<string>(n);
  const pool = Array.from({ length: 20 }, (_, i) => `chunk${i}`);
  const bag = new ShuffleBag(stream(11).f, pool);
  const picked: string[] = [];
  for (let i = 0; i < 300; i++) {
    // offer the bag's next few as candidates, as the generator would
    const cands = [bag.draw()!, bag.draw()!, bag.draw()!, bag.draw()!, bag.draw()!, bag.draw()!, bag.draw()!];
    const got = q.pick(cands)!;
    const lastN = picked.slice(-n);
    if (cands.some((c) => !lastN.includes(c))) assert.ok(!lastN.includes(got), `reuse of ${got} at ${i}`);
    picked.push(got);
  }
  // all blocked: the one used longest ago wins
  const small = new CooldownQueue<string>(3);
  small.use('a');
  small.use('b');
  small.use('c');
  assert.equal(small.allows('a'), false);
  assert.equal(small.pick(['c', 'b', 'a']), 'a');
  assert.deepEqual(small.blocked(), ['b', 'c', 'a']);
  small.use('d');
  assert.equal(small.allows('b'), true, 'b dropped out after 3 newer uses');
  // ids from objects
  const objs = [{ id: 'p' }, { id: 'q' }];
  const oq = new CooldownQueue<string>(1);
  assert.equal(oq.pick(objs, (o) => o.id)?.id, 'p');
  assert.equal(oq.pick(objs, (o) => o.id)?.id, 'q');
  assert.equal(oq.pick([], (o: { id: string }) => o.id), undefined);
});

test('WorldOnce never gives a sub-block twice in a world until the pool runs out, and resets per world', () => {
  const w = new WorldOnce<number>();
  const pool = [1, 2, 3, 4, 5, 6, 7, 8];
  const got = pool.map(() => w.pick(pool)!);
  assert.deepEqual([...got].sort(), pool);
  assert.ok(pool.every((id) => w.used(id)));
  assert.equal(w.pick(pool), 1, 'pool exhausted: the longest-ago one comes back');
  w.newWorld();
  assert.equal(w.used(3), false);
});

test('poissonPlace keeps same-kind pieces apart and leaves no gap over maxGap when fillers exist', () => {
  const minGap = { enemy: 320, lever: 500, acorn: 120 };
  const maxGap = 450;
  for (let seed = 1; seed <= 100; seed++) {
    const rng = stream(seed).f;
    const kinds = ['enemy', 'lever', 'acorn'];
    const cands: RoutePiece[] = Array.from({ length: 25 }, () => ({ x: 200 + Math.floor(rng() * 5000), kind: kinds[below(rng, 3)] }));
    const fixed: RoutePiece[] = [{ x: 2600, kind: 'lever' }];
    const res = poissonPlace(cands, {
      rng,
      minGap,
      maxGap,
      minGapAny: 40,
      fixed,
      fillers: [{ x: 0, kind: 'acorn' }, { x: 0, kind: 'enemy' }],
      start: 0,
      end: 6000,
    });
    assert.ok(res.placed.includes(fixed[0]), 'fixed pieces are kept');
    assert.equal(res.placed.length + res.rejected.length - res.filled.reduce((s, g) => s + g.added.length, 0), cands.length + 1);
    for (let i = 0; i < res.placed.length; i++)
      for (let j = i + 1; j < res.placed.length; j++) {
        const a = res.placed[i];
        const b = res.placed[j];
        const d = Math.abs(a.x - b.x);
        assert.ok(d >= 40, `seed ${seed}: any-gap ${d}`);
        if (a.kind === b.kind) assert.ok(d >= minGap[a.kind as keyof typeof minGap], `seed ${seed}: ${a.kind} ${d}`);
      }
    const xs = [0, ...res.placed.map((p) => p.x), 6000];
    for (let i = 1; i < xs.length; i++) assert.ok(xs[i] - xs[i - 1] <= maxGap, `seed ${seed}: gap ${xs[i - 1]}..${xs[i]}`);
    assert.equal(res.unfilled.length, 0);
  }
});

test('poissonPlace reports a barren stretch it cannot fill', () => {
  const rng = stream(1).f;
  const res = poissonPlace([{ x: 100, kind: 'lever' }, { x: 2000, kind: 'lever' }], { rng, minGap: { lever: 5000 }, maxGap: 400 });
  assert.equal(res.placed.length, 1);
  assert.equal(res.rejected.length, 1);
  assert.equal(res.unfilled.length, 0, 'one piece alone and no route ends: no stretch to measure');
  const res2 = poissonPlace([{ x: 100, kind: 'lever' }], { rng, minGap: { lever: 5000 }, maxGap: 400, start: 0, end: 1500, fillers: [{ x: 0, kind: 'lever' }] });
  assert.deepEqual(res2.unfilled.map((g) => [g.from, g.to]), [[100, 1500]]);
  // a non-interactive piece does not break a barren run
  const res3 = poissonPlace([{ x: 500, kind: 'flower' }], { rng, minGap: {}, maxGap: 400, start: 0, end: 1000, interactive: (p) => p.kind !== 'flower' });
  assert.deepEqual(res3.unfilled.map((g) => [g.from, g.to]), [[0, 1000]]);
});

function below(rng: () => number, n: number) {
  return Math.floor(rng() * n);
}
