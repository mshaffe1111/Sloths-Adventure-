/**
 * Where a stage's quiet stretches are: each dead stretch over `--min` s (counted seconds), with its x and the stage beat it sits in
 * (proto.beats). A development tool, never shipped.
 *   npx tsx tools/inspect/deadProbe.ts --stage 5-3 [--variants 1,2,3] [--min 2]
 */
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { buildRoll, pickRoute, silkLight } from './eraRoll.ts';
import { deadTime, NORMAL_GAP } from './analyze.ts';

const argv = process.argv.slice(2);
const get = (k: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const id = get('--stage') ?? '5-3';
const variants = (get('--variants') ?? '1,2,3').split(',').map(Number);
const min = Number(get('--min') ?? 2);
const cfg = generateAllLevels().find((c) => c.id === id)!;
for (const v of variants) {
  const st = buildRoll(cfg, v);
  const R = pickRoute(cfg.objectiveType, st);
  const { samples, br } = R.used;
  const dn = deadTime(br.beats, br.total, NORMAL_GAP, samples, silkLight(st));
  const beats = (st.proto?.beats ?? []) as Array<[number, number, string]>;
  const where = (x: number) => beats.find(([a, b]) => x >= a && x < b)?.[2] ?? '?';
  console.log(`${id} v${v}: played ${br.total.toFixed(0)} s, dead ${dn.total.toFixed(1)} s (budget ${(0.2 * br.total).toFixed(1)}), longest ${Math.max(0, ...dn.list.map((d) => d.counted)).toFixed(1)}`);
  for (const d of dn.list) if (d.counted >= min) console.log(`  ${d.counted.toFixed(1)} s  x ${Math.round(d.x0)}-${Math.round(d.x1)}  t ${d.t0.toFixed(0)}  ${where(d.x0)}`);
}
