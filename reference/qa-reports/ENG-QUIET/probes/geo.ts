// ENG-QUIET-d: the blocks, vines and rivers of a listed variant between two x (rule 28 trace).
//   npx tsx reference/qa-reports/ENG-QUIET/probes/geo.ts <stage> <variant> <easy|normal> <x0> <x1>
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../../src/game/difficulty.ts';
const [stage, v, set, a, b] = process.argv.slice(2);
setDifficulty(set as never);
const st = new RealPlay(stage, +v).stage as any;
const r = (n: number) => Math.round(n);
const inW = (x0: number, x1: number) => x1 >= +a && x0 <= +b;
for (const k of Object.keys(st)) if (Array.isArray(st[k]) && st[k].length && typeof st[k][0] === 'object' && 'x' in st[k][0]) {
  const xs = st[k].filter((o: any) => inW(o.x, o.x + (o.width ?? o.w ?? 0)));
  if (xs.length) console.log(k + ': ' + xs.map((o: any) => `${o.type ?? o.kind ?? ''}(${r(o.x)},${r(o.y)} ${r(o.width ?? o.w ?? 0)}x${r(o.height ?? o.h ?? o.length ?? 0)})`).join(' '));
}
for (const rv of st.rivers ?? []) if (inW(rv.x0 ?? rv.x, rv.x1 ?? rv.x + rv.width)) console.log(`river ${r(rv.x0 ?? rv.x)}..${r(rv.x1 ?? rv.x + rv.width)} y${r(rv.y ?? rv.surface ?? 0)}`);
