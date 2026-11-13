/**
 * FIX-B probe (R-165.174): 1-2's mushroom chains on the REAL engine. For every chain (a floor mushroom, then caps 120-300 px apart) on
 * every layout asked, both settings: Pokey stands on the floor bank 160 px before the floor mushroom and the thumb is held right, nothing
 * else (Matt: "you could just jump on the first one and it catapulted you to the second and the third and then off"). Logged per chain:
 * the time between bounces, where each stop came (on a cap: carried; on wood or bank mid-chain: the beat broke; in the bed: fell).
 * Usage: npx tsx reference/qa-reports/FIXB/cadence.ts <layouts, e.g. 1-8> [stage]
 */
import '../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import type { Platform } from '../../../src/game/types.ts';

const [a, b] = (process.argv[2] ?? '1-4').split('-').map(Number);
const stage = process.argv[3] ?? '1-2';
const DT = 1 / 30;
export type ChainRun = { x0: number; caps: number; bounces: number[]; end: 'through' | 'stopped' | 'fell' | 'timeout'; stopAt?: string; gaps: number[] };
export function chainsOf(plats: Platform[]): Platform[][] {
  const bs = plats.filter((p) => p.type === 'bouncy').sort((p, q) => p.x - q.x);
  const out: Platform[][] = [];
  for (const m of bs) {
    const cur = out.at(-1);
    if (cur && m.x - cur.at(-1)!.x < 300 && m.x - cur.at(-1)!.x > 120) cur.push(m);
    else out.push([m]);
  }
  return out.filter((c) => c.length >= 2);
}
/** how the thumb plays it: 'held' right the whole way; 'off' lets go once the first bounce has thrown him (the teach line's hands-off);
 *  'hop<d>' taps a jump d px before the floor mushroom and holds right; 'tap<ms>' holds right and taps jump ms after every bounce (a
 *  player timing a jump on each cap: the bounce leaves him one jump in the air) */
export type Thumb = 'held' | 'off' | `hop${number}` | `tap${number}` | `one${number}`;
/** 'one<ms>': holds right and taps jump ONCE, ms after the first bounce (a stray or eager press mid-chain) */
export function flyChain(r: RealPlay, ch: Platform[], thumb: Thumb = 'held', back = Number(process.env.BACK ?? 160)): ChainRun {
  const m0 = ch[0];
  const floor = r.platforms.find((f) => f.type === 'solid' && Math.abs(f.y - (m0.y + m0.height)) <= 1 && f.x <= m0.x && f.x + f.width >= m0.x + m0.width)!;
  r.stand(Math.max(floor.x + 10, m0.x - back), floor.y);
  const lastX = ch.at(-1)!.x + ch.at(-1)!.width;
  const bounces: number[] = [];
  let prevVy = 0, end: ChainRun['end'] = 'timeout', stopAt: string | undefined;
  const gy = floor.y + 400;
  const hopAt = thumb.startsWith('hop') ? m0.x - Number(thumb.slice(3)) : NaN;
  let hopped = false;
  const tapMs = thumb.startsWith('tap') || thumb.startsWith('one') ? Number(thumb.slice(3)) / 1000 : NaN;
  const once = thumb.startsWith('one');
  const tapNow = () => bounces.length > 0 && (!once || bounces.length === 1) && Math.abs(r.t - bounces.at(-1)! - tapMs) < DT / 2;
  for (let i = 0; i < 30 * 12; i++) {
    const jump = !hopped && r.p.x >= hopAt;
    if (jump) hopped = true;
    r.frame({ right: thumb === 'off' ? bounces.length === 0 : true, ...(jump || tapNow() ? { press: true } : {}) });
    const p = r.p;
    if (p.vy < -300 && prevVy >= -50 && r.platforms.some((q) => q.type === 'bouncy' && Math.abs(q.y - p.y) < 40 && p.x > q.x - 30 && p.x < q.x + q.width + 30)) bounces.push(r.t);
    prevVy = p.vy;
    if (p.y > gy || r.died) { end = 'fell'; break; }
    if (p.x > lastX + 60 && p.grounded) { end = 'through'; break; }
    if (p.grounded && p.x > m0.x + m0.width + 20 && p.x < lastX + 60) {
      const on = r.platforms.find((q) => q.id === r.standingOn);
      if (on && on.type !== 'bouncy') {
        // (stood on wood in the chain: wait a moment, he may walk on to a cap)
        const k = ch.findIndex((c) => p.x < c.x + c.width + 80);
        stopAt = `wood before cap ${k}`;
        end = 'stopped';
        break;
      }
    }
  }
  const gaps = bounces.slice(1).map((t, i) => Math.round((t - bounces[i]) * 1000));
  return { x0: Math.round(m0.x), caps: ch.length, bounces, end, stopAt, gaps };
}
if (process.argv[1]?.endsWith('cadence.ts') && process.env.TOL) {
  // tolerance: per chain, the share of single stray presses (every frame from 0 to 760 ms after the first bounce) it still carries
  for (const setting of ['normal', 'easy'] as const) for (let v = a; v <= b; v++) {
    setDifficulty(setting);
    const r = new RealPlay(stage, v);
    const chs = chainsOf(r.platforms.slice());
    const row = chs.map((ch, i) => {
      let ok = 0, n = 0, wood = 0, fell = 0;
      for (let ms = 0; ms <= 760; ms += 33.3) { n++; const c = flyChain(r, ch, `one${Math.round(ms)}`); if (c.end === 'through') ok++; else if (c.end === 'fell') fell++; else wood++; }
      const caps = ch.slice(1).map((c) => c.width).join(',');
      return `#${i} caps ${caps}: carried ${ok}/${n} (wood ${wood}, fell ${fell})`;
    });
    console.log(`${setting} layout ${v}:\n  ` + row.join('\n  '));
    (r.e as unknown as { stop(): void }).stop();
  }
} else if (process.argv[1]?.endsWith('cadence.ts')) {
  for (const setting of ['normal', 'easy'] as const) {
    const thumbs = (process.env.THUMBS ?? 'held').split(',') as Thumb[];
    for (let v = a; v <= b; v++) {
      setDifficulty(setting);
      const r = new RealPlay(stage, v);
      for (const th of thumbs) {
        const rows = chainsOf(r.platforms.slice()).map((ch) => flyChain(r, ch, th));
        console.log(`${setting} layout ${v} ${th}: ` + rows.map((c, i) => `[#${i} ${c.caps}m ${c.end}${c.stopAt ? ' (' + c.stopAt + ')' : ''} ${c.gaps.join('/')}]`).join(' '));
      }
      (r.e as unknown as { stop(): void }).stop();
    }
  }
  setDifficulty('normal');
}
