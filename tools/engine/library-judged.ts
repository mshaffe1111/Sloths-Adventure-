// F12: every 1-2 library roll (no --flown) is JUDGED (no reach.unflown in notJudged), and each refused roll with its lines (npx tsx tools/engine/library-judged.ts)
import '../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { config12, kitLib12 } from './library.ts';
const bad: string[] = [];
let judged = 0, notj = new Map<string, number>();
for (const d of ['normal', 'easy'] as const) for (let seed = 1; seed <= 120; seed++) {
  const st: any = buildGen2Stage({ config: config12() as any, kit: kitLib12(), seed, difficulty: d });
  const v = st.gen2.verdicts;
  // (the verdicts are kept per setting: st.gen2.verdicts[setting]; an Easy build carries its Normal twin's too)
  if (!v?.[d]) throw new Error(`${d} seed ${seed}: no verdicts for its own setting`);
  if (seed === 1) console.log(d, 'verdict keys', Object.keys(v), 'notJudged', JSON.stringify(v[d].notJudged));
  const nj: string[] = v[d].notJudged ?? [];
  for (const n of nj) notj.set(n, (notj.get(n) ?? 0) + 1);
  if (!nj.includes('reach.unflown')) judged++;
  if ((st.gen2.errors ?? []).length) bad.push(`${d} seed ${seed}: ${(st.gen2.errors as string[]).map((e) => e.slice(0, 140)).join(' | ')}`);
}
console.log('judged (no reach.unflown in its own setting\'s verdicts):', judged, 'of 240; notJudged tally', JSON.stringify([...notj]));
console.log(bad.join('\n'));
