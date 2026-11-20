/**
 * wheelflights — fly every world's water wheel row on the real engine, both settings (src/game/gen2/wheelFlights.ts flyWheel; ENG-26), and
 * print what each does; `--write` writes the table the fairness check reads (src/game/gen2/wheelFlights.data.ts); `--check` flies them
 * again and fails (exit 1) on any row the table does not hold or holds differently. A new or changed wheel row is flown here and its table
 * committed with it (wheelLay.ts wheelFaults refuses a row the table has not flown, by name).
 *   npx tsx tools/engine/wheelflights.ts [--write | --check]
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { flyWheel, type WheelFlownRow } from '../../src/game/gen2/wheelFlights.ts';
import { flownKey, rowLayout, type WheelRow } from '../../src/game/gen2/wheelLay.ts';
import { WHEEL_FLOWN } from '../../src/game/gen2/wheelFlights.data.ts';
import { W2_WHEEL_STAGE, W2_WHEELS } from '../../src/game/gen2/worlds/w2.ts';
import { TOY_WHEELS } from '../inspect/wheelToys.ts';
import type { Difficulty } from '../../src/game/difficulty.ts';

/** every world's wheel table with the stage it is flown on (a world that lays wheels adds its table and stage here, both from its world
 *  data), and the toys' own rows (tools/inspect/wheelToys.ts: a World 2 toy, flown on World 2's wheel stage) */
export const WORLD_WHEELS: ReadonlyArray<{ stage: string; rows: Readonly<Record<string, WheelRow>> }> = [
  { stage: W2_WHEEL_STAGE, rows: W2_WHEELS },
  { stage: W2_WHEEL_STAGE, rows: TOY_WHEELS },
];

/** fly every row (each distinct layout once) on both settings */
export async function flyAll(log = false): Promise<Record<string, WheelFlownRow>> {
  const out: Record<string, WheelFlownRow> = {};
  for (const { stage, rows } of WORLD_WHEELS) for (const [name, row] of Object.entries(rows)) for (const d of ['normal', 'easy'] as Difficulty[]) {
    const L = rowLayout(row, d);
    const key = flownKey(L, d);
    if (out[key]) continue;
    const { misses, ...flown } = await flyWheel(L, d, stage);
    out[key] = flown;
    if (log) console.log(`${key} (${name}): board tap ${flown.board.tap.share}% ${flown.board.tap.window} s, walk ${flown.board.walk.share}%; ride ${flown.ride}; step ${flown.step} s (walk ${flown.walk.window}, tap ${flown.tap.window}, jump ${flown.jump.window}); misses ${JSON.stringify(misses)}`);
  }
  return out;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const flown = await flyAll(true);
  if (argv.includes('--write')) {
    const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'src', 'game', 'gen2', 'wheelFlights.data.ts');
    const body = Object.entries(flown).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join('\n');
    writeFileSync(file, `/**
 * wheelFlights.data — every world's wheel row FLOWN on the real engine, each setting (wheelFlights.ts flyWheel; written by
 * \`npx tsx tools/engine/wheelflights.ts --write\`, never by hand; wheelFlights.test.ts flies them again and proves this table is the
 * engine's). Keyed by wheelLay.ts flownKey: the setting and the layout (rim, rim speed, buckets, bucket width, street kind and height).
 */
import type { WheelFlownRow } from './wheelFlights.ts';

export const WHEEL_FLOWN: Readonly<Record<string, WheelFlownRow>> = {
${body}
};
`);
    console.log(`wrote ${Object.keys(flown).length} rows to ${path.relative(process.cwd(), file)}`);
  }
  if (argv.includes('--check')) {
    const bad = Object.keys(flown).filter((k) => JSON.stringify(WHEEL_FLOWN[k]) !== JSON.stringify(flown[k]));
    const stale = Object.keys(WHEEL_FLOWN).filter((k) => !flown[k]);
    for (const k of bad) console.log(`DIFFERS: ${k}: table ${JSON.stringify(WHEEL_FLOWN[k])} vs flown ${JSON.stringify(flown[k])}`);
    for (const k of stale) console.log(`STALE: ${k} is in the table and no row flies it`);
    console.log(bad.length || stale.length ? 'wheelflights: FAIL' : `wheelflights: OK (${Object.keys(flown).length} rows)`);
    process.exit(bad.length || stale.length ? 1 : 0);
  }
}
