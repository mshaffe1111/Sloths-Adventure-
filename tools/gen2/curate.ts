/**
 * Seed curation for the gen2 stages (DESIGN.md B8, GEMINI-LEDGER C10). A development tool: never shipped; it only reads src/game and
 * writes the shipped table, src/game/gen2/seeds.ts.
 *
 *   npx tsx tools/gen2/curate.ts --stages 5-7,5-9 [--rolls 400] [--keep 16] [--out src/game/gen2/seeds.ts] [--waive quiet,dead]
 *     [--band 50-65] [--max-shared 0.7] [--rooms 8] [--apart] [--json out.json] [--report out.md] [--salt 20261028]
 *   npx tsx tools/gen2/curate.ts --stages toy-3,toy-4,toy-7 --rolls 400 --keep 16 --waive quiet,dead   (the toy world: tools/gen2/toySeeds.ts)
 *
 * For each stage: `--rolls` layout seeds (era.ts's rollVariants) are built through `buildGen2Stage` on Normal and on Easy (the same
 * seed: Easy lays Normal's plan), then measured on the inspector's route and beats. A roll is dropped when, on either setting:
 * - levelCheck (with puzzleCheck through it) finds an error;
 * - the clock fails: the time model's typical player under the stage's target or its fast player under the floor, or the inspector's
 *   quick player under 2:00 (STAGE-RULES §1, §2 "Length");
 * - an animal stands within JUMP_CLEAR of a take-off or landing, or the quick route never swings a liana (the full suite's rules);
 * - a quiet stretch runs over 4 s, or dead time is over a fifth of the stage (§2 "Dead time"; era.ts's budget) — `--waive` names
 *   rules a world cannot meet yet (the toy world's meadow is all quiet), and the waiver is written next to the seeds;
 * Then the 16 to ship are picked greedily: the best-quality roll first, then each time the roll farthest from every roll already
 * picked (the smallest 1 - cosine of the era tool's action 3-grams to the picked set, largest first; quality breaks near ties). A roll
 * is checked by the kid bot (Easy, 85%) and the adult bot (Normal, 70%) only when it is about to be picked (the bots are slow): a
 * roll that fails them, or falls outside `--band`, is dropped and the next one tried.
 * Across stages (C4): a stage whose world-neighbour before it was curated (now or earlier) is built with that stage's shipped closing
 * sections as `BuildRequest.recent`, the list is written with the seeds (the game passes the same list, so a seed builds the same
 * stage), and the share of sections the two stages' shipped sets have in common is reported; with `--max-shared` (default 0.7, worlds
 * of 12 sections or more) a roll whose sections are more than that share the neighbour's is dropped.
 * The band score is bands.ts's stageScore on the inspector's parts only (hardest jumps for the noisy bot, dead time, length): the
 * first-timer bot builds stages by id through the game, which builds gen2 stages only after the hook-up (DESIGN.md B10 piece G).
 */
import '../../src/game/headlessDom.ts';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildGen2Stage, checkStage } from '../../src/game/gen2/pipeline.ts';
import { JUMP_CLEAR, measureStage } from '../../src/game/stageMetrics.ts';
import type { Gen2Stage, WorldKit } from '../../src/game/gen2/types.ts';
import type { Gen2StageSeeds, Gen2Seed } from '../../src/game/gen2/seeds.ts';
import type { LevelConfig } from '../../src/game/types.ts';
import { actionTokens, closestWindows, cosine, deadTime, EASY_GAP, NORMAL_GAP, profile, tokenString, windows, type Dead, type Win } from '../inspect/analyze.ts';
import { stageScore } from '../inspect/bands.ts';
import { rollVariants } from '../inspect/era.ts';
import { pickRoute, RULES } from '../inspect/eraRoll.ts';
import { ADULT, inspectJumps, KID } from '../inspect/jumps.ts';
import type { Stage } from '../inspect/stages.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const self = fileURLToPath(import.meta.url);

export type Setting = 'normal' | 'easy';
/** the rules a run may waive (written next to its seeds) */
export type Waivable = 'quiet' | 'dead';

/** one stage to curate: its id in the seed table, the game's config, the world kit */
export interface CurateStage {
  key: string;
  config: LevelConfig;
  kit: WorldKit;
  kitName: string;
  /** the kit on a difficulty and the world's finishing step, when the game builds the stage so (gen2/game.ts GEN2_STAGES: World 6) */
  kitFor?: (difficulty: Setting) => WorldKit;
  finish?: (st: Gen2Stage) => Gen2Stage;
}

/** a roll of a stage on one difficulty, built the way the game builds it (its entry's kit on that difficulty, then its finish) */
export function buildFor(stage: CurateStage, seed: number, recent: string[], difficulty: Setting): Gen2Stage {
  const st = buildGen2Stage({ config: stage.config, kit: stage.kitFor ? stage.kitFor(difficulty) : stage.kit, seed, recent, difficulty });
  return stage.finish ? stage.finish(st) : st;
}

/** one setting of one roll, measured */
export interface SideMeasure {
  ok: boolean;
  errors: string[];
  /** seconds: the inspector's quick player; the time model's typical and fast players */
  quick: number;
  typical: number;
  fast: number;
  dead: number;
  played: number;
  longestQuiet: number;
  perMin: number;
  /** take-offs and landings within JUMP_CLEAR px of an animal (stageMetrics, the full suite's stageQuality check): none ships */
  nearJumps: number;
  /** lianas the quick route never swings (a swing it can walk or jump around: World 6's and World 8's test, gen2/w6Game.test.ts,
   *  w8Harness.ts checkW8Roll): none ships */
  unswung: number;
}

export interface RollMeasure {
  /** the seed to build with (the request's) and the one the shipped layout came from (a re-roll's, when the first failed) */
  seed: number;
  layoutSeed: number;
  rerolls: number;
  swaps: number;
  plan: string[];
  normal: SideMeasure;
  easy: SideMeasure;
  /** the action string (Normal) and its weighted 3-grams */
  action: string;
  prof: Map<string, number>;
  /** its 20 s windows (Normal), as era.ts compares stages of a world */
  wins: Win[];
  /** why it was dropped (empty: it passed the filters) */
  fails: string[];
  quality: number;
  bots?: { worstKid: number | null; worstAdult: number | null; kid: number; adult: number; rates: { normal: number[]; easy: number[] } };
  band?: { normal: number; easy: number };
}

export interface CurateOptions {
  rolls: number;
  keep: number;
  salt: number;
  waive: Waivable[];
  /** the band score window (inspector parts only), on Normal; null: report only */
  band: [number, number] | null;
  maxShared: number;
  /** how many shipped rolls must hold a puzzle room, when the stage's rolls can (default: half the set) */
  rooms?: number;
  /** the previous world-neighbour's shipped closing sections (BuildRequest.recent) and its section set */
  recent: string[];
  neighbour: Set<string> | null;
  /** the world's other gen2 stages' shipped rolls, by their 20 s windows (era.ts's look-alike rule across a world's stages) */
  others?: Array<{ key: string; wins: Win[][] }>;
  /** drop a roll that shares a 20 s stretch with one of `others`' shipped rolls (`--apart`) */
  apart?: boolean;
  log: (s: string) => void;
}

export interface CurateResult {
  stage: CurateStage;
  measures: RollMeasure[];
  picks: RollMeasure[];
  /** each pick's distance to the nearest roll picked before it (the first: null) */
  spread: Array<number | null>;
  /** rolls that passed the filters before the bots */
  passed: number;
  dropped: Record<string, number>;
  botRejects: number;
  /** per other gen2 stage of the world: the passing rolls, and the shipped ones, that share a 20 s stretch with its shipped set */
  alike: Array<{ key: string; rolls: number; picks: number }>;
  diversity: { all: number; shipped: number };
  shared: number | null;
  recent: string[];
  seconds: number;
}

// ───────────────────────────── measuring ─────────────────────────────

/** World 5's silk keeps him moving (eraRoll.ts silkLight, repeated: it is not exported) */
function silkLight(st: Stage): ((d: Dead) => number) | undefined {
  const rest = st.proto?.w5?.rest;
  if (!st.proto?.w5) return undefined;
  return (d) => {
    const lo = Math.min(d.x0, d.x1), hi = Math.max(d.x0, d.x1);
    const inRest = rest ? Math.max(0, Math.min(hi, rest.x1) - Math.max(lo, rest.x0)) / Math.max(1, hi - lo) : 0;
    return 0.5 * (1 - inRest) + inRest;
  };
}

function measureSide(st: Gen2Stage, type: string, setting: Setting) {
  const s = st as unknown as Stage;
  // (as this difficulty plays it: an Easy purge or gauntlet is held to its play-time goal, pipeline.ts checkStage)
  const res = checkStage(st, st.gen2.budget);
  const R = pickRoute(type, s);
  const { br, samples } = R.used;
  const dn = deadTime(br.beats, br.total, setting === 'easy' ? EASY_GAP : NORMAL_GAP, samples, silkLight(s));
  const quiet = dn.list.map((d) => d.counted);
  const beats = br.beats.reduce((t, b) => t + b.count, 0);
  const side: SideMeasure = {
    ok: res.ok,
    errors: res.errors.slice(0, 3),
    quick: R.quick.time,
    typical: st.gen2.modelled.typical,
    fast: st.gen2.modelled.fast,
    dead: dn.total,
    played: br.total,
    longestQuiet: quiet.length ? Math.max(...quiet) : 0,
    perMin: (beats / Math.max(1, br.total)) * 60,
    nearJumps: (() => { const q = measureStage(s as never); return q.takeoffsNearEnemy + q.landingsNearEnemy; })(),
    unswung: (() => {
      const swings = R.used.route.segs.filter((g) => g.kind === 'swing');
      return st.vines.filter((v) => v.vineType === 'swing_liana' && !swings.some((g) => Math.min(g.x0, g.x1) <= v.x + 40 && Math.max(g.x0, g.x1) >= v.x - 40)).length;
    })(),
  };
  return { side, route: R.used.route, beats: br };
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** the roll's quality, 0..1: little dead time, short quiet stretches, a length near the target, few repairs (the bots add theirs) */
export function quality(m: Pick<RollMeasure, 'normal' | 'easy' | 'rerolls' | 'swaps'>, target: number): number {
  const sides = [m.normal, m.easy];
  const dead = sides.reduce((t, s) => t + clamp01(1 - s.dead / Math.max(1, s.played) / (RULES.deadShare * 2)), 0) / 2;
  const quiet = sides.reduce((t, s) => t + clamp01(1 - s.longestQuiet / (RULES.quietMax * 2)), 0) / 2;
  const len = clamp01(1 - Math.abs(m.normal.typical - target) / target);
  const clean = clamp01(1 - 0.15 * m.rerolls - 0.05 * m.swaps);
  return Math.round((0.35 * dead + 0.3 * quiet + 0.2 * len + 0.15 * clean) * 1000) / 1000;
}

/** why a roll fails the STAGE-RULES §2 numbers (an empty list: it passes) */
export function failsOf(m: Pick<RollMeasure, 'normal' | 'easy'>, floor: { target: number; fast: number; quick: number }, waive: readonly Waivable[]): string[] {
  const f: string[] = [];
  for (const [name, s] of [['normal', m.normal], ['easy', m.easy]] as const) {
    if (!s.ok) f.push(`${name}: levelCheck`);
    if (s.quick < floor.quick) f.push(`${name}: quick player under 2:00`);
    if (s.fast < floor.fast) f.push(`${name}: model fast under the floor`);
    if (!waive.includes('quiet') && s.longestQuiet > RULES.quietMax) f.push(`${name}: quiet over 4 s`);
    if (!waive.includes('dead') && s.dead > RULES.deadShare * s.played) f.push(`${name}: dead time over a fifth`);
    if (s.nearJumps > 0) f.push(`${name}: an animal by a jump`);
    if (s.unswung > 0) f.push(`${name}: a liana never swung`);
  }
  // (Easy's typical player is shorter by design, fewer animals: the target is Normal's)
  if (m.normal.typical < floor.target) f.push('normal: model typical under the target');
  return f;
}

/** one roll, both settings */
export function measureRoll(stage: CurateStage, seed: number, recent: string[], waive: readonly Waivable[]): RollMeasure {
  const n = buildFor(stage, seed, recent, 'normal');
  const e = buildFor(stage, seed, recent, 'easy');
  const type = stage.config.objectiveType;
  const N = measureSide(n, type, 'normal');
  const E = measureSide(e, type, 'easy');
  const tokens = actionTokens(N.beats.beats, N.beats.total);
  const m: RollMeasure = {
    seed,
    layoutSeed: n.gen2.seed,
    rerolls: n.gen2.rerolls,
    swaps: n.gen2.repairs.filter((r) => r.kind === 'swap').length,
    plan: n.gen2.plan.map((p) => `${p.template}${p.mirrored ? '~' : ''}`),
    normal: N.side,
    easy: E.side,
    action: tokenString(tokens).replace(/W/g, ''),
    prof: profile(tokens),
    wins: windows(tokens, N.beats.total),
    fails: [],
    quality: 0,
  };
  const floor = floors(n);
  m.fails = failsOf(m, floor, waive);
  m.quality = quality(m, floor.target);
  return m;
}

const floors = (st: Gen2Stage) => ({ target: st.gen2.budget.seconds.target, fast: st.gen2.budget.seconds.fastFloor, quick: RULES.minSeconds });

/** the slow part, for a roll about to be picked: the kid and adult jump bots, and the band score */
export function botCheck(stage: CurateStage, m: RollMeasure, recent: string[]): NonNullable<RollMeasure['bots']> & { band: { normal: number; easy: number } } {

  const type = stage.config.objectiveType;
  const rates = { normal: [] as number[], easy: [] as number[] };
  const band = { normal: 0, easy: 0 };
  for (const setting of ['normal', 'easy'] as const) {
    const st = buildFor(stage, m.seed, recent, setting);
    const R = pickRoute(type, st as unknown as Stage);
    const js = inspectJumps(st as unknown as Stage, R.used.route, setting === 'easy', setting === 'easy' ? KID : ADULT);
    rates[setting] = js.filter((j) => j.rate !== null && !j.unflyable).map((j) => j.rate!);
    const side = m[setting];
    band[setting] = stageScore({
      id: stage.config.id, world: stage.config.worldIndex, setting, time: side.quick, deadShare: side.dead / Math.max(1, side.played),
      jumpRates: rates[setting], livesPerMin: null, peakStress: null, minWindowMs: null, survivalMin: null,
    }).score;
  }
  const min = (xs: number[]) => (xs.length ? Math.min(...xs) : null);
  return {
    worstKid: min(rates.easy),
    worstAdult: min(rates.normal),
    kid: rates.easy.filter((r) => r < RULES.kidHot).length,
    adult: rates.normal.filter((r) => r < RULES.adultHot).length,
    rates,
    band,
  };
}

// ───────────────────────────── picking ─────────────────────────────

/** the era tool's distance between two rolls: 1 - cosine of their weighted action 3-grams */
export const distance = (a: RollMeasure, b: RollMeasure) => 1 - cosine(a.prof, b.prof);

/** mean pairwise distance (era.ts's diversity) */
export function diversity(ms: RollMeasure[]): number {
  let s = 0, n = 0;
  for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) { s += distance(ms[i], ms[j]); n++; }
  return n ? s / n : 0;
}

/** the share of a roll's sections the neighbour stage's shipped set also uses */
export const sharedWith = (plan: string[], neighbour: Set<string>) => {
  const mine = new Set(plan.map((p) => p.replace(/~$/, '')));
  return mine.size ? [...mine].filter((t) => neighbour.has(t)).length / mine.size : 0;
};

/** what the shipped set must hold: at least `n` rolls with one of the `rooms` (puzzle-room section ids), shared out among them in turn */
export interface RoomQuota { n: number; rooms: readonly string[] }

/** the puzzle-room sections a roll's plan holds */
const roomsIn = (m: RollMeasure, rooms: readonly string[]) => m.plan.map((t) => t.replace(/~$/, '')).filter((t) => rooms.includes(t));

/**
 * Greedy max-min: the best-quality roll first, then each time the roll whose nearest picked roll is farthest (quality breaks near
 * ties: within 0.02 the better roll wins). `accept` is the slow check (the bots); a roll it refuses is dropped and the next tried.
 * With a room quota, while fewer than `quota.n` picks hold a puzzle room (and a roll with one is left), the pick is made among the
 * rolls holding the room the set has least of (the same max-min), so a stage's rooms ship though the pipeline rolls them rarely.
 */
export function pickSpread(pool: RollMeasure[], keep: number, accept: (m: RollMeasure) => boolean = () => true, quota: RoomQuota | null = null): { picks: RollMeasure[]; spread: Array<number | null>; refused: number } {
  const left = [...pool].sort((a, b) => b.quality - a.quality || a.seed - b.seed);
  const picks: RollMeasure[] = [];
  const spread: Array<number | null> = [];
  const near = new Map<RollMeasure, number>(left.map((m) => [m, Infinity]));
  let refused = 0;
  while (picks.length < keep && left.length) {
    // (the room quota: the candidates are the rolls with the room the picks hold least of, while the quota is short)
    let cand = left.map((_, i) => i);
    if (quota && quota.rooms.length && picks.filter((p) => roomsIn(p, quota.rooms).length).length < quota.n) {
      const have = (r: string) => picks.filter((p) => roomsIn(p, [r]).length).length;
      for (const r of [...quota.rooms].sort((a, b) => have(a) - have(b) || a.localeCompare(b))) {
        const c = cand.filter((i) => roomsIn(left[i], [r]).length);
        if (c.length) { cand = c; break; }
      }
    }
    let best = cand[0];
    if (picks.length) {
      for (const i of cand) {
        const a = near.get(left[i])!, b = near.get(left[best])!;
        if (a > b + 0.02 || (Math.abs(a - b) <= 0.02 && left[i].quality > left[best].quality)) best = i;
      }
    }
    const m = left.splice(best, 1)[0];
    if (!accept(m)) { refused++; continue; }
    spread.push(picks.length ? near.get(m)! : null);
    picks.push(m);
    for (const o of left) near.set(o, Math.min(near.get(o)!, distance(o, m)));
  }
  return { picks, spread, refused };
}

/** the closing sections a stage ships most (its picks' last four sections before the shrine, most often first): the next stage's `recent` */
export function closingSections(picks: RollMeasure[], n = 4): string[] {
  const count = new Map<string, number>();
  for (const p of picks) {
    const plan = p.plan.map((t) => t.replace(/~$/, ''));
    for (const t of new Set(plan.slice(Math.max(0, plan.length - 1 - n), plan.length - 1))) count.set(t, (count.get(t) ?? 0) + 1);
  }
  return [...count].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n).map(([t]) => t);
}

export function curateStage(stage: CurateStage, opt: CurateOptions): CurateResult {
  const t0 = Date.now();
  const seeds = rollVariants(opt.rolls, opt.salt);
  const measures: RollMeasure[] = [];
  for (const [i, seed] of seeds.entries()) {
    const m = measureRoll(stage, seed, opt.recent, opt.waive);
    if (opt.neighbour && stage.kit.manifest.sections.length >= 12 && sharedWith(m.plan, opt.neighbour) > opt.maxShared) m.fails.push('shares too many sections with the stage before');
    measures.push(m);
    if ((i + 1) % 25 === 0) opt.log(`  ${stage.key}: ${i + 1}/${seeds.length} rolls, ${measures.filter((x) => !x.fails.length).length} pass  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  // (era.ts's look-alike rule across a world's stages: any 20 s window of the roll against any of the other stage's shipped rolls')
  const alikeOf = new Map<RollMeasure, string[]>();
  for (const m of measures) {
    if (m.fails.length) continue;
    const keys = (opt.others ?? []).filter((o) => o.wins.some((w) => { const c = closestWindows(m.wins, w); return !!c && c.d < RULES.window; })).map((o) => o.key);
    alikeOf.set(m, keys);
    if (opt.apart) for (const k of keys) m.fails.push(`shares a 20 s stretch with ${k}`);
  }
  const dropped: Record<string, number> = {};
  for (const m of measures) for (const f of m.fails) dropped[f] = (dropped[f] ?? 0) + 1;
  const pool = measures.filter((m) => !m.fails.length);
  const passed = pool.length;
  // (a stage whose rolls can hold puzzle rooms ships them: half the set by default, `--rooms N`; the pipeline rolls them rarely)
  const rooms = stage.kit.manifest.sections.filter((t) => t.room).map((t) => t.id);
  const roomPool = pool.filter((m) => roomsIn(m, rooms).length).length;
  const quota: RoomQuota | null = rooms.length && roomPool ? { n: Math.min(opt.rooms ?? Math.ceil(opt.keep / 2), roomPool), rooms } : null;
  if (quota) opt.log(`  ${stage.key}: ${roomPool} passing rolls hold a puzzle room (${rooms.join(', ')}); the set ships at least ${quota.n}`);
  const { picks, spread, refused } = pickSpread(pool, opt.keep, (m) => {
    const b = botCheck(stage, m, opt.recent);
    m.bots = b;
    m.band = b.band;
    const why: string[] = [];
    if (b.kid) why.push(`kid bot: ${b.kid} jump(s) under 85%`);
    if (b.adult) why.push(`adult bot: ${b.adult} jump(s) under 70%`);
    if (opt.band && (b.band.normal < opt.band[0] || b.band.normal > opt.band[1])) why.push(`band ${b.band.normal} outside ${opt.band.join('-')}`);
    for (const w of why) dropped[w.replace(/\d+ jump\(s\)/, 'jumps').replace(/band [\d.]+/, 'band')] = (dropped[w.replace(/\d+ jump\(s\)/, 'jumps').replace(/band [\d.]+/, 'band')] ?? 0) + 1;
    m.fails.push(...why);
    if (!why.length) {
      const worst = Math.min(b.worstKid ?? 1, b.worstAdult ?? 1);
      m.quality = Math.round((m.quality * 0.85 + 0.15 * worst) * 1000) / 1000;
    }
    return !why.length;
  }, quota);
  let shared: number | null = null;
  if (opt.neighbour && picks.length) shared = picks.reduce((t, p) => t + sharedWith(p.plan, opt.neighbour!), 0) / picks.length;
  const alike = (opt.others ?? []).map((o) => ({ key: o.key, rolls: [...alikeOf.values()].filter((k) => k.includes(o.key)).length, picks: picks.filter((p) => alikeOf.get(p)?.includes(o.key)).length }));
  if (alike.length) opt.log(`  ${stage.key}: ${alike.map((a) => `${a.rolls} passing rolls (${a.picks} shipped) share a 20 s stretch with ${a.key}'s shipped set`).join('; ')}`);
  return { stage, measures, picks, spread, passed, dropped, botRejects: refused, alike, diversity: { all: diversity(pool.length ? pool : measures), shipped: diversity(picks) }, shared, recent: opt.recent, seconds: (Date.now() - t0) / 1000 };
}

// ───────────────────────────── stages and kits ─────────────────────────────

/**
 * A stage key to build: `toy-N` is the toy world (src/game/gen2/toyWorld.ts) with stage 5-N's config; `W-S` is the real stage with its
 * world's kit, found among src/game/gen2/worlds/w<W>*.ts's exports (the first WorldKit of that world that does not call the stage
 * hand-built: an exported kit, or an exported `...Kit(stage)` function called with the stage's number, World 5's `w5Kit`;
 * `--kit file.ts:exportName` picks one).
 */
export async function resolveStage(key: string, kitOverride?: string): Promise<CurateStage> {
  const { generateAllLevels } = await import('../../src/game/worldsData.ts');
  const levels = new Map(generateAllLevels().map((c) => [c.id, c]));
  const toy = /^toy-(\d+)$/.exec(key);
  const id = toy ? `5-${toy[1]}` : key;
  const config = levels.get(id);
  if (!config) throw new Error(`curate: no stage ${id}`);
  if (toy) {
    const { kit } = await import('../../src/game/gen2/toyWorld.ts');
    return { key, config: { ...config, unlocked: true }, kit, kitName: 'toyWorld.ts:kit' };
  }
  // (a stage the game lists is curated on its entry, the same kit on each difficulty and the same finish: gen2/game.ts)
  if (!kitOverride) {
    const { GEN2_STAGES } = await import('../../src/game/gen2/game.ts');
    const entry = GEN2_STAGES[id];
    if (entry?.finish || entry?.kit.length) {
      return { key, config: { ...config, unlocked: true }, kit: entry.kit('normal'), kitName: entry.kitName, kitFor: (d) => entry.kit(d), finish: entry.finish };
    }
  }
  const kits = await worldKits(config.worldIndex, kitOverride, config.miniIndex);
  const found = kits.find((k) => !k.kit.manifest.handBuilt.includes(id) && k.kit.manifest.sections.length);
  if (!found) throw new Error(`curate: no gen2 kit of World ${config.worldIndex} builds ${id} (looked in src/game/gen2/worlds/w${config.worldIndex}*.ts)`);
  return { key, config: { ...config, unlocked: true }, kit: found.kit, kitName: found.name };
}

const isKit = (v: unknown): v is WorldKit => !!v && typeof v === 'object' && 'manifest' in v && !!(v as WorldKit).manifest?.sections;
/** an export as a kit: the kit itself, or a `...Kit(stage)` maker called with the stage's number */
const asKit = (name: string, v: unknown, stage: number): unknown => (typeof v === 'function' && /Kit$/.test(name) ? (v as (s: number) => unknown)(stage) : v);

export async function worldKits(world: number, override?: string, stage = 1): Promise<Array<{ name: string; kit: WorldKit }>> {
  if (override) {
    // (a path, or a seed entry's `kit`: a file in src/game/gen2/worlds and its export, a maker's stage in brackets: "w5.ts:w5Kit(7)")
    const [given, raw] = override.split(':');
    const name = raw?.replace(/\(\d+\)$/, '');
    const file = fs.existsSync(path.resolve(given)) ? path.resolve(given) : path.join(root, 'src', 'game', 'gen2', 'worlds', given);
    const mod = await import(pathToFileURL(file).href);
    const kit = asKit(name ?? 'kit', mod[name ?? 'kit'], stage);
    if (!isKit(kit)) throw new Error(`curate: ${override} is not a WorldKit`);
    return [{ name: `${path.basename(file)}:${name ?? 'kit'}${kit === mod[name ?? 'kit'] ? '' : `(${stage})`}`, kit }];
  }
  const dir = path.join(root, 'src', 'game', 'gen2', 'worlds');
  if (!fs.existsSync(dir)) return [];
  const out: Array<{ name: string; kit: WorldKit }> = [];
  for (const f of fs.readdirSync(dir).filter((n) => n.startsWith(`w${world}`) && n.endsWith('.ts') && !n.endsWith('.test.ts')).sort()) {
    const mod = await import(pathToFileURL(path.join(dir, f)).href);
    for (const [name, e] of Object.entries(mod)) {
      const v = asKit(name, e, stage);
      if (isKit(v) && v.manifest.world === world) out.push({ name: `${f}:${name}${v === e ? '' : `(${stage})`}`, kit: v });
    }
  }
  return out;
}

/** the stage before in its world (`toy-8` -> `toy-7`, `5-8` -> `5-7`) */
export const neighbourKey = (key: string) => key.replace(/(\d+)$/, (s) => String(Number(s) - 1));

// ───────────────────────────── the seed table ─────────────────────────────

const r1 = (v: number) => Math.round(v * 10) / 10;
const r3 = (v: number) => Math.round(v * 1000) / 1000;

export function toEntry(r: CurateResult, opt: Pick<CurateOptions, 'waive' | 'rolls'>, date: string): Gen2StageSeeds {
  const seeds: Gen2Seed[] = r.picks.map((m, i) => ({
    seed: m.seed,
    layoutSeed: m.layoutSeed,
    quality: r3(m.quality),
    nearest: r.spread[i] === null ? null : r3(r.spread[i]!),
    quick: { normal: r1(m.normal.quick), easy: r1(m.easy.quick) },
    model: { typical: m.normal.typical, fast: m.normal.fast },
    dead: { normal: r1(m.normal.dead), easy: r1(m.easy.dead) },
    quiet: { normal: r1(m.normal.longestQuiet), easy: r1(m.easy.longestQuiet) },
    worstJump: { kid: m.bots?.worstKid ?? null, adult: m.bots?.worstAdult ?? null },
    band: { normal: m.band?.normal ?? 0, easy: m.band?.easy ?? 0 },
    sections: m.plan.join(' '),
  }));
  return {
    stage: r.stage.config.id,
    kit: r.stage.kitName,
    curated: date,
    rolled: opt.rolls,
    passed: r.passed,
    waived: [...opt.waive],
    recent: r.recent,
    diversity: { all: r3(r.diversity.all), shipped: r3(r.diversity.shipped) },
    shared: r.shared === null ? null : r3(r.shared),
    seeds,
  };
}

/** the TypeScript of a seed table (the shipped one, seeds.ts, or the toy fixture): the header, the types' import, the entries */
export function renderTable(name: string, entries: Record<string, Gen2StageSeeds>, header: string, typesFrom: string): string {
  const keys = Object.keys(entries).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  const body = keys.map((k) => {
    const e = entries[k];
    const { seeds, ...rest } = e;
    const head = Object.entries(rest).map(([f, v]) => `    ${f}: ${JSON.stringify(v)},`).join('\n');
    const rows = seeds.map((s) => `      ${JSON.stringify(s)},`).join('\n');
    return `  ${JSON.stringify(k)}: {\n${head}\n    seeds: [\n${rows}\n    ],\n  },`;
  }).join('\n');
  return `${header}\nimport type { Gen2StageSeeds } from '${typesFrom}';\n\nexport const ${name}: Record<string, Gen2StageSeeds> = {\n${body}${body ? '\n' : ''}};\n`;
}

// ───────────────────────────── the command line ─────────────────────────────

function args(argv: string[]) {
  const get = (k: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const stages = (get('--stages') ?? '').split(',').filter(Boolean);
  if (!stages.length) throw new Error('curate: --stages 5-7,5-9 (or toy-7,toy-9)');
  const band = get('--band')?.split('-').map(Number) as [number, number] | undefined;
  const toy = stages.every((s) => s.startsWith('toy-'));
  if (!toy && stages.some((s) => s.startsWith('toy-'))) throw new Error('curate: toy stages and real stages go to different tables: run them separately');
  return {
    stages,
    toy,
    rolls: Math.max(2, Number(get('--rolls') ?? 400)),
    keep: Math.max(1, Number(get('--keep') ?? 16)),
    salt: Number(get('--salt') ?? 20261028),
    waive: (get('--waive')?.split(',').filter(Boolean) ?? []) as Waivable[],
    band: band && band.length === 2 ? band : null,
    maxShared: Number(get('--max-shared') ?? 0.7),
    rooms: get('--rooms') === undefined ? undefined : Math.max(0, Number(get('--rooms'))),
    apart: argv.includes('--apart'),
    kit: get('--kit'),
    out: get('--out') ?? (toy ? path.join(here, 'toySeeds.ts') : path.join(root, 'src', 'game', 'gen2', 'seeds.ts')),
    json: get('--json'),
    report: get('--report'),
  };
}

const HEADER_SHIPPED = `/**
 * gen2/seeds — the curated layouts each gen2 stage ships (DESIGN.md B8, GEMINI-LEDGER C10). Written by tools/gen2/curate.ts: do not
 * edit by hand; re-run the tool. Each stage's 16 rolls passed levelCheck, the clock and STAGE-RULES §2's numbers on Normal and Easy,
 * and were picked to differ from each other the most. At play, build with \`seeds[variant % seeds.length].seed\` and the entry's
 * \`recent\` (BuildRequest.recent): with the same list the seed builds the same stage that was checked. seeds.test.ts guards it.
 */
export interface Gen2Seed {
  /** the seed to build with (BuildRequest.seed), and the one its layout came from (a re-roll's, when the first roll failed) */
  seed: number;
  layoutSeed: number;
  /** 0..1, higher better; the distance (1 - cosine of action 3-grams) to the nearest roll picked before it */
  quality: number;
  nearest: number | null;
  /** seconds: the inspector's quick player; the time model on Normal */
  quick: { normal: number; easy: number };
  model: { typical: number; fast: number };
  dead: { normal: number; easy: number };
  quiet: { normal: number; easy: number };
  /** the worst jump for the kid bot (Easy) and the adult bot (Normal) */
  worstJump: { kid: number | null; adult: number | null };
  /** bands.ts's score on the inspector's parts only (no first-timer until the hook-up) */
  band: { normal: number; easy: number };
  /** the plan, slot by slot (~ mirrored) */
  sections: string;
}

export interface Gen2StageSeeds {
  stage: string;
  /** the world kit it was built from */
  kit: string;
  curated: string;
  rolled: number;
  passed: number;
  /** STAGE-RULES §2 rules the run waived (tools/gen2/curate.ts --waive) */
  waived: string[];
  /** BuildRequest.recent: the stage before's shipped closing sections */
  recent: string[];
  diversity: { all: number; shipped: number };
  /** the share of sections the stage before's shipped set also uses */
  shared: number | null;
  seeds: Gen2Seed[];
}
`;

/** the shipped table's text (it carries its own types) */
export const shippedTable = (entries: Record<string, Gen2StageSeeds>) =>
  renderTable('GEN2_SEEDS', entries, HEADER_SHIPPED, './seeds.ts').replace(`import type { Gen2StageSeeds } from './seeds.ts';\n\n`, '');

const HEADER_TOY = `/**
 * The toy world's curated seeds (tools/gen2/curate.ts --stages toy-3,toy-4,toy-7 --rolls 400 --keep 16 --waive quiet,dead): the tool's proof end to end before World 5's real
 * sections exist, and the fixture src/game/gen2/seeds.test.ts guards. Not shipped. Written by the tool: re-run it, do not edit.
 */`;

async function main() {
  const opt = args(process.argv.slice(2));
  const log = (s: string) => process.stderr.write(`${s}\n`);
  const date = new Date().toISOString().slice(0, 10);
  const tableName = opt.toy ? 'TOY_SEEDS' : 'GEN2_SEEDS';
  let existing: Record<string, Gen2StageSeeds> = {};
  if (fs.existsSync(opt.out)) existing = { ...((await import(pathToFileURL(path.resolve(opt.out)).href))[tableName] ?? {}) };
  const results: CurateResult[] = [];
  for (const key of opt.stages) {
    const stage = await resolveStage(key, opt.kit);
    const prev = existing[neighbourKey(key)];
    const prevPicks = results.find((r) => r.stage.key === neighbourKey(key))?.picks;
    const recent = prevPicks ? closingSections(prevPicks) : prev ? closingSectionsOf(prev) : [];
    const neighbour = prevPicks ? new Set(prevPicks.flatMap((p) => p.plan.map((t) => t.replace(/~$/, '')))) : prev ? new Set(prev.seeds.flatMap((s) => s.sections.split(' ').map((t) => t.replace(/~$/, '')))) : null;
    // (the world's other gen2 stages, curated now or before: their shipped rolls' windows, for the look-alike rule across stages)
    const others: Array<{ key: string; wins: Win[][] }> = [];
    if (!opt.toy) {
      for (const [k, e] of Object.entries(existing)) {
        if (k === key || k.split('-')[0] !== key.split('-')[0]) continue;
        const done = results.find((r) => r.stage.key === k);
        if (done) { others.push({ key: k, wins: done.picks.map((p) => p.wins) }); continue; }
        const st = await resolveStage(k, e.kit);
        others.push({ key: k, wins: e.seeds.map((x) => measureRoll(st, x.seed, e.recent, []).wins) });
      }
    }
    log(`${key} (${stage.config.objectiveType}, ${stage.kitName}): ${opt.rolls} rolls${recent.length ? `, recent ${recent.join(',')}` : ''}${opt.waive.length ? `, waived ${opt.waive.join(',')}` : ''}`);
    const r = curateStage(stage, { ...opt, recent, neighbour, others, log });
    results.push(r);
    existing[key] = toEntry(r, opt, date);
    report(r, opt.keep, log);
  }
  const text = opt.toy ? renderTable(tableName, existing, HEADER_TOY, '../../src/game/gen2/seeds.ts') : shippedTable(existing);
  fs.writeFileSync(opt.out, text);
  log(`wrote ${path.relative(root, opt.out)}`);
  if (opt.report) {
    fs.mkdirSync(path.dirname(path.resolve(opt.report)), { recursive: true });
    fs.writeFileSync(opt.report, renderReport(results, opt, date));
    log(`wrote ${opt.report}`);
  }
  if (opt.json) fs.writeFileSync(opt.json, JSON.stringify(results.map((r) => ({ ...toEntry(r, opt, date), dropped: r.dropped, botRejects: r.botRejects, seconds: r.seconds, rolls: r.measures.map((m) => ({ seed: m.seed, q: m.quality, fails: m.fails, quick: r1(m.normal.quick), dead: r1(m.normal.dead), quiet: r1(m.normal.longestQuiet), a: m.action })) })), null, 1));
}

/** the report's words on the puzzle rooms: how many passing rolls hold one, and how many shipped (by room) */
function roomLine(r: CurateResult): string {
  const rooms = r.stage.kit.manifest.sections.filter((t) => t.room).map((t) => t.id);
  if (!rooms.length) return '';
  const pool = r.measures.filter((m) => !m.fails.length || m.bots);
  const by = rooms.map((id) => `${id} ${r.picks.filter((p) => roomsIn(p, [id]).length).length}`).join(', ');
  return ` Puzzle rooms: ${pool.filter((m) => roomsIn(m, rooms).length).length} of the passing rolls hold one; ${r.picks.filter((p) => roomsIn(p, rooms).length).length} shipped (${by}).`;
}

/** an earlier entry's closing sections, from its written plans */
const closingSectionsOf = (e: Gen2StageSeeds) => closingSections(e.seeds.map((s) => ({ plan: s.sections.split(' ') }) as RollMeasure));

/** a drop reason in plain words, for the report */
export function plainReason(k: string): string {
  const side = k.startsWith('easy') ? 'Easy' : k.startsWith('normal') ? 'Normal' : '';
  const what = k.replace(/^(normal|easy): /, '');
  const words: Record<string, string> = {
    levelCheck: 'the stage checker found a spot that cannot be done',
    'quick player under 2:00': 'a quick player finishes in under 2 minutes',
    'model fast under the floor': "the fast player's clock is under the stage's floor",
    'model typical under the target': "the typical player's clock is under the stage's target",
    'quiet over 4 s': 'a stretch of more than 4 seconds with nothing to do',
    'dead time over a fifth': 'more than a fifth of the stage is quiet',
    'an animal by a jump': `an animal within ${JUMP_CLEAR} px of a take-off or a landing`,
    'a liana never swung': 'a liana the quick route never swings (it walks or jumps around it)',
    'kid bot: jumps under 85%': 'a jump the kid bot (Easy) makes less than 85% of the time',
    'adult bot: jumps under 70%': 'a jump the adult bot (Normal) makes less than 70% of the time',
    'band outside': 'its difficulty score is outside the band',
    'shares too many sections with the stage before': 'too many of the same building blocks as the stage before',
  };
  const w = words[what] ?? Object.entries(words).find(([key]) => what.startsWith(key))?.[1] ?? what;
  return side ? `${side}: ${w}` : w;
}

const pct = (a: number, b: number) => `${Math.round((100 * a) / Math.max(1, b))}%`;
const cell = (v: number | null | undefined, d = 0) => (v === null || v === undefined ? '-' : v.toFixed(d));
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

/** the run as a Markdown report: per stage the pass rate, why rolls were dropped, the variety, and the shipped rolls with their scores */
export function renderReport(results: CurateResult[], opt: Pick<CurateOptions, 'rolls' | 'keep' | 'waive'>, date: string): string {
  const out: string[] = [`# gen2 seed curation, ${date}`, ''];
  out.push(`Each stage was built ${opt.rolls} times on Normal and on Easy. A roll is kept only if both settings pass every check; then the ${opt.keep} kept rolls most different from each other are shipped.${opt.waive.length ? ` Checks waived for this run: ${opt.waive.join(', ')}.` : ''}`, '');
  out.push('| Stage | Rolls | Passed every check | Shipped | Variety, all passing (shipped) | Rule |', '|---|---|---|---|---|---|');
  for (const r of results) out.push(`| ${r.stage.key} (${r.stage.config.objectiveType}) | ${r.measures.length} | ${r.passed - r.botRejects} (${pct(r.passed - r.botRejects, r.measures.length)}) | ${r.picks.length}/${opt.keep} | ${r.diversity.all.toFixed(2)} (${r.diversity.shipped.toFixed(2)}) | ${RULES.diversity} or more |`);
  for (const r of results) {
    const n = r.measures.length;
    out.push('', `## ${r.stage.key}: ${r.stage.config.objectiveType}, ${r.stage.kitName}`, '');
    out.push(`${r.passed - r.botRejects} of ${n} rolls (${pct(r.passed - r.botRejects, n)}) passed every check (the jump bots ran only on the rolls about to be shipped: ${r.botRejects} refused). ${r.picks.length} shipped.${r.recent.length ? ` Built after the stage before's closing blocks: ${r.recent.join(', ')}.` : ''}${r.shared !== null ? ` Blocks shared with the stage before: ${pct(r.shared, 1)}.` : ''}${roomLine(r)}${r.alike.map((a) => ` ${a.rolls} of the passing rolls (${a.picks} shipped) share a 20-second stretch with ${a.key}'s shipped rolls (era.ts's look-alike rule).`).join('')}`, '');
    const drops = Object.entries(r.dropped).sort((a, b) => b[1] - a[1]);
    if (drops.length) {
      out.push('Why rolls were dropped (a roll can fail more than one check):', '', '| Reason | Rolls | Share |', '|---|---|---|');
      for (const [k, v] of drops) out.push(`| ${plainReason(k)} | ${v} | ${pct(v, n)} |`);
      out.push('');
    }
    if (!r.picks.length) { out.push('Nothing shipped.'); continue; }
    out.push('The shipped rolls (quick player: a fast thumb on the quickest way through; quiet: the longest stretch with nothing to do; worst jump: the share of tries the noisy bot makes; difficulty: bands.ts on the inspector\'s parts only, until the first-timer bot can play gen2 stages):', '');
    out.push('| # | Seed | Quality | Different from the nearest | Quick player Normal / Easy | Quiet time Normal | Longest quiet Normal / Easy | Worst jump kid / adult | Difficulty Normal / Easy |', '|---|---|---|---|---|---|---|---|---|');
    r.picks.forEach((m, i) => {
      out.push(`| ${i + 1} | ${m.seed} | ${m.quality.toFixed(2)} | ${cell(r.spread[i], 2)} | ${mmss(m.normal.quick)} / ${mmss(m.easy.quick)} | ${cell(m.normal.dead)} s (${pct(m.normal.dead, m.normal.played)}) | ${cell(m.normal.longestQuiet, 1)} / ${cell(m.easy.longestQuiet, 1)} s | ${m.bots?.worstKid === null || !m.bots ? '-' : pct(m.bots.worstKid, 1)} / ${m.bots?.worstAdult === null || !m.bots ? '-' : pct(m.bots.worstAdult, 1)} | ${cell(m.band?.normal, 1)} / ${cell(m.band?.easy, 1)} |`);
    });
  }
  return `${out.join('\n')}\n`;
}

function report(r: CurateResult, keep: number, log: (s: string) => void) {
  log(`${r.stage.key}: ${r.measures.length} rolled in ${r.seconds.toFixed(0)} s; ${r.passed} passed the filters, ${r.botRejects} refused by the bots/band; shipped ${r.picks.length}/${keep}`);
  for (const [k, v] of Object.entries(r.dropped).sort((a, b) => b[1] - a[1])) log(`  dropped ${v}: ${k}`);
  log(`  diversity (mean 1 - cosine): every passing roll ${r.diversity.all.toFixed(3)}, the shipped set ${r.diversity.shipped.toFixed(3)} (rule >= ${RULES.diversity})`);
  if (r.shared !== null) log(`  sections shared with the stage before: ${(r.shared * 100).toFixed(0)}%`);
  const q = r.picks.map((p) => p.quality);
  if (q.length) log(`  quality ${Math.min(...q).toFixed(3)}..${Math.max(...q).toFixed(3)}; nearest-pick distance ${r.spread.filter((s): s is number => s !== null).map((s) => s.toFixed(2)).join(' ')}`);
  const b = r.picks.map((p) => p.band?.normal ?? 0);
  if (b.length) log(`  band score (inspector parts) Normal ${Math.min(...b)}..${Math.max(...b)}, Easy ${Math.min(...r.picks.map((p) => p.band?.easy ?? 0))}..${Math.max(...r.picks.map((p) => p.band?.easy ?? 0))}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === self) void main().catch((e) => { process.stderr.write(`${e instanceof Error ? e.stack : e}\n`); process.exit(1); });
