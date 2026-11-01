/**
 * 1-2 The Petal Trail: a miss on the high trail is never the goal (fix-petals, 2026-11-01). Each rule here failed on release-0.9.2's 1-2,
 * where the Normal first-timer ended at the sealed door on seeds 1-3 (70-77 of 92-99 petals):
 *   - a walk off the stair top, or a hop that fell short between two branches, dropped Pokey to the floor with the rest of the run's petals
 *     overhead and nothing to climb back by (protoStage.ts catchUp: a mushroom under each branch's near end);
 *   - the split trail's low stretch had an empty branch overhead a hop from the high road, so the natural hop walked him over the low
 *     petals;
 *   - the first stair step was a 40 px thin ledge he walked straight through on the floor;
 *   - the stage's first petal lay behind where he starts.
 * Played in the real engine (realPlay.ts), on layouts 1-16.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { G } from './protoStage.ts';
import type { Platform } from './types.ts';

const LAYOUTS = Array.from({ length: 16 }, (_, i) => i + 1);
const branches = (ps: readonly Platform[]) => ps.filter((p) => p.style === 'branch' && p.y <= G - 150 && p.y >= G - 260).sort((a, b) => a.x - b.x);

/**
 * walk right from where he stands, no jump, for up to `secs`; once a mushroom has bounced him he steers for `aim` (the branch he means to
 * land on: right while short of its middle, then the thumb off, back left past its far end, as a thumb lands a bounce). `flick`: the
 * second flick at the top of the bounce, as the trail's own mushroom up to the highest branches asks (highLeaps: 236-246 over the floor,
 * one bounce rises about 200)
 */
function walkOn(r: RealPlay, secs: number, until: (r: RealPlay) => boolean, aim?: Platform, flick = false): boolean {
  let held = 0;
  let bounced = false;
  for (let i = 0; i < secs * 30; i++) {
    if (r.p.bounce) bounced = true;
    if (flick && !held && r.p.bounce && r.p.vy > -150 && r.p.jumpsLeft > 0) held = 6;
    let steer: { right?: boolean; left?: boolean } = { right: true };
    if (bounced && aim && !r.p.grounded) steer = r.p.x < aim.x + aim.width / 2 ? { right: true } : r.p.x > aim.x + aim.width - 40 ? { left: true } : {};
    r.frame(held > 0 ? { ...steer, jump: true, press: held === 6 } : steer);
    if (held > 0) held--;
    if (until(r)) return true;
  }
  return false;
}

test('1-2: a walk off a high branch into the gap is one bounce back up onto the next branch (every gap of every high run, layouts 1-16)', () => {
  let gaps = 0;
  for (const v of LAYOUTS) {
    const r0 = new RealPlay('1-2', v);
    const bs = branches(r0.platforms);
    for (let i = 1; i < bs.length; i++) {
      const [a, b] = [bs[i - 1], bs[i]];
      const gap = b.x - (a.x + a.width);
      // (two branches of one run: level, a hop apart, the floor under them)
      if (Math.abs(a.y - b.y) > 2 || gap < 24 || gap > 200) continue;
      gaps++;
      const r = new RealPlay('1-2', v);
      r.stand(a.x + a.width - 30, a.y);
      const back = walkOn(r, 4, (q) => q.standingOn === b.id || bs.slice(i + 1).some((c) => q.standingOn === c.id), b, b.y < G - 200);
      assert.ok(back, `layout ${v}: walked off the branch ending at x ${Math.round(a.x + a.width)}, he ends at (${Math.round(r.p.x)}, ${Math.round(r.p.y)}), not back up on the branch at x ${Math.round(b.x)}`);
    }
  }
  assert.ok(gaps >= 60, `${gaps} gaps played`);
});

test('1-2: a walk off the top of the petal stairs is one bounce up onto the first branch, and every step is a face to hop (none walked through)', () => {
  let stairs = 0;
  for (const v of LAYOUTS) {
    const r0 = new RealPlay('1-2', v);
    const bs = branches(r0.platforms);
    // (the stairs: three blocks 40, 80 and 120 up, the first branch of the run just past the top one)
    const tops = r0.platforms.filter((p) => p.style === 'moss_stone' && Math.abs(p.y - (G - 120)) < 1);
    for (const top of tops) {
      const first = bs.find((b) => b.x > top.x + top.width - 2 && b.x < top.x + top.width + 80);
      if (!first) continue;
      const steps = r0.platforms.filter((p) => p.style === 'moss_stone' && p.x < top.x && p.x > top.x - 600 && [40, 80].some((h) => Math.abs(p.y - (G - h)) < 1));
      assert.equal(steps.length, 2, `layout ${v}: the stairs at x ${Math.round(top.x)} have three steps`);
      for (const s of [...steps, top]) assert.ok(s.height >= 50, `layout ${v}: the step at x ${Math.round(s.x)} is ${s.height} px deep (a thin ledge under 50 is walked through)`);
      stairs++;
      const r = new RealPlay('1-2', v);
      r.stand(top.x + top.width - 30, top.y);
      assert.ok(walkOn(r, 4, (q) => q.standingOn === first.id, first), `layout ${v}: off the stair top at x ${Math.round(top.x + top.width)} he ends at (${Math.round(r.p.x)}, ${Math.round(r.p.y)}), not on the branch`);
    }
  }
  assert.ok(stairs >= 16, `${stairs} stair tops played`);
});

test('1-2: every catch mushroom stands on the floor by a high branch near end', () => {
  for (const v of LAYOUTS) {
    const r = new RealPlay('1-2', v);
    const bs = branches(r.platforms);
    const ids = (r.stage as { proto?: { catchUps?: number[] } }).proto?.catchUps ?? [];
    const catches = r.platforms.filter((p) => ids.includes(p.id));
    assert.ok(catches.length >= 6 && catches.length === ids.length, `layout ${v}: ${catches.length} catch mushrooms`);
    for (const c of catches) {
      assert.equal(c.type, 'bouncy');
      assert.equal(c.y, G - 30, `layout ${v}: the catch at x ${c.x} stands on the floor`);
      // (under a branch's near end, or just before it as the trail's own mushroom stands)
      assert.ok(bs.some((b) => c.x >= b.x - 45 && c.x <= b.x + 15), `layout ${v}: the catch at x ${c.x} is by a branch's near end`);
      // (and never in a dip: it stands on the floor that runs under the branches)
      assert.ok(r.platforms.some((q) => q.y === G && q.x <= c.x && q.x + q.width >= c.x + c.width), `layout ${v}: the floor runs under the catch at x ${c.x}`);
    }
  }
});

test("1-2: the split trail's low stretch has no branch over it (the hop from the high road landed on it and walked him over the low petals)", () => {
  let lows = 0;
  for (const v of LAYOUTS) {
    const r = new RealPlay('1-2', v);
    const st = r.stage as { proto?: { beats?: Array<[number, number, string]> } };
    const dips = r.platforms.filter((p) => p.style === 'moss_stone' && p.y > G + 40 && p.width > 100);
    const bs = branches(r.platforms);
    for (const d of dips) {
      // (a dip with the trail's low petals arcing over it, between two high runs)
      const lowArc = r.collectibles.some((c) => c.type === 'flower' && c.x > d.x && c.x < d.x + d.width && Math.abs(c.y - (G - 95 + 70 * (1 - Math.sin(Math.PI * 0.25)))) < 2);
      if (!lowArc) continue;
      lows++;
      const over = bs.find((b) => b.x < d.x + d.width && b.x + b.width > d.x);
      assert.ok(!over, `layout ${v}: a branch at x ${over?.x} runs over the low trail's dip at x ${d.x}`);
    }
    void st;
  }
  assert.ok(lows >= 8, `${lows} low dips checked`);
});

test('1-2: no petal lies behind where he starts', () => {
  for (const v of LAYOUTS) {
    const r = new RealPlay('1-2', v);
    const behind = r.collectibles.filter((c) => c.type === 'flower' && c.x < r.stage.spawnX);
    assert.deepEqual(behind.map((c) => Math.round(c.x)), [], `layout ${v}`);
  }
});
