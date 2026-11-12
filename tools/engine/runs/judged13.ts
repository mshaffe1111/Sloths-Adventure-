// P13 (11-12): the TEST-SIDE 1-3 roll (library13.ts, its own id, NOT --flown) judged on 1-3's OWN flown rows (flownArcs.ts normal-1-3;
// Easy easy-any), before its stage table row lands (W1C's step): 1-3 is put in reach.ts JUDGED for this process only. Every roll must be
// judged (no reach.unflown in its own setting's verdicts, F12's library-judged.ts check), and a roll is CLEAN only with no error and
// no throw. Nothing is loosened: a refused roll is counted by its lines.
//   npx tsx tools/engine/runs/judged13.ts [--seeds 120] [--from 1] [--par 4]       (--json: one line a roll, for the workers)
import '../../../src/game/headlessDom.ts';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { JUDGED } from '../../../src/game/gen2/reach.ts';
import { ROOM_13, build, tidy } from '../library13.ts';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
if (!Object.hasOwn(JUDGED, '1-3')) JUDGED['1-3'] = 'normal-1-3';
const O = { twists: true, down: true, room: ROOM_13 };
const arg = (n: string, d: number) => { const i = process.argv.indexOf(n); return i > 0 ? Number(process.argv[i + 1]) : d; };
const N = arg('--seeds', 120), from = arg('--from', 1), par = arg('--par', 4);

function one(seed: number, d: 'normal' | 'easy') {
  try {
    const st: Any = build(seed, d, O);
    const nj: string[] = st.gen2.verdicts?.[d]?.notJudged ?? ['(no verdicts for its own setting)'];
    return { seed, d, judged: !nj.includes('reach.unflown'), nj, errors: (st.gen2.errors ?? []) as string[] };
  } catch (e) {
    return { seed, d, judged: false, nj: [], errors: [], thrown: String((e as Error).message).slice(0, 160) };
  }
}

if (process.argv.includes('--json')) {
  for (let s = from; s < from + N; s++) for (const d of ['normal', 'easy'] as const) console.log(JSON.stringify(one(s, d)));
} else if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const per = Math.ceil(N / par);
  const rows: Any[] = [];
  await Promise.all(Array.from({ length: par }, (_, i) => new Promise<void>((res) => {
    const n = Math.min(per, N - i * per);
    if (n <= 0) return res();
    const ch = spawn(process.execPath, ['--import', 'tsx', process.argv[1], '--json', '--seeds', String(n), '--from', String(from + i * per)], { stdio: ['ignore', 'pipe', 'inherit'] });
    let buf = '';
    ch.stdout.on('data', (b) => (buf += b));
    ch.on('close', () => { for (const l of buf.split('\n')) if (l.startsWith('{')) rows.push(JSON.parse(l)); res(); });
  })));
  console.log(`1-3 judged on its own rows (normal-1-3 / easy-any), seeds ${from}-${from + N - 1}, NOT --flown`);
  for (const d of ['normal', 'easy'] as const) {
    const R = rows.filter((r) => r.d === d);
    const clean = R.filter((r) => r.judged && !r.thrown && !r.errors.length);
    const kinds = new Map<string, number>();
    for (const r of R) for (const e of new Set<string>((r.thrown ? ['THROW ' + r.thrown] : r.errors).map(tidy))) kinds.set(e, (kinds.get(e) ?? 0) + 1);
    console.log(`${d}: CLEAN ${clean.length} of ${R.length} (${Math.round((100 * clean.length) / Math.max(1, R.length))}%); judged ${R.filter((r) => r.judged).length}; thrown ${R.filter((r) => r.thrown).length}`);
    console.log(`   clean seeds: ${clean.map((r) => r.seed).sort((a, b) => a - b).join(',')}`);
    for (const [k, v] of [...kinds].sort((a, b) => b[1] - a[1])) console.log(`   ${String(v).padStart(4)}  ${k}`);
  }
}
