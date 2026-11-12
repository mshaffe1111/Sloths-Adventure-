// debug: each refusing verdict of a 1-3 roll, with the section it stands in (library-where.ts, for library13.ts's kit)
//   npx tsx tools/engine/library13-where.ts <from> <n> [regex] [--unflown] [--easy]        (V=1: every line)
import '../../src/game/headlessDom.ts';
import { build } from './library13.ts';
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const from = Number(args[0] ?? 1), n = Number(args[1] ?? 4), re = new RegExp(args[2] ?? '.');
const flown = !process.argv.includes('--unflown'), difficulty = process.argv.includes('--easy') ? 'easy' as const : 'normal' as const;
const tally = new Map<string, number>();
for (let seed = from; seed < from + n; seed++) {
  let st: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  try { st = build(seed, difficulty, { flown }); } catch (e) { const k = `THROW ${String((e as Error).message).replace(/\d+/g, '#').slice(0, 110)}`; tally.set(k, (tally.get(k) ?? 0) + 1); continue; }
  const nodes = st.gen2.nodes ?? [];
  for (const e of (st.gen2.errors as string[]).filter((q) => re.test(q) && (q.includes(`(${difficulty})`) || !/\((normal|easy)\)/.test(q)))) {
    const m = /x (\d+)(?:\.\.(\d+))?/.exec(e); const x = m ? (Number(m[1]) + Number(m[2] ?? m[1])) / 2 : -1;
    const node = nodes.find((q: any) => x >= q.x0 - 2 && x <= q.x1 + 2); // eslint-disable-line @typescript-eslint/no-explicit-any
    const sec = (st.gen2.sections ?? []).find((q: any) => x >= q.x0 - 2 && x <= q.x1 + 2); // eslint-disable-line @typescript-eslint/no-explicit-any
    const pl = (st.gen2.plan ?? []).find((q: any) => q.node === sec?.node && q.template === sec?.template); // eslint-disable-line @typescript-eslint/no-explicit-any
    const k = `${e.replace(/\d+/g, '#').slice(0, 70)} @ ${node?.token ?? '?'} ${sec?.template ?? '?'} ${JSON.stringify(pl?.versions ?? {})}`;
    tally.set(k, (tally.get(k) ?? 0) + 1);
    if (process.env.V) console.log(seed, e.slice(0, 170), '| graph', st.gen2.graph?.id ?? st.gen2.graphId);
  }
}
for (const [k, v] of [...tally].sort((a, b) => b[1] - a[1]).slice(0, 30)) console.log(String(v).padStart(3), k);
