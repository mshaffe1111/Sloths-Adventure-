/**
 * touchReplay — the testers' recorded fingers (the Sloths control tests sheet, playRecorder.ts) played back through the touch rules
 * (src/game/touchGestures.ts), to count how often a clear gesture is misread, per player and per way the phone was held.
 *
 *   npx tsx tools/qa/touchReplay.ts <decoded.json> [since=2026-10-23]   (the day the recordings arrived)
 *
 * <decoded.json> is the sheet's Sessions rows decoded (gz64 → the log lines): [{ who, session, part, device, build, lines }].
 * Fetch the sheet with the Sheets connector and decode it with tools/qa/touchReplayDecode.py; the decoded file stays out of git.
 *
 * Only the recogniser is replayed: what the game told it (in the air, on a vine, a swing, a rope) comes from Pokey's recorded state at
 * that moment ('p' lines), so a gesture is judged in the situation the tester was really in. Jump help and the refined rules are on (the
 * defaults); nothing is near enough to kick (the recordings do not say, and most flicks have nothing near).
 *
 * What it counts (each finger, from down to up, is one touch; its best flick is its quickest rise from a low point within 150 ms):
 *   - ground flicks: Pokey on the ground, a touch whose flick rose 18 px or more at 0.4 px/ms or faster, at least 1.2x as far up as
 *     across, and that lifted within 150 ms of the rise ending. "Clear" ones rose 34 px or more (the old jump distance), "short" 18 to 34.
 *     A clear one may stay on the glass afterwards (a steering thumb's flick); a short one must lift. A second finger's flick must start
 *     within 250 ms of it going down. A miss is no jump from that touch;
 *     a punch is the worst miss.
 *   - false jumps: Pokey on the ground, a touch that never rose 12 px within 150 ms (a tap, a steer, a wobble), and it jumped.
 *   - vine strokes: Pokey on a trunk or a liana, a touch that rose 34 px or more. One with a quick flick anywhere in it (28 to 60 degrees
 *     over at 0.6 px/ms or faster, or 22 to 60 at 1 px/ms or faster: the polish report's CT-3 envelope) should let go; one without, whose
 *     best rise is within 15 degrees of vertical (straight) or 15 to 28 slower than 1 px/ms (slanted), should only climb. A second finger's straight stroke is counted apart (CT-5 waits for Matt's call).
 *   - second jumps: a touch that fired two jumps; how many of the second came off a rise slower than 0.3 px/ms (a thumb drifting, CT-24).
 *   - rests: a second finger held still half a second or more (a resting thumb): how many threw a mega, and how many of the flicks up
 *     that the same finger then made did not jump.
 */
import { readFileSync } from 'node:fs';
import { TouchGestures, TUNING, type GestureSink } from '../../src/game/touchGestures.ts';

type Line = (string | number)[];
interface Row { arrived: string; who: string; session: string; part: number; device: string; build: string; lines: Line[] }

const file = process.argv[2];
const since = process.argv[3] ?? '2026-10-23';
/** the day each recording arrived is what counts (testers kept playing older builds) */
if (!file) throw new Error('usage: touchReplay.ts <decoded.json> [since]');
const rows: Row[] = JSON.parse(readFileSync(file, 'utf8'));
/** TUNE='{"vineLeapDeg":26}' tries other numbers in the touch rules (for tuning by replay) */
if (process.env.TUNE) Object.assign(TUNING, JSON.parse(process.env.TUNE));

const PLAYERS = ['Mike', 'yana', 'Cheddarbob', 'Jane', 'Steph', 'Matt', 'Sasa', 'Sally', 'Jen'];
const nameOf = (w: string) => {
  const s = w.trim();
  const hit = PLAYERS.find((p) => s.toLowerCase().startsWith(p.toLowerCase()));
  return hit ?? 'others';
};

interface Sample { t: number; x: number; y: number }
interface Touch {
  id: number;
  pts: Sample[];
  up?: number;
  cancelled?: boolean;
  /** decisions the replayed rules made for this finger */
  did: string[];
  /** when each of its jumps fired */
  jt: number[];
  /** Pokey's state when it went down, and at its best flick */
  st0: string;
  held: 'portrait' | 'landscape';
  who: string;
  /** it went down while another finger was down */
  second: boolean;
}

/** its best flick: the biggest rise from a low point within 150 ms, with how fast, how far across and when it ended */
function bestFlick(pts: Sample[]): { rise: number; across: number; ms: number; tEnd: number; tStart: number; lowI: number; endI: number } {
  let best = { rise: 0, across: 0, ms: 1, tEnd: 0, tStart: 0, lowI: 0, endI: 0 };
  for (let j = 1; j < pts.length; j++) {
    for (let i = j - 1; i >= 0 && pts[j].t - pts[i].t <= 150; i--) {
      const rise = pts[i].y - pts[j].y;
      if (rise > best.rise) best = { rise, across: pts[j].x - pts[i].x, ms: Math.max(1, pts[j].t - pts[i].t), tEnd: pts[j].t, tStart: pts[i].t, lowI: i, endI: j };
    }
  }
  return best;
}

const sessions = new Map<string, Row[]>();
for (const r of rows) {
  if ((r.arrived ?? '') < since) continue;
  const k = `${r.who}|${r.session}`;
  if (!sessions.has(k)) sessions.set(k, []);
  sessions.get(k)!.push(r);
}

const touches: Touch[] = [];
for (const parts of sessions.values()) {
  parts.sort((a, b) => a.part - b.part);
  const who = nameOf(parts[0].who);
  const lines = parts.flatMap((p) => p.lines.map((l) => ({ l, dev: p.device }))).sort((a, b) => (a.l[1] as number) - (b.l[1] as number));
  const devOf = (dev: string) => {
    const m = /(\d+)x(\d+)\s+(portrait|landscape)/.exec(dev);
    return m ? { w: Number(m[1]), held: m[3] as 'portrait' | 'landscape' } : { w: 400, held: 'portrait' as const };
  };
  let dev = devOf(parts[0].device);
  let state = 'g';
  let jumpsSinceGround = 0;
  let current: Touch | null = null;
  const live = new Map<number, Touch>();
  const sink: GestureSink = {
    move: (d) => current?.did.push(`move:${d}`),
    duck: (on) => current?.did.push(on ? 'duck' : 'duckOff'),
    jumpPress: () => {
      jumpsSinceGround++;
      if (onVineNow()) current?.did.push('jumpV');
      else current?.did.push('jump');
      current?.jt.push(clockT);
      vineHold = '';
    },
    jumpRelease: () => {},
    punch: () => current?.did.push('punch'),
    kick: () => current?.did.push('kick'),
    mega: () => current?.did.push('mega'),
    climb: (d) => current?.did.push(`climb:${d}`),
    feedback: () => {},
  };
  // the state is the recording's, and the old live rules sometimes let go of a vine where the replayed ones would not: while a finger that
  // went down on the vine is still down and the replayed rules have not let go, he is still on it ('c' or 's'; '' when not held)
  let vineHold = '';
  let clockT = 0;
  const onVineNow = () => state === 'c' || state === 's' || vineHold !== '';
  const g = new TouchGestures(sink, () => dev.w, {
    assist: () => true,
    air: () => state === 'a' && jumpsSinceGround < 2,
    megaReady: () => true,
    refined: () => true,
    kickNear: () => false,
    onVine: onVineNow,
    onSwing: () => (vineHold || state) === 's',
    onRope: () => state === 'h',
    inCover: () => false,
  });
  let nextTick = 0;
  for (const { l, dev: d } of lines) {
    const t = l[1] as number;
    clockT = t;
    // the 30 ms clock that drives holds and undecided fingers (TouchController.tsx)
    while (g.active && nextTick <= t) {
      // (a tick's decision belongs to the undecided or second finger: the steering one only acts on its own moves)
      const others = [...live.values()].filter((q) => q.second || live.size === 1);
      current = others[others.length - 1] ?? null;
      g.tick(nextTick);
      nextTick += 30;
    }
    if (!g.active) nextTick = t + 30;
    if (l[0] === 'p') {
      const s = String(l[6]).charAt(0);
      if (s === 'g' || s === 'c' || s === 's' || s === 'h' || s === 'k') jumpsSinceGround = 0;
      state = s === 'k' ? 'g' : s;
      continue;
    }
    if (l[0] !== 'd' && l[0] !== 'm' && l[0] !== 'u' && l[0] !== 'c') continue;
    const id = l[2] as number;
    if (l[0] === 'd') {
      dev = devOf(d);
      if (state === 'c' || state === 's') vineHold = state;
      const tch: Touch = { id, pts: [{ t, x: l[3] as number, y: l[4] as number }], did: [], jt: [], st0: vineHold || state, held: dev.held, who, second: live.size > 0 };
      live.set(id, tch);
      touches.push(tch);
      current = tch;
      g.down(id, l[3] as number, l[4] as number, t);
      continue;
    }
    const tch = live.get(id);
    current = tch ?? null;
    if (l[0] === 'm') {
      tch?.pts.push({ t, x: l[3] as number, y: l[4] as number });
      g.move(id, l[3] as number, l[4] as number, t);
    } else if (l[0] === 'u') {
      if (tch) {
        tch.pts.push({ t, x: l[3] as number, y: l[4] as number });
        tch.up = t;
      }
      g.up(id, l[3] as number, l[4] as number, t);
      live.delete(id);
      if (live.size === 0) vineHold = '';
    } else {
      if (tch) tch.cancelled = true;
      g.cancelFinger(id, t);
      live.delete(id);
      if (live.size === 0) vineHold = '';
    }
  }
}

// ───────────────────────────── counting ─────────────────────────────

interface Tally { n: number; miss: number; punch: number }
const tally = () => ({ n: 0, miss: 0, punch: 0 });
const groups = new Map<string, Record<string, Tally>>();
/** DUMP=<category> (clear, short, vStraight, vSlant, vFlick, rest, restFlick) prints that category's misses, to look at */
const dump = process.env.DUMP;
let dumped = 0;
const bump = (key: string, cat: string, miss: boolean, punch: boolean, tc?: Touch) => {
  if (tc && key === 'all' && cat === dump && (process.env.DUMP_OK ? !miss : miss) && dumped++ < Number(process.env.DUMP_N ?? 12)) {
    const p0 = tc.pts[0];
    const path = tc.pts.map((p) => `${Math.round(p.t - p0.t)}:${Math.round(p.x - p0.x)},${Math.round(p.y - p0.y)}`).join(' ');
    console.log(`[${cat}] ${tc.who} ${tc.held} st=${tc.st0} second=${tc.second} did=${tc.did.join(',')} | ${path}`);
  }
  if (!groups.has(key)) groups.set(key, {});
  const g = groups.get(key)!;
  g[cat] ??= tally();
  g[cat].n++;
  if (miss) g[cat].miss++;
  if (punch) g[cat].punch++;
  // every clear gesture together: one number per player and grip (the watch columns, false jumps and CT-5, stay out)
  if (ANY.has(cat)) {
    g.any ??= tally();
    g.any.n++;
    if (miss) g.any.miss++;
  }
};
const ANY = new Set(['clear', 'short', 'vStraight', 'vSlant', 'vFlick', 'rest']);

for (const tc of touches) {
  if (tc.cancelled || tc.up === undefined) continue;
  const f = bestFlick(tc.pts);
  const speed = f.rise / f.ms;
  const keys = ['all', tc.who, tc.held, `${tc.who} ${tc.held}`];
  const jumped = tc.did.includes('jump') || tc.did.includes('jumpV');
  const letGo = tc.did.includes('jumpV');
  const punched = tc.did.includes('punch');
  const ground = tc.st0 === 'g';
  const vine = tc.st0 === 'c' || tc.st0 === 's';
  // ground flicks
  // (a clear one may stay on the glass, as a steering thumb's flick does; a short one must lift, or it is a wobble while steering)
  const lifted = tc.up - f.tEnd <= 150;
  // (a second finger's flick counts only near its start: one that dragged 150 px sideways first and rose a second later is no clear flick)
  const early = !tc.second || f.tStart - tc.pts[0].t <= 250;
  if (ground && early && f.rise >= 18 && speed >= 0.4 && f.rise >= Math.abs(f.across) * 1.2 && (f.rise >= 34 || lifted)) {
    const cat = f.rise >= 34 ? 'clear' : 'short';
    for (const k of keys) bump(k, cat, !jumped, punched, tc);
  }
  // a jump nobody flicked for: Pokey on the ground, a touch that never rose 12 px within 150 ms (a tap, a steer, a wobble) that jumped
  if (ground && early && f.rise < 12) {
    for (const k of keys) bump(k, 'falseJump', jumped, false, tc);
  }
  // vine strokes: a touch with a quick flick up and over anywhere in it should let go; one whose strokes are all straighter or slower
  // should only climb. A second finger's straight flick is counted on its own (CT-5, Matt's call)
  if (vine && f.rise >= 34) {
    const t28 = Math.tan((28 * Math.PI) / 180), t60 = Math.tan((60 * Math.PI) / 180), t15 = Math.tan((15 * Math.PI) / 180), t22 = Math.tan((22 * Math.PI) / 180);
    const pts = tc.pts;
    let flick = false;
    for (let j = 1; j < pts.length && !flick; j++) {
      for (let i = j - 1; i >= 0 && pts[j].t - pts[i].t <= 150; i--) {
        const rise = pts[i].y - pts[j].y, ax = Math.abs(pts[j].x - pts[i].x);
        const v = rise / Math.max(1, pts[j].t - pts[i].t);
        if (rise >= 34 && ax < rise * t60 && ((v >= 0.6 && ax >= rise * t28) || (v >= 1.0 && ax >= rise * t22))) {
          flick = true;
          break;
        }
      }
    }
    const slant = Math.abs(f.across) / f.rise; // the best rise's tan of the angle off vertical
    const cat = flick ? 'vFlick' : slant < t15 ? (tc.second ? 'vStraight2' : 'vStraight') : slant < t28 && speed < 1.0 ? 'vSlant' : '';
    if (cat) {
      // a straight or slanted climbing stroke "misses" when it let go; a quick flick when it did not
      const miss = cat === 'vFlick' ? !letGo : letGo;
      for (const k of keys) bump(k, cat, miss, false, tc);
    }
  }
  // a second jump from the same touch: was the rise that fired it quick (a wiggle or a flick on purpose) or slow (a thumb drifting)?
  if (tc.jt.length >= 2) {
    const t2 = tc.jt[1];
    const pts = tc.pts.filter((q) => q.t <= t2 && q.t >= t2 - 150);
    let lo = pts[0];
    for (const q of pts) if (q.y >= (lo?.y ?? -Infinity)) lo = q;
    const end = tc.pts.filter((q) => q.t <= t2).pop();
    const v = lo && end ? (lo.y - end.y) / Math.max(1, end.t - lo.t) : 0;
    for (const k of keys) bump(k, 'dbl', v < 0.3, false, tc);
  }
  // a resting second finger (still for 460 ms or more before it moved)
  if (tc.second) {
    const p0 = tc.pts[0];
    let still = 0;
    for (const p of tc.pts) {
      if (Math.hypot(p.x - p0.x, p.y - p0.y) > 20) break;
      still = p.t - p0.t;
    }
    if (tc.up - p0.t >= 460 && still >= 460) {
      const flickAfter = f.tStart - p0.t >= 400 && f.rise >= 30 && speed >= 0.3 && f.rise >= Math.abs(f.across) * 1.2;
      for (const k of keys) {
        bump(k, 'rest', tc.did.includes('mega'), false, tc);
        if (flickAfter) bump(k, 'restFlick', !jumped, false, tc);
      }
    }
  }
}

const pct = (t?: Tally) => (t && t.n ? `${((100 * t.miss) / t.n).toFixed(1)}% (${t.miss}/${t.n})` : '-');
const order = ['all', ...PLAYERS, 'others', 'portrait', 'landscape'];
console.log(`Replay of the control tests sheet, recordings from ${since}: ${sessions.size} sessions, ${touches.length} touches\n`);
console.log('| who | ground flicks, clear (missed) | ground flicks, short (missed) | punched instead | never rose 12 px, but jumped | vine straight climb (let go) | vine slanted climb (let go) | vine quick flick (did not let go) | vine, second thumb straight (let go; CT-5) | rests that threw a mega | flick after a rest (no jump) | second jumps from one touch (on a slow rise) |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const k of order) {
  const g = groups.get(k);
  if (!g) continue;
  const punch = (g.clear?.punch ?? 0) + (g.short?.punch ?? 0);
  const fl = (g.clear?.n ?? 0) + (g.short?.n ?? 0);
  console.log(`| ${k} | ${pct(g.clear)} | ${pct(g.short)} | ${fl ? `${punch}/${fl}` : '-'} | ${pct(g.falseJump)} | ${pct(g.vStraight)} | ${pct(g.vSlant)} | ${pct(g.vFlick)} | ${pct(g.vStraight2)} | ${pct(g.rest)} | ${pct(g.restFlick)} | ${pct(g.dbl)} |`);
}
console.log('\nBy player and how the phone was held: every clear gesture misread (ground flicks clear and short, the three vine kinds, rests)\n');
console.log('| who | portrait | landscape | both |');
console.log('|---|---|---|---|');
for (const k of ['all', ...PLAYERS, 'others']) {
  const cell = (key: string) => pct(groups.get(key)?.any);
  console.log(`| ${k} | ${cell(k === 'all' ? 'portrait' : `${k} portrait`)} | ${cell(k === 'all' ? 'landscape' : `${k} landscape`)} | ${cell(k)} |`);
}
