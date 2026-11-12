// P13 (11-12): a LISTED stage's rolls (gen2/listed.ts: its kit by its table row), as the game builds them, counted CLEAN per setting: no
// gen2 error, no throw, and judged on its own setting's verdicts where its row is judged (no reach.unflown, F12's library-judged.ts
// check). Nothing is loosened: a refused roll is counted by its lines. No stage is named here: it is handed one.
//   npx tsx tools/engine/runs/clean.ts <stage> [--seeds 120] [--from 1] [--par 4]       (--json: one line a roll, for the workers)
import '../../../src/game/headlessDom.ts';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { listedStage } from '../../../src/game/gen2/listed.ts';
import { judgedOnArcs } from '../../../src/game/gen2/reach.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { tidy } from '../library.ts';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const id = process.argv[2];
const row = listedStage(id);
if (!row) { console.error(`clean: no listed stage "${id}"`); process.exit(2); }
const cfg = generateAllLevels().find((l) => l.id === id)!;
const arg = (n: string, d: number) => { const i = process.argv.indexOf(n); return i > 0 ? Number(process.argv[i + 1]) : d; };
const N = arg('--seeds', 120), from = arg('--from', 1), par = arg('--par', 4);
const judged = judgedOnArcs(id);

function one(seed: number, d: 'normal' | 'easy') {
  try {
    const st: Any = buildGen2Stage({ config: cfg, kit: row!.kit(), seed, difficulty: d });
    const nj: string[] = st.gen2.verdicts?.[d]?.notJudged ?? ['(no verdicts for its own setting)'];
    return { seed, d, judged: !nj.includes('reach.unflown'), errors: (st.gen2.errors ?? []) as string[] };
  } catch (e) {
    return { seed, d, judged: false, errors: [], thrown: String((e as Error).message).slice(0, 160) };
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
    const ch = spawn(process.execPath, ['--import', 'tsx', process.argv[1], id, '--json', '--seeds', String(n), '--from', String(from + i * per)], { stdio: ['ignore', 'pipe', 'inherit'] });
    let buf = '';
    ch.stdout.on('data', (b) => (buf += b));
    ch.on('close', () => { for (const l of buf.split('\n')) if (l.startsWith('{')) rows.push(JSON.parse(l)); res(); });
  })));
  console.log(`${id} as the game rolls it (${judged ? 'judged on its flown rows' : 'NOT judged: no flown rows'}), seeds ${from}-${from + N - 1}`);
  for (const d of ['normal', 'easy'] as const) {
    const R = rows.filter((r) => r.d === d);
    const clean = R.filter((r) => (!judged || r.judged) && !r.thrown && !r.errors.length);
    const kinds = new Map<string, number>();
    for (const r of R) for (const e of new Set<string>((r.thrown ? ['THROW ' + r.thrown] : r.errors).map(tidy))) kinds.set(e, (kinds.get(e) ?? 0) + 1);
    console.log(`${d}: CLEAN ${clean.length} of ${R.length} (${Math.round((100 * clean.length) / Math.max(1, R.length))}%); judged ${R.filter((r) => r.judged).length}; thrown ${R.filter((r) => r.thrown).length}`);
    const bad = R.filter((r) => !clean.includes(r)).map((r) => r.seed).sort((a: number, b: number) => a - b);
    if (bad.length) console.log(`   refused seeds: ${bad.join(',')}`);
    for (const [k, v] of [...kinds].sort((a, b) => b[1] - a[1])) console.log(`   ${String(v).padStart(4)}  ${k}`);
  }
}
