/**
 * The hardness meter, PROTOTYPE (DIFF-ALGO, R-165.172; the design is reference/design/DIFFICULTY.md). Read-only: it builds each stage
 * the way the game builds it on entry (realPlay.ts: setDifficulty, then the engine's own build of the layout) and reads it. Nothing in
 * src/ imports it, it changes nothing, and it never runs on a phone (PERFORMANCE-RULES §1: the meter costs nothing at play time).
 *
 *   npx tsx tools/difficulty/score.ts [--stages 1-1,1-2,1-3] [--seeds 1-4] [--settings normal,easy] [--detail] [--json path]
 *   npx tsx tools/difficulty/score.ts --check        (the planted cases: the meter's own arithmetic, before its numbers are trusted)
 *
 * The unit is the BIT (Fitts 1954; MacKenzie 1992, ID = log2(D/W + 1)): how precise an input must be. A jump that needs half of what
 * the move can reach is 1 bit, three quarters 2 bits, 90% 3.3 bits. Each challenge on the route (a jump, a climb, a creature, a timed
 * hazard) gets its bits, then three multipliers: what a miss costs (STAKES, Juul 2009's punishment kinds), other threats at the same
 * moment (OVERLAP, dual-task interference: Wickens 2002), and how new the move still is (NOVELTY, the power law of practice: Newell &
 * Rosenbloom 1981). A stage's raw load is the mean of its average bits a minute and its hardest 30 s (the peak-end rule: Kahneman et
 * al. 1993 and Fredrickson & Kahneman 1993, people judge a stretch by its peak, not its length). One constant turns raw load into the
 * 0-100 meter: SCALE, set ONCE so that 1-1 on Normal (all seeds) reads Matt's 4 (11-12 8:31 PM ET). Nothing is tuned per stage.
 */
import { setDifficulty } from '../../src/game/difficulty.ts';
import { RealPlay } from '../../src/game/realPlay.ts';
import { modelStage, MODEL_TYPICAL } from '../../src/game/stageTime.ts';
import { PHYS } from '../../src/game/physics.ts';
import { findRoute, type Route } from '../inspect/route.ts';
import { findBeats, sampleRoute, type Sample } from '../inspect/beats.ts';
import { inspectJumps, routeJumps, ADULT, type JumpReport } from '../inspect/jumps.ts';
import fs from 'node:fs';

type Setting = 'normal' | 'easy';

/** what one move can reach, FLOWN in the real engine at 30 fps (reference/specs/reach.md §1, the table; ±2 px singles, ±3 px doubles) */
export const REACH = {
  single: { gap: { normal: 244, easy: 246 }, climb: 123 },
  double: { gap: { normal: 396, easy: 400 }, climb: 212 }, // the flick: what a thumb does (the hold reaches 409 / 214)
  bounce: { gap: { normal: 179, easy: 183 }, climb: 223 },
  bounceAir: { gap: { normal: 340, easy: 340 }, climb: 317 },
} as const;
/** his body is 44 px wide (jumps.ts WIDTH): a landing narrower than two bodies is an aimed landing (Mourato & dos Santos 2010) */
export const BODY = 44;
/** never more than 5 bits from one share: past 97% the jump is a bot's, not a player's (the floors in STAGE-RULES §1b stop it first) */
export const SHARE_CAP = 0.97;

/** Fitts's index of difficulty with the spare reach as the target: log2(need / spare + 1) = log2(1 / (1 - share)) */
export const fittsBits = (share: number): number => Math.log2(1 / (1 - Math.max(0, Math.min(SHARE_CAP, share))));
/** an aimed landing: one bit for each halving of the landing below two bodies (0 at 88 px or wider) */
export const landBits = (landW: number): number => Math.max(0, Math.log2((2 * BODY) / Math.max(BODY / 2, landW)));
/** a timed press inside a window (temporal pointing, Lee & Oulasvirta 2016): the share of the cycle that is open is the target */
export const windowBits = (cycle: number, open: number): number => Math.log2(1 + cycle / Math.max(0.05, open));

/**
 * What a miss costs (Juul 2009, "Fear of failing": the punishment kinds), as a multiplier on the bits. A miss that only means another
 * go (he lands below and walks back, or Easy's soft set-back) is 1; a heart and a set-back 1.25; a life (a pit, the water) 1.5, and
 * more the further back his last flag is: replay seconds / 240 more, to 2.0 at most (a 2-minute replay doubles the sting).
 */
export const STAKES = { retry: 1, soft: 1, heart: 1.25, life: 1.5, replayPerSec: 1 / 240, lifeMax: 2 } as const;
/** threats at the same moment: +50% for each OTHER threat within ±1.5 s (a creature at the landing, a gust in the jump) */
export const OVERLAP = { window: 1.5, each: 0.5, max: 2.5 };
/** the first times a move is asked count more: 1 + 0.5 / sqrt(1 + n), n = earlier times in the stages scored before it, in game order */
export const NOVELTY = { on: true };
export const novelty = (n: number): number => (NOVELTY.on ? 1 + 0.5 / Math.sqrt(1 + n) : 1);
/**
 * FREE: the first bit of every input is free. A move with at least half of its reach to spare (a 1 s window, a choice with no clock)
 * is what anybody does without thinking (Matt, 11-12: "running across and just doing simple things that a 9-year-old can do"); only
 * the bits past it are CHALLENGE. One rule for every stage, never tuned to one.
 */
export let FREE_BITS = 1;
/** the peak window (s), and how the raw load mixes the stage's average with its peak */
export const PEAK_WINDOW = 30;
export const MIX = { mean: 0.5, peak: 0.5 };

/** the reference second: a press window of 1 s is 1 bit (windowBits(1, 1)); a 0.5 s tell 1.58; the Normal floor's 167 ms 2.8 */
export const REF_S = 1;
/**
 * Things that are not a jump, each a timed press with its window (windowBits), read from the game's own numbers:
 * - a creature he must get past AWAKE: he has its tell to act (predators/core.ts tellOf: Normal the def's tell, Easy x def.easy.tell);
 *   World 1's snake: 0.5 s Normal, 0.65 s Easy (predators/world1.ts) = 1.58 / 1.34 bits;
 * - a creature ASLEEP, or one a drop trap clears from out of its reach (the trap's load lands within 160 px of it): a choice, no
 *   clock: 0.5 (he must see it and choose; 1-3's design: "Pokey does not have to fight");
 * - the second press of a double: any press 2-12 frames into the first jump climbs it (reach.md §1, the double row), a 333 ms window
 *   in the first jump's 0.5 s rise: windowBits(0.5, 0.333) = 1.32 bits;
 * - a vine climb: 0.25 (straight up always climbs, STAGE-RULES §1); a liana release: a 0.4 s window in a 1.6 s swing (2.32);
 * - a puzzle or a trap's handle: 0.5.
 */
export const OTHER_BITS = { choice: 0.5, second: windowBits(0.5, 0.333), climb: 0.25, swing: windowBits(1.6, 0.4), puzzle: 0.5 } as const;
export const creatureBits = (tellS: number): number => Math.log2(1 + REF_S / Math.max(0.05, tellS));

/** 1 is a free retry, 2 a soft set-back, 3 a heart and set-back, 4 a life */
type Cost = 'retry' | 'soft' | 'heart' | 'life';
export interface Challenge {
  t: number;
  x: number;
  kind: string;
  bits: number;
  cost: Cost;
  stakes: number;
  threat: boolean;
  overlap: number;
  novelty: number;
  points: number;
  note: string;
}

const median = (v: number[]) => {
  const s = [...v].sort((a, b) => a - b);
  return s.length ? (s.length % 2 ? s[s.length >> 1] : (s[(s.length >> 1) - 1] + s[s.length >> 1]) / 2) : 0;
};

/** the time on the route's movement clock nearest to x */
function clockAt(samples: Sample[], x: number, y: number): number {
  let best = samples[0], bd = Infinity;
  for (const q of samples) { const d = Math.abs(q.x - x) + Math.abs(q.y - y) * 0.5; if (d < bd) { bd = d; best = q; } }
  return best?.base ?? 0;
}

/**
 * what a miss at x costs on this stage, as the engine charges it: a hurt floor (a heart, or soft on Easy: gen2 heartFalls), a fall on
 * a stage the engine plays soft (engine.ts `softOn`: 1-1's brief on both settings, Easy off gen2) a set-back, the water or a pit a life,
 * else only another go (he lands below and walks back)
 */
function costAt(st: any, softOn: boolean, x0: number, x1: number, miss: JumpReport['miss']): Cost {
  const lo = Math.min(x0, x1), hi = Math.max(x0, x1);
  const hf = (st.heartFalls ?? []).find((h: any) => h.x0 <= hi && h.x1 >= lo);
  if (hf) return hf.soft ? 'soft' : 'heart';
  if (miss === 'fall') return softOn ? 'soft' : 'life';
  return 'retry';
}
/** seconds back to the last flag before x, at a run */
function replayAt(st: any, x: number): number {
  const flags = (st.checkpoints ?? []).map((c: any) => c.x).filter((fx: number) => fx <= x);
  const from = flags.length ? Math.max(...flags) : st.spawnX ?? 0;
  return Math.max(0, x - from) / PHYS.maxRun;
}
const stakesOf = (st: any, c: Cost, x: number): number =>
  c === 'life' ? Math.min(STAKES.lifeMax, STAKES.life + replayAt(st, x) * STAKES.replayPerSec) : STAKES[c];

/**
 * The way a player takes a route jump: the EASIEST move he has (a thumb picks the move that leaves it the most room), and its bits.
 * Share = what the jump asks of that move's flown reach: the inspector's own share where it flew that move (jumps.ts `reach`: it knows
 * the arc and the lip; it is the double's share where it doubled), else the larger of gap / widest gap and rise / highest climb.
 */
function moveOf(j: JumpReport, setting: Setting, bouncy: boolean): { move: string; share: number; bits: number } {
  const gap = Math.max(0, j.gap), rise = Math.max(0, j.rise);
  const shareOf = (m: keyof typeof REACH) => Math.max(gap / REACH[m].gap[setting], rise / REACH[m].climb);
  const ways: Array<{ move: string; share: number; bits: number }> = [];
  const way = (move: string, share: number, extra: number) => { if (share < 1) ways.push({ move, share, bits: fittsBits(share) + extra }); };
  if (bouncy) {
    way('bounce', shareOf('bounce'), 0);
    way('bounce+air', shareOf('bounceAir'), OTHER_BITS.second);
  }
  way('single', !j.dbl && !j.unflyable ? j.reach : shareOf('single'), 0);
  way('double', j.dbl && !j.unflyable ? j.reach : shareOf('double'), OTHER_BITS.second);
  if (!ways.length) return { move: 'beyond', share: 1, bits: fittsBits(1) + OTHER_BITS.second };
  return ways.sort((a, b) => a.bits - b.bits)[0];
}

/**
 * The meter's arithmetic on a stage's challenge list, pure (planted cases in --check): each challenge's points = its bits past the free
 * one x stakes x overlap x novelty; the stage's mean points a minute and its hardest PEAK_WINDOW s, as points a minute
 */
export function combine(out: Challenge[], minutes: number, seen: Map<string, number>): { points: number; mean: number; peak: number } {
  out.sort((a, b) => a.t - b.t);
  for (const c of out) {
    const others = out.filter((o) => o !== c && o.threat && Math.abs(o.t - c.t) <= OVERLAP.window).length;
    c.overlap = Math.min(OVERLAP.max, 1 + OVERLAP.each * others);
    const k = c.kind.replace('-choice', '');
    const n = seen.get(k) ?? 0;
    c.novelty = novelty(n);
    seen.set(k, n + 1);
    c.points = Math.max(0, c.bits - FREE_BITS) * c.stakes * c.overlap * c.novelty;
  }
  const points = out.reduce((s, c) => s + c.points, 0);
  const mean = points / Math.max(0.5, minutes);
  let peak = 0;
  for (const c of out) {
    const inWin = out.filter((o) => o.t >= c.t && o.t < c.t + PEAK_WINDOW).reduce((s, o) => s + o.points, 0);
    peak = Math.max(peak, inWin * (60 / PEAK_WINDOW));
  }
  return { points, mean, peak };
}
/** a stage's raw load: the peak-end mix of its mean and its peak */
export const rawOf = (mean: number, peak: number): number => MIX.mean * mean + MIX.peak * peak;

export interface StageScore {
  id: string; setting: Setting; seed: number; minutes: number; traced: Route['traced'];
  count: Record<string, number>; bits: number; points: number; mean: number; peak: number; raw: number;
  challenges: Challenge[];
}

/** one stage, one setting, one layout: its challenges and raw load (seen: earlier exposures by move kind, carried in game order) */
export function scoreStage(id: string, setting: Setting, seed: number, seen: Map<string, number>): StageScore {
  setDifficulty(setting);
  const rp = new RealPlay(id, seed);
  const st = rp.stage as any;
  const type: string = st.config.objectiveType;
  // (the route the inspector takes: straight to the shrine; on a stage whose goal is its animals, past each of them)
  const targets = type === 'purge' || type === 'gauntlet'
    ? st.enemies.filter((m: any) => m.type !== 'eagle').map((m: any) => ({ x: m.x, y: m.y }))
    : [];
  // (the meter's route steps onto humps, down stairs and into shallow dips: route.ts `steps`, S1)
  const route = findRoute(st, targets, { steps: true });
  const samples = sampleRoute(route);
  const br = findBeats(st, route, samples);
  // (the same reference thumb on both settings, so a setting's own softening is what moves its score: ADULT, jumps.ts)
  const jumps = inspectJumps(st, route, setting === 'easy', ADULT);
  const out: Challenge[] = [];
  const add = (c: Omit<Challenge, 'overlap' | 'novelty' | 'points'>) => out.push({ ...c, overlap: 1, novelty: 1, points: 0 });
  // (inspectJumps reports routeJumps' edges one for one, in order: jumps.ts inspectJumps, so each report has its take-off and landing)
  const edges = routeJumps(route);
  // (a World 1 gen2 pit is soft: a floor under it and steps back, w1.ts manifest `pit: 'soft'`; gen2/pipeline.ts budget.pit)
  const softPits = !!rp.e.softOn || st.gen2?.budget?.pit === 'soft';
  const live = st.platforms.filter((p: any) => !p.broken);
  jumps.forEach((j, i) => {
    const e: any = edges[i];
    // (the route steps onto a hump, down a stair and into a shallow dip itself, so every edge here is a real jump: route.ts stepBetween,
    // S1 11-13; this file corrected 1-2's humps and dips on its own until then)
    // (a mushroom launches him: the take-off is bouncy, or a cap or floor mushroom sits at the take-off's edge)
    const bouncy = !!e && (e.from.type === 'bouncy' || live.some((p: any) => p.type === 'bouncy' && Math.abs((e.dir === 1 ? p.x + p.width : p.x) - e.x) < 60 && Math.abs(p.y - e.from.y) <= 40));
    const { move, share, bits: moveBits } = moveOf(j, setting, bouncy);
    const bits = moveBits + landBits(j.landW);
    const span = e ? [e.dir === 1 ? e.x : e.to.x + e.to.width, e.dir === 1 ? e.to.x : e.x] : [j.x, j.x + j.gap];
    const cost = costAt(st, softPits, span[0], span[1], j.miss);
    add({ t: clockAt(samples, j.x, j.y), x: j.x, kind: move, bits, cost, stakes: stakesOf(st, cost, j.x), threat: false, note: `gap ${Math.round(j.gap)} rise ${Math.round(j.rise)} land ${Math.round(j.landW)} share ${share.toFixed(2)}` });
  });
  // (the stage's drop traps: a creature whose load lands within 160 px of it is cleared from out of its reach)
  const traps: Array<{ loadX: number }> = (rp.e.cast?.traps ?? []).map((tr: any) => tr.post);
  const members: Array<{ e: any; def: any }> = rp.e.cast?.members ?? [];
  for (const b of br.beats) {
    if (b.letter === 'C') {
      const asleep = /asleep/.test(b.what);
      const trapped = traps.some((tr) => Math.abs(tr.loadX - b.x) <= 160);
      const m = members.find((q) => Math.abs(q.e.x - b.x) < 200);
      const tell = m?.def?.tell ? m.def.tell * (setting === 'easy' ? Math.max(1, m.def.easy?.tell ?? 1) : 1) : 0.5;
      const timed = !asleep && !trapped;
      add({ t: b.t, x: b.x, kind: timed ? 'creature' : 'creature-choice', bits: timed ? creatureBits(tell) : OTHER_BITS.choice, cost: 'heart', stakes: STAKES.heart, threat: timed, note: `${b.what}${trapped ? ' (trap)' : ''} tell ${tell.toFixed(2)}s` });
    } else if (b.letter === 'Z') {
      const m = /safe ([\d.]+)s of ([\d.]+)s/.exec(b.what);
      add({ t: b.t, x: b.x, kind: 'hazard', bits: m ? windowBits(Number(m[2]), Number(m[1])) : 2, cost: 'heart', stakes: STAKES.heart, threat: true, note: b.what });
    } else if (b.letter === 'V') {
      const swing = /swing|liana/.test(b.what);
      add({ t: b.t, x: b.x, kind: swing ? 'swing' : 'climb', bits: swing ? OTHER_BITS.swing : OTHER_BITS.climb, cost: swing ? 'life' : 'retry', stakes: swing ? stakesOf(st, 'life', b.x) : 1, threat: false, note: b.what });
    } else if (b.letter === 'P') {
      add({ t: b.t, x: b.x, kind: 'puzzle', bits: OTHER_BITS.puzzle, cost: 'retry', stakes: 1, threat: false, note: b.what });
    }
  }
  // crumbling footing on the route: the clock is the crumble (a fragile platform he stands on): +1 bit on the jump that lands on it
  for (const c of out) {
    if (c.kind === 'creature' || c.kind === 'hazard') continue;
    const frag = st.platforms.some((p: any) => p.type === 'fragile' && c.x >= p.x - 40 && c.x <= p.x + p.width + 40);
    if (frag) { c.bits += 1; c.note += ' crumble'; }
  }
  // (the typical player's time, stageTime.ts; never under the route's own clock: the model reads about 1 s on 4-3, 11-12)
  const minutes = Math.max(modelStage(st, MODEL_TYPICAL).total, br.total) / 60;
  const { points, mean, peak } = combine(out, minutes, seen);
  const count: Record<string, number> = {};
  for (const c of out) count[c.kind] = (count[c.kind] ?? 0) + 1;
  return {
    id, setting, seed, minutes: Math.round(minutes * 100) / 100, traced: route.traced, count,
    bits: Math.round(out.reduce((s, c) => s + c.bits, 0) * 10) / 10, points: Math.round(points * 10) / 10,
    mean: Math.round(mean * 10) / 10, peak: Math.round(peak * 10) / 10, raw: rawOf(mean, peak), challenges: out,
  };
}

/** raw load to the 0-100 meter: SCALE is set once, from 1-1 on Normal reading 4 (Matt, 11-12 8:31 PM ET); --scale overrides it */
export const ANCHOR = { id: '1-1', setting: 'normal' as Setting, score: 4 };

function range(s: string): number[] {
  const out: number[] = [];
  for (const part of s.split(',')) {
    const [lo, hi] = part.split('-').map(Number);
    for (let i = lo; i <= (hi ?? lo); i++) out.push(i);
  }
  return out;
}

function check(): void {
  const eq = (a: number, b: number, what: string) => { if (Math.abs(a - b) > 1e-6) throw new Error(`check failed: ${what}: ${a} != ${b}`); };
  eq(fittsBits(0.5), 1, 'half the reach is 1 bit');
  eq(fittsBits(0.75), 2, 'three quarters is 2 bits');
  eq(fittsBits(2), Math.log2(1 / (1 - SHARE_CAP)), 'past the cap is the cap');
  eq(landBits(88), 0, 'two bodies wide is no aim');
  eq(landBits(44), 1, 'one body wide is one bit');
  eq(windowBits(3, 1), 2, 'a third of the cycle open is 2 bits');
  eq(novelty(0), 1.5, 'the first time counts half again');
  eq(novelty(3), 1.25, 'the fourth time a quarter');
  // (combine: a jump at 3 bits with an awake creature 1 s away is +50%; a creature alone 2 s later is not; the peak is the busy 30 s)
  const mk = (t: number, kind: string, bits: number, threat: boolean): Challenge => ({ t, x: t * 100, kind, bits, cost: 'retry', stakes: 1, threat, overlap: 1, novelty: 1, points: 0, note: '' });
  const keep = NOVELTY.on; NOVELTY.on = false;
  const list = [mk(10, 'single', 3, false), mk(11, 'creature', 2, true), mk(100, 'single', 2, false)];
  const r = combine(list, 2, new Map());
  NOVELTY.on = keep;
  eq(list[0].overlap, 1 + OVERLAP.each, 'a threat within 1.5 s raises the jump');
  eq(list[1].overlap, 1, 'a threat does not raise itself');
  eq(list[0].points, (3 - FREE_BITS) * (1 + OVERLAP.each), 'points are the bits past the free one, times overlap');
  eq(r.points, (3 - FREE_BITS) * (1 + OVERLAP.each) + (2 - FREE_BITS) + (2 - FREE_BITS), 'the stage sums its challenges');
  eq(r.mean, r.points / 2, 'mean is points a minute');
  eq(r.peak, ((3 - FREE_BITS) * (1 + OVERLAP.each) + (2 - FREE_BITS)) * 2, 'the peak is the busiest 30 s, a minute');
  console.log('check: 14 planted cases pass');
}

if (process.argv[1] && process.argv[1].endsWith('score.ts')) {
  const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
  if (process.argv.includes('--check')) { check(); process.exit(0); }
  // (the sensitivity runs: each of the meter's own constants moved, to show the anchors are not a knife-edge fit)
  if (arg('--free')) FREE_BITS = Number(arg('--free'));
  if (arg('--peak')) { MIX.peak = Number(arg('--peak')); MIX.mean = 1 - MIX.peak; }
  if (process.argv.includes('--no-novelty')) NOVELTY.on = false;
  if (arg('--overlap')) OVERLAP.each = Number(arg('--overlap'));
  const stages = (arg('--stages') ?? '1-1,1-2,1-3').split(',');
  const seeds = range(arg('--seeds') ?? '1-4');
  const settings = (arg('--settings') ?? 'normal,easy').split(',') as Setting[];
  const detail = process.argv.includes('--detail');
  const rows: StageScore[] = [];
  for (const setting of settings) {
    for (const seed of seeds) {
      // (novelty carries through the stages in game order, per setting and layout: a fresh player walks into 1-1 first)
      const seen = new Map<string, number>();
      for (const id of stages) {
        // (a stage the route or the build cannot do is named, not hidden: it scores nothing and says why)
        try { rows.push(scoreStage(id, setting, seed, seen)); } catch (err) { console.log(`${id} ${setting} seed ${seed}: NOT SCORED (${String(err).slice(0, 160)})`); }
      }
    }
  }
  const anchorRows = rows.filter((r) => r.id === ANCHOR.id && r.setting === ANCHOR.setting);
  const scale = Number(arg('--scale') ?? (anchorRows.length ? ANCHOR.score / median(anchorRows.map((r) => r.raw)) : NaN));
  const out = [] as Array<Record<string, unknown>>;
  for (const setting of settings) for (const id of stages) {
    const mine = rows.filter((r) => r.id === id && r.setting === setting);
    if (!mine.length) continue;
    const sc = mine.map((r) => r.raw * scale);
    const row = {
      id, setting, seeds: mine.length, score: Math.round(median(sc) * 10) / 10, min: Math.round(Math.min(...sc) * 10) / 10, max: Math.round(Math.max(...sc) * 10) / 10,
      minutes: median(mine.map((r) => r.minutes)), points: median(mine.map((r) => r.points)), mean: median(mine.map((r) => r.mean)), peak: median(mine.map((r) => r.peak)),
      count: mine[0]?.count, traced: [...new Set(mine.map((r) => r.traced))].join('/'),
    };
    out.push(row);
    console.log(`${id} ${setting.padEnd(6)} score ${String(row.score).padStart(5)} (${row.min}-${row.max} over ${row.seeds} layouts)  ${row.minutes} min  points ${row.points}  mean ${row.mean}/min  peak ${row.peak}/min  ${JSON.stringify(row.count)} route ${row.traced}`);
  }
  console.log(`SCALE ${scale.toFixed(5)} (1 meter point = ${(1 / scale).toFixed(1)} raw points a minute)`);
  if (detail) for (const r of rows.filter((x) => x.seed === seeds[0])) {
    console.log(`-- ${r.id} ${r.setting} seed ${r.seed}: the 12 heaviest challenges`);
    for (const c of [...r.challenges].sort((a, b) => b.points - a.points).slice(0, 12)) {
      console.log(`   t ${c.t.toFixed(0).padStart(4)}s x ${String(Math.round(c.x)).padStart(6)} ${c.kind.padEnd(16)} bits ${c.bits.toFixed(2)} x stakes ${c.stakes.toFixed(2)} (${c.cost}) x overlap ${c.overlap.toFixed(1)} x new ${c.novelty.toFixed(2)} = ${c.points.toFixed(2)}  ${c.note}`);
    }
  }
  const json = arg('--json');
  if (json) fs.writeFileSync(json, JSON.stringify({ scale, rows: out, runs: rows.map(({ challenges, ...r }) => r) }, null, 1));
}
