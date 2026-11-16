// npx tsx --test src/game/gen2/bounceReuse.test.ts
/**
 * A taught bounce reused (FIX-GATES, 11-15). The bounce is taught on 1-1 (skills.ts BOUNCE_TAUGHT_AT). On a stage after it, a bounce lip
 * outside a teach node that the bounce alone reaches is 'bounce-reuse', banded by the flown bounce-alone climb (reach.ts BANDS); a lip
 * past it still asks for the bounce + air jump (refused while no stage teaches that combo, bounceAlone.test.ts). Found on 1-8: its plain
 * ~150 px bounces (BUILD-18c, s3 and s7) were judged on the teach's 174-180 lesson band and failed every roll. Planted both ways.
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { askVerdicts, classify } from './verdicts.ts';
import { arc, BANDS, SPARE } from './reach.ts';
import { bounceReusedAt, missionOf } from '../skills.ts';

const lip = (rise: number) => ({ x0: 1000, x1: 1000, yTake: 900, yLand: 900 - rise, move: 'bounce' as const, block: 'bounce' as const, thin: false, key: 'w', section: 's' });
const judge = (rise: number, setting: 'normal' | 'easy', stage: string, inTeach = false) => {
  const c = classify(lip(rise), inTeach, setting, false, bounceReusedAt(missionOf(stage)));
  return { kind: c.kind, v: askVerdicts({ section: 's', kind: c.kind, x0: 1000, x1: 1000, figure: c.figure, move: 'bounce', headroom: 999 }, setting, stage) };
};

test('the reuse band is the flown bounce-alone climb less SPARE, over one jump\'s climb plus SPARE, on every judged scope', () => {
  for (const setting of ['normal', 'easy'] as const) {
    const band = BANDS['bounce-reuse'][setting] as { lo: number; hi: number };
    for (const stage of ['1-2', '1-8', '2-1']) {
      const scope = setting === 'easy' ? 'easy-any' : `normal-${stage}` as const;
      assert.ok(band.hi <= arc('bounce', scope).climb.block - SPARE.px, `${setting} ${stage}: band top ${band.hi} within the bounce alone`);
      assert.ok(band.lo >= arc('single-hold', scope).climb.block + SPARE.px, `${setting} ${stage}: band foot ${band.lo} past one jump`);
    }
  }
});

test('1-8: a 150 px reused bounce is judged clean; a 240 px one still needs the combo (refused while untaught); 1-1 and a teach node keep the teach band (planted)', () => {
  for (const setting of ['normal', 'easy'] as const) {
    const r = judge(150, setting, '1-8');
    assert.equal(r.kind, 'bounce-reuse');
    assert.deepEqual(r.v.map((x) => x.name), [], `${setting}: the 150 px reused bounce is clean`);
    // (planted: the same 150 px lip judged as the teach (no reuse) is refused, the red 1-8 carried)
    const t = judge(150, setting, '1-8', true);
    assert.equal(t.kind, 'bounce-teach');
    assert.ok(t.v.some((x) => x.name === 'band.out'), `${setting}: in a teach node, 150 is under the lesson band`);
    const on11 = judge(150, setting, '1-1');
    assert.equal(on11.kind, 'bounce-teach', '1-1 teaches the bounce: nothing on it is a reuse');
    const high = judge(240, setting, '1-8');
    assert.notEqual(high.kind, 'bounce-reuse', '240 px is past the bounce alone');
    assert.ok(high.v.some((x) => x.name === 'band.out'), `${setting}: the 240 px lip is refused while no stage teaches the bounce + air jump`);
    const taught = classify(lip(240), false, setting, true, true);
    assert.equal(taught.kind, 'bounce-air-test', 'with the combo taught, 240 px is the bounce + air jump test');
    // (a reused bounce one jump climbs has no purpose: the lesser move still keeps it out)
    const low = judge(110, setting, '1-8');
    assert.ok(low.v.some((x) => x.name === 'block.lesser-passes'), `${setting}: a 110 px lip one jump climbs is refused`);
  }
});
