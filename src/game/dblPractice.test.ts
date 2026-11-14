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

/**
 * LV-3's intent on a LIVING stage (lead's ruling 11-14 10:49 AM ET, BUILD-16b): the old 1-6's practice ledges died with it (the new 1-6
 * swings and has no double gaps; the double is taught in 1-1). Matt's 10-29 ask, a safe practice before the first gap that needs the
 * double, is 1-1's double teach: the gap right after it that only the second jump crosses (promises11.ts doubleGap, the same finder
 * gen2/stage11gen2.test.ts:49 judges by its geometry). Here it is PLAYED, in the real engine, on 1-1's three rolls: from the near bank one
 * jump falls short and lands safe (nothing lost), the second jump lands on the far bank, at Normal's long hold and Easy's short one.
 */
test('LV-3 in the real engine, on 1-1 (the living double teach): one jump drops safe, the second lands on the far bank, long and short holds', async () => {
  await import('./headlessDom.ts');
  const { doubleGap } = await import('./gen2/promises11.ts');
  const { setDifficulty } = await import('./difficulty.ts');
  const { asQaBuildForTest } = await import('./playRecorder.ts');
  const { setPick11 } = await import('./testlink1_1.ts');
  for (const roll of ['A', 'B', 'C'] as const) {
    for (const [hold, dbl, lands] of [[14, false, false], [14, true, true], [6, true, true], [9, true, true]] as const) {
      asQaBuildForTest(true); setPick11(roll); setDifficulty('normal');
      const r = new RealPlay('1-1', 1);
      r.safe = true;
      const st = r.stage as typeof r.stage & { gen2?: { nodes?: Array<{ token: string; x0: number }> }; heartFalls?: never[] };
      const teach = (st.gen2?.nodes ?? []).find((n) => /^T\w*2/.test(n.token));
      assert.ok(teach, `roll ${roll}: no double teach node`);
      const g = doubleGap(r.platforms, teach.x0, st.waterY ?? st.config.levelHeight, st.heartFalls ?? [], 'normal', '1-1');
      assert.ok(g?.safe, `roll ${roll}: no safe double gap after the teach`);
      const { a, b } = g;
      r.stand(a.x + a.width - 60, a.y);
      let pressed = -1, second = -1;
      for (let i = 0; i < 150; i++) {
        const p = r.p;
        if (pressed < 0 && p.grounded && p.x >= a.x + a.width - 22) pressed = i;
        if (dbl && pressed >= 0 && second < 0 && i - pressed >= 8) second = i;
        const held = (pressed >= 0 && i - pressed < hold) || (second >= 0 && i - second < hold);
        r.frame({ right: true, press: i === pressed || i === second, jump: held && i !== pressed && i !== second });
        if (pressed >= 0 && i - pressed > 4 && r.p.grounded) break;
      }
      const onB = r.p.grounded && Math.abs(r.p.y - b.y) < 4 && r.p.x >= b.x - 4;
      assert.equal(onB, lands, `roll ${roll} hold ${hold} ${dbl ? 'double' : 'single'}: at (${Math.round(r.p.x)}, ${Math.round(r.p.y)}), far bank at ${Math.round(b.x)}, ${Math.round(b.y)}`);
      if (!lands) {
        // (RealPlay stubs loseLife: safe is standing on ground above the stage's death line, short of the far bank)
        assert.ok(r.p.grounded && r.p.y < (st.waterY ?? st.config.levelHeight) - 10 && r.p.x < b.x + 4, `roll ${roll}: a short single jump lands on safe ground under the gap, at (${Math.round(r.p.x)}, ${Math.round(r.p.y)})`);
      }
    }
  }
  asQaBuildForTest(false);
});

test('LV-3: Dot names the move once, on the ground, as the spot comes into view, with each control scheme\'s words, under 10 words', async () => {
  const { DBL_PRACTICE } = await import('./protoStage.ts');
  for (const s of WITH) {
    const st = buildProtoStage(cfg, s, 'proto');
    const [a] = ledges(st.platforms)!;
    const h = (st.proto.hints ?? []).filter((q) => q.text === DBL_PRACTICE[0]);
    assert.equal(h.length, 1, `seed ${s}: said once`);
    assert.ok(h[0].x < a.x - 150 && h[0].x > a.x - 600, `seed ${s}: before the spot, as it comes into view (${Math.round(a.x - h[0].x)} px ahead)`);
    assert.equal(h[0].pad, DBL_PRACTICE[1]);
    assert.equal(h[0].keys, DBL_PRACTICE[2]);
  }
  for (const t of DBL_PRACTICE) assert.ok(t.split(/\s+/).length < 10, t);
});

test('LV-3: the line is an approved row, a move tip that closes on the double jump, with no ring target', async () => {
  const { swapLine, engineGuideLine } = await import('./dotLines.ts');
  const { DBL_PRACTICE } = await import('./protoStage.ts');
  const sw = swapLine(DBL_PRACTICE[0], '1-6');
  assert.equal(sw?.line.id, 'hint.1-6.double');
  assert.equal(sw?.text, 'Double jump! Flick up, then again midair.');
  assert.equal(sw?.line.gesture, 'double-jump');
  assert.equal(sw?.line.target, null);
  assert.equal(sw?.line.kind, 'move');
  assert.equal(engineGuideLine(DBL_PRACTICE[0], '1-6', { dot: true })?.move, 'double', 'it closes when he double jumps');
});
