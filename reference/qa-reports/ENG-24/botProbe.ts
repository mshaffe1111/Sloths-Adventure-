// npx tsx reference/qa-reports/ENG-24/botProbe.ts <toy> <row> <easyRow> [off]: each tier on each setting over the toy, the engine driven
// through the real InputEngine (lives at the liana's river, let-gos onto a log, catches off a log, end); `off` switches both skills off
import { fixtureSeed, lianaRun, type LianaToy, type ToyRiver } from '../../../tools/inspect/lianaRiverToys.ts';
import { SKILLS } from '../../../tools/inspect/firsttimer.ts';
const toy = (process.argv[2] ?? 'drop') as LianaToy, row = (process.argv[3] ?? 'long') as ToyRiver, easyRow = (process.argv[4] ?? row) as ToyRiver;
if (process.argv[5] === 'off') { SKILLS.dropOnLog = false; SKILLS.vineFromLog = false; }
const seed = fixtureSeed(toy, row, ['normal', 'easy'], easyRow)!;
const tiers = (process.env.TIERS ?? 'middle,child,expert').split(',') as Array<'middle' | 'child' | 'expert'>;
for (const tier of tiers) for (const set of ['normal', 'easy'] as const) for (const variant of (process.env.VARS ?? '1').split(',').map(Number)) {
  const r = lianaRun(toy, row, tier, set, seed, variant, easyRow, { realInput: true });
  const at = r.pieces.find((q) => q.id === `toy-liana-${toy}`);
  console.log(`${toy}/${row}/${easyRow} ${process.argv[5] ?? 'on'} seed ${seed} v${variant} ${tier.padEnd(6)} ${set.padEnd(6)} end ${r.end} river lives ${at?.lives} s ${at?.seconds} ontoLog ${r.ontoLog} fromLog ${r.fromLog} handed ${r.handed} stuck ${r.stuck.length}`);
}
