import '../src/game/headlessDom.ts';
import { generateAllLevels } from '../src/game/worldsData.ts';
import { buildGen2Stage } from '../src/game/gen2/pipeline.ts';
import { w1World } from '../src/game/gen2/worlds/w1.ts';
const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
const [a, b] = (process.argv[2] ?? '1-20').split('-').map(Number);
const verbose = process.argv.includes('-v');
const used = new Map<string, number>(), bad = new Map<string, number>();
const byName = new Map<string, number>(), bySec = new Map<string, number>(); let ok = 0, tot = 0, err = 0;
for (let seed = a; seed <= b; seed++) for (const difficulty of ['normal', 'easy'] as const) {
  tot++;
  let st; try { st = buildGen2Stage({ config: cfg, kit: w1World(), seed, difficulty }); } catch (e) { err++; if (verbose) console.log(seed, difficulty, 'THROW', String(e).slice(0, 200)); continue; }
  const v = st.gen2.verdicts?.[difficulty];
  for (const q of new Set(st.gen2.sections.map((q: any) => q.template))) used.set(q, (used.get(q) ?? 0) + 1);
  if (v && !v.accepted) { const ts = new Set<string>(); for (const f of v.failed) { const u = f.at.section ? st.gen2.sections.find((q: any) => q.uid === f.at.section) : st.gen2.sections.find((q: any) => q.x0 <= f.at.x0 + 1 && q.x1 >= f.at.x0 - 1); if (u) ts.add(u.template); } for (const t of ts) bad.set(t, (bad.get(t) ?? 0) + 1); }
  const other = (st.gen2.errors ?? []).filter((e: string) => !e.startsWith('verdict'));
  if (v?.accepted && !other.length) { ok++; continue; }
  const secs = st.gen2.sections; const tplOf = (f: any) => { const u = f.at.section ? secs.find((q: any) => q.uid === f.at.section) : secs.find((q: any) => q.x0 <= f.at.x0 + 1 && q.x1 >= f.at.x0 - 1); return u ? u.template : '?'; };
  if (v && !v.accepted) for (const f of v.failed) { byName.set(f.name, (byName.get(f.name) ?? 0) + 1); const s = `${f.name} ${tplOf(f)}`; bySec.set(s, (bySec.get(s) ?? 0) + 1); if (verbose) console.log(seed, difficulty, tplOf(f), f.line); }
  for (const e of other) { const k = 'ERR ' + e.slice(0, 70); bySec.set(k, (bySec.get(k) ?? 0) + 1); if (verbose) console.log(seed, difficulty, e); }
}
console.log(`ok ${ok}/${tot} throw ${err}`);
if (process.argv.includes('-r')) { console.log([...used].sort((a, b) => (bad.get(b[0]) ?? 0) / b[1] - (bad.get(a[0]) ?? 0) / a[1]).map(([k, n]) => `  ${k} ${bad.get(k) ?? 0}/${n}`).join('\n')); process.exit(0); }
console.log([...byName].sort((x, y) => y[1] - x[1]).map(([k, c]) => `${k} ${c}`).join(', '));
console.log([...bySec].sort((x, y) => y[1] - x[1]).slice(0, 60).map(([k, c]) => `  ${c}  ${k}`).join('\n'));
