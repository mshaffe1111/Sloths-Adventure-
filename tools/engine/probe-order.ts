// does a mixed stage depend on what was built before it? 1-5 roll 1 built fresh, then after 1-1, then after another 1-5
import { createHash } from 'node:crypto';
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { buildFromSpec } from '../../src/game/mixer/w1mix.ts';
import { specFor } from '../../src/game/mixer/stages.ts';
const L = new Map(generateAllLevels().map((c) => [c.id, c]));
const h = (id: string, seed: number, easy = false) => createHash('sha256').update(JSON.stringify(buildFromSpec(L.get(id)!, seed, easy, specFor(id)!).platforms)).digest('hex').slice(0, 12);
const order = process.argv[2] ?? 'fresh';
if (order === 'fresh') console.log('1-5 seed 1 fresh:', h('1-5', 1));
if (order === 'after11') { h('1-1', 7); console.log('1-5 seed 1 after 1-1:', h('1-5', 1)); }
if (order === 'after15') { h('1-5', 9); console.log('1-5 seed 1 after 1-5 seed 9:', h('1-5', 1)); }
if (order === 'after11b') { h('1-1', 3); h('1-1', 11, true); console.log('1-5 seed 1 after two 1-1s:', h('1-5', 1)); }
