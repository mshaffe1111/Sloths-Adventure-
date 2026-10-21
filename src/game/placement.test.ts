import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rng } from './artKit.ts';
import { composeClusters, clusterCentres, clusterAround, dx, flyerGroups, type ClusterOpts } from './placement.ts';

const OPTS: ClusterOpts = { width: 2400, wrap: true, clusters: 6, gap: 300, spread: [70, 18], minDist: 22, size: [10, 22], y: [560, 640], calm: 700 };

test('the same seed grows the same garden', () => {
  assert.deepEqual(composeClusters(rng(5), OPTS), composeClusters(rng(5), OPTS));
  assert.notDeepEqual(composeClusters(rng(5), OPTS), composeClusters(rng(6), OPTS));
});

test('clusters have 3 to 7 members and members of one cluster share a tint', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const spots = composeClusters(rng(seed), OPTS);
    const by = new Map<number, number[]>();
    for (const s of spots) by.set(s.cluster, [...(by.get(s.cluster) ?? []), s.tint]);
    for (const [, tints] of by) {
      assert.ok(tints.length >= 3 && tints.length <= 7, `seed ${seed}: cluster of ${tints.length}`);
      assert.ok(tints.every((t) => t === tints[0]));
    }
  }
});

test('no two members closer than the minimum distance, seam included', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const spots = composeClusters(rng(seed), OPTS);
    for (let i = 0; i < spots.length; i++) {
      for (let j = i + 1; j < spots.length; j++) {
        const d = Math.hypot(dx(spots[i].x, spots[j].x, OPTS.width, true), spots[i].y - spots[j].y);
        assert.ok(d >= OPTS.minDist - 1e-9, `seed ${seed}: ${d}`);
      }
    }
  }
});

test('cluster centres keep their gap and the sizes and band are respected', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const c = clusterCentres(rng(seed), 2400, 7, 300, true);
    for (let i = 0; i < c.length; i++) for (let j = i + 1; j < c.length; j++) assert.ok(dx(c[i], c[j], 2400, true) >= 300 - 1e-9);
    for (const s of composeClusters(rng(seed), OPTS)) {
      assert.ok(s.size >= OPTS.size[0] - 1e-9 && s.size <= OPTS.size[1] + 1e-9);
      assert.ok(s.y >= OPTS.y[0] && s.y <= OPTS.y[1]);
    }
  }
});

test('every strip keeps a real rest: a stretch with nothing in it', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const xs = composeClusters(rng(seed), OPTS).map((s) => s.x).sort((a, b) => a - b);
    if (xs.length < 2) continue;
    // the biggest empty stretch, around the seam
    let widest = xs[0] + OPTS.width - xs[xs.length - 1];
    for (let i = 1; i < xs.length; i++) widest = Math.max(widest, xs[i] - xs[i - 1]);
    assert.ok(widest >= OPTS.calm! - 1, `seed ${seed}: widest empty stretch ${widest}`);
  }
});

test('kept-clear spans stay empty', () => {
  const opts: ClusterOpts = { ...OPTS, calm: 0, keepClear: [[800, 1200]] };
  for (let seed = 1; seed <= 30; seed++) for (const s of composeClusters(rng(seed), opts)) assert.ok(s.x < 800 || s.x > 1200);
});

test('flyers travel in groups of one to three', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const g = flyerGroups(rng(seed), 7);
    assert.equal(g.length, 7);
    const size = new Map<number, number>();
    for (const f of g) size.set(f.group, (size.get(f.group) ?? 0) + 1);
    for (const [, n] of size) assert.ok(n >= 1 && n <= 3);
  }
});

test('a cluster on a surface: the lead sits in the middle, no two members touch, nobody leaves the ellipse', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const cx = 300;
    const cy = 200;
    const sx = 90;
    const sy = 30;
    const mem = clusterAround(rng(seed), 5, cx, cy, sx, sy, 28);
    assert.ok(mem.length >= 1 && mem.length <= 5);
    assert.equal(mem[0].k, 0);
    assert.equal(mem[0].x, cx);
    assert.equal(mem[0].y, cy);
    for (let i = 0; i < mem.length; i++) {
      assert.ok(((mem[i].x - cx) / sx) ** 2 + ((mem[i].y - cy) / sy) ** 2 <= 1.0001);
      for (let j = i + 1; j < mem.length; j++) assert.ok(Math.hypot(mem[i].x - mem[j].x, mem[i].y - mem[j].y) >= 28);
    }
  }
  assert.deepEqual(clusterAround(rng(3), 4, 0, 0, 50, 20, 20), clusterAround(rng(3), 4, 0, 0, 50, 20, 20));
});
