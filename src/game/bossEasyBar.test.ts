/**
 * Audit C (boss slice), 2026-11-11: on Easy a guardian takes about two thirds as many hits (engine.ts: bossHits = max(4, round(hits * 0.7)), each
 * hit worth the same). The bar must say that number: bossHits.ts counts "one segment per hit" and exists so "the bar and the pop over a
 * hit always agree". bossSegmentCount floors at 6 segments, so a boss whose Easy count is under 6 (Venom Fang: 6 -> 4) gets a bar that
 * says 6 hits for a 4-hit fight, and single hooks that take 1 then 2 segments.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BossPlay } from './bossPlay.ts';
import { hitsLeft } from './bossHits.ts';

for (const id of ['1-10', '2-10', '3-10', '4-10', '5-10', '6-10', '7-10', '8-10', '9-10', '10-10']) {
  test(`${id} Easy: the bar starts at the number of hits the fight takes, and each full hit takes one segment`, () => {
    const f = new BossPlay(id, true);
    const hits: number = f.e.bossHits;
    const b = f.boss;
    assert.equal(hitsLeft(b.hp, b.maxHp, hits), hits, `the bar's count at full health is the fight's ${hits} hits`);
    // one full hit is maxHp / hits hit points (a hook or a kick): every one takes exactly one segment off
    const per = b.maxHp / hits;
    for (let n = 1; n <= hits; n++) {
      const before = hitsLeft(b.maxHp - per * (n - 1), b.maxHp, hits);
      const after = hitsLeft(b.maxHp - per * n, b.maxHp, hits);
      assert.equal(before - after, 1, `hit ${n} of ${hits} takes one segment (took ${before - after})`);
    }
  });
}
