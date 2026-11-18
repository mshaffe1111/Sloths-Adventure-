/**
 * flood28 — 2-8's flood against the line's walk home, flown (DESIGN-26-28, level.md rule 24). Pokey is engine.ts at 30 fps (realPlay.ts) with
 * the game's InputEngine (an 80 ms tap, R-165.284). The little ones are 2-3's follow.ts CONTRACT (reference/design/2-3.md on t-design-23:
 * FOLLOW = { pace: { normal: 190, easy: 230 }, gap: 34, rejoin: 60 }; each walks HIS recorded path (arclength of his feet), at most `pace`,
 * never closer than `gap` to the one ahead; over splash-back water it keeps its trail and paddles at the same pace; deep water is a wall it
 * waits at, as at a climb's foot), written here as pure steps on his real path, as follow23.ts did. No follow.ts exists on main yet.
 * The home leg runs LEFT in the game; it is flown as a right run (a left leg is a right leg mirrored: legs.ts).
 *
 * The road home, from the turn at the last cage (beat 5) (px): PRE: the low path home (beat 6, three shallow dips he taps over, 100 px of
 * water each, on 1,400 px) and the rest before the fork (600 px); then the FORK: LOW = 1,400 px of marsh path with four dips (100 px each,
 * the four that the flood turns deep), or HIGH = three carved steps up (60 px each), 2,200 px of porches, three steps down (the long dry
 * way, its own px read off his path); then the rest of the way (POST, 1,000 px) to the boardwalk.
 * His lead (the 2-3 lesson, "keep them close"): run; stop when the tail is LAG px behind; go again when it is within BUNCH px.
 * The line starts bunched behind him at the turn (the turn-about: Pushback 3 in 2-8.md). DAWDLE d: he stands d s at the turn first.
 *
 * Reads, per setting: the trigger-to-tail-off-the-low-road time (prompt and dawdles), the same over the high road, the time to home;
 * then, for a flood that turns the low road deep at T_CLOSE, which little ones are in its water (set on the near bank, never lost) and
 * what fetching them costs (he goes back round by the high road and leads them over it).
 * Run (from a checkout of origin/main): npx tsx reference/specs/sims/flood28.ts [normal|easy] > reference/specs/sims/out/flood28-<setting>.txt
 */
import { RealPlay, DT } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { InputEngine } from '../../../src/game/inputEngine.ts';
import type { Platform } from '../../../src/game/types.ts';

const setting = (process.argv[2] ?? 'normal') as 'normal' | 'easy';
setDifficulty(setting);
const easy = setting === 'easy';
const FOLLOW = { pace: easy ? 230 : 190, gap: 34, rejoin: 60 };
const N = easy ? 5 : 7; // little ones home (Normal 7: w2Stages.ts:46's ask; Easy 5: goals EASY_SHARE 0.65 x 7 = 4.55, rounded: 2-8.md)
const BUNCH = N * 34 + 30, LAG = BUNCH + 200; // go when the line is bunched (its length + 30 px), stop when it has stretched 200 px more
const Y = 800, X0 = 1000;
const HIGH_RUN = 2200, POST = 1000;

const r = new RealPlay('2-8', 1);
const inp = new InputEngine();
inp.source = 'pad';
r.e.input = inp;

type Dip = { x0: number; x1: number; low: boolean };
function road(high: boolean) {
  const pl: Platform[] = [];
  const dips: Dip[] = [];
  let id = 10, x = 0;
  const ground = (w: number, y = Y) => { pl.push({ id: id++, x, y, width: w, height: 200, type: 'solid' } as Platform); x += w; };
  const dip = (low: boolean) => { dips.push({ x0: x, x1: x + 100, low }); x += 100; };
  ground(X0 + 300);
  for (let i = 0; i < 3; i++) { ground(i ? 330 : 100); dip(false); } // beat 6: three dips on 1,400 px
  ground(1400 - 100 - 3 * 100 - 2 * 330 + 600); // the rest of beat 6 and the rest before the fork
  const forkX = x;
  if (!high) { for (let i = 0; i < 4; i++) { ground(i ? 233 : 100); dip(true); } ground(1400 - 100 - 4 * 100 - 3 * 233); }
  else {
    for (let s = 1; s <= 3; s++) ground(s === 1 ? 100 : 80, Y - 60 * (s - 1)); // steps up (each 60 px: a hop)
    ground(HIGH_RUN, Y - 180);
    for (let s = 2; s >= 0; s--) ground(80, Y - 60 * s);
  }
  const joinX = x;
  ground(POST + 3000);
  pl.push({ id: 3, x: 0, y: Y + 160, width: 40000, height: 200, type: 'solid' } as Platform); // the water's bed (shallow: splash-back)
  r.bare(pl);
  inp.clearAll(); r.e.input = inp;
  return { dips, forkX, joinX, homeX: joinX + POST };
}

interface F { s: number; set: boolean }
function run(high: boolean, dawdle: number, tClose: number) {
  const { dips, forkX, joinX, homeX } = road(high);
  r.stand(X0, Y); r.e.update(DT);
  const trail: Array<{ x: number; y: number; s: number }> = [];
  for (let i = N * FOLLOW.gap + 40; i > 0; i -= 4) trail.push({ x: X0 - i, y: Y, s: 0 });
  trail.push({ x: X0, y: Y, s: 0 });
  for (let i = 1; i < trail.length; i++) trail[i].s = trail[i - 1].s + Math.hypot(trail[i].x - trail[i - 1].x, trail[i].y - trail[i - 1].y);
  const sHim = () => trail[trail.length - 1].s;
  const xAt = (s: number) => { let lo = 0, hi = trail.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (trail[m].s <= s) lo = m; else hi = m - 1; } return trail[lo].x; };
  const line: F[] = [];
  for (let i = 0; i < N; i++) line.push({ s: sHim() - FOLLOW.gap * (i + 1), set: false });
  let t = 0, going = false, tailOffLow = NaN, tailHome = NaN, setBack = 0, tailAtFork = NaN;
  const lowEnd = high ? NaN : dips.filter((d) => d.low).slice(-1)[0].x1;
  for (let k = 0; k < Math.round(120 / DT); k++) {
    t = k * DT;
    const p = r.p;
    // his lead
    const tailX = xAt(line[N - 1].s);
    if (t >= dawdle) {
      const lag = p.x - tailX;
      if (!going && lag <= BUNCH) { going = true; inp.triggerTouchMove('right'); }
      else if (going && lag >= LAG) { going = false; inp.triggerTouchMove('none'); }
      if (p.x >= homeX + N * FOLLOW.gap + 120) { going = false; inp.triggerTouchMove('none'); }
      // a hop at every lip ahead (a dip's near edge or a step's face) when he is running
      const lip = dips.some((d) => p.x > d.x0 - 30 && p.x < d.x0 - 8);
      const step = r.e.platforms.some((q: Platform) => q.x > p.x + 4 && q.x < p.x + 36 && q.y < p.y - 10 && q.y > p.y - 120); // a step's face ahead
      if (going && p.grounded && (lip || step)) { inp.triggerTouchUp(0, 80); r.e.update(DT); r.e.update(DT); inp.releaseTouchUp(); }
    }
    r.e.update(DT);
    // his trail (his feet whenever he moved)
    const last = trail[trail.length - 1];
    const d = Math.hypot(r.p.x - last.x, r.p.y - last.y);
    if (d > 0.5) trail.push({ x: r.p.x, y: r.p.y, s: last.s + d });
    // the line (the contract): at most pace, never closer than gap to the one ahead; deep water is a wall
    for (let i = 0; i < N; i++) {
      const f = line[i];
      if (f.set) { if (Math.abs(r.p.x - xAt(f.s)) <= FOLLOW.rejoin) f.set = false; else continue; }
      const ahead = i ? line[i - 1].s : sHim();
      let to = Math.min(ahead - FOLLOW.gap, f.s + FOLLOW.pace * DT);
      if (t >= tClose) {
        // the low road is deep: nobody steps into its water; one already in it is set on its near bank (never lost)
        const fx = xAt(f.s);
        const inDeep = dips.find((dd) => dd.low && fx > dd.x0 && fx < dd.x1);
        if (inDeep) { while (f.s > 0 && xAt(f.s) > forkX - 10) f.s -= 4; f.set = true; setBack++; continue; }
        const nextDeep = dips.find((dd) => dd.low && dd.x0 >= fx);
        if (nextDeep && xAt(to) > nextDeep.x0 - 4) to = f.s;
      }
      if (to > f.s) f.s = to;
    }
    const tx = xAt(line[N - 1].s);
    if (process.env.TRACE && k % 90 === 0) console.log(k, Math.round(r.p.x), Math.round(r.p.y), r.p.grounded, r.standingOn, going, Math.round(tx), Math.round(sHim()));
    if (Number.isNaN(tailAtFork) && tx > forkX) tailAtFork = t;
    if (Number.isNaN(tailOffLow) && !high && tx > lowEnd) tailOffLow = t;
    if (high && Number.isNaN(tailOffLow) && tx > joinX) tailOffLow = t;
    if (Number.isNaN(tailHome) && tx > homeX) { tailHome = t; break; }
  }
  inp.triggerTouchMove('none');
  const lowEndX = high ? joinX : lowEnd;
  return { tailAtFork: +tailAtFork.toFixed(1), tailOffLow: +tailOffLow.toFixed(1), tailHome: +tailHome.toFixed(1), setBack, waiting: line.filter((f) => xAt(f.s) < lowEndX).length };
}

console.log(`flood28 ${setting}: ${N} little ones, pace ${FOLLOW.pace}, gap ${FOLLOW.gap}; he runs, stops at a ${LAG} px lag (him to the tail), goes at ${BUNCH}`);
console.log('road | dawdle s | tail at the fork s | tail off the fork road s (from the turn) | tail home s');
if (process.env.TRACE) { console.log(run(false, 0, 1e9), run(true, 0, 1e9)); process.exit(0); }
const P = run(false, 0, 1e9);
for (const d of [0, 3, 6, 9, 12]) { const o = run(false, d, 1e9); console.log(`low | ${d} | ${o.tailAtFork} | ${o.tailOffLow} | ${o.tailHome}`); }
for (const d of [0, 6]) { const o = run(true, d, 1e9); console.log(`high | ${d} | ${o.tailAtFork} | ${o.tailOffLow} | ${o.tailHome}`); }
const margin = easy ? 8 : 4;
const tClose = Math.ceil(P.tailOffLow + margin);
console.log(`\nT_CLOSE = prompt tail off the low road ${P.tailOffLow} s + ${margin} s margin = ${tClose} s from the turn (the flood's trigger)`);
console.log('dawdle s | set on the near bank (in its water when it turned deep) | left short of the low road\'s end (waiting at the wall) | tail home s');
for (const d of [0, 2, 4, 6, 8, 10, 12]) { const o = run(false, d, tClose); console.log(`${d} | ${o.setBack} | ${o.waiting} | ${o.tailHome}`); }
const hi = run(true, 0, 1e9), lo = run(false, 0, 1e9);
console.log(`\nfetching them (he is home; they wait at the low road\'s near bank): back round the high road and lead them over it = his run back (${2560 + POST} px at 272 px/s, bank run flown in river27: ${((2560 + POST) / 272).toFixed(1)} s) + the line over the high road from the fork (${(hi.tailHome - hi.tailAtFork).toFixed(1)} s) vs the low road from the fork (${(lo.tailHome - lo.tailAtFork).toFixed(1)} s)`);
