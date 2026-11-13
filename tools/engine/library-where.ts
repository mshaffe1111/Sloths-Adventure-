// debug: each refusing verdict of a roll, with the section it stands in (npx tsx tools/engine/library-where.ts <from> <n> [regex])
import '../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { config12, kitLib12 } from './library.ts';
const from = Number(process.argv[2] ?? 1), n = Number(process.argv[3] ?? 4), re = new RegExp(process.argv[4] ?? 'unmarked|untyped|untaught|band|pool|node code|soft drop|flags|quiet|V\\d');
const tally = new Map<string, number>();
for (let seed = from; seed < from + n; seed++) for (const difficulty of ['normal'] as const) {
  const st: any = buildGen2Stage({ config: config12({ flown: true }) as any, kit: kitLib12({ flown: true }), seed, difficulty });
  const nodes = st.gen2.nodes ?? [];
  for (const e of (st.gen2.errors as string[]).filter((q) => re.test(q) && q.includes(`(${difficulty})`) || (re.test(q) && !/\((normal|easy)\)/.test(q)))) {
    const m = /x (\d+)(?:\.\.(\d+))?/.exec(e); const x = m ? (Number(m[1]) + Number(m[2] ?? m[1])) / 2 : -1;
    const node = nodes.find((q: any) => x >= q.x0 - 2 && x <= q.x1 + 2);
    const sec = (st.gen2.sections ?? []).find((q: any) => x >= q.x0 - 2 && x <= q.x1 + 2);
    const pl = (st.gen2.plan ?? []).find((q: any) => q.node === sec?.node && q.template === sec?.template);
    const secs = `${sec?.template ?? '?'} ${JSON.stringify(pl?.versions ?? {})}`;
    const k = `${e.replace(/\d+/g, '#').slice(0, 70)} @ ${node?.token ?? '?'} ${secs}`;
    tally.set(k, (tally.get(k) ?? 0) + 1);
    if (process.env.V) console.log(seed, e.slice(0, 150), '| node', node?.token, JSON.stringify(node)?.slice(0, 200));
  }
}
for (const [k, v] of [...tally].sort((a, b) => b[1] - a[1]).slice(0, 30)) console.log(String(v).padStart(3), k);
