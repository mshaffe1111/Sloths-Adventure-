// Bobbing crates (src/game/pieces/crate.ts): they float on the water, tip (the tell) before they go under, come back up, and a phone
// thumb that waits for the next one to come up gets across a row on Normal and Easy in the real engine. One left standing too long goes
// under with him. Labelled in the library (catalog.ts) as a water piece: only on a drawn water surface.
import test from 'node:test';
import assert from 'node:assert/strict';
import { CRATE, crateRow, crateStandable, crateState, crateY } from './pieces/crate.ts';
import { bareWorld, chain, rng } from './pieces/pieceBot.ts';
import { jumpOK } from './levelCheck.ts';
import { LANDINGS, landingKind } from './mixer/catalog.ts';
import { DT } from './realPlay.ts';
import type { Platform } from './types.ts';

const BANK_Y = 1000, SURFACE = 1040;
function course(easy: boolean, n = 3) {
  const w = easy ? CRATE.width.easy : CRATE.width.normal;
  const span = n * w + (n + 1) * 66;
  const x0 = 1000, x1 = x0 + span;
  const row = crateRow({ x0, x1, surfaceY: SURFACE, n, easy })!;
  const A: Platform = { id: 1, x: 200, y: BANK_Y, width: x0 - 200, height: 400, type: 'solid', style: 'moss_stone' };
  const B: Platform = { id: 2, x: x1, y: BANK_Y, width: 800, height: 400, type: 'solid', style: 'moss_stone' };
  const crates = row.map((c, i) => ({ id: 10 + i, ...c }) as Platform);
  return { A, B, crates, x0, x1 };
}

test('a crate floats, tips (the tell) for a moment, goes under, comes back up', () => {
  const { crates } = course(false);
  const c = crates[0].crate!;
  const seen = new Map<string, number>();
  let deepest = -Infinity, prev = crateState(c, 0).s, order: string[] = [prev];
  for (let t = 0; t < c.period * 2; t += DT) {
    const { s } = crateState(c, t);
    seen.set(s, (seen.get(s) ?? 0) + DT);
    if (s !== prev) { order.push(s); prev = s; }
    deepest = Math.max(deepest, crateY(c, t));
    if (s === 'afloat') assert.ok(crateY(c, t) < SURFACE - 12, 'afloat its top rides over the water');
  }
  assert.ok(order.join(' ').includes('afloat tip under rise'), `in order: ${order.join(' ')}`);
  assert.ok(seen.get('tip')! / 2 >= 0.6, `the tell lasts ${(seen.get('tip')! / 2).toFixed(2)} s (a kid sees it: at least 0.6 s)`);
  assert.ok(deepest > SURFACE + 40, 'under, it is truly under');
  assert.ok(!crateStandable(c, c.period * (c.afloat + c.tip + c.under / 2)), 'under it holds nothing');
});

test('the row needs the crates: the water is too wide to jump, and each gap is a short hop', () => {
  for (const easy of [false, true]) {
    const { A, B, crates } = course(easy);
    assert.equal(jumpOK(A, B, true).ok, false, 'no jump crosses the water without them');
    for (let i = 1; i < crates.length; i++) assert.ok(crates[i].x - (crates[i - 1].x + crates[i - 1].width) <= 0.45 * 175, 'a hop between crates');
  }
  assert.equal(crateRow({ x0: 0, x1: 300, surfaceY: 0, n: 3, easy: false }), null, 'too little water for three');
});

test('real engine: a crate left standing on goes under with him (the hazard is real)', () => {
  const { A, B, crates } = course(false);
  const rp = bareWorld([A, B, ...crates], 'normal');
  const c = crates[0];
  rp.t = 0.05 * c.crate!.period / 1;
  rp.stand(c.x + c.width / 2, crateY(c.crate!, rp.t));
  rp.frame();
  let wet = false;
  for (let i = 0; i < Math.round(c.crate!.period / DT); i++) { rp.frame(); if (rp.p.y > SURFACE + 10) { wet = true; break; } }
  assert.ok(wet, 'standing still through a whole cycle puts him in the water');
});

test('real engine: the first-timer\'s thumb, waiting for each crate to come up, gets across (Normal 70%, the Easy kid 85%)', () => {
  for (const setting of ['normal', 'easy'] as const) {
    const easy = setting === 'easy';
    const { A, B, crates, x0 } = course(easy);
    const rp = bareWorld([A, B, ...crates], setting);
    const targets = [...crates.map((c) => c.id), 2];
    const hops = targets.map((to) => ({ to, dir: 1 as const }));
    // (his read: the next crate is up and afloat, not tipping; the far bank is always there)
    const ready = (q: typeof rp, i: number) => {
      if (i === crates.length) return true;
      const live = q.platforms.find((p) => p.id === crates[i].id)!;
      const st = crateState(live.crate!, q.t);
      return (st.s === 'afloat' && st.k < 0.6) || (st.s === 'rise' && crateStandable(live.crate!, q.t));
    };
    const r = rng(easy ? 7 : 5);
    let across = 0;
    const N = 30;
    for (let k = 0; k < N; k++) {
      // (he walks up to the edge whenever he gets there: any moment of the cycle)
      const made = chain(rp, { x: x0 - (easy ? 32 : 22), y: BANK_Y, t0: r() * 30 }, hops, ready, setting, r, SURFACE + 10);
      if (made === hops.length) across++;
    }
    const floor = easy ? 0.85 : 0.7;
    assert.ok(across / N >= floor, `${setting}: across ${across} of ${N}`);
  }
});

test('its label is in the library: a water piece, never off a drawn water surface, Worlds 2, 6 and 10', () => {
  const { crates } = course(false);
  const k = landingKind(crates[0] as Platform & Record<string, unknown>);
  assert.deepEqual(k.map((q) => q.name), ['bobbing crate']);
  const e = LANDINGS.find((q) => q.name === 'bobbing crate')!;
  assert.equal(e.element, 'water');
  assert.equal(e.mayFloat, 'water');
  assert.deepEqual(e.worlds, [2, 6, 10]);
});
