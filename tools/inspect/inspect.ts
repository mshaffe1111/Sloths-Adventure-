/**
 * Stage inspector, slice 1 (a development tool: never shipped, nothing in src/ imports it, and it only reads src/game).
 *
 *   npx tsx tools/inspect/inspect.ts --worlds 1-5 [--seed 1] [--html path/to/report.html]
 *
 * For every stage of the worlds asked for it traces the main route from the spawn to the shrine (route.ts), lists the active beats
 * along it (beats.ts), and measures dead time, rests, how alike the stages of a world are, the goal against what the stage holds,
 * and the length. Writes tools/inspect/out/report.json and a self-contained HTML report (report.ts).
 */
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
import { surfaceOf } from '../../src/game/stageMetrics.ts';

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
  source: 'hand' | 'generated';
  traced: string;
  presumedHops: number;
  /** goal stops the route visited, of those asked */
  stops: { asked: number; skipped: number };
  /** seconds: this tool's brisk player (route + fights + waits); stageTime's typical and quick players; the stage's own estimate */
  time: { inspector: number; typical: number | null; fast: number | null; designer: number | null; underTwoMin: boolean };
  beats: Array<Pick<Beat, 't' | 'x' | 'y' | 'letter' | 'count' | 'what' | 'dur' | 'act'>>;
  beatCount: number;
  beatsPerMin: number;
  dead: { normal: { list: Dead[]; total: number; longest: number; count: number }; easy: { list: Dead[]; total: number; longest: number; count: number; beatCount: number; time: number } };
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
}

export interface PairReport { world: number; a: string; b: string; cos: number; win: number; ta: number; tb: number; sa: string; sb: string; flagged: boolean; why: string[] }

const BAND: Record<string, [number, number]> = { harvest: [0.85, 0.9], purge: [0.7, 0.8], gauntlet: [0.7, 0.8], rescue: [1, 1] };

function counts(st: Stage) {
  const c = (f: (t: string) => boolean) => st.collectibles.filter((x) => f(x.type)).length;
  const ring = (st.proto?.ring?.waves ?? []).reduce((s, w) => s + w.length, 0);
  const guards = (st.proto?.w4?.monkeys ?? []).filter((m) => m.job === 'guard' && m.blowOff).length;
  return {
    petals: c((t) => t === 'flower' || t === 'leaf'),
    animals: st.enemies.length + ring + guards,
    rescuable: c((t) => t === 'cage') + (st.proto?.w5?.cocoons?.length ?? 0),
    relics: c((t) => t === 'relic'),
  };
}

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
  const { stages, skipped } = stageList(opt.worlds, opt.seed);
  const reports: StageReport[] = [];
  const wins = new Map<string, Win[]>();
  const profs = new Map<string, ReturnType<typeof profile>>();
  for (const e of stages) {
    const t0 = Date.now();
    const st = e.build(false);
    const route = findRoute(st, goalTargets(e.type, st));
    const samples = sampleRoute(route);
    const br = findBeats(st, route, samples);
    const easy = e.build(true);
    const eRoute = findRoute(easy, goalTargets(e.type, easy));
    const eSamples = sampleRoute(eRoute);
    const ebr = findBeats(easy, eRoute, eSamples);
    const dn = deadTime(br.beats, br.total, NORMAL_GAP, samples);
    const de = deadTime(ebr.beats, ebr.total, EASY_GAP, eSamples);
    const rest = restCheck(br.beats, br.total, samples);
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
      presumedHops: route.presumedHops,
      stops: { asked: route.stops, skipped: route.skippedStops },
      time: { inspector: br.total, typical, fast, designer, underTwoMin: judge < 120 },
      beats: br.beats.map((b) => ({ t: +b.t.toFixed(2), x: Math.round(b.x), y: Math.round(b.y), letter: b.letter, count: b.count, what: b.what, dur: +b.dur.toFixed(2), act: +b.act.toFixed(2) })),
      beatCount,
      beatsPerMin: (beatCount / br.total) * 60,
      dead: {
        normal: { ...dn, count: dn.list.length },
        easy: { ...de, count: de.list.length, beatCount: ebr.beats.reduce((s, b) => s + b.count, 0), time: ebr.total },
      },
      rest,
      action: tokenString(tokens),
      mix,
      repeats: repeats(ws).slice(0, 5),
      similar: null,
      goal: goalCheck(e, st, easy, samples),
      counts: counts(st),
      offRoute: br.offRoute,
      density: density(br.beats, br.total),
      sections: sections(st, samples, br.beats, br.total),
    });
    process.stderr.write(`${e.id} ${route.traced} ${br.total.toFixed(0)}s beats ${beatCount} dead ${dn.total.toFixed(0)}s (${Date.now() - t0} ms)\n`);
  }

  // ---- same-ish pairs, within a world ----
  const pairs: PairReport[] = [];
  for (const a of reports) for (const b of reports) {
    if (a.world !== b.world || a.id >= b.id) continue;
    const cos = cosine(profs.get(a.id)!, profs.get(b.id)!);
    const cw = closestWindows(wins.get(a.id)!, wins.get(b.id)!);
    const win = cw?.d ?? 1;
    const why: string[] = [];
    if (cos > COS_FLAG) why.push('overall mix');
    if (win < WIN_FLAG) why.push('a 20-second stretch');
    pairs.push({ world: a.world, a: a.id, b: b.id, cos, win, ta: cw?.ta ?? 0, tb: cw?.tb ?? 0, sa: cw?.sa ?? '', sb: cw?.sb ?? '', flagged: why.length > 0, why });
  }
  for (const r of reports) {
    const mine = pairs.filter((p) => p.a === r.id || p.b === r.id);
    // most alike: the higher of the profile match and the window match (1 - distance)
    const score = (p: PairReport) => Math.max(p.cos, 1 - p.win);
    const best = mine.sort((p, q) => score(q) - score(p))[0];
    if (best) r.similar = { id: best.a === r.id ? best.b : best.a, cos: best.cos, win: best.win, flagged: best.flagged };
  }

  const out = { generated: new Date().toISOString(), seed: opt.seed, worlds: opt.worlds, weights: WEIGHT, thresholds: { normal: NORMAL_GAP, easy: EASY_GAP, cosine: COS_FLAG, window: WIN_FLAG }, stages: reports, pairs, skipped };
  fs.mkdirSync(path.dirname(opt.json), { recursive: true });
  fs.writeFileSync(opt.json, JSON.stringify(out, null, 1));
  fs.mkdirSync(path.dirname(opt.html), { recursive: true });
  fs.writeFileSync(opt.html, renderReport(out));
  process.stderr.write(`wrote ${opt.json}\nwrote ${opt.html}\n`);
}

export type InspectOutput = {
  generated: string; seed: number; worlds: number[]; weights: Record<string, number>;
  thresholds: { normal: number; easy: number; cosine: number; window: number };
  stages: StageReport[]; pairs: PairReport[]; skipped: Array<{ id: string; name: string; why: string }>;
};

main();
