// npx tsx --test src/game/gen2/bounceAlone.test.ts
/**
 * No stage may require the bounce + air jump before a stage teaches it (the first appearance of a mechanic is taught; the lead's ruling
 * 11-15 1:53 PM ET, FIX-21). skills.ts COMBO_REQUIRED_FROM['bounce-air'] is null: no stage teaches it yet. Until then the builder sizes
 * a bounce lip to the bounce alone (pipeline.ts bounceCap: reach.ts bounceLipOverCap's bounce-teach band on a judged stage, 0.95 of
 * BOUNCE_ALONE elsewhere) and the verdicts judge every bounce lip as the bounce alone (verdicts.ts classify). Found by the first-timer
 * bots: rescued at 2-1's 236-240 px bank on every seed (BUILD-21's 40-seed table); World 1's 1-6 and 1-9 laid such walls too. Planted
 * both ways: with the combo taught (the table pointed at 1-1), the 236 px ask passes and a toy section's 236-240 lip is laid again.
 * Each stage's own built check lives with its data (2-1: w2Arc21.test.ts).
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { askVerdicts, classify } from './verdicts.ts';
import { CAP_UP } from './reach.ts';
import { BOUNCE_ALONE } from './pipeline.ts';
import { COMBO_REQUIRED_FROM } from '../skills.ts';
import type { Platform } from '../types.ts';
import { buildGen2Stage } from './pipeline.ts';
import { cfg as toyCfg, kit as toyKit } from './toyWorld.ts';
import type { SectionTemplate, WorldKit } from './types.ts';

const withCombo = <T>(from: string | null, f: () => T): T => {
  const was = COMBO_REQUIRED_FROM['bounce-air'];
  COMBO_REQUIRED_FROM['bounce-air'] = from;
  try { return f(); } finally { COMBO_REQUIRED_FROM['bounce-air'] = was; }
};

test('a 236 px bounce wall (206 over the cap) is refused while no stage teaches the bounce + air jump; passes once one does (planted)', () => {
  const ask = { x0: 1000, x1: 1000, yTake: 900, yLand: 900 - 236, move: 'bounce' as const, block: 'bounce' as const, thin: false, key: 'w', section: 's' };
  for (const setting of ['normal', 'easy'] as const) {
    const not = classify(ask, false, setting, false);
    assert.equal(not.kind, 'bounce-teach', 'untaught: judged as the bounce alone');
    // (judged on 1-1's flown rows: any judged stage's bounce bands are the same, reach.ts BANDS)
    const v = askVerdicts({ section: 's', kind: not.kind, x0: 1000, x1: 1000, figure: not.figure, move: 'bounce', headroom: 999 }, setting, '1-1');
    assert.ok(v.some((x) => x.name === 'band.out'), `${setting}: the 236 px wall is refused (${v.map((x) => x.name).join(', ') || 'no verdict'})`);
    const taught = classify(ask, false, setting, true);
    assert.equal(taught.kind, 'bounce-air-test');
    const w = askVerdicts({ section: 's', kind: taught.kind, x0: 1000, x1: 1000, figure: taught.figure, move: 'bounce-air', headroom: 999 }, setting, '1-1');
    assert.ok(!w.some((x) => x.name === 'band.out'), `${setting} planted: taught, 236 sits in the bounce + air band`);
  }
});

/** a toy stage (toyWorld's kit, an unjudged id) with ONE bounce wall section: a bank, a mushroom on it, a lip 236-240 px up from it */
const wall: SectionTemplate = {
  id: 'toy-bounce-wall', name: 'bounce wall', archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, maxPerStage: 1,
  pieces: [
    { key: 'a', shape: 'bank', w: [340, 340], place: { kind: 'start' }, main: true },
    { key: 'm', shape: 'bouncy', w: [70, 70], place: { kind: 'on', on: 'a', at: [0.72, 0.72], h: [30, 30] } },
    { key: 'w', shape: 'bank', w: [360, 360], place: { kind: 'walk', after: 'a', dy: [-240, -236] }, main: true, landing: true, block: 'bounce', from: 'm' },
  ],
  entry: { piece: 'a', kind: 'ground' }, exit: { piece: 'w', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
};
const toy: WorldKit = { ...toyKit, manifest: { ...toyKit.manifest, sections: [...toyKit.manifest.sections, wall] } };
const toyCfgRow = { ...toyCfg('2-93', 'sprint'), unlocked: true };
function toyWalls(): number[] {
  for (let seed = 1; seed <= 60; seed++) {
    const st = buildGen2Stage({ config: toyCfgRow, kit: toy, seed, difficulty: 'normal' });
    if (st.gen2.errors?.length) continue;
    const P = st.platforms as Platform[];
    const h: number[] = [];
    for (const b of P) {
      if (b.type !== 'bouncy') continue;
      const w = P.find((q) => q.type === 'solid' && q.x >= b.x + b.width && q.x - (b.x + b.width) < 140 && b.y + b.height - q.y > 130);
      if (w) h.push(Math.round(b.y + b.height - w.y));
    }
    if (h.length) return h;
  }
  throw new Error('no toy roll of 1-60 lays the bounce wall clean');
}

test('the builder holds a bounce wall to the bounce alone while no stage teaches the bounce + air jump: a toy section (planted)', () => {
  // (an unjudged stage: 0.95 of the bounce alone over the cap, the 0.95 every closed-form reach in the builder keeps)
  const alone = 0.95 * BOUNCE_ALONE + CAP_UP.px;
  const t = toyWalls();
  assert.ok(t.every((h) => h <= alone + 1), `toy: its 236-240 lip held to ${Math.round(alone)} px (${t.join(', ')})`);
  const taught = withCombo('1-1', toyWalls);
  assert.ok(taught.every((h) => h >= 236), `planted: with the combo taught, the toy lays its 236-240 lip (${taught.join(', ')})`);
});
