/**
 * The self-swinging vines (Matt, 2026-10-28, a hotfix): an iPhone tester's video showed Pokey on a World 1 liana in big arcs ("they
 * swing wildly"). Every swinging vine now swings on its own, Donkey Kong Country style: a fixed swing worked out from the game's clock
 * (physics.ts vineAngle), the same with him on it or not, on any screen and at any frame rate. On it, up and down climb, left and right
 * only turn him, and the one choice is when to let go.
 *
 * Checked here in the real engine (realPlay.ts) with the frame timing an iPhone gives (120 Hz ProMotion, 60 Hz, uneven frames, stalls,
 * run through the engine's own 30 fps gate), with a thumb held, pumping, flicking and climbing; and the release windows on every stage's
 * lianas (Normal 167 ms, Easy 300 ms, STAGE-RULES).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { airStep, PHYS, setTimedSwing, swingGrab, swingStep, timedLaunch, TIMED, vineAngle, type AirBody } from './physics.ts';
import { catchWindow } from './protoCheck.ts';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import type { Platform, Vine } from './types.ts';

type Timing = 'steady30' | 'hz120' | 'hz60' | 'jitter' | 'stalls';

/** the engine's frame steps (engine.ts loop: a frame under 31.3 ms is skipped, dt = min(elapsed, 50 ms)) for a screen's frame timing */
function loopDts(kind: Timing, n: number): number[] {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const iv = 1000 / 30;
  const out: number[] = [];
  let last = 0, now = 0;
  while (out.length < n) {
    let d = kind === 'steady30' ? iv : kind === 'hz120' ? 1000 / 120 : kind === 'hz60' ? 1000 / 60 : 8 + rnd() * 42;
    if (kind === 'stalls') d = rnd() < 0.03 ? 100 + rnd() * 150 : 1000 / 60;
    now += d;
    const el = now - last;
    if (el < iv - 2) continue;
    last = el < iv + 2 ? now : now - (el % iv);
    out.push(Math.min(el / 1000, 0.05));
  }
  return out;
}

type Hands = 'off' | 'pump' | 'flick' | 'mash' | 'climb';
function thumbs(r: RealPlay, hands: Hands, k: number) {
  const s = r.input.state;
  s.left = s.right = s.up = s.down = false;
  s.jumpPressed = s.jumpHeld = false;
  const om = r.p.swingAngularVelocity ?? 0;
  if (hands === 'pump') s[om >= 0 ? 'right' : 'left'] = true;
  if (hands === 'flick' && k % 7 < 2) s[k % 14 < 7 ? 'right' : 'left'] = true;
  // (an iPhone's touch events can come in bursts: a thumb rocked left and right every frame)
  if (hands === 'mash') s[k % 2 ? 'right' : 'left'] = true;
  if (hands === 'climb') {
    if (k % 60 < 20) s.down = true;
    else if (k % 60 < 40) s.up = true;
  }
}

function firstLiana(r: RealPlay): Vine {
  return r.vines.find((q) => q.vineType !== 'tree_climb')!;
}

test('self-swing: under any frame timing and any thumb, the vine swings exactly its own swing for 20 s (never wider, never faster)', () => {
  setTimedSwing(false);
  const wMax = TIMED.amp * ((2 * Math.PI) / TIMED.period);
  for (const kind of ['steady30', 'hz120', 'hz60', 'jitter', 'stalls'] as Timing[]) {
    for (const hands of ['off', 'pump', 'flick', 'mash', 'climb'] as Hands[]) {
      const r = new RealPlay('1-6', 1);
      const v = firstLiana(r);
      r.swing(v, { angle: 0, omega: 0.5, len: 160 });
      let t = 0, k = 0, maxA = 0, maxW = 0;
      for (const dt of loopDts(kind, 2000)) {
        if (t >= 20) break;
        thumbs(r, hands, k++);
        r.e.update(dt);
        t += dt;
        const what = `${kind} ${hands} at ${t.toFixed(2)} s`;
        assert.ok(r.p.isVineSwinging, `${what}: let go of the vine`);
        const a = r.p.swingAngle ?? 0;
        // the swing is the vine's clock and nothing else
        assert.ok(Math.abs(a - vineAngle(v, r.vineClock)) < 1e-9, `${what}: angle ${a.toFixed(3)}, the vine's own ${vineAngle(v, r.vineClock).toFixed(3)}`);
        assert.ok(Math.abs((v.swingAngle ?? 0) - a) < 1e-9, `${what}: the vine is drawn where he hangs`);
        maxA = Math.max(maxA, Math.abs(a));
        maxW = Math.max(maxW, Math.abs(r.p.swingAngularVelocity ?? 0));
      }
      assert.ok(maxA <= TIMED.amp + 1e-9 && maxA > TIMED.amp - 0.02, `${kind} ${hands}: swings to ${maxA.toFixed(3)} rad (its swing: ${TIMED.amp})`);
      assert.ok(maxW <= wMax + 1e-9, `${kind} ${hands}: turns at up to ${maxW.toFixed(2)} rad/s (its swing: ${wMax.toFixed(2)})`);
    }
  }
});

test('self-swing: at a steady 30 fps, left and right change nothing (pumping, flicking and hands off give the same swing, frame for frame)', () => {
  setTimedSwing(false);
  const trace = (hands: Hands) => {
    const r = new RealPlay('1-6', 1);
    const v = firstLiana(r);
    r.swing(v, { angle: 0, omega: 0.5, len: 200 });
    const out: number[] = [];
    for (let k = 0; k < 30 * 10; k++) {
      thumbs(r, hands, k);
      r.e.update(1 / 30);
      out.push(r.p.swingAngle ?? 0);
    }
    return out;
  };
  const off = trace('off');
  for (const hands of ['pump', 'flick', 'mash'] as Hands[]) {
    const t = trace(hands);
    for (let k = 0; k < off.length; k++) assert.ok(Math.abs(t[k] - off[k]) < 1e-9, `${hands}: frame ${k} at ${t[k].toFixed(3)}, hands off ${off[k].toFixed(3)}`);
  }
  // its rhythm: the turns come a half period apart
  const turns: number[] = [];
  for (let k = 1; k + 1 < off.length; k++) if (Math.abs(off[k]) >= Math.abs(off[k - 1]) && Math.abs(off[k]) > Math.abs(off[k + 1]) && Math.abs(off[k]) > 0.5) turns.push(k / 30);
  const half = (turns[turns.length - 1] - turns[0]) / (turns.length - 1);
  assert.ok(Math.abs(half * 2 - TIMED.period) < 0.05, `a swing takes ${(half * 2).toFixed(2)} s (its swing: ${TIMED.period})`);
});

test('self-swing: up and down climb along the vine and the swing goes on as it was', () => {
  setTimedSwing(false);
  const r = new RealPlay('1-6', 2);
  const v = firstLiana(r);
  r.swing(v, { angle: 0, omega: 1, len: 200 });
  for (let k = 0; k < 20; k++) r.frame({ up: true });
  assert.ok((r.p.swingLength ?? 0) < 200 - 80, `up climbs: grip at ${r.p.swingLength?.toFixed(0)}`);
  for (let k = 0; k < 40; k++) r.frame({ down: true });
  assert.ok((r.p.swingLength ?? 0) > 200, `down slides lower: grip at ${r.p.swingLength?.toFixed(0)}`);
  assert.ok(Math.abs((r.p.swingAngle ?? 0) - vineAngle(v, r.vineClock)) < 1e-9);
});

test('self-swing: an empty liana swings on its own, a climbing vine hangs still, and a catch never jolts the vine', () => {
  setTimedSwing(false);
  const r = new RealPlay('1-6', 1);
  const v = firstLiana(r);
  const trunk = r.vines.find((q) => q.vineType === 'tree_climb');
  let lo = 0, hi = 0;
  for (let k = 0; k < 60; k++) {
    r.frame();
    lo = Math.min(lo, v.swingAngle ?? 0);
    hi = Math.max(hi, v.swingAngle ?? 0);
  }
  assert.ok(lo < -TIMED.amp + 0.05 && hi > TIMED.amp - 0.05, `the empty liana swings ${lo.toFixed(2)}..${hi.toFixed(2)}`);
  if (trunk) assert.equal(trunk.swingAngle, undefined, 'a climbing vine has no swing');
  // jumps at the liana at many moments of its swing: the frame he catches it, the vine is where its swing has it (no pull)
  let caught = 0;
  for (let phase = 0; phase < 24; phase++) {
    const q = new RealPlay('1-6', 1);
    const w = firstLiana(q);
    q.fly(w.x - 70, w.topY + 220, 330, -120);
    q.vineClock = (phase / 24) * TIMED.period;
    for (let k = 0; k < 40 && !q.p.isVineSwinging; k++) {
      q.frame({ right: true, jump: true });
      if (q.p.isVineSwinging) {
        caught++;
        assert.ok(Math.abs((w.swingAngle ?? 0) - vineAngle(w, q.vineClock)) < 1e-9, `phase ${phase}: the catch moved the vine`);
        assert.ok(Math.abs((q.p.swingAngle ?? 0) - vineAngle(w, q.vineClock)) < 1e-9, `phase ${phase}: he is not on the vine's line`);
      }
    }
  }
  assert.ok(caught >= 12, `caught at ${caught} of 24 moments of the swing`);
});

// ───────────────────────────── the release windows on the stages ─────────────────────────────

const DT = 1 / 30;
/** ms of one swing on B (entered as a jump brings him in) in which letting go toward +x lands him on `to` (the second jump allowed) */
function ledgeWindow(B: Vine, to: Platform): number {
  const len = B.bottomY - B.topY;
  const s = swingGrab({ x: B.x - 40, y: B.topY + Math.min(len * 0.7, len - 20), vx: 300, vy: 100 }, B);
  const n = Math.round(TIMED.period / DT);
  let ok = 0;
  for (let k = 0; k < n; k++) {
    const r = swingStep(s, B, DT, 1, 0);
    const l = timedLaunch(s, 1);
    let landed = false;
    for (const tD of [99, 0.2, 0.4]) {
      const c: AirBody = { x: r.x, y: r.y, vx: l.vx, vy: l.vy };
      let t = 0, used = false;
      for (let i = 0; i < 90 && !landed; i++) {
        if (!used && t >= tD) {
          c.vy = -PHYS.doubleV;
          used = true;
        }
        const prevY = c.y;
        airStep(c, DT, 1);
        t += DT;
        if (c.vy >= 0 && prevY <= to.y + 14 && c.y >= to.y && c.x > to.x + 10 && c.x < to.x + to.width) landed = true;
        if (c.y > to.y + 400) break;
      }
      if (landed) break;
    }
    if (landed) ok++;
  }
  return ok * DT * 1000;
}

test('self-swing: on every stage, letting go of a liana has a window of at least 167 ms on Normal and 300 ms on Easy, to the next liana or a ledge', () => {
  const levels = generateAllLevels().filter((c) => c.objectiveType !== 'boss_lair');
  const bad: string[] = [];
  let chains = 0, ledges = 0;
  try {
    for (const easy of [false, true]) {
      setTimedSwing(easy);
      const need = easy ? 300 : 167;
      for (const c of levels) {
        for (const seed of [1, 2, 3]) {
          setLayoutVariant(seed);
          const st = generateStage({ ...c, unlocked: true });
          setLayoutVariant(null);
          const L = st.vines.filter((v) => v.vineType !== 'tree_climb' && !v.kit).sort((a, b) => a.x - b.x);
          for (let i = 0; i < L.length; i++) {
            const A = L[i], B = L[i + 1];
            if (B && B.x - A.x < 560 && Math.abs(B.topY - A.topY) < 200) {
              chains++;
              // (catchWindow counts the good moments over 90 frames, a swing and a half: this is per swing)
              const w = (catchWindow(A, B) * 1000 * TIMED.period) / (90 * DT);
              if (w < need) bad.push(`${easy ? 'Easy' : 'Normal'} ${c.id} roll ${seed}: liana ${Math.round(A.x)} -> ${Math.round(B.x)} ${Math.round(w)} ms`);
              continue;
            }
            const plats = st.platforms.filter((p) => p.x + p.width > A.x + 40 && p.x < A.x + 700 && p.y > A.topY && p.y < A.bottomY + 300 && p.type !== 'bouncy' && p.width > 30);
            if (!plats.length) continue;
            ledges++;
            const best = Math.max(...plats.map((p) => ledgeWindow(A, p)));
            if (best < need) bad.push(`${easy ? 'Easy' : 'Normal'} ${c.id} roll ${seed}: liana ${Math.round(A.x)} to a ledge ${Math.round(best)} ms`);
          }
        }
      }
    }
  } finally {
    setTimedSwing(false);
    setLayoutVariant(null);
  }
  assert.ok(chains > 20 && ledges > 20, `checked ${chains} liana-to-liana and ${ledges} liana-to-ledge lets-go`);
  assert.deepEqual(bad, []);
});
