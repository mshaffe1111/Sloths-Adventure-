/** the action string of a few rolls (walks dropped), with the beats' labels. Development tool. npx tsx tools/inspect/tokProbe.ts --stage 5-1 --variants 1,2 */
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { buildRoll, pickRoute } from './eraRoll.ts';
const argv = process.argv.slice(2);
const get = (k: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const id = get('--stage') ?? '5-1';
const cfg = generateAllLevels().find((c) => c.id === id)!;
for (const v of (get('--variants') ?? '1,2').split(',').map(Number)) {
  const st = buildRoll(cfg, v);
  const { br } = pickRoute(cfg.objectiveType, st).used;
  console.log(`v${v}: ${br.beats.map((b) => b.letter).join('')}`);
  if (argv.includes('--why')) console.log([...new Set(br.beats.map((b) => `${b.letter}:${b.why}`))].join(' | '));
}
