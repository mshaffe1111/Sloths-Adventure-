/**
 * Build 2 of the polish report (2026-10-29): controls that never misread. Each test is one of the report's scripted reproductions
 * (check/c1, c4 and the rest), run through the whole touch chain (touchRig.ts: the real recogniser, the real InputEngine, the real engine
 * at 30 fps), kept as a regression test.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TouchRig, stroke, type TouchEv } from './touchRig.ts';

const G = 2000;
/** a bare floor, Pokey standing on it at x */
function floorRig(x = 300): TouchRig {
  const rig = new TouchRig('1-1', 1);
  rig.r.bare([{ id: 1, x: 0, y: G, width: 20000, height: 300, type: 'solid' } as never]);
  rig.r.stand(x, G);
  rig.clear();
  return rig;
}

/** run the rig until he lands again; how far across the jump carried him (from the take-off) */
function jumpCarry(rig: TouchRig, ms: number): number {
  let x0 = NaN, land = NaN, wasG = true;
  rig.run(ms, () => {
    const p = rig.p;
    if (wasG && !p.grounded && Number.isNaN(x0)) x0 = p.x - p.vx / 30;
    if (!Number.isNaN(x0) && Number.isNaN(land) && p.grounded) land = p.x;
    wasG = p.grounded;
  });
  return land - x0;
}

// ───────────────────────────── CT-1 and CT-11 ─────────────────────────────

/**
 * one thumb on the left half: slide right, run, then flick up. `lift`: off the glass the moment the flick ends (a one-thumb player);
 * `arcX`: how far the flick drifts sideways as it rises (a thumb arcs back toward the palm: negative). `offset` moves the flick against
 * the 30 fps frames, so every phase of the lift against the frame is tried.
 */
function runningJump(offset: number, lift: boolean, arcX = 12): number {
  const rig = floorRig();
  const t1 = 700 + offset;
  const evs: TouchEv[] = stroke(1, [[0, 150, 700], [100, 200, 700], [t1, 210, 704], [t1 + 50, 210 + arcX, 644]], lift);
  if (!lift) evs.push({ t: t1 + 400, k: 'u', id: 1, x: 210 + arcX, y: 644 });
  rig.push(evs);
  return jumpCarry(rig, t1 + 1600);
}

test('CT-1: a one-thumb running jump carries as far whether the thumb lifts at once or stays down (at least 165 px, every frame phase)', () => {
  for (let o = 0; o < 34; o += 3) {
    const lifted = runningJump(o, true);
    const held = runningJump(o, false);
    assert.ok(lifted >= 165, `lifted at once, phase ${o} ms: ${lifted.toFixed(0)} px`);
    assert.ok(held >= 165, `thumb on the glass, phase ${o} ms: ${held.toFixed(0)} px`);
  }
});

test('CT-11: a flick that arcs back toward the palm as it rises keeps the run going (no stop, no turn at take-off)', () => {
  for (const arcX of [-25, -40]) {
    for (let o = 0; o < 34; o += 6) {
      const d = runningJump(o, false, arcX);
      assert.ok(d >= 165, `arc ${arcX} px, phase ${o} ms: ${d.toFixed(0)} px`);
    }
  }
});
