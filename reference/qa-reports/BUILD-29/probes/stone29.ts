/** BUILD-29-d: tools/engine/snapBand.ts (ENG-STONE29) at the court's own gaps (GAPS=62 / 92), out to ../flown/stone29-*.txt.
 *
 * snapBand — each snap-stone width's gap band, FLOWN on the real engine (ENG-STONE29, R-165.490; the way 2-5's was: DESIGN-24-25's
 * reference/specs/sims/snapClock.ts on t-design-24). Pokey is engine.ts at 30 fps (realPlay.ts) with the game's own InputEngine on it (a
 * tap's 80 ms minimum hold, the Pad source; never a FakeInput one-frame press, R-165.284). The stones are solid floors W px wide, G px of
 * water edge to edge, level with the banks.
 *
 * Two ways across, both a tap hop:
 *   HOP   2-5's: right held, a tap at the bank's lip, then a tap the frame he lands on each stone ("hop hop hop": snapClock.ts d 0). The
 *         80 px stone's way: its flown band 30-40 (rideLay.ts SNAP_FAIR.gap).
 *   BEAT  2-9's (BUILD-29's court29.ts RUN): right held from the run-up, a tap at the bank's lip (ONE), then a tap on every count of the
 *         row's bar (frame = round(k count / DT)): one stone a count. The wide stone's way.
 * A run is CLEAN when he stands on every floor in order (no skip, no swim) and reaches the far bank; a gap is in a width's band when every
 * row length (1, 3, 5) is clean. Read also: the frames he stands on each stone (the judge's model, rideLay.ts snapWindow) and, for BEAT,
 * the count of the bar his first tap may fall on (the bar started that many counts before: [1234] safe) in step and in the wave (stone i a
 * count LATER), as court29.ts reads it.
 *
 * Run: npx tsx tools/engine/snapBand.ts normal|easy [W] [count]   (count: the bar's Normal count, s; Easy stretches it x stretch)
 * Output: reference/qa-reports/ENG-STONE29/flown/snapBand-<setting>-<W>-<count>.txt
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { RealPlay, DT } from '../../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../../src/game/difficulty.ts';
import { InputEngine } from '../../../../src/game/inputEngine.ts';
import { brickNow } from '../../../../src/game/beatBrick.ts';
import { clockAt } from '../../../../src/game/clock.ts';
import type { ClockDef } from '../../../../src/game/stageKit.types.ts';
import type { Platform } from '../../../../src/game/types.ts';

const setting = (process.argv[2] ?? 'normal') as 'normal' | 'easy';
const W = Number(process.argv[3] ?? 130);
const COUNT = Number(process.argv[4] ?? 2.85 / 4);
const STRETCH = Number(process.env.STRETCH ?? 3.3 / 2.85);
const easy = setting === 'easy';
setDifficulty(setting);
const r = new RealPlay('2-5', 1);
const inp = new InputEngine();
inp.source = 'pad';
r.e.input = inp;
const FLOOR = 800, LIP = 2000;
let C = COUNT * (easy ? STRETCH : 1);

const jaws = (warn = 0.5): ClockDef =>
  ({ id: 'jaws', phases: [{ name: 'off', seconds: 3 * COUNT - warn }, { name: 'warn', seconds: warn }, { name: 'on', seconds: COUNT }], offset: 0, easyStretch: STRETCH }) as ClockDef;

function reset(pl: Platform[]) { r.bare(pl); inp.clearAll(); r.e.input = inp; }

function cross(style: 'HOP' | 'BEAT', w: number, g: number, n: number, d = 0) {
  const pl: Platform[] = [{ id: 1, x: 0, y: FLOOR, width: LIP, height: 200, type: 'solid' } as Platform];
  for (let i = 0; i < n; i++) pl.push({ id: 10 + i, x: LIP + g + i * (w + g), y: FLOOR, width: w, height: 40, type: 'solid' } as Platform);
  pl.push({ id: 2, x: LIP + g + n * (w + g), y: FLOOR, width: 3000, height: 200, type: 'solid' } as Platform);
  reset(pl);
  r.stand(LIP - (style === 'HOP' ? 160 : 200), FLOOR);
  inp.triggerTouchMove('right');
  const on: number[] = [];
  let f0 = -1, lift = -1, fell = false, lastBeat = 0, since = -1;
  for (let fr = 0; fr < 900; fr++) {
    const p = r.p;
    const idx = p.grounded ? pl.findIndex((q) => q.id === r.standingOn) : -1;
    const floor = idx >= 1 && idx <= n ? idx - 1 : idx === n + 1 ? n : -1;
    if (f0 < 0 && p.grounded && p.x > LIP - 30) { f0 = fr; inp.triggerTouchUp(0, 80); lift = fr + 2; }
    else if (f0 >= 0) {
      if (style === 'BEAT') {
        const k = Math.round(((fr - f0) * DT) / C);
        if (k > lastBeat && Math.abs((fr - f0) * DT - k * C) < DT / 2) { lastBeat = k; inp.triggerTouchUp(0, 80); lift = fr + 2; }
      } else {
        if (floor >= 0 && floor < n) { if (since < 0) since = 0; if (since === d) { inp.triggerTouchUp(0, 80); lift = fr + 2; } since++; } else if (!p.grounded) since = -1;
      }
    }
    if (f0 >= 0) on.push(floor);
    if (floor === n && f0 >= 0) break;
    if (fr === lift) inp.releaseTouchUp();
    r.e.update(DT);
    if (r.p.y > FLOOR + 100) { fell = true; break; }
  }
  const order: number[] = [];
  for (const i of on) if (i >= 0 && order[order.length - 1] !== i) order.push(i);
  const clean = !fell && order.join(',') === [...Array(n + 1).keys()].join(',');
  // the frames (from his first tap) he stands on each stone
  const feet: number[][] = Array.from({ length: n }, () => []);
  on.forEach((i, t) => { if (i >= 0 && i < n) feet[i].push(t); });
  // IN STEP WITH THE BAR (BEAT): he stands on stone i only between the tap on count i (his landing, a hop's air later) and the tap on
  // count i+1, in one spell (never two stones in one count, never off a stone and back on): one stone a count, every count
  const tapAt = (k: number) => Math.round((k * C) / DT);
  const locked = clean && feet.every((f, i) => f.length > 0 && f[f.length - 1] - f[0] === f.length - 1 && f[0] > tapAt(i) && f[f.length - 1] <= tapAt(i + 1) + 1);
  return { on, fell, clean, order, feet, locked };
}

/** safe from a bar started s0 frames before his first tap; shift: counts per stone (-1 = a count LATER) */
function safeAt(on: number[], n: number, s0: number, shift: number): boolean {
  const def = jaws();
  for (let t = 0; t < on.length; t++) {
    const i = on[t];
    if (i < 0 || i >= n) continue;
    if (brickNow('bites', clockAt(def, (s0 + t) * DT, easy, i * shift * COUNT)).hurts) return false;
  }
  return true;
}

const out: string[] = [`snapBand ${setting}: W ${W} px, the bar's count ${COUNT.toFixed(4)} s Normal (${C.toFixed(4)} s here, Easy x${STRETCH.toFixed(3)}); engine realPlay + InputEngine (Pad tap, 80 ms); ${new Date().toISOString()}`];
const say = (s: string) => { console.log(s); out.push(s); };
if (process.env.SWEEP) {
  // the wide stone's band against the bar: for each count, the gaps where the BEAT crossing is in step with the bar (one stone a count) at
  // every row length; read as the pitch (W + G, px) over the count (s): the run's own pace, the same at every count if the band is a pace
  for (const c of process.env.SWEEP.split(',').map(Number)) {
    C = c * (easy ? STRETCH : 1);
    const gs: number[] = [];
    for (let g = 20; g <= 200; g += Number(process.env.STEP ?? 5)) if ([1, 3, 5].every((n) => cross('BEAT', W, g, n).locked)) gs.push(g);
    const pace = gs.length ? `${Math.round((W + gs[0]) / C)}-${Math.round((W + gs[gs.length - 1]) / C)} px/s` : 'none';
    const runsOf = gs.reduce((a: number[][], g) => { const l = a[a.length - 1]; if (l && g - l[l.length - 1] <= Number(process.env.STEP ?? 5)) l.push(g); else a.push([g]); return a; }, []).map((l) => (l.length > 1 ? `${l[0]}-${l[l.length - 1]}` : `${l[0]}`));
    say(`SWEEP W${W} count ${c} (${C.toFixed(4)} s here): in step with the bar at G ${runsOf.join(', ') || 'none'}; pitch over count ${pace}`);
  }
} else for (const style of ['HOP', 'BEAT'] as const) {
  const band: number[] = [];
  for (const g of (process.env.GAPS ?? '62').split(',').map(Number)) {
    const runs = style === 'HOP' ? [1, 3, 5].flatMap((n) => [0, 2, 4].map((d) => cross(style, W, g, n, d))) : [1, 3, 5].map((n) => cross(style, W, g, n));
    // (in the band: he never swims, as snapClock.ts judged 2-5's; a skipped stone is named, and BEAT must also stand on every stone in order)
    const ok = runs.every((x) => !x.fell && (style === 'HOP' || x.clean));
    if (ok) band.push(g);
    let read = '';
    if (ok) {
      const five = style === 'HOP' ? runs[6] : runs[2];
      const feet = five.feet.map((f) => `${f[0]}-${f[f.length - 1]}`).join(' ');
      read = `feet (frames from his first tap) ${feet}`;
      if (style === 'BEAT') {
        const bar = Math.round((4 * C) / DT);
        const parts: string[] = [];
        for (const [name, shift] of [['in step', 0], ['wave', -1]] as const) for (const N of [2, 3, 5]) {
          const p = cross(style, W, g, N);
          const onK = [1, 2, 3, 4].map((k) => (safeAt(p.on, N, Math.round(((k - 1) * C) / DT), shift) ? `${k}` : '-')).join('');
          let s = 0; for (let s0 = 0; s0 < bar; s0++) if (safeAt(p.on, N, s0, shift)) s++;
          parts.push(`${name} x${N} [${onK}] ${Math.round((100 * s) / bar)}%`);
        }
        read += ` | first tap on count: ${parts.join('; ')}`;
      }
    }
    const skips = runs.filter((x) => !x.fell && !x.clean).length;
    const lock = style === 'BEAT' && ok ? (runs.every((x) => x.locked) ? ', IN STEP with the bar' : ', NOT in step with the bar (two stones in a count, or one off the beat)') : '';
    say(`${style} W${W} G${String(g).padStart(3)}: ${ok ? `CLEAN${lock}${skips ? ` (${skips} of ${runs.length} runs skip a stone)` : ''}` : `not clean (${runs.map((x, i) => (x.clean ? '' : `${style === 'HOP' ? `n${[1, 3, 5][Math.floor(i / 3)]} d${[0, 2, 4][i % 3]}` : `n${[1, 3, 5][i]}`} ${x.fell ? 'swam' : 'skipped'} ${x.order.join(',')}`)).filter(Boolean).join('; ')})`}${read ? ' | ' + read : ''}`);
  }
  say(`${style} W${W}: clean at G ${band.join(', ') || 'none'}`);
}
const dir = new URL('../flown/', import.meta.url);
mkdirSync(dir, { recursive: true });
writeFileSync(new URL(`stone29-${setting}-${W}-${process.env.SWEEP ? 'sweep' : COUNT.toFixed(4)}.txt`, dir), out.join('\n') + '\n');
