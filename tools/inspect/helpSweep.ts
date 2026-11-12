// The help sweep on 1-1 (INT-1-1 item 3): every listed seed, both settings. Prints the totals, every breach, the pieces where nothing
// grows (with a count per setting and why), and, with --fly, flies every piece where something grows with plain jumps after the steps.
//   npx tsx tools/inspect/helpSweep.ts [--fly] [--seeds N] [--out file.json]
import '../../src/game/headlessDom.ts';
import { writeFileSync } from 'node:fs';
import { PROVEN_SEEDS } from '../../src/game/gen2/provenSeeds.ts';
import { plainThrough, sweepSeed } from '../../src/game/helpSweep.ts';

const args = process.argv.slice(2);
const fly = args.includes('--fly');
const n = args.includes('--seeds') ? Number(args[args.indexOf('--seeds') + 1]) : Infinity;
const outFile = args.includes('--out') ? args[args.indexOf('--out') + 1] : null;
const seeds = PROVEN_SEEDS['1-1'].seeds.slice(0, n);
const report: Record<string, unknown> = { seeds: seeds.length };
let fail = 0;
for (const setting of ['easy', 'normal'] as const) {
  let rocks = 0, planks = 0, leftOut = 0, growN = 0;
  const bad: string[] = [], promise: string[] = [], flights: string[] = [];
  const none = new Map<string, number>();
  const growBy = new Map<string, number>();
  let flown = 0;
  for (const sd of seeds) {
    const s = sweepSeed(sd, setting);
    rocks += s.rocks;
    planks += s.planks;
    leftOut += s.leftOut;
    growN += s.grow.length;
    for (const b of s.breaches) bad.push(`seed ${sd} ${b}`);
    for (const x of s.none) {
      const key = `${x.k.padEnd(28)} ${x.why}`;
      none.set(key, (none.get(key) ?? 0) + 1);
    }
    for (const k of s.grow) {
      growBy.set(k, (growBy.get(k) ?? 0) + 1);
      if (!fly) continue;
      const f = plainThrough(sd, k, setting, true);
      flown++;
      if (f.grown === 0) promise.push(`seed ${sd} ${k}: canGrow true but nothing grew`);
      if (!f.ok) flights.push(`seed ${sd} ${k}: ${f.why} (${f.grown} grown)`);
    }
  }
  const noneRows = [...none].sort((a, b) => b[1] - a[1]);
  const noRoom = noneRows.filter(([k]) => k.includes('no room')).reduce((a, [, c]) => a + c, 0);
  console.log(`\n== ${setting}: ${seeds.length} seeds; ${rocks} rocks, ${planks} planks at ${growN} pieces; ${leftOut} stairs left out (no room)`);
  console.log(`breaches: ${bad.length} (floats ${bad.filter((b) => b.includes('floats')).length}, faces over 60 ${bad.filter((b) => b.includes('px face') || b.includes('px up')).length}, sunk ${bad.filter((b) => b.includes('sunk')).length}, overlap ${bad.filter((b) => b.includes('overlap')).length})`);
  for (const b of bad.slice(0, 20)) console.log(`  ${b}`);
  console.log(`pieces where something grows (count of seeds): ${[...growBy].sort((a, b) => b[1] - a[1]).map(([k, c]) => `${k} ${c}`).join(', ')}`);
  console.log(`pieces where nothing grows: ${noneRows.reduce((a, [, c]) => a + c, 0)} (no room: ${noRoom}); by piece and why:`);
  for (const [k, c] of noneRows.filter(([k]) => !k.includes('nothing needed'))) console.log(`  ${String(c).padStart(4)}  ${k}`);
  console.log(`  (plus ${noneRows.filter(([k]) => k.includes('nothing needed')).reduce((a, [, c]) => a + c, 0)} piece-seeds where plain jumps already pass: nothing needed)`);
  if (fly) {
    console.log(`plain-jump flights after the steps: ${flown} flown, ${flights.length} failed; promised but nothing grew: ${promise.length}`);
    for (const f of [...promise, ...flights].slice(0, 30)) console.log(`  ${f}`);
  }
  fail += bad.length + promise.length + flights.length;
  report[setting] = { rocks, planks, leftOut, grow: Object.fromEntries(growBy), none: Object.fromEntries(noneRows), breaches: bad, flights, promise, flown };
}
if (outFile) writeFileSync(outFile, JSON.stringify(report, null, 1));
console.log(fail ? `\nFAIL ${fail}` : '\nPASS');
process.exit(fail ? 1 : 0);
