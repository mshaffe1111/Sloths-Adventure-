// A gap in pixels (the designer's double-teach ruling, 11-06: TEACH 195-205 px, TEST 205-230 px; the porter's ask): a section's `share` is
// scaled by the roll's median gap (rollRanges, the tempo) and by the jump's reach at its rise, so no share holds a pixel band; Roll A's
// teach gaps laid at 227 px and the first-timer missed both. `gapPx: [min, max]` on a jump, double or pit place lays the gap exactly in
// that band, never scaled by the roll; a band past the jump's reach fails the section by name.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { layLocal, planBudget, rngFor } from './pipeline.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { SectionTemplate } from './types.ts';

const c = generateAllLevels().find((l) => l.id === '1-1')!;
const M = w1World().manifest;
const budget = planBudget(c, M, 'normal');
const tpl = (place: Record<string, unknown>): SectionTemplate => ({
  id: 'gappx-probe', name: 'one double gap', archetypes: 'any', phases: ['sho'], difficulty: 3,
  pieces: [
    { key: 'a', shape: 'bank', w: [300, 300], place: { kind: 'start' } },
    { key: 'b', shape: 'bank', w: [300, 300], place: { after: 'a', ...place } as never },
  ],
  entry: { piece: 'a', kind: 'ground' }, exit: { piece: 'b', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
});
const gapsOf = (t: SectionTemplate, tempo?: { gap: number; gapMax: number; rise: number }) =>
  Array.from({ length: 24 }, (_, k) => { const L = layLocal(t, budget, rngFor(31, k), false, { pitDepth: M.pitDepth, ...(tempo ? { tempo } : {}) }); return L.gaps[0].x1 - L.gaps[0].x0; });

test('gapPx lays a double gap inside its pixel band on every stream, whatever the roll tempo (planted: a long-gap roll)', () => {
  for (const place of [{ kind: 'double', gapPx: [195, 205] }, { kind: 'pit', jump: 'double', gapPx: [195, 205] }, { kind: 'double', gapPx: [205, 225] }]) {
    const [lo, hi] = place.gapPx as [number, number];
    for (const tempo of [undefined, { gap: 1.4, gapMax: 1, rise: 1 }, { gap: 0.6, gapMax: 1, rise: 1 }]) {
      const g = gapsOf(tpl(place), tempo);
      assert.ok(g.every((x) => x >= lo && x <= hi), `${JSON.stringify(place)} tempo ${JSON.stringify(tempo)}: gaps ${g.join(', ')} not all in ${lo}-${hi}`);
    }
  }
});
test('the same gap by share moves with the roll tempo (why a share cannot hold the band)', () => {
  const g1 = gapsOf(tpl({ kind: 'double', share: [0.7, 0.7] }), { gap: 1.4, gapMax: 1, rise: 1 });
  const g2 = gapsOf(tpl({ kind: 'double', share: [0.7, 0.7] }), { gap: 0.6, gapMax: 1, rise: 1 });
  assert.ok(Math.min(...g1) > Math.max(...g2) + 20, `share gaps ${g1[0]} vs ${g2[0]}`);
});
test("Easy's margin (0.65) puts a level double's reach at 203.6 px: the designer's TEST band 205-230 is past it, refused by name", () => {
  const easy = planBudget(c, M, 'easy');
  assert.throws(() => layLocal(tpl({ kind: 'double', gapPx: [205, 230] }), easy, rngFor(31, 0), false, { pitDepth: M.pitDepth }), /past the double's reach 204 px/);
});
test('a gapPx band past the jump reach fails the section by name', () => {
  assert.throws(() => gapsOf(tpl({ kind: 'jump', gapPx: [600, 620] })), /gapPx 600-620 .*past/);
});
