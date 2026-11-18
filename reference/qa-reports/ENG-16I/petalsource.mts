// ENG-16I: which of 1-6's played petals the LAY put (gen2 fillSockets, the walked span) and which the play path added after it
// (petalPass.ts fillGaps and the trail rules), by position; with a missed-petal list (petals.ts output) each missed one is classed.
//   npx tsx reference/qa-reports/ENG-16I/petalsource.mts <variant> [petals-output.txt]
import fs from 'node:fs';
import '../../../src/game/headlessDom.ts';
import { RealPlay, levelConfig } from '../../../src/game/realPlay.ts';
import { buildPlayStage, loadSeedList, provenSeedFor } from '../../../src/game/gen2/seedList.ts';
import { listedStage } from '../../../src/game/gen2/listed.ts';
const [vs, missedFile] = process.argv.slice(2);
const v = Number(vs);
await loadSeedList('1-6');
const lay = buildPlayStage(levelConfig('1-6'), listedStage('1-6')!.kit(), provenSeedFor('1-6', v), 'normal') as any;
const play = new RealPlay('1-6', v).stage as any;
const F = (st: any) => st.collectibles.filter((c: any) => c.type === 'flower');
const key = (c: any) => `${Math.round(c.x)},${Math.round(c.y)}`;
const laid = new Set(F(lay).map(key));
const kept = F(play).filter((c: any) => laid.has(key(c))).length;
console.log(`variant ${v}: lay ${F(lay).length} petals; played ${F(play).length}: ${kept} where the lay put them, ${F(play).length - kept} added or moved after the lay; ${F(lay).length - kept} of the lay's not on the played stage`);
if (missedFile) {
  const miss = fs.readFileSync(missedFile, 'utf8').split('\n').map((l) => l.match(/petal (\d+) x (\d+) y (\d+)/)).filter(Boolean) as RegExpMatchArray[];
  const fromLay = miss.filter((m) => laid.has(`${m[2]},${m[3]}`));
  console.log(`missed ${miss.length}: ${fromLay.length} laid by the lay (walked span): ${fromLay.map((m) => m[1]).join(',')}; ${miss.length - fromLay.length} added after it: ${miss.filter((m) => !laid.has(`${m[2]},${m[3]}`)).map((m) => m[1]).join(',')}`);
}
