// VAR-19 probe: every dead walk (funcheck's) on a stage's layouts, with its section. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { build, deadWalks } from '../../../../tools/validate/core.ts';
const [id, a, z, s] = [process.argv[2] ?? '1-9', Number(process.argv[3] ?? 1), Number(process.argv[4] ?? 4), (process.argv[5] ?? 'normal') as 'normal' | 'easy'];
for (let v = a; v <= z; v++) {
  const b = build(id, v, s);
  const secs: any[] = (b.stage as any).gen2?.sections ?? [];
  const sec = (x: number) => secs.find((q) => x >= q.x0 && x < q.x1)?.template ?? '-';
  console.log('L' + v, deadWalks(b.steps, b.total, b.samples).map((d: any) => `${JSON.stringify(d).slice(0, 80)} ${sec(d.x)}`).join(' | ') || 'none');
}
