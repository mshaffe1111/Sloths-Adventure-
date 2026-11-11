// AUDIT-B (2026-11-11, ENGINE-AUDIT-B.md B-07). FAILING ON PURPOSE.
// On 1-1 two rulers answer "can he make this jump": levelCheck.jumpOK(a, b, dbl, arcs) says "given the flown arcs, they alone decide,
// never the closed form" (levelCheck.ts:141) and credits ANY landing a move climbs with that move's LEVEL gap (arcGap, :121-126: a box);
// validateStage links by the closed form OR the arcs, the arcs only for a landing 20 px up or less (:595). jumpOK(arcs) is what the stone
// repair (pipeline.ts:2645), the double-teach promise (promises11.ts:68) and blockBreaches' flown branch (pipeline.ts:2566) ask.
// Here: a thin top 117 px up (the most a flick climbs) across the widest "single" gap (143 px). jumpOK says yes; no flick lands it
// from any spot, flown in the real engine.
import test from 'node:test';
import assert from 'node:assert/strict';
import { jumpOK } from '../../levelCheck.ts';
import { linkArcs } from '../reach.ts';
import { flyJump } from './flight.ts';
import type { Platform } from '../../types.ts';

test('the measuring tool: a level 128 px gap lands from 70 px before the lip and 130 does not (reach.md §2, Normal)', () => {
  assert.equal(flyJump('normal', { rise: 0, gap: 128, thin: false }, 70).ok, true);
  assert.equal(flyJump('normal', { rise: 0, gap: 130, thin: false }, 70).ok, false);
});

test('B-07: a jump jumpOK(arcs) accepts on 1-1 is one a flick can land (Normal: thin top 117 px up, 143 px across)', () => {
  const arcs = linkArcs('normal');
  const a: Platform = { id: 1, x: 0, y: 1000, width: 400, height: 600, type: 'solid' };
  const b: Platform = { id: 2, x: 400 + arcs.single.gap, y: 1000 - arcs.single.climb.thin, width: 300, height: 24, type: 'solid' };
  assert.equal(jumpOK(a, b, false, arcs).ok, true, 'jumpOK(arcs) accepts it (the box: climb 117 and gap 143 judged apart)');
  let lands = 0;
  for (let before = 0; before <= 140; before += 1) if (flyJump('normal', { rise: arcs.single.climb.thin, gap: arcs.single.gap, thin: true }, before).ok) lands++;
  // (and how far the box is out: the widest gap any flick lands at that rise)
  let widest = -1;
  for (let g = 0; g <= arcs.single.gap; g++) for (let before = 0; before <= 60 && widest < g; before += 2) if (flyJump('normal', { rise: arcs.single.climb.thin, gap: g, thin: true }, before).ok) widest = g;
  assert.ok(lands > 0, `no flick from 0-140 px before the lip lands a ${arcs.single.gap} px gap onto a thin top ${arcs.single.climb.thin} px up; the widest gap a flick lands at that rise is ${widest} px`);
});
