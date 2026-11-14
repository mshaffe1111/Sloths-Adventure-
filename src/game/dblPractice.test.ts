/**
 * LV-3 (Matt, 2026-10-29): the double jump is taught just before the first gap that needs it, at a practice spot over solid floor (no
 * fall, no clock): from the near ledge one jump falls short of the far one, the second jump lands, even with Easy's short hold; a miss
 * is a drop onto the floor.
 * (Until 11-14 this file also held the old hand-built 1-6's practice ledges (protoStage.ts dblPractice, PRACTICE, DBL_PRACTICE and its
 * row hint.1-6.double): they went with its proto plan, R-165.238; the gen2 1-6 swings and has no double gaps. The living teach is 1-1's.)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';

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
