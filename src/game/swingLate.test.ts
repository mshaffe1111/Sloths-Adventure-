/**
 * A press a beat after the sweet spot leaps as the release checks fly it, on ANY liana (ENG-16E, R-165.246; engine.ts sweetSnap, physics.ts
 * RELEASE.late, timedLaunch). The engine kept the sweet spot's last moment without the vine's swing, so a late press off a liana narrowed by
 * its neighbour (a chain's, swingSetup) was thrown as off the engine's full swing: 1-6's chain, the kid's press at the forward end of its
 * last liana left at vx 426 where pressWindow (gen2's lay) flies 520, and he fell into the thorns (BUILD-16d E1). The real engine at
 * 30 fps on a bare world: RED with the swing left out of the snapshot.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { inSweetSpot, releaseCall, setTimedSwing, swingClockAt, TIMED, timedLaunch, type SwingState } from './physics.ts';
import type { Platform, Vine } from './types.ts';

const g = globalThis as { location?: unknown };
g.location ??= { search: '' };

/** swing on `v` from its foot, holding forward, and press once the swing is `past` of the way out and moving on (a beat late) */
function lateLeap(amp: number, past = 0.94) {
  setTimedSwing(false);
  const r = new RealPlay('1-1', 1);
  const v: Vine = { id: 1, x: 2000, topY: 400, bottomY: 810, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true, swingAmp: amp, swingPeriod: TIMED.period, swingPhase: 0 };
  const floor: Platform = { id: 1, x: 0, y: 1400, width: 6000, height: 40, type: 'solid' };
  r.bare([floor], [v]);
  // (caught at the foot, swinging back: a whole forward sweep ahead)
  r.swing(v, { angle: -amp * 0.5, omega: -0.01, len: 400, t: swingClockAt(v, -amp * 0.5, -0.01) });
  let snap: SwingState | null = null, at = 0;
  for (let f = 0; f < 30 * 6; f++) {
    const s = r.swingState();
    if (inSweetSpot(s, 1)) { snap = { ...s }; at = r.t; }
    const a = s.angle / amp;
    if (snap && s.omega >= 0 && a >= past && r.t - at > 1 / 30) {
      const call = releaseCall(s, 1, r.t - at);
      r.frame({ right: true, press: true });
      return { call, vx: r.p.vx, vy: r.p.vy, want: timedLaunch(call === 'late' ? snap : s, 1), swinging: !!r.p.isVineSwinging };
    }
    r.frame({ right: true });
  }
  return null;
}

test('a late press off a half-swing liana (a chain\'s) leaps as the release checks fly it: the vine\'s own swing (RED: a third short)', () => {
  for (const amp of [0.24, 0.3]) {
    const l = lateLeap(amp);
    assert.ok(l, `amp ${amp}: never pressed`);
    assert.equal(l!.call, 'late', `amp ${amp}: the press is not a beat late (${l!.call}): the test proves nothing`);
    assert.ok(!l!.swinging, `amp ${amp}: he did not let go`);
    assert.ok(Math.abs(l!.vx - l!.want.vx) < 1 && Math.abs(l!.vy - l!.want.vy) < 1, `amp ${amp}: leapt at (${Math.round(l!.vx)}, ${Math.round(l!.vy)}), the checks fly (${Math.round(l!.want.vx)}, ${Math.round(l!.want.vy)})`);
  }
});

test('the engine\'s full swing leaps as before (its amp is the default the snapshot used to fall back on)', () => {
  const l = lateLeap(TIMED.amp);
  assert.ok(l && l.call === 'late', `no late press ${l?.call}`);
  assert.ok(Math.abs(l!.vx - l!.want.vx) < 1, `full swing: ${Math.round(l!.vx)} vs ${Math.round(l!.want.vx)}`);
});
