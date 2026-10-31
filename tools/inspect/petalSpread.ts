/**
 * Petal spread: "getting this spread out better" (Matt, 2026-10-30). A development tool: never shipped; it only reads src/game.
 *
 *   npx tsx tools/inspect/petalSpread.ts [--stages 1-2,3-4] [--roll 1] [--diff easy] [--json out.json]
 *
 * Every stage is built the way the game builds it (setLayoutVariant + generateStage + withGoals). Per stage it prints:
 *   - n: the petals; goal: a harvest's target;
 *   - screen: the most petals on one screen (petals.ts busiestScreen, at most PER_SCREEN);
 *   - gap: the longest petal-free stretch along the route (px, start to first petal, between petals, last petal to the shrine), along x,
 *     or along y on a climb;
 *   - trails: runs of 3+ petals each within TRAIL_LINK of the next; led: how many of them lead to something (a climb, a jump, a goal
 *     item, a heart or the shrine within LEAD of one end or along the trail); singles: petals in no trail.
 * Then the per-world medians.
 */
import '../../src/game/headlessDom.ts';
import fs from 'node:fs';
import { generateStage, setLayoutVariant, type GeneratedStage } from '../../src/game/stageGenerator.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { withGoals } from '../../src/game/goals.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { busiestScreen, isPetal } from '../../src/game/petals.ts';
import { jumpEdges } from '../../src/game/stageMetrics.ts';
import type { Collectible } from '../../src/game/types.ts';

const g = globalThis as { location?: unknown };
g.location ??= { search: '' };

const argv = process.argv.slice(2);
const get = (k: string) => {
  const i = argv.indexOf(k);
  return i >= 0 ? argv[i + 1] : undefined;
};
const only = get('--stages')?.split(',');
const ROLL = Number(get('--roll') ?? 1);
const DIFF = (get('--diff') ?? 'normal') as 'normal' | 'easy';
const out = get('--json');

export const TRAIL_LINK = 260;
export const LEAD = 300;
const GOALS = new Set<Collectible['type']>(['relic', 'cage', 'find', 'seed', 'heart', 'super_heart', 'powerup_speed', 'powerup_invincible', 'powerup_magnet', 'thorn_gate']);

export interface Spread { id: string; n: number; goal: number; screen: number; gap: number; trails: number; led: number; singles: number }

/** the route's direction: a climb runs along y */
function routeAxis(st: GeneratedStage) {
  const exit = st.collectibles.find((c) => c.type === 'exit_totem');
  const ex = exit?.x ?? st.exitTotemX;
  const ey = exit?.y ?? st.exitTotemY;
  const up = Math.abs(ey - st.spawnY) > Math.abs(ex - st.spawnX);
  return { up, at: (x: number, y: number) => (up ? -y : x), start: up ? -st.spawnY : st.spawnX, end: up ? -ey : ex };
}

export function trails(petals: readonly Collectible[]): Collectible[][] {
  const left = [...petals];
  const out: Collectible[][] = [];
  while (left.length) {
    const t = [left.pop()!];
    for (let i = 0; i < t.length; i++) {
      for (let k = left.length - 1; k >= 0; k--) {
        if (Math.hypot(left[k].x - t[i].x, left[k].y - t[i].y) < TRAIL_LINK) t.push(...left.splice(k, 1));
      }
    }
    out.push(t);
  }
  return out;
}

/** a trail leads to something: a climb, a jump, a goal item, a heart or the shrine along it or within LEAD of it */
export function leads(st: GeneratedStage, t: readonly Collectible[]): boolean {
  const near = (x: number, y: number) => t.some((c) => Math.hypot(c.x - x, c.y - y) < LEAD);
  if (st.collectibles.some((c) => GOALS.has(c.type) && near(c.x, c.y))) return true;
  if (near(st.exitTotemX, st.exitTotemY)) return true;
  if (st.vines.some((v) => t.some((c) => Math.abs(c.x - v.x) < 140 && c.y > v.topY - 120 && c.y < v.bottomY + 40))) return true;
  if ((st.ropes ?? []).length && t.some((c) => (st.ropes ?? []).some((r) => c.x > r.x0 && c.x < r.x1))) return true;
  if (jumpEdges(st).some((j) => t.some((c) => c.x > j.takeoffX - 40 && c.x < j.landX + 40 && c.y < Math.max(j.from.y, j.to.y)))) return true;
  // (a rising line: up a stair of ledges)
  const ys = t.map((c) => c.y);
  return Math.max(...ys) - Math.min(...ys) > 160;
}

export function spread(st: GeneratedStage): Spread {
  const petals = st.collectibles.filter((c) => isPetal(c, st));
  const ax = routeAxis(st);
  const ts = [ax.start, ...petals.map((c) => ax.at(c.x, c.y)), ax.end].sort((a, b) => a - b);
  let gap = 0;
  for (let i = 1; i < ts.length; i++) gap = Math.max(gap, ts[i] - ts[i - 1]);
  const tr = trails(petals);
  const real = tr.filter((t) => t.length >= 3);
  return {
    id: st.config.id,
    n: petals.length,
    goal: st.config.objectiveType === 'harvest' ? st.config.targetCount : 0,
    screen: busiestScreen(petals).n,
    gap: Math.round(gap),
    trails: real.length,
    led: real.filter((t) => leads(st, t)).length,
    singles: tr.filter((t) => t.length < 3).reduce((s, t) => s + t.length, 0),
  };
}

export function build(cfg: ReturnType<typeof generateAllLevels>[number], roll: number, diff: 'normal' | 'easy'): GeneratedStage {
  setLayoutVariant(roll);
  try {
    const st = withGoals(generateStage({ ...cfg, unlocked: true }, diff));
    return diff === 'easy' ? easyStage(st) : st;
  } finally {
    setLayoutVariant(null);
  }
}

if (process.argv[1]?.endsWith('petalSpread.ts')) {
  const levels = generateAllLevels().filter((l) => l.objectiveType !== 'boss_lair' && (!only || only.includes(l.id)));
  const rows: Spread[] = [];
  for (const l of levels) {
    const r = spread(build(l, ROLL, DIFF));
    rows.push(r);
    console.log(`${r.id.padEnd(5)} n=${String(r.n).padStart(3)} goal=${String(r.goal).padStart(2)} screen=${r.screen} gap=${String(r.gap).padStart(5)} trails=${String(r.trails).padStart(2)} led=${String(r.led).padStart(2)} singles=${r.singles}`);
  }
  const med = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? 0;
  console.log('\nworld  stages  n(med)  screen(max)  gap(med/max)  led/trails  singles(med)');
  for (let w = 1; w <= 10; w++) {
    const rs = rows.filter((r) => r.id.startsWith(`${w}-`));
    if (!rs.length) continue;
    const sum = (k: keyof Spread) => rs.reduce((s, r) => s + (r[k] as number), 0);
    console.log(`W${String(w).padEnd(5)} ${String(rs.length).padStart(6)}  ${String(med(rs.map((r) => r.n))).padStart(6)}  ${String(Math.max(...rs.map((r) => r.screen))).padStart(11)}  ${String(med(rs.map((r) => r.gap))).padStart(5)}/${String(Math.max(...rs.map((r) => r.gap))).padEnd(6)}  ${String(sum('led')).padStart(4)}/${String(sum('trails')).padEnd(6)} ${med(rs.map((r) => r.singles))}`);
  }
  if (out) fs.writeFileSync(out, JSON.stringify(rows, null, 1));
}
