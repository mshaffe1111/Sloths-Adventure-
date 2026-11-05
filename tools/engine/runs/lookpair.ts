// RUNS #2 #103: WHICH 20 s stretch plays alike. era.ts counts the rolls where two stages share a look-alike window; this prints the
// closest pair of windows itself (lookalike.ts closestLook over eraRoll.ts measureRoll's own windows, the same 20 s / 2 s windows and
// the 0.30 line), with both windows' beat kinds and times, for layouts 1-4.   npx tsx tools/engine/runs/lookpair.ts 1-1 1-2
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { measureRoll } from '../../inspect/eraRoll.ts';
import { closestLook, LOOK } from '../../inspect/lookalike.ts';
const [a, b] = process.argv.slice(2);
const L = generateAllLevels();
for (let v = 1; v <= 4; v++) {
  const ra = measureRoll(L.find((l) => l.id === a)!, v) as any, rb = measureRoll(L.find((l) => l.id === b)!, v) as any;
  const c = closestLook(ra.wins, rb.wins);
  console.log(`layout ${v}: ${a} t ${c?.ta}s vs ${b} t ${c?.tb}s: distance ${c?.d.toFixed(3)} (${c && c.d < LOOK.alike ? 'ALIKE' : 'apart'})`);
  console.log(`   ${a}: ${c?.sa}`);
  console.log(`   ${b}: ${c?.sb}`);
}
