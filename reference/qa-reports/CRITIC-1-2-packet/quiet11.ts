import '../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { w1World } from '../../../src/game/gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { withGoals } from '../../../src/game/goals.ts';
import { pickRoute } from '../../../tools/inspect/eraRoll.ts';
import { deadTime, NORMAL_GAP } from '../../../tools/inspect/analyze.ts';
const cfg = generateAllLevels().find((c: any) => c.id === '1-1')!;
const WATCH = ['w1-stair-test-back', 'w1-bank-stair-test-back'];
const N = Number(process.argv[2] ?? 120);
const out: Record<string, number[]> = {}; const all: number[] = [];
for (let seed = 1; seed <= N; seed++) {
  try {
    const st: any = buildGen2Stage({ config: cfg, kit: w1World(), seed, difficulty: 'normal' });
    const secs: any[] = st.gen2.sections;
    if (!secs.some((q) => WATCH.includes(q.template))) continue;
    const R: any = pickRoute(cfg.objectiveType, withGoals(st as never) as never);
    const dn = deadTime(R.used.br.beats, R.used.br.total, NORMAL_GAP, R.used.samples);
    for (const q of secs.filter((s) => WATCH.includes(s.template))) {
      const inside = dn.list.filter((d: any) => Math.max(d.x0, d.x1) > q.x0 && Math.min(d.x0, d.x1) < q.x1);
      const worst = Math.max(0, ...inside.map((d: any) => d.counted));
      (out[q.template] ??= []).push(Math.round(worst * 10) / 10);
    }
    const other = dn.list.filter((d: any) => !secs.filter((s) => WATCH.includes(s.template)).some((q) => Math.max(d.x0, d.x1) > q.x0 && Math.min(d.x0, d.x1) < q.x1) && !secs.filter((s) => s.phase === 'goal').some((q) => Math.min(d.x0, d.x1) >= q.x0));
    all.push(Math.max(0, ...other.map((d: any) => d.counted)));
  } catch (e) { if (seed < 3) console.log('ERR', String(e).slice(0, 200)); }
}
for (const [k, v] of Object.entries(out)) { v.sort((a, b) => a - b); console.log(`${k}: on ${v.length} rolls; worst quiet stretch touching it: min ${v[0]} median ${v[v.length >> 1]} max ${v[v.length - 1]} s; over 4 s on ${v.filter((x) => x > 4).length}`); }
all.sort((a, b) => a - b); console.log(`the rest of the same rolls (goal run-out apart): median ${all[all.length >> 1]?.toFixed(1)} max ${all[all.length - 1]?.toFixed(1)} s; over 4 s on ${all.filter((x) => x > 4).length} of ${all.length}`);
