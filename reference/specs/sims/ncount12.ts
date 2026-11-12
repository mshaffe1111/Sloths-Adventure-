/**
 * ncount12.ts (the Designer, after the packet Critic's attempt-3 line and its own ncount12.ts; nothing in the game imports it): how many
 * hop steps `N` a 1-2 roll holds, as CONTENT-1-2-relay.md writes its rhythms since the lead's ruling (5:10 PM ET 11-11: no more than 3 `N`
 * in a row, a ceiling of 6 a roll).
 *   npx tsx reference/specs/sims/ncount12.ts [seeds=120]
 * The packet's own kit with the engine items stood in (supply12's `kit12(gid, true)`). N per section is read off the packet's rhythm
 * column and is the MOST of a section's versions, so this is the HIGH count. No rhythm holds two `N` side by side, so the longest run
 * is 1 inside a section; two sections can meet end to start, so 2 at a join.
 */
import '../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { HARVEST_12, kit12 } from './supply12.ts';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
export const N_OF: Record<string, number> = {
  'w1-two-lifts-12': 2, 'w1-one-lift-12': 1, 'w1-stair-test-12': 2, 'w1-bank-wall-12': 2, 'w1-bounce-wall-12': 2, 'w1-mushroom-log-12': 1,
  'w1-drop-bounce-12': 1, 'w1-dip-bounce-12': 1, 'w1-stair-lift': 1, 'w1-cap-lift': 1, 'w1-under-roots-fork': 1, 'w1-thorn-chain-rise': 1,
};
export const CEILING = 6;
const c12 = generateAllLevels().find((c: Any) => c.id === '1-2')!;
const config = { ...c12, id: '1-1', miniIndex: 1 } as typeof c12;
const n = Number(process.argv[2] ?? 120);
let over = 0, all = 0;
for (const gid of Object.keys(HARVEST_12)) {
  const tot: number[] = [];
  for (let seed = 1; seed <= n; seed++) {
    try {
      const st: Any = buildGen2Stage({ config, kit: kit12(gid, true) as never, seed, difficulty: 'normal' });
      tot.push(((st.gen2.plan ?? []) as Any[]).reduce((s, p) => s + (N_OF[p.template] ?? 0), 0));
    } catch { /* no roll */ }
  }
  tot.sort((a, b) => a - b);
  const hist = [...new Set(tot)].map((v) => `${v}: ${tot.filter((x) => x === v).length}`).join(', ');
  const o = tot.filter((x) => x > CEILING).length; over += o; all += tot.length;
  console.log(`${gid}: ${tot.length} rolls; hop steps a roll: min ${tot[0]} median ${tot[tot.length >> 1]} max ${tot[tot.length - 1]}; over the ceiling of ${CEILING}: ${o}; spread (count: rolls) ${hist}`);
}
console.log(`all graphs: ${over} of ${all} rolls over the ceiling of ${CEILING}`);
process.exit(over ? 1 : 0);
