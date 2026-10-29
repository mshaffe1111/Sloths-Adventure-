/**
 * Stage inspector, slice 1 (a development tool: never shipped, nothing in src/ imports it, and it only reads src/game).
 *
 *   npx tsx tools/inspect/inspect.ts --worlds 1-5 [--seed 1] [--html path/to/report.html] [--stages 1-7,2-2]
 *   npx tsx tools/inspect/inspect.ts --worlds 1-4 --firsttimer [--ft-trials 2] [--ft-windows 12]   (the pre-QA pass: firsttimerReport.ts)
 *
 * For every stage of the worlds asked for it traces the main route from the spawn to the shrine (route.ts), lists the active beats
 * along it (beats.ts), and measures dead time, rests, how alike the stages of a world are, the goal against what the stage holds,
 * and the length. Writes tools/inspect/out/report.json and a self-contained HTML report (report.ts).
 */
import { goalCounts } from '../../src/game/goals.ts';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { modelStage, MODEL_TYPICAL, MODEL_FAST } from '../../src/game/stageTime.ts';
import { countWord } from '../../src/game/stagePlan.ts';
import { stageList, type Stage, type StageEntry } from './stages.ts';
import { findRoute } from './route.ts';
import { findBeats, sampleRoute, WEIGHT, type Beat } from './beats.ts';
import {
  actionTokens, closestWindows, cosine, deadTime, density, profile, repeats, restCheck, tokenString, windows,
  COS_FLAG, EASY_GAP, NORMAL_GAP, WIN_FLAG, type Dead, type Burst, type Win,
} from './analyze.ts';
import { renderReport } from './report.ts';
import { inspectJumps, ADULT, KID, TRIALS, type JumpReport, type Timing } from './jumps.ts';
import { surfaceOf } from '../../src/game/stageMetrics.ts';
import { runFirstTimerPass, type FirstTimerPass } from './firsttimerReport.ts';
import { pacing, type MissAt, type Pacing } from './pacing.ts';
import { computeBands, type BandsOutput } from './bands.ts';

const here = path.dirname(fileURLToPath(import.meta.url));

function args() {
  const a = process.argv.slice(2);
  const get = (k: string) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
  const w = get('--worlds') ?? '1-5';
  const worlds: number[] = [];
  for (const part of w.split(',')) {
    const [lo, hi] = part.split('-').map(Number);
    for (let x = lo; x <= (hi ?? lo); x++) worlds.push(x);
  }
  return {
    worlds,
    seed: Number(get('--seed') ?? 1),
    html: get('--html') ?? path.join(here, 'out', 'report.html'),
    json: get('--json') ?? path.join(here, 'out', 'report.json'),
    /** only these stage ids (comma list), within the worlds */
    stages: get('--stages')?.split(',').filter(Boolean) ?? null,
    firsttimer: a.includes('--firsttimer'),
    ftTrials: Number(get('--ft-trials') ?? 2),
    ftWindows: Number(get('--ft-windows') ?? 12),
  };
}

export interface GoalCheck {
  /** what the goal counts, in the HUD's word (petals, animals freed, predators...) or '' for a stage with no count */
  word: string;
  goal: number;
  available: number;
  ratio: number | null;
  /** Matt's target share for Normal, or null where none was set */
  band: [number, number] | null;
  verdict: 'in band' | 'too easy' | 'too hard' | 'impossible' | 'no target' | 'no count';
  easyGoal: number;
  easyAvailable: number;
  easyRatio: number | null;
  /** of what the goal counts, how many sit close to the main route (the rest are detours) */
  nearRoute: number;
}

export interface StageReport {
  id: string;
  world: number;
  name: string;
  type: string;
  goalText: string;
  source: 'hand' | 'gen2' | 'generated';
  traced: string;
  presumedHops: number;
  /** goal stops the route visited, of those asked */
  stops: { asked: number; skipped: number };
  /** seconds: this tool's brisk player (route + fights + waits); stageTime's typical and quick players; the stage's own estimate */
  time: { inspector: number; typical: number | null; fast: number | null; designer: number | null; underTwoMin: boolean; quickUnder: boolean };
  /** which way through was used (the busier), and what each way gave */
  routes: { used: 'quick' | 'pickups'; quick: RouteSummary; pickups: RouteSummary };
  jumps: {
    normal: JumpReport[]; easy: JumpReport[]; over80: number; over80Easy: number; tightest: JumpReport[];
    tightestTiming: (Timing & { x: number }) | null; doubles: number;
  };
  hotspots: Hotspot[];
  beats: Array<Pick<Beat, 't' | 'x' | 'y' | 'letter' | 'count' | 'what' | 'dur' | 'act'>>;
  beatCount: number;
  beatsPerMin: number;
  dead: { normal: { list: Dead[]; total: number; raw: number; longest: number; count: number }; easy: { list: Dead[]; total: number; raw: number; longest: number; count: number; beatCount: number; time: number } };
  /** World 5: quiet seconds count half (the silk) */
  silk: boolean;
  rest: { bursts: Burst[]; noRest: number };
  action: string;
  mix: Record<string, number>;
  repeats: Array<{ ta: number; tb: number; d: number; s: string }>;
  similar: { id: string; cos: number; win: number; flagged: boolean } | null;
  goal: GoalCheck;
  counts: { petals: number; animals: number; rescuable: number; relics: number };
  offRoute: Record<string, number>;
  density: number[];
  sections: Array<{ name: string; t0: number; t1: number }>;
  /** action density, rhythm groups, rest pads and the tension curve against Gemini's table (pacing.ts), on each setting's own stage */
  pacing: { normal: Pacing; easy: Pacing };
}

export interface PairReport { world: number; a: string; b: string; cos: number; win: number; ta: number; tb: number; sa: string; sb: string; flagged: boolean; why: string[] }

export const ADULT_HOT = 0.7;
export const KID_HOT = 0.85;
export type Hotspot = JumpReport & { who: 'KID' | 'ADULT'; t: number };
export interface RouteSummary { time: number; beats: number; perMin: number; dead: number }

/** the route, its points and its beats */
function variant(st: Stage, targets: Array<{ x: number; y: number }>) {
  const route = findRoute(st, targets);
  const samples = sampleRoute(route);
  const br = findBeats(st, route, samples);
  const beats = br.beats.reduce((s, b) => s + b.count, 0);
  const dead = deadTime(br.beats, br.total, NORMAL_GAP, samples).total;
  return { route, samples, br, summary: { time: br.total, beats, perMin: (beats / Math.max(1, br.total)) * 60, dead } as RouteSummary };
}

/**
 * Two ways through a stage: the quickest one (which on a stage with a count also stops at what the goal counts), and the way a real
 * player takes, following the pickups: it also stops under every petal and flower on a ledge, in order along the stage (a stage's
 * pickups trace its designed path: the branches, the stepping stones). The busier of the two (more beats a minute) is the one reported.
 */
function pickRoute(type: string, st: Stage) {
  const goal = goalTargets(type, st);
  const quick = variant(st, goal);
  const pick = st.collectibles.filter((c) => c.type === 'flower' || c.type === 'leaf');
  const all = [...goal, ...pick].sort((a, b) => a.x - b.x);
  const pickups = type === 'harvest' || type === 'ascent' || !pick.length ? quick : variant(st, all);
  // (never on a climb, and never a way that takes far longer than the quick one: that is collecting everything, not the path)
  const which: 'quick' | 'pickups' = pickups !== quick && type !== 'ascent' && pickups.summary.time <= quick.summary.time * 1.5 && pickups.summary.perMin > quick.summary.perMin + 0.5 && pickups.route.traced !== 'failed' ? 'pickups' : 'quick';
  return { quick, pickups, which, used: which === 'pickups' ? pickups : quick };
}

/** World 5's rule: standing still lets the silk creep up, so a quiet stretch there is a light beat; its seconds count half (not on the rest branch) */
function silkLight(st: Stage): ((d: Dead) => number) | undefined {
  const w5 = st.proto?.w5;
  if (!w5) return undefined;
  const rest = w5.rest;
  return (d) => {
    const lo = Math.min(d.x0, d.x1), hi = Math.max(d.x0, d.x1);
    const inRest = rest ? Math.max(0, Math.min(hi, rest.x1) - Math.max(lo, rest.x0)) / Math.max(1, hi - lo) : 0;
    return 0.5 * (1 - inRest) + inRest;
  };
}

const BAND: Record<string, [number, number]> = { harvest: [0.85, 0.9], purge: [0.7, 0.8], gauntlet: [0.7, 0.8], rescue: [1, 1] };

/** what the stage holds of what each goal counts: the game's own count (goals.ts), so the share shown is the one the game asks for */
const counts = (st: Stage) => goalCounts(st);

function goalCheck(e: StageEntry, st: Stage, easy: Stage, samples: ReturnType<typeof sampleRoute>): GoalCheck {
  const type = e.type;
  const word = countWord(e.world, type);
  const n = counts(st), ne = counts(easy);
  const pick = (k: typeof n) =>
    type === 'harvest' ? k.petals : type === 'rescue' ? k.rescuable : type === 'relic_hunt' ? k.relics : type === 'purge' || type === 'gauntlet' ? k.animals : 0;
  const available = pick(n);
  const goal = word ? st.config.targetCount : 0;
  const ratio = word && available ? goal / available : null;
  const band = BAND[type] ?? null;
  let verdict: GoalCheck['verdict'] = 'no count';
  if (word) {
    if (ratio === null || ratio > 1) verdict = 'impossible';
    else if (!band) verdict = 'no target';
    else if (ratio < band[0] - 0.005) verdict = 'too easy';
    else if (ratio > band[1] + 0.005) verdict = 'too hard';
    else verdict = 'in band';
  }
  // the things the goal counts, close to the route
  const near = (x: number, y: number) => samples.some((s) => Math.abs(s.x - x) < 80 && s.y - y > -60 && s.y - y < 260);
  let nearRoute = 0;
  if (type === 'harvest') nearRoute = st.collectibles.filter((c) => (c.type === 'flower' || c.type === 'leaf') && near(c.x, c.y)).length;
  else if (type === 'rescue') nearRoute = st.collectibles.filter((c) => c.type === 'cage' && near(c.x, c.y)).length + (st.proto?.w5?.cocoons ?? []).filter((c) => near(c.x, c.y)).length;
  else if (type === 'relic_hunt') nearRoute = st.collectibles.filter((c) => c.type === 'relic' && near(c.x, c.y)).length;
  else if (type === 'purge' || type === 'gauntlet') nearRoute = st.enemies.filter((m) => near(m.x, m.y + 20)).length + (n.animals - st.enemies.length);
  const easyAvailable = pick(ne);
  const easyGoal = word ? easy.config.targetCount : 0;
  return { word, goal, available, ratio, band, verdict, easyGoal, easyAvailable, easyRatio: word && easyAvailable ? easyGoal / easyAvailable : null, nearRoute };
}

/** the designer's sections (Learn, Develop, Twist, Finish...) on the beat clock: by x along a stage, by height up a climb */
function sections(st: Stage, samples: ReturnType<typeof sampleRoute>, beats: Beat[], total: number) {
  const list = st.proto?.beats ?? [];
  if (!list.length || !samples.length) return [];
  const vertical = list.some((b) => b[0] > b[1]) || st.config.levelWidth <= 4000;
  const clock = (base: number) => {
    let d = 0;
    for (const b of beats) if (b.base < base) d += b.dur;
    return base + d;
  };
  const first = (f: (s: (typeof samples)[number]) => boolean) => { const s = samples.find(f); return s ? clock(s.base) : null; };
  const out: Array<{ name: string; t0: number; t1: number }> = [];
  for (const [a, b, name] of list) {
    const t0 = vertical ? first((s) => s.y <= Math.max(a, b) + 2) : first((s) => s.x >= Math.min(a, b) - 2);
    if (t0 === null) continue;
    out.push({ name, t0, t1: total });
  }
  out.sort((p, q) => p.t0 - q.t0);
  for (let i = 0; i + 1 < out.length; i++) out[i].t1 = out[i + 1].t0;
  return out.filter((s) => s.t1 > s.t0 + 0.5);
}

/** what the goal asks him to go and get, in order along the stage: the route visits each (harvest, rescue, search, beat the animals) */
function goalTargets(type: string, st: Stage): Array<{ x: number; y: number }> {
  let pts: Array<{ x: number; y: number }> = [];
  if (type === 'harvest') pts = st.collectibles.filter((c) => c.type === 'flower' || c.type === 'leaf');
  else if (type === 'rescue') pts = [...st.collectibles.filter((c) => c.type === 'cage'), ...(st.proto?.w5?.cocoons ?? [])];
  else if (type === 'relic_hunt') pts = st.collectibles.filter((c) => c.type === 'relic');
  else if (type === 'purge' || type === 'gauntlet') {
    pts = st.enemies.filter((m) => m.type !== 'eagle').map((m) => ({ x: m.x, y: surfaceOf(m) - 20 }));
    // (4-9: the capuchin guards the wind blows off their ledges count as defeated)
    for (const m of st.proto?.w4?.monkeys ?? []) if (m.job === 'guard' && m.blowOff) pts.push({ x: m.x, y: m.y - 20 });
  }
  return [...pts].sort((a, b) => a.x - b.x);
}

function main() {
  const opt = args();
  const listed = stageList(opt.worlds, opt.seed);
  const stages = opt.stages ? listed.stages.filter((e) => opt.stages!.includes(e.id)) : listed.stages;
  const skipped = listed.skipped;
  const reports: StageReport[] = [];
  const wins = new Map<string, Win[]>();
  const profs = new Map<string, ReturnType<typeof profile>>();
  for (const e of stages) {
    const t0 = Date.now();
    const st = e.build(false);
    const easy = e.build(true);
    // two ways through: the quickest (with the goal's stops), and the one along the pickups a real player follows; the busier is used
    const N = pickRoute(e.type, st);
    const E = pickRoute(e.type, easy);
    const { route, samples, br } = N.used;
    const { route: eRoute, samples: eSamples, br: ebr } = E.used;
    const dn = deadTime(br.beats, br.total, NORMAL_GAP, samples, silkLight(st));
    const de = deadTime(ebr.beats, ebr.total, EASY_GAP, eSamples, silkLight(easy));
    // jumps: their difficulty on each setting, and the bots (ADULT on Normal, KID on Easy's own stage and route)
    const jN = inspectJumps(st, route, false, ADULT);
    const jE = inspectJumps(easy, eRoute, true, KID);
    const clock = (smp: typeof samples, beats: typeof br.beats) => (x: number, y: number) => {
      let best = smp[0], bd = Infinity;
      for (const q of smp) { const d = Math.abs(q.x - x) + Math.abs(q.y - y) * 0.5; if (d < bd) { bd = d; best = q; } }
      let d = 0;
      for (const b of beats) if (b.base < (best?.base ?? 0)) d += b.dur;
      return (best?.base ?? 0) + d;
    };
    const tN = clock(samples, br.beats);
    const hot: Hotspot[] = [
      ...jN.filter((j) => j.rate !== null && j.rate < ADULT_HOT).map((j) => ({ ...j, who: 'ADULT' as const, t: tN(j.x, j.y) })),
      ...jE.filter((j) => j.rate !== null && j.rate < KID_HOT).map((j) => ({ ...j, who: 'KID' as const, t: tN(j.x, j.y) })),
    ].sort((a, b) => a.t - b.t);
    const timed = [...jN].filter((j) => j.timing).sort((a, b) => a.timing!.safe - b.timing!.safe);
    const rest = restCheck(br.beats, br.total, samples);
    // (a jump beat's miss share: the bot's jump nearest its take-off)
    const missAt = (js: JumpReport[]): MissAt => (x, y) => {
      const j = js.find((q) => q.rate !== null && Math.abs(q.x - x) < 80 && Math.abs(q.y - y) < 120);
      return j ? 1 - j.rate! : 0;
    };
    const secs = sections(st, samples, br.beats, br.total);
    const tokens = actionTokens(br.beats, br.total);
    const ws = windows(tokens, br.total);
    wins.set(e.id, ws);
    profs.set(e.id, profile(tokens));
    const climb = e.type === 'ascent' && !(st.meta?.ascentChain?.length);
    const typical = climb ? null : modelStage(st, MODEL_TYPICAL).total;
    const fast = climb ? null : modelStage(st, MODEL_FAST).total;
    const designer = e.source === 'hand' ? st.meta?.timing?.layoutSeconds ?? null : null;
    const mix: Record<string, number> = {};
    for (const b of br.beats) mix[b.letter] = (mix[b.letter] ?? 0) + b.count;
    const beatCount = br.beats.reduce((s, b) => s + b.count, 0);
    const judge = designer ?? typical ?? br.total;
    reports.push({
      id: e.id,
      world: e.world,
      name: e.name,
      type: e.type,
      goalText: e.goalText.replace('{n}', String(st.config.targetCount)),
      source: e.source,
      traced: route.traced,
      routes: { used: N.which, quick: N.quick.summary, pickups: N.pickups.summary },
      jumps: {
        normal: jN,
        easy: jE,
        over80: jN.filter((j) => j.reach > 0.8).length,
        over80Easy: jE.filter((j) => j.reach > 0.8).length,
        tightest: [...jN].sort((a, b) => b.reach - a.reach).slice(0, 5),
        tightestTiming: timed[0] ? { x: timed[0].x, ...timed[0].timing! } : null,
        doubles: jN.filter((j) => j.dbl).length,
      },
      hotspots: hot,
      presumedHops: route.presumedHops,
      stops: { asked: route.stops, skipped: route.skippedStops },
      time: { inspector: br.total, typical, fast, designer, underTwoMin: judge < 120, quickUnder: br.total < 120 },
      beats: br.beats.map((b) => ({ t: +b.t.toFixed(2), x: Math.round(b.x), y: Math.round(b.y), letter: b.letter, count: b.count, what: b.what, dur: +b.dur.toFixed(2), act: +b.act.toFixed(2) })),
      beatCount,
      beatsPerMin: (beatCount / br.total) * 60,
      dead: {
        normal: { ...dn, count: dn.list.length },
        easy: { ...de, count: de.list.length, beatCount: ebr.beats.reduce((s, b) => s + b.count, 0), time: ebr.total },
      },
      silk: !!st.proto?.w5,
      rest,
      action: tokenString(tokens),
      mix,
      repeats: repeats(ws).slice(0, 5),
      similar: null,
      goal: goalCheck(e, st, easy, samples),
      counts: counts(st),
      offRoute: br.offRoute,
      density: density(br.beats, br.total),
      sections: secs,
      pacing: {
        normal: pacing(br.beats, br.total, 'normal', { chase: !!st.proto?.chase, missAt: missAt(jN), sections: secs }),
        easy: pacing(ebr.beats, ebr.total, 'easy', { chase: !!easy.proto?.chase, missAt: missAt(jE), sections: sections(easy, eSamples, ebr.beats, ebr.total) }),
      },
    });
    process.stderr.write(`${e.id} ${route.traced} ${br.total.toFixed(0)}s beats ${beatCount} dead ${dn.total.toFixed(0)}s (${Date.now() - t0} ms)\n`);
  }

  // ---- same-ish pairs, within a world ----
  const raw: Array<Omit<PairReport, 'flagged' | 'why'>> = [];
  for (const a of reports) for (const b of reports) {
    if (a.world !== b.world || a.id >= b.id) continue;
    const cw = closestWindows(wins.get(a.id)!, wins.get(b.id)!);
    raw.push({ world: a.world, a: a.id, b: b.id, cos: cosine(profs.get(a.id)!, profs.get(b.id)!), win: cw?.d ?? 1, ta: cw?.ta ?? 0, tb: cw?.tb ?? 0, sa: cw?.sa ?? '', sb: cw?.sb ?? '' });
  }
  // thresholds from the stages themselves: a pair flags only where it stands out from how alike stages of one world usually are
  // (the top twentieth on the mix, the closest twentieth on a 20 s stretch), and never looser than the first guess (cosine 0.78, window 0.28)
  const q = (v: number[], f: number) => { const x = [...v].sort((m, n) => m - n); return x[Math.min(x.length - 1, Math.max(0, Math.floor(f * (x.length - 1))))]; };
  const cosAt = Math.max(COS_FLAG, q(raw.map((p) => p.cos), 0.95));
  const winAt = Math.min(WIN_FLAG, q(raw.map((p) => p.win), 0.05));
  const pairs: PairReport[] = raw.map((p) => {
    const why: string[] = [];
    if (p.cos > cosAt) why.push('overall mix');
    if (p.win < winAt) why.push('a 20-second stretch');
    return { ...p, flagged: why.length > 0, why };
  });
  const oldFlags = raw.filter((p) => p.cos > COS_FLAG || p.win < WIN_FLAG).length;
  const dist = { cos: raw.map((p) => p.cos), win: raw.map((p) => p.win) };
  for (const r of reports) {
    const mine = pairs.filter((p) => p.a === r.id || p.b === r.id);
    // most alike: the higher of the profile match and the window match (1 - distance)
    const score = (p: PairReport) => Math.max(p.cos, 1 - p.win);
    const best = mine.sort((p, q) => score(q) - score(p))[0];
    if (best) r.similar = { id: best.a === r.id ? best.b : best.a, cos: best.cos, win: best.win, flagged: best.flagged };
  }

  // the first-timer bot in the real engine, Easy and Normal (the pre-QA pass)
  const firstTimer = opt.firsttimer ? runFirstTimerPass(stages.map((e) => ({ id: e.id, name: e.name, world: e.world })), opt.seed, { trials: opt.ftTrials, windows: opt.ftWindows, log: (m) => process.stderr.write(m) }) : undefined;
  const bands = computeBands(reports, firstTimer);
  const out = { firstTimer, bands, generated: new Date().toISOString(), seed: opt.seed, worlds: opt.worlds, weights: WEIGHT, thresholds: { normal: NORMAL_GAP, easy: EASY_GAP, cosine: cosAt, window: winAt, firstCosine: COS_FLAG, firstWindow: WIN_FLAG, firstFlags: oldFlags }, bots: { trials: TRIALS, kid: KID, adult: ADULT, kidHot: KID_HOT, adultHot: ADULT_HOT }, stages: reports, pairs, skipped, dist };
  fs.mkdirSync(path.dirname(opt.json), { recursive: true });
  fs.writeFileSync(opt.json, JSON.stringify(out, null, 1));
  fs.mkdirSync(path.dirname(opt.html), { recursive: true });
  fs.writeFileSync(opt.html, renderReport(out));
  process.stderr.write(`wrote ${opt.json}\nwrote ${opt.html}\n`);
}

export type InspectOutput = {
  generated: string; seed: number; worlds: number[]; weights: Record<string, number>;
  thresholds: { normal: number; easy: number; cosine: number; window: number; firstCosine: number; firstWindow: number; firstFlags: number };
  bots: { trials: number; kid: typeof KID; adult: typeof ADULT; kidHot: number; adultHot: number };
  stages: StageReport[]; pairs: PairReport[]; skipped: Array<{ id: string; name: string; why: string }>;
  /** every same-world pair's two measures, for the distribution chart */
  dist: { cos: number[]; win: number[] };
  /** the first-timer bot's pass (--firsttimer) */
  firstTimer?: FirstTimerPass;
  /** difficulty score per stage, each world's band and §1b's flags (bands.ts) */
  bands: BandsOutput;
};

main();
