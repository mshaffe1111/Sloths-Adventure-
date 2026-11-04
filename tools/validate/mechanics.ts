/**
 * The mechanics-in-use table (R-150.4; STAGE-RULES §0.1 "everything builds on everything", §0b.5 pairs) and the quality supervisor's
 * added checks (2026-11-04 review): what a miss costs, padding in the finish, escalation in order, tempo, enemy jobs.
 * Everything is read from the stage as the engine builds it (core.ts build: RealPlay, D19).
 */
import type { Platform } from '../../src/game/types.ts';
import type { Built, Step } from './core.ts';

type Eng = Record<string, any>;

/** every mechanic the engine has, in any world (what a stage can use), with how to count it on a built stage */
export interface Mech { id: string; label: string; group: 'move' | 'hazard' | 'animal' | 'puzzle'; count: (st: Eng, e: Eng) => number }
const n = (x: unknown[] | undefined | null) => (x ? x.length : 0);
const plats = (st: Eng, f: (p: Platform) => boolean) => (st.platforms as Platform[]).filter(f).length;
export const MECHS: Mech[] = [
  { id: 'gap', label: 'gaps to jump', group: 'move', count: (st) => plats(st, (p) => p.type === 'solid') },
  { id: 'mushroom', label: 'mushroom bounce', group: 'move', count: (st) => plats(st, (p) => p.type === 'bouncy') },
  { id: 'liana', label: 'liana swing', group: 'move', count: (st) => st.vines.filter((v: Eng) => v.vineType === 'swing_liana' || v.isSwingingVine).length },
  { id: 'trunk', label: 'trunk climb', group: 'move', count: (st) => st.vines.filter((v: Eng) => v.vineType === 'tree_climb').length },
  { id: 'silk', label: 'silk line', group: 'move', count: (st) => st.vines.filter((v: Eng) => v.silk).length },
  { id: 'rope', label: 'rope shimmy', group: 'move', count: (st) => n(st.ropes) },
  { id: 'updraft', label: 'warm air (glide)', group: 'move', count: (st) => n(st.updrafts) },
  { id: 'moving', label: 'moving platform', group: 'move', count: (st) => plats(st, (p) => p.type === 'moving' && !p.lift) },
  { id: 'lift', label: 'lift', group: 'move', count: (st) => plats(st, (p) => !!p.lift) },
  { id: 'drift', label: 'river logs', group: 'move', count: (st) => plats(st, (p) => p.type === 'drift') },
  { id: 'breaking', label: 'breaking branch', group: 'hazard', count: (st) => plats(st, (p) => p.type === 'fragile' || p.crumbleAfter !== undefined) },
  { id: 'chase', label: 'collapsing branch (chase)', group: 'hazard', count: (_st, e) => (e.proto?.chase ? 1 : 0) },
  { id: 'eagle', label: 'eagle / watcher', group: 'hazard', count: (_st, e) => n(e.proto?.watch) },
  { id: 'bush', label: 'bushes to hide in', group: 'hazard', count: (_st, e) => n(e.proto?.bushes) },
  { id: 'thorn', label: 'thorn vine', group: 'hazard', count: (_st, e) => n(e.proto?.thorns) },
  // (water that matters: rivers and the water signs that warn of it; a hand stage's waterY under its soft moss is not a hazard)
  { id: 'water', label: 'water / river', group: 'hazard', count: (st) => n(st.rivers) + n(st.waterSigns) },
  ...['wind', 'web', 'spore', 'dark', 'tide', 'crumble', 'geyser', 'bolt'].map((k) => ({ id: `zone:${k}`, label: k === 'crumble' ? 'crumbling floor' : k, group: 'hazard' as const, count: (st: Eng) => (st.zones ?? []).filter((z: Eng) => z.kind === k).length })),
  ...['snake', 'boa', 'turtle', 'frog', 'ocelot', 'jaguar', 'spider', 'tayra', 'eagle', 'caiman', 'harpy'].map((k) => ({ id: `animal:${k}`, label: k === 'turtle' ? 'snapper' : k === 'eagle' ? 'eagle (swooper)' : k, group: 'animal' as const, count: (st: Eng) => st.enemies.filter((m: Eng) => m.type === k).length })),
  { id: 'ring', label: 'snake ring', group: 'animal', count: (_st, e) => n(e.proto?.ring?.waves) },
  { id: 'push', label: 'log / boulder to push', group: 'puzzle', count: (st) => plats(st, (p) => !!p.push) },
  { id: 'room', label: 'puzzle room', group: 'puzzle', count: (st) => n(st.kit?.rooms) },
  { id: 'cage', label: 'cage to free', group: 'puzzle', count: (st) => st.collectibles.filter((c: Eng) => c.type === 'cage').length },
  { id: 'find', label: 'hidden find', group: 'puzzle', count: (st) => st.collectibles.filter((c: Eng) => c.type === 'find' || c.type === 'relic').length },
];

/** the six things §0b.5 pairs (run, jump, branches, vines, wind, slow): which a stage holds */
export function sixThings(st: Eng, e: Eng): string[] {
  const has = (id: string) => MECHS.find((m) => m.id === id)!.count(st, e) > 0;
  const out = ['run', 'jump'];
  if (has('breaking') || has('chase')) out.push('branches');
  if (has('liana') || has('trunk') || has('silk')) out.push('vines');
  if (has('zone:wind') || has('updraft')) out.push('wind');
  if (has('zone:web') || has('zone:spore') || has('zone:crumble')) out.push('slow');
  return out;
}
export const pairsOf = (things: string[]) => things.flatMap((a, i) => things.slice(i + 1).map((b) => `${a}+${b}`));

/** a stage's row: each mechanic's count from its data */
export function mechRow(b: Built): Record<string, number> {
  const st = b.stage as Eng, e = b.sim.e as Eng;
  const row: Record<string, number> = {};
  for (const m of MECHS) row[m.id] = m.count(st, e);
  return row;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// What a miss costs (the supervisor's challenge check: "nothing bites")

export type Cost = 'nothing' | 'setback' | 'life' | 'unknown';
export interface Beat2 { step: Step; cost: Cost; why: string }
/**
 * For every jump, swing, branch and eagle beat, what failing it costs, in the quality supervisor's three levels (2026-11-04): nothing (soft
 * moss or ground he lands on: a free retry), a setback (seconds or a heart: an eagle's strike, Easy's soft fall that puts him back), or a
 * life (no ground under the gap, or water). A jump the level check cannot confirm is not priced (unknown). The chase's markers (1-8, every
 * 1.5 s of running) are its pressure, not a beat to miss: left out here, judged by the chase probe (play.ts).
 */
export function missCost(b: Built): Beat2[] {
  const st = b.stage as Eng;
  const ps = (st.platforms as Platform[]).filter((p) => !p.broken && p.type !== 'bouncy');
  const waterY: number = st.waterY ?? st.config.levelHeight + 100;
  const deadly = (y: number) => (st.deepFall !== undefined && y >= st.deepFall) || y >= waterY;
  const under = (x0: number, x1: number, y: number): Cost => {
    const lo = Math.min(x0, x1), hi = Math.max(x0, x1);
    const mid = (lo + hi) / 2;
    // (the take-off's own level counts: a missed hop straight up, or onto a higher ledge, falls back onto the ground he left)
    const below = ps.filter((p) => p.x <= mid && p.x + p.width >= mid && p.y >= y - 4).sort((a, c) => a.y - c.y)[0];
    // (Easy's falls are soft, easyMode.ts: a fall puts him back a little, a setback)
    if (!below || deadly(below.y)) return b.setting === 'easy' ? 'setback' : 'life';
    return 'nothing';
  };
  const out: Beat2[] = [];
  const segs = b.route.segs;
  for (const s of b.steps) {
    if (!'JjUQVBMCRXE'.includes(s.m) || /collapses behind/.test(s.what)) continue;
    if (s.m === 'E') {
      out.push({ step: s, cost: /again/.test(s.what) ? 'setback' : 'nothing', why: /again/.test(s.what) ? 'a pass that can strike: a heart' : "the stretch's first pass only warns" });
      continue;
    }
    if (s.m === 'Q') {
      // (the route took it on trust: a mushroom wall or a puzzle piece the check does not model; it is not priced, and the page counts it)
      out.push({ step: s, cost: 'unknown', why: 'a jump the level check cannot confirm (usually a mushroom wall): not priced' });
      continue;
    }
    if (s.m === 'C') {
      out.push({ step: s, cost: 'nothing', why: 'a climb: let go and he drops back to where he started' });
      continue;
    }
    // (the route segment this move came from: the one starting at the step's spot)
    const seg = segs.find((g) => Math.abs(g.x0 - s.x) < 2 && Math.abs(g.y0 - s.y) < 2) ?? segs.find((g) => Math.abs(g.x0 - s.x) < 40);
    const x1 = seg ? seg.x1 : s.x + 120;
    const cost = s.m === 'j' ? 'nothing' : under(s.x, x1, Math.max(s.y, seg?.y1 ?? s.y));
    out.push({ step: s, cost, why: cost === 'nothing' ? 'ground or soft moss below: a free retry' : cost === 'setback' ? 'a soft fall that puts him back (Easy)' : 'nothing below, or water: a miss costs a life' });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Padding: the finish (every World 1 finish is fillTo(): a shuffle bag of three pieces until the clock says two minutes, w1Sections.ts)

export interface Padding { finishShare: number; finishFrom: number; pieces: string[]; repeats: Array<{ k: string; n: number }> }
export function padding(b: Built): Padding | null {
  const st = b.stage as Eng;
  const fin = (st.proto?.beats as Array<[number, number, string]> | undefined)?.find((x) => /^Finish/.test(x[2]));
  if (!fin) return null;
  const inFin = b.steps.filter((s) => s.x >= fin[0]);
  const t0 = inFin[0]?.t ?? b.total;
  const pieces: string[] = ((st.meta?.pieces ?? []) as Array<{ k: string; x0: number; x1: number }>).filter((p) => p.x0 >= fin[0] - 2).map((p) => p.k);
  const counts = new Map<string, number>();
  for (const k of pieces) counts.set(k, (counts.get(k) ?? 0) + 1);
  return { finishShare: +((b.total - t0) / Math.max(1, b.total)).toFixed(2), finishFrom: Math.round(t0), pieces, repeats: [...counts].filter(([, c]) => c > 2).map(([k, c]) => ({ k, n: c })) };
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Tempo (§0b.3: every mechanic has a hurry version and a patience version; a stage that only asks one tempo is flat)

/** a move's tempo: hurry (keep going: breaking branches, the chase, a burst), patience (wait: the eagle, a still spot, a timed hazard) */
export const tempoOf = (s: Step): 'hurry' | 'patience' | null =>
  s.m === 'B' ? 'hurry' : s.m === 'E' || s.m === 'W' || s.m === 'Z' || /stand still|wait|time the|doze|ease/.test(s.what) ? 'patience' : null;

// ---------------------------------------------------------------------------------------------------------------------------------
// Enemy jobs (R-159; research §6: never within 150 px of a landing, about 35% of the stage enemy-free)

export interface EnemyJob { type: string; x: number; nearLanding: number | null; onRoute: boolean }
export const LANDING_CLEAR = 150;
export const ENEMY_FREE_TARGET = 0.35;
export function enemyJobs(b: Built): { jobs: EnemyJob[]; freeShare: number } {
  const st = b.stage as Eng;
  const lands = b.route.segs.filter((g) => g.kind === 'jump' || g.kind === 'hop' || g.kind === 'bounce' || g.kind === 'swing' || g.kind === 'glide').map((g) => ({ x: g.x1, y: g.y1 }));
  const jobs: EnemyJob[] = [];
  for (const m of st.enemies as Eng[]) {
    if (m.type === 'eagle') continue;
    const lo = Math.min(m.patrolMinX ?? m.x, m.x), hi = Math.max(m.patrolMaxX ?? m.x, m.x);
    const surface = m.y + m.height;
    const near = lands.filter((l) => Math.abs(l.y - surface) < 40 && l.x > lo - LANDING_CLEAR && l.x < hi + LANDING_CLEAR);
    const d = near.length ? Math.round(Math.min(...near.map((l) => (l.x < lo ? lo - l.x : l.x > hi ? l.x - hi : 0)))) : null;
    const onRoute = b.samples.some((s) => s.x > lo - 20 && s.x < hi + 20 && Math.abs(s.y - surface) < 30);
    jobs.push({ type: m.type, x: Math.round(m.x), nearLanding: d, onRoute });
  }
  // (the share of the route's length with no animal within 300 px of it)
  const xs = b.samples.map((s) => s.x);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  let free = 0, all = 0;
  for (let x = x0; x < x1; x += 50) {
    all++;
    if (!(st.enemies as Eng[]).some((m) => m.type !== 'eagle' && x > Math.min(m.patrolMinX ?? m.x, m.x) - 300 && x < Math.max(m.patrolMaxX ?? m.x, m.x) + 300)) free++;
  }
  return { jobs, freeShare: all ? +(free / all).toFixed(2) : 1 };
}
