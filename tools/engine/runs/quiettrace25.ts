// BUILD-25b scratch: one seed's quiet stretches on Normal, with the section each lies in (not committed)
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { listedStage, playFinish } from '../../../src/game/gen2/listed.ts';
import { withGoals } from '../../../src/game/goals.ts';
import { pickRoute } from '../../inspect/eraRoll.ts';
import { deadTime, NORMAL_GAP } from '../../inspect/analyze.ts';
import { quietOf } from '../listRules.ts';
const id = process.argv[2], seeds = process.argv[3].split(',').map(Number);
const row = listedStage(id)!; const cfg = generateAllLevels().find((l) => l.id === id)!;
for (const seed of seeds) {
  const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: 'normal' });
  const played = playFinish(row, structuredClone(st), 'normal');
  const R = pickRoute(cfg.objectiveType, withGoals({ ...played } as never) as never);
  const dn = deadTime(R.used.br.beats, R.used.br.total, NORMAL_GAP, R.used.samples);
  const secs = st.gen2.sections;
  const q = quietOf(cfg, st, (x, d) => playFinish(row, x, d));
  console.log(`seed ${seed}: JUDGED ${q.quiet} s at x ${Math.round(q.x)}; errors ${JSON.stringify(st.gen2.errors ?? [])}`);
  console.log('  sections: ' + secs.map((s) => `${s.template}[${Math.round(s.x0)}-${Math.round(s.x1)}]`).join(' '));
  for (const d of dn.list) {
    const lo = Math.min(d.x0, d.x1), hi = Math.max(d.x0, d.x1);
    const inS = secs.filter((s) => s.x1 >= lo && s.x0 <= hi).map((s) => s.template).join('+');
    console.log(`  quiet ${d.sec.toFixed(1)} s (counted ${d.counted.toFixed(1)}) x ${Math.round(lo)}-${Math.round(hi)} in ${inS}`);
  }
  console.log('  beats: ' + R.used.br.beats.map((b: any) => `${b.kind ?? b.what ?? '?'}@${Math.round(b.x ?? 0)}/${b.t.toFixed(1)}`).join(' '));
}
