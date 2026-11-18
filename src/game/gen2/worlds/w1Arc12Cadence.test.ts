/**
 * R-165.174 (Matt's wife's blind test, 11-12 9:31 PM ET: "they weren't as consistent as what they should be with being able just to run
 * and just hit them all"; Matt 9:33 PM: the END chains are the model, "if they were all like the last ones"). 1-2's mushroom chains on
 * the REAL engine (RealPlay), every chain of layouts 1-3, both settings:
 *   - a run with the thumb held is carried cap to cap through every chain, on a steady beat: inside a chain the time between bounces
 *     varies by at most two frames;
 *   - a run with ONE stray jump press at any frame-pair in the first 0.73 s after the first bounce (a flick misread, or an eager tap: the
 *     bounce leaves him one jump) is carried on the teaching chains (the lesson and again) at least 18 times in 23, the finale's own worst
 *     on these layouts (18-21 in 23 measured, FIX-B cadence.ts TOL), and never drops him into the lesson's thorns; on Easy no chain ever
 *     drops him. With 70 px caps on the lesson's 160 px stumps that run stopped on the wood 11-15 times in 23 (8-12 carried): the beat
 *     broke, the inconsistency she felt.
 * Planted: w1Arc12.ts CAP back at 70 fails the stray-press test on both settings (FIX-B REPORT).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../headlessDom.ts';
import { RealPlay } from '../../realPlay.ts';
import { setDifficulty } from '../../difficulty.ts';
import type { Platform } from '../../types.ts';

const STAGE = '1-2';
const LAYOUTS = [1, 2, 3];
const FRAME = 1000 / 30;

/** a chain: a floor mushroom and the caps after it, each 120-300 px on from the last */
function chainsOf(plats: readonly Platform[]): Platform[][] {
  const out: Platform[][] = [];
  for (const m of plats.filter((p) => p.type === 'bouncy').sort((p, q) => p.x - q.x)) {
    const cur = out.at(-1);
    if (cur && m.x - cur.at(-1)!.x > 120 && m.x - cur.at(-1)!.x < 300) cur.push(m);
    else out.push([m]);
  }
  return out.filter((c) => c.length >= 2);
}

type Run = { end: 'through' | 'wood' | 'fell' | 'timeout'; beat: number[] };
/** stand 160 px before the floor mushroom, hold the thumb right; `pressAt` (s after the first bounce): one jump press then */
function fly(r: RealPlay, ch: Platform[], pressAt?: number): Run {
  const m0 = ch[0];
  const floor = r.platforms.find((f) => f.type === 'solid' && Math.abs(f.y - (m0.y + m0.height)) <= 1 && f.x <= m0.x && f.x + f.width >= m0.x + m0.width)!;
  r.stand(Math.max(floor.x + 10, m0.x - 160), floor.y);
  const end = ch.at(-1)!.x + ch.at(-1)!.width;
  const hits: number[] = [];
  let prevVy = 0;
  for (let i = 0; i < 30 * 12; i++) {
    const press = pressAt !== undefined && hits.length === 1 && Math.abs(r.t - hits[0] - pressAt) < 1 / 60;
    r.frame({ right: true, ...(press ? { press: true } : {}) });
    const p = r.p;
    if (p.vy < -300 && prevVy >= -50 && ch.some((q) => Math.abs(q.y - p.y) < 40 && p.x > q.x - 30 && p.x < q.x + q.width + 30)) hits.push(r.t);
    prevVy = p.vy;
    const beat = hits.slice(1).map((t, k) => (t - hits[k]) * 1000);
    if (r.died || p.y > floor.y + 400) return { end: 'fell', beat };
    if (p.grounded && p.x > end + 60) return { end: 'through', beat };
    if (p.grounded && p.x > m0.x + m0.width + 20 && r.platforms.find((q) => q.id === r.standingOn)?.type === 'solid') return { end: 'wood', beat };
  }
  return { end: 'timeout', beat: [] };
}

for (const setting of ['normal', 'easy'] as const) {
  test(`1-2 (${setting}): a thumb-held run is carried through every chain on a steady beat (layouts ${LAYOUTS.join(', ')})`, () => {
    const bad: string[] = [];
    let chains = 0;
    for (const v of LAYOUTS) {
      setDifficulty(setting);
      const r = new RealPlay(STAGE, v);
      for (const [i, ch] of chainsOf(r.platforms).entries()) {
        chains++;
        const run = fly(r, ch);
        const spread = run.beat.length ? Math.max(...run.beat) - Math.min(...run.beat) : 0;
        if (run.end !== 'through') bad.push(`layout ${v} chain ${i}: ${run.end}`);
        else if (spread > 2 * FRAME + 1) bad.push(`layout ${v} chain ${i}: beat ${run.beat.map(Math.round).join('/')} ms`);
      }
      (r.e as unknown as { stop(): void }).stop();
    }
    setDifficulty('normal');
    assert.ok(chains >= LAYOUTS.length * 7, `${chains} chains found`);
    assert.deepEqual(bad, []);
  });

  test(`1-2 (${setting}): one stray jump press is carried on the teaching chains as often as the finale's worst, and never drops him in the lesson`, () => {
    const presses = Array.from({ length: 23 }, (_, k) => k * (1000 / 30 + 0.003) / 1000);
    const bad: string[] = [];
    for (const v of LAYOUTS) {
      setDifficulty(setting);
      const r = new RealPlay(STAGE, v);
      const chs = chainsOf(r.platforms);
      const share = (ch: Platform[]) => {
        const ends = presses.map((t) => fly(r, ch, t).end);
        return { carried: ends.filter((e) => e === 'through').length, fell: ends.filter((e) => e === 'fell').length };
      };
      // (the teaching chains: the lesson and again, the first two; the bar is the finale's worst, the end chains Matt holds up)
      for (const i of [0, 1]) {
        const s = share(chs[i]);
        if (s.carried < 18) bad.push(`layout ${v} chain ${i}: carried ${s.carried}/23 (the finale's worst 18)`);
        if (s.fell) bad.push(`layout ${v} chain ${i}: dropped him in the lesson's thorns ${s.fell}/23`);
      }
      // (and on Easy no chain at all drops him: its wood beside every cap)
      if (setting === 'easy') for (const [i, ch] of chs.entries()) if (share(ch).fell) bad.push(`layout ${v} Easy chain ${i}: a stray press dropped him`);
      (r.e as unknown as { stop(): void }).stop();
    }
    setDifficulty('normal');
    assert.deepEqual(bad, []);
  });
}
