// gen2 1-1's squirrels (the lead 11-06, 0.9.5): at least SQUIRREL_MIN per roll from w1-new, on banks and the ground, never in the play band
// or over a socket, the pose varied per roll (w1.ts w1Squirrels, run by w1Finish).
import '../../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from '../../worldsData.ts';
import { buildPlayStage, provenSeeds } from '../seedList.ts';
import { SQUIRREL_MIN, w1Finish, w1Squirrels, w1World } from './w1.ts';
import { w1DressWidth } from '../../w1NewArt.ts';
import type { Platform } from '../../types.ts';

const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
type St = Parameters<typeof w1Squirrels>[0];
const squirrelsOf = (st: St) => (st.proto?.mixDress ?? []).filter((d) => d.n.startsWith('squirrel'));

/** every breach of the squirrel rules on a dressed stage, by name */
function breaches(st: St): string[] {
  const out: string[] = [];
  const sq = squirrelsOf(st);
  if (sq.length < SQUIRREL_MIN) out.push(`${sq.length} squirrels, under ${SQUIRREL_MIN}`);
  for (const d of sq) {
    const w = w1DressWidth(d.n), x0 = d.x - w / 2, x1 = d.x + w / 2;
    const on = st.platforms.find((p) => p.type === 'solid' && p.height >= 90 && p.style !== 'log' && p.style !== 'branch' && p.y === d.b && p.x <= x0 && p.x + p.width >= x1);
    if (!on) out.push(`${d.n} at x ${d.x} stands on no bank`);
    if (st.platforms.some((p) => p !== on && p.x < x1 && p.x + p.width > x0 && p.y < d.b && p.y + p.height > d.b - 70)) out.push(`${d.n} at x ${d.x} stands in the play band`);
    for (const c of st.collectibles ?? []) if (Math.abs(c.x - d.x) < w / 2 + 70 && c.y > d.b - 260 && c.y < d.b + 40) out.push(`${d.n} at x ${d.x} is over a pickup at x ${c.x}`);
  }
  return out;
}

test('every proven roll of the first 12 is dressed with its squirrels on banks, clear of the play band and the sockets, on both settings', () => {
  const poses = new Set<string>();
  for (const seed of provenSeeds('1-1').slice(0, 12)) for (const difficulty of ['normal', 'easy'] as const) {
    const st = w1Finish(buildPlayStage(cfg, w1World(), seed, difficulty)) as unknown as St;
    assert.deepEqual(breaches(st), [], `seed ${seed} ${difficulty}`);
    poses.add(squirrelsOf(st).map((d) => d.n).join());
  }
  assert.ok(poses.size >= 4, `the poses vary roll to roll: ${[...poses].join(' | ')}`);
});

test('planted: the rules catch a squirrel off its bank, one in the play band, and one over a pickup; a stage with no bank throws', () => {
  const ground = { id: 1, x: 0, y: 1000, width: 2000, height: 200, type: 'solid', style: 'moss_stone' } as Platform;
  const st: St = { platforms: [ground], spawnX: 100, spawnY: 1000, collectibles: [], gen2: { seed: 3, sections: [] } };
  w1Squirrels(st);
  assert.deepEqual(breaches(st), []);
  const a = structuredClone(st); a.proto!.mixDress![0].b = 900;
  assert.match(breaches(a).join(), /stands on no bank/);
  const b = structuredClone(st); const d = b.proto!.mixDress![0];
  b.platforms.push({ id: 2, x: d.x - 20, y: d.b - 50, width: 40, height: 24, type: 'solid', style: 'branch' } as Platform);
  assert.match(breaches(b).join(), /play band/);
  const c = structuredClone(st); c.collectibles = [{ x: c.proto!.mixDress![0].x, y: 960 }];
  assert.match(breaches(c).join(), /over a pickup/);
  assert.throws(() => w1Squirrels({ platforms: [{ ...ground, height: 24, style: 'branch' }], spawnX: 100, spawnY: 1000, gen2: { seed: 3 } }), /squirrels found a clear spot/);
});
