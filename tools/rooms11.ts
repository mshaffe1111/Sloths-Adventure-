// C1: the help-room check (w1RiseRooms) over seeds a-b, both settings: every rise plain, mushroom or stair; the failures by section
import '../src/game/headlessDom.ts';
import { generateAllLevels } from '../src/game/worldsData.ts';
import { buildGen2Stage } from '../src/game/gen2/pipeline.ts';
import { w1RiseRooms, w1World } from '../src/game/gen2/worlds/w1.ts';
const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
const [a, b] = (process.argv[2] ?? '1-20').split('-').map(Number);
const onlyClean = process.argv.includes('-c'), v = process.argv.includes('-v');
const by = new Map<string, number>(); const kinds = new Map<string, number>(); let tallest = { rise: 0, room: 0, sec: '', seed: 0, d: '' };
for (let seed = a; seed <= b; seed++) for (const difficulty of ['normal', 'easy'] as const) {
  const st = buildGen2Stage({ config: cfg, kit: w1World(), seed, difficulty });
  if (onlyClean && (st.gen2.errors.length || !st.gen2.verdicts?.[difficulty]?.accepted)) continue;
  for (const r of w1RiseRooms(st, difficulty)) {
    const sec = st.gen2.sections.find((q) => q.x0 <= r.x && q.x1 >= r.x)?.template ?? '?';
    kinds.set(r.kind, (kinds.get(r.kind) ?? 0) + 1);
    if (r.kind === 'stair' && r.rise > tallest.rise) tallest = { rise: r.rise, room: r.room, sec, seed, d: difficulty };
    if (r.kind === 'none') { by.set(sec, (by.get(sec) ?? 0) + 1); if (v) console.log(seed, difficulty, sec, JSON.stringify(r)); }
  }
}
console.log([...kinds].map(([k, n]) => `${k} ${n}`).join(', '), '| tallest stair rise', JSON.stringify(tallest));
console.log([...by].sort((x, y) => y[1] - x[1]).map(([k, n]) => `  ${n} ${k}`).join('\n'));
