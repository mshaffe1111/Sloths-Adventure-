// VAR-19 probe: every animal flagged "enemy by a landing" on a stage, both settings, layouts a..b, with its section. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { build } from '../../../../tools/validate/core.ts';
import { enemyJobs } from '../../../../tools/validate/mechanics.ts';
const [id, a, z] = [process.argv[2] ?? '1-9', Number(process.argv[3] ?? 1), Number(process.argv[4] ?? 16)];
for (const s of ['normal', 'easy'] as const) for (let v = a; v <= z; v++) {
  const b = build(id, v, s);
  const secs: { template: string; x0: number; x1: number }[] = (b.stage as any).gen2?.sections ?? [];
  const sec = (x: number) => secs.find((q) => x >= q.x0 && x < q.x1)?.template ?? '-';
  const hits = enemyJobs(b).jobs.filter((j) => j.nearLanding !== null).map((j) => `${j.type}@${j.x} ${j.nearLanding}px ${sec(j.x)}`);
  console.log(s, 'L' + v, hits.join(' | ') || 'none');
}
