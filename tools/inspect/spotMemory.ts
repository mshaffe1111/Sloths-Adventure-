/**
 * Spot memory: "I can tell you exactly where the four snakes are, where the flowers end up" (Matt, 2026-10-30). A development tool:
 * never shipped; it only reads src/game. Written for reference/GEN2-W1-4-PLAN.md.
 *
 *   npx tsx tools/inspect/spotMemory.ts --stages 1-3,2-5,6-1 [--rolls 16] [--tol 0.04] [--json out.json]
 *
 * era.ts measures how alike two rolls are in the ORDER of things to do (action 3-grams). This measures what a player remembers: WHERE
 * things are. Each stage is built `--rolls` times the way the game builds it on entry (setLayoutVariant + generateStage, Normal), and
 * every enemy and every pickup is placed at its share of the way from the start to the shrine (0..1, along x, or along y for a climb,
 * so a roll that is longer or shorter still lines up). For each pair of rolls it then counts:
 *   - enemySpot: the share of one roll's enemies that have an enemy of the SAME kind in the other roll within `--tol` of the way
 *     (0.04 = 4% of the stage, about one phone screen on a 10-20k px stage), both ways, averaged;
 *   - trailSpot: the same for the pickup TRAILS (petals/flowers/fruit/relics/cages): pickups closer than 1.5% of the way to the next
 *     are one trail, and a trail matches when the other roll has a trail centred within `--ttol` (default 1%) of its centre (single pickups dense
 *     enough to cover the whole stage would match everywhere, so trails are what a player remembers);
 *   - enemyOrder: how alike the order of enemy kinds is (1 - edit distance / longer length);
 *   - enemyCount: the fewest and most enemies over the rolls.
 * 1.00 means "every snake is where it was last time"; a fully fresh layout of the same kinds and counts sits near 2 x tol x density,
 * well under 0.5 for most stages. gen2 stages (gen2/game.ts) are built from their shipped rolls (variant 0..n-1, one each), the rest
 * from era.ts's rollVariants (the game's own spread of layout numbers).
 */
import '../../src/game/headlessDom.ts';
import fs from 'node:fs';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { GEN2_STAGES, gen2SeedCount } from '../../src/game/gen2/game.ts';
import { rollVariants } from './era.ts';

const argv = process.argv.slice(2);
const get = (k: string) => {
  const i = argv.indexOf(k);
  return i >= 0 ? argv[i + 1] : undefined;
};
const stages = (get('--stages') ?? '1-1,1-3,1-9,2-1,2-5,3-3,3-9,4-2,4-8,6-1,6-5,7-1').split(',');
const ROLLS = Number(get('--rolls') ?? 16);
const TOL = Number(get('--tol') ?? 0.04);
/** the trails' tolerance: tighter, since a stage holds 15-30 trails (one every 3-6% of the way) */
const TTOL = Number(get('--ttol') ?? 0.01);
const out = get('--json');

const levels = new Map(generateAllLevels().map((c) => [c.id, c]));
const PICKUPS = new Set(['fruit', 'flower', 'leaf', 'relic', 'cage', 'find', 'seed']);

interface Spot { kind: string; t: number }
interface Roll { enemies: Spot[]; pickups: Spot[] }

function buildRoll(id: string, variant: number): Roll {
  const cfg = levels.get(id);
  if (!cfg) throw new Error(`no stage ${id}`);
  setLayoutVariant(variant);
  try {
    const st = generateStage({ ...cfg, unlocked: true }, 'normal');
    const exit = st.collectibles.find((c) => c.type === 'exit_totem');
    const ex = exit?.x ?? Math.max(...st.platforms.map((p) => p.x + p.width));
    const ey = exit?.y ?? st.spawnY;
    const dx = ex - st.spawnX, dy = ey - st.spawnY;
    const up = Math.abs(dy) > Math.abs(dx);
    const at = (x: number, y: number) => (up ? (y - st.spawnY) / (dy || 1) : (x - st.spawnX) / (dx || 1));
    const enemies = st.enemies.map((e) => ({ kind: String(e.type), t: at(e.x, e.y) })).sort((a, b) => a.t - b.t);
    const pickups = st.collectibles.filter((c) => PICKUPS.has(c.type)).map((c) => ({ kind: c.type, t: at(c.x, c.y) })).sort((a, b) => a.t - b.t);
    return { enemies, pickups };
  } finally {
    setLayoutVariant(null);
  }
}

/** the share of a's spots with a same-kind spot in b within TOL, and the other way, averaged (1 when both are empty) */
function spotMatch(a: Spot[], b: Spot[], tol = TOL): number {
  const one = (p: Spot[], q: Spot[]) => (p.length ? p.filter((s) => q.some((r) => r.kind === s.kind && Math.abs(r.t - s.t) <= tol)).length / p.length : 1);
  return (one(a, b) + one(b, a)) / 2;
}

/** pickups closer than 1.5% of the way to the next one make one trail, placed at its centre */
function trails(ps: Spot[]): Spot[] {
  const out: Spot[] = [];
  let a = 0;
  for (let i = 1; i <= ps.length; i++)
    if (i === ps.length || ps[i].t - ps[i - 1].t > 0.015) {
      if (i > a) out.push({ kind: 'trail', t: (ps[a].t + ps[i - 1].t) / 2 });
      a = i;
    }
  return out;
}

function orderAlike(a: string[], b: string[]): number {
  const n = a.length, m = b.length;
  if (!n && !m) return 1;
  const d = Array.from({ length: n + 1 }, (_, i) => [i, ...Array(m).fill(0)]);
  for (let j = 1; j <= m; j++) d[0][j] = j;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[n][m] / Math.max(n, m);
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : NaN);
const fmt = (x: number) => (Number.isNaN(x) ? 'n/a' : +x.toFixed(2));
console.log(['stage', 'built', 'rolls', 'enemySpot', 'trailSpot', 'enemyOrder', 'enemies', 'pickups', 'trails', 'kinds'].join('\t'));
const rows: Array<Record<string, string | number>> = [];

for (const id of stages) {
  const gen2 = !!GEN2_STAGES[id];
  const n = gen2 ? Math.min(ROLLS, gen2SeedCount(id)) : ROLLS;
  const variants = gen2 ? Array.from({ length: n }, (_, i) => i) : rollVariants(n);
  const rolls = variants.map((v) => buildRoll(id, v));
  const es: number[] = [], ps: number[] = [], os: number[] = [];
  for (let i = 0; i < rolls.length; i++)
    for (let j = i + 1; j < rolls.length; j++) {
      // (a pair where either roll has no enemies says nothing about where they are: left out, not counted as alike)
      if (rolls[i].enemies.length && rolls[j].enemies.length) es.push(spotMatch(rolls[i].enemies, rolls[j].enemies));
      ps.push(spotMatch(trails(rolls[i].pickups), trails(rolls[j].pickups), TTOL));
      if (rolls[i].enemies.length && rolls[j].enemies.length) os.push(orderAlike(rolls[i].enemies.map((s) => s.kind), rolls[j].enemies.map((s) => s.kind)));
    }
  const counts = rolls.map((r) => r.enemies.length);
  const kinds = [...new Set(rolls.flatMap((r) => r.enemies.map((e) => e.kind)))].join('/');
  const row = {
    stage: id,
    built: gen2 ? 'gen2' : 'hand',
    rolls: rolls.length,
    enemySpot: fmt(mean(es)),
    trailSpot: fmt(mean(ps)),
    enemyOrder: fmt(mean(os)),
    enemies: `${Math.min(...counts)}-${Math.max(...counts)}`,
    pickups: `${Math.min(...rolls.map((r) => r.pickups.length))}-${Math.max(...rolls.map((r) => r.pickups.length))}`,
    trails: `${Math.min(...rolls.map((r) => trails(r.pickups).length))}-${Math.max(...rolls.map((r) => trails(r.pickups).length))}`,
    kinds,
  };
  rows.push(row);
  console.log(Object.values(row).join('\t'));
}
if (out) fs.writeFileSync(out, JSON.stringify({ tol: TOL, ttol: TTOL, rows }, null, 2));
