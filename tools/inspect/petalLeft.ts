/**
 * petalLeft: the first-timer bot on stage rolls, and every petal it leaves, classified (fix-petals, 2026-11-01; the method's pitfall
 * "the goal can be the unfair spot"):
 *   - where it lies: on the walking floor, on a bough (a raised ledge), or in the air (an arc over a gap, a climb's);
 *   - how the run met it: passed over (his reach point, 20 px over his feet, went by more than 34 px above it), passed under, a near miss
 *     (within 34-70 px: near-over when he went by above it, near-under below), or never near (he never came within 30 px of its x);
 *   - and for a petal on a ledge, how high it floats over it (34 px is his middle, the old float).
 *   npx tsx tools/inspect/petalLeft.ts 1-2 normal 1,2,3 [trials=2] [--each]
 * Prints a table per run and the totals, and with --each every petal left.
 */
import { RealPlay } from '../../src/game/realPlay.ts';
import { FT_ADULT, FT_KID, firstTimer } from './firsttimer.ts';
import type { Collectible, Platform } from '../../src/game/types.ts';

const args = process.argv.slice(2);
const each = args.includes('--each');
const pos = args.filter((a) => !a.startsWith('--'));
const ids = (pos[0] ?? '1-2').split(',');
const diff = pos[1] ?? 'normal';
const seeds = (pos[2] ?? '1,2,3').split(',').map(Number);
const trials = Number(pos[3] ?? 2);
const who = diff === 'easy' ? FT_KID : FT_ADULT;

// (every sim the run makes, with its frames: the bot's probes make throwaway ones; the run's own plays the most)
const sims = new Map<RealPlay, Array<{ x: number; y: number }>>();
const orig = RealPlay.prototype.frame;
RealPlay.prototype.frame = function (this: RealPlay, pad: unknown) {
  const r = (orig as (this: RealPlay, pad: unknown) => unknown).call(this, pad);
  let t = sims.get(this);
  if (!t) sims.set(this, (t = []));
  t.push({ x: this.p.x, y: this.p.y });
  return r;
} as typeof RealPlay.prototype.frame;

export type Where = 'floor' | 'bough' | 'air';
export type How = 'over' | 'under' | 'near-over' | 'near-under' | 'never';
export function classify(c: Collectible, platforms: readonly Platform[], floorY: number, path: ReadonlyArray<{ x: number; y: number }>) {
  const under = platforms
    .filter((p) => c.x >= p.x - 2 && c.x <= p.x + p.width + 2 && p.y > c.y && p.y - c.y < 70)
    .sort((a, b) => a.y - b.y)[0];
  const where: Where = !under ? 'air' : Math.abs(under.y - floorY) <= 40 ? 'floor' : 'bough';
  const near = path.filter((q) => Math.abs(q.x - c.x) < 30);
  let how: How = 'never';
  if (near.length) {
    const d = near.map((q) => q.y - 20 - c.y);
    const best = d.reduce((m, v) => (Math.abs(v) < Math.abs(m) ? v : m), Infinity);
    // (near: his reach point passed 34-70 px from it, above it (near-over: a hop flew over it) or below)
    how = Math.abs(best) < 70 ? (best < 0 ? 'near-over' : 'near-under') : best < 0 ? 'over' : 'under';
  }
  return { where, how, float: under ? Math.round(under.y - c.y) : null, end: under ? Math.round(Math.min(c.x - under.x, under.x + under.width - c.x)) : null, width: under ? Math.round(under.width) : null };
}

const tot: Record<string, number> = {};
for (const id of ids) {
  for (const seed of seeds) {
    for (let trial = 0; trial < trials; trial++) {
      sims.clear();
      const r = firstTimer(id, seed, who, { trial } as never);
      const [s, track] = [...sims.entries()].sort((a, b) => b[1].length - a[1].length)[0] ?? [];
      if (!s || !track) continue;
      const floorY = s.stage.spawnY;
      const left = s.collectibles.filter((c) => c.type === 'flower' && !c.collected && !c.hidden && !c.findId);
      const row: Record<string, number> = {};
      const lines: string[] = [];
      for (const c of left) {
        const k = classify(c, s.platforms, floorY, track);
        const key = `${k.where} ${k.how}`;
        row[key] = (row[key] ?? 0) + 1;
        tot[key] = (tot[key] ?? 0) + 1;
        if (each) lines.push(`    #${c.id} (${Math.round(c.x)}, ${Math.round(c.y)}) ${key}${k.float != null ? ` float ${k.float} end ${k.end} width ${k.width}` : ''}`);
      }
      const cells = Object.entries(row).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ');
      console.log(`${id} ${diff} seed ${seed} trial ${trial}: ${r.end} ${r.time}s goal ${r.goal.got}/${r.goal.need} left ${left.length}: ${cells}`);
      if (lines.length) console.log(lines.join('\n'));
    }
  }
}
console.log('total:', Object.entries(tot).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
