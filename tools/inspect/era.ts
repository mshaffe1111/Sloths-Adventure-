/**
 * The 200-roll tool (expressive range analysis, Smith & Whitehead 2010; reference/GEMINI-PCG-RESEARCH.md part 3). A development tool:
 * never shipped, and it only reads src/game.
 *
 *   npx tsx tools/inspect/era.ts --worlds 1-5 --rolls 200 [--html out.html] [--json out.json] [--jobs 4] [--bots 10] [--look 25] [--stages 1-4,5-6]
 *     [--raw rolls.json | --from rolls.json]
 *
 * Every stage of the worlds asked for is rolled `--rolls` times, each roll built the way the game builds it on entry (eraRoll.ts), and
 * each roll is measured on the inspector's route and beats: length for a quick player, dead time and the longest quiet stretch, beats a
 * minute, the action mix, linearity, leniency, height range, the pieces, props and puzzle rooms it uses. Per stage it then counts how many
 * different layouts the rolls give, how alike they are (mean 1 - cosine of the action 3-grams, and the distance between the same 20 s of
 * two rolls), draws two heat maps of the rolls, and counts the rolls that break a rule of reference/STAGE-RULES.md §2. `--bots` rolls per
 * stage (spread through the list) also run the kid and adult jump bots, and `--look` rolls (default 25) are compared with the same roll
 * of every other stage of the world. Stages run in parallel worker processes (`--jobs`, default: the
 * number of cores). Writes tools/inspect/out/era.json and era.html unless told otherwise.
 */
import { fork, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { closestWindows, cosine, winDistance, type Win } from './analyze.ts';
import type { Letter } from './beats.ts';
import { judgedBy, NOT_JUDGED, type RollResult } from './eraRoll.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const self = fileURLToPath(import.meta.url);

/** the layout numbers a batch rolls: the first is 1 (what the inspector and the stage tests build), the rest as the game draws them (1 to 1,000,000) */
export function rollVariants(n: number, salt = 20261028): number[] {
  let a = salt >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [1];
  const seen = new Set(out);
  while (out.length < n) {
    const v = Math.floor(next() * 1_000_000) + 1;
    if (!seen.has(v)) { seen.add(v); out.push(v); }
  }
  return out.slice(0, n);
}

/** which of n rolls run the bots: k of them, spread evenly */
export const botRolls = (n: number, k: number) => new Set(Array.from({ length: Math.min(n, k) }, (_, i) => Math.floor((i * n) / Math.min(n, k))));

interface Job { id: string; variants: number[]; bots: boolean[] }
interface Done { id: string; results: RollResult[] }

// ---------------------------------------------------------------- worker ----------------------------------------------------------------

async function worker() {
  const { measureRoll } = await import('./eraRoll.ts');
  const { generateAllLevels } = await import('../../src/game/worldsData.ts');
  const levels = new Map(generateAllLevels().map((c) => [c.id, c]));
  process.on('message', (job: Job | 'stop') => {
    if (job === 'stop') process.exit(0);
    const cfg = levels.get(job.id)!;
    const results = job.variants.map((v, i) => measureRoll(cfg, v, { bots: job.bots[i] }));
    process.send!({ id: job.id, results } satisfies Done);
  });
  process.send!('ready');
}

// ---------------------------------------------------------------- main ----------------------------------------------------------------

function args() {
  const a = process.argv.slice(2);
  const get = (k: string) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
  const worlds: number[] = [];
  for (const part of (get('--worlds') ?? '1-5').split(',')) {
    const [lo, hi] = part.split('-').map(Number);
    for (let x = lo; x <= (hi ?? lo); x++) worlds.push(x);
  }
  return {
    worlds,
    rolls: Math.max(2, Number(get('--rolls') ?? 200)),
    jobs: Math.max(1, Number(get('--jobs') ?? os.cpus().length)),
    bots: Math.max(0, Number(get('--bots') ?? 10)),
    look: Math.max(1, Number(get('--look') ?? 25)),
    stages: get('--stages')?.split(',') ?? null,
    html: get('--html') ?? path.join(here, 'out', 'era.html'),
    /** --raw: also keep every roll's measures in this file; --from: read them back instead of rolling (to redraw the report) */
    raw: get('--raw'),
    from: get('--from'),
    json: get('--json') ?? path.join(here, 'out', 'era.json'),
  };
}

export interface Stat { min: number; p10: number; med: number; p90: number; max: number; mean: number }
const stat = (xs: number[]): Stat => {
  const s = [...xs].sort((a, b) => a - b);
  const q = (f: number) => s[Math.min(s.length - 1, Math.max(0, Math.round(f * (s.length - 1))))] ?? 0;
  return { min: s[0] ?? 0, p10: q(0.1), med: q(0.5), p90: q(0.9), max: s[s.length - 1] ?? 0, mean: s.reduce((t, v) => t + v, 0) / Math.max(1, s.length) };
};

export interface WorstRoll { variant: number; layout: number; score: number; why: string[]; quick: number; longestQuiet: number }

export interface StageSummary {
  id: string; world: number; name: string; type: string; source: 'hand' | 'generated'; climb: boolean;
  rolls: number; ms: number;
  floor: number; target: number;
  stats: Record<'quick' | 'played' | 'designer' | 'dead' | 'longestQuiet' | 'perMin' | 'linearity' | 'leniency' | 'vertical' | 'platforms' | 'routePlatforms' | 'props' | 'styles', Stat>;
  mix: Partial<Record<Letter, number>>;
  distinct: { geometry: number; actions: number; sequences: number; pieces: number; layouts: number; attempts: number; looks: number };
  diversity: { cosine: number; window: number | null; alike: number; nearest: number };
  heat: { linLen: number[][]; lenDead: number[][] };
  /** props, rooms and pieces: how many of the rolls hold each */
  props: Record<string, number>;
  rooms: Record<string, number>;
  pieceKinds: Record<string, number>;
  /** the level check: judged only where the stage's tested roll (layout 1) passes it (otherwise its own tests use another check) */
  judged: boolean;
  /** why the level check does not judge it */
  notJudged: string | null;
  firstErrors: string[];
  fails: {
    short: number; quiet: number; dead: number; validator: number; lookalike: number; lookRolls: number;
    /** of those: the overall action mix alike (cosine), and a matching 20 s stretch */
    lookMix: number; lookWindow: number;
    botRolls: number; hotKid: number; hotAdult: number;
  };
  errorKinds: Record<string, number>;
  lookalikeWith: Record<string, number>;
  worst: WorstRoll[];
  traced: Record<string, number>;
}

export interface EraOutput {
  generated: string; seconds: number; redrawn: boolean; rolls: number; worlds: number[]; jobs: number; bots: number; look: number;
  rules: typeof import('./eraRoll.ts').RULES;
  stages: StageSummary[];
  skipped: Array<{ id: string; why: string }>;
  /** every roll, briefly, for replaying and for other charts */
  rollsBrief: Array<{ id: string; v: number; q: number; d: number; lq: number; lin: number; len: number; ok: boolean; pm: number; a: string }>;
}

const nonWalk = (a: string) => a.replace(/W/g, '');
/** the order of things to do, a run of the same action counted once (a small hop counts as a jump): "JJhJVVCJ" -> "JVCJ" */
export const sequenceOf = (a: string) => nonWalk(a).replace(/h/g, 'J').replace(/(.)\1+/g, '$1');

/** the distance between the same 20 s of two rolls: each window of one against the other's window nearest in time (within 6 s) */
export function alignedWindows(a: Win[], b: Win[]): number | null {
  let sum = 0, n = 0;
  for (const x of a) {
    let best: Win | null = null;
    for (const y of b) if (Math.abs(y.t - x.t) <= 6 && (!best || Math.abs(y.t - x.t) < Math.abs(best.t - x.t))) best = y;
    if (best) { sum += winDistance(x, best); n++; }
  }
  return n ? sum / n : null;
}

const LIN_BINS = 10, LEN_BINS = 10;
/** length bins: 60 s to 300 s in 20 s steps; dead time 0 to 80 s in 8 s steps */
export const HEAT = { lenLo: 60, lenStep: 20, lenBins: 12, deadStep: 8, deadBins: 10 };
const bin = (v: number, lo: number, step: number, n: number) => Math.max(0, Math.min(n - 1, Math.floor((v - lo) / step)));

function summarise(meta: { id: string; world: number; name: string; type: string; source: 'hand' | 'generated' }, rs: RollResult[], target: number, rules: EraOutput['rules']): StageSummary {
  const n = rs.length;
  const profs = rs.map((r) => new Map(r.prof));
  // diversity: every pair of rolls
  let dsum = 0, pairs = 0;
  const nearest = new Array(n).fill(0);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const c = cosine(profs[i], profs[j]);
    dsum += 1 - c; pairs++;
    nearest[i] = Math.max(nearest[i], c); nearest[j] = Math.max(nearest[j], c);
  }
  const div = pairs ? dsum / pairs : 0;
  // the 20 s windows: a fixed sample of pairs (neighbours in the list, and a stride), up to 300
  let wsum = 0, wn = 0;
  for (let k = 0; k < Math.min(300, pairs); k++) {
    const i = k % n, j = (i + 1 + Math.floor(k / n) * 7 + (k % 13)) % n;
    if (i === j) continue;
    const d = alignedWindows(rs[i].wins, rs[j].wins);
    if (d !== null) { wsum += d; wn++; }
  }
  const heatA = Array.from({ length: LEN_BINS }, () => new Array(LIN_BINS).fill(0));
  const heatB = Array.from({ length: HEAT.deadBins }, () => new Array(HEAT.lenBins).fill(0));
  for (const r of rs) {
    heatA[bin(r.leniency, -1, 2 / LEN_BINS, LEN_BINS)][bin(r.linearity, 0, 1 / LIN_BINS, LIN_BINS)]++;
    heatB[bin(r.dead, 0, HEAT.deadStep, HEAT.deadBins)][bin(r.quick, HEAT.lenLo, HEAT.lenStep, HEAT.lenBins)]++;
  }
  const count = (keys: string[][]) => {
    const m: Record<string, number> = {};
    for (const ks of keys) for (const k of new Set(ks)) m[k] = (m[k] ?? 0) + 1;
    return m;
  };
  const mix: Partial<Record<Letter, number>> = {};
  for (const r of rs) for (const [k, v] of Object.entries(r.mix)) mix[k as Letter] = (mix[k as Letter] ?? 0) + v / n;
  const judged = judgedBy(meta.id, rs[0]?.ok ?? false);
  const bots = rs.filter((r) => r.hot);
  const climb = rs[0]?.climb ?? false;
  const budget = (r: RollResult) => r.dead > rules.deadShare * r.played;
  return {
    ...meta,
    climb,
    rolls: n,
    ms: rs.reduce((t, r) => t + r.ms, 0),
    floor: rs[0]?.floor ?? rules.minSeconds,
    target,
    stats: {
      quick: stat(rs.map((r) => r.quick)),
      played: stat(rs.map((r) => r.played)),
      designer: stat(rs.map((r) => r.designer ?? 0)),
      dead: stat(rs.map((r) => r.dead)),
      longestQuiet: stat(rs.map((r) => r.longestQuiet)),
      perMin: stat(rs.map((r) => r.perMin)),
      linearity: stat(rs.map((r) => r.linearity)),
      leniency: stat(rs.map((r) => r.leniency)),
      vertical: stat(rs.map((r) => r.vertical)),
      platforms: stat(rs.map((r) => r.platforms)),
      routePlatforms: stat(rs.map((r) => r.routePlatforms)),
      props: stat(rs.map((r) => r.props.length)),
      styles: stat(rs.map((r) => r.styles.length)),
    },
    mix,
    distinct: {
      geometry: new Set(rs.map((r) => r.geo)).size,
      actions: new Set(rs.map((r) => nonWalk(r.action))).size,
      sequences: new Set(rs.map((r) => sequenceOf(r.action))).size,
      pieces: new Set(rs.map((r) => r.pieces.join(','))).size,
      layouts: new Set(rs.map((r) => `${nonWalk(r.action)}|${r.pieces.join(',')}`)).size,
      attempts: new Set(rs.map((r) => r.attempt)).size,
      looks: new Set(rs.map((r) => [...r.props, ...r.styles].join(','))).size,
    },
    diversity: { cosine: div, window: wn ? wsum / wn : null, alike: 1 - div, nearest: stat(nearest).med },
    heat: { linLen: heatA, lenDead: heatB },
    props: count(rs.map((r) => r.props)),
    rooms: count(rs.map((r) => r.rooms)),
    pieceKinds: count(rs.map((r) => r.pieces)),
    judged,
    notJudged: judged ? null : NOT_JUDGED[meta.id] ?? `the tested roll already fails it (${rs[0]?.errors[0] ?? ''}); its own tests use another check`,
    firstErrors: rs[0]?.errors ?? [],
    fails: {
      short: rs.filter((r) => r.quick < r.floor).length,
      quiet: rs.filter((r) => r.longestQuiet > rules.quietMax).length,
      dead: rs.filter(budget).length,
      validator: judged ? rs.filter((r) => !r.ok).length : 0,
      lookalike: 0,
      lookRolls: 0,
      lookMix: 0,
      lookWindow: 0,
      botRolls: bots.length,
      hotKid: bots.filter((r) => r.hot!.kid > 0).length,
      hotAdult: bots.filter((r) => r.hot!.adult > 0).length,
    },
    errorKinds: count(rs.map((r) => r.errorKinds)),
    lookalikeWith: {},
    worst: [],
    traced: count(rs.map((r) => [r.traced])),
  };
}

async function main() {
  const opt = args();
  const t0 = Date.now();
  const { RULES, targetFor } = await import('./eraRoll.ts');
  const { generateAllLevels } = await import('../../src/game/worldsData.ts');
  const { stageSpec } = await import('../../src/game/stagePlan.ts');
  const { HAND_STAGES } = await import('../../src/game/protoStage.ts');
  const { W2_STAGES } = await import('../../src/game/w2Stages.ts');
  const skipped: EraOutput['skipped'] = [];
  const levels = generateAllLevels().filter((c) => {
    if (!opt.worlds.includes(c.worldIndex)) return false;
    if (opt.stages && !opt.stages.includes(c.id)) return false;
    if (c.objectiveType === 'boss_lair') { skipped.push({ id: c.id, why: 'boss lair: one designed arena, no roll' }); return false; }
    if (c.id === '4-D' || c.id === '5-M') { skipped.push({ id: c.id, why: c.id === '4-D' ? "Dot's flight: no ground route (dotFlightStage.ts)" : "Meeca's stage: its actions are not platform beats (meecaStage.ts)" }); return false; }
    return true;
  });
  const variants = rollVariants(opt.rolls);
  const withBots = botRolls(opt.rolls, opt.bots);
  const CHUNK = 20;
  const jobs: Job[] = [];
  for (let k = 0; k < opt.rolls; k += CHUNK) for (const c of levels) {
    const vs = variants.slice(k, k + CHUNK);
    jobs.push({ id: c.id, variants: vs, bots: vs.map((_, i) => withBots.has(k + i)) });
  }
  const results = new Map<string, Map<number, RollResult>>();
  let done = 0;
  const total = jobs.length;
  if (opt.from) {
    for (const r of JSON.parse(fs.readFileSync(opt.from, 'utf8')) as RollResult[]) {
      if (!results.has(r.id)) results.set(r.id, new Map());
      results.get(r.id)!.set(r.variant, r);
    }
    jobs.length = 0;
  }
  if (jobs.length) await new Promise<void>((resolve, reject) => {
    const workers: ChildProcess[] = [];
    let live = 0;
    const give = (w: ChildProcess) => {
      const j = jobs.shift();
      if (!j) { w.send('stop'); return; }
      w.send(j);
    };
    for (let i = 0; i < Math.min(opt.jobs, total); i++) {
      const w = fork(self, ['--worker'], { execArgv: process.execArgv, stdio: ['ignore', 'ignore', 'inherit', 'ipc'] });
      live++;
      workers.push(w);
      w.on('message', (m: Done | 'ready') => {
        if (m !== 'ready') {
          const map = results.get(m.id) ?? new Map<number, RollResult>();
          for (const r of m.results) map.set(r.variant, r);
          results.set(m.id, map);
          done++;
          const el = (Date.now() - t0) / 1000;
          process.stderr.write(`\r${done}/${total} batches  ${el.toFixed(0)} s  (about ${((el / done) * (total - done)).toFixed(0)} s to go)   `);
        }
        give(w);
      });
      w.on('exit', (code) => {
        live--;
        if (code && code !== 0) reject(new Error(`a worker stopped (${code})`));
        else if (live === 0) resolve();
      });
    }
  });
  process.stderr.write('\n');
  if (opt.raw) fs.writeFileSync(opt.raw, JSON.stringify([...results.values()].flatMap((m) => [...m.values()])));

  const summaries: StageSummary[] = [];
  const byId = new Map<string, RollResult[]>();
  for (const c of levels) {
    const map = results.get(c.id)!;
    const rs = variants.map((v) => map.get(v)!);
    byId.set(c.id, rs);
    const spec = stageSpec(c.worldIndex, c.miniIndex);
    const source = HAND_STAGES[c.id] || W2_STAGES[c.id] ? 'hand' : 'generated';
    summaries.push(summarise({ id: c.id, world: c.worldIndex, name: spec?.name ?? c.name, type: c.objectiveType, source }, rs, source === 'hand' ? targetFor(c.id) : 0, RULES));
  }

  // ---- look-alikes: each roll against the same-numbered roll of every other stage of its world (a player meets them in one sitting) ----
  // (the 20 s windows of two stages are compared every one against every other: slow, so a sample of the rolls, spread through the list)
  const look = new Map<string, Set<number>>();
  const lookAt = [...botRolls(opt.rolls, opt.look)];
  const t1 = Date.now();
  for (const a of summaries) for (const b of summaries) {
    if (a.world !== b.world || a.id >= b.id) continue;
    const ra = byId.get(a.id)!, rb = byId.get(b.id)!;
    for (const i of lookAt) {
      const c = cosine(new Map(ra[i].prof), new Map(rb[i].prof));
      const w = closestWindows(ra[i].wins, rb[i].wins);
      const mixAlike = c > RULES.cosine, winAlike = !!w && w.d < RULES.window;
      if (mixAlike || winAlike) {
        for (const [s, o] of [[a, b], [b, a]] as const) {
          for (const [k, hit] of [['any', true], ['mix', mixAlike], ['win', winAlike]] as const) {
            if (!hit) continue;
            const key = `${s.id}:${k}`;
            if (!look.has(key)) look.set(key, new Set());
            look.get(key)!.add(i);
          }
          s.lookalikeWith[o.id] = (s.lookalikeWith[o.id] ?? 0) + 1;
        }
      }
    }
  }
  process.stderr.write(`look-alikes compared in ${((Date.now() - t1) / 1000).toFixed(0)} s\n`);

  // ---- the worst rolls of each stage, to replay ----
  for (const s of summaries) {
    const rs = byId.get(s.id)!;
    const lk = look.get(`${s.id}:any`) ?? new Set<number>();
    s.fails.lookalike = lk.size;
    s.fails.lookMix = look.get(`${s.id}:mix`)?.size ?? 0;
    s.fails.lookWindow = look.get(`${s.id}:win`)?.size ?? 0;
    s.fails.lookRolls = lookAt.length;
    const scored: WorstRoll[] = rs.map((r, i) => {
      const why: string[] = [];
      let score = 0;
      if (s.judged && !r.ok) { score += 3; why.push(`fails the level check (${r.errors[0] ?? ''})`); }
      if (r.quick < r.floor) { score += 2 + (r.floor - r.quick) / 10; why.push(`${Math.floor(r.quick)} s for a quick player (needs ${r.floor})`); }
      if (r.longestQuiet > RULES.quietMax) { score += 1 + (r.longestQuiet - RULES.quietMax) / 4; why.push(`${r.longestQuiet.toFixed(1)} s with nothing to do`); }
      if (r.dead > RULES.deadShare * r.played) { score += 0.5; why.push(`${Math.round(r.dead)} s of dead time`); }
      if (r.hot && r.hot.kid) { score += 1; why.push(`${r.hot.kid} jump(s) the kid bot makes under 85% (worst ${((r.hot.worstKid ?? 0) * 100).toFixed(1)}%)`); }
      if (r.hot && r.hot.adult) { score += 1; why.push(`${r.hot.adult} jump(s) the adult bot makes under 70%`); }
      if (lk.has(i)) { score += 0.5; why.push((look.get(`${s.id}:mix`)?.has(i) ? 'same action mix as' : 'a 20 s stretch matches') + ' another stage of its world'); }
      return { variant: r.variant, layout: r.variant - 1, score, why, quick: r.quick, longestQuiet: r.longestQuiet };
    });
    s.worst = scored.filter((w) => w.score > 0).sort((p, q) => q.score - p.score).slice(0, 5);
  }

  const out: EraOutput = {
    generated: new Date().toISOString(),
    seconds: (Date.now() - t0) / 1000,
    redrawn: !!opt.from,
    rolls: opt.rolls,
    worlds: opt.worlds,
    jobs: opt.jobs,
    bots: Math.max(0, ...summaries.map((s) => s.fails.botRolls)),
    look: lookAt.length,
    rules: RULES,
    stages: summaries,
    skipped,
    rollsBrief: summaries.flatMap((s) => byId.get(s.id)!.map((r) => ({ id: s.id, v: r.variant, q: +r.quick.toFixed(1), d: +r.dead.toFixed(1), lq: +r.longestQuiet.toFixed(1), lin: +r.linearity.toFixed(3), len: +r.leniency.toFixed(3), ok: r.ok, pm: +r.perMin.toFixed(1), a: nonWalk(r.action) }))),
  };
  const { renderEra } = await import('./eraReport.ts');
  fs.mkdirSync(path.dirname(opt.json), { recursive: true });
  fs.writeFileSync(opt.json, JSON.stringify(out, null, 1));
  fs.mkdirSync(path.dirname(opt.html), { recursive: true });
  fs.writeFileSync(opt.html, renderEra(out));
  process.stderr.write(`${summaries.length} stages x ${opt.rolls} rolls in ${out.seconds.toFixed(0)} s\nwrote ${opt.json}\nwrote ${opt.html}\n`);
}

if (process.argv.includes('--worker')) void worker();
else if (process.argv[1] && path.resolve(process.argv[1]) === self) void main();
