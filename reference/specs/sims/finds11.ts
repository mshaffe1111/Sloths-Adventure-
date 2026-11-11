/**
 * finds11.ts: what the high roads of built World 1 rolls really hold (the Designer, found while writing the 1-2 packet; read-only).
 *   npx tsx reference/specs/sims/finds11.ts            the three test-link seeds (4106, 1025, 1136), both settings
 *   npx tsx reference/specs/sims/finds11.ts --all      every listed 1-1 seed, both settings
 * It builds each roll the way Play does (seedList.ts buildPlayStage) and reads the BUILT stage: in every fork section, each thin piece
 * (a log or bough, 30 px or less) with no pickup within 110 px over it is printed. Exit 1 when any is found, 0 when none.
 * RED today: the end piece of every `gFork` high road is bare (a `find` socket outside the required section is never filled,
 * pipeline.ts:2126, and offPathFilled skips a piece that has one, w1.ts:1504).
 */
import '../../../src/game/headlessDom.ts';
import { buildPlayStage, provenSeeds } from '../../../src/game/gen2/seedList.ts';
import { w1World } from '../../../src/game/gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';

type P = { x: number; y: number; width: number; height: number; type: string };
type C = { x: number; y: number; type: string };
type S = { template?: string; id?: string; x0: number; x1: number };
const config = generateAllLevels().find((c) => c.id === '1-1')!;
const seeds = process.argv.includes('--all') ? provenSeeds('1-1') : [4106, 1025, 1136];
let empty = 0, forks = 0;
const bySection = new Map<string, number>();
for (const setting of ['normal', 'easy'] as const) for (const seed of seeds) {
  const st = buildPlayStage(config, w1World(), seed, setting) as unknown as { platforms: P[]; collectibles: C[]; gen2: { sections: S[] } };
  for (const q of st.gen2.sections) {
    const id = q.template ?? q.id ?? '?';
    if (!/fork|twoway|weave/.test(id)) continue;
    forks++;
    for (const p of st.platforms.filter((p) => p.x >= q.x0 && p.x + p.width <= q.x1 && p.height <= 30 && p.type === 'solid')) {
      if (st.collectibles.some((c) => c.x >= p.x - 10 && c.x <= p.x + p.width + 10 && c.y <= p.y && c.y >= p.y - 110)) continue;
      empty++;
      bySection.set(id, (bySection.get(id) ?? 0) + 1);
      if (seeds.length <= 3) console.log(`${setting} seed ${seed} ${id}: thin piece x ${Math.round(p.x)}-${Math.round(p.x + p.width)} y ${Math.round(p.y)} holds nothing`);
    }
  }
}
console.log(`${seeds.length} seeds x 2 settings: ${forks} fork sections laid, ${empty} high-road pieces hold nothing${empty ? ` (${[...bySection].map(([k, n]) => `${k} ${n}`).join(', ')})` : ''}`);
process.exit(empty ? 1 : 0);
