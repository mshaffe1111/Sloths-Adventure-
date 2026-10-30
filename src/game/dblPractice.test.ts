/**
 * LV-3 (Matt, 2026-10-29): 1-6 teaches the double jump just before the first gaps that need it, at a practice spot over solid floor (no
 * fall, no clock): from the near ledge one jump falls short of the far one, the second jump lands, even with Easy's short hold; a miss
 * is a drop onto the floor; the floor runs on under both ledges, so a plain walk passes beneath.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, G, PRACTICE } from './protoStage.ts';
import { RealPlay } from './realPlay.ts';
import { generateAllLevels } from './worldsData.ts';
import type { Platform } from './types.ts';

const cfg = generateAllLevels().find((l) => l.id === '1-6' && !l.secret)!;
/** the practice ledges in a built 1-6: two ledges at its height, the gap apart */
function ledges(platforms: readonly Platform[]): [Platform, Platform] | null {
  const at = platforms.filter((p) => p.y === G - PRACTICE.ledge).sort((a, b) => a.x - b.x);
  for (let i = 0; i + 1 < at.length; i++) if (Math.abs(at[i + 1].x - (at[i].x + at[i].width) - PRACTICE.gap) < 1) return [at[i], at[i + 1]];
  return null;
}
/** the 1-6 rolls with gaps that want the second jump (highLeaps' double gaps): seeds 1, 4, 6, 8 of the first twelve */
const WITH = [1, 4, 6, 8];

test('LV-3: the practice spot stands before the first double gaps in every 1-6 roll that has them, and only once', () => {
  for (const s of WITH) {
    const st = buildProtoStage(cfg, s, 'proto');
    const l = ledges(st.platforms);
    assert.ok(l, `seed ${s}: no practice spot`);
    assert.equal(st.platforms.filter((p) => p.y === G - PRACTICE.ledge).length, 2, `seed ${s}: one spot`);
    // the floor runs on under both ledges, and the far ledge carries the petals
    for (const p of l) assert.ok(st.platforms.some((q) => q.y === G && q.x <= p.x && q.x + q.width >= p.x + p.width), `seed ${s}: no floor under the ledge at ${p.x}`);
    assert.ok(st.collectibles.filter((c) => c.x > l[1].x && c.x < l[1].x + l[1].width && c.y < l[1].y).length >= 2, `seed ${s}: petals on the far ledge`);
    // and no double gap before it
    const firstDbl = st.platforms.filter((p) => p.y <= G - 236 && p.y >= G - 246 && p.x > l[1].x).length;
    assert.ok(firstDbl > 0, `seed ${s}: the high branches come after it`);
  }
});

test('LV-3 in the real engine: from the near ledge one jump drops to the floor, the second jump lands on the far ledge, Normal and Easy holds', () => {
  for (const s of [1, 4]) {
    for (const [hold, dbl, lands] of [[14, false, false], [14, true, true], [6, true, true], [9, true, true]] as const) {
      const r = new RealPlay('1-6', s);
      r.safe = true;
      const l = ledges(r.platforms);
      assert.ok(l, `seed ${s}`);
      const [a, b] = l;
      r.stand(a.x + 30, a.y);
      let pressed = -1, second = -1;
      for (let i = 0; i < 150; i++) {
        const p = r.p;
        if (pressed < 0 && p.grounded && p.x >= a.x + a.width - 22) pressed = i;
        // the second flick near the top of the first jump
        if (dbl && pressed >= 0 && second < 0 && i - pressed >= 8) second = i;
        const held = (pressed >= 0 && i - pressed < hold) || (second >= 0 && i - second < hold);
        r.frame({ right: true, press: i === pressed || i === second, jump: held && i !== pressed && i !== second });
        if (pressed >= 0 && i - pressed > 4 && r.p.grounded) break;
      }
      const onB = r.p.grounded && Math.abs(r.p.y - b.y) < 4;
      const onFloor = r.p.grounded && Math.abs(r.p.y - G) < 4;
      assert.equal(onB, lands, `seed ${s} hold ${hold} ${dbl ? 'double' : 'single'}: at (${Math.round(r.p.x)}, ${Math.round(r.p.y)})`);
      if (!lands) assert.ok(onFloor, `seed ${s}: a miss lands on the floor, not in a pit`);
    }
  }
});
