/**
 * One roll of one stage, measured for the 200-roll tool (era.ts). A development tool: nothing in src/ ships it, and it only reads src/game.
 *
 * A roll is built the way the game builds a stage on entry (App.tsx startLevel -> engine.ts): the layout number goes in with
 * setLayoutVariant, then generateStage (the hand-built stages take the number as their seed; the new generator's, 5-7 and 5-9, play
 * one of their 16 curated rolls, `number % 16`, built on the difficulty played; the old generator's, 5-6, 5-8 and on, search attempts
 * from it until the validator passes: variantAttemptFor), then withGoals. headlessDom gives it the `location` a
 * browser has, so generateStage takes the browser's path (outside a browser it would build the old generated stage for every id).
 * In the game `?layout=N` replays the roll with layout number N + 1 (stageGenerator.ts rollLayoutVariant).
 */
import '../../src/game/headlessDom.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { validateStage } from '../../src/game/levelCheck.ts';
import { withGoals } from '../../src/game/goals.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { surfaceOf } from '../../src/game/stageMetrics.ts';
import { STAGE_SECONDS, EXPERT_SECONDS, G as GROUND } from '../../src/game/protoStage.ts';
import type { LevelConfig } from '../../src/game/types.ts';
import type { Stage } from './stages.ts';
import { findRoute, isLiana, type Route } from './route.ts';
import { findBeats, sampleRoute, type Beat, type Letter } from './beats.ts';
import { actionTokens, deadTime, profile, tokenString, NORMAL_GAP, type Dead } from './analyze.ts';
import { LOOK, lookWindows, type LookWin } from './lookalike.ts';
import { inspectJumps, routeJumps, ADULT, KID } from './jumps.ts';

/** STAGE-RULES.md §2, as the 200-roll tool counts them */
export const RULES = {
  /** a quick player needs at least 2:00 (stage rule "Length"); a climb counts 20 s short */
  minSeconds: 120,
  climbShort: 20,
  /** no quiet stretch over about 4 s ("Dead time") */
  quietMax: 4,
  /** dead time beyond this share of the stage (the tool's own budget: at 2 s gaps, a fifth of the stage spent quiet is a lot) */
  deadShare: 0.2,
  /** two stages of a world alike: cosine of weighted action 3-grams over 0.78, or a 20 s stretch closer than LOOK.alike on the
   *  look-alike measure (lookalike.ts: each beat by its kind; "Sameness") */
  cosine: 0.78,
  window: LOOK.alike,
  /** rolls of one stage should differ: mean 1 - cosine about 0.35 or more ("Variety across rolls") */
  diversity: 0.35,
  /** the kid bot (Easy) makes every jump at least 85% of the time, the adult bot (Normal) 70% ("Hotspots") */
  kidHot: 0.85,
  adultHot: 0.7,
};

export interface RollResult {
  id: string;
  /** the layout number (setLayoutVariant); the game replays it with ?layout=<variant - 1> */
  variant: number;
  /** the generator attempt the layout came from (generated stages: after the validator's re-rolls) */
  attempt: number | null;
  ms: number;
  traced: Route['traced'];
  ok: boolean;
  errors: string[];
  /** the kinds of error the check found (numbers taken out) */
  errorKinds: string[];
  /** seconds: the quick player on the quickest way through; the busier way the inspector reports; the stage's own quick estimate */
  quick: number;
  played: number;
  designer: number | null;
  /** the length rule's floor for this stage (120, or 100 for a climb) */
  floor: number;
  climb: boolean;
  dead: number;
  deadRaw: number;
  longestQuiet: number;
  quietOver: number;
  beats: number;
  perMin: number;
  mix: Partial<Record<Letter, number>>;
  /** the action string (walks included) and its weighted 3-gram profile */
  action: string;
  prof: Array<[string, number]>;
  /** the 20 s windows of beat kinds (lookalike.ts) */
  wins: LookWin[];
  linearity: number;
  leniency: number;
  vertical: number;
  platforms: number;
  routePlatforms: number;
  /** a fingerprint of the platforms (rounded to 20 px): two rolls with the same one are the same layout */
  geo: string;
  styles: string[];
  pieces: string[];
  props: string[];
  rooms: string[];
  /** the jumps the bots miss too often (only on the rolls where the bots run) */
  hot: { kid: number; adult: number; worstKid: number | null; worstAdult: number | null } | null;
}

/** a climb (counts 20 s short): the vertical stages */
export const isClimb = (cfg: LevelConfig, st: Stage) => cfg.objectiveType === 'ascent' || cfg.levelHeight > cfg.levelWidth || (st.config.levelWidth <= 4000 && st.config.levelHeight > 2000);

/** the stage built for one layout number, as the engine builds it on entry */
export function buildRoll(cfg: LevelConfig, variant: number, easy = false): Stage {
  setLayoutVariant(variant);
  try {
    // (a gen2 stage, src/game/gen2/game.ts, is laid for Easy by its own pipeline: the difficulty goes in with the build, as engine.ts does)
    const st = withGoals(generateStage({ ...cfg, unlocked: true }, easy ? 'easy' : 'normal')) as Stage;
    return easy ? (easyStage(st) as Stage) : st;
  } finally {
    setLayoutVariant(null);
  }
}

/**
 * The level check (levelCheck.ts validateStage) the way the stages' own tests apply it (w2Stages.test.ts, w3Stages.test.ts): it models one
 * liana from ledge to ledge, not a chain of them, so each run of swinging vines (lianas, silk lines less than 420 px apart) gets a
 * stand-in bridge at the ground for the check, and a flower along a swing is left to the swing checks (flowerReach.ts). A stage that passes
 * the plain check (every generated stage: its layout search uses it) is never bridged.
 */
export function checkRoll(st: Stage): { ok: boolean; errors: string[]; bridged: number } {
  const plain = validateStage(st);
  if (plain.ok) return { ok: true, errors: [], bridged: 0 };
  const xs = st.vines.filter(isLiana).map((v) => v.x).sort((a, b) => a - b);
  const spans: number[][] = [];
  for (const vx of xs) {
    const l = spans[spans.length - 1];
    if (l && vx - l[1] < 420) l[1] = vx;
    else spans.push([vx, vx]);
  }
  const bridges = spans.map((sp, i) => ({ id: 90000 + i, x: sp[0] - 260, y: GROUND, width: sp[1] - sp[0] + 520, height: 20, type: 'solid' as const }));
  if (!bridges.length) return { ok: false, errors: plain.errors, bridged: 0 };
  const res = validateStage({ ...st, platforms: [...st.platforms, ...bridges] });
  const errors = res.errors.filter((e) => {
    // (a pickup "inside" a stand-in bridge is the bridge's doing, not the stage's)
    if (/inside platform 9\d{4}$/.test(e)) return false;
    const m = e.match(/^flower #\d+ at \((\d+), \d+\) is out of reach$/);
    return !(m && bridges.some((b) => Number(m[1]) > b.x - 60 && Number(m[1]) < b.x + b.width + 60));
  });
  return { ok: errors.length === 0, errors, bridged: bridges.length };
}

/**
 * Stages the level check is not the judge of even where their tested roll passes it, because their own tests skip it: 2-4's lianas run
 * in long chains over the river (w2Stages.test.ts checks them with the swing checks and flowerReach.ts instead).
 */
export const NOT_JUDGED: Record<string, string> = {
  '2-4': "its liana chains are checked by the swing checks, not the level check (w2Stages.test.ts)",
  // (its tested roll failed the level check on pickups it could not reach until the petal pass took them out, 2026-10-30; on 6 of the
  // sampled rolls the check still stops short of the exit: to look at)
  '1-2': 'a hand-built stage checked by its pieces and the swing checks (stage12.test.ts: protoCheck, flowerReach.ts), not the level check',
};

/** whether the level check judges this stage: its tested roll (layout 1) passes it, and its tests use it */
export const judgedBy = (id: string, firstOk: boolean) => firstOk && !NOT_JUDGED[id];

/** an error's kind, without its numbers ("flower #17 at (6481, 301) is out of reach" -> "flower # at (, ) is out of reach") */
export const errorKind = (e: string) => e.replace(/[-\d.]+/g, '').replace(/\s+/g, ' ').trim();

// ---- the inspector's route choice (inspect.ts pickRoute / goalTargets / silkLight), repeated here because inspect.ts runs on import ----

function goalTargets(type: string, st: Stage): Array<{ x: number; y: number }> {
  let pts: Array<{ x: number; y: number }> = [];
  if (type === 'harvest') pts = st.collectibles.filter((c) => c.type === 'flower' || c.type === 'leaf');
  else if (type === 'rescue') pts = [...st.collectibles.filter((c) => c.type === 'cage'), ...(st.proto?.w5?.cocoons ?? [])];
  else if (type === 'relic_hunt') pts = st.collectibles.filter((c) => c.type === 'relic');
  else if (type === 'purge' || type === 'gauntlet') {
    pts = st.enemies.filter((m) => m.type !== 'eagle').map((m) => ({ x: m.x, y: surfaceOf(m) - 20 }));
    for (const m of st.proto?.w4?.monkeys ?? []) if (m.job === 'guard' && m.blowOff) pts.push({ x: m.x, y: m.y - 20 });
  }
  return [...pts].sort((a, b) => a.x - b.x);
}

function variantRoute(st: Stage, targets: Array<{ x: number; y: number }>) {
  const route = findRoute(st, targets);
  const samples = sampleRoute(route);
  const br = findBeats(st, route, samples);
  const beats = br.beats.reduce((s, b) => s + b.count, 0);
  return { route, samples, br, time: br.total, perMin: (beats / Math.max(1, br.total)) * 60 };
}

export function pickRoute(type: string, st: Stage) {
  const goal = goalTargets(type, st);
  const quick = variantRoute(st, goal);
  const pick = st.collectibles.filter((c) => c.type === 'flower' || c.type === 'leaf');
  const all = [...goal, ...pick].sort((a, b) => a.x - b.x);
  const pickups = type === 'harvest' || type === 'ascent' || !pick.length ? quick : variantRoute(st, all);
  const usePick = pickups !== quick && type !== 'ascent' && pickups.time <= quick.time * 1.5 && pickups.perMin > quick.perMin + 0.5 && pickups.route.traced !== 'failed';
  return { quick, used: usePick ? pickups : quick };
}

export function silkLight(st: Stage): ((d: Dead) => number) | undefined {
  const w5 = st.proto?.w5;
  if (!w5) return undefined;
  const rest = w5.rest;
  return (d) => {
    const lo = Math.min(d.x0, d.x1), hi = Math.max(d.x0, d.x1);
    const inRest = rest ? Math.max(0, Math.min(hi, rest.x1) - Math.max(lo, rest.x0)) / Math.max(1, hi - lo) : 0;
    return 0.5 * (1 - inRest) + inRest;
  };
}

// ---- the shape measures ----

/**
 * Linearity (Smith & Whitehead): how close the centres of the platforms the route stands on lie to one straight line. The line is the
 * best fit through them (perpendicular least squares, so a straight climb is as linear as a flat run); 1 = all on the line, 0 = the
 * centres stray 300 px (about two jump heights) from it on average.
 */
export function linearity(pts: Array<{ x: number; y: number }>): number {
  if (pts.length < 3) return 1;
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p.x, 0) / n, my = pts.reduce((s, p) => s + p.y, 0) / n;
  let sxx = 0, syy = 0, sxy = 0;
  for (const p of pts) { sxx += (p.x - mx) ** 2; syy += (p.y - my) ** 2; sxy += (p.x - mx) * (p.y - my); }
  // the smaller eigenvalue of the scatter is the mean squared distance from the best line
  const tr = sxx + syy, det = sxx * syy - sxy * sxy;
  const small = tr / 2 - Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
  const rms = Math.sqrt(Math.max(0, small) / n);
  return Math.max(0, 1 - rms / 300);
}

/**
 * Leniency (-1 to 1): every action on the route weighted by how much a miss costs, then averaged. A hop or a jump with ground under
 * it +1 / +0.5, a jump over a pit -1, a landing on something moving +0.2, swings and climbs +0.5, puzzles +1, animals -0.5, timed
 * hazards and crumbling branches -0.5.
 */
export function leniency(st: Stage, route: Route, beats: Beat[]): number {
  const w: number[] = [];
  for (const e of routeJumps(route)) {
    const pit = !st.platforms.some((q) => q !== e.from && q !== e.to && !q.broken && q.x < Math.max(e.x, e.to.x + e.to.width / 2) && q.x + q.width > Math.min(e.x, e.to.x + e.to.width / 2) && q.y > Math.max(e.from.y, e.to.y) && q.y < Math.max(e.from.y, e.to.y) + 220);
    const moving = e.to.type === 'moving' || e.to.type === 'drift';
    w.push(moving ? 0.2 : pit && e.gap > 30 ? -1 : e.kind === 'hop' ? 1 : 0.5);
  }
  for (const b of beats) {
    if (b.letter === 'V') w.push(0.5);
    else if (b.letter === 'P') w.push(1);
    else if (b.letter === 'C' || b.letter === 'Z') w.push(-0.5);
  }
  return w.length ? w.reduce((s, v) => s + v, 0) / w.length : 1;
}

/** the platform pieces, props and art the roll uses */
function looks(st: Stage) {
  const styles = new Set<string>();
  for (const p of st.platforms) styles.add(`${p.type}${p.style ? `/${p.style}` : ''}`);
  const props = new Set<string>();
  for (const d of st.proto?.decor ?? []) props.add(`decor:${d.n ?? d.cel ?? '?'}`);
  for (const d of st.proto?.w3decor ?? []) props.add(`decor:${d.n}`);
  for (const e of st.enemies) props.add(`animal:${e.type}`);
  for (const c of st.collectibles) props.add(`pickup:${c.type}`);
  for (const r of st.kit?.rooms ?? []) for (const p of r.pieces) props.add(`kit:${p.kind}${'variant' in p && p.variant ? `/${p.variant}` : ''}`);
  const w4 = st.proto?.w4 as Record<string, unknown> | undefined;
  const w5 = st.proto?.w5 as Record<string, unknown> | undefined;
  for (const [k, v] of Object.entries({ ...(w4 ?? {}), ...(w5 ?? {}) })) if (Array.isArray(v) && v.length) props.add(`set:${k}`);
  if (st.proto?.bushes?.length) props.add('set:bushes');
  if (st.proto?.thorns?.length) props.add('set:thorns');
  if (st.zones?.length) for (const z of st.zones) props.add(`zone:${(z as { kind?: string }).kind ?? 'zone'}`);
  // a room's name without its number (a seesaw room is a seesaw room wherever it sits)
  const rooms = (st.kit?.rooms ?? []).map((r) => r.id.replace(/[-_]?\d+$/, ''));
  const pieces = (st.meta?.pieces?.map((p) => p.k) ?? st.meta?.chunks ?? []).map(String);
  return { styles: [...styles].sort(), props: [...props].sort(), rooms, pieces };
}

export interface RollOptions {
  /** run the kid and adult bots on this roll (slow: era.ts runs them on a sample) */
  bots?: boolean;
}

export function measureRoll(cfg: LevelConfig, variant: number, opt: RollOptions = {}): RollResult {
  const t0 = Date.now();
  const st = buildRoll(cfg, variant);
  const check = checkRoll(st);
  const R = pickRoute(cfg.objectiveType, st);
  const { route, samples, br } = R.used;
  const light = silkLight(st);
  const dn = deadTime(br.beats, br.total, NORMAL_GAP, samples, light);
  // a quiet stretch, by the seconds it counts for (World 5's silk keeps him moving: half)
  const quiet = dn.list.map((d) => d.counted);
  const tokens = actionTokens(br.beats, br.total);
  const mix: Partial<Record<Letter, number>> = {};
  for (const b of br.beats) mix[b.letter] = (mix[b.letter] ?? 0) + b.count;
  const beats = br.beats.reduce((s, b) => s + b.count, 0);
  const climb = isClimb(cfg, st);
  // the platforms the route stands on, in order, by their centres
  const seen = new Set<number>();
  const centres: Array<{ x: number; y: number }> = [];
  for (const s of route.segs) {
    const p = s.plat;
    if (!p || seen.has(p.id)) continue;
    seen.add(p.id);
    centres.push({ x: p.x + p.width / 2, y: p.y });
  }
  const ys = samples.map((s) => s.y);
  const lk = looks(st);
  let hot: RollResult['hot'] = null;
  if (opt.bots) {
    const easy = buildRoll(cfg, variant, true);
    const E = pickRoute(cfg.objectiveType, easy);
    const jN = inspectJumps(st, route, false, ADULT).filter((j) => j.rate !== null);
    const jE = inspectJumps(easy, E.used.route, true, KID).filter((j) => j.rate !== null);
    const min = (xs: number[]) => (xs.length ? Math.min(...xs) : null);
    hot = {
      adult: jN.filter((j) => j.rate! < RULES.adultHot).length,
      kid: jE.filter((j) => j.rate! < RULES.kidHot).length,
      worstAdult: min(jN.map((j) => j.rate!)),
      worstKid: min(jE.map((j) => j.rate!)),
    };
  }
  const designer = st.meta?.timing?.layoutSeconds;
  return {
    id: cfg.id,
    variant,
    attempt: st.meta?.attempt ?? null,
    ms: Date.now() - t0,
    traced: route.traced,
    ok: check.ok,
    errors: check.errors.slice(0, 3),
    errorKinds: [...new Set(check.errors.map(errorKind))],
    quick: R.quick.time,
    played: br.total,
    // (a generated stage's layoutSeconds is the layout alone, before its animals: not a quick player's time)
    designer: st.proto && designer ? designer : null,
    floor: RULES.minSeconds - (climb ? RULES.climbShort : 0),
    climb,
    dead: dn.total,
    deadRaw: dn.raw,
    longestQuiet: quiet.length ? Math.max(...quiet) : 0,
    quietOver: quiet.filter((q) => q > RULES.quietMax).length,
    beats,
    perMin: (beats / Math.max(1, br.total)) * 60,
    mix,
    action: tokenString(tokens),
    prof: [...profile(tokens)],
    wins: lookWindows(br.beats, br.total),
    linearity: linearity(centres),
    leniency: leniency(st, route, br.beats),
    vertical: ys.length ? Math.max(...ys) - Math.min(...ys) : 0,
    platforms: st.platforms.length,
    routePlatforms: seen.size,
    geo: hash(st.platforms.map((p) => `${Math.round(p.x / 20)},${Math.round(p.y / 20)},${Math.round(p.width / 20)}`).sort().join(';')),
    ...lk,
    hot,
  };
}

/**
 * The guard's check of one roll (rollGuard.test.ts): the length rule on the quickest way through and the level check, nothing else (so a
 * sample of every stage stays quick enough for the test suite).
 */
export function guardRoll(cfg: LevelConfig, variant: number): { quick: number; floor: number; ok: boolean; errors: string[] } {
  const st = buildRoll(cfg, variant);
  const check = checkRoll(st);
  const quick = variantRoute(st, goalTargets(cfg.objectiveType, st)).time;
  return { quick, floor: RULES.minSeconds - (isClimb(cfg, st) ? RULES.climbShort : 0), ok: check.ok, errors: check.errors };
}

/** a short hash of a string (FNV-1a, hex) */
export function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16);
}

/** the stage's own length target for a quick player (protoStage.ts STAGE_SECONDS), for the report */
export const targetFor = (id: string) => STAGE_SECONDS[id] ?? EXPERT_SECONDS;
