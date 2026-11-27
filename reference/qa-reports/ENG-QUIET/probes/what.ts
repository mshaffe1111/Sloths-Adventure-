// ENG-QUIET: what the stage holds inside an x range (keys of every stage list with something in it), to see what the time model skips.
//   npx tsx reference/qa-reports/ENG-QUIET/probes/what.ts <stage> <seed> <x0> <x1>
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { listedStage, playFinish } from '../../../../src/game/gen2/listed.ts';
import { stageSource } from '../../../../tools/engine/libstage.ts';
const [id, sd, a, b] = process.argv.slice(2); const x0 = Number(a), x1 = Number(b);
const { kit, cfg } = stageSource(id); const row = listedStage(id)!;
const st = playFinish(row, structuredClone(buildGen2Stage({ config: cfg, kit: kit(), seed: Number(sd), difficulty: 'normal' }) as any), 'normal') as any;
const xs = (o: any) => [o.x, o.x0, o.patrolMinX, o.atX].find((v) => typeof v === 'number');
const xe = (o: any) => [o.x1, o.patrolMaxX, typeof o.x === 'number' && typeof o.width === 'number' ? o.x + o.width : undefined, xs(o)].find((v) => typeof v === 'number');
const walk = (o: any, path: string, depth: number) => {
  if (!o || typeof o !== 'object' || depth > 2) return;
  for (const [k, v] of Object.entries(o)) {
    if (!Array.isArray(v) || !v.length || typeof v[0] !== 'object') { if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, `${path}${k}.`, depth + 1); continue; }
    const hit = (v as any[]).filter((q) => q && typeof xs(q) === 'number' && xe(q)! >= x0 && xs(q)! <= x1);
    if (!hit.length) continue;
    const kinds: Record<string, number> = {};
    for (const q of hit) { const t = `${q.type ?? q.kind ?? q.art ?? ''}${q.clock ? ' clock:' + JSON.stringify(q.clock).slice(0, 40) : ''}${q.lay ? ' lay:' + Object.keys(q.lay).join('/') : ''}`; kinds[t] = (kinds[t] ?? 0) + 1; }
    console.log(`${path}${k}: ${Object.entries(kinds).map(([t, n]) => `${n}x ${t}`).join('; ')}`.slice(0, 300));
  }
};
walk(st, '', 0);
