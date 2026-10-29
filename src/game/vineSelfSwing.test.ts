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
import { canGrabSwing, isChain, pressWindow, setTimedSwing, swingClearance, swingSetup, TIMED, vineAmp, vineAngle, type SwingVine } from './physics.ts';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { levelConfig } from './realPlay.ts';
import { MEECA_STAGE_ID } from './extraStages.ts';
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
  for (const kind of ['steady30', 'hz120', 'hz60', 'jitter', 'stalls'] as Timing[]) {
    for (const hands of ['off', 'pump', 'flick', 'mash', 'climb'] as Hands[]) {
      const r = new RealPlay('1-6', 1);
      const v = firstLiana(r);
      r.swing(v, { angle: 0, omega: 0.5, len: 160 });
      const amp = vineAmp(v);
      const wMax = amp * ((2 * Math.PI) / TIMED.period);
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
      assert.ok(maxA <= amp + 1e-9 && maxA > amp - 0.02, `${kind} ${hands}: swings to ${maxA.toFixed(3)} rad (its swing: ${amp})`);
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
  for (let k = 1; k + 1 < off.length; k++) if (Math.abs(off[k]) >= Math.abs(off[k - 1]) && Math.abs(off[k]) > Math.abs(off[k + 1]) && Math.abs(off[k]) > 0.2) turns.push(k / 30);
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
  // (over a whole swing)
  for (let k = 60; k < 30 * TIMED.period + 2; k++) {
    r.frame();
    lo = Math.min(lo, v.swingAngle ?? 0);
    hi = Math.max(hi, v.swingAngle ?? 0);
  }
  assert.ok(vineAmp(v) > 0.3 && lo < -vineAmp(v) + 0.02 && hi > vineAmp(v) - 0.02, `the empty liana swings ${lo.toFixed(2)}..${hi.toFixed(2)}`);
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

// ───────────────────────────── the stages: swings apart, and always a way on ─────────────────────────────

/** to the next liana of a chain, at the phases the stage gives them */
const chainWindow = (A: SwingVine, B: SwingVine) => pressWindow(A, (c, t) => canGrabSwing(c.x, c.y, B, t));
/** to a ledge: landing on its top */
const ledgeWindow = (A: SwingVine, to: Platform) => pressWindow(A, (c, _t, prevY) => c.vy >= 0 && prevY <= to.y + 14 && c.y >= to.y && c.x > to.x + 10 && c.x < to.x + to.width);

/** every stage with swinging vines, on its first three rolls, as the engine gives them their swings */
function vineStages(): Array<{ id: string; seed: number; vines: Vine[]; platforms: Platform[] }> {
  const out: Array<{ id: string; seed: number; vines: Vine[]; platforms: Platform[] }> = [];
  const configs = [...generateAllLevels().filter((c) => c.objectiveType !== 'boss_lair'), levelConfig(MEECA_STAGE_ID)];
  for (const c of configs) {
    for (const seed of [1, 2, 3]) {
      setLayoutVariant(seed);
      const st = generateStage({ ...c, unlocked: true });
      setLayoutVariant(null);
      if (!st.vines.some((v) => v.vineType !== 'tree_climb')) continue;
      swingSetup(st.vines);
      out.push({ id: c.id, seed, vines: st.vines, platforms: st.platforms });
    }
  }
  return out;
}

test('self-swing: neighbouring vines never swing into each other, nor into Pokey hanging on either, at any moment', () => {
  let pairs = 0;
  const bad: string[] = [];
  for (const st of vineStages()) {
    const L = st.vines.filter((v) => v.vineType !== 'tree_climb');
    for (let i = 0; i < L.length; i++) {
      for (let j = i + 1; j < L.length; j++) {
        const a = L[i], b = L[j];
        if (!(a.topY < b.bottomY + 40 && b.topY < a.bottomY + 40) || Math.abs(a.x - b.x) > 1200) continue;
        pairs++;
        // (two vines an author hung close together, side by side or one under the other, both hang still: nothing swings to meet)
        if (vineAmp(a) === 0 && vineAmp(b) === 0) continue;
        if (swingClearance(a, b) < -1e-6) bad.push(`${st.id} roll ${st.seed}: vines at ${Math.round(a.x)} and ${Math.round(b.x)} ${swingClearance(a, b).toFixed(0)} px`);
      }
    }
  }
  assert.ok(pairs > 50, `${pairs} pairs side by side`);
  assert.deepEqual(bad, []);
});

for (const easy of [false, true]) {
  test(`self-swing (${easy ? 'Easy' : 'Normal'}): every jump off a liana, to the next liana or to a ledge, has a window on every swing of at least ${easy ? 300 : 167} ms, at the phases the stage gives the vines`, () => {
    const need = easy ? 300 : 167;
    const bad: string[] = [];
    let chains = 0, ledges = 0;
    try {
      setTimedSwing(easy);
      for (const st of vineStages()) {
        const L = st.vines.filter((v) => v.vineType !== 'tree_climb' && !v.kit).sort((a, b) => a.x - b.x);
        for (let i = 0; i < L.length; i++) {
          const A = L[i], B = L[i + 1];
          if (B && isChain(A, B)) {
            chains++;
            const w = chainWindow(A, B);
            if (w < need) bad.push(`${st.id} roll ${st.seed}: liana ${Math.round(A.x)} -> ${Math.round(B.x)} ${Math.round(w)} ms`);
            continue;
          }
          const plats = st.platforms.filter((p) => p.x + p.width > A.x + 40 && p.x < A.x + 700 && p.y > A.topY && p.y < A.bottomY + 300 && p.type !== 'bouncy' && p.width > 30);
          if (!plats.length) continue;
          ledges++;
          const best = Math.max(...plats.map((p) => ledgeWindow(A, p)));
          if (best < need) bad.push(`${st.id} roll ${st.seed}: liana ${Math.round(A.x)} to a ledge ${Math.round(best)} ms`);
        }
      }
    } finally {
      setTimedSwing(false);
    }
    assert.ok(chains > 20 && ledges > 20, `checked ${chains} liana-to-liana and ${ledges} liana-to-ledge jumps`);
    assert.deepEqual(bad, []);
  });
}
